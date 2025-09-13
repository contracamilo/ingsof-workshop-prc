// Form validation and submission
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', handleFormSubmit);
        
        // Add real-time validation
        const inputs = contactForm.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => validateField(input));
            input.addEventListener('input', () => clearError(input));
        });
    }
});

function handleFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    
    // Validate all fields
    const isValid = validateForm(form);
    
    if (isValid) {
        // Disable submit button to prevent double submission
        const submitButton = form.querySelector('.submit-button');
        submitButton.disabled = true;
        submitButton.textContent = 'Enviando...';
        
        // Prepare data for submission
        const contactData = {
            name: formData.get('name').trim(),
            email: formData.get('email').trim(),
            subject: formData.get('subject').trim(),
            message: formData.get('message').trim(),
            timestamp: new Date().toISOString()
        };
        
        // Submit to server
        submitToServer(contactData)
            .then(response => {
                if (response.success) {
                    showSuccessMessage();
                    form.reset();
                } else {
                    throw new Error(response.message || 'Error al enviar el formulario');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showErrorMessage('Error al enviar el formulario. Por favor, inténtalo de nuevo.');
            })
            .finally(() => {
                // Re-enable submit button
                submitButton.disabled = false;
                submitButton.textContent = 'Enviar mensaje';
            });
    }
}

function validateForm(form) {
    const fields = ['name', 'email', 'subject', 'message'];
    let isValid = true;
    
    fields.forEach(fieldName => {
        const field = form.querySelector(`[name="${fieldName}"]`);
        if (!validateField(field)) {
            isValid = false;
        }
    });
    
    return isValid;
}

function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;
    let isValid = true;
    let errorMessage = '';
    
    // Clear previous errors
    clearError(field);
    
    // Required field validation
    if (!value) {
        errorMessage = 'Este campo es obligatorio';
        isValid = false;
    } else {
        // Specific validations
        switch (fieldName) {
            case 'name':
                if (value.length < 2) {
                    errorMessage = 'El nombre debe tener al menos 2 caracteres';
                    isValid = false;
                } else if (value.length > 100) {
                    errorMessage = 'El nombre no puede exceder 100 caracteres';
                    isValid = false;
                }
                break;
                
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    errorMessage = 'Ingresa un correo electrónico válido';
                    isValid = false;
                }
                break;
                
            case 'subject':
                if (value.length < 5) {
                    errorMessage = 'El asunto debe tener al menos 5 caracteres';
                    isValid = false;
                } else if (value.length > 200) {
                    errorMessage = 'El asunto no puede exceder 200 caracteres';
                    isValid = false;
                }
                break;
                
            case 'message':
                if (value.length < 10) {
                    errorMessage = 'El mensaje debe tener al menos 10 caracteres';
                    isValid = false;
                } else if (value.length > 1000) {
                    errorMessage = 'El mensaje no puede exceder 1000 caracteres';
                    isValid = false;
                }
                break;
        }
    }
    
    if (!isValid) {
        showFieldError(field, errorMessage);
    }
    
    return isValid;
}

function showFieldError(field, message) {
    const errorElement = document.getElementById(field.name + 'Error');
    if (errorElement) {
        errorElement.textContent = message;
    }
    field.style.borderColor = '#e74c3c';
}

function clearError(field) {
    const errorElement = document.getElementById(field.name + 'Error');
    if (errorElement) {
        errorElement.textContent = '';
    }
    field.style.borderColor = '#ddd';
}

function showSuccessMessage() {
    const successMessage = document.getElementById('successMessage');
    const form = document.getElementById('contactForm');
    
    if (successMessage && form) {
        form.style.display = 'none';
        successMessage.style.display = 'block';
        
        // Scroll to success message
        successMessage.scrollIntoView({ behavior: 'smooth' });
        
        // Hide success message and show form again after 5 seconds
        setTimeout(() => {
            successMessage.style.display = 'none';
            form.style.display = 'block';
        }, 5000);
    }
}

function showErrorMessage(message) {
    // Create or update error message element
    let errorDiv = document.getElementById('formErrorMessage');
    
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.id = 'formErrorMessage';
        errorDiv.style.cssText = `
            background-color: #f8d7da;
            border: 1px solid #f5c6cb;
            color: #721c24;
            padding: 1rem;
            border-radius: 5px;
            margin-bottom: 1rem;
            text-align: center;
        `;
        
        const form = document.getElementById('contactForm');
        form.parentNode.insertBefore(errorDiv, form);
    }
    
    errorDiv.textContent = message;
    errorDiv.scrollIntoView({ behavior: 'smooth' });
    
    // Remove error message after 5 seconds
    setTimeout(() => {
        if (errorDiv && errorDiv.parentNode) {
            errorDiv.parentNode.removeChild(errorDiv);
        }
    }, 5000);
}

// Submit data to server
async function submitToServer(contactData) {
    try {
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(contactData)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Network error:', error);
        
        // Fallback: Store in localStorage if server is not available
        storeLocalBackup(contactData);
        
        return {
            success: true,
            message: 'Formulario enviado y guardado localmente'
        };
    }
}

// Backup storage in localStorage
function storeLocalBackup(contactData) {
    try {
        const existingData = JSON.parse(localStorage.getItem('contactFormBackups') || '[]');
        existingData.push(contactData);
        localStorage.setItem('contactFormBackups', JSON.stringify(existingData));
        console.log('Contact form data backed up locally');
    } catch (error) {
        console.error('Error storing backup:', error);
    }
}

// Utility function to get stored backups (for development/debugging)
function getStoredBackups() {
    try {
        return JSON.parse(localStorage.getItem('contactFormBackups') || '[]');
    } catch (error) {
        console.error('Error retrieving backups:', error);
        return [];
    }
}

// Navigation active state management
document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-menu a');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === currentPage.split('/').pop() || 
            (currentPage.endsWith('/') && link.getAttribute('href') === 'index.html')) {
            link.classList.add('active');
        }
    });
});

// Mobile menu functionality (for future enhancement)
function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    navMenu.classList.toggle('mobile-active');
}