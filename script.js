// Shared Storage Endpoint (JSONBlob is better for large data)
const BLOB_URL = "https://jsonblob.com/api/jsonBlob/019c50fc-1297-7e47-89eb-0b7cb35969ca";
// Proxy for GET requests (to solve CORS blocks)
const GET_URL = `https://api.allorigins.win/get?url=${encodeURIComponent(BLOB_URL)}&timestamp=${Date.now()}`;

// DOM Elements
const codeInput = document.getElementById('code-input');
const btnSave = document.getElementById('btn-save');
const btnCopy = document.getElementById('btn-copy');
const btnPaste = document.getElementById('btn-paste');
const statusMsg = document.getElementById('status-msg');

// Initialize Icons
if (typeof lucide !== 'undefined') {
    lucide.createIcons();
}

// --- Main Logic ---

// 1. Load Data
window.addEventListener('load', async () => {
    if (statusMsg) {
        statusMsg.classList.remove('hidden');
        statusMsg.innerText = "Syncing...";
    }

    try {
        // We use proxy for GET to avoid CORS issues on load
        const response = await fetch(GET_URL);
        if (!response.ok) throw new Error("Sync unreachable");

        const wrapper = await response.json();
        const data = JSON.parse(wrapper.contents);

        if (data && typeof data.code !== 'undefined') {
            let finalCode = data.code;

            // Try decompression
            if (data.compressed === true) {
                const decompressed = LZString.decompressFromBase64(finalCode);
                if (decompressed) finalCode = decompressed;
            }

            if (codeInput) codeInput.value = finalCode;
            if (statusMsg) {
                statusMsg.innerText = "Ready";
                statusMsg.style.color = "#10b981";
                setTimeout(() => statusMsg.classList.add('hidden'), 2000);
            }
        }
    } catch (err) {
        console.error("Connect Error:", err);
        if (statusMsg) {
            statusMsg.innerText = "Sync Offline";
            statusMsg.style.color = "#ef4444";
        }
    }
});

// 2. Save Data
if (btnSave) {
    btnSave.addEventListener('click', async () => {
        const code = codeInput ? codeInput.value : "";

        const originalText = btnSave.innerHTML;
        btnSave.innerHTML = `<i data-lucide="loader-2" class="spin"></i> Syncing...`;
        if (typeof lucide !== 'undefined') lucide.createIcons();

        try {
            // Compress to save space and avoid 500 errors
            const compressed = LZString.compressToBase64(code);

            const response = await fetch(BLOB_URL, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: compressed,
                    compressed: true,
                    updatedAt: new Date().toISOString()
                })
            });

            if (!response.ok) throw new Error(`Server Error (${response.status})`);

            btnSave.innerHTML = `<i data-lucide="check"></i> Synced!`;
            if (typeof lucide !== 'undefined') lucide.createIcons();
            setTimeout(() => btnSave.innerHTML = originalText, 2000);

        } catch (err) {
            console.error("Save Error:", err);
            btnSave.innerText = "Sync Failed!";
            setTimeout(() => btnSave.innerHTML = originalText, 3000);
        }
    });
}

// 3. Simple Utils
if (btnCopy) {
    btnCopy.addEventListener('click', () => {
        navigator.clipboard.writeText(codeInput.value);
        const originalText = btnCopy.innerHTML;
        btnCopy.innerHTML = `<i data-lucide="check"></i> Copied`;
        if (typeof lucide !== 'undefined') lucide.createIcons();
        setTimeout(() => btnCopy.innerHTML = originalText, 2000);
    });
}

if (btnPaste) {
    btnPaste.addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            codeInput.value = text;
            const originalText = btnPaste.innerHTML;
            btnPaste.innerHTML = `<i data-lucide="check"></i> Pasted`;
            if (typeof lucide !== 'undefined') lucide.createIcons();
            setTimeout(() => btnPaste.innerHTML = originalText, 2000);
        } catch (e) { alert("Please allow clipboard access."); }
    });
}

// Animation
const style = document.createElement('style');
style.innerHTML = `@keyframes spin { 100% { transform:rotate(360deg); } } .spin { animation: spin 1s linear infinite; }`;
document.head.appendChild(style);
