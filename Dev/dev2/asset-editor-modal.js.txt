/*
 * Copyright (c) 2025 Charm?
 *
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 *
 * SPDX-License-Identifier: MIT
 *
 * This file contains helper functions for the website frontend.
 */



// asset-editor-modal.js
// This file handles all the interactive logic for the Asset Editor Modal.

// DOM Elements for the Modal
let assetEditorModal;
let closeEditorModalButton;
let modalAssetName;
let tabModify;
let tabCreate;
let contentModify;
let contentCreate;
let saturationSlider;
let saturationValueDisplay;
let textureEditorCanvas;
let textureEditorCtx;
let newTextureWidthInput;
let newTextureHeightInput;
let newTextureColorInput;
let saveModifiedTextureButton;
let saveNewTextureButton;

// Global variable to hold the reference to the asset being currently edited
// This will be an object from the `allAssets` array in asset-list-page.js
let currentEditedAsset = null;
let currentImage = new Image(); // Image object to draw on canvas

document.addEventListener('DOMContentLoaded', () => {
    // Get all necessary DOM elements for the modal
    assetEditorModal = document.getElementById('asset-editor-modal');
    closeEditorModalButton = document.getElementById('close-editor-modal');
    modalAssetName = document.getElementById('modal-asset-name');
    tabModify = document.getElementById('tab-modify');
    tabCreate = document.getElementById('tab-create');
    contentModify = document.getElementById('content-modify');
    contentCreate = document.getElementById('content-create');
    saturationSlider = document.getElementById('saturation-slider');
    saturationValueDisplay = document.getElementById('saturation-value');
    textureEditorCanvas = document.getElementById('texture-editor-canvas');
    textureEditorCtx = textureEditorCanvas ? textureEditorCanvas.getContext('2d') : null;
    newTextureWidthInput = document.getElementById('new-texture-width');
    newTextureHeightInput = document.getElementById('new-texture-height');
    newTextureColorInput = document.getElementById('new-texture-color');
    saveModifiedTextureButton = document.getElementById('save-modified-texture');
    saveNewTextureButton = document.getElementById('save-new-texture');

    // Add Event Listeners
    if (closeEditorModalButton) {
        closeEditorModalButton.addEventListener('click', closeAssetEditorModal);
    }

    if (tabModify) {
        tabModify.addEventListener('click', () => switchTab('modify'));
    }
    if (tabCreate) {
        tabCreate.addEventListener('click', () => switchTab('create'));
    }

    if (saturationSlider) {
        saturationSlider.addEventListener('input', applySaturation);
    }

    if (saveModifiedTextureButton) {
        saveModifiedTextureButton.addEventListener('click', saveModifiedTexture);
    }

    if (saveNewTextureButton) {
        saveNewTextureButton.addEventListener('click', saveNewTexture);
    }

    // Initialize canvas to be responsive and clear
    if (textureEditorCanvas) {
        // Set a default size for the canvas initially, it will be adjusted when an image loads
        textureEditorCanvas.width = 512;
        textureEditorCanvas.height = 512;
        textureEditorCtx.clearRect(0, 0, textureEditorCanvas.width, textureEditorCanvas.height);
    }
});

/**
 * Opens the asset editor modal and populates it with asset data.
 * This function is called from asset-list-page.js when an 'Edit Asset' button is clicked.
 * @param {Object} asset The asset object from the allAssets array.
 */
window.openAssetEditorModal = async (asset) => {
    // New defensive check: Do not open if multi-select mode is active
    if (typeof window.isMultiSelectModeActive === 'function' && window.isMultiSelectModeActive()) {
        console.log('Single asset editor cannot be opened while multi-select mode is active.');
        return;
    }

    if (!assetEditorModal || !modalAssetName || !textureEditorCanvas || !textureEditorCtx) {
        console.error('Modal elements not fully loaded.');
        return;
    }

    currentEditedAsset = asset;
    modalAssetName.textContent = asset.filename;

    // Reset canvas and inputs
    textureEditorCtx.clearRect(0, 0, textureEditorCanvas.width, textureEditorCanvas.height);
    saturationSlider.value = 100;
    saturationValueDisplay.textContent = '100%';
    newTextureWidthInput.value = 512;
    newTextureHeightInput.value = 512;
    newTextureColorInput.value = '#6c5ce7'; // Default color

    // Determine which tab to show and what content to load
    if (asset.type.toLowerCase() === 'png' || asset.type.toLowerCase() === 'jpg') {
        // If it's an image, show modify tab by default
        switchTab('modify');
        tabModify.style.display = 'inline-block'; // Ensure modify tab is visible
        tabCreate.style.display = 'inline-block'; // Ensure create tab is visible for all
        await loadImageForEditing(asset); // Load image onto canvas
    } else {
        // If it's an MP3 or other non-image, default to create tab
        switchTab('create');
        tabModify.style.display = 'none'; // Hide modify tab for non-image assets
        tabCreate.style.display = 'inline-block'; // Ensure create tab is visible
    }

    // Show the modal
    assetEditorModal.classList.add('active');
};

/**
 * Closes the asset editor modal.
 */
function closeAssetEditorModal() {
    if (assetEditorModal) {
        assetEditorModal.classList.remove('active');
    }
    currentEditedAsset = null; // Clear the reference
}

/**
 * Switches between the 'modify' and 'create' tabs in the modal.
 * @param {string} tabName 'modify' or 'create'.
 */
function switchTab(tabName) {
    // Remove 'active' class from all tab buttons and content
    tabModify.classList.remove('active');
    tabCreate.classList.remove('active');
    contentModify.style.display = 'none';
    contentCreate.style.display = 'none';

    // Add 'active' class to the selected tab button and display its content
    if (tabName === 'modify') {
        tabModify.classList.add('active');
        contentModify.style.display = 'block';
        // Reload the image when switching back to modify tab
        if (currentEditedAsset && (currentEditedAsset.type.toLowerCase() === 'png' || currentEditedAsset.type.toLowerCase() === 'jpg')) {
            loadImageForEditing(currentEditedAsset);
        }
    } else if (tabName === 'create') {
        tabCreate.classList.add('active');
        contentCreate.style.display = 'block';
    }
}

/**
 * Loads an image onto the canvas for editing.
 * Prioritizes modifiedImageBlob, then originalImageBlob, then fetches if needed.
 * @param {Object} asset The asset object.
 */
async function loadImageForEditing(asset) {
    if (!textureEditorCtx) return;

    let imageBlob = null;

    // Prioritize previously modified image blob, then original
    if (asset.isModified && asset.modifiedImageBlob) {
        imageBlob = asset.modifiedImageBlob;
    } else if (asset.originalImageBlob) {
        imageBlob = asset.originalImageBlob;
    }

    // If we don't have a blob, fetch the original image
    if (!imageBlob) {
        try {
            const response = await fetch(asset.mediaPath);
            if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
            imageBlob = await response.blob();
            // Store the original blob for future use if not already stored
            if (!asset.originalImageBlob) {
                asset.originalImageBlob = imageBlob;
            }
        } catch (error) {
            console.error('Error fetching original image for editor:', error);
            // Fallback: draw a placeholder on canvas
            drawPlaceholderOnCanvas(asset.filename);
            return;
        }
    }

    // Load the blob onto the canvas
    const url = URL.createObjectURL(imageBlob);
    currentImage.onload = () => {
        // Adjust canvas size to fit image, while maintaining aspect ratio and max width/height
        const maxWidth = 700; // Max width for canvas in modal
        const maxHeight = 400; // Max height for canvas in modal

        let newWidth = currentImage.width;
        let newHeight = currentImage.height;

        if (newWidth > maxWidth) {
            newHeight = (newHeight / newWidth) * maxWidth;
            newWidth = maxWidth;
        }

        if (newHeight > maxHeight) {
            newWidth = (newWidth / newHeight) * maxHeight;
            newHeight = maxHeight;
        }

        textureEditorCanvas.width = newWidth;
        textureEditorCanvas.height = newHeight;

        // Clear and draw image with current saturation
        textureEditorCtx.clearRect(0, 0, textureEditorCanvas.width, textureEditorCanvas.height);
        textureEditorCtx.drawImage(currentImage, 0, 0, textureEditorCanvas.width, textureEditorCanvas.height);
        applySaturation(); // Apply initial saturation (usually 100%)
        URL.revokeObjectURL(url); // Clean up the object URL
    };
    currentImage.onerror = (e) => {
        console.error('Error loading image into editor:', e);
        drawPlaceholderOnCanvas(asset.filename);
        URL.revokeObjectURL(url);
    };
    currentImage.src = url;
}

/**
 * Draws a placeholder on the canvas if an image fails to load.
 * @param {string} filename The filename to display.
 */
function drawPlaceholderOnCanvas(filename) {
    if (!textureEditorCtx) return;
    textureEditorCanvas.width = 300; // Default size for placeholder
    textureEditorCanvas.height = 200;
    textureEditorCtx.clearRect(0, 0, textureEditorCanvas.width, textureEditorCanvas.height);
    textureEditorCtx.fillStyle = '#333';
    textureEditorCtx.fillRect(0, 0, textureEditorCanvas.width, textureEditorCanvas.height);
    textureEditorCtx.fillStyle = '#fff';
    textureEditorCtx.font = '16px Arial';
    textureEditorCtx.textAlign = 'center';
    textureEditorCtx.fillText('Image Load Error', textureEditorCanvas.width / 2, textureEditorCanvas.height / 2 - 10);
    textureEditorCtx.font = '12px Arial';
    textureEditorCtx.fillText(filename, textureEditorCanvas.width / 2, textureEditorCanvas.height / 2 + 15);
}

/**
 * Applies the saturation filter to the canvas and updates the display.
 */
function applySaturation() {
    if (!textureEditorCanvas || !saturationSlider || !saturationValueDisplay) return;

    const saturation = saturationSlider.value;
    saturationValueDisplay.textContent = `${saturation}%`;
    textureEditorCanvas.style.filter = `saturate(${saturation}%)`;
}

/**
 * Saves the modified texture from the canvas back to the currentEditedAsset in memory.
 */
async function saveModifiedTexture() {
    if (!currentEditedAsset || !textureEditorCanvas) return;

    // Remove the CSS filter before saving the image data
    textureEditorCanvas.style.filter = 'none';

    // Create a new canvas to draw the image without the filter
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = textureEditorCanvas.width;
    tempCanvas.height = textureEditorCanvas.height;
    
    // Draw the current image (without filter) onto the temporary canvas
    tempCtx.drawImage(currentImage, 0, 0, tempCanvas.width, tempCanvas.height);

    // Apply the saturation filter directly to the pixel data on the temporary canvas
    const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    const pixels = imageData.data;
    const saturationFactor = saturationSlider.value / 100;

    // Simple saturation adjustment (average method)
    for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];

        // Calculate luminance (per ITU-R BT.709)
        const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

        pixels[i] = luminance + (r - luminance) * saturationFactor;
        pixels[i + 1] = luminance + (g - luminance) * saturationFactor;
        pixels[i + 2] = luminance + (b - luminance) * saturationFactor;

        // Clamp values to 0-255
        pixels[i] = Math.min(255, Math.max(0, pixels[i]));
        pixels[i + 1] = Math.min(255, Math.max(0, pixels[i + 1]));
        pixels[i + 2] = Math.min(255, Math.max(0, pixels[i + 2]));
    }
    tempCtx.putImageData(imageData, 0, 0);

    // Convert the temporary canvas to a Blob
    try {
        const blob = await new Promise(resolve => tempCanvas.toBlob(resolve, 'image/png'));
        currentEditedAsset.modifiedImageBlob = blob;
        currentEditedAsset.isModified = true;
        currentEditedAsset.isNew = false; // Ensure it's not marked as a new creation

        console.log(`Modified texture saved in memory for: ${currentEditedAsset.filename}`);
        // IMPORTANT: Update the visual state of the card
        if (typeof window.updateCardVisualState === 'function') {
            window.updateCardVisualState(currentEditedAsset);
        } else {
            console.error('updateCardVisualState function not found in global scope.');
        }
        closeAssetEditorModal();
    } catch (error) {
        console.error('Error saving modified texture to blob:', error);
        // Re-apply the CSS filter for visual consistency if saving fails
        textureEditorCanvas.style.filter = `saturate(${saturationSlider.value}%)`;
    }
}

/**
 * Saves a newly created texture from user inputs back to the currentEditedAsset in memory.
 */
async function saveNewTexture() {
    if (!currentEditedAsset || !newTextureWidthInput || !newTextureHeightInput || !newTextureColorInput) return;

    const width = parseInt(newTextureWidthInput.value);
    const height = parseInt(newTextureHeightInput.value);
    const color = newTextureColorInput.value;

    if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
        console.error('Invalid width or height for new texture.');
        // Consider adding a visible message to the user here instead of just console.error
        return;
    }

    // Create a temporary canvas to draw the new texture
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = width;
    tempCanvas.height = height;

    tempCtx.fillStyle = color;
    tempCtx.fillRect(0, 0, width, height);

    try {
        const blob = await new Promise(resolve => tempCanvas.toBlob(resolve, 'image/png'));
        currentEditedAsset.newImageBlob = blob;
        currentEditedAsset.isNew = true;
        currentEditedAsset.isModified = false; // Ensure it's not marked as a modification

        console.log(`New texture created and saved in memory for: ${currentEditedAsset.filename}`);
        // IMPORTANT: Update the visual state of the card
        if (typeof window.updateCardVisualState === 'function') {
            window.updateCardVisualState(currentEditedAsset);
        } else {
            console.error('updateCardVisualState function not found in global scope.');
        }
        closeAssetEditorModal();
    } catch (error) {
        console.error('Error creating new texture blob:', error);
    }
}

// Global scope functions (will be called from asset-list-page.js)
// window.openAssetEditorModal is already defined above