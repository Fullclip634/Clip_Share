// Storage Configuration
const STORAGE_ID = "ff8081819782e69e019c510689846546";
const API_URL = `https://api.restful-api.dev/objects/${STORAGE_ID}`;
// Proxies
const PROXY_1 = `https://api.allorigins.win/get?url=${encodeURIComponent(API_URL)}&timestamp=${Date.now()}`;

// DOM Elements
const codeInput = document.getElementById('code-input');
const btnSave = document.getElementById('btn-save');
const btnCopy = document.getElementById('btn-copy');
const btnPaste = document.getElementById('btn-paste');
const btnShare = document.getElementById('btn-share');
const statusMsg = document.getElementById('status-msg');

// Initialize Icons
if (typeof lucide !== 'undefined') lucide.createIcons();

// --- 1. Load Logic ---
async function loadData() {
    if (statusMsg) {
        statusMsg.classList.remove('hidden');
        statusMsg.innerText = "Syncing...";
    }

    // A. Check URL first (Priority)
    const urlParams = new URLSearchParams(window.location.search);
    const compressedUrlCode = urlParams.get('c');
    if (compressedUrlCode) {
        try {
            const decompressed = LZString.decompressFromEncodedURIComponent(compressedUrlCode);
            if (decompressed) {
                codeInput.value = decompressed;
                statusMsg.innerText = "Loaded from Link";
                statusMsg.style.color = "#10b981";
                setTimeout(() => statusMsg.classList.add('hidden'), 3000);
                return;
            }
        } catch (e) { console.error("URL Decompress fail"); }
    }

    // B. Check Cloud storage (Fallback)
    try {
        let data = null;
        try {
            const resp = await fetch(API_URL);
            if (resp.ok) data = await resp.json();
        } catch (e) {
            const resp = await fetch(PROXY_1);
            if (resp.ok) {
                const wrapper = await resp.json();
                data = JSON.parse(wrapper.contents);
            }
        }

        if (data && data.data) {
            let code = data.data.code || "";
            if (data.data.compressed) {
                const decompressed = LZString.decompressFromBase64(code);
                if (decompressed) code = decompressed;
            }
            codeInput.value = code;
            statusMsg.innerText = "Synced with Cloud";
            statusMsg.style.color = "#10b981";
            setTimeout(() => statusMsg.classList.add('hidden'), 3000);
        }
    } catch (err) {
        statusMsg.innerText = "Cloud Offline";
        statusMsg.style.color = "#6b7280";
    }
}

// --- 2. Share Logic (Bitly/TinyURL style) ---
async function generateLink() {
    if (!btnShare) return;
    const code = codeInput.value;
    const originalContent = btnShare.innerHTML;

    btnShare.innerHTML = `<i data-lucide="loader-2" class="spin"></i> Creating...`;
    if (typeof lucide !== 'undefined') lucide.createIcons();

    try {
        // 1. Compress
        const compressed = LZString.compressToEncodedURIComponent(code);
        // 2. Form long URL
        const baseUrl = window.location.href.split('?')[0];
        const longUrl = `${baseUrl}?c=${compressed}`;

        // 3. Shorten via TinyURL (No key needed)
        const response = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`);
        const shortUrl = await response.text();

        if (shortUrl.startsWith('http')) {
            await navigator.clipboard.writeText(shortUrl);
            btnShare.innerHTML = `<i data-lucide="check"></i> Link Copied!`;
        } else {
            throw new Error("Shorten failed");
        }
    } catch (err) {
        console.error(err);
        btnShare.innerText = "Save Fail: Data too big";
    }

    setTimeout(() => {
        btnShare.innerHTML = originalContent;
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }, 3000);
}

// --- 3. Cloud Sync (Best effort for small clips) ---
async function cloudSync() {
    if (!btnSave) return;
    const code = codeInput.value;
    const original = btnSave.innerHTML;
    btnSave.innerHTML = `<i data-lucide="loader-2" class="spin"></i> Syncing...`;
    if (typeof lucide !== 'undefined') lucide.createIcons();

    try {
        const compressed = LZString.compressToBase64(code);
        const response = await fetch(API_URL, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: "clipshare_final",
                data: { code: compressed, compressed: true, ts: Date.now() }
            })
        });

        if (!response.ok) throw new Error("500");
        btnSave.innerHTML = `<i data-lucide="check"></i> Synced Everywhere!`;
    } catch (e) {
        btnSave.innerText = "Cloud Full: Use 'Generate Link'";
    }
    setTimeout(() => {
        btnSave.innerHTML = original;
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }, 3000);
}

// Event Listeners
window.addEventListener('load', loadData);
if (btnSave) btnSave.addEventListener('click', cloudSync);
if (btnShare) btnShare.addEventListener('click', generateLink);

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
        } catch (e) { alert("Enable clipboard permissions."); }
    });
}

const style = document.createElement('style');
style.innerHTML = `@keyframes spin { 100% { transform:rotate(360deg); } } .spin { animation: spin 1s linear infinite; }`;
document.head.appendChild(style);
