# Venge.io Modding Repository

A comprehensive web-based modding platform for Venge.io that enables players to create, edit, and manage custom game assets including textures, sounds, and visual modifications.

## 🎮 Overview

This repository provides a complete modding ecosystem for Venge.io, featuring:

- **Web-based Asset Editor**: Modify textures with real-time preview
- **Bulk Operations**: Apply changes to multiple assets simultaneously  
- **Asset Management**: Organize and categorize game resources
- **Browser Extension**: Seamlessly integrate mods into the game
- **Import/Export System**: Share and distribute mod configurations
- **Texture Information Database**: Comprehensive guide for modders

## 🏗️ Project Structure

```
├── 📁 Root Application Files
│   ├── index.html                    # Main application interface
│   ├── asset-list-page.js           # Core asset management logic
│   ├── asset-list-page.css          # Main styling
│   ├── asset-editor-modal.js        # Texture editing functionality
│   ├── asset-editor-modal.css       # Editor modal styling
│   ├── bulk-operations.js           # Multi-asset operations
│   ├── bulk-operations-modal.css    # Bulk operations styling
│   ├── export-options-popup.js      # Export configuration
│   ├── export-options-popup.css     # Export popup styling
│   ├── import-export.js             # Data management system
│   ├── image-converter.js           # Image processing utilities
│   └── fav.png                      # Application favicon
│
├── 📁 mod-assets/                    # Game Asset Repository
│   ├── 📁 jpg/                      # Texture files (400+ assets)
│   │   ├── Character skins (Echo, Kulu, Lilium, Shin)
│   │   ├── Weapon textures (AK-47, AWP, M4, Scar, etc.)
│   │   ├── Map textures (Sierra, Temple, Mistle, etc.)
│   │   ├── UI elements and effects
│   │   └── Seasonal/themed content
│   ├── 📁 mp3/                      # Audio files (200+ sounds)
│   │   ├── Weapon sounds (fire, reload, impact)
│   │   ├── Character voices and effects
│   │   ├── Ambient sounds and music
│   │   └── UI interaction sounds
│   └── 📁 png/                      # UI and effect textures (500+ assets)
│       ├── Icons and interface elements
│       ├── Particle effects and sprites
│       ├── Skybox textures
│       └── Overlay graphics
│
├── 📁 TextureInfoPage/               # Modding Documentation
│   ├── textures.html                # Texture reference guide
│   ├── textures.js                  # Interactive texture browser
│   ├── textures.css                 # Documentation styling
│   └── 📁 textures/                 # Reference images
│
├── 📁 browser-static-files-for-fetch/ # Chrome Extension
│   ├── manifest.json                # Extension configuration
│   ├── init.js                      # Background script
│   ├── popup.html                   # Extension popup interface
│   ├── charfix.js                   # Character encoding fixes
│   └── README.md                    # Installation instructions
│
└── 📁 Asset Lists                    # Resource Catalogs
    ├── jpgurl.txt                   # JPG asset registry (ID mappings)
    ├── mp3list.txt                  # MP3 asset registry
    └── pnglist.txt                  # PNG asset registry
```

## ✨ Key Features

### 🎨 Asset Editor
- **Real-time Texture Editing**: Modify saturation, colors, and effects with live preview
- **Canvas-based Editor**: Professional-grade editing tools built into the browser
- **Multiple Format Support**: Handle JPG, PNG, and other image formats
- **Undo/Redo System**: Non-destructive editing workflow

### 🔧 Bulk Operations
- **Multi-select Mode**: Select and modify multiple assets simultaneously
- **Batch Processing**: Apply consistent changes across asset collections
- **Bulk Resize**: Maintain aspect ratios while resizing textures
- **Mass Color Adjustments**: Apply saturation and color changes to groups

### 📦 Import/Export System
- **Configuration Export**: Save and share mod setups as JSON files
- **Client Export**: Generate mod packages for game integration
- **Browser Export**: Create extension-compatible asset bundles
- **Cross-platform Compatibility**: Support for different deployment methods

### 🔍 Asset Management
- **Smart Search**: Find assets by name, type, or category
- **Filtering System**: Organize assets by file type and usage
- **Preview System**: Thumbnail generation and full-screen viewing
- **Metadata Tracking**: Maintain asset information and relationships

### 🌐 Browser Integration
- **Chrome Extension**: Seamless in-game mod loading
- **Resource Swapping**: Replace game assets on-the-fly
- **Local Development**: Test mods without affecting game files
- **Cross-origin Support**: Handle various asset sources

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Edge)
- Local web server (for development)
- Basic understanding of image editing concepts

### Installation

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd venge-modding-repository
   ```

2. **Set Up Local Server**
   ```bash
   # Using Python
   python -m http.server 8080
   
   # Using Node.js
   npx http-server -p 8080
   
   # Using PHP
   php -S localhost:8080
   ```

3. **Access the Application**
   Open `http://localhost:8080` in your browser

### Browser Extension Setup

1. **Prepare Extension**
   - Navigate to `browser-static-files-for-fetch/`
   - Add your custom assets to the appropriate folders

2. **Install in Chrome**
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `browser-static-files-for-fetch` folder

3. **Configure Extension**
   - The extension will automatically intercept Venge.io asset requests
   - Replace game assets with your custom modifications

## 📖 Usage Guide

### Basic Asset Editing

1. **Browse Assets**
   - Use the search bar to find specific textures
   - Click on any asset thumbnail to open the editor

2. **Edit Textures**
   - Adjust saturation using the slider
   - Preview changes in real-time
   - Save modifications when satisfied

3. **Bulk Operations**
   - Click "Select Assets" to enter multi-select mode
   - Choose multiple assets using checkboxes
   - Apply bulk operations from the toolbar

### Advanced Features

#### Creating New Textures
- Use the "Create New Texture" tab in the editor
- Set custom dimensions and colors
- Generate solid color or gradient backgrounds

#### Importing Custom Images
- Use bulk upload to replace textures with custom images
- Maintain proper aspect ratios for game compatibility
- Preview changes before applying

#### Export Configurations
- Save your mod setup as JSON for sharing
- Choose between Client and Browser export formats
- Include only modified assets to reduce file size

## 🎯 Asset Categories

### Character Textures
- **Echo**: Default, Diamond, Demon, Jester variants
- **Kulu**: Default, Diamond, Egyptian, Totem variants  
- **Lilium**: Default, Diamond, Wizard, Dragon variants
- **Shin**: Default, Diamond, Ninja, Snowman variants

### Weapon Skins
- **Assault Rifles**: AK-47, M4, Scar variants
- **Sniper Rifles**: AWP, Sniper with multiple themes
- **Pistols**: Desert Eagle, Tec-9 modifications
- **Special Weapons**: LMG, Shotgun, Rocket Launcher

### Map Assets
- **Sierra**: Grass, walls, terrain textures
- **Temple**: Ancient architecture and decorations
- **Mistle**: Winter and snow-themed assets
- **Runes**: Mystical and magical elements

### UI Elements
- **HUD Components**: Health bars, crosshairs, indicators
- **Menu Graphics**: Buttons, backgrounds, icons
- **Effects**: Particle systems, explosions, impacts

## 🛠️ Technical Details

### Architecture
- **Frontend**: Vanilla JavaScript with HTML5 Canvas
- **Asset Processing**: Client-side image manipulation
- **Storage**: Browser localStorage for configurations
- **Export**: JSZip for package generation

### File Formats
- **Textures**: JPG, PNG with transparency support
- **Audio**: MP3 format for all sound effects
- **Configurations**: JSON for mod settings
- **Packages**: ZIP archives for distribution

### Performance Optimizations
- **Lazy Loading**: Assets loaded on-demand
- **Thumbnail Generation**: Reduced-size previews
- **Memory Management**: Efficient blob handling
- **Batch Processing**: Optimized bulk operations

## 🔧 Development

### Adding New Assets
1. Place files in appropriate `mod-assets/` subdirectory
2. Update corresponding `.txt` registry file
3. Include asset metadata and ID mapping

### Extending Functionality
- **Custom Filters**: Add new image processing effects
- **Export Formats**: Support additional package types
- **Asset Types**: Extend beyond textures and sounds
- **Integration**: Connect with other modding tools

### API Reference
```javascript
// Core asset management
window.allAssets          // Global asset registry
window.allCards           // UI card references

// Image processing
applyBulkSaturation()     // Bulk saturation adjustment
createNewTexture()        // Generate new textures
resizeTextures()          // Batch resize operations

// Import/Export
exportChanges()           // Generate mod packages
handleImportFile()        // Process imported configurations
```

## 🤝 Contributing

### Guidelines
- Follow existing code style and structure
- Test changes across different browsers
- Document new features and APIs
- Maintain backward compatibility

### Asset Contributions
- Use appropriate file formats and resolutions
- Include proper attribution for custom content
- Test assets in-game before submission
- Provide clear descriptions and categories

## 📄 License

Licensed under the MIT License. See LICENSE file for full license information.

**SPDX-License-Identifier: MIT**

Use of this code requires attribution to the original author.

## 🙏 Acknowledgments

- Venge.io community for asset identification and testing
- Contributors who provided texture mappings and documentation
- Browser extension developers for integration techniques
- Open source libraries: JSZip, FileSaver.js, Font Awesome

## 📞 Support

For questions, issues, or contributions:
- Check existing documentation in `TextureInfoPage/`
- Review browser extension setup in `browser-static-files-for-fetch/README.md`
- Test changes locally before deployment
- Ensure compatibility with latest Venge.io updates

---

**Happy Modding! 🎮✨**