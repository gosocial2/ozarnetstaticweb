document.addEventListener('DOMContentLoaded', function() {
    const userProfileBtn = document.querySelector('.user-profile');
    const userMenuDropdown = document.querySelector('.user-menu-dropdown');
    const loginLink = document.querySelector('.user-menu-dropdown .dropdown-item[href*="login"]');
    const modalContainer = document.getElementById('loginModal');
    const modalCloseBtn = modalContainer ? modalContainer.querySelector('.modal-close') : null;
    
    // Toggle user menu on click
    if (userProfileBtn && userMenuDropdown) {
        userProfileBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            userMenuDropdown.classList.toggle('show');
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!userMenuDropdown.contains(e.target) && !userProfileBtn.contains(e.target)) {
                userMenuDropdown.classList.remove('show');
            }
        });
    }

    // Handle login modal
    if (loginLink && modalContainer) {
        loginLink.addEventListener('click', function(e) {
            e.preventDefault();
            modalContainer.classList.add('show');
            document.body.style.overflow = 'hidden';
            // Close the dropdown when opening modal
            userMenuDropdown.classList.remove('show');
        });

        // Close modal when clicking outside
        modalContainer.addEventListener('click', function(e) {
            if (e.target === modalContainer) {
                closeModal();
            }
        });

        // Close modal when clicking close button
        if (modalCloseBtn) {
            modalCloseBtn.addEventListener('click', function() {
                closeModal();
            });
        }
    }

    // Helper function to close modal
    function closeModal() {
        if (modalContainer) {
            modalContainer.classList.remove('show');
            document.body.style.overflow = '';
        }
    }

    // Close modal on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modalContainer && modalContainer.classList.contains('show')) {
            closeModal();
        }
    });
});
