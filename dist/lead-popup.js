(function () {
  "use strict";

  var COOKIE_NAME = "sevenart_lead_popup_dismissed";
  var STORAGE_KEY = "sevenart_lead_popup_dismissed";
  var OFFER_DEADLINE_KEY = "sevenart_lead_offer_deadline";
  var OFFER_CYCLE_MS = 24 * 60 * 60 * 1000;
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

  function startOfferCountdown(overlay) {
    var hours = overlay.querySelector("[data-countdown-hours]");
    var minutes = overlay.querySelector("[data-countdown-minutes]");
    var seconds = overlay.querySelector("[data-countdown-seconds]");
    if (!hours || !minutes || !seconds) return function () {};

    var deadline;
    try {
      var storedDeadline = Number(window.localStorage.getItem(OFFER_DEADLINE_KEY));
      deadline = Number.isFinite(storedDeadline) && storedDeadline > Date.now()
        ? storedDeadline
        : Date.now() + OFFER_CYCLE_MS;
      window.localStorage.setItem(OFFER_DEADLINE_KEY, String(deadline));
    } catch (error) {
      deadline = Date.now() + OFFER_CYCLE_MS;
    }

    function updateCountdown() {
      var now = Date.now();
      if (now >= deadline) {
        deadline += (Math.floor((now - deadline) / OFFER_CYCLE_MS) + 1) * OFFER_CYCLE_MS;
        try {
          window.localStorage.setItem(OFFER_DEADLINE_KEY, String(deadline));
        } catch (error) {
          // Keep the countdown running for this page view when storage is unavailable.
        }
      }

      var remainingSeconds = Math.ceil((deadline - now) / 1000);
      var remainingHours = Math.floor(remainingSeconds / 3600);
      var remainingMinutes = Math.floor((remainingSeconds % 3600) / 60);
      var remainingRemainder = remainingSeconds % 60;
      hours.textContent = String(remainingHours).padStart(2, "0");
      minutes.textContent = String(remainingMinutes).padStart(2, "0");
      seconds.textContent = String(remainingRemainder).padStart(2, "0");
    }

    updateCountdown();
    var interval = window.setInterval(updateCountdown, 1000);
    return function () {
      window.clearInterval(interval);
    };
  }

  function createPopup() {
    var overlay = document.createElement("div");
    overlay.className = "sevenart-lead-overlay";
    overlay.setAttribute("aria-hidden", "true");
    overlay.innerHTML = [
      '<div class="sevenart-lead-shell">',
      '  <div class="sevenart-lead-countdown" role="timer" aria-label="Offer timer refreshes every 24 hours">',
      '    <span class="sevenart-lead-countdown-heading"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="13" r="8"></circle><path d="M12 9v4l2.5 1.5M8 2 5.5 4M16 2l2.5 2M4 13H2M22 13h-2"></path></svg><span class="sevenart-lead-countdown-label">Limited Time Offer</span></span>',
      '    <span class="sevenart-lead-countdown-units"><span class="sevenart-lead-countdown-unit"><strong data-countdown-hours>24</strong><small>HRS</small></span><i>:</i><span class="sevenart-lead-countdown-unit"><strong data-countdown-minutes>00</strong><small>MIN</small></span><i>:</i><span class="sevenart-lead-countdown-unit"><strong data-countdown-seconds>00</strong><small>SEC</small></span></span>',
      '  </div>',
      '  <section class="sevenart-lead-modal" role="dialog" aria-modal="true" aria-labelledby="sevenartLeadTitle" aria-describedby="sevenartLeadDescription">',
      '  <button class="sevenart-lead-close" type="button" aria-label="Skip and close form">',
      '    <svg width="19" height="19" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
      '  </button>',
      '  <div class="sevenart-lead-grid">',
      '    <div class="sevenart-lead-image-placeholder"><img src="' + getAssetUrl("assets/lead-popup-campaign.png") + '" alt="Scale your D2C brand faster with 30% off a full package, including ads, web development, social media management, and analytics."></div>',
      '    <div class="sevenart-lead-form-wrap">',
      '      <div class="sevenart-lead-form-kicker">Let’s make it happen</div>',
      '      <h3 class="sevenart-lead-form-heading" id="sevenartLeadTitle">Fill the form &amp; get <span>30% OFF</span></h3>',
      '      <p class="sevenart-lead-form-copy" id="sevenartLeadDescription">Tell us a little about your project and we’ll be in touch with the best next steps.</p>',
      '      <form class="sevenart-lead-form" action="https://api.web3forms.com/submit" method="POST">',
      '        <input type="hidden" name="access_key" value="' + WEB3FORMS_ACCESS_KEY + '">',
      '        <input type="hidden" name="subject" value="New 7Art Popup Enquiry">',
      '        <input type="hidden" name="from_name" value="7Art Website Popup">',
      '        <input type="hidden" name="source" value="Session Popup Form">',
      '        <input type="checkbox" name="botcheck" tabindex="-1" autocomplete="off" style="display:none">',
      '        <label class="sevenart-lead-field"><span class="sevenart-lead-field-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.5"></circle><path d="M5 20c.5-3.5 2.8-5.3 7-5.3s6.5 1.8 7 5.3"></path></svg></span><input class="sevenart-lead-input" type="text" name="name" placeholder="Full name *" aria-label="Full name" autocomplete="name" required></label>',
      '        <label class="sevenart-lead-field"><span class="sevenart-lead-field-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="3.5" y="5.5" width="17" height="13" rx="2"></rect><path d="m4.5 7 7.5 6 7.5-6"></path></svg></span><input class="sevenart-lead-input" type="email" name="email" placeholder="Email address *" aria-label="Email address" autocomplete="email" required></label>',
      '        <label class="sevenart-lead-field"><span class="sevenart-lead-field-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 3.8 4.8 5c-.9.5-1.3 1.6-.9 2.6 2.2 5.3 6.2 9.3 11.5 11.5 1 .4 2.1 0 2.6-.9l1.2-2.2-4.1-2.1-1.4 1.8a15 15 0 0 1-5.5-5.5L10 8 7.9 3.9Z"></path></svg></span><input class="sevenart-lead-input" type="tel" name="phone" placeholder="Phone number *" aria-label="Phone number" autocomplete="tel" required></label>',
      '        <label class="sevenart-lead-field"><span class="sevenart-lead-field-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="4" y="7" width="16" height="13" rx="2"></rect><path d="M9 7V4h6v3M8 12h8M8 16h5"></path></svg></span><select class="sevenart-lead-input" name="service" aria-label="Select service interested in" required><option value="" disabled selected>Select service interested in *</option><option>Paid Media &amp; Performance Marketing</option><option>Branding &amp; Creative</option><option>Website Development</option><option>SEO</option><option>Social Media Marketing</option><option>Email Marketing</option><option>Other</option></select></label>',
      '        <label class="sevenart-lead-field sevenart-lead-message-field"><span class="sevenart-lead-field-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 5.5h16v11H9l-5 3v-14Z"></path><path d="M8 9h8M8 13h5"></path></svg></span><textarea class="sevenart-lead-input" name="message" placeholder="Tell us about your project (optional)" aria-label="Tell us about your project (optional)"></textarea></label>',
      '        <button class="sevenart-lead-submit" type="submit"><span class="sevenart-lead-submit-text">Claim My 30% Discount</span><span class="sevenart-lead-submit-arrow" aria-hidden="true">&rarr;</span></button>',
      '        <p class="sevenart-lead-status" role="status" aria-live="polite"></p>',
      '        <p class="sevenart-lead-privacy"><span aria-hidden="true">▣</span> Your information is private. We never spam.</p>',
      '        <button class="sevenart-lead-skip" type="button">Maybe later</button>',
      '      </form>',
      '    </div>',
      '  </div>',
      '  </section>',
      '</div>'
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
    var shell = overlay.querySelector(".sevenart-lead-shell");
    var form = overlay.querySelector(".sevenart-lead-form");
    var closeButton = overlay.querySelector(".sevenart-lead-close");
    var skipButton = overlay.querySelector(".sevenart-lead-skip");
    var firstInput = overlay.querySelector("input[name='name']");
    var submitButton = overlay.querySelector(".sevenart-lead-submit");
    var submitText = overlay.querySelector(".sevenart-lead-submit-text");
    var status = overlay.querySelector(".sevenart-lead-status");
    var stopOfferCountdown = startOfferCountdown(overlay);
    var desktopSizingQuery = window.matchMedia("(min-width: 1001px)");
    var previouslyFocused = null;
    var isOpen = false;

    function updateDesktopModalSize() {
      if (!desktopSizingQuery.matches) {
        shell.style.removeProperty("--sevenart-desktop-popup-width");
        return;
      }

      var viewportWidth = document.documentElement.clientWidth;
      var viewportHeight = window.innerHeight;
      var targetWidth = Math.sqrt(0.3 * viewportWidth * viewportHeight * 1.5);
      var maxWidth = Math.min(viewportWidth - 32, 680, (viewportHeight - 32) * 1.5);
      shell.style.setProperty("--sevenart-desktop-popup-width", Math.min(targetWidth, maxWidth) + "px");
    }

    updateDesktopModalSize();
    window.addEventListener("resize", updateDesktopModalSize);

    function openPopup() {
      if (isOpen) return;
      isOpen = true;
      previouslyFocused = document.activeElement;
      document.documentElement.classList.add("sevenart-popup-lock");
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
      stopOfferCountdown();
      window.removeEventListener("resize", updateDesktopModalSize);
      document.documentElement.classList.remove("sevenart-popup-lock");
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
        submitText.textContent = "Claim My 30% Discount";
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
