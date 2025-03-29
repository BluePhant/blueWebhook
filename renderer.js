document.addEventListener('DOMContentLoaded', async () => {
  const webhookUrlInput = document.getElementById('webhook-url');
  const testBtn = document.getElementById('test-btn');
  const statusElement = document.getElementById('status');
  const saveStatusElement = document.getElementById('save-status');
  const minimizeBtn = document.getElementById('minimize-btn');
  const closeBtn = document.getElementById('close-btn');
  
  let typingTimer;
  const doneTypingInterval = 1000;
  
  try {
    const url = await window.api.getWebhookUrl();
    webhookUrlInput.value = url;
  } catch (error) {
    showStatus('Failed to load saved webhook', true);
  }
  
  webhookUrlInput.addEventListener('input', () => {
    clearTimeout(typingTimer);
    saveStatusElement.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
    saveStatusElement.classList.add('saving');
    
    typingTimer = setTimeout(saveWebhookUrl, doneTypingInterval);
  });
  
  async function saveWebhookUrl() {
    const url = webhookUrlInput.value.trim();
    
    try {
      await window.api.saveWebhookUrl(url);
      saveStatusElement.innerHTML = '<i class="fa-solid fa-check"></i> Saved';
      saveStatusElement.classList.remove('saving');
      saveStatusElement.classList.add('saved');
      
      setTimeout(() => {
        saveStatusElement.classList.remove('saved');
      }, 2000);
    } catch (error) {
      saveStatusElement.innerHTML = '<i class="fa-solid fa-xmark"></i> Failed to save';
      saveStatusElement.classList.remove('saving');
      saveStatusElement.classList.add('error');
    }
  }
  
  testBtn.addEventListener('click', async () => {
    const url = webhookUrlInput.value.trim();
    
    if (!isValidWebhookUrl(url)) {
      showStatus('Please enter a valid Discord webhook URL', true);
      return;
    }
    
    testBtn.disabled = true;
    testBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Sending...</span>';
    
    try {
      const result = await window.api.testWebhook(url);
      
      if (result.success) {
        showStatus('Webhook successfully sent! 🎉', false);
      } else {
        showStatus(`Failed: ${result.message}`, true);
      }
    } catch (error) {
      showStatus('Error testing webhook', true);
    } finally {
      testBtn.disabled = false;
      testBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> <span>Test Webhook</span>';
    }
  });
  
  minimizeBtn.addEventListener('click', () => {
    window.api.minimizeApp();
  });
  
  closeBtn.addEventListener('click', () => {
    window.api.closeApp();
  });
  
  function showStatus(message, isError = false) {
    statusElement.textContent = message;
    statusElement.className = 'status';
    
    if (isError) {
      statusElement.classList.add('error');
    } else {
      statusElement.classList.add('success');
    }
    
    setTimeout(() => {
      statusElement.classList.add('fade-out');
      setTimeout(() => {
        statusElement.textContent = '';
        statusElement.className = 'status';
      }, 500);
    }, 4500);
  }
  
  function isValidWebhookUrl(url) {
    return url.startsWith('https://discord.com/api/webhooks/') || 
           url.startsWith('https://discordapp.com/api/webhooks/') ||
           url.startsWith('https://canary.discord.com/api/webhooks/');
  }
});