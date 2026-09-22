import { useState } from "react";
import {
  EXAM_FACTS,
  EXAM_PREREQS,
  EXAM_RULES,
  EXAM_TOPICS,
  LINKS,
  PERSONAL_STEPS,
  PRODUCT_STEPS,
  VERSIONS,
} from "../data/fhir";
import { Callout, Reveal, Section } from "./ui";

/* ---------------------------------- 05 個人認證 ---------------------------------- */

export function PersonalPath() {
  return (
    <Section
      id="personal"
      no="05"
      eyebrow="Foundational Implementer"
      title={
        <>
          個人如何取得 <span className="text-cyan">HL7 FHIR 認證</span>
        </>
      }
      intro="目前較正式的入門認證是 HL7 FHIR Foundational Implementer Exam。左邊是考試規格，右邊是建議的準備流程。"
    >
      <div className="grid gap-8 lg:grid-cols-[1fr_1.15fr]">
        {/* left: exam spec */}
        <div className="flex flex-col gap-5">
          <Reveal>
            <div className="grid grid-cols-2 gap-4">
              {EXAM_FACTS.map((f) => (
                <div key={f.label} className="card p-5">
                  <div className="display text-4xl font-bold text-cyan" style={{ textShadow: "0 0 24px rgba(34,211,238,.4)" }}>
                    {f.value}
                    <span className="ml-1 text-lg text-cyan/70">{f.unit}</span>
                  </div>
                  <p className="mt-1.5 text-[12.5px] text-muted">{f.label}</p>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="card p-5">
              <h3 className="font-mono text-[11px] tracking-[0.25em] text-muted">EXAM CONDITIONS</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {EXAM_RULES.map((r) => (
                  <span key={r} className="chip">
                    {r}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
          <Reveal delay={180}>
            <div className="card p-5">
              <h3 className="font-mono text-[11px] tracking-[0.25em] text-muted">SUGGESTED PREREQUISITES</h3>
              <ul className="mt-3 space-y-2">
                {EXAM_PREREQS.map((p) => (
                  <li key={p} className="flex items-center gap-2.5 text-[13.5px] text-ink/85">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="h-4 w-4 shrink-0 text-mint">
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={240}>
            <div className="card p-5">
              <h3 className="font-mono text-[11px] tracking-[0.25em] text-muted">EXAM TOPICS</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {EXAM_TOPICS.map((t) => (
                  <span key={t} className="chip border-cyan/25 text-cyan/85">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        {/* right: timeline */}
        <div>
          <ol className="relative ml-3 border-l border-cyan/25 pl-8">
            {PERSONAL_STEPS.map((s, i) => (
              <Reveal key={s.title} delay={i * 90}>
                <li className="relative pb-9 last:pb-0">
                  <span className="tl-dot absolute -left-[41px] top-1 h-3.5 w-3.5 rounded-full bg-cyan" />
                  <div className="display absolute -left-[92px] top-0 hidden w-14 text-right text-4xl font-bold text-white/8 md:block">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <h3 className="text-[15.5px] font-bold text-ink">
                    <span className="text-cyan">{String(i + 1).padStart(2, "0")}.</span> {s.title}
                  </h3>
                  <p className="mt-1.5 max-w-md text-[13px] leading-6.5 text-muted">{s.desc}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>

      <div className="mt-12 grid gap-5 lg:grid-cols-2">
        <Reveal>
          <div className="card h-full p-6">
            <span className="font-mono text-[10.5px] tracking-[0.3em] text-muted">HL7 EXAM PREPARATION COURSE</span>
            <h3 className="mt-2 text-lg font-bold text-ink">五週線上考試準備課程</h3>
            <p className="mt-3 text-[13.5px] leading-7 text-muted">
              HL7 目前提供五週的 Exam Preparation Course，協助考生系統性準備。
              課程平台列出的下一期為
              <b className="text-amber"> 2026 年 10 月 1 日 至 11 月 5 日</b>
              （截至 2026 年 9 月）。
            </p>
            <a
              href="https://courses.hl7.org/"
              target="_blank"
              rel="noreferrer"
              className="display mt-5 inline-flex items-center gap-2 rounded-xl border border-cyan/40 bg-cyan/10 px-4 py-2.5 text-[13px] font-bold tracking-wider text-cyan transition hover:bg-cyan/20"
            >
              查看 HL7 課程平台
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <path d="M7 17L17 7M9 7h8v8" />
              </svg>
            </a>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <Callout tone="warn" title="課程完成證書 ≠ 通過認證考試">
            完成準備課程取得的是<b>課程完成證書</b>，只證明「上過課」，
            <b className="text-amber">不等於通過 Foundational Implementer 考試</b>。
            要取得認證，仍須正式報名並通過 HL7 的考試。
          </Callout>
        </Reveal>
      </div>
    </Section>
  );
}

/* ---------------------------------- 06 產品合規 ---------------------------------- */

export function ProductPath() {
  return (
    <Section
      id="product"
      no="06"
      eyebrow="Conformance"
      title={
        <>
          公司產品如何證明<span className="text-amber">「支援 FHIR」</span>
        </>
      }
      intro="如果目標是讓產品取得 FHIR 相容證明，建議依序走完這八步——每一步都留下可驗證的證據。"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PRODUCT_STEPS.map((s, i) => (
          <Reveal key={s.title} delay={(i % 4) * 80} className="h-full">
            <div className="card group h-full p-5">
              <div className="flex items-center justify-between">
                <span
                  className="display text-3xl font-bold text-white/12 transition group-hover:text-amber/40"
                  style={{ transition: "color .4s" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 text-amber/50">
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </div>
              <h3 className="mt-3 text-[14.5px] font-bold text-ink">{s.title}</h3>
              <p className="mt-2 text-[12.5px] leading-6 text-muted">{s.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <Reveal>
          <div className="card h-full p-6">
            <h3 className="font-mono text-[11px] tracking-[0.25em] text-muted">CONFORMANCE TESTING · 三類測試</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                { k: "Resource", d: "個別 Resource 對 Profile 的結構與內容驗證" },
                { k: "Server", d: "伺服器對指定 IG 的端點、搜尋與操作測試" },
                { k: "Client", d: "用戶端向外部伺服器請求時的行為測試" },
              ].map((t) => (
                <div key={t.k} className="rounded-xl border border-white/8 bg-white/[0.03] p-4">
                  <span className="display text-[15px] font-bold text-cyan">{t.k}</span>
                  <p className="mt-1.5 text-[12px] leading-5.5 text-muted">{t.d}</p>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <span className="font-mono text-[11px] text-muted">常見測試服務：</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {["Touchstone", "Crucible", "Conformancelab"].map((t) => (
                  <span key={t} className="chip border-cyan/25 text-cyan/85">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <Callout tone="warn" title="FHIR® 商標使用許可 ≠ 互通性認證">
            若要在產品或行銷內容使用 <b>FHIR®</b> 商標，需依 HL7 的規定申請<b>商標使用許可</b>。
            這只表示你獲准使用名稱，<b className="text-amber">不等於產品通過互通性認證</b>。
          </Callout>
        </Reveal>
      </div>
    </Section>
  );
}

/* ---------------------------------- 07 版本 ---------------------------------- */

export function Versions() {
  const [active, setActive] = useState(VERSIONS[0].key);
  const v = VERSIONS.find((x) => x.key === active) ?? VERSIONS[0];
  return (
    <Section
      id="versions"
      no="07"
      eyebrow="R4 · R4B · R5"
      title={
        <>
          版本不是小事：<span className="text-violet">R4 與 R5</span> 的注意事項
        </>
      }
      intro="HL7 目前公開規格頁列出的正式版本是 R5，但考試指南仍以 R4 能力範圍說明。切換查看各版本的定位。"
    >
      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <div className="flex flex-col gap-3">
          {VERSIONS.map((x, i) => (
            <Reveal key={x.key} delay={i * 80}>
              <button
                onClick={() => setActive(x.key)}
                className="card w-full p-5 text-left transition"
                style={active === x.key ? { borderColor: `${x.accent}88`, background: `${x.accent}0d` } : undefined}
              >
                <div className="flex items-center justify-between">
                  <span className="display text-2xl font-bold" style={{ color: active === x.key ? x.accent : "#e8f4f8" }}>
                    {x.key}
                  </span>
                  {active === x.key && (
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: x.accent, boxShadow: `0 0 12px ${x.accent}` }} />
                  )}
                </div>
                <p className="mt-1 text-[12px] text-muted">{x.tag}</p>
              </button>
            </Reveal>
          ))}
        </div>

        <Reveal delay={150}>
          <div
            key={v.key}
            className="card h-full p-6 md:p-7"
            style={{ borderColor: `${v.accent}55`, animation: "termIn .45s cubic-bezier(.16,1,.3,1)" }}
          >
            <h3 className="display text-3xl font-bold" style={{ color: v.accent }}>
              {v.key}
            </h3>
            <p className="mt-1 text-[13px] font-medium text-muted">{v.tag}</p>
            <ul className="mt-5 space-y-3.5">
              {v.points.map((p) => (
                <li key={p} className="flex items-start gap-3 text-[14px] leading-7 text-ink/85">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="mt-1.5 h-4 w-4 shrink-0" style={{ color: v.accent }}>
                    <path d="M5 12.5l4.5 4.5L19 7.5" />
                  </svg>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <Reveal>
          <Callout tone="info" title="實務上的準則">
            <b>考試</b>依官方考試指南準備（R4 能力範圍、強調版本獨立性）；
            <b>專案實作</b>則以<b className="text-cyan">客戶指定的 FHIR 版本與 Implementation Guide</b> 為準。
          </Callout>
        </Reveal>
        <Reveal delay={120}>
          <div className="card h-full p-6">
            <h3 className="font-mono text-[11px] tracking-[0.25em] text-muted">TAIWAN</h3>
            <p className="mt-3 text-[13.5px] leading-7 text-ink/85">
              如果是臺灣的醫療系統專案，還要另外確認
              <b className="text-ink"> 衛生福利部、醫院或標案指定的 FHIR 規格與跨院交換要求</b>。
            </p>
            <a
              href="https://www.mohw.gov.tw/cp-7284-85410-1.html"
              target="_blank"
              rel="noreferrer"
              className="display mt-4 inline-flex items-center gap-2 text-[13px] font-bold tracking-wider text-cyan underline-offset-4 hover:underline"
            >
              衛福部 FHIR 標準化試辦計畫
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <path d="M7 17L17 7M9 7h8v8" />
              </svg>
            </a>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

/* ---------------------------------- 08 快速判斷 ---------------------------------- */

const VERDICTS = [
  {
    q: "想證明「我會 FHIR」",
    a: "考 HL7 FHIR Foundational Implementer Exam。",
    detail: "100 題選擇題 · 3 小時 · 60% 通過",
    color: "#22d3ee",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-7 w-7">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c1.5-3.5 4.5-5 8-5s6.5 1.5 8 5" />
      </svg>
    ),
  },
  {
    q: "想證明「我的產品能和別人互通」",
    a: "做指定規格的 Conformance Testing。",
    detail: "特定版本 + 特定 IG + 測試報告",
    color: "#f5a524",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-7 w-7">
        <rect x="3" y="5" width="8" height="7" rx="1.5" />
        <rect x="13" y="12" width="8" height="7" rx="1.5" />
        <path d="M11 8.5h4.5v3.5M13 15.5H8.5V12" />
      </svg>
    ),
  },
  {
    q: "想接臺灣醫療標案",
    a: "以醫院、政府或標案指定的 Implementation Guide 與驗收測試為準。",
    detail: "注意衛福部跨院交換要求",
    color: "#4ade80",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-7 w-7">
        <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" />
        <path d="M12 8.5v7M8.5 10.5h7" />
      </svg>
    ),
  },
];

export function Decision() {
  return (
    <Section
      id="decision"
      no="08"
      eyebrow="Quick Verdict"
      title={
        <>
          最簡單的<span className="text-mint">快速判斷</span>
        </>
      }
      intro="三句話結束：你的目標是哪一種？"
    >
      <div className="grid gap-4 lg:grid-cols-3">
        {VERDICTS.map((v, i) => (
          <Reveal key={v.q} delay={i * 100} className="h-full">
            <div className="card group h-full p-7 text-center" style={{ borderTop: `2px solid ${v.color}66` }}>
              <div
                className="float-slow mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border"
                style={{ color: v.color, borderColor: `${v.color}44`, background: `${v.color}0f`, animationDelay: `${i * 0.7}s` }}
              >
                {v.icon}
              </div>
              <h3 className="mt-5 text-[15.5px] font-bold text-ink">{v.q}</h3>
              <div className="divider mx-auto mt-4 w-16" />
              <p className="mt-4 text-[14px] font-medium leading-7" style={{ color: v.color }}>
                {v.a}
              </p>
              <p className="mt-3 font-mono text-[11.5px] tracking-wide text-muted">{v.detail}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ---------------------------------- footer ---------------------------------- */

export function Footer() {
  return (
    <footer className="relative border-t border-white/5 py-16">
      <div className="pointer-events-none absolute inset-0 grid-fade opacity-60" />
      <div className="shell relative">
        <div className="grid gap-10 md:grid-cols-[1fr_1.4fr]">
          <div>
            <div className="display text-3xl font-bold">
              FHIR<span className="text-cyan">.3D</span>
            </div>
            <p className="mt-3 max-w-sm text-[13px] leading-6.5 text-muted">
              3D 互動式教學手冊——涵蓋 Resource、REST API、個人認證、產品 Conformance Testing 與版本實務。
              內容為教育用途整理，規範細節請以 HL7 官方文件為準。
            </p>
            <p className="mt-5 font-mono text-[11px] tracking-wider text-muted/60">
              HL7 INTERNATIONAL · FAST HEALTHCARE INTEROPERABILITY RESOURCES
            </p>
          </div>
          <div>
            <h3 className="font-mono text-[11px] tracking-[0.3em] text-muted">OFFICIAL RESOURCES</h3>
            <ul className="mt-4 grid gap-x-8 gap-y-2.5 sm:grid-cols-2">
              {LINKS.map((l) => (
                <li key={l.url}>
                  <a
                    href={l.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group inline-flex items-center gap-2 text-[13.5px] text-ink/75 transition hover:text-cyan"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5 shrink-0 text-cyan/60 transition group-hover:text-cyan">
                      <path d="M7 17L17 7M9 7h8v8" />
                    </svg>
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="divider mt-12" />
        <p className="mt-6 text-center font-mono text-[11px] tracking-wider text-muted/50">
          本手冊資料以 HL7、FHIR Foundation 與衛生福利部之公開資訊為基礎 · 2026
        </p>
      </div>
    </footer>
  );
}
