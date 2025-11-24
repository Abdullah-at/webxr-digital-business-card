// ---------- Asset imports (Vite) ----------
// Use Vite's import.meta.env.BASE_URL for proper base path handling
const BASE_URL = import.meta.env.BASE_URL || '/';

// Runtime function to ensure asset URLs have the correct base path
// This must be called at runtime, not module load time, to ensure window.AR_BASE_PATH is available
const getAssetURL = (url) => {
  if (!url) return url;
  
  // Get base path at runtime (from window or import.meta.env)
  const runtimeBase = (typeof window !== 'undefined' && window.AR_BASE_PATH) 
    ? window.AR_BASE_PATH 
    : (BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL);
  
  // If URL already has protocol (http/https) or already includes base path, return as-is
  if (url.startsWith('http') || url.includes('/webxr-digital-business-card/')) {
    return url;
  }
  
  // Handle relative paths (starting with 'assets/' or just the filename)
  if (url.startsWith('assets/')) {
    const result = `${runtimeBase}/${url}`;
    if (typeof window !== 'undefined' && window.location.hostname.includes('github.io')) {
      console.log(`[ASSET] ${url} -> ${result}`);
    }
    return result;
  }
  
  // Handle absolute paths starting with / (but without base path)
  if (url.startsWith('/')) {
    // If it starts with /assets, it needs the base path
    if (url.startsWith('/assets/')) {
      const result = `${runtimeBase}${url}`;
      if (typeof window !== 'undefined' && window.location.hostname.includes('github.io')) {
        console.log(`[ASSET] ${url} -> ${result}`);
      }
      return result;
    }
    // If it already has the base path, return as-is
    if (url.startsWith('/webxr-digital-business-card/')) {
      return url;
    }
    // Otherwise, prepend base path
    const result = `${runtimeBase}${url}`;
    if (typeof window !== 'undefined' && window.location.hostname.includes('github.io')) {
      console.log(`[ASSET] ${url} -> ${result}`);
    }
    return result;
  }
  
  // Fallback: assume it needs base path
  const result = `${runtimeBase}/${url}`;
  if (typeof window !== 'undefined' && window.location.hostname.includes('github.io')) {
    console.log(`[ASSET] ${url} -> ${result}`);
  }
  return result;
};

// Import assets (Vite will process these)
import cardBaseURLRaw from '/assets/Card_Base.png';
import cardTextURLRaw from '/assets/Card_Text.png';
import tri1URLRaw     from '/assets/Triangles1.png';
import tri2URLRaw     from '/assets/Triangles2.png';
import tri3URLRaw     from '/assets/Triangles3.png';
import tri4URLRaw     from '/assets/Triangles4.png';
import artURLRaw      from '/assets/Art.png';
import aboutMeURLRaw  from '/assets/AboutMe.png';
import wanS0URLRaw    from '/assets/WAN_S0.png';
import wanS1URLRaw    from '/assets/WAN_S1.png';
import wanS2URLRaw    from '/assets/WAN_S2.png';
import wanS3URLRaw    from '/assets/WAN_S3.png';
import wanS4URLRaw    from '/assets/WAN_S4.png';
import vendettaURLRaw from '/assets/Vendetta.png';
import vendettaCubeURLRaw from '/assets/Vendetta_Cube.png';
import vendettaVideoURLRaw from '/assets/Vendetta.mp4';

// Store raw URLs - will be processed at runtime with getAssetURL()
// This ensures window.AR_BASE_PATH is available when URLs are used
const cardBaseURLRaw_final = cardBaseURLRaw;
const cardTextURLRaw_final = cardTextURLRaw;
const tri1URLRaw_final = tri1URLRaw;
const tri2URLRaw_final = tri2URLRaw;
const tri3URLRaw_final = tri3URLRaw;
const tri4URLRaw_final = tri4URLRaw;
const artURLRaw_final = artURLRaw;
const aboutMeURLRaw_final = aboutMeURLRaw;
const wanS0URLRaw_final = wanS0URLRaw;
const wanS1URLRaw_final = wanS1URLRaw;
const wanS2URLRaw_final = wanS2URLRaw;
const wanS3URLRaw_final = wanS3URLRaw;
const wanS4URLRaw_final = wanS4URLRaw;
const vendettaURLRaw_final = vendettaURLRaw;
const vendettaCubeURLRaw_final = vendettaCubeURLRaw;
const vendettaVideoURLRaw_final = vendettaVideoURLRaw;

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
  
  // HUD starts hidden - will be shown after 8 seconds in startSequence()
  const initialHud = document.getElementById('hud');
  if (initialHud) {
    initialHud.classList.remove('active');
    console.log('[MAIN] HUD starts hidden, will appear after 8 seconds');
  }

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
  artLayer.setAttribute('src', getAssetURL(artURLRaw_final));
  
  const aboutMeLayer = makeLayer('aboutMeLayer', 0.008);
  aboutMeLayer.setAttribute('visible', false);
  aboutMeLayer.setAttribute('material', 'opacity:0');
  aboutMeLayer.setAttribute('src', getAssetURL(aboutMeURLRaw_final));
  
  // WAN Slide layers (5 slides: S0, S1, S2, S3, S4)
  const wanSlides = [
    makeLayer('wanSlide0', 0.009),
    makeLayer('wanSlide1', 0.009),
    makeLayer('wanSlide2', 0.009),
    makeLayer('wanSlide3', 0.009),
    makeLayer('wanSlide4', 0.009)
  ];
  
  wanSlides[0].setAttribute('src', getAssetURL(wanS0URLRaw_final));
  wanSlides[1].setAttribute('src', getAssetURL(wanS1URLRaw_final));
  wanSlides[2].setAttribute('src', getAssetURL(wanS2URLRaw_final));
  wanSlides[3].setAttribute('src', getAssetURL(wanS3URLRaw_final));
  wanSlides[4].setAttribute('src', getAssetURL(wanS4URLRaw_final));
  
  wanSlides.forEach((slide, index) => {
    slide.setAttribute('visible', false);
    slide.setAttribute('material', 'opacity:0');
    slide.setAttribute('animation__fadein', 'property: material.opacity; from: 0; to: 1; dur: 800; easing: easeInOutQuad; startEvents: show-wan-slide');
    slide.setAttribute('animation__fadeout', 'property: material.opacity; to: 0; dur: 800; easing: easeInOutQuad; startEvents: hide-wan-slide');
  });
  
  // Vendetta layer
  const vendettaLayer = makeLayer('vendettaLayer', 0.009);
  vendettaLayer.setAttribute('visible', false);
  vendettaLayer.setAttribute('material', 'opacity:0');
  vendettaLayer.setAttribute('src', getAssetURL(vendettaURLRaw_final));
  vendettaLayer.setAttribute('animation__fadein', 'property: material.opacity; from: 0; to: 1; dur: 800; easing: easeInOutQuad; startEvents: show-vendetta');
  vendettaLayer.setAttribute('animation__fadeout', 'property: material.opacity; to: 0; dur: 800; easing: easeInOutQuad; startEvents: hide-vendetta');
  
  // Vendetta video element (positioned at bottom center of Vendetta.png, in front)
  const vendettaVideo = document.createElement('a-video');
  vendettaVideo.setAttribute('id', 'vendettaVideo');
  vendettaVideo.setAttribute('src', getAssetURL(vendettaVideoURLRaw_final));
  vendettaVideo.setAttribute('width', '1.2');
  vendettaVideo.setAttribute('height', '0.66'); // 16:9 aspect ratio
  // Position: bottom center, z=0.010 (in front of Vendetta layer at 0.009), y adjusted to align bottom with Vendetta.png
  vendettaVideo.setAttribute('position', '0 -0.15 0.030'); // Moved up more to align bottom with Vendetta.png
  vendettaVideo.setAttribute('visible', false);
  vendettaVideo.setAttribute('material', 'opacity:0');
  vendettaVideo.setAttribute('animation__fadein', 'property: material.opacity; from: 0; to: 1; dur: 800; easing: easeInOutQuad; startEvents: show-vendetta-video');
  vendettaVideo.setAttribute('animation__fadeout', 'property: material.opacity; to: 0; dur: 800; easing: easeInOutQuad; startEvents: hide-vendetta-video');
  // Enable autoplay and loop for video
  vendettaVideo.setAttribute('autoplay', false);
  vendettaVideo.setAttribute('loop', false);
  markerRoot.appendChild(vendettaVideo);
  
  // Track video playing state
  let isVendettaVideoPlaying = false;
  
  // Helper function to get the HTML5 video element
  const getVendettaVideoElement = () => {
    let videoEl = null;
    
    if (vendettaVideo.components && vendettaVideo.components.material) {
      const material = vendettaVideo.components.material.material;
      if (material && material.map && material.map.image) {
        videoEl = material.map.image;
      }
    }
    
    // Fallback: try to find video element in the scene
    if (!videoEl || videoEl.tagName !== 'VIDEO') {
      videoEl = document.querySelector('#vendettaVideo video');
    }
    
    return (videoEl && videoEl.tagName === 'VIDEO') ? videoEl : null;
  };
  
  // Get the actual HTML5 video element when it loads and set up event listeners
  vendettaVideo.addEventListener('loadeddata', () => {
    const videoEl = getVendettaVideoElement();
    if (videoEl) {
      console.log('[VENDETTA] Video element ready');
      
      // Track video state changes
      videoEl.addEventListener('play', () => {
        isVendettaVideoPlaying = true;
        updateVendettaPlayButton();
      });
      
      videoEl.addEventListener('pause', () => {
        isVendettaVideoPlaying = false;
        updateVendettaPlayButton();
      });
      
      videoEl.addEventListener('ended', () => {
        isVendettaVideoPlaying = false;
        updateVendettaPlayButton();
      });
    }
  });
  
  // Fade animations for About Me sequence layers
  artLayer.setAttribute('animation__fadein', 'property: material.opacity; from: 0; to: 1; dur: 800; easing: easeInOutQuad; startEvents: show-art');
  artLayer.setAttribute('animation__fadeout', 'property: material.opacity; to: 0; dur: 800; easing: easeInOutQuad; startEvents: hide-art');
  
  aboutMeLayer.setAttribute('animation__fadein', 'property: material.opacity; from: 0; to: 1; dur: 800; easing: easeInOutQuad; startEvents: show-aboutme');
  aboutMeLayer.setAttribute('animation__fadeout', 'property: material.opacity; to: 0; dur: 800; easing: easeInOutQuad; startEvents: hide-aboutme');

  // Apply textures (use getAssetURL at runtime to ensure correct base path)
  base.setAttribute('src', getAssetURL(cardBaseURLRaw_final));
  text.setAttribute('src', getAssetURL(cardTextURLRaw_final));
  t1.setAttribute('src',   getAssetURL(tri1URLRaw_final));
  t2.setAttribute('src',   getAssetURL(tri2URLRaw_final));
  t3.setAttribute('src',   getAssetURL(tri3URLRaw_final));
  t4.setAttribute('src',   getAssetURL(tri4URLRaw_final));
  
  // Add fade out animation for base layer
  base.setAttribute('animation__fadeout', 'property: material.opacity; to: 0; dur: 800; easing: easeInOutQuad; startEvents: hide-text');

  [t1,t2,t3,t4].forEach(el => el.setAttribute('opacity','0.5'));

  // Animations
  text.setAttribute('animation__fade', 'property: material.opacity; from: 1; to: 0; dur: 1200; easing: easeInOutQuad; startEvents: start-fade');
  text.setAttribute('animation__fadeout', 'property: material.opacity; to: 0; dur: 800; easing: easeInOutQuad; startEvents: hide-text');
  
  // Base layer fade out animation
  base.setAttribute('animation__fadeout', 'property: material.opacity; to: 0; dur: 800; easing: easeInOutQuad; startEvents: hide-text');
  
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
  
  // Function to rotate cube to show Net.jpeg side (right side = -90 degrees on Y axis) - smooth animation
  const rotateCubeToNet = () => {
    if (cubeController.cubeObject3D) {
      const targetRotationY = -90; // -90 degrees on Y
      const currentRotation = cube.getAttribute('rotation');
      const currentRotationY = currentRotation ? currentRotation.y : 0;
      
      // Use A-Frame animation for smooth rotation
      cube.setAttribute('animation__rotate', 
        `property: rotation; 
         from: ${currentRotation.x || 0} ${currentRotationY} ${currentRotation.z || 0}; 
         to: 0 ${targetRotationY} 0; 
         dur: 1200; 
         easing: easeInOutQuad`);
      
      // Update controller state (convert to radians)
      cubeController.rotation = { x: 0, y: targetRotationY * Math.PI / 180 };
      
      console.log('[CUBE] Rotating smoothly to show Net.jpeg side');
    }
  };
  
  // Function to rotate cube to show Vendetta_Cube.png side (left side = 90 degrees on Y axis) - smooth animation
  const rotateCubeToVendetta = () => {
    if (cubeController.cubeObject3D) {
      const targetRotationY = 90; // 90 degrees on Y (left side)
      const currentRotation = cube.getAttribute('rotation');
      const currentRotationY = currentRotation ? currentRotation.y : 0;
      
      // Use A-Frame animation for smooth rotation
      cube.setAttribute('animation__rotate', 
        `property: rotation; 
         from: ${currentRotation.x || 0} ${currentRotationY} ${currentRotation.z || 0}; 
         to: 0 ${targetRotationY} 0; 
         dur: 1200; 
         easing: easeInOutQuad`);
      
      // Update controller state (convert to radians)
      cubeController.rotation = { x: 0, y: targetRotationY * Math.PI / 180 };
      
      console.log('[CUBE] Rotating smoothly to show Vendetta_Cube.png side');
    }
  };
  
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
    
    // Show HUD buttons after 8 seconds (after target detection)
    setTimeout(() => {
      const hud = document.getElementById('hud');
      if (hud) {
        hud.classList.add('active');
        console.log('[HUD] Buttons shown after 8 seconds');
      }
    }, 8000);
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
    base.setAttribute('material', 'opacity:1'); // Reset opacity for next time
    
    // Hide cube when target lost
    cube.setAttribute('visible', false);
    
    // Hide and reset About Me layers (Art, AboutMe)
    artLayer.setAttribute('visible', false);
    artLayer.setAttribute('material', 'opacity:0');
    aboutMeLayer.setAttribute('visible', false);
    aboutMeLayer.setAttribute('material', 'opacity:0');
    
    // Hide and reset WAN slides
    wanSlides.forEach(slide => {
      slide.setAttribute('visible', false);
      slide.setAttribute('material', 'opacity:0');
    });
    const wanNav = document.getElementById('wan-nav-container');
    if (wanNav) {
      wanNav.style.display = 'none';
    }
    currentWANSlide = 0;
    
    // Hide and reset Vendetta content
    vendettaLayer.setAttribute('visible', false);
    vendettaLayer.setAttribute('material', 'opacity:0');
      vendettaVideo.setAttribute('visible', false);
      vendettaVideo.setAttribute('material', 'opacity:0');
      // Stop video
      const videoEl = getVendettaVideoElement();
      if (videoEl) {
        videoEl.pause();
        videoEl.currentTime = 0;
        isVendettaVideoPlaying = false;
      }
      
      // Hide video controls
      const controlsContainer = document.getElementById('vendetta-video-controls');
      if (controlsContainer) {
        controlsContainer.style.display = 'none';
      }
    
    // Reset page state to home
    currentPage = PAGE_STATE.HOME;
    
    // Hide HUD buttons when target lost
    const hud = document.getElementById('hud');
    if (hud) {
      hud.classList.remove('active');
      hud.classList.remove('expanded');
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

  // ---------- Page State Management ----------
  const PAGE_STATE = {
    HOME: 'home',
    ABOUT_ME: 'about-me',
    WAN: 'wan',
    VENDETTA: 'vendetta'
  };
  let currentPage = PAGE_STATE.HOME;
  
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
      base.setAttribute('visible', true);
      base.setAttribute('material', 'opacity:1'); // Restore base opacity
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
        
      case 'left': // Vendetta (replaced LinkedIn)
        console.log('[CUBE] Vendetta button clicked - showing presentation');
        // Show Vendetta presentation when cube face is clicked
        showVendettaPresentation();
        break;
        
      default:
        console.log(`[CUBE] No action for ${faceName}`);
        break;
    }
  };
  
  // ---------- WAN Slide Viewer ----------
  let currentWANSlide = 0;
  const totalWANSlides = 5;
  
  // ---------- Page Transition Functions ----------
  const showHomePage = () => {
    console.log('[PAGE] Showing home page');
    currentPage = PAGE_STATE.HOME;
    
    // Hide all other content
    artLayer.emit('hide-art');
    aboutMeLayer.emit('hide-aboutme');
    wanSlides.forEach(slide => slide.emit('hide-wan-slide'));
    vendettaLayer.emit('hide-vendetta');
    vendettaVideo.emit('hide-vendetta-video');
    
    // Stop video if playing
    const videoEl = getVendettaVideoElement();
    if (videoEl) {
      videoEl.pause();
      videoEl.currentTime = 0;
      isVendettaVideoPlaying = false;
    }
    
    // Hide WAN navigation
    const wanNav = document.getElementById('wan-nav-container');
    if (wanNav) {
      wanNav.style.display = 'none';
    }
    
    // After fade out, show home elements
    setTimeout(() => {
      // Hide About Me, WAN, and Vendetta content
      artLayer.setAttribute('visible', false);
      artLayer.setAttribute('material', 'opacity:0');
      aboutMeLayer.setAttribute('visible', false);
      aboutMeLayer.setAttribute('material', 'opacity:0');
      wanSlides.forEach(slide => {
        slide.setAttribute('visible', false);
        slide.setAttribute('material', 'opacity:0');
      });
      vendettaLayer.setAttribute('visible', false);
      vendettaLayer.setAttribute('material', 'opacity:0');
      vendettaVideo.setAttribute('visible', false);
      vendettaVideo.setAttribute('material', 'opacity:0');
      
      // Show home elements: base, text, triangles
      base.setAttribute('visible', true);
      base.setAttribute('material', 'opacity:1');
      text.setAttribute('visible', true);
      text.setAttribute('material', 'opacity:1');
      [t1, t2, t3, t4].forEach(el => {
        el.setAttribute('visible', true);
        el.setAttribute('material', 'opacity:0.5');
        el.emit('pulse-start');
      });
      
      // Reset cube rotation
      cubeController.resetRotation();
      
      console.log('[PAGE] Home page displayed');
    }, 900);
  };
  
  const showAboutMePage = () => {
    console.log('[PAGE] Showing About Me page');
    const previousPage = currentPage;
    currentPage = PAGE_STATE.ABOUT_ME;
    
    // Fade out current page content based on previous state
    if (previousPage === PAGE_STATE.VENDETTA) {
      // Coming from Vendetta: fade out Vendetta content
      vendettaLayer.emit('hide-vendetta');
      vendettaVideo.emit('hide-vendetta-video');
      const videoEl = getVendettaVideoElement();
      if (videoEl) {
        videoEl.pause();
        videoEl.currentTime = 0;
        isVendettaVideoPlaying = false;
      }
    } else if (previousPage === PAGE_STATE.WAN) {
      // Coming from WAN: fade out WAN slides
      wanSlides.forEach(slide => slide.emit('hide-wan-slide'));
      const wanNav = document.getElementById('wan-nav-container');
      if (wanNav) {
        wanNav.style.display = 'none';
      }
    } else {
      // Coming from home: fade out text and triangles
      [t1, t2, t3, t4].forEach(el => el.emit('pulse-stop'));
      text.emit('hide-text');
      [t1, t2, t3, t4].forEach(el => el.emit('hide-triangles'));
    }
    
    // Ensure base stays visible
    base.setAttribute('visible', true);
    base.setAttribute('material', 'opacity:1');
    
    // After fade out, show About Me content
    setTimeout(() => {
      // Hide previous content
      if (previousPage === PAGE_STATE.VENDETTA) {
        vendettaLayer.setAttribute('visible', false);
        vendettaLayer.setAttribute('material', 'opacity:0');
        vendettaVideo.setAttribute('visible', false);
        vendettaVideo.setAttribute('material', 'opacity:0');
      } else if (previousPage === PAGE_STATE.WAN) {
        wanSlides.forEach(slide => {
          slide.setAttribute('visible', false);
          slide.setAttribute('material', 'opacity:0');
        });
      } else {
        text.setAttribute('visible', false);
        [t1, t2, t3, t4].forEach(el => {
          el.setAttribute('visible', false);
          el.setAttribute('material', 'opacity:0');
        });
      }
      
      // Show Art.png first
      artLayer.setAttribute('visible', true);
      artLayer.setAttribute('material', 'opacity:0');
      artLayer.emit('show-art');
      
      // Then show AboutMe.png after Art fades in
      setTimeout(() => {
        aboutMeLayer.setAttribute('visible', true);
        aboutMeLayer.setAttribute('material', 'opacity:0');
        aboutMeLayer.emit('show-aboutme');
        console.log('[PAGE] About Me page displayed');
      }, 800);
      
      // Reset cube rotation
      cubeController.resetRotation();
    }, 900);
  };
  
  const showWANPresentation = () => {
    console.log('[PAGE] Showing WAN presentation');
    const previousPage = currentPage;
    currentPage = PAGE_STATE.WAN;
    
    // Fade out current page content based on previous state
    if (previousPage === PAGE_STATE.ABOUT_ME) {
      // Coming from About Me: fade out Art and AboutMe
      artLayer.emit('hide-art');
      aboutMeLayer.emit('hide-aboutme');
    } else if (previousPage === PAGE_STATE.VENDETTA) {
      // Coming from Vendetta: fade out Vendetta content
      vendettaLayer.emit('hide-vendetta');
      vendettaVideo.emit('hide-vendetta-video');
      const videoEl = getVendettaVideoElement();
      if (videoEl) {
        videoEl.pause();
        videoEl.currentTime = 0;
        isVendettaVideoPlaying = false;
      }
    } else {
      // Coming from home: fade out text and triangles
      [t1, t2, t3, t4].forEach(el => el.emit('pulse-stop'));
      text.emit('hide-text');
      [t1, t2, t3, t4].forEach(el => el.emit('hide-triangles'));
    }
    
    // Rotate cube to show Net.jpeg side
    setTimeout(() => {
      rotateCubeToNet();
    }, 100);
    
    // After fade out, show WAN slides
    setTimeout(() => {
      // Hide previous content
      if (previousPage === PAGE_STATE.ABOUT_ME) {
        artLayer.setAttribute('visible', false);
        artLayer.setAttribute('material', 'opacity:0');
        aboutMeLayer.setAttribute('visible', false);
        aboutMeLayer.setAttribute('material', 'opacity:0');
      } else if (previousPage === PAGE_STATE.VENDETTA) {
        vendettaLayer.setAttribute('visible', false);
        vendettaLayer.setAttribute('material', 'opacity:0');
        vendettaVideo.setAttribute('visible', false);
        vendettaVideo.setAttribute('material', 'opacity:0');
      } else {
        text.setAttribute('visible', false);
        [t1, t2, t3, t4].forEach(el => {
          el.setAttribute('visible', false);
          el.setAttribute('material', 'opacity:0');
        });
      }
      
      // Hide base (WAN slides replace everything)
      base.setAttribute('visible', false);
      base.setAttribute('material', 'opacity:0');
      
      // Show first WAN slide
      wanSlides.forEach(slide => {
        slide.setAttribute('visible', false);
        slide.setAttribute('material', 'opacity:0');
      });
      
      currentWANSlide = 0;
      wanSlides[0].setAttribute('visible', true);
      wanSlides[0].setAttribute('material', 'opacity:0');
      wanSlides[0].emit('show-wan-slide');
      
      // Create navigation buttons if they don't exist
      createWANNavigation();
      updateWANNavButtons();
      
      console.log('[PAGE] WAN presentation displayed');
    }, 900);
  };
  
  const showVendettaPresentation = () => {
    console.log('[PAGE] Showing Vendetta presentation');
    const previousPage = currentPage;
    currentPage = PAGE_STATE.VENDETTA;
    
    // Fade out current page content based on previous state
    if (previousPage === PAGE_STATE.ABOUT_ME) {
      // Coming from About Me: fade out Art and AboutMe
      artLayer.emit('hide-art');
      aboutMeLayer.emit('hide-aboutme');
    } else if (previousPage === PAGE_STATE.WAN) {
      // Coming from WAN: fade out WAN slides
      wanSlides.forEach(slide => slide.emit('hide-wan-slide'));
      const wanNav = document.getElementById('wan-nav-container');
      if (wanNav) {
        wanNav.style.display = 'none';
      }
    } else {
      // Coming from home: fade out text and triangles
      [t1, t2, t3, t4].forEach(el => el.emit('pulse-stop'));
      text.emit('hide-text');
      [t1, t2, t3, t4].forEach(el => el.emit('hide-triangles'));
    }
    
    // Rotate cube to show Vendetta_Cube.png side (smoothly)
    setTimeout(() => {
      rotateCubeToVendetta();
    }, 100);
    
    // After fade out, show Vendetta content
    setTimeout(() => {
      // Hide previous content
      if (previousPage === PAGE_STATE.ABOUT_ME) {
        artLayer.setAttribute('visible', false);
        artLayer.setAttribute('material', 'opacity:0');
        aboutMeLayer.setAttribute('visible', false);
        aboutMeLayer.setAttribute('material', 'opacity:0');
      } else if (previousPage === PAGE_STATE.WAN) {
        wanSlides.forEach(slide => {
          slide.setAttribute('visible', false);
          slide.setAttribute('material', 'opacity:0');
        });
      } else {
        text.setAttribute('visible', false);
        [t1, t2, t3, t4].forEach(el => {
          el.setAttribute('visible', false);
          el.setAttribute('material', 'opacity:0');
        });
      }
      
      // Hide base (Vendetta replaces everything)
      base.setAttribute('visible', false);
      base.setAttribute('material', 'opacity:0');
      
      // Show Vendetta layer
      vendettaLayer.setAttribute('visible', true);
      vendettaLayer.setAttribute('material', 'opacity:0');
      vendettaLayer.emit('show-vendetta');
      
      // Show video after Vendetta layer fades in
      setTimeout(() => {
        vendettaVideo.setAttribute('visible', true);
        vendettaVideo.setAttribute('material', 'opacity:0');
        vendettaVideo.emit('show-vendetta-video');
        
        // Create video controls if they don't exist
        createVendettaVideoControls();
        
        console.log('[PAGE] Vendetta presentation displayed with video');
      }, 800);
      
      console.log('[PAGE] Vendetta presentation displayed');
    }, 900);
  };
  
  const createVendettaVideoControls = () => {
    let controlsContainer = document.getElementById('vendetta-video-controls');
    
    if (!controlsContainer) {
      controlsContainer = document.createElement('div');
      controlsContainer.id = 'vendetta-video-controls';
      controlsContainer.className = 'wan-navigation'; // Reuse WAN navigation styles (positioned on right side)
      // Keep default WAN navigation positioning (right side, vertical)
      
      // Play/Pause button
      const playPauseBtn = document.createElement('button');
      playPauseBtn.className = 'wan-nav-btn vendetta-play-pause';
      playPauseBtn.innerHTML = '▶';
      playPauseBtn.addEventListener('click', () => {
        toggleVendettaVideo();
      });
      controlsContainer.appendChild(playPauseBtn);
      
      // Close button
      const closeBtn = document.createElement('button');
      closeBtn.className = 'wan-nav-btn wan-nav-close';
      closeBtn.innerHTML = '✕';
      closeBtn.addEventListener('click', () => {
        closeVendettaPresentation();
      });
      controlsContainer.appendChild(closeBtn);
      
      document.body.appendChild(controlsContainer);
      console.log('[VENDETTA] Video controls created');
    }
    
    controlsContainer.style.display = 'flex';
    updateVendettaPlayButton();
  };
  
  const toggleVendettaVideo = () => {
    const videoEl = getVendettaVideoElement();
    
    if (!videoEl) {
      console.warn('[VENDETTA] Video element not found');
      return;
    }
    
    if (isVendettaVideoPlaying) {
      videoEl.pause();
      isVendettaVideoPlaying = false;
      console.log('[VENDETTA] Video paused');
    } else {
      videoEl.play().catch(err => {
        console.error('[VENDETTA] Error playing video:', err);
      });
      isVendettaVideoPlaying = true;
      console.log('[VENDETTA] Video playing');
    }
    
    updateVendettaPlayButton();
  };
  
  const updateVendettaPlayButton = () => {
    const playPauseBtn = document.querySelector('.vendetta-play-pause');
    if (playPauseBtn) {
      playPauseBtn.innerHTML = isVendettaVideoPlaying ? '⏸' : '▶';
    }
  };
  
  const closeVendettaPresentation = () => {
    console.log('[VENDETTA] Closing Vendetta presentation, returning to home');
    
    // Hide video controls
    const controlsContainer = document.getElementById('vendetta-video-controls');
    if (controlsContainer) {
      controlsContainer.style.display = 'none';
    }
    
    // Fade out Vendetta content
    vendettaLayer.emit('hide-vendetta');
    vendettaVideo.emit('hide-vendetta-video');
    
    // Stop video if playing
    const videoEl = getVendettaVideoElement();
    if (videoEl) {
      videoEl.pause();
      videoEl.currentTime = 0; // Reset to beginning
      isVendettaVideoPlaying = false;
    }
    
    // After fade out, restore home page
    setTimeout(() => {
      vendettaLayer.setAttribute('visible', false);
      vendettaLayer.setAttribute('material', 'opacity:0');
      vendettaVideo.setAttribute('visible', false);
      vendettaVideo.setAttribute('material', 'opacity:0');
      
      // Reset cube rotation
      cubeController.resetRotation();
      
      // Restore home page elements
      showHomePage();
    }, 800);
  };
  
  // Define helper functions BEFORE createWANNavigation so they're available when event listeners are created
  const goToWANSlide = (slideIndex) => {
    if (slideIndex < 0 || slideIndex >= totalWANSlides) return;
    
    // Fade out current slide
    wanSlides[currentWANSlide].emit('hide-wan-slide');
    
    setTimeout(() => {
      wanSlides[currentWANSlide].setAttribute('visible', false);
      currentWANSlide = slideIndex;
      wanSlides[currentWANSlide].setAttribute('visible', true);
      wanSlides[currentWANSlide].setAttribute('material', 'opacity:0');
      wanSlides[currentWANSlide].emit('show-wan-slide');
      updateWANIndicator();
      updateWANNavButtons();
      console.log(`[WAN] Switched to slide ${slideIndex + 1}`);
    }, 400);
  };
  
  const updateWANIndicator = () => {
    const indicator = document.getElementById('wan-slide-indicator');
    if (indicator) {
      indicator.textContent = `${currentWANSlide + 1} / ${totalWANSlides}`;
    }
  };
  
  const updateWANNavButtons = () => {
    const prevBtn = document.querySelector('.wan-nav-prev');
    const nextBtn = document.querySelector('.wan-nav-next');
    if (prevBtn) prevBtn.disabled = currentWANSlide === 0;
    if (nextBtn) nextBtn.disabled = currentWANSlide === totalWANSlides - 1;
  };
  
  const createWANNavigation = () => {
    let navContainer = document.getElementById('wan-nav-container');
    
    if (!navContainer) {
      navContainer = document.createElement('div');
      navContainer.id = 'wan-nav-container';
      navContainer.className = 'wan-navigation';
      
      // Previous button
      const prevBtn = document.createElement('button');
      prevBtn.className = 'wan-nav-btn wan-nav-prev';
      prevBtn.innerHTML = '◀';
      prevBtn.addEventListener('click', () => {
        if (currentWANSlide > 0) {
          goToWANSlide(currentWANSlide - 1);
        }
      });
      navContainer.appendChild(prevBtn);
      
      // Slide indicator
      const indicator = document.createElement('div');
      indicator.id = 'wan-slide-indicator';
      indicator.className = 'wan-slide-indicator';
      navContainer.appendChild(indicator);
      
      // Next button
      const nextBtn = document.createElement('button');
      nextBtn.className = 'wan-nav-btn wan-nav-next';
      nextBtn.innerHTML = '▶';
      nextBtn.addEventListener('click', () => {
        if (currentWANSlide < totalWANSlides - 1) {
          goToWANSlide(currentWANSlide + 1);
        }
      });
      navContainer.appendChild(nextBtn);
      
      // Close button
      const closeBtn = document.createElement('button');
      closeBtn.className = 'wan-nav-btn wan-nav-close';
      closeBtn.innerHTML = '✕';
      closeBtn.addEventListener('click', () => {
        closeWANPresentation();
      });
      navContainer.appendChild(closeBtn);
      
      // Add navigation to body as DOM overlay (not A-Frame entity)
      document.body.appendChild(navContainer);
      updateWANIndicator();
    }
    
    navContainer.style.display = 'flex';
  };
  
  const closeWANPresentation = () => {
    console.log('[WAN] Closing WAN presentation, returning to home');
    
    // Hide navigation
    const navContainer = document.getElementById('wan-nav-container');
    if (navContainer) {
      navContainer.style.display = 'none';
    }
    
    // Fade out all slides
    wanSlides.forEach(slide => {
      slide.emit('hide-wan-slide');
    });
    
    // After fade out, restore home page
    setTimeout(() => {
      wanSlides.forEach(slide => {
        slide.setAttribute('visible', false);
        slide.setAttribute('material', 'opacity:0');
      });
      
      // Restore home page elements
      showHomePage();
    }, 800);
  };
  
  // ---------- HUD Button Handlers ----------
  const btnAboutMe = document.getElementById('btn-1');
  const btnProjects = document.getElementById('btn-2');
  const hud = document.getElementById('hud');
  
  if (btnAboutMe) {
    btnAboutMe.addEventListener('click', () => {
      console.log('[HUD] About Me button clicked');
      
      // Collapse HUD sub-buttons if expanded
      if (hud) {
        hud.classList.remove('expanded');
      }
      
      // Clear any existing About Me timers
      aboutMeTimers.forEach(timer => clearTimeout(timer));
      aboutMeTimers = [];
      
      // Show About Me page (handles transitions from any page)
      showAboutMePage();
    });
  }
  
  if (btnProjects) {
    btnProjects.addEventListener('click', () => {
      console.log('[HUD] Projects button clicked');
      
      // Check if sub-buttons already exist
      let subButtonsContainer = document.getElementById('sub-buttons-container');
      
      if (!subButtonsContainer) {
        // Create sub-buttons container
        subButtonsContainer = document.createElement('div');
        subButtonsContainer.id = 'sub-buttons-container';
        subButtonsContainer.className = 'sub-buttons';
        
        // Create 3 sub-buttons
        const projects = [
          { id: 'project-wan', label: 'WAN' },
          { id: 'project-vendetta', label: 'Vendetta' },
          { id: 'project-webxr', label: 'WebXR' }
        ];
        
        projects.forEach(project => {
          const btn = document.createElement('button');
          btn.className = 'pill';
          btn.id = project.id;
          btn.textContent = project.label;
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log(`[HUD] Project clicked: ${project.label}`);
            
            if (project.id === 'project-wan') {
              // Show WAN presentation (handles transitions from any page)
              showWANPresentation();
            } else if (project.id === 'project-vendetta') {
              // Show Vendetta presentation (handles transitions from any page)
              showVendettaPresentation();
            }
            // TODO: Implement other project navigation
          });
          subButtonsContainer.appendChild(btn);
        });
        
        // Append to HUD
        if (hud) {
          hud.appendChild(subButtonsContainer);
        }
      }
      
      // Toggle expanded state (don't change HUD size, just show/hide sub-buttons)
      if (hud) {
        hud.classList.toggle('expanded');
        console.log('[HUD] Toggling sub-buttons visibility');
      }
    });
  }
});
