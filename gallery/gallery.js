/*
 * Vetrom Gallery V1 — The Ultimate Media Carousel API
 * By Mahdi Yasser
 *
 * --- HOW TO USE ---
 *
 * * Before anything, you must include the script file:
 * <script src="https://api.mahdiyasser.site/gallery/v1/gallery.js"></script>
 *
 * 1. Standard Use (Basic Image/Video Gallery)
 * ------------------------------------------
 * To convert a group of images and/or videos into a working, swipeable gallery
 * with lightbox functionality, simply wrap them in a <div> with the required class.
 *
 * * ACTION:
 * * Add the class "vetrom-gallery" to the parent <div> tag that contains your media.
 * * NOTE: The script transforms the original <div> into the final gallery structure.
 *
 * * EXAMPLE 1:
 * <div class="vetrom-gallery">
 * <img src="photo1.jpg" alt="First slide">
 * <img src="photo2.png" alt="Second slide">
 * <video src="clip.mp4"></video> 
 * </div>
 *
 * * EXAMPLE 2 Using Vetrom Media Player For The Video:
 * * NOTE: ADD THIS LINE IN THE <head> OR <body>
 * * <script src="https://api.mahdiyasser.site/player/v1/player.js"></script>
 *
 * <div class="vetrom-gallery">
 * <img src="photo1.jpg" alt="First slide">
 * <img src="photo2.png" alt="Second slide">
 * <video src="clip.mp4" class="vetrom-media-selected"></video> 
 * </div>
 *
 * ---
 *
 * 2. Advanced Use (Multiple Galleries)
 * ------------------------------------
 * If you need multiple independent galleries on the same page, you can optionally
 * append a unique number after the class name, although simply using 
 * "vetrom-gallery" on multiple divs will also work automatically.
 *
 * * ACTION:
 * * Use the class "vetrom-gallery:[ID]" where [ID] is a unique identifier (e.g., a number).
 *
 * * EXAMPLE:
 * <div class="vetrom-gallery:1">
 * * </div>
 * * <div class="vetrom-gallery:2">
 * * </div>
 *
 * ---
 *
 * 3. Theme Customization (CSS Variables)
 * --------------------------------------
 * The gallery attempts to automatically match your site's body background color.
 * To override this and enforce a specific color scheme for the gallery controls,
 * you can define the following CSS variables on the `:root` selector or on the 
 * gallery container itself.
 *
 * * VARIABLES (to be set in a <style> block or CSS file):
 * :root {
 *  Gallery background color (slides) 
 * --vetrom-bg: #222222; 
 * * Text/Icon color for controls 
 * --vetrom-text: #ffffff; 
 * * Background color for controls (buttons) 
 * --vetrom-accent: rgba(255, 255, 255, 0.4); 
 * }
 *
 * ---
 * * 📄 MIT License
 * * Copyright (c) 2025 Mahdi Yasser
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

(function() {
const SVG_PREV = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 22L4 12L16 2L18 4L8 12L18 20L16 22Z"/></svg>`;
const SVG_NEXT = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 22L20 12L8 2L6 4L16 12L6 20L8 22Z"/></svg>`;

    function parseColor(color) {
        let r = 0, g = 0, b = 0;

        if (color.startsWith('#')) {
            const hex = color.length === 4 ? color.slice(1).split('').map(c => c + c).join('') : color.slice(1);
            r = parseInt(hex.substring(0, 2), 16);
            g = parseInt(hex.substring(2, 4), 16);
            b = parseInt(hex.substring(4, 6), 16);
        } else if (color.startsWith('rgb')) {
            const matches = color.match(/\d+/g);
            if (matches && matches.length >= 3) {
                r = parseInt(matches[0]);
                g = parseInt(matches[1]);
                b = parseInt(matches[2]);
            }
        }
        return {r, g, b};
    }

    function getLuminance({r, g, b}) {
        const a = [r, g, b].map(v => {
            v /= 255;
            return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        });
        return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
    }

    function rgbToRgbString({r, g, b}) {
        return `${r}, ${g}, ${b}`;
    }

    function decodeBase64(base64Data) {
        try {
            base64Data = base64Data.replace(/-/g, '+').replace(/_/g, '/');
            while (base64Data.length % 4) {
                base64Data += '=';
            }
            return atob(base64Data);
        } catch (e) {
            console.error("Error decoding Base64 data:", e);
            return base64Data;
        }
    }
    
    function isVideoElement(element) {
        return element.tagName === 'VIDEO';
    }

    const css = `
        :root {
            --vetrom-bg: #ffffff; 
            --vetrom-text: #000000;
            --vetrom-accent: rgba(0, 0, 0, 0.5);
            --vetrom-text-rgb: 0, 0, 0; 
            --vetrom-lightbox-icon-color: #ffffff; 
        }
        
        .vetrom-gallery-container {
            position: relative;
            max-width: 100%;
            padding-bottom: 50.625%; 
            height: 0;
            overflow: hidden;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            margin: 20px auto;
        }
        .vetrom-gallery-image-wrapper {
            position: absolute; 
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            transition: transform 0.3s ease-in-out;
            cursor: pointer;
        }
        .vetrom-gallery-slide {
            flex: 0 0 100%;
            width: 100%;
            height: 100%;
            box-sizing: border-box;
            user-select: none;
            display: flex; 
            align-items: center;
            justify-content: center;
            background-color: var(--vetrom-bg); 
        }
        .vetrom-gallery-slide img,
        .vetrom-gallery-slide video { 
            display: block;
            width: 100%;
            height: 100%;
            border-radius: 8px;
            object-fit: contain; 
            -webkit-user-drag: none;
            -khtml-user-drag: none;
            -moz-user-drag: none;
            -o-user-drag: none;
            user-drag: none;
            -webkit-user-select: none; 
            -moz-user-select: none; 
            -ms-user-select: none; 
            user-select: none;
        }
        .vetrom-gallery-slide video {
            cursor: default; 
        }
        .vetrom-gallery-control {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            background: var(--vetrom-accent); 
            color: var(--vetrom-text);
            border: none;
            padding: 10px;
            cursor: pointer;
            z-index: 10;
            user-select: none;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.2s;
        }
        .vetrom-gallery-control svg {
            width: 32px; 
            height: 32px;
        }
        .vetrom-gallery-control:hover {
            background: rgba(var(--vetrom-text-rgb), 0.7); 
        }
        .vetrom-gallery-control.prev {
            left: 10px;
        }
        .vetrom-gallery-control.next {
            right: 10px;
        }
        .vetrom-lightbox-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            z-index: 9999;
            display: none;
            align-items: center;
            justify-content: center;
            transition: opacity 0.3s;
            opacity: 0;
        }
        .vetrom-lightbox-overlay.active {
            display: flex;
            opacity: 1;
        }
        .vetrom-lightbox-content {
            position: relative;
            max-width: calc(100vw - 40px);
            max-height: calc(100vh - 40px);
            width: 100%; 
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
        }
        .vetrom-lightbox-image {
            max-width: 100%;
            max-height: 100%;
            width: auto;
            height: auto;
            display: block;
            object-fit: contain; 
            user-select: none;
            -webkit-user-drag: none;
            -khtml-user-drag: none;
            -moz-user-drag: none;
            -o-user-drag: none;
            user-drag: none;
            -webkit-user-select: none; 
            -moz-user-select: none; 
            -ms-user-select: none; 
            user-select: none;
        }
        
        .vetrom-lightbox-unsupported {
            color: var(--vetrom-lightbox-icon-color);
            font-size: 1.5em;
            padding: 20px;
            background: rgba(0, 0, 0, 0.7);
            border-radius: 8px;
            text-align: center;
            max-width: 80%;
        }
        
        .vetrom-lightbox-close {
            position: absolute;
            top: 20px;
            right: 30px;
            color: var(--vetrom-lightbox-icon-color); 
            font-size: 40px;
            font-weight: bold;
            transition: 0.2s;
            cursor: pointer;
            z-index: 10000;
            user-select: none;
            background: var(--vetrom-accent); 
            border-radius: 50%;
            width: 50px;
            height: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
            line-height: 1;
        }
        .vetrom-lightbox-close:hover,
        .vetrom-lightbox-close:focus {
            color: #ccc; 
        }
        .vetrom-lightbox-control {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            color: var(--vetrom-lightbox-icon-color);
            border: none;
            padding: 10px;
            cursor: pointer;
            z-index: 10000;
            user-select: none;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--vetrom-accent);
            transition: background 0.2s;
            display: flex; 
        }
        .vetrom-lightbox-control svg {
            width: 40px;
            height: 40px;
        }
        .vetrom-lightbox-control:hover {
            background: rgba(var(--vetrom-text-rgb), 0.7);
        }
        .vetrom-lightbox-control.prev {
            left: 20px;
        }
        .vetrom-lightbox-control.next {
            right: 20px;
        }
    `;

    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    function setGalleryTheme() {
        const root = document.documentElement;
        const bodyComputedStyle = getComputedStyle(document.body);
        
        let customBg = getComputedStyle(root).getPropertyValue('--vetrom-bg').trim();

        if (customBg !== '#ffffff') { 
             let customText = getComputedStyle(root).getPropertyValue('--vetrom-text').trim();
             if (customText) {
                const rgb = parseColor(customText);
                root.style.setProperty('--vetrom-text-rgb', rgbToRgbString(rgb));
             }
             return;
        }
        
        const bodyBgColorRaw = bodyComputedStyle.backgroundColor;
        const bodyBgColor = parseColor(bodyBgColorRaw);
        
        const bodyLuminance = getLuminance(bodyBgColor);
        const isDarkBg = bodyLuminance < 0.5;

        const contrastTextColor = isDarkBg ? '#ffffff' : '#000000';
        const contrastTextRgb = isDarkBg ? '255, 255, 255' : '0, 0, 0';
        
        const accentColor = `rgba(${contrastTextRgb}, 0.5)`;
        
        root.style.setProperty('--vetrom-bg', bodyBgColorRaw); 
        root.style.setProperty('--vetrom-text', contrastTextColor);
        root.style.setProperty('--vetrom-text-rgb', contrastTextRgb);
        root.style.setProperty('--vetrom-accent', accentColor);
    }

    setGalleryTheme();

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addListener(setGalleryTheme);

    const galleries = [];
    let currentLightboxGalleryIndex = -1;
    let currentLightboxSlideIndex = -1;
    
    const MEDIA_TYPE = { IMAGE: 'img', VIDEO: 'video' };

    function initGallery(rootDiv, galleryIndex) {
        const mediaElements = Array.from(rootDiv.querySelectorAll('img, video'));
        if (mediaElements.length === 0) return;

        const updateSlide = (slideIndex) => {
            const offset = -slideIndex * 100;
            const wrapper = galleries[galleryIndex].root.querySelector('.vetrom-gallery-image-wrapper');
            if (wrapper) {
                wrapper.style.transform = `translateX(${offset}%)`;
                
                wrapper.querySelectorAll('video').forEach((video, index) => {
                    if (index !== slideIndex) {
                        video.pause();
                    }
                });
            }
        };

        const galleryState = {
            root: rootDiv,
            items: mediaElements.map(media => ({
                src: isVideoElement(media) ? media.querySelector('source') ? media.querySelector('source').src : media.src : media.src,
                type: isVideoElement(media) ? MEDIA_TYPE.VIDEO : MEDIA_TYPE.IMAGE,
                originalElement: media.cloneNode(true)
            })),
            currentSlide: 0,
            index: galleryIndex,
            updateSlide: updateSlide 
        };
        galleries.push(galleryState);

        const container = document.createElement('div');
        container.className = 'vetrom-gallery-container';

        const wrapper = document.createElement('div');
        wrapper.className = 'vetrom-gallery-image-wrapper';
        
        mediaElements.forEach((media, i) => {
            const slide = document.createElement('div');
            slide.className = 'vetrom-gallery-slide';
            
            const mediaClone = media.cloneNode(true);
            
            if (isVideoElement(mediaClone)) {
                mediaClone.setAttribute('controls', '');
            }
            
            slide.addEventListener('click', (e) => {
                const clickedMedia = e.currentTarget.querySelector('img, video');
                
                
                if (isVideoElement(clickedMedia)) {
                    
                    return; 
                }
                
                
                openLightbox(galleryIndex, i);
            });
            
            slide.appendChild(mediaClone);
            media.remove();
            wrapper.appendChild(slide);
        });
        
        const prevButton = document.createElement('button');
        prevButton.className = 'vetrom-gallery-control prev';
        prevButton.innerHTML = SVG_PREV; 

        const nextButton = document.createElement('button');
        nextButton.className = 'vetrom-gallery-control next';
        nextButton.innerHTML = SVG_NEXT;


        const prevSlide = (e) => {
            e.stopPropagation();
            galleryState.currentSlide = (galleryState.currentSlide - 1 + galleryState.items.length) % galleryState.items.length;
            galleryState.updateSlide(galleryState.currentSlide);
        };

        const nextSlide = (e) => {
            e.stopPropagation();
            galleryState.currentSlide = (galleryState.currentSlide + 1) % galleryState.items.length;
            galleryState.updateSlide(galleryState.currentSlide);
        };

        prevButton.addEventListener('click', prevSlide);
        nextButton.addEventListener('click', nextSlide);

        container.appendChild(wrapper);
        container.appendChild(prevButton);
        container.appendChild(nextButton);

        rootDiv.parentNode.replaceChild(container, rootDiv);
        galleryState.root = container;
    }

    const lightboxOverlay = document.createElement('div');
    lightboxOverlay.className = 'vetrom-lightbox-overlay';

    const lightboxContent = document.createElement('div');
    lightboxContent.className = 'vetrom-lightbox-content';
    lightboxOverlay.appendChild(lightboxContent);

    
    const lightboxImage = document.createElement('img');
    lightboxImage.className = 'vetrom-lightbox-image';
    
    
    const unsupportedMessage = document.createElement('div');
    unsupportedMessage.className = 'vetrom-lightbox-unsupported';
    unsupportedMessage.textContent = 'Videos are not supported in the lightbox. You need to get out of the lightbox to see the videos.';


    const closeButton = document.createElement('span');
    closeButton.className = 'vetrom-lightbox-close';
    closeButton.innerHTML = '&times;';
    lightboxOverlay.appendChild(closeButton);

    const lightboxPrev = document.createElement('button');
    lightboxPrev.className = 'vetrom-lightbox-control prev';
    lightboxPrev.innerHTML = SVG_PREV;
    lightboxOverlay.appendChild(lightboxPrev);

    const lightboxNext = document.createElement('button');
    lightboxNext.className = 'vetrom-lightbox-control next';
    lightboxNext.innerHTML = SVG_NEXT;
    lightboxOverlay.appendChild(lightboxNext);

    document.body.appendChild(lightboxOverlay);

    const updateLightboxImage = () => {
        if (currentLightboxGalleryIndex === -1) return;
        const gallery = galleries[currentLightboxGalleryIndex];
        const currentItem = gallery.items[currentLightboxSlideIndex];

        
        lightboxContent.innerHTML = ''; 

        if (currentItem.type === MEDIA_TYPE.IMAGE) {
            
            lightboxImage.src = currentItem.src;
            lightboxContent.appendChild(lightboxImage);
        } else if (currentItem.type === MEDIA_TYPE.VIDEO) {
            
            lightboxContent.appendChild(unsupportedMessage);
        }
        
        
        lightboxPrev.style.display = 'flex';
        lightboxNext.style.display = 'flex';
    };

    const nextLightboxSlide = () => {
        const gallery = galleries[currentLightboxGalleryIndex];
        currentLightboxSlideIndex = (currentLightboxSlideIndex + 1) % gallery.items.length;
        updateLightboxImage();
    };

    const prevLightboxSlide = () => {
        const gallery = galleries[currentLightboxGalleryIndex];
        currentLightboxSlideIndex = (currentLightboxSlideIndex - 1 + gallery.items.length) % gallery.items.length;
        updateLightboxImage();
    };

    const openLightbox = (galleryIndex, slideIndex) => {
        currentLightboxGalleryIndex = galleryIndex;
        currentLightboxSlideIndex = slideIndex;
        updateLightboxImage();
        lightboxOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
        
        if (currentLightboxGalleryIndex !== -1) {
            const gallery = galleries[currentLightboxGalleryIndex];
            gallery.currentSlide = currentLightboxSlideIndex;
            gallery.updateSlide(gallery.currentSlide); 
        }
        
        lightboxOverlay.classList.remove('active');
        currentLightboxGalleryIndex = -1;
        currentLightboxSlideIndex = -1;
        document.body.style.overflow = '';
    };

    closeButton.addEventListener('click', closeLightbox);
    
    lightboxPrev.addEventListener('click', (e) => {
        e.stopPropagation(); 
        prevLightboxSlide();
    });
    lightboxNext.addEventListener('click', (e) => {
        e.stopPropagation(); 
        nextLightboxSlide();
    });

    lightboxOverlay.addEventListener('click', (e) => {
        
        if (e.target === lightboxOverlay || e.target === closeButton) {
            closeLightbox();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (lightboxOverlay.classList.contains('active')) {
            if (e.key === 'ArrowRight') nextLightboxSlide();
            if (e.key === 'ArrowLeft') prevLightboxSlide();
            if (e.key === 'Escape') closeLightbox();
        }
    });

    document.addEventListener('contextmenu', (e) => {
        
        if (e.target.tagName === 'IMG' || e.target.tagName === 'VIDEO') {
            const isGalleryMedia = e.target.closest('.vetrom-gallery-slide');
            const isLightboxImage = e.target.classList.contains('vetrom-lightbox-image');

            if (isGalleryMedia || isLightboxImage) {
                e.preventDefault();
            }
        }
    });

    document.addEventListener('DOMContentLoaded', () => {
        const regex = /^vetrom-gallery(:(\d+))?$/; 
        
        document.querySelectorAll('div').forEach((div, index) => {
            const classList = Array.from(div.classList);
            const match = classList.find(cls => regex.test(cls));
            
            if (match) {
                initGallery(div, galleries.length); 
            }
        });
    });
})();
