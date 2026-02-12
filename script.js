// Storage Configuration
const STORAGE_ID = "ff8081819782e69e019c510689846546";
const API_URL = `https://api.restful-api.dev/objects/${STORAGE_ID}`;
// Primary and Secondary Proxies in case one is blocked
const PROXY_1 = `https://api.allorigins.win/get?url=${encodeURIComponent(API_URL)}&timestamp=${Date.now()}`;
const PROXY_2 = `https://yacdn.org/proxy/${API_URL}`;

// DOM Elements
const codeInput = document.getElementById('code-input');
const btnSave = document.getElementById('btn-save');
const btnCopy = document.getElementById('btn-copy');
const btnPaste = document.getElementById('btn-paste');
const statusMsg = document.getElementById('status-msg');

// Initialize Lucide Icons
if (typeof lucide !== 'undefined') lucide.createIcons();

// --- 1. Load Data Logic ---
async function loadData() {
    if (statusMsg) {
        statusMsg.classList.remove('hidden');
        statusMsg.innerText = "Connecting...";
        statusMsg.style.color = "#6b7280";
    }

    let data = null;
    let methodUsed = "";

    try {
        // Try 1: Direct Fetch
        try {
            const resp = await fetch(API_URL);
            if (resp.ok) {
                data = await resp.json();
                methodUsed = "Direct";
            }
        } catch (e) { console.warn("Direct access failed."); }

        // Try 2: Proxy 1 (AllOrigins)
        if (!data) {
            try {
                const resp = await fetch(PROXY_1);
                if (resp.ok) {
                    const wrapper = await resp.json();
                    data = JSON.parse(wrapper.contents);
                    methodUsed = "Proxy 1";
                }
            } catch (e) { console.warn("Proxy 1 failed."); }
        }

        // Try 3: Proxy 2 (YACDN)
        if (!data) {
            try {
                const resp = await fetch(PROXY_2);
                if (resp.ok) {
                    data = await resp.json();
                    methodUsed = "Proxy 2";
                }
            } catch (e) { console.warn("Proxy 2 failed."); }
        }

        if (data && data.data) {
            let code = data.data.code || "";

            // Decompress if needed
            if (data.data.compressed === true) {
                try {
                    const decompressed = LZString.decompressFromBase64(code);
                    if (decompressed !== null) code = decompressed;
                } catch (e) { console.error("Decompression error"); }
            }

            if (codeInput) codeInput.value = code;
            if (statusMsg) {
                statusMsg.innerText = `Synced (${methodUsed})`;
                statusMsg.style.color = "#10b981";
                setTimeout(() => statusMsg.classList.add('hidden'), 3000);
            }
        } else {
            throw new Error("No data found in cloud.");
        }

    } catch (err) {
        console.error("Load Error:", err);
        if (statusMsg) {
            statusMsg.innerText = "Connection Error. Try refreshing or use a VPN.";
            statusMsg.style.color = "#ef4444";
        }
    }
}

// --- 2. Save Data Logic ---
async function saveData() {
    if (!btnSave) return;

    const code = codeInput ? codeInput.value : "";
    const originalContent = btnSave.innerHTML;

    btnSave.innerHTML = `<i data-lucide="loader-2" class="spin"></i> Syncing...`;
    if (typeof lucide !== 'undefined') lucide.createIcons();

    try {
        // Compress to avoid 500 errors and save space
        const compressed = LZString.compressToBase64(code);

        const response = await fetch(API_URL, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: "clipshare_v4",
                data: {
                    code: compressed,
                    compressed: true,
                    ts: Date.now()
                }
            })
        });

        if (!response.ok) throw new Error(`Sync Error (${response.status})`);

        btnSave.innerHTML = `<i data-lucide="check"></i> Saved!`;
        if (typeof lucide !== 'undefined') lucide.createIcons();
        setTimeout(() => btnSave.innerHTML = originalContent, 2000);

    } catch (err) {
        console.error("Save Error:", err);
        btnSave.innerText = "Sync Failed!";
        setTimeout(() => btnSave.innerHTML = originalContent, 3000);
    }
}

// Event Listeners
window.addEventListener('load', loadData);
if (btnSave) btnSave.addEventListener('click', saveData);

if (btnCopy) {
    btnCopy.addEventListener('click', () => {
        navigator.clipboard.writeText(codeInput.value);
        const original = btnCopy.innerHTML;
        btnCopy.innerHTML = `<i data-lucide="check"></i> Copied`;
        if (typeof lucide !== 'undefined') lucide.createIcons();
        setTimeout(() => btnCopy.innerHTML = original, 2000);
    });
}

if (btnPaste) {
    btnPaste.addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (codeInput) codeInput.value = text;
            const original = btnPaste.innerHTML;
            btnPaste.innerHTML = `<i data-lucide="check"></i> Pasted`;
            if (typeof lucide !== 'undefined') lucide.createIcons();
            setTimeout(() => btnPaste.innerHTML = original, 2000);
        } catch (e) { alert("Enable clipboard permissions in browser."); }
    });
}

// Helper Styles
const style = document.createElement('style');
style.innerHTML = `@keyframes spin { 100% { transform:rotate(360deg); } } .spin { animation: spin 1s linear infinite; }`;
document.head.appendChild(style);
