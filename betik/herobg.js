// YouTube video background handling
function initYouTubeBackground() {
    const heroVideo = document.querySelector('.hero-video');
    let youtubeLoadTimeout;

    // Function to remove YouTube and fall back to static background
    function fallbackToStatic() {
        if (heroVideo) {
            heroVideo.innerHTML = ''; // Remove iframe
            heroVideo.classList.remove('ready');
            heroVideo.classList.add('fallback');
        }
    }

    // Set a timeout to check if YouTube loads properly
    youtubeLoadTimeout = setTimeout(() => {
        fallbackToStatic();
    }, 5000); // 5 second timeout

    // Load YouTube IFrame API
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    let initialWidth = 0;

    // YouTube API will call this when ready
    window.onYouTubeIframeAPIReady = function() {
        const player = new YT.Player('youtubePlayer', {
            videoId: 'c_V1iD6F1kk', // Your video ID
            playerVars: {
                autoplay: 1,
                controls: 0,
                disablekb: 1,
                loop: 1,
                modestbranding: 1,
                playlist: 'c_V1iD6F1kk', // Same as videoId, needed for looping
                playsinline: 1,
                rel: 0,
                showinfo: 0,
                mute: 1
            },
            events: {
                onReady: function(event) {
                    clearTimeout(youtubeLoadTimeout); // Clear timeout as YouTube loaded successfully
                    event.target.mute();
                    event.target.playVideo();
                    heroVideo.classList.add('ready');
                    initialWidth = player.getIframe().offsetWidth;

                    window.addEventListener('resize', () => {
                        const currentViewportWidth = window.innerWidth;
                        if (currentViewportWidth > initialWidth) {
                            handleResize(player);
                        }
                    });

                    handleResize(player);
                },
                onStateChange: function(event) {
                    if (event.data === YT.PlayerState.ENDED) {
                        event.target.playVideo();
                    }
                },
                onError: function(event) {
                    // Handle YouTube player errors
                    fallbackToStatic();
                }
            }
        });
    }
}

function handleResize(player) {
    const iframe = player.getIframe();
    const videoRatio = 16/9;
    const width = window.innerWidth;
    const height = width / videoRatio;

    iframe.style.width = width + 'px';
    iframe.style.height = height + 'px';
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initYouTubeBackground();
});