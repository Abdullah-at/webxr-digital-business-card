/**
 * Cube Controller - Three.js based rotation controller
 * Handles interactive rotation of the cube.glb model
 */

export class CubeController {
  constructor(cubeEntity) {
    this.cubeEntity = cubeEntity;
    this.cubeObject3D = null;
    this.isDragging = false;
    this.previousTouch = { x: 0, y: 0 };
    this.rotation = { x: 0, y: 0 };
    this.dragStartTime = 0;
    
    // Wait for model to load
    this.cubeEntity.addEventListener('model-loaded', () => {
      this.cubeObject3D = this.cubeEntity.object3D;
      console.log('[CubeController] Initialized with Three.js object');
      this.setupInteraction();
    });
  }

  setupInteraction() {
    console.log('[CubeController] Setting up interaction...');
    
    // DIRECT touch/mouse on entire screen for cube control
    let interacting = false;
    
    // Start interaction - Mouse
    document.addEventListener('mousedown', (e) => {
      // Check if we're clicking near the cube area
      interacting = true;
      this.startRotation({ x: e.clientX, y: e.clientY });
      console.log('[CubeController] Mouse down');
    });
    
    // Start interaction - Touch
    document.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches[0]) {
        interacting = true;
        const touch = e.touches[0];
        this.startRotation({ x: touch.clientX, y: touch.clientY });
        console.log('[CubeController] Touch start');
      }
    });

    // Move handlers
    document.addEventListener('mousemove', (e) => {
      if (interacting) {
        this.handleMouseMove(e);
      }
    });
    
    document.addEventListener('touchmove', (e) => {
      if (interacting) {
        this.handleTouchMove(e);
      }
    }, { passive: false });
    
    // Stop interaction
    document.addEventListener('mouseup', () => {
      if (interacting) {
        interacting = false;
        this.stopRotation();
      }
    });
    
    document.addEventListener('touchend', () => {
      if (interacting) {
        interacting = false;
        this.stopRotation();
      }
    });
    
    console.log('[CubeController] Interaction setup complete');
  }

  startRotation(point) {
    this.isDragging = true;
    this.previousTouch = { x: point.x, y: point.y };
    this.dragStartTime = Date.now();
    console.log('[CubeController] Rotation started');
  }

  handleMouseMove(event) {
    if (!this.isDragging || !this.cubeObject3D) return;

    const deltaX = event.clientX - this.previousTouch.x;
    const deltaY = event.clientY - this.previousTouch.y;

    this.rotateByDelta(deltaX, deltaY);

    this.previousTouch = { x: event.clientX, y: event.clientY };
  }

  handleTouchMove(event) {
    if (!this.isDragging || !this.cubeObject3D) return;
    if (!event.touches || !event.touches[0]) return;

    event.preventDefault();

    const touch = event.touches[0];
    const deltaX = touch.clientX - this.previousTouch.x;
    const deltaY = touch.clientY - this.previousTouch.y;

    this.rotateByDelta(deltaX, deltaY);

    this.previousTouch = { x: touch.clientX, y: touch.clientY };
  }

  rotateByDelta(deltaX, deltaY) {
    // Sensitivity multiplier
    const sensitivity = 0.01;

    // Update rotation values
    this.rotation.y += deltaX * sensitivity;
    this.rotation.x -= deltaY * sensitivity;

    // Apply rotation using Three.js Euler angles
    this.cubeObject3D.rotation.set(
      this.rotation.x,
      this.rotation.y,
      0,
      'XYZ'
    );
  }

  stopRotation() {
    if (this.isDragging) {
      const duration = Date.now() - this.dragStartTime;
      console.log('[CubeController] Rotation stopped. Duration:', duration, 'ms');
    }
    this.isDragging = false;
  }

  // Check if the last interaction was a quick tap (not a drag)
  wasQuickTap() {
    const duration = Date.now() - this.dragStartTime;
    return duration < 200; // Less than 200ms = tap, not drag
  }

  // Reset rotation to initial state
  resetRotation() {
    this.rotation = { x: 0, y: 0 };
    if (this.cubeObject3D) {
      this.cubeObject3D.rotation.set(0, 0, 0);
    }
  }

  // Get current rotation for debugging
  getRotation() {
    return { ...this.rotation };
  }
}

