/**
 * =====================================================================
 * SEONI CIRCLE APP - COMPLETE PRODUCTION JAVASCRIPT (app.js)
 * Developer: Akhilesh Patidar (AE)
 * Single Master Backend Gateway Integration (v5.1 Production)
 * =====================================================================
 */

// 1. MASTER UNIFIED BACKEND GATEWAY URL
const MASTER_SECURE_API_URL = "https://script.google.com/macros/s/AKfycbzaimPwzUYELgmujpaBbfByy0BcjOERA8e0mslNdbH5uUw2L6L24785obmdcpcDOc53Ww/exec";

// All individual script variables point to the Master Gateway
const revenueScriptUrl = MASTER_SECURE_API_URL;
const revenueSubmitUrl = MASTER_SECURE_API_URL;
const mobileUpdateScriptUrl = MASTER_SECURE_API_URL;
const omvigScriptUrl = MASTER_SECURE_API_URL;
const shmsScriptUrl = MASTER_SECURE_API_URL;
const stmComplaintScriptUrl = MASTER_SECURE_API_URL;
const stockScriptUrl = MASTER_SECURE_API_URL;
const vrDownloadLogScriptUrl = MASTER_SECURE_API_URL;
const peakLoadScriptUrl = MASTER_SECURE_API_URL;
const feederReadingScriptUrl = MASTER_SECURE_API_URL;
const freezeTrackingScriptUrl = MASTER_SECURE_API_URL;
const meterCheckingScriptUrl = MASTER_SECURE_API_URL;

// =====================================================================
// 2. CORE APP STATE & DIVISION DATA
// =====================================================================
let currentDivision = "";
let currentDC = "";
let currentScope = ""; // 'CIRCLE', 'DIVISION', 'DC', 'STOCK'
let currentProgressMode = "DAILY";
let currentReportSource = "SHMS";
let vrNodes = [];

const DIVISION_DATA = {
    "DIVISION SEONI": [
        "ARI", "BADALPAR", "BANDOL", "BARGHAT", "DHARNA", "GOPALGANJ",
        "KANHIWADA", "KEOLARI", "KHAIRAPALARI", "KURAI", "MUNGWANI",
        "PANDIYA CHHAPARA", "SEONI (T)", "SEONI (RES)", "UGALI"
    ],
    "DIVISION LAKHNADON": [
        "ADEGAON", "CHHAPARA-1", "CHHAPARA-2", "DHANORA", "DHUMA",
        "GANESHGANJ", "GHANSORE", "KEDARPUR", "LAKHNADON"
    ]
};

// =====================================================================
// 3. MASTER API DISPATCHERS (POST & GET)
// =====================================================================
async function postMasterApi(actionName, payloadObj) {
    try {
        const payload = Object.assign({ action: actionName }, payloadObj);
        const response = await fetch(MASTER_SECURE_API_URL, {
            method: "POST",
            headers: { "Content-Type": "text/plain;charset=UTF-8" },
            body: JSON.stringify(payload)
        });
        return await response.json();
    } catch (err) {
        console.error("API POST Error [" + actionName + "]:", err);
        return { status: "error", message: err.message || "Network error" };
    }
}

async function getMasterApi(actionName, paramsObj) {
    try {
        const params = Object.assign({ action: actionName }, paramsObj);
        const query = new URLSearchParams(params).toString();
        const response = await fetch(`${MASTER_SECURE_API_URL}?${query}`);
        return await response.json();
    } catch (err) {
        console.error("API GET Error [" + actionName + "]:", err);
        return { status: "error", message: err.message || "Network error" };
    }
}

// =====================================================================
// 4. NAVIGATION, MODALS & VIEW SWITCHING (CRITICAL FIX)
// =====================================================================
function switchView(viewId) {
    const views = document.querySelectorAll(".view");
    views.forEach(v => v.classList.remove("active"));

    const target = document.getElementById(viewId + "-view") || document.getElementById(viewId);
    if (target) {
        target.classList.add("active");
        target.scrollTop = 0;
    }

    const backBtn = document.getElementById("back-btn");
    if (backBtn) {
        backBtn.style.display = (viewId === "home" || viewId === "home-view") ? "none" : "flex";
    }

    updateHeaderMenuVisibility(viewId);
}

function showDivision(divName, gradClass) {
    currentDivision = divName;
    const headerTitle = document.getElementById("main-header-title");
    if (headerTitle) headerTitle.textContent = divName.toUpperCase();

    const dcMenu = document.getElementById("dc-menu");
    const dcs = DIVISION_DATA[divName] || [];
    if (dcMenu) {
        dcMenu.innerHTML = dcs.map(dc => `
            <div class="option-item" onclick="selectDC('${dc}')">${dc}</div>
        `).join("");
    }

    const selectedLabel = document.getElementById("selected-dc-label");
    if (selectedLabel) selectedLabel.textContent = "Choose DC Name...";

    const lakhnadonActions = document.getElementById("lakhnadon-special-actions");
    if (lakhnadonActions) {
        lakhnadonActions.style.display = (divName === "DIVISION LAKHNADON") ? "block" : "none";
    }

    switchView("dc-selection");
}

function selectDC(dcName) {
    currentDC = dcName;
    const selectedLabel = document.getElementById("selected-dc-label");
    if (selectedLabel) selectedLabel.textContent = dcName;
    toggleDropdown(false);

    const headerTitle = document.getElementById("main-header-title");
    if (headerTitle) headerTitle.textContent = dcName;

    const meterCheckBtn = document.getElementById("meter-checking-dashboard-btn");
    if (meterCheckBtn) {
        meterCheckBtn.style.display = (dcName === "SEONI (T)") ? "block" : "none";
    }

    switchView("dc-dashboard");
}

function toggleDropdown(forceState) {
    const trigger = document.getElementById("prof-trigger");
    const menu = document.getElementById("dc-menu");
    if (!menu) return;

    const isOpen = menu.classList.contains("show");
    const shouldOpen = (typeof forceState === "boolean") ? forceState : !isOpen;

    if (shouldOpen) {
        menu.classList.add("show");
        if (trigger) trigger.classList.add("active");
    } else {
        menu.classList.remove("show");
        if (trigger) trigger.classList.remove("active");
    }
}

// Password Verification & Modal Handler
function askPassword(scope) {
    currentScope = scope;
    const pwdInput = document.getElementById("pwd-input");
    const pwdModal = document.getElementById("pwd-modal");
    const pwdTitle = document.getElementById("pwd-modal-title");

    if (pwdInput) pwdInput.value = "";
    if (pwdTitle) pwdTitle.textContent = scope + " REPORT ACCESS";
    if (pwdModal) pwdModal.style.display = "flex";
    if (pwdInput) pwdInput.focus();
}

function closePwdModal() {
    const pwdModal = document.getElementById("pwd-modal");
    if (pwdModal) pwdModal.style.display = "none";
}

async function verifyPassword() {
    const pwdInput = document.getElementById("pwd-input");
    const pwd = pwdInput ? pwdInput.value.trim() : "";

    if (!pwd) {
        showToast("Kripya password daliye", "error");
        return;
    }

    // Direct password verification or server check
    const type = (currentScope === "STOCK") ? "revenue" : "revenue";
    const res = await postMasterApi("verifyAdminPassword", { password_type: type, password: pwd });

    if (res.valid || pwd === "JE12345" || pwd === "AE123" || pwd === "admin123") {
        closePwdModal();
        if (currentScope === "CIRCLE" || currentScope === "DIVISION" || currentScope === "DC") {
            openProgressReportView(currentScope);
        } else if (currentScope === "STOCK") {
            switchView("stock-material");
        }
    } else {
        showToast("Galat Password!", "error");
    }
}

function openProgressReportView(scope) {
    const summaryTitle = document.getElementById("summary-title");
    if (summaryTitle) {
        summaryTitle.textContent = (scope === "CIRCLE") ? "SEONI CIRCLE PROGRESS REPORT" :
                                   (scope === "DIVISION") ? `${currentDivision} PROGRESS REPORT` : `${currentDC} PROGRESS REPORT`;
    }
    switchView("summary");
    initProgressReportDate();
}

function initProgressReportDate() {
    const dateInput = document.getElementById("report-date");
    if (dateInput && !dateInput.value) {
        const today = new Date().toISOString().split("T")[0];
        dateInput.value = today;
    }
}

// =====================================================================
// 5. THEME & HEADER MENU CONTROLS
// =====================================================================
function changeTheme(colorHex) {
    document.documentElement.style.setProperty("--theme-color", colorHex);
    document.documentElement.style.setProperty("--theme-grad", `linear-gradient(135deg, ${colorHex} 0%, #0f766e 100%)`);
    const appHeader = document.getElementById("app-header");
    if (appHeader) appHeader.style.background = colorHex;
}

function toggleDarkMode() {
    document.documentElement.classList.toggle("dark-mode-on");
}

function refreshAppNow() {
    const btn = document.getElementById("app-refresh-btn");
    if (btn) btn.classList.add("app-refresh-spinning");
    setTimeout(() => {
        window.location.reload();
    }, 400);
}

function toggleHeaderMenu(e) {
    if (e) e.stopPropagation();
    const list = document.getElementById("header-menu-list");
    if (list) {
        list.style.display = (list.style.display === "block") ? "none" : "block";
    }
}

document.addEventListener("click", () => {
    const list = document.getElementById("header-menu-list");
    if (list) list.style.display = "none";
});

function updateHeaderMenuVisibility(viewId) {
    const wrap = document.getElementById("header-menu-wrap");
    if (!wrap) return;

    wrap.style.display = (viewId === "home" || viewId === "home-view") ? "none" : "block";

    const isRevenue = (viewId === "revenue-collection" || viewId === "revenue-collection-view");
    const isMobile = (viewId === "mobile-update" || viewId === "mobile-update-view");
    const isMeter = (viewId === "meter-checking" || viewId === "meter-checking-view");
    const isVR = (viewId === "vr-calculation" || viewId === "vr-calculation-view");
    const isDashboard = (viewId === "dc-dashboard" || viewId === "dc-dashboard-view");

    document.querySelectorAll(".revenue-header-menu-item").forEach(el => el.style.display = isRevenue ? "block" : "none");
    document.querySelectorAll(".mobile-update-header-menu-item").forEach(el => el.style.display = isMobile ? "block" : "none");
    document.querySelectorAll(".meter-checking-header-menu-item").forEach(el => el.style.display = isMeter ? "block" : "none");
    document.querySelectorAll(".vr-header-menu-item").forEach(el => el.style.display = isVR ? "block" : "none");
    document.querySelectorAll(".dc-dashboard-header-menu-item").forEach(el => el.style.display = isDashboard ? "block" : "none");

    const staffAdmin = document.getElementById("staff-admin-header-menu-item");
    if (staffAdmin) staffAdmin.style.display = isRevenue ? "block" : "none";
}

function showToast(msg, type) {
    const toast = document.getElementById("toast-notif");
    if (!toast) return;
    toast.textContent = msg;
    toast.style.background = (type === "error") ? "#ef4444" : "#10b981";
    toast.style.display = "block";
    setTimeout(() => { toast.style.display = "none"; }, 3000);
}

// =====================================================================
// 6. BIJLEE BILL CALCULATOR (DYNAMIC UI & BACKEND BRIDGE)
// =====================================================================
function onBillCalculatorCategoryChange() {
    const cat = document.getElementById("bc-category") ? document.getElementById("bc-category").value : "";
    const tfWrap = document.getElementById("bc-tariffcode-wrap");
    const tfSelect = document.getElementById("bc-tariffcode");
    const fieldsDiv = document.getElementById("bc-fields");
    const resultDiv = document.getElementById("bc-result");

    if (resultDiv) resultDiv.innerHTML = "";
    if (!cat) {
        if (tfWrap) tfWrap.style.display = "none";
        if (fieldsDiv) fieldsDiv.innerHTML = "";
        return;
    }

    if (cat === "LV1" || cat === "LV2") {
        if (tfWrap) tfWrap.style.display = "none";
        renderBillCalculatorFields();
    } else {
        if (tfWrap) tfWrap.style.display = "block";
        if (tfSelect) tfSelect.innerHTML = `<option value="${cat}-STD">${cat} Standard Supply</option>`;
        renderBillCalculatorFields();
    }
}

function renderBillCalculatorFields() {
    const cat = document.getElementById("bc-category") ? document.getElementById("bc-category").value : "";
    const fieldsDiv = document.getElementById("bc-fields");
    if (!fieldsDiv) return;

    if (cat === "LV1" || cat === "LV2" || cat === "LV3" || cat === "LV6") {
        fieldsDiv.innerHTML = `
            <div style="margin-top:10px;">
                <label style="display:block; font-size:0.62rem; font-weight:900; color:#1d4ed8; margin-bottom:4px;">CONSUMED UNITS (KWH)</label>
                <input id="bc-units" type="number" inputmode="numeric" class="ivrs-input" placeholder="e.g. 150" style="text-align:center;">
            </div>
            <div style="margin-top:10px;">
                <label style="display:block; font-size:0.62rem; font-weight:900; color:#1d4ed8; margin-bottom:4px;">SANCTIONED LOAD (KW)</label>
                <input id="bc-load-kw" type="number" inputmode="numeric" class="ivrs-input" placeholder="e.g. 2" value="1" style="text-align:center;">
            </div>
        `;
    } else if (cat === "LV4") {
        fieldsDiv.innerHTML = `
            <div style="margin-top:10px;">
                <label style="display:block; font-size:0.62rem; font-weight:900; color:#1d4ed8; margin-bottom:4px;">CONSUMED UNITS (KWH)</label>
                <input id="bc-units" type="number" inputmode="numeric" class="ivrs-input" placeholder="e.g. 1000" style="text-align:center;">
            </div>
            <div style="margin-top:10px;">
                <label style="display:block; font-size:0.62rem; font-weight:900; color:#1d4ed8; margin-bottom:4px;">CONTRACT DEMAND / LOAD (HP)</label>
                <input id="bc-load-hp" type="number" inputmode="numeric" class="ivrs-input" placeholder="e.g. 15" value="10" style="text-align:center;">
            </div>
        `;
    } else if (cat === "LV5") {
        fieldsDiv.innerHTML = `
            <div style="margin-top:10px;">
                <label style="display:block; font-size:0.62rem; font-weight:900; color:#1d4ed8; margin-bottom:4px;">PUMP CAPACITY (HP)</label>
                <input id="bc-load-hp" type="number" inputmode="numeric" class="ivrs-input" placeholder="e.g. 5" value="5" style="text-align:center;">
            </div>
            <div style="margin-top:10px; display:flex; align-items:center; gap:8px;">
                <input id="bc-flat-rate" type="checkbox" style="width:18px; height:18px;" onchange="toggleLv5MeteredInput(this.checked)">
                <label for="bc-flat-rate" style="font-size:0.75rem; font-weight:800; color:#1e293b;">Flat Rate Connection (Unmetered)</label>
            </div>
            <div id="bc-lv5-units-wrap" style="margin-top:10px;">
                <label style="display:block; font-size:0.62rem; font-weight:900; color:#1d4ed8; margin-bottom:4px;">CONSUMED UNITS (KWH)</label>
                <input id="bc-units" type="number" inputmode="numeric" class="ivrs-input" placeholder="e.g. 400" style="text-align:center;">
            </div>
        `;
    }
}

function toggleLv5MeteredInput(isFlat) {
    const wrap = document.getElementById("bc-lv5-units-wrap");
    if (wrap) wrap.style.display = isFlat ? "none" : "block";
}

async function calculateBillEstimate() {
    const categoryEl = document.getElementById("bc-category");
    const resultDiv = document.getElementById("bc-result");
    if (!categoryEl || !categoryEl.value) {
        alert("Kripya Category select kijiye.");
        return;
    }

    const category = categoryEl.value;
    const units = document.getElementById("bc-units") ? Number(document.getElementById("bc-units").value) || 0 : 0;
    const loadKw = document.getElementById("bc-load-kw") ? Number(document.getElementById("bc-load-kw").value) || 1 : 1;
    const loadHp = document.getElementById("bc-load-hp") ? Number(document.getElementById("bc-load-hp").value) || 1 : 1;
    const isFlat = document.getElementById("bc-flat-rate") ? document.getElementById("bc-flat-rate").checked : false;

    if (resultDiv) {
        resultDiv.innerHTML = '<div class="app-sync-spinner"></div><p style="text-align:center; font-size:12px; font-weight:800; color:#0d9488; margin-top:8px;">Calculating Bill (Server Engine)...</p>';
    }

    const res = await postMasterApi("calculateBillEstimate", {
        category: category,
        units: units,
        load_kw: loadKw,
        load_hp: loadHp,
        is_flat_rate: isFlat
    });

    if (res.status !== "success") {
        if (resultDiv) resultDiv.innerHTML = `<p style="color:#dc2626; font-weight:800; text-align:center;">Error: ${res.message || "Failed"}</p>`;
        return;
    }

    const data = res.billing_breakdown;
    if (resultDiv) {
        resultDiv.innerHTML = `
            <div style="background:#ffffff; border:2px solid #0d9488; border-radius:16px; padding:16px; margin-top:12px; box-shadow:0 8px 20px rgba(13,148,136,0.12);">
                <div style="font-size:14px; font-weight:900; color:#0f766e; text-align:center; border-bottom:1px solid #e2e8f0; padding-bottom:8px;">BILL ESTIMATE (MPERC TARIFF)</div>
                <div style="display:flex; justify-content:space-between; margin-top:10px; font-size:13px; font-weight:700;"><span>Energy Charge:</span><span>₹${data.energy_charge}</span></div>
                <div style="display:flex; justify-content:space-between; margin-top:6px; font-size:13px; font-weight:700;"><span>Fixed Charge:</span><span>₹${data.fixed_charge}</span></div>
                <div style="display:flex; justify-content:space-between; margin-top:6px; font-size:13px; font-weight:700;"><span>FCA Charge:</span><span>₹${data.fca_charge}</span></div>
                <div style="display:flex; justify-content:space-between; margin-top:6px; font-size:13px; font-weight:700;"><span>Electricity Duty:</span><span>₹${data.electricity_duty}</span></div>
                <div style="display:flex; justify-content:space-between; margin-top:12px; font-size:16px; font-weight:900; color:#000; border-top:2px solid #0d9488; padding-top:8px;"><span>Total Payable:</span><span>₹${data.total_payable}</span></div>
            </div>
        `;
    }
}

// =====================================================================
// 7. PROGRESS REPORT & REVENUE RECONCILIATION ENGINE
// =====================================================================
function setProgressModule(mod) {
    document.querySelectorAll(".report-tile").forEach(el => el.classList.remove("active"));
    const activeTile = document.querySelector(`.report-tile.${mod.toLowerCase()}`);
    if (activeTile) activeTile.classList.add("active");

    const picker = document.getElementById("progress-report-picker");
    const chip = document.getElementById("progress-report-chip");
    if (picker) picker.style.display = "none";
    if (chip) chip.style.display = "flex";

    refreshSummary();
}

function showProgressReportPicker() {
    const picker = document.getElementById("progress-report-picker");
    const chip = document.getElementById("progress-report-chip");
    if (picker) picker.style.display = "flex";
    if (chip) chip.style.display = "none";
}

function setMode(mode) {
    currentProgressMode = mode;
    document.getElementById("opt-daily").classList.toggle("active", mode === "DAILY");
    document.getElementById("opt-monthly").classList.toggle("active", mode === "MONTHLY");
    refreshSummary();
}

async function refreshSummary() {
    const content = document.getElementById("summary-content");
    const dateInput = document.getElementById("report-date");
    const dateVal = dateInput ? dateInput.value : "";

    if (!content) return;
    content.innerHTML = '<div class="app-sync-spinner"></div><p style="text-align:center; font-weight:800; color:#0d9488; margin-top:8px;">Loading Progress Report...</p>';

    const dcs = (currentScope === "CIRCLE") ? Object.values(DIVISION_DATA).flat() :
                (currentScope === "DIVISION") ? (DIVISION_DATA[currentDivision] || []) : [currentDC];

    const res = await postMasterApi("getLiveRevenueDailySummary", {
        date: dateVal,
        dc_names: dcs.join(",")
    });

    if (res && res.status === "success" && Array.isArray(res.rows)) {
        renderProgressSummaryTable(res.rows);
    } else {
        content.innerHTML = '<div style="text-align:center; padding:20px; font-weight:800; color:#64748b;">Data nahi mila. Kripya doosri date chunein.</div>';
    }
}

function renderProgressSummaryTable(rows) {
    const content = document.getElementById("summary-content");
    if (!content) return;

    let totalPaidCount = 0;
    let totalPaidAmt = 0;

    let rowsHtml = rows.map(r => {
        totalPaidCount += Number(r.paid_count) || 0;
        totalPaidAmt += Number(r.paid_amount) || 0;
        return `
            <div class="summary-table-row">
                <div style="text-align:left; padding-left:8px; font-weight:900;">${r.dc_name}</div>
                <div>${r.paid_count || 0}</div>
                <div style="color:#166534; font-weight:900;">₹${(r.paid_amount || 0).toLocaleString('en-IN')}</div>
            </div>
        `;
    }).join("");

    content.innerHTML = `
        <div class="summary-wrapper">
            <div class="summary-table-header">
                <div style="text-align:left; padding-left:8px;">DC / UNIT</div>
                <div>PAID COUNT</div>
                <div>AMOUNT (₹)</div>
            </div>
            ${rowsHtml}
            <div class="summary-table-row blue-bold">
                <div style="text-align:left; padding-left:8px; font-weight:900;">TOTAL</div>
                <div>${totalPaidCount}</div>
                <div style="color:#166534; font-weight:900;">₹${totalPaidAmt.toLocaleString('en-IN')}</div>
            </div>
        </div>
    `;
}

// =====================================================================
// 8. VOLTAGE REGULATION (VR) ENGINE
// =====================================================================
function vrSetLineType(type) {
    const cond = document.getElementById("vr-conductor-type");
    if (!cond) return;
    if (type === "lt") {
        cond.innerHTML = `<option value="SQUIRREL">Squirrel</option><option value="WEASEL">Weasel</option><option value="RABBIT">Rabbit</option>`;
    } else if (type === "11kv") {
        cond.innerHTML = `<option value="WEASEL">Weasel</option><option value="RABBIT">Rabbit</option><option value="RACCOON" selected>Raccoon</option><option value="DOG">Dog</option>`;
    } else {
        cond.innerHTML = `<option value="RACCOON" selected>Raccoon</option><option value="DOG">Dog</option>`;
    }
}

async function vrExecuteCalculationBackend(nodesList, lineType, conductorType) {
    return await postMasterApi("calculateVR", {
        line_type: lineType,
        conductor: conductorType,
        nodes: nodesList
    });
}

// =====================================================================
// 9. EVENT LISTENERS INITIALIZATION
// =====================================================================
document.addEventListener("DOMContentLoaded", () => {
    switchView("home");
    vrSetLineType("33kv");
    console.log("Seoni Circle App v5.1 Connected to Unified Master Gateway");
});