// Shared Storage Endpoint
const BIN_URL = "https://jsonblob.com/api/jsonBlob/1339116895186673664";

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
        statusMsg.innerText = "Loading shared code...";
    }

    try {
        console.log("Fetching from:", BIN_URL);
        const response = await fetch(BIN_URL);
        console.log("Response status:", response.status);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Data received:", data);

        if (data && typeof data.code !== 'undefined') {
            if (codeInput) codeInput.value = data.code;
            if (statusMsg) {
                statusMsg.innerText = "Loaded!";
                setTimeout(() => statusMsg.classList.add('hidden'), 2000);
            }
        } else {
            if (statusMsg) statusMsg.innerText = "Loaded (Empty)";
        }
    } catch (err) {
        console.error("Load Error:", err);
        if (statusMsg) {
            statusMsg.innerText = "Error: " + err.message;
            statusMsg.style.color = "red";
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
            console.log("Saving to:", BIN_URL);
            const response = await fetch(BIN_URL, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ code: code })
            });

            console.log("Save response status:", response.status);

            if (!response.ok) {
                throw new Error(`Save failed! status: ${response.status}`);
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
            btnSave.innerText = "Failed: " + err.message;
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
    @keyframes spin { 100% { -webkit-transform: rotate(360deg); transform:rotate(360deg); } }
    .spin { animation: spin 1s linear infinite; }
`;
document.head.appendChild(style);
