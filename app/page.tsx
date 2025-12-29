import { Hero } from "@/components/sections/Hero";
import { Marquee } from "@/components/ui/marquee";
import { Conclusion } from "@/components/sections/Conclusion";
import { WebGLBackground } from "@/components/ui/WebGLBackground";
import { DecorativeRing } from "@/components/ui/DecorativeRing";

// New Pillar Sections
import { KeyEvents } from "@/components/sections/KeyEvents";
import { Collections } from "@/components/sections/Collections";
import { BusinessResults } from "@/components/sections/BusinessResults";
import { Culture } from "@/components/sections/Culture";
import { LoadingScreen } from "@/components/LoadingScreen";
import { ParallaxImage } from "@/components/sections/ParallaxImage";
import { MaskedText } from "@/components/sections/MaskedText";
import { About } from "@/components/sections/About";

import { Timeline } from "@/components/sections/Timeline";

export default function Home() {
  return (
    <main className="relative w-full min-h-screen">
      <LoadingScreen />
      <WebGLBackground />
      <DecorativeRing />
      <Hero />
      {/* <DiamondJourney /> */}

      <Marquee
        text="JEMMIA RECAP 2025 • HIGHLIGHTS • MASTERPIECE • SIGNATURE • LUXURY"
        duration={25}
        className="z-10 relative bg-neon-green text-black border-y-0 py-4 font-black tracking-tighter text-xl md:text-3xl"
      />
      {/* Pillar 1: Events */}
      <KeyEvents />
      <Timeline />
      <About />
      {/* Pillar 2: Collections */}
      <Collections />

      {/* Pillar 3: Trust & Results */}
      <BusinessResults />
      <ParallaxImage />

      {/* Pillar 4: Culture */}
      <Culture />
      <MaskedText />

      {/* Closing */}
      <Conclusion />
    </main>
  );
}
