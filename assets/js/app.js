/* ============================================
   SOFIANO CAFE - Native Mobile App
   Ultra-Fast Image Loading System
============================================ */

// Image cache using Map for O(1) lookup
const imageCache = new Map();
let imagesReady = false;

document.addEventListener('DOMContentLoaded', () => {
    initStatusBadge();
    initBackgroundSlideshow();
    initHapticFeedback();
    initPWA();
});

/* Ultra-Fast Parallel Image Preloader */
function preloadAllImages(urls) {
    return new Promise((resolve) => {
        let loadedCount = 0;
        const total = urls.length;
        
        // Create all image objects at once for parallel loading
        const imagePromises = urls.map((url, index) => {
            return new Promise((imgResolve) => {
                const img = new Image();
                
                // Optimize loading
                img.decoding = 'async';
                img.loading = 'eager';
                
                // High priority for first 3 images
                if (index < 3) {
                    img.fetchPriority = 'high';
                }
                
                const onComplete = () => {
                    imageCache.set(url, img);
                    loadedCount++;
                    imgResolve({ url, success: true, index });
                };
                
                img.onload = onComplete;
                img.onerror = () => {
                    loadedCount++;
                    imgResolve({ url, success: false, index });
                };
                
                // Start loading immediately
                img.src = url;
            });
        });
        
        // Resolve when ALL images are loaded (parallel)
        Promise.all(imagePromises).then(resolve);
    });
}

/* Load first image with highest priority */
function loadFirstImage(url) {
    return new Promise((resolve) => {
        // Check if already in browser cache
        const img = new Image();
        img.decoding = 'sync'; // Sync decode for first image
        img.fetchPriority = 'high';
        img.loading = 'eager';
        
        img.onload = () => {
            imageCache.set(url, img);
            resolve(img);
        };
        
        img.onerror = () => resolve(null);
        img.src = url;
    });
}

/* Loading Screen */
function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    loadingScreen.classList.add('hidden');
}

/* Status Badge - Open/Closed */
function initStatusBadge() {
    const badge = document.getElementById('statusBadge');
    const statusText = badge.querySelector('.status-text');
    
    function checkIfOpen() {
        const hour = new Date().getHours();
        // Working hours: 8 AM - 2 AM
        const isOpen = (hour >= 8 && hour <= 23) || (hour >= 0 && hour < 2);
        
        badge.classList.toggle('open', isOpen);
        badge.classList.toggle('closed', !isOpen);
        statusText.textContent = isOpen ? 'مفتوح الآن' : 'مغلق';
    }
    
    checkIfOpen();
    setInterval(checkIfOpen, 60000);
}

/* Background Slideshow - Ultra Fast */
async function initBackgroundSlideshow() {
    const bgImage = document.querySelector('.bg-image');
    const backgrounds = [
        'assets/images/4.webp',
        'assets/images/5.webp',
        'assets/images/6.webp',
        'assets/images/7.webp',
        'assets/images/8.webp',
        'assets/images/9.webp',
        'assets/images/10.webp',
        'assets/images/11.webp',
        'assets/images/2.webp',
        'assets/images/3.webp'
    ];
    
    let currentIndex = 0;
    
    // STEP 1: Load and show first image IMMEDIATELY
    const firstImagePromise = loadFirstImage(backgrounds[0]);
    
    // STEP 2: Start loading ALL other images in parallel (don't wait)
    const allImagesPromise = preloadAllImages(backgrounds);
    
    // Show first image as soon as it's ready
    await firstImagePromise;
    bgImage.style.backgroundImage = `url('${backgrounds[0]}')`;
    hideLoadingScreen();
    
    // STEP 3: Wait for all images to be cached, then start slideshow
    await allImagesPromise;
    imagesReady = true;
    
    // Start slideshow - images are ALL cached now, instant switching!
    startSlideshow();
    
    function startSlideshow() {
        setInterval(() => {
            const nextIndex = (currentIndex + 1) % backgrounds.length;
            
            bgImage.classList.add('fade-out');
            
            setTimeout(() => {
                currentIndex = nextIndex;
                // Image is already cached - instant display!
                bgImage.style.backgroundImage = `url('${backgrounds[currentIndex]}')`;
                bgImage.classList.remove('fade-out');
            }, 1000); // Reduced from 1500ms for snappier transitions
        }, 6000);
    }
}

/* Fallback timeout */
setTimeout(() => {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen && !loadingScreen.classList.contains('hidden')) {
        loadingScreen.classList.add('hidden');
    }
}, 3000);

/* Haptic Feedback */
function initHapticFeedback() {
    document.querySelectorAll('.menu-card, .action-btn, .social-row a').forEach(el => {
        el.addEventListener('touchstart', () => {
            if (navigator.vibrate) navigator.vibrate(10);
        }, { passive: true });
    });
}

/* PWA */
function initPWA() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
}
