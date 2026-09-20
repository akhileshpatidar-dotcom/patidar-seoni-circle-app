/**
 * =====================================================================
 * SEONI CIRCLE APP - UNIFIED MASTER CLIENT ENGINE (app.js)
 * Master Backend Version: 5.0 Compatible
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

let activeDiv = "", activeDC = "", activeGrad = "bg-teal-grad", currentData = null;

function getAllDcConfigs() {
    const list = [];
    Object.keys(divisionConfigs).forEach(k => {
        if (divisionConfigs[k].dcs) list.push(...divisionConfigs[k].dcs);
    });
    return list;
}

function getDivisionConfig(divName) {
    return divisionConfigs[divName] || null;
}

function getDivisionDcNames(divName) {
    const conf = getDivisionConfig(divName);
    return conf && conf.dcs ? conf.dcs.map(d => d.name) : [];
}

function normalizeDcName(dc) {
    return String(dc || "").toUpperCase().trim();
}

function switchView(viewId) {
    document.querySelectorAll(".view").forEach(v => {
        v.classList.remove("active");
        v.style.display = "none";
    });
    const target = document.getElementById(viewId + "-view") || document.getElementById(viewId);
    if (target) {
        target.classList.add("active");
        target.style.display = "block";
    }
    const backBtn = document.getElementById("back-btn");
    if (backBtn) {
        backBtn.style.display = (viewId === "home" || viewId === "home-view") ? "none" : "flex";
    }
}

function showDivision(name, colorClass) {
    activeDiv = name.trim().toUpperCase();
    const divisionConfig = getDivisionConfig(activeDiv);
    activeGrad = divisionConfig?.colorClass || colorClass || "bg-teal-grad";
    document.documentElement.style.setProperty("--theme-color", divisionConfig?.themeColor || "#0d9488");
    document.documentElement.style.setProperty("--theme-grad", divisionConfig?.themeGradient || "linear-gradient(135deg, #0d9488 0%, #0f766e 100%)");
    switchView("dc-selection");
    
    const specialActions = document.getElementById("lakhnadon-special-actions");
    if (specialActions) {
        specialActions.style.display = divisionConfig?.showSpecialActions ? "block" : "none";
    }
    
    const menu = document.getElementById("dc-menu");
    if (menu) {
        menu.innerHTML = "";
        getDivisionDcNames(activeDiv).forEach((dc) => {
            const item = document.createElement("div");
            item.className = "option-item";
            item.innerText = dc;
            item.onclick = () => {
                activeDC = normalizeDcName(dc);
                document.getElementById("selected-dc-label").innerText = dc;
                toggleDropdown();
                switchView("dc-dashboard");
            };
            menu.appendChild(item);
        });
    }
}

function toggleDropdown() {
    const menu = document.getElementById("dc-menu");
    if (menu) menu.classList.toggle("open");
}

function toggleHeaderMenu(e) {
    if (e) e.stopPropagation();
    const list = document.getElementById("header-menu-list");
    if (list) list.classList.toggle("open");
}

function closeHeaderMenu() {
    const list = document.getElementById("header-menu-list");
    if (list) list.classList.remove("open");
}

function changeTheme(colorHex) {
    document.documentElement.style.setProperty("--theme-color", colorHex);
}

function showToast(msg, isSuccess = true) {
    const t = document.getElementById("toast-notif");
    if (!t) return;
    t.innerText = msg;
    t.style.background = isSuccess ? "#059669" : "#dc2626";
    t.classList.add("show");
    setTimeout(() => t.classList.remove("show"), 3000);
}

function toggleDarkMode() {
    document.documentElement.classList.toggle("dark");
}

function refreshAppNow() {
    window.location.reload(true);
}

function askPassword(type) {
    const modal = document.getElementById("pwd-modal");
    if (modal) modal.style.display = "flex";
}

function closePwdModal() {
    const modal = document.getElementById("pwd-modal");
    if (modal) modal.style.display = "none";
}

function verifyPassword() {
    const pwd = document.getElementById("pwd-input")?.value;
    if (pwd === "AE123" || pwd === "JE12345") {
        closePwdModal();
        showToast("Password Verified!", true);
    } else {
        showToast("Galat Password!", false);
    }
}

function openGpsCameraFlow() {
    const modal = document.getElementById("gps-camera-status-modal");
    if (modal) modal.style.display = "flex";
}

async function performSearch() {
    const v = document.getElementById("search-ivrs").value.trim();
    if (v.length !== 10) return showToast("Enter 10 digit IVRS", false);
    showToast("Searching IVRS...", true);
}

document.addEventListener("DOMContentLoaded", () => {
    switchView("home");
});