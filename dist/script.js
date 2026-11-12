const menuBtn = document.getElementById("menuBtn");
const navLinks = document.getElementById("navLinks");

if (menuBtn && navLinks) {
  menuBtn.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      menuBtn.setAttribute("aria-expanded", "false");
    });
  });
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.14 });

document.querySelectorAll(".reveal").forEach((el, index) => {
  el.style.transitionDelay = `${Math.min(index % 5, 4) * 65}ms`;
  observer.observe(el);
});

document.querySelectorAll(".faq-question").forEach((button) => {
  button.addEventListener("click", () => {
    const item = button.closest(".faq-item");
    item.classList.toggle("active");
  });
});

const trainTrack = document.querySelector(".express-wrap");
if (trainTrack && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  let audioContext;
  let trainVisible = false;
  let hornPlayed = false;
  let rollingSound;

  const playHorn = () => {
    if (!audioContext || audioContext.state !== "running" || hornPlayed) return;
    hornPlayed = true;
    const now = audioContext.currentTime;
    [392, 494].forEach((frequency) => {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = "triangle";
      oscillator.frequency.setValueAtTime(frequency, now);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.045, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.78);
      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start(now);
      oscillator.stop(now + 0.8);
    });
  };

  const startRollingSound = () => {
    if (!audioContext || audioContext.state !== "running" || rollingSound || document.hidden) return;
    const buffer = audioContext.createBuffer(1, audioContext.sampleRate, audioContext.sampleRate);
    const samples = buffer.getChannelData(0);
    for (let index = 0; index < samples.length; index += 1) {
      samples[index] = (Math.random() * 2 - 1) * 0.18;
    }

    const noise = audioContext.createBufferSource();
    const lowPass = audioContext.createBiquadFilter();
    const noiseGain = audioContext.createGain();
    const rumble = audioContext.createOscillator();
    const rumbleGain = audioContext.createGain();
    noise.buffer = buffer;
    noise.loop = true;
    lowPass.type = "lowpass";
    lowPass.frequency.value = 190;
    noiseGain.gain.value = 0.16;
    rumble.type = "triangle";
    rumble.frequency.value = 58;
    rumbleGain.gain.value = 0.008;
    noise.connect(lowPass);
    lowPass.connect(noiseGain);
    noiseGain.connect(audioContext.destination);
    rumble.connect(rumbleGain);
    rumbleGain.connect(audioContext.destination);
    noise.start();
    rumble.start();
    rollingSound = { noise, noiseGain, rumble, rumbleGain };
  };

  const stopRollingSound = () => {
    if (!rollingSound || !audioContext) return;
    const now = audioContext.currentTime;
    rollingSound.noiseGain.gain.setTargetAtTime(0.0001, now, 0.04);
    rollingSound.rumbleGain.gain.setTargetAtTime(0.0001, now, 0.04);
    rollingSound.noise.stop(now + 0.2);
    rollingSound.rumble.stop(now + 0.2);
    rollingSound = undefined;
  };

  const startTrainSound = () => {
    playHorn();
    startRollingSound();
  };

  const unlockAudio = () => {
    if (!AudioContextClass) return;
    audioContext ||= new AudioContextClass();
    if (audioContext.state === "suspended") {
      audioContext.resume().then(() => {
        if (trainVisible) startTrainSound();
      }).catch((error) => {
        console.warn("Train audio could not start.", error);
      });
    } else if (trainVisible) {
      startTrainSound();
    }
  };

  document.addEventListener("pointerdown", unlockAudio, { passive: true });
  document.addEventListener("keydown", unlockAudio);

  const trainAudioObserver = new IntersectionObserver(([entry]) => {
    trainVisible = entry.isIntersecting;
    if (trainVisible) {
      startTrainSound();
    } else {
      stopRollingSound();
      hornPlayed = false;
    }
  }, { threshold: 0.18 });

  trainAudioObserver.observe(trainTrack);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopRollingSound();
    } else if (trainVisible) {
      startTrainSound();
    }
  });
}


document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (event) => {
    const target = document.querySelector(anchor.getAttribute("href"));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});


const contactForm = document.querySelector(".contact-form");
if (contactForm) {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(contactForm);

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        window.location.href = "thank-you.html";
      } else {
        alert("Form submission failed.");
      }
    } catch (err) {
      alert("Form submission failed.");
    }
  });
}
