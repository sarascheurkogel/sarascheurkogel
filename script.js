// === Language Swap ===
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

// === Make Window Draggable ===
function makeDraggable(el, header) {
  let offsetX = 0, offsetY = 0, isDragging = false;
  header.addEventListener('mousedown', e => {
    isDragging = true;
    offsetX = e.clientX - el.offsetLeft;
    offsetY = e.clientY - el.offsetTop;
    el.style.zIndex = Date.now();
  });
  document.addEventListener('mousemove', e => {
    if (!isDragging || window.innerWidth <= 768) return;
    el.style.left = `${e.clientX - offsetX}px`;
    el.style.top = `${e.clientY - offsetY}px`;
  });
  document.addEventListener('mouseup', () => {
    isDragging = false;
  });
}

// === Window Open/Close ===
function openWindow(id) {
  const win = document.getElementById(id);
  if (window.innerWidth <= 768) {
    document.querySelectorAll('.draggable-window').forEach(w => {
      w.classList.replace('show-mobile', 'hide-mobile');
    });
    win.classList.replace('hide-mobile', 'show-mobile');
  } else {
    win.style.display = 'flex';
    win.classList.add('opening');
    setTimeout(() => win.classList.remove('opening'), 200);
  }
}
function closeWindow(el) {
  if (window.innerWidth <= 768) {
    el.classList.replace('show-mobile', 'hide-mobile');
  } else {
    el.classList.add('closing');
    setTimeout(() => {
      el.classList.remove('closing');
      el.style.display = 'none';
    }, 200);
  }
}

// === Click Sound ===
const clickSound = new Audio('sounds/click.mp3');
function playClickSound() {
  clickSound.currentTime = 0;
  clickSound.play();
}
function handleClick(id) {
  playClickSound();
  openWindow(id);
}

// === Contact Form ===
document.getElementById('contactForm').addEventListener('submit', function(e) {
  e.preventDefault();
  playClickSound();
  emailjs.sendForm('service_et7jgjt', 'template_ggrcvjy', this)
    .then(() => {
      this.reset();
      const popup = document.getElementById('popup');
      popup.style.display = 'block';
      setTimeout(() => popup.style.display = 'none', 2000);
    })
    .catch(error => alert('Oops! Something went wrong: ' + error.text));
});

// === Init Draggables & Close Buttons ===
window.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.draggable-window').forEach(win => {
    const header = win.querySelector('.window-header');
    if (!header) return;
    makeDraggable(win, header);
    const closeBtn = header.querySelector('.close-btn');
    if (closeBtn) closeBtn.addEventListener('click', () => {
      playClickSound();
      closeWindow(win);
    });
  });
});

// === Petals with Mouse Repulsion ===
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
let mouse = { x: null, y: null };
const TOTAL = 100;
const petalArray = [];

//hier kun je de blaadjes configureren zodat je ze weg kan duwen hoger is meer 0 is uit xD;
const REPULSION_RADIUS = 100;
const REPULSION_STRENGTH = 10;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Track mouse
window.addEventListener('mousemove', e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});
window.addEventListener('mouseout', () => {
  mouse.x = null;
  mouse.y = null;
});

// Load petal image
const petalImg = new Image();
petalImg.src = 'https://djjjk9bjm164h.cloudfront.net/petal.png';
petalImg.addEventListener('load', () => {
  for (let i = 0; i < TOTAL; i++) petalArray.push(new Petal());
  render();
});

// Animation loop
function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  petalArray.forEach(petal => petal.update());
  requestAnimationFrame(render);
}

// Resize
window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

// Petal class
class Petal {
  constructor() {
    this.reset(true);
    this.flipSpeed = Math.random() * 0.03;
  }

  reset(init = false) {
    this.w = 25 + Math.random() * 15;
    this.h = 20 + Math.random() * 10;
    this.x = Math.random() * canvas.width;
    this.y = init
      ? Math.random() * canvas.height * 2 - canvas.height
      : -this.h;
    this.opacity = this.w / 40;
    this.flip = Math.random();
    this.xSpeed = Math.random() * 0.5 - 0.25;
    this.ySpeed = Math.random() * 0.5 + 0.3;
  }

  draw() {
    if (petalImg.complete) {
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
    } else {
      ctx.fillStyle = `rgba(255,182,193,${this.opacity})`;
      ctx.beginPath();
      ctx.ellipse(this.x, this.y, this.w/2, this.h/2, 0, 0, Math.PI*2);
      ctx.fill();
    }
  }

  // Apply movement + repulsion
  update() {
    // basic drift
    this.x += this.xSpeed;
    this.y += this.ySpeed;
    this.flip += this.flipSpeed;

    // mouse repulsion
    if (mouse.x !== null) {
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < REPULSION_RADIUS && dist > 0) {
        // push away proportional to proximity
        const force = (REPULSION_RADIUS - dist) / REPULSION_RADIUS;
        this.x += (dx / dist) * REPULSION_STRENGTH * force;
        this.y += (dy / dist) * REPULSION_STRENGTH * force;
      }
    }

    // recycle if out of view
    if (
      this.y > canvas.height ||
      this.x > canvas.width + this.w ||
      this.x < -this.w
    ) {
      this.reset();
    }

    this.draw();
  }
}