// Validation rules for comment form fields
const ValidationRules = {
    commenter_name: {
        validate: value => value.trim().length >= 2 && /^[A-zÀ-Ÿ\'\´\s-]*$/g.test(value),
        message: 'Name must be at least 2 characters long and contain only letters'
    },
    commenter_email: {
        validate: value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        message: 'Please enter a valid email address'
    },
    content: {
        validate: value => value.trim().length >= 2,
        message: 'Comment must not be empty'
    }
};

// Field validation function
function validateField(field, rules = ValidationRules) {
    const rule = rules[field.name];
    if (!rule) return true;
    
    const isValid = rule.validate(field.value);
    field.classList.toggle('invalid', !isValid);
    field.classList.toggle('valid', isValid);
    
    // Remove existing feedback
    const existingFeedback = field.parentElement.querySelector('.feedback-invalid');
    if (existingFeedback) {
        existingFeedback.remove();
    }
    
    if (!isValid) {
        const feedbackEl = document.createElement('div');
        feedbackEl.className = 'feedback-invalid';
        feedbackEl.textContent = rule.message;
        field.parentElement.appendChild(feedbackEl);
    }
    
    return isValid;
}

// Main comment form handler class
class CommentForm {
    constructor(formElement) {
        this.form = formElement;
        this.submitButton = this.form.querySelector('button[type="submit"]');
        this.fields = this.form.querySelectorAll('input:not([type="hidden"]), textarea');
        this.parentId = this.form.querySelector('input[name="parent_id"]')?.value || '';
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Validate fields on input
        this.fields.forEach(field => {
            field.addEventListener('input', () => {
                this.validateField(field);
                this.updateSubmitButton();
            });
        });
        
        // Handle form submission
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Handle cancel button for reply forms
        const cancelButton = this.form.querySelector('button.button-cancel');
        if (cancelButton) {
            cancelButton.addEventListener('click', () => {
                this.form.reset();
                this.form.closest('.comment-reply').innerHTML = '';
            });
        }
    }
    
    validateField(field) {
        return validateField(field);
    }
    
    validateAll() {
        return Array.from(this.fields).every(field => this.validateField(field));
    }
    
    updateSubmitButton() {
        const contentField = this.form.querySelector('textarea[name="content"]');
        const isContentValid = contentField && contentField.value.trim().length >= 2;
        
        if (this.submitButton) {
            this.submitButton.disabled = !isContentValid;
        }
    }
    
    showLoadingState() {
        const loadingImg = document.createElement('img');
        loadingImg.id = 'loading';
        loadingImg.src = '/res/loading.gif';
        loadingImg.style.cssText = 'display: block; float: right';
        this.submitButton.parentElement.appendChild(loadingImg);
    }
    
    hideLoadingState() {
        const loadingImg = document.getElementById('loading');
        if (loadingImg) {
            loadingImg.remove();
        }
    }
    
    showMessage(message, type) {
        // Remove any existing modals
        const existingModal = document.querySelector('.comment-modal-overlay');
        if (existingModal) {
            existingModal.remove();
        }

        // Create modal elements
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'comment-modal-overlay';

        const modal = document.createElement('div');
        modal.className = `comment-modal ${type}`;

        const modalHeader = document.createElement('div');
        modalHeader.className = 'comment-modal-header';

        const modalTitle = document.createElement('h3');
        modalTitle.className = 'comment-modal-title';
        modalTitle.textContent = type === 'success' ? 'Success!' : 
                                type === 'error' ? 'Error' : 'Warning';

        const closeButton = document.createElement('button');
        closeButton.className = 'comment-modal-close';
        closeButton.innerHTML = '&times;';
        closeButton.setAttribute('aria-label', 'Close');

        const modalContent = document.createElement('div');
        modalContent.className = 'comment-modal-content';
        modalContent.textContent = message;

        const modalFooter = document.createElement('div');
        modalFooter.className = 'comment-modal-footer';

        const okButton = document.createElement('button');
        okButton.className = 'comment-modal-button';
        okButton.textContent = 'OK';

        // Assemble modal
        modalHeader.appendChild(modalTitle);
        modalHeader.appendChild(closeButton);
        modalFooter.appendChild(okButton);

        modal.appendChild(modalHeader);
        modal.appendChild(modalContent);
        modal.appendChild(modalFooter);
        modalOverlay.appendChild(modal);

        // Add to document
        document.body.appendChild(modalOverlay);

        // Handle closing
        const closeModal = () => {
            modalOverlay.remove();
            if (type === 'success') {
                // Remove the comment form on success
                this.form.remove();
            }
        };

        closeButton.addEventListener('click', closeModal);
        okButton.addEventListener('click', closeModal);
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                closeModal();
            }
        });

        // Handle keyboard events
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && document.querySelector('.comment-modal-overlay')) {
                closeModal();
            }
        });

        // Don't auto-remove the modal
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        if (!this.validateAll()) {
            this.showMessage('Please correct the errors before submitting.', 'warning');
            return;
        }
        
        this.submitButton.disabled = true;
        this.showLoadingState();
        
        try {
            const formData = new FormData(this.form);
            formData.append('csrf_token', window.andac);
            
            const response = await fetch('/upa/blog-comments/create', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Update CSRF token first
                if (data.andac) {
                    window.andac = data.andac;
                    document.querySelectorAll('input[name="csrf_token"]').forEach(input => {
                        input.value = data.andac;
                    });
                }

                this.showMessage(data.successMessage || 'Comment posted successfully!', 'success');
                
                // Clear reply form if this is a reply
                if (this.parentId) {
                    const replyContainer = document.getElementById('commentReply' + this.parentId);
                    if (replyContainer) {
                        replyContainer.innerHTML = '';
                    }
                }
                
                // Reload comments section
                if (typeof reloadComments === 'function') {
                    reloadComments();
                }
            } else {
                throw new Error(data.message || 'Error posting comment');
            }
        } catch (error) {
            this.showMessage(error.message || 'Error posting comment. Please try again.', 'error');
        } finally {
            this.submitButton.disabled = false;
            this.hideLoadingState();
        }
    }
}

// Reply form handler
function bringReplyFormForComment(commentId) {
    const csrfToken = window.andac;
    const articleSlug = document.querySelector('input[name="thePost"]').value;
    const currentLocale = document.querySelector('input[name="comment_lang"]').value;
    
    fetch('/upa/blog-comments/alt-yorum-formu', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `ozar_cmseoign_csrf_token=${csrfToken}&yid=${commentId}&makale=${articleSlug}&dil=${currentLocale}`
    })
    .then(response => response.text())
    .then(html => {
        // Clear any existing reply forms
        document.querySelectorAll('.visible-sub-comment').forEach(form => form.innerHTML = '');
        
        // Insert new reply form
        const replyContainer = document.getElementById('commentReply' + commentId);
        if (replyContainer) {
            replyContainer.innerHTML = html;
            
            // Initialize form handler for the new reply form
            const newForm = replyContainer.querySelector('form.comment-form');
            if (newForm) {
                new CommentForm(newForm);
            }
            
            // Update CSRF token from response if needed
            const newCsrfInput = replyContainer.querySelector('input[name="csrf_token"]');
            if (newCsrfInput) {
                window.andac = newCsrfInput.value;
                document.querySelectorAll('input[name="csrf_token"]').forEach(input => {
                    input.value = newCsrfInput.value;
                });
            }
        }
    })
    .catch(error => {
        console.error('Error loading reply form:', error);
    });
}

// Initialize all comment forms when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize main comment form
    const mainForm = document.querySelector('form.comment-form:not(.visible-sub-comment)');
    if (mainForm) {
        new CommentForm(mainForm);
    }
    
    // Initialize any existing reply forms
    document.querySelectorAll('form.comment-form.visible-sub-comment').forEach(form => {
        new CommentForm(form);
    });
}); 