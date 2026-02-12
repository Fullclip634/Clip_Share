// Shared Storage Endpoint
const BASE_URL = "https://api.restful-api.dev/objects/ff8081819782e69e019c50a5d79d639f";
// Using AllOrigins Proxy to bypass any CORS or network blocks on the user's browser
const PROXY_URL = `https://api.allorigins.win/get?url=${encodeURIComponent(BASE_URL)}&timestamp=${Date.now()}`;

// DOM Elements
const codeInput = document.getElementById('code-input');
const btnSave = document.getElementById('btn-save');
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
        statusMsg.innerText = "Connecting to cloud...";
    }

    try {
        console.log("Fetching via proxy:", PROXY_URL);
        const response = await fetch(PROXY_URL);

        if (!response.ok) {
            throw new Error(`Proxy Error (${response.status})`);
        }

        const wrapper = await response.json();
        const data = JSON.parse(wrapper.contents); // AllOrigins wraps the result in 'contents'

        console.log("Data received via proxy:", data);

        if (data && data.data && typeof data.data.code !== 'undefined') {
            if (codeInput) codeInput.value = data.data.code;
            if (statusMsg) {
                statusMsg.innerText = "Synced";
                statusMsg.style.color = "#10b981";
                setTimeout(() => statusMsg.classList.add('hidden'), 2000);
            }
        }
    } catch (err) {
        console.error("Load Error:", err);
        if (statusMsg) {
            statusMsg.innerText = "Fetch Error: Use a VPN or check firewall.";
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

// Spin Animation
const style = document.createElement('style');
style.innerHTML = `
    @keyframes spin { 100% { transform:rotate(360deg); } }
    .spin { animation: spin 1s linear infinite; }
`;
document.head.appendChild(style);
