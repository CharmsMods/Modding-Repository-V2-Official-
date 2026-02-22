/*
 * Copyright (c) 2025 Charm?
 *
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 *
 * SPDX-License-Identifier: MIT
 *
 * This file contains helper functions for the website frontend.
 */


// DOM Elements
let searchInput;
let allCards; // This declares it
window.allCards = allCards; // NEW: Expose globally

/**
 * Global list of all assets with their metadata and blob data.
 * @type {Array<Object>}
 */
const allAssets = [];
window.allAssets = allAssets;

/**
 * Flag indicating if all assets have been loaded into memory.
 * @type {boolean}
 */
let assetsLoadedIntoMemory = false;


// DOM elements for loading/progress
let loadingOverlay;
let progressBar;
let progressPercentage;
let consoleLog;
let loadingMessageDisplay; // New: to display dynamic loading messages

// Export Options Popup DOM Elements
let exportOptionsPopup;
let closeExportPopupButton;
let exportClientButton;
let exportBrowserButton;


// Card Creation
// Modified to display immediate image path initially, not relying on blob until loadedIntoMemory
function createAndAppendCard(asset) {
    const { folder, filename, type, mediaPath } = asset; // Destructure asset object

    // Create main card element
    const card = document.createElement('div');
    card.className = 'texture-card';
    card.style.display = 'block';
    card.style.visibility = 'visible';
    card.style.opacity = '1';

    // Initialize excluded state if not set
    if (asset.excluded === undefined) {
        asset.excluded = false;
    }
    
    // Debug: Log the excluded state when card is created
    console.log(`Card created for ${asset.filename}: excluded = ${asset.excluded}`);
    
    // Update card class based on excluded state
    if (asset.excluded) {
        card.classList.add('excluded');
    }

    // Store a reference to the card DOM element on the asset object
    asset.cardElement = card;


    if (type.toLowerCase() === 'mp3') {
        card.className += ' mp3'; // Add mp3 class for specific styling

        // Create elements for the consolidated MP3 card layout
        const playIcon = document.createElement('i');
        playIcon.className = 'fas fa-play media-icon'; // Keep original class for icon styling
        playIcon.onclick = (event) => {
            event.stopPropagation(); // Prevent card selection when clicking play button
            playAudio(mediaPath);
        };

        const mp3FilenameDisplay = document.createElement('div');
        mp3FilenameDisplay.className = 'mp3-filename-display';
        mp3FilenameDisplay.textContent = filename;

        const folderNumberButton = document.createElement('button');
        folderNumberButton.className = 'folder-number-button';
        folderNumberButton.textContent = `Folder: ${folder}`;
        folderNumberButton.onclick = (event) => {
             event.stopPropagation(); // Prevent card selection when clicking copy button
             // Use document.execCommand('copy') for clipboard operations in iframe context
             const tempInput = document.createElement('textarea');
             tempInput.value = folder;
             document.body.appendChild(tempInput);
             tempInput.select();
             document.execCommand('copy');
             document.body.removeChild(tempInput);

             folderNumberButton.textContent = 'Copied!';
             setTimeout(() => {
                 folderNumberButton.textContent = `Folder: ${folder}`;
             }, 2000);
        };

// ... (inside asset-list-page.js, after the createAndAppendCard function definition) ...

window.createAndAppendCard = createAndAppendCard; // NEW: Expose globally

        // Create a wrapper for the action buttons to manage their layout
        const mp3ButtonsWrapper = document.createElement('div');
        mp3ButtonsWrapper.className = 'mp3-buttons-wrapper card-actions'; // Added card-actions class for consistent styling

        const copyFolderButton = document.createElement('button');
        copyFolderButton.className = 'copy-folder-button';
        copyFolderButton.textContent = 'Copy Folder';
        copyFolderButton.onclick = (event) => {
            event.stopPropagation(); // Prevent card selection when clicking copy button
            const tempInput = document.createElement('textarea');
            tempInput.value = folder;
            document.body.appendChild(tempInput);
            tempInput.select();
            document.execCommand('copy');
            document.body.removeChild(tempInput);

            copyFolderButton.textContent = 'Copied!';
            setTimeout(() => { copyFolderButton.textContent = 'Copy Folder'; }, 2000);
        };
        mp3ButtonsWrapper.appendChild(copyFolderButton);

        const downloadButton = document.createElement('button');
        downloadButton.className = 'download-button';
        downloadButton.textContent = 'Download';
        downloadButton.onclick = (event) => {
            event.stopPropagation(); // Prevent card selection when clicking download button
            const downloadLink = document.createElement('a');
            downloadLink.href = mediaPath;
            downloadLink.download = filename;
            downloadLink.click();
        };
        mp3ButtonsWrapper.appendChild(downloadButton);

        // Append all consolidated elements directly to the main card
        card.appendChild(playIcon);
        card.appendChild(mp3FilenameDisplay);
        card.appendChild(folderNumberButton);
        card.appendChild(mp3ButtonsWrapper);

    } else { // Logic for PNG/JPG cards
        // Add the selection checkbox for image cards
        const selectCheckbox = document.createElement('div');
        selectCheckbox.className = 'select-checkbox';
        selectCheckbox.innerHTML = '<i class="fas fa-check"></i>'; // Font Awesome checkmark
        card.appendChild(selectCheckbox);

        // Add click listener to the card for multi-selection
        card.addEventListener('click', (e) => {
            // Check if the click was on the image (mediaElement or its container)
            const isImageClick = e.target === mediaElement || e.target === mediaContainer;
            
            // If in multi-select mode, handle selection
            if (typeof window.isMultiSelectModeActive === 'function' && window.isMultiSelectModeActive()) {
                window.toggleAssetSelection(asset, card); // Function from bulk-operations.js
            } 
            // If not in multi-select mode and the click was on the image, show fullscreen
            else if (isImageClick) {
                showFullscreenImage(asset);
            }
        });


        // Create media container
        const mediaContainer = document.createElement('div');
        mediaContainer.className = 'media-container';

        // Create appropriate media element/placeholder based on type
        const mediaElement = document.createElement('img');
        mediaElement.className = 'media-image';
        
        // Initially, image source points directly to the file path.
        // Blob will be loaded later when assetsLoadedIntoMemory is true.
        mediaElement.src = mediaPath;

        // Add error handling for images
        mediaElement.onerror = () => {
            console.error(`Failed to load media: ${mediaPath}`);
            const placeholder = document.createElement('div');
            placeholder.className = 'media-placeholder';
            placeholder.innerHTML = `
                <div class="media-icon">❓</div>
                <div class="media-filename">${filename}</div>
            `;
            mediaContainer.innerHTML = ''; // Clear original image
            mediaContainer.appendChild(placeholder);
        };
        mediaContainer.appendChild(mediaElement);
        card.appendChild(mediaContainer); // Append mediaContainer for non-MP3s

        // Create info container
        const infoContainer = document.createElement('div');
        infoContainer.className = 'texture-info';

        // Create file-info container
        const fileInfoContainer = document.createElement('div');
        fileInfoContainer.className = 'file-info';

        // Filename Element Creation for PNG/JPGs
        const filenameElement = document.createElement('div');
        filenameElement.className = 'texture-filename';
        filenameElement.textContent = filename;
        fileInfoContainer.appendChild(filenameElement);

        // Folder/artist/album element
        const folderOrArtistAlbumElement = document.createElement('div');
        folderOrArtistAlbumElement.className = 'texture-name';
        folderOrArtistAlbumElement.textContent = folder;
        fileInfoContainer.appendChild(folderOrArtistAlbumElement);

        infoContainer.appendChild(fileInfoContainer);

        // Create buttons container for non-MP3s
        const actionButtonsContainer = document.createElement('div');
        actionButtonsContainer.className = 'buttons-container';
        
        // Create card actions container
        const cardActions = document.createElement('div');
        cardActions.className = 'card-actions';
                // Exclude functionality has been moved to bulk operations
        
        // Add Edit Asset button
        const editAssetButton = document.createElement('button');
        editAssetButton.className = 'edit-asset-button';
        editAssetButton.textContent = 'Edit Asset';
        editAssetButton.onclick = (event) => {
            event.stopPropagation();
            
            if (typeof window.isMultiSelectModeActive === 'function' && !window.isMultiSelectModeActive()) {
                if (typeof window.openAssetEditorModal === 'function') {
                    window.openAssetEditorModal(asset, card);
                } else {
                    console.error('openAssetEditorModal function not found. Is asset-editor-modal.js loaded correctly?');
                }
            } else {
                console.log('Cannot open single editor in multi-select mode.');
            }
        };
        actionButtonsContainer.appendChild(editAssetButton);


        const copyButton = document.createElement('button');
        copyButton.className = 'copy-button'; // Specific class for non-MP3 copy button
        copyButton.textContent = 'Copy Folder';
        copyButton.onclick = (event) => {
            event.stopPropagation(); // Prevent card selection when clicking copy button
            // Use document.execCommand('copy') for clipboard operations in iframe context
            const tempInput = document.createElement('textarea');
            tempInput.value = folder;
            document.body.appendChild(tempInput);
            tempInput.select();
            document.execCommand('copy');
            document.body.removeChild(tempInput);

            copyButton.textContent = 'Copied!';
            setTimeout(() => { copyButton.textContent = 'Copy Folder'; }, 2000);
        };
        actionButtonsContainer.appendChild(copyButton);

        const downloadButton = document.createElement('button');
        downloadButton.className = 'download-button';
        downloadButton.textContent = 'Download';
        downloadButton.onclick = (event) => {
            event.stopPropagation(); // Prevent card selection when clicking download button
            const downloadLink = document.createElement('a');
            downloadLink.href = mediaPath; // Use original mediaPath for direct download
            downloadLink.download = filename;
            downloadLink.click();
        };
        actionButtonsContainer.appendChild(downloadButton);

        actionButtonsContainer.appendChild(cardActions);
        infoContainer.appendChild(actionButtonsContainer);
        card.appendChild(infoContainer); // Append infoContainer for non-MP3s
    }

    // Finally, append the card to the grid
    const grid = document.getElementById('texture-grid');
    if (grid) {
        grid.appendChild(card);
    }

    // Apply initial visual state based on modification flags (if any were somehow pre-set)
    updateCardVisualState(asset);
}

/**
 * Updates the visual state of a card based on its associated asset's modification status.
 * This function is called from asset-editor-modal.js after changes are saved, and now from bulk-operations.js.
 * @param {Object} asset The asset object whose visual state needs to be updated.
 */
window.updateCardVisualState = (asset) => {
    const cardElement = asset.cardElement;
    if (cardElement) {
        if (asset.isModified || asset.isNew) {
            cardElement.classList.add('edited-card');
            // If the card has a media image, update its src to reflect the new/modified blob
            const mediaImage = cardElement.querySelector('.media-image');
            if (mediaImage && (asset.modifiedImageBlob || asset.newImageBlob)) {
                // Revoke old URL if it exists to prevent memory leaks
                if (mediaImage.src.startsWith('blob:')) {
                    URL.revokeObjectURL(mediaImage.src);
                }
                const blobToDisplay = asset.modifiedImageBlob || asset.newImageBlob;
                mediaImage.src = URL.createObjectURL(blobToDisplay);
            }
        } else {
            cardElement.classList.remove('edited-card');
            // Revert image src to original mediaPath if no longer modified/new
            const mediaImage = cardElement.querySelector('.media-image');
            // Only revert to mediaPath if originalImageBlob isn't loaded (meaning we're displaying direct path)
            // If originalImageBlob IS loaded, we should use its blob URL for display.
            if (mediaImage) {
                if (mediaImage.src.startsWith('blob:') && asset.originalImageBlob && assetsLoadedIntoMemory) {
                     // If we have a blob and assets are in memory, keep displaying the original blob version
                     // Revoke existing blob URL if it's different
                     const currentBlobUrl = mediaImage.src;
                     const originalBlobUrl = URL.createObjectURL(asset.originalImageBlob); // Create temporarily to compare
                     if (currentBlobUrl !== originalBlobUrl) {
                        URL.revokeObjectURL(currentBlobUrl);
                        mediaImage.src = originalBlobUrl;
                     } else {
                        URL.revokeObjectURL(originalBlobUrl); // Revoke the temporary one if it was the same
                     }
                } else if (mediaImage.src.startsWith('blob:')) { // if it's a blob URL but no originalImageBlob, revert
                    URL.revokeObjectURL(mediaImage.src);
                    mediaImage.src = asset.mediaPath;
                } else if (!mediaImage.src.startsWith('blob:') && asset.originalImageBlob && assetsLoadedIntoMemory) {
                    // If currently displaying direct path but blob is loaded, switch to blob URL
                    mediaImage.src = URL.createObjectURL(asset.originalImageBlob);
                }
            }
        }
    }
};


// Search Functionality (updated to search the new mp3-filename-display class)
function filterCards(searchTerm) {
    const lowerSearch = searchTerm.toLowerCase();

    allCards.forEach(card => {
        // For non-MP3s, check texture-filename
        const filenameElement = card.querySelector('.texture-filename');
        const filename = filenameElement ? filenameElement.textContent.toLowerCase() : '';

        // For MP3s, check mp3-filename-display
        const mp3FilenameDisplay = card.querySelector('.mp3-filename-display');
        const mp3Filename = mp3FilenameDisplay ? mp3FilenameDisplay.textContent.toLowerCase() : '';

        // Check the texture-name (folder/artist/album name - only for non-MP3s now)
        const folderNameElement = card.querySelector('.texture-name');
        const folderName = folderNameElement ? folderNameElement.textContent.toLowerCase() : '';

        // Check the folder-number-button (only for MP3s)
        const folderNumberButton = card.querySelector('.folder-number-button');
        const folderButtonText = folderNumberButton ? folderNumberButton.textContent.toLowerCase() : '';

        if (!filename.includes(lowerSearch) && !mp3Filename.includes(lowerSearch) && !folderName.includes(lowerSearch) && !folderButtonText.includes(lowerSearch)) {
            card.style.display = 'none';
            card.style.visibility = 'hidden';
            card.style.opacity = '0';
        } else {
            card.style.display = 'block';
            card.style.visibility = 'visible';
            card.style.opacity = '1';
        }
    });
}


function clearSearch() {
    searchInput.value = '';
    filterCards('');
}

// Main initialization function - now only loads metadata and displays cards
async function initializeGallery() {
    try {
        const grid = document.getElementById('texture-grid');
        if (!grid) {
            console.error('Texture grid not found!');
            return;
        }

        searchInput = document.getElementById('texture-search');
        const searchButton = document.getElementById('search-button');
        const clearButton = document.getElementById('clear-search-button');

        // Get references to export options popup elements
        exportOptionsPopup = document.getElementById('export-options-popup');
        closeExportPopupButton = document.getElementById('close-export-popup');
        exportClientButton = document.getElementById('export-client-button');
        exportBrowserButton = document.getElementById('export-browser-button');

        if (!exportOptionsPopup || !closeExportPopupButton || !exportClientButton || !exportBrowserButton) {
            console.error('One or more export options popup elements not found!');
        } else {
            closeExportPopupButton.addEventListener('click', hideExportOptionsPopup);
            // Change these to directly call initiateZipDownload with type, which will handle loading
            exportClientButton.addEventListener('click', () => initiateZipDownload('client'));
            exportBrowserButton.addEventListener('click', () => initiateZipDownload('browser'));
        }


        if (searchInput && searchButton && clearButton) {
            searchInput.addEventListener('input', (e) => {
                filterCards(e.target.value.trim());
            });
            searchButton.addEventListener('click', () => {
                filterCards(searchInput.value.trim());
            });
            clearButton.addEventListener('click', clearSearch);
        } else {
            console.error('Search elements not found!');
        }

        window.showLoadingOverlay('Loading Asset Lists...'); // Show initial loading message for metadata

        const listFetchPromises = [];

        // Load PNG file metadata
        listFetchPromises.push((async () => {
            try {
                const pngResponse = await fetch('pnglist.txt');
                if (!pngResponse.ok) {
                    console.error('Failed to fetch pnglist.txt');
                    return;
                }
                const pngText = await pngResponse.text();
                const pngLines = pngText.trim().split('\n');

                for (const line of pngLines) {
                    const [folder, filename] = line.split(' ');
                    if (folder && filename) {
                        const mediaPath = `./mod-assets/png/${filename}`;
                        allAssets.push({
                            id: `png_${folder}_${filename}`, // Create a unique ID
                            folder,
                            filename,
                            type: 'png',
                            mediaPath,
                            originalImageBlob: null, // Blob will be loaded later
                            modifiedImageBlob: null,
                            newImageBlob: null,
                            isModified: false,
                            isNew: false,
                            excluded: false // Will be updated by loadExcludedState
                        });
                    }
                }
                window.updateConsoleLog('PNG asset list loaded.');
            } catch (error) {
                console.error('Error in PNG list loading process:', error);
                window.updateConsoleLog('[ERROR] Failed to load PNG asset list.');
            }
        })());

        // Load JPG file metadata
        listFetchPromises.push((async () => {
            try {
                const jpgResponse = await fetch('jpgurl.txt');
                if (!jpgResponse.ok) {
                    console.error('Failed to fetch jpgurl.txt');
                    return;
                }
                const jpgText = await jpgResponse.text();
                const jpgLines = jpgText.trim().split('\n');

                for (const line of jpgLines) {
                    const [folder, filename] = line.split(' ');
                    if (folder && filename) {
                        const mediaPath = `./mod-assets/jpg/${filename}`;
                        allAssets.push({
                            id: `jpg_${folder}_${filename}`, // Create a unique ID
                            folder,
                            filename,
                            type: 'jpg',
                            mediaPath,
                            originalImageBlob: null, // Blob will be loaded later
                            modifiedImageBlob: null,
                            excluded: false, // Will be updated by loadExcludedState
                            newImageBlob: null,
                            isModified: false,
                            isNew: false
                        });
                    }
                }
                window.updateConsoleLog('JPG asset list loaded.');
            } catch (error) {
                console.error('Error in JPG list loading process:', error);
                window.updateConsoleLog('[ERROR] Failed to load JPG asset list.');
            }
        })());

        // Load MP3 file metadata
        listFetchPromises.push((async () => {
            try {
                const mp3Response = await fetch('mp3list.txt');
                if (!mp3Response.ok) {
                    console.error('Failed to fetch mp3list.txt');
                    return;
                }
                const mp3Text = await mp3Response.text();
                const mp3Lines = mp3Text.trim().split('\n');

                for (const line of mp3Lines) {
                    const [folder, filename] = line.split(' ');
                    if (folder && filename) {
                        const mediaPath = `./mod-assets/mp3/${filename}`;
                        allAssets.push({
                            id: `mp3_${folder}_${filename}`, // Create a unique ID
                            folder,
                            filename,
                            type: 'mp3',
                            mediaPath,
                            originalImageBlob: null, // Not applicable, but keeping structure consistent
                            modifiedImageBlob: null,
                            newImageBlob: null,
                            isModified: false,
                            isNew: false,
                            excluded: false // Will be updated by loadExcludedState
                        });
                    }
                }
                window.updateConsoleLog('MP3 asset list loaded.');
            } catch (error) {
                console.error('Error in MP3 list loading process:', error);
                window.updateConsoleLog('[ERROR] Failed to load MP3 asset list.');
            }
        })());


        // Wait for all asset lists to be loaded
        await Promise.all(listFetchPromises);
        window.updateConsoleLog('\nAll asset lists loaded. Sorting and displaying gallery...');

        // Load excluded state from sessionStorage after all assets are loaded
        loadExcludedState();

        // Sort allAssets array alphabetically by filename BEFORE creating cards
        allAssets.sort((a, b) => a.filename.localeCompare(b.filename));

        // Create and append cards for all assets based on the sorted list
        for (const asset of allAssets) {
            createAndAppendCard(asset); // Pass the entire asset object
        }

        window.hideLoadingOverlayWithDelay(1000, 'Gallery Ready!'); // Hide after all assets are processed

        // Populate allCards AFTER all cards have been created and appended
        allCards = document.querySelectorAll('.texture-card');


    } catch (error) {
        console.error('Error initializing gallery:', error);
        window.updateConsoleLog(`[FATAL ERROR] Gallery initialization failed: ${error.message}`);
        window.hideLoadingOverlayWithDelay(3000, 'Gallery Initialization Failed!');
    }
}

/**
 * Loads all image asset blobs into memory (PNG and JPG files only).
 * Displays a progress bar during the operation.
 * @returns {Promise<void>}
 * @throws {Error} If there's an error loading assets
 */
async function loadAllAssetsIntoMemory() {
    if (assetsLoadedIntoMemory) {
        console.log('Assets already loaded into memory. Skipping pre-loading.');
        return; // Already loaded
    }

    window.showLoadingOverlay('Loading Textures into Memory...');
    // Only load non-excluded image assets into memory
    const imageAssets = allAssets.filter(asset => 
        (asset.type === 'png' || asset.type === 'jpg') && !asset.excluded
    );
    
    // Log how many assets we're loading vs skipping
    const excludedCount = allAssets.filter(asset => 
        (asset.type === 'png' || asset.type === 'jpg') && asset.excluded
    ).length;
    
    // Log detailed info about included/excluded assets
    window.updateConsoleLog(`=== Asset Loading Summary ===`);
    window.updateConsoleLog(`Total assets: ${allAssets.length}`);
    window.updateConsoleLog(`Included (non-excluded) images: ${imageAssets.length}`);
    window.updateConsoleLog(`Excluded images: ${excludedCount}`);
    window.updateConsoleLog(`===========================`);
    
    // Debug: Log excluded assets
    if (excludedCount > 0) {
        const excludedAssets = allAssets.filter(asset => 
            (asset.type === 'png' || asset.type === 'jpg') && asset.excluded
        );
        window.updateConsoleLog('Excluded assets:');
        excludedAssets.forEach(asset => {
            window.updateConsoleLog(`- ${asset.filename} (Folder: ${asset.folder})`);
        });
    }
    
    let processedCount = 0;
    const totalImageFiles = imageAssets.length;

    const loadPromises = imageAssets.map(async (asset) => {
        // Only load if originalImageBlob is not already set
        if (!asset.originalImageBlob) {
            try {
                window.updateConsoleLog(`Fetching blob for: ${asset.filename}`);
                const response = await fetch(asset.mediaPath);
                if (!response.ok) throw new Error(`Failed to fetch blob: ${response.statusText}`);
                const blob = await response.blob();
                asset.originalImageBlob = blob; // Store the fetched blob

                // Update the card's image source to use the blob URL for better performance/caching
                const mediaImage = asset.cardElement.querySelector('.media-image');
                if (mediaImage) {
                    if (mediaImage.src.startsWith('blob:')) {
                         URL.revokeObjectURL(mediaImage.src); // Revoke old blob URL if any
                    }
                    mediaImage.src = URL.createObjectURL(blob);
                }

            } catch (error) {
                console.error(`Error loading blob for ${asset.filename}:`, error);
                window.updateConsoleLog(`[ERROR] Failed to load blob for: ${asset.filename} - ${error.message}`);
            }
        } else {
            // If already loaded (e.g., by editor), update card to use its blob URL if not already
            const mediaImage = asset.cardElement.querySelector('.media-image');
            if (mediaImage && !mediaImage.src.startsWith('blob:')) {
                mediaImage.src = URL.createObjectURL(asset.originalImageBlob);
            }
        }
        processedCount++;
        window.updateLoadingProgress(processedCount, totalImageFiles, `Loaded: ${asset.filename}`);
    });

    await Promise.all(loadPromises); // Wait for all image blobs to be loaded
    assetsLoadedIntoMemory = true;
    window.updateConsoleLog('\nAll textures loaded into memory.');
    window.hideLoadingOverlayWithDelay(1000, 'Textures Ready for Export!');
}


function playAudio(audioPath) {
    const audio = new Audio(audioPath);
    audio.play().catch(error => {
        console.error('Error playing audio:', error);
        console.error('Failed to play audio file. Please check if the file exists and is accessible.');
        window.updateConsoleLog(`[AUDIO ERROR] Failed to play: ${audioPath}`);
    });
}

// --- Loading Overlay and Console Logging Utility Functions (Exposed Globally) ---
// These functions are now exposed on the window object so bulk-operations.js can call them.

window.showLoadingOverlay = (message) => {
    if (loadingOverlay && loadingMessageDisplay && progressBar && consoleLog) {
        loadingMessageDisplay.textContent = message;
        progressBar.style.width = '0%';
        progressPercentage.textContent = '0%';
        consoleLog.textContent = ''; // Clear previous log
        loadingOverlay.classList.add('active');
        console.log(`Loading Overlay Shown: ${message}`);
    } else {
        console.error('Loading overlay elements not found!');
    }
};

window.updateLoadingProgress = (processed, total, currentFileMessage = '') => {
    if (progressBar && progressPercentage && consoleLog) {
        const progress = Math.round((processed / total) * 100);
        progressBar.style.width = `${progress}%`;
        progressPercentage.textContent = `${progress}%`;
        if (currentFileMessage) {
            consoleLog.textContent += `Processing: ${currentFileMessage}\n`;
        }
        consoleLog.scrollTop = consoleLog.scrollHeight; // Scroll to bottom
    }
};

window.updateConsoleLog = (message) => {
    if (consoleLog) {
        consoleLog.textContent += `${message}\n`;
        consoleLog.scrollTop = consoleLog.scrollHeight;
    }
};

window.hideLoadingOverlayWithDelay = (delay, finalMessage = 'Operation Complete!') => {
    if (loadingOverlay && loadingMessageDisplay) {
        loadingMessageDisplay.textContent = finalMessage;
        consoleLog.textContent += `\n${finalMessage}\n`;
        consoleLog.scrollTop = consoleLog.scrollHeight;
        setTimeout(() => {
            loadingOverlay.classList.remove('active');
            console.log('Loading Overlay Hidden.');
        }, delay);
    }
};


// --- Export Options Popup Control ---
function showExportOptionsPopup() {
    if (exportOptionsPopup) {
        exportOptionsPopup.classList.add('active');
    }
}

function hideExportOptionsPopup() {
    if (exportOptionsPopup) {
        exportOptionsPopup.classList.remove('active');
    }
}


// --- Utility Functions ---

/**
 * Saves the excluded state of assets to sessionStorage.
 */
window.saveExcludedState = function() {
    const excludedState = {};
    if (window.allAssets && window.allAssets.length > 0) {
        window.allAssets.forEach(asset => {
            if (asset.id) {
                excludedState[asset.id] = asset.excluded === true;
            }
        });
        sessionStorage.setItem('assetExcludedState', JSON.stringify(excludedState));
    }
}

/**
 * Loads the excluded state of assets from sessionStorage and applies it.
 */
window.loadExcludedState = function() {
    try {
        const savedState = sessionStorage.getItem('assetExcludedState');
        if (savedState) {
            const excludedState = JSON.parse(savedState);
            if (window.allAssets && window.allAssets.length > 0) {
                window.allAssets.forEach(asset => {
                    if (asset.id && excludedState.hasOwnProperty(asset.id)) {
                        asset.excluded = excludedState[asset.id];
                        // Update UI if card element exists
                        if (asset.cardElement) {
                            if (asset.excluded) {
                                asset.cardElement.classList.add('excluded');
                            } else {
                                asset.cardElement.classList.remove('excluded');
                            }
                        }
                    }
                });
            }
        }
    } catch (error) {
        console.error('Error loading excluded state:', error);
    }
}

// --- ZIP Download Functionality with Progress ---

/**
 * Initiates the ZIP download process for the specified export type.
 * @param {'client'|'browser'} exportType - The type of export to perform
 * @returns {Promise<void>}
 * @throws {Error} If there's an error during ZIP generation
 */
async function initiateZipDownload(exportType) {
    if (!exportType || !['client', 'browser'].includes(exportType)) {
        throw new Error('Invalid export type. Must be either "client" or "browser".');
    }
    hideExportOptionsPopup(); // Hide the options popup immediately

    // Filter out excluded assets first
    const filteredAssets = window.allAssets.filter(asset => !asset.excluded);
    
    if (filteredAssets.length === 0) {
        const message = 'No assets to export - all are excluded!';
        console.warn(message);
        window.updateConsoleLog(`[WARNING] ${message}`);
        window.hideLoadingOverlayWithDelay(1000, message);
        return;
    }
    
    const excludedCount = window.allAssets.length - filteredAssets.length;
    window.updateConsoleLog(`=== Starting Export ===`);
    window.updateConsoleLog(`Total assets: ${window.allAssets.length}`);
    window.updateConsoleLog(`Included in export: ${filteredAssets.length}`);
    window.updateConsoleLog(`Excluded from export: ${excludedCount}`);
    
    if (excludedCount > 0) {
        const excludedAssets = window.allAssets.filter(asset => asset.excluded);
        window.updateConsoleLog('\nExcluded assets:');
        excludedAssets.forEach(asset => {
            window.updateConsoleLog(`- ${asset.filename} (${asset.folder})`);
        });
    }
    window.updateConsoleLog(`====================`);
    
    // Load only non-excluded assets into memory
    if (!assetsLoadedIntoMemory) {
        window.updateConsoleLog('\nLoading non-excluded assets into memory...');
        await loadAllAssetsIntoMemory();
        window.updateConsoleLog('Asset loading complete. Proceeding with ZIP generation.');
    }

    window.showLoadingOverlay(`Generating ZIP (${exportType.charAt(0).toUpperCase() + exportType.slice(1)} Export)...`);

    const zip = new JSZip();

    let baseZipPathForAssets;
    let fileNameForZip = "mod-assets.zip";
    const staticFilesToFetch = [
        'charfix.js',
        'HowToUse.txt',
        'init.js',
        'manifest.json',
        'popup.html',
        'README.md'
    ];


    if (exportType === 'client') {
        baseZipPathForAssets = "Venge Client/Resource Swapper/files/assets/";
        fileNameForZip = "mod-client-export.zip";
    } else if (exportType === 'browser') {
        baseZipPathForAssets = "venge-swapper-main/files/assets/";
        fileNameForZip = "mod-browser-export.zip";

        // Add static files for browser export
        for (const staticFileName of staticFilesToFetch) {
            try {
                window.updateConsoleLog(`Fetching static file: ${staticFileName}`);
                const staticFilePath = `./browser-static-files-for-fetch/${staticFileName}`;
                const response = await fetch(staticFilePath);
                if (!response.ok) {
                    throw new Error(`Failed to fetch ${staticFileName}: ${response.statusText}`);
                }
                const blob = await response.blob();
                zip.file(`venge-swapper-main/${staticFileName}`, blob);
                window.updateConsoleLog(`Added static file to zip: venge-swapper-main/${staticFileName}`);
            } catch (error) {
                console.error(`Error adding static file ${staticFileName} to zip:`, error);
                window.updateConsoleLog(`[ERROR] Failed to add static file: ${staticFileName} - ${error.message}`);
            }
        }
    }


    const downloadAllZipButton = document.getElementById('download-all-zip-button');
    downloadAllZipButton.textContent = 'Preparing ZIP...';
    downloadAllZipButton.disabled = true;

    // Use the pre-filtered assets (already filtered to exclude excluded assets)
    let filesProcessed = 0;
    const totalFiles = filteredAssets.length;
    
    if (totalFiles === 0) {
        const message = 'No assets to export after filtering excluded assets!';
        console.warn(message);
        window.updateConsoleLog(`[WARNING] ${message}`);
        window.hideLoadingOverlayWithDelay(1000, message);
        return;
    }
    
    // Process the filtered assets (non-excluded)
    const zipPromises = filteredAssets.map(async (asset) => {
        const { folder, filename, type, originalImageBlob, modifiedImageBlob, newImageBlob, isModified, isNew } = asset;
        let fileBlobToZip = null;
        let fileNameToZip = filename; // Default to original filename

        try {
            if (isNew && newImageBlob) {
                fileBlobToZip = newImageBlob;
                window.updateConsoleLog(`Including NEW texture: ${filename} (Folder: ${folder})`);
            } else if (isModified && modifiedImageBlob) {
                fileBlobToZip = modifiedImageBlob;
                window.updateConsoleLog(`Including MODIFIED texture: ${filename} (Folder: ${folder})`);
            } else if (type !== 'mp3' && originalImageBlob) { // Use the already fetched original image blob (pre-cached)
                fileBlobToZip = originalImageBlob;
                window.updateConsoleLog(`Including ORIGINAL asset (cached): ${filename} (Folder: ${folder})`);
            } else if (type === 'mp3') { // Directly fetch MP3 as they are not pre-cached as blobs
                 window.updateConsoleLog(`Fetching MP3 asset: ${filename} (Folder: ${folder})`);
                 const response = await fetch(asset.mediaPath);
                 if (!response.ok) {
                     console.error(`Failed to fetch MP3 ${asset.mediaPath}: ${response.statusText}`);
                     window.updateConsoleLog(`[ERROR] Failed to fetch MP3: ${filename}`);
                     return null; // Return null for failed fetches
                 }
                 fileBlobToZip = await response.blob();
                 window.updateConsoleLog(`Fetched MP3: ${filename} (Folder: ${folder})`);
            }
            else {
                // This case should be rare for images if loadAllAssetsIntoMemory is called, but fallback
                console.warn(`No blob found for ${filename}, attempting to re-fetch as fallback.`);
                const response = await fetch(asset.mediaPath);
                if (!response.ok) {
                    console.error(`Failed to fetch original ${asset.mediaPath}: ${response.statusText}`);
                    window.updateConsoleLog(`[ERROR] Failed to fetch original: ${filename}`);
                    return null; // Return null for failed fetches
                }
                fileBlobToZip = await response.blob();
                if (type !== 'mp3') asset.originalImageBlob = fileBlobToZip; // Cache it now if it's an image
                window.updateConsoleLog(`Fetched & Including ORIGINAL asset (fallback): ${filename} (Folder: ${folder})`);
            }

            // Construct the full path inside the ZIP file based on export type
            const zipPath = `${baseZipPathForAssets}${folder}/1/${fileNameToZip}`;
            zip.file(zipPath, fileBlobToZip);

            // Update progress only after the file is added to JSZip
            filesProcessed++;
            window.updateLoadingProgress(filesProcessed, totalFiles, filename);

            return true; // Indicate success
        } catch (error) {
            console.error(`Error processing ${filename} for zip:`, error);
            window.updateConsoleLog(`[ERROR] Error processing: ${filename} - ${error.message}`);
            return null; // Return null for errors
        }
    });

    // Wait for all files to be processed (fetched and added to JSZip instance)
    await Promise.all(zipPromises);

    // Ensure progress is 100% after all files are attempted
    window.updateLoadingProgress(totalFiles, totalFiles, 'All asset files added to ZIP buffer.');
    window.updateConsoleLog(`\nAll asset files buffered. Starting ZIP compression...\n`);


    try {
        const content = await zip.generateAsync({
            type: "blob",
            compression: "DEFLATE", // Use compression
            compressionOptions: {
                level: 1 // Changed from 9 to 5 for better performance
            }
        }, function updateCallback(metadata) {
            // Update progress during ZIP generation (optional, but good for large zips)
            // Only update if metadata.percent is meaningful (not 0 or 100 for too long)
            if (metadata.percent > 0 && metadata.percent < 100) {
                const generationProgress = Math.round(metadata.percent);
                progressBar.style.width = `${generationProgress}%`;
                progressPercentage.textContent = `${generationProgress}% (Compressing)`;
                // Commented out currentFile as it floods the console during compression
                // if (metadata.currentFile) {
                //     window.updateConsoleLog(`Compressing: ${metadata.currentFile}`);
                // }
            }
        });

        saveAs(content, fileNameForZip);
        downloadAllZipButton.textContent = 'Download Complete!';
        window.hideLoadingOverlayWithDelay(3000, `ZIP file "${fileNameForZip}" downloaded successfully!`);
    } catch (error) {
        console.error("Error generating or saving zip:", error);
        downloadAllZipButton.textContent = 'Download Failed!';
        window.hideLoadingOverlayWithDelay(3000, `Download Failed! Error: ${error.message}`);
    } finally {
        // Keep overlay visible for a bit to show final message, then hide
        setTimeout(() => {
            downloadAllZipButton.textContent = 'Download All as ZIP';
            downloadAllZipButton.disabled = false;
        }, 3000); // Only reset button after overlay hides
    }
}

// Function to show image in fullscreen
function showFullscreenImage(asset) {
    if (window.isMultiSelectModeActive && window.isMultiSelectModeActive()) {
        return; // Don't show fullscreen in selection mode
    }
    
    const fullscreenViewer = document.getElementById('fullscreen-viewer');
    const fullscreenImage = document.getElementById('fullscreen-image');
    const filenameElement = document.getElementById('fullscreen-filename');
    const resolutionElement = document.getElementById('fullscreen-resolution');
    
    // Set the image source and info
    fullscreenImage.src = asset.mediaPath;
    filenameElement.textContent = asset.filename;
    
    // Get image dimensions when loaded
    const img = new Image();
    img.onload = function() {
        resolutionElement.textContent = `${this.width} × ${this.height}px`;
    };
    img.src = asset.mediaPath;
    
    // Show the viewer
    fullscreenViewer.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scrolling
}

// Close fullscreen viewer
function closeFullscreenViewer() {
    const fullscreenViewer = document.getElementById('fullscreen-viewer');
    fullscreenViewer.classList.remove('active');
    document.body.style.overflow = ''; // Re-enable scrolling
}

// Add event listeners for fullscreen viewer
document.addEventListener('DOMContentLoaded', () => {
    // Close when clicking the close button
    const closeButton = document.querySelector('.close-fullscreen');
    if (closeButton) {
        closeButton.addEventListener('click', closeFullscreenViewer);
    }
    
    // Close when clicking outside the image
    const fullscreenViewer = document.getElementById('fullscreen-viewer');
    if (fullscreenViewer) {
        fullscreenViewer.addEventListener('click', (e) => {
            if (e.target === fullscreenViewer) {
                closeFullscreenViewer();
            }
        });
    }
    
    // Close with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && fullscreenViewer.classList.contains('active')) {
            closeFullscreenViewer();
        }
    });
});

// Function to select all visible cards
function selectAllVisibleCards() {
    if (!window.isMultiSelectModeActive || !window.isMultiSelectModeActive()) {
        console.log('Multi-select mode is not active');
        return 0;
    }

    const visibleCards = document.querySelectorAll('.texture-card:not([style*="display: none"])');
    let selectedCount = 0;
    
    visibleCards.forEach(card => {
        // Skip already selected cards
        if (card.classList.contains('selected')) {
            return;
        }
        
        // Find the asset that corresponds to this card element
        const asset = window.allAssets.find(a => a.cardElement === card);
        if (asset) {
            // Simulate a click on the card to select it
            card.click();
            selectedCount++;
        }
    });
    
    console.log(`Selected ${selectedCount} visible cards`);
    return selectedCount;
}

// Make the function available globally
window.selectAllVisibleCards = selectAllVisibleCards;

document.addEventListener('DOMContentLoaded', () => {
    initializeGallery(); // Initialize the gallery and populate allAssets array metadata only

    // Add event listener for the search input
    const searchInput = document.getElementById('search-input');
    const clearSearchButton = document.getElementById('clear-search');
    const selectAllButton = document.getElementById('select-all-button');
    
    // Add click handler for select all button
    if (selectAllButton) {
        selectAllButton.addEventListener('click', () => {
            // First ensure we're in multi-select mode
            if (window.toggleMultiSelectMode && !window.isMultiSelectModeActive()) {
                window.toggleMultiSelectMode();
            }
            
            // Then select all visible cards
            const selectedCount = selectAllVisibleCards();
            console.log(`Selected ${selectedCount} visible cards`);
        });
    }

    const downloadAllZipButton = document.getElementById('download-all-zip-button');

    // Get references to the new loading UI elements (already done by global functions, just ensuring they exist)
    loadingOverlay = document.getElementById('loading-overlay');
    progressBar = document.getElementById('progress-bar');
    progressPercentage = document.getElementById('progress-percentage');
    consoleLog = document.getElementById('console-log');
    // New: Reference to the h2 in the loading window
    loadingMessageDisplay = loadingOverlay ? loadingOverlay.querySelector('h2') : null;


    if (downloadAllZipButton && loadingOverlay && progressBar && progressPercentage && consoleLog && loadingMessageDisplay) {
        // Change the download button's behavior to show the export options popup
        downloadAllZipButton.removeEventListener('click', null); // Remove any old listeners if this script reloads
        downloadAllZipButton.addEventListener('click', showExportOptionsPopup);
    } else {
        console.error('One or more required DOM elements for ZIP functionality not found!');
        if (!downloadAllZipButton) console.error('download-all-zip-button not found!');
        if (!loadingOverlay) console.error('loading-overlay not found!');
        if (!progressBar) console.error('progress-bar not found!');
        if (!progressPercentage) console.error('progress-percentage not found!');
        if (!consoleLog) console.error('console-log not found!');
        if (!loadingMessageDisplay) console.error('h2 for loading message not found!');
    }
    
    // Expose the initiateZipDownload function globally
    window.initiateZipDownload = initiateZipDownload;
});