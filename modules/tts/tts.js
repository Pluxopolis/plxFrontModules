(function () {
  'use strict';
  if (!window.speechSynthesis) return;

  var lang      = document.documentElement.lang || 'fr';
  var STORE     = 'plx-tts-settings';
  var SELECTORS = 'h1,h2,h3,h4,h5,h6,p,li,blockquote,figcaption';
  var C        = (window.plxFrontConfig && window.plxFrontConfig["tts"]) || {};
  var hasFonts  = C.hasFonts === true;
  var isIntro   = C.isIntro  === true;
  var L        = C.lang || {};

  /* ══════════════════════
     Réglages partagés
     ══════════════════════ */
  var defaults = { voice:'', rate:1, pitch:1, dyslexia:false, theme:'dark' };
  function loadSettings() {
    try { return Object.assign({}, defaults, JSON.parse(localStorage.getItem(STORE)||'<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"\/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"\/><\/svg>')); }
    catch(e) { return Object.assign({}, defaults); }
  }
  function saveSettings(s) {
    try { localStorage.setItem(STORE, JSON.stringify(s)); } catch(e) {}
  }
  var S = loadSettings();

  /* ══════════════════════
     Voix
     ══════════════════════ */
  var voices = [];
  function loadVoices() {
    var pfx = lang.split('-')[0].toLowerCase();
    voices = window.speechSynthesis.getVoices().filter(function(v){
      return v.lang.toLowerCase().startsWith(pfx);
    });
    document.querySelectorAll('.plx-voice-sel').forEach(fillVoiceSelect);
  }
  if (window.speechSynthesis.onvoiceschanged !== undefined)
    window.speechSynthesis.onvoiceschanged = loadVoices;
  loadVoices();

  function fillVoiceSelect(sel) {
    var cur = S.voice;
    sel.innerHTML = '<option value="">' + L['VOICE_DEFAULT'] + '</option>';
    voices.forEach(function(v){
      var o = document.createElement('option');
      o.value = v.name;
      o.textContent = v.name + ' (' + v.lang + ')';
      if (v.name === cur) o.selected = true;
      sel.appendChild(o);
    });
  }

  /* ══════════════════════
     Mode dyslexie
     ══════════════════════ */
  function applyDyslexia(on) {
    if (!hasFonts) return;
    document.querySelectorAll('article').forEach(function(a){
      a.classList.toggle('plx-dyslexia-on', on);
    });
    var btn = document.getElementById('plx-tts-btn-dys');
    if (btn) btn.classList.toggle('plx-active', on);
  }
  applyDyslexia(S.dyslexia);

  /* ══════════════════════
     Barre fixe (body)
     ══════════════════════ */
  var bar = document.createElement('div');
  bar.id = 'plx-tts-bar';
  bar.setAttribute('role', 'region');
  bar.setAttribute('aria-label', L['PLAYER_REGION']);
  if (S.theme === 'light') bar.classList.add('plx-theme-light');

  /* ── Ligne titre ── */
  var titleRow = document.createElement('div');
  titleRow.id = 'plx-tts-title-row';

  var titleSpan = document.createElement('p');
  titleSpan.id = 'plx-tts-title';
  titleSpan.setAttribute('aria-live', 'polite');
  titleSpan.setAttribute('aria-atomic', 'true');
  titleSpan.textContent = '';

  var btnTheme = document.createElement('button');
  btnTheme.id = 'plx-tts-btn-theme';
  btnTheme.setAttribute('type', 'button');
  btnTheme.setAttribute('aria-label', L['BTN_THEME']);
  btnTheme.textContent = S.theme === 'light' ? '🌙' : '☀';
  btnTheme.addEventListener('click', function(e){
    e.stopPropagation();
    S.theme = S.theme === 'dark' ? 'light' : 'dark';
    saveSettings(S);
    var isLight = S.theme === 'light';
    bar.classList.toggle('plx-theme-light', isLight);
    btnTheme.textContent = isLight ? '🌙' : '☀';
  });

  titleRow.appendChild(titleSpan);
  titleRow.appendChild(btnTheme);

  /* ── Ligne contrôles ── */
  var controls = document.createElement('div');
  controls.id = 'plx-tts-controls';

  var btnArtPrev= mkBtn('<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="15 20 5 12 15 4 15 20"/><polygon points="21 20 11 12 21 4 21 20"/></svg>', L['BTN_ART_PREV'], 'plx-tts-btn-art-prev');
  var btnPrev  = mkBtn('<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="19 20 9 12 19 4 19 20"/><line x1="5" y1="4" x2="5" y2="20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',  L['BTN_PREV'],     'plx-tts-btn-prev');
  var btnPlay  = mkBtn('<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>',  L['BTN_PLAY'],     'plx-tts-btn-play');
  var btnPause = mkBtn('<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>', L['BTN_PAUSE'],    'plx-tts-btn-pause');
  var btnStop  = mkBtn('<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>',  L['BTN_STOP'],     'plx-tts-btn-stop');
  var btnNext  = mkBtn('<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="4" x2="19" y2="20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',  L['BTN_NEXT'],     'plx-tts-btn-next');
  var btnArtNext= mkBtn('<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="9 4 19 12 9 20 9 4"/><polygon points="3 4 13 12 3 20 3 4"/></svg>', L['BTN_ART_NEXT'], 'plx-tts-btn-art-next');
  var btnGear  = mkBtn('<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',  L['BTN_SETTINGS'], 'plx-tts-btn-gear');
  var btnDys   = mkBtn('Aa',          L['BTN_DYSLEXIA'], 'plx-tts-btn-dys');

  btnPrev.disabled  = true;
  btnArtPrev.disabled = true;
  btnArtPrev.style.display = 'none';
  btnArtNext.style.display = 'none';
  btnPause.disabled = true;
  btnStop.disabled  = true;
  btnNext.disabled  = true;
  if (S.dyslexia) btnDys.classList.add('plx-active');
  if (!hasFonts) btnDys.style.display = 'none';

  var track = document.createElement('div'); track.className = 'plx-tts-track';
  var fill  = document.createElement('div'); fill.className  = 'plx-tts-fill';
  track.appendChild(fill);

  var counter = document.createElement('span'); counter.className = 'plx-tts-counter';

  var sep1 = document.createElement('span'); sep1.className = 'plx-tts-sep';
  var sep2 = document.createElement('span'); sep2.className = 'plx-tts-sep';

  controls.appendChild(btnArtPrev);
  controls.appendChild(btnPrev);
  controls.appendChild(btnPlay);
  controls.appendChild(btnPause);
  controls.appendChild(btnStop);
  controls.appendChild(btnNext);
  controls.appendChild(btnArtNext);
  controls.appendChild(sep1);
  controls.appendChild(track);
  controls.appendChild(counter);
  controls.appendChild(sep2);
  controls.appendChild(btnGear);
  controls.appendChild(btnDys);

  /* panelSettings et panelDys sont appendés à bar après leur construction ci-dessous */

  /* Appliquer le thème clair sur le body pour les panneaux */

  /* ══════════════════════
     Panneau réglages
     ══════════════════════ */
  var panelSettings = document.createElement('div');
  panelSettings.className = 'plx-tts-panel';
  panelSettings.id = 'plx-tts-panel-settings';
  panelSettings.setAttribute('role', 'region');
  panelSettings.setAttribute('aria-label', L['SETTINGS_REGION']);

  var titleS = document.createElement('div');
  titleS.className = 'plx-tts-panel-title';
  titleS.textContent = L['SETTINGS_TITLE'];
  panelSettings.appendChild(titleS);

  /* Voix */
  var rVoice = mkRow(L['VOICE']);
  var selVoice = document.createElement('select');
  selVoice.className = 'plx-voice-sel';
  fillVoiceSelect(selVoice);
  selVoice.addEventListener('change', function(){ S.voice = selVoice.value; saveSettings(S); });
  rVoice.appendChild(selVoice);
  panelSettings.appendChild(rVoice);

  /* Vitesse */
  var rRate = mkRow(L['RATE']);
  var iRate = mkRange(0.5, 2, 0.1, S.rate);
  var vRate = mkVal(S.rate.toFixed(1)+'x');
  iRate.addEventListener('input', function(){
    S.rate = parseFloat(iRate.value);
    vRate.textContent = S.rate.toFixed(1)+'x';
    saveSettings(S);
  });
  rRate.appendChild(iRate); rRate.appendChild(vRate);
  panelSettings.appendChild(rRate);

  /* Pitch */
  var rPitch = mkRow(L['PITCH']);
  var iPitch = mkRange(0.5, 2, 0.1, S.pitch);
  var vPitch = mkVal(S.pitch.toFixed(1));
  iPitch.addEventListener('input', function(){
    S.pitch = parseFloat(iPitch.value);
    vPitch.textContent = S.pitch.toFixed(1);
    saveSettings(S);
  });
  rPitch.appendChild(iPitch); rPitch.appendChild(vPitch);
  panelSettings.appendChild(rPitch);

  /* ══════════════════════
     Panneau dyslexie
     ══════════════════════ */
  var panelDys = document.createElement('div');
  panelDys.className = 'plx-tts-panel';
  panelDys.id = 'plx-tts-panel-dys';
  panelDys.setAttribute('role', 'region');
  panelDys.setAttribute('aria-label', L['DYSLEXIA_REGION']);

  var titleD = document.createElement('div');
  titleD.className = 'plx-tts-panel-title';
  titleD.textContent = L['DYSLEXIA_TITLE'];
  panelDys.appendChild(titleD);

  var tDys = mkToggle('plx-dys-toggle', L['DYSLEXIA_LABEL'], S.dyslexia);
  tDys.input.addEventListener('change', function(){
    S.dyslexia = tDys.input.checked;
    saveSettings(S);
    applyDyslexia(S.dyslexia);
  });
  panelDys.appendChild(tDys.row);

  var infoD = document.createElement('p');
  infoD.style.cssText = 'margin:4px 0 0;font-size:.68rem;opacity:.4;line-height:1.5;';
  infoD.textContent = 'Nécessite OpenDyslexic-*.woff2 dans plugins/plxTTS/fonts/';
  panelDys.appendChild(infoD);
  if (!hasFonts) panelDys.style.display = 'none';

  /* ── Assemblage final de la barre (ordre DOM = ordre visuel bas→haut) ── */
  bar.appendChild(titleRow);   /* titre au-dessus des contrôles */
  bar.appendChild(controls);   /* ligne contrôles */
  bar.appendChild(panelSettings); /* panneaux absolus, hors flux */
  bar.appendChild(panelDys);
  document.body.appendChild(bar);

  /* ── Toggle panneaux ── */
  function togglePanel(panel, btn) {
    var isOpen = panel.classList.contains('plx-open');
    /* Fermer les deux */
    panelSettings.classList.remove('plx-open');
    panelDys.classList.remove('plx-open');
    btnGear.classList.remove('plx-active');
    btnDys.classList.remove('plx-active');
    /* Rouvrir si c'était fermé + réappliquer dyslexia active state */
    if (!isOpen) {
      panel.classList.add('plx-open');
      btn.classList.add('plx-active');
    }
    /* Conserver le highlight dyslexie si actif */
    if (S.dyslexia) btnDys.classList.add('plx-active');
  }

  btnGear.addEventListener('click', function(e){
    e.stopPropagation();
    togglePanel(panelSettings, btnGear);
  });
  btnDys.addEventListener('click', function(e){
    e.stopPropagation();
    togglePanel(panelDys, btnDys);
  });

  /* Empêcher les clics dans les panneaux de remonter jusqu'au document */
  panelSettings.addEventListener('click', function(e){ e.stopPropagation(); });
  panelDys.addEventListener('click',      function(e){ e.stopPropagation(); });

  document.addEventListener('click', function(){
    panelSettings.classList.remove('plx-open');
    panelDys.classList.remove('plx-open');
    btnGear.classList.remove('plx-active');
    if (S.dyslexia) btnDys.classList.add('plx-active');
    else btnDys.classList.remove('plx-active');
  });

  /* ══════════════════════
     Collecte des articles
     ══════════════════════ */
  var articles = [];
  var activeArticle = null;

  document.querySelectorAll('article').forEach(function(article, idx){
    var blocks = Array.from(article.querySelectorAll(SELECTORS)).filter(function(el){
      return !el.closest('pre, code') && el.textContent.trim().length > 0;
    });
    if (!blocks.length) return;
    article.dataset.plxIdx = idx;
    articles.push({ el: article, blocks: blocks, visible: false });

    /* Skip link sr-only — visible uniquement aux lecteurs d'écran */
    var skip = document.createElement('a');
    skip.className = 'plx-sr-only';
    skip.href = '#plx-tts-bar';
    skip.textContent = L['SKIP_LINK'];
    skip.addEventListener('click', function(e){
      e.preventDefault();
      /* Cibler cet article et lancer la lecture */
      var art = articles.find(function(a){ return a.el === article; });
      if (art) {
        if (speaking) stop();
        activeArticle = art;
        updateTitle(art);
        bar.classList.add('plx-visible');
        play();
      }
      /* Déplacer le focus vers la barre */
      bar.setAttribute('tabindex', '-1');
      bar.focus();
    });
    article.insertBefore(skip, article.firstElementChild);
  });

  if (!articles.length) return;

  /* Afficher les boutons navigation article seulement si plusieurs articles */
  if (articles.length > 1) {
    btnArtPrev.style.display = '';
    btnArtNext.style.display = '';
  }

  /* Titre de l'article actif (35 car. max) */
  function updateTitle(art) {
    if (!art) { titleSpan.textContent = ''; return; }
    var h = art.el.querySelector('h1, h2, h3, h4, h5, h6');
    var txt = h ? h.textContent.trim() : '';
    if (txt.length > 35) txt = txt.slice(0, 34) + '…';
    titleSpan.textContent = isIntro ? txt + ' (' + L['EXCERPT'] + ')' : txt;
  }

  /* ══════════════════════
     IntersectionObserver
     Active le lecteur sur l'article le plus visible
     ══════════════════════ */
  var navigating = false; /* bloque l'IO pendant une navigation article */

  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      var art = articles.find(function(a){ return a.el === entry.target; });
      if (art) art.visible = entry.isIntersecting;
    });

    /* Ne pas changer d'article pendant une lecture ou une navigation */
    if (navigating || speaking) return;

    /* Article dont le titre est le plus proche du centre du viewport */
    var best = null, bestScore = -1;
    articles.forEach(function(art){
      if (!art.visible) return;
      var heading = art.el.querySelector('h1, h2, h3, h4, h5, h6');
      var el = heading || art.el;
      var r = el.getBoundingClientRect();
      var center = window.innerHeight / 2;
      var elCenter = r.top + r.height / 2;
      var score = 1 - Math.abs(elCenter - center) / window.innerHeight;
      if (score > bestScore) { bestScore = score; best = art; }
    });

    if (best && best !== activeArticle) {
      /* Stopper lecture si on change d'article */
      if (speaking) stop();
      activeArticle = best;
      updateTitle(best);
    }

    bar.classList.toggle('plx-visible', !!best);
    if (!best) updateTitle(null);
  }, { threshold: [0, 0.1, 0.3, 0.5] });

  articles.forEach(function(art){ io.observe(art.el); });

  /* ══════════════════════
     État lecture
     ══════════════════════ */
  var current  = -1;
  var speaking = false;
  var paused   = false;

  function blocks() {
    return activeArticle ? activeArticle.blocks : [];
  }

  function highlight(idx) {
    /* Effacer tous les surlignages */
    articles.forEach(function(art){
      art.blocks.forEach(function(b){ b.classList.remove('plx-tts-active'); });
    });
    if (idx >= 0 && idx < blocks().length) {
      blocks()[idx].classList.add('plx-tts-active');
      blocks()[idx].scrollIntoView({ behavior:'smooth', block:'start' });
    }
  }

  function updateUI() {
    var total = blocks().length;
    var hasBlocks = total > 0;
    btnPrev.disabled  = !hasBlocks || current <= 0;
    btnPlay.disabled  = speaking && !paused;
    btnPause.disabled = !speaking || paused;
    btnStop.disabled  = !speaking && current < 0;
    btnNext.disabled  = !hasBlocks || current >= total - 1;

    /* Navigation article */
    if (articles.length > 1 && activeArticle) {
      var artIdx = articles.indexOf(activeArticle);
      btnArtPrev.disabled = artIdx <= 0;
      btnArtNext.disabled = artIdx >= articles.length - 1;
    }
    fill.style.width  = total ? ((Math.max(0,current)/total)*100)+'%' : '0%';
    counter.textContent = (speaking || current >= 0)
      ? (Math.max(0,current)+(speaking?1:0))+' / '+total : '';
  }

  function speakBlock(idx) {
    if (!activeArticle || idx >= blocks().length) { stop(); return; }
    current = idx;
    highlight(idx);
    updateUI();

    var utt   = new SpeechSynthesisUtterance(blocks()[idx].textContent.trim());
    utt.lang  = lang;
    utt.rate  = S.rate;
    utt.pitch = S.pitch;
    if (S.voice) {
      var v = voices.find(function(v){ return v.name === S.voice; });
      if (v) utt.voice = v;
    }
    utt.onend   = function(){ if (speaking && !paused) speakBlock(idx+1); };
    utt.onerror = function(e){ if (e.error !== 'interrupted') console.warn('TTS:',e.error); };
    window.speechSynthesis.speak(utt);
  }

  function play() {
    /* Fix Chrome : resume() ignoré après pause longue — on repart du bloc courant */
    window.speechSynthesis.cancel();
    speaking = true; paused = false;
    speakBlock(current >= 0 ? current : 0);
  }

  function pause() {
    if (!speaking) return;
    window.speechSynthesis.cancel(); /* on garde current pour reprendre */
    paused = true; speaking = false;
    highlight(-1); /* effacer le surlignage pendant la pause */
    updateUI();
  }

  function stop() {
    window.speechSynthesis.cancel();
    speaking = false; paused = false; current = -1;
    articles.forEach(function(art){
      art.blocks.forEach(function(b){ b.classList.remove('plx-tts-active'); });
    });
    fill.style.width = '0%'; counter.textContent = '';
    updateUI();
  }

  function prevBlock() {
    var target = current > 0 ? current - 1 : 0;
    window.speechSynthesis.cancel();
    speaking = true; paused = false;
    speakBlock(target);
  }

  function nextBlock() {
    var total = blocks().length;
    if (current >= total - 1) return;
    var target = current >= 0 ? current + 1 : 0;
    window.speechSynthesis.cancel();
    speaking = true; paused = false;
    speakBlock(target);
  }

  function goToArticle(art) {
    if (!art) return;
    stop();
    activeArticle = art;
    current = -1;
    updateTitle(art);
    updateUI();
    /* Bloquer l'IO pendant le scroll pour éviter qu'il écrase activeArticle */
    navigating = true;
    art.el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    /* Lever le flag une fois le scroll terminé (~600ms) */
    setTimeout(function(){ navigating = false; }, 700);
  }

  function prevArticle() {
    if (!activeArticle) return;
    var idx = articles.indexOf(activeArticle);
    if (idx > 0) goToArticle(articles[idx - 1]);
  }

  function nextArticle() {
    if (!activeArticle) return;
    var idx = articles.indexOf(activeArticle);
    if (idx < articles.length - 1) goToArticle(articles[idx + 1]);
  }

  btnPlay.addEventListener('click',  play);
  btnPause.addEventListener('click', pause);
  btnStop.addEventListener('click',  stop);
  btnPrev.addEventListener('click',  prevBlock);
  btnNext.addEventListener('click',  nextBlock);
  btnArtPrev.addEventListener('click', prevArticle);
  btnArtNext.addEventListener('click', nextArticle);
  window.addEventListener('pagehide', function(){ window.speechSynthesis.cancel(); });

  /* ── Raccourcis clavier ── */
  document.addEventListener('keydown', function(e) {
    /* Ignorer si focus dans un champ texte */
    var tag = document.activeElement ? document.activeElement.tagName : '';
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    /* Ignorer si la barre n'est pas visible */
    if (!bar.classList.contains('plx-visible')) return;

    switch(e.key) {
      case ' ':
        e.preventDefault();
        if (speaking && !paused) pause();
        else play();
        break;
      case 'Escape':
        e.preventDefault();
        stop();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        prevBlock();
        break;
      case 'ArrowRight':
        e.preventDefault();
        nextBlock();
        break;
    }
  });

  updateUI();

  /* ══════════════════════
     Helpers DOM
     ══════════════════════ */
  function mkBtn(content, label, id) {
    var b = document.createElement('button');
    b.className = 'plx-tts-btn';
    if (id) b.id = id;
    /* SVG ou texte */
    if (content.charAt(0) === '<') b.innerHTML = content;
    else b.textContent = content;
    b.setAttribute('aria-label', label);
    b.setAttribute('type', 'button');
    return b;
  }
  function mkRow(labelText) {
    var row = document.createElement('div'); row.className = 'plx-tts-row';
    var lbl = document.createElement('label'); lbl.textContent = labelText;
    row.appendChild(lbl); return row;
  }
  function mkRange(min, max, step, val) {
    var r = document.createElement('input');
    r.type='range'; r.min=min; r.max=max; r.step=step; r.value=val; return r;
  }
  function mkVal(text) {
    var s = document.createElement('span'); s.className='plx-tts-val'; s.textContent=text; return s;
  }
  function mkToggle(id, labelText, checked) {
    var row = document.createElement('div'); row.className = 'plx-tts-toggle';
    var sw  = document.createElement('label'); sw.className = 'plx-tts-switch';
    var inp = document.createElement('input');
    inp.type='checkbox'; inp.id=id; inp.checked=!!checked;
    var trk = document.createElement('span'); trk.className='plx-tts-switch-track';
    sw.appendChild(inp); sw.appendChild(trk);
    var lbl = document.createElement('label'); lbl.htmlFor=id; lbl.textContent=labelText;
    row.appendChild(sw); row.appendChild(lbl);
    return { row:row, input:inp };
  }

}());
