// language swap //
function setLanguage(lang) {
  document.querySelectorAll('[data-en][data-nl]').forEach(el => {
    const text = el.getAttribute(`data-${lang}`);
    if (text) el.textContent = text;
  });

  // Highlight active language button
  document.querySelectorAll('.language-toggle img').forEach(img => {
    img.classList.remove('active');
  });

  const activeImg = document.querySelector(`.language-toggle img[alt="${lang === 'en' ? 'English' : 'Dutch'}"]`);
  if (activeImg) activeImg.classList.add('active');
}


// === Make Window Draggable ===
function makeDraggable(el, header) {
  let offsetX = 0, offsetY = 0, isDragging = false;

  header.addEventListener('mousedown', (e) => {
    isDragging = true;
    offsetX = e.clientX - el.offsetLeft;
    offsetY = e.clientY - el.offsetTop;
    el.style.zIndex = parseInt(Date.now() / 1000);
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging || window.innerWidth <= 768) return;
    el.style.left = `${e.clientX - offsetX}px`;
    el.style.top = `${e.clientY - offsetY}px`;
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
  });
}

// === Open & Close Window Logic ===
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
    win.classList.remove('closing');
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

// === Play Click Sound ===
const clickSound = new Audio('sounds/click.mp3');
function playClickSound() {
  clickSound.currentTime = 0;
  clickSound.play();
}

function handleClick(id) {
  playClickSound();
  openWindow(id);
}

// === Contact Form Submission ===
document.getElementById('contactForm').addEventListener('submit', function (e) {
  e.preventDefault();
  playClickSound();

  emailjs.sendForm('service_et7jgjt', 'template_ggrcvjy', this)
    .then(() => {
      this.reset();
      const popup = document.getElementById('popup');
      popup.style.display = 'block';
      setTimeout(() => popup.style.display = 'none', 2000);
    }, (error) => {
      alert('Oops! Something went wrong: ' + error.text);
    });
});

// === Setup Draggables & Close Buttons ===
window.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.draggable-window').forEach(win => {
    const header = win.querySelector('.window-header');
    if (header) {
      makeDraggable(win, header);
      const closeBtn = header.querySelector('.close-btn');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          playClickSound();
          closeWindow(win);
        });
      }
    }
  });
});

// === Petals with Cursor Repel ===
const canvas = document.querySelector('canvas');
canvas.width  = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext('2d');

const TOTAL      = 100;
const petalArray = [];
const repelRadius = 100;   // how far the repulsion reaches
const repelStrength = 5;   // how strongly petals are pushed

// track mouse
const mouse = { x: null, y: null };

window.addEventListener('mousemove', e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});
window.addEventListener('mouseleave', () => {
  mouse.x = null;
  mouse.y = null;
});

const petalImg = new Image();
petalImg.src = 'https://djjjk9bjm164h.cloudfront.net/petal.png';
petalImg.addEventListener('load', () => {
  for (let i = 0; i < TOTAL; i++) {
    petalArray.push(new Petal());
  }
  render();
});

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  petalArray.forEach(p => p.animate());
  requestAnimationFrame(render);
}

window.addEventListener('resize', () => {
  canvas.width  = window.innerWidth;
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
    this.y = init
      ? (Math.random() * canvas.height * 2) - canvas.height
      : -this.h;
    this.opacity = this.w / 40;
    this.flip    = Math.random();
    this.xSpeed  = Math.random() * 0.5 - 0.25;
    this.ySpeed  = Math.random() * 0.5 + 0.3;
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.translate(this.x, this.y);
    ctx.rotate(Math.sin(this.flip) * 0.5);
    ctx.drawImage(
      petalImg,
      0, 0,
      this.w * (0.6 + (Math.abs(Math.cos(this.flip)) / 3)),
      this.h * (0.8 + (Math.abs(Math.sin(this.flip)) / 5))
    );
    ctx.restore();
  }

  applyRepel() {
    if (mouse.x === null) return;
    const dx = this.x - mouse.x;
    const dy = this.y - mouse.y;
    const dist = Math.hypot(dx, dy);

    if (dist < repelRadius) {
      // normalized direction
      const ux = dx / dist;
      const uy = dy / dist;
      // stronger push the closer it is:
      const force = (repelRadius - dist) / repelRadius;
      this.x += ux * force * repelStrength;
      this.y += uy * force * repelStrength;
    }
  }

  animate() {
    // normal fall
    this.x += this.xSpeed;
    this.y += this.ySpeed;
    this.flip += this.flipSpeed;

    // repel from cursor
    this.applyRepel();

    // reset if off screen
    if (
      this.y > canvas.height ||
      this.x > canvas.width  ||
      this.x < -this.w
    ) {
      this.reset();
    }

    this.draw();
  }
}
