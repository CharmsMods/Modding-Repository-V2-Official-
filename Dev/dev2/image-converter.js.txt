/*
 * Copyright (c) 2025 Charm?
 *
 * Licensed under the MIT License. See LICENSE file in the project root for full license information.
 *
 * SPDX-License-Identifier: MIT
 *
 * This file contains helper functions for the website frontend.
 */


// image-converter.js
// This file provides a utility function for converting image Blobs between different formats
// using the browser's native canvas API.

/**
 * Converts an image Blob from its current format to a specified target MIME type.
 *
 * This function leverages an HTML5 canvas element to:
 * 1. Load the source image.
 * 2. Draw the image onto the canvas.
 * 3. Export the canvas content as a new Blob in the desired format.
 *
 * Supported input image formats are typically those that a web browser can render
 * (e.g., JPEG, PNG, GIF, WebP, BMP).
 *
 * Supported output formats are generally 'image/png' and 'image/jpeg', as these are
 * widely supported by `HTMLCanvasElement.toBlob()`. Other formats might be supported
 * depending on browser implementation.
 *
 * @param {Blob} imageBlob The source image Blob to be converted. This Blob should contain
 * image data in a format the browser can decode.
 * @param {string} targetMimeType The desired MIME type for the output image Blob (e.g., 'image/png', 'image/jpeg').
 * This string must be a valid MIME type supported by `canvas.toBlob()`.
 * @returns {Promise<Blob|null>} A Promise that resolves with the new Blob in the target format.
 * The Promise resolves with `null` if:
 * - The image fails to load (e.g., due to corrupt data or unsupported format).
 * - The conversion to the target MIME type fails (though less common for standard types).
 */
window.convertImageBlob = async (imageBlob, targetMimeType) => {
    return new Promise((resolve) => {
        // Create a new Image object. This object will be used to load the image data
        // from the provided Blob.
        const img = new Image();


        // Set the onload event handler. This function will be executed once the image
        // has successfully loaded.
        img.onload = () => {
            // Create an off-screen canvas element. This canvas acts as a temporary drawing surface
            // to manipulate the image pixels.
            const canvas = document.createElement('canvas');

            // Get the 2D rendering context of the canvas. This context provides methods
            // for drawing and manipulating graphics on the canvas.
            const ctx = canvas.getContext('2d');


            // Set the dimensions of the canvas to match the loaded image. This ensures
            // the entire image is captured without cropping or scaling issues.
            canvas.width = img.width;
            canvas.height = img.height;


            // Draw the loaded image onto the canvas at position (0,0).
            // This transfers the pixel data from the Image object to the canvas.
            ctx.drawImage(img, 0, 0);


            // Attempt to convert the canvas content into a Blob of the specified target MIME type.
            // The `toBlob` method is asynchronous and takes a callback function that is
            // executed once the Blob is created.
            // The optional third parameter (quality) is typically ignored for 'image/png'
            // and applies to 'image/jpeg' to control compression level (0.0 to 1.0).
            canvas.toBlob((blob) => {
                // Revoke the object URL that was created from the original imageBlob.
                // This is crucial for memory management, releasing the browser's internal
                // reference to the Blob data once it's no longer needed by the Image object.
                URL.revokeObjectURL(img.src);

                // Resolve the Promise with the newly created Blob in the target format.
                resolve(blob);
            }, targetMimeType);
        };


        // Set the onerror event handler. This function will be executed if there's an error
        // loading the image (e.g., invalid image data, corrupted file).
        img.onerror = (e) => {
            // Log the error to the console for debugging purposes.
            console.error('Error loading image for conversion:', e);

            // Revoke the object URL even in case of an error to prevent memory leaks.
            URL.revokeObjectURL(img.src);

            // Resolve the Promise with null to indicate that the conversion failed.
            resolve(null);
        };


        // Create a DOMString containing a URL representing the imageBlob.
        // This object URL acts as a temporary link to the Blob data, allowing the
        // Image object to load it as its source.
        img.src = URL.createObjectURL(imageBlob);
    });
};