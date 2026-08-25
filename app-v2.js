document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger);

  // 1. LENIS (Snappier scrolling for better touch/mouse feel)
  const lenis = new Lenis({ lerp: 0.15, smoothWheel: true, wheelMultiplier: 1.2 });
  // Disable scroll until Hero is passed
  lenis.stop();

  function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
  requestAnimationFrame(raf);
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => { lenis.raf(time * 1000); });
  gsap.ticker.lagSmoothing(0, 0);

  // 2. CUSTOM CURSOR
  const cursor = document.getElementById('custom-cursor');
  let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  let cursorTarget = { x: mouse.x, y: mouse.y };
  
  window.addEventListener('mousemove', e => { 
    mouse.x = e.clientX; 
    mouse.y = e.clientY; 
  });
  
  gsap.ticker.add(() => {
    // Smooth interpolation for cursor
    cursorTarget.x += (mouse.x - cursorTarget.x) * 0.2;
    cursorTarget.y += (mouse.y - cursorTarget.y) * 0.2;
    if(cursor) gsap.set(cursor, { x: cursorTarget.x, y: cursorTarget.y });
  });

  // Cursor hover effects on links/buttons
  document.querySelectorAll('a, button, .t-node, .name-block').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.style.width = '24px');
    el.addEventListener('mouseenter', () => cursor.style.height = '24px');
    el.addEventListener('mouseleave', () => cursor.style.width = '8px');
    el.addEventListener('mouseleave', () => cursor.style.height = '8px');
  });

  // 3. LOADING SEQUENCE (0 to 100)
  const tlLoad = gsap.timeline();
  
  // Percentage counter
  const percEl = document.getElementById('ls-perc');
  const dummyObj = { val: 0 };
  gsap.to(dummyObj, {
    val: 100,
    duration: 1.2,
    ease: "power2.inOut",
    onUpdate: () => { if(percEl) percEl.innerText = Math.floor(dummyObj.val) + "%"; }
  });
  
  // Background structure for loader
  const cLoad = document.getElementById('ls-canvas');
  if(cLoad) {
    const ctx = cLoad.getContext('2d');
    const drawL = () => {
      cLoad.width = window.innerWidth; cLoad.height = window.innerHeight;
      ctx.clearRect(0,0,cLoad.width,cLoad.height);
      ctx.strokeStyle = "rgba(255,255,255,0.05)";
      ctx.beginPath(); ctx.moveTo(0, cLoad.height/2); ctx.lineTo(cLoad.width, cLoad.height/2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cLoad.width/2, 0); ctx.lineTo(cLoad.width/2, cLoad.height); ctx.stroke();
    }; drawL();
  }

  // Loader Timeline
  tlLoad.to('.ls-sr', { opacity: 1, duration: 0.3 })
        .to('.ls-line-wrap', { width: '200px', duration: 0.5, ease: "power2.out" }, "+=0.8")
        .to('.ls-name-siva', { y: '0%', opacity: 1, duration: 0.4, ease: "power3.out" })
        .to('.ls-name-ragul', { y: '0%', opacity: 1, duration: 0.4, ease: "power3.out" }, "-=0.2")
        .to('.ls-role', { opacity: 1, duration: 0.3 }, "-=0.2")
        .to('.ls-bg-structure', { opacity: 1, duration: 0.4 })
        .to('.ls-center', { scale: 1.1, opacity: 0, duration: 0.4, delay: 0.3, ease: "power2.in" })
        .to('#loader-sequence', { opacity: 0, duration: 0.4, onComplete: () => {
          document.getElementById('loader-sequence').style.display = 'none';
        }});

  // 4. ENTER THE WORK TRANSITION
  const btnEnter = document.getElementById('btn-enter-work');
  if(btnEnter) {
    btnEnter.addEventListener('click', () => {
      // Split and remove hero
      const tlSplit = gsap.timeline();
      tlSplit.to('#block-siva', { xPercent: -100, opacity: 0, duration: 1, ease: "power4.inOut" })
             .to('#block-ragul', { xPercent: 100, opacity: 0, duration: 1, ease: "power4.inOut" }, "-=1")
             .to('.hero-bottom', { opacity: 0, duration: 0.5 }, "-=1")
             .to('#hero', { opacity: 0, duration: 1, ease: "power2.inOut", onComplete: () => {
                document.getElementById('hero').style.pointerEvents = 'none';
                document.getElementById('hero').style.display = 'none'; // fully remove it
             } }, "-=0.5");
             
      // Force initial theme update and ENABLE SCROLL
      document.body.className = "t-ivory scroll-enabled";
      lenis.start();
      
      // Tell ScrollTrigger to refresh since layout changed slightly (hero display none)
      setTimeout(() => { ScrollTrigger.refresh(); }, 1200);
    });
  }

  // 5. HERO INTERACTION (Subtle Parallax)
  const heroNames = document.querySelectorAll('.name-block');
  window.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 10;
    const y = (e.clientY / window.innerHeight - 0.5) * 10;
    heroNames.forEach(name => {
      gsap.to(name, { x: x, y: y, duration: 1, ease: "power2.out" });
    });
  });

  // 6. THEME TRANSITIONS
  const sections = [
    { id: '#summary', theme: 't-ivory' },
    { id: '#work', theme: 't-dark' },
    { id: '#stack', theme: 't-white' },
    { id: '#experience', theme: 't-gray' },
    { id: '#about', theme: 't-ivory' },
    { id: '#globe-section', theme: 't-black' },
    { id: '#contact', theme: 't-black' }
  ];
  sections.forEach(sec => {
    const el = document.querySelector(sec.id);
    if(el) {
      ScrollTrigger.create({
        trigger: el, start: "top 50%", end: "bottom 50%",
        onEnter: () => document.body.className = sec.theme,
        onEnterBack: () => document.body.className = sec.theme
      });
    }
  });

  // 6.5 GLOBE ANIMATIONS
  let titleAnimated = false;
  ScrollTrigger.create({
    trigger: '#globe-section',
    start: "top 80%",
    onEnter: () => {
      if(!titleAnimated) {
        gsap.fromTo('#globe-title .react-char', 
          { y: 80, opacity: 0, rotationZ: 15 }, 
          { y: 0, opacity: 1, rotationZ: 0, duration: 1.2, stagger: 0.05, ease: "back.out(1.7)" }
        );
        titleAnimated = true;
      }
    }
  });
  ScrollTrigger.create({
    trigger: '#globe-section',
    start: "top 80%",
    end: "bottom 20%",
    onUpdate: (self) => {
      let progress = self.progress;
      if (progress < 0.3) {
        window.globeEntrance = progress / 0.3;
        window.globeExit = 0;
      } else if (progress > 0.7) {
        window.globeEntrance = 1;
        window.globeExit = (progress - 0.7) / 0.3;
      } else {
        window.globeEntrance = 1;
        window.globeExit = 0;
      }
    }
  });

  // 7. WORK GALLERY (HORIZONTAL SCROLL)
  const workSec = document.querySelector('.sec-work');
  const gallery = document.querySelector('.gallery-container');
  if(workSec && gallery) {
    ScrollTrigger.create({
      trigger: workSec,
      start: "top top",
      end: "+=2000",
      pin: true,
      animation: gsap.to(gallery, { xPercent: -66.66, ease: "none" }),
      scrub: 1
    });
  }

  // --- PROJECT 01: SCHEDULER ANIMATION ---
  const jobParticle = document.getElementById('job-particle-1');
  const sStatus = document.getElementById('s-status-1');
  if(jobParticle && sStatus) {
    const tlSched = gsap.timeline({ repeat: -1, repeatDelay: 1 });
    tlSched.set(jobParticle, { y: -150, opacity: 0 })
           .to(jobParticle, { opacity: 1, duration: 0.2 })
           .call(() => sStatus.innerText = "QUEUED")
           .to(jobParticle, { y: -50, duration: 0.8, ease: "power1.inOut" })
           .call(() => sStatus.innerText = "PROCESSING")
           .to(jobParticle, { y: 60, x: -60, duration: 0.8, ease: "power1.inOut" })
           .call(() => sStatus.innerText = "COMPLETED")
           .to(jobParticle, { opacity: 0, duration: 0.2 });
  }

  // --- PROJECT 02: BILLING ANIMATION ---
  const stripeEvent = document.getElementById('stripe-event');
  if(stripeEvent) {
    ScrollTrigger.create({
      trigger: workSec, start: "top top", end: "+=2000", scrub: true,
      onUpdate: (self) => {
        const p = self.progress;
        if(p > 0.35 && p < 0.65) {
          if(document.getElementById('br-1')) document.getElementById('br-1').classList.add('active');
          if(p > 0.4 && document.getElementById('br-2')) document.getElementById('br-2').classList.add('active');
          if(p > 0.5 && document.getElementById('br-3')) document.getElementById('br-3').classList.add('active');
          if(p > 0.55) {
             stripeEvent.style.opacity = 1;
             stripeEvent.style.transform = 'translateY(0)';
          } else {
             stripeEvent.style.opacity = 0;
             stripeEvent.style.transform = 'translateY(20px)';
          }
        } else {
          document.querySelectorAll('.ui-row').forEach(r => r.classList.remove('active'));
          stripeEvent.style.opacity = 0;
          stripeEvent.style.transform = 'translateY(20px)';
        }
      }
    });
  }

  // --- PROJECT 03: RATE LIMITER ANIMATION ---
  const tStream = document.getElementById('traffic-stream');
  const vAllowed = document.getElementById('val-allowed');
  const vThrottled = document.getElementById('val-throttled');
  const rateLabel = document.getElementById('limiter-rate');
  
  if(tStream) {
    let allowedCount = 100;
    let throttledCount = 0;
    
    // Generate traffic DOM nodes
    for(let i=0; i<40; i++) {
      const span = document.createElement('span');
      span.className = 't-req';
      tStream.appendChild(span);
    }
    const reqs = document.querySelectorAll('.t-req');
    
    setInterval(() => {
      // Simulate changing traffic rate
      const isBurst = Math.random() > 0.6;
      const rate = isBurst ? Math.floor(Math.random() * 500 + 500) : Math.floor(Math.random() * 100 + 50);
      rateLabel.innerText = rate + " req/s";
      
      reqs.forEach((r, idx) => {
        if(isBurst && Math.random() > 0.3) {
           r.classList.add('throttled');
           r.classList.remove('allowed');
           throttledCount += 15;
        } else {
           r.classList.add('allowed');
           r.classList.remove('throttled');
           allowedCount += 5;
        }
      });
      
      vAllowed.innerText = allowedCount;
      vThrottled.innerText = throttledCount;
    }, 1500);
  }

  // 8. STACK MAP INTERACTION & DRAWING
  const sNodes = document.querySelectorAll('.s-node');
  const svg = document.getElementById('stack-lines');
  const inlineDetail = document.getElementById('inline-skill-detail');
  const idCat = document.querySelector('.id-cat');
  const idProjs = document.querySelector('.id-projs');
  const idRels = document.querySelector('.id-rels');
  
  const skillData = {
    java: { cat: "LANGUAGE", projs: ["Distributed Job Scheduler", "SaaS Billing Engine"], rel: ["Spring Boot", "Kafka", "PostgreSQL"] },
    js: { cat: "LANGUAGE", projs: ["SaaS Billing Engine"], rel: ["React", "Node.js"] },
    ts: { cat: "LANGUAGE", projs: ["Distributed Job Scheduler"], rel: ["React", "Node.js"] },
    spring: { cat: "BACKEND", projs: ["Distributed Job Scheduler", "Distributed Rate Limiter"], rel: ["Java", "Redis", "Kafka"] },
    node: { cat: "BACKEND", projs: ["SaaS Billing Engine"], rel: ["JavaScript", "TypeScript"] },
    react: { cat: "FRONTEND", projs: ["Distributed Job Scheduler", "SaaS Billing Engine"], rel: ["JavaScript", "TypeScript"] },
    html: { cat: "FRONTEND", projs: ["All Systems"], rel: [] },
    postgres: { cat: "DATA & INFRA", projs: ["SaaS Billing Engine"], rel: ["Java"] },
    redis: { cat: "DATA & INFRA", projs: ["Distributed Rate Limiter"], rel: ["Spring Boot", "AWS"] },
    kafka: { cat: "DATA & INFRA", projs: ["Distributed Job Scheduler"], rel: ["Java", "Spring Boot"] },
    docker: { cat: "DATA & INFRA", projs: ["Distributed Job Scheduler", "SaaS Billing Engine", "Distributed Rate Limiter"], rel: ["AWS"] },
    aws: { cat: "DATA & INFRA", projs: ["Distributed Job Scheduler", "SaaS Billing Engine", "Distributed Rate Limiter"], rel: ["Docker", "Redis"] }
  };

  function drawLines() {
    if(!svg) return;
    svg.innerHTML = '';
    const container = document.getElementById('stack-graph');
    if(!container) return;
    const rect = container.getBoundingClientRect();
    
    sNodes.forEach(node => {
      const links = node.getAttribute('data-links') ? node.getAttribute('data-links').split(',') : [];
      const nRect = node.getBoundingClientRect();
      const nx = nRect.left + nRect.width/2 - rect.left;
      const ny = nRect.top + nRect.height/2 - rect.top;
      
      links.forEach(linkId => {
        const target = document.getElementById('n-' + linkId);
        if(target) {
          const tRect = target.getBoundingClientRect();
          const tx = tRect.left + tRect.width/2 - rect.left;
          const ty = tRect.top + tRect.height/2 - rect.top;
          
          const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          line.setAttribute('x1', nx); line.setAttribute('y1', ny);
          line.setAttribute('x2', tx); line.setAttribute('y2', ty);
          line.setAttribute('stroke', 'rgba(255,255,255,0.1)');
          line.setAttribute('stroke-width', '1');
          line.setAttribute('class', `edge edge-${node.getAttribute('data-id')} edge-${linkId}`);
          svg.appendChild(line);
        }
      });
    });
  }
  
  window.addEventListener('resize', drawLines);
  setTimeout(drawLines, 500); // Draw after initial layout
  
  let activeNode = null;
  
  sNodes.forEach(node => {
    node.addEventListener('mouseenter', () => {
      const id = node.getAttribute('data-id');
      const links = node.getAttribute('data-links') ? node.getAttribute('data-links').split(',') : [];
      const projs = node.getAttribute('data-projs') ? node.getAttribute('data-projs').split(',') : [];
      
      // Node highlighting
      sNodes.forEach(n => {
        if(n === node || links.includes(n.getAttribute('data-id'))) {
          n.classList.add('bright');
          n.classList.remove('quiet');
        } else {
          n.classList.add('quiet');
          n.classList.remove('bright');
        }
      });
      
      // Line highlighting
      document.querySelectorAll('.edge').forEach(edge => {
        if(edge.classList.contains(`edge-${id}`)) {
          edge.setAttribute('stroke', 'rgba(0,229,255,0.5)');
          edge.setAttribute('stroke-width', '2');
        } else {
          edge.setAttribute('stroke', 'rgba(255,255,255,0.02)');
        }
      });
      
      // Project Dimming
      projs.forEach(pClass => {
        const pNode = document.querySelector(`.${pClass}`);
        if(pNode) pNode.style.opacity = '1';
      });
      ['proj-1', 'proj-2', 'proj-3'].forEach(pClass => {
         if(!projs.includes(pClass)) {
            const pNode = document.querySelector(`.${pClass}`);
            if(pNode) pNode.style.opacity = '0.3';
         }
      });
      
      cursor.style.width = '24px';
      cursor.style.height = '24px';
    });
    
    node.addEventListener('mouseleave', () => {
      if(!activeNode) {
        sNodes.forEach(n => { n.classList.remove('bright'); n.classList.remove('quiet'); });
        document.querySelectorAll('.edge').forEach(edge => {
          edge.setAttribute('stroke', 'rgba(255,255,255,0.1)');
          edge.setAttribute('stroke-width', '1');
        });
        ['proj-1', 'proj-2', 'proj-3'].forEach(pClass => {
          const pNode = document.querySelector(`.${pClass}`);
          if(pNode) pNode.style.opacity = '1';
        });
      }
      cursor.style.width = '8px';
      cursor.style.height = '8px';
    });
    
    node.addEventListener('click', () => {
      const id = node.getAttribute('data-id');
      const data = skillData[id];
      if(!data) return;
      
      if(activeNode === node) {
        // Toggle off
        activeNode = null;
        inlineDetail.classList.remove('active');
      } else {
        activeNode = node;
        idCat.innerText = data.cat;
        idProjs.innerHTML = `<strong>USED IN:</strong><br>` + data.projs.join('<br>');
        idRels.innerHTML = `<strong>RELATED:</strong><br>` + (data.rel.length ? data.rel.join(', ') : 'None');
        inlineDetail.classList.add('active');
      }
    });
  });

  // Background click to close detail
  document.getElementById('stack-graph')?.addEventListener('click', (e) => {
    if(e.target.id === 'stack-graph' || e.target.id === 'stack-lines') {
      activeNode = null;
      inlineDetail.classList.remove('active');
      sNodes.forEach(n => { n.classList.remove('bright'); n.classList.remove('quiet'); });
      document.querySelectorAll('.edge').forEach(edge => {
        edge.setAttribute('stroke', 'rgba(255,255,255,0.1)');
        edge.setAttribute('stroke-width', '1');
      });
    }
  });

  // 11. PHYSICS ENGINE (Reactive Typography & Magnets)
  
  // Split .react-text into spans
  document.querySelectorAll('.react-text').forEach(el => {
    const text = el.innerText;
    el.innerHTML = '';
    for(let i = 0; i < text.length; i++) {
      const char = text[i];
      if(char === '\n') {
         el.appendChild(document.createElement('br'));
      } else {
         const span = document.createElement('span');
         span.className = 'react-char';
         span.innerText = char;
         el.appendChild(span);
      }
    }
  });
  
  const chars = document.querySelectorAll('.react-char');
  const mags = document.querySelectorAll('.react-mag');
  const sentenceWords = document.querySelector('.react-sentence');
  
  // If sentence exists, split words
  if(sentenceWords) {
    const words = sentenceWords.innerText.split(' ');
    sentenceWords.innerHTML = '';
    words.forEach(w => {
      const span = document.createElement('span');
      span.className = 'react-char';
      span.innerText = w + ' ';
      sentenceWords.appendChild(span);
    });
  }

  // Optimize by only calculating if mouse moved recently or elements displaced
  gsap.ticker.add(() => {
    try {
      const mx = mouse.x;
      const my = mouse.y;
      
      // Repel Characters
      chars.forEach(char => {
        const rect = char.getBoundingClientRect();
        if(rect.width === 0) return;
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dist = Math.hypot(mx - cx, my - cy);
        
        const maxDist = 150;
        if (dist < maxDist) {
          const force = (maxDist - dist) / maxDist;
          const dx = cx - mx;
          const dy = cy - my;
          const angle = Math.atan2(dy, dx);
          
          const moveX = Math.cos(angle) * force * 20;
          const moveY = Math.sin(angle) * force * 20;
          const rot = force * 5 * (dx > 0 ? 1 : -1);
          
          char.style.transform = `translate(${moveX}px, ${moveY}px) rotate(${rot}deg) scale(${1 + force*0.05})`;
        } else {
          char.style.transform = `translate(0px, 0px) rotate(0deg) scale(1)`;
        }
      });
      
      // Attract Magnets (Buttons/Links/Nodes)
      mags.forEach(mag => {
        const rect = mag.getBoundingClientRect();
        if(rect.width === 0) return;
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dist = Math.hypot(mx - cx, my - cy);
        
        const maxDist = 100;
        if (dist < maxDist) {
          const force = (maxDist - dist) / maxDist;
          const dx = mx - cx;
          const dy = my - cy;
          const moveX = dx * force * 0.2;
          const moveY = dy * force * 0.2;
          mag.style.transform = `translate(${moveX}px, ${moveY}px)`;
        } else {
          mag.style.transform = `translate(0px, 0px)`;
        }
      });
      
      // Attract Stack Nodes
      sNodes.forEach(snode => {
        const rect = snode.getBoundingClientRect();
        if(rect.width === 0) return;
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dist = Math.hypot(mx - cx, my - cy);
        
        const maxDist = 120;
        if (dist < maxDist) {
          const force = (maxDist - dist) / maxDist;
          const dx = mx - cx;
          const dy = my - cy;
          const moveX = dx * force * 0.15;
          const moveY = dy * force * 0.15;
          snode.style.transform = `translate(calc(-50% + ${moveX}px), calc(-50% + ${moveY}px)) scale(${1 + force*0.05})`;
        } else {
          snode.style.transform = `translate(-50%, -50%) scale(1)`;
        }
      });
    } catch(e) {
      // prevent physics from crashing other GSAP timelines
      console.error(e);
    }
  });

  // 9. EXPERIENCE TIMELINE
  const expRows = document.querySelectorAll('.exp-row');
  expRows.forEach(row => {
    ScrollTrigger.create({
      trigger: row,
      start: "top 60%",
      onEnter: () => row.classList.add('active'),
      onLeaveBack: () => row.classList.remove('active')
    });
  });

  // 10. CASE STUDY OVERLAY
  const csLayer = document.getElementById('case-study-overlay');
  const btnClose = document.getElementById('cs-close');
  
  const csData = {
    "case-scheduler": {
      title: "DISTRIBUTED JOB SCHEDULER",
      problem: "Traditional cron jobs fail in distributed environments. We needed a system to decouple job submission from execution while ensuring exactly-once processing.",
      arch: "Client -> API Gateway -> Spring Boot Scheduler -> Kafka Queue -> Worker Nodes.",
      impl: "Implemented Kafka consumer groups for worker nodes to enable horizontal scaling.",
      result: "Achieved reliable execution of 10k+ background jobs.",
      link: "https://github.com/siva042004"
    },
    "case-billing": {
      title: "SAAS BILLING ENGINE",
      problem: "Handling prorated subscription changes and preventing duplicate charges.",
      arch: "Stripe Webhooks -> Idempotency Cache (Redis) -> PostgreSQL Ledger -> Invoice.",
      impl: "Built a transaction ledger that locks rows during processing.",
      result: "Zero duplicate charges processed in production.",
      link: "https://github.com/siva042004"
    },
    "case-limiter": {
      title: "DISTRIBUTED RATE LIMITER",
      problem: "Public APIs were vulnerable to burst traffic. In-memory limiting fails at scale.",
      arch: "API Gateway -> Spring Boot Interceptor -> Redis Cluster (Lua Scripts).",
      impl: "Implemented token bucket algorithm using atomic Redis Lua scripts.",
      result: "Successfully throttled burst traffic without degrading core performance.",
      link: "https://github.com/siva042004"
    }
  };

  document.querySelectorAll('.btn-case').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const pId = btn.getAttribute('data-target');
      if(!pId) return;
      const data = csData[pId];
      
      document.getElementById('cs-title').innerText = data.title;
      document.getElementById('cs-problem').innerText = data.problem;
      document.getElementById('cs-arch').innerText = data.arch;
      document.getElementById('cs-impl').innerText = data.impl;
      document.getElementById('cs-result').innerText = data.result;
      document.getElementById('cs-repo').href = data.link;
      
      lenis.stop();
      if(csLayer) csLayer.classList.add('active');
    });
  });

  if(btnClose) {
    btnClose.addEventListener('click', () => {
      if(csLayer) csLayer.classList.remove('active');
      lenis.start();
    });
  }

  // 12. CONTACT HOVER INTERACTION
  const ciTrigger = document.getElementById('ci-trigger');
  const ciStatus = document.getElementById('ci-status');
  if(ciTrigger && ciStatus) {
    ciTrigger.addEventListener('mouseenter', () => ciStatus.innerText = 'STATUS: HANDSHAKE READY (200 OK)');
    ciTrigger.addEventListener('mouseleave', () => ciStatus.innerText = 'STATUS: IDLE');
  }

});
