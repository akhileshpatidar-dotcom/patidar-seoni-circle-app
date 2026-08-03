// =====================================================================
// VR Calculation - PDF Download Log
// Sheet: https://docs.google.com/spreadsheets/d/1CoAYmRQZcwGvCb1j2-XGWyf8Pfefwz4Ti9dLb1EvpG0/edit
//
// SETUP STEPS (ek baar karna hai):
// 1) Upar wali Google Sheet kholo.
// 2) Extensions > Apps Script.
// 3) Jo default "Code.gs" khula hai usme sab kuch delete karke yeh poora file paste kar do.
// 4) Upar "Deploy" > "New deployment" > gear icon > "Web app" chuno.
//    - Execute as: Me
//    - Who has access: Anyone
// 5) "Deploy" dabao, Google account authorize karo (permission maango to allow karo).
// 6) Jo URL milega (".../exec" par khatam hoga), wahi mujhe wapas bhej do -
//    us URL ko app.js ke "vrDownloadLogScriptUrl" me daal dena hai.
// =====================================================================

var SHEET_ID = "1CoAYmRQZcwGvCb1j2-XGWyf8Pfefwz4Ti9dLb1EvpG0";
var SHEET_NAME = "VR_Downloads";

function doGet(e) {
  var action = (e.parameter.action || "").toString();
  if (action === "getSummary") {
    return jsonOutput(getAllRows());
  }
  return jsonOutput({ status: "error", message: "Unknown action" });
}

function doPost(e) {
  try {
    var division = (e.parameter.division || "").toString().trim();
    var dc = (e.parameter.dc || "").toString().trim();
    var dateStr = (e.parameter.date || "").toString().trim();
    var timestamp = (e.parameter.timestamp || "").toString().trim();
    if (!dc) return jsonOutput({ status: "error", message: "DC missing" });
    var sheet = getSheet();
    sheet.appendRow([new Date(), division, dc, dateStr, timestamp]);
    return jsonOutput({ status: "ok" });
  } catch (err) {
    return jsonOutput({ status: "error", message: String(err) });
  }
}

function getSheet() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(["Logged At", "Division", "DC", "Date", "Client Timestamp"]);
  }
  return sheet;
}

function getAllRows() {
  var sheet = getSheet();
  var values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  var headers = values.shift();
  return values
    .filter(function (row) { return row.join("").trim() !== ""; })
    .map(function (row) {
      var obj = {};
      headers.forEach(function (h, i) {
        var v = row[i];
        if (v instanceof Date) {
          v = Utilities.formatDate(v, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
        }
        obj[h] = v;
      });
      return obj;
    });
}

function jsonOutput(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
