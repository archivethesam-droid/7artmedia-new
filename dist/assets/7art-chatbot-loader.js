(() => {
  const scriptUrl = document.currentScript.src;
  const assetUrl = (file) => new URL(file, scriptUrl).href;
  let hasFloatingContacts = document.querySelector('.floating-contact, .contact-float') !== null;
  if (!hasFloatingContacts) {
    const contacts = document.createElement('aside');
    contacts.className = 'floating-contact';
    contacts.setAttribute('aria-label', 'Quick contact buttons');
    contacts.innerHTML = `
      <a class="floating-btn floating-whatsapp" href="https://wa.me/918796742031?text=Hi%207Art%2C%20I%20would%20like%20to%20discuss%20a%20project." target="_blank" rel="noopener noreferrer" aria-label="Message 7Art on WhatsApp">
        <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16.04 3C8.87 3 3.04 8.78 3.04 15.9c0 2.27.6 4.48 1.75 6.42L3 29l6.85-1.78a13.05 13.05 0 0 0 6.18 1.56h.01c7.17 0 13-5.79 13-12.9C29.04 8.78 23.21 3 16.04 3Zm0 23.6h-.01c-1.85 0-3.67-.5-5.25-1.44l-.38-.23-4.06 1.05 1.08-3.94-.25-.4a10.65 10.65 0 0 1-1.63-5.75c0-5.91 4.84-10.72 10.8-10.72 2.88 0 5.6 1.12 7.64 3.15a10.62 10.62 0 0 1 3.16 7.56c0 5.91-4.85 10.72-10.8 10.72Zm5.92-8.03c-.32-.16-1.9-.94-2.2-1.04-.3-.11-.52-.16-.74.16-.22.32-.85 1.04-1.04 1.26-.19.21-.38.24-.7.08-.32-.16-1.36-.5-2.6-1.6-.96-.86-1.61-1.92-1.8-2.24-.19-.32-.02-.5.14-.66.14-.14.32-.38.49-.57.16-.19.22-.32.32-.54.11-.21.05-.4-.03-.56-.08-.16-.74-1.78-1.01-2.43-.27-.64-.54-.55-.74-.56h-.63c-.22 0-.56.08-.86.4-.3.32-1.13 1.1-1.13 2.68s1.16 3.12 1.32 3.33c.16.21 2.28 3.46 5.52 4.85.77.33 1.38.53 1.85.68.78.25 1.49.21 2.05.13.63-.09 1.9-.77 2.17-1.52.27-.75.27-1.39.19-1.52-.08-.13-.3-.21-.62-.37Z"/></svg>
      </a>
      <a class="floating-btn floating-email" href="mailto:7artsupportofficial@gmail.com" aria-label="Email 7Art">
        <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M5.33 7.33h21.34c1.28 0 2.33 1.05 2.33 2.34v12.66a2.34 2.34 0 0 1-2.33 2.34H5.33A2.34 2.34 0 0 1 3 22.33V9.67a2.34 2.34 0 0 1 2.33-2.34Zm.27 3.15v11.55h20.8V10.48L16 17.58l-10.4-7.1Zm1.8-.82 8.6 5.87 8.6-5.87H7.4Z"/></svg>
      </a>`;
    document.body.append(contacts);
    hasFloatingContacts = true;
  }
  const contactStyle = document.createElement('style');
  contactStyle.textContent = `
    .floating-contact,
    .contact-float {
      position: fixed !important;
      right: 24px !important;
      bottom: calc(24px + 64px + 12px) !important;
      gap: 12px !important;
      z-index: 2147482999 !important;
    }
    .floating-contact {
      display: grid !important;
    }
    .floating-contact .floating-btn {
      display: grid !important;
      place-items: center !important;
      border: 1px solid rgba(255,255,255,.18) !important;
      box-shadow: 0 18px 42px rgba(0,0,0,.42) !important;
      text-decoration: none !important;
    }
    .floating-contact .floating-btn svg {
      width: 29px !important;
      height: 29px !important;
      fill: #fff !important;
    }
    .floating-contact .floating-whatsapp {
      background: linear-gradient(135deg,#25d366,#128c7e) !important;
    }
    .floating-contact .floating-email {
      background: linear-gradient(135deg,#8b5cf6,#b15dde 50%,#ff7a18) !important;
    }
    .floating-contact .floating-btn,
    .contact-float .contact-float__button {
      width: 64px !important;
      height: 64px !important;
      min-width: 64px !important;
      border-radius: 20px !important;
    }
    @media (max-width: 680px) {
      .floating-contact,
      .contact-float {
        right: 24px !important;
        bottom: calc(24px + 56px + 10px) !important;
        gap: 10px !important;
      }
      .floating-contact .floating-btn,
      .contact-float .contact-float__button {
        width: 56px !important;
        height: 56px !important;
        min-width: 56px !important;
        border-radius: 18px !important;
      }
      .floating-contact .floating-btn svg {
        width: 26px !important;
        height: 26px !important;
      }
    }
  `;
  document.head.append(contactStyle);

  window.SevenArtCatChatbotConfig = {
    brand: '7Art',
    assistantName: 'Milo',
    subtitle: '7Art Growth Assistant · Always Active',
    whatsapp: '918796742031',
    email: '7artsupportofficial@gmail.com',
    contactUrl: 'https://www.7artmedia.com/#contact',
    apiEndpoint: '',
    meowUrl: assetUrl('meow-clean.mp3'),
    catLogoUrl: assetUrl('cat-logo.jpg'),
    catLogoFit: 'cover',
    launcherRight: '24px',
    launcherBottom: '24px',
    panelRight: '24px',
    panelBottom: '104px',
    mobileLauncherRight: hasFloatingContacts ? '24px' : '15px',
    mobileLauncherBottom: '24px',
    mobilePanelRight: '8px',
    mobilePanelBottom: '82px',
    startOpen: false
  };

  const chatbotScript = document.createElement('script');
  chatbotScript.src = `${assetUrl('7art-cat-chatbot.js')}?v=5`;
  document.head.append(chatbotScript);
})();
