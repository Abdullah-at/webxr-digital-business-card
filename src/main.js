// ---------- Asset imports (Vite) ----------
import cardBaseURL from '/assets/Card_Base.png';
import cardTextURL from '/assets/Card_Text.png';
import tri1URL     from '/assets/Triangles1.png';
import tri2URL     from '/assets/Triangles2.png';
import tri3URL     from '/assets/Triangles3.png';
import tri4URL     from '/assets/Triangles4.png';
import artURL      from '/assets/Art.png';
import waveURL     from '/assets/wave.png';
import aboutMeURL  from '/assets/AboutMe.png';

// Import Cube Controller and Faces
import { CubeController } from './cubeController.js';
import { CubeFaces } from './cubeFaces.js';

// ---------- Alignment knobs ----------
const FIT = {
  width:  1.300,
  height: 0.980,
  x: 0.000,
  y: 0.000
};

window.addEventListener('DOMContentLoaded', () => {
  const trackerOverlay = document.getElementById('tracker-overlay');
  const markerRoot     = document.getElementById('markerRoot');
  if (!markerRoot) return;

  // Tracker overlay toggle (hide when target found)
  markerRoot.addEventListener('targetFound', () => {
    trackerOverlay?.classList.add('hidden');
  });
  markerRoot.addEventListener('targetLost', () => {
    trackerOverlay?.classList.remove('hidden');
  });

  // Helper to create layers
  const makeLayer = (id, z) => {
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement('a-image');
      el.id = id;
      markerRoot.appendChild(el);
    }
    el.setAttribute('width',  String(FIT.width));
    el.setAttribute('height', String(FIT.height));
    el.setAttribute('position', `${FIT.x} ${FIT.y} ${z}`);
    el.setAttribute('material', 'transparent:true; alphaTest:0.01; side:double; opacity:1');
    return el;
  };

  // Layers
  const base = makeLayer('cardBase', 0.000);
  const text = makeLayer('cardText', 0.001);
  const t1   = makeLayer('tri1',     0.002);
  const t2   = makeLayer('tri2',     0.003);
  const t3   = makeLayer('tri3',     0.004);
  const t4   = makeLayer('tri4',     0.005);
  
  // Content layer (sits above base, replaces text/triangles when cube face tapped)
  const content = makeLayer('cardContent', 0.006);
  content.setAttribute('visible', false);
  
  // About Me sequence layers
  const artLayer = makeLayer('artLayer', 0.007);
  artLayer.setAttribute('visible', false);
  artLayer.setAttribute('material', 'opacity:0');
  artLayer.setAttribute('src', artURL);
  
  // Create 4 wave layers matching CSS footer (like your website)
  // Wave 1: opacity 1, animateWave (1000px -> 0px), 4s
  const waveLayer1 = makeLayer('waveLayer1', 0.008);
  waveLayer1.setAttribute('visible', false);
  waveLayer1.setAttribute('material', 'opacity:0; transparent:true; alphaTest:0.01; side:double');
  waveLayer1.setAttribute('src', waveURL);
  
  // Wave 2: opacity 0.5, animateWave_02 (0px -> 1000px), 4s
  const waveLayer2 = makeLayer('waveLayer2', 0.0085);
  waveLayer2.setAttribute('visible', false);
  waveLayer2.setAttribute('material', 'opacity:0; transparent:true; alphaTest:0.01; side:double');
  waveLayer2.setAttribute('src', waveURL);
  
  // Wave 3: opacity 0.2, animateWave (1000px -> 0px), 3s
  const waveLayer3 = makeLayer('waveLayer3', 0.009);
  waveLayer3.setAttribute('visible', false);
  waveLayer3.setAttribute('material', 'opacity:0; transparent:true; alphaTest:0.01; side:double');
  waveLayer3.setAttribute('src', waveURL);
  
  // Wave 4: opacity 0.7, animateWave_02 (0px -> 1000px), 3s
  const waveLayer4 = makeLayer('waveLayer4', 0.0095);
  waveLayer4.setAttribute('visible', false);
  waveLayer4.setAttribute('material', 'opacity:0; transparent:true; alphaTest:0.01; side:double');
  waveLayer4.setAttribute('src', waveURL);
  
  const waveLayers = [
    { el: waveLayer1, opacity: 1.0, direction: -1, duration: 4000, offset: 2.0 },   // animateWave: 1000px -> 0px (with repeat 2, need 2.0 to 0.0)
    { el: waveLayer2, opacity: 0.5, direction: 1, duration: 4000, offset: 0.0 },  // animateWave_02: 0px -> 1000px (with repeat 2, need 0.0 to 2.0)
    { el: waveLayer3, opacity: 0.2, direction: -1, duration: 3000, offset: 2.0 },  // animateWave: 1000px -> 0px (with repeat 2, need 2.0 to 0.0)
    { el: waveLayer4, opacity: 0.7, direction: 1, duration: 3000, offset: 0.0 }   // animateWave_02: 0px -> 1000px (with repeat 2, need 0.0 to 2.0)
  ];
  
  const TEXTURE_REPEAT = 2; // Match CSS background-size: 1000px (repeated 2x)
  
  // Setup texture tiling and animation for each wave
  waveLayers.forEach((wave, index) => {
    const el = wave.el;
    
    // Initialize texture when loaded
    const initTexture = () => {
      const mesh = el.object3D.children[0];
      if (mesh && mesh.material) {
        const THREE = window.THREE;
        if (THREE && mesh.material.map) {
          mesh.material.map.wrapS = THREE.RepeatWrapping;
          mesh.material.map.wrapT = THREE.RepeatWrapping;
          // background-size: 1000px 100px equivalent (tile 2x horizontally)
          // This ensures seamless tiling like CSS background-size
          mesh.material.map.repeat.set(TEXTURE_REPEAT, 1);
          // Set initial offset (with repeat 2, full cycle is 0.0 to 2.0)
          // animateWave: starts at 2.0 (1000px), animateWave_02: starts at 0.0 (0px)
          mesh.material.map.offset.set(wave.offset, 0);
          mesh.material.map.needsUpdate = true;
          mesh.material.needsUpdate = true;
          console.log(`[WAVE ${index + 1}] Texture initialized, repeat: ${TEXTURE_REPEAT}, offset: ${wave.offset}`);
        }
      }
    };
    
    el.addEventListener('loaded', initTexture);
    el.addEventListener('object3dset', initTexture);
    setTimeout(initTexture, 500);
    
    // Fade animations
    el.setAttribute('animation__fadein', 
      `property: material.opacity; from: 0; to: ${wave.opacity}; dur: 800; easing: easeInOutQuad; startEvents: show-wave`);
    el.setAttribute('animation__fadeout', 
      `property: material.opacity; to: 0; dur: 800; easing: easeInOutQuad; startEvents: hide-wave`);
  });
  
  // Wave animation loop (CSS background-position animation equivalent)
  let waveAnimationId = null;
  let waveAnimationRunning = false;
  
  const animateWaves = () => {
    if (!waveAnimationRunning) return;
    
    const now = performance.now();
    let hasVisibleWaves = false;
    
    waveLayers.forEach((wave, index) => {
      const el = wave.el;
      if (el.getAttribute('visible') === 'true' || el.getAttribute('visible') === true) {
        hasVisibleWaves = true;
        const mesh = el.object3D.children[0];
        
        if (mesh && mesh.material && mesh.material.map) {
          if (!wave.lastTime) wave.lastTime = now;
          
          const delta = now - wave.lastTime;
          wave.lastTime = now;
          
          // Animate offset: with repeat 2, full cycle is from 0.0 to 2.0
          // direction -1: animateWave (starts at 2.0, goes to 0.0)
          // direction 1: animateWave_02 (starts at 0.0, goes to 2.0)
          // Speed = 2.0 (full cycle with repeat 2) / duration in ms
          const fullCycle = TEXTURE_REPEAT; // 2.0 for full cycle
          const speed = (fullCycle / wave.duration) * delta;
          wave.offset += wave.direction * speed;
          
          // Wrap around for seamless loop (0.0 to 2.0 range)
          if (wave.offset >= fullCycle) {
            wave.offset -= fullCycle;
          }
          if (wave.offset < 0.0) {
            wave.offset += fullCycle;
          }
          
          // Apply offset (equivalent to CSS background-position)
          mesh.material.map.offset.set(wave.offset, 0);
          mesh.material.map.needsUpdate = true;
        }
      }
    });
    
    if (waveAnimationRunning) {
      waveAnimationId = requestAnimationFrame(animateWaves);
    }
  };
  
  const startWaveAnimation = () => {
    if (!waveAnimationRunning) {
      waveAnimationRunning = true;
      waveLayers.forEach(wave => wave.lastTime = null);
      animateWaves();
      console.log('[WAVES] Animation started');
    }
  };
  
  const stopWaveAnimation = () => {
    waveAnimationRunning = false;
    if (waveAnimationId) {
      cancelAnimationFrame(waveAnimationId);
      waveAnimationId = null;
    }
    console.log('[WAVES] Animation stopped');
  };
  
  // AboutMe layer should be BEHIND the waves so the blue footer line doesn't appear in front
  // Position it before the last wave layer (waveLayer4 is at 0.0095, so put AboutMe at 0.0075 - behind all waves)
  const aboutMeLayer = makeLayer('aboutMeLayer', 0.0075);
  aboutMeLayer.setAttribute('visible', false);
  aboutMeLayer.setAttribute('material', 'opacity:0');
  aboutMeLayer.setAttribute('src', aboutMeURL);
  
  // Fade animations for About Me sequence layers
  artLayer.setAttribute('animation__fadein', 'property: material.opacity; from: 0; to: 1; dur: 800; easing: easeInOutQuad; startEvents: show-art');
  artLayer.setAttribute('animation__fadeout', 'property: material.opacity; to: 0; dur: 800; easing: easeInOutQuad; startEvents: hide-art');
  
  aboutMeLayer.setAttribute('animation__fadein', 'property: material.opacity; from: 0; to: 1; dur: 800; easing: easeInOutQuad; startEvents: show-aboutme');
  aboutMeLayer.setAttribute('animation__fadeout', 'property: material.opacity; to: 0; dur: 800; easing: easeInOutQuad; startEvents: hide-aboutme');

  // Apply textures
  base.setAttribute('src', cardBaseURL);
  text.setAttribute('src', cardTextURL);
  t1.setAttribute('src',   tri1URL);
  t2.setAttribute('src',   tri2URL);
  t3.setAttribute('src',   tri3URL);
  t4.setAttribute('src',   tri4URL);

  [t1,t2,t3,t4].forEach(el => el.setAttribute('opacity','0.5'));

  // Animations
  text.setAttribute('animation__fade', 'property: material.opacity; from: 1; to: 0; dur: 1200; easing: easeInOutQuad; startEvents: start-fade');
  text.setAttribute('animation__fadeout', 'property: material.opacity; to: 0; dur: 800; easing: easeInOutQuad; startEvents: hide-text');
  
  const pulse = (el, name, delay) => {
    el.setAttribute(`animation__${name}`, `property: material.opacity; from: 0.25; to: 1; dir: alternate; loop: true; dur: 900; easing: easeInOutSine; delay: ${delay}; startEvents: pulse-start; pauseEvents: pulse-stop`);
  };
  pulse(t1, 'p1',   0);
  pulse(t2, 'p2', 200);
  pulse(t3, 'p3', 400);
  pulse(t4, 'p4', 600);
  
  // Fade out animations for triangles
  [t1, t2, t3, t4].forEach((el, i) => {
    el.setAttribute('animation__fadeout', `property: material.opacity; to: 0; dur: 800; easing: easeInOutQuad; startEvents: hide-triangles; delay: ${i * 100}`);
  });
  
  // Content layer fade in/out
  content.setAttribute('animation__fadein', 'property: material.opacity; from: 0; to: 1; dur: 800; easing: easeInOutQuad; startEvents: show-content');
  content.setAttribute('animation__fadeout', 'property: material.opacity; to: 0; dur: 800; easing: easeInOutQuad; startEvents: hide-content');

  // ---------- UFO (GLB) ----------
  const ufo = document.createElement('a-entity');
  ufo.setAttribute('id', 'ufo');
  // Use preloaded asset to avoid network delay
  ufo.setAttribute('gltf-model', '#ufoModel');
  // Place slightly above the image and a hair in front so it's visible
  ufo.setAttribute('position', '0 -0.35 -0.12');
  ufo.setAttribute('scale', '0.3 0.3 0.3');
  markerRoot.appendChild(ufo);

  // ---------- CUBE (3D Button Panel Replacement) ----------
  const cube = document.createElement('a-entity');
  cube.setAttribute('id', 'cube');
  cube.setAttribute('gltf-model', '#cubeModel');
  // Position below the card with clear separation
  cube.setAttribute('position', '0 -1.2 0');
  cube.setAttribute('scale', '0.02 0.02 0.02');
  cube.setAttribute('visible', 'false');
  // Enable 360° rotation interaction
  cube.setAttribute('class', 'clickable');
  markerRoot.appendChild(cube);

  // Ensure animation-mixer exists after model loads
  let ufoLoaded = false;
  ufo.addEventListener('model-loaded', () => {
    ufoLoaded = true;
    // Detect clips from GLB and log them for debugging
    const evt = event; // implicit event in handler
    const animations = evt?.detail?.model?.animations || [];
    const clipNames = animations.map(a => a.name);
    console.log('[UFO] model-loaded. Clips:', clipNames);
    const firstClip = clipNames[0] || '*';
    // Initialize mixer paused on the detected clip
    ufo.setAttribute('animation-mixer', `clip: ${firstClip}; loop: once; repetitions: 1; clampWhenFinished: true; timeScale: 0`);

    // Visibility safety: disable frustum culling and force DoubleSide on materials
    try {
      const model = evt.detail.model;
      const THREE = window.THREE;
      if (model && THREE) {
        model.traverse((node) => {
          if (node.isMesh || node.isSkinnedMesh) {
            node.frustumCulled = false;
            if (node.material) {
              const materials = Array.isArray(node.material) ? node.material : [node.material];
              materials.forEach((m) => { m.side = THREE.DoubleSide; m.needsUpdate = true; });
            }
          }
        });
        // Log bounding box to debug scale
        const box = new THREE.Box3().setFromObject(model);
        const size = new THREE.Vector3();
        box.getSize(size);
        console.log('[UFO] bounds size (m):', size.x.toFixed(3), size.y.toFixed(3), size.z.toFixed(3));
      }
    } catch (e) {
      console.warn('[UFO] post-load adjustments failed', e);
    }
  });

  // ---------- Cube Interaction (Three.js Controller) ----------
  // Initialize the cube controller with Three.js-based rotation
  const cubeController = new CubeController(cube);
  console.log('[MAIN] CubeController initialized');
  
  // ---------- Cube Faces (Interactive Buttons) ----------
  // Add button labels to each face of the cube
  const cubeFaces = new CubeFaces(cube, markerRoot);
  console.log('[MAIN] CubeFaces initialized with markerRoot');

  // ---------- Sequence logic ----------
  let fadeTimer = null;
  let aboutMeTimers = []; // Store About Me animation timers to clear on reset

  const startSequence = () => {
    // Hide the card and cube at first
    [base,text,t1,t2,t3,t4].forEach(el => el.setAttribute('visible', false));
    cube.setAttribute('visible', false);
    
    // Hide and reset About Me layers
    artLayer.setAttribute('visible', false);
    artLayer.setAttribute('material', 'opacity:0');
    stopWaveAnimation();
    waveLayers.forEach(wave => {
      wave.el.setAttribute('visible', false);
      wave.el.setAttribute('material', 'opacity:0');
      // Reset offset (with repeat 2, animateWave starts at 2.0, animateWave_02 at 0.0)
      wave.offset = wave.direction === -1 ? TEXTURE_REPEAT : 0.0;
      wave.lastTime = null;
    });
    aboutMeLayer.setAttribute('visible', false);
    aboutMeLayer.setAttribute('material', 'opacity:0');
    
    // Reset and play GLB baked animation from the start (wait if still loading)
    const play = () => {
      const mixer = ufo.components['animation-mixer'];
      if (mixer) {
        mixer.stopAction('*');
        mixer.playAction('*');
        // Unpause and ensure one-shot
        const current = ufo.getAttribute('animation-mixer') || '';
        ufo.setAttribute('animation-mixer', `${current}; timeScale: 1; loop: once; repetitions: 1; clampWhenFinished: true`);
      }
    };
    if (ufoLoaded) play(); else ufo.addEventListener('model-loaded', play, { once: true });

    // After 6 seconds, show the card layers, cube, and start triangle pulses
    setTimeout(() => {
      [base,text,t1,t2,t3,t4].forEach(el => el.setAttribute('visible', true));
      text.setAttribute('material', 'opacity:1');
      [t1,t2,t3,t4].forEach(el => el.emit('pulse-start'));
      // Removed automatic fade out of Card_text.png
      
      // Show interactive cube
      cube.setAttribute('visible', true);
    }, 6000);
    
    // After 7 seconds, show HUD buttons (1 second after cube appears)
    setTimeout(() => {
      const hud = document.getElementById('hud');
      if (hud) {
        hud.classList.add('active');
        console.log('[HUD] Buttons shown after 6 seconds');
      }
    }, 7000);
  };

  const stopSequence = () => {
    if (fadeTimer) { clearTimeout(fadeTimer); fadeTimer = null; }
    
    // Clear all About Me animation timers
    aboutMeTimers.forEach(timer => clearTimeout(timer));
    aboutMeTimers = [];
    
    // Reset triangles - stop pulses and restore opacity
    [t1,t2,t3,t4].forEach(el => {
      el.emit('pulse-stop');
      el.setAttribute('material', 'opacity:0.5');
      el.setAttribute('visible', false);
    });
    
    // Reset text layer
    text.setAttribute('material', 'opacity:1');
    text.setAttribute('visible', false);
    
    // Hide base layer
    base.setAttribute('visible', false);
    
    // Hide cube when target lost
    cube.setAttribute('visible', false);
    
    // Hide and reset About Me layers (Art, Wave, AboutMe)
    artLayer.setAttribute('visible', false);
    artLayer.setAttribute('material', 'opacity:0');
    stopWaveAnimation();
    waveLayers.forEach(wave => {
      wave.el.setAttribute('visible', false);
      wave.el.setAttribute('material', 'opacity:0');
      // Reset offset (with repeat 2, animateWave starts at 2.0, animateWave_02 at 0.0)
      wave.offset = wave.direction === -1 ? TEXTURE_REPEAT : 0.0;
      wave.lastTime = null;
      // Reset texture offset in material
      const mesh = wave.el.object3D.children[0];
      if (mesh && mesh.material && mesh.material.map) {
        mesh.material.map.offset.set(wave.offset, 0);
        mesh.material.map.needsUpdate = true;
      }
    });
    aboutMeLayer.setAttribute('visible', false);
    aboutMeLayer.setAttribute('material', 'opacity:0');
    
    // Hide HUD buttons when target lost
    const hud = document.getElementById('hud');
    if (hud) {
      hud.classList.remove('active');
    }
    
    // Stop any cube rotation
    cubeController.stopRotation();
    
    // Reset cube rotation to initial state
    cubeController.resetRotation();
    
    // Pause animation when target lost
    const mixer = ufo.components['animation-mixer'];
    if (mixer) {
      ufo.setAttribute('animation-mixer', 'clip: *; loop: once; repetitions: 1; timeScale: 0');
    }
    
    console.log('[RESET] All layers and content reset when target lost');
  };

  markerRoot.addEventListener('targetFound', startSequence);
  markerRoot.addEventListener('targetLost',  stopSequence);

  // ---------- Content Switching System ----------
  let currentContent = null;
  
  const showContent = (contentName, imageUrl) => {
    if (currentContent === contentName) return; // Already showing
    
    console.log(`[CUBE] Switching to: ${contentName}`);
    currentContent = contentName;
    
    // Stop triangle pulses and fade everything out
    [t1, t2, t3, t4].forEach(el => el.emit('pulse-stop'));
    text.emit('hide-text');
    [t1, t2, t3, t4].forEach(el => el.emit('hide-triangles'));
    
    // After fade out, show new content
    setTimeout(() => {
      content.setAttribute('src', imageUrl);
      content.setAttribute('visible', true);
      content.setAttribute('material', 'opacity:0');
      content.emit('show-content');
    }, 900); // Wait for fade out to complete
  };
  
  const resetToDefault = () => {
    if (!currentContent) return; // Already in default state
    
    console.log('[CUBE] Resetting to default view');
    currentContent = null;
    
    // Fade out content
    content.emit('hide-content');
    
    // After fade out, restore text and triangles
    setTimeout(() => {
      content.setAttribute('visible', false);
      text.setAttribute('material', 'opacity:1');
      [t1, t2, t3, t4].forEach(el => {
        el.setAttribute('material', 'opacity:0.5');
        el.emit('pulse-start');
      });
    }, 900);
  };

  // ---------- Button Click Detection ----------
  // Listen for clicks on button images directly
  // Add listeners to each button after they're created
  setTimeout(() => {
    const allButtons = document.querySelectorAll('.face-button');
    console.log('[MAIN] Found', allButtons.length, 'buttons to wire up');
    
    allButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent event bubbling
        
        // Check if was a tap not a drag
        if (!cubeController.wasQuickTap()) {
          console.log('[BUTTON] Ignoring - was a drag');
          return;
        }
        
        const faceName = button.getAttribute('data-face');
        const faceData = cubeFaces.getFace(faceName);
        
        if (faceData) {
          console.log(`[BUTTON] Tapped: ${faceData.label} (${faceName})`);
          handleFaceAction(faceName, faceData.label);
        }
      });
      
      console.log('[MAIN] Click listener added to', button.getAttribute('data-face'), 'button');
    });
  }, 2000);
  
  // Handle actions for each face button
  const handleFaceAction = (faceName, label) => {
    console.log(`[CUBE] Action for ${label}`);
    
    switch(faceName) {
      case 'right': // WhatsApp
        console.log('[CUBE] Saving contact...');
        
        // Create vCard
        const vCardData = `BEGIN:VCARD
VERSION:3.0
FN:Abdullah Barzinji
N:Barzinji;Abdullah;;;
TEL;TYPE=CELL:+41787414241
ORG:WebXR Designer
END:VCARD`;
        
        // Use data URL for better mobile compatibility
        const dataUrl = 'data:text/vcard;charset=utf-8,' + encodeURIComponent(vCardData);
        
        // Create and trigger download
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'Abdullah_Barzinji.vcf';
        link.style.display = 'none';
        
        document.body.appendChild(link);
        
        // Force click on mobile
        if ('click' in link) {
          link.click();
        } else {
          // Fallback for some mobile browsers
          const event = document.createEvent('MouseEvents');
          event.initEvent('click', true, true);
          link.dispatchEvent(event);
        }
        
        setTimeout(() => {
          document.body.removeChild(link);
        }, 100);
        
        console.log('[CUBE] vCard download triggered for +41787414241');
        break;
        
      case 'left': // LinkedIn
        console.log('[CUBE] Opening LinkedIn...');
        window.open('https://linkedin.com/in/abdullah-barzinji', '_blank');
        break;
        
      default:
        console.log(`[CUBE] No action for ${faceName}`);
        break;
    }
  };
  
  // ---------- HUD Button Handlers ----------
  const btnAboutMe = document.getElementById('btn-1');
  const btnJournal = document.getElementById('btn-2');
  
  if (btnAboutMe) {
    btnAboutMe.addEventListener('click', () => {
      console.log('[HUD] About Me button clicked');
      
      // Clear any existing About Me timers
      aboutMeTimers.forEach(timer => clearTimeout(timer));
      aboutMeTimers = [];
      
      // Stop triangle pulses first
      [t1, t2, t3, t4].forEach(el => el.emit('pulse-stop'));
      
      // Fade out all four triangles and Card_Text
      text.emit('hide-text');
      [t1, t2, t3, t4].forEach(el => el.emit('hide-triangles'));
      
      // Wait for triangles and text to fade out (800ms + 300ms buffer), then show Art.png
      const timer1 = setTimeout(() => {
        artLayer.setAttribute('visible', true);
        artLayer.setAttribute('material', 'opacity:0');
        artLayer.emit('show-art');
        console.log('[HUD] Art.png fading in (will stay visible)');
        
        // After Art fades in (800ms), fade in all 4 wave layers (keep Art visible)
        const timer2 = setTimeout(() => {
          // Show all 4 wave layers
          waveLayers.forEach((wave, index) => {
            wave.el.setAttribute('visible', true);
            wave.el.setAttribute('material', `opacity:0; transparent:true; alphaTest:0.01; side:double`);
            // Reset offset to start position (with repeat 2, animateWave starts at 2.0, animateWave_02 at 0.0)
            wave.offset = wave.direction === -1 ? TEXTURE_REPEAT : 0.0;
            wave.lastTime = null;
            // Initialize texture offset if ready
            const mesh = wave.el.object3D.children[0];
            if (mesh && mesh.material && mesh.material.map) {
              mesh.material.map.offset.set(wave.offset, 0);
              mesh.material.map.needsUpdate = true;
            }
            wave.el.emit('show-wave');
            console.log(`[WAVE ${index + 1}] Showing: opacity ${wave.opacity}, direction ${wave.direction > 0 ? 'right' : 'left'}, duration ${wave.duration}ms`);
          });
          
          // Start wave animation after a short delay
          setTimeout(() => {
            startWaveAnimation();
          }, 100);
          
          console.log('[HUD] 4 wave layers fading in and animating (CSS-style)');
          
          // After wave fades in (800ms), fade in AboutMe.png (keep Art and Waves visible)
          const timer3 = setTimeout(() => {
            aboutMeLayer.setAttribute('visible', true);
            aboutMeLayer.setAttribute('material', 'opacity:0');
            aboutMeLayer.emit('show-aboutme');
            console.log('[HUD] AboutMe.png fading in (all layers now visible with animated waves)');
          }, 800); // Wait for wave fade in
          aboutMeTimers.push(timer3);
        }, 800); // Wait for Art fade in
        aboutMeTimers.push(timer2);
      }, 1100); // Wait for triangles and text fade out (800ms + 300ms buffer)
      aboutMeTimers.push(timer1);
    });
  }
  
  if (btnJournal) {
    btnJournal.addEventListener('click', () => {
      console.log('[HUD] Journal button clicked');
      // TODO: Implement Journal functionality
    });
  }
});
