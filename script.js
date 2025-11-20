/* ========== LANGUAGE SWAP ========== */
function setLanguage(lang) {
  document.querySelectorAll('[data-en][data-nl]').forEach(el => {
    const text = el.getAttribute(`data-${lang}`);
    if (text) el.textContent = text;
  });

  document.querySelectorAll('.language-toggle img').forEach(img =>
    img.classList.remove('active')
  );

  const activeImg = document.querySelector(
    `.language-toggle img[alt="${lang === 'en' ? 'English' : 'Dutch'}"]`
  );
  if (activeImg) activeImg.classList.add('active');
}

/* ========== Z-INDEX MANAGER ========== */
let zTop = 100;
function bringToFront(el) {
  zTop += 1;
  el.style.zIndex = zTop;
}

/* ========== DRAGGABLE WINDOWS ========== */
function makeDraggable(el, header) {
  let startX = 0, startY = 0;
  let offsetX = 0, offsetY = 0;
  let isDragging = false;

  function startDrag(e) {
    if (window.innerWidth <= 768) return;

    const point = e.touches ? e.touches[0] : e;
    isDragging = true;

    bringToFront(el);
    startDraggingCursorMode();

    startX = point.clientX;
    startY = point.clientY;
    offsetX = el.offsetLeft;
    offsetY = el.offsetTop;

    if (e.cancelable !== false) e.preventDefault();
  }

  function onDrag(e) {
    if (!isDragging) return;

    const point = e.touches ? e.touches[0] : e;
    const dx = point.clientX - startX;
    const dy = point.clientY - startY;

    el.style.left = `${offsetX + dx}px`;
    el.style.top = `${offsetY + dy}px`;

    if (e.cancelable !== false) e.preventDefault();
  }

  function endDrag() {
    isDragging = false;
    stopDraggingCursorMode();
  }

  header.addEventListener("mousedown", startDrag);
  header.addEventListener("touchstart", startDrag, { passive: false });

  document.addEventListener("mousemove", onDrag);
  document.addEventListener("touchmove", onDrag, { passive: false });

  document.addEventListener("mouseup", endDrag);
  document.addEventListener("touchend", endDrag);
}

/* ========== OPEN & CLOSE WINDOWS ========== */
function openWindow(id) {
  const win = document.getElementById(id);

  if (window.innerWidth <= 768) {
    document.querySelectorAll('.draggable-window').forEach(w => {
      w.classList.remove('show-mobile');
      w.classList.add('hide-mobile');
    });
    win.classList.remove('hide-mobile');
    win.classList.add('show-mobile');
  } else {
    win.style.display = 'flex';
    bringToFront(win);
    win.classList.add('opening');
    setTimeout(() => win.classList.remove('opening'), 200);
  }
}

function closeWindow(el) {
  if (window.innerWidth <= 768) {
    el.classList.remove('show-mobile');
    el.classList.add('hide-mobile');
  } else {
    el.classList.add('closing');
    setTimeout(() => {
      el.classList.remove('closing');
      el.style.display = 'none';
    }, 200);
  }
}

/* ========== CLICK SOUND ========== */
const clickSound = new Audio('sounds/click.mp3');

function playClickSound() {
  clickSound.currentTime = 0;
  clickSound.play();
}

function handleClick(id) {
  playClickSound();
  openWindow(id);
}

/* ========== CONTACT FORM ========== */
document.getElementById('contactForm').addEventListener('submit', function(e) {
  e.preventDefault();
  playClickSound();

  emailjs.sendForm('service_et7jgjt', 'template_ggrcvjy', this).then(() => {
    this.reset();
    const popup = document.getElementById('popup');
    popup.style.display = 'block';
    setTimeout(() => popup.style.display = 'none', 2000);
  });
});

/* ========== INITIALIZE WINDOWS ========== */
window.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.draggable-window').forEach(win => {
    const header = win.querySelector('.window-header');
    if (!header) return;

    makeDraggable(win, header);

    const closeBtn = win.querySelector('.close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        playClickSound();
        closeWindow(win);
      });
    }
  });
});

/* =========================================================
   🌸 CUSTOM SPARKLE BLOB CURSOR ENGINE
========================================================= */

const customCursor = document.createElement("div");
customCursor.id = "custom-cursor";
document.body.appendChild(customCursor);

let stillTimer = null;
let gathering = false;

document.addEventListener("mousemove", (e) => {
  const x = e.clientX;
  const y = e.clientY;

  customCursor.style.left = x + "px";
  customCursor.style.top = y + "px";

  gathering = false;

  createSparkle(x, y);

  clearTimeout(stillTimer);
  stillTimer = setTimeout(() => {
    gathering = true;
    pullSparklesToCursor(x, y);
  }, 120);
});

function createSparkle(x, y) {
  const sp = document.createElement("div");
  sp.classList.add("cursor-spark");
  sp.style.left = x + "px";
  sp.style.top = y + "px";
  document.body.appendChild(sp);

  setTimeout(() => sp.remove(), 600);
}

function pullSparklesToCursor(x, y) {
  const all = document.querySelectorAll(".cursor-spark");
  all.forEach(sp => {
    sp.style.transition = "0.25s linear";
    sp.style.left = x + "px";
    sp.style.top = y + "px";
    sp.style.opacity = "0";
  });
}

/* CLICKABLE HOVER MODE */
document.querySelectorAll("button, a, img, .close-btn").forEach(el => {
  el.addEventListener("mouseenter", () => document.body.classList.add("hover-clickable"));
  el.addEventListener("mouseleave", () => document.body.classList.remove("hover-clickable"));
});

/* DRAGGING MODE */
function startDraggingCursorMode() {
  document.body.classList.add("hover-dragging");
}

function stopDraggingCursorMode() {
  document.body.classList.remove("hover-dragging");
}
// =====================================
// PETALS (UNCHANGED — WORKS FINE)
// =====================================
const canvas = document.querySelector('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext('2d');

const TOTAL = 100;
const petalArray = [];
const repelRadius = 100;
const repelStrength = 5;

const mouse = { x: null, y: null };

window.addEventListener('mousemove', e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});
window.addEventListener('mouseleave', () => {
  mouse.x = mouse.y = null;
});

const petalImg = new Image();
petalImg.src = 'https://djjjk9bjm164h.cloudfront.net/petal.png';
petalImg.onload = () => {
  for (let i = 0; i < TOTAL; i++) petalArray.push(new Petal());
  render();
};

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  petalArray.forEach(p => p.animate());
  requestAnimationFrame(render);
}

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

class Petal {
  constructor() {
    this.reset(true);
    this.flipSpeed = Math.random() * 0.03;
  }

  reset(init = false) {
    this.w = 25 + Math.random() * 15;
    this.h = 20 + Math.random() * 10;
    this.x = Math.random() * canvas.width;
    this.y = init ? Math.random() * canvas.height * 2 - canvas.height : -this.h;
    this.opacity = this.w / 40;
    this.flip = Math.random();
    this.xSpeed = Math.random() * 0.5 - 0.25;
    this.ySpeed = Math.random() * 0.5 + 0.3;
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.translate(this.x, this.y);
    ctx.rotate(Math.sin(this.flip) * 0.5);
    ctx.drawImage(
      petalImg,
      0, 0,
      this.w * (0.6 + Math.abs(Math.cos(this.flip)) / 3),
      this.h * (0.8 + Math.abs(Math.sin(this.flip)) / 5)
    );
    ctx.restore();
  }

  applyRepel() {
    if (mouse.x === null) return;
    const dx = this.x - mouse.x;
    const dy = this.y - mouse.y;
    const dist = Math.hypot(dx, dy);
    if (dist < repelRadius) {
      const ux = dx / dist;
      const uy = dy / dist;
      const force = (repelRadius - dist) / repelRadius;
      this.x += ux * force * repelStrength;
      this.y += uy * force * repelStrength;
    }
  }

  animate() {
    this.x += this.xSpeed;
    this.y += this.ySpeed;
    this.flip += this.flipSpeed;

    this.applyRepel();

    if (this.y > canvas.height || this.x > canvas.width || this.x < -this.w) {
      this.reset();
    }
    this.draw();
  }
}
