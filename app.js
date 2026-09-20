/**
 * =====================================================================
 * SEONI CIRCLE APP - UNIFIED MASTER CLIENT ENGINE (app.js)
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
    async submitRevenuePayment(data) { return this.post("submitRevenuePayment", data); },
    async submitMobileUpdate(data) { return this.post("submitMobileUpdate", data); },
    async getMobileSummary(dc = "") { return this.get("getMobileSummary", { dc: dc }); }
};

const divisionConfigs = {
    "DIVISION SEONI": {
        colorClass: "bg-blue-grad",
        themeColor: "#2563eb",
        themeGradient: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)",
        showSpecialActions: false,
        dcs: [
            { name: "ARI", csvUrl: "" },
            { name: "BADALPAR", csvUrl: "" },
            { name: "BANDOL", csvUrl: "" },
            { name: "BARGHAT", csvUrl: "https://docs.google.com/spreadsheets/d/1b5g3VBlKjCiOX0cfE5Na-jyRY4cPCjrIJIsU3YozG_U/export?format=csv&gid=0" },
            { name: "DHARNA", csvUrl: "" },
            { name: "GOPALGANJ", csvUrl: "" },
            { name: "KANHIWADA", csvUrl: "" },
            { name: "KEOLARI", csvUrl: "" },
            { name: "KHAIRAPALARI", csvUrl: "" },
            { name: "KURAI", csvUrl: "https://docs.google.com/spreadsheets/d/15c2CHolan0YVYh5Hwe4akn1YNk1SUhhLVa24h9ZBQbU/export?format=csv&gid=0" },
            { name: "MUNGWANI", csvUrl: "" },
            { name: "PANDIYA CHHAPARA", csvUrl: "" },
            { name: "SEONI (T)", csvUrl: "https://docs.google.com/spreadsheets/d/1ugB6evAfEL0t7ffzhmv1G8vwRtdJmz3fsQrt92sWrvM/export?format=csv&gid=0" },
            { name: "SEONI (RES)", csvUrl: "https://docs.google.com/spreadsheets/d/12d4nBlUJ5MoamEZdtNteTSixTt9UdvbrPmjS9tBRUw8/export?format=csv&gid=0" },
            { name: "UGALI", csvUrl: "" }
        ]
    },
    "DIVISION LAKHNADON": {
        colorClass: "bg-orange-grad",
        themeColor: "#f59e0b",
        themeGradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
        showSpecialActions: true,
        dcs: [
            { name: "ADEGAON", csvUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTMkEMNGnfv0_jHM12lAl34sD8kJLWPbLuA8WGhKH_smPfH3aDdmVrwbtyyPJZuD6KK4m6quw-q9MWN/pub?output=csv" },
            { name: "CHHAPARA-1", csvUrl: "https://docs.google.com/spreadsheets/d/1ehSaUQyrV1ZzwH0lbdhLdXRYkPdapdm5hhu0Gz0vulk/export?format=csv&gid=0" },
            { name: "CHHAPARA-2", csvUrl: "https://docs.google.com/spreadsheets/d/1TvhGlARSxZVMq5GYDZEGAHuV6vBXRKxe_nMun4dUby0/export?format=csv&gid=0" },
            { name: "DHANORA", csvUrl: "https://docs.google.com/spreadsheets/d/1qNgLx9o6hp4nwLGaCwy5DRW8xmh6eaNCoysbbH5bL1o/export?format=csv&gid=0" },
            { name: "DHUMA", csvUrl: "https://docs.google.com/spreadsheets/d/1T7kw5hqmmsGQFUQGmSmV0g6_wFKxxA8UeFVJzR0WwAs/export?format=csv&gid=0" },
            { name: "GANESHGANJ", csvUrl: "https://docs.google.com/spreadsheets/d/1jQJPvuEn4NZZRyUf-2ye7skeD6cMdLSrzx7aBTiDmR0/export?format=csv&gid=0" },
            { name: "GHANSORE", csvUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRrnZZ4FhdFSpFM2NfiTGAxbkUa9OQin4VQW9t06bAzRzjHZd_F4mVc3_vv4XxXPWSF_p78YoVIJI5Y/pub?output=csv" },
            { name: "KEDARPUR", csvUrl: "https://docs.google.com/spreadsheets/d/145bjD_AoAKWnTfzSaVAXoFpq9cZooSoM8jl0JKBfDkw/export?format=csv&gid=0" },
            { name: "LAKHNADON", csvUrl: "https://docs.google.com/spreadsheets/d/1_r5WgGV9bs-aed86dZLOlDKmK5g9J7qiGsmQAqDE1as/export?format=csv&gid=0" }
        ]
    }
};

let activeDiv = "", activeDC = "", activeGrad = "bg-teal-grad", currentData = null;
let viewStack = ["home"];

function getDivisionConfig(name) { return divisionConfigs[name] || null; }
function getDivisionDcNames(name) {
    const c = getDivisionConfig(name);
    return c && c.dcs ? c.dcs.map(d => d.name) : [];
}
function normalizeDcName(dc) { return String(dc || "").toUpperCase().trim(); }

function switchView(viewId, pushHistory = true) {
    const rawId = viewId.replace("-view", "");
    const views = document.querySelectorAll("main.view");
    let found = false;

    views.forEach(v => {
        if (v.id === `${rawId}-view` || v.id === rawId) {
            v.classList.add("active");
            v.style.display = "block";
            found = true;
        } else {
            v.classList.remove("active");
            v.style.display = "none";
        }
    });
    if (!found) return;

    if (pushHistory) {
        if (viewStack[viewStack.length - 1] !== rawId) {
            viewStack.push(rawId);
        }
    }

    const backBtn = document.getElementById("back-btn");
    if (backBtn) {
        backBtn.style.display = (rawId === "home") ? "none" : "flex";
    }

    window.scrollTo(0, 0);
}

function handleAppBack() {
    if (viewStack.length > 1) {
        viewStack.pop();
        const prev = viewStack[viewStack.length - 1] || "home";
        switchView(prev, false);
    } else {
        switchView("home", false);
    }
}

function showDivision(name, colorClass) {
    activeDiv = name.trim().toUpperCase();
    const conf = getDivisionConfig(activeDiv);
    activeGrad = conf?.colorClass || colorClass || "bg-teal-grad";
    document.documentElement.style.setProperty("--theme-color", conf?.themeColor || "#0d9488");
    document.documentElement.style.setProperty("--theme-grad", conf?.themeGradient || "linear-gradient(135deg, #0d9488 0%, #0f766e 100%)");

    switchView("dc-selection");

    const special = document.getElementById("lakhnadon-special-actions");
    if (special) special.style.display = conf?.showSpecialActions ? "block" : "none";

    const menu = document.getElementById("dc-menu");
    if (menu) {
        menu.innerHTML = "";
        getDivisionDcNames(activeDiv).forEach((dc) => {
            const item = document.createElement("div");
            item.className = "option-item";
            item.innerText = dc;
            item.onclick = () => {
                activeDC = normalizeDcName(dc);
                const label = document.getElementById("selected-dc-label");
                if (label) label.innerText = dc;
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
    if (modal) modal.classList.add("show-modal");
}

function closePwdModal() {
    const modal = document.getElementById("pwd-modal");
    if (modal) modal.classList.remove("show-modal");
}

function verifyPassword() {
    const pwd = document.getElementById("pwd-input")?.value;
    if (pwd === "AE123" || pwd === "JE12345") {
        closePwdModal();
        showToast("Password Verified!", true);
        switchView("summary");
    } else {
        showToast("Galat Password!", false);
    }
}

function openGpsCameraFlow() {
    const modal = document.getElementById("gps-camera-status-modal");
    if (modal) modal.classList.add("show-modal");
}

function calculateBillUI() {
    const cat = document.getElementById("bc-category")?.value || "LV1";
    const units = Number(document.getElementById("bc-units")?.value || 0);
    const load = Number(document.getElementById("bc-load")?.value || 1);

    if (units <= 0) {
        return showToast("Units enter karein", false);
    }

    let bill = 0;
    if (cat === "LV1") {
        bill = (units <= 50) ? (units * 4.25 + 95 * load) : (units * 6.5 + 190 * load);
    } else {
        bill = units * 7.5 + 200 * load;
    }

    const res = document.getElementById("bc-result");
    if (res) {
        res.innerHTML = `
            <div style="background:#f0fdf4; border:1.5px solid #86efac; border-radius:14px; padding:12px; text-align:center;">
                <div style="color:#166534; font-size:0.75rem; font-weight:850;">ESTIMATED BILL</div>
                <div style="color:#15803d; font-size:1.4rem; font-weight:950; margin-top:4px;">₹ ${Math.round(bill)}</div>
            </div>
        `;
    }
}

async function performSearch() {
    const v = document.getElementById("search-ivrs").value.trim();
    if (v.length !== 10) return showToast("Enter 10 digit IVRS", false);
    
    document.getElementById("res-ivrs").innerText = v;
    document.getElementById("res-name").innerText = "Sample Consumer";
    document.getElementById("res-old").innerText = "98XXXXXXXX";
    document.getElementById("res-addr").innerText = activeDC || "Seoni";
    
    document.getElementById("result-box").style.display = "block";
    document.getElementById("submit-btn").style.display = "block";
}

async function submitToSheet() {
    const n = document.getElementById("new-mobile").value.trim();
    if (n.length !== 10) return showToast("Enter 10 Digit No", false);
    
    showToast("Submitting Mobile No...", true);
    try {
        const res = await MasterAPI.submitMobileUpdate({
            ivrs: document.getElementById("res-ivrs").innerText,
            correct_mobile: n,
            dc: activeDC,
            division: activeDiv
        });
        showToast("Mobile Number Updated Successfully!", true);
        document.getElementById("new-mobile").value = "";
    } catch (e) {
        showToast("Updated Locally!", true);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    switchView("home", false);
});