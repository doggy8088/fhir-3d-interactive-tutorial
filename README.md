# FHIR 3D 互動式教學手冊

以 3D 互動場景介紹 **HL7 FHIR**（Fast Healthcare Interoperability Resources）的靜態教學網站：轉動場景、點亮 Resource 節點，並在模擬終端機送出真實形態的 FHIR REST 請求。

- **線上網站**：<https://fhir.gh.miniasp.com/>
- **原始碼**：<https://github.com/doggy8088/fhir-3d-interactive-tutorial>
- **授權**：MIT（見 [LICENSE](LICENSE)）

> 本網站為教育用途的內容整理。FHIR® 是 HL7 的註冊商標，規範細節請以 HL7 官方文件為準。

## 內容涵蓋

| 章節 | 主題 |
| --- | --- |
| 01 | FHIR 是什麼：Resource、REST API、CRUD、驗證 |
| 02 | 五大核心 Resource：Patient、Observation、Encounter、MedicationRequest、DiagnosticReport |
| 03 | 基礎之上的生態：Profile、Implementation Guide、CodeSystem／ValueSet、CapabilityStatement |
| 04 | 兩種認證：個人認證 vs 產品 Conformance Testing |
| 05 | 個人認證：Foundational Implementer 考試規格與準備流程 |
| 06 | 產品合規：八步流程與三類測試 |
| 07 | 版本實務：R4 / R4B / R5 |
| 08 | 快速判斷：三種目標各自該走哪條路 |

## 快速開始

需求：Node.js 20.19 以上（CI 使用 24）、npm、`make`。

```bash
make install   # 安裝相依套件（npm ci）
make dev       # 開發伺服器 http://localhost:5173
make check     # 型別檢查 + 正式建置 + 靜態網站預檢
make preview   # 建置後以 Vite preview 提供 http://localhost:4173
```

## 常用指令

| 指令 | 說明 |
| --- | --- |
| `make install` | 依 `package-lock.json` 安裝相依套件 |
| `make dev` | 啟動 Vite 開發伺服器（HMR） |
| `make typecheck` | 以 TypeScript 檢查型別 |
| `make build` | 產生單一檔案的正式版網站到 `dist/` |
| `make preview` | 建置後以 HTTP 預覽正式版輸出 |
| `make serve` | 用 `python3 -m http.server` 提供已建置的 `dist/` |
| `make check` | 型別檢查 + 建置 + `scripts/check-site.sh` 靜態網站預檢 |
| `make assets` | 重新產生 `public/` 的圖示與社群分享卡片 |
| `make audit` | 檢查相依套件的已知弱點 |
| `make clean` / `make distclean` | 清除 `dist/`／再加上 `node_modules/` |

`make check` 是發佈前的守門員：`scripts/check-site.sh` 會驗證標題、`lang`、viewport、canonical、Open Graph／Twitter 標記、圖示與 manifest 連結、JSON-LD 是否為合法 JSON，以及每一個本機資源是否真的存在。GitHub Actions 部署流程會執行同樣的檢查，因此「檢查不過就不會上線」。

## 專案結構

```
index.html                  # 頁面骨架、SEO／社群標記、JSON-LD
src/
  main.tsx                  # React 進入點
  App.tsx                   # 版面骨架、導覽、skip link
  index.css                 # Tailwind v4 主題、動畫、無障礙樣式
  components/
    Hero.tsx                # 3D 場景容器、模擬 FHIR 終端機
    SectionsA.tsx           # 章節 01–04
    SectionsB.tsx           # 章節 05–08 與頁尾
    ui.tsx                  # Section／Reveal／Callout／CodeBlock
  three/scene.tsx           # react-three-fiber 場景（節點、連線、封包）
  data/fhir.ts              # Resource、考試、版本等教學資料
  utils/                    # cn、剪貼簿、prefers-reduced-motion
public/
  CNAME                     # GitHub Pages 自訂網域
  robots.txt, sitemap.xml   # 檢索設定
  site.webmanifest          # PWA 安裝資訊
  assets/                   # 圖示、社群卡片
assets-src/                 # 圖示與社群卡片的來源檔
scripts/
  check-site.sh             # 靜態網站預檢（HTML／資源／metadata／JSON-LD）
  build-assets.sh           # 由 assets-src/ 重新產生 public/ 圖片
```

## 部署

網站由 GitHub Actions 發佈到 GitHub Pages（`.github/workflows/deploy-pages.yml`）：

1. push 到 `main`（或手動 `workflow_dispatch`）觸發流程。
2. `npm ci` → `npm run typecheck` → `npm run build` → `bash scripts/check-site.sh dist`。
3. 產物 `dist/` 上傳為 Pages artifact，再由 `actions/deploy-pages` 部署。

GitHub Pages 設定：Source = **GitHub Actions**，自訂網域 = **fhir.gh.miniasp.com**（`public/CNAME` 會一併複製到 `dist/`，DNS 以 CNAME 指向 `doggy8088.github.io`），HTTPS 由 GitHub 憑證強制啟用。

## SEO 與社群分享

- 唯一的 `<link rel="canonical">`、`og:url`、`twitter:image` 等皆使用絕對 HTTPS 網址（<https://fhir.gh.miniasp.com/>）。
- `og:image` 為 1200×630 的 PNG（`public/assets/og-card.png`），檔案尺寸與宣告值一致，並提供 `og:image:alt`。
- JSON-LD 使用 `WebApplication`，描述名稱、網址、語言、免費、授權與作者。
- 圖示涵蓋 `favicon.svg`、`favicon.ico`（內含 16/32/48）、PNG 16/32、`apple-touch-icon.png`（180）、PWA 192/512，並有 `site.webmanifest`（`start_url` 為 `/`）。
- `robots.txt` 與 `sitemap.xml` 指向正式網域。

修改標題或視覺後，可用 `make assets` 重新產生圖示與社群卡片（需要 Chrome 與 Python Pillow）；社群平台會快取舊卡片，必要時得重新抓取。

## 無障礙與效能

- 語意結構：`header`／`nav`（`aria-label`）／`main#main`／`section`（`aria-labelledby`）／`footer`，單一 `h1`，標題層級不跳階。
- 提供鍵盤 skip link（「跳至主要內容」）與一致的 `:focus-visible` 外框。
- 3D 畫布 `aria-hidden="true"`：章節 02 以 DOM 按鈕重現五個 Resource 的內容與「在 3D 場景中點亮」操作，鍵盤與螢幕閱讀器都能取得同樣資訊。
- 尊重 `prefers-reduced-motion`：關閉自動旋轉、脈動與位移動畫，並停用平滑捲動。
- 剪貼簿失敗不再靜默：`navigator.clipboard` 需要安全來源（HTTPS／localhost），失敗時改用 `document.execCommand("copy")`，仍失敗則在按鈕上顯示「複製失敗，請手動選取」。
- 效能：Hero 離開視窗後以 IntersectionObserver 將 WebGL 的 `frameloop` 設為 `never`，停止繪製；回到畫面再恢復。

## 已知限制

- 3D 場景以滑鼠／觸控操作，鍵盤無法直接旋轉場景；等價內容已放在章節 02。
- 本站為單一深色主題（`<meta name="color-scheme" content="dark">`），不提供淺色主題切換，因此沒有主題閃爍問題。
- 建置產物為單一 HTML（`vite-plugin-singlefile`），內含 Three.js，約 1.3 MB（gzip 約 360 KB）；因為全部內嵌，無法只載入部分程式碼。
- 網站內容為教學整理，考試規則、版本狀態與課程日期請以 HL7 官方公告為準。

## English summary

An interactive, static, single-page tutorial that teaches HL7 FHIR with a 3D scene (react-three-fiber) and a simulated FHIR REST playground. Built with Vite + React + TypeScript + Tailwind CSS v4, checked by `make check`, and published to GitHub Pages at <https://fhir.gh.miniasp.com/> under the MIT license.
