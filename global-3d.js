const initGlobal3D = () => {
  const canvas = document.getElementById('global-3d-canvas');
  if (!canvas) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 1000);
  camera.position.z = 150;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

  const count = 3000;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const currentPositions = new Float32Array(count * 3);

  // Shapes
  const shapes = {
     random: new Float32Array(count * 3),
     torus: new Float32Array(count * 3),
     tunnel: new Float32Array(count * 3),
     terrain: new Float32Array(count * 3),
     grid: new Float32Array(count * 3)
  };

  for(let i=0; i<count; i++) {
     // random (abstract cluster)
     shapes.random[i*3] = (Math.random()-0.5)*300;
     shapes.random[i*3+1] = (Math.random()-0.5)*300;
     shapes.random[i*3+2] = (Math.random()-0.5)*300;

     // torus knot (System Map aesthetic)
     const angle = Math.random() * Math.PI * 2;
     const tubeAngle = Math.random() * Math.PI * 2;
     const tubeR = 15 + Math.random()*15;
     const mainR = 50 + Math.random()*20;
     shapes.torus[i*3] = (mainR + tubeR * Math.cos(tubeAngle)) * Math.cos(angle);
     shapes.torus[i*3+1] = (mainR + tubeR * Math.cos(tubeAngle)) * Math.sin(angle);
     shapes.torus[i*3+2] = tubeR * Math.sin(tubeAngle);

     // tunnel (Data Flow / Work)
     const tunnelA = Math.random() * Math.PI * 2;
     const tunnelR = 50 + Math.random()*30;
     const tunnelZ = (Math.random()-0.5) * 500;
     shapes.tunnel[i*3] = Math.cos(tunnelA) * tunnelR;
     shapes.tunnel[i*3+1] = Math.sin(tunnelA) * tunnelR;
     shapes.tunnel[i*3+2] = tunnelZ;

     // terrain (Experience)
     const gx = (Math.random()-0.5)*400;
     const gz = (Math.random()-0.5)*400;
     const gy = Math.sin(gx*0.02) * Math.cos(gz*0.02) * 30 - 60;
     shapes.terrain[i*3] = gx;
     shapes.terrain[i*3+1] = gy;
     shapes.terrain[i*3+2] = gz;

     // grid (Contact / Architecture)
     const cols = Math.sqrt(count);
     const cx = (i % cols) - cols/2;
     const cz = Math.floor(i / cols) - cols/2;
     shapes.grid[i*3] = cx * 10;
     shapes.grid[i*3+1] = -50 + (Math.random()*2);
     shapes.grid[i*3+2] = cz * 10;
  }

  // init with random
  for(let i=0; i<count*3; i++) currentPositions[i] = shapes.random[i];
  geometry.setAttribute('position', new THREE.BufferAttribute(currentPositions, 3));

  const material = new THREE.PointsMaterial({ color: 0x000000, size: 1.5, transparent: true, opacity: 0.15 });
  const points = new THREE.Points(geometry, material);
  scene.add(points);

  window.global3DMaterial = material; 
  window.global3DCanvas = canvas;
  let targetShape = shapes.random;

  window.morphGlobalParticles = (shapeName) => {
     if(shapes[shapeName]) {
        targetShape = shapes[shapeName];
     }
  };

  const clock = new THREE.Clock();
  const animate = () => {
     requestAnimationFrame(animate);
     const time = clock.getElapsedTime();

     points.rotation.y = time * 0.05;
     points.rotation.x = Math.sin(time * 0.1) * 0.2;

     const posAttr = geometry.attributes.position.array;
     for(let i=0; i<count*3; i++) {
        posAttr[i] += (targetShape[i] - posAttr[i]) * 0.03;
     }
     geometry.attributes.position.needsUpdate = true;

     renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
     camera.aspect = window.innerWidth / window.innerHeight;
     camera.updateProjectionMatrix();
     renderer.setSize(window.innerWidth, window.innerHeight);
  });
};
document.addEventListener('DOMContentLoaded', () => { setTimeout(initGlobal3D, 200); });
