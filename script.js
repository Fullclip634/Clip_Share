// Shared Storage Endpoint
const BIN_URL = "https://jsonblob.com/api/jsonBlob/1339116895186673664";

// DOM Elements
const codeInput = document.getElementById('code-input');
const btnSave = document.getElementById('btn-save');
const statusMsg = document.getElementById('status-msg');

// Initialize Icons
lucide.createIcons();

// --- Main Logic ---

// 1. Load Code on Startup
window.addEventListener('load', async () => {
    if (statusMsg) {
        statusMsg.classList.remove('hidden');
        statusMsg.innerText = "Loading shared code...";
    }

    try {
        const response = await fetch(BIN_URL);
        const data = await response.json();

        if (data && data.code) {
            if (codeInput) codeInput.value = data.code;
            if (statusMsg) {
                statusMsg.innerText = "Loaded!";
                setTimeout(() => statusMsg.classList.add('hidden'), 2000);
            }
        }
    } catch (err) {
        console.error(err);
        if (statusMsg) {
            statusMsg.innerText = "Error loading code.";
            statusMsg.style.color = "red";
        }
    }
});

// 2. Save Code
if (btnSave) {
    btnSave.addEventListener('click', async () => {
        const code = codeInput.value;

        // Visual Feedback
        const originalText = btnSave.innerHTML;
        btnSave.innerHTML = `<i data-lucide="loader-2" class="spin"></i> Saving...`;
        lucide.createIcons(); // Refresh icons for loader

        try {
            await fetch(BIN_URL, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ code: code })
            });

            // Success Feedback
            btnSave.innerHTML = `<i data-lucide="check"></i> Saved!`;
            lucide.createIcons();

            setTimeout(() => {
                btnSave.innerHTML = originalText;
                lucide.createIcons();
            }, 2000);

        } catch (err) {
            console.error(err);
            btnSave.innerText = "Failed";
            setTimeout(() => {
                btnSave.innerHTML = originalText;
                lucide.createIcons();
            }, 2000);
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
