const textInputTop = document.getElementById('text-input-top');
const textInputBottom = document.getElementById('text-input-bottom');
const textInputSubheading = document.getElementById('text-input-subheading');
const textInputMarkBottom = document.getElementById('text-input-mark-bottom');
const advancedToggle = document.getElementById('advanced-toggle');
const advancedInputs = document.getElementById('advanced-inputs');
const logoTextTop = document.getElementById('logo-text-top');
const logoTextSubheading = document.getElementById('logo-text-subheading');
const logoTextBottom = document.getElementById('logo-text-bottom');
const logoTextMarkBottom = document.getElementById('logo-text-mark-bottom');
const downloadBtn = document.getElementById('download-btn');
const logoContainer = document.getElementById('logo-container');
const previewCard = document.querySelector('.preview-card');
const MARK_BOTTOM_MAX_SIZE = 9;
const MARK_BOTTOM_MIN_SIZE = 3;
const SUBHEADING_MAX_SIZE = 13;
const SUBHEADING_MIN_SIZE = 7;
const BOTTOM_TEXT_MAX_SIZE = 30;
const BOTTOM_TEXT_MIN_SIZE = 1;

/**
 * Debounce function to limit the rate at which a function can fire.
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function fitTextToWidth(element, maxSize, minSize) {
    if (!element || element.clientWidth <= 0) return;

    let low = minSize;
    let high = maxSize;
    let best = minSize;

    while (high - low > 0.1) {
        const mid = (low + high) / 2;
        element.style.fontSize = `${mid}px`;

        if (element.scrollWidth <= element.clientWidth + 0.5) {
            best = mid;
            low = mid;
        } else {
            high = mid;
        }
    }

    element.style.fontSize = `${best.toFixed(2)}px`;
}

function fitMarkBottomText() {
    fitTextToWidth(logoTextMarkBottom, MARK_BOTTOM_MAX_SIZE, MARK_BOTTOM_MIN_SIZE);
}

function fitSubheadingText() {
    fitTextToWidth(logoTextSubheading, SUBHEADING_MAX_SIZE, SUBHEADING_MIN_SIZE);
}

function fitBottomText() {
    fitTextToWidth(logoTextBottom, BOTTOM_TEXT_MAX_SIZE, BOTTOM_TEXT_MIN_SIZE);
}

// Update top and bottom text as you type
textInputTop.addEventListener('input', (e) => {
    logoTextTop.textContent = e.target.value || "KOLEJ\nVOKASIONAL";
});

textInputSubheading.addEventListener('input', (e) => {
    logoTextSubheading.textContent = e.target.value || "KEMENTERIAN PENDIDIKAN MALAYSIA";
    fitSubheadingText();
});


textInputMarkBottom.addEventListener('input', (e) => {
    logoTextMarkBottom.textContent = e.target.value || "bersama membina masa depan";
    fitMarkBottomText();
});

advancedToggle.addEventListener('change', () => {
    const controls = document.querySelector('.controls');
    if (advancedToggle.checked) {
        controls.classList.add('has-advanced');
        advancedInputs.classList.remove('hidden');
        requestAnimationFrame(() => {
            advancedInputs.classList.add('expanded');
        });
    } else {
        advancedInputs.classList.remove('expanded');
        
        // Wait for the collapse animation to finish before removing the grid column
        const handleTransitionEnd = (event) => {
            // Check for properties that indicate the animation is done
            if (event.propertyName === 'opacity' || event.propertyName === 'max-height') {
                controls.classList.remove('has-advanced');
                advancedInputs.classList.add('hidden');
                advancedInputs.removeEventListener('transitionend', handleTransitionEnd);
            }
        };
        
        advancedInputs.addEventListener('transitionend', handleTransitionEnd);
    }
});

// Background swatches
const bgSwatches = document.querySelectorAll('.bg-swatch');
bgSwatches.forEach(button => {
    button.addEventListener('click', () => {
        bgSwatches.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        const bgType = button.dataset.bg;
        previewCard.classList.remove('bg-solid-white', 'bg-solid-black', 'bg-checkered-white', 'bg-checkered-black');
        previewCard.classList.add(`bg-${bgType}`);
    });
});

// Logo zoom toggle
logoContainer.addEventListener('click', () => {
    logoContainer.classList.toggle('zoomed');
});

// Combined resize handler with debouncing
const handleResize = debounce(() => {
    fitMarkBottomText();
    fitSubheadingText();
    fitBottomText();
}, 150);

window.addEventListener('resize', handleResize);
window.addEventListener('load', () => {
    if (!logoTextBottom.textContent.trim()) {
        logoTextBottom.textContent = "";
    }
    // Initial fitting
    fitMarkBottomText();
    fitSubheadingText();
    fitBottomText();
});

if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
        fitMarkBottomText();
        fitSubheadingText();
        fitBottomText();
    });
}

// Download Function
downloadBtn.addEventListener('click', () => {
    const originalBtnText = downloadBtn.innerHTML;
    downloadBtn.innerHTML = '<span>Menjana Logo...</span>';
    downloadBtn.style.opacity = '0.7';
    downloadBtn.disabled = true;

    // Increase render scale for a sharper exported PNG.
    // 5 is a good balance for HD quality without crashing mobile browsers.
    const exportScale = 5;

    html2canvas(logoContainer, {
        backgroundColor: null, // This makes the background transparent!
        scale: exportScale,
        useCORS: true,         // Helps with loading external fonts/images
        onclone: (clonedDoc) => {
            const clonedLogoContainer = clonedDoc.getElementById('logo-container');
            const clonedPreviewCard = clonedDoc.querySelector('.preview-card');
            const clonedMarkBottom = clonedDoc.getElementById('logo-text-mark-bottom');

            if (clonedLogoContainer && clonedPreviewCard) {
                // Export a tight, vertically centered crop of the logo only.
                clonedLogoContainer.style.paddingTop = '0';
                clonedLogoContainer.style.paddingBottom = '0px';
                clonedLogoContainer.style.marginTop = '0';
                clonedLogoContainer.style.marginBottom = '0';
                clonedLogoContainer.style.overflow = 'visible';
                clonedLogoContainer.style.setProperty('height', 'auto', 'important'); // Override !important
            }

            if (clonedMarkBottom) {
                // Keep text fully visible without adding extra bottom space.
                clonedMarkBottom.style.lineHeight = '1.2';
                clonedMarkBottom.style.paddingBottom = '2px';
            }
        }
    }).then(canvas => {
        // Create an invisible link to trigger the download
        const link = document.createElement('a');
        const top = logoTextTop.textContent.trim().replace(/\s+/g, '-');
        const bottom = logoTextBottom.textContent.trim().replace(/\s+/g, '-');
        link.download = `LogoKV-${bottom}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
        
        // Restore button state
        downloadBtn.innerHTML = originalBtnText;
        downloadBtn.style.opacity = '1';
        downloadBtn.disabled = false;
    }).catch(err => {
        console.error("Export failed:", err);
        downloadBtn.innerHTML = originalBtnText;
        downloadBtn.style.opacity = '1';
        downloadBtn.disabled = false;
    });
});
// Custom Beautiful Dropdown Logic
const suggestionsContainer = document.getElementById('kv-suggestions');

function updateSuggestions(val) {
    if (typeof kvListData === 'undefined') return;
    
    const filtered = kvListData.filter(kv => 
        kv.toLowerCase().includes(val.toLowerCase())
    ).slice(0, 10); // Limit to top 10 for performance/beauty

    suggestionsContainer.innerHTML = '';
    
    if (filtered.length > 0 && val.length > 0) {
        filtered.forEach(kvName => {
            const div = document.createElement('div');
            div.className = 'suggestion-item';
            div.textContent = kvName;
            div.addEventListener('click', () => {
                textInputBottom.value = kvName;
                logoTextBottom.textContent = kvName;
                fitBottomText();
                suggestionsContainer.classList.add('hidden');
            });
            suggestionsContainer.appendChild(div);
        });
        suggestionsContainer.classList.remove('hidden');
    } else {
        suggestionsContainer.classList.add('hidden');
    }
}

textInputBottom.addEventListener('input', (e) => {
    logoTextBottom.textContent = e.target.value || "";
    fitBottomText();
    updateSuggestions(e.target.value);
});

// Hide suggestions when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.dropdown-wrapper')) {
        suggestionsContainer.classList.add('hidden');
    }
});

// Show suggestions on focus if there's text
textInputBottom.addEventListener('focus', (e) => {
    if (e.target.value.length > 0) {
        updateSuggestions(e.target.value);
    }
});
