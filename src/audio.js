// ═══ DECADENCE AUDIO ENGINE v2 ═══
// Dark ritual sound design. No chiptune. No retro.
// Think: field recordings from inside the numogram.
// Spectral drones, metallic resonances, breath-like textures,
// subsonic pressure, the sound of something vast and patient
// becoming aware that you are there.

let ctx = null;
let masterGain = null;
let ambientNodes = null;
let muted = false;
let convolver = null;

function getCtx() {
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = ctx.createGain();
      masterGain.gain.value = 0.7;
      // Master compressor to glue everything and prevent clipping
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -24;
      comp.knee.value = 12;
      comp.ratio.value = 4;
      comp.attack.value = 0.003;
      comp.release.value = 0.15;
      masterGain.connect(comp);
      comp.connect(ctx.destination);
    } catch(e) { return null; }
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function getMaster() { getCtx(); return masterGain; }
export function setMuted(m) { muted = m; if (masterGain) masterGain.gain.value = m ? 0 : 0.7; }
export function isMuted() { return muted; }

// Generate an impulse response for a dark, cavernous reverb
function createReverb() {
  const c = getCtx(); if (!c) return null;
  const len = c.sampleRate * 3;
  const buf = c.createBuffer(2, len, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) {
      // Exponential decay with diffusion
      const t = i / c.sampleRate;
      const decay = Math.exp(-t * 2.2);
      // Early reflections with irregular spacing
      const early = (i < c.sampleRate * 0.08) ? Math.random() * 0.3 : 0;
      data[i] = ((Math.random() * 2 - 1) * decay + early) * 0.5;
    }
  }
  const conv = c.createConvolver();
  conv.buffer = buf;
  return conv;
}

function getReverbSend() {
  const c = getCtx(); if (!c) return null;
  if (!convolver) {
    convolver = createReverb();
    if (!convolver) return null;
    const wetGain = c.createGain();
    wetGain.gain.value = 0.3;
    convolver.connect(wetGain);
    wetGain.connect(getMaster());
  }
  return convolver;
}

// Utility: create filtered noise
function noiseBuffer(duration, shape) {
  const c = getCtx(); if (!c) return null;
  const len = Math.floor(c.sampleRate * duration);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  if (shape === 'breath') {
    // Breath-like: slow amplitude modulation over noise
    for (let i = 0; i < len; i++) {
      const t = i / len;
      const env = Math.sin(t * Math.PI) * (1 - t * 0.3);
      const breathMod = 1 + 0.4 * Math.sin(t * Math.PI * 6);
      data[i] = (Math.random() * 2 - 1) * env * breathMod * 0.7;
    }
  } else if (shape === 'crackle') {
    // Sparse crackle — like old vinyl or distant static
    for (let i = 0; i < len; i++) {
      data[i] = Math.random() < 0.02 ? (Math.random() * 2 - 1) * 0.8 : 
                Math.random() < 0.005 ? (Math.random() * 2 - 1) * 1.0 : 0;
    }
  } else {
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  }
  return buf;
}

// ═══ AMBIENT DRONE ═══
// Not a hum. A presence. The Plex breathing.
// Layered: subsonic pressure, spectral whisper, 
// slow-modulated dark harmonic, distant metallic resonance.
export function startAmbient() {
  const c = getCtx(); if (!c) return;
  if (ambientNodes) return;
  
  const master = c.createGain();
  master.gain.value = 0;
  master.connect(getMaster());
  const rev = getReverbSend();
  const revSend = c.createGain();
  revSend.gain.value = 0.15;
  if (rev) revSend.connect(rev);

  // Layer 1: Subsonic pressure — felt more than heard
  // Two detuned sines below hearing threshold create physical unease
  const sub1 = c.createOscillator();
  sub1.type = 'sine';
  sub1.frequency.value = 23; // Below pitch perception
  const sub2 = c.createOscillator();
  sub2.type = 'sine';
  sub2.frequency.value = 23.3; // 0.3Hz beating
  const subG = c.createGain(); subG.gain.value = 0.4;
  sub1.connect(subG); sub2.connect(subG); subG.connect(master);

  // Layer 2: Dark harmonic drone — filtered sawtooth with slow LFO
  // This is the tonal center, a low D (36.7Hz, ~gt-36)
  const drone = c.createOscillator();
  drone.type = 'sawtooth';
  drone.frequency.value = 36.7;
  const droneFlt = c.createBiquadFilter();
  droneFlt.type = 'lowpass';
  droneFlt.frequency.value = 60;
  droneFlt.Q.value = 12; // Resonant, hollow
  // LFO modulates the filter cutoff slowly
  const lfo = c.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.value = 0.07; // One cycle every ~14 seconds
  const lfoG = c.createGain();
  lfoG.gain.value = 25;
  lfo.connect(lfoG);
  lfoG.connect(droneFlt.frequency);
  const droneG = c.createGain(); droneG.gain.value = 0.12;
  drone.connect(droneFlt); droneFlt.connect(droneG); droneG.connect(master);
  droneG.connect(revSend);

  // Layer 3: Spectral whisper — bandpass filtered noise, very quiet
  // The sound of air moving through the numogram's passages
  const whisper = c.createBufferSource();
  whisper.buffer = noiseBuffer(120, 'breath');
  whisper.loop = true;
  const whFlt = c.createBiquadFilter();
  whFlt.type = 'bandpass';
  whFlt.frequency.value = 400;
  whFlt.Q.value = 3;
  // Second LFO to sweep the whisper frequency
  const lfo2 = c.createOscillator();
  lfo2.type = 'sine';
  lfo2.frequency.value = 0.03;
  const lfo2G = c.createGain();
  lfo2G.gain.value = 200;
  lfo2.connect(lfo2G);
  lfo2G.connect(whFlt.frequency);
  const whG = c.createGain(); whG.gain.value = 0.035;
  whisper.connect(whFlt); whFlt.connect(whG); whG.connect(master);
  whG.connect(revSend);

  // Layer 4: Distant metallic resonance — like a bell underwater
  const bell = c.createOscillator();
  bell.type = 'sine';
  bell.frequency.value = 293.66; // D4
  const bellMod = c.createOscillator();
  bellMod.type = 'sine';
  bellMod.frequency.value = 293.66 * 1.414; // Inharmonic ratio
  const bellModG = c.createGain();
  bellModG.gain.value = 150;
  bellMod.connect(bellModG);
  bellModG.connect(bell.frequency);
  const bellFlt = c.createBiquadFilter();
  bellFlt.type = 'lowpass';
  bellFlt.frequency.value = 200;
  const bellG = c.createGain(); bellG.gain.value = 0.015;
  bell.connect(bellFlt); bellFlt.connect(bellG); bellG.connect(master);
  bellG.connect(revSend);

  // Layer 5: Crackle — sparse, distant, like a bad transmission
  const crackle = c.createBufferSource();
  crackle.buffer = noiseBuffer(30, 'crackle');
  crackle.loop = true;
  const crG = c.createGain(); crG.gain.value = 0.04;
  crackle.connect(crG); crG.connect(master);

  // Start everything
  sub1.start(); sub2.start(); drone.start(); lfo.start(); lfo2.start();
  whisper.start(); bell.start(); bellMod.start(); crackle.start();

  // Very slow fade in — 6 seconds
  master.gain.linearRampToValueAtTime(1, c.currentTime + 6);

  ambientNodes = { master, sub1, sub2, drone, lfo, lfo2, whisper, bell, bellMod, crackle, droneFlt, revSend, subG, droneG, whG, bellG, crG, whFlt, bellFlt, bellModG, lfoG, lfo2G };
}

export function stopAmbient() {
  if (!ambientNodes || !ctx) return;
  const t = ctx.currentTime;
  ambientNodes.master.gain.linearRampToValueAtTime(0, t + 3);
  const n = ambientNodes;
  setTimeout(() => {
    try {
      n.sub1.stop(); n.sub2.stop(); n.drone.stop(); n.lfo.stop();
      n.lfo2.stop(); n.whisper.stop(); n.bell.stop(); n.bellMod.stop();
      n.crackle.stop();
    } catch(e){}
  }, 3500);
  ambientNodes = null;
}

// ═══ CARD FLIP ═══
// Not a click. A soft, breathy thud — like turning a page 
// in a book that hasn't been opened in centuries.
// Filtered noise impulse with low-frequency emphasis.
export function playCardFlip() {
  const c = getCtx(); if (!c || muted) return;
  
  const g = c.createGain();
  g.gain.value = 0.25;
  g.connect(getMaster());
  
  // Thud body — very short noise with lowpass
  const buf = noiseBuffer(0.06);
  const src = c.createBufferSource();
  src.buffer = buf;
  const flt = c.createBiquadFilter();
  flt.type = 'lowpass';
  flt.frequency.value = 600;
  flt.frequency.linearRampToValueAtTime(80, c.currentTime + 0.06);
  flt.Q.value = 1;
  src.connect(flt); flt.connect(g);
  
  // Tiny tonal component — gives it a sense of weight
  const tone = c.createOscillator();
  tone.type = 'sine';
  tone.frequency.value = 80;
  tone.frequency.linearRampToValueAtTime(40, c.currentTime + 0.05);
  const tg = c.createGain(); tg.gain.value = 0.15;
  tone.connect(tg); tg.connect(g);
  
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.08);
  src.start(); tone.start();
  src.stop(c.currentTime + 0.1);
  tone.stop(c.currentTime + 0.1);
}

// ═══ PAIR SUCCESS ═══
// A dark, resonant bell stroke. Not cheerful — solemn.
// Two inharmonic partials creating a spectral, glass-like tone
// with long reverb tail. The syzygy sealing.
export function playPairSuccess() {
  const c = getCtx(); if (!c || muted) return;
  const rev = getReverbSend();
  
  const g = c.createGain();
  g.gain.value = 0.18;
  g.connect(getMaster());
  const rg = c.createGain(); rg.gain.value = 0.4;
  if (rev) rg.connect(rev);

  // Fundamental — low, hollow
  const o1 = c.createOscillator();
  o1.type = 'sine';
  o1.frequency.value = 174.6; // F3
  const o1g = c.createGain(); o1g.gain.value = 0.5;
  o1.connect(o1g); o1g.connect(g); o1g.connect(rg);

  // Inharmonic partial — creates spectral quality  
  const o2 = c.createOscillator();
  o2.type = 'sine';
  o2.frequency.value = 174.6 * 2.76; // Non-integer ratio — bell-like
  const o2g = c.createGain(); o2g.gain.value = 0.2;
  o2.connect(o2g); o2g.connect(g); o2g.connect(rg);

  // Third partial — high, crystalline, quiet
  const o3 = c.createOscillator();
  o3.type = 'sine';
  o3.frequency.value = 174.6 * 5.4;
  const o3g = c.createGain(); o3g.gain.value = 0.06;
  o3.connect(o3g); o3g.connect(g); o3g.connect(rg);

  // Long, slow decay
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 2.5);
  o1.start(); o2.start(); o3.start();
  o1.stop(c.currentTime + 2.8);
  o2.stop(c.currentTime + 2.8);
  o3.stop(c.currentTime + 2.8);
}

// ═══ PAIR FAIL ═══
// Not a buzzer. A guttural, wet distortion — something organic
// rejecting the pairing. Short, ugly, subsonic.
export function playPairFail() {
  const c = getCtx(); if (!c || muted) return;
  
  const g = c.createGain();
  g.gain.value = 0.2;
  g.connect(getMaster());

  // Distorted sub-bass grunt
  const o = c.createOscillator();
  o.type = 'sawtooth';
  o.frequency.value = 45;
  o.frequency.linearRampToValueAtTime(30, c.currentTime + 0.15);
  
  // Waveshaper for gritty distortion
  const ws = c.createWaveShaper();
  const curve = new Float32Array(256);
  for (let i = 0; i < 256; i++) {
    const x = (i / 128) - 1;
    curve[i] = (Math.PI + 3) * x / (Math.PI + 3 * Math.abs(x));
  }
  ws.curve = curve;
  ws.oversample = '2x';
  
  const flt = c.createBiquadFilter();
  flt.type = 'lowpass';
  flt.frequency.value = 200;
  
  o.connect(ws); ws.connect(flt); flt.connect(g);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.18);
  o.start();
  o.stop(c.currentTime + 0.22);
}

// ═══ SKIP WARNING ═══  
// A whispery hiss that rises — like something drawing breath
// to speak a warning. Urgent but not loud.
export function playSkipWarn() {
  const c = getCtx(); if (!c || muted) return;
  
  const g = c.createGain();
  g.gain.value = 0.12;
  g.connect(getMaster());

  // Breath noise rising through bandpass
  const buf = noiseBuffer(0.4, 'breath');
  const src = c.createBufferSource();
  src.buffer = buf;
  
  const flt = c.createBiquadFilter();
  flt.type = 'bandpass';
  flt.frequency.value = 500;
  flt.frequency.linearRampToValueAtTime(3000, c.currentTime + 0.3);
  flt.Q.value = 4;
  
  src.connect(flt); flt.connect(g);
  g.gain.linearRampToValueAtTime(0.18, c.currentTime + 0.15);
  g.gain.linearRampToValueAtTime(0, c.currentTime + 0.4);
  src.start();
  src.stop(c.currentTime + 0.5);
}

// ═══ ANGELIC (ROUND COMPLETE) ═══
// Not triumphant. Eerie, luminous, otherworldly.
// High spectral tones with long reverb — like light 
// filtering through deep water. Still unsettling.
export function playAngelic() {
  const c = getCtx(); if (!c || muted) return;
  const rev = getReverbSend();
  
  // Spectral chord — open fifths in high register, sine tones
  const freqs = [523.25, 783.99, 1046.5, 1567.98]; // C5, G5, C6, G6 — hollow fifths
  const delays = [0, 0.3, 0.6, 0.9];
  
  freqs.forEach((freq, i) => {
    const g = c.createGain();
    g.gain.value = 0;
    g.connect(getMaster());
    const rg = c.createGain(); rg.gain.value = 0.5;
    if (rev) rg.connect(rev);
    
    const o = c.createOscillator();
    o.type = 'sine';
    o.frequency.value = freq;
    // Slight vibrato — organic, not mechanical
    const vib = c.createOscillator();
    vib.type = 'sine';
    vib.frequency.value = 4 + i * 0.3;
    const vibG = c.createGain();
    vibG.gain.value = freq * 0.003;
    vib.connect(vibG); vibG.connect(o.frequency);
    
    o.connect(g); o.connect(rg);
    
    const d = delays[i];
    g.gain.setValueAtTime(0, c.currentTime + d);
    g.gain.linearRampToValueAtTime(0.08 - i * 0.015, c.currentTime + d + 0.4);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + d + 3);
    
    o.start(c.currentTime + d);
    vib.start(c.currentTime + d);
    o.stop(c.currentTime + d + 3.5);
    vib.stop(c.currentTime + d + 3.5);
  });
}

// ═══ DEMON CALL ═══
// The main event. This should make you feel physically wrong.
//
// Architecture:
// 1. Infrasonic pressure wave — below hearing, felt in the chest
// 2. Spectral scrape — bowed metal, like a gate opening in the dark
// 3. Vocal formant — not a voice, but something shaped like a voice
// 4. Descending void tone — the Sink pulling reality downward
// 5. Distant impact — something massive hitting something hollow
// 6. Long noise tail with sweeping resonance — Cthelll exhaling
export function playDemonCall() {
  const c = getCtx(); if (!c || muted) return;
  const t = c.currentTime;
  const rev = getReverbSend();

  // 1. Infrasonic pressure — physical dread
  const infra = c.createOscillator();
  infra.type = 'sine';
  infra.frequency.value = 19; // 19Hz — the "fear frequency"
  const infraG = c.createGain(); infraG.gain.value = 0;
  infra.connect(infraG); infraG.connect(getMaster());
  infraG.gain.linearRampToValueAtTime(0.5, t + 0.5);
  infraG.gain.linearRampToValueAtTime(0.3, t + 2);
  infraG.gain.linearRampToValueAtTime(0, t + 4);
  infra.start(); infra.stop(t + 4.5);

  // 2. Spectral scrape — FM synthesis creating metallic, bowed texture
  const scrape = c.createOscillator();
  scrape.type = 'sine';
  scrape.frequency.value = 110;
  scrape.frequency.linearRampToValueAtTime(55, t + 3);
  const scrapeMod = c.createOscillator();
  scrapeMod.type = 'sine';
  scrapeMod.frequency.value = 113.7; // Slightly detuned — creates beating
  scrapeMod.frequency.linearRampToValueAtTime(54.2, t + 3);
  const scrapeModG = c.createGain();
  scrapeModG.gain.value = 400; // High mod index — harsh, metallic
  scrapeModG.gain.linearRampToValueAtTime = 100;
  scrapeMod.connect(scrapeModG);
  scrapeModG.connect(scrape.frequency);
  const scrapeFlt = c.createBiquadFilter();
  scrapeFlt.type = 'bandpass';
  scrapeFlt.frequency.value = 300;
  scrapeFlt.frequency.linearRampToValueAtTime(100, t + 3);
  scrapeFlt.Q.value = 3;
  const scrapeG = c.createGain(); scrapeG.gain.value = 0;
  scrape.connect(scrapeFlt); scrapeFlt.connect(scrapeG);
  scrapeG.connect(getMaster());
  const scrapeRev = c.createGain(); scrapeRev.gain.value = 0.5;
  scrapeG.connect(scrapeRev); if (rev) scrapeRev.connect(rev);
  scrapeG.gain.linearRampToValueAtTime(0.08, t + 0.3);
  scrapeG.gain.linearRampToValueAtTime(0.05, t + 2);
  scrapeG.gain.linearRampToValueAtTime(0, t + 3.5);
  scrape.start(); scrapeMod.start();
  scrape.stop(t + 4); scrapeMod.stop(t + 4);

  // 3. Vocal formant — not a voice, but shaped like one
  // Multiple bandpass filters on noise create vowel-like resonance
  const vocalNoise = c.createBufferSource();
  vocalNoise.buffer = noiseBuffer(4);
  const formants = [
    { f: 270, q: 15, g: 0.04 },  // Near "A" vowel
    { f: 730, q: 12, g: 0.02 },
    { f: 2300, q: 10, g: 0.008 },
  ];
  const vocalMaster = c.createGain(); vocalMaster.gain.value = 0;
  vocalMaster.connect(getMaster());
  if (rev) { const vr = c.createGain(); vr.gain.value = 0.6; vocalMaster.connect(vr); vr.connect(rev); }
  formants.forEach(({ f, q, g: gv }) => {
    const flt = c.createBiquadFilter();
    flt.type = 'bandpass';
    flt.frequency.value = f;
    flt.frequency.linearRampToValueAtTime(f * 0.7, t + 3); // Formant shifts down — mouth closing
    flt.Q.value = q;
    const fg = c.createGain(); fg.gain.value = gv;
    vocalNoise.connect(flt); flt.connect(fg); fg.connect(vocalMaster);
  });
  vocalMaster.gain.setValueAtTime(0, t + 0.2);
  vocalMaster.gain.linearRampToValueAtTime(1, t + 0.8);
  vocalMaster.gain.linearRampToValueAtTime(0.6, t + 2.5);
  vocalMaster.gain.linearRampToValueAtTime(0, t + 3.5);
  vocalNoise.start(t + 0.2); vocalNoise.stop(t + 4);

  // 4. Descending void — the Sink current pulling everything down
  const void1 = c.createOscillator();
  void1.type = 'triangle';
  void1.frequency.value = 220;
  void1.frequency.exponentialRampToValueAtTime(18, t + 3.5);
  const void2 = c.createOscillator();
  void2.type = 'triangle';
  void2.frequency.value = 223; // Beating against void1
  void2.frequency.exponentialRampToValueAtTime(18.3, t + 3.5);
  const voidFlt = c.createBiquadFilter();
  voidFlt.type = 'lowpass';
  voidFlt.frequency.value = 400;
  voidFlt.frequency.linearRampToValueAtTime(40, t + 3.5);
  const voidG = c.createGain(); voidG.gain.value = 0;
  void1.connect(voidFlt); void2.connect(voidFlt);
  voidFlt.connect(voidG); voidG.connect(getMaster());
  voidG.gain.linearRampToValueAtTime(0.12, t + 0.5);
  voidG.gain.linearRampToValueAtTime(0.06, t + 2.5);
  voidG.gain.linearRampToValueAtTime(0, t + 4);
  void1.start(); void2.start();
  void1.stop(t + 4.5); void2.stop(t + 4.5);

  // 5. Distant impact — something vast, at the start
  const impBuf = noiseBuffer(0.3);
  const imp = c.createBufferSource();
  imp.buffer = impBuf;
  const impFlt = c.createBiquadFilter();
  impFlt.type = 'lowpass';
  impFlt.frequency.value = 150;
  impFlt.Q.value = 2;
  const impG = c.createGain(); impG.gain.value = 0.35;
  imp.connect(impFlt); impFlt.connect(impG); impG.connect(getMaster());
  const impRev = c.createGain(); impRev.gain.value = 0.8;
  impG.connect(impRev); if (rev) impRev.connect(rev);
  impG.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
  imp.start(t + 0.05); imp.stop(t + 0.5);

  // 6. Long noise tail — Cthelll exhaling
  const exhale = c.createBufferSource();
  exhale.buffer = noiseBuffer(5, 'breath');
  const exFlt = c.createBiquadFilter();
  exFlt.type = 'bandpass';
  exFlt.frequency.value = 2000;
  exFlt.frequency.exponentialRampToValueAtTime(100, t + 4);
  exFlt.Q.value = 6;
  const exG = c.createGain(); exG.gain.value = 0;
  exhale.connect(exFlt); exFlt.connect(exG); exG.connect(getMaster());
  if (rev) { const er = c.createGain(); er.gain.value = 0.4; exG.connect(er); er.connect(rev); }
  exG.gain.linearRampToValueAtTime(0.05, t + 0.8);
  exG.gain.linearRampToValueAtTime(0.02, t + 3);
  exG.gain.linearRampToValueAtTime(0, t + 4.5);
  exhale.start(); exhale.stop(t + 5);
}

// ═══ ORACLE ZONE TAP ═══
// Each zone produces a different resonant frequency.
// Not a ping — a struck surface, hollow and reverberant.
// Like tapping on bone or stone in a dark chamber.
export function playZoneTap(zone) {
  const c = getCtx(); if (!c || muted) return;
  const rev = getReverbSend();
  
  // Frequencies mapped to zones — getting lower as you descend the numogram
  const freqs = { 6:392, 3:349.2, 2:329.6, 7:293.7, 5:261.6, 4:246.9, 1:220, 8:185, 9:164.8, 0:146.8 };
  const f = freqs[zone] || 220;
  
  const g = c.createGain();
  g.gain.value = 0.15;
  g.connect(getMaster());
  const rg = c.createGain(); rg.gain.value = 0.6;
  if (rev) rg.connect(rev);
  
  // Struck resonance — sine with inharmonic FM
  const o = c.createOscillator();
  o.type = 'sine';
  o.frequency.value = f;
  const mod = c.createOscillator();
  mod.type = 'sine';
  mod.frequency.value = f * 1.347; // Non-integer ratio
  const modG = c.createGain();
  modG.gain.value = f * 0.8;
  modG.gain.exponentialRampToValueAtTime(1, c.currentTime + 1.5);
  mod.connect(modG); modG.connect(o.frequency);
  
  o.connect(g); o.connect(rg);
  
  // Attack transient — noise click
  const click = c.createBufferSource();
  click.buffer = noiseBuffer(0.01);
  const cFlt = c.createBiquadFilter();
  cFlt.type = 'highpass';
  cFlt.frequency.value = 2000;
  const cG = c.createGain(); cG.gain.value = 0.1;
  click.connect(cFlt); cFlt.connect(cG); cG.connect(g);
  
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 1.8);
  o.start(); mod.start(); click.start();
  o.stop(c.currentTime + 2);
  mod.stop(c.currentTime + 2);
  click.stop(c.currentTime + 0.02);
}

// ═══ BUTTON CLICK ═══
// Barely there. A tiny, dry impulse.
export function playClick() {
  const c = getCtx(); if (!c || muted) return;
  const buf = noiseBuffer(0.008);
  const src = c.createBufferSource();
  src.buffer = buf;
  const flt = c.createBiquadFilter();
  flt.type = 'bandpass';
  flt.frequency.value = 3000;
  flt.Q.value = 2;
  const g = c.createGain(); g.gain.value = 0.06;
  src.connect(flt); flt.connect(g); g.connect(getMaster());
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.015);
  src.start(); src.stop(c.currentTime + 0.02);
}
