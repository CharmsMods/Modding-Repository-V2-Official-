// DOM Elements
let searchInput;
let allCards;
// Store a global list of all assets fetched to be used for zipping
// Each asset object will now also store its Blob data and modification status.
const allAssets = [];

// DOM elements for loading/progress
let loadingOverlay;
let progressBar;
let progressPercentage;
let consoleLog;

// Card Creation
function createAndAppendCard(folder, filename, type) {
    // Create main card element
    const card = document.createElement('div');
    card.className = 'texture-card';
    card.style.display = 'block';
    card.style.visibility = 'visible';
    card.style.opacity = '1';

    let mediaPath = `./mod-assets/${type.toLowerCase()}/${filename}`;

    // Create asset object and add to the global list for zipping
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
        playIcon.onclick = () => playAudio(mediaPath);

        const mp3FilenameDisplay = document.createElement('div');
        mp3FilenameDisplay.className = 'mp3-filename-display';
        mp3FilenameDisplay.textContent = filename;

        const folderNumberButton = document.createElement('button');
        folderNumberButton.className = 'folder-number-button';
        folderNumberButton.textContent = `Folder: ${folder}`;
        folderNumberButton.onclick = () => {
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

        // Create button elements for the bottom of the card
        const copyFolderButton = document.createElement('button');
        copyFolderButton.className = 'copy-folder-button';
        copyFolderButton.textContent = 'Copy Folder';
        copyFolderButton.onclick = () => {
            // Use document.execCommand('copy') for clipboard operations in iframe context
            const tempInput = document.createElement('textarea');
            tempInput.value = folder;
            document.body.appendChild(tempInput);
            tempInput.select();
            document.execCommand('copy');
            document.body.removeChild(tempInput);

            copyFolderButton.textContent = 'Copied!';
            setTimeout(() => { copyFolderButton.textContent = 'Copy Folder'; }, 2000);
        };

        const downloadButton = document.createElement('button');
        downloadButton.className = 'download-button';
        downloadButton.textContent = 'Download';
        downloadButton.onclick = () => {
            const downloadLink = document.createElement('a');
            downloadLink.href = mediaPath;
            downloadLink.download = filename;
            downloadLink.click();
        };

        // Create a wrapper for the action buttons to manage their layout
        const mp3ButtonsWrapper = document.createElement('div');
        mp3ButtonsWrapper.className = 'mp3-buttons-wrapper'; // New class for this wrapper
        mp3ButtonsWrapper.appendChild(copyFolderButton);
        mp3ButtonsWrapper.appendChild(downloadButton);

        // Append all consolidated elements directly to the main card
        card.appendChild(playIcon);
        card.appendChild(mp3FilenameDisplay);
        card.appendChild(folderNumberButton);
        card.appendChild(mp3ButtonsWrapper);

    } else { // Logic for PNG/JPG cards
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
        editAssetButton.onclick = () => {
            // Call the modal function from asset-editor-modal.js
            // Pass the entire asset object reference and the card element for in-memory modification and visual update
            if (typeof window.openAssetEditorModal === 'function') {
                window.openAssetEditorModal(asset, card);
            } else {
                console.error('openAssetEditorModal function not found. Is asset-editor-modal.js loaded correctly?');
            }
        };
        actionButtonsContainer.appendChild(editAssetButton);


        const copyButton = document.createElement('button');
        copyButton.className = 'copy-button'; // Specific class for non-MP3 copy button
        copyButton.textContent = 'Copy Folder';
        copyButton.onclick = () => {
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
        downloadButton.onclick = () => {
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
 * This function is called from asset-editor-modal.js after changes are saved.
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
        // Removed alert, logging to console instead.
    });
}

// --- New ZIP Download Functionality with Progress ---

document.addEventListener('DOMContentLoaded', () => {
    initializeGallery(); // Initialize the gallery and populate allAssets array

    const downloadAllZipButton = document.getElementById('download-all-zip-button');

    // Get references to the new loading UI elements
    loadingOverlay = document.getElementById('loading-overlay');
    progressBar = document.getElementById('progress-bar');
    progressPercentage = document.getElementById('progress-percentage');
    consoleLog = document.getElementById('console-log');


    if (downloadAllZipButton && loadingOverlay && progressBar && progressPercentage && consoleLog) {
        downloadAllZipButton.addEventListener('click', async () => {
            // Show loading overlay
            loadingOverlay.classList.add('active');
            progressBar.style.width = '0%';
            progressPercentage.textContent = '0%';
            consoleLog.textContent = ''; // Clear previous log

            const zip = new JSZip();

            // Define the base path within the zip as per the game's requirements
            const baseZipPath = "Venge Client/Resource Swapper/files/assets/";

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
                        consoleLog.textContent += `Including NEW texture: ${filename} (Folder: ${folder})\n`;
                    } else if (isModified && modifiedImageBlob) {
                        // Use the modified image blob
                        fileBlobToZip = modifiedImageBlob;
                        consoleLog.textContent += `Including MODIFIED texture: ${filename} (Folder: ${folder})\n`;
                    } else if (originalImageBlob) {
                        // Use the already fetched original image blob
                        fileBlobToZip = originalImageBlob;
                        consoleLog.textContent += `Including ORIGINAL asset: ${filename} (Folder: ${folder})\n`;
                    } else {
                        // Fetch the original asset if not already fetched
                        const response = await fetch(mediaPath);
                        if (!response.ok) {
                            console.error(`Failed to fetch original ${mediaPath}: ${response.statusText}`);
                            consoleLog.textContent += `[ERROR] Failed to fetch original: ${filename}\n`;
                            consoleLog.scrollTop = consoleLog.scrollHeight;
                            return null; // Return null for failed fetches
                        }
                        fileBlobToZip = await response.blob();
                        // Store this fetched blob in the asset object for future use
                        asset.originalImageBlob = fileBlobToZip;
                        consoleLog.textContent += `Fetched & Including ORIGINAL asset: ${filename} (Folder: ${folder})\n`;
                    }

                    // Construct the full path inside the ZIP file
                    const zipPath = `${baseZipPath}${folder}/1/${fileNameToZip}`;
                    zip.file(zipPath, fileBlobToZip);

                    filesProcessed++;
                    const progress = Math.round((filesProcessed / totalFiles) * 100);
                    progressBar.style.width = `${progress}%`;
                    progressPercentage.textContent = `${progress}%`;
                    consoleLog.scrollTop = consoleLog.scrollHeight; // Scroll to bottom

                    return true; // Indicate success
                } catch (error) {
                    console.error(`Error processing ${filename} for zip:`, error);
                    consoleLog.textContent += `[ERROR] Error processing: ${filename} - ${error.message}\n`;
                    consoleLog.scrollTop = consoleLog.scrollHeight;
                    return null; // Return null for errors
                }
            });

            await Promise.all(fetchPromises); // Wait for all files to be processed

            // Ensure progress is 100% after all files are attempted
            progressBar.style.width = '100%';
            progressPercentage.textContent = '100%';
            consoleLog.textContent += `\nAll files processed. Generating ZIP...\n`;
            consoleLog.scrollTop = consoleLog.scrollHeight;

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
                        consoleLog.textContent += `Compressing: ${metadata.currentFile}\n`;
                        consoleLog.scrollTop = consoleLog.scrollHeight;
                    }
                });

                saveAs(content, "mod-assets.zip");
                downloadAllZipButton.textContent = 'Download Complete!';
                consoleLog.textContent += `\nZIP file "mod-assets.zip" downloaded successfully!\n`;
                consoleLog.scrollTop = consoleLog.scrollHeight;
            } catch (error) {
                console.error("Error generating or saving zip:", error);
                downloadAllZipButton.textContent = 'Download Failed!';
                consoleLog.textContent += `\n[FATAL ERROR] Failed to generate or save ZIP: ${error.message}\n`;
                consoleLog.scrollTop = consoleLog.scrollHeight;
                // Removed alert, logging to console instead.
            } finally {
                // Keep overlay visible for a bit to show final message, then hide
                setTimeout(() => {
                    loadingOverlay.classList.remove('active');
                    downloadAllZipButton.textContent = 'Download All as ZIP';
                    downloadAllZipButton.disabled = false;
                }, 3000); // Hide after 3 seconds
            }
        });
    } else {
        console.error('One or more required DOM elements for ZIP functionality not found!');
        if (!downloadAllZipButton) console.error('download-all-zip-button not found!');
        if (!loadingOverlay) console.error('loading-overlay not found!');
        if (!progressBar) console.error('progress-bar not found!');
        if (!progressPercentage) console.error('progress-percentage not found!');
        if (!consoleLog) console.error('console-log not found!');
    }
});

// Function to play audio (remains unchanged)
function playAudio(audioPath) {
    const audio = new Audio(audioPath);
    audio.play().catch(error => {
        console.error('Error playing audio:', error);
        console.error('Failed to play audio file. Please check if the file exists and is accessible.');
    });
}
