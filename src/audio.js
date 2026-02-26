// ═══ DECADENCE AUDIO ENGINE ═══
// Procedural sound design derived from numogrammatic frequencies.
// All sound generated via Web Audio API — no external files.
// Tuned to evoke K-Goth cybernetics, Barker Spiral tones, 
// and the flatline aesthetics of Cthelll.

let ctx = null;
let masterGain = null;
let ambientNodes = null;
let muted = false;

function getCtx() {
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = ctx.createGain();
      masterGain.gain.value = 0.6;
      masterGain.connect(ctx.destination);
    } catch(e) { return null; }
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function getMaster() {
  getCtx();
  return masterGain;
}

export function setMuted(m) { 
  muted = m; 
  if (masterGain) masterGain.gain.value = m ? 0 : 0.6;
}
export function isMuted() { return muted; }

// ═══ AMBIENT DRONE ═══
// Low sub-bass hum with detuned overtones — the sound of the Plex
// breathing beneath the Time Circuit. Two oscillators slightly 
// detuned create a binaural beating effect.
export function startAmbient() {
  const c = getCtx(); if (!c) return;
  if (ambientNodes) return; // already running

  const g = c.createGain();
  g.gain.value = 0;
  g.connect(getMaster());

  // Sub-bass fundamental — 36Hz (gt-36, the heart of Decadence)
  const osc1 = c.createOscillator();
  osc1.type = 'sine';
  osc1.frequency.value = 36;

  // Detuned second — 36.5Hz, creates slow 0.5Hz beating
  const osc2 = c.createOscillator();
  osc2.type = 'sine';
  osc2.frequency.value = 36.5;

  // Dark harmonic — filtered sawtooth at 72Hz (octave of 36)
  const osc3 = c.createOscillator();
  osc3.type = 'sawtooth';
  osc3.frequency.value = 72;
  const filter = c.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 90;
  filter.Q.value = 8;
  const g3 = c.createGain();
  g3.gain.value = 0.08;
  osc3.connect(filter);
  filter.connect(g3);
  g3.connect(g);

  const g1 = c.createGain(); g1.gain.value = 0.15;
  const g2 = c.createGain(); g2.gain.value = 0.12;
  osc1.connect(g1); g1.connect(g);
  osc2.connect(g2); g2.connect(g);

  osc1.start(); osc2.start(); osc3.start();

  // Fade in over 3 seconds
  g.gain.linearRampToValueAtTime(1, c.currentTime + 3);

  ambientNodes = { g, osc1, osc2, osc3, filter, g3, g1, g2 };
}

export function stopAmbient() {
  if (!ambientNodes || !ctx) return;
  const t = ctx.currentTime;
  ambientNodes.g.gain.linearRampToValueAtTime(0, t + 2);
  const nodes = ambientNodes;
  setTimeout(() => {
    try { nodes.osc1.stop(); nodes.osc2.stop(); nodes.osc3.stop(); } catch(e){}
  }, 2500);
  ambientNodes = null;
}

// ═══ CARD FLIP ═══  
// Short percussive click — like a Sarkon tag engaging,
// a micro-gate opening in the mesh.
export function playCardFlip() {
  const c = getCtx(); if (!c || muted) return;
  const g = c.createGain();
  g.gain.value = 0.3;
  g.connect(getMaster());

  // Noise burst — very short
  const buf = c.createBuffer(1, c.sampleRate * 0.02, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (data.length * 0.15));
  }
  const src = c.createBufferSource();
  src.buffer = buf;

  const flt = c.createBiquadFilter();
  flt.type = 'bandpass';
  flt.frequency.value = 2000;
  flt.Q.value = 2;

  src.connect(flt);
  flt.connect(g);
  g.gain.linearRampToValueAtTime(0, c.currentTime + 0.04);
  src.start();
}

// ═══ PAIR SUCCESS ═══
// Two tones converging — the syzygy resolving, 
// two zones finding their 9-sum complement.
export function playPairSuccess() {
  const c = getCtx(); if (!c || muted) return;
  const g = c.createGain();
  g.gain.value = 0.2;
  g.connect(getMaster());

  // Tone 1 — descending
  const o1 = c.createOscillator();
  o1.type = 'triangle';
  o1.frequency.value = 660;
  o1.frequency.linearRampToValueAtTime(440, c.currentTime + 0.15);
  
  // Tone 2 — ascending to meet
  const o2 = c.createOscillator();
  o2.type = 'triangle';
  o2.frequency.value = 330;
  o2.frequency.linearRampToValueAtTime(440, c.currentTime + 0.15);

  const g1 = c.createGain(); g1.gain.value = 0.5;
  const g2 = c.createGain(); g2.gain.value = 0.5;
  o1.connect(g1); g1.connect(g);
  o2.connect(g2); g2.connect(g);

  g.gain.linearRampToValueAtTime(0, c.currentTime + 0.35);
  o1.start(); o2.start();
  o1.stop(c.currentTime + 0.4);
  o2.stop(c.currentTime + 0.4);
}

// ═══ PAIR FAIL / INVALID ═══
// Dissonant buzz — temporal friction, Skarkix grinding.
export function playPairFail() {
  const c = getCtx(); if (!c || muted) return;
  const g = c.createGain();
  g.gain.value = 0.15;
  g.connect(getMaster());

  const o = c.createOscillator();
  o.type = 'square';
  o.frequency.value = 110;

  const o2 = c.createOscillator();
  o2.type = 'square';
  o2.frequency.value = 117; // dissonant interval

  const g1 = c.createGain(); g1.gain.value = 0.5;
  const g2 = c.createGain(); g2.gain.value = 0.5;
  o.connect(g1); g1.connect(g);
  o2.connect(g2); g2.connect(g);

  g.gain.linearRampToValueAtTime(0, c.currentTime + 0.2);
  o.start(); o2.start();
  o.stop(c.currentTime + 0.25);
  o2.stop(c.currentTime + 0.25);
}

// ═══ SKIP WARNING ═══
// Rising urgency tone — Doddunmuk's escalating tension.
export function playSkipWarn() {
  const c = getCtx(); if (!c || muted) return;
  const g = c.createGain();
  g.gain.value = 0.18;
  g.connect(getMaster());

  const o = c.createOscillator();
  o.type = 'sawtooth';
  o.frequency.value = 200;
  o.frequency.linearRampToValueAtTime(600, c.currentTime + 0.15);

  const flt = c.createBiquadFilter();
  flt.type = 'lowpass';
  flt.frequency.value = 800;

  o.connect(flt);
  flt.connect(g);
  g.gain.linearRampToValueAtTime(0, c.currentTime + 0.2);
  o.start();
  o.stop(c.currentTime + 0.25);
}

// ═══ ROUND COMPLETE (ANGELIC) ═══
// Shimmering ascending arpeggio — light breaking through the Hold.
export function playAngelic() {
  const c = getCtx(); if (!c || muted) return;
  const notes = [440, 554, 659, 880]; // A major rising
  notes.forEach((freq, i) => {
    const g = c.createGain();
    g.gain.value = 0;
    g.connect(getMaster());

    const o = c.createOscillator();
    o.type = 'sine';
    o.frequency.value = freq;

    const delay = i * 0.12;
    o.connect(g);
    g.gain.linearRampToValueAtTime(0.15, c.currentTime + delay + 0.05);
    g.gain.linearRampToValueAtTime(0, c.currentTime + delay + 0.5);
    o.start(c.currentTime + delay);
    o.stop(c.currentTime + delay + 0.6);
  });
}

// ═══ DEMON CALL ═══
// The core horror sound. Multi-layered:
// 1. Sub-bass drop (Plex vibration)
// 2. Dissonant chord (Warp interference)  
// 3. Noise sweep (Cthelll static)
// 4. Descending pitch bend (Sink current pulling down)
export function playDemonCall() {
  const c = getCtx(); if (!c || muted) return;
  const t = c.currentTime;

  // Layer 1: Sub-bass drop — Plex vibration
  const subG = c.createGain();
  subG.gain.value = 0.35;
  subG.connect(getMaster());
  const sub = c.createOscillator();
  sub.type = 'sine';
  sub.frequency.value = 55;
  sub.frequency.linearRampToValueAtTime(28, t + 1.5);
  sub.connect(subG);
  subG.gain.linearRampToValueAtTime(0, t + 2);
  sub.start(); sub.stop(t + 2.2);

  // Layer 2: Dissonant Warp chord — tritone, the devil's interval
  const chordG = c.createGain();
  chordG.gain.value = 0.12;
  chordG.connect(getMaster());
  [146.8, 207.65, 293.66].forEach(f => { // D, Ab, D — tritone stack
    const o = c.createOscillator();
    o.type = 'sawtooth';
    o.frequency.value = f;
    const fg = c.createGain(); fg.gain.value = 0.33;
    const flt = c.createBiquadFilter();
    flt.type = 'lowpass';
    flt.frequency.value = 400;
    flt.frequency.linearRampToValueAtTime(150, t + 2);
    o.connect(flt); flt.connect(fg); fg.connect(chordG);
    o.start(); o.stop(t + 2.5);
  });
  chordG.gain.linearRampToValueAtTime(0, t + 2.5);

  // Layer 3: Cthelll static — filtered noise sweep
  const nBuf = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
  const nData = nBuf.getChannelData(0);
  for (let i = 0; i < nData.length; i++) nData[i] = Math.random() * 2 - 1;
  const nSrc = c.createBufferSource();
  nSrc.buffer = nBuf;
  const nFlt = c.createBiquadFilter();
  nFlt.type = 'bandpass';
  nFlt.frequency.value = 3000;
  nFlt.frequency.linearRampToValueAtTime(200, t + 2);
  nFlt.Q.value = 5;
  const nG = c.createGain();
  nG.gain.value = 0.08;
  nSrc.connect(nFlt); nFlt.connect(nG); nG.connect(getMaster());
  nG.gain.linearRampToValueAtTime(0, t + 2);
  nSrc.start(); nSrc.stop(t + 2.2);

  // Layer 4: Descending pitch bend — the Sink pulling everything down
  const bendG = c.createGain();
  bendG.gain.value = 0.1;
  bendG.connect(getMaster());
  const bend = c.createOscillator();
  bend.type = 'triangle';
  bend.frequency.value = 440;
  bend.frequency.exponentialRampToValueAtTime(30, t + 2);
  bend.connect(bendG);
  bendG.gain.linearRampToValueAtTime(0, t + 2);
  bend.start(); bend.stop(t + 2.2);
}

// ═══ ORACLE ZONE TAP ═══
// Resonant ping — like tapping a zone node on the numogram.
export function playZoneTap(zone) {
  const c = getCtx(); if (!c || muted) return;
  // Each zone maps to a frequency derived from the numogram
  const freqs = {0:66,1:73.4,2:82.4,3:92.5,4:103.8,5:116.5,6:130.8,7:146.8,8:164.8,9:185};
  const f = freqs[zone] || 110;

  const g = c.createGain();
  g.gain.value = 0.25;
  g.connect(getMaster());

  const o = c.createOscillator();
  o.type = 'sine';
  o.frequency.value = f * 2;

  // Metallic ring via modulation
  const mod = c.createOscillator();
  mod.type = 'sine';
  mod.frequency.value = f * 3.01; // slightly detuned harmonic
  const modG = c.createGain();
  modG.gain.value = f * 0.5;
  mod.connect(modG);
  modG.connect(o.frequency);

  o.connect(g);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.8);
  o.start(); mod.start();
  o.stop(c.currentTime + 0.9);
  mod.stop(c.currentTime + 0.9);
}

// ═══ BUTTON CLICK ═══
// Minimal UI tick.
export function playClick() {
  const c = getCtx(); if (!c || muted) return;
  const o = c.createOscillator();
  o.type = 'sine';
  o.frequency.value = 1200;
  const g = c.createGain();
  g.gain.value = 0.08;
  o.connect(g); g.connect(getMaster());
  g.gain.linearRampToValueAtTime(0, c.currentTime + 0.03);
  o.start(); o.stop(c.currentTime + 0.04);
}
