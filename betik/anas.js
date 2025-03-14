// Newsletter Signup Handler
const NewsletterSignup = {
    form: null,
    submitButton: null,
    modalContainer: null,

    init() {
        this.form = document.querySelector('.newsletter-form');
        if (!this.form) return;

        this.submitButton = this.form.querySelector('button[type="submit"]');
        this.createModal();
        this.initializeForm();
    },

    createModal() {
        // Create modal container if it doesn't exist
        if (!document.getElementById('newsletter-modal')) {
            const modal = document.createElement('div');
            modal.id = 'newsletter-modal';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <span class="close">&times;</span>
                    <div class="modal-body"></div>
                </div>
            `;
            document.body.appendChild(modal);
            this.modalContainer = modal;

            // Add event listener to close button
            const closeBtn = modal.querySelector('.close');
            closeBtn.onclick = () => this.hideModal();

            // Close modal when clicking outside
            window.onclick = (event) => {
                if (event.target === modal) {
                    this.hideModal();
                }
            };
        }
    },

    showModal(message, isSuccess = true) {
        const modalBody = this.modalContainer.querySelector('.modal-body');
        modalBody.innerHTML = message;
        modalBody.className = 'modal-body ' + (isSuccess ? 'success' : 'error');
        this.modalContainer.style.display = 'block';
    },

    hideModal() {
        if (this.modalContainer) {
            this.modalContainer.style.display = 'none';
        }
    },

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    initializeForm() {
        if (!this.form) return;

        this.form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const emailInput = this.form.querySelector('input[type="email"]');
            const email = emailInput.value.trim();

            if (!this.validateEmail(email)) {
                this.showModal(
                    document.documentElement.lang === 'tr' ? 
                        'Lütfen geçerli bir e-posta adresi girin.' :
                        (document.documentElement.lang === 'fr' ?
                            'Veuillez entrer une adresse e-mail valide.' :
                            'Please enter a valid email address.'
                        ),
                    false
                );
                return;
            }

            this.submitButton.disabled = true;
            
            try {
                const formData = new FormData(this.form);
                const response = await fetch('/newsletter/subscribe' + (document.documentElement.lang !== 'en' ? '/' + document.documentElement.lang : ''), {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-CSRF-TOKEN': document.querySelector('input[name="ozar_cmseoign_csrf_token"]').value
                    }
                });

                const result = await response.text();
                
                if (response.ok) {
                    this.showModal(result, true);
                    this.form.reset();
                } else {
                    this.showModal(result, false);
                }
            } catch (error) {
                console.error('Newsletter signup error:', error);
                this.showModal(
                    document.documentElement.lang === 'tr' ? 
                        'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.' :
                        (document.documentElement.lang === 'fr' ?
                            'Une erreur s\'est produite. Veuillez réessayer plus tard.' :
                            'An error occurred. Please try again later.'
                        ),
                    false
                );
            } finally {
                this.submitButton.disabled = false;
            }
        });
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => NewsletterSignup.init()); 