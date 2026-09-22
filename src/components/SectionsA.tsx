import { useState } from "react";
import { RESOURCES } from "../data/fhir";
import { Callout, CodeBlock, Reveal, Section } from "./ui";

/* ---------------------------------- 01 是什麼 ---------------------------------- */

const DEFINITIONS = [
  {
    title: "醫療資料如何表示",
    desc: "以標準化的 Resource 結構描述病人、觀察值、就醫紀錄與處方，跨系統語意一致。",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-6 w-6">
        <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" />
        <path d="M12 12l8-4.5M12 12v9M12 12L4 7.5" />
      </svg>
    ),
  },
  {
    title: "系統如何透過 API 交換資料",
    desc: "定義 RESTful 端點與參數，讓不同系統以統一方式讀寫健康資料。",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-6 w-6">
        <path d="M4 9h13M13 5l4 4-4 4" />
        <path d="M20 15H7M11 11l-4 4 4 4" />
      </svg>
    ),
  },
  {
    title: "查詢、建立、修改與刪除",
    desc: "以 CRUD 對應 REST 動詞：GET 查詢、POST 建立、PUT/PATCH 修改、DELETE 刪除。",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-6 w-6">
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 7.5V12l3 2.5" />
      </svg>
    ),
  },
  {
    title: "格式、代碼、限制與驗證",
    desc: "定義資料格式、醫療代碼（Terminology）、欄位限制與驗證規則，確保資料可用。",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-6 w-6">
        <path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-3z" />
        <path d="M9 12l2.2 2.2L15.5 10" />
      </svg>
    ),
  },
];

const DELIVERY = ["REST API", "Bundle", "文件交換", "訂閱 (Subscription)"];

export function WhatIsFhir() {
  return (
    <Section
      id="what"
      no="01"
      eyebrow="Overview"
      title={
        <>
          FHIR 是什麼？
          <span className="text-cyan"> 一套定義，不是資料庫。</span>
        </>
      }
      intro={
        <>
          FHIR 全名是 <b className="text-ink">Fast Healthcare Interoperability Resources</b>。它不是資料庫，也不是某一家廠商的產品，而是一套定義——
          描述醫療資料「長什麼樣」以及系統之間「怎麼交換」。資料通常以 JSON 或 XML 表示。
        </>
      }
    >
      <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr]">
        <div className="grid gap-4 sm:grid-cols-2">
          {DEFINITIONS.map((d, i) => (
            <Reveal key={d.title} delay={i * 90}>
              <div className="card h-full p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan/30 bg-cyan/10 text-cyan">
                  {d.icon}
                </div>
                <h3 className="mt-4 text-[15.5px] font-bold text-ink">{d.title}</h3>
                <p className="mt-2 text-[13px] leading-6.5 text-muted">{d.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="flex flex-col gap-4">
          <Reveal delay={120}>
            <div className="card p-6">
              <h3 className="font-mono text-[11px] tracking-[0.25em] text-muted">API EXAMPLES</h3>
              <CodeBlock
                label="http"
                code={`GET  /Patient/123
GET  /Observation?patient=123
POST /Observation`}
              />
            </div>
          </Reveal>
          <Reveal delay={220}>
            <div className="card p-6">
              <h3 className="font-mono text-[11px] tracking-[0.25em] text-muted">DATA IN → OUT</h3>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="chip">JSON / XML</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 text-cyan">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
                {DELIVERY.map((d) => (
                  <span key={d} className="chip border-teal/30 text-teal">
                    {d}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-[12.5px] leading-6 text-muted">
                資料透過這些管道在系統間傳遞；Bundle 是把多個 Resource 打包成單一文件的常見方式。
              </p>
            </div>
          </Reveal>
        </div>
      </div>

      <Reveal delay={120} className="mt-10">
        <Callout tone="warn" title="「支援 FHIR」不等於「可以直接互通」">
          實際專案還需要搭配 <b>Profile</b>（限制欄位與格式）、<b>Implementation Guide</b>（特定國家或流程的實作規則）、
          <b> CodeSystem / ValueSet</b>（醫療代碼）與 <b>CapabilityStatement</b>（伺服器能力聲明）。
          兩邊必須使用<b className="text-amber">相同版本、相同 Implementation Guide 與相同代碼規範</b>，才能真正互通。
        </Callout>
      </Reveal>
    </Section>
  );
}

/* ---------------------------------- 02 核心資源 ---------------------------------- */

export function ResourcesSection({
  selected,
  onSelect,
}: {
  selected: string | null;
  onSelect: (id: string | null) => void;
}) {
  const [active, setActive] = useState<string>("patient");
  const res = RESOURCES.find((r) => r.id === active) ?? RESOURCES[0];
  const is3DSelected = selected === active;

  const viewIn3D = () => {
    onSelect(active);
    document.getElementById("top")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <Section
      id="resources"
      no="02"
      eyebrow="Resources"
      title={
        <>
          五大常見 Resource
          <span className="text-cyan">，場景裡的五個光點</span>
        </>
      }
      intro="FHIR 定義了上百種 Resource，以下是醫療交換中最常出現的五行。點開查看它們的結構，再回到 3D 場景點亮對應的節點。"
    >
      <div className="grid gap-3 sm:grid-cols-5">
        {RESOURCES.map((r, i) => (
          <Reveal key={r.id} delay={i * 70} className="h-full">
            <button
              onClick={() => setActive(r.id)}
              className="card h-full w-full p-4 text-left"
              style={active === r.id ? { borderColor: `${r.color}88`, background: `${r.color}0d` } : undefined}
            >
              <span
                className="block h-2.5 w-2.5 rounded-full"
                style={{ background: r.color, boxShadow: active === r.id ? `0 0 12px ${r.color}` : "none" }}
              />
              <span className="display mt-3 block text-[15px] font-bold tracking-wide" style={{ color: active === r.id ? r.color : "#e8f4f8" }}>
                {r.name}
              </span>
              <span className="mt-1 block text-[12px] leading-5 text-muted">{r.purpose}</span>
            </button>
          </Reveal>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.25fr]">
        <Reveal>
          <div className="card h-full p-6 md:p-7">
            <div className="flex items-center gap-3">
              <span className="h-3.5 w-3.5 rounded-full" style={{ background: res.color, boxShadow: `0 0 16px ${res.color}` }} />
              <h3 className="display text-2xl font-bold tracking-wide" style={{ color: res.color }}>
                {res.name}
              </h3>
              <span className="ml-auto rounded-full border border-white/10 px-3 py-1 font-mono text-[11px] text-muted">
                {res.purpose}
              </span>
            </div>
            <p className="mt-4 text-[14px] leading-7.5 text-ink/85">{res.desc}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {res.fields.map((f) => (
                <span key={f} className="chip">
                  {f}
                </span>
              ))}
            </div>
            <button
              onClick={viewIn3D}
              className="display mt-6 flex items-center gap-2 rounded-xl border px-4 py-2.5 text-[13px] font-bold tracking-wider transition hover:brightness-125"
              style={{ borderColor: `${res.color}88`, color: res.color, background: `${res.color}14` }}
            >
              {is3DSelected ? "↖ 3D 場景中已點亮" : "↖ 在 3D 場景中點亮這個節點"}
            </button>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <CodeBlock label={`GET ${res.endpoint}`} code={res.sample} />
        </Reveal>
      </div>
    </Section>
  );
}

/* ---------------------------------- 03 基礎之上 ---------------------------------- */

const LAYERS = [
  {
    name: "Profile",
    color: "#22d3ee",
    desc: "在標準 Resource 之上，限制特定情境可用的欄位與格式，例如「門診病人必須有就醫卡號」。",
  },
  {
    name: "Implementation Guide",
    color: "#f5a524",
    desc: "針對特定國家、醫療流程或產業制定的完整實作規則集合，是系統互通的「共同語言」。",
  },
  {
    name: "CodeSystem & ValueSet",
    color: "#4ade80",
    desc: "定義醫療代碼：性別、診斷代碼（如 ICD）、檢驗項目（如 LOINC），確保兩邊對同一個代碼的理解一致。",
  },
  {
    name: "CapabilityStatement",
    color: "#a78bfa",
    desc: "由伺服器自我聲明支援哪些 Resource、操作與參數，讓用戶端知道「可以跟它要求什麼」。",
  },
];

export function Beyond() {
  return (
    <Section
      id="beyond"
      no="03"
      eyebrow="Ecosystem"
      title="基礎標準之上，還有一整套生態"
      intro="FHIR 本身只提供基礎標準。真正的互通性，建立在下列四層之上——这也是為什麼兩個「支援 FHIR」的系統仍可能對不上。"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {LAYERS.map((l, i) => (
          <Reveal key={l.name} delay={i * 90} className="h-full">
            <div className="card h-full p-6" style={{ borderTop: `2px solid ${l.color}66` }}>
              <span className="display text-[15px] font-bold tracking-wide" style={{ color: l.color }}>
                {l.name}
              </span>
              <p className="mt-3 text-[13px] leading-6.5 text-muted">{l.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ---------------------------------- 04 兩種認證 ---------------------------------- */

const CERT_CARDS = [
  {
    tag: "CERTIFY A PERSON",
    title: "證明「個人懂 FHIR」",
    color: "#22d3ee",
    action: "參加 HL7 FHIR Foundational Implementer Exam",
    points: ["HL7 官方舉辦的個人考試", "證明具備 FHIR 基礎實作能力", "約六個月實作經驗為建議門檻"],
  },
  {
    tag: "CERTIFY A PRODUCT",
    title: "證明「產品可互通」",
    color: "#f5a524",
    action: "針對指定 FHIR 版本與 Implementation Guide 進行 Conformance Testing",
    points: ["沒有適用所有產品的通用廠商認證", "需針對特定版本 / IG / 醫院規範逐項驗證", "測試報告即標案與驗收的證據"],
  },
  {
    tag: "COMPLETING A COURSE",
    title: "參加培訓課程",
    color: "#4ade80",
    action: "取得課程完成證書（Course Completion Certificate）",
    points: ["HL7 提供五週 Exam Preparation Course", "是良好的準備途徑", "但不等於通過 HL7 認證考試"],
  },
];

export function CertTypes() {
  return (
    <Section
      id="certification"
      no="04"
      eyebrow="Certification"
      title={
        <>
          認證要先分成<span className="text-cyan">兩種</span>
        </>
      }
      intro="談到「FHIR 認證」，第一件事是分辨你要證明的是「人」還是「產品」——兩條路徑完全不同。"
    >
      <div className="grid gap-4 lg:grid-cols-3">
        {CERT_CARDS.map((c, i) => (
          <Reveal key={c.tag} delay={i * 100} className="h-full">
            <div className="card flex h-full flex-col p-6" style={{ borderTop: `2px solid ${c.color}66` }}>
              <span className="font-mono text-[10.5px] tracking-[0.3em] text-muted">{c.tag}</span>
              <h3 className="mt-2 text-lg font-bold" style={{ color: c.color }}>
                {c.title}
              </h3>
              <p className="mt-3 rounded-xl border border-white/8 bg-white/[0.03] p-3.5 text-[13.5px] font-medium leading-6 text-ink/90">
                {c.action}
              </p>
              <ul className="mt-4 space-y-2.5">
                {c.points.map((p) => (
                  <li key={p} className="flex items-start gap-2.5 text-[13px] leading-6 text-muted">
                    <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full" style={{ background: c.color }} />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal delay={150} className="mt-8">
        <Callout tone="warn" title="FHIR 沒有一張適用所有醫療產品的通用「廠商認證」">
          產品通常必須針對<b>特定規格</b>進行驗證：某個 FHIR 版本、國家 Implementation Guide、醫院規範或政府標準。
          客戶問「你們有 FHIR 認證嗎？」——正確的回答是「我們針對 <b>X 版本 + Y Implementation Guide</b> 完成了合規測試」。
        </Callout>
      </Reveal>
    </Section>
  );
}
