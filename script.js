// API URL configuration
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000' 
    : 'https://theeace-login-portal.onrender.com';

// Check if user is already logged in
window.onload = function() {
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (loggedInUser) {
        const userData = JSON.parse(loggedInUser);
        const targetUrl = `https://theeace-ag.wixstudio.com/mydashboard/clients/${userData.username}/${userData.userId}/${userData.passkey}`;
        window.location.href = targetUrl;
    }

    // Setup password visibility toggle
    const showPasswordBtn = document.querySelector('.show-password');
    const passwordInput = document.getElementById('passkey');
    
    if (showPasswordBtn && passwordInput) {
        showPasswordBtn.addEventListener('click', function() {
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                this.textContent = 'Hide';
            } else {
                passwordInput.type = 'password';
                this.textContent = 'Show';
            }
        });
    }
};

async function handleLogin(event) {
    event.preventDefault();
    
    // Get form elements
    const username = document.getElementById('username').value.trim();
    const userId = document.getElementById('userId').value.trim();
    const passkey = document.getElementById('passkey').value;
    const loginBtn = document.querySelector('.sign-in-btn');
    const errorMessage = document.getElementById('error-message');
    
    // Clear previous error message
    errorMessage.textContent = '';
    
    // Show loading animation
    loginBtn.classList.add('loading');
    
    try {
        // Call backend API
        const response = await fetch(`${API_URL}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, userId, passkey })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }
        
        // Save login state
        const userData = { username, userId, passkey };
        localStorage.setItem('loggedInUser', JSON.stringify(userData));
        
        // Redirect to dashboard
        const targetUrl = `https://theeace-ag.wixstudio.com/mydashboard/clients/${username}/${userId}/${passkey}`;
        window.location.href = targetUrl;
        
    } catch (error) {
        // Handle error case
        errorMessage.textContent = error.message || 'Invalid credentials. Please try again.';
        loginBtn.classList.remove('loading');
    }
}

// Function to logout
function logout() {
    localStorage.removeItem('loggedInUser');
    window.location.href = 'index.html';
}