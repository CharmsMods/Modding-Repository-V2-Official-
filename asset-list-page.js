// DOM Elements
let searchInput;
let allCards;

// Card Creation
function createAndAppendCard(folder, filename, type) {
    // Create main card element
    const card = document.createElement('div');
    card.className = 'texture-card';
    card.style.display = 'block';
    card.style.visibility = 'visible';
    card.style.opacity = '1';

    let mediaPath; // Declare mediaPath here, as it's used by both branches

    if (type.toLowerCase() === 'mp3') {
        card.className += ' mp3'; // Add mp3 class for specific styling
        mediaPath = `./mod-assets/${type.toLowerCase()}/${filename}`;

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
             navigator.clipboard.writeText(folder);
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
            navigator.clipboard.writeText(folder);
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

    } else { // Logic for PNG/JPG cards (remains largely unchanged from before)
        mediaPath = `./mod-assets/${type.toLowerCase()}/${filename}`;

        // Create media container
        const mediaContainer = document.createElement('div');
        mediaContainer.className = 'media-container';

        // Create appropriate media element/placeholder based on type
        if (type.toLowerCase() === 'png' || type.toLowerCase() === 'jpg') {
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
                mediaContainer.appendChild(placeholder);
            };
            mediaContainer.appendChild(mediaElement);
        }
        card.appendChild(mediaContainer); // Append mediaContainer for non-MP3s

        // Create info container
        const infoContainer = document.createElement('div');
        infoContainer.className = 'texture-info';

        // Create file-info container
        const fileInfoContainer = document.createElement('div');
        fileInfoContainer.className = 'file-info';

        // Filename Element Creation for PNG/JPGs (only for non-MP3s)
        const filenameElement = document.createElement('div');
        filenameElement.className = 'texture-filename';
        filenameElement.textContent = filename;
        fileInfoContainer.appendChild(filenameElement);

        // Folder/artist/album element (only for non-MP3s)
        const folderOrArtistAlbumElement = document.createElement('div');
        folderOrArtistAlbumElement.className = 'texture-name';
        folderOrArtistAlbumElement.textContent = folder;
        fileInfoContainer.appendChild(folderOrArtistAlbumElement);

        infoContainer.appendChild(fileInfoContainer);

        // Create buttons container for non-MP3s
        const actionButtonsContainer = document.createElement('div');
        actionButtonsContainer.className = 'buttons-container';

        const copyButton = document.createElement('button');
        copyButton.className = 'copy-button'; // Specific class for non-MP3 copy button
        copyButton.textContent = 'Copy Folder';
        copyButton.onclick = () => {
            navigator.clipboard.writeText(folder);
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
}

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

// Main initialization and playAudio function (unchanged)
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
        alert('Failed to play audio file. Please check if the file exists and is accessible.');
    });
}

document.addEventListener('DOMContentLoaded', initializeGallery);