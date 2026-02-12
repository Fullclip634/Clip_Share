// Check if lz-string is loaded
if (typeof LZString === 'undefined') {
    console.error("LZString library not found!");
}

// DOM Elements
const codeInput = document.getElementById('code-input');
const codeOutput = document.getElementById('code-output');
const btnGenerate = document.getElementById('btn-generate');
const btnCopy = document.getElementById('btn-copy');
const btnShorten = document.getElementById('btn-shorten');
const errorMsg = document.getElementById('error-msg');
const editMode = document.getElementById('edit-mode');
const viewMode = document.getElementById('view-mode');
const windowTitle = document.getElementById('window-title');
const viewControls = document.getElementById('view-controls');
const lblCopy = document.getElementById('lbl-copy');
const lblShorten = document.getElementById('lbl-shorten');

// Initialize Icons
lucide.createIcons();

// --- Main Logic ---

// Check URL for code on load
window.addEventListener('load', () => {
    const hash = window.location.hash.substring(1); // Remove '#'

    if (hash) {
        loadSnippet(hash);
    } else {
        showEditor();
    }
});

function showEditor() {
    editMode.classList.remove('hidden');
    viewMode.classList.add('hidden');
    viewControls.classList.add('hidden');
    windowTitle.textContent = "NEW SNIPPET";
}

function loadSnippet(compressedCode) {
    try {
        const decompressed = LZString.decompressFromEncodedURIComponent(compressedCode);

        if (decompressed) {
            // Show View Mode
            editMode.classList.add('hidden');
            viewMode.classList.remove('hidden');
            viewControls.classList.remove('hidden');

            codeOutput.textContent = decompressed;
            windowTitle.textContent = "VIEW SNIPPET";

            // Store for copying
            window.currentCode = decompressed;
        } else {
            alert("Invalid Snippet URL");
            showEditor();
        }
    } catch (e) {
        console.error(e);
        alert("Failed to load snippet");
        showEditor();
    }
}

// --- Event Listeners ---

btnGenerate.addEventListener('click', () => {
    const code = codeInput.value;

    if (!code.trim()) {
        errorMsg.classList.remove('hidden');
        setTimeout(() => errorMsg.classList.add('hidden'), 3000);
        return;
    }

    // Compress
    const compressed = LZString.compressToEncodedURIComponent(code);

    // Redirect to view mode (by changing hash)
    window.location.hash = compressed;
});

// Detect hash change (to handle back/forward buttons)
window.addEventListener('hashchange', () => {
    const hash = window.location.hash.substring(1);
    if (hash) {
        loadSnippet(hash);
    } else {
        showEditor();
        codeInput.value = ''; // Clear editor on new
    }
});

btnCopy.addEventListener('click', () => {
    if (window.currentCode) {
        navigator.clipboard.writeText(window.currentCode);

        // Visual Feedback
        const originalText = lblCopy.textContent;
        lblCopy.textContent = "Copied!";
        btnCopy.classList.add('btn-success'); // You can add a green class if you want

        setTimeout(() => {
            lblCopy.textContent = originalText;
            btnCopy.classList.remove('btn-success');
        }, 2000);
    }
});

// TinyURL Integration
let shortUrlCache = "";

btnShorten.addEventListener('click', async () => {
    // If we already have a short URL, copy it
    if (shortUrlCache) {
        copyToClipboard(shortUrlCache, lblShorten, "Copied Short Link!");
        return;
    }

    const originalText = lblShorten.textContent;
    lblShorten.textContent = "Shortening...";

    try {
        const currentUrl = window.location.href;
        const response = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(currentUrl)}`);

        if (response.ok) {
            const shortUrl = await response.text();
            shortUrlCache = shortUrl; // Cache it
            copyToClipboard(shortUrl, lblShorten, "Copied Short Link!");
        } else {
            lblShorten.textContent = "Error!";
            setTimeout(() => lblShorten.textContent = originalText, 2000);
        }
    } catch (err) {
        console.error(err);
        lblShorten.textContent = "Failed";
        setTimeout(() => lblShorten.textContent = originalText, 2000);
    }
});

function copyToClipboard(text, labelElement, successText) {
    navigator.clipboard.writeText(text);
    const originalText = "Share Short Link"; // Hardcoded reset or save previous
    labelElement.textContent = successText;

    setTimeout(() => {
        labelElement.textContent = originalText;
    }, 2000);
}
