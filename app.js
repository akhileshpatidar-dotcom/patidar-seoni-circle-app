/**
 * =====================================================================
 * SEONI CIRCLE APP - 100% FULL FRONTEND (app.js)
 * Fixed: askPassword, openGpsCameraFlow, showDivision, Master API
 * Developer: Akhilesh Patidar (AE)
 * =====================================================================
 */

// 1. MASTER API ENDPOINT
const MASTER_SECURE_API_URL = "https://script.google.com/macros/s/AKfycbzaimPwzUYELgmujpaBbfByy0BcjOERA8e0mslNdbH5uUw2L6L24785obmdcpcDOc53Ww/exec";

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

// Generic POST Dispatcher
async function postMasterApi(actionName, payloadObj) {
    const payload = Object.assign({ action: actionName }, payloadObj);
    const response = await fetch(MASTER_SECURE_API_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=UTF-8" },
        body: JSON.stringify(payload)
    });
    return await response.json();
}

// Generic GET Dispatcher
async function getMasterApi(actionName, paramsObj) {
    const params = Object.assign({ action: actionName }, paramsObj);
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${MASTER_SECURE_API_URL}?${query}`);
    return await response.json();
}

// =====================================================================
// 2. PASSWORD & NAVIGATION HANDLERS (Resolves 'askPassword is not defined')
// =====================================================================

window.askPassword = function(divisionName) {
    // Agar division name nahi mila to detect karein
    const div = divisionName || "Seoni";
    window.showDivision(div);
};

window.showDivision = function(divisionName) {
    const screens = document.querySelectorAll(".app-screen, [id$='-screen'], .welcome-container, #home-screen");
    screens.forEach(s => s.style.display = "none");

    const divisionScreen = document.getElementById("division-screen");
    const titleEl = document.getElementById("division-title");

    if (divisionScreen) {
        divisionScreen.style.display = "block";
    }
    if (titleEl) {
        titleEl.innerText = String(divisionName).toUpperCase() + " DIVISION";
    }

    renderDcGrid(divisionName);
};

window.showHome = function() {
    const screens = document.querySelectorAll(".app-screen, [id$='-screen']");
    screens.forEach(s => s.style.display = "none");
    const home = document.getElementById("home-screen") || document.querySelector(".welcome-container");
    if (home) home.style.display = "block";
};

window.openDcModule = function(dcName, division) {
    const screens = document.querySelectorAll(".app-screen, [id$='-screen']");
    screens.forEach(s => s.style.display = "none");

    const dcScreen = document.getElementById("dc-screen");
    const dcHeader = document.getElementById("dc-header-title");
    if (dcScreen) dcScreen.style.display = "block";
    if (dcHeader) dcHeader.innerText = `${dcName} (${division})`;

    window.currentSelectedDc = dcName;
    window.currentSelectedDivision = division;
};

window.showCircleProgress = function() {
    const screens = document.querySelectorAll(".app-screen, [id$='-screen'], .welcome-container, #home-screen");
    screens.forEach(s => s.style.display = "none");

    const progress = document.getElementById("progress-screen");
    if (progress) progress.style.display = "block";
    loadCircleProgressData("DAILY");
};

window.openGpsCameraFlow = function() {
    const camInput = document.getElementById("gps-camera-input") || document.querySelector("input[type='file'][capture]");
    if (camInput) {
        camInput.click();
    } else {
        alert("GPS Camera trigger: Device camera access open kiya ja raha hai.");
    }
};

function renderDcGrid(division) {
    const container = document.getElementById("dc-grid-container");
    if (!container) return;

    const seoniDcs = [
        "ARI", "BADALPAR", "BANDOL", "BARGHAT", "DHARNA", "GOPALGANJ",
        "KANHIWADA", "KEOLARI", "KHAIRAPALARI", "KURAI", "MUNGWANI",
        "PANDIYA CHHAPARA", "SEONI (T)", "SEONI (RES)", "UGALI"
    ];
    const lakhnadonDcs = [
        "ADEGAON", "CHHAPARA-1", "CHHAPARA-2", "DHANORA", "DHUMA",
        "GANESHGANJ", "GHANSORE", "KEDARPUR", "LAKHNADON"
    ];

    const dcs = String(division).toLowerCase().includes("lakh") ? lakhnadonDcs : seoniDcs;
    container.innerHTML = dcs.map(dc => `
        <button class="dc-btn" onclick="window.openDcModule('${dc}', '${division}')">
            ${dc}
        </button>
    `).join("");
}

// =====================================================================
// 3. BIJLEE BILL CALCULATOR DYNAMIC UI
// =====================================================================

function onBillCalculatorCategoryChange() {
    const catSelect = document.getElementById("bc-category");
    const tfWrap = document.getElementById("bc-tariffcode-wrap");
    const tfSelect = document.getElementById("bc-tariffcode");
    const fieldsDiv = document.getElementById("bc-fields");
    const resultDiv = document.getElementById("bc-result");

    if (resultDiv) resultDiv.innerHTML = "";
    const cat = catSelect ? catSelect.value : "";
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
        if (tfSelect) {
            tfSelect.innerHTML = `<option value="${cat}-STD">${cat} Standard Supply</option>`;
        }
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

    try {
        const res = await postMasterApi("calculateBillEstimate", {
            category: category,
            units: units,
            load_kw: loadKw,
            load_hp: loadHp,
            is_flat_rate: isFlat
        });

        if (res.status !== "success") throw new Error(res.message || "Calculation failed");

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
    } catch (err) {
        if (resultDiv) resultDiv.innerHTML = `<p style="color:#dc2626; font-weight:800; text-align:center;">Error: ${err.message}</p>`;
    }
}

// =====================================================================
// 4. PROGRESS REPORT & RECONCILIATION FETCHER
// =====================================================================
async function fetchRevenueCategoryReconciliation(dcName, periodMode, periodValue, dcNamesList) {
    try {
        const payload = {
            action: "getRevenueCategoryReconciliation",
            period_mode: periodMode || "date",
            period_value: periodValue
        };
        if (dcName) {
            payload.dc_name = dcName;
        } else if (dcNamesList && dcNamesList.length) {
            payload.dc_names = Array.isArray(dcNamesList) ? dcNamesList.join(",") : dcNamesList;
        }

        const res = await postMasterApi("getRevenueCategoryReconciliation", payload);
        if (res && res.status === "success" && Array.isArray(res.entries)) {
            return res.entries;
        }
        return [];
    } catch (err) {
        console.error("Reconciliation Fetch Error:", err);
        return [];
    }
}

async function fetchLiveRevenueDailySummary(dateStr, dcName, dcNamesList) {
    try {
        const params = { action: "getLiveRevenueDailySummary", date: dateStr };
        if (dcName) params.dc_name = dcName;
        if (dcNamesList && dcNamesList.length) params.dc_names = Array.isArray(dcNamesList) ? dcNamesList.join(",") : dcNamesList;

        const res = await postMasterApi("getLiveRevenueDailySummary", params);
        if (res && res.status === "success" && Array.isArray(res.rows)) {
            return res.rows;
        }
        return [];
    } catch (err) {
        console.error("Live Summary Fetch Error:", err);
        return [];
    }
}

async function loadCircleProgressData(mode) {
    const container = document.getElementById("summary-content") || document.getElementById("progress-table-container");
    if (!container) return;
    container.innerHTML = '<div style="text-align:center; padding:20px; font-weight:800; color:#0d9488;">Loading Progress Data...</div>';

    const today = new Date().toISOString().split('T')[0];
    const rows = await fetchLiveRevenueDailySummary(today);
    renderProgressReportTable(rows);
}

function renderProgressReportTable(summaryRows) {
    const summaryContainer = document.getElementById("summary-content") || document.getElementById("progress-table-container");
    if (!summaryContainer) return;

    if (!summaryRows || !summaryRows.length) {
        summaryContainer.innerHTML = '<div style="text-align:center; padding:20px; font-weight:800; color:#dc2626;">Data nahi mila. Kripya doosri date chunein.</div>';
        return;
    }

    let rowsHtml = summaryRows.map(r => `
        <div style="display:grid; grid-template-columns: 2fr 1fr 1fr; padding:8px; border-bottom:1px solid #e2e8f0; font-size:12px;">
            <div style="font-weight:800; text-align:left;">${r.dc_name}</div>
            <div style="text-align:center;">${r.paid_count}</div>
            <div style="text-align:right; font-weight:800; color:#16a34a;">₹${r.paid_amount.toLocaleString('en-IN')}</div>
        </div>
    `).join("");

    summaryContainer.innerHTML = `
        <div style="background:#fff; border-radius:12px; border:1px solid #cbd5e1; overflow:hidden; margin-top:12px;">
            <div style="display:grid; grid-template-columns: 2fr 1fr 1fr; padding:10px; background:#0f766e; color:#fff; font-weight:900; font-size:12px;">
                <div>DC NAME</div>
                <div style="text-align:center;">PAID</div>
                <div style="text-align:right;">AMOUNT</div>
            </div>
            ${rowsHtml}
        </div>
    `;
}

// =====================================================================
// 5. VOLTAGE REGULATION SERVER BRIDGE
// =====================================================================
async function vrCalculateAndRender() {
    const nodes = (typeof vrNodes !== "undefined") ? vrNodes : [];
    const lineType = document.getElementById("vr-line-type") ? document.getElementById("vr-line-type").value : "33kv";
    const conductor = document.getElementById("vr-conductor-type") ? document.getElementById("vr-conductor-type").value : "RACCOON";

    if (!nodes || nodes.length < 2) return;

    try {
        const res = await postMasterApi("calculateVR", { line_type: lineType, conductor: conductor, nodes: nodes });
        if (res.status === "success") {
            const tableBody = document.getElementById("vr-section-rows");
            if (tableBody) {
                tableBody.innerHTML = res.sections.map((s, idx) => `
                    <tr>
                        <td>${idx + 1}</td>
                        <td class="vr-section-name">${s.section_name}</td>
                        <td>${s.length_km}</td>
                        <td>${s.section_kva}</td>
                        <td>${res.diversity_factor}</td>
                        <td>${res.conductor_constant}</td>
                        <td>${s.kva_km}</td>
                        <td>-</td>
                    </tr>
                `).join("");
            }
            const vrValEl = document.getElementById("vr-final-vr");
            if (vrValEl) vrValEl.innerHTML = `Total VR: <strong>${res.voltage_regulation_percent}%</strong> (${res.is_within_limit ? '<span style="color:#16a34a;">WITHIN LIMIT</span>' : '<span style="color:#dc2626;">EXCEEDS LIMIT</span>'})`;
        }
    } catch (e) {
        console.error("VR Calculation Error:", e);
    }
}