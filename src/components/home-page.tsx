import { SiteHeader } from "@/components/site-header";
import { Hero } from "@/components/home/hero";
import { Problem } from "@/components/home/problem";
import { Journey } from "@/components/home/journey";
import { Evidence } from "@/components/home/evidence";
import { Contact } from "@/components/home/contact";
import { Footer } from "@/components/home/footer";

export function HomePage() {
  return (
    <div id="top" className="bg-bg text-fg">
      <SiteHeader sticky />
      <main>
        <Hero />
        <Problem />
        <Journey />
        <Evidence />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
