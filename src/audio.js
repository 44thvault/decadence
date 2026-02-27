// ═══ DECADENCE AUDIO ENGINE v4 ═══
// Clean transitions. No crackle. No pops.
// All sounds tracked and killed cleanly on state change.

let ctx = null;
let masterGain = null;
let ambientNodes = null;
let muted = false;
let convolver = null;
let activeNodes = []; // Track all active sound nodes for clean killing

function getCtx() {
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = ctx.createGain();
      masterGain.gain.value = 0.7;
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -18;
      comp.knee.value = 12;
      comp.ratio.value = 6;
      comp.attack.value = 0.003;
      comp.release.value = 0.25;
      masterGain.connect(comp);
      comp.connect(ctx.destination);
      window.addEventListener('beforeunload', () => {
        try { killAll(); stopAmbient(); ctx.close(); } catch(e){}
      });
      document.addEventListener('visibilitychange', () => {
        if (!ambientNodes || !ctx) return;
        if (document.hidden) {
          ambientNodes.master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
        } else {
          ambientNodes.master.gain.linearRampToValueAtTime(1, ctx.currentTime + 1);
        }
      });
    } catch(e) { return null; }
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function getMaster() { getCtx(); return masterGain; }
export function setMuted(m) { muted = m; if (masterGain) masterGain.gain.value = m ? 0 : 0.7; }
export function isMuted() { return muted; }

// ═══ KILL ALL ACTIVE SOUNDS ═══
// Rapid fade-out of every tracked node. Call before state transitions.
export function killAll() {
  if (!ctx) return;
  const t = ctx.currentTime;
  activeNodes.forEach(({ gain, oscs }) => {
    try {
      gain.gain.cancelScheduledValues(t);
      gain.gain.setValueAtTime(gain.gain.value, t);
      gain.gain.linearRampToValueAtTime(0, t + 0.05);
      oscs.forEach(o => { try { o.stop(t + 0.08); } catch(e){} });
    } catch(e){}
  });
  activeNodes = [];
}

// Track a sound group for cleanup
function track(gain, oscs) {
  const entry = { gain, oscs };
  activeNodes.push(entry);
  // Auto-remove after sounds end naturally
  const maxDur = 5;
  setTimeout(() => {
    activeNodes = activeNodes.filter(e => e !== entry);
  }, maxDur * 1000);
  return entry;
}

// Dark cavernous reverb
function createReverb() {
  const c = getCtx(); if (!c) return null;
  const len = c.sampleRate * 2.5;
  const buf = c.createBuffer(2, len, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) {
      const t = i / c.sampleRate;
      data[i] = (Math.random() * 2 - 1) * Math.exp(-t * 2.5) * 0.4;
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
    wetGain.gain.value = 0.2;
    convolver.connect(wetGain);
    wetGain.connect(getMaster());
  }
  return convolver;
}

// ═══ AMBIENT DRONE ═══
export function startAmbient() {
  const c = getCtx(); if (!c) return;
  if (ambientNodes) return;

  const master = c.createGain();
  master.gain.value = 0;
  master.connect(getMaster());
  const rev = getReverbSend();
  const revSend = c.createGain();
  revSend.gain.value = 0.12;
  if (rev) revSend.connect(rev);

  // Subsonic pressure
  const sub1 = c.createOscillator(); sub1.type = 'sine'; sub1.frequency.value = 24;
  const sub2 = c.createOscillator(); sub2.type = 'sine'; sub2.frequency.value = 24.25;
  const subG = c.createGain(); subG.gain.value = 0.3;
  sub1.connect(subG); sub2.connect(subG); subG.connect(master);

  // Dark filtered drone
  const drone = c.createOscillator(); drone.type = 'sawtooth'; drone.frequency.value = 36.7;
  const droneFlt = c.createBiquadFilter(); droneFlt.type = 'lowpass'; droneFlt.frequency.value = 55; droneFlt.Q.value = 8;
  const lfo = c.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = 0.05;
  const lfoG = c.createGain(); lfoG.gain.value = 15;
  lfo.connect(lfoG); lfoG.connect(droneFlt.frequency);
  const droneG = c.createGain(); droneG.gain.value = 0.1;
  drone.connect(droneFlt); droneFlt.connect(droneG); droneG.connect(master); droneG.connect(revSend);

  // Distant bell
  const bell = c.createOscillator(); bell.type = 'sine'; bell.frequency.value = 293.66;
  const bellMod = c.createOscillator(); bellMod.type = 'sine'; bellMod.frequency.value = 293.66 * 1.414;
  const bellModG = c.createGain(); bellModG.gain.value = 120;
  bellMod.connect(bellModG); bellModG.connect(bell.frequency);
  const bellFlt = c.createBiquadFilter(); bellFlt.type = 'lowpass'; bellFlt.frequency.value = 180;
  const bellG = c.createGain(); bellG.gain.value = 0.012;
  bell.connect(bellFlt); bellFlt.connect(bellG); bellG.connect(master); bellG.connect(revSend);

  // Second drone
  const drone2 = c.createOscillator(); drone2.type = 'sine'; drone2.frequency.value = 55;
  const drone2Flt = c.createBiquadFilter(); drone2Flt.type = 'lowpass'; drone2Flt.frequency.value = 70;
  const drone2G = c.createGain(); drone2G.gain.value = 0.04;
  drone2.connect(drone2Flt); drone2Flt.connect(drone2G); drone2G.connect(master);

  sub1.start(); sub2.start(); drone.start(); lfo.start();
  bell.start(); bellMod.start(); drone2.start();
  master.gain.linearRampToValueAtTime(1, c.currentTime + 5);

  ambientNodes = { master, sub1, sub2, drone, lfo, bell, bellMod, drone2 };
}

export function stopAmbient() {
  if (!ambientNodes || !ctx) return;
  const t = ctx.currentTime;
  ambientNodes.master.gain.cancelScheduledValues(t);
  ambientNodes.master.gain.setValueAtTime(ambientNodes.master.gain.value, t);
  ambientNodes.master.gain.linearRampToValueAtTime(0, t + 2);
  const n = ambientNodes;
  ambientNodes = null;
  setTimeout(() => {
    try { n.sub1.stop(); n.sub2.stop(); n.drone.stop(); n.lfo.stop(); n.bell.stop(); n.bellMod.stop(); n.drone2.stop(); } catch(e){}
  }, 2500);
}

// ═══ CARD FLIP ═══
export function playCardFlip() {
  const c = getCtx(); if (!c || muted) return;
  const g = c.createGain(); g.gain.value = 0.18; g.connect(getMaster());
  const tone = c.createOscillator(); tone.type = 'sine';
  tone.frequency.value = 65; tone.frequency.linearRampToValueAtTime(30, c.currentTime + 0.06);
  tone.connect(g);
  const click = c.createOscillator(); click.type = 'sine';
  click.frequency.value = 1200; click.frequency.linearRampToValueAtTime(300, c.currentTime + 0.01);
  const cg = c.createGain(); cg.gain.value = 0.04; click.connect(cg); cg.connect(g);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.07);
  tone.start(); click.start();
  tone.stop(c.currentTime + 0.1); click.stop(c.currentTime + 0.1);
  track(g, [tone, click]);
}

// ═══ PAIR SUCCESS ═══
export function playPairSuccess() {
  const c = getCtx(); if (!c || muted) return;
  const rev = getReverbSend();
  const g = c.createGain(); g.gain.value = 0.14; g.connect(getMaster());
  const rg = c.createGain(); rg.gain.value = 0.3; if (rev) rg.connect(rev);
  const oscs = [];
  [174.6, 174.6 * 2.76, 174.6 * 5.4].forEach((freq, i) => {
    const o = c.createOscillator(); o.type = 'sine'; o.frequency.value = freq;
    const og = c.createGain(); og.gain.value = [0.5, 0.2, 0.05][i];
    o.connect(og); og.connect(g); og.connect(rg);
    o.start(); o.stop(c.currentTime + 2); oscs.push(o);
  });
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 1.8);
  track(g, oscs);
}

// ═══ PAIR FAIL ═══
export function playPairFail() {
  const c = getCtx(); if (!c || muted) return;
  const g = c.createGain(); g.gain.value = 0.18; g.connect(getMaster());
  const o = c.createOscillator(); o.type = 'sawtooth';
  o.frequency.value = 42; o.frequency.linearRampToValueAtTime(28, c.currentTime + 0.12);
  const ws = c.createWaveShaper();
  const curve = new Float32Array(256);
  for (let i = 0; i < 256; i++) { const x = (i/128)-1; curve[i] = (Math.PI+3)*x/(Math.PI+3*Math.abs(x)); }
  ws.curve = curve; ws.oversample = '2x';
  const flt = c.createBiquadFilter(); flt.type = 'lowpass'; flt.frequency.value = 180;
  o.connect(ws); ws.connect(flt); flt.connect(g);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.15);
  o.start(); o.stop(c.currentTime + 0.2);
  track(g, [o]);
}

// ═══ SKIP WARNING ═══
export function playSkipWarn() {
  const c = getCtx(); if (!c || muted) return;
  const g = c.createGain(); g.gain.value = 0.12; g.connect(getMaster());
  const o = c.createOscillator(); o.type = 'triangle';
  o.frequency.value = 150; o.frequency.linearRampToValueAtTime(500, c.currentTime + 0.2);
  const flt = c.createBiquadFilter(); flt.type = 'lowpass'; flt.frequency.value = 600;
  o.connect(flt); flt.connect(g);
  g.gain.linearRampToValueAtTime(0.15, c.currentTime + 0.08);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.25);
  o.start(); o.stop(c.currentTime + 0.3);
  track(g, [o]);
}

// ═══ ANGELIC ═══
// Shortened — 1.5s total, not 3.5s
export function playAngelic() {
  const c = getCtx(); if (!c || muted) return;
  const rev = getReverbSend();
  const freqs = [523.25, 783.99, 1046.5];
  const delays = [0, 0.15, 0.3];
  const allOscs = [];
  const masterG = c.createGain(); masterG.gain.value = 1; masterG.connect(getMaster());

  freqs.forEach((freq, i) => {
    const g = c.createGain(); g.gain.value = 0; g.connect(masterG);
    const rg = c.createGain(); rg.gain.value = 0.3; if (rev) rg.connect(rev);
    const o = c.createOscillator(); o.type = 'sine'; o.frequency.value = freq;
    const vib = c.createOscillator(); vib.type = 'sine'; vib.frequency.value = 3.5 + i * 0.3;
    const vibG = c.createGain(); vibG.gain.value = freq * 0.003;
    vib.connect(vibG); vibG.connect(o.frequency);
    o.connect(g); o.connect(rg);
    const d = delays[i];
    g.gain.setValueAtTime(0, c.currentTime + d);
    g.gain.linearRampToValueAtTime(0.07 - i * 0.015, c.currentTime + d + 0.15);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + d + 1.2);
    o.start(c.currentTime + d); vib.start(c.currentTime + d);
    o.stop(c.currentTime + d + 1.5); vib.stop(c.currentTime + d + 1.5);
    allOscs.push(o, vib);
  });
  track(masterG, allOscs);
}

// ═══ DEMON CALL ═══
export function playDemonCall() {
  const c = getCtx(); if (!c || muted) return;
  const t = c.currentTime;
  const rev = getReverbSend();
  const allOscs = [];
  const masterG = c.createGain(); masterG.gain.value = 1; masterG.connect(getMaster());

  // 1. Infrasonic pressure
  const infra = c.createOscillator(); infra.type = 'sine'; infra.frequency.value = 19;
  const infraG = c.createGain(); infraG.gain.value = 0;
  infra.connect(infraG); infraG.connect(masterG);
  infraG.gain.linearRampToValueAtTime(0.4, t + 0.5);
  infraG.gain.linearRampToValueAtTime(0.2, t + 2.5);
  infraG.gain.linearRampToValueAtTime(0, t + 3.5);
  infra.start(); infra.stop(t + 4); allOscs.push(infra);

  // 2. FM metallic scrape
  const scrape = c.createOscillator(); scrape.type = 'sine';
  scrape.frequency.value = 100; scrape.frequency.linearRampToValueAtTime(50, t + 3);
  const scrapeMod = c.createOscillator(); scrapeMod.type = 'sine';
  scrapeMod.frequency.value = 103; scrapeMod.frequency.linearRampToValueAtTime(51, t + 3);
  const scrapeModG = c.createGain(); scrapeModG.gain.value = 300;
  scrapeModG.gain.linearRampToValueAtTime(80, t + 3);
  scrapeMod.connect(scrapeModG); scrapeModG.connect(scrape.frequency);
  const scrapeFlt = c.createBiquadFilter(); scrapeFlt.type = 'bandpass';
  scrapeFlt.frequency.value = 250; scrapeFlt.frequency.linearRampToValueAtTime(80, t + 3); scrapeFlt.Q.value = 2;
  const scrapeG = c.createGain(); scrapeG.gain.value = 0;
  scrape.connect(scrapeFlt); scrapeFlt.connect(scrapeG); scrapeG.connect(masterG);
  if (rev) { const sr = c.createGain(); sr.gain.value = 0.3; scrapeG.connect(sr); sr.connect(rev); }
  scrapeG.gain.linearRampToValueAtTime(0.06, t + 0.3);
  scrapeG.gain.linearRampToValueAtTime(0.03, t + 2);
  scrapeG.gain.linearRampToValueAtTime(0, t + 3.2);
  scrape.start(); scrapeMod.start();
  scrape.stop(t + 3.5); scrapeMod.stop(t + 3.5);
  allOscs.push(scrape, scrapeMod);

  // 3. Vocal formant — sawtooth through formant filters
  const vocal = c.createOscillator(); vocal.type = 'sawtooth';
  vocal.frequency.value = 85; vocal.frequency.linearRampToValueAtTime(60, t + 3);
  const vocalG = c.createGain(); vocalG.gain.value = 0;
  vocalG.connect(masterG);
  if (rev) { const vr = c.createGain(); vr.gain.value = 0.4; vocalG.connect(vr); vr.connect(rev); }
  [{ f:270, q:12, g:0.03 }, { f:730, q:8, g:0.015 }, { f:2300, q:6, g:0.005 }].forEach(({ f, q, g: gv }) => {
    const flt = c.createBiquadFilter(); flt.type = 'bandpass';
    flt.frequency.value = f; flt.frequency.linearRampToValueAtTime(f * 0.65, t + 3); flt.Q.value = q;
    const fg = c.createGain(); fg.gain.value = gv;
    vocal.connect(flt); flt.connect(fg); fg.connect(vocalG);
  });
  vocalG.gain.linearRampToValueAtTime(1, t + 0.8);
  vocalG.gain.linearRampToValueAtTime(0.4, t + 2.5);
  vocalG.gain.linearRampToValueAtTime(0, t + 3.2);
  vocal.start(t + 0.15); vocal.stop(t + 3.5); allOscs.push(vocal);

  // 4. Descending void tones
  const v1 = c.createOscillator(); v1.type = 'triangle';
  v1.frequency.value = 200; v1.frequency.exponentialRampToValueAtTime(20, t + 3.5);
  const v2 = c.createOscillator(); v2.type = 'triangle';
  v2.frequency.value = 203; v2.frequency.exponentialRampToValueAtTime(20.3, t + 3.5);
  const vFlt = c.createBiquadFilter(); vFlt.type = 'lowpass';
  vFlt.frequency.value = 350; vFlt.frequency.linearRampToValueAtTime(40, t + 3.5);
  const vG = c.createGain(); vG.gain.value = 0;
  v1.connect(vFlt); v2.connect(vFlt); vFlt.connect(vG); vG.connect(masterG);
  vG.gain.linearRampToValueAtTime(0.1, t + 0.5);
  vG.gain.linearRampToValueAtTime(0.04, t + 2.5);
  vG.gain.linearRampToValueAtTime(0, t + 3.5);
  v1.start(); v2.start(); v1.stop(t + 4); v2.stop(t + 4);
  allOscs.push(v1, v2);

  // 5. Impact thud
  const imp = c.createOscillator(); imp.type = 'sine';
  imp.frequency.value = 60; imp.frequency.exponentialRampToValueAtTime(20, t + 0.3);
  const impG = c.createGain(); impG.gain.value = 0.25;
  imp.connect(impG); impG.connect(masterG);
  if (rev) { const ir = c.createGain(); ir.gain.value = 0.5; impG.connect(ir); ir.connect(rev); }
  impG.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
  imp.start(t + 0.03); imp.stop(t + 0.4); allOscs.push(imp);

  track(masterG, allOscs);
}

// ═══ ORACLE ZONE TAP ═══
export function playZoneTap(zone) {
  const c = getCtx(); if (!c || muted) return;
  const rev = getReverbSend();
  const freqs = { 6:392, 3:349.2, 2:329.6, 7:293.7, 5:261.6, 4:246.9, 1:220, 8:185, 9:164.8, 0:146.8 };
  const f = freqs[zone] || 220;
  const g = c.createGain(); g.gain.value = 0.12; g.connect(getMaster());
  const rg = c.createGain(); rg.gain.value = 0.4; if (rev) rg.connect(rev);
  const o = c.createOscillator(); o.type = 'sine'; o.frequency.value = f;
  const mod = c.createOscillator(); mod.type = 'sine'; mod.frequency.value = f * 1.347;
  const modG = c.createGain(); modG.gain.value = f * 0.5;
  modG.gain.exponentialRampToValueAtTime(1, c.currentTime + 1.2);
  mod.connect(modG); modG.connect(o.frequency);
  o.connect(g); o.connect(rg);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 1.5);
  o.start(); mod.start();
  o.stop(c.currentTime + 1.8); mod.stop(c.currentTime + 1.8);
  track(g, [o, mod]);
}

// ═══ BUTTON CLICK ═══
export function playClick() {
  const c = getCtx(); if (!c || muted) return;
  const o = c.createOscillator(); o.type = 'sine';
  o.frequency.value = 800; o.frequency.linearRampToValueAtTime(400, c.currentTime + 0.02);
  const g = c.createGain(); g.gain.value = 0.05; o.connect(g); g.connect(getMaster());
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.025);
  o.start(); o.stop(c.currentTime + 0.03);
  track(g, [o]);
}
