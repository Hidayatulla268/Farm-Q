// Global Application State
let currentTab = 'dashboard';
let currentTheme = 'light';
let geminiApiKey = '';
let isSpeechPlaying = false;
let currentUtterance = null;

// Image Editor State
let originalImage = null; // HTMLImageElement
let uploadedImageMimeType = 'image/jpeg';
let activeSymptomTags = [];

// Local Caching keys
const LOCAL_STORAGE_KEY_API = 'farmq_gemini_key';
const LOCAL_STORAGE_KEY_HISTORY = 'farmq_history_v2';
const LOCAL_STORAGE_KEY_THEME = 'farmq_theme';

// Agricultural Ticker Updates
const tickerMessages = [
  "Optimal crop season for cotton in central India. Check soil pH!",
  "Warning: High moisture levels predicted in Maharashtra. Monitor for leaf rust.",
  "Epsom salts are highly effective for correcting magnesium deficiencies in tomatoes.",
  "Real-time soil analysis updated. Check Soil Analyst tab for detailed guidelines.",
  "Drip irrigation saves up to 50% more water compared to traditional flooding."
];
let currentTickerIdx = 0;

// Agricultural Tips List
const tips = [
  "Soil pH levels dictate how efficiently crops draw nutrients. If your soil pH falls below 6.0, phosphorus becomes locked, reducing wheat and tomato yields.",
  "Drip irrigation saves up to 50% more water compared to traditional flooding and prevents fungal diseases caused by wet leaf canopies.",
  "Neem oil is an effective organic pesticide for aphids, mites, and whiteflies. Spray it in the evening to prevent burning the plant foliage.",
  "Soil testing every 2-3 years helps determine the exact NPK fertilizer requirements, saving costs on excessive inputs.",
  "Adding composted cow manure improves soil structure, aeration, and organic carbon content, leading to deeper root growth.",
  "Mulching helps retain soil moisture, keeps root systems cool, and prevents weed growth in warm weather."
];

// Organic Treatment Recipes Database
const recipesDb = [
  {
    id: "recipe-neem",
    title: "Neem Oil Pest Repellent",
    category: "pest",
    categoryLabel: "Pest Repellent",
    desc: "A highly effective, broad-spectrum organic spray for controlling aphids, whiteflies, and spider mites.",
    ingredients: [
      "1-2 teaspoons pure, cold-pressed Neem Oil",
      "1/2 teaspoon mild organic liquid soap (emulsifier)",
      "1 liter of lukewarm water",
      "Spray bottle"
    ],
    instructions: [
      "Mix the lukewarm water with liquid soap in the spray bottle and shake gently.",
      "Add the neem oil slowly and shake thoroughly until fully emulsified.",
      "Spray directly onto affected leaves, including the undersides.",
      "Apply in the early morning or evening to prevent sunburn on the leaves. Repeat every 7 days."
    ]
  },
  {
    id: "recipe-milk",
    title: "Milk Fungicide for Mildew",
    category: "disease",
    categoryLabel: "Disease Cure",
    desc: "An organic foliar spray that uses milk proteins to create a natural antiseptic environment against powdery mildew.",
    ingredients: [
      "300ml fresh milk (whole milk is preferred)",
      "700ml clean water",
      "Spray bottle"
    ],
    instructions: [
      "Mix the milk and water in a 3:7 ratio inside the spray bottle.",
      "Spray a fine mist over all foliage of susceptible plants (such as pumpkins, cucumbers, or tomatoes).",
      "Apply during bright, sunny hours. The sunlight activates chemical compounds in milk to destroy fungal spores.",
      "Apply once every 10-14 days as a preventative measure."
    ]
  },
  {
    id: "recipe-compost-tea",
    title: "Compost Tea Soil Booster",
    category: "soil",
    categoryLabel: "Soil Booster",
    desc: "An organic liquid extraction rich in beneficial bacteria, fungi, and trace nutrients to feed soil biology.",
    ingredients: [
      "2 cups well-decomposed organic compost",
      "1 tablespoon unsulfured molasses (feeds bacteria)",
      "5 liters non-chlorinated water (let tap water sit for 24h)"
    ],
    instructions: [
      "Place the compost inside a porous cloth bag or stocking.",
      "Submerge the bag in a bucket containing the 5 liters of water.",
      "Stir in the molasses and aerate the mixture (use an aquarium bubbler for 24-48 hours if possible).",
      "Apply the resulting tea directly to the root zone or spray on leaves as a nutrient-dense foliar feed."
    ]
  },
  {
    id: "recipe-garlic-chili",
    title: "Garlic-Chili Insect Spray",
    category: "pest",
    categoryLabel: "Pest Repellent",
    desc: "A pungent, hot spray that acts as a strong repellent for chewing insects, caterpillars, and beetles.",
    ingredients: [
      "2 whole garlic bulbs",
      "4-5 hot green chilies (cayenne or habanero)",
      "1 liter water",
      "1 teaspoon dish soap"
    ],
    instructions: [
      "Blend the garlic bulbs and chilies with 2 cups of water into a smooth paste.",
      "Let the paste sit overnight to release essential oils.",
      "Strain the mixture through a fine sieve or cheesecloth, discarding the pulp.",
      "Add the liquid to the remaining water, stir in the dish soap, and spray onto plants weekly."
    ]
  },
  {
    id: "recipe-epsom-salt",
    title: "Epsom Salt Foliar Spray",
    category: "soil",
    categoryLabel: "Soil Booster",
    desc: "Provides quick-release magnesium and sulfur, vital for chlorophyll production in leafy crops and tomatoes.",
    ingredients: [
      "1 tablespoon Epsom salt (Magnesium Sulfate)",
      "4 liters clean water"
    ],
    instructions: [
      "Dissolve the Epsom salt completely in the water.",
      "Pour into a sprayer and apply directly to foliage, particularly when plants begin to flower.",
      "Apply once a month to prevent leaf yellowing between leaf veins (interveinal chlorosis)."
    ]
  }
];

// App Initialization
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

  // Load History
  loadHistory();

  // Initialize Animated Background Leaf Particles
  initLeafParticles();

  // Initialize Ticker rotation
  setInterval(rotateTicker, 6000);

  // Load initial Recipe list
  renderRecipes();

  // Initialize drag & drop uploader zone
  initDragAndDrop();

  // Initialize dynamic soil gauges
  updateSoilSliders();
}

// Background Leaf Particle Generator
function initLeafParticles() {
  const container = document.getElementById('leafParticles');
  if (!container) return;

  const particleCount = 15;
  for (let i = 0; i < particleCount; i++) {
    const leaf = document.createElement('div');
    leaf.className = 'leaf-particle';
    
    // Randomize characteristics
    const size = Math.floor(Math.random() * 15) + 10; // 10px to 25px
    const startX = Math.floor(Math.random() * 100); // 0% to 100% width
    const delay = Math.random() * 10; // 0s to 10s delay
    const duration = Math.random() * 8 + 8; // 8s to 16s fall speed
    
    leaf.style.width = `${size}px`;
    leaf.style.height = `${size}px`;
    leaf.style.left = `${startX}%`;
    leaf.style.top = `-30px`;
    leaf.style.animationDelay = `${delay}s`;
    leaf.style.animationDuration = `${duration}s`;
    
    container.appendChild(leaf);
  }
}

// News Ticker Rotation
function rotateTicker() {
  const tickerEl = document.getElementById('tickerText');
  if (!tickerEl) return;

  currentTickerIdx = (currentTickerIdx + 1) % tickerMessages.length;
  tickerEl.style.opacity = '0';
  
  setTimeout(() => {
    tickerEl.textContent = tickerMessages[currentTickerIdx];
    tickerEl.style.opacity = '1';
  }, 400);
}

// Agricultural tips dashboard cycler
function rotateTip() {
  const tipEl = document.getElementById('dashTipText');
  if (!tipEl) return;

  tipEl.style.opacity = '0';
  
  setTimeout(() => {
    tipEl.textContent = tips[Math.floor(Math.random() * tips.length)];
    tipEl.style.opacity = '1';
  }, 400);
}

// API Configuration Management
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
  if (modal) modal.classList.remove('active');
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
    badgeText.textContent = 'AI Connected';
    if (missingAlert) missingAlert.style.display = 'none';
  } else {
    statusBadge.classList.remove('connected');
    badgeText.textContent = 'Set API Key';
    if (missingAlert) missingAlert.style.display = 'flex';
  }
}

// Theme management
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
  // Clear TTS read alouds
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    isSpeechPlaying = false;
    const playBtn = document.getElementById('playAudioBtn');
    if (playBtn) playBtn.innerHTML = '<span class="material-icons-round">volume_up</span>';
  }

  currentTab = tabName;
  
  // Navigation active indicators
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.classList.remove('active');
  });
  
  const activeNav = Array.from(document.querySelectorAll('.nav-item')).find(btn => 
    btn.getAttribute('onclick').includes(tabName)
  );
  if (activeNav) activeNav.classList.add('active');

  // Activate views
  document.querySelectorAll('.tab-view').forEach(view => {
    view.classList.remove('active');
  });
  
  const targetView = document.getElementById(`tab-${tabName}`);
  if (targetView) targetView.classList.add('active');
}

// File Drag & Drop Events
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
    alert('Please select a valid image file.');
    return;
  }

  uploadedImageMimeType = file.type;
  
  const reader = new FileReader();
  reader.readAsDataURL(file);
  
  reader.onload = () => {
    // Load image object
    originalImage = new Image();
    originalImage.src = reader.result;
    
    originalImage.onload = () => {
      const prompt = document.getElementById('uploadPrompt');
      const container = document.getElementById('previewContainer');
      const canvasControls = document.getElementById('canvasControls');
      
      if (prompt && container && canvasControls) {
        prompt.style.display = 'none';
        container.style.display = 'flex';
        canvasControls.style.display = 'block';
        
        // Reset canvas filters
        document.getElementById('filterBrightness').value = 100;
        document.getElementById('filterContrast').value = 100;
        document.getElementById('filterSaturation').value = 100;

        // Render initially
        applyCanvasFilters();
      }
    };
  };
}

function removeUploadedImage(event) {
  if (event) event.stopPropagation();
  
  originalImage = null;
  
  const prompt = document.getElementById('uploadPrompt');
  const container = document.getElementById('previewContainer');
  const canvasControls = document.getElementById('canvasControls');
  const fileInput = document.getElementById('imageInput');
  
  if (prompt && container && canvasControls) {
    prompt.style.display = 'flex';
    container.style.display = 'none';
    canvasControls.style.display = 'none';
  }
  if (fileInput) fileInput.value = '';
}

// Canvas Filter Redrawing Engine
function applyCanvasFilters() {
  if (!originalImage) return;

  const canvas = document.getElementById('editorCanvas');
  const ctx = canvas.getContext('2d');
  
  const brightness = document.getElementById('filterBrightness').value;
  const contrast = document.getElementById('filterContrast').value;
  const saturation = document.getElementById('filterSaturation').value;

  // Compute scale boundaries
  const maxW = 320;
  const maxH = 160;
  let w = originalImage.width;
  let h = originalImage.height;

  if (w > maxW) {
    h = Math.floor(h * (maxW / w));
    w = maxW;
  }
  if (h > maxH) {
    w = Math.floor(w * (maxH / h));
    h = maxH;
  }

  canvas.width = w;
  canvas.height = h;

  // Apply filters to 2D context natively
  ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
  ctx.drawImage(originalImage, 0, 0, w, h);
}

// Symptom tags cloud handlers
function toggleSymptomTag(tagEl) {
  const symptom = tagEl.getAttribute('data-symptom');
  if (tagEl.classList.contains('active')) {
    tagEl.classList.remove('active');
    activeSymptomTags = activeSymptomTags.filter(s => s !== symptom);
  } else {
    tagEl.classList.add('active');
    activeSymptomTags.push(symptom);
  }
}

// Dynamic NPK Soil Sliders and Gauges Calculation
function updateSoilSliders() {
  const n = parseInt(document.getElementById('soilN').value);
  const p = parseInt(document.getElementById('soilP').value);
  const k = parseInt(document.getElementById('soilK').value);
  const ph = parseFloat(document.getElementById('soilPh').value);
  const moisture = parseInt(document.getElementById('soilMoisture').value);

  // Update slider badge texts
  document.getElementById('valN').textContent = n;
  document.getElementById('valP').textContent = p;
  document.getElementById('valK').textContent = k;
  document.getElementById('valPh').textContent = ph;
  document.getElementById('valMoisture').textContent = `${moisture}%`;

  // Calculate dynamic Soil Health Index score
  let score = 100;
  
  // N penalty (ideal range 50 - 90)
  if (n < 50) score -= (50 - n) * 0.8;
  else if (n > 90) score -= (n - 90) * 0.4;

  // P penalty (ideal range 25 - 55)
  if (p < 25) score -= (25 - p) * 1.0;
  else if (p > 55) score -= (p - 55) * 0.5;

  // K penalty (ideal range 100 - 150)
  if (k < 100) score -= (100 - k) * 0.5;
  else if (k > 150) score -= (k - 150) * 0.3;

  // pH penalty (ideal range 6.0 - 7.5)
  if (ph < 6.0) score -= (6.0 - ph) * 15;
  else if (ph > 7.5) score -= (ph - 7.5) * 12;

  // Moisture penalty (ideal range 40 - 70)
  if (moisture < 40) score -= (40 - moisture) * 0.6;
  else if (moisture > 70) score -= (moisture - 70) * 0.8;

  score = Math.max(10, Math.floor(score));

  // Update central circular SVG gauge indicator
  const fillCircle = document.getElementById('soilHealthCircle');
  if (fillCircle) {
    const r = 40;
    const circ = 2 * Math.PI * r; // 251.3
    const offset = circ - (score / 100) * circ;
    fillCircle.style.strokeDashoffset = offset;
    
    // Change color based on health index
    if (score < 50) fillCircle.style.stroke = 'var(--red)';
    else if (score < 75) fillCircle.style.stroke = 'var(--accent)';
    else fillCircle.style.stroke = 'var(--primary)';
  }
  document.getElementById('soilHealthText').textContent = `${score}%`;

  // Update indicator text in Sidebar widget
  const sidebarIndex = document.getElementById('sidebarSoilIndex');
  if (sidebarIndex) {
    if (score < 55) { sidebarIndex.textContent = 'Deficient'; sidebarIndex.style.color = 'var(--red)'; }
    else if (score < 80) { sidebarIndex.textContent = 'Adequate'; sidebarIndex.style.color = 'var(--accent)'; }
    else { sidebarIndex.textContent = 'Optimal'; sidebarIndex.style.color = 'var(--primary)'; }
  }

  // Update Linear Indicators
  updateLinearIndicator('N', n, 50, 90, 150);
  updateLinearIndicator('P', p, 25, 55, 100);
  updateLinearIndicator('K', k, 100, 150, 200);
}

function updateLinearIndicator(type, val, minIdeal, maxIdeal, maxRange) {
  const pct = Math.min(100, Math.floor((val / maxRange) * 100));
  const bar = document.getElementById(`gaugeBar${type}`);
  const txt = document.getElementById(`gaugeText${type}`);
  
  if (bar) {
    bar.style.width = `${pct}%`;
    if (val < minIdeal) {
      bar.style.backgroundColor = 'var(--red)';
      if (txt) { txt.textContent = 'Low'; txt.style.color = 'var(--red)'; }
    } else if (val > maxIdeal) {
      bar.style.backgroundColor = 'var(--accent)';
      if (txt) { txt.textContent = 'Excess'; txt.style.color = 'var(--accent)'; }
    } else {
      bar.style.backgroundColor = 'var(--primary)';
      if (txt) { txt.textContent = 'Optimal'; txt.style.color = 'var(--primary)'; }
    }
  }
}

// Fetch Google Gemini REST API Client
async function callGeminiAPI(prompt, imageBase64 = '', mimeType = '') {
  if (!geminiApiKey) {
    openSettings();
    throw new Error('API key missing');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;
  
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
    throw new Error(errorData.error?.message || 'Failed to communicate with Gemini API');
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('No candidate content returned');
  return text;
}

// 1. RUN PLANT PATHOLOGY DIAGNOSIS
async function runDiagnosis() {
  const cropType = document.getElementById('cropType').value;
  const symptomsDesc = document.getElementById('symptomsDesc').value.trim();
  const resultPlaceholder = document.getElementById('diagnosisPlaceholder');
  const resultLoading = document.getElementById('diagnosisLoading');
  const reportContent = document.getElementById('reportContent');

  if (!cropType) {
    alert('Please choose a crop type.');
    return;
  }

  if (resultPlaceholder) resultPlaceholder.style.display = 'none';
  if (reportContent) reportContent.style.display = 'none';
  if (resultLoading) resultLoading.style.display = 'flex';

  // Export modified image from canvas
  let finalImageBase64 = '';
  let finalMime = 'image/jpeg';
  if (originalImage) {
    const canvas = document.getElementById('editorCanvas');
    finalImageBase64 = canvas.toDataURL('image/jpeg').split(',')[1];
  }

  // Construct prompt containing symptoms list
  const symptomsJoined = activeSymptomTags.join(', ');
  const prompt = `You are a professional plant pathologist and agricultural scientist.
Provide a complete diagnostic report for this plant issue.

Crop: ${cropType}
${symptomsJoined ? `Selected Symptoms: ${symptomsJoined}` : ''}
${symptomsDesc ? `Farmer Notes: ${symptomsDesc}` : ''}
${finalImageBase64 ? 'Please diagnose based on the attached cropped and filtered leaf photo.' : ''}

Write a structured report containing:
### 🌿 Diagnostic Findings
State clearly the identified disease or issue (such as Early Blight, Iron Chlorosis, etc.). Describe the cause (fungus, pest, climate, nutrient).

### 🔍 Leaf Symptom Checklist
List 3-4 visual criteria that confirm this diagnosis.

### 🧪 Organic Treatments (Actionable Recipes)
Detailed biological and natural recipes. Give instructions on how to make them (e.g. neem wash, soap emulsification, copper carbonate).

### 🔬 Chemical Alternatives (If Needed)
Specific active ingredients (e.g., Chlorothalonil, Copper Fungicide) and dilution guidelines for severe infestation.

### 🛡️ Preventive Recommendations
3-4 field sanitization or crop rotation tips.`;

  try {
    const responseText = await callGeminiAPI(prompt, finalImageBase64, finalMime);
    
    document.getElementById('reportTitle').textContent = `AI Diagnostic: ${cropType}`;
    document.getElementById('reportMeta').textContent = `Crop: ${cropType} | Date: ${new Date().toLocaleDateString()}`;
    document.getElementById('reportMarkdown').innerHTML = formatMarkdown(responseText);

    // Reset TTS
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      isSpeechPlaying = false;
      const playBtn = document.getElementById('playAudioBtn');
      if (playBtn) playBtn.innerHTML = '<span class="material-icons-round">volume_up</span>';
    }

    // Save to history
    saveHistoryItem({
      type: 'diagnosis',
      crop: cropType,
      title: `AI Diagnostic: ${cropType}`,
      query: symptomsJoined || symptomsDesc || 'Leaf Analysis',
      result: responseText,
      image: finalImageBase64,
      mimeType: finalMime,
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

// 2. RUN SOIL LABORATORY PRESCRIPTION
async function runSoilPrescription() {
  const n = document.getElementById('soilN').value;
  const p = document.getElementById('soilP').value;
  const k = document.getElementById('soilK').value;
  const ph = document.getElementById('soilPh').value;
  const moisture = document.getElementById('soilMoisture').value;
  const crop = document.getElementById('soilCrop').value;

  const gaugesWorkspace = document.getElementById('soilGaugesWorkspace');
  const loading = document.getElementById('soilLoading');
  const content = document.getElementById('soilPrescriptionContent');

  if (gaugesWorkspace) gaugesWorkspace.style.display = 'none';
  if (content) content.style.display = 'none';
  if (loading) loading.style.display = 'flex';

  const prompt = `You are a professional soil microbiologist and fertilizing chemist.
Analyze the following soil testing parameters and output a structured fertilization prescription plan:

Crop to grow: ${crop}
Nitrogen (N): ${n} mg/kg
Phosphorus (P): ${p} mg/kg
Potassium (K): ${k} mg/kg
Soil pH: ${ph}
Soil Moisture: ${moisture}%

Provide a fertilization plan covering:
### 🧪 Soil Chemistry Analysis
Diagnose the macronutrient ratios. State if they are Deficient, Balanced, or in Excess. Assess the pH level (e.g. acidic soil binds phosphates).

### 🌾 Crop Suitability Rating
Evaluate how well ${crop} grows in these specific levels. Suggest if amendments are necessary before sowing.

### 🍃 Organic Soil Amendments
List natural treatments (composts, bone meal, wood ash, green manures) to correct these specific soil nutrient deficiencies.

### 🧪 Fertilization Program (NPK Dose)
Specific recommendations for NPK ratios (e.g. urea, DAP, muriate of potash) and application timing.`;

  try {
    const responseText = await callGeminiAPI(prompt);
    
    document.getElementById('soilPrescriptionMarkdown').innerHTML = formatMarkdown(responseText);
    document.getElementById('soilReportMeta').textContent = `Crop target: ${crop} | Date: ${new Date().toLocaleDateString()}`;

    // Save report to history
    saveHistoryItem({
      type: 'soil',
      crop: crop,
      title: `Soil Plan: ${crop}`,
      query: `N:${n} P:${p} K:${k} pH:${ph}`,
      result: responseText,
      date: new Date().toLocaleDateString(),
      parameters: { n, p, k, ph, moisture }
    });

    if (loading) loading.style.display = 'none';
    if (content) content.style.display = 'flex';
  } catch (error) {
    alert(`Prescription generation failed: ${error.message}`);
    if (loading) loading.style.display = 'none';
    if (gaugesWorkspace) gaugesWorkspace.style.display = 'flex';
  }
}

function showSoilGaugesOnly() {
  document.getElementById('soilPrescriptionContent').style.display = 'none';
  document.getElementById('soilGaugesWorkspace').style.display = 'flex';
}

// 3. RUN WEATHER-AWARE ADVISORY
async function runAdvisory() {
  const crop = document.getElementById('advisorCrop').value;
  const location = document.getElementById('advisorLocation').value.trim();
  const placeholder = document.getElementById('advisorPlaceholder');
  const loading = document.getElementById('advisorLoading');
  const content = document.getElementById('advisorContent');

  if (!crop || !location) {
    alert('Please specify crop type and location.');
    return;
  }

  if (placeholder) placeholder.style.display = 'none';
  if (content) content.style.display = 'none';
  if (loading) loading.style.display = 'flex';

  const prompt = `You are a microclimate agricultural consultant.
Synthesize the agricultural weather forecast for growing ${crop} in ${location}.

Provide simulated weather data at the very top using format:
[WEATHER_DATA: Temp=X°C | Desc=Y | Hum=Z% | Wind=W km/h | Icon=IconName]
IconName options: wb_sunny, cloud, water_drop, air, rain.

Then output structured sections:
### 🌤️ Weather Forecast Summary
Describe local crop suitability conditions today.

### 💧 Irrigation Recommendations
Specific water volume schedules matching these winds and temp.

### 🧑‍🌾 Farm Spraying & Working Windows
Provide advice on when to execute chemical/organic spraying (e.g. avoid high winds or rain).`;

  try {
    const responseText = await callGeminiAPI(prompt);
    
    // Parse weather simulation code
    let temp = '30°C';
    let desc = 'Sunny';
    let hum = '60%';
    let wind = '12 km/h';
    let icon = 'wb_sunny';
    let cleanedText = responseText;

    const weatherMatch = responseText.match(/\[WEATHER_DATA:\s*Temp=(.*?)\s*\|\s*Desc=(.*?)\s*\|\s*Hum=(.*?)\s*\|\s*Wind=(.*?)\s*\|\s*Icon=(.*?)\]/);
    if (weatherMatch) {
      temp = weatherMatch[1];
      desc = weatherMatch[2];
      hum = weatherMatch[3];
      wind = weatherMatch[4];
      icon = weatherMatch[5];
      cleanedText = responseText.replace(/\[WEATHER_DATA:.*?\]/, '');
    }

    document.getElementById('weatherTemp').textContent = temp;
    document.getElementById('weatherDesc').textContent = desc;
    document.getElementById('weatherHumidity').textContent = hum;
    document.getElementById('weatherWind').textContent = wind;

    // Set widget panel in Dashboard too!
    const dashTemp = document.getElementById('dashWeatherTemp');
    const dashDesc = document.getElementById('dashWeatherDesc');
    if (dashTemp) dashTemp.textContent = temp;
    if (dashDesc) dashDesc.textContent = `${desc} · Humidity: ${hum}`;

    const iconEl = document.getElementById('weatherIcon');
    if (iconEl) {
      let matIcon = 'wb_sunny';
      const lowercase = icon.toLowerCase();
      if (lowercase.includes('cloud')) matIcon = 'cloud';
      else if (lowercase.includes('rain') || lowercase.includes('water')) matIcon = 'water_drop';
      else if (lowercase.includes('wind') || lowercase.includes('air')) matIcon = 'air';
      iconEl.textContent = matIcon;
    }

    document.getElementById('advisorMarkdown').innerHTML = formatMarkdown(cleanedText);

    // Save report to history
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
    alert(`Weather advisory failed: ${error.message}`);
    if (loading) loading.style.display = 'none';
    if (placeholder) placeholder.style.display = 'flex';
  }
}

// 4. BOTANICAL CHAT
function handleChatKey(event) {
  if (event.key === 'Enter') sendChatMessage();
}

async function sendChatMessage() {
  const chatInput = document.getElementById('chatInput');
  const userText = chatInput.value.trim();
  if (!userText) return;

  chatInput.value = '';
  appendChatBubble(userText, 'user');
  const loaderId = appendChatBubbleLoader();

  const prompt = `You are a professional agricultural scientist. Answer this query clearly and concisely.
Query: ${userText}`;

  try {
    const text = await callGeminiAPI(prompt);
    const loader = document.getElementById(loaderId);
    if (loader) loader.remove();
    appendChatBubble(text, 'bot');
  } catch (error) {
    const loader = document.getElementById(loaderId);
    if (loader) loader.remove();
    appendChatBubble(`Error: ${error.message}`, 'bot');
  }
}

function appendChatBubble(text, sender) {
  const win = document.getElementById('chatWindow');
  if (!win) return;

  const div = document.createElement('div');
  div.className = `chat-message ${sender}`;
  const icon = sender === 'user' ? 'person' : 'spa';

  // Basic formatting
  const formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\n/g, '<br>');

  div.innerHTML = `
    <div class="chat-avatar">
      <span class="material-icons-round">${icon}</span>
    </div>
    <div class="chat-bubble">
      <p>${formatted}</p>
    </div>
  `;
  win.appendChild(div);
  win.scrollTop = win.scrollHeight;
}

function appendChatBubbleLoader() {
  const win = document.getElementById('chatWindow');
  if (!win) return '';

  const id = 'loader-' + Date.now();
  const div = document.createElement('div');
  div.className = 'chat-message bot';
  div.id = id;

  div.innerHTML = `
    <div class="chat-avatar">
      <span class="material-icons-round">spa</span>
    </div>
    <div class="chat-bubble">
      <div class="spinner" style="width:16px; height:16px; border-width:2px;"></div>
    </div>
  `;
  win.appendChild(div);
  win.scrollTop = win.scrollHeight;
  return id;
}

// 5. ORGANIC TREATMENT RECIPE BOOK ENGINE
let currentRecipeCategory = 'all';

function renderRecipes() {
  const grid = document.getElementById('recipesListGrid');
  if (!grid) return;

  const query = document.getElementById('recipeSearch').value.toLowerCase();
  
  // Filter list
  const filtered = recipesDb.filter(r => {
    const matchesCategory = currentRecipeCategory === 'all' || r.category === currentRecipeCategory;
    const matchesQuery = r.title.toLowerCase().includes(query) || 
                         r.desc.toLowerCase().includes(query) || 
                         r.ingredients.some(i => i.toLowerCase().includes(query));
    return matchesCategory && matchesQuery;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1;">
        <p>No recipes match search criteria</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = '';
  filtered.forEach(recipe => {
    const card = document.createElement('div');
    card.className = 'recipe-card';
    card.onclick = () => showRecipeDetails(recipe);
    
    card.innerHTML = `
      <h4>${recipe.title}</h4>
      <p class="recipe-desc">${recipe.desc}</p>
      <div class="recipe-meta-row">
        <span class="recipe-category-badge">${recipe.categoryLabel}</span>
        <span>${recipe.ingredients.length} Ingredients</span>
      </div>
    `;
    grid.appendChild(card);
  });
}

function switchRecipeTab(category) {
  currentRecipeCategory = category;
  
  // Update tabs active state
  document.querySelectorAll('.recipe-tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  const targetBtn = Array.from(document.querySelectorAll('.recipe-tab-btn')).find(btn => 
    btn.getAttribute('onclick').includes(category)
  );
  if (targetBtn) targetBtn.classList.add('active');

  renderRecipes();
}

function filterRecipes() {
  renderRecipes();
}

function showRecipeDetails(recipe) {
  // Clear TTS active speech
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    isSpeechPlaying = false;
    const playBtn = document.getElementById('playAudioBtn');
    if (playBtn) playBtn.innerHTML = '<span class="material-icons-round">volume_up</span>';
  }

  switchTab('diagnose');
  
  const placeholder = document.getElementById('diagnosisPlaceholder');
  const loading = document.getElementById('diagnosisLoading');
  const reportContent = document.getElementById('reportContent');

  if (placeholder) placeholder.style.display = 'none';
  if (loading) loading.style.display = 'none';

  // Construct Markdown styled Recipe layout for displaying inside Report area!
  const formattedRecipeText = `### 🌿 Recipe: ${recipe.title}
*Category: ${recipe.categoryLabel}*

### 🧪 Ingredients Checklist
${recipe.ingredients.map(i => `- ${i}`).join('\n')}

### 📝 Preparation & Application
${recipe.instructions.map((step, idx) => `${idx + 1}. ${step}`).join('\n\n')}`;

  document.getElementById('reportTitle').textContent = recipe.title;
  document.getElementById('reportMeta').textContent = `Category: ${recipe.categoryLabel} | Organic Recipe`;
  document.getElementById('reportMarkdown').innerHTML = formatMarkdown(formattedRecipeText);
  
  if (reportContent) reportContent.style.display = 'flex';
}

// Local Analysis History Sync
function saveHistoryItem(item) {
  const raw = localStorage.getItem(LOCAL_STORAGE_KEY_HISTORY);
  let array = raw ? JSON.parse(raw) : [];

  array = array.filter(h => h.title !== item.title);
  array.unshift(item);
  localStorage.setItem(LOCAL_STORAGE_KEY_HISTORY, JSON.stringify(array.slice(0, 10)));
  loadHistory();
}

function loadHistory() {
  const list = document.getElementById('historyList');
  const clearBtn = document.getElementById('clearHistoryBtn');
  if (!list) return;

  const raw = localStorage.getItem(LOCAL_STORAGE_KEY_HISTORY);
  const array = raw ? JSON.parse(raw) : [];

  if (array.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <p>No recent reports found</p>
      </div>
    `;
    if (clearBtn) clearBtn.style.display = 'none';
    return;
  }

  list.innerHTML = '';
  if (clearBtn) clearBtn.style.display = 'block';

  array.forEach(item => {
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
    list.appendChild(div);
  });
}

function clearHistory() {
  if (confirm('Clear all stored reports?')) {
    localStorage.removeItem(LOCAL_STORAGE_KEY_HISTORY);
    loadHistory();
  }
}

function restoreHistoryItem(item) {
  if (item.type === 'diagnosis') {
    switchTab('diagnose');
    
    document.getElementById('cropType').value = item.crop;
    document.getElementById('symptomsDesc').value = item.query !== 'Leaf Analysis' ? item.query : '';
    
    if (item.image && item.mimeType) {
      const prompt = document.getElementById('uploadPrompt');
      const container = document.getElementById('previewContainer');
      const controls = document.getElementById('canvasControls');
      
      if (prompt && container && controls) {
        prompt.style.display = 'none';
        container.style.display = 'flex';
        controls.style.display = 'block';

        originalImage = new Image();
        originalImage.src = `data:${item.mimeType};base64,${item.image}`;
        originalImage.onload = () => {
          applyCanvasFilters();
        };
      }
    } else {
      removeUploadedImage();
    }

    document.getElementById('diagnosisPlaceholder').style.display = 'none';
    document.getElementById('reportTitle').textContent = item.title;
    document.getElementById('reportMeta').textContent = `Crop: ${item.crop} | Date: ${item.date}`;
    document.getElementById('reportMarkdown').innerHTML = formatMarkdown(item.result);
    document.getElementById('reportContent').style.display = 'flex';
  } else if (item.type === 'soil') {
    switchTab('soil');
    
    // Set parameters
    if (item.parameters) {
      document.getElementById('soilN').value = item.parameters.n;
      document.getElementById('soilP').value = item.parameters.p;
      document.getElementById('soilK').value = item.parameters.k;
      document.getElementById('soilPh').value = item.parameters.ph;
      document.getElementById('soilMoisture').value = item.parameters.moisture;
      updateSoilSliders();
    }

    document.getElementById('soilGaugesWorkspace').style.display = 'none';
    document.getElementById('soilPrescriptionMarkdown').innerHTML = formatMarkdown(item.result);
    document.getElementById('soilReportMeta').textContent = `Crop target: ${item.crop} | Date: ${item.date}`;
    document.getElementById('soilPrescriptionContent').style.display = 'flex';
  } else if (item.type === 'advisor') {
    switchTab('advisor');
    document.getElementById('advisorCrop').value = item.crop;
    
    const locMatch = item.title.match(/Advisory: (.*?) - (.*)/);
    if (locMatch) {
      document.getElementById('advisorLocation').value = locMatch[2];
    }

    let cleaned = item.result;
    let temp = '30°C';
    let desc = 'Sunny';
    let hum = '60%';
    let wind = '12 km/h';

    const weatherMatch = item.result.match(/\[WEATHER_DATA:\s*Temp=(.*?)\s*\|\s*Desc=(.*?)\s*\|\s*Hum=(.*?)\s*\|\s*Wind=(.*?)\s*\|\s*Icon=(.*?)\]/);
    if (weatherMatch) {
      temp = weatherMatch[1];
      desc = weatherMatch[2];
      hum = weatherMatch[3];
      wind = weatherMatch[4];
      cleaned = item.result.replace(/\[WEATHER_DATA:.*?\]/, '');
    }

    document.getElementById('weatherTemp').textContent = temp;
    document.getElementById('weatherDesc').textContent = desc;
    document.getElementById('weatherHumidity').textContent = hum;
    document.getElementById('weatherWind').textContent = wind;

    document.getElementById('advisorPlaceholder').style.display = 'none';
    document.getElementById('advisorMarkdown').innerHTML = formatMarkdown(cleaned);
    document.getElementById('advisorContent').style.display = 'flex';
  }
}

// SpeechSynthesis Read Aloud Engine
function toggleAudioAdvice() {
  if (!('speechSynthesis' in window)) {
    alert('Voice output is not supported in this browser.');
    return;
  }

  const playBtn = document.getElementById('playAudioBtn');
  
  if (isSpeechPlaying) {
    window.speechSynthesis.cancel();
    isSpeechPlaying = false;
    if (playBtn) playBtn.innerHTML = '<span class="material-icons-round">volume_up</span>';
  } else {
    const textToSpeak = getSpeechTextContent();
    if (!textToSpeak) return;

    window.speechSynthesis.cancel();

    const selectedLang = document.getElementById('audioLang').value || 'en-US';
    currentUtterance = new SpeechSynthesisUtterance(textToSpeak);
    currentUtterance.lang = selectedLang;

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
    isSpeechPlaying = false;
    toggleAudioAdvice();
  }
}

function getSpeechTextContent() {
  const reportMarkdown = document.getElementById('reportMarkdown');
  if (!reportMarkdown) return '';
  let text = reportMarkdown.innerText || reportMarkdown.textContent;
  text = text.replace(/[🌿🔍🧪🔬🛡️🍃📝]/g, '')
             .replace(/Diagnostic Findings/g, 'Diagnosis findings')
             .replace(/Organic Treatments/g, 'Organic options');
  return text;
}

// Regex-based Markdown to HTML Parser
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
    // Numbered Lists
    else if (/^\d+\.\s+/.test(line)) {
      if (inList) {
        html += '</ul>';
        inList = false;
      }
      let contentText = line.replace(/^\d+\.\s+/, '');
      contentText = contentText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      html += `<p style="margin-bottom: 6px;"><strong>${line.match(/^\d+/)[0]}.</strong> ${contentText}</p>`;
    }
    // Normal Paragraph lines
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
