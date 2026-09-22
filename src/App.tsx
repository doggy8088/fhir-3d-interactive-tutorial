import { useEffect, useState } from "react";
import Hero from "./components/Hero";
import { Beyond, CertTypes, ResourcesSection, WhatIsFhir } from "./components/SectionsA";
import { Decision, Footer, PersonalPath, ProductPath, Versions } from "./components/SectionsB";

const NAV = [
  { id: "what", label: "FHIR 是什麼" },
  { id: "resources", label: "核心資源" },
  { id: "certification", label: "認證分類" },
  { id: "personal", label: "個人認證" },
  { id: "product", label: "產品合規" },
  { id: "versions", label: "版本" },
  { id: "decision", label: "快速判斷" },
];

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      aria-label="主要導覽"
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? "glass py-3" : "bg-transparent py-5"
      }`}
    >
      <div className="shell flex items-center justify-between">
        <a href="#top" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan/40 bg-cyan/10">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5 text-cyan">
              <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" />
              <path d="M12 12l8-4.5M12 12v9M12 12L4 7.5" />
            </svg>
          </span>
          <span className="display text-[15px] font-bold tracking-wide text-ink">
            FHIR<span className="text-cyan">.3D</span>
            <span className="ml-2 hidden text-[12px] font-normal text-muted sm:inline">互動式教學手冊</span>
          </span>
        </a>
        <div className="hidden items-center gap-1 lg:flex">
          {NAV.map((n) => (
            <a
              key={n.id}
              href={`#${n.id}`}
              className="rounded-lg px-3 py-2 text-[13px] text-muted transition hover:bg-white/5 hover:text-ink"
            >
              {n.label}
            </a>
          ))}
        </div>
        <span className="chip hidden border-cyan/30 text-cyan/90 md:inline-flex">R4 · R4B · R5</span>
      </div>
    </nav>
  );
}

export default function App() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="relative">
      <a href="#main" className="skip-link">
        跳至主要內容
      </a>
      <Nav />
      <Hero selected={selected} onSelect={setSelected} />
      <main id="main" tabIndex={-1} className="relative outline-none">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 grid-fade" />
        <div className="relative">
          <WhatIsFhir />
          <div className="shell divider" />
          <ResourcesSection selected={selected} onSelect={setSelected} />
          <div className="shell divider" />
          <Beyond />
          <div className="shell divider" />
          <CertTypes />
          <div className="shell divider" />
          <PersonalPath />
          <div className="shell divider" />
          <ProductPath />
          <div className="shell divider" />
          <Versions />
          <div className="shell divider" />
          <Decision />
        </div>
      </main>
      <Footer />
    </div>
  );
}
