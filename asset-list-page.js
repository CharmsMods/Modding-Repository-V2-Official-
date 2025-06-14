// DOM Elements
let searchInput;
let allCards;
// Store a global list of all assets fetched to be used for zipping and bulk operations
// Each asset object will now also store its Blob data and modification status.
const allAssets = [];

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
function createAndAppendCard(folder, filename, type) {
    // Create main card element
    const card = document.createElement('div');
    card.className = 'texture-card';
    card.style.display = 'block';
    card.style.visibility = 'visible';
    card.style.opacity = '1';

    let mediaPath = `./mod-assets/${type.toLowerCase()}/${filename}`;

    // Create asset object and add to the global list for zipping and bulk operations
    // Initialize modification flags and blob storage
    const asset = {
        folder,
        filename,
        type,
        mediaPath,
        originalImageBlob: null, // Will store the fetched Blob of the original image
        modifiedImageBlob: null, // Will store Blob of modified image
        newImageBlob: null,      // Will store Blob of newly created image
        isModified: false,       // Flag if modifiedImageBlob exists
        isNew: false,            // Flag if newImageBlob exists
        cardElement: card        // Store a reference to the card DOM element
    };
    allAssets.push(asset);


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

        // Create a wrapper for the action buttons to manage their layout
        const mp3ButtonsWrapper = document.createElement('div');
        mp3ButtonsWrapper.className = 'mp3-buttons-wrapper'; // New class for this wrapper

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
        card.addEventListener('click', () => {
            // Check if multi-select mode is active (function from bulk-operations.js)
            if (typeof window.isMultiSelectModeActive === 'function' && window.isMultiSelectModeActive()) {
                window.toggleAssetSelection(asset, card); // Function from bulk-operations.js
            }
        });


        // Create media container
        const mediaContainer = document.createElement('div');
        mediaContainer.className = 'media-container';

        // Create appropriate media element/placeholder based on type
        const mediaElement = document.createElement('img');
        mediaElement.className = 'media-image';
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

        // New "Edit Asset" button
        const editAssetButton = document.createElement('button');
        editAssetButton.className = 'edit-asset-button';
        editAssetButton.textContent = 'Edit Asset';
        editAssetButton.onclick = (event) => {
            event.stopPropagation(); // Prevent card selection when clicking edit button
            // Call the modal function from asset-editor-modal.js
            // Pass the entire asset object reference and the card element for in-memory modification and visual update
            // Only open if multi-select mode is NOT active
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
            downloadLink.href = mediaPath;
            downloadLink.download = filename;
            downloadLink.click();
        };
        actionButtonsContainer.appendChild(downloadButton);

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
        } else {
            cardElement.classList.remove('edited-card');
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

// Main initialization and playAudio function
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

        // Load PNG files
        try {
            const pngResponse = await fetch('pnglist.txt');
            if (!pngResponse.ok) {
                console.error('Failed to fetch pnglist.txt');
            } else {
                const pngText = await pngResponse.text();
                const pngLines = pngText.trim().split('\n');

                for (const line of pngLines) {
                    const [folder, filename] = line.split(' ');
                    if (folder && filename) {
                        createAndAppendCard(folder, filename, 'png');
                    }
                }
            }
        } catch (error) {
            console.error('Error loading PNG files:', error);
        }

        // Load JPG files
        try {
            const jpgResponse = await fetch('jpgurl.txt');
            if (!jpgResponse.ok) {
                console.error('Failed to fetch jpgurl.txt');
            } else {
                const jpgText = await jpgResponse.text();
                const jpgLines = jpgText.trim().split('\n');

                for (const line of jpgLines) {
                    const [folder, filename] = line.split(' ');
                    if (folder && filename) {
                        createAndAppendCard(folder, filename, 'jpg');
                    }
                }
            }
        } catch (error) {
            console.error('Error loading JPG files:', error);
        }

        // Load MP3 files
        try {
            const mp3Response = await fetch('mp3list.txt');
            if (!mp3Response.ok) {
                console.error('Failed to fetch mp3list.txt');
            } else {
                const mp3Text = await mp3Response.text();
                const mp3Lines = mp3Text.trim().split('\n');

                for (const line of mp3Lines) {
                    const [folder, filename] = line.split(' ');
                    if (folder && filename) {
                        createAndAppendCard(folder, filename, 'mp3');
                    }
                }
            }
        } catch (error) {
            console.error('Error loading MP3 files:', error);
        }

        // Populate allCards AFTER all cards have been created and appended
        allCards = document.querySelectorAll('.texture-card');

    } catch (error) {
        console.error('Error initializing gallery:', error);
    }
}

function playAudio(audioPath) {
    const audio = new Audio(audioPath);
    audio.play().catch(error => {
        console.error('Error playing audio:', error);
        console.error('Failed to play audio file. Please check if the file exists and is accessible.');
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


// --- ZIP Download Functionality with Progress ---

// Modified ZIP generation function to accept exportType
async function initiateZipDownload(exportType) {
    hideExportOptionsPopup(); // Hide the options popup immediately

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

    let filesProcessed = 0;
    const totalFiles = allAssets.length;

    const fetchPromises = allAssets.map(async (asset) => {
        const { folder, filename, type, mediaPath, originalImageBlob, modifiedImageBlob, newImageBlob, isModified, isNew } = asset;
        let fileBlobToZip = null;
        let fileNameToZip = filename; // Default to original filename

        try {
            if (isNew && newImageBlob) {
                // Use the newly created image blob
                fileBlobToZip = newImageBlob;
                window.updateConsoleLog(`Including NEW texture: ${filename} (Folder: ${folder})`);
            } else if (isModified && modifiedImageBlob) {
                // Use the modified image blob
                fileBlobToZip = modifiedImageBlob;
                window.updateConsoleLog(`Including MODIFIED texture: ${filename} (Folder: ${folder})`);
            } else if (originalImageBlob) {
                // Use the already fetched original image blob
                fileBlobToZip = originalImageBlob;
                window.updateConsoleLog(`Including ORIGINAL asset (cached): ${filename} (Folder: ${folder})`);
            } else {
                // Fetch the original asset if not already fetched
                const response = await fetch(mediaPath);
                if (!response.ok) {
                    console.error(`Failed to fetch original ${mediaPath}: ${response.statusText}`);
                    window.updateConsoleLog(`[ERROR] Failed to fetch original: ${filename}`);
                    return null; // Return null for failed fetches
                }
                fileBlobToZip = await response.blob();
                // Store this fetched blob in the asset object for future use
                asset.originalImageBlob = fileBlobToZip;
                window.updateConsoleLog(`Fetched & Including ORIGINAL asset: ${filename} (Folder: ${folder})`);
            }

            // Construct the full path inside the ZIP file based on export type
            const zipPath = `${baseZipPathForAssets}${folder}/1/${fileNameToZip}`;
            zip.file(zipPath, fileBlobToZip);

            filesProcessed++;
            window.updateLoadingProgress(filesProcessed, totalFiles, filename);

            return true; // Indicate success
        } catch (error) {
            console.error(`Error processing ${filename} for zip:`, error);
            window.updateConsoleLog(`[ERROR] Error processing: ${filename} - ${error.message}`);
            return null; // Return null for errors
        }
    });

    await Promise.all(fetchPromises); // Wait for all files to be processed

    // Ensure progress is 100% after all files are attempted
    window.updateLoadingProgress(totalFiles, totalFiles, 'All asset files processed.');
    window.updateConsoleLog(`\nAll asset files processed. Generating ZIP...\n`);


    try {
        const content = await zip.generateAsync({
            type: "blob",
            compression: "DEFLATE", // Use compression
            compressionOptions: {
                level: 9 // Max compression
            }
        }, function updateCallback(metadata) {
            // Update progress during ZIP generation (optional, but good for large zips)
            const generationProgress = Math.round(metadata.percent);
            progressBar.style.width = `${generationProgress}%`;
            progressPercentage.textContent = `${generationProgress}%`;
            if (metadata.currentFile) {
                window.updateConsoleLog(`Compressing: ${metadata.currentFile}`);
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


document.addEventListener('DOMContentLoaded', () => {
    initializeGallery(); // Initialize the gallery and populate allAssets array

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
});
