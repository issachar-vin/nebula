import { useEffect, useRef } from "react";

// WebGL energy field behind the summon. Colour + intensity are driven by the
// pool's top rarity, so the charge animation hints at what's coming
// (blue → green → gold → magenta → rainbow). Uniforms are updated from refs
// each frame so React prop changes flow into the running GL loop.

const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p,0.0,1.0); }`;

const FRAG = `
precision highp float;
uniform vec2 u_res;
uniform float u_time;
uniform vec3 u_color;
uniform float u_intensity;
uniform float u_rainbow;

float hash(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }
float noise(vec2 p){
  vec2 i=floor(p), f=fract(p);
  float a=hash(i),b=hash(i+vec2(1,0)),c=hash(i+vec2(0,1)),d=hash(i+vec2(1,1));
  vec2 u=f*f*(3.0-2.0*f);
  return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);
}
float fbm(vec2 p){ float v=0.0,a=0.5; for(int i=0;i<4;i++){v+=a*noise(p);p*=2.03;a*=0.5;} return v; }
vec3 hsv2rgb(vec3 c){
  vec4 K=vec4(1.0,2.0/3.0,1.0/3.0,3.0);
  vec3 p=abs(fract(c.xxx+K.xyz)*6.0-K.www);
  return c.z*mix(K.xxx,clamp(p-K.xxx,0.0,1.0),c.y);
}
void main(){
  vec2 uv=(gl_FragCoord.xy-0.5*u_res)/u_res.y;
  float r=length(uv);
  float a=atan(uv.y,uv.x);
  float t=u_time;
  float e=u_intensity;

  float rc = 0.17;  // event-horizon radius

  // swirling accretion ring around the core (inner spins faster — fake Kepler)
  float swirl = a + t*0.9 - 1.1 / max(r, 0.06);
  float disk = fbm(vec2(swirl * 1.2, r * 5.0 - t));
  float band = smoothstep(rc, rc + 0.02, r) * smoothstep(rc + 0.55, rc + 0.06, r);
  float doppler = 0.55 + 0.55 * sin(a + 1.4);          // one side brighter
  float ring = band * (0.35 + disk) * doppler;

  float photon = exp(-pow((r - rc) / 0.012, 2.0));     // thin bright photon ring
  float rays = pow(0.5 + 0.5 * sin(a * 16.0 - t * 2.2), 6.0) * smoothstep(1.1, rc + 0.1, r);
  float glow = exp(-r * 2.0);

  float energy = (ring * 1.3 + photon * 1.5 + rays * 0.7 * e + glow * 0.45) * e;

  vec3 col;
  if(u_rainbow>0.5){
    col=hsv2rgb(vec3(fract(a/6.2831+t*0.12+r*0.4),0.85,1.0));
  } else {
    col=u_color;
  }
  col*=energy;
  col+=vec3(1.0)*photon*e*0.85;     // hot photon ring

  // event horizon: opaque black disc in the middle
  float hole = smoothstep(rc, rc - 0.02, r);
  col *= (1.0 - hole);
  float alpha = clamp(max(energy, hole), 0.0, 1.0);
  gl_FragColor=vec4(col*alpha, alpha); // premultiplied
}
`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.warn("summon aura:", gl.getShaderInfoLog(s));
    return null;
  }
  return s;
}

export default function SummonAura({
  color,
  intensity,
  rainbow,
}: {
  color: [number, number, number];
  intensity: number;
  rainbow: boolean;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const state = useRef({ color, intensity, rainbow });
  state.current = { color, intensity, rainbow };

  useEffect(() => {
    const canvas = ref.current!;
    const gl = canvas.getContext("webgl", { premultipliedAlpha: true, alpha: true });
    if (!gl) return;
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
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const U = {
      res: gl.getUniformLocation(prog, "u_res"),
      time: gl.getUniformLocation(prog, "u_time"),
      color: gl.getUniformLocation(prog, "u_color"),
      intensity: gl.getUniformLocation(prog, "u_intensity"),
      rainbow: gl.getUniformLocation(prog, "u_rainbow"),
    };

    const dpr = Math.min(devicePixelRatio, 1.5);
    const resize = () => {
      canvas.width = Math.floor(canvas.clientWidth * dpr);
      canvas.height = Math.floor(canvas.clientHeight * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // smooth the intensity toward its target so rarity changes ramp nicely
    let shown = state.current.intensity;
    const start = performance.now();
    let raf = 0;
    const loop = (now: number) => {
      const s = state.current;
      shown += (s.intensity - shown) * 0.08;
      gl.uniform2f(U.res, canvas.width, canvas.height);
      gl.uniform1f(U.time, (now - start) / 1000);
      gl.uniform3f(U.color, s.color[0], s.color[1], s.color[2]);
      gl.uniform1f(U.intensity, shown);
      gl.uniform1f(U.rainbow, s.rainbow ? 1 : 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return <canvas ref={ref} className="summon-aura" aria-hidden="true" />;
}
