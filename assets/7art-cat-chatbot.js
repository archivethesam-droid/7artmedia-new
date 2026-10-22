/* 7Art Cat Chatbot - self-contained embed widget
 * Configure window.SevenArtCatChatbotConfig before this script.
 */
(function () {
  'use strict';
  if (window.__sevenArtCatChatbotLoaded) return;
  window.__sevenArtCatChatbotLoaded = true;

  const cfg = Object.assign({
    brand: '7Art',
    assistantName: 'Milo',
    subtitle: '7Art Growth Assistant · Always Active',
    whatsapp: '918796742031',
    email: '7artsupportofficial@gmail.com',
    contactUrl: 'https://www.7artmedia.com/#contact',
    // Set to your own server endpoint to connect an AI model securely.
    // It should accept POST { message, history } and return { reply: "..." }.
    apiEndpoint: '',
    // Local, noise-reduced meow audio. Upload meow-clean.wav alongside the site's assets.
    meowUrl: '/assets/meow-clean.wav',
    accentA: '#c026ff',
    accentB: '#12d9e8',
    startOpen: false,
    // Set this to an image URL/path to replace the built-in cat logo. Example: '/assets/cat-logo.png'
    catLogoUrl: '',
    catLogoFit: 'contain',
    // Position controls: adjust these if WhatsApp/Email floating buttons overlap.
    launcherRight: '24px',
    launcherBottom: '24px',
    panelRight: '24px',
    panelBottom: '104px',
    mobileLauncherRight: '15px',
    mobileLauncherBottom: '15px',
    mobilePanelRight: '8px',
    mobilePanelBottom: '82px'
  }, window.SevenArtCatChatbotConfig || {});

  const css = `
  #sevenart-cat-root{--sa-purple:#8b5cf6;--sa-orange:#ff7a18;--sa-pink:#b15dde;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#f8f5ff;z-index:2147483000;position:relative}
  #sevenart-cat-root *{box-sizing:border-box}
  #sevenart-cat-launcher{position:fixed;right:var(--sa-launcher-right,24px);bottom:var(--sa-launcher-bottom,24px);width:64px;height:64px;border:1px solid rgba(255,255,255,.55);border-radius:20px;overflow:visible;padding:0;cursor:pointer;color:white;background:linear-gradient(135deg,var(--sa-purple),var(--sa-pink) 52%,var(--sa-orange));box-shadow:0 0 0 5px rgba(139,92,246,.12),0 8px 35px rgba(139,92,246,.35);display:grid;place-items:center;transition:transform .25s ease,box-shadow .25s ease;animation:sevenart-pulse 3.2s ease-in-out infinite}
  #sevenart-cat-launcher:hover{transform:translateY(-3px) scale(1.05);box-shadow:0 0 0 7px rgba(139,92,246,.15),0 12px 40px rgba(255,122,24,.3)}
  #sevenart-cat-launcher svg{width:42px;height:42px;filter:drop-shadow(0 2px 3px rgba(0,0,0,.25))}
  #sevenart-cat-launcher .sa-cat-logo{width:100%;height:100%;padding:0;border-radius:inherit;object-fit:var(--sa-logo-fit,contain);}
  #sevenart-cat-launcher .sa-meow-text{position:absolute;left:52%;top:56%;z-index:1;white-space:nowrap;pointer-events:none;color:#fff5ff;font-size:12px;font-weight:800;letter-spacing:.25px;text-shadow:0 1px 3px #210b33,0 0 10px rgba(214,117,255,.9);opacity:0;animation:sevenart-meow 2.8s ease-out infinite}
  .sa-avatar .sa-cat-logo{width:100%;height:100%;padding:3px;border-radius:50%;object-fit:var(--sa-logo-fit,contain)}
  .sa-miniavatar .sa-cat-logo{width:100%;height:100%;border-radius:50%;object-fit:var(--sa-logo-fit,contain)}
  #sevenart-cat-panel{position:fixed;right:var(--sa-panel-right,24px);bottom:var(--sa-panel-bottom,104px);width:min(390px,calc(100vw - 28px));height:min(650px,calc(100dvh - 130px));min-height:430px;display:none;flex-direction:column;overflow:hidden;border:1px solid transparent;border-radius:22px;background:linear-gradient(155deg,#0d0b16 0%,#08070e 62%,#100b12 100%) padding-box,linear-gradient(140deg,#8b5cf6 0%,#b15dde 48%,#ff7a18 100%) border-box;box-shadow:0 24px 90px rgba(0,0,0,.62),0 0 28px rgba(139,92,246,.24),0 0 44px rgba(255,122,24,.12);backdrop-filter:blur(18px)}
  #sevenart-cat-panel.is-open{display:flex;animation:sevenart-rise .34s cubic-bezier(.2,.8,.2,1)}
  .sa-head{position:relative;display:flex;align-items:center;gap:10px;padding:14px 14px 12px;border-bottom:1px solid rgba(255,255,255,.09);background:linear-gradient(110deg,rgba(139,92,246,.12),rgba(14,10,26,.9) 52%,rgba(255,122,24,.08));flex-shrink:0}
  .sa-head:after{position:absolute;right:0;bottom:-1px;left:0;height:2px;background:linear-gradient(90deg,transparent,#8b5cf6,#b15dde,#ff7a18,transparent);content:"";background-size:200% 100%;animation:sa-shimmer 3.5s linear infinite}
  .sa-avatar{width:42px;height:42px;flex-shrink:0;border-radius:50%;display:grid;place-items:center;background:linear-gradient(140deg,#8b5cf6,#ff7a18);border:1px solid rgba(255,255,255,.62);box-shadow:0 0 0 3px rgba(139,92,246,.12),0 0 20px rgba(139,92,246,.28);animation:sa-avatar-glow 3s ease-in-out infinite}
  .sa-avatar svg{width:31px;height:31px}
  .sa-headcopy{min-width:0;flex:1}.sa-title{font-weight:750;font-size:14px;letter-spacing:.1px;line-height:1.3}.sa-subtitle{font-size:10px;color:#b8a8d3;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .sa-live{color:#8ef6cf;font-size:9px;letter-spacing:.6px;margin-left:4px}.sa-iconbtn{border:0;background:transparent;color:#c8b7df;width:27px;height:30px;border-radius:8px;cursor:pointer;display:grid;place-items:center;font-size:16px}.sa-iconbtn:hover{background:rgba(255,255,255,.08);color:#fff}
  .sa-body{padding:14px 13px 10px;overflow:auto;flex:1;scroll-behavior:smooth;scrollbar-width:thin;scrollbar-color:#58326d transparent}
  .sa-message{display:flex;align-items:flex-start;gap:8px;margin:0 0 12px;max-width:100%}.sa-message.user{justify-content:flex-end}.sa-miniavatar{width:25px;height:25px;flex:0 0 25px;border-radius:50%;display:grid;place-items:center;background:#211334;border:1px solid rgba(202,118,255,.3);font-size:13px}
  .sa-bubble{font-size:12px;line-height:1.6;white-space:pre-wrap;overflow-wrap:anywhere;padding:11px 12px;border-radius:4px 14px 14px 14px;max-width:calc(100% - 32px);background:linear-gradient(135deg,rgba(30,22,44,.98),rgba(17,14,25,.98));border:1px solid rgba(139,92,246,.2);color:#f4efff}
  .sa-message.user .sa-bubble{border-radius:14px 4px 14px 14px;background:linear-gradient(120deg,#8b5cf6,#b15dde 52%,#ff7a18);background-size:180% 180%;animation:sa-gradient-shift 6s ease infinite;border:0;color:white;box-shadow:0 6px 18px rgba(139,92,246,.2)}
  .sa-small{font-size:10px;color:#9c8ab8;margin:4px 0 10px 33px}
  .sa-sectionlabel{font-size:9px;font-weight:800;letter-spacing:1px;color:#e0c7ff;text-transform:uppercase;margin:15px 0 8px}
  .sa-actions{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-bottom:12px}.sa-action{display:flex;align-items:center;justify-content:center;gap:6px;min-height:34px;padding:7px 8px;border-radius:9px;text-decoration:none;text-align:center;font-size:10px;font-weight:700;line-height:1.25;color:#eee8ff;background:linear-gradient(120deg,rgba(139,92,246,.1),rgba(255,122,24,.045));border:1px solid rgba(177,93,222,.28);cursor:pointer;transition:transform .2s ease,border-color .2s ease,background .2s ease,box-shadow .2s ease}
  .sa-action.primary{grid-column:1/-1;background:linear-gradient(110deg,#8b5cf6,#b15dde 48%,#ff7a18);background-size:180% 180%;animation:sa-gradient-shift 4s ease infinite;border:0;color:white;min-height:40px;box-shadow:0 7px 22px rgba(139,92,246,.3),0 3px 16px rgba(255,122,24,.18)}.sa-action.green{border-color:rgba(255,122,24,.42);color:#ffd0aa}.sa-action.blue{border-color:rgba(139,92,246,.48);color:#e1d3ff}.sa-action.pink{border-color:rgba(255,122,24,.38);color:#ffc18e}.sa-action:hover{filter:brightness(1.16);transform:translateY(-2px);border-color:rgba(255,172,108,.72);box-shadow:0 7px 18px rgba(139,92,246,.18)}
  .sa-chips{display:flex;flex-wrap:wrap;gap:6px;margin:7px 0 13px}.sa-chip{border:1px solid rgba(139,92,246,.3);background:linear-gradient(120deg,rgba(139,92,246,.12),rgba(255,122,24,.06));border-radius:8px;padding:6px 8px;font-size:9px;color:#e3d1ff;cursor:pointer;transition:transform .2s ease,border-color .2s ease,background .2s ease}.sa-chip:hover{transform:translateY(-2px);background:linear-gradient(120deg,rgba(139,92,246,.24),rgba(255,122,24,.14));border-color:rgba(255,172,108,.55)}
  .sa-typing{display:inline-flex;gap:4px;align-items:center;padding:3px 0}.sa-typing i{width:4px;height:4px;border-radius:50%;background:#dcb6ff;animation:sa-dot 1s infinite}.sa-typing i:nth-child(2){animation-delay:.15s}.sa-typing i:nth-child(3){animation-delay:.3s}
  .sa-composer{flex-shrink:0;padding:10px 12px 12px;border-top:1px solid rgba(139,92,246,.18);background:rgba(9,7,17,.93)}.sa-inputrow{display:flex;gap:7px;align-items:center;border:1px solid rgba(139,92,246,.78);border-radius:11px;background:#100e1d;padding:4px 5px 4px 11px;box-shadow:0 0 14px rgba(139,92,246,.16);transition:border-color .2s ease,box-shadow .2s ease}.sa-inputrow:focus-within{border-color:#ff9b45;box-shadow:0 0 0 3px rgba(139,92,246,.18),0 0 24px rgba(255,122,24,.2)}
  .sa-input{width:100%;min-width:0;border:0;outline:0;background:transparent;color:#fff;font-size:12px;padding:8px 0}.sa-input::placeholder{color:#a197b3}.sa-send{border:0;border-radius:8px;width:34px;height:34px;flex-shrink:0;display:grid;place-items:center;background:linear-gradient(135deg,#8b5cf6,#b15dde 52%,#ff7a18);background-size:180% 180%;animation:sa-gradient-shift 4s ease infinite;color:white;cursor:pointer;font-size:16px;transition:transform .2s ease,filter .2s ease}.sa-send:hover{transform:translateX(2px) scale(1.05);filter:brightness(1.12)}.sa-send:disabled{opacity:.55;cursor:wait}
  .sa-footnote{font-size:9px;color:#756687;text-align:center;margin-top:7px}.sa-footnote a{color:#b5a0d5;text-decoration:none}.sa-footnote a:hover{color:#ffb86b}.sa-close-fab{position:fixed;right:var(--sa-close-right,var(--sa-launcher-right,24px));bottom:var(--sa-close-bottom,var(--sa-launcher-bottom,24px));width:44px;height:44px;display:none;place-items:center;border-radius:50%;border:1px solid rgba(255,255,255,.55);color:#fff;background:linear-gradient(135deg,#8b5cf6,#ff7a18);box-shadow:0 0 20px rgba(139,92,246,.3);font-size:22px;cursor:pointer;z-index:2147483001;transition:transform .2s ease}.sa-close-fab:hover{transform:rotate(90deg) scale(1.06)}.sa-close-fab.show{display:grid}
  @keyframes sevenart-pulse{0%,100%{box-shadow:0 0 0 4px rgba(139,92,246,.1),0 8px 35px rgba(139,92,246,.3)}50%{box-shadow:0 0 0 8px rgba(255,122,24,.04),0 8px 40px rgba(255,122,24,.32)}}
  @keyframes sa-shimmer{to{background-position:-200% 0}}
  @keyframes sa-avatar-glow{0%,100%{box-shadow:0 0 0 3px rgba(139,92,246,.12),0 0 18px rgba(139,92,246,.22)}50%{box-shadow:0 0 0 4px rgba(255,122,24,.1),0 0 22px rgba(255,122,24,.22)}}
  @keyframes sa-gradient-shift{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
  @keyframes sa-message-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  @keyframes sa-content-in{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:translateY(0)}}
  #sevenart-cat-panel.is-open .sa-message{animation:sa-message-in .35s ease both}
  #sevenart-cat-panel.is-open .sa-sectionlabel{animation:sa-content-in .42s .12s ease both}
  #sevenart-cat-panel.is-open .sa-action{animation:sa-content-in .4s .16s ease both}
  #sevenart-cat-panel.is-open .sa-chip{animation:sa-content-in .4s .24s ease both}
  @keyframes sevenart-meow{0%,8%{opacity:0;transform:translate(-100%,0) scale(.8)}18%{opacity:1;transform:translate(-100%,-5px) scale(1)}72%{opacity:.9;transform:translate(calc(-100% - 48px),-55px) scale(1)}100%{opacity:0;transform:translate(calc(-100% - 68px),-78px) scale(.94)}}
  @keyframes sevenart-rise{from{opacity:0;transform:translateY(12px) scale(.985)}to{opacity:1;transform:translateY(0) scale(1)}}@keyframes sa-dot{0%,60%,100%{transform:translateY(0);opacity:.4}30%{transform:translateY(-3px);opacity:1}}
  @media(max-width:680px){#sevenart-cat-launcher{width:56px;height:56px;border-radius:18px}}
  @media(max-width:520px){#sevenart-cat-panel{right:var(--sa-mobile-panel-right,var(--sa-panel-right,8px));bottom:var(--sa-mobile-panel-bottom,var(--sa-panel-bottom,82px));width:calc(100vw - 16px);height:min(72dvh,650px);min-height:390px;border-radius:18px}#sevenart-cat-launcher{right:var(--sa-mobile-launcher-right,var(--sa-launcher-right,15px));bottom:var(--sa-mobile-launcher-bottom,var(--sa-launcher-bottom,15px))}.sa-close-fab{right:var(--sa-mobile-close-right,var(--sa-close-right,23px));bottom:var(--sa-mobile-close-bottom,var(--sa-close-bottom,23px))}.sa-head{padding:12px}.sa-body{padding:12px 10px 8px}}
  @media(prefers-reduced-motion:reduce){#sevenart-cat-root *,#sevenart-cat-root *::before,#sevenart-cat-root *::after{animation:none!important;scroll-behavior:auto!important;transition:none!important}#sevenart-cat-launcher .sa-meow-text{opacity:0}}
  `;
  const style = document.createElement('style'); style.id = 'sevenart-cat-styles'; style.textContent = css; document.head.appendChild(style);

  const catSvg = `<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="sa-cat-grad" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff"/><stop offset="1" stop-color="#c8a5ff"/></linearGradient></defs><path d="M13 26 10 8l17 10a27 27 0 0 1 10 0L54 8l-3 19a22 22 0 1 1-38-1Z" fill="url(#sa-cat-grad)" stroke="#4a246d" stroke-width="2" stroke-linejoin="round"/><path d="m16 17 9 5M48 17l-9 5" stroke="#e59de8" stroke-width="3" stroke-linecap="round"/><ellipse cx="23" cy="32" rx="3" ry="4" fill="#251139"/><ellipse cx="41" cy="32" rx="3" ry="4" fill="#251139"/><path d="m29 40 3 2 3-2-3-3Z" fill="#e95eaa"/><path d="M32 42c-2 4-6 4-8 1m8-1c2 4 6 4 8 1" fill="none" stroke="#5a2b70" stroke-width="1.8" stroke-linecap="round"/><path d="M18 39 7 37m11 5L8 44m38-5 11-2m-11 5 10 2" stroke="#7c5995" stroke-width="1.5" stroke-linecap="round"/></svg>`;
  const catMarkup = cfg.catLogoUrl ? `<img class="sa-cat-logo" src="${escapeAttr(cfg.catLogoUrl)}" alt="" draggable="false">` : catSvg;
  const root = document.createElement('div'); root.id = 'sevenart-cat-root';
  const cssLength = (value, fallback) => { const v = String(value == null ? fallback : value).trim(); return /^-?\d+(?:\.\d+)?(?:px|rem|vh|vw|%)$/.test(v) ? v : fallback; };
  root.style.setProperty('--sa-launcher-right', cssLength(cfg.launcherRight, '24px'));
  root.style.setProperty('--sa-launcher-bottom', cssLength(cfg.launcherBottom, '24px'));
  root.style.setProperty('--sa-panel-right', cssLength(cfg.panelRight, '24px'));
  root.style.setProperty('--sa-panel-bottom', cssLength(cfg.panelBottom, '104px'));
  root.style.setProperty('--sa-mobile-launcher-right', cssLength(cfg.mobileLauncherRight, '15px'));
  root.style.setProperty('--sa-mobile-launcher-bottom', cssLength(cfg.mobileLauncherBottom, '15px'));
  root.style.setProperty('--sa-mobile-panel-right', cssLength(cfg.mobilePanelRight, '8px'));
  root.style.setProperty('--sa-mobile-panel-bottom', cssLength(cfg.mobilePanelBottom, '82px'));
  root.style.setProperty('--sa-close-right', cssLength(cfg.launcherRight, '24px'));
  root.style.setProperty('--sa-close-bottom', cssLength(cfg.launcherBottom, '24px'));
  root.style.setProperty('--sa-mobile-close-right', cssLength(cfg.mobileLauncherRight, '15px'));
  root.style.setProperty('--sa-mobile-close-bottom', cssLength(cfg.mobileLauncherBottom, '15px'));
  root.style.setProperty('--sa-logo-fit', cfg.catLogoFit === 'cover' ? 'cover' : 'contain');
  root.innerHTML = `
    <button id="sevenart-cat-launcher" aria-label="Open 7Art cat chat" title="Chat with 7Art">${catMarkup}<span class="sa-meow-text" aria-hidden="true">Meow Meow</span></button>
    <section id="sevenart-cat-panel" role="dialog" aria-label="7Art chat assistant" aria-modal="false">
      <header class="sa-head"><div class="sa-avatar">${catMarkup}</div><div class="sa-headcopy"><div class="sa-title">${escapeHtml(cfg.assistantName)} <span style="color:#e5b6ff">✦</span> <span class="sa-live">● ONLINE</span></div><div class="sa-subtitle">${escapeHtml(cfg.subtitle)}</div></div><button class="sa-iconbtn" id="sa-sound" title="Toggle cat sound" aria-label="Toggle cat sound">♫</button><button class="sa-iconbtn" id="sa-minimize" title="Minimize chat" aria-label="Minimize chat">—</button><button class="sa-iconbtn" id="sa-close" title="Close chat" aria-label="Close chat">×</button></header>
      <div class="sa-body" id="sa-body" aria-live="polite"></div>
      <div class="sa-composer"><form class="sa-inputrow" id="sa-form"><input class="sa-input" id="sa-input" maxlength="800" autocomplete="off" placeholder="Ask about growth, ads, websites..." aria-label="Your message"><button class="sa-send" type="submit" aria-label="Send message">➤</button></form><div class="sa-footnote">Powered by <a href="https://www.7artmedia.com/" target="_blank" rel="noopener">7Art Growth Systems</a></div></div>
    </section>
    <button class="sa-close-fab" id="sa-close-fab" aria-label="Close chat">×</button>
    <audio id="sa-meow-audio" preload="auto" src="${escapeAttr(cfg.meowUrl)}"></audio>`;
  document.body.appendChild(root);

  const panel = root.querySelector('#sevenart-cat-panel');
  const launcher = root.querySelector('#sevenart-cat-launcher');
  const body = root.querySelector('#sa-body');
  const input = root.querySelector('#sa-input');
  const form = root.querySelector('#sa-form');
  const audio = root.querySelector('#sa-meow-audio');
  const closeFab = root.querySelector('#sa-close-fab');
  let soundOn = true;
  const history = [];

  function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function escapeAttr(s) { return escapeHtml(s); }
  function playMeow() {
    if (!soundOn) return;
    try { audio.currentTime = 0; const p = audio.play(); if (p && p.catch) p.catch(() => {}); } catch (_) {}
  }
  function openChat() { panel.classList.add('is-open'); launcher.style.display='none'; closeFab.classList.add('show'); playMeow(); if (!body.dataset.initialized) { body.dataset.initialized='1'; renderWelcome(); } setTimeout(() => input.focus({preventScroll:true}), 80); }
  function closeChat() { panel.classList.remove('is-open'); launcher.style.display='grid'; closeFab.classList.remove('show'); }
  function scrollBottom() { body.scrollTop = body.scrollHeight; }
  function addMessage(text, who) {
    const row = document.createElement('div'); row.className = 'sa-message ' + (who === 'user' ? 'user' : 'bot');
    if (who !== 'user') { const avatar = document.createElement('div'); avatar.className='sa-miniavatar'; avatar.innerHTML=catMarkup; row.appendChild(avatar); }
    const bubble = document.createElement('div'); bubble.className='sa-bubble'; bubble.textContent=text; row.appendChild(bubble); body.appendChild(row); scrollBottom(); return row;
  }
  function sectionLabel(text) { const e=document.createElement('div');e.className='sa-sectionlabel';e.textContent=text;body.appendChild(e); }
  function action(label, href, cls, handler) { const a=document.createElement(href?'a':'button'); a.className='sa-action '+(cls||'');a.textContent=label;if(href){a.href=href;a.target='_blank';a.rel='noopener noreferrer'}else{a.type='button'}if(handler)a.addEventListener('click',handler);return a; }
  function renderWelcome() {
    addMessage('Hi! I’m '+cfg.assistantName+', 7Art’s growth assistant. 🐾\n\nI can help you explore practical ways to grow your brand with strategy, content, performance marketing and automation.\n\nWhat would you like help with today?', 'bot');
    sectionLabel('DIRECT ACTIONS');
    const actions=document.createElement('div');actions.className='sa-actions';
    actions.appendChild(action('✦ Let’s Discuss Your Growth',cfg.contactUrl,'primary'));
    actions.appendChild(action('▣ Chat on WhatsApp','https://wa.me/'+String(cfg.whatsapp).replace(/\D/g,''),'green'));
    actions.appendChild(action('↗ Request a Callback','mailto:'+cfg.email+'?subject='+encodeURIComponent('Request a callback - 7Art'),'blue'));
    actions.appendChild(action('▤ Book a Consultation',cfg.contactUrl,'pink'));
    actions.appendChild(action('✧ Get a Custom Quote',cfg.contactUrl,'pink'));
    body.appendChild(actions);
    sectionLabel('EXPLORE 7ART SERVICES');
    const chips=document.createElement('div');chips.className='sa-chips';
    ['Growth Strategy','Website Development','Performance Marketing','Content & Branding','Marketing Automation','SEO & Visibility'].forEach(t=>{const b=document.createElement('button');b.className='sa-chip';b.type='button';b.textContent=t;b.addEventListener('click',()=>sendMessage(t));chips.appendChild(b)});
    body.appendChild(chips); scrollBottom();
  }
  const serviceDetails = {
    'growth strategy':'Growth Strategy helps clarify your positioning, target audience, offer and go-to-market plan. Tell me your business type and main growth goal, and I’ll help you identify a useful next step.',
    'website':'7Art can help with conversion-focused websites, Shopify and eCommerce experiences, landing pages and web development. Are you building a new site or improving an existing one?',
    'performance marketing':'Performance Marketing can include Meta Ads, Google Ads, creative testing, retargeting, landing-page improvements and campaign reporting. What are you promoting, and what outcome matters most: leads, sales or awareness?',
    'content':'The Content & Branding system can cover ad creatives, social content, video scripts, landing-page copy, email content and campaign concepts aligned to your brand voice. What kind of audience are you trying to reach?',
    'automation':'Marketing Automation & Reporting can connect lead tracking, follow-ups, reporting and repeatable workflows. Which process is taking too much time right now?',
    'seo':'SEO & visibility work can include search strategy, technical improvements, useful content and local visibility. What website or business should we look at?'
  };
  function localReply(text) {
    const m=text.toLowerCase();
    if (/\b(hi|hello|hey|hii|namaste)\b/.test(m)) return 'Hey there! 😺 Welcome to 7Art. We help brands connect strategy, creative, paid growth and automation. What are you hoping to improve first?';
    for(const k of Object.keys(serviceDetails)) if(m.includes(k)) return serviceDetails[k];
    if(/price|pricing|cost|quote|budget/.test(m)) return 'Pricing depends on your scope, channels and growth goals. Share your website, what you need help with and an approximate budget, and the 7Art team can suggest a suitable scope. You can also use “Get a Custom Quote” or email '+cfg.email+'.';
    if(/contact|call|whatsapp|human|team|consult/.test(m)) return 'Of course! You can reach the 7Art team at +91 87967 2031, email '+cfg.email+', or message on WhatsApp using the button below.';
    if(/who are you|what can you do|services|help/.test(m)) return 'I’m '+cfg.assistantName+', the 7Art chat assistant. I can help you explore Growth Strategy, Performance Marketing, Website Development, Content & Branding, SEO and Marketing Automation. Which one should we start with?';
    return 'Thanks for sharing that. To point you in the right direction, could you tell me a little more about your business and the result you want—more qualified leads, more online sales, stronger brand awareness, or a better website?';
  }
  async function getReply(text) {
    if (cfg.apiEndpoint) {
      try {
        const res=await fetch(cfg.apiEndpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:text,history:history.slice(-12)})});
        if(!res.ok) throw new Error('API '+res.status);
        const data=await res.json(); if(data && typeof data.reply==='string' && data.reply.trim()) return data.reply.trim();
      } catch(e) { console.warn('[7Art chatbot] API unavailable; using local fallback.',e); }
    }
    return localReply(text);
  }
  async function sendMessage(raw) {
    const text=String(raw||'').trim(); if(!text) return;
    addMessage(text,'user'); history.push({role:'user',content:text}); input.value='';
    const typing=addMessage('','bot'); typing.querySelector('.sa-bubble').innerHTML='<span class="sa-typing" aria-label="Typing"><i></i><i></i><i></i></span>';
    const reply=await getReply(text); typing.querySelector('.sa-bubble').textContent=reply; history.push({role:'assistant',content:reply}); scrollBottom();
    if (/contact|call|whatsapp|team|quote|price|pricing/.test(text.toLowerCase())) {
      const actions=document.createElement('div');actions.className='sa-actions';actions.appendChild(action('Chat on WhatsApp','https://wa.me/'+String(cfg.whatsapp).replace(/\D/g,''),'green'));actions.appendChild(action('Contact 7Art',cfg.contactUrl,'primary'));body.appendChild(actions);scrollBottom();
    }
  }
  launcher.addEventListener('click',openChat); closeFab.addEventListener('click',closeChat);
  root.querySelector('#sa-close').addEventListener('click',closeChat);root.querySelector('#sa-minimize').addEventListener('click',closeChat);
  root.querySelector('#sa-sound').addEventListener('click',()=>{soundOn=!soundOn;root.querySelector('#sa-sound').textContent=soundOn?'♫':'♪';root.querySelector('#sa-sound').title=soundOn?'Cat sound on':'Cat sound off';if(soundOn)playMeow()});
  form.addEventListener('submit',e=>{e.preventDefault();sendMessage(input.value)});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&panel.classList.contains('is-open'))closeChat()});
  if(cfg.startOpen) openChat();
})();
