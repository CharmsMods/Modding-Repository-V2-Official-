/*
 * Copyright (c) 2025 Charm?
 *
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 *
 * SPDX-License-Identifier: MIT
 *
 * This file contains helper functions for the website frontend.
 */


// export-options-popup.js

// DOM Elements
let exportOptionsPopup;
let closeExportPopupButton;
let exportClientButton;
let exportBrowserButton;

// Initialize DOM elements when the document is loaded
document.addEventListener('DOMContentLoaded', () => {
    exportOptionsPopup = document.getElementById('export-options-popup');
    closeExportPopupButton = document.getElementById('close-export-popup');
    exportClientButton = document.getElementById('export-client-button');
    exportBrowserButton = document.getElementById('export-browser-button');

    if (exportOptionsPopup && closeExportPopupButton && exportClientButton && exportBrowserButton) {
        // Event listeners for closing the popup
        closeExportPopupButton.addEventListener('click', hideExportOptionsPopup);
        
        // Close popup if clicked outside content
        exportOptionsPopup.addEventListener('click', (event) => {
            if (event.target === exportOptionsPopup) {
                hideExportOptionsPopup();
            }
        });

        // Event listeners for export options
        exportClientButton.addEventListener('click', () => handleExportButtonClick('client'));
        exportBrowserButton.addEventListener('click', () => handleExportButtonClick('browser'));
    } else {
        const missingElements = [];
        if (!exportOptionsPopup) missingElements.push('export-options-popup');
        if (!closeExportPopupButton) missingElements.push('close-export-popup');
        if (!exportClientButton) missingElements.push('export-client-button');
        if (!exportBrowserButton) missingElements.push('export-browser-button');
        
        const errorMsg = `Missing required DOM elements: ${missingElements.join(', ')}`;
        console.error(errorMsg);
        if (window.updateConsoleLog) {
            window.updateConsoleLog(`[ERROR] ${errorMsg}`);
        }
    }
});

/**
 * Handles the export button click event.
 * @param {'client'|'browser'} exportType - The type of export to perform
 * @returns {Promise<void>}
 */
async function handleExportButtonClick(exportType) {
    try {
        if (typeof window.initiateZipDownload !== 'function') {
            throw new Error('Export functionality not initialized. Please refresh the page.');
        }
        
        hideExportOptionsPopup();
        await window.initiateZipDownload(exportType);
    } catch (error) {
        console.error('Export failed:', error);
        if (window.updateConsoleLog) {
            window.updateConsoleLog(`[ERROR] Export failed: ${error.message}`);
        }
        alert(`Export failed: ${error.message}`);
    }
}

/**
 * Shows the export options popup if it exists.
 * @returns {void}
 */
window.showExportOptionsPopup = () => {
    if (!exportOptionsPopup) {
        console.error('Export options popup element not found');
        return;
    }
    exportOptionsPopup.classList.add('active');
};

/**
 * Hides the export options popup if it exists.
 * @returns {void}
 */
function hideExportOptionsPopup() {
    if (!exportOptionsPopup) {
        console.error('Export options popup element not found');
        return;
    }
    exportOptionsPopup.classList.remove('active');
}

// Export functionality is now handled by initiateZipDownload in asset-list-page.js
// Ensure global functions for loading overlay are accessible or defined if they don't exist
// These might already be in asset-list-page.js, but defining them here as fallback/clarity
// It's crucial that these functions are actually implemented in asset-list-page.js
// If they are not, you would need to add them to asset-list-page.js
if (typeof window.showLoadingOverlay === 'undefined') {
    window.showLoadingOverlay = () => {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.classList.add('active');
        }
    };
}

if (typeof window.updateLoadingProgress === 'undefined') {
    window.updateLoadingProgress = (processed, total, message) => {
        const progressBar = document.getElementById('progress-bar');
        const progressPercentage = document.getElementById('progress-percentage');
        const loadingMessageDisplay = document.querySelector('#loading-overlay h2');

        if (progressBar && progressPercentage && loadingMessageDisplay) {
            const percentage = total > 0 ? Math.round((processed / total) * 100) : 0;
            progressBar.style.width = `${percentage}%`;
            progressPercentage.textContent = `${percentage}%`;
            loadingMessageDisplay.textContent = message;
        }
    };
}

if (typeof window.updateConsoleLog === 'undefined') {
    window.updateConsoleLog = (message) => {
        const consoleLog = document.getElementById('console-log');
        if (consoleLog) {
            consoleLog.textContent += message + '\n';
            consoleLog.scrollTop = consoleLog.scrollHeight; // Auto-scroll to bottom
        }
    };
}

if (typeof window.hideLoadingOverlayWithDelay === 'undefined') {
    window.hideLoadingOverlayWithDelay = (delay, finalMessage) => {
        const loadingMessageDisplay = document.querySelector('#loading-overlay h2');
        if (loadingMessageDisplay) {
            loadingMessageDisplay.textContent = finalMessage;
        }
        setTimeout(() => {
            const overlay = document.getElementById('loading-overlay');
            if (overlay) {
                overlay.classList.remove('active');
                // Optional: Clear console log after hiding
                const consoleLog = document.getElementById('console-log');
                if (consoleLog) {
                    consoleLog.textContent = '';
                }
            }
        }, delay);
    };
}