// Birthday site settings: edit these values for Saswatha, the date, and the surprise.
const TARGET_DATE = "2026-08-14T00:00:00+05:30";
const PARTICLE_COUNT = 64;

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const skyScene = document.querySelector(".sky-scene");
const balloonLayer = document.querySelector(".balloon-layer");
const birthdayGate = document.querySelector("#birthday-gate");
const gateNote = document.querySelector("#gate-note");
const surpriseButton = document.querySelector("#surprise-button");
const surpriseMessage = document.querySelector("#surprise-message");
const countdownNote = document.querySelector("#countdown-note");
const countdownParts = {
  days: document.querySelector("#days"),
  hours: document.querySelector("#hours"),
  minutes: document.querySelector("#minutes"),
  seconds: document.querySelector("#seconds")
};
const gateCountdownParts = {
  days: document.querySelector("#gate-days"),
  hours: document.querySelector("#gate-hours"),
  minutes: document.querySelector("#gate-minutes"),
  seconds: document.querySelector("#gate-seconds")
};
let birthdayGateCelebrated = false;

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function padTime(value) {
  return String(value).padStart(2, "0");
}

function getTimeRemaining() {
  const targetTime = new Date(TARGET_DATE).getTime();
  const remaining = targetTime - Date.now();

  if (!Number.isFinite(targetTime) || remaining <= 0) {
    return {
      isUnlocked: true,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0
    };
  }

  const totalSeconds = Math.floor(remaining / 1000);

  return {
    isUnlocked: false,
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60
  };
}

function renderCountdown(parts, time) {
  if (!parts.days || !parts.hours || !parts.minutes || !parts.seconds) return;

  parts.days.textContent = padTime(time.days);
  parts.hours.textContent = padTime(time.hours);
  parts.minutes.textContent = padTime(time.minutes);
  parts.seconds.textContent = padTime(time.seconds);
}

function createSkyParticles() {
  if (!skyScene) return;

  for (let index = 0; index < PARTICLE_COUNT; index += 1) {
    const particle = document.createElement("span");
    const isHeart = index % 5 === 0;

    particle.className = `particle ${isHeart ? "heart" : "star"}`;
    particle.style.setProperty("--x", `${randomBetween(1, 99)}%`);
    particle.style.setProperty("--y", `${randomBetween(3, 96)}%`);
    particle.style.setProperty("--opacity", randomBetween(0.28, 0.86).toFixed(2));
    particle.style.setProperty("--duration", `${randomBetween(5, 13).toFixed(2)}s`);
    particle.style.setProperty("--delay", `${randomBetween(-8, 0).toFixed(2)}s`);
    particle.style.setProperty("--move-x", `${randomBetween(-28, 28).toFixed(1)}px`);
    particle.style.setProperty("--move-y", `${randomBetween(-36, 36).toFixed(1)}px`);
    particle.style.setProperty("--rotate", `${randomBetween(-18, 18).toFixed(1)}deg`);
    particle.style.setProperty("--size", isHeart ? `${randomBetween(0.65, 1.4).toFixed(2)}rem` : `${randomBetween(2, 4).toFixed(1)}px`);
    particle.style.setProperty("--heart-color", Math.random() > 0.5 ? "#ff9ccf" : "#8fcfff");

    if (isHeart) particle.textContent = "\u2665";
    skyScene.appendChild(particle);
  }
}

function setupRevealAnimations() {
  const revealItems = document.querySelectorAll(".reveal");

  if (!("IntersectionObserver" in window) || prefersReducedMotion) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 }
  );

  revealItems.forEach((item) => observer.observe(item));
}

function updateCountdown() {
  const time = getTimeRemaining();

  renderCountdown(countdownParts, time);
  renderCountdown(gateCountdownParts, time);

  if (time.isUnlocked) {
    countdownNote.textContent = "The birthday magic is already here.";
    unlockBirthdayGate();
    return;
  }

  countdownNote.textContent = "Until your birthday magic begins.";
}

function unlockBirthdayGate() {
  if (!birthdayGate || birthdayGate.classList.contains("is-unlocked")) return;

  birthdayGate.classList.add("is-unlocked");
  document.body.classList.remove("is-gated");
  if (gateNote) gateNote.textContent = "Unlocked. Happy birthday!";
  window.setTimeout(() => {
    birthdayGate.hidden = true;
  }, 560);
  if (!birthdayGateCelebrated) {
    birthdayGateCelebrated = true;
    releaseBalloons(8);
    launchConfetti({ count: 120 });
  }
}

function releaseBalloons(amount = 7) {
  if (!balloonLayer || prefersReducedMotion) return;

  const colors = [
    "linear-gradient(140deg, #d8f1ff, #8fcfff)",
    "linear-gradient(140deg, #e9edff, #54b8ef)",
    "linear-gradient(140deg, #ffe7f3, #bfe8ff)",
    "linear-gradient(140deg, #ffffff, #d8f1ff)"
  ];

  for (let index = 0; index < amount; index += 1) {
    const balloon = document.createElement("span");
    balloon.className = "balloon";
    balloon.style.left = `${randomBetween(4, 96)}%`;
    balloon.style.background = colors[index % colors.length];
    balloon.style.setProperty("--sway", `${randomBetween(-52, 52).toFixed(1)}px`);
    balloon.style.animationDelay = `${randomBetween(0, 1.2).toFixed(2)}s`;
    balloonLayer.appendChild(balloon);
    balloon.addEventListener("animationend", () => balloon.remove(), { once: true });
  }
}

function launchConfetti(options = {}) {
  if (prefersReducedMotion) return;

  const canvas = document.querySelector("#confetti-canvas");
  const context = canvas.getContext("2d");
  const count = options.count || 90;
  const colors = ["#54b8ef", "#8fcfff", "#d8f1ff", "#ff9ccf", "#fffdf9"];
  const pieces = [];
  let frameId = 0;
  let startTime = performance.now();

  function resizeCanvas() {
    canvas.width = window.innerWidth * window.devicePixelRatio;
    canvas.height = window.innerHeight * window.devicePixelRatio;
    context.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
  }

  resizeCanvas();

  for (let index = 0; index < count; index += 1) {
    pieces.push({
      x: randomBetween(0, window.innerWidth),
      y: randomBetween(-80, -10),
      size: randomBetween(5, 10),
      color: colors[index % colors.length],
      speed: randomBetween(2.2, 5.4),
      spin: randomBetween(0.08, 0.22),
      angle: randomBetween(0, Math.PI * 2),
      drift: randomBetween(-0.9, 0.9)
    });
  }

  function animateConfetti(now) {
    const elapsed = now - startTime;
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);

    pieces.forEach((piece) => {
      piece.y += piece.speed;
      piece.x += Math.sin(piece.angle) + piece.drift;
      piece.angle += piece.spin;

      context.save();
      context.translate(piece.x, piece.y);
      context.rotate(piece.angle);
      context.fillStyle = piece.color;
      context.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size * 0.62);
      context.restore();
    });

    if (elapsed < 3200 && pieces.some((piece) => piece.y < window.innerHeight + 20)) {
      frameId = requestAnimationFrame(animateConfetti);
      return;
    }

    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    cancelAnimationFrame(frameId);
  }

  frameId = requestAnimationFrame(animateConfetti);
}

function setupSurprise() {
  if (!surpriseButton || !surpriseMessage) return;

  surpriseButton.addEventListener("click", () => {
    surpriseMessage.hidden = false;
    surpriseMessage.classList.add("is-open");
    surpriseButton.textContent = "Celebrate again";
    releaseBalloons(9);
    launchConfetti({ count: 120 });
  });
}

createSkyParticles();
setupRevealAnimations();
setupSurprise();
updateCountdown();
setInterval(updateCountdown, 1000);

window.addEventListener("load", () => {
  window.setTimeout(() => {
    if (getTimeRemaining().isUnlocked && !birthdayGateCelebrated) {
      birthdayGateCelebrated = true;
      releaseBalloons(5);
      launchConfetti({ count: 80 });
    }
  }, 450);
});
