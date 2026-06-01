// Global Variables & State Management
let currentTab = 'diagnose';
let currentTheme = 'light';
let geminiApiKey = '';
let uploadedImageBase64 = '';
let uploadedImageMimeType = '';
let isSpeechPlaying = false;
let currentUtterance = null;

const LOCAL_STORAGE_KEY_API = 'farmq_gemini_key';
const LOCAL_STORAGE_KEY_HISTORY = 'farmq_history_v2';
const LOCAL_STORAGE_KEY_THEME = 'farmq_theme';

// Agricultural Tips List
const tips = [
  "Crop rotation with legumes replenishes nitrogen levels in the soil naturally.",
  "Drip irrigation saves up to 50% more water compared to traditional flooding.",
  "Neem oil is an effective organic pesticide for aphids, mites, and whiteflies.",
  "Soil testing every 2-3 years helps determine the exact NPK fertilizer requirements.",
  "Adding composted cow manure improves soil aeration and organic carbon content.",
  "Mulching helps retain soil moisture and prevents weed growth in warm weather."
];

// Document Elements
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  // Load Theme
  const savedTheme = localStorage.getItem(LOCAL_STORAGE_KEY_THEME) || 'light';
  setTheme(savedTheme);

  // Load API Key
  geminiApiKey = localStorage.getItem(LOCAL_STORAGE_KEY_API) || '';
  updateApiStatusUI();

  // Load Tip of the Day
  const tipText = document.getElementById('tipText');
  if (tipText) {
    tipText.textContent = tips[Math.floor(Math.random() * tips.length)];
  }

  // Load History
  loadHistory();

  // Initialize Uploader Drag & Drop Events
  initDragAndDrop();
}

// API Key Settings Modal Functions
function openSettings() {
  const modal = document.getElementById('settingsModal');
  const apiKeyInput = document.getElementById('apiKeyInput');
  
  if (modal && apiKeyInput) {
    apiKeyInput.value = geminiApiKey;
    modal.classList.add('active');
  }
}

function closeSettings() {
  const modal = document.getElementById('settingsModal');
  if (modal) {
    modal.classList.remove('active');
  }
}

function saveSettings() {
  const apiKeyInput = document.getElementById('apiKeyInput');
  if (apiKeyInput) {
    const val = apiKeyInput.value.trim();
    geminiApiKey = val;
    localStorage.setItem(LOCAL_STORAGE_KEY_API, val);
    updateApiStatusUI();
    closeSettings();
  }
}

function updateApiStatusUI() {
  const statusBadge = document.getElementById('apiStatusBadge');
  const missingAlert = document.getElementById('apiMissingAlert');
  const badgeText = statusBadge.querySelector('.status-text');

  if (geminiApiKey) {
    statusBadge.classList.add('connected');
    badgeText.textContent = 'API Connected';
    if (missingAlert) missingAlert.style.display = 'none';
  } else {
    statusBadge.classList.remove('connected');
    badgeText.textContent = 'Set API Key';
    if (missingAlert) missingAlert.style.display = 'flex';
  }
}

// Theme Management
function setTheme(theme) {
  currentTheme = theme;
  document.body.setAttribute('data-theme', theme);
  localStorage.setItem(LOCAL_STORAGE_KEY_THEME, theme);
  
  const themeBtn = document.getElementById('themeToggleBtn');
  if (themeBtn) {
    themeBtn.innerHTML = theme === 'dark' 
      ? '<span class="material-icons-round">light_mode</span>' 
      : '<span class="material-icons-round">dark_mode</span>';
  }
}

function toggleTheme() {
  setTheme(currentTheme === 'light' ? 'dark' : 'light');
}

// Tab Switching
function switchTab(tabName) {
  // Cancel any active audio playback when switching tabs
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    isSpeechPlaying = false;
    const playBtn = document.getElementById('playAudioBtn');
    if (playBtn) playBtn.innerHTML = '<span class="material-icons-round">volume_up</span>';
  }

  currentTab = tabName;
  
  // Navigation active state
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.classList.remove('active');
  });
  
  const activeNav = Array.from(document.querySelectorAll('.nav-item')).find(btn => 
    btn.getAttribute('onclick').includes(tabName)
  );
  if (activeNav) activeNav.classList.add('active');

  // Tab View active state
  document.querySelectorAll('.tab-view').forEach(view => {
    view.classList.remove('active');
  });
  
  const targetView = document.getElementById(`tab-${tabName}`);
  if (targetView) targetView.classList.add('active');
}

// Drag & Drop Image Handlers
function initDragAndDrop() {
  const uploadZone = document.getElementById('uploadZone');
  if (!uploadZone) return;

  ['dragenter', 'dragover'].forEach(eventName => {
    uploadZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      uploadZone.style.borderColor = 'var(--primary)';
      uploadZone.style.backgroundColor = 'var(--primary-light)';
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    uploadZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      uploadZone.style.borderColor = 'var(--border-color)';
      uploadZone.style.backgroundColor = 'var(--bg-tertiary)';
    }, false);
  });

  uploadZone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length > 0) {
      processImageFile(files[0]);
    }
  }, false);
}

function triggerFileInput() {
  const fileInput = document.getElementById('imageInput');
  if (fileInput) fileInput.click();
}

function handleImageUpload(event) {
  const files = event.target.files;
  if (files.length > 0) {
    processImageFile(files[0]);
  }
}

function processImageFile(file) {
  if (!file.type.startsWith('image/')) {
    alert('Please upload an image file.');
    return;
  }

  uploadedImageMimeType = file.type;
  
  const reader = new FileReader();
  reader.readAsDataURL(file);
  
  reader.onload = () => {
    uploadedImageBase64 = reader.result.split(',')[1];
    
    // Update Preview UI
    const prompt = document.getElementById('uploadPrompt');
    const container = document.getElementById('previewContainer');
    const preview = document.getElementById('imagePreview');
    
    if (prompt && container && preview) {
      prompt.style.display = 'none';
      preview.src = reader.result;
      container.style.display = 'flex';
    }
  };
}

function removeUploadedImage(event) {
  if (event) event.stopPropagation();
  
  uploadedImageBase64 = '';
  uploadedImageMimeType = '';
  
  const prompt = document.getElementById('uploadPrompt');
  const container = document.getElementById('previewContainer');
  const preview = document.getElementById('imagePreview');
  const fileInput = document.getElementById('imageInput');
  
  if (prompt && container && preview) {
    prompt.style.display = 'flex';
    preview.src = '';
    container.style.display = 'none';
  }
  if (fileInput) fileInput.value = '';
}

// Call Google Gemini API (REST Endpoint)
async function callGeminiAPI(prompt, imageBase64 = '', mimeType = '') {
  if (!geminiApiKey) {
    openSettings();
    throw new Error('API key missing');
  }

  // Use Gemini 2.5 Flash as it is fast, multimodal, and ideal for reasoning/advisory
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;
  
  const payload = {
    contents: [
      {
        parts: [
          { text: prompt }
        ]
      }
    ]
  };

  if (imageBase64 && mimeType) {
    payload.contents[0].parts.push({
      inlineData: {
        mimeType: mimeType,
        data: imageBase64
      }
    });
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to call Gemini API');
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('No content candidate returned from Gemini API');
  }
  return text;
}

// 1. RUN LEAF DISEASE DIAGNOSIS
async function runDiagnosis() {
  const cropType = document.getElementById('cropType').value;
  const symptomsDesc = document.getElementById('symptomsDesc').value.trim();
  const resultPlaceholder = document.getElementById('diagnosisPlaceholder');
  const resultLoading = document.getElementById('diagnosisLoading');
  const reportContent = document.getElementById('reportContent');

  if (!cropType) {
    alert('Please select a crop type.');
    return;
  }

  // Toggle Loading States
  if (resultPlaceholder) resultPlaceholder.style.display = 'none';
  if (reportContent) reportContent.style.display = 'none';
  if (resultLoading) resultLoading.style.display = 'flex';

  // Construct Custom AI Prompts
  let prompt = `You are a professional agricultural scientist and plant pathologist.
Analyze the following information and output a comprehensive Diagnostic Report.

Crop Type: ${cropType}
${symptomsDesc ? `User-described symptoms: ${symptomsDesc}` : ''}
${uploadedImageBase64 ? 'Please analyze the attached image of the infected leaf/crop.' : ''}

Format your report using the following structure:
### 🌿 Diagnosis
State the identified plant disease or issues clearly. If healthy, state it. Briefly describe the cause.

### 🔍 Key Symptoms Detected
List 2-4 primary visual cues of this disease.

### 🧪 Treatment Plan (Actionable Recommendations)
- **Organic / Non-chemical Treatments**: List natural sprays, biological agents, or physical actions.
- **Chemical Control**: List specific safe chemical alternatives (active ingredients like Copper Oxychloride, Mancozeb, etc.) if organic treatment is insufficient.

### 🛡️ Preventive Recommendations
Provide 3-4 quick tips to avoid future infections (e.g., watering practices, hygiene, planting resistant varieties).

Be highly professional, encouraging, and clear. Avoid excessive jargon. Make it highly structured.`;

  try {
    const responseText = await callGeminiAPI(prompt, uploadedImageBase64, uploadedImageMimeType);
    
    // Inject and format report
    document.getElementById('reportTitle').textContent = `AI Diagnostic: ${cropType}`;
    document.getElementById('reportMeta').textContent = `Crop: ${cropType} | Date: ${new Date().toLocaleDateString()}`;
    
    const formattedHtml = formatMarkdown(responseText);
    document.getElementById('reportMarkdown').innerHTML = formattedHtml;

    // Reset Voice State
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      isSpeechPlaying = false;
      const playBtn = document.getElementById('playAudioBtn');
      if (playBtn) playBtn.innerHTML = '<span class="material-icons-round">volume_up</span>';
    }

    // Save to History
    saveHistoryItem({
      type: 'diagnosis',
      crop: cropType,
      title: `AI Diagnostic: ${cropType}`,
      query: symptomsDesc || 'Image Analysis',
      result: responseText,
      image: uploadedImageBase64,
      mimeType: uploadedImageMimeType,
      date: new Date().toLocaleDateString()
    });

    if (resultLoading) resultLoading.style.display = 'none';
    if (reportContent) reportContent.style.display = 'flex';
  } catch (error) {
    alert(`Diagnosis failed: ${error.message}`);
    if (resultLoading) resultLoading.style.display = 'none';
    if (resultPlaceholder) resultPlaceholder.style.display = 'flex';
  }
}

// 2. RUN WEATHER-AWARE ADVISORY
async function runAdvisory() {
  const crop = document.getElementById('advisorCrop').value;
  const location = document.getElementById('advisorLocation').value.trim();
  const placeholder = document.getElementById('advisorPlaceholder');
  const loading = document.getElementById('advisorLoading');
  const content = document.getElementById('advisorContent');

  if (!crop || !location) {
    alert('Please enter both crop type and location.');
    return;
  }

  if (placeholder) placeholder.style.display = 'none';
  if (content) content.style.display = 'none';
  if (loading) loading.style.display = 'flex';

  // Construct Weather Simulator + Agricultural Prompt
  const prompt = `You are a professional weather-aware agricultural advisor.
Provide a current agricultural advisory for growing ${crop} in ${location}.

First, simulate a highly realistic current weather report for ${location} today. Include:
1. Temp: A realistic temperature in °C.
2. Conditions: Sunny, Rainy, Cloudy, humid, etc.
3. Humidity percentage.
4. Wind speed in km/h.
5. Soil Type (common for this area).

Then, output the following structured sections:
### 🌤️ Weather Forecast Summary
Summarize how the weather affects the crop growth today.

### 💧 Smart Irrigation Schedule
How much and when to irrigate based on the weather forecast.

### 🌾 Fertilizer & Soil Application
Recommended tasks for feeding the soil or fertilizer applications based on these conditions.

### 🧑‍🌾 Farm Operations Checklist
- Task 1: Specific action
- Task 2: Specific action
- Task 3: Specific action

Write the output in structured markdown. Please make the simulated weather data block clearly visible at the top of your text using format:
[WEATHER_DATA: Temp=X°C | Desc=Y | Hum=Z% | Wind=W km/h | Icon=IconName]
Where IconName is one of: wb_sunny, cloud, water_drop, air, rain.`;

  try {
    const responseText = await callGeminiAPI(prompt);
    
    // Parse weather code from response
    let simulatedTemp = '30°C';
    let simulatedDesc = 'Partly Cloudy';
    let simulatedHum = '60%';
    let simulatedWind = '12 km/h';
    let simulatedIcon = 'wb_sunny';
    let cleanedText = responseText;

    const weatherMatch = responseText.match(/\[WEATHER_DATA:\s*Temp=(.*?)\s*\|\s*Desc=(.*?)\s*\|\s*Hum=(.*?)\s*\|\s*Wind=(.*?)\s*\|\s*Icon=(.*?)\]/);
    if (weatherMatch) {
      simulatedTemp = weatherMatch[1];
      simulatedDesc = weatherMatch[2];
      simulatedHum = weatherMatch[3];
      simulatedWind = weatherMatch[4];
      simulatedIcon = weatherMatch[5];
      // Strip weather code from display text
      cleanedText = responseText.replace(/\[WEATHER_DATA:.*?\]/, '');
    }

    // Set weather UI
    document.getElementById('weatherTemp').textContent = simulatedTemp;
    document.getElementById('weatherDesc').textContent = simulatedDesc;
    document.getElementById('weatherHumidity').textContent = simulatedHum;
    document.getElementById('weatherWind').textContent = simulatedWind;
    
    const weatherIconEl = document.getElementById('weatherIcon');
    if (weatherIconEl) {
      let icon = 'wb_sunny';
      const lowercaseIcon = simulatedIcon.toLowerCase();
      if (lowercaseIcon.includes('sunny') || lowercaseIcon.includes('sun')) icon = 'wb_sunny';
      else if (lowercaseIcon.includes('cloud')) icon = 'cloud';
      else if (lowercaseIcon.includes('rain') || lowercaseIcon.includes('water')) icon = 'rain';
      else if (lowercaseIcon.includes('wind') || lowercaseIcon.includes('air')) icon = 'air';
      weatherIconEl.textContent = icon;
    }

    // Format Markdown to HTML
    document.getElementById('advisorMarkdown').innerHTML = formatMarkdown(cleanedText);

    // Save to history
    saveHistoryItem({
      type: 'advisor',
      crop: crop,
      title: `Advisory: ${crop} - ${location}`,
      query: `Weather Advisory in ${location}`,
      result: responseText,
      date: new Date().toLocaleDateString()
    });

    if (loading) loading.style.display = 'none';
    if (content) content.style.display = 'flex';
  } catch (error) {
    alert(`Failed to retrieve advisory: ${error.message}`);
    if (loading) loading.style.display = 'none';
    if (placeholder) placeholder.style.display = 'flex';
  }
}

// 3. ASK EXPERT CHAT SYSTEM
function handleChatKey(event) {
  if (event.key === 'Enter') {
    sendChatMessage();
  }
}

async function sendChatMessage() {
  const chatInput = document.getElementById('chatInput');
  const chatWindow = document.getElementById('chatWindow');

  if (!chatInput) return;
  const userText = chatInput.value.trim();
  if (!userText) return;

  chatInput.value = '';

  // Append User Bubble
  appendChatBubble(userText, 'user');

  // Append Bot Loader Bubble
  const botLoaderId = appendChatBubbleLoader();

  const prompt = `You are a professional agricultural scientist and field assistant. Answer the user's farming-related question factually, helpfully, and professionally.
Keep your response concise, clear, and action-oriented. Provide 2-3 bullet points where appropriate.

User question: ${userText}`;

  try {
    const replyText = await callGeminiAPI(prompt);
    
    // Remove loader and append reply
    const loaderEl = document.getElementById(botLoaderId);
    if (loaderEl) loaderEl.remove();

    appendChatBubble(replyText, 'bot');
  } catch (error) {
    const loaderEl = document.getElementById(botLoaderId);
    if (loaderEl) loaderEl.remove();
    appendChatBubble(`Error: ${error.message}`, 'bot');
  }
}

function appendChatBubble(text, sender) {
  const chatWindow = document.getElementById('chatWindow');
  if (!chatWindow) return;

  const msgDiv = document.createElement('div');
  msgDiv.className = `chat-message ${sender}`;

  const iconName = sender === 'user' ? 'person' : 'spa';
  
  // Format basic markdown elements
  const formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                            .replace(/\n/g, '<br>');

  msgDiv.innerHTML = `
    <div class="chat-avatar">
      <span class="material-icons-round">${iconName}</span>
    </div>
    <div class="chat-bubble">
      <p>${formattedText}</p>
    </div>
  `;

  chatWindow.appendChild(msgDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function appendChatBubbleLoader() {
  const chatWindow = document.getElementById('chatWindow');
  if (!chatWindow) return '';

  const loaderId = 'chat-bot-loader-' + Date.now();
  const msgDiv = document.createElement('div');
  msgDiv.className = 'chat-message bot';
  msgDiv.id = loaderId;

  msgDiv.innerHTML = `
    <div class="chat-avatar">
      <span class="material-icons-round">spa</span>
    </div>
    <div class="chat-bubble">
      <div class="spinner" style="width: 20px; height: 20px; border-width: 2px;"></div>
    </div>
  `;

  chatWindow.appendChild(msgDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight;
  return loaderId;
}

// Local Analysis History Sync
function saveHistoryItem(item) {
  const rawHistory = localStorage.getItem(LOCAL_STORAGE_KEY_HISTORY);
  let historyArray = rawHistory ? JSON.parse(rawHistory) : [];
  
  // Dedup and push to start
  historyArray = historyArray.filter(h => h.title !== item.title);
  historyArray.unshift(item);
  
  // Limit to 10 items
  localStorage.setItem(LOCAL_STORAGE_KEY_HISTORY, JSON.stringify(historyArray.slice(0, 10)));
  loadHistory();
}

function loadHistory() {
  const listEl = document.getElementById('historyList');
  const clearBtn = document.getElementById('clearHistoryBtn');
  if (!listEl) return;

  const rawHistory = localStorage.getItem(LOCAL_STORAGE_KEY_HISTORY);
  const historyArray = rawHistory ? JSON.parse(rawHistory) : [];

  if (historyArray.length === 0) {
    listEl.innerHTML = `
      <div class="empty-state">
        <p>No recent analyses found</p>
      </div>
    `;
    if (clearBtn) clearBtn.style.display = 'none';
    return;
  }

  listEl.innerHTML = '';
  if (clearBtn) clearBtn.style.display = 'block';

  historyArray.forEach((item, index) => {
    const div = document.createElement('div');
    div.className = 'history-item';
    div.onclick = () => restoreHistoryItem(item);
    
    div.innerHTML = `
      <div class="history-item-info">
        <span class="history-item-crop">${item.crop}</span>
        <span class="history-item-query">${item.query}</span>
        <span class="history-item-date">${item.date}</span>
      </div>
      <span class="material-icons-round" style="font-size: 14px; color: var(--text-muted);">arrow_forward</span>
    `;
    listEl.appendChild(div);
  });
}

function clearHistory() {
  if (confirm('Are you sure you want to clear your local history?')) {
    localStorage.removeItem(LOCAL_STORAGE_KEY_HISTORY);
    loadHistory();
  }
}

function restoreHistoryItem(item) {
  if (item.type === 'diagnosis') {
    switchTab('diagnose');
    
    // Set field values
    document.getElementById('cropType').value = item.crop;
    document.getElementById('symptomsDesc').value = item.query !== 'Image Analysis' ? item.query : '';
    
    // Image restore
    if (item.image && item.mimeType) {
      uploadedImageBase64 = item.image;
      uploadedImageMimeType = item.mimeType;
      
      const prompt = document.getElementById('uploadPrompt');
      const container = document.getElementById('previewContainer');
      const preview = document.getElementById('imagePreview');
      
      if (prompt && container && preview) {
        prompt.style.display = 'none';
        preview.src = `data:${item.mimeType};base64,${item.image}`;
        container.style.display = 'flex';
      }
    } else {
      removeUploadedImage();
    }

    // Set results
    document.getElementById('diagnosisPlaceholder').style.display = 'none';
    document.getElementById('reportTitle').textContent = item.title;
    document.getElementById('reportMeta').textContent = `Crop: ${item.crop} | Date: ${item.date}`;
    document.getElementById('reportMarkdown').innerHTML = formatMarkdown(item.result);
    document.getElementById('reportContent').style.display = 'flex';
  } else if (item.type === 'advisor') {
    switchTab('advisor');
    
    document.getElementById('advisorCrop').value = item.crop;
    
    // Extrapolate location
    const locMatch = item.title.match(/Advisory: (.*?) - (.*)/);
    if (locMatch) {
      document.getElementById('advisorLocation').value = locMatch[2];
    }

    // Extract weather simulation from result
    let cleanedText = item.result;
    let simulatedTemp = '30°C';
    let simulatedDesc = 'Partly Cloudy';
    let simulatedHum = '60%';
    let simulatedWind = '12 km/h';
    let simulatedIcon = 'wb_sunny';

    const weatherMatch = item.result.match(/\[WEATHER_DATA:\s*Temp=(.*?)\s*\|\s*Desc=(.*?)\s*\|\s*Hum=(.*?)\s*\|\s*Wind=(.*?)\s*\|\s*Icon=(.*?)\]/);
    if (weatherMatch) {
      simulatedTemp = weatherMatch[1];
      simulatedDesc = weatherMatch[2];
      simulatedHum = weatherMatch[3];
      simulatedWind = weatherMatch[4];
      simulatedIcon = weatherMatch[5];
      cleanedText = item.result.replace(/\[WEATHER_DATA:.*?\]/, '');
    }

    // Restore advisory layout
    document.getElementById('weatherTemp').textContent = simulatedTemp;
    document.getElementById('weatherDesc').textContent = simulatedDesc;
    document.getElementById('weatherHumidity').textContent = simulatedHum;
    document.getElementById('weatherWind').textContent = simulatedWind;
    
    const weatherIconEl = document.getElementById('weatherIcon');
    if (weatherIconEl) {
      let icon = 'wb_sunny';
      const lowercaseIcon = simulatedIcon.toLowerCase();
      if (lowercaseIcon.includes('sunny') || lowercaseIcon.includes('sun')) icon = 'wb_sunny';
      else if (lowercaseIcon.includes('cloud')) icon = 'cloud';
      else if (lowercaseIcon.includes('rain') || lowercaseIcon.includes('water')) icon = 'rain';
      else if (lowercaseIcon.includes('wind') || lowercaseIcon.includes('air')) icon = 'air';
      weatherIconEl.textContent = icon;
    }

    document.getElementById('advisorPlaceholder').style.display = 'none';
    document.getElementById('advisorMarkdown').innerHTML = formatMarkdown(cleanedText);
    document.getElementById('advisorContent').style.display = 'flex';
  }
}

// Multilingual Text-to-Speech (SpeechSynthesis)
function toggleAudioAdvice() {
  if (!('speechSynthesis' in window)) {
    alert('Text-to-speech is not supported in this browser.');
    return;
  }

  const playBtn = document.getElementById('playAudioBtn');
  
  if (isSpeechPlaying) {
    window.speechSynthesis.cancel();
    isSpeechPlaying = false;
    if (playBtn) playBtn.innerHTML = '<span class="material-icons-round">volume_up</span>';
  } else {
    // Collect report text
    const textToSpeak = getSpeechTextContent();
    if (!textToSpeak) return;

    window.speechSynthesis.cancel(); // ensure clean state

    const selectedLang = document.getElementById('audioLang').value || 'en-US';
    currentUtterance = new SpeechSynthesisUtterance(textToSpeak);
    currentUtterance.lang = selectedLang;

    // Set matching voice if available
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.lang.startsWith(selectedLang.split('-')[0]));
    if (voice) currentUtterance.voice = voice;

    currentUtterance.onend = () => {
      isSpeechPlaying = false;
      if (playBtn) playBtn.innerHTML = '<span class="material-icons-round">volume_up</span>';
    };

    currentUtterance.onerror = () => {
      isSpeechPlaying = false;
      if (playBtn) playBtn.innerHTML = '<span class="material-icons-round">volume_up</span>';
    };

    isSpeechPlaying = true;
    if (playBtn) playBtn.innerHTML = '<span class="material-icons-round">volume_off</span>';
    window.speechSynthesis.speak(currentUtterance);
  }
}

function changeAudioLanguage() {
  if (isSpeechPlaying) {
    // Restart in new language
    isSpeechPlaying = false;
    toggleAudioAdvice();
  }
}

function getSpeechTextContent() {
  const reportMarkdown = document.getElementById('reportMarkdown');
  if (!reportMarkdown) return '';
  
  // Get text representation, clean up HTML tags and brackets
  let text = reportMarkdown.innerText || reportMarkdown.textContent;
  
  // Clean punctuation/emojis/formatters for smoother speech
  text = text.replace(/[🌿🔍🧪🛡️]/g, '')
             .replace(/Organic \/ Non-chemical Treatments/g, 'Organic Treatments');
  return text;
}

// Markdown-like HTML formatter
function formatMarkdown(text) {
  const lines = text.split('\n');
  let inList = false;
  let html = '';

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    
    if (!line) {
      if (inList) {
        html += '</ul>';
        inList = false;
      }
      continue;
    }

    // Remove simulated weather tag from formatting if not stripped
    if (line.startsWith('[WEATHER_DATA:')) {
      continue;
    }

    // Headers
    if (line.startsWith('###') || line.startsWith('##') || line.startsWith('#')) {
      if (inList) {
        html += '</ul>';
        inList = false;
      }
      const titleText = line.replace(/^#+\s*/, '');
      html += `<h3>${titleText}</h3>`;
    } 
    // Bullets
    else if (line.startsWith('-') || line.startsWith('*')) {
      if (!inList) {
        html += '<ul>';
        inList = true;
      }
      let contentText = line.replace(/^[-*]\s*/, '');
      contentText = contentText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      html += `<li>${contentText}</li>`;
    } 
    // Paragraph lines
    else {
      if (inList) {
        html += '</ul>';
        inList = false;
      }
      const formattedText = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      html += `<p>${formattedText}</p>`;
    }
  }

  if (inList) {
    html += '</ul>';
  }

  return html;
}

// Fetch voice options once available
if ('speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    // Populate voice lists or triggers if needed
  };
}
