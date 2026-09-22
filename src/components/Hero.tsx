import { useCallback, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import FhirScene, { type FxState } from "../three/scene";
import { POST_OBSERVATION_SAMPLE, RESOURCES, TERMINAL_PRESETS } from "../data/fhir";
import { useOnScreen, usePrefersReducedMotion } from "../utils/usePrefersReducedMotion";

type Entry = {
  id: number;
  method: string;
  path: string;
  status: string;
  statusNote: string;
  body: string;
  done: boolean;
};

export default function Hero({
  selected,
  onSelect,
}: {
  selected: string | null;
  onSelect: (id: string | null) => void;
}) {
  const fx = useRef<FxState>({ packets: [] });
  const idRef = useRef(0);
  const [entries, setEntries] = useState<Entry[]>([]);
  const controlsRef = useRef<any>(null);
  const didAuto = useRef(false);
  const heroRef = useRef<HTMLElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const heroOnScreen = useOnScreen(heroRef);

  const onArrive = useCallback((id: number) => {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, done: true } : e)));
  }, []);

  const sendRequest = useCallback((resId: string, method?: string, path?: string) => {
    let body: string;
    let status = "200";
    let statusNote = "OK";
    let entryMethod = "GET";
    let entryPath = "";
    if (resId === "observation-post") {
      body = POST_OBSERVATION_SAMPLE;
      status = "201";
      statusNote = "Created · Location: /Observation/456";
      entryMethod = "POST";
      entryPath = "/Observation";
    } else {
      const res = RESOURCES.find((r) => r.id === resId);
      if (!res) return;
      body = res.sample;
      entryMethod = res.method;
      entryPath = res.endpoint;
    }
    const id = ++idRef.current;
    const idx = Math.max(0, RESOURCES.findIndex((r) => r.id === (resId === "observation-post" ? "observation" : resId)));
    fx.current.packets.push({ id, from: idx, t: 0, kind: "req" });
    setEntries((prev) =>
      [
        {
          id,
          method: method ?? entryMethod,
          path: path ?? entryPath,
          status,
          statusNote,
          body,
          done: false,
        },
        ...prev,
      ].slice(0, 3)
    );
  }, []);

  /* one-time auto demo */
  useEffect(() => {
    if (didAuto.current) return;
    didAuto.current = true;
    const t = setTimeout(() => sendRequest("patient"), 1800);
    return () => clearTimeout(t);
  }, [sendRequest]);

  const sel = selected ? RESOURCES.find((r) => r.id === selected) ?? null : null;

  return (
    <header id="top" ref={heroRef} className="relative h-[100svh] min-h-[640px] w-full overflow-hidden">
      {/* 3D canvas — decorative for assistive tech; section 02 repeats the data as DOM controls */}
      <div aria-hidden="true" className="absolute inset-0">
        <Canvas
          dpr={[1, 1.8]}
          camera={{ position: [0, 2.6, 10.2], fov: 42 }}
          gl={{ antialias: true }}
          frameloop={heroOnScreen ? "always" : "never"}
          onPointerMissed={() => onSelect(null)}
        >
          <FhirScene
            selected={selected}
            onSelect={onSelect}
            fx={fx}
            onArrive={onArrive}
            controlsRef={controlsRef}
            reducedMotion={reducedMotion}
          />
        </Canvas>
      </div>

      {/* bottom fade into page */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-[#04070d]" />

      {/* title */}
      <div className="pointer-events-none absolute left-0 right-0 top-0 z-10">
        <div className="shell pt-24 md:pt-28">
          <p className="eyebrow">HL7 International · Fast Healthcare Interoperability Resources</p>
          <h1 className="display mt-3 flex flex-wrap items-end gap-x-5">
            <span className="glow-cyan text-6xl font-bold tracking-tight text-ink md:text-8xl">FHIR</span>
            <span className="pb-2 text-xl font-bold leading-snug text-ink/90 md:pb-4 md:text-3xl">
              3D 互動式教學手冊
            </span>
          </h1>
          <p className="mt-4 max-w-xl text-[13.5px] leading-7 text-muted md:text-[15px]">
            一套讓醫院、診所、保險公司與醫療 App 交換健康資料的標準。
            <br className="hidden md:block" />
            旋轉場景、點亮 Resource 節點，在終端機送出真實形態的 FHIR 請求。
          </p>
        </div>
      </div>

      {/* selected node panel (desktop) */}
      {sel && (
        <div className="absolute right-5 top-24 z-20 hidden w-[340px] md:block">
          <div className="glass animate-[termIn_.45s_cubic-bezier(.16,1,.3,1)] rounded-2xl p-5" style={{ borderColor: `${sel.color}55` }}>
            <div className="flex items-center gap-3">
              <span className="h-3 w-3 rounded-full" style={{ background: sel.color, boxShadow: `0 0 14px ${sel.color}` }} />
              <h3 className="display text-xl font-bold tracking-wide" style={{ color: sel.color }}>
                {sel.name}
              </h3>
              <button
                onClick={() => onSelect(null)}
                className="ml-auto rounded-md border border-white/10 px-2 py-1 text-[11px] text-muted transition hover:border-white/30 hover:text-ink"
              >
                關閉
              </button>
            </div>
            <p className="mt-1 text-[13px] font-medium text-ink/90">{sel.purpose}</p>
            <p className="mt-3 text-[13px] leading-6.5 text-muted">{sel.desc}</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {sel.fields.map((f) => (
                <span key={f} className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 font-mono text-[10.5px] text-cyan/80">
                  {f}
                </span>
              ))}
            </div>
            <button
              onClick={() => sendRequest(sel.id)}
              className="display mt-5 w-full rounded-xl border px-4 py-2.5 text-[13px] font-bold tracking-wider transition hover:brightness-125"
              style={{ borderColor: `${sel.color}88`, color: sel.color, background: `${sel.color}14` }}
            >
              ▶ 對 {sel.name} 送出測試請求
            </button>
          </div>
        </div>
      )}

      {/* selected node chip (mobile) */}
      {sel && (
        <div className="absolute left-1/2 top-20 z-20 -translate-x-1/2 md:hidden">
          <div className="glass flex items-center gap-2.5 rounded-full px-4 py-2" style={{ borderColor: `${sel.color}66` }}>
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: sel.color }} />
            <span className="font-mono text-[12.5px]" style={{ color: sel.color }}>
              {sel.name}
            </span>
            <span className="text-[12px] text-muted">{sel.purpose}</span>
            <button onClick={() => onSelect(null)} aria-label="關閉節點說明" className="ml-1 text-muted hover:text-ink">
              ✕
            </button>
          </div>
        </div>
      )}

      {/* terminal */}
      <div className="absolute bottom-4 left-4 z-10 w-[min(540px,calc(100%-2rem))] sm:bottom-6 sm:left-6">
        <div className="term">
          <div className="flex items-center justify-between border-b border-white/5 px-4 py-2.5">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-coral/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-mint/70" />
              <span className="ml-2 font-mono text-[11px] tracking-wider text-muted">
                fhir-playground — base: /baseR4
              </span>
            </div>
            <button
              onClick={() => controlsRef.current?.reset?.()}
              className="rounded-md border border-white/10 px-2.5 py-1 font-mono text-[11px] text-muted transition hover:border-cyan/50 hover:text-cyan"
              title="重置視角"
            >
              重置視角
            </button>
          </div>

          <div role="group" aria-label="範例請求" className="flex flex-wrap gap-2 px-4 pt-3">
            {TERMINAL_PRESETS.map((p) => (
              <button
                key={p.method + p.path}
                onClick={() => sendRequest(p.resId, p.method, p.path)}
                className="chip transition hover:border-cyan/60 hover:text-cyan"
              >
                <span className={p.method === "POST" ? "font-bold text-mint" : "font-bold text-cyan"}>{p.method}</span>
                {p.path}
              </button>
            ))}
          </div>

          <div
            role="log"
            aria-live="polite"
            aria-label="FHIR 請求與回應紀錄"
            className="flex max-h-[240px] flex-col-reverse gap-3 overflow-y-auto px-4 py-3"
          >
            {entries.length === 0 && (
              <p className="blink-caret font-mono text-[12.5px] text-muted">
                輸入一個 FHIR 請求，看資料如何在節點與 API 核心之間流動
              </p>
            )}
            {entries.map((e) => (
              <div key={e.id} className="term-entry font-mono text-[12px] leading-6">
                <p>
                  <span className="text-muted">$</span> <span className={e.method === "POST" ? "text-mint" : "text-cyan"}>{e.method}</span>{" "}
                  <span className="text-ink">https://fhir.example{e.path}</span>
                </p>
                {e.done ? (
                  <>
                    <p className="term-line" style={{ animationDelay: "80ms" }}>
                      <span className="font-bold text-mint">{e.status} {e.statusNote}</span>
                      <span className="text-muted"> · application/fhir+json</span>
                    </p>
                    <pre
                      tabIndex={0}
                      role="group"
                      aria-label="FHIR 回應內容"
                      className="codeblock mt-1.5 max-h-[150px] overflow-auto px-3.5 py-2.5 text-[11px] leading-5.5"
                    >
                      {e.body.split("\n").map((l, i) => (
                        <span key={i} className="term-line block" style={{ animationDelay: `${140 + i * 55}ms` }}>
                          {l}
                        </span>
                      ))}
                    </pre>
                  </>
                ) : (
                  <p className="text-cyan/80">
                    <span className="inline-block h-3 w-1.5 animate-pulse bg-cyan/80 align-middle" />
                    <span className="ml-2">request in flight… 資料封包正在送往 FHIR API Core</span>
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* controls hint */}
      <div className="pointer-events-none absolute bottom-5 right-5 z-10 hidden flex-col items-end gap-1 text-right lg:flex">
        <span className="font-mono text-[11px] tracking-wider text-muted/90">
          拖曳旋轉 · 滾輪縮放 · 點擊節點探索
        </span>
        <span className="font-mono text-[11px] tracking-wider text-muted/70">
          5 RESOURCES · 1 API CORE · R4
        </span>
      </div>

      {/* scroll cue */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex lg:left-auto lg:right-[560px] lg:translate-x-0"
      >
        <div className="flex h-9 w-5.5 items-start justify-center rounded-full border border-white/20 p-1.5">
          <span className="scroll-cue-dot h-1.5 w-1.5 rounded-full bg-cyan" />
        </div>
      </div>
    </header>
  );
}
