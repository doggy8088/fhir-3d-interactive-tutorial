export type ResourceData = {
  id: string;
  name: string;
  color: string;
  shape: "capsule" | "octa" | "torus" | "pill" | "doc";
  purpose: string;
  desc: string;
  endpoint: string;
  method: "GET" | "POST";
  status: string;
  statusNote: string;
  sample: string;
  fields: string[];
};

export const CORE_POS: [number, number, number] = [0, 0.55, 0];

export const NODE_POS: [number, number, number][] = [
  [3.55, 1.15, -0.6],
  [2.5, -0.55, 2.75],
  [-1.0, -0.85, 3.3],
  [-3.35, 0.4, 1.9],
  [-2.5, 1.6, -2.5],
];

export const RESOURCES: ResourceData[] = [
  {
    id: "patient",
    name: "Patient",
    color: "#ff6b6b",
    shape: "capsule",
    purpose: "病人基本資料",
    desc: "身份、姓名、性別、出生日期等病人基本資訊，是所有其他 Resource 跨域引用的基礎錨點。",
    endpoint: "/Patient/123",
    method: "GET",
    status: "200",
    statusNote: "OK",
    fields: ["resourceType", "id", "name", "gender", "birthDate"],
    sample: `{
  "resourceType": "Patient",
  "id": "123",
  "gender": "male",
  "birthDate": "1990-04-12",
  "name": [
    { "family": "王", "given": ["小明"] }
  ]
}`,
  },
  {
    id: "observation",
    name: "Observation",
    color: "#22d3ee",
    shape: "octa",
    purpose: "檢驗結果、生命徵象",
    desc: "收錄血壓、血糖、心跳等量測與檢驗結果，以結構化的 code 與 value 欄位呈現，是最常見的資料 Resource。",
    endpoint: "/Observation?patient=123",
    method: "GET",
    status: "200",
    statusNote: "OK",
    fields: ["resourceType", "status", "code", "valueQuantity", "subject"],
    sample: `{
  "resourceType": "Bundle",
  "type": "searchset",
  "total": 2,
  "entry": [
    { "resource": {
        "resourceType": "Observation",
        "code": { "text": "收縮壓" },
        "valueQuantity": { "value": 118, "unit": "mmHg" }
    } },
    { "resource": {
        "resourceType": "Observation",
        "code": { "text": "心跳" },
        "valueQuantity": { "value": 72, "unit": "beats/minute" }
    } }
  ]
}`,
  },
  {
    id: "encounter",
    name: "Encounter",
    color: "#f5a524",
    shape: "torus",
    purpose: "就醫或住院紀錄",
    desc: "描述就診、住院、手術等事件的情境與時間，是串起病人其他資料的時間軸錨點。",
    endpoint: "/Encounter/123",
    method: "GET",
    status: "200",
    statusNote: "OK",
    fields: ["resourceType", "status", "class", "type", "subject"],
    sample: `{
  "resourceType": "Encounter",
  "status": "finished",
  "class": { "code": "AMB" },
  "type": [{ "text": "門診就診" }],
  "subject": { "reference": "Patient/123" }
}`,
  },
  {
    id: "medication",
    name: "MedicationRequest",
    color: "#4ade80",
    shape: "pill",
    purpose: "用藥處方",
    desc: "表示藥物處方指令：藥物、劑量、頻率、途徑，以及開立醫師與藥師審查等完整用藥脈絡。",
    endpoint: "/MedicationRequest/123",
    method: "GET",
    status: "200",
    statusNote: "OK",
    fields: ["resourceType", "status", "intent", "medication", "subject"],
    sample: `{
  "resourceType": "MedicationRequest",
  "status": "active",
  "intent": "order",
  "medicationCodeableConcept": {
    "text": "Metformin 500 mg"
  },
  "subject": { "reference": "Patient/123" }
}`,
  },
  {
    id: "report",
    name: "DiagnosticReport",
    color: "#a78bfa",
    shape: "doc",
    purpose: "檢查報告",
    desc: "彙整一次完整檢查結果的報告，可引用多筆 Observation，組成完整的臨床文件。",
    endpoint: "/DiagnosticReport/123",
    method: "GET",
    status: "200",
    statusNote: "OK",
    fields: ["resourceType", "status", "category", "code", "result"],
    sample: `{
  "resourceType": "DiagnosticReport",
  "status": "final",
  "category": [{ "text": "血液學" }],
  "code": { "text": "全血球檢查" },
  "result": [{ "reference": "Observation/456" }]
}`,
  },
];

export const TERMINAL_PRESETS = [
  { method: "GET" as const, path: "/Patient/123", resId: "patient" },
  { method: "GET" as const, path: "/Observation?patient=123", resId: "observation" },
  { method: "POST" as const, path: "/Observation", resId: "observation-post" },
];

export const POST_OBSERVATION_SAMPLE = `{
  "resourceType": "Observation",
  "status": "final",
  "code": { "text": "收縮壓" },
  "valueQuantity": { "value": 118, "unit": "mmHg" },
  "subject": { "reference": "Patient/123" }
}`;

export const EXAM_FACTS = [
  { value: "100", unit: "題", label: "選擇題" },
  { value: "3", unit: "小時", label: "考試時間" },
  { value: "閉卷", unit: "", label: "考試方式" },
  { value: "60", unit: "%", label: "通過門檻" },
];

export const EXAM_RULES = ["需要攝影機", "附照片身分證件", "不允許筆記或閱讀資料"];

export const EXAM_PREREQS = [
  "約六個月 FHIR 實作經驗",
  "基本 JSON 與 XML 能力",
  "基本 REST API 能力",
];

export const EXAM_TOPICS = [
  "Resource",
  "REST API",
  "Bundle",
  "Profile",
  "Extension",
  "Implementation Guide",
  "Terminology",
  "Validation",
  "Security",
  "錯誤排除",
];

export const PERSONAL_STEPS = [
  {
    title: "閱讀官方考試指南",
    desc: "以 HL7 FHIR Foundational Implementer Exam Study Guide 確認完整範圍。",
  },
  {
    title: "強化基礎技能",
    desc: "練習 JSON、XML、HTTP、REST 與 FHIR Search，建立語法直覺。",
  },
  {
    title: "動手練 Resource",
    desc: "在測試伺服器建立、查詢與驗證 Patient、Observation、Encounter 等 Resource。",
  },
  {
    title: "報名考試",
    desc: "至 HL7 Certification 官網報名，設定考試時間。",
  },
  {
    title: "（選修）考試準備課程",
    desc: "視需要參加 HL7 五週線上 Exam Preparation Course 補強。",
  },
  {
    title: "通過並取得認證",
    desc: "通過考試即取得 HL7 FHIR Foundational Implementer 認證。",
  },
];

export const PRODUCT_STEPS = [
  { title: "指定 FHIR 版本", desc: "明確以 R4、R4B 或 R5 哪一個版本為目標。" },
  { title: "指定 IG 與 Profile", desc: "決定遵循哪一份 Implementation Guide 與 Profile。" },
  { title: "定義產品角色", desc: "FHIR Server、FHIR Client、App 或 Gateway。" },
  { title: "公開 CapabilityStatement", desc: "以 CapabilityStatement 聲明產品支援的功能。" },
  { title: "FHIR Validator 驗證", desc: "用 FHIR Validator 檢查 Resource 結構與內容的有效性。" },
  { title: "完整 API 測試", desc: "搜尋、Bundle、Operation、錯誤處理、術語與安全機制。" },
  { title: "第三方合規測試", desc: "以 Touchstone、Crucible 等服務執行伺服器與用戶端測試。" },
  { title: "保存測試報告", desc: "作為標案、醫院介接與客戶驗收的正式證據。" },
];

export const VERSIONS = [
  {
    key: "R4",
    tag: "考試範圍 · 最廣泛採用",
    accent: "#22d3ee",
    points: [
      "Foundational Implementer 考試指南以 R4 能力範圍說明。",
      "註明考試設計上希望具備「版本獨立性」。",
      "生態系最成熟，多數實作與教材以 R4 為基礎。",
    ],
  },
  {
    key: "R4B",
    tag: "R4 之增強 · 向後相容",
    accent: "#f5a524",
    points: [
      "建立在 R4 之上，保持向後相容。",
      "常見於較新的國家實作與計畫性專案。",
      "從 R4 遷移的負擔較小，是常見的中繼選擇。",
    ],
  },
  {
    key: "R5",
    tag: "目前官方公開規格版本",
    accent: "#a78bfa",
    points: [
      "HL7 目前公開規格頁列出的正式版本。",
      "功能最完整，但生態成熟度依情境而定。",
      "專案實作仍以客戶指定的版本為準。",
    ],
  },
];

export const LINKS = [
  { label: "HL7 FHIR 官方規格", url: "https://hl7.org/fhir/" },
  {
    label: "Foundational Implementer 考試指南",
    url: "https://info.hl7.org/hubfs/Education/Brochures/HL7%20FHIR%20Foundational%20Implementer%20Exam%20Study%20Guide%20%281%29.pdf",
  },
  { label: "HL7 Certification 報名", url: "https://www.hl7.org/certification/" },
  { label: "HL7 課程平台", url: "https://courses.hl7.org/" },
  { label: "準備課程說明", url: "https://courses.hl7.org/about-the-fhir-foundational-course" },
  { label: "FHIR Conformance Testing", url: "https://fhir.org/conformance-testing/" },
  { label: "FHIR Foundation", url: "https://fhir.org/" },
  { label: "衛福部 FHIR 標準化試辦計畫", url: "https://www.mohw.gov.tw/cp-7284-85410-1.html" },
];
