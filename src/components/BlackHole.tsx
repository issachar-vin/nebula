import { useEffect, useRef } from "react";

// A physically-based Schwarzschild black hole. Each pixel's light ray is
// integrated *backward* through curved spacetime using the null-geodesic
// equation (G = c = 1, Schwarzschild radius rs = 1):
//
//     d²r/dλ² = -(3/2) · rs · h² · r / |r|⁵     with conserved h² = |r × v|²
//
// the 3D form of the photon orbit equation d²u/dφ² + u = (3/2) rs u².
//
// The accretion disk is rendered with a Shakura–Sunyaev-style temperature
// falloff (T ∝ r^-3/4), fractal turbulence sheared by Keplerian rotation
// (Ω ∝ r^-3/2, so the inner edge whips around faster), and full relativistic
// Doppler beaming + blue/redshift (the approaching side is brighter and bluer).
// A photon ring is added from each ray's closest approach to the photon
// sphere. Interactive: drag to orbit, scroll to zoom.

const RENDER_SCALE = 0.85;
const MAX_DIM = 1500; // cap backing-store width so 4K/retina stays smooth

const VERT = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform vec2 u_res;
uniform float u_time;
uniform float u_yaw;
uniform float u_pitch;
uniform float u_dist;

const float RS = 1.0;          // Schwarzschild radius
const float PHOTON = 1.5;      // photon sphere
const float DISK_IN = 3.0;     // ISCO (3 rs)
const float DISK_OUT = 9.0;
const float ESCAPE = 50.0;
const int STEPS = 500;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  float a = hash21(i), b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0)), d = hash21(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * vnoise(p);
    p *= 2.02;
    a *= 0.5;
  }
  return v;
}

vec3 stars(vec3 d) {
  vec2 uv = vec2(atan(d.z, d.x), asin(clamp(d.y, -1.0, 1.0)));
  vec3 c = vec3(0.0);
  for (float i = 0.0; i < 3.0; i++) {
    float sc = 14.0 + i * 16.0;
    vec2 g = uv * sc;
    vec2 id = floor(g);
    vec2 gv = fract(g) - 0.5;
    float h = hash21(id + i * 19.3);
    if (h > 0.9) {
      vec2 off = (vec2(hash21(id + 1.3), hash21(id + 2.7)) - 0.5) * 0.6;
      float dd = length(gv - off);
      float b = smoothstep(0.09, 0.0, dd);
      float tw = 0.6 + 0.4 * sin(u_time * 2.0 + h * 40.0);
      c += b * tw * (0.9 - 0.22 * i);
    }
  }
  float n = 0.5 + 0.5 * sin(uv.x * 3.0 + u_time * 0.05) * cos(uv.y * 4.0);
  c += vec3(0.03, 0.015, 0.10) * n;
  return c;
}

// Emissive colour (rgb) and density (a) of the disk medium at a point.
// The disk is a *volume* (finite thickness), so we can sample it anywhere —
// not just on an equatorial-plane crossing. That keeps edge-on views solid.
vec4 diskEmission(vec3 p, vec3 dir, float rho) {
  // Keplerian differential rotation: rotate the sample point by a
  // radius-dependent angle and sample the noise in this rotated *Cartesian*
  // frame. Cartesian space is periodic around the disk, so there is no
  // atan() branch cut and therefore no seam.
  float omega = pow(rho, -1.5);
  float spin = u_time * omega * 1.6;
  float cs = cos(spin), sn = sin(spin);
  vec2 q = vec2(p.x * cs - p.z * sn, p.x * sn + p.z * cs);

  float turb = fbm(q * 1.3) + 0.5 * fbm(q * 3.1 + 7.0);
  turb = turb * turb * 1.3 + 0.28; // density floor: thin lanes still absorb
  turb *= 0.78 + 0.3 * sin(rho * 5.0 - u_time * 0.5); // faint radial banding

  // temperature ~ r^-3/4  (Shakura–Sunyaev)
  float temp = pow(DISK_IN / rho, 0.75);
  vec3 cOuter = vec3(1.0, 0.42, 0.12);
  vec3 cMid = vec3(1.0, 0.85, 0.55);
  vec3 cInner = vec3(0.75, 0.85, 1.0);
  vec3 base = mix(cOuter, cMid, smoothstep(0.0, 0.55, temp));
  base = mix(base, cInner, smoothstep(0.55, 1.0, temp));

  // radial density profile: sharp inner edge, soft outer fade
  float inner = smoothstep(DISK_IN, DISK_IN + 0.25, rho);
  float outer = smoothstep(DISK_OUT, DISK_OUT - 2.5, rho);
  float dens = inner * outer * max(turb, 0.0) * (0.4 + temp * 1.6);

  // relativistic Doppler beaming + blue/redshift (tamed so it doesn't blow out)
  vec3 vel = normalize(vec3(-p.z, 0.0, p.x)); // orbital direction
  float beta = clamp(sqrt(0.5 / max(rho - 1.0, 0.3)), 0.0, 0.85);
  float gamma = 1.0 / sqrt(1.0 - beta * beta);
  float mu = dot(vel, -normalize(dir));
  float dfac = 1.0 / (gamma * (1.0 - beta * mu)); // >1 approaching
  float beam = pow(clamp(dfac, 0.3, 2.0), 2.5);
  vec3 shift = mix(vec3(1.0, 0.45, 0.25), vec3(0.7, 0.85, 1.0),
                   smoothstep(0.8, 1.3, dfac));

  return vec4(base * shift * beam, dens);
}

vec3 aces(vec3 x) {
  return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;

  vec3 camPos = u_dist * vec3(
    cos(u_pitch) * cos(u_yaw),
    sin(u_pitch),
    cos(u_pitch) * sin(u_yaw)
  );
  vec3 fwd = normalize(-camPos);
  vec3 right = normalize(cross(fwd, vec3(0.0, 1.0, 0.0)));
  vec3 up = cross(right, fwd);
  vec3 dir = normalize(fwd + uv.x * 0.85 * right + uv.y * 0.85 * up);

  vec3 pos = camPos;
  vec3 h = cross(pos, dir);
  float h2 = dot(h, h);

  vec3 col = vec3(0.0);
  float trans = 1.0;
  float minR = 1e9;     // closest approach, for the photon ring
  bool horizon = false;

  for (int i = 0; i < STEPS; i++) {
    float r = length(pos);
    minR = min(minR, r);
    if (r < RS) { horizon = true; break; }
    if (r > ESCAPE) break;

    // fine steps near the hole / disk, coarse far away
    float dt = clamp((r - RS) * 0.15, 0.012, 0.4);
    float rho = length(pos.xz);
    bool inDisk = rho > DISK_IN - 0.5 && rho < DISK_OUT + 0.5 && abs(pos.y) < 0.7;
    if (inDisk) dt = min(dt, 0.04); // resolve the disk volume crisply

    // volumetric emission/absorption through the disk's thickness.
    // Strong absorption makes the disk read as a surface (we mostly see its
    // near face), which keeps edge-on views from washing out and preserves
    // the turbulence contrast.
    if (inDisk) {
      float H = 0.12 + 0.02 * rho;                 // disk half-thickness
      float vert = exp(-(pos.y * pos.y) / (H * H)); // soft vertical falloff
      vec4 e = diskEmission(pos, dir, rho);
      float d = vert * e.a;
      col += e.rgb * d * dt * 1.6 * trans;
      trans *= clamp(1.0 - d * dt * 4.5, 0.0, 1.0);
    }

    vec3 acc = -1.5 * RS * h2 * pos / pow(r, 5.0);
    dir += acc * dt;
    pos += dir * dt;
    if (trans < 0.03) break;
  }

  if (!horizon) col += stars(normalize(dir)) * trans;

  // photon ring: rays grazing the photon sphere pile up into a thin bright ring
  float ring = exp(-pow((minR - PHOTON) / 0.16, 2.0));
  col += ring * vec3(1.0, 0.92, 0.78) * 0.9 * trans;

  col = aces(col * 1.25);
  col = pow(col, vec3(0.95));
  col *= 1.0 - 0.16 * length(uv); // vignette
  gl_FragColor = vec4(col, 1.0);
}
`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.warn("blackhole shader:", gl.getShaderInfoLog(sh));
    return null;
  }
  return sh;
}

export default function BlackHole() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl || !(gl instanceof WebGLRenderingContext)) return;

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const U = {
      res: gl.getUniformLocation(prog, "u_res"),
      time: gl.getUniformLocation(prog, "u_time"),
      yaw: gl.getUniformLocation(prog, "u_yaw"),
      pitch: gl.getUniformLocation(prog, "u_pitch"),
      dist: gl.getUniformLocation(prog, "u_dist"),
    };

    const resize = () => {
      let w = canvas.clientWidth * RENDER_SCALE;
      let h = canvas.clientHeight * RENDER_SCALE;
      if (w > MAX_DIM) {
        const k = MAX_DIM / w;
        w *= k;
        h *= k;
      }
      canvas.width = Math.max(1, Math.floor(w));
      canvas.height = Math.max(1, Math.floor(h));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const cam = { yaw: 0.6, pitch: 0.22, dist: 10, dragging: false, lastX: 0, lastY: 0 };
    const onDown = (e: PointerEvent) => {
      cam.dragging = true;
      cam.lastX = e.clientX;
      cam.lastY = e.clientY;
      canvas.setPointerCapture(e.pointerId);
    };
    const onMoveDrag = (e: PointerEvent) => {
      if (!cam.dragging) return;
      cam.yaw -= (e.clientX - cam.lastX) * 0.006;
      cam.pitch += (e.clientY - cam.lastY) * 0.006;
      cam.pitch = Math.max(-1.4, Math.min(1.4, cam.pitch));
      cam.lastX = e.clientX;
      cam.lastY = e.clientY;
    };
    const onUp = () => (cam.dragging = false);
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      cam.dist = Math.max(5, Math.min(22, cam.dist + e.deltaY * 0.01));
    };
    canvas.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMoveDrag);
    window.addEventListener("pointerup", onUp);
    canvas.addEventListener("wheel", onWheel, { passive: false });

    const start = performance.now();
    let raf = 0;
    let last = start;
    const loop = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      // gentle auto-drift whenever you're not actively dragging (resumes instantly)
      if (!cam.dragging) cam.yaw += dt * 0.06;
      gl.uniform2f(U.res, canvas.width, canvas.height);
      gl.uniform1f(U.time, (now - start) / 1000);
      gl.uniform1f(U.yaw, cam.yaw);
      gl.uniform1f(U.pitch, cam.pitch);
      gl.uniform1f(U.dist, cam.dist);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMoveDrag);
      window.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("wheel", onWheel);
    };
  }, []);

  return <canvas ref={ref} className="blackhole-canvas" />;
}
