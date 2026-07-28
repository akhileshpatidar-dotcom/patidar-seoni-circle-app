const TARGET_SHEET_NAME = "STM COMPLAINT SCRIPT";
const TEST_RECEIVER_EMAIL = "eestmseoni@yahoo.com, ae.chhapara@gmail.com";

function doPost(e) {
  try {
    const data = getRequestData_(e);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) {
      throw new Error("Spreadsheet open nahi ho rahi");
    }

    const sheet = getOrCreateTargetSheet_(ss, TARGET_SHEET_NAME);
    const headers = getHeaders_();
    setupSheetLayout_(sheet, headers);

    const now = new Date();
    const submitDate = Utilities.formatDate(now, Session.getScriptTimeZone() || "Asia/Kolkata", "dd/MM/yyyy");
    const submitTime = Utilities.formatDate(now, Session.getScriptTimeZone() || "Asia/Kolkata", "HH:mm");

    const substation = clean_(data.substation);
    const operatorName = clean_(data.operator_name);
    const mobileNo = clean_(data.mobile_no);
    const sharedAt = clean_(data.information_shared_at);
    const complaintDate = clean_(data.date);
    const complaintTime = clean_(data.time);
    const callingInfo = clean_(data.calling_info);
    const complaintDetails = clean_(data.complaint_details);

    if (!substation) throw new Error("Substation missing hai");
    if (!operatorName) throw new Error("Operator name missing hai");
    if (!mobileNo) throw new Error("Mobile no missing hai");
    if (!sharedAt) throw new Error("Information Shared At missing hai");
    if (!complaintDate) throw new Error("Date missing hai");
    if (!complaintTime) throw new Error("Time missing hai");
    if (sharedAt === "CALLING" && !callingInfo) throw new Error("Calling details missing hai");
    if (!complaintDetails) throw new Error("Complaint details missing hai");

    const photoResult = savePhotoIfProvided_(data);
    const photoLink = photoResult.link || "";

    const row = [[
      substation,
      operatorName,
      mobileNo,
      sharedAt,
      complaintDate,
      complaintTime,
      callingInfo,
      complaintDetails,
      photoLink,
      submitDate,
      submitTime
    ]];

    const startRow = Math.max(sheet.getLastRow() + 1, 2);
    const range = sheet.getRange(startRow, 1, 1, headers.length);
    range.setValues(row);
    range.setHorizontalAlignment("center");
    range.setVerticalAlignment("middle");
    range.setBorder(true, true, true, true, true, true);

    sendComplaintMail_({
      substation: substation,
      operatorName: operatorName,
      mobileNo: mobileNo,
      sharedAt: sharedAt,
      complaintDate: complaintDate,
      complaintTime: complaintTime,
      callingInfo: callingInfo,
      complaintDetails: complaintDetails,
      submitDate: submitDate,
      submitTime: submitTime,
      photoBlob: photoResult.blob || null
    });

    return jsonResponse_({
      status: "success",
      message: "STM complaint submit ho gayi"
    });
  } catch (error) {
    return jsonResponse_({
      status: "error",
      message: error && error.message ? error.message : "unknown error"
    });
  }
}

function doGet() {
  return jsonResponse_({
    status: "success",
    message: "STM Complaint Script Live Hai"
  });
}

function getRequestData_(e) {
  if (!e) throw new Error("Request missing hai");

  if (e.postData && e.postData.contents) {
    const type = String(e.postData.type || "").toLowerCase();
    if (type.indexOf("application/json") > -1) {
      return JSON.parse(e.postData.contents);
    }
  }

  const p = e.parameter || {};
  return {
    substation: p.substation || "",
    operator_name: p.operator_name || "",
    mobile_no: p.mobile_no || "",
    information_shared_at: p.information_shared_at || "",
    date: p.date || "",
    time: p.time || "",
    calling_info: p.calling_info || "",
    complaint_details: p.complaint_details || "",
    photo_base64: p.photo_base64 || "",
    photo_name: p.photo_name || "",
    photo_mime_type: p.photo_mime_type || ""
  };
}

function getOrCreateTargetSheet_(ss, sheetName) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  return sheet;
}

function getHeaders_() {
  return [
    "33/11 Kv Substation",
    "Name of Operator",
    "Mobile no",
    "Information Shared At",
    "Date",
    "Time",
    "Call ke Madhyam Se Kise Jankari Di Gayi",
    "Complaint Details",
    "Photo link",
    "Submit Date",
    "Time"
  ];
}

function setupSheetLayout_(sheet, headers) {
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  const currentHeaders = headerRange.getValues()[0];

  const mismatch = headers.some(function(header, index) {
    return String(currentHeaders[index] || "").trim() !== header;
  });

  if (sheet.getLastRow() === 0 || mismatch) {
    headerRange.setValues([headers]);
  }

  headerRange
    .setFontWeight("bold")
    .setBackground("#8b5e34")
    .setFontColor("#ffffff")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle")
    .setBorder(true, true, true, true, true, true);

  sheet.setFrozenRows(1);

  const filter = sheet.getFilter();
  if (!filter) {
    sheet.getRange(1, 1, Math.max(sheet.getLastRow(), 1), headers.length).createFilter();
  }
}

function savePhotoIfProvided_(data) {
  const base64 = clean_(data.photo_base64);
  const fileName = clean_(data.photo_name) || ("stm-photo-" + Date.now() + ".jpg");
  const mimeType = clean_(data.photo_mime_type) || "image/jpeg";

  if (!base64) {
    return { link: "", blob: null };
  }

  const pureBase64 = base64.indexOf(",") > -1 ? base64.split(",")[1] : base64;
  const bytes = Utilities.base64Decode(pureBase64);
  const blob = Utilities.newBlob(bytes, mimeType, fileName);
  const file = DriveApp.createFile(blob);

  return {
    link: file.getUrl(),
    blob: blob
  };
}

// =====================================================================
// PROFESSIONAL EMAIL FORMAT
// Fields bilkul same hain (substation, operator, mobile, source, date/time,
// complaint details, photo) - sirf layout professional bana diya hai:
// header band + status tag + clean details table + highlighted complaint
// box + photo-attached note + submit footer. Plain-text fallback (bodyLines)
// bhi rakha hai taaki jo mail client HTML na dikhaye usme bhi sahi padhega.
// =====================================================================
function sendComplaintMail_(payload) {
  const subject = "Complaint Regarding Malfunction of Equipment at " + payload.substation + " SUBSTATION";
  const sharedAtLabel = escapeHtml_(payload.sharedAt === "CALLING" ? "Call (" + (payload.callingInfo || "-") + ")" : payload.sharedAt);
  const reportedAt = escapeHtml_(payload.complaintDate) + ", " + escapeHtml_(payload.complaintTime);
  const submittedAt = escapeHtml_(payload.submitDate) + ", " + escapeHtml_(payload.submitTime);
  const hasPhoto = !!payload.photoBlob;

  const bodyLines = [
    "आदरणीय सर नमस्कार,",
    "",
    "उप संभाग छपारा के 33/11 के substation " + payload.substation + " में तकनीकी समस्या आई है, जिसकी सूचना सब स्टेशन के ऑपरेटर द्वारा दी गई है। कृपया अनुरोध है, कि इस तकनीकी समस्या का जल्द निराकरण करने का कष्ट करे, ताकि उपभोक्ताओं को सुचारू रूप से विद्युत सप्लाई प्रदाय की जा सके।",
    "",
    "जानकारी निम्नानुसार है -",
    "",
    "33/11 Kv Substation: " + payload.substation,
    "Name of Operator: " + payload.operatorName,
    "Mobile no: " + payload.mobileNo,
    "Information Shared At: " + payload.sharedAt,
    "Date: " + payload.complaintDate,
    "Time: " + payload.complaintTime,
    "Call ke Madhyam Se Kise Jankari Di Gayi: " + (payload.callingInfo || "-"),
    "Complaint Details: " + payload.complaintDetails,
    "Submit Date: " + payload.submitDate,
    "Submit Time: " + payload.submitTime
  ];

  const htmlBody = `
    <div style="font-family: Arial, Helvetica, sans-serif; max-width: 560px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden;">
      <div style="background: #b91c1c; color: #ffffff; padding: 16px 20px;">
        <div style="font-size: 11px; font-weight: bold; letter-spacing: 0.06em; opacity: 0.9; text-transform: uppercase;">Substation Maintenance Complaint</div>
        <div style="font-size: 18px; font-weight: bold; margin-top: 4px;">33/11 KV Substation - ${escapeHtml_(payload.substation)}</div>
      </div>

      <div style="padding: 14px 20px 0;">
        <span style="display: inline-block; background: #fee2e2; color: #991b1b; font-size: 11px; font-weight: bold; padding: 4px 12px; border-radius: 6px;">Equipment malfunction</span>
      </div>

      <div style="padding: 16px 20px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #0f172a;">
          <tr>
            <td style="padding: 6px 0; color: #64748b; width: 42%;">Substation</td>
            <td style="padding: 6px 0; text-align: right; font-weight: bold;">${escapeHtml_(payload.substation)} (33/11 KV)</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Operator</td>
            <td style="padding: 6px 0; text-align: right; font-weight: bold;">${escapeHtml_(payload.operatorName)}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Mobile</td>
            <td style="padding: 6px 0; text-align: right; font-weight: bold;">${escapeHtml_(payload.mobileNo)}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Reported via</td>
            <td style="padding: 6px 0; text-align: right; font-weight: bold;">${sharedAtLabel}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Reported at</td>
            <td style="padding: 6px 0; text-align: right; font-weight: bold;">${reportedAt}</td>
          </tr>
        </table>

        <div style="border-top: 1px solid #e2e8f0; margin-top: 12px; padding-top: 12px;">
          <div style="font-size: 11px; color: #64748b; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.03em;">Complaint details</div>
          <div style="font-size: 14px; line-height: 1.6; color: #0f172a; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px;">${escapeHtml_(payload.complaintDetails)}</div>
        </div>

        ${hasPhoto ? `
        <div style="margin-top: 12px; display: flex; align-items: center; font-size: 12px; color: #475569;">
          📎 Photo attached
        </div>` : ""}

        <div style="margin-top: 18px; padding: 14px; background: #fff7ed; border: 1px solid #fdba74; border-radius: 8px; font-size: 13px; color: #7c2d12; line-height: 1.6;">
          आदरणीय सर नमस्कार, उप संभाग छपारा के इस substation में तकनीकी समस्या आई है, जिसकी सूचना सब स्टेशन के ऑपरेटर द्वारा दी गई है। कृपया अनुरोध है, कि इस तकनीकी समस्या का जल्द निराकरण करने का कष्ट करे, ताकि उपभोक्ताओं को सुचारू रूप से विद्युत सप्लाई प्रदाय की जा सके।
        </div>
      </div>

      <div style="background: #f8fafc; padding: 10px 20px; display: flex; justify-content: space-between; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
        <span>Submitted ${submittedAt}</span>
        <span>Seoni Circle App</span>
      </div>
    </div>
  `;

  const mailOptions = {
    name: "STM Complaint System",
    htmlBody: htmlBody
  };

  if (payload.photoBlob) {
    mailOptions.attachments = [payload.photoBlob];
  }

  GmailApp.sendEmail(
    TEST_RECEIVER_EMAIL,
    subject,
    bodyLines.join("\n"),
    mailOptions
  );
}

function escapeHtml_(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function clean_(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function jsonResponse_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
