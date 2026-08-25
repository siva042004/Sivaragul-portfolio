const initGlobe = () => {
  const canvas = document.getElementById('globe-canvas');
  if (!canvas) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth * 0.7 / window.innerHeight, 0.1, 1000);
  camera.position.z = 250; // closer
  // shift camera slightly right so globe is centered in the right half
  camera.position.x = 0; 

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  const rect = canvas.getBoundingClientRect();
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // 1. PARTICLES (Globe)
  const radius = 90;
  const segments = 64;
  const geometry = new THREE.SphereGeometry(radius, segments, segments);
  const basePositions = [];
  const positions = geometry.attributes.position.array;
  
  for (let i = 0; i < positions.length; i += 3) {
    basePositions.push(positions[i], positions[i+1], positions[i+2]);
  }
  
  // Make particles a bit brighter and bigger
  const material = new THREE.PointsMaterial({ color: 0x88ccff, size: 2.0, transparent: true, opacity: 0.8 });
  const particles = new THREE.Points(geometry, material);
  // Tilt the globe
  particles.rotation.z = 0.2;
  particles.rotation.x = 0.2;
  scene.add(particles);
  // TECH RINGS
  const ringsGroup = new THREE.Group();
  scene.add(ringsGroup);
  for(let i=0; i<3; i++) {
    const ringGeo = new THREE.TorusGeometry(radius + 15 + (i * 8), 0.2, 8, 100);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.15 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.random() * Math.PI;
    ring.rotation.y = Math.random() * Math.PI;
    ringsGroup.add(ring);
    
    // Add tiny orbiting tech data nodes on the ring
    const orbitGeo = new THREE.SphereGeometry(2, 8, 8);
    const orbitMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const orbitNode = new THREE.Mesh(orbitGeo, orbitMat);
    orbitNode.position.x = radius + 15 + (i * 8);
    ring.add(orbitNode);
  }

  // 2. TECH NODES
  const techData = [
    { id: 'java', label: 'JAVA', sub: 'CORE RUNTIME', lat: -20, lon: 45 },
    { id: 'spring', label: 'SPRING BOOT', sub: 'BACKEND SERVICES', lat: 30, lon: -60 },
    { id: 'react', label: 'REACT', sub: 'INTERFACE LAYER', lat: 10, lon: 120 },
    { id: 'ts', label: 'TYPESCRIPT', sub: 'STATIC TYPING', lat: -10, lon: 150 },
    { id: 'kafka', label: 'KAFKA', sub: 'EVENT STREAMING', lat: 50, lon: 20 },
    { id: 'redis', label: 'REDIS', sub: 'FAST STATE', lat: 60, lon: -110 },
    { id: 'pg', label: 'POSTGRESQL', sub: 'RELATIONAL DATA', lat: -40, lon: -30 },
    { id: 'docker', label: 'DOCKER', sub: 'CONTAINERIZATION', lat: 20, lon: -150 },
    { id: 'aws', label: 'AWS', sub: 'CLOUD INFRASTRUCTURE', lat: -50, lon: 100 },
    { id: 'stripe', label: 'STRIPE', sub: 'PAYMENT GATEWAY', lat: 0, lon: -10 }
  ];

  const getPos = (lat, lon, r) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    return new THREE.Vector3(
      -(r * Math.sin(phi) * Math.cos(theta)),
      r * Math.cos(phi),
      r * Math.sin(phi) * Math.sin(theta)
    );
  };

  const nodes = {};
  const hudContainer = document.getElementById('hud-container');
  
  techData.forEach(t => {
    const pos = getPos(t.lat, t.lon, radius);
    nodes[t.id] = { ...t, pos, active: false };
    
    const el = document.createElement('div');
    el.className = 'hud-annotation';
    el.id = 'hud-' + t.id;
    // By default, only show dot. On hover, show text.
    el.innerHTML = '<div class=\hud-dot\></div><div class=\hud-content\><div class=\hud-label\>' + t.label + '</div><div class=\hud-sub\>' + t.sub + '</div></div>';
    hudContainer.appendChild(el);
    nodes[t.id].el = el;
    
    // Add hover listener directly to HUD dot
    el.addEventListener('mouseenter', () => { el.classList.add('hovered'); });
    el.addEventListener('mouseleave', () => { el.classList.remove('hovered'); });
  });

  // 3. CONNECTIONS
  const projects = {
    'p1': ['react', 'spring', 'kafka'],
    'p2': ['react', 'stripe', 'docker'],
    'p3': ['spring', 'redis', 'aws']
  };

  const curvesGroup = new THREE.Group();
  scene.add(curvesGroup);
  let activeCurves = [];
  
  window.activateProject = (pid) => {
    Object.values(nodes).forEach(n => { n.active = false; n.el.classList.remove('active'); });
    while(curvesGroup.children.length > 0) { curvesGroup.remove(curvesGroup.children[0]); }
    activeCurves = [];
    
    if(!pid || !projects[pid]) return;
    
    const pNodes = projects[pid].map(id => nodes[id]);
    pNodes.forEach(n => { n.active = true; n.el.classList.add('active'); });
    
    for(let i=0; i < pNodes.length - 1; i++) {
      const p1 = pNodes[i].pos;
      const p2 = pNodes[i+1].pos;
      const mid = p1.clone().add(p2).multiplyScalar(0.5);
      const dist = p1.distanceTo(p2);
      mid.normalize().multiplyScalar(radius + dist * 0.4);
      
      const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
      const pts = curve.getPoints(50);
      const geom = new THREE.BufferGeometry().setFromPoints(pts);
      const mat = new THREE.LineBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.8, linewidth: 2 });
      const line = new THREE.Line(geom, mat);
      curvesGroup.add(line);
      activeCurves.push(curve);
    }
  };

  // 4. DATA PARTICLES
  const dataPartsGeom = new THREE.BufferGeometry();
  const dataPartsCount = 20;
  const dpPos = new Float32Array(dataPartsCount * 3);
  dataPartsGeom.setAttribute('position', new THREE.BufferAttribute(dpPos, 3));
  const dpMat = new THREE.PointsMaterial({ color: 0xffffff, size: 4 });
  const dataParticles = new THREE.Points(dataPartsGeom, dpMat);
  curvesGroup.add(dataParticles);

  // 5. INTERACTION
  const mouse = new THREE.Vector2();
  const raycaster = new THREE.Raycaster();
  let hoverPoint = new THREE.Vector3();
  let isHovering = false;
  
  window.addEventListener('mousemove', (e) => {
    const canvasRect = canvas.getBoundingClientRect();
    if(e.clientY < canvasRect.top || e.clientY > canvasRect.bottom) return;
    
    mouse.x = ((e.clientX - canvasRect.left) / canvasRect.width) * 2 - 1;
    mouse.y = -((e.clientY - canvasRect.top) / canvasRect.height) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    const hitMesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 16, 16));
    hitMesh.position.copy(particles.position);
    hitMesh.rotation.copy(particles.rotation);
    hitMesh.updateMatrixWorld();
    
    const intersects = raycaster.intersectObject(hitMesh);
    if(intersects.length > 0) {
      isHovering = true;
      hoverPoint.copy(intersects[0].point);
    } else {
      isHovering = false;
    }
  });

  window.addEventListener('resize', () => {
    const rect = canvas.getBoundingClientRect();
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  });

  const clock = new THREE.Clock();
  
  const animate = () => {
    requestAnimationFrame(animate);
    const time = clock.getElapsedTime();
    
    // Always visible scale
    particles.scale.set(1, 1, 1);
    curvesGroup.scale.set(1, 1, 1);
    
    // Rotate rings
    ringsGroup.children.forEach((ring, idx) => {
      ring.rotation.z += 0.01 * (idx + 1);
      ring.rotation.x += 0.005;
    });

    // Rotation
    particles.rotation.y += isHovering ? 0.003 : 0.015;
    curvesGroup.rotation.copy(particles.rotation);

    // Vertex physics
    const currentPos = particles.geometry.attributes.position.array;
    const invMat = new THREE.Matrix4().copy(particles.matrixWorld).invert();
    const localHover = isHovering ? hoverPoint.clone().applyMatrix4(invMat) : null;

    for(let i=0; i < currentPos.length; i+=3) {
      const bx = basePositions[i];
      const by = basePositions[i+1];
      const bz = basePositions[i+2];
      
      let tx = bx;
      let ty = by;
      let tz = bz;

      if(isHovering && localHover) {
        const dx = bx - localHover.x;
        const dy = by - localHover.y;
        const dz = bz - localHover.z;
        const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
        if(dist < 50) {
          const wave = Math.sin(dist*0.3 - time*10) * 8 * (1 - dist/50);
          const nl = Math.sqrt(bx*bx + by*by + bz*bz);
          tx += (bx/nl)*wave;
          ty += (by/nl)*wave;
          tz += (bz/nl)*wave;
        }
      }

      currentPos[i] += (tx - currentPos[i]) * 0.15;
      currentPos[i+1] += (ty - currentPos[i+1]) * 0.15;
      currentPos[i+2] += (tz - currentPos[i+2]) * 0.15;
    }
    particles.geometry.attributes.position.needsUpdate = true;

    // HUD Updates
    const halfW = canvas.clientWidth / 2;
    const halfH = canvas.clientHeight / 2;
    
    Object.values(nodes).forEach(n => {
      const worldPos = n.pos.clone().applyMatrix4(particles.matrixWorld);
      worldPos.project(camera);
      
      // Hide if behind globe
      if(worldPos.z > 1) {
        n.el.style.opacity = '0';
        n.el.style.pointerEvents = 'none';
      } else {
        n.el.style.opacity = '1';
        n.el.style.pointerEvents = 'auto';
        const x = (worldPos.x * halfW) + halfW;
        const y = -(worldPos.y * halfH) + halfH;
        n.el.style.left = (x + rect.left) + 'px'; // add rect.left because hud-container is full screen? 
        // Wait, hud-container is absolute relative to sec-globe
        n.el.style.left = x + 'px'; // right 70% offset fix
      }
    });

    if(activeCurves.length > 0) {
      const dpp = dataParticles.geometry.attributes.position.array;
      for(let i=0; i < dataPartsCount; i++) {
        const curveIdx = i % activeCurves.length;
        const curve = activeCurves[curveIdx];
        const t = (time * 0.3 + (i / dataPartsCount)) % 1;
        const pt = curve.getPoint(t);
        dpp[i*3] = pt.x;
        dpp[i*3+1] = pt.y;
        dpp[i*3+2] = pt.z;
      }
      dataParticles.geometry.attributes.position.needsUpdate = true;
    } else {
      dataParticles.geometry.attributes.position.array.fill(0);
      dataParticles.geometry.attributes.position.needsUpdate = true;
    }

    renderer.render(scene, camera);
  };
  animate();
  
  document.querySelectorAll('.gp-item').forEach(item => {
    item.addEventListener('mouseenter', () => { window.activateProject(item.dataset.project); });
    item.addEventListener('mouseleave', () => { window.activateProject(null); });
  });
};

window.addEventListener('DOMContentLoaded', () => {
  setTimeout(initGlobe, 500);
});
