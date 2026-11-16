(() => {
  "use strict";

  const STORAGE_KEY = "riani_rafly_rsvp_wishes_v1";
  const EVENT_ISO_WIB = "2027-08-22T08:00:00+07:00";

  const GALLERY_ITEMS = [
    {
      src: "assets/images/gallery-1.jpg",
      caption: "Senyum hangat penuh rasa syukur melangkah bersama menuju hari bahagia"
    },
    {
      src: "assets/images/gallery-2.jpg",
      caption: "Kebersamaan sederhana yang selalu membawa ketenangan dan doa"
    },
    {
      src: "assets/images/gallery-3.jpg",
      caption: "Di bawah langit cerah, menyatukan niat tulus menuju ikatan suci"
    },
    {
      src: "assets/images/gallery-4.jpg",
      caption: "Momen manis bersama buket bunga sebagai pengingat hari istimewa"
    }
  ];

  const DEFAULT_WISHES = [
    {
      name: "Ayu Lestari",
      status: "Hadir",
      count: 2,
      message: "MasyaAllah, selamat menempuh hidup baru Riani & Rafly! Semoga menjadi keluarga sakinah, mawaddah, warahmah hingga ke surga-Nya.",
      time: "Baru saja"
    },
    {
      name: "Dian Purnama",
      status: "Hadir",
      count: 1,
      message: "Barakallahu lakuma wa baraka 'alaikuma. Lancar selalu sampai hari akad nanti ya Riani sayang!",
      time: "1 jam lalu"
    },
    {
      name: "Fajar Nugroho",
      status: "InsyaAllah",
      count: 2,
      message: "Selamat untuk Rafly dan Riani. Semoga Allah berkahi rumah tangga kalian dengan kebahagiaan dan ketenteraman.",
      time: "3 jam lalu"
    }
  ];

  /* -------------------------------------------------------
     DOM REFERENCES
     ------------------------------------------------------- */
  const body = document.body;
  const coverStage = document.getElementById("cover-stage");
  const guestNameTarget = document.getElementById("guest-name-target");
  const btnOpenInvitation = document.getElementById("btn-open-invitation");
  const replayIntroBtn = document.getElementById("replay-intro-btn");
  const ayatSection = document.getElementById("ayat");

  const bgMusic = document.getElementById("bg-music");
  const musicToggle = document.getElementById("music-toggle");
  const musicLabel = document.getElementById("music-label");

  const petalCanvas = document.getElementById("petal-canvas");
  const toastEl = document.getElementById("toast");

  let toastTimer = null;
  let introReadyTimer = null;
  let isMusicPlaying = false;
  let activeLightboxIndex = 0;

  /* -------------------------------------------------------
     HELPERS
     ------------------------------------------------------- */
  function showToast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toastEl.classList.remove("is-visible");
    }, 2600);
  }

  function initGuestName() {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get("to");
    const cleanName = raw ? raw.trim().slice(0, 80) : "";
    const displayName = cleanName || "Tamu Undangan";

    if (guestNameTarget) {
      guestNameTarget.textContent = displayName;
    }

    const rsvpNameInput = document.getElementById("rsvp-name");
    if (rsvpNameInput && cleanName) {
      rsvpNameInput.value = cleanName;
    }
  }

  /* -------------------------------------------------------
     COVER WALK-THROUGH ANIMATION
     ------------------------------------------------------- */
  function playIntroAnimation() {
    if (!coverStage) return;
    window.clearTimeout(introReadyTimer);
    coverStage.classList.remove("is-playing", "is-arrived");

    // Force style recalculation so replay restarts CSS keyframe timelines cleanly
    void coverStage.offsetWidth;

    window.setTimeout(() => {
      coverStage.classList.add("is-playing");
      introReadyTimer = window.setTimeout(() => {
        coverStage.classList.add("is-arrived");
      }, 3450);
    }, 180);
  }

  /* -------------------------------------------------------
     FALLING ROSE PETALS PARTICLE ENGINE
     ------------------------------------------------------- */
  function initPetalCanvas() {
    if (!petalCanvas || !coverStage) return;
    const ctx = petalCanvas.getContext("2d");
    if (!ctx) return;

    const palette = [
      { base: "rgba(244, 184, 200, 0.86)", shade: "rgba(222, 134, 158, 0.72)" },
      { base: "rgba(252, 224, 232, 0.88)", shade: "rgba(241, 179, 196, 0.72)" },
      { base: "rgba(255, 248, 242, 0.86)", shade: "rgba(244, 214, 212, 0.70)" },
      { base: "rgba(247, 205, 217, 0.85)", shade: "rgba(229, 161, 180, 0.72)" }
    ];

    let width = 0;
    let height = 0;
    let dpr = 1;
    let petals = [];
    let rafId = null;
    let isCoverInView = true;

    function resize() {
      const rect = coverStage.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(300, Math.floor(rect.width));
      height = Math.max(500, Math.floor(rect.height));
      petalCanvas.width = Math.floor(width * dpr);
      petalCanvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function createPetal(startAtTop = false) {
      const color = palette[Math.floor(Math.random() * palette.length)];
      const size = 6 + Math.random() * 7.5;
      return {
        x: Math.random() * (width + 60) - 30,
        y: startAtTop ? -20 - Math.random() * 80 : Math.random() * height,
        size,
        speedY: 0.58 + Math.random() * 0.92,
        speedX: -0.22 + Math.random() * 0.65,
        swayAmp: 0.4 + Math.random() * 0.85,
        swayFreq: 0.014 + Math.random() * 0.018,
        phase: Math.random() * Math.PI * 2,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.032,
        flip: Math.random() * Math.PI * 2,
        flipSpeed: 0.025 + Math.random() * 0.035,
        alpha: 0.62 + Math.random() * 0.34,
        color
      };
    }

    function populate(count) {
      petals = [];
      for (let i = 0; i < count; i++) {
        petals.push(createPetal(false));
      }
    }

    function drawPetal(p) {
      const scaleX = 0.45 + 0.55 * Math.abs(Math.cos(p.flip));
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.scale(scaleX, 1);
      ctx.globalAlpha = p.alpha;

      const s = p.size;
      const grad = ctx.createRadialGradient(-s * 0.2, -s * 0.2, 1, 0, 0, s * 1.3);
      grad.addColorStop(0, p.color.base);
      grad.addColorStop(1, p.color.shade);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.bezierCurveTo(s * 0.95, -s * 0.85, s * 1.05, s * 0.45, 0, s);
      ctx.bezierCurveTo(-s * 1.05, s * 0.45, -s * 0.95, -s * 0.85, 0, -s);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    function tick() {
      if (document.hidden || !isCoverInView) {
        rafId = null;
        return;
      }

      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < petals.length; i++) {
        const p = petals[i];
        p.phase += p.swayFreq;
        p.y += p.speedY;
        p.x += p.speedX + Math.sin(p.phase) * p.swayAmp;
        p.rot += p.rotSpeed;
        p.flip += p.flipSpeed;

        if (p.y > height + 24 || p.x < -50 || p.x > width + 50) {
          petals[i] = createPetal(true);
        }
        drawPetal(petals[i]);
      }

      rafId = window.requestAnimationFrame(tick);
    }

    function ensureRunning() {
      if (!rafId && !document.hidden && isCoverInView) {
        rafId = window.requestAnimationFrame(tick);
      }
    }

    resize();
    const isReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    populate(isReduced ? 12 : 30);
    ensureRunning();

    window.addEventListener("resize", () => {
      resize();
    });

    document.addEventListener("visibilitychange", ensureRunning);

    if ("IntersectionObserver" in window) {
      const coverObserver = new IntersectionObserver(
        (entries) => {
          isCoverInView = entries[0] ? entries[0].isIntersecting : true;
          ensureRunning();
        },
        { threshold: 0.02 }
      );
      coverObserver.observe(coverStage);
    }

    if (replayIntroBtn) {
      replayIntroBtn.addEventListener("click", () => {
        populate(isReduced ? 14 : 34);
        ensureRunning();
      });
    }
  }

  /* -------------------------------------------------------
     MUSIC CONTROLLER ("WEDDING NASHEED")
     ------------------------------------------------------- */
  function setMusicUi(playing) {
    isMusicPlaying = playing;
    if (!musicToggle) return;
    musicToggle.classList.toggle("is-playing", playing);
    musicToggle.setAttribute("aria-pressed", String(playing));
    if (musicLabel) {
      musicLabel.textContent = playing ? "Wedding Nasheed" : "Musik Dijeda";
    }
  }

  function startMusicWithFade() {
    if (!bgMusic) return;
    bgMusic.volume = 0.05;
    const playPromise = bgMusic.play();
    if (playPromise && typeof playPromise.then === "function") {
      playPromise
        .then(() => {
          setMusicUi(true);
          let vol = 0.05;
          const fadeTimer = window.setInterval(() => {
            vol = Math.min(0.72, vol + 0.08);
            bgMusic.volume = vol;
            if (vol >= 0.72) window.clearInterval(fadeTimer);
          }, 90);
        })
        .catch(() => {
          setMusicUi(false);
        });
    } else {
      bgMusic.volume = 0.72;
      setMusicUi(true);
    }
  }

  function initMusicToggle() {
    if (!musicToggle || !bgMusic) return;
    musicToggle.addEventListener("click", () => {
      if (isMusicPlaying) {
        bgMusic.pause();
        setMusicUi(false);
      } else {
        startMusicWithFade();
      }
    });
  }

  /* -------------------------------------------------------
     OPEN INVITATION & SCROLL REVEAL
     ------------------------------------------------------- */
  let revealObserver = null;

  function initScrollReveal() {
    const targets = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      targets.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -32px 0px" }
    );

    targets.forEach((el) => revealObserver.observe(el));
  }

  function unlockInvitation() {
    body.classList.remove("is-locked");
    if (musicToggle) {
      musicToggle.hidden = false;
    }

    startMusicWithFade();

    window.setTimeout(() => {
      if (ayatSection) {
        ayatSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      // Guarantee first visible section animates promptly on unlock
      const firstReveal = ayatSection ? ayatSection.querySelector(".reveal") : null;
      if (firstReveal) firstReveal.classList.add("is-visible");
    }, 120);
  }

  /* -------------------------------------------------------
     SAVE THE DATE: COUNTDOWN & CALENDAR
     ------------------------------------------------------- */
  function initCountdown() {
    const daysEl = document.getElementById("cd-days");
    const hoursEl = document.getElementById("cd-hours");
    const minsEl = document.getElementById("cd-minutes");
    const secsEl = document.getElementById("cd-seconds");
    const doneEl = document.getElementById("countdown-done-msg");
    if (!daysEl || !hoursEl || !minsEl || !secsEl) return;

    const targetMs = new Date(EVENT_ISO_WIB).getTime();

    function pad(n) {
      return String(n).padStart(2, "0");
    }

    function update() {
      const diff = targetMs - Date.now();
      if (diff <= 0) {
        daysEl.textContent = "00";
        hoursEl.textContent = "00";
        minsEl.textContent = "00";
        secsEl.textContent = "00";
        if (doneEl) doneEl.hidden = false;
        return;
      }

      const totalSec = Math.floor(diff / 1000);
      const days = Math.floor(totalSec / 86400);
      const hours = Math.floor((totalSec % 86400) / 3600);
      const mins = Math.floor((totalSec % 3600) / 60);
      const secs = totalSec % 60;

      daysEl.textContent = String(days).padStart(2, "0");
      hoursEl.textContent = pad(hours);
      minsEl.textContent = pad(mins);
      secsEl.textContent = pad(secs);
    }

    update();
    window.setInterval(update, 1000);
  }

  function initSaveDateActions() {
    const saveBtn = document.getElementById("btn-save-date");
    const menu = document.getElementById("calendar-menu");
    const gcalLink = document.getElementById("gcal-link");
    const icsBtn = document.getElementById("ics-download-btn");
    if (!saveBtn || !menu) return;

    const title = "The Wedding of Riani & Rafly";
    const location = "Kediaman Mempelai Wanita, Dusun 2 RT 001 RW 005, Desa Karangtengah, Kec. Karangsembung, Kab. Cirebon";
    const details = "Akad Nikah pukul 08.00 WIB dilanjutkan Resepsi pukul 09.00 WIB s/d selesai.";

    if (gcalLink) {
      const gcalUrl = new URL("https://calendar.google.com/calendar/render");
      gcalUrl.searchParams.set("action", "TEMPLATE");
      gcalUrl.searchParams.set("text", title);
      gcalUrl.searchParams.set("dates", "20270822T010000Z/20270822T070000Z");
      gcalUrl.searchParams.set("details", details);
      gcalUrl.searchParams.set("location", location);
      gcalLink.href = gcalUrl.toString();
    }

    saveBtn.addEventListener("click", () => {
      menu.hidden = !menu.hidden;
    });

    if (icsBtn) {
      icsBtn.addEventListener("click", () => {
        const icsContent = [
          "BEGIN:VCALENDAR",
          "VERSION:2.0",
          "PRODID:-//Motion Blossom//Wedding Riani & Rafly//ID",
          "BEGIN:VEVENT",
          "UID:riani-rafly-20270822@motionblossom",
          "DTSTAMP:20261116T040000Z",
          "DTSTART:20270822T010000Z",
          "DTEND:20270822T070000Z",
          `SUMMARY:${title}`,
          `DESCRIPTION:${details}`,
          `LOCATION:${location}`,
          "END:VEVENT",
          "END:VCALENDAR"
        ].join("\r\n");

        const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "Pernikahan-Riani-dan-Rafly.ics";
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
        menu.hidden = true;
        showToast("File kalender acara berhasil diunduh");
      });
    }
  }

  /* -------------------------------------------------------
     GALLERY LIGHTBOX
     ------------------------------------------------------- */
  function initGalleryLightbox() {
    const lightbox = document.getElementById("lightbox");
    const imgEl = document.getElementById("lightbox-img");
    const captionEl = document.getElementById("lightbox-caption");
    const counterEl = document.getElementById("lightbox-counter");
    const closeBtn = document.getElementById("lightbox-close");
    const prevBtn = document.getElementById("lightbox-prev");
    const nextBtn = document.getElementById("lightbox-next");
    const triggers = document.querySelectorAll(".gallery-item[data-index]");

    if (!lightbox || !imgEl || !triggers.length) return;

    function render(index) {
      const len = GALLERY_ITEMS.length;
      activeLightboxIndex = ((index % len) + len) % len;
      const item = GALLERY_ITEMS[activeLightboxIndex];
      imgEl.src = item.src;
      imgEl.alt = item.caption;
      if (captionEl) captionEl.textContent = item.caption;
      if (counterEl) counterEl.textContent = `${activeLightboxIndex + 1} / ${len}`;
    }

    function open(index) {
      render(index);
      lightbox.hidden = false;
    }

    function close() {
      lightbox.hidden = true;
    }

    triggers.forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.getAttribute("data-index") || 0);
        open(idx);
      });
    });

    if (closeBtn) closeBtn.addEventListener("click", close);
    if (prevBtn) prevBtn.addEventListener("click", () => render(activeLightboxIndex - 1));
    if (nextBtn) nextBtn.addEventListener("click", () => render(activeLightboxIndex + 1));

    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) close();
    });

    let touchStartX = 0;
    lightbox.addEventListener("touchstart", (e) => {
      if (e.touches[0]) touchStartX = e.touches[0].clientX;
    }, { passive: true });

    lightbox.addEventListener("touchend", (e) => {
      if (!e.changedTouches[0]) return;
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 45) {
        render(activeLightboxIndex + (dx < 0 ? 1 : -1));
      }
    }, { passive: true });

    document.addEventListener("keydown", (e) => {
      if (lightbox.hidden) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") render(activeLightboxIndex - 1);
      if (e.key === "ArrowRight") render(activeLightboxIndex + 1);
    });
  }

  /* -------------------------------------------------------
     AMPLOP DIGITAL CLIPBOARD COPY
     ------------------------------------------------------- */
  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (_) {
        // Fallback below
      }
    }
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.top = "0";
    ta.style.left = "0";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, text.length);
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch (_) {
      ok = false;
    }
    ta.remove();
    return ok;
  }

  function initCopyButtons() {
    const buttons = document.querySelectorAll(".btn-copy[data-copy]");
    buttons.forEach((btn) => {
      btn.addEventListener("click", async () => {
        const value = btn.getAttribute("data-copy") || "";
        const label = btn.getAttribute("data-label") || "Nomor";
        const span = btn.querySelector("span");
        const ok = await copyText(value);
        if (ok) {
          btn.classList.add("is-copied");
          if (span) span.textContent = "Tersalin ✓";
          showToast(`${label} berhasil disalin`);
          window.setTimeout(() => {
            btn.classList.remove("is-copied");
            if (span) span.textContent = "Salin Nomor";
          }, 2200);
        } else {
          showToast("Silakan salin nomor secara manual");
        }
      });
    });
  }

  /* -------------------------------------------------------
     RSVP & UCAPAN / DOA
     ------------------------------------------------------- */
  function loadWishes() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return [...DEFAULT_WISHES];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length ? parsed : [...DEFAULT_WISHES];
    } catch (_) {
      return [...DEFAULT_WISHES];
    }
  }

  function saveWishes(list) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (_) {
      // Ignore storage quota errors cleanly
    }
  }

  function initRsvp() {
    const form = document.getElementById("rsvp-form");
    const statusSelect = document.getElementById("rsvp-status");
    const countGroup = document.getElementById("guest-count-group");
    const listEl = document.getElementById("wishes-list");
    const statHadir = document.getElementById("stat-hadir");
    const statRagu = document.getElementById("stat-ragu");
    const statTidak = document.getElementById("stat-tidak");

    if (!form || !listEl) return;

    let wishes = loadWishes();

    function syncGuestCountVisibility() {
      if (!statusSelect || !countGroup) return;
      const absent = statusSelect.value === "Berhalangan";
      countGroup.style.opacity = absent ? "0.45" : "1";
      const countSelect = countGroup.querySelector("select");
      if (countSelect) countSelect.disabled = absent;
    }

    function renderWishes() {
      let hadirCount = 0;
      let raguCount = 0;
      let tidakCount = 0;

      listEl.textContent = "";

      wishes.forEach((w) => {
        if (w.status === "Hadir") hadirCount += 1;
        else if (w.status === "InsyaAllah") raguCount += 1;
        else tidakCount += 1;

        const card = document.createElement("article");
        card.className = "wish-item";

        const top = document.createElement("div");
        top.className = "wish-top";

        const author = document.createElement("span");
        author.className = "wish-author";
        author.textContent = w.name;

        const badge = document.createElement("span");
        const statusKey = w.status.toLowerCase();
        badge.className = `wish-badge ${statusKey}`;
        badge.textContent = w.status === "Berhalangan" ? "Berhalangan" : `${w.status} (${w.count || 1} Org)`;

        top.appendChild(author);
        top.appendChild(badge);

        const msg = document.createElement("p");
        msg.className = "wish-message";
        msg.textContent = w.message;

        const meta = document.createElement("p");
        meta.className = "wish-meta";
        meta.textContent = w.time || "Baru saja";

        card.appendChild(top);
        card.appendChild(msg);
        card.appendChild(meta);
        listEl.appendChild(card);
      });

      if (statHadir) statHadir.textContent = String(hadirCount);
      if (statRagu) statRagu.textContent = String(raguCount);
      if (statTidak) statTidak.textContent = String(tidakCount);
    }

    if (statusSelect) {
      statusSelect.addEventListener("change", syncGuestCountVisibility);
      syncGuestCountVisibility();
    }

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const nameInput = document.getElementById("rsvp-name");
      const countSelect = document.getElementById("rsvp-count");
      const msgInput = document.getElementById("rsvp-message");

      const name = nameInput ? nameInput.value.trim() : "";
      const status = statusSelect ? statusSelect.value : "Hadir";
      const count = status === "Berhalangan" ? 0 : Number(countSelect ? countSelect.value : 1);
      const message = msgInput ? msgInput.value.trim() : "";

      if (!name || !message) {
        showToast("Mohon lengkapi nama dan ucapan doa terlebih dahulu");
        return;
      }

      const now = new Date();
      const timeLabel = now.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric"
      });

      wishes.unshift({
        name,
        status,
        count,
        message,
        time: `Dikirim ${timeLabel}`
      });

      saveWishes(wishes);
      renderWishes();

      if (msgInput) msgInput.value = "";
      showToast("Terima kasih atas doa dan konfirmasi kehadiran Saudari");
    });

    renderWishes();
  }

  /* -------------------------------------------------------
     INIT ALL
     ------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", () => {
    initGuestName();
    initPetalCanvas();
    playIntroAnimation();
    initMusicToggle();
    initScrollReveal();
    initCountdown();
    initSaveDateActions();
    initGalleryLightbox();
    initCopyButtons();
    initRsvp();

    if (btnOpenInvitation) {
      btnOpenInvitation.addEventListener("click", unlockInvitation);
    }

    if (replayIntroBtn) {
      replayIntroBtn.addEventListener("click", playIntroAnimation);
    }
  });
})();
