# 流向 Flow

個人財務儀表板：三帳戶（可擴充）管理、每月薪水分配、日常記帳與預算、具備生活目的的存錢目標。

目前階段：**設計系統與元件庫**（Storybook）。完整頁面接下來在這些元件上開發。

## 快速開始

需要 Node.js 20.19 以上（建議 22）。

```bash
npm install
npm run storybook     # 元件庫 http://localhost:6006
npm test              # 金額與存錢目標的單元測試
npm run dev           # 應用程式（目前是預覽頁）
```

## 專案結構

```
src/
  design-system/tokens.json   設計 token 的唯一來源（色彩、字體、間距、圓角…）
  styles/tokens.css           由 tokens.json 產生，請勿手改（npm run tokens）
  styles/global.css           字體載入、基礎樣式、.num 等寬數字
  lib/money.ts                金額格式化與解析（新台幣整數元）
  lib/goals.ts                存錢目標進度、期數、推估
  components/<Name>/          元件、樣式與 stories
  docs/                       Storybook 的介紹與基礎規範頁
.storybook/                   Storybook 設定（主題切換在工具列）
scripts/build-tokens.mjs      tokens.json → tokens.css
```

## 設計規範重點

- **字體**：IBM Plex Sans＋Noto Sans TC；金額一律等寬數字（tabular figures）。
- **間距**：4px 基準格線，只用 `--space-*`。
- **色彩**：藍色 `--primary` 代表操作與可以花的錢；綠色 `--savings` 只代表存起來的錢。
- **主題**：在 `<html>` 設定 `data-theme="light"` 或 `"dark"`。

修改 token：編輯 `src/design-system/tokens.json`，執行 `npm run tokens`（啟動 Storybook 或建置時也會自動執行）。

## 計算規則

- 金額以新台幣整數元儲存與計算，不使用浮點數。
- 存錢目標的剩餘期數**包含本月與目標月**。
- 推估只依每月預計存入，不假設投資收益；未設定每月存入時不推估日期。

## 指令

| 指令 | 用途 |
| --- | --- |
| `npm run storybook` | 開發模式的 Storybook |
| `npm run build-storybook` | 輸出靜態 Storybook 到 `storybook-static/` |
| `npm test` | 單元測試（Vitest） |
| `npm run typecheck` | TypeScript 型別檢查 |
| `npm run tokens` | 重新產生 tokens.css |
| `npm run dev` / `npm run build` | 應用程式開發／建置 |
