import { Deployment } from "@/components/home/deployment";
import { Features } from "@/components/home/features";
import { Hero } from "@/components/home/hero";
import { JoinOrCreate } from "@/components/home/join-or-create";
import { OpenSource } from "@/components/home/open-source";
import { Personas } from "@/components/home/personas";
import { SiteFooter } from "@/components/home/site-footer";
import { Sovereignty } from "@/components/home/sovereignty";
import { TopNav } from "@/components/home/top-nav";
import { RevealOnScroll } from "@/components/reveal-on-scroll";

export default function Home() {
  return (
    <>
      <RevealOnScroll />
      <TopNav />
      <main id="main" className="overflow-x-clip">
        <Hero />
        <Sovereignty />
        <Personas />
        <Features />
        <JoinOrCreate />
        <Deployment />
        <OpenSource />
      </main>
      <SiteFooter />
    </>
  );
}
