const canvas = document.querySelector(".hero__particles");
const hero = document.querySelector(".hero");
const context = canvas.getContext("2d");
const pointer = { x: null, y: null, smoothX: null, smoothY: null };
const particles = [];
let width = 0;
let height = 0;

function resizeCanvas() {
  const scale = window.devicePixelRatio || 1;
  width = canvas.offsetWidth;
  height = canvas.offsetHeight;
  canvas.width = width * scale;
  canvas.height = height * scale;
  context.setTransform(scale, 0, 0, scale, 0, 0);
}

function createParticles() {
  particles.length = 0;
  const count = window.innerWidth < 640 ? 70 : 150;

  for (let index = 0; index < count; index += 1) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      angle: (Math.PI * 2 * index) / count,
      phase: Math.random() * Math.PI * 2,
      radius: 110 + Math.random() * 260,
      speed: 0.002 + Math.random() * 0.002,
      ease: 0.022 + Math.random() * 0.018,
      shape: index % 14 === 0,
      size: Math.random() * 1.8 + 0.8,
    });
  }
}

function drawParticles() {
  const time = performance.now();
  context.clearRect(0, 0, width, height);

  if (pointer.x !== null) {
    if (pointer.smoothX === null) {
      pointer.smoothX = pointer.x;
      pointer.smoothY = pointer.y;
    }

    pointer.smoothX += (pointer.x - pointer.smoothX) * 0.12;
    pointer.smoothY += (pointer.y - pointer.smoothY) * 0.12;
  }

  particles.forEach((particle) => {
    if (pointer.x !== null) {
      particle.angle += particle.speed;
      const wave = Math.sin(time * 0.002 + particle.phase) * 24;
      const radius = particle.radius + wave;
      const targetX = pointer.smoothX + Math.cos(particle.angle) * radius;
      const targetY = pointer.smoothY + Math.sin(particle.angle) * radius;
      const distance = Math.hypot(targetX - particle.x, targetY - particle.y);
      const ease = Math.min(0.14, particle.ease + distance * 0.00022);

      particle.x += (targetX - particle.x) * ease;
      particle.y += (targetY - particle.y) * ease;
    } else {
      particle.x += particle.vx;
      particle.y += particle.vy;

      if (particle.x < 0 || particle.x > width) particle.vx *= -1;
      if (particle.y < 0 || particle.y > height) particle.vy *= -1;
    }

    context.fillStyle = particle.shape
      ? "rgba(29, 78, 216, 0.68)"
      : "rgba(37, 99, 235, 0.72)";

    if (particle.shape) {
      context.save();
      context.translate(particle.x, particle.y);
      context.rotate(particle.angle);
      context.fillRect(-5, -5, 10, 10);
      context.restore();
    } else {
      context.beginPath();
      context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      context.fill();
    }
  });

  requestAnimationFrame(drawParticles);
}

window.addEventListener("resize", () => {
  resizeCanvas();
  createParticles();
});

hero.addEventListener("pointermove", (event) => {
  const bounds = hero.getBoundingClientRect();
  pointer.x = event.clientX - bounds.left;
  pointer.y = event.clientY - bounds.top;
});

hero.addEventListener("pointerleave", () => {
  pointer.x = null;
  pointer.y = null;
  pointer.smoothX = null;
  pointer.smoothY = null;
});

resizeCanvas();
createParticles();
drawParticles();
