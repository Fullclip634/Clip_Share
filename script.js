// Shared Storage Endpoint
const BASE_URL = "https://api.restful-api.dev/objects/ff8081819782e69e019c50a5d79d639f";
// Using AllOrigins Proxy to bypass any CORS or network blocks on the user's browser
const PROXY_URL = `https://api.allorigins.win/get?url=${encodeURIComponent(BASE_URL)}&timestamp=${Date.now()}`;

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

// 1. Load Code on Startup
window.addEventListener('load', async () => {
    if (statusMsg) {
        statusMsg.classList.remove('hidden');
        statusMsg.innerText = "Connecting...";
    }

    try {
        let data;
        try {
            // Try direct fetch first (fastest)
            console.log("Trying direct fetch...");
            const response = await fetch(BASE_URL);
            if (response.ok) {
                data = await response.json();
                console.log("Direct fetch success");
            } else {
                throw new Error("Direct fetch failed");
            }
        } catch (e) {
            // Fallback to proxy
            console.log("Using proxy fallback...");
            const response = await fetch(PROXY_URL);
            if (!response.ok) throw new Error(`Sync Error (${response.status})`);
            const wrapper = await response.json();
            data = JSON.parse(wrapper.contents);
            console.log("Proxy fetch success");
        }

        if (data && data.data && typeof data.data.code !== 'undefined') {
            if (codeInput) codeInput.value = data.data.code;
            if (statusMsg) {
                statusMsg.innerText = "Synced";
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

// 2. Save Code
if (btnSave) {
    btnSave.addEventListener('click', async () => {
        const code = codeInput ? codeInput.value : "";

        // Visual Feedback
        const originalText = btnSave.innerHTML;
        btnSave.innerHTML = `<i data-lucide="loader-2" class="spin"></i> Syncing...`;
        if (typeof lucide !== 'undefined') lucide.createIcons();

        try {
            console.log("Saving to:", BASE_URL);
            const response = await fetch(BASE_URL, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: "clipshare_v2",
                    data: { code: code }
                })
            });

            if (!response.ok) {
                // If direct PUT fails, maybe try to show why
                const errText = await response.text();
                throw new Error(`Sync Blocked (${response.status})`);
            }

            // Success Feedback
            btnSave.innerHTML = `<i data-lucide="check"></i> Synced!`;
            if (typeof lucide !== 'undefined') lucide.createIcons();

            setTimeout(() => {
                btnSave.innerHTML = originalText;
                if (typeof lucide !== 'undefined') lucide.createIcons();
            }, 2000);

        } catch (err) {
            console.error("Save Error:", err);
            btnSave.innerText = "Error: " + err.message;
            setTimeout(() => {
                btnSave.innerHTML = originalText;
                if (typeof lucide !== 'undefined') lucide.createIcons();
            }, 3000);
        }
    });
}

// 3. Quick Copy
if (btnCopy) {
    btnCopy.addEventListener('click', () => {
        const code = codeInput ? codeInput.value : "";
        navigator.clipboard.writeText(code);

        // Visual Feedback
        const originalText = btnCopy.innerHTML;
        btnCopy.innerHTML = `<i data-lucide="check"></i> Copied!`;
        if (typeof lucide !== 'undefined') lucide.createIcons();

        setTimeout(() => {
            btnCopy.innerHTML = originalText;
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }, 2000);
    });
}

// 4. Quick Paste
if (btnPaste) {
    btnPaste.addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (codeInput) {
                codeInput.value = text;

                // Visual Feedback
                const originalText = btnPaste.innerHTML;
                btnPaste.innerHTML = `<i data-lucide="check"></i> Pasted!`;
                if (typeof lucide !== 'undefined') lucide.createIcons();

                setTimeout(() => {
                    btnPaste.innerHTML = originalText;
                    if (typeof lucide !== 'undefined') lucide.createIcons();
                }, 2000);
            }
        } catch (err) {
            console.error("Paste Error:", err);
            btnPaste.innerText = "Error!";
            setTimeout(() => {
                btnPaste.innerHTML = `<i data-lucide="clipboard-paste"></i> Paste`;
                if (typeof lucide !== 'undefined') lucide.createIcons();
            }, 2000);
        }
    });
}

// Spin Animation
const style = document.createElement('style');
style.innerHTML = `
    @keyframes spin { 100% { transform:rotate(360deg); } }
    .spin { animation: spin 1s linear infinite; }
`;
document.head.appendChild(style);
