document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    if (!loginForm) return;

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        const errorElement = document.getElementById('login-error');

        // Basic validation
        if (!username || !password) {
            errorElement.textContent = "Please enter both fields";
            return;
        }

        // Get saved credentials (fallback to default if none exist)
        const savedUsername = localStorage.getItem('username') || 'admin';
        const savedPassword = localStorage.getItem('password') || 'admin123';

        // Credential check
        if (username === savedUsername && password === savedPassword) {
            // Successful login - redirect to main app
            window.location.href = "home.html";
        } else {
            errorElement.textContent = "Invalid credentials";
            // Optional: Increment failed attempts counter
        }
    });
});