/**
 * =====================================================================
 * SEONI CIRCLE APP - UNIFIED MASTER API ADAPTER (api.js)
 * Master Backend Version: 5.0 (Unified Master)
 * Developer: Akhilesh Patidar (AE)
 * =====================================================================
 */

const MASTER_API_CONFIG = {
  ENDPOINT_URL: "https://script.google.com/macros/s/AKfycbzaimPwzUYELgmujpaBbfByy0BcjOERA8e0mslNdbH5uUw2L6L24785obmdcpcDOc53Ww/exec",
  SPREADSHEET_ID_MASTER: "1y0oYJYI5xpmylo9rVaMr3813PtEv1IMzKcwkwYvd3zE",
  VERSION: 5.0
};

const MasterAPI = {
  /**
   * Generic GET Request Helper
   */
  async get(action, params = {}) {
    try {
      const url = new URL(MASTER_API_CONFIG.ENDPOINT_URL);
      url.searchParams.append("action", action);
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          url.searchParams.append(key, params[key]);
        }
      });

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: { "Accept": "application/json" }
      });
      return await response.json();
    } catch (err) {
      console.error(`[MasterAPI GET Error] ${action}:`, err);
      return { status: "error", message: err.message || "Network Error" };
    }
  },

  /**
   * Generic POST Request Helper
   */
  async post(action, payload = {}) {
    try {
      const bodyData = { action, ...payload };
      const response = await fetch(MASTER_API_CONFIG.ENDPOINT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(bodyData)
      });
      return await response.json();
    } catch (err) {
      console.error(`[MasterAPI POST Error] ${action}:`, err);
      return { status: "error", message: err.message || "Network Error" };
    }
  },

  // 1. SECURE ENGINES (Tariff Calculations & VR)
  async calculateBill(data) {
    return this.post("calculateBillEstimate", data);
  },

  async calculateVR(data) {
    return this.post("calculateVR", data);
  },

  async getVrReferenceData() {
    return this.get("getVrReferenceData");
  },

  // 2. OCR / GEMINI VISION (Table Scanner)
  async scanTableImage(imageBase64) {
    return this.post("scanTableImage", { image_base64: imageBase64 });
  },

  // 3. STAFF AUTHENTICATION & MESSAGING
  async staffRegister(staffData) {
    return this.post("staffRegister", staffData);
  },

  async staffLogin(loginId, password, deviceId) {
    return this.post("staffLogin", { login_id: loginId, password: password, device_id: deviceId });
  },

  async staffValidateSession(sessionToken, deviceId) {
    return this.get("staffValidateSession", { session_token: sessionToken, device_id: deviceId });
  },

  async staffChangePin(sessionToken, deviceId, newPin) {
    return this.post("staffChangePin", { session_token: sessionToken, device_id: deviceId, new_pin: newPin });
  },

  async staffLogMessage(sessionToken, deviceId, logData) {
    return this.post("staffLogMessage", { session_token: sessionToken, device_id: deviceId, ...logData });
  },

  async staffAdminSearch(mobileNo, adminPassword) {
    return this.post("staffAdminSearch", { mobile_no: mobileNo, admin_password: adminPassword });
  },

  async staffAdminAction(mobileNo, adminAction, adminPassword) {
    return this.post("staffAdminAction", { mobile_no: mobileNo, admin_action: adminAction, admin_password: adminPassword });
  },

  // 4. REVENUE MODULE
  async submitRevenuePayment(paymentData) {
    return this.post("submitRevenuePayment", paymentData);
  },

  async submitLineTd(tdData) {
    return this.post("submitTD", tdData);
  },

  async uploadPaidMaster(dcName, entriesJson, adminPassword) {
    return this.post("uploadPaidMaster", {
      dc_name: dcName,
      entries_json: entriesJson,
      admin_password: adminPassword
    });
  },

  async getLiveRevenueDailySummary(date, dcName = "") {
    return this.get("getLiveRevenueDailySummary", { date: date, dc_name: dcName });
  },

  async getRevenueReconciliation(periodMode, periodValue, dcNames = "") {
    return this.get("getRevenueCategoryReconciliation", {
      period_mode: periodMode,
      period_value: periodValue,
      dc_names: dcNames
    });
  },

  async checkPaidStatus(ivrsNo, dcName = "") {
    return this.get("checkPaid", { ivrs_no: ivrsNo, dc_name: dcName });
  },

  async checkLineTdStatus(ivrsNo, dcName = "") {
    return this.get("checkTD", { ivrs_no: ivrsNo, dc_name: dcName });
  },

  // 5. MOBILE UPDATE MODULE
  async submitMobileUpdate(mobileData) {
    return this.post("submitMobileUpdate", mobileData);
  },

  async getMobileSummary(dcName = "") {
    return this.get("getMobileSummary", { dc: dcName });
  },

  async getMobileProgressAggregate(mode = "DAILY") {
    return this.get("getProgressAggregate", { mode: mode, module: "mobile" });
  },

  // 6. O&M / VIGILANCE MODULE
  async getOmvigPendingSummary(dcName = "") {
    return this.get("getOmvigPendingSummary", { dc: dcName });
  },

  async getOmvigPaidSummary(dcName = "") {
    return this.get("getOmvigPaidSummary", { dc: dcName });
  },

  async uploadOmvigPaidList(rows, adminPassword) {
    return this.post("uploadPaidList", { rows: rows, admin_password: adminPassword });
  },

  async setOmvigFreezeDate(freezeDate) {
    return this.post("setFreezeDateOnce", { freeze_date: freezeDate });
  },

  // 7. SUBSTATION & TECHNICAL MODULES
  async submitShms(entries) {
    return this.post("submitShms", { entries_json: entries });
  },

  async getShmsSummary() {
    return this.get("getShmsSummary", { module: "shms" });
  },

  async submitStmComplaint(complaintData) {
    return this.post("submitStmComplaint", complaintData);
  },

  async getStmSummary() {
    return this.get("getStmSummary", { module: "stm" });
  },

  async submitStock(stockData) {
    return this.post("submitStock", stockData);
  },

  async getMasterStock() {
    return this.get("getMasterStock");
  },

  async submitFeederReading(entries) {
    return this.post("submitFeederReading", { entries_json: entries });
  },

  async getFeederSummary() {
    return this.get("getFeederSummary", { module: "feeder" });
  },

  async submitPeakLoad(entries) {
    return this.post("submitPeakLoad", { entries_json: entries });
  },

  async getPeakLoadSummary() {
    return this.get("getPeakLoadSummary", { module: "peakload" });
  },

  async submitVehicleReading(vehicleData) {
    return this.post("submitVehicleReading", vehicleData);
  },

  async getVehicleLatestReadings() {
    return this.get("getVehicleLatestReadings");
  },

  async submitMeterChecking(meterData) {
    return this.post("submitMeterChecking", meterData);
  },

  async submitVrDownloadLog(logData) {
    return this.post("submitVrDownloadLog", logData);
  },

  async saveFreezeSnapshot(snapshotData) {
    return this.post("saveFreezeSnapshot", snapshotData);
  },

  async listFreezes() {
    return this.get("listFreezes");
  },

  // 8. EXTERNAL DYNAMIC TOOLS (HTML STORAGE)
  async uploadExternalToolHtml(toolKey, fileName, htmlContent) {
    return this.post("uploadExternalToolHtml", {
      tool_key: toolKey,
      file_name: fileName,
      html: htmlContent
    });
  },

  async getExternalToolHtml(toolKey) {
    return this.get("getExternalToolHtml", { tool_key: toolKey });
  }
};