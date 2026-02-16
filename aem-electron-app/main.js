const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const axios = require('axios');
const PouchDB = require('pouchdb');

// Initialize PouchDB
const db = new PouchDB('users');

let mainWindow;
let loginWindow;

// Create login window
function createLoginWindow() {
  loginWindow = new BrowserWindow({
    width: 400,
    height: 500,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    frame: true,
    show: false
  });

  loginWindow.loadFile('login.html');

  loginWindow.once('ready-to-show', () => {
    loginWindow.show();
  });

  loginWindow.on('closed', () => {
    loginWindow = null;
  });
}

// Create main application window
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    show: false
  });

  mainWindow.loadFile('dashboard.html');

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    if (loginWindow) {
      loginWindow.close();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App ready
app.whenReady().then(() => {
  createLoginWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createLoginWindow();
    }
  });
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle login via API
ipcMain.handle('login-api', async (event, credentials) => {
  try {
    const response = await axios.post(
      'http://test-demo.aemenersol.com/api/account/login',
      {
        username: credentials.username,
        password: credentials.password
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    // Store user in PouchDB
    await db.put({
      _id: credentials.username,
      username: credentials.username,
      token: response.data,
      lastLogin: new Date().toISOString()
    }).catch(err => {
      if (err.status === 409) {
        // Document exists, update it
        return db.get(credentials.username).then(doc => {
          return db.put({
            ...doc,
            token: response.data,
            lastLogin: new Date().toISOString()
          });
        });
      }
      throw err;
    });

    return {
      success: true,
      token: response.data,
      message: 'Login successful'
    };
  } catch (error) {
    console.error('API Login error:', error);
    return {
      success: false,
      message: error.response?.data || 'Login failed. Invalid credentials.'
    };
  }
});

// Handle login via PouchDB (offline mode)
ipcMain.handle('login-local', async (event, credentials) => {
  try {
    const user = await db.get(credentials.username);
    
    // In a real app, you'd verify password hash
    // For now, just check if user exists
    if (user) {
      return {
        success: true,
        token: user.token,
        message: 'Login successful (offline mode)'
      };
    } else {
      return {
        success: false,
        message: 'User not found in local database'
      };
    }
  } catch (error) {
    return {
      success: false,
      message: 'User not found in local database'
    };
  }
});

// Handle opening main window
ipcMain.on('open-main-window', () => {
  createMainWindow();
});

// Handle logout
ipcMain.on('logout', () => {
  if (mainWindow) {
    mainWindow.close();
  }
  createLoginWindow();
});

// Get dashboard data
ipcMain.handle('get-dashboard-data', async (event, token) => {
  try {
    const response = await axios.get(
      'http://test-demo.aemenersol.com/api/dashboard',
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to load dashboard data'
    };
  }
});