// --- MOBILE MENU TOGGLE ---
const mobileToggle = document.getElementById('mobile-toggle');
const navMenu = document.querySelector('.nav-menu');

mobileToggle.addEventListener('click', () => {
  navMenu.classList.toggle('active');
  const icon = mobileToggle.querySelector('i');
  if (navMenu.classList.contains('active')) {
    icon.className = 'fas fa-times';
  } else {
    icon.className = 'fas fa-bars';
  }
});

// Close menu on nav item click
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    navMenu.classList.remove('active');
    mobileToggle.querySelector('i').className = 'fas fa-bars';
  });
});

// --- CUSTOM CURSOR LOGIC ---
const cursor = document.getElementById('custom-cursor');
const cursorDot = document.getElementById('custom-cursor-dot');

let mouseX = 0;
let mouseY = 0;
let cursorX = 0;
let cursorY = 0;
let dotX = 0;
let dotY = 0;

window.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

// Smooth cursor interpolation
function animateCursor() {
  // Lerp for outer circle (slower for trailing effect)
  cursorX += (mouseX - cursorX) * 0.15;
  cursorY += (mouseY - cursorY) * 0.15;
  
  // Lerp for inner dot (faster for responsiveness)
  dotX += (mouseX - dotX) * 0.35;
  dotY += (mouseY - dotY) * 0.35;
  
  cursor.style.left = `${cursorX}px`;
  cursor.style.top = `${cursorY}px`;
  
  cursorDot.style.left = `${dotX}px`;
  cursorDot.style.top = `${dotY}px`;
  
  requestAnimationFrame(animateCursor);
}
animateCursor();

// Cursor Hover States
function setupCursorHovers() {
  const hoverables = document.querySelectorAll('a, button, .tab-btn, .mobile-toggle, .btn-card-order, .sede-link');
  
  hoverables.forEach(el => {
    // Avoid duplicate listeners
    el.removeEventListener('mouseenter', addHoverClass);
    el.removeEventListener('mouseleave', removeHoverClass);
    
    el.addEventListener('mouseenter', addHoverClass);
    el.addEventListener('mouseleave', removeHoverClass);
  });
}

function addHoverClass() {
  cursor.classList.add('hovered');
}

function removeHoverClass() {
  cursor.classList.remove('hovered');
}

setupCursorHovers();


// --- MENU DATA & DYNAMIC RENDERING ---
const menuData = {
  listos: [
    {
      title: "Tequeños Chéveres x6",
      desc: "Deliciosos deditos de queso mozzarella envueltos en masa hojaldrada crujiente. El balance perfecto de sal y textura dorada.",
      price: "$10.500",
      badges: ["Artesanal", "Queso estirable", "Más pedido 🧡"],
      tag: "Fresco del día",
      image: "tequenos.jpg"
    },
    {
      title: "Pastelitos de Carne y Queso x4",
      desc: "Pastelitos redondos de masa de trigo crujiente rellenos de carne molida sazonada y queso derretido en los bordes.",
      price: "$9.000",
      badges: ["Crujiente", "Sabor Venezolano"],
      tag: "Recién Frito",
      image: "Pasteles.jpg"
    },
    {
      title: "Empanadas de Pollo Guisado x4",
      desc: "Empanadas de maíz súper tostadas, rellenas de pollo desmechado cocido en un guiso criollo lleno de sabor tradicional.",
      price: "$8.500",
      badges: ["Maíz Tostado", "Pollo Desmechado"],
      tag: "Fresco",
      image: "Empanada de pollo.jpg"
    },
    {
      title: "Combo Chéveres Familiar",
      desc: "Ideal para compartir: 6 tequeños clásicos, 4 pastelitos de carne y 4 empanadas pequeñas acompañadas de salsa de ajo especial.",
      price: "$24.900",
      badges: ["Para Compartir", "Salsa Especial", "Ahorro"],
      tag: "Recomendado",
      image: "Combo Familiar.jpg"
    }
  ],
  congelados: [
    {
      title: "Bandeja Tequeños Congelados x20",
      desc: "Llévatelos listos para hornear, freír en aceite caliente o en tu airfryer. Perfectos para antojos nocturnos o visitas inesperadas.",
      price: "$22.000",
      badges: ["Larga Duración", "Listos para Hornear/Freír"],
      tag: "Congelados",
      image: "Tequenos y Pasteles.jpg"
    },
    {
      title: "Bandeja Pastelitos Congelados x15",
      desc: "Bandeja surtida de pastelitos de trigo congelados (carne molida, pollo y queso). Relleno sellado herméticamente para freír sin derrames.",
      price: "$20.000",
      badges: ["Surtidos", "Ideal Airfryer"],
      tag: "Súper Práctico",
      image: "Pasteles.jpg"
    },
    {
      title: "Bandeja Empanadas Congeladas x15",
      desc: "Empanadas de maíz precocidas y ultracongeladas para conservar toda la frescura y la textura crujiente al prepararlas.",
      price: "$18.500",
      badges: ["Precocidas", "Queso y Carne"],
      tag: "Rápido de hacer",
      image: "Empanada de pollo.jpg"
    }
  ]
};

const menuGrid = document.getElementById('menu-grid');
const tabButtons = document.querySelectorAll('.tab-btn');

function renderMenu(tab) {
  // Clear grid
  menuGrid.innerHTML = '';
  
  // Get items
  const items = menuData[tab];
  
  // Create card HTML
  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'menu-card';
    
    // Build badges HTML
    const badgesHtml = item.badges.map(b => `<span class="badge-item">${b}</span>`).join('');
    
    card.innerHTML = `
      <div class="menu-img-container">
        <span class="menu-tag">${item.tag}</span>
        <img src="${item.image}" alt="${item.title}" onerror="this.src='logo.png'; this.style.objectFit='contain';">
      </div>
      <div class="menu-info">
        <h3>${item.title}</h3>
        <p class="menu-desc">${item.desc}</p>
        <div class="menu-badges">
          ${badgesHtml}
        </div>
        <div class="menu-footer">
          <div class="menu-price">
            ${item.price} <span class="price-desc">/ porción</span>
          </div>
          <a href="https://wa.me/573166325650?text=Hola,%20quisiera%20pedir%20el%20producto:%20${encodeURIComponent(item.title)}" target="_blank" class="btn-card-order" aria-label="Pedir por WhatsApp">
            <i class="fab fa-whatsapp"></i>
          </a>
        </div>
      </div>
    `;
    
    menuGrid.appendChild(card);
  });
  
  // Re-hook cursor hover listeners for new cards
  setupCursorHovers();
}

// Tab Switch Event Listener
tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    // Set active class
    tabButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    // Render corresponding category
    const category = btn.getAttribute('data-tab');
    renderMenu(category);
    
    // Simple transition effect via GSAP
    gsap.from('.menu-card', {
      opacity: 0,
      y: 20,
      stagger: 0.1,
      duration: 0.4,
      ease: 'power2.out'
    });
  });
});

// Initial Render
renderMenu('listos');


// --- THREE.JS 3D CANVAS CODE ---
const container = document.getElementById('canvas-container');

// Fallback in case container is missing or browser doesn't support WebGL
if (container && typeof THREE !== 'undefined') {
  
  // Scene, Camera, Renderer
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.set(0, 0, 7.5);
  
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);
  
  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambientLight);
  
  // Top warm directional light (key light)
  const dirLight = new THREE.DirectionalLight(0xfff0dd, 1.5);
  dirLight.position.set(5, 6, 4);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 1024;
  dirLight.shadow.mapSize.height = 1024;
  scene.add(dirLight);
  
  // Side fill point light (gold/orange tone)
  const fillLight = new THREE.PointLight(0xffaa44, 0.8, 15);
  fillLight.position.set(-4, -3, 2);
  scene.add(fillLight);
  
  // Bottom fill point light
  const bottomFillLight = new THREE.PointLight(0xff8833, 0.5, 10);
  bottomFillLight.position.set(0, -5, 0);
  scene.add(bottomFillLight);
  
  // --- Create 3D Specialties (Tequeño, Pastelito, Empanada) ---
  
  // Materials
  const pastryMaterial = new THREE.MeshStandardMaterial({
    color: 0xdf9a44,     // Golden pastry base
    roughness: 0.6,
    metalness: 0.05
  });
  
  const tequenoBaseMat = new THREE.MeshStandardMaterial({
    color: 0xdca756,     // Lighter dough
    roughness: 0.7,
    metalness: 0.05
  });
  
  const tequenoStripeMat = new THREE.MeshStandardMaterial({
    color: 0xb57022,     // Toasted brown stripe wrap
    roughness: 0.65,
    metalness: 0.0
  });
  
  const empanadaMaterial = new THREE.MeshStandardMaterial({
    color: 0xe5a93b,     // Golden yellow empanada
    roughness: 0.65,
    metalness: 0.0
  });

  // 1. TEQUEÑO GROUP (Capsule + spiralled torus wraps)
  const tequenoGroup = new THREE.Group();
  
  // Center cylinder cap base
  const baseTeq = new THREE.Mesh(new THREE.CapsuleGeometry(0.35, 1.3, 8, 16), tequenoBaseMat);
  baseTeq.castShadow = true;
  baseTeq.receiveShadow = true;
  tequenoGroup.add(baseTeq);
  
  // Spiral Dough Wraps (Simulated with angled Torus rings)
  const wrapCount = 6;
  for (let i = 0; i < wrapCount; i++) {
    const wrapGeo = new THREE.TorusGeometry(0.36, 0.07, 8, 24);
    const wrapMesh = new THREE.Mesh(wrapGeo, tequenoStripeMat);
    wrapMesh.position.y = -0.55 + (i * 0.22);
    wrapMesh.rotation.x = Math.PI / 2 + 0.25; // slanted angle
    wrapMesh.rotation.y = 0.15;
    wrapMesh.castShadow = true;
    wrapMesh.receiveShadow = true;
    tequenoGroup.add(wrapMesh);
  }
  
  // Center Tequeño Group and tilt
  tequenoGroup.position.set(-1.3, 1.2, 0);
  tequenoGroup.rotation.set(0.3, 0.4, -0.4);
  scene.add(tequenoGroup);
  
  
  // 2. PASTELITO GROUP (Thin cylinder + crimped perimeter)
  const pastelitoGroup = new THREE.Group();
  
  // Center disc
  const discGeo = new THREE.CylinderGeometry(0.7, 0.7, 0.18, 32);
  const discMesh = new THREE.Mesh(discGeo, pastryMaterial);
  discMesh.rotation.x = Math.PI / 2; // Face camera
  discMesh.castShadow = true;
  discMesh.receiveShadow = true;
  pastelitoGroup.add(discMesh);
  
  // Crimps (repulgue border - small spheres surrounding the circle)
  const crimpCount = 24;
  for (let i = 0; i < crimpCount; i++) {
    const angle = (i / crimpCount) * Math.PI * 2;
    const crimpGeo = new THREE.SphereGeometry(0.08, 8, 8);
    const crimpMesh = new THREE.Mesh(crimpGeo, pastryMaterial);
    crimpMesh.position.set(Math.cos(angle) * 0.72, Math.sin(angle) * 0.72, 0);
    crimpMesh.castShadow = true;
    pastelitoGroup.add(crimpMesh);
  }
  
  // Positioning
  pastelitoGroup.position.set(1.4, -0.1, 0.3);
  pastelitoGroup.rotation.set(-0.2, -0.3, 0.2);
  scene.add(pastelitoGroup);
  
  
  // 3. EMPANADA GROUP (Half cylinder + crimped curved edge)
  const empanadaGroup = new THREE.Group();
  
  // Main half cylinder (thetaLength = Math.PI)
  const empanadaBodyGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.16, 32, 1, false, 0, Math.PI);
  const empanadaBody = new THREE.Mesh(empanadaBodyGeo, empanadaMaterial);
  empanadaBody.rotation.x = Math.PI / 2;
  empanadaBody.rotation.z = Math.PI; // flip to crescent shape
  empanadaBody.castShadow = true;
  empanadaBody.receiveShadow = true;
  empanadaGroup.add(empanadaBody);
  
  // Crimps along the circular crescent arc
  const empanadaCrimpCount = 15;
  for (let i = 0; i <= empanadaCrimpCount; i++) {
    const angle = (i / empanadaCrimpCount) * Math.PI;
    const crimpGeo = new THREE.SphereGeometry(0.07, 8, 8);
    const crimpMesh = new THREE.Mesh(crimpGeo, empanadaMaterial);
    crimpMesh.position.set(Math.cos(angle) * 0.8, Math.sin(angle) * 0.8, 0);
    crimpMesh.castShadow = true;
    empanadaGroup.add(crimpMesh);
  }
  
  // Positioning
  empanadaGroup.position.set(-0.4, -1.3, 0.5);
  empanadaGroup.rotation.set(0.4, 0.5, 0.3);
  scene.add(empanadaGroup);
  
  
  // --- ADD FLOATING PARTICLES (CHEESE CUBES & GOLD SPARKLES) ---
  const particleGroup = new THREE.Group();
  scene.add(particleGroup);
  
  const particleCount = 20;
  const particles = [];
  
  const cheeseColor = 0xffcc00;  // Vibrant cheese yellow
  const goldColor = 0xffae00;    // Gold sparkle
  const whiteColor = 0xffffff;
  
  for (let i = 0; i < particleCount; i++) {
    const isCube = Math.random() > 0.55;
    let geom, mat;
    
    if (isCube) {
      geom = new THREE.BoxGeometry(0.12, 0.12, 0.12);
      mat = new THREE.MeshStandardMaterial({
        color: cheeseColor,
        roughness: 0.6,
        metalness: 0.1
      });
    } else {
      geom = new THREE.SphereGeometry(0.05, 6, 6);
      mat = new THREE.MeshStandardMaterial({
        color: Math.random() > 0.5 ? goldColor : whiteColor,
        roughness: 0.2,
        metalness: 0.8,
        emissive: Math.random() > 0.5 ? goldColor : 0x000000,
        emissiveIntensity: 0.4
      });
    }
    
    const mesh = new THREE.Mesh(geom, mat);
    
    // Position randomly around the workspace canvas
    mesh.position.set(
      (Math.random() - 0.5) * 5.5,
      (Math.random() - 0.5) * 4.5,
      (Math.random() - 0.5) * 2.0
    );
    
    mesh.userData = {
      driftSpeedY: 0.2 + Math.random() * 0.45,
      driftSpeedX: (Math.random() - 0.5) * 0.2,
      rotSpeedX: Math.random() * 0.02,
      rotSpeedY: Math.random() * 0.02,
      initialX: mesh.position.x
    };
    
    mesh.castShadow = true;
    particleGroup.add(mesh);
    particles.push(mesh);
  }
  
  
  // --- MOUSE TRACKING INTERACTION ---
  let targetMouseX = 0;
  let targetMouseY = 0;
  let currentMouseX = 0;
  let currentMouseY = 0;
  
  window.addEventListener('mousemove', (event) => {
    // Normalize coordinates (-1 to 1)
    targetMouseX = (event.clientX / window.innerWidth) * 2 - 1;
    targetMouseY = -(event.clientY / window.innerHeight) * 2 + 1;
  });
  
  // Clock for floating animations
  const clock = new THREE.Clock();
  
  // Render Loop
  function animate() {
    requestAnimationFrame(animate);
    
    const elapsed = clock.getElapsedTime();
    
    // Smooth lerp for mouse coordinates
    currentMouseX += (targetMouseX - currentMouseX) * 0.07;
    currentMouseY += (targetMouseY - currentMouseY) * 0.07;
    
    // Camera parallax follow
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, currentMouseX * 1.5, 0.05);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, currentMouseY * 1.5, 0.05);
    camera.lookAt(0, 0, 0);
    
    // Animate Tequeño (Upper Left)
    tequenoGroup.position.y = 1.25 + Math.sin(elapsed * 0.85) * 0.15 + currentMouseY * 0.3;
    tequenoGroup.position.x = -1.2 + Math.cos(elapsed * 0.65) * 0.1 + currentMouseX * 0.3;
    tequenoGroup.rotation.x = elapsed * 0.15 + (currentMouseY * 0.25);
    tequenoGroup.rotation.y = elapsed * 0.2 + (currentMouseX * 0.25);
    
    // Animate Pastelito (Middle Right)
    pastelitoGroup.position.y = -0.1 + Math.sin(elapsed * 0.9 + 1.2) * 0.15 + currentMouseY * 0.3;
    pastelitoGroup.position.x = 1.45 + Math.cos(elapsed * 0.7 + 0.8) * 0.1 + currentMouseX * 0.3;
    pastelitoGroup.rotation.x = -elapsed * 0.18 + (currentMouseY * 0.2);
    pastelitoGroup.rotation.y = elapsed * 0.12 + (currentMouseX * 0.2);
    
    // Animate Empanada (Lower Left/Center)
    empanadaGroup.position.y = -1.3 + Math.sin(elapsed * 0.75 + 2.5) * 0.12 + currentMouseY * 0.3;
    empanadaGroup.position.x = -0.4 + Math.cos(elapsed * 0.8 + 1.5) * 0.1 + currentMouseX * 0.3;
    empanadaGroup.rotation.x = elapsed * 0.22 + (currentMouseY * 0.25);
    empanadaGroup.rotation.z = Math.sin(elapsed * 0.4) * 0.1 + (currentMouseX * 0.2);
    
    // Update drifting particles
    particles.forEach(p => {
      p.position.y += p.userData.driftSpeedY * 0.008;
      p.position.x = p.userData.initialX + Math.sin(elapsed * p.userData.driftSpeedY) * 0.25;
      p.rotation.x += p.userData.rotSpeedX;
      p.rotation.y += p.userData.rotSpeedY;
      
      // Recycle particle if it drifts off the screen top
      if (p.position.y > 2.8) {
        p.position.y = -2.8;
        p.position.x = (Math.random() - 0.5) * 5.5;
        p.userData.initialX = p.position.x;
      }
    });
    
    renderer.render(scene, camera);
  }
  
  animate();
  
  // Handle Window Resizing
  window.addEventListener('resize', () => {
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });
}


// --- GSAP SCROLL ENTRANCE ANIMATIONS ---
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
  
  // Page load entrance
  const tl = gsap.timeline();
  
  tl.from('#navbar', {
    y: -50,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out'
  })
  .from('.tagline', {
    scale: 0.8,
    opacity: 0,
    duration: 0.5,
    ease: 'back.out(1.7)'
  }, '-=0.4')
  .from('.hero-title', {
    y: 40,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out'
  }, '-=0.3')
  .from('.hero-subtitle', {
    y: 20,
    opacity: 0,
    duration: 0.6,
    ease: 'power3.out'
  }, '-=0.5')
  .from('.hero-actions .btn', {
    y: 20,
    opacity: 0,
    stagger: 0.15,
    duration: 0.6,
    ease: 'power3.out'
  }, '-=0.4')
  .from('.hero-stats', {
    opacity: 0,
    duration: 0.5
  }, '-=0.2')
  .from('.hero-visual', {
    scale: 0.9,
    opacity: 0,
    duration: 1,
    ease: 'power3.out'
  }, '-=0.8');
  
  // Animate Feature Cards on scroll
  gsap.from('.feature-card', {
    scrollTrigger: {
      trigger: '.features-section',
      start: 'top 80%',
      toggleActions: 'play none none none'
    },
    y: 50,
    opacity: 0,
    stagger: 0.2,
    duration: 0.8,
    ease: 'power3.out'
  });

  // Animate Menu Header on scroll
  gsap.from('.section-header', {
    scrollTrigger: {
      trigger: '.menu-section',
      start: 'top 85%'
    },
    y: 30,
    opacity: 0,
    duration: 0.6,
    ease: 'power3.out'
  });

  // Animate Sedes Cards on scroll
  gsap.from('.sede-card', {
    scrollTrigger: {
      trigger: '.sedes-section',
      start: 'top 80%'
    },
    y: 40,
    opacity: 0,
    stagger: 0.25,
    duration: 0.8,
    ease: 'power3.out'
  });

  // Animate Horarios Content on scroll
  gsap.from('.horarios-content', {
    scrollTrigger: {
      trigger: '.horarios-section',
      start: 'top 80%'
    },
    x: -50,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out'
  });

  gsap.from('.horarios-image-card', {
    scrollTrigger: {
      trigger: '.horarios-section',
      start: 'top 80%'
    },
    x: 50,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out'
  });

  // Animate Reviews Cards on scroll
  gsap.from('.review-card', {
    scrollTrigger: {
      trigger: '.reviews-section',
      start: 'top 80%'
    },
    y: 40,
    opacity: 0,
    stagger: 0.25,
    duration: 0.8,
    ease: 'power3.out'
  });

  // Animate CTA Banner on scroll
  gsap.from('.cta-container', {
    scrollTrigger: {
      trigger: '.cta-section',
      start: 'top 85%'
    },
    scale: 0.95,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out'
  });
}
