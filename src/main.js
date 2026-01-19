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
import aboutMeURLRaw  from '/assets/AboutMe.mp4';
import wanInfoVideoURLRaw from '/assets/WAN_Info.mp4';
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
const wanInfoVideoURLRaw_final = wanInfoVideoURLRaw;
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
  
  // AboutMe video element (replaced image with video)
  // Video is vertical/portrait (9:16 aspect ratio), so adjust dimensions accordingly
  // Use card height as base and calculate width to maintain 9:16 ratio
  const aboutMeVideoHeight = FIT.height * 1.2; // Slightly taller than card
  const aboutMeVideoWidth = aboutMeVideoHeight * (9 / 16); // Calculate width for 9:16 aspect ratio
  const aboutMeLayer = document.createElement('a-video');
  aboutMeLayer.setAttribute('id', 'aboutMeLayer');
  aboutMeLayer.setAttribute('src', getAssetURL(aboutMeURLRaw_final));
  aboutMeLayer.setAttribute('width', String(aboutMeVideoWidth));
  aboutMeLayer.setAttribute('height', String(aboutMeVideoHeight));
  aboutMeLayer.setAttribute('position', `${FIT.x} ${FIT.y} 0.008`);
  aboutMeLayer.setAttribute('material', 'transparent:true; alphaTest:0.01; side:double; opacity:0');
  aboutMeLayer.setAttribute('visible', false);
  aboutMeLayer.setAttribute('autoplay', false); // Will be controlled manually
  aboutMeLayer.setAttribute('loop', false); // Don't loop the video
  markerRoot.appendChild(aboutMeLayer);
  
  // Helper function to get the HTML5 video element for AboutMe
  const getAboutMeVideoElement = () => {
    let videoEl = null;
    
    if (aboutMeLayer.components && aboutMeLayer.components.material) {
      const material = aboutMeLayer.components.material.material;
      if (material && material.map && material.map.image) {
        videoEl = material.map.image;
      }
    }
    
    // Fallback: try to find video element in the scene
    if (!videoEl || videoEl.tagName !== 'VIDEO') {
      videoEl = document.querySelector('#aboutMeLayer video');
    }
    
    return (videoEl && videoEl.tagName === 'VIDEO') ? videoEl : null;
  };
  
  // Set up video to play when it loads and becomes visible
  aboutMeLayer.addEventListener('loadeddata', () => {
    const videoEl = getAboutMeVideoElement();
    if (videoEl) {
      console.log('[ABOUTME] Video element ready');
      // Explicitly set loop to false on the HTML5 video element
      videoEl.loop = false;
      // Add event listener to prevent looping when video ends
      // Remove any existing listeners first to avoid duplicates
      const endedHandler = () => {
        console.log('[ABOUTME] Video ended, not looping');
        videoEl.pause();
        // Ensure loop is still false
        videoEl.loop = false;
      };
      videoEl.removeEventListener('ended', endedHandler);
      videoEl.addEventListener('ended', endedHandler);
      // Video will be played when shown via show-aboutme event
    }
  });
  
  // WAN Info video element (replaced slides with single video)
  const wanInfoVideo = document.createElement('a-video');
  wanInfoVideo.setAttribute('id', 'wanInfoVideo');
  wanInfoVideo.setAttribute('src', getAssetURL(wanInfoVideoURLRaw_final));
  wanInfoVideo.setAttribute('width', String(FIT.width));
  wanInfoVideo.setAttribute('height', String(FIT.height));
  wanInfoVideo.setAttribute('position', `${FIT.x} ${FIT.y} 0.009`);
  wanInfoVideo.setAttribute('material', 'transparent:true; alphaTest:0.01; side:double; opacity:0');
  wanInfoVideo.setAttribute('visible', false);
  wanInfoVideo.setAttribute('autoplay', false); // Will be controlled manually
  wanInfoVideo.setAttribute('loop', false); // Don't loop the video
  wanInfoVideo.setAttribute('animation__fadein', 'property: material.opacity; from: 0; to: 1; dur: 800; easing: easeInOutQuad; startEvents: show-wan-video');
  wanInfoVideo.setAttribute('animation__fadeout', 'property: material.opacity; to: 0; dur: 800; easing: easeInOutQuad; startEvents: hide-wan-video');
  markerRoot.appendChild(wanInfoVideo);
  
  // Helper function to get the HTML5 video element for WAN Info
  const getWANInfoVideoElement = () => {
    let videoEl = null;
    
    if (wanInfoVideo.components && wanInfoVideo.components.material) {
      const material = wanInfoVideo.components.material.material;
      if (material && material.map && material.map.image) {
        videoEl = material.map.image;
      }
    }
    
    // Fallback: try to find video element in the scene
    if (!videoEl || videoEl.tagName !== 'VIDEO') {
      videoEl = document.querySelector('#wanInfoVideo video');
    }
    
    return (videoEl && videoEl.tagName === 'VIDEO') ? videoEl : null;
  };
  
  // Set up video to play when it loads
  wanInfoVideo.addEventListener('loadeddata', () => {
    const videoEl = getWANInfoVideoElement();
    if (videoEl) {
      console.log('[WAN] Video element ready');
      // Explicitly set loop to false on the HTML5 video element
      videoEl.loop = false;
      // Add event listener to prevent looping when video ends
      const endedHandler = () => {
        console.log('[WAN] Video ended, not looping');
        videoEl.pause();
        videoEl.loop = false;
      };
      videoEl.removeEventListener('ended', endedHandler);
      videoEl.addEventListener('ended', endedHandler);
    }
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
  
  // Set up video to play when it loads (like WAN video)
  vendettaVideo.addEventListener('loadeddata', () => {
    const videoEl = getVendettaVideoElement();
    if (videoEl) {
      console.log('[VENDETTA] Video element ready');
      // Explicitly set loop to false on the HTML5 video element
      videoEl.loop = false;
      // Add event listener to prevent looping when video ends
      const endedHandler = () => {
        console.log('[VENDETTA] Video ended, not looping');
        videoEl.pause();
        videoEl.loop = false;
      };
      videoEl.removeEventListener('ended', endedHandler);
      videoEl.addEventListener('ended', endedHandler);
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
    
    // Hide and reset About Me layers (Art, AboutMe video)
    artLayer.setAttribute('visible', false);
    artLayer.setAttribute('material', 'opacity:0');
    aboutMeLayer.setAttribute('visible', false);
    aboutMeLayer.setAttribute('material', 'opacity:0');
    // Pause video when hidden
    const aboutMeVideoEl = getAboutMeVideoElement();
    if (aboutMeVideoEl) {
      aboutMeVideoEl.pause();
      aboutMeVideoEl.currentTime = 0;
    }
    
    // Hide and reset WAN video
    wanInfoVideo.setAttribute('visible', false);
    wanInfoVideo.setAttribute('material', 'opacity:0');
    const wanVideoEl = getWANInfoVideoElement();
    if (wanVideoEl) {
      wanVideoEl.pause();
      wanVideoEl.currentTime = 0;
    }
    
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
  
  // ---------- Page Transition Functions ----------
  const showHomePage = () => {
    console.log('[PAGE] Showing home page');
    currentPage = PAGE_STATE.HOME;
    
    // Hide all other content
    artLayer.emit('hide-art');
    aboutMeLayer.emit('hide-aboutme');
    wanInfoVideo.emit('hide-wan-video');
    const wanVideoEl = getWANInfoVideoElement();
    if (wanVideoEl) {
      wanVideoEl.pause();
      wanVideoEl.currentTime = 0;
    }
    vendettaLayer.emit('hide-vendetta');
    vendettaVideo.emit('hide-vendetta-video');
    
    // Stop video if playing
    const videoEl = getVendettaVideoElement();
    if (videoEl) {
      videoEl.pause();
      videoEl.currentTime = 0;
    }
    
    // WAN video is handled in individual page transitions
    
    // After fade out, show home elements
    setTimeout(() => {
      // Hide About Me, WAN, and Vendetta content
      artLayer.setAttribute('visible', false);
      artLayer.setAttribute('material', 'opacity:0');
      aboutMeLayer.setAttribute('visible', false);
      aboutMeLayer.setAttribute('material', 'opacity:0');
      // Pause AboutMe video when returning to home
      const aboutMeVideoEl = getAboutMeVideoElement();
      if (aboutMeVideoEl) {
        aboutMeVideoEl.pause();
        aboutMeVideoEl.currentTime = 0;
      }
      wanInfoVideo.setAttribute('visible', false);
      wanInfoVideo.setAttribute('material', 'opacity:0');
      const wanVideoEl2 = getWANInfoVideoElement();
      if (wanVideoEl2) {
        wanVideoEl2.pause();
        wanVideoEl2.currentTime = 0;
      }
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
      }
    } else if (previousPage === PAGE_STATE.WAN) {
      // Coming from WAN: fade out WAN video
      wanInfoVideo.emit('hide-wan-video');
      const wanVideoEl8 = getWANInfoVideoElement();
      if (wanVideoEl8) {
        wanVideoEl8.pause();
        wanVideoEl8.currentTime = 0;
      }
    } else {
      // Coming from home: fade out text, triangles, and base
      [t1, t2, t3, t4].forEach(el => el.emit('pulse-stop'));
      text.emit('hide-text');
      base.emit('hide-text'); // Fade out base as well
      [t1, t2, t3, t4].forEach(el => el.emit('hide-triangles'));
    }
    
    // After fade out, show only About Me video (no Art.png, no Card_Base.png)
    setTimeout(() => {
      // Hide all previous content including base and art
      base.setAttribute('visible', false);
      base.setAttribute('material', 'opacity:0');
      artLayer.setAttribute('visible', false);
      artLayer.setAttribute('material', 'opacity:0');
      
      if (previousPage === PAGE_STATE.VENDETTA) {
        vendettaLayer.setAttribute('visible', false);
        vendettaLayer.setAttribute('material', 'opacity:0');
        vendettaVideo.setAttribute('visible', false);
        vendettaVideo.setAttribute('material', 'opacity:0');
        // Pause Vendetta video
        const videoEl = getVendettaVideoElement();
        if (videoEl) {
          videoEl.pause();
          videoEl.currentTime = 0;
        }
      } else if (previousPage === PAGE_STATE.WAN) {
        wanInfoVideo.setAttribute('visible', false);
        wanInfoVideo.setAttribute('material', 'opacity:0');
        const wanVideoEl7 = getWANInfoVideoElement();
        if (wanVideoEl7) {
          wanVideoEl7.pause();
          wanVideoEl7.currentTime = 0;
        }
      } else {
        text.setAttribute('visible', false);
        [t1, t2, t3, t4].forEach(el => {
          el.setAttribute('visible', false);
          el.setAttribute('material', 'opacity:0');
        });
      }
      
      // Show only AboutMe.mp4 video (no Art.png, no Card_Base.png)
      aboutMeLayer.setAttribute('visible', true);
      aboutMeLayer.setAttribute('material', 'opacity:0');
      aboutMeLayer.emit('show-aboutme');
      
      // Ensure video plays when shown - wait for fade-in to start, then play
      setTimeout(() => {
        const aboutMeVideoEl = getAboutMeVideoElement();
        if (aboutMeVideoEl) {
          // Explicitly disable looping on the HTML5 video element
          aboutMeVideoEl.loop = false;
          aboutMeVideoEl.currentTime = 0; // Reset to beginning
          aboutMeVideoEl.play().catch(err => {
            console.warn('[ABOUTME] Video autoplay prevented, user interaction required:', err);
          });
          console.log('[ABOUTME] Video playback started (loop disabled)');
        } else {
          // If video element not found yet, try again after a short delay
          setTimeout(() => {
            const videoEl = getAboutMeVideoElement();
            if (videoEl) {
              // Explicitly disable looping on the HTML5 video element
              videoEl.loop = false;
              videoEl.currentTime = 0; // Reset to beginning
              videoEl.play().catch(err => {
                console.warn('[ABOUTME] Video autoplay prevented (retry):', err);
              });
            }
          }, 200);
        }
      }, 100);
      
      console.log('[PAGE] About Me page displayed with video only');
      
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
      
      // Hide base (WAN video replaces everything)
      base.setAttribute('visible', false);
      base.setAttribute('material', 'opacity:0');
      
      // Show WAN Info video
      wanInfoVideo.setAttribute('visible', true);
      wanInfoVideo.setAttribute('material', 'opacity:0');
      wanInfoVideo.emit('show-wan-video');
      
      // Ensure video plays when shown - wait for fade-in to start, then play
      setTimeout(() => {
        const wanVideoEl = getWANInfoVideoElement();
        if (wanVideoEl) {
          // Explicitly disable looping on the HTML5 video element
          wanVideoEl.loop = false;
          wanVideoEl.currentTime = 0; // Reset to beginning
          wanVideoEl.play().catch(err => {
            console.warn('[WAN] Video autoplay prevented, user interaction required:', err);
          });
          console.log('[WAN] Video playback started (loop disabled)');
        } else {
          // If video element not found yet, try again after a short delay
          setTimeout(() => {
            const videoEl = getWANInfoVideoElement();
            if (videoEl) {
              // Explicitly disable looping on the HTML5 video element
              videoEl.loop = false;
              videoEl.currentTime = 0; // Reset to beginning
              videoEl.play().catch(err => {
                console.warn('[WAN] Video autoplay prevented (retry):', err);
              });
            }
          }, 200);
        }
      }, 100);
      
      console.log('[PAGE] WAN presentation displayed with video');
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
      // Coming from WAN: fade out WAN video
      wanInfoVideo.emit('hide-wan-video');
      const wanVideoEl = getWANInfoVideoElement();
      if (wanVideoEl) {
        wanVideoEl.pause();
        wanVideoEl.currentTime = 0;
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
        wanInfoVideo.setAttribute('visible', false);
        wanInfoVideo.setAttribute('material', 'opacity:0');
        const wanVideoEl6 = getWANInfoVideoElement();
        if (wanVideoEl6) {
          wanVideoEl6.pause();
          wanVideoEl6.currentTime = 0;
        }
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
        
        // Ensure video plays when shown - wait for fade-in to start, then play
        setTimeout(() => {
          const vendettaVideoEl = getVendettaVideoElement();
          if (vendettaVideoEl) {
            // Explicitly disable looping on the HTML5 video element
            vendettaVideoEl.loop = false;
            vendettaVideoEl.currentTime = 0; // Reset to beginning
            vendettaVideoEl.play().catch(err => {
              console.warn('[VENDETTA] Video autoplay prevented, user interaction required:', err);
            });
            console.log('[VENDETTA] Video playback started (loop disabled)');
          } else {
            // If video element not found yet, try again after a short delay
            setTimeout(() => {
              const videoEl = getVendettaVideoElement();
              if (videoEl) {
                // Explicitly disable looping on the HTML5 video element
                videoEl.loop = false;
                videoEl.currentTime = 0; // Reset to beginning
                videoEl.play().catch(err => {
                  console.warn('[VENDETTA] Video autoplay prevented (retry):', err);
                });
              }
            }, 200);
          }
        }, 100);
        
        console.log('[PAGE] Vendetta presentation displayed with video');
      }, 800);
      
      console.log('[PAGE] Vendetta presentation displayed');
    }, 900);
  };
  
  const closeVendettaPresentation = () => {
    console.log('[VENDETTA] Closing Vendetta presentation, returning to home');
    
    // Fade out Vendetta content
    vendettaLayer.emit('hide-vendetta');
    vendettaVideo.emit('hide-vendetta-video');
    
    // Stop video if playing
    const videoEl = getVendettaVideoElement();
    if (videoEl) {
      videoEl.pause();
      videoEl.currentTime = 0; // Reset to beginning
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
  
  const closeWANPresentation = () => {
    console.log('[WAN] Closing WAN presentation, returning to home');
    
    // Fade out WAN video
    wanInfoVideo.emit('hide-wan-video');
    
    // Pause video
    const wanVideoEl = getWANInfoVideoElement();
    if (wanVideoEl) {
      wanVideoEl.pause();
      wanVideoEl.currentTime = 0;
    }
    
    // After fade out, restore home page
    setTimeout(() => {
      wanInfoVideo.setAttribute('visible', false);
      wanInfoVideo.setAttribute('material', 'opacity:0');
      
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
        
        // Create 2 sub-buttons (removed WebXR)
        const projects = [
          { id: 'project-wan', label: 'WAN' },
          { id: 'project-vendetta', label: 'Vendetta' }
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
