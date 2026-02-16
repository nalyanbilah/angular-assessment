const { ipcRenderer } = require('electron');

const loginForm = document.getElementById('loginForm');
const loginBtn = document.getElementById('loginBtn');
const offlineBtn = document.getElementById('offlineBtn');
const loading = document.getElementById('loading');
const alert = document.getElementById('alert');

// Show alert message
function showAlert(message, type) {
  alert.textContent = message;
  alert.className = `alert alert-${type}`;
  alert.style.display = 'block';
  
  setTimeout(() => {
    alert.style.display = 'none';
  }, 5000);
}

// Handle online login
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  loginBtn.disabled = true;
  offlineBtn.disabled = true;
  loading.style.display = 'block';

  try {
    const result = await ipcRenderer.invoke('login-api', {
      username,
      password
    });

    if (result.success) {
      showAlert(result.message, 'success');
      
      // Store token for later use
      localStorage.setItem('auth_token', result.token);
      localStorage.setItem('username', username);
      
      // Open main window after short delay
      setTimeout(() => {
        ipcRenderer.send('open-main-window');
      }, 1000);
    } else {
      showAlert(result.message, 'error');
      loginBtn.disabled = false;
      offlineBtn.disabled = false;
    }
  } catch (error) {
    showAlert('An error occurred during login', 'error');
    loginBtn.disabled = false;
    offlineBtn.disabled = false;
  }

  loading.style.display = 'none';
});

// Handle offline login
offlineBtn.addEventListener('click', async () => {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  if (!username || !password) {
    showAlert('Please enter email and password', 'error');
    return;
  }

  loginBtn.disabled = true;
  offlineBtn.disabled = true;
  loading.style.display = 'block';

  try {
    const result = await ipcRenderer.invoke('login-local', {
      username,
      password
    });

    if (result.success) {
      showAlert(result.message, 'success');
      
      localStorage.setItem('auth_token', result.token);
      localStorage.setItem('username', username);
      
      setTimeout(() => {
        ipcRenderer.send('open-main-window');
      }, 1000);
    } else {
      showAlert(result.message, 'error');
      loginBtn.disabled = false;
      offlineBtn.disabled = false;
    }
  } catch (error) {
    showAlert('An error occurred during offline login', 'error');
    loginBtn.disabled = false;
    offlineBtn.disabled = false;
  }

  loading.style.display = 'none';
});

// Pre-fill for testing
document.getElementById('username').value = 'user@aemenersol.com';
document.getElementById('password').value = 'Test@123';