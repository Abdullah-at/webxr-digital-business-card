// ---------- Digital card textures (served from /public/assets) ----------
const cardBaseURL = './assets/Card_Base.png';
const cardTextURL = './assets/Card_Text.png';
const tri1URL     = './assets/Triangles1.png';
const tri2URL     = './assets/Triangles2.png';
const tri3URL     = './assets/Triangles3.png';
const tri4URL     = './assets/Triangles4.png';

const FIT = { width: 1.000, height: 0.780, x: 0.000, y: 0.000 };

window.addEventListener('DOMContentLoaded', () => {
  const hud = document.getElementById('hud');
  const markerRoot = document.getElementById('markerRoot');
  if (!markerRoot) return;

  markerRoot.addEventListener('targetFound', () => hud?.classList.add('active'));
  markerRoot.addEventListener('targetLost',  () => hud?.classList.remove('active'));

  // ---------- Digital card layers (start invisible) ----------
  const makeLayer = (id, z) => {
    const el = document.createElement('a-image');
    el.id = id;
    el.setAttribute('width', FIT.width);
    el.setAttribute('height', FIT.height);
    el.setAttribute('position', `${FIT.x} ${FIT.y} ${z}`);
    el.setAttribute('material', 'transparent:true; alphaTest:0.01; side:double; opacity:0');
    markerRoot.appendChild(el);
    return el;
  };

  const base = makeLayer('cardBase', 0.000);
  const text = makeLayer('cardText', 0.001);
  const t1 = makeLayer('tri1', 0.002);
  const t2 = makeLayer('tri2', 0.003);
  const t3 = makeLayer('tri3', 0.004);
  const t4 = makeLayer('tri4', 0.005);

  base.setAttribute('src', cardBaseURL);
  text.setAttribute('src', cardTextURL);
  t1.setAttribute('src', tri1URL);
  t2.setAttribute('src', tri2URL);
  t3.setAttribute('src', tri3URL);
  t4.setAttribute('src', tri4URL);
  [t1,t2,t3,t4].forEach(el => el.setAttribute('opacity','0.5'));

  // animations for text + triangles
  text.setAttribute('animation__fade','property: material.opacity; from: 1; to: 0; dur: 1200; easing: easeInOutQuad; startEvents: start-fade');
  const pulse = (el, name, delay) =>
    el.setAttribute(`animation__${name}`,
      `property: material.opacity; from: 0.25; to: 1; dir: alternate; loop: true; dur: 900; easing: easeInOutSine; delay: ${delay}; startEvents: pulse-start; pauseEvents: pulse-stop`);
  pulse(t1,'p1',0); pulse(t2,'p2',200); pulse(t3,'p3',400); pulse(t4,'p4',600);

  const showCard = () => {
    [base,text,t1,t2,t3,t4].forEach(el => el.setAttribute('material','opacity:1; transparent:true; alphaTest:0.01; side:double'));
    [t1,t2,t3,t4].forEach(el => el.emit('pulse-start'));
    setTimeout(() => text.emit('start-fade'), 10000);
  };

  // ---------- UFO setup ----------
  const ufoRig = document.createElement('a-entity');
  const ufo = document.createElement('a-entity');
  ufo.setAttribute('gltf-model','#ufoModel');
  ufo.setAttribute('scale','0.1 0.1 0.1');
  ufoRig.appendChild(ufo);
  markerRoot.appendChild(ufoRig);

  // beam cone under UFO
  const beam = document.createElement('a-entity');
  beam.setAttribute('geometry','primitive: cone; radiusTop: 0; radiusBottom: 0.12; height: 0.22;');
  beam.setAttribute('material','color:#5cf4ff; opacity:0.0; transparent:true; side:double;');
  beam.setAttribute('position','0 -0.13 0');
  ufo.appendChild(beam);

  const START = {x: 0.4, y: 0.12, z: -0.25, scale: 0.07};
  const CENTER_Y = 0.08;
  const RADIUS = 0.35;

  const resetUFO = () => {
    ufoRig.setAttribute('rotation','0 0 0');
    ufo.setAttribute('position',`${START.x} ${START.y} ${START.z}`);
    ufo.setAttribute('scale',`${START.scale} ${START.scale} ${START.scale}`);
    beam.setAttribute('material','opacity:0.0;');
  };
  resetUFO();

  const playFlyIn = () => {
    ufo.setAttribute('animation__pos',`property: position; from: ${START.x} ${START.y} ${START.z}; to: ${RADIUS} ${CENTER_Y} 0; dur: 1200; easing: easeOutQuad;`);
    ufo.setAttribute('animation__scale',`property: scale; from: ${START.scale} ${START.scale} ${START.scale}; to: 0.1 0.1 0.1; dur: 1200; easing: easeOutQuad;`);
    ufo.addEventListener('animationcomplete__pos', startOrbit, {once:true});
  };

  const startOrbit = () => {
    ufoRig.setAttribute('animation__orbit',`property: rotation; to: 0 720 0; dur: 6000; easing: linear; loop: 1;`);
    ufoRig.addEventListener('animationcomplete__orbit', finishHover, {once:true});
  };

  const finishHover = () => {
    ufo.setAttribute('animation__center',`property: position; to: 0 ${CENTER_Y} 0; dur: 900; easing: easeInOutQuad;`);
    ufo.addEventListener('animationcomplete__center', () => {
      beam.setAttribute('animation__beam','property: material.opacity; from:0; to:0.6; dur:1000; easing:easeInOutSine;');
      showCard(); // now reveal card
    }, {once:true});
  };

  markerRoot.addEventListener('targetFound', () => {
    [base,text,t1,t2,t3,t4].forEach(el => el.setAttribute('material','opacity:0;'));
    resetUFO();
    playFlyIn();
  });

  markerRoot.addEventListener('targetLost', () => {
    beam.setAttribute('material','opacity:0.0;');
    ufoRig.removeAttribute('animation__orbit');
  });
});
