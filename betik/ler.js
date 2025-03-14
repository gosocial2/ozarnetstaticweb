// Theme management
const themeManager = {
    init() {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);

        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', this.toggleTheme);
        }
    },

    toggleTheme() {
        const html = document.documentElement;
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    }
};

// Language management
const languageManager = {
    init() {
        // Remove the predefined languages object since we're getting data from the DOM
        const languageToggle = document.querySelector('.language-toggle');
        if (!languageToggle) return;

        // Get current language from the toggle button
        const currentFlag = languageToggle.querySelector('#currentFlag');
        const currentLang = languageToggle.querySelector('#currentLang');
        
        // Handle language option clicks
        document.querySelectorAll('.language-option').forEach(option => {
            option.addEventListener('click', (e) => {
                // Don't prevent default - allow normal link behavior
                if (option.classList.contains('active')) {
                    e.preventDefault(); // Prevent clicks on current language
                }
            });
        });

        // Optional: Store last selected language
        const savedLang = localStorage.getItem('language');
        if (savedLang) {
            const matchingOption = document.querySelector(`.language-option[data-lang="${savedLang}"]`);
            if (matchingOption && !matchingOption.classList.contains('active')) {
                matchingOption.click();
            }
        }
    },

    // Remove setLanguage method as we're using normal link navigation
};

// Navigation management
const navigationManager = {
    init() {
        this.setupMobileMenu();
        this.setupResponsiveControls();
        this.setupClickOutside();
    },

    setupMobileMenu() {
        const nav = document.querySelector('nav');
        const container = document.querySelector('.nav-container') || document.querySelector('.header-content');
        const headerControls = document.querySelector('.header-controls');
        const colorSchemeSwitcher = document.querySelector('button.theme-toggle');

        // Only create hamburger if it doesn't exist
        let hamburger = document.querySelector('.hamburger');
        if (!hamburger) {
            hamburger = document.createElement('button');
            hamburger.className = 'hamburger';
            hamburger.setAttribute('aria-label', 'Toggle menu');
            hamburger.innerHTML = `
                <span></span>
                <span></span>
                <span></span>
            `;

            // Insert hamburger before header controls
            // container.insertBefore(hamburger, headerControls);
            headerControls.insertBefore(hamburger, colorSchemeSwitcher);
        }

        // Toggle menu
        hamburger.addEventListener('click', (e) => {
            e.stopPropagation();
            hamburger.classList.toggle('active');
            nav.classList.toggle('active');
        });
    },

    setupClickOutside() {
        document.addEventListener('click', (e) => {
            const nav = document.querySelector('nav');
            const hamburger = document.querySelector('.hamburger');

            if (nav?.classList.contains('active') &&
                !nav.contains(e.target) &&
                !hamburger?.contains(e.target)) {
                nav.classList.remove('active');
                hamburger?.classList.remove('active');
            }
        });
    },

    setupResponsiveControls() {
        const mediaQuery = window.matchMedia('(min-width: 910px)');

        const handleViewportChange = (e) => {
            const nav = document.querySelector('nav');
            const hamburger = document.querySelector('.hamburger');

            if (e.matches) {
                nav?.classList.remove('active');
                hamburger?.classList.remove('active');
            }
        };

        mediaQuery.addListener(handleViewportChange);
        handleViewportChange(mediaQuery);
    }
};

function webpSupported()
{
    let elem = document.createElement('canvas');

    if (!!(elem.getContext && elem.getContext('2d')))
    {
        // was able or not to get WebP representation
        return elem.toDataURL('image/webp').indexOf('data:image/webp') == 0;
    }
    else
    {
        // very old browser like IE 8, canvas not supported
        return false;
    }
}

function checkWebp(feature) {
    var kTestImages = {
        lossy: "UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA",
        lossless: "UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==",
        alpha: "UklGRkoAAABXRUJQVlA4WAoAAAAQAAAAAAAAAAAAQUxQSAwAAAARBxAR/Q9ERP8DAABWUDggGAAAABQBAJ0BKgEAAQAAAP4AAA3AAP7mtQAAAA==",
        animation: "UklGRlIAAABXRUJQVlA4WAoAAAASAAAAAAAAAAAAQU5JTQYAAAD/////AABBTk1GJgAAAAAAAAAAAAAAAAAAAGQAAABWUDhMDQAAAC8AAAAQBxAREYiI/gcA"
    };
    const img = new Image();
    return new Promise(function(resolve, reject) {
        img.onload = function() {
            resolve((img.width > 0) && (img.height > 0));
        };
        img.onerror = function() {
            reject(feature + ' not supported');
        };
        img.src = "data:image/webp;base64," + kTestImages[feature];
    });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    themeManager.init();
    languageManager.init();
    navigationManager.init();

    const element = document.getElementById('userWebSite');
    if (element) {
        element.remove();
    }
});

// Handle browser back button
window.addEventListener('popstate', () => {
    navigationManager.init();
});

// Handle responsive behavior
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        const nav = document.querySelector('nav');
        const hamburger = document.querySelector('.hamburger');
        if (window.innerWidth > 910 && nav && hamburger) {
            nav.classList.remove('active');
            hamburger.classList.remove('active');
        }
    }, 250);
});





