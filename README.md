# EURFOREX_C2C 專案說明

這份 `README.md` 給下一位 Agent 或工程師快速接手：先看專案是什麼、用什麼技術、部署在哪裡、產品功能有哪些、最近更新改了什麼。安裝與寶塔部署細節請看 `安装说明.md`。

## 專案定位

`EURFOREX_C2C` 是一套 C2C 交易與資金管理系統，包含：

- 使用者前台 H5：註冊、登入、錢包、充值、提款、C2C 買賣、訂單、理財、KYC、邀請與客服入口。
- 後端 API：使用者 API、後台管理 API、資料表初始化、錢包資金流、審核與訂單流程。
- 營運後台：管理員登入、使用者管理、錢包調整、充值審核、提款審核、訂單中心、商戶掛單、理財配置、KYC、系統配置與操作紀錄。

## 技術與語言

- 前台：`uni-app`、`Vue 2.6`、JavaScript、H5 build。
- 後台：原生 HTML/CSS/JavaScript 靜態站，透過 `fetch` 呼叫後端 API。
- 後端：PHP 8+ 單入口 API，主要入口 `backend-api/public/index.php`。
- 資料庫：正式環境使用 `MySQL` 或 `MariaDB`。
- 部署：寶塔面板 / Nginx / PHP-FPM / 靜態 H5。
- 建置：Node.js 18 或 20，前台使用 `frontend-uniapp/scripts/build-h5.mjs`。

## 開發與正式環境

本機常用入口：

```text
API: http://127.0.0.1:8000
前台: http://127.0.0.1:8094/h5/
後台: http://127.0.0.1:8095/
```

正式環境建議三站點：

```text
前台 H5: https://c2c.example.com/h5/#/pages/common/login
API:     https://api.example.com
後台:    https://admin.example.com/
```

寶塔/伺服器常用路徑：

```text
/www/wwwroot/EURFOREX_c2c
```

正式站點根目錄：

```text
前台: frontend-uniapp/dist/build
API:  backend-api/public
後台: admin-web
```

## 重要配置

上線、換域名、換 API 時一定核對：

1. `backend-api/.env`
2. `frontend-uniapp/runtime-config.js`
3. `admin-web/runtime-config.js`

注意：前台 API 位址由 `frontend-uniapp/runtime-config.js` 控制，不是 `.env.production.local`。只要前台程式或 API 位址改了，都要重新打包 H5。

## 常用命令

前台建置：

```bash
cd /www/wwwroot/EURFOREX_c2c/frontend-uniapp
npm ci
npm run build:h5
```

如果系統 `npm` 壞掉但 `node_modules` 已存在，可直接跑：

```bash
cd /www/wwwroot/EURFOREX_c2c/frontend-uniapp
node scripts/build-h5.mjs
```

後端語法檢查：

```bash
cd /www/wwwroot/EURFOREX_c2c
php -l backend-api/public/index.php
```

後台 JS 檢查：

```bash
node --check admin-web/shared/admin-api-fetch.js
node --check admin-web/shared/admin-api-client.js
node --check admin-web/shared/admin-view-loaders.js
node --check admin-web/shared/admin-modals.js
```

## 產品功能

前台 H5：

- 註冊、登入、重設密碼、多語系切換。
- 首頁行情、交易大廳、買入 USDT、出售 USDT。
- 訂單列表與訂單詳情。
- 錢包資產、資金紀錄、充值詳情、提款詳情。
- USDT 充值、EUR 法幣入金、USDT 提現、EUR 法幣提現。
- 提款地址管理、銀行資料綁定。
- KYC 實名驗證、邀請團隊、理財產品與持倉。
- 客服中心、公告與教學頁。

後台管理：

- 管理員登入與權限模組。
- 使用者管理、邀請管理、使用者來源與分組。
- 錢包資金調整、帳本查看。
- 充值審核、充值地址管理。
- 提款審核、提款設定。
- C2C 訂單中心、訂單狀態處理、證據/補充資料。
- 商戶掛單管理與成交播報。
- 理財產品與理財訂單管理。
- KYC 審核、收款方式審核。
- 首頁內容、系統配置、操作日誌。

後端 API：

- 使用者認證、Token session、驗證碼。
- 自動建表與資料欄位補齊。
- 錢包餘額與資金流水。
- 充值、提款、C2C 訂單、理財、KYC、上傳。
- 後台權限、審核與營運管理 API。

## 時間與時區約定

- 後端寫入時間使用 UTC ISO。
- 使用者前台 API 請求會自動帶 `X-Timezone`，來源是使用者設備的 `Intl.DateTimeFormat().resolvedOptions().timeZone`。
- 後台 API 請求也會自動帶 `X-Timezone`，來源是登入後台管理員自己的設備時區。
- 使用者端與後台的充值、提款、C2C 訂單等時間會依請求者設備時區本地化顯示，並保留部分 `*_utc` 原始欄位供追查。

## 重要維護規則

- 不要只改源碼就認為線上已更新；前台 H5 要重新執行 `npm run build:h5` 或 `node scripts/build-h5.mjs`。
- 不要把 `backend-api` 整個目錄暴露給 Web，只能把 API 站點指向 `backend-api/public`。
- 不要把 `.env`、資料庫密碼、寶塔面板密碼提交到 Git。
- 不要刪除 `frontend-uniapp/pages.json` 或 `RootShell.vue` 引用的頁面檔，否則 H5 build 會失敗。
- 若發現檔案顯示 `D`，先用 `git status --short` 確認是否為工作區誤刪，再決定是否 `git restore`。
- 修改 `backend-api/public/index.php` 後至少跑 `php -l backend-api/public/index.php`。

## 最近更新紀錄

每次 Agent 改完專案，都要在這裡新增一條，讓下一位 Agent 不用猜上下文。

### 2026-09-12

- H5 底部導覽等圖示顯示成 `swap_horizontal_circle`、`receipt_long`、`person` 文字：圖示不是 PNG，而是 Material Symbols 圖示字型的 ligature（字型把這些字串畫成圖示）。字型本來就是自架（`static/previews/shared/fonts/google-cdn-mirror/`），但檔案 925 KB 且要等 CSS 載完才開始下載，慢速網路或 App 內建瀏覽器超過 `font-display: block` 的 3 秒後就會露出文字。處理：改用只含專案實際用到的 60 個圖示的子集字型（約 8 KB，`scripts/subset-icon-font.mjs` 向 Google Fonts 產生，清單在 `scripts/icon-font-names.json`），`template.h5.html` 先行 `preload` 該字型，並在字型可用前用 `html.ms-pending` 隱藏圖示文字（12 秒後無論如何顯示）。`npm run build:h5` 前會自動執行 `scripts/check-icon-font.mjs`，原始碼若用了不在子集裡的圖示會中止建置並提示執行 `npm run icons:subset`。完整字型移到 `scripts/fonts-src/`，不再隨 H5 發佈。

### 2026-09-11

- 後台看不到客戶完整銀行帳號：原本新增銀行時只存遮罩後的 `account_no_masked`，完整帳號從未入庫。`user_payout_methods` 新增 `account_no`（完整帳號），使用者新增時同時寫入完整與遮罩；使用者列表、提現查詢、後台收款方式／提現審核 API 一併回傳；後台「提款信息」、提現詳情、收款方詳情卡片改顯示完整帳號，編輯欄位改為「帳號 / IBAN（完整）」，後台存檔會同步重算遮罩。早期未遮罩的短帳號已回填；已遮罩的舊資料（含 2026-09-11 前綁定的）無法還原，卡片會標示「僅有遮罩，請補填完整帳號」，需由後台補填或請客戶重新綁定。後台提現審核的幣別改為直接跟金額一起顯示（銀行提現以收款帳戶幣別為準，如 `129 EUR`、`100 USD`），提款信息與提現詳情不再另列「幣別」；提現詳情金額改用幣別代碼；提現審核列表的「訂單編號」與「日期」合併為同一欄（日期顯示在訂單編號下方，欄數 12 → 11）。提現審核的用戶欄縮窄為 150px（信箱可換行）；只有遮罩的舊帳號會在提款信息標示「此帳戶為修正前綁定，系統只有遮罩值」並提供「補填完整帳號」按鈕，直接開啟該用戶的收款方編輯。`admin-view-loaders.js` 與 `admin-console.css` 的載入版本號已更新（舊版被瀏覽器快取時會看不到新欄位）。
- 舊資料為何只有遮罩：從第一個版本（`10620c7`）起，`POST /api/user/payout-methods` 就是收到客戶送來的完整帳號後在 PHP 內先遮罩、再只把 `account_no_masked` 寫入資料庫（當時根本沒有 `account_no` 欄位），客戶在前台確實輸入了完整帳號，是伺服器端丟掉的；伺服器沒有任何請求日誌、稽核紀錄或前端本機儲存留有原始值，因此無法自動補齊。新增客戶端補填流程：`POST /api/user/payout-methods/{id}/account-no`（只允許本人、只允許 `account_no` 為空的銀行帳戶，新帳號末碼必須與遮罩可見尾碼相符，寫入後同步重算遮罩並記錄 `payout_method_account_completed` 稽核）。前台「收款方式」頁對只有遮罩的銀行卡片顯示「此銀行帳戶尚未有完整帳號，請補填後才能用於提領」與 IBAN 輸入框；提領頁的銀行選單會標示「需補填完整帳號」，並在送出提領前擋下這類帳戶（提示補填連結）。23 種語系已補上相關文案。
- 全面清查「只存遮罩、完整值丟失」的問題：除了銀行帳號，KYC 的證件號也一樣（`POST /api/user/kyc-applications` 只把 `XX****YY` 寫進 `id_number_masked`）。`user_kyc_applications` 新增 `id_number`（完整證件號），提交時完整與遮罩並存，使用者查詢最新申請、後台 KYC 列表／詳情一併回傳，後台關鍵字可用完整證件號搜尋；後台列表與詳情優先顯示完整證件號，修正前提交的申請只有遮罩值時標示「僅遮罩」並提示對照證件照片（證件正反面照片仍在，可從照片讀取）。未被遮罩的短證件號已回填。客戶端自己的銀行卡片、提領頁銀行選單與提領詳情改顯示完整帳號（舊資料仍為遮罩，補填後即顯示完整）。其餘出現 `****` 的地方（安全中心顯示自己的信箱／手機、首頁交易動態的他人信箱）只是顯示層遮罩，資料庫皆有完整值。後台資產版本號更新為 `20260911-bank6`。
- 後台所有詳情列（`detailRows`）的值一律加上 `title`，滑鼠指著即顯示完整內容（與訂單編號欄相同做法）；提現審核「提款信息」每一行、收款方卡片的帳號列、KYC 列表與詳情的證件號也都帶完整值的 hover。只有遮罩的舊資料 hover 會顯示「系統只有遮罩值，完整帳號未保存」。提現所連結的收款方式若已被後台刪除（例如 2026-09-11 收款方式 #12 被刪除後的提現 #23），提款信息與詳情改顯示「原收款方式（ID n）已被刪除，無收款資料」而不是空白。客戶端銀行卡片與提領頁的帳號元素同樣加上 `title`。後台資產版本號更新為 `20260911-bank7`。

### 2026-09-10

- 提領限制政策確認與修正：後端 `POST /api/user/withdrawal-requests` 原本就只在後台「限制提領」勾選時才會擋（原因為 `kyc_required` 且未完成 KYC 時回 AUTH_KYC_REQUIRED，其餘原因回 AUTH_WITHDRAWAL_RESTRICTED；未勾選時未做 KYC 也可提領），沒有任何信用分或等級門檻。使用者回報「信用分不足無法提領」的來源是錢包頁 `wallet.vue` 的「USDT 提領」快捷方塊寫死彈出「等級或信用分不足」對話框，任何人點都會看到；已改為直接連到 USDT 提領頁並移除該對話框。已重新打包 H5。
- 銀行綁定「新增銀行」彈窗改版：新增「貨幣」選單（點開為法幣清單 EUR / CHF / USD / GBP，樣式比照加密資產選單）、銀行名稱、依貨幣變化的「歐元帳戶 / 美元帳戶…」帳號 / IBAN 欄位、BIC/SWIFT（選填）、開戶人姓名、開戶地址（選填）。法幣清單抽成 `frontend-uniapp/common/fiatCurrencies.js`。 iOS Safari 上彈窗原本用 `max-h-[90vh]`，工具列顯示時最底下的確認鈕會被蓋住且捲不到；改為由 overlay（fixed inset-0，跟著實際可視區）自行捲動、彈窗 `my-auto` 置中，並加上 safe-area 底部留白。已綁定卡片與法幣提現的選擇銀行彈窗顯示幣別、BIC/SWIFT 與開戶地址；法幣提現改為只列出與所選法幣相同幣別的銀行帳戶。
- 後端 `user_payout_methods` 新增 `currency_code`、`bank_swift`、`holder_address` 三欄（`mysql_schema_missing_columns` 自動補欄位，舊的銀行資料回填為 EUR），`POST /api/user/payout-methods` 接受並驗證新欄位（幣別限 EUR/CHF/USD/GBP，BIC 為 8 或 11 碼），列表與提現查詢一併回傳；後台收款方式卡片、提現審核「提款信息」顯示並可編輯這三個欄位。新增 22 個多語 key（23 個語系檔現為 897 個 phrases）。用 headless 以假資料在 21 個非英文語系逐一檢查銀行綁定頁、新增彈窗、貨幣清單與提現選銀行彈窗，沒有英文殘留；順手修掉這頁幾個機翻錯譯（如 `銀行綁定` 在法／西／義文被譯成「裝訂」、`客服協助` 多語直譯成 Support Help、`取消` 德文 Stornieren 改 Abbrechen）。已重新打包 H5。

### 2026-09-06

- 修復前台多語切換後大部分文字仍是英文（德文等所有非中英語系）：`main.js` 的 `localizedText(zh, en)` 在非中文語系用英文文案查字典，但 `locales/*.json` 的 `phrases` 一律以繁體中文原文為 key，因此永遠查不到、只能回傳寫死的英文。已改為先用中文 key 查「目前語系自己」的譯文，找不到才退回英文；中文語系只查自己的字典、不再退回英文。`common/domTranslator.js` 同步加上中文語系不退回英文字典的保護。移除 `orderDetail / swap / mixrecharge / merchantAuth / withdrawDetail` 五頁自行覆寫、永遠回傳英文的 `localizedText`。
- 補齊德文字典：`de.json` 新增 217 個模板有用到但所有語系檔都沒有的中文 key（含 `user.vue` 提現選單新包進 `localizedText` 的 `加密貨幣提現`），把 91 個原本直接複製英文的值改為德文，修正 14 個明顯誤譯（如 `持倉本金: Geschäftsführer`），補上 `AUTH_WITHDRAWAL_RESTRICTED / AUTH_TRADE_RESTRICTED / AUTH_LOGIN_RESTRICTED` 三個 apiErrors。同一批 key 同步加進 `eng.json`（英文基準）、`zh-Hant.json`（原文）與 `zh-Hans.json`（簡體），其餘 20 種語系尚未補這批 key，會退回英文。
- 用 Playwright 對打包後的 dist 檢查德文個人中心、提現選單、閃兌、法幣提現、安全中心與英文→德文即時切換皆正確，簡中與英文顯示不變。已重新打包 H5；注意本機預設 `node` 是 v12，`npm run build:h5` 需用 `~/.local/opt/node-v20.19.4-linux-x64/bin` 的 Node 20。
- 其餘 19 種語系（es/fr/it/pt/nl/da/sv/fi/pl/hu/el/jp/kr/vi/th/hi/ur/ne/fa）同步補齊：每個語系新增同一批 217 個中文 key 的譯文，並把原本直接複製英文的佔位值（各語系 9～115 個不等）改成該語言，補上 3 個 apiErrors；`zh-Hant.json` / `zh-Hans.json` 也補上原本缺的 7 個 key（`商戶`、`到期日`、`理財商品` 等）。所有 23 個語系檔現在都是 854 個 phrases。西班牙語本來就存在（`langs.js` 的 `es`），不需新增。剩下與英文相同的值（FX、Swap、Status、Email、Volume 等）是該語言本來就通用的字。各語系 `資金紀錄` 的譯名統一縮成單字（Historial / Historique / 履歴…），避免個人中心四欄快捷鍵截斷。已用 Playwright 逐一開啟 20 個非中文語系的個人中心、閃兌與法幣提現頁確認沒有英文殘留，並重新打包 H5。
- 以西班牙文逐頁掃描全部 H5 頁面後，再修掉模板層的英文殘留（影響所有非中文語系）：`register.vue` 原本只有繁中／簡中／英文三套內建文案，其他語系一律顯示英文，改為以繁中文案為 key 查字典；`eurSwapWithdraw.vue` 整頁原本寫死英文，全部改用 `localizedText`；另修 `hall.vue` 的 title、`financial.vue` 的 ALL、`financialHoldings.vue` 的 No Active Position、`withdraw.vue` 的 Notice 初始值。`utils/api.js` 的 API 錯誤訊息原本只有中英兩套，非中英語系改讀 `locales/*.json` 的 `apiErrors`，斷網時瀏覽器的 `Failed to fetch` 改為各語系的「網路連線失敗」文案。為此新增 24 個 key（23 個語系檔現為 875 個 phrases），並修正 es.json 幾個舊值（fíat、ganar、madurado、Trading Hall 等）。

### 2026-05-08

- 提領風控改為會員個別設定：移除「換匯提領配置」中的全站提領風控卡片，改在「等級與限額」單一用戶彈窗中分成「等級設定 / 商戶與認證 / 風控限制」。風控限制使用「限制提領 / 限制交易 / 限制登入」勾選，全部未勾選時不會觸發限制；限制原因只決定系統多語使用者提示，管理員備註與異動原因僅後台可見。KYC 提示改為「尚未完成實名認證 / 尚未完成实名认证 / Identity verification has not been completed」，並重新打包 H5。
- 調整後台「等級模板」分組邏輯：新增 `tier_templates.admin_group_code`，模板列表增加管理分組篩選；新增/編輯模板時不再手填 `basic/vip/vip_plus`，系統依管理分組與等級自動生成 `{admin_group}_lv{level}`，列表與用戶等級欄位顯示實際管理分組名稱，避免「十二」與「馬飛」各自建立 LV1/LV2/LV3 時互相混淆或衝突。
- KYC 實名認證頁移除證件正反面圖片 URL 手填欄位，改為和充值憑證一致的圖片上傳卡片；使用者選圖後可立即預覽，再次點擊可更換圖片，提交時先上傳圖片再送出 KYC 申請。已更新冒煙測試並重新打包 H5。
- 調整 KYC 實名認證頁手機版排序：手機尺寸改為「狀態卡 → KYC 提交欄位 → 安全提醒」，桌面版仍維持狀態卡與安全提醒並排、提交欄位在下方。已重新打包 H5。
- 調整後台提現審核列表：移除獨立資產欄，金額欄直接顯示去尾零後的數值與幣種，最多顯示小數點後 5 位；新增「提款信息」欄顯示當次提交的鏈上地址或銀行卡資料；縮窄訂單編號與備註欄；EUR 換 USDT 鏈上提領備註改為中文顯示，首行優先呈現換算後實收 USDT。
- 修復後台「使用者詳情」顯示載入用戶資料失敗：原因是後端使用者詳情 API 會計算下線人數，原本使用 `WITH RECURSIVE`，但線上 MySQL/MariaDB 版本不支援該語法，導致 API 500。已改成 PHP 逐層查詢，並同步移除後台權限範圍內的遞迴 SQL，避免同類後台頁面在舊版資料庫上失敗。
- 美化法幣提現錯誤提示：移除瀏覽器原生 `alert()`，改為站內置中彈窗；同時修正法幣提現未完成 KYC 時後端錯誤碼，由誤導性的 `AUTH_UNAUTHORIZED` 改為 `AUTH_KYC_REQUIRED`，前台提示「請先完成身份認證後再提交法幣提現」。已重新打包 H5。
- 註冊成功倒數彈窗補上語言規則：繁中/簡中顯示中文，其餘所有語言統一顯示英文 `Registration successful / Logging in`。已重新打包 H5。
- 調整註冊成功流程：移除註冊後的生物識別啟用詢問彈窗，改為畫面中央顯示「註冊成功 / 正在登入中」倒數 2、1 秒後自動進入前台。已重新打包 H5。
- 修復後台對部分新用戶調帳出現 `Wallet not found`：原因是用戶預設初始化函式缺失，導致 `EN601269` 等新用戶沒有 `cash_usdt`、`eur`、`eur_reserved`、`cny` 錢包與等級資料。已補回 `initialize_user_defaults()`、啟動時補齊缺失資料，並將當前缺資料用戶全部補齊。
- 同步美化銀行綁定頁：已綁定銀行卡片改為清楚分列顯示「戶名 / 銀行名 / 銀行帳號」，新增銀行彈窗表單也改為卡片化輸入區塊。已重新打包 H5。
- 美化法幣提現的「選擇收款銀行」彈窗：單筆銀行資料改為獨立卡片框線，明確顯示「戶名 / 銀行名 / 銀行帳號」，並同步美化已選擇銀行卡片。已重新打包 H5。
- 銀行綁定改為免審核：使用者新增銀行收款方式後後端直接寫入 `approved`，前台銀行綁定頁移除「狀態：審核中」顯示，既有 pending 銀行資料會自動轉為 approved。後台「收款方詳情」卡片新增可編輯欄位，管理員保存後會更新同一筆 `user_payout_methods`，使用者端重新讀取即同步。
- 修復前台賣出交易無法下單：線上 API 驗證錯誤碼為 `AUTH_TIER_DAILY_SELL_LIMIT_REACHED`，原因是等級 1 每日賣單限制把已取消訂單也計入。後端改為只計算非 `cancelled` 賣單，並補上前端多語錯誤文案。已用測試帳號建立訂單成功後立即取消驗證，並重新打包 H5。
- 修復全站時間顯示：前台使用者 API 與後台管理 API 都會帶 `X-Timezone`，後端依登入者/使用者設備時區回傳訂單、充值、提款等時間。
- 涉及檔案：`frontend-uniapp/utils/api.js`、`admin-web/shared/admin-api-fetch.js`、`admin-web/shared/admin-api-client.js`、`backend-api/public/index.php`。
- 恢復一批曾在工作區顯示刪除的前台必要檔案：`main.js`、`myTask.vue`、`financialHoldings.vue`、`orderDetail.vue`、`fundRecord.vue`、`rechargeDetail.vue`、`withdrawDetailFiat.vue`、`utils/datetime.js`。全站掃描確認不是換目錄，是工作區刪除狀態；終端紀錄沒有找到明確 `rm` 線索。
- 重新打包 H5 成功，輸出在 `frontend-uniapp/dist/build`。
- 重整文件：將安裝部署內容集中到 `安装说明.md`，`README.md` 改為專案總覽與更新紀錄。

## 相關文件

- `安装说明.md`：完整安裝、寶塔部署、更新、驗活與安全檢查。
- `docs/首次上线文档.md`：首次上線核對表。
- `frontend-uniapp/SECURITY-AUDIT.md`：前台 production npm audit 策略。
- `admin-web/BUTTON-AUDIT.md`：後台按鈕行為盤點。
- `LOADING-SCENE-SPEC.md`：Loading 場景配置規範。
