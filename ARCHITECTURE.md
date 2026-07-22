# Seoni Circle App — Architecture Guide

Ye document naye developer ya kisi bhi AI platform (Claude/ChatGPT/etc.) ke liye hai jo
is app me future me koi feature add karega ya bug fix karega. Pehle ye poori file padh
lo — isse code me ghoomne me kaafi time bachega.

## 1. App kya hai

Madhya Pradesh electricity department (Seoni Circle) ke field staff ke liye internal
mobile-style web app. Feeder/meter readings, revenue collection, stock management,
complaints, aur staff records — sab isi ek app se handle hote hain.

**6 DC currently live hain** (baaki DC list me hain but production use me nahi) —
isliye koi bhi change karne se pehle soch lo ki wo live DCs ko affect na kare.

## 2. Tech Stack (no build tools)

- Ek hi `index.html` file — HTML + CSS + JavaScript sab isi me hai. Koi npm/webpack/React nahi.
- Tailwind CSS **CDN se** load hota hai (`cdn.tailwindcss.com`).
- Libraries: `jsPDF` + `jsPDF-autotable` (PDF reports), `XLSX` / SheetJS (Excel upload/download).
- Backend: **Google Apps Script (GAS)** — koi real database/server nahi. Har feature ka
  apna Google Sheet + apna GAS Web App deployment hai (neeche table dekho).
- Data storage: Google Sheets (server-side) + browser `localStorage` / `IndexedDB` (client-side cache).

Isko samajhna zaroori hai: **jab bhi koi "backend fix" karna ho, wo is HTML file me nahi,
balki alag `.gs` file me hota hai** (jo Google Apps Script editor me deployed hai).

## 3. Backend Map — kaunsa URL kis feature ka hai

`index.html` ke top me (~line 1540-1660) ye saare Script URLs const ke roop me defined hain:

| JS variable name                     | Feature                                | Matching `.gs` file (agar mila) |
|---------------------------------------|-----------------------------------------|-----------------------------------|
| `scriptURL`                           | Mobile Number Update                    | —                                 |
| `courtCaseCsvUrl`                     | Court Case (read-only CSV feed)         | —                                 |
| `lokAdalatScriptUrl`                  | Lok Adalat                              | —                                 |
| `stockSubmitScriptUrl`                | Stock / Material Management             | —                                 |
| `shmsSubmitScriptUrl`                 | SHMS Entry / Progress / Pending         | —                                 |
| `stmComplaintScriptUrl`               | STM Complaint                           | —                                 |
| `vehicleReadingSubmitScriptUrl`       | Vehicle Reading (photo upload)          | `vehicle-reading-submit-script.gs` |
| `revenueCollectionSubmitScriptUrl`    | Revenue Collection + Staff Admin/Auth + Category Reports | `revenue-submit-script-dc-wise.gs` |
| `feederSubmitScriptUrl`               | Feeder Reading                          | `feeder-submit-script.gs`         |
| `peakLoadSubmitScriptUrl`             | Daily Hourly Peak Load                  | `daily-hourly-peak-load-submit-script.gs` |

**Important:** Feature yahi 9 alag Google Sheets/scripts pe split hai — matlab agar koi
naya feature "Revenue" se related hai to `revenue-submit-script-dc-wise.gs` me change
hoga, "Feeder" related hai to `feeder-submit-script.gs` me. Galat script me dhoondhne se
time waste hota hai.

## 4. Views — UI ke sections

App ek single-page app hai — sab `<main id="...-view" class="view">` blocks hain, aur JS
`showView()` jaisa function inhe show/hide karta hai. Poori list `index.html` me
`<main id="` search karke milegi. Major views:

- `home-view`, `dc-selection-view`, `dc-dashboard-view` — navigation/landing
- `staff-admin-view` — Staff Admin panel (password-protected)
- `vehicle-reading-view`, `feeder-reading-view`, `daily-hourly-peak-load-view` — meter/vehicle readings
- `stm-complaint-view`, `shms-entry-view` / `-progress-view` / `-pending-view` — complaints
- `stock-material-view`, `material-list-view` / `-receive-view` / `-issue-view`, `live-stock-view`, `low-stock-view`, `stock-report-view`
- `revenue-collection-view`, `revenue-live-progress-view`, `revenue-report-download-view`, `revenue-paid-upload-view`, `revenue-pending-list-view`
- `revenue-message-login-view` — staff login/PIN system
- `court-case-view`, `summary-view`, `mobile-update-view`

## 5. Function naming — kis keyword se search karo

Functions feature ke hisaab se scattered hain (file me physically grouped nahi hain),
isliye **keyword search karke dhoondho**, top-se-bottom padhne ki koshish mat karo:

| Feature                  | Search karne ke liye keyword       |
|---------------------------|-------------------------------------|
| Feeder Reading             | `Feeder` (case-sensitive `feeder`)  |
| Daily Hourly Peak Load     | `PeakLoad` / `peakLoad`             |
| Vehicle Reading            | `vehicleReading` / `Vehicle`        |
| STM Complaint              | `stm` / `Stm`                       |
| SHMS                       | `shms` / `Shms`                     |
| Stock / Material           | `Stock` / `Material`                |
| Revenue Collection         | `revenue` / `Revenue` (229+ functions — sabse bada module) |
| Revenue Category Report    | `RevenueCategory` (Category Wise Paid/Unpaid Summary — sensitive/tricky logic, section 7 dekho) |
| Staff Admin / Login        | `staffAdmin`, `staffLogin`, `unlockStaffAdmin` |
| Court Case                 | `courtCase` / `CourtCase`           |

## 6. Data storage keys (localStorage / IndexedDB)

Kuch important client-side cache keys (poori list ke liye `localStorage`/`indexedDB`
search karo):
- `seoni-revenue-live-progress` — revenue live progress cache
- `shmsOperatorProfile` — SHMS operator login cache
- Revenue Category report ka raw payment data IndexedDB me store hota hai
  (function: `saveRevenueCategoryRawPaymentRows`, `getRevenueCategoryRawPaymentRows`)

## 7. Known tricky areas (gotchas)

- **Revenue Category Wise Paid/Unpaid Summary report** — sabse complex logic hai app me.
  NORMAL file se LV1-LV4 aur AG file se sirf LV5 data aata hai; dono files me DIFFERENT
  date formats hain (NORMAL = DD/MM/YYYY, AG = YYYY-MM-DD). Date parsing me pehle ek bug
  tha (ambiguous dates jaise "07/05" galat month me chale jaate the) — wo fix ho chuka hai
  (`normalizeRevenuePaidDate` function). Is area me koi bhi future change karne se pehle
  dono sample files (NORMAL + AG) leke actual numbers verify zaroor karo.
- **Admin passwords** — pehle client-side JS me hardcoded the, ab server (GAS) verify
  karta hai via naya `verifyAdminPassword` action. Password Google Apps Script ke
  "Script Properties" me store hote hain, code me nahi.
- **9 alag Google Sheets backends** — koi ek DC ka data doosre backend me update karne se
  data mismatch ho sakta hai. Hamesha sahi Script URL confirm karo (Section 3 table dekho).

## 8. Naya feature ya bug fix karte waqt — checklist

1. Pehle decide karo: konsa feature affect ho raha hai → Section 3 se sahi backend
   (`.gs` file) aur Section 5 se sahi JS function keyword dhoondho.
2. Section 7 (gotchas) check karo — kahin wahi area to nahi jisme pehle se koi known issue hai.
3. Jo bhi test data ho (sample Excel/CSV), usse pehle manually verify karo ki expected
   result kya hona chahiye — phir code se compare karo.
4. **Live 6 DCs pe directly test mat karo** — pehle ek test/inactive DC pe ya local
   preview me verify karo.
5. Change karne ke baad JS syntax check zaroor karo (`node --check`) taaki poori app na toote.
