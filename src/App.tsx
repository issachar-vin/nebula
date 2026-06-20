import Starfield from "./components/Starfield";
import Cursor from "./components/Cursor";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Field from "./components/Field";
import Showcase from "./components/Showcase";
import Footer from "./components/Footer";
import Effects from "./components/Effects";
import Celebrations from "./components/Celebrations";
import Terminal from "./components/Terminal";
import Piano from "./components/Piano";
import EasterEggs from "./components/EasterEggs";
import DoodleShrine from "./components/DoodleShrine";
import Help from "./components/Help";
import AchievementUI from "./components/AchievementUI";
import Gacha from "./components/gacha/Gacha";

export default function App() {
  return (
    <>
      {/* Ambient background */}
      <Starfield />

      {/* Page content */}
      <Nav />
      <main>
        <Hero />
        <Field />
        <Showcase />
        <Footer />
      </main>

      {/* Overlays & interactive systems */}
      <Celebrations />
      <Effects />
      <Terminal />
      <Piano />
      <EasterEggs />
      <DoodleShrine />
      <Help />
      <Gacha />
      <AchievementUI />
      <Cursor />
    </>
  );
}
