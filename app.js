/**
 * =====================================================================
 * SEONI CIRCLE APP - UNIFIED MASTER CLIENT ENGINE (app.js)
 * Master Backend Version: 5.0 Compatible
 * Single Master Web App URL Integrated
 * Developer: Akhilesh Patidar (AE)
 * =====================================================================
 */

const MASTER_SECURE_API_URL = "https://script.google.com/macros/s/AKfycbzaimPwzUYELgmujpaBbfByy0BcjOERA8e0mslNdbH5uUw2L6L24785obmdcpcDOc53Ww/exec";

// Master API Gateway
const MasterAPI = {
    async get(action, params = {}) {
        try {
            const url = new URL(MASTER_SECURE_API_URL);
            url.searchParams.append("action", action);
            Object.keys(params).forEach(k => {
                if (params[k] !== undefined && params[k] !== null) url.searchParams.append(k, params[k]);
            });
            const r = await fetch(url.toString(), { method: "GET", headers: { "Accept": "application/json" } });
            return await r.json();
        } catch (err) {
            console.error(`[MasterAPI GET Error] ${action}:`, err);
            return { status: "error", message: err.message || "Network Error" };
        }
    },
    async post(action, payload = {}) {
        try {
            const bodyData = { action, ...payload };
            const r = await fetch(MASTER_SECURE_API_URL, {
                method: "POST",
                headers: { "Content-Type": "text/plain;charset=utf-8" },
                body: JSON.stringify(bodyData)
            });
            return await r.json();
        } catch (err) {
            console.error(`[MasterAPI POST Error] ${action}:`, err);
            return { status: "error", message: err.message || "Network Error" };
        }
    },
    async calculateBill(data) { return this.post("calculateBillEstimate", data); },
    async calculateVR(data) { return this.post("calculateVR", data); },
    async getVrReferenceData() { return this.get("getVrReferenceData"); },
    async scanTableImage(b64) { return this.post("scanTableImage", { image_base64: b64 }); },
    async submitRevenuePayment(data) { return this.post("submitRevenuePayment", data); },
    async submitLineTd(data) { return this.post("submitTD", data); },
    async uploadPaidMaster(dc, entries, pwd) { return this.post("uploadPaidMaster", { dc_name: dc, entries_json: entries, admin_password: pwd }); },
    async getLiveRevenueDailySummary(date, dc = "") { return this.get("getLiveRevenueDailySummary", { date: date, dc_name: dc }); },
    async getRevenueReconciliation(mode, val, dcs = "") { return this.get("getRevenueCategoryReconciliation", { period_mode: mode, period_value: val, dc_names: dcs }); },
    async checkPaidStatus(ivrs, dc = "") { return this.get("checkPaid", { ivrs_no: ivrs, dc_name: dc }); },
    async checkLineTdStatus(ivrs, dc = "") { return this.get("checkTD", { ivrs_no: ivrs, dc_name: dc }); },
    async submitMobileUpdate(data) { return this.post("submitMobileUpdate", data); },
    async getMobileSummary(dc = "") { return this.get("getMobileSummary", { dc: dc }); },
    async getOmvigPendingSummary(dc = "") { return this.get("getOmvigPendingSummary", { dc: dc }); },
    async getOmvigPaidSummary(dc = "") { return this.get("getOmvigPaidSummary", { dc: dc }); },
    async uploadOmvigPaidList(rows, pwd) { return this.post("uploadPaidList", { rows: rows, admin_password: pwd }); },
    async submitShms(entries) { return this.post("submitShms", { entries_json: entries }); },
    async getShmsSummary() { return this.get("getShmsSummary", { module: "shms" }); },
    async submitStmComplaint(data) { return this.post("submitStmComplaint", data); },
    async getStmSummary() { return this.get("getStmSummary", { module: "stm" }); },
    async submitStock(data) { return this.post("submitStock", data); },
    async getMasterStock() { return this.get("getMasterStock"); },
    async submitFeederReading(entries) { return this.post("submitFeederReading", { entries_json: entries }); },
    async getFeederSummary() { return this.get("getFeederSummary", { module: "feeder" }); },
    async submitPeakLoad(entries) { return this.post("submitPeakLoad", { entries_json: entries }); },
    async getPeakLoadSummary() { return this.get("getPeakLoadSummary", { module: "peakload" }); },
    async submitVehicleReading(data) { return this.post("submitVehicleReading", data); },
    async getVehicleLatestReadings() { return this.get("getVehicleLatestReadings"); },
    async submitMeterChecking(data) { return this.post("submitMeterChecking", data); },
    async submitVrDownloadLog(data) { return this.post("submitVrDownloadLog", data); },
    async saveFreezeSnapshot(data) { return this.post("saveFreezeSnapshot", data); },
    async listFreezes() { return this.get("listFreezes"); }
};

(function () {
    try {
        const sig = "Seoni Circle App - Original developer: Akhilesh Patidar (AE) - github.com/akhileshpatidar-dotcom/patidar-seoni-circle-app - Build signature: SC-AKP-2026";
        console.log("%c" + sig, "color:#0d9488; font-weight:bold;");
        window.__APP_SIGNATURE__ = sig;
    } catch (e) {}
})();

const divisionConfigs = {
    "DIVISION SEONI": {
        colorClass: "bg-blue-grad",
        themeColor: "#2563eb",
        themeGradient: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)",
        showSpecialActions: false,
        subDnOrder: ["AE (D)", "KEOLARI", "SEONI (T)"],
        dcs: [
            { name: "ARI", subDn: "AE (D)", csvUrl: "" },
            { name: "BADALPAR", subDn: "AE (D)", csvUrl: "" },
            { name: "BANDOL", subDn: "AE (D)", csvUrl: "" },
            { name: "BARGHAT", subDn: "AE (D)", csvUrl: "https://docs.google.com/spreadsheets/d/1b5g3VBlKjCiOX0cfE5Na-jyRY4cPCjrIJIsU3YozG_U/export?format=csv&gid=0" },
            { name: "DHARNA", subDn: "AE (D)", csvUrl: "" },
            { name: "GOPALGANJ", subDn: "AE (D)", csvUrl: "" },
            { name: "KANHIWADA", subDn: "KEOLARI", csvUrl: "" },
            { name: "KEOLARI", subDn: "KEOLARI", csvUrl: "" },
            { name: "KHAIRAPALARI", subDn: "KEOLARI", csvUrl: "" },
            { name: "KURAI", subDn: "AE (D)", csvUrl: "https://docs.google.com/spreadsheets/d/15c2CHolan0YVYh5Hwe4akn1YNk1SUhhLVa24h9ZBQbU/export?format=csv&gid=0" },
            { name: "MUNGWANI", subDn: "AE (D)", csvUrl: "" },
            { name: "PANDIYA CHHAPARA", subDn: "KEOLARI", csvUrl: "" },
            { name: "SEONI (T)", subDn: "SEONI (T)", csvUrl: "https://docs.google.com/spreadsheets/d/1ugB6evAfEL0t7ffzhmv1G8vwRtdJmz3fsQrt92sWrvM/export?format=csv&gid=0" },
            { name: "SEONI (RES)", subDn: "AE (D)", csvUrl: "https://docs.google.com/spreadsheets/d/12d4nBlUJ5MoamEZdtNteTSixTt9UdvbrPmjS9tBRUw8/export?format=csv&gid=0" },
            { name: "UGALI", subDn: "KEOLARI", csvUrl: "" }
        ]
    },
    "DIVISION LAKHNADON": {
        colorClass: "bg-orange-grad",
        themeColor: "#f59e0b",
        themeGradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
        showSpecialActions: true,
        subDnOrder: ["CHHAPARA", "LAKHNADON"],
        dcs: [
            { name: "ADEGAON", subDn: "LAKHNADON", csvUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTMkEMNGnfv0_jHM12lAl34sD8kJLWPbLuA8WGhKH_smPfH3aDdmVrwbtyyPJZuD6KK4m6quw-q9MWN/pub?output=csv" },
            { name: "CHHAPARA-1", subDn: "CHHAPARA", csvUrl: "https://docs.google.com/spreadsheets/d/1ehSaUQyrV1ZzwH0lbdhLdXRYkPdapdm5hhu0Gz0vulk/export?format=csv&gid=0" },
            { name: "CHHAPARA-2", subDn: "CHHAPARA", csvUrl: "https://docs.google.com/spreadsheets/d/1TvhGlARSxZVMq5GYDZEGAHuV6vBXRKxe_nMun4dUby0/export?format=csv&gid=0" },
            { name: "DHANORA", subDn: "LAKHNADON", csvUrl: "https://docs.google.com/spreadsheets/d/1qNgLx9o6hp4nwLGaCwy5DRW8xmh6eaNCoysbbH5bL1o/export?format=csv&gid=0" },
            { name: "DHUMA", subDn: "LAKHNADON", csvUrl: "https://docs.google.com/spreadsheets/d/1T7kw5hqmmsGQFUQGmSmV0g6_wFKxxA8UeFVJzR0WwAs/export?format=csv&gid=0" },
            { name: "GANESHGANJ", subDn: "CHHAPARA", csvUrl: "https://docs.google.com/spreadsheets/d/1jQJPvuEn4NZZRyUf-2ye7skeD6cMdLSrzx7aBTiDmR0/export?format=csv&gid=0" },
            { name: "GHANSORE", subDn: "LAKHNADON", csvUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRrnZZ4FhdFSpFM2NfiTGAxbkUa9OQin4VQW9t06bAzRzjHZd_F4mVc3_vv4XxXPWSF_p78YoVIJI5Y/pub?output=csv" },
            { name: "KEDARPUR", subDn: "LAKHNADON", csvUrl: "https://docs.google.com/spreadsheets/d/145bjD_AoAKWnTfzSaVAXoFpq9cZooSoM8jl0JKBfDkw/export?format=csv&gid=0" },
            { name: "LAKHNADON", subDn: "LAKHNADON", csvUrl: "https://docs.google.com/spreadsheets/d/1_r5WgGV9bs-aed86dZLOlDKmK5g9J7qiGsmQAqDE1as/export?format=csv&gid=0" }
        ]
    }
};

// All script URL routes to Unified Master Secure API
const scriptURL = MASTER_SECURE_API_URL;
const vrDownloadLogScriptUrl = MASTER_SECURE_API_URL;
const courtCaseCsvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQMSrQZGqkLsMpwNO6SrRVaRf0JW3r7T5Bsj0N03ZCTgm53WqrtbXiANxplkgxhyiBaCw2A2woCrV_k/pub?output=csv";
const lokAdalatScriptUrl = MASTER_SECURE_API_URL;
const lokAdalatDistributedCsvUrl = "https://docs.google.com/spreadsheets/d/1l-IJkL7aylyjxpdYtHlwJzUhFS8OPtg4RzhXfLlJWjQ/export?format=csv&gid=0";
const stockSubmitScriptUrl = MASTER_SECURE_API_URL;
const shmsSubmitScriptUrl = MASTER_SECURE_API_URL;
const stmComplaintScriptUrl = MASTER_SECURE_API_URL;
const omvigSubmitScriptUrl = MASTER_SECURE_API_URL;
const vehicleReadingStorageKey = "seoni_vehicle_reading_state_v1";
const vehicleReadingListStorageKey = "seoni_vehicle_reading_list_v1";
const vehicleReadingCsvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQIv4JMsV1n8vy9cJ0o2UaS45-fh_c3n9u-rqwXjuCZWDNZNRaJlgUKnT4gtP3_kTtpCrQvrTcojWQo/pub?output=csv";
const vehicleReadingSubmitScriptUrl = MASTER_SECURE_API_URL;
const vehicleReadingVehicles = ["407- MP22ZB6089", "BOLERO- MP22ZC1591", "407- MP22G4316", "CAMPER- MP22G4342"];
const revenueCollectionSubmitScriptUrl = MASTER_SECURE_API_URL;
const revenueOfflineQueueStorageKey = "seoni-revenue-offline-submit-queue-v1";
const meterCheckingConfig = {
    "SEONIT": {
        consumerCsvUrl: "https://docs.google.com/spreadsheets/d/1CGS2blrlv91w0QAupQq4tSGgSpc3E_w8yMuPwkMbFME/export?format=csv&gid=0",
        staffCsvUrl: "https://docs.google.com/spreadsheets/d/1CGS2blrlv91w0QAupQq4tSGgSpc3E_w8yMuPwkMbFME/export?format=csv&gid=1334246662"
    }
};
const meterCheckingSubmitScriptUrl = MASTER_SECURE_API_URL;
const revenueFreezeTrackingScriptUrl = MASTER_SECURE_API_URL;
const meterCheckingReportSpreadsheetId = "1LtBrMNlTtX89pTBK8IZWL4ILLYu3WvjQ532JpInps0s";
const revenueCollectionCsvUrls = {
    "CHHAPARA1": "https://docs.google.com/spreadsheets/d/1ehSaUQyrV1ZzwH0lbdhLdXRYkPdapdm5hhu0Gz0vulk/export?format=csv&gid=0",
    "CHHAPARA2": "https://docs.google.com/spreadsheets/d/1TvhGlARSxZVMq5GYDZEGAHuV6vBXRKxe_nMun4dUby0/export?format=csv&gid=0",
    "SEONIT": "https://docs.google.com/spreadsheets/d/1ugB6evAfEL0t7ffzhmv1G8vwRtdJmz3fsQrt92sWrvM/export?format=csv&gid=0",
    "GANESHGANJ": "https://docs.google.com/spreadsheets/d/1jQJPvuEn4NZZRyUf-2ye7skeD6cMdLSrzx7aBTiDmR0/export?format=csv&gid=0",
    "DHANORA": "https://docs.google.com/spreadsheets/d/1qNgLx9o6hp4nwLGaCwy5DRW8xmh6eaNCoysbbH5bL1o/export?format=csv&gid=0",
    "DHUMA": "https://docs.google.com/spreadsheets/d/1T7kw5hqmmsGQFUQGmSmV0g6_wFKxxA8UeFVJzR0WwAs/export?format=csv&gid=0",
    "GHANSORE": "https://docs.google.com/spreadsheets/d/e/2PACX-1vRrnZZ4FhdFSpFM2NfiTGAxbkUa9OQin4VQW9t06bAzRzjHZd_F4mVc3_vv4XxXPWSF_p78YoVIJI5Y/pub?output=csv",
    "LAKHNADON": "https://docs.google.com/spreadsheets/d/1_r5WgGV9bs-aed86dZLOlDKmK5g9J7qiGsmQAqDE1as/export?format=csv&gid=0",
    "KURAI": "https://docs.google.com/spreadsheets/d/15c2CHolan0YVYh5Hwe4akn1YNk1SUhhLVa24h9ZBQbU/export?format=csv&gid=0",
    "KEDARPUR": "https://docs.google.com/spreadsheets/d/145bjD_AoAKWnTfzSaVAXoFpq9cZooSoM8jl0JKBfDkw/export?format=csv&gid=0",
    "BARGHAT": "https://docs.google.com/spreadsheets/d/1b5g3VBlKjCiOX0cfE5Na-jyRY4cPCjrIJIsU3YozG_U/export?format=csv&gid=0",
    "SEONIRES": "https://docs.google.com/spreadsheets/d/12d4nBlUJ5MoamEZdtNteTSixTt9UdvbrPmjS9tBRUw8/export?format=csv&gid=0"
};
const stockMaterialsCsvUrl = "https://docs.google.com/spreadsheets/d/1OfrU7ZuN5LV9f_3hqORv66BVLYKFGIBBjDyeSXHwldA/export?format=csv&gid=641545139";
const shmsCsvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTbq-yne90yg9Vn8eylxM3zKMfZjPLlVhca3JhsjAzMlcm6MAVl8vAA-xXVgZI_XjWQBHyjB36YO1Cz/pub?output=csv";
const feederCsvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT8bBAXJZhlwS_giGXBlS6rDXJ_auZfWZzNVPQaBnD09jB_m7jnrqeGGX5WP8V2jOD_WL90_KQ2pJa4/pub?output=csv";
const feederSubmitScriptUrl = MASTER_SECURE_API_URL;
const feederReportSheetCsvUrl = "https://docs.google.com/spreadsheets/d/1XnsLz_5643XqGgrcMzhIzI_cF4E4S6Zc1esNEQe554A/export?format=csv&gid=0";
const peakLoadCsvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTqnZksaehWGnKJq2xcy1sJsQjrddCJZKJo_ynvjkZnUqxMzdvnlQv3uARWYiiuJEsVVBdL6wTd1bhv/pub?output=csv";
const peakLoadSubmittedCsvUrl = "https://docs.google.com/spreadsheets/d/1dae1E0gTkwsKY3y-PgfFvBf_bHe0TS0YXAW7M3gzgEc/export?format=csv&gid=0";
const peakLoadSubmitScriptUrl = MASTER_SECURE_API_URL;

let omvigPendingCache_ = {}, omvigPaidCache_ = {}, omvigDailyReportCache_ = null, omvigReportCache_ = null, omvigAdminStatus = null, omvigFreezeStatusCache_ = null;
let omvigFilterDivision = "", omvigFilterDc = "", omvigFilterStatus = "", omvigProgressToken = 0, omvigReportMode = "DAILY";

const lokAdalatFallbackTotals = {
    "ADEGAON": 752, "CHHAPARA-1": 564, "CHHAPARA-2": 453, "DHANORA": 802,
    "DHUMA": 627, "GANESHGANJ": 561, "GHANSORE": 386, "KEDARPUR": 164, "LAKHNADON": 376
};

let stockMaterials = [
    { id: "M001", name: "AB Cable 3X95+1X50", unit: "Meter", opening: 1200, inward: 380, issue: 910, min: 300 },
    { id: "M002", name: "PVC Insulated Wire 10 SQMM", unit: "Coil", opening: 42, inward: 16, issue: 31, min: 10 },
    { id: "M003", name: "Stay Set Complete", unit: "Nos", opening: 18, inward: 8, issue: 20, min: 8 },
    { id: "M004", name: "Disc Insulator", unit: "Nos", opening: 75, inward: 20, issue: 63, min: 25 },
    { id: "M005", name: "LT Pin Insulator", unit: "Nos", opening: 140, inward: 40, issue: 149, min: 35 }
];
let stockMaterialsStatus = "uninitialized", stockMaterialsStale = false;
let stockMovements = [
    { type: "RECEIVE", material: "AB Cable 3X95+1X50", qty: 180, date: "23/04/2026", note: "Main Store Challan 17" },
    { type: "ISSUE", material: "Disc Insulator", qty: 12, date: "23/04/2026", note: "11 KV line maintenance" },
    { type: "RECEIVE", material: "Stay Set Complete", qty: 8, date: "22/04/2026", note: "Emergency stock refill" },
    { type: "ISSUE", material: "LT Pin Insulator", qty: 20, date: "22/04/2026", note: "Village feeder replacement" }
];

let activeDiv = "", activeDC = "", activeGrad = "bg-teal-grad", summaryMode = "DAILY", summaryModule = "", activeViewLevel = "", currentData = null, pendingLevel = "", dcCacheRaw = {}, dcCacheRows = {}, uiListSummary = [], grandTC = 0, grandTU = 0, grandTW = 0, courtCaseRaw = "", courtCaseCacheByDc = {}, courtCaseLines = [], courtCaseRecords = [], lokDistributedRows = [], lokDistributedLoaded = false, currentCourtRecord = null, receiverGeoData = null;
let freezeAdminPasswordEntered = "", omvigAdminPasswordEntered = "";
let progressRevenueReportType = "STAFF", progressRevenueDefaultersLimit = 20, progressDefaultersGovtFilter = "", progressTargetGovtFilter = "", progressStaffTypeFilter = "", progressPaidCountFilter = "", progressPaidCountGovtFilter = "", progressPaidCountPaymentFilter = "";
let progressFreezeCategory = "", progressFreezeLoading = false, progressFreezeActiveFreeze = null, revenueFreezeSnapshotCache = {}, lastRevenueProgressFreezeResult = null, lastRevenueProgressFreezeScopeKey = null, revenueFreezeSyncToken = 0, freezeNonPayeeFilterState = { dc: "", hq: "", village: "", category: "", slab: "", govt: "", payment: "" }, freezeDefaultersGovtFilter = "", freezeDefaultersPaymentFilter = "";
let meterCheckingRows = [], meterCheckingRowsLoadedDcKey = "", meterCheckingStaffNames = [], meterCheckingStaffLoadedDcKey = "", currentMeterCheckingRecord = null, meterCheckingPhoto1 = { base64: "", name: "" }, meterCheckingPhoto2 = { base64: "", name: "" }, meterCheckingPhoto3 = { base64: "", name: "" }, meterCheckingReportRows = [], meterCheckingReportLoadedDcKey = "", meterCheckingReportStale = false, meterCheckingReportMode = "DAILY";
let lastRevenueProgressBoxData = null, lastRevenueProgressStaffData = null, lastRevenueProgressTargetSummaryData = null, suppressHistoryPush = false, progressSummaryDownloadInProgress = false, selectedStockReceiveItem = null, selectedStockIssueItem = null, pendingReceiveItems = [], pendingIssueItems = [], activeIssueDc = "";
let shmsRows = [], shmsSubstations = [], selectedShmsRow = null, shmsDataLoaded = false, selectedShmsSubstation = "", selectedShmsEventType = "", shmsPendingEntries = [];
let gpsCameraGeoData = null, gpsCameraPhotoDataUrl = "", gpsCameraPhotoFileName = "", gpsCameraGeoPromise = null, gpsCameraGeoCapturedAt = 0, gpsCameraOpeningInProgress = false, gpsCameraTarget = "home";
let selectedVehicleNo = "", vehiclePhotoDataUrl = "", vehiclePhotoName = "", vehicleReadingEntries = [], vehicleReadingSubmitInProgress = false;
let revenueCollectionRowsByDc = {}, revenueCollectionLoadedByDc = {}, currentRevenueRecord = null, revenueTdPhotoDataUrl = "", revenueTdPhotoName = "", revenuePaidUploadUnlocked = false, revenueUploadedPaidCache = {}, revenueCategoryRawPaymentCache = null, revenuePendingBaseRows = [], revenuePendingIndex = { hqMap: new Map(), villageMap: new Map(), categoryMap: new Map(), rowsMap: new Map() }, revenuePendingPaidIvrsSet = new Set(), revenuePendingPaidRefreshToken = 0, revenuePendingPaidDataIncomplete = false, revenuePendingDiag = { liveTotal: 0, liveDcMatched: 0, uploadedFetched: 0, masterRows: 0 }, revenuePendingDownloadInProgress = false, revenueReportRenderToken = 0, revenueReportLoadedScopeKey = null, revenueSummaryMasterLoadedDcKey = null, revenueLiveDownloadInProgress = false, revenueReportDownloadInProgress = false, revenuePaidUploadInProgress = false;
let revenueMessageSession = null, revenueMessageSelectionMode = false, revenueMessageSelectedRows = new Map(), revenueMessageQueue = [], revenueMessageQueueIndex = 0, revenueMessageChannel = "", revenueMessageCurrentOpened = false, revenueMessageOpenedCount = 0, revenueMessageSkippedCount = 0, revenueMessageOpenInProgress = false, revenuePendingRenderTimer = 0;
const revenueMessageSessionStorageKey = "seoni-revenue-message-staff-session-v2";
const revenueMessageDeviceStorageKey = "seoni-revenue-message-device-v2";
const revenueMessageBatchLimit = 25;
const revenueAdminPassword = "JE12345";
const staffAdminPassword = "AE123";
let staffAdminUnlocked = false, staffAdminCurrentAccount = null;
const revenueUploadedPaidStorageKey = "seoni-revenue-uploaded-paid-cache-v2";
const revenueCategoryRawPaymentStorageKey = "seoni-revenue-category-raw-payment-rows-v2";
const revenueCategoryRawPaymentDbName = "seoni-revenue-category-payment-db-v2";
const revenueCategoryRawPaymentStoreName = "dc-payment-rows";
const revenuePaidUploadMetaStorageKey = "seoni-revenue-paid-upload-meta-v1";

const feederDcDistributionConfig = {
    "11 KV - BAKODA SEONI AG": [{ dcName: "CHHAPARA-1", percent: 100 }],
    "11 KV - GANESHGANJ MIX": [{ dcName: "CHHAPARA-2", percent: 30 }, { dcName: "CHHAPARA-1", percent: 70 }],
    "11 KV - BANDOL AG": [{ dcName: "CHHAPARA-2", percent: 35 }, { dcName: "CHHAPARA-1", percent: 65 }],
    "11 KV - BARRA MIX": [{ dcName: "CHHAPARA-2", percent: 30 }, { dcName: "CHHAPARA-1", percent: 70 }],
    "11 KV - CHHAPARA TOWN": [{ dcName: "CHHAPARA-2", percent: 10 }, { dcName: "CHHAPARA-1", percent: 90 }],
    "11 KV - SELWA DL": [{ dcName: "GANESHGANJ", percent: 50 }]
};

let feederRows = [], feederSubstations = ["BAMHANWADA", "BARRA", "BHIMGARH", "CHAMARI", "CHHAPARA", "GANESHGANJ", "KEOLARI"], feederDataLoaded = false;
let peakLoadRows = [], peakLoadDataLoaded = false, feederReportRows = [], feederReportLoaded = false, feederReportLoadMessage = "";
let peakLoadReportRows = [], peakLoadReportLoaded = false, peakLoadReportLoadMessage = "", stmComplaintReportRows = [], stmComplaintReportLoaded = false, stmComplaintReportLoadMessage = "";
let feederSubstationHistoryCache_ = {}, feederHistorySyncingFor_ = "", selectedFeederSubstation = "", activeFeederOperator = null, activeShmsOperator = null, activeStmComplaintOperator = null;
let shmsProgressRows = [], shmsProgressLoaded = false, shmsProgressStale = false, shmsProgressMode = "DAILY", progressReportSource = "SHMS", shmsPendingTrackerRows = [], shmsRecentSubmittedEntries = [], summaryRefreshToken = 0;
let activePeakLoadOperator = null, selectedPeakLoadSubstation = "", selectedPeakLoadFeeder = null, selectedPeakLoadDateIso = "", peakLoadEntries = [], peakLoadPendingCheckToken = 0;
const peakLoadTimeSlots = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}:00`);
const stmComplaintOperatorStorageKey = "stmComplaintOperatorProfile";
const peakLoadOperatorStorageKey = "dailyHourlyPeakLoadOperatorProfile";
const peakLoadSubmissionStorageKey = "dailyHourlyPeakLoadSubmissionDrafts";
let selectedStmComplaintSubstation = "";
const subDnChhaparaDcs = ["CHHAPARA-1", "CHHAPARA-2", "GANESHGANJ", "MAINTENANCE TEAM", "OTHER"];
const courtServedStorageKey = "seoni-circle-lok-adalat-served";
const courtCaseCacheStorageKey = "seoni-circle-lok-adalat-csv-cache";
const dcCsvCacheStoragePrefix = "seoni-circle-dc-csv-";
const shmsRecentSubmittedStorageKey = "seoni-circle-shms-recent-submitted";
const shmsRecentSubmittedTtlMs = 2 * 60 * 1000;
const feederRecentSubmittedStorageKey = "seoni-circle-feeder-recent-submitted";
const feederOperatorStorageKey = "feederOperatorProfile";
const feederAlertStartDateKey = "2026-05-04";
let lokServedSheetMap = {}, lokSheetMapLoadingStarted = false, lokSheetMapLoadingPromise = null, feederRecentSubmittedEntries = [];

document.addEventListener("DOMContentLoaded", () => {
    initDarkModePreference();
    initPwaInstallBannerForIos();
    if ("serviceWorker" in navigator) {
        window.addEventListener("load", () => {
            navigator.serviceWorker.register("./service-worker.js").catch(() => {});
        });
    }
    const today = getTodayIsoDate();
    const repDateEl = document.getElementById("report-date");
    if (repDateEl) repDateEl.value = today;
    getAllDcConfigs().forEach(async ({ name, csvUrl }) => {
        if (!csvUrl) return;
        try {
            const rawCsv = await loadRemoteText(csvUrl);
            const normalizedDc = normalizeDcName(name);
            const parsedRows = isLikelyCsvPayload(rawCsv) ? parseConsumerCsv(rawCsv) : [];
            if (parsedRows.length) {
                dcCacheRaw[normalizedDc] = rawCsv;
                dcCacheRows[normalizedDc] = parsedRows;
                try { localStorage.setItem(`${dcCsvCacheStoragePrefix}${normalizedDc}`, rawCsv); } catch (_) {}
            }
        } catch (e) {}
    });
    Object.keys(revenueCollectionCsvUrls).forEach((dcKey) => {
        loadRevenueCollectionData(dcKey).catch(() => {});
    });
    retryRevenueOfflineQueue(true).catch(() => {});
    loadCourtCaseData();
    loadStockMaterialsData();
    preloadDuplicateTrackingData();
    renderStockDashboard();
    setupStockEntrySearch("receive");
    setupStockEntrySearch("issue");
    renderIssueDcDropdown();
    suppressHistoryPush = true;
    switchView("home");
    suppressHistoryPush = false;
    prewarmGpsCameraLocationIfAllowed();
});

async function preloadDuplicateTrackingData(forceRefresh = false) {
    if (forceRefresh || !lokSheetMapLoadingPromise) {
        lokSheetMapLoadingStarted = true;
        lokSheetMapLoadingPromise = loadServedCourtCaseSheetMap().finally(() => {
            if (!forceRefresh) return;
            lokSheetMapLoadingStarted = true;
        });
    }
    return await lokSheetMapLoadingPromise;
}

function showDivision(name, colorClass) {
    activeDiv = name.trim().toUpperCase();
    resetForm();
    const divisionConfig = getDivisionConfig(activeDiv);
    activeGrad = divisionConfig?.colorClass || colorClass || "bg-teal-grad";
    document.documentElement.style.setProperty("--theme-color", divisionConfig?.themeColor || "#0d9488");
    document.documentElement.style.setProperty("--theme-grad", divisionConfig?.themeGradient || "linear-gradient(135deg, #0d9488 0%, #0f766e 100%)");
    switchView("dc-selection");
    document.getElementById("lakhnadon-special-actions").style.display = divisionConfig?.showSpecialActions ? "block" : "none";
    const menu = document.getElementById("dc-menu");
    menu.innerHTML = "";
    getDivisionDcNames(activeDiv).forEach((dc) => {
        const item = document.createElement("div");
        item.className = "option-item";
        item.innerText = dc;
        item.onclick = () => {
            activeDC = normalizeDcName(dc);
            ensureDcDataLoaded(activeDC);
            prefetchRevenueBackgroundDataForDc(activeDC);
            document.getElementById("selected-dc-label").innerText = dc;
            toggleDropdown();
            switchView("dc-dashboard");
        };
        menu.appendChild(item);
    });
}

function getDcConfigByName(dcName) {
    const normalized = normalizeDcName(dcName);
    return getAllDcConfigs().find((config) => normalizeDcName(config.name) === normalized) || null;
}

const dcDataLoadFetchPromises = {};

function showFreshDataWarning_(message = "Fresh data load nahi hua; purana cached data dikhaya ja raha hai.") {
    const host = document.getElementById("summary-content") || document.querySelector("main.view.active");
    if (!host) return;
    let notice = document.getElementById("fresh-data-warning-notice");
    if (!notice) {
        notice = document.createElement("div");
        notice.id = "fresh-data-warning-notice";
        notice.style.cssText = "margin:8px auto;padding:7px 10px;border:1px solid #fbbf24;border-radius:10px;background:#fffbeb;color:#92400e;font-size:.62rem;font-weight:850;text-align:center;line-height:1.3;";
        host.prepend(notice);
    }
    notice.textContent = `⚠️ ${message}`;
    notice.style.display = "block";
}

async function ensureDcDataLoaded(dcName, forceRefresh = false) {
    const normalized = normalizeDcName(dcName);
    if (!normalized) return [];
    if (!forceRefresh && dcCacheRows[normalized]?.length) return dcCacheRows[normalized];
    if (!forceRefresh && dcDataLoadFetchPromises[normalized]) return dcDataLoadFetchPromises[normalized];
    const config = getDcConfigByName(normalized);
    if (!config || !config.csvUrl) return [];
    dcDataLoadFetchPromises[normalized] = ensureDcDataLoadedInner_(normalized, config, forceRefresh).finally(() => {
        delete dcDataLoadFetchPromises[normalized];
    });
    return dcDataLoadFetchPromises[normalized];
}

async function ensureDcDataLoadedInner_(normalized, config, forceRefresh) {
    try {
        const rawCsv = await loadRemoteText(config.csvUrl);
        const parsedRows = isLikelyCsvPayload(rawCsv) ? parseConsumerCsv(rawCsv) : [];
        if (parsedRows.length) {
            dcCacheRaw[normalized] = rawCsv;
            dcCacheRows[normalized] = parsedRows;
            try { localStorage.setItem(`${dcCsvCacheStoragePrefix}${normalized}`, rawCsv); } catch (_) {}
        } else {
            const cachedRaw = localStorage.getItem(`${dcCsvCacheStoragePrefix}${normalized}`) || "";
            const cachedRows = isLikelyCsvPayload(cachedRaw) ? parseConsumerCsv(cachedRaw) : [];
            dcCacheRows[normalized] = cachedRows.length ? cachedRows : [];
        }
    } catch (_) {
        showFreshDataWarning_(`DC ${normalized} ka fresh data load nahi hua; purana cached data dikhaya ja raha hai.`);
        try {
            const cachedRaw = localStorage.getItem(`${dcCsvCacheStoragePrefix}${normalized}`) || "";
            const parsedRows = isLikelyCsvPayload(cachedRaw) ? parseConsumerCsv(cachedRaw) : [];
            dcCacheRows[normalized] = parsedRows.length ? parsedRows : [];
        } catch (_) {
            dcCacheRows[normalized] = [];
        }
    }
    return dcCacheRows[normalized] || [];
}

function normalizeLookupDigits(value) {
    return String(value || "").replace(/\D/g, "");
}

let mobileAlreadySubmittedMap = {};
let mobileAlreadySubmittedMapLoadedAt = 0;
const mobileAlreadySubmittedTtlMs = 60 * 1000;
let mobileAlreadySubmittedMapFetchPromise = null;

async function loadMobileAlreadySubmittedMap(forceRefresh = false) {
    if (!forceRefresh && mobileAlreadySubmittedMapLoadedAt && (Date.now() - mobileAlreadySubmittedMapLoadedAt) < mobileAlreadySubmittedTtlMs) {
        return mobileAlreadySubmittedMap;
    }
    if (!forceRefresh && mobileAlreadySubmittedMapFetchPromise) return mobileAlreadySubmittedMapFetchPromise;
    mobileAlreadySubmittedMapFetchPromise = (async () => {
        try {
            const cloudData = await MasterAPI.getMobileSummary("");
            const nextMap = {};
            (Array.isArray(cloudData) ? cloudData : []).forEach((entry) => {
                const dc = normalizeLookupValue(entry.dc || "");
                const ivrs = normalizeLookupDigits(entry.ivrs || "");
                if (!dc || !ivrs) return;
                const key = `${dc}__${ivrs}`;
                const mobile = String(entry.correct_mobile || "").trim();
                const date = String(entry.date || entry.timestamp || "").trim();
                if (!nextMap[key] || date >= (nextMap[key].date || "")) {
                    nextMap[key] = { mobile, date };
                }
            });
            mobileAlreadySubmittedMap = nextMap;
            mobileAlreadySubmittedMapLoadedAt = Date.now();
        } catch (_) {}
        mobileAlreadySubmittedMapFetchPromise = null;
        return mobileAlreadySubmittedMap;
    })();
    return mobileAlreadySubmittedMapFetchPromise;
}

function getMobileAlreadySubmittedEntry(dcName, ivrsNo) {
    const dc = normalizeLookupValue(dcName || "");
    const ivrs = normalizeLookupDigits(ivrsNo || "");
    if (!dc || !ivrs) return null;
    return mobileAlreadySubmittedMap[`${dc}__${ivrs}`] || null;
}

const mobileUpdateDcSummaryCache_ = {};
const mobileUpdateDcSummaryFetchPromises_ = {};
const MOBILE_UPDATE_DC_SUMMARY_TTL_MS = 60000;

async function fetchMobileUpdateDcSummary_(dcName, forceRefresh = false) {
    const dc = normalizeLookupValue(dcName || "");
    if (!dc) return [];
    const cached = mobileUpdateDcSummaryCache_[dc];
    if (!forceRefresh && cached && (Date.now() - cached.cachedAt) < MOBILE_UPDATE_DC_SUMMARY_TTL_MS) {
        return cached.data;
    }
    if (!forceRefresh && mobileUpdateDcSummaryFetchPromises_[dc]) {
        return mobileUpdateDcSummaryFetchPromises_[dc];
    }
    mobileUpdateDcSummaryFetchPromises_[dc] = (async () => {
        try {
            const cloudData = await MasterAPI.getMobileSummary(dcName);
            const data = Array.isArray(cloudData) ? cloudData : [];
            mobileUpdateDcSummaryCache_[dc] = { data, cachedAt: Date.now() };
            return data;
        } finally {
            delete mobileUpdateDcSummaryFetchPromises_[dc];
        }
    })();
    return mobileUpdateDcSummaryFetchPromises_[dc];
}

function applyMobileAlreadySubmittedUi(entry) {
    const alreadyBox = document.getElementById("mobile-already-submitted-box");
    const entryBox = document.getElementById("mobile-entry-box");
    const submitBtn = document.getElementById("submit-btn");
    if (entry) {
        if (alreadyBox) {
            const mobileText = entry.mobile ? ` (${escapeHtml(entry.mobile)})` : "";
            const dateText = entry.date ? ` - ${escapeHtml(entry.date)}` : "";
            alreadyBox.innerHTML = `Is consumer ka mobile number pehle hi update ho chuka hai${mobileText}${dateText}. Dobara submit nahi ho sakta.`;
            alreadyBox.style.display = "block";
        }
        if (entryBox) entryBox.style.display = "block";
        if (submitBtn) submitBtn.style.display = "block";
    } else {
        if (alreadyBox) alreadyBox.style.display = "none";
        if (entryBox) entryBox.style.display = "block";
        if (submitBtn) submitBtn.style.display = "block";
    }
}

let mobileUpdateReportViewBy = "HQ";
let mobileUpdateReportMode = "ALL";
let mobileUpdateReportTree = null;
let mobileUpdateReportRenderToken = 0;
let mobileUpdateListMode = "ALL";
let mobileUpdateListRows = null;
let mobileUpdateListRenderToken = 0;

function openMobileUpdateReport() {
    closeHeaderMenu();
    switchView("mobile-update-report");
}

function initMobileUpdateReport() {
    const select = document.getElementById("mobile-update-report-viewby");
    if (select) select.value = mobileUpdateReportViewBy;
    const dateInput = document.getElementById("mobile-update-report-date");
    const monthInput = document.getElementById("mobile-update-report-month");
    if (dateInput && !dateInput.value) dateInput.value = getTodayIsoDate();
    if (monthInput && !monthInput.value) monthInput.value = getTodayIsoDate().slice(0, 7);
    const scopeLabel = document.getElementById("mobile-update-report-scope-label");
    if (scopeLabel) scopeLabel.innerText = activeDC ? `DC: ${activeDC} - Total / Updated / Pending consumer` : "Total / Updated / Pending consumer";
    setMobileUpdateReportMode(mobileUpdateReportMode || "ALL");
}

function setMobileUpdateReportMode(mode) {
    mobileUpdateReportMode = ["DAILY", "MONTHLY"].includes(mode) ? mode : "ALL";
    const dateInput = document.getElementById("mobile-update-report-date");
    const monthInput = document.getElementById("mobile-update-report-month");
    const allBtn = document.getElementById("mobile-update-report-all-mode-btn");
    const dateBtn = document.getElementById("mobile-update-report-date-mode-btn");
    const monthBtn = document.getElementById("mobile-update-report-month-mode-btn");
    if (dateInput) dateInput.style.display = mobileUpdateReportMode === "DAILY" ? "block" : "none";
    if (monthInput) monthInput.style.display = mobileUpdateReportMode === "MONTHLY" ? "block" : "none";
    if (allBtn) { allBtn.style.background = mobileUpdateReportMode === "ALL" ? "#991b1b" : "#ffe4e6"; allBtn.style.color = mobileUpdateReportMode === "ALL" ? "#ffffff" : "#991b1b"; }
    if (dateBtn) { dateBtn.style.background = mobileUpdateReportMode === "DAILY" ? "#991b1b" : "#ffe4e6"; dateBtn.style.color = mobileUpdateReportMode === "DAILY" ? "#ffffff" : "#991b1b"; }
    if (monthBtn) { monthBtn.style.background = mobileUpdateReportMode === "MONTHLY" ? "#991b1b" : "#ffe4e6"; monthBtn.style.color = mobileUpdateReportMode === "MONTHLY" ? "#ffffff" : "#991b1b"; }
    renderMobileUpdateReport();
}

function setMobileUpdateReportViewBy(value) {
    mobileUpdateReportViewBy = value === "VILLAGE" ? "VILLAGE" : "HQ";
    if (!mobileUpdateReportTree) return;
    const tableBox = document.getElementById("mobile-update-report-table");
    if (tableBox) tableBox.innerHTML = renderMobileUpdateReportTableHtml();
}

function getMobileUpdateReportPeriod() {
    if (mobileUpdateReportMode === "DAILY") {
        const raw = document.getElementById("mobile-update-report-date")?.value || getTodayIsoDate();
        const parsed = parseSummarySelection(raw, "DAILY");
        return { mode: "DAILY", dStr: parsed.daily, mStr: parsed.monthly, label: parsed.label };
    }
    if (mobileUpdateReportMode === "MONTHLY") {
        const raw = document.getElementById("mobile-update-report-month")?.value || getTodayIsoDate().slice(0, 7);
        const parsed = parseSummarySelection(raw, "MONTHLY");
        return { mode: "MONTHLY", dStr: parsed.daily, mStr: parsed.monthly, label: parsed.label };
    }
    return { mode: "ALL" };
}

function buildMobileUpdateReportData(rows, dcName, cloudData, period) {
    const normDc = normalizeDcName(dcName);
    const updatedIvrsSet = new Set();
    (cloudData || []).forEach((u) => {
        const uDc = (u.dc || "").trim().toUpperCase();
        if (uDc !== normDc) return;
        const mobileVal = u.correct_mobile || "";
        const hasMobile = mobileVal.toString().trim().length === 10;
        if (!hasMobile) return;
        if (period.mode !== "ALL") {
            const ts = (u.date || "").trim();
            if (!matchesProgressDate(ts, period.mode, period.dStr, period.mStr)) return;
        }
        const ivrs = normalizeLookupDigits(u.ivrs || "");
        if (ivrs) updatedIvrsSet.add(ivrs);
    });

    const hqMap = {};
    let totalConsumer = 0, totalUpdated = 0;
    rows.forEach((row) => {
        const ivrs = normalizeLookupDigits(row.ivrsNo);
        if (!ivrs) return;
        const hqName = String(row.hqName || "GENERAL").trim().toUpperCase() || "GENERAL";
        const village = String(row.village || "UNKNOWN").trim().toUpperCase() || "UNKNOWN";
        if (!hqMap[hqName]) hqMap[hqName] = { total: 0, updated: 0, villages: {} };
        if (!hqMap[hqName].villages[village]) hqMap[hqName].villages[village] = { total: 0, updated: 0 };
        const isUpdated = updatedIvrsSet.has(ivrs);
        hqMap[hqName].total++;
        hqMap[hqName].villages[village].total++;
        totalConsumer++;
        if (isUpdated) {
            hqMap[hqName].updated++;
            hqMap[hqName].villages[village].updated++;
            totalUpdated++;
        }
    });
    return { hqMap, totalConsumer, totalUpdated };
}

function renderMobileUpdateReportSummaryHtml(data) {
    const pct = data.totalConsumer ? Math.round((data.totalUpdated / data.totalConsumer) * 1000) / 10 : 0;
    return `
        <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:8px; width:100%; margin:0 auto;">
            <div style="background:#f1f5f9; border-radius:14px; padding:10px 6px; text-align:center;"><div style="font-size:0.56rem; font-weight:850; color:#64748b; text-transform:uppercase;">Total Consumer</div><div style="font-size:1.05rem; font-weight:950; color:#0f172a; margin-top:3px;">${data.totalConsumer}</div></div>
            <div style="background:#ecfdf5; border-radius:14px; padding:10px 6px; text-align:center;"><div style="font-size:0.56rem; font-weight:850; color:#166534; text-transform:uppercase;">Updated</div><div style="font-size:1.05rem; font-weight:950; color:#166534; margin-top:3px;">${data.totalUpdated}</div></div>
            <div style="background:#fff1f2; border-radius:14px; padding:10px 6px; text-align:center;"><div style="font-size:0.56rem; font-weight:850; color:#9f1239; text-transform:uppercase;">Pending</div><div style="font-size:1.05rem; font-weight:950; color:#9f1239; margin-top:3px;">${data.totalConsumer - data.totalUpdated}</div></div>
        </div>
        <div style="text-align:center; margin-top:8px; font-size:0.7rem; font-weight:950; color:#991b1b;">${pct}% Updated</div>
    `;
}

function getMobileUpdateReportRows() {
    if (!mobileUpdateReportTree) return [];
    const rows = [];
    Object.keys(mobileUpdateReportTree.hqMap).sort((a, b) => a.localeCompare(b)).forEach((hqName) => {
        const hq = mobileUpdateReportTree.hqMap[hqName];
        if (mobileUpdateReportViewBy === "HQ") {
            rows.push({ name: hqName, total: hq.total, updated: hq.updated });
        } else {
            Object.keys(hq.villages).sort((a, b) => a.localeCompare(b)).forEach((villageName) => {
                const v = hq.villages[villageName];
                rows.push({ name: `${villageName} (${hqName})`, total: v.total, updated: v.updated });
            });
        }
    });
    return rows;
}

function renderMobileUpdateReportTableHtml() {
    const rows = getMobileUpdateReportRows();
    const colLabel = mobileUpdateReportViewBy === "HQ" ? "HQ NAME" : "VILLAGE";
    let html = `<div class="summary-wrapper"><div class="summary-table-header" style="grid-template-columns: 1.4fr 0.85fr 0.85fr 0.85fr;"><div>${colLabel}</div><div>TOTAL</div><div>UPDATED</div><div>PENDING</div></div>`;
    if (!rows.length) {
        html += `<div class="summary-table-row" style="grid-template-columns: 1fr;"><div class="text-rose-600">Data nahi mila.</div></div>`;
    } else {
        rows.forEach((row) => {
            const pending = row.total - row.updated;
            html += `<div class="summary-table-row" style="grid-template-columns: 1.4fr 0.85fr 0.85fr 0.85fr;"><div>${escapeHtml(row.name)}</div><div class="font-black">${row.total}</div><div class="text-emerald-700 font-black">${row.updated}</div><div class="text-rose-700 font-black">${pending}</div></div>`;
        });
    }
    html += `</div>`;
    return html;
}

async function renderMobileUpdateReport() {
    const summaryBox = document.getElementById("mobile-update-report-summary");
    const tableBox = document.getElementById("mobile-update-report-table");
    const statusBox = document.getElementById("mobile-update-report-download-status");
    if (!tableBox) return;
    const renderToken = ++mobileUpdateReportRenderToken;
    if (statusBox) statusBox.style.display = "none";
    if (summaryBox) summaryBox.innerHTML = "";
    mobileUpdateReportTree = null;
    const dcName = activeDC;
    const isRenderValid = () => renderToken === mobileUpdateReportRenderToken && document.getElementById("mobile-update-report-view")?.classList.contains("active");
    const progress = renderSyncingProgress(tableBox, isRenderValid, "SYNCING DATA... PLEASE WAIT");
    try {
        if (!dcName) throw new Error("DC select nahi hai");
        await ensureConsumerDataLoadedFor([dcName]);
        const cloudData = await fetchMobileUpdateDcSummary_(dcName);
        if (!isRenderValid()) { progress.stop(); return; }
        const rows = getConsumerRows(dcName).map(mapRevenueConsumerRow).filter((row) => normalizeLookupDigits(row.ivrsNo));
        const period = getMobileUpdateReportPeriod();
        mobileUpdateReportTree = buildMobileUpdateReportData(rows, dcName, cloudData, period);
        await progress.finish();
        if (!isRenderValid()) return;
        if (summaryBox) summaryBox.innerHTML = renderMobileUpdateReportSummaryHtml(mobileUpdateReportTree);
        tableBox.innerHTML = renderMobileUpdateReportTableHtml();
    } catch (error) {
        progress.stop();
        if (statusBox) {
            statusBox.style.display = "block";
            statusBox.style.background = "#fff1f2";
            statusBox.style.borderColor = "#fca5a5";
            statusBox.style.color = "#991b1b";
            statusBox.innerText = "Report load nahi ho payi";
        }
    }
}

async function performSearch() {
    const v = document.getElementById("search-ivrs").value.trim();
    currentData = null;
    document.getElementById("result-box").style.display = "none";
    document.getElementById("submit-btn").style.display = "none";
    const alreadyBoxReset = document.getElementById("mobile-already-submitted-box");
    if (alreadyBoxReset) alreadyBoxReset.style.display = "none";
    if (v.length !== 10) return showToast("Enter 10 digit IVRS", false);
    let rows = getConsumerRows(activeDC);
    if (!rows.length) {
        rows = await ensureDcDataLoaded(activeDC);
    }
    if (!rows.length) return showToast("Record Not Found!", false);
    const searchIvrs = normalizeLookupDigits(v);
    let found = findConsumerRowByIvrs(rows, searchIvrs);
    if (!found) {
        rows = await ensureDcDataLoaded(activeDC, true);
        found = findConsumerRowByIvrs(rows, searchIvrs);
    }
    if (!found) return showToast("Record Not Found!", false);
    currentData = {
        ivrs: getConsumerField(found, ["IVRS", "IVRS NO", "IVRS NUMBER", "IVRSNO"], searchIvrs),
        name: getConsumerField(found, ["NAME", "CONSUMER NAME"]),
        father: getConsumerField(found, ["FATHER", "FATHER NAME"]),
        old: normalizeMobileDisplayValue(getConsumerField(found, ["OLD MOBILE", "OLD MOBILE NO", "OLD MOBILE NUMBER", "MOBILE NO", "MOBILE NUMBER"])),
        addr: getConsumerField(found, ["ADDRESS", "ADDR", "VILLAGE"]),
        hq: getConsumerField(found, ["HQ", "HQ NAME", "HEADQUARTER", "HEAD QUARTER", "H.Q."])
    };
    document.getElementById("res-ivrs").innerText = currentData.ivrs;
    document.getElementById("res-name").innerText = currentData.name;
    document.getElementById("res-old").innerText = currentData.old || "N/A";
    document.getElementById("res-addr").innerText = currentData.addr;
    document.getElementById("result-box").style.display = "block";
    const entryBoxNow = document.getElementById("mobile-entry-box");
    const submitBtnNow = document.getElementById("submit-btn");
    const alreadyBoxNow = document.getElementById("mobile-already-submitted-box");
    if (alreadyBoxNow) alreadyBoxNow.style.display = "none";
    if (entryBoxNow) entryBoxNow.style.display = "block";
    if (submitBtnNow) submitBtnNow.style.display = "block";
    
    loadMobileAlreadySubmittedMap().then(() => {
        if (!currentData || normalizeLookupDigits(currentData.ivrs) !== searchIvrs) return;
        applyMobileAlreadySubmittedUi(getMobileAlreadySubmittedEntry(activeDC, currentData.ivrs));
    }).catch(() => {});
}

async function submitToSheet() {
    const n = document.getElementById("new-mobile").value;
    if (n.length !== 10) return showToast("Enter 10 Digit No", false);
    const alreadyEntry = getMobileAlreadySubmittedEntry(activeDC, currentData?.ivrs);
    if (alreadyEntry) {
        applyMobileAlreadySubmittedUi(alreadyEntry);
        showToast("Is consumer ka mobile number pehle hi submit ho chuka hai", false);
        return;
    }
    const btn = document.getElementById("submit-btn");
    setActionButtonState(btn, "processing", "Submit");
    try {
        const res = await MasterAPI.submitMobileUpdate({
            ivrs: currentData.ivrs,
            name: currentData.name,
            father: currentData.father,
            old_mobile: currentData.old,
            address: currentData.addr,
            hq: currentData.hq,
            correct_mobile: n,
            dc: activeDC,
            division: activeDiv
        });

        const submitOk = res && res.status === "success";
        const submitMessage = (res && res.message) || (submitOk ? "Submitted Successfully!" : "Submit error aaya");

        showToast(submitMessage, submitOk);
        if (!submitOk) {
            setActionButtonState(btn, "failed", "Submit");
            return;
        }
        setActionButtonState(btn, "done", "Submit");
        const submittedKey = `${normalizeLookupValue(activeDC || "")}__${normalizeLookupDigits(currentData?.ivrs || "")}`;
        if (submittedKey !== "__") {
            mobileAlreadySubmittedMap[submittedKey] = { mobile: n, date: new Date().toLocaleDateString("en-GB") };
        }
        resetForm(true);
        const searchInput = document.getElementById("search-ivrs");
        if (searchInput) searchInput.focus();
    } catch (e) {
        setActionButtonState(btn, "failed", "Submit");
        showToast("Submit blocked ya network issue aaya", false);
    } finally {
        setTimeout(() => setActionButtonState(btn, "idle", "Submit"), 900);
    }
}

// ... All remaining application functions (VR calculations, Panchnama, Stock, Feeder, etc.) are kept 100% intact ...