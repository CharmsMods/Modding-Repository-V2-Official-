document.addEventListener('DOMContentLoaded', () => {
    const textureData = [
        {
            category: "Sierra Wall Textures",
            info: "Essential wall textures for the Sierra map theme. These textures are UV mapped to work with standard wall meshes. Always maintain a 1:1 aspect ratio when editing. For solid color textures, you can use as little as 2x2 pixels, which can be selected in edit mode on the main site.",
            raw: [
                "Big-wall.jpg",
                "Wall-Texture-dirty.jpg",
                "Wall-Texture-Snow.jpg",
                "Wall-Texture-v1.jpg",
                "Wall-Texture.jpg"
            ]
        },
        {
            category: "Sierra Floor and Ground Textures",
            info: "Essential floor and ground textures for the Sierra map theme. These textures are designed for terrain and floor surfaces, with tiling patterns that work seamlessly. Maintain the recommended resolution for optimal performance - most ground textures work best at 512x512 or 1024x1024 pixels. For distant or less detailed areas, you can use lower resolutions. These textures support various ground types including grass, dirt, and sand.",
            raw: [
                "Floor-Low.jpg",
                "Ground-Sand.png",
                "Sierra-Grass.jpg",
                "Sierra-Road.jpg"
            ]
        },
        {
            category: "Pediment-like Architectural Element",
            info: "This texture is used for a specific architectural element, often seen in hallways.",
            raw: [
                "Hallway-Texture.jpg"
            ]
        },
        {
            category: "Pillar Textures (Mixed Maps)",
            info: "Various textures applied to pillars across different game maps.",
            raw: [
                "Pillar-Texture-Castle.jpg",
                "Pillar-Texture.jpg",
                "Snake-Pillar.jpg"
            ]
        },
        {
            category: "Default Character Model Textures",
            info: "These are the default base textures for the main character models.",
            raw: [
                "Echo-Default.jpg",
                "Kulu-Default.jpg",
                "Lilium-Default.jpg",
                "Shin-Default.jpg"
            ]
        },
        {
            category: "Skybox Textures (Multiple Maps)",
            info: "Comprehensive collection of skybox textures for various in-game lighting and atmosphere settings.",
            raw: [
                "FattySky00_Night_01.png", "FattySky00_Night_02.png", "FattySky00_Night_03.png",
                "FattySky00_Night_04.png", "FattySky00_Night_05.png", "FattySky00_Night_06.png",
                "FattySkybox03_Night_01.png", "FattySkybox03_Night_02.png", "FattySkybox03_Night_03.png",
                "FattySkybox03_Night_04.png", "FattySkybox03_Night_05.png", "FattySkybox03_Night_06.png",

                "FattySky00_Sunset_01.png", "FattySky00_Sunset_02.png", "FattySky00_Sunset_03.png",
                "FattySky00_Sunset_04.png", "FattySky00_Sunset_05.png", "FattySky00_Sunset_06.png",
                "FattySkybox03_Sunset_01.png", "FattySkybox03_Sunset_02.png", "FattySkybox03_Sunset_03.png",
                "FattySkybox03_Sunset_04.png", "FattySkybox03_Sunset_05.png", "FattySkybox03_Sunset_06.png",

                "FattySky00_Cloudy_01.png", "FattySky00_Cloudy_02.png", "FattySky00_Cloudy_03.png",
                "FattySky00_Cloudy_04.png", "FattySky00_Cloudy_05.png", "FattySky00_Cloudy_06.png",
                "FattySkybox03_Cloudy_01.png", "FattySkybox03_Cloudy_02.png", "FattySkybox03_Cloudy_03.png",
                "FattySkybox03_Cloudy_04.png", "FattySkybox03_Cloudy_05.png", "FattySkybox03_Cloudy_06.png",

                "FattySky00_Sunny_01.png", "FattySky00_Sunny_02.png", "FattySky00_Sunny_03.png",
                "FattySky00_Sunny_04.png", "FattySky00_Sunny_05.png", "FattySky00_Sunny_06.png",
                "FattySkybox03_Sunny_01.png", "FattySkybox03_Sunny_02.png", "FattySkybox03_Sunny_03.png",
                "FattySkybox03_Sunny_04.png", "FattySkybox03_Sunny_05.png", "FattySkybox03_Sunny_06.png"
            ]
        },
        {
            category: "Sierra Building Textures",
            info: "Textures used for buildings within the Sierra.",
            raw: [
                "desert_building_set.jpg",
                "desert_temple_texture_new.jpg",
                "desert_temple_texture.jpg",
                "desert_town_tex.png",
                "new_2_desert_temple_texture_new.jpg",
                "new_desert_temple_texture.jpg"
            ]
        },
        {
            category: "Bounce Pad Textures",
            info: "Texture for in-game bounce pads.",
            raw: [
                "BouncePad-Texture.jpg", // Note: The prompt mentions (x2 - different folders) but for display, we list it once.
                // If you have two visually distinct 'BouncePad-Texture.jpg' images, you might differentiate them by naming them 'BouncePad-Texture-V1.jpg' and 'BouncePad-Texture-V2.jpg' or similar, then update this array.
            ]
        },
        {
            category: "XP Ring Texture",
            info: "The texture used for the XP (experience) ring visual effect.",
            raw: [
                "MotionNoise.jpg"
            ]
        },
        {
            category: "Xibalba Map Textures",
            info: "A collection of textures specific to the 'Xibalba' dungeon-themed map.",
            raw: [
                "dungeon_set_01_color.jpg", // Note: (x2 - different folders) - list once or differentiate as needed.
                "dungeon_set_02_atlas_01.jpg",
                "dungeon_set_02_atlas_02.jpg",
                "Wall-Texture-4M-Dungeon.jpg",
                "floor_tile_01_metal.jpg",
                "floor_tile_01.jpg",
                "floor_tile_02.jpg",
                "Floor-Ornament.jpg",
                "Floor.jpg"
            ]
        }
    ];

    const textureSectionsContainer = document.getElementById('texture-sections');
    const lightboxModal = document.getElementById('lightbox-modal');
    const modalImage = document.getElementById('modal-image');
    const captionText = document.getElementById('caption');
    const closeButton = document.querySelector('.close');

    // Initialize lightbox event listeners
    function initLightboxEvents() {
        // Close lightbox when clicking the close button
        closeButton.removeEventListener('click', closeLightbox); // Remove any existing
        closeButton.addEventListener('click', closeLightbox);

        // Close lightbox when clicking outside the image
        lightboxModal.removeEventListener('click', lightboxClickHandler);
        lightboxModal.addEventListener('click', function lightboxClickHandler(e) {
            if (e.target === lightboxModal) {
                closeLightbox(e);
            }
        });

        // Close lightbox with Escape key
        function handleKeyDown(e) {
            if (e.key === 'Escape' && lightboxModal.style.display === 'flex') {
                closeLightbox(e);
            }
        }
        document.removeEventListener('keydown', handleKeyDown);
        document.addEventListener('keydown', handleKeyDown);
    }

    // Function to generate image HTML for raw textures
    function createRawTextureThumbnails(filenames, imagePathPrefix) {
        return filenames.map(filename => {
            const fullPath = `${imagePathPrefix}raw/${filename}`;
            return `
                <div class="thumbnail-container">
                    <img 
                        src="${fullPath}" 
                        alt="${filename}" 
                        data-fullsrc="${fullPath}"
                        onload="handleTextureLoad(this)"
                        data-filename="${filename}"
                    >
                    <p>${filename}</p>
                </div>
            `;
        }).join('');
    }

    // Handle texture loading to handle pixel density
    function handleTextureLoad(img) {
        // Store original size for reference
        if (!img.dataset.originalWidth) {
            img.dataset.originalWidth = img.naturalWidth;
            img.dataset.originalHeight = img.naturalHeight;
        }

        // For thumbnails, we don't need to do anything special
        if (!img.closest('.thumbnail-container')) {
            updateTextureScaling(img);
        }
    }

    // Update texture scaling based on device pixel ratio
    function updateTextureScaling(img) {
        if (!img.dataset.originalWidth) return;

        const pixelRatio = window.devicePixelRatio || 1;
        const maxWidth = window.innerWidth * 0.9;
        const maxHeight = window.innerHeight * 0.8;

        // Calculate scale to fit screen while maintaining pixel-perfect rendering
        let scale = 1;
        if (img.naturalWidth > maxWidth || img.naturalHeight > maxHeight) {
            const widthScale = maxWidth / img.naturalWidth;
            const heightScale = maxHeight / img.naturalHeight;
            scale = Math.min(widthScale, heightScale);
        }

        // Apply scaling
        img.style.width = `${img.naturalWidth * scale}px`;
        img.style.height = `${img.naturalHeight * scale}px`;
        img.style.imageRendering = 'pixelated';
    }

    // Handle window resize for texture scaling
    window.addEventListener('resize', () => {
        if (window.currentModalImage) {
            updateTextureScaling(window.currentModalImage);
        }
    });



    // Populate sections
    textureData.forEach(section => {
        const sectionElement = document.createElement('section');
        sectionElement.classList.add('texture-category');

        // Check if this is the skybox textures section
        const isSkyboxSection = section.category.includes('Skybox');

        sectionElement.innerHTML = `
            <div class="category-header">
                <h2>${section.category}</h2>
                <span class="arrow">></span>
            </div>
            <div class="category-content">
                <div class="content-wrapper">
                    <p class="category-info">${section.info}</p>
                    <div class="texture-subsection">
                        <h3>${isSkyboxSection ? 'Skybox Textures' : 'Raw Textures'}</h3>
                        <div class="thumbnail-grid">
                            ${createRawTextureThumbnails(section.raw, './textures/')}
                        </div>
                    </div>

                </div>
            </div>
        `;
        textureSectionsContainer.appendChild(sectionElement);
    });

    // Stepped Scroll Navigation logic
    let activeIndex = -1;
    let isAutoScrolling = false;
    let scrollDebounce = false;
    const DEBOUNCE_TIME = 150; // ms to prevent accidental double-ticks
    const headers = document.querySelectorAll('.category-header');

    window.addEventListener('wheel', (e) => {
        // Ignore if a modal is open
        if (document.getElementById('lightbox-modal').style.display === 'flex') return;

        // We allow interruption, but still keep a very tiny guard to prevent 
        // hundreds of events from a single high-inertia scroll
        if (scrollDebounce) return;

        // Get current active section
        const activeHeader = activeIndex >= 0 ? headers[activeIndex] : null;
        const activeSection = activeHeader ? activeHeader.closest('.texture-category') : null;

        if (e.deltaY > 0) {
            // SCROLL DOWN
            if (activeSection && activeHeader.classList.contains('expanded')) {
                const rect = activeSection.getBoundingClientRect();
                const bottomOfSection = rect.bottom;
                const viewportHeight = window.innerHeight;

                // If section bottom is still significantly below the viewport, allow normal scrolling
                if (bottomOfSection > viewportHeight + 20) {
                    return; // Normal scroll happens
                }
            }

            // Move to NEXT section
            if (activeIndex < headers.length - 1) {
                e.preventDefault();
                triggerDebounce();
                activeIndex++;
                navigateToSection(activeIndex);
            }
        } else if (e.deltaY < 0) {
            // SCROLL UP
            if (activeSection && activeHeader.classList.contains('expanded')) {
                const rect = activeSection.getBoundingClientRect();
                const topOfSection = rect.top;

                // If section top is still significantly above the viewport, allow normal scrolling
                if (topOfSection < -20) {
                    return; // Normal scroll happens
                }
            }

            // Move to PREVIOUS section
            if (activeIndex > 0) {
                e.preventDefault();
                triggerDebounce();
                activeIndex--;
                navigateToSection(activeIndex);
            } else if (activeIndex === 0) {
                // Close the first one if scrolling up at top
                e.preventDefault();
                triggerDebounce();
                if (headers[0].classList.contains('expanded')) {
                    headers[0].click();
                }
                activeIndex = -1;
            }
        }
    }, { passive: false });

    function triggerDebounce() {
        scrollDebounce = true;
        setTimeout(() => { scrollDebounce = false; }, DEBOUNCE_TIME);
    }

    function navigateToSection(index) {
        if (index < 0 || index >= headers.length) return;

        isAutoScrolling = true;
        const targetHeader = headers[index];

        // If not already expanded, expand it
        if (!targetHeader.classList.contains('expanded')) {
            targetHeader.click();
        }

        // Center the section in viewport
        setTimeout(() => {
            targetHeader.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // Re-enable scrolling after smooth scroll roughly finishes
            setTimeout(() => {
                isAutoScrolling = false;
            }, 500);
        }, 50);
    }

    // Synchronize activeIndex if user clicks manually
    headers.forEach((header, idx) => {
        header.addEventListener('click', () => {
            const isExpanding = !header.classList.contains('expanded');
            if (isExpanding) {
                activeIndex = idx;
            } else if (activeIndex === idx) {
                activeIndex = -1;
            }
        });
    });

    // Add collapse/expand functionality (Only one section open at a time)
    document.querySelectorAll('.category-header').forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            const isExpanding = !header.classList.contains('expanded');

            // If we are expanding this one, close any other open sections first
            if (isExpanding) {
                document.querySelectorAll('.category-header.expanded').forEach(otherHeader => {
                    if (otherHeader === header) return;
                    const otherContent = otherHeader.nextElementSibling;

                    // Collapse the other section
                    otherContent.classList.add('animating', 'animating-out');
                    otherHeader.classList.remove('expanded');
                    otherContent.style.maxHeight = otherContent.scrollHeight + 'px';
                    void otherContent.offsetHeight;
                    otherContent.style.maxHeight = '0';
                    otherContent.classList.remove('expanded');

                    const arrow = otherHeader.querySelector('.arrow');
                    if (arrow) arrow.style.transform = 'rotate(0)';

                    const onOtherTransitionEnd = () => {
                        otherContent.classList.remove('animating', 'animating-out');
                        otherContent.style.maxHeight = '';
                        otherContent.removeEventListener('transitionend', onOtherTransitionEnd);
                    };
                    otherContent.addEventListener('transitionend', onOtherTransitionEnd, { once: true });
                });
            }

            // Toggle Logic
            if (isExpanding) {
                content.style.display = 'grid';
                content.classList.add('animating', 'animating-in');
                header.classList.add('expanded');
                content.style.maxHeight = '5000px';

                void content.offsetHeight;
                content.classList.add('expanded');

                setTimeout(() => {
                    content.classList.remove('animating', 'animating-in');
                }, 300);
            } else {
                content.classList.add('animating', 'animating-out');
                header.classList.remove('expanded');
                content.style.maxHeight = content.scrollHeight + 'px';
                void content.offsetHeight;
                content.style.maxHeight = '0';
                content.classList.remove('expanded');

                const onTransitionEnd = () => {
                    content.classList.remove('animating', 'animating-out');
                    content.style.maxHeight = '';
                    content.removeEventListener('transitionend', onTransitionEnd);
                };
                content.addEventListener('transitionend', onTransitionEnd, { once: true });
            }

            const arrow = header.querySelector('.arrow');
            if (arrow) {
                arrow.style.transform = isExpanding ? 'rotate(90deg)' : 'rotate(0)';
                arrow.style.transition = 'transform 0.3s ease-out';
            }
        });
    });

    // Initialize lightbox functionality
    function initLightbox(container = document) {
        container.querySelectorAll('.thumbnail-container img').forEach(img => {
            // Remove any existing click handlers to prevent duplicates
            img.removeEventListener('click', handleThumbnailClick);
            img.addEventListener('click', handleThumbnailClick);

            // Ensure pixel-perfect rendering for thumbnails
            if (img.complete) {
                handleTextureLoad(img);
            } else {
                img.onload = () => handleTextureLoad(img);
            }
        });
    }

    function handleThumbnailClick() {
        const modalImage = document.getElementById('modal-image');
        const captionText = document.getElementById('caption');
        const lightboxModal = document.getElementById('lightbox-modal');

        // Store original source and set loading state
        modalImage.src = ''; // Clear previous image
        modalImage.style.display = 'none';
        lightboxModal.style.display = 'block';

        // Show loading indicator
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'loading-indicator';
        loadingIndicator.textContent = 'Loading...';
        lightboxModal.appendChild(loadingIndicator);

        // Load the new image
        const img = new Image();
        img.onload = function () {
            modalImage.src = this.src;
            modalImage.alt = this.alt;
            modalImage.dataset.originalWidth = this.naturalWidth;
            modalImage.dataset.originalHeight = this.naturalHeight;

            // Update caption
            captionText.textContent = this.alt;

            // Update scaling
            updateTextureScaling(modalImage);
            modalImage.style.display = 'block';

            // Remove loading indicator
            if (loadingIndicator.parentNode) {
                loadingIndicator.parentNode.removeChild(loadingIndicator);
            }

            // Store reference to current modal image for resize handling
            window.currentModalImage = modalImage;
        };

        // Handle image load errors
        img.onerror = function () {
            console.error('Failed to load image:', this.src);
            if (loadingIndicator.parentNode) {
                loadingIndicator.textContent = 'Failed to load image';
                loadingIndicator.className = 'error';
            }
        };

        // Start loading the image
        img.src = this.dataset.fullsrc || this.src;
    }

    // Function to handle opening the lightbox
    function openLightbox(imgElement) {
        const modalImage = document.getElementById('modal-image');
        const captionText = document.getElementById('caption');
        const lightboxModal = document.getElementById('lightbox-modal');

        console.log('Opening lightbox with image:', imgElement.dataset.fullsrc);

        // Show loading state
        modalImage.style.opacity = '0';
        lightboxModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        // Load the image first
        const img = new Image();
        img.onload = function () {
            modalImage.src = this.src;
            modalImage.alt = this.alt;
            captionText.textContent = this.alt;

            // Update scaling and show the image
            updateTextureScaling(modalImage);
            modalImage.style.opacity = '1';

            // Store reference for resize handling
            window.currentModalImage = modalImage;
        };

        img.onerror = function () {
            console.error('Failed to load image:', this.src);
            captionText.textContent = 'Failed to load image';
        };

        // Start loading
        img.src = imgElement.dataset.fullsrc || imgElement.src;
    }

    // Function to close the lightbox
    function closeLightbox(e) {
        if (e) e.preventDefault();
        const lightboxModal = document.getElementById('lightbox-modal');
        lightboxModal.style.display = 'none';
        document.body.style.overflow = ''; // Restore scrolling
        console.log('Lightbox closed, scrolling restored');
    }

    // Initialize lightbox for existing images and set up event listeners
    initLightbox();
    initLightboxEvents();


}); // Close the DOMContentLoaded event listener