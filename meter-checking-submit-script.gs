// =====================================================================
// Meter Checking - submit backend (Seoni Circle App)
// Standalone script (deployed separately, apna alag Web App URL) - Revenue ke
// bade revenue-submit-script-dc-wise.gs ko touch nahi kiya, taaki us existing
// backend ko koi risk na ho.
//
// FORWARD-COMPATIBLE DESIGN (user requirement): Spreadsheet ID FIXED rakha hai
// - future me jab kisi aur DC me yeh "Meter Checking" feature add hoga, sirf
// dc_name payload me badal jayega aur wahi DC ka apna naya tab
// ("Script Meter Checking <DC NAME>") automatically ban/use ho jayega - Web
// App URL (deployment) sabhi DC ke liye SAME rahega, dobara deploy nahi karna
// padega.
// =====================================================================

const METER_CHECKING_SPREADSHEET_ID = "1LtBrMNlTtX89pTBK8IZWL4ILLYu3WvjQ532JpInps0s";

const METER_CHECKING_HEADERS = [
  "IVRS NO", "METER NO", "CONSUMER NAME", "FATHER NAME", "MOBILE NO", "TARIFF CODE", "LOAD",
  "STAFF NAME", "POLE NUMBER", "PHASE CURRENT", "NEUTRAL CURRENT", "REMARK", "PHOTO 1", "PHOTO 2", "PHOTO 3", "DATE", "TIME"
];

function doPost(e) {
  try {
    const data = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    const action = data.action || "submitMeterChecking";
    if (action === "submitMeterChecking") return meterCheckingJsonOut_(submitMeterChecking_(data));
    return meterCheckingJsonOut_({ status: "error", message: "Unknown action: " + action });
  } catch (err) {
    return meterCheckingJsonOut_({ status: "error", message: "Server error: " + String(err) });
  }
}

function meterCheckingJsonOut_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function meterCheckingClean_(v) {
  return String(v == null ? "" : v).trim();
}

function getMeterCheckingSheetName_(dcName) {
  return "Script Meter Checking " + dcName;
}

// Sheet pehli baar use hone par (jis DC ka tab abhi tak nahi bana) khud ban
// jaata hai, header row ke saath - taaki future me naya DC add karne par bhi
// sirf dc_name change karna kaafi ho, koi manual sheet-setup na karna pade.
function getOrCreateMeterCheckingSheet_(dcName) {
  const ss = SpreadsheetApp.openById(METER_CHECKING_SPREADSHEET_ID);
  const sheetName = getMeterCheckingSheetName_(dcName);
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    const headerRange = sheet.getRange(1, 1, 1, METER_CHECKING_HEADERS.length);
    headerRange.setValues([METER_CHECKING_HEADERS]);
    headerRange.setFontWeight("bold").setBackground("#fef9c3").setHorizontalAlignment("center").setVerticalAlignment("middle");
    sheet.setFrozenRows(1);
  } else {
    ensureMeterCheckingHeaders_(sheet);
  }
  return sheet;
}

// USER REQUEST (2026-09-11): "POLE NUMBER" aur "NEUTRAL CURRENT" naye columns
// add kiye - lekin DC ke sheet tabs pehle se ban chuke hain (purane 15-column
// header ke saath, kai rows data ke saath). Sirf header row me naam likh dena
// kaafi nahi hai (data columns match nahi karenge) - isliye jis DC ke sheet me
// yeh naye headers abhi tak nahi hain, wahan sahi jagah par (STAFF NAME ke
// baad POLE NUMBER, PHASE CURRENT ke baad NEUTRAL CURRENT) ek NAYA BLANK
// COLUMN insert karte hain (insertColumnAfter) - isse saari purani rows ka
// data apne aap sahi column me shift ho jaata hai, koi purana data corrupt
// nahi hota. Naye DC/sheet ke liye yeh function kabhi trigger hi nahi hota
// (upar wale "if (!sheet)" branch me hi sahi header order se ban jaata hai).
function ensureMeterCheckingHeaders_(sheet) {
  let headers = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0]
    .map(function(h) { return meterCheckingClean_(h).toUpperCase(); });

  if (headers.indexOf("POLE NUMBER") === -1) {
    const staffIdx = headers.indexOf("STAFF NAME"); // 0-based
    const insertAfterCol = staffIdx > -1 ? staffIdx + 1 : headers.length; // 1-based
    sheet.insertColumnAfter(insertAfterCol);
    sheet.getRange(1, insertAfterCol + 1).setValue("POLE NUMBER");
    headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
      .map(function(h) { return meterCheckingClean_(h).toUpperCase(); });
  }

  if (headers.indexOf("NEUTRAL CURRENT") === -1) {
    const phaseIdx = headers.indexOf("PHASE CURRENT"); // 0-based
    const insertAfterCol = phaseIdx > -1 ? phaseIdx + 1 : headers.length; // 1-based
    sheet.insertColumnAfter(insertAfterCol);
    sheet.getRange(1, insertAfterCol + 1).setValue("NEUTRAL CURRENT");
  }

  const headerRange = sheet.getRange(1, 1, 1, sheet.getLastColumn());
  headerRange.setFontWeight("bold").setBackground("#fef9c3").setHorizontalAlignment("center").setVerticalAlignment("middle");
}

// STM Complaint script (savePhotoIfProvided_) jaisa hi pattern - base64 ko
// Drive par ek photo file me save karke uska shareable link deta hai. Teeno
// photo optional hain, khaali base64 par "" return hota hai (column blank
// rahega, koi error nahi).
function saveMeterCheckingPhoto_(base64, fileName, mimeType) {
  const clean = meterCheckingClean_(base64);
  if (!clean) return "";
  const pureBase64 = clean.indexOf(",") > -1 ? clean.split(",")[1] : clean;
  const bytes = Utilities.base64Decode(pureBase64);
  const blob = Utilities.newBlob(bytes, mimeType || "image/jpeg", fileName || ("meter-checking-" + Date.now() + ".jpg"));
  const file = DriveApp.createFile(blob);
  try {
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (_) {}
  return file.getUrl();
}

// USER REQUEST (2026-09-11): agar isi IVRS No ka meter check pehle (kabhi
// bhi, kisi bhi date par) is DC ke sheet me already submit ho chuka hai, to
// dobara submit block karke "Already Submitted" bata diya jaaye - taaki ek
// hi consumer ka meter baar-baar (galti se) check/submit na ho jaaye.
function isMeterCheckingAlreadySubmitted_(sheet, ivrsNo) {
  const targetIvrs = meterCheckingClean_(ivrsNo);
  if (!targetIvrs) return false;
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return false;
  const ivrsColValues = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  return ivrsColValues.some(function(row) { return meterCheckingClean_(row[0]) === targetIvrs; });
}

function submitMeterChecking_(data) {
  const dcName = meterCheckingClean_(data.dc_name) || "SEONI (T)";
  const sheet = getOrCreateMeterCheckingSheet_(dcName);

  // Lock: agar isi IVRS ke 2 submit (galti se) ek saath (near-simultaneous)
  // aa jayen, to dono ek saath duplicate-check pass karke dono add na ho
  // jayen - lock ke andar hi check + row-add dono karte hain.
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    if (isMeterCheckingAlreadySubmitted_(sheet, data.ivrs_no)) {
      return { status: "error", message: "Already Submitted" };
    }
    return submitMeterCheckingRow_(sheet, data);
  } finally {
    lock.releaseLock();
  }
}

function submitMeterCheckingRow_(sheet, data) {
  const photo1Link = saveMeterCheckingPhoto_(data.photo1_base64, data.photo1_name, data.photo1_mime_type);
  const photo2Link = saveMeterCheckingPhoto_(data.photo2_base64, data.photo2_name, data.photo2_mime_type);
  const photo3Link = saveMeterCheckingPhoto_(data.photo3_base64, data.photo3_name, data.photo3_mime_type);

  const tz = Session.getScriptTimeZone() || "Asia/Kolkata";
  const now = new Date();
  const dateText = Utilities.formatDate(now, tz, "dd/MM/yyyy");
  const timeText = Utilities.formatDate(now, tz, "HH:mm:ss");

  const row = [
    meterCheckingClean_(data.ivrs_no),
    meterCheckingClean_(data.meter_no),
    meterCheckingClean_(data.consumer_name),
    meterCheckingClean_(data.father_name),
    meterCheckingClean_(data.mobile_no),
    meterCheckingClean_(data.tariff_code),
    meterCheckingClean_(data.load),
    meterCheckingClean_(data.staff_name),
    meterCheckingClean_(data.pole_number),
    meterCheckingClean_(data.phase_current),
    meterCheckingClean_(data.neutral_current),
    meterCheckingClean_(data.remark),
    photo1Link,
    photo2Link,
    photo3Link,
    dateText,
    timeText
  ];

  const rowIndex = sheet.getLastRow() + 1;
  // USER REQUEST + isi project me pehle se known bug (PAID/TD sheets me date
  // locale-corruption): DATE/TIME columns ko values likhne SE PEHLE plain-text
  // ("@") number-format kar dete hain, taaki Google Sheets locale ke hisaab se
  // DD/MM ko galti se MM/DD na samajh le.
  const dateColIndex = METER_CHECKING_HEADERS.indexOf("DATE") + 1;
  const timeColIndex = METER_CHECKING_HEADERS.indexOf("TIME") + 1;
  sheet.getRange(rowIndex, dateColIndex).setNumberFormat("@");
  sheet.getRange(rowIndex, timeColIndex).setNumberFormat("@");
  sheet.getRange(rowIndex, 1, 1, row.length).setValues([row]);

  return { status: "success", message: "Meter Checking data submit ho gaya" };
}
