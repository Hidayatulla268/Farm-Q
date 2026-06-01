# 🌾 Farm-Q: Smart AI Agriculture Assistant

Farm-Q is a professional, mobile-friendly web application designed to empower farmers and agricultural enthusiasts with AI-driven insights. Using a modern glassmorphic interface, Farm-Q acts as an intelligent field guide, helping identify plant diseases, providing smart weather-aware advisories, and offering expert Q&A.

**🌐 Live Demo:** [https://hidayatulla268.github.io/Farm-Q/](https://hidayatulla268.github.io/Farm-Q/)

---

## 🌟 Key Features

### 1. 🌿 Leaf & Crop Disease Diagnoser
- **Multimodal AI Analysis**: Upload an image of an infected leaf or crop (supports PNG, JPG, JPEG).
- **Comprehensive Reports**: Generates detailed plant diagnostic reports including:
  - Precise disease identification and cause.
  - Visual symptoms checklist.
  - Actionable treatment plans (organic/non-chemical controls and specific chemical alternatives).
  - Long-term prevention techniques.

### 2. 🌤️ Weather-Aware Smart Advisor
- **Agricultural Forecasts**: Simulates location-specific meteorological data (temperature, wind, humidity, soil type).
- **Custom Scheduling**: Returns actionable, weather-adapted guidelines for irrigation schedules, fertilizer applications, and field operations.

### 3. 🔊 Multilingual Read Aloud (TTS)
- **Audio Output**: Uses the browser's native Speech Synthesis API to read diagnostic recommendations aloud.
- **Language Support**: Supports English, Hindi (`hi-IN`), and Telugu (`te-IN`) for accessible local field use.

### 4. 💬 Ask Farm-Q Expert AI
- **Field Assistant Chatbot**: Interactive Q&A to answer queries about seed selection, crop rotation, soil health, and pest management.

### 5. 🗃️ Offline-First History
- Saves your last 10 diagnostic reports and weather advisories to `localStorage` so you can restore them instantly without re-uploading.

---

## 🛠️ Tech Stack & Architecture

- **Frontend Structure**: HTML5 Semantic Markup
- **Design & Styling**: Custom Vanilla CSS with:
  - Fluid grid system & responsive flex layouts.
  - Dynamic HSL-based palette (Emerald Green & Earthy Amber).
  - Modern glassmorphism panel styles.
  - Dual light and dark modes.
- **Application Logic**: Vanilla JavaScript (ES6+)
- **AI Engine**: Google Gemini API via lightweight client-side REST fetching (utilizing `gemini-2.5-flash` for high-speed multimodal processing).
- **Voice Engine**: HTML5 Speech Synthesis Web API.

---

## 🚀 How to Run Locally

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Hidayatulla268/Farm-Q.git
   cd Farm-Q
   ```
2. **Launch the app**:
   - Double-click `index.html` to open it directly in any modern browser, or run a local server:
   ```bash
   npx serve .
   ```
3. **Configure API Key**:
   - Click the **Settings** button in the top navigation bar.
   - Enter your **Google Gemini API Key** (obtain a free key from [Google AI Studio](https://aistudio.google.com/)).
   - Save the key to enable real-time AI operations.

---

## 🔒 Security & Privacy

This application is fully client-side:
- **No Database Backend**: Your files and inputs are never uploaded to a third-party server.
- **Local API Storage**: Your Gemini API Key is stored only in your browser's private `localStorage` cache and sent directly to Google's API endpoint over HTTPS.
