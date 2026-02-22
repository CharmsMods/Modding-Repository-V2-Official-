/*
 * Copyright (c) 2025 Charm?
 *
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 *
 * SPDX-License-Identifier: MIT
 *
 * This file contains helper functions for the website frontend.
 */


// import-export.js

// Get references to the new buttons and file input
const importFileInput = document.getElementById('import-file-input');
const importChangesButton = document.getElementById('import-changes-button');
const exportChangesButton = document.getElementById('export-changes-button');

document.addEventListener('DOMContentLoaded', () => {
    if (importFileInput && importChangesButton && exportChangesButton) {
        importChangesButton.addEventListener('click', () => importFileInput.click());
        importFileInput.addEventListener('change', handleImportFile);
        exportChangesButton.addEventListener('click', exportChanges);
    } else {
        console.error('Import/Export DOM elements not found!');
    }
});

/**
 * Handles the selected JSON file for import.
 * @param {Event} event The change event from the file input.
 */
async function handleImportFile(event) {
    const file = event.target.files[0];
    if (!file) {
        return;
    }

    if (file.type !== 'application/json') {
        alert('Please select a valid JSON file.');
        return;
    }

    window.showLoadingOverlay('Importing Changes...');
    window.updateConsoleLog('Reading import file...');

    try {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                window.updateConsoleLog('File parsed. Processing assets...');

                await processImportedAssets(importedData);

                window.hideLoadingOverlayWithDelay(2000, 'Import Complete!');
            } catch (parseError) {
                console.error('Error parsing JSON:', parseError);
                window.updateConsoleLog(`[ERROR] Failed to parse JSON: ${parseError.message}`);
                window.hideLoadingOverlayWithDelay(3000, 'Import Failed (Invalid JSON)!');
            }
        };
        reader.readAsText(file);
    } catch (error) {
        console.error('Error handling import file:', error);
        window.updateConsoleLog(`[ERROR] Error reading file: ${error.message}`);
        window.hideLoadingOverlayWithDelay(3000, 'Import Failed!');
    } finally {
        // Clear the input so selecting the same file again triggers change event
        event.target.value = '';
    }
}

/**
 * Generates a simple unique ID.
 * @returns {string} A unique ID string.
 */
function generateUniqueId() {
    return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Processes the imported asset data, updating the global allAssets array.
 * This now handles both legacy (imageData directly in asset) and new (uniqueImages map) formats.
 * It also intelligently updates existing cards or creates new ones.
 * @param {Object} importedData The imported data object, which may contain 'assets' and 'uniqueImages'.
 */
async function processImportedAssets(importedData) {
    if (!importedData || !Array.isArray(importedData.assets)) {
        window.updateConsoleLog('[ERROR] Imported data is not in the expected format. Expected an object with an "assets" array.');
        return;
    }

    const assetsToImport = importedData.assets;
    const uniqueImages = importedData.uniqueImages || {}; // Map of imageId to Base64 data

    // Pre-resolve unique images to Blobs for faster lookup
    const resolvedUniqueImageBlobs = {};
    for (const imageId in uniqueImages) {
        if (uniqueImages.hasOwnProperty(imageId)) {
            window.updateConsoleLog(`Resolving unique image: ${imageId}`);
            resolvedUniqueImageBlobs[imageId] = await dataURLtoBlob(uniqueImages[imageId]);
        }
    }

    let processedCount = 0;
    const totalAssetsToProcess = assetsToImport.length;

    for (const importedAsset of assetsToImport) {
        processedCount++;
        window.updateLoadingProgress(processedCount, totalAssetsToProcess, `Processing: ${importedAsset.filename}`);

        // Find existing asset by folder, filename, and type
        const existingAsset = window.allAssets.find(
            a => a.folder === importedAsset.folder && a.filename === importedAsset.filename && a.type === importedAsset.type
        );

        let blobToApply = null;

        // Determine the source of the image blob: uniqueImages map or direct imageData
        if (importedAsset.imageId && resolvedUniqueImageBlobs[importedAsset.imageId]) {
            blobToApply = resolvedUniqueImageBlobs[importedAsset.imageId];
        } else if (importedAsset.imageData) { // Fallback for legacy format or direct embeds
            blobToApply = await dataURLtoBlob(importedAsset.imageData);
        }

        if (existingAsset) {
            // Update existing asset
            window.updateConsoleLog(`Updating existing asset: ${importedAsset.filename}`);
            if (blobToApply) {
                // Revoke old blob URL to prevent memory leaks if it exists
                if (existingAsset.newImageBlob && existingAsset.newImageBlob.size > 0 && existingAsset.mediaPath && existingAsset.mediaPath.startsWith('blob:')) {
                    URL.revokeObjectURL(existingAsset.mediaPath);
                }
                existingAsset.newImageBlob = blobToApply;
                existingAsset.mediaPath = URL.createObjectURL(blobToApply);
                existingAsset.isModified = true; // Mark as modified on import
                existingAsset.isNew = false; // It's an existing asset, not new
                // Update excluded status if it exists in the imported data
                if (importedAsset.hasOwnProperty('excluded')) {
                    existingAsset.excluded = importedAsset.excluded;
                } else {
                    existingAsset.excluded = false; // Default to false if not specified
                }
            } else {
                // If no blob to apply, revert to original state if it was modified
                if (existingAsset.isModified || existingAsset.isNew) {
                    // Revoke current blob URL if it exists
                    if (existingAsset.mediaPath && existingAsset.mediaPath.startsWith('blob:')) {
                        URL.revokeObjectURL(existingAsset.mediaPath);
                    }
                    existingAsset.newImageBlob = null;
                    existingAsset.isModified = false;
                    existingAsset.isNew = false;
                    // Revert mediaPath to its original, non-blob path
                    // This might require storing the original mediaPath if it was changed
                    // For now, assume updateCardVisualState handles reverting to original source if no newImageBlob
                }
            }
            window.updateCardVisualState(existingAsset); // Update the visual state of the existing card
            window.updateConsoleLog(`Updated: ${importedAsset.filename}`);
        } else {
            // Create a new asset if it doesn't exist
            window.updateConsoleLog(`Creating new asset: ${importedAsset.filename}`);
            const newAsset = {
                id: importedAsset.id || generateUniqueId(), // Use existing ID or generate new
                folder: importedAsset.folder,
                filename: importedAsset.filename,
                type: importedAsset.type,
                mediaPath: `./mod-assets/${importedAsset.type}/${importedAsset.filename}`, // Default path, will be updated by blob if present
                originalImageBlob: null,
                newImageBlob: null,
                isModified: false,
                isNew: true, // This asset is new to the current collection
                isSelected: false,
                excluded: importedAsset.excluded || false // Import excluded status, default to false if not specified
            };

            if (blobToApply) {
                newAsset.newImageBlob = blobToApply;
                newAsset.mediaPath = URL.createObjectURL(blobToApply); // Use blob URL for display
                newAsset.isNew = true; // Still marked as new, as it's from import
            }

            window.allAssets.push(newAsset);
            window.createAndAppendCard(newAsset); // Add new card to DOM
            window.updateConsoleLog(`Added new asset: ${importedAsset.filename}`);
        }
    }
}


/**
 * Exports modified and new assets as a JSON file, de-duplicating image data.
 */
async function exportChanges() {
    window.showLoadingOverlay('Exporting Changes...');
    window.updateConsoleLog('Gathering modified assets...');

    const changesToExport = [];
    const uniqueImages = {}; // Stores unique Base64 image data, keyed by a generated ID
    const imageBlobToIdMap = new Map(); // Maps Blob objects (or their Base64 hash) to unique IDs

    let imageIdCounter = 0;

    for (const asset of window.allAssets) {
        if (asset.isModified || asset.isNew) {
            let imageId = null;
            if (asset.newImageBlob) {
                // Get Base64 data for the blob
                const base64Data = await blobToBase64(asset.newImageBlob);

                // Check if this image data already exists
                // Using a simple Base64 string as the key for de-duplication.
                // For very large numbers of distinct images, a SHA-256 hash might be better,
                // but Base64 string comparison is sufficient and simpler for most cases.
                if (imageBlobToIdMap.has(base64Data)) {
                    imageId = imageBlobToIdMap.get(base64Data);
                } else {
                    // This is a new unique image, assign it a new ID
                    imageId = `img_${imageIdCounter++}`;
                    uniqueImages[imageId] = base64Data;
                    imageBlobToIdMap.set(base64Data, imageId);
                }
            }

            changesToExport.push({
                id: asset.id || generateUniqueId(), // Ensure asset has an ID
                folder: asset.folder,
                filename: asset.filename,
                type: asset.type,
                mediaPath: asset.mediaPath, // Original mediaPath
                isModified: asset.isModified,
                isNew: asset.isNew,
                excluded: asset.excluded || false, // Include excluded status
                imageId: imageId // Reference to the unique image data
                // imageData is no longer directly stored here to avoid duplication
            });
            window.updateConsoleLog(`Added ${asset.filename} to export list.`);
        }
    }

    const exportData = {
        timestamp: new Date().toISOString(),
        description: "Venge Texture Swapper Export Data (Modified Assets)",
        uniqueImages: uniqueImages, // Contains de-duplicated Base64 image data
        assets: changesToExport // Contains asset metadata with references to uniqueImages
    };

    const jsonString = JSON.stringify(exportData, null, 2); // Pretty print JSON
    const blob = new Blob([jsonString], { type: 'application/json' });

    // Use FileSaver.js to prompt download
    saveAs(blob, 'venge_texture_swapper_changes.json');

    window.hideLoadingOverlayWithDelay(3000, 'Changes exported successfully!');
}

/**
 * Converts a Blob object to a Base64 Data URL.
 * @param {Blob} blob The Blob to convert.
 * @returns {Promise<string>} A promise that resolves with the Base64 Data URL.
 */
function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

/**
 * Converts a Base64 Data URL string back to a Blob object.
 * @param {string} dataURL The Base64 Data URL string.
 * @returns {Promise<Blob>} A promise that resolves with the Blob object.
 */
function dataURLtoBlob(dataURL) {
    return new Promise((resolve) => {
        const parts = dataURL.split(';base64,');
        const contentType = parts[0].split(':')[1];
        const raw = window.atob(parts[1]);
        const rawLength = raw.length;
        const uInt8Array = new Uint8Array(rawLength);

        for (let i = 0; i < rawLength; ++i) {
            uInt8Array[i] = raw.charCodeAt(i);
        }

        resolve(new Blob([uInt8Array], { type: contentType }));
    });
}