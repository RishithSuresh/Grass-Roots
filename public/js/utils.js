/**
 * GrassRoots Utility Functions
 * Reusable helper functions for all pages
 */

const GrassRootsUtils = {
    /**
     * Safely parse JSON from localStorage
     * @param {string} key - localStorage key
     * @param {*} defaultValue - Default value if parsing fails
     * @returns {*} Parsed value or default
     */
    loadFromStorage(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error(`Error loading ${key} from storage:`, error);
            return defaultValue;
        }
    },

    /**
     * Safely save JSON to localStorage
     * @param {string} key - localStorage key
     * @param {*} value - Value to save
     */
    saveToStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`Error saving ${key} to storage:`, error);
            return false;
        }
    },

    /**
     * Format date to readable string
     * @param {string|Date} date - Date to format
     * @returns {string} Formatted date
     */
    formatDate(date) {
        if (!date) return '—';
        const d = new Date(date);
        return d.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },

    /**
     * Format currency (Indian Rupees)
     * @param {number} amount - Amount to format
     * @returns {string} Formatted currency
     */
    formatCurrency(amount) {
        if (amount === null || amount === undefined) return '₹0.00';
        return `₹${Number(amount).toFixed(2)}`;
    },

    /**
     * Sanitize HTML to prevent XSS
     * @param {string} str - String to sanitize
     * @returns {string} Sanitized string
     */
    sanitizeHTML(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    /**
     * Validate email format
     * @param {string} email - Email to validate
     * @returns {boolean} True if valid
     */
    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    /**
     * Validate phone number (Indian format)
     * @param {string} phone - Phone to validate
     * @returns {boolean} True if valid
     */
    isValidPhone(phone) {
        const re = /^[6-9]\d{9}$/;
        return re.test(phone.replace(/\s+/g, ''));
    },

    /**
     * Show toast notification
     * @param {string} message - Message to show
     * @param {string} type - 'success', 'error', 'info'
     */
    showToast(message, type = 'info') {
        // Remove existing toast
        const existing = document.getElementById('grassroots-toast');
        if (existing) existing.remove();

        // Create toast
        const toast = document.createElement('div');
        toast.id = 'grassroots-toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(toast);

        // Auto remove after 3 seconds
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    /**
     * Show loading indicator
     * @param {string} message - Loading message
     */
    showLoading(message = 'Loading...') {
        const existing = document.getElementById('grassroots-loading');
        if (existing) return;

        const loading = document.createElement('div');
        loading.id = 'grassroots-loading';
        loading.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
            ">
                <div style="
                    background: white;
                    padding: 2rem;
                    border-radius: 12px;
                    text-align: center;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.3);
                ">
                    <div style="
                        border: 4px solid #f3f3f3;
                        border-top: 4px solid var(--primary-color, #6B9E7F);
                        border-radius: 50%;
                        width: 40px;
                        height: 40px;
                        animation: spin 1s linear infinite;
                        margin: 0 auto 1rem;
                    "></div>
                    <p style="margin: 0; color: #333;">${message}</p>
                </div>
            </div>
        `;
        document.body.appendChild(loading);

        // Add spin animation
        if (!document.getElementById('spin-animation')) {
            const style = document.createElement('style');
            style.id = 'spin-animation';
            style.textContent = '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';
            document.head.appendChild(style);
        }
    },

    /**
     * Hide loading indicator
     */
    hideLoading() {
        const loading = document.getElementById('grassroots-loading');
        if (loading) loading.remove();
    },

    /**
     * Generate unique ID
     * @returns {string} Unique ID
     */
    generateId() {
        return `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
};

