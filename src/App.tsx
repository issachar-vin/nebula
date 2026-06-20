import Starfield from "./components/Starfield";
import Cursor from "./components/Cursor";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Playground from "./components/Playground";
import MiniGame from "./components/MiniGame";
import Showcase from "./components/Showcase";
import Footer from "./components/Footer";
import Effects from "./components/Effects";
import Terminal from "./components/Terminal";
import Piano from "./components/Piano";
import EasterEggs from "./components/EasterEggs";
import DoodleShrine from "./components/DoodleShrine";
import Help from "./components/Help";
import AchievementUI from "./components/AchievementUI";

export default function App() {
  return (
    <>
      {/* Ambient background */}
      <Starfield />

      {/* Page content */}
      <Nav />
      <main>
        <Hero />
        <Playground />
        <MiniGame />
        <Showcase />
        <Footer />
      </main>

      {/* Overlays & interactive systems */}
      <Effects />
      <Terminal />
      <Piano />
      <EasterEggs />
      <DoodleShrine />
      <Help />
      <AchievementUI />
      <Cursor />
    </>
  );
}
