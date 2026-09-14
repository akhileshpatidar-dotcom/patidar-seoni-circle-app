// =====================================================================
// O&M/VIG MODULE - BACKEND
// USER REQUEST (2026-09-14): script isi Google Sheet par banani hai jisme
// "Pending Consumer Details" tab pehle se hai (URL: .../d/19_kQiaccrurYvTn
// UxS9UoygoBxiQj0f1eLlLJctNBk0) - koi alag naya sheet/copy nahi chahiye.
// Aur paid list upload hone par Revenue cash-list jaisa hi, HAR DC ka
// ALAG "PAID - {DC}" tab khud-b-khud ban jaana chahiye.
//
// SETUP: is Sheet ko kholiye -> Extensions -> Apps Script -> is file ka
// poora content paste kijiye -> Deploy -> New deployment -> Web app
// (Execute as: Me, Who has access: Anyone) -> URL Claude ko bhej dijiye.
//
// FLOW:
//  1) "Pending Consumer Details" tab HAMESHA KE LIYE frozen baseline hai -
//     seedha wahi se padha jaata hai (koi copy step nahi). Freeze date
//     ek baar "setFreezeDateOnce" action se set hoti hai (OMVIG META sheet
//     me FREEZE_DATE) - dobara set nahi hone deta agar already set hai.
//  2) Admin jab bhi Circle-wide Paid list upload karta hai (uploadPaidList),
//     har row ka Panchanama_no "Pending Consumer Details" me dhoonda jaata
//     hai taaki uska DC pata chale, phir wahi row us DC ke "PAID - {DC}"
//     tab me APPEND ho jaati hai (Tx_number se duplicate skip). Jis
//     Panchanama_no ka match hi nahi milta, wo "PAID - UNMATCHED" tab me
//     chala jaata hai (data-quality check ke liye, silently drop nahi hota).
//  3) App report banate waqt: getPendingSummary (poori ya ek DC ki list +
//     freeze_date) aur getPaidSummary (poore Circle ya ek DC ki paid list)
//     fetch karke, Pay_date > freeze_date wale hi "PAID" count karta hai -
//     yeh matching app.js (client) me hoti hai, is backend me nahi.
// =====================================================================

// FIX (2026-09-14): live sheet ki pending tab ka naam "Pending Consumer
// Details" nahi, balki "O&M/VIG Module" nikla (spreadsheet-title jaisa hi) -
// hardcoded naam se match nahi hua tha, data khaali aa raha tha. Ab naam par
// bharosa karne ki jagah HAMESHA spreadsheet ki PEHLI (sabse left wali) tab
// hi pending baseline maani jaati hai - future me tab ka naam badal bhi jaye
// to bhi chalega, bas woh hamesha 1st/left-most position par rahe.
function getPendingSheet_(ss) {
  const sheets = ss.getSheets();
  return sheets.length ? sheets[0] : null;
}

const OMVIG_META_SHEET = "OMVIG META";
const OMVIG_PAID_PREFIX = "PAID - ";
const OMVIG_PAID_UNMATCHED_SHEET = OMVIG_PAID_PREFIX + "UNMATCHED";

const OMVIG_PENDING_HEADERS = ["Circle", "Division", "DC", "CHECKED BY", "inspection date", "Panchanama_No", "EZ no", "Consumer_Name", "Consumer No", "Tariff Name", "Case Name", "Balanced Amount"];
const OMVIG_PAID_HEADERS = ["Circle", "Division", "Panchanama_no", "amount", "Pay_date", "Pay_mode", "Tx_number", "uploaded_at"];

function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) || "";
    const dc = (e && e.parameter && e.parameter.dc) || "";
    if (action === "getPendingSummary") return jsonResponse_(getPendingSummary_(dc));
    if (action === "getPaidSummary") return jsonResponse_(getPaidSummary_(dc));
    if (action === "getDcList") return jsonResponse_(getDcList_());
    if (action === "getFreezeStatus") return jsonResponse_(getFreezeStatus_());
    return jsonResponse_({ status: "success", message: "O&M/VIG Script Live Hai" });
  } catch (error) {
    return jsonResponse_({ status: "error", message: error && error.message ? error.message : "unknown error" });
  }
}

function doPost(e) {
  try {
    const data = getRequestData_(e);
    const action = data.action || "";
    if (action === "setFreezeDateOnce") return jsonResponse_(setFreezeDateOnce_(data));
    if (action === "uploadPaidList") return jsonResponse_(uploadPaidList_(data));
    throw new Error("Unknown action: " + action);
  } catch (error) {
    return jsonResponse_({ status: "error", message: error && error.message ? error.message : "unknown error" });
  }
}

function getRequestData_(e) {
  if (!e) throw new Error("Request missing hai");
  if (e.postData && e.postData.contents) {
    try {
      return JSON.parse(e.postData.contents);
    } catch (err) {
      // form-parameter fallback - client hamesha JSON body bhejega normally
    }
  }
  return e.parameter || {};
}

// BUG FIX (2026-09-14): user ko report header me "Freeze Date:
// 2026-09-13T18:30:00.000Z" jaisa dikha - root cause: FREEZE_DATE plain
// "yyyy-MM-dd" text ke roop me save hoti hai, lekin Google Sheets aise
// dikhne wale text ko khud-b-khud ek real Date cell bana deta hai - agli
// baar padhne par `values[i][1]` ek JS Date object hota hai, jo JSON me
// poori ISO timestamp (samay/timezone samet) ban jaata hai. Fix: yahan bhi
// (jaisa data-column reads me `formatDateCells_` karta hai) Date instance
// ko wapas plain "yyyy-MM-dd" text me convert kar dete hain.
function getMetaValue_(ss, key) {
  const sheet = ss.getSheetByName(OMVIG_META_SHEET);
  if (!sheet || sheet.getLastRow() < 1) return "";
  const values = sheet.getDataRange().getValues();
  const tz = Session.getScriptTimeZone() || "Asia/Kolkata";
  for (let i = 0; i < values.length; i++) {
    if (String(values[i][0]) === key) {
      const raw = values[i][1];
      if (raw instanceof Date) return Utilities.formatDate(raw, tz, "yyyy-MM-dd");
      return raw;
    }
  }
  return "";
}

function setMetaValue_(ss, key, value) {
  let sheet = ss.getSheetByName(OMVIG_META_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(OMVIG_META_SHEET);
    sheet.getRange(1, 1, 1, 2).setValues([["KEY", "VALUE"]]);
  }
  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]) === key) {
      sheet.getRange(i + 1, 2).setValue(value);
      return;
    }
  }
  sheet.appendRow([key, value]);
}

// Sheets kabhi-kabhi currency-jaisi text ("₹ 7,719") ya comma-wali string ko
// number ki jagah text rakh leta hai - yahan safai se plain number bana
// dete hain taaki baad me sabhi jagah reliable math ho.
function cleanAmount_(value) {
  const num = Number(String(value == null ? "" : value).replace(/[^\d.-]/g, ""));
  return Number.isFinite(num) ? num : 0;
}

function setFreezeDateOnce_(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const existing = getMetaValue_(ss, "FREEZE_DATE");
  if (existing) {
    return { status: "success", message: "Freeze date pehle se set hai - dobara change nahi hui.", freeze_date: existing, already_set: true };
  }
  const tz = Session.getScriptTimeZone() || "Asia/Kolkata";
  const freezeDate = (data && data.freeze_date) || Utilities.formatDate(new Date(), tz, "yyyy-MM-dd");
  setMetaValue_(ss, "FREEZE_DATE", freezeDate);
  return { status: "success", message: "Freeze date set ho gayi: " + freezeDate, freeze_date: freezeDate, already_set: false };
}

// "Pending Consumer Details" se Panchanama_No -> DC ka lookup map banata hai
// (paid list upload karte waqt har row ka DC pata karne ke liye).
function buildPanchanamaToDcMap_(ss) {
  const sheet = getPendingSheet_(ss);
  const map = {};
  if (!sheet || sheet.getLastRow() < 2) return map;
  const lastRow = sheet.getLastRow();
  const values = sheet.getRange(2, 1, lastRow - 1, OMVIG_PENDING_HEADERS.length).getValues();
  values.forEach(function (row) {
    const panchanamaNo = String(row[5] || "").trim(); // col F = Panchanama_No
    const dc = String(row[2] || "").trim(); // col C = DC
    if (panchanamaNo && dc && !map[panchanamaNo]) map[panchanamaNo] = dc;
  });
  return map;
}

function getOrCreatePaidSheet_(ss, sheetName) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.getRange(1, 1, 1, OMVIG_PAID_HEADERS.length).setValues([OMVIG_PAID_HEADERS]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, OMVIG_PAID_HEADERS.length).setFontWeight("bold").setBackground("#8b5e34").setFontColor("#ffffff");
  }
  return sheet;
}

function uploadPaidList_(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const rows = Array.isArray(data.rows) ? data.rows : [];
  if (!rows.length) throw new Error("Koi row nahi mili upload karne ke liye");

  const panchanamaToDc = buildPanchanamaToDcMap_(ss);
  const tz = Session.getScriptTimeZone() || "Asia/Kolkata";
  const uploadedAt = Utilities.formatDate(new Date(), tz, "dd/MM/yyyy HH:mm");

  // DC-wise (aur UNMATCHED ke liye) rows group karte hain, taaki har target
  // sheet me ek hi baar mein likhein (bar-bar getRange/setValues na karna
  // pade - bade upload me yeh dheere ho sakta hai).
  const grouped = {}; // sheetName -> rows[]
  const existingTxBySheet = {}; // sheetName -> Set

  let matchedCount = 0, unmatchedCount = 0, skippedDuplicate = 0;

  rows.forEach(function (r) {
    const get = function (idx, key) { return Array.isArray(r) ? r[idx] : r[key]; };
    const panchanamaNo = String(get(2, "Panchanama_no") || "").trim();
    const dc = panchanamaToDc[panchanamaNo] || "";
    const targetSheetName = dc ? (OMVIG_PAID_PREFIX + dc) : OMVIG_PAID_UNMATCHED_SHEET;
    if (dc) matchedCount++; else unmatchedCount++;

    if (!existingTxBySheet[targetSheetName]) {
      const sheet = getOrCreatePaidSheet_(ss, targetSheetName);
      const set = new Set();
      const lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        sheet.getRange(2, 7, lastRow - 1, 1).getValues().forEach(function (row) {
          if (row[0]) set.add(String(row[0]).trim());
        });
      }
      existingTxBySheet[targetSheetName] = set;
    }

    const txNumber = String(get(6, "Tx_number") || "").trim();
    if (txNumber && existingTxBySheet[targetSheetName].has(txNumber)) {
      skippedDuplicate++;
      return;
    }
    if (txNumber) existingTxBySheet[targetSheetName].add(txNumber);

    if (!grouped[targetSheetName]) grouped[targetSheetName] = [];
    grouped[targetSheetName].push([
      get(0, "Circle") || "",
      get(1, "Division") || "",
      panchanamaNo,
      cleanAmount_(get(3, "amount")),
      get(4, "Pay_date") || "",
      get(5, "Pay_mode") || "",
      txNumber,
      uploadedAt
    ]);
  });

  Object.keys(grouped).forEach(function (sheetName) {
    const sheet = getOrCreatePaidSheet_(ss, sheetName);
    const newRows = grouped[sheetName];
    if (newRows.length) {
      sheet.getRange(sheet.getLastRow() + 1, 1, newRows.length, OMVIG_PAID_HEADERS.length).setValues(newRows);
    }
  });

  return {
    status: "success",
    message: matchedCount + " matched (DC-wise tabs me) + " + unmatchedCount + " unmatched, " + skippedDuplicate + " duplicate skip hue",
    matched: matchedCount,
    unmatched: unmatchedCount,
    skipped_duplicate: skippedDuplicate,
    dc_tabs_updated: Object.keys(grouped).filter(function (n) { return n !== OMVIG_PAID_UNMATCHED_SHEET; }).map(function (n) { return n.replace(OMVIG_PAID_PREFIX, ""); })
  };
}

// Date-jaisi cells (Sheets khud-ba-khud Date object bana deta hai) ko wapas
// plain "yyyy-MM-dd HH:mm" text me convert karte hain taaki app.js me
// date-matching hamesha reliable rahe (STM Complaint script me isi wajah se
// yahi pattern use kiya gaya tha).
function formatDateCells_(values, dateColIndexes) {
  const tz = Session.getScriptTimeZone() || "Asia/Kolkata";
  return values.map(function (row) {
    return row.map(function (cell, colIndex) {
      if (cell instanceof Date && dateColIndexes.indexOf(colIndex) > -1) {
        const hasTime = cell.getHours() || cell.getMinutes() || cell.getSeconds();
        return Utilities.formatDate(cell, tz, hasTime ? "yyyy-MM-dd HH:mm" : "yyyy-MM-dd");
      }
      return cell;
    });
  });
}

// USER-REPORTED SLOWNESS FIX (2026-09-14): admin status box aur Division/
// Circle report - dono pehle poori getPendingSummary_() (~9500 rows, poore
// Circle ki full data, 1-2+ min tak lag sakta) call karke sirf freeze_date
// pata karte the. Yeh chhota/fast endpoint sirf freeze_date + pending row
// count deta hai (sheet.getLastRow() se, koi getValues() poore data par
// nahi) - admin status aur "abhi freeze nahi hua" gate check ab isi se hote
// hain, poori list sirf tabhi fetch hoti hai jab freeze ho chuka ho AND
// report ki asli list/summary dikhani ho.
function getFreezeStatus_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = getPendingSheet_(ss);
  const freezeDate = getMetaValue_(ss, "FREEZE_DATE");
  const pendingCount = sheet ? Math.max(0, sheet.getLastRow() - 1) : 0;
  return { status: "success", freeze_date: freezeDate || "", pending_count: pendingCount };
}

function getPendingSummary_(dc) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = getPendingSheet_(ss);
  const freezeDate = getMetaValue_(ss, "FREEZE_DATE");
  if (!sheet || sheet.getLastRow() < 2) {
    return { status: "success", data: [], freeze_date: freezeDate || "" };
  }
  const lastRow = sheet.getLastRow();
  let values = sheet.getRange(2, 1, lastRow - 1, OMVIG_PENDING_HEADERS.length).getValues();
  values = formatDateCells_(values, [4]);
  if (dc) {
    const dcNorm = String(dc).trim().toUpperCase();
    values = values.filter(function (row) { return String(row[2] || "").trim().toUpperCase() === dcNorm; });
  }
  return { status: "success", data: values, freeze_date: freezeDate || "" };
}

// dc diya ho to sirf us DC ka "PAID - {DC}" tab padhta hai (fast). Nahi diya
// (Division/Circle scope) to sabhi "PAID - *" tabs (UNMATCHED chhodkar)
// combine karke deta hai.
function getPaidSummary_(dc) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (dc) {
    const sheet = ss.getSheetByName(OMVIG_PAID_PREFIX + dc);
    if (!sheet || sheet.getLastRow() < 2) return { status: "success", data: [] };
    const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, OMVIG_PAID_HEADERS.length).getValues();
    return { status: "success", data: formatDateCells_(values, [4]) };
  }

  const allSheets = ss.getSheets();
  let combined = [];
  allSheets.forEach(function (sheet) {
    const name = sheet.getName();
    if (name.indexOf(OMVIG_PAID_PREFIX) !== 0 || name === OMVIG_PAID_UNMATCHED_SHEET) return;
    if (sheet.getLastRow() < 2) return;
    const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, OMVIG_PAID_HEADERS.length).getValues();
    combined = combined.concat(formatDateCells_(values, [4]));
  });
  return { status: "success", data: combined };
}

function getDcList_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = getPendingSheet_(ss);
  if (!sheet || sheet.getLastRow() < 2) return { status: "success", dcs: [] };
  const values = sheet.getRange(2, 3, sheet.getLastRow() - 1, 1).getValues();
  const set = new Set();
  values.forEach(function (row) { if (row[0]) set.add(String(row[0]).trim()); });
  return { status: "success", dcs: Array.from(set).sort() };
}

function jsonResponse_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
