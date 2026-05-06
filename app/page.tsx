import { TopNav } from "@/components/TopNav";
import { Hero } from "@/components/Hero";
import { StatStrip } from "@/components/StatStrip";
import { TrustedBy } from "@/components/TrustedBy";
import { FeatureGrid } from "@/components/FeatureGrid";
import { Endpoints } from "@/components/Endpoints";
import { Compare } from "@/components/Compare";
import { InstallStrip } from "@/components/InstallStrip";
import { Pricing } from "@/components/Pricing";
import { FAQ } from "@/components/FAQ";
import { Footer } from "@/components/Footer";
import { StructuredData } from "@/components/StructuredData";

export default function Home() {
  return (
    <>
      <StructuredData />
      <TopNav active={null} />
      <main>
        <Hero />
        <StatStrip />
        <TrustedBy />
        <FeatureGrid />
        <Endpoints />
        <Compare />
        <InstallStrip />
        <Pricing />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
