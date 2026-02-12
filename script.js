// Shared Storage Endpoint (Restful-API.dev)
const API_URL = "https://api.restful-api.dev/objects/ff8081819782e69e019c509f10ca6371";

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
        statusMsg.innerText = "Connecting...";
    }

    try {
        console.log("Fetching from:", API_URL);
        const response = await fetch(API_URL);
        console.log("Response status:", response.status);

        if (!response.ok) {
            throw new Error(`Connection Error (${response.status})`);
        }

        const data = await response.json();
        console.log("Data received:", data);

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
            statusMsg.innerText = "Sync Offline: " + err.message;
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
        btnSave.innerHTML = `<i data-lucide="loader-2" class="spin"></i> Saving...`;
        if (typeof lucide !== 'undefined') lucide.createIcons();

        try {
            console.log("Saving to:", API_URL);
            const response = await fetch(API_URL, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: "clipshare_v1",
                    data: { code: code }
                })
            });

            console.log("Save response status:", response.status);

            if (!response.ok) {
                throw new Error(`Sync Failed (${response.status})`);
            }

            // Success Feedback
            btnSave.innerHTML = `<i data-lucide="check"></i> Saved!`;
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
