# Farm-Q
#This the farmer ai prototype. That can solve the doubts of the farmers . 

<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Smart Farmer AI — Prototype</title>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:400,500&display=swap">
  <style>
    :root{--green:#158b39;--soft:#eaf6ee;--card:#ffffffcc;--accent:#145A32}
    *{box-sizing:border-box}
    body{font-family:'Roboto',sans-serif;margin:0;background:linear-gradient(180deg,#eafaf1 0%,#fff 100%);min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px}
    .app{width:100%;max-width:980px;background:rgba(255,255,255,0.9);border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,0.08);overflow:hidden}
    .header{display:flex;align-items:center;gap:12px;padding:18px 20px;background:var(--green);color:#fff}
    .title{font-size:1.2rem;font-weight:600}
    .main{display:grid;grid-template-columns:360px 1fr;gap:18px;padding:20px}
    .card{background:var(--card);padding:14px;border-radius:10px}
    .left .card{margin-bottom:12px}
    label{display:block;font-size:0.85rem;margin-bottom:6px;color:#234}
    input[type=text],select,textarea{width:100%;padding:10px;border-radius:8px;border:1px solid #cfe8d3;background:#fff}
    textarea{min-height:90px}
    .btn{display:inline-block;padding:10px 14px;border-radius:10px;background:var(--green);color:#fff;border:none;cursor:pointer}
    .btn.secondary{background:#fff;color:var(--accent);border:1px solid var(--accent)}
    .history-list{max-height:220px;overflow:auto;margin-top:8px}
    .history-item{padding:8px;border-bottom:1px dashed #e3efe2}
    /* Chat area */
    .chat-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
    .chat-window{height:460px;background:#f7fff7;border-radius:10px;padding:12px;overflow:auto}
    .msg{max-width:78%;padding:10px 12px;margin:8px 0;border-radius:14px}
    .msg.user{margin-left:auto;background:var(--green);color:#fff;border-bottom-right-radius:4px}
    .msg.bot{margin-right:auto;background:#fff;border:1px solid #e0e0e0;color:#000;border-bottom-left-radius:4px}
    .controls{display:flex;gap:8px;margin-top:10px}
    .small{font-size:0.85rem;color:#556}
    .img-preview{max-width:120px;max-height:80px;border-radius:8px;display:block;margin-top:8px}
    .flex-row{display:flex;gap:8px}
    .footer-note{padding:12px;font-size:0.9rem;color:#2b5b37;background:#f1fff6}
    @media (max-width:880px){.main{grid-template-columns:1fr;}.chat-window{height:360px}}
  </style>
</head>
<body>
  <div class="app" id="app">
    <div class="header">
      <div style="width:44px;height:44px;border-radius:8px;background:#fff;color:var(--green);display:flex;align-items:center;justify-content:center;font-weight:700">AI</div>
      <div>
        <div class="title">Smart Farmer AI — Prototype</div>
        <div style="font-size:0.85rem;opacity:0.9">Multimodal queries · Weather-aware advice · Mock AI responses</div>
      </div>
    </div>

    <div class="main">
      <div class="left">
        <div class="card">
          <h3 style="margin:6px 0 10px">Ask a question</h3>
          <label for="crop">Crop (optional)</label>
          <input id="crop" type="text" placeholder="e.g. Tomato, Wheat"> 

          <label for="location" style="margin-top:8px">Location (for weather)</label>
          <input id="location" type="text" placeholder="City name, e.g. Pune"> 

          <label for="query" style="margin-top:8px">Your question</label>
          <textarea id="query" placeholder="Describe symptoms, pests, fertilizer query..."></textarea>

          <div style="margin-top:8px">
            <label class="small">Upload image (leaf/crop)</label>
            <input id="imageInput" type="file" accept="image/*">
            <img id="imgPreview" class="img-preview" style="display:none">
          </div>

          <div style="margin-top:10px" class="flex-row">
            <button class="btn" id="sendBtn">Get Advice (Mock)</button>
            <button class="btn secondary" id="voiceBtn">Record Voice (mock)</button>
          </div>

          <div class="small" style="margin-top:8px">Reply mode: <b>Text + Audio (demo)</b></div>
        </div>

        <div class="card">
          <h4 style="margin:6px 0">History (local)</h4>
          <div class="history-list" id="historyList">No history yet</div>
          <div style="margin-top:8px" class="small">History kept in browser storage (last 10).</div>
        </div>
      </div>

      <div class="right">
        <div class="card">
          <div class="chat-top">
            <div><strong>Chat</strong><div class="small">AI advice appears here</div></div>
            <div class="small">Weather: <span id="weatherMini">—</span></div>
          </div>

          <div class="chat-window" id="chatWindow">
            <div class="small" style="opacity:0.7">Welcome to the prototype. Try typing a question and click "Get Advice".</div>
          </div>

          <div class="controls">
            <input id="quickInput" type="text" placeholder="Type a quick message..." style="flex:1;padding:10px;border-radius:8px;border:1px solid #cfe8d3">
            <button class="btn" id="quickSend">Send</button>
          </div>
        </div>

        <div class="card" style="margin-top:12px">
          <h4 style="margin:6px 0">Demo Controls</h4>
          <div class="small">This prototype simulates AI and audio locally using the browser's speechSynthesis API. No server required.</div>
          <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap">
            <button class="btn secondary" id="loadSample">Load Sample Scenarios</button>
            <button class="btn secondary" id="clearHistory">Clear History</button>
          </div>
        </div>
      </div>
    </div>

    <div class="footer-note">Prototype — not connected to server. Replace mock parts with your backend endpoints to produce real AI responses.</div>
  </div>

  <script>
    // Simple prototype JS: stores history in localStorage, simulates weather and AI replies, uses speechSynthesis for audio.
    const sendBtn = document.getElementById('sendBtn');
    const queryEl = document.getElementById('query');
    const cropEl = document.getElementById('crop');
    const locEl = document.getElementById('location');
    const chatWindow = document.getElementById('chatWindow');
    const historyList = document.getElementById('historyList');
    const imgInput = document.getElementById('imageInput');
    const imgPreview = document.getElementById('imgPreview');
    const weatherMini = document.getElementById('weatherMini');
    const quickInput = document.getElementById('quickInput');
    const quickSend = document.getElementById('quickSend');
    const loadSample = document.getElementById('loadSample');
    const clearHistory = document.getElementById('clearHistory');

    // localStorage key
    const HS_KEY = 'farmerai_proto_history';

    function loadHistory(){
      const raw = localStorage.getItem(HS_KEY);
      let arr = raw ? JSON.parse(raw) : [];
      renderHistory(arr);
      return arr;
    }

    function saveHistory(arr){
      localStorage.setItem(HS_KEY, JSON.stringify(arr.slice(-10)));
      renderHistory(arr);
    }

    function renderHistory(arr){
      historyList.innerHTML = '';
      if(!arr || arr.length===0){ historyList.innerHTML='No history yet'; return; }
      arr.slice().reverse().forEach(h=>{
        const d=document.createElement('div'); d.className='history-item';
        d.innerHTML=`<div><strong>${h.crop||'-'}</strong> - ${h.location||'-'}</div><div style="font-size:0.9rem">${h.query}</div>`;
        historyList.appendChild(d);
      });
    }

    function appendChat(text, sender='bot'){
      const d=document.createElement('div'); d.className='msg '+(sender==='user'?'user':'bot');
      d.innerHTML = `<div>${text}</div>`;
      chatWindow.appendChild(d);
      chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    // Mock weather provider — in prototype we randomize a simple forecast
    function mockWeather(location){
      if(!location) return '—';
      const temps = [22,24,26,28,30,32,20];
      const idx = Math.floor(Math.random()*temps.length);
      return `${location}: ${temps[idx]}°C, ${['clear','partly cloudy','rain','windy'][Math.floor(Math.random()*4)]}`;
    }

    // Very small rule-based AI for demo (keeps similarity with your fallback)
    function mockAIResponse(query,crop,location,imageIncluded){
      query = (query||'').toLowerCase();
      if(imageIncluded) return `Detected leaf spots. For ${crop||'the crop'}, consider a suitable fungicide and remove affected leaves.`;
      if(query.includes('yellow') && query.includes('leaf')) return `For ${crop||'your crop'}, yellowing leaves often indicate nitrogen deficiency — apply balanced NPK or urea as per recommended dose.`;
      if(query.includes('pest') || query.includes('insect')) return `Looks like insect attack. Use neem-based solutions or consult local ag officer for pesticide choice.`;
      if(query.includes('water') || query.includes('irrig')) return `Monitor soil moisture — irrigate less if forecast predicts rain, otherwise maintain regular watering.`;
      // fallback gentle advice with weather consideration
      const w = mockWeather(location);
      return `Based on conditions (${w}), for ${crop||'your crop'} follow balanced fertilization, keep fields weed-free, and monitor pests.`;
    }

    // Use speechSynthesis to play advice
    function speakText(text, lang='en-US'){
      if(!('speechSynthesis' in window)) return;
      const ut = new SpeechSynthesisUtterance(text);
      ut.lang = lang;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(ut);
    }

    // Wire image preview
    imgInput.addEventListener('change',(e)=>{
      const f = e.target.files[0];
      if(!f) { imgPreview.style.display='none'; return; }
      const url = URL.createObjectURL(f);
      imgPreview.src = url; imgPreview.style.display='block';
    });

    // Send button handler — simulates sending to backend and stores history
    sendBtn.addEventListener('click',()=>{
      const q = queryEl.value.trim();
      const crop = cropEl.value.trim();
      const loc = locEl.value.trim();
      const imageIncluded = !!imgInput.files[0];
      if(!q && !imageIncluded) { alert('Please enter a question or upload an image.'); return; }

      appendChat(q,'user');

      // build response
      const reply = mockAIResponse(q,crop,loc,imageIncluded);
      setTimeout(()=>{
        appendChat(reply,'bot');
        speakText(reply);
        // save history
        const h = loadHistory();
        h.push({query:q, crop:crop, location:loc, response:reply, ts:Date.now(), image:imageIncluded});
        saveHistory(h);
        weatherMini.textContent = mockWeather(loc);
      },700 + Math.random()*900);

      // clear input
      queryEl.value='';
      imgInput.value=''; imgPreview.style.display='none';
    });

    // quick send
    quickSend.addEventListener('click',()=>{
      const t = quickInput.value.trim(); if(!t) return; quickInput.value=''; appendChat(t,'user');
      const reply = mockAIResponse(t,'',locEl.value.trim(),false);
      setTimeout(()=>{appendChat(reply,'bot'); speakText(reply); const h=loadHistory(); h.push({query:t,response:reply,ts:Date.now()}); saveHistory(h);},500);
    });

    // load sample
    loadSample.addEventListener('click',()=>{
      const samples = [
        {q:'My tomato leaves are yellow',crop:'Tomato',loc:'Pune'},
        {q:'There are small holes in leaves, what is this?',crop:'Brinjal',loc:'Hyderabad'},
        {q:'When should I apply fertilizer for wheat?',crop:'Wheat',loc:'Indore'}
      ];
      const s = samples[Math.floor(Math.random()*samples.length)];
      cropEl.value=s.crop; locEl.value=s.loc; queryEl.value=s.q; sendBtn.click();
    });

    clearHistory.addEventListener('click',()=>{ localStorage.removeItem(HS_KEY); renderHistory([]); alert('History cleared'); });

    // initial load
    loadHistory();
    weatherMini.textContent = '—';
  </script>
</body>
</html>
