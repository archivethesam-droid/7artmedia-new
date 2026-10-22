(function () {
  "use strict";

  var COOKIE_NAME = "sevenart_lead_popup_dismissed";
  var STORAGE_KEY = "sevenart_lead_popup_dismissed";
  var SHOW_DELAY_MS = 1100;
  var WEB3FORMS_ACCESS_KEY = "ddfa391e-7786-4d94-a9ec-f165e14144f0";

  function getQueryMode() {
    try {
      var value = new URLSearchParams(window.location.search).get("popup");
      return value ? value.toLowerCase() : "";
    } catch (error) {
      return "";
    }
  }

  function readSessionCookie() {
    try {
      return document.cookie.split(";").some(function (item) {
        return item.trim().indexOf(COOKIE_NAME + "=") === 0;
      });
    } catch (error) {
      return false;
    }
  }

  function writeSessionCookie() {
    try {
      if (window.location.protocol === "http:" || window.location.protocol === "https:") {
        document.cookie = COOKIE_NAME + "=1; path=/; SameSite=Lax";
      }
    } catch (error) {
      // sessionStorage below remains available for local file testing
    }
  }

  function clearSessionCookie() {
    try {
      document.cookie = COOKIE_NAME + "=; path=/; Max-Age=0; SameSite=Lax";
    } catch (error) {
      // Ignore cookie errors on file:// URLs.
    }
  }

  function readSessionStorage() {
    try {
      return window.sessionStorage.getItem(STORAGE_KEY) === "1";
    } catch (error) {
      return false;
    }
  }

  function writeSessionStorage() {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, "1");
    } catch (error) {
      // Storage can be unavailable in strict privacy modes.
    }
  }

  function clearSessionStorage() {
    try {
      window.sessionStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      // Ignore storage errors.
    }
  }

  function hasBeenDismissed() {
    return readSessionCookie() || readSessionStorage();
  }

  function markDismissed() {
    writeSessionCookie();
    writeSessionStorage();
  }

  function resetDismissedState() {
    clearSessionCookie();
    clearSessionStorage();
  }

  function getBaseUrl() {
    var currentScript = document.currentScript;
    if (currentScript && currentScript.src) {
      return new URL("./", currentScript.src);
    }
    return new URL("./", window.location.href);
  }

  function getAssetUrl(filename) {
    return new URL(filename, getBaseUrl()).href;
  }

  function createPopup() {
    var overlay = document.createElement("div");
    overlay.className = "sevenart-lead-overlay";
    overlay.setAttribute("aria-hidden", "true");
    overlay.innerHTML = [
      '<section class="sevenart-lead-modal" role="dialog" aria-modal="true" aria-labelledby="sevenartLeadTitle" aria-describedby="sevenartLeadDescription">',
      '  <button class="sevenart-lead-close" type="button" aria-label="Skip and close form">',
      '    <svg width="19" height="19" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
      '  </button>',
      '  <div class="sevenart-lead-grid">',
      '    <div class="sevenart-lead-intro">',
      '      <div>',
      '        <a class="sevenart-lead-brand" href="' + getAssetUrl("index.html") + '" aria-label="7Art home"><img src="' + getAssetUrl("7Art.png") + '" alt="7Art"></a>',
      '        <a class="sevenart-lead-kicker">Free Growth Audit</a>',
      '        <h2 class="sevenart-lead-title" id="sevenartLeadTitle">Ready to unlock <span>your next growth stage?</span></h2>',
      '        <p class="sevenart-lead-copy" id="sevenartLeadDescription">Share a few details and our growth team will identify the clearest next move for your brand.</p>',
      '        <div class="sevenart-lead-points" aria-label="Benefits">',
      '          <div class="sevenart-lead-point">Actionable growth direction</div>',
      '          <div class="sevenart-lead-point">No generic sales pitch</div>',
      '          <div class="sevenart-lead-point">Reply within one business day</div>',
      '        </div>',
      '      </div>',
      '      <p class="sevenart-lead-note">Your information stays private and is used only to respond to this enquiry.</p>',
      '    </div>',
      '    <div class="sevenart-lead-form-wrap">',
      '      <h3 class="sevenart-lead-form-heading">Tell us about your brand</h3>',
      '      <p class="sevenart-lead-form-copy">Complete the form to start your free audit.</p>',
      '      <form class="sevenart-lead-form" action="https://api.web3forms.com/submit" method="POST">',
      '        <input type="hidden" name="access_key" value="' + WEB3FORMS_ACCESS_KEY + '">',
      '        <input type="hidden" name="subject" value="New 7Art Popup Enquiry">',
      '        <input type="hidden" name="from_name" value="7Art Website Popup">',
      '        <input type="hidden" name="source" value="Session Popup Form">',
      '        <input type="checkbox" name="botcheck" tabindex="-1" autocomplete="off" style="display:none">',
      '        <div class="sevenart-lead-row">',
      '          <input class="sevenart-lead-input" type="text" name="name" placeholder="Your name" aria-label="Your name" autocomplete="name" required>',
      '          <input class="sevenart-lead-input" type="text" name="company" placeholder="Company / brand" aria-label="Company or brand" autocomplete="organization">',
      '        </div>',
      '        <input class="sevenart-lead-input" type="email" name="email" placeholder="Work email" aria-label="Work email" autocomplete="email" required>',
      '        <input class="sevenart-lead-input" type="tel" name="phone" placeholder="Phone / WhatsApp number" aria-label="Phone or WhatsApp number" autocomplete="tel" required>',
      '        <textarea class="sevenart-lead-input" name="message" placeholder="What growth challenge are you facing?" aria-label="Growth challenge" required></textarea>',
      '        <button class="sevenart-lead-submit" type="submit"><span class="sevenart-lead-submit-text">Get Your Free Audit</span><span class="sevenart-lead-submit-arrow" aria-hidden="true">&rarr;</span></button>',
      '        <p class="sevenart-lead-status" role="status" aria-live="polite"></p>',
      '        <button class="sevenart-lead-skip" type="button">Skip for now</button>',
      '      </form>',
      '    </div>',
      '  </div>',
      '</section>'
    ].join("");

    document.body.appendChild(overlay);
    return overlay;
  }

  function init() {
    var queryMode = getQueryMode();
    var forceOpen = queryMode === "1" || queryMode === "show" || queryMode === "reset";

    if (queryMode === "reset") {
      resetDismissedState();
    }

    if (document.querySelector(".sevenart-lead-overlay")) return;
    if (!forceOpen && hasBeenDismissed()) return;

    var overlay = createPopup();
    var modal = overlay.querySelector(".sevenart-lead-modal");
    var form = overlay.querySelector(".sevenart-lead-form");
    var closeButton = overlay.querySelector(".sevenart-lead-close");
    var skipButton = overlay.querySelector(".sevenart-lead-skip");
    var firstInput = overlay.querySelector("input[name='name']");
    var submitButton = overlay.querySelector(".sevenart-lead-submit");
    var submitText = overlay.querySelector(".sevenart-lead-submit-text");
    var status = overlay.querySelector(".sevenart-lead-status");
    var previouslyFocused = null;
    var isOpen = false;

    function openPopup() {
      if (isOpen) return;
      isOpen = true;
      previouslyFocused = document.activeElement;
      document.body.classList.add("sevenart-popup-lock");
      overlay.setAttribute("aria-hidden", "false");
      window.requestAnimationFrame(function () {
        overlay.classList.add("is-open");
      });
      window.setTimeout(function () {
        if (firstInput) {
          try {
            firstInput.focus({ preventScroll: true });
          } catch (error) {
            firstInput.focus();
          }
        }
      }, 360);
    }

    function closePopup() {
      if (!isOpen) return;
      markDismissed();
      isOpen = false;
      overlay.classList.remove("is-open");
      overlay.setAttribute("aria-hidden", "true");
      document.body.classList.remove("sevenart-popup-lock");
      if (previouslyFocused && typeof previouslyFocused.focus === "function") {
        try {
          previouslyFocused.focus({ preventScroll: true });
        } catch (error) {
          previouslyFocused.focus();
        }
      }
      window.setTimeout(function () {
        overlay.remove();
      }, 320);
    }

    function handleKeydown(event) {
      if (!isOpen) return;
      if (event.key === "Escape") {
        event.preventDefault();
        closePopup();
        return;
      }
      if (event.key !== "Tab") return;

      var focusable = modal.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])');
      if (!focusable.length) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    closeButton.addEventListener("click", closePopup);
    skipButton.addEventListener("click", closePopup);
    overlay.addEventListener("click", function (event) {
      if (event.target === overlay) closePopup();
    });
    document.addEventListener("keydown", handleKeydown);

    form.addEventListener("submit", async function (event) {
      event.preventDefault();
      status.textContent = "";
      status.classList.remove("is-success");
      submitButton.disabled = true;
      submitText.textContent = "Sending...";

      try {
        var response = await fetch(form.action, {
          method: "POST",
          body: new FormData(form),
          headers: { Accept: "application/json" }
        });
        var result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error((result && result.message) || "Submission failed");
        }

        markDismissed();
        status.textContent = "Thank you. Your request has been received.";
        status.classList.add("is-success");
        submitText.textContent = "Request received";
        window.setTimeout(function () {
          window.location.href = getAssetUrl("thank-you.html");
        }, 650);
      } catch (error) {
        status.textContent = "We could not send the form. Please try again or contact us on WhatsApp.";
        submitButton.disabled = false;
        submitText.textContent = "Get my free audit";
      }
    });

    window.setTimeout(openPopup, SHOW_DELAY_MS);
  }

  window.SevenArtLeadPopup = {
    reset: resetDismissedState
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
