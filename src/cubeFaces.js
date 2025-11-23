/**
 * Cube Faces - Adds interactive button labels to each face of the cube
 * Buttons are positioned in world space and follow the cube's transforms
 */

export class CubeFaces {
  constructor(cubeEntity, markerRoot) {
    this.cubeEntity = cubeEntity;
    this.markerRoot = markerRoot;
    this.faces = [];
    this.buttonsContainer = null;
    
    // Define the 6 faces with their content
    // Offsets relative to cube center
    this.faceConfig = [
      { name: 'front',  label: 'About\nMe',   offset: { x: 0, y: 0, z: 0.1 } },
      { name: 'back',   label: 'Portfolio',   offset: { x: 0, y: 0, z: -0.1 } },
      { name: 'right',  label: 'WhatsApp',    offset: { x: 0.1, y: 0, z: 0 } },
      { name: 'left',   label: 'LinkedIn',    offset: { x: -0.1, y: 0, z: 0 } },
      { name: 'top',    label: 'Instagram',   offset: { x: 0, y: 0.1, z: 0 } },
      { name: 'bottom', label: 'Metaverse',   offset: { x: 0, y: -0.1, z: 0 } }
    ];
    
    // Wait for cube model to load
    this.cubeEntity.addEventListener('model-loaded', () => {
      console.log('[CubeFaces] Cube loaded, creating face labels...');
      this.createFaceLabels();
    });
  }

  createFaceLabels() {
    console.log('[CubeFaces] Adding 2 image buttons (LinkedIn + Net)...');
    
    // Buttons are CHILDREN of cube so they rotate with it
    // Positions are RELATIVE to cube's local origin (0,0,0)
    // Cube is scaled 0.03, so we need large values to see them
    
    const sideDistance = 16; // Distance from origin to left/right (appears outside cube)
    const buttonSize = 24; // Size in cube's local units
    
    setTimeout(() => {
      // Get base path (always set to /webxr-digital-business-card)
// Get base path from global (set in index.html)
const basePath = window.AR_BASE_PATH || '';
      
      // Build paths with base path
      const vendettaCubeSrc = `${basePath}/assets/Vendetta_Cube.png`;
      const netSrc = `${basePath}/assets/Net.jpeg`;
      
      // Left side - Vendetta_Cube (replacing LinkedIn)
      this.createImageButton('left', 'Vendetta', vendettaCubeSrc, 
        `${-sideDistance} 0 0`, '0 -90 0', buttonSize);
      
      // Right side - Net  
      this.createImageButton('right', 'Net', netSrc, 
        `${sideDistance} 0 0`, '0 90 0', buttonSize);
      
      console.log('[CubeFaces] 2 buttons created - LEFT: Vendetta_Cube, RIGHT: Net');
      console.log('[CubeFaces] Vendetta_Cube path:', vendettaCubeSrc, 'Net path:', netSrc);
    }, 1000);
  }
  
  createImageButton(name, label, imageSrc, position, rotation, size) {
    // Create container for button (no shadow)
    const container = document.createElement('a-entity');
    container.setAttribute('position', position);
    container.setAttribute('rotation', rotation);
    
    // Image button (no shadow, 70% opacity)
    const imageButton = document.createElement('a-image');
    imageButton.setAttribute('src', imageSrc);
    imageButton.setAttribute('width', size.toString());
    imageButton.setAttribute('height', size.toString());
    imageButton.setAttribute('position', '0 0 0');
    imageButton.setAttribute('material', 'transparent: true; alphaTest: 0.1; side: double; opacity: 0.7');
    imageButton.setAttribute('class', 'clickable face-button');
    imageButton.setAttribute('data-face', name);
    
    // Click/Touch animation - trigger manually on tap
    imageButton.setAttribute('animation__press', 
      'property: scale; from: 1 1 1; to: 0.85 0.85 1; dur: 150; easing: easeOutQuad; startEvents: buttonpress');
    imageButton.setAttribute('animation__release', 
      'property: scale; from: 0.85 0.85 1; to: 1 1 1; dur: 150; delay: 150; easing: easeOutQuad; startEvents: buttonpress');
    
    // Add click listener to trigger animation
    imageButton.addEventListener('click', () => {
      imageButton.emit('buttonpress');
      console.log(`[CubeFaces] ${label} button pressed`);
    });
    
    container.appendChild(imageButton);
    
    // Add container as CHILD of cube so it rotates with cube
    this.cubeEntity.appendChild(container);
    this.faces.push({ name, element: imageButton, label });
    
    console.log(`[CubeFaces] Created ${name} button with 70% opacity & tap animation: "${label}"`);
  }

  // Get face by name
  getFace(name) {
    return this.faces.find(f => f.name === name);
  }

  // Update face label
  updateFaceLabel(faceName, newLabel) {
    const face = this.getFace(faceName);
    if (face) {
      face.element.setAttribute('text', 'value', newLabel);
      face.label = newLabel;
    }
  }

  // Show/hide all face labels
  setVisible(visible) {
    this.faces.forEach(face => {
      face.element.setAttribute('visible', visible);
    });
  }
}

