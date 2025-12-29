import { Hero } from "@/components/sections/Hero";
import { Marquee } from "@/components/ui/marquee";
import { Conclusion } from "@/components/sections/Conclusion";
import { WebGLBackground } from "@/components/ui/WebGLBackground";
import { DecorativeRing } from "@/components/ui/DecorativeRing";

// New Pillar Sections
import { Collections } from "@/components/sections/Collections";
import { BusinessResults } from "@/components/sections/BusinessResults";
import { Culture } from "@/components/sections/Culture";
import { LoadingScreen } from "@/components/LoadingScreen";
import { ParallaxImage } from "@/components/sections/ParallaxImage";
import { MaskedText } from "@/components/sections/MaskedText";
import { About } from "@/components/sections/About";

import { Timeline } from "@/components/sections/Timeline";
import { DiamondScene } from "@/components/ui/DiamondScene";

export default function Home() {
  return (
    <main className="relative w-full min-h-screen">
      {/* <LoadingScreen /> */}
      <WebGLBackground />
      <DiamondScene />

      <Hero />


      <Marquee
        text="JEMMIA DIAMOND • THE STANDARD • TECHNOLOGY • LEGACY • TRUST"
        duration={25}
        className="z-10 relative bg-neon-green text-black border-y-0 py-4 font-black tracking-tighter text-xl md:text-3xl"
      />

      {/* Pillar 1: Philosophy */}
      <About />

      {/* Pillar 2: Values */}
      <Culture />

      {/* Pillar 3: Journey */}
      <Timeline />

      {/* Pillar 4: Technology */}
      <Collections />

      {/* Pillar 5: Story */}
      <MaskedText />

      {/* Pillar 6: Achievements */}
      <BusinessResults />

      <ParallaxImage />

      {/* Closing */}
      <Conclusion />
    </main>
  );
}
