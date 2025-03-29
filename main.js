const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const https = require('https');
const http = require('http');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 500,
    height: 400,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    frame: false,
    transparent: true,
    resizable: false,
    hasShadow: true
  });

  mainWindow.loadFile('src/index.html');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.on('minimize-app', () => {
  mainWindow.minimize();
});

ipcMain.on('close-app', () => {
  app.quit();
});

ipcMain.handle('get-webhook-url', async () => {
  try {
    if (fs.existsSync('./config.json')) {
      const data = fs.readFileSync('./config.json', 'utf8');
      const config = JSON.parse(data);
      return config.webhook_url || '';
    } else {
      const config = { webhook_url: '' };
      fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));
      return '';
    }
  } catch (error) {
    console.error('Error reading config:', error);
    return '';
  }
});

ipcMain.handle('save-webhook-url', async (_, url) => {
  try {
    let config = {};
    if (fs.existsSync('./config.json')) {
      const data = fs.readFileSync('./config.json', 'utf8');
      config = JSON.parse(data);
    }
    
    config.webhook_url = url;
    fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving config:', error);
    return false;
  }
});

ipcMain.handle('test-webhook', async (_, webhookUrl) => {
  return new Promise((resolve) => {
    const url = new URL(webhookUrl);
    
    const avatar_url = "https://media.discordapp.net/attachments/1275516745100038204/1355472971094954075/logo512.png?ex=67e90e13&is=67e7bc93&hm=04f9f79940f3df60043ee189cfa9711b83986d5634524f75a7f8cbff4b61aa83&=&format=webp&quality=lossless&width=563&height=563";
    const icon = "✅";
    
    const payload = {
      "username": "bluePhant's Webhook",
      "avatar_url": avatar_url,
      "embeds": [
        {
          "title": "Webhook Works",
          "description": `Your Webhook Works ${icon}`,
          "color": 0x063970,
          "footer": {
            "text": "Username : kOr\nGithub : github.com/avenir\nDiscord : discord.gg/hsko"
          }
        }
      ]
    };
    
    const postData = JSON.stringify(payload);
    
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: `${url.pathname}${url.search}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const requester = url.protocol === 'https:' ? https : http;
    
    const req = requester.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 204) {
          resolve({ success: true, message: "Embed sent" });
        } else {
          resolve({ success: false, message: `Error while sending embed: ${res.statusCode}` });
        }
      });
    });
    
    req.on('error', (error) => {
      resolve({ success: false, message: `Request error: ${error.message}` });
    });
    
    req.write(postData);
    req.end();
  });
});