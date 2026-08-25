const initGlobe = () => {
  const canvas = document.getElementById('globe-canvas');
  if (!canvas) return;

  const scene = new THREE.Scene();
  
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 300;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Create particles (dots)
  const radius = 100;
  const segments = 60; // resolution of the globe
  const geometry = new THREE.SphereGeometry(radius, segments, segments);
  
  // Create a separate array to store the original positions for the water flow physics
  const basePositions = [];
  const positions = geometry.attributes.position.array;
  for (let i = 0; i < positions.length; i++) {
    basePositions.push(positions[i]);
  }
  
  const material = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 1.5,
    transparent: true,
    opacity: 0.8,
  });

  const particles = new THREE.Points(geometry, material);
  scene.add(particles);

  // Interaction variables
  const mouse = new THREE.Vector2();
  const raycaster = new THREE.Raycaster();
  let isHovering = false;
  let hoverPoint = new THREE.Vector3();

  // Mouse move listener
  window.addEventListener('mousemove', (event) => {
    // We only care if we are in the globe section
    const rect = canvas.getBoundingClientRect();
    if(event.clientY < rect.top || event.clientY > rect.bottom) return;

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    
    // Create an invisible mesh for precise raycasting since raycasting points is finicky
    const hitMesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 32, 32), new THREE.MeshBasicMaterial());
    hitMesh.position.copy(particles.position);
    hitMesh.rotation.copy(particles.rotation);
    hitMesh.updateMatrixWorld();
    
    const intersects = raycaster.intersectObject(hitMesh);
    if (intersects.length > 0) {
      isHovering = true;
      hoverPoint.copy(intersects[0].point);
    } else {
      isHovering = false;
    }
  });

  // Handle Resize
  window.addEventListener('resize', () => {
    const rect = canvas.parentElement.getBoundingClientRect();
    camera.aspect = window.innerWidth / rect.height;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, rect.height);
  });

  // Animation Loop
  const clock = new THREE.Clock();
  
  const animate = () => {
    requestAnimationFrame(animate);
    const time = clock.getElapsedTime();

    // Fast rotation when NOT hovering, slow down slightly when hovering
    particles.rotation.y += isHovering ? 0.005 : 0.02;
    particles.rotation.x += 0.001;

    // Apply water flow physics to vertices
    const positions = particles.geometry.attributes.position.array;
    
    // We must transform hoverPoint to local space of the rotating particles
    const localHoverPoint = hoverPoint.clone();
    const inverseMatrix = new THREE.Matrix4().copy(particles.matrixWorld).invert();
    localHoverPoint.applyMatrix4(inverseMatrix);

    for (let i = 0; i < positions.length; i += 3) {
      const basex = basePositions[i];
      const basey = basePositions[i+1];
      const basez = basePositions[i+2];

      // Reset to base
      let targetX = basex;
      let targetY = basey;
      let targetZ = basez;

      if (isHovering) {
        // Calculate distance from this vertex to the hover point
        const dx = basex - localHoverPoint.x;
        const dy = basey - localHoverPoint.y;
        const dz = basez - localHoverPoint.z;
        const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);

        // Water flow / Ripple effect
        if (dist < 60) {
          // Flow magnitude creates a wave
          const wave = Math.sin(dist * 0.2 - time * 10) * 10 * (1 - dist / 60);
          
          // Push outward along the normal
          const normalLength = Math.sqrt(basex*basex + basey*basey + basez*basez);
          const nx = basex / normalLength;
          const ny = basey / normalLength;
          const nz = basez / normalLength;

          targetX += nx * wave;
          targetY += ny * wave;
          targetZ += nz * wave;
        }
      }

      // Smoothly interpolate current position to target position
      positions[i] += (targetX - positions[i]) * 0.1;
      positions[i+1] += (targetY - positions[i+1]) * 0.1;
      positions[i+2] += (targetZ - positions[i+2]) * 0.1;
    }

    particles.geometry.attributes.position.needsUpdate = true;
    renderer.render(scene, camera);
  };

  animate();
};

window.addEventListener('DOMContentLoaded', () => {
  setTimeout(initGlobe, 500);
});
