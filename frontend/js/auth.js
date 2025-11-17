/**
 * GrassRoots Authentication & Session Management
 * Centralized auth system for all pages
 */

const GrassRootsAuth = {
    // Storage keys
    KEYS: {
        LOGGED_IN: 'loggedIn',
        USER_EMAIL: 'userEmail',
        FULL_NAME: 'fullName',
        USER_TYPE: 'userType',
        SESSION_START: 'sessionStart'
    },

    /**
     * Check if user is logged in
     * @returns {boolean}
     */
    isLoggedIn() {
        return localStorage.getItem(this.KEYS.LOGGED_IN) === 'true';
    },

    /**
     * Get current user type
     * @returns {string|null} 'farmer', 'retailer', or null
     */
    getUserType() {
        return localStorage.getItem(this.KEYS.USER_TYPE);
    },

    /**
     * Get current user info
     * @returns {Object} User information
     */
    getUserInfo() {
        return {
            email: localStorage.getItem(this.KEYS.USER_EMAIL),
            fullName: localStorage.getItem(this.KEYS.FULL_NAME),
            userType: localStorage.getItem(this.KEYS.USER_TYPE),
            sessionStart: localStorage.getItem(this.KEYS.SESSION_START)
        };
    },

    /**
     * Login user and create session
     * @param {Object} userData - User data {email, fullName, userType}
     */
    login(userData) {
        localStorage.setItem(this.KEYS.LOGGED_IN, 'true');
        localStorage.setItem(this.KEYS.USER_EMAIL, userData.email);
        localStorage.setItem(this.KEYS.FULL_NAME, userData.fullName);
        localStorage.setItem(this.KEYS.USER_TYPE, userData.userType);
        localStorage.setItem(this.KEYS.SESSION_START, new Date().toISOString());
    },

    /**
     * Logout user and clear session
     */
    logout() {
        Object.values(this.KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        window.location.href = 'login.html';
    },

    /**
     * Require authentication - redirect to login if not logged in
     * @param {string} requiredType - Optional: 'farmer' or 'retailer'
     */
    requireAuth(requiredType = null) {
        if (!this.isLoggedIn()) {
            alert('Please login to access this page');
            window.location.href = 'login.html';
            return false;
        }

        if (requiredType && this.getUserType() !== requiredType) {
            alert(`Access denied: This page is for ${requiredType}s only`);
            window.location.href = 'login.html';
            return false;
        }

        return true;
    },

    /**
     * Redirect to appropriate dashboard based on user type
     */
    redirectToDashboard() {
        const userType = this.getUserType();
        if (userType === 'farmer') {
            window.location.href = 'farmer-dashboard.html';
        } else if (userType === 'retailer') {
            window.location.href = 'retailer-dashboard.html';
        } else {
            window.location.href = 'dashboard.html';
        }
    },

    /**
     * Initialize auth on page load
     * Automatically sets up logout buttons
     */
    init() {
        // Setup all logout buttons
        document.querySelectorAll('[data-logout], #logout, .logout-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        });

        // Display user info if element exists
        const userInfoEl = document.getElementById('userInfo');
        if (userInfoEl && this.isLoggedIn()) {
            const user = this.getUserInfo();
            userInfoEl.textContent = `${user.fullName} (${user.userType})`;
        }
    }
};

// Auto-initialize on DOM load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => GrassRootsAuth.init());
} else {
    GrassRootsAuth.init();
}

