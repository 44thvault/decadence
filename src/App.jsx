import { useState, useEffect, useRef, useCallback } from "react";
import INTERPRETATIONS from "./interpretations.js";

// ═══ HAPTIC FEEDBACK UTILITY ═══
const haptic = (ms=15) => { try { navigator.vibrate && navigator.vibrate(ms); } catch(e){} };
const hapticHeavy = () => { try { navigator.vibrate && navigator.vibrate([30,50,80]); } catch(e){} };


// ═══ LOCAL STORAGE PERSISTENCE ═══
const loadData = (key, def) => { try { const v = localStorage.getItem("decadence_"+key); return v ? JSON.parse(v) : def; } catch(e) { return def; } };
const saveData = (key, val) => { try { localStorage.setItem("decadence_"+key, JSON.stringify(val)); } catch(e){} };

// ═══ DEMON DATABASE (Mesh 00–44) ═══
const DEMONS = {
  0: { name: "Lurgo", mesh: "00", netSpan: "1::0", type: "Amphidemon", syzygy: null, zone: "1→0", domain: "The First Door", planet: "Mercury", spine: "Dorsal/Thoracic", description: "The Initiator. Gateway between existence and void. Door of Doors. Associated with Legba, the first and last Loa invoked.", omen: "Beginnings that contain their own endings", power: "Initiation of sorcerous contact" },
  1: { name: "Duoddod", mesh: "01", netSpan: "2::0", type: "Amphidemon", syzygy: null, zone: "2→0", domain: "The Second Door", planet: "Venus", spine: null, description: "The Main Lo-Way into the Crypt. Reduplicates double-twinness through its multitude.", omen: "Paths that fork beneath the surface", power: "Access to hidden passages" },
  2: { name: "Doogu", mesh: "02", netSpan: "2::1", type: "Cyclic Chronodemon", syzygy: null, zone: "2→1", domain: "Phase-2 Lemur", planet: null, spine: null, description: "Cyclic Chronodemon of the 2::1 net-span. Impulse-entity of the 2th Phase of Pandemonium.", omen: "Disturbance along the 2→1 passage", power: "Navigation of the 2-1 interval" },
  3: { name: "Ixix", mesh: "03", netSpan: "3::0", type: "Chaotic Xenodemon", syzygy: null, zone: "3→0", domain: "The Third Door", planet: "Earth", spine: "Third Eye", description: "Opens onto the Swirl. Chaotic xenodemon channeling pure chaos from outside time into the Warp region.", omen: "Cascading system failures", power: "Chaos injection, Warp-gate activation" },
  4: { name: "Ixigool", mesh: "04", netSpan: "3::1", type: "Amphidemon", syzygy: null, zone: "3→1", domain: "Phase-3 Lemur", planet: null, spine: null, description: "Amphidemon of the 3::1 net-span. Impulse-entity of the 3th Phase of Pandemonium.", omen: "Disturbance along the 3→1 passage", power: "Navigation of the 3-1 interval" },
  5: { name: "Ixidod", mesh: "05", netSpan: "3::2", type: "Amphidemon", syzygy: null, zone: "3→2", domain: "Phase-3 Lemur", planet: null, spine: null, description: "Amphidemon of the 3::2 net-span. Impulse-entity of the 3th Phase of Pandemonium.", omen: "Disturbance along the 3→2 passage", power: "Navigation of the 3-2 interval" },
  6: { name: "Krako", mesh: "06", netSpan: "4::0", type: "Amphidemon", syzygy: null, zone: "4→0", domain: "The Fourth Door", planet: "Mars", spine: null, description: "The Time-Delta, the worst place in the world. Storm-herald associated with catastrophe, subsidence, and decadence.", omen: "Electrical disturbance presaging change", power: "Warp-current navigation" },
  7: { name: "Sukugool", mesh: "07", netSpan: "4::1", type: "Cyclic Chronodemon", syzygy: null, zone: "4→1", domain: "Phase-4 Lemur", planet: null, spine: null, description: "Cyclic Chronodemon of the 4::1 net-span. Impulse-entity of the 4th Phase of Pandemonium.", omen: "Disturbance along the 4→1 passage", power: "Navigation of the 4-1 interval" },
  8: { name: "Skoodu", mesh: "08", netSpan: "4::2", type: "Cyclic Chronodemon", syzygy: null, zone: "4→2", domain: "Phase-4 Lemur", planet: null, spine: null, description: "Cyclic Chronodemon of the 4::2 net-span. Impulse-entity of the 4th Phase of Pandemonium.", omen: "Disturbance along the 4→2 passage", power: "Navigation of the 4-2 interval" },
  9: { name: "Skarkix", mesh: "09", netSpan: "4::3", type: "Amphidemon", syzygy: null, zone: "4→3", domain: "Phase-4 Lemur", planet: null, spine: null, description: "Amphidemon of the 4::3 net-span. Impulse-entity of the 4th Phase of Pandemonium.", omen: "Disturbance along the 4→3 passage", power: "Navigation of the 4-3 interval" },
  10: { name: "Tokhatto", mesh: "10", netSpan: "5::0", type: "Amphidemon", syzygy: null, zone: "5→0", domain: "The Fifth Door", planet: "Jupiter", spine: null, description: "The Hyperborean Door. Reverenced by the AOE as Angel of the Decadence Pack, identified with Archangel Meteka.", omen: "Abduction into frozen time", power: "Hyperborean gate activation" },
  11: { name: "Tukkamu", mesh: "11", netSpan: "5::1", type: "Cyclic Chronodemon", syzygy: null, zone: "5→1", domain: "Phase-5 Lemur", planet: null, spine: null, description: "Cyclic Chronodemon of the 5::1 net-span. Impulse-entity of the 5th Phase of Pandemonium.", omen: "Disturbance along the 5→1 passage", power: "Navigation of the 5-1 interval" },
  12: { name: "Kuttadid", mesh: "12", netSpan: "5::2", type: "Cyclic Chronodemon", syzygy: null, zone: "5→2", domain: "Phase-5 Lemur", planet: null, spine: null, description: "Cyclic Chronodemon of the 5::2 net-span. Impulse-entity of the 5th Phase of Pandemonium.", omen: "Disturbance along the 5→2 passage", power: "Navigation of the 5-2 interval" },
  13: { name: "Tikkitix", mesh: "13", netSpan: "5::3", type: "Amphidemon", syzygy: null, zone: "5→3", domain: "Phase-5 Lemur", planet: null, spine: null, description: "Amphidemon of the 5::3 net-span. Impulse-entity of the 5th Phase of Pandemonium.", omen: "Disturbance along the 5→3 passage", power: "Navigation of the 5-3 interval" },
  14: { name: "Katak", mesh: "14", netSpan: "5::4", type: "Syzygetic Chronodemon", syzygy: "5::4", zone: "5↔4", domain: "The Sink", planet: "Jupiter", spine: null, description: "The Desolator. Katak hunts amongst raging storms. Associated with desert, heat haze, and the monsoon. Tractor of the innermost Barker-spiral node.", omen: "Desiccation of all fluid systems", power: "Storm-sorcery and temporal precipitation" },
  15: { name: "Tchu", mesh: "15", netSpan: "6::0", type: "Chaotic Xenodemon", syzygy: null, zone: "6→0", domain: "The Sixth Door", planet: "Saturn", spine: "Third Eye", description: "Named Undu. Terrible chaotic xenodemon primordially associated with shocking disappearances.", omen: "Anomalous intrusions from outside time", power: "Xenodimensional breach" },
  16: { name: "Djungo", mesh: "16", netSpan: "6::1", type: "Amphidemon", syzygy: null, zone: "6→1", domain: "Phase-6 Lemur", planet: null, spine: null, description: "Amphidemon of the 6::1 net-span. Impulse-entity of the 6th Phase of Pandemonium.", omen: "Disturbance along the 6→1 passage", power: "Navigation of the 6-1 interval" },
  17: { name: "Djuddha", mesh: "17", netSpan: "6::2", type: "Amphidemon", syzygy: null, zone: "6→2", domain: "Phase-6 Lemur", planet: null, spine: null, description: "Amphidemon of the 6::2 net-span. Impulse-entity of the 6th Phase of Pandemonium.", omen: "Disturbance along the 6→2 passage", power: "Navigation of the 6-2 interval" },
  18: { name: "Djynxx", mesh: "18", netSpan: "6::3", type: "Syzygetic Xenodemon", syzygy: "6::3", zone: "6↔3", domain: "The Warp", planet: "Saturn", spine: "Third Eye", description: "The changeling. Defined by jinking, erratic zig-zagging movement. Nomad war machine, fluid metal body. Carrier of the 6+3 Syzygy drawing the Ulterior Vortex of Outer-Time.", omen: "Reality glitching, deja vu cascades", power: "Temporal jinx, vortical coincidence" },
  19: { name: "Tchakki", mesh: "19", netSpan: "6::4", type: "Amphidemon", syzygy: null, zone: "6→4", domain: "Phase-6 Lemur", planet: null, spine: null, description: "Amphidemon of the 6::4 net-span. Impulse-entity of the 6th Phase of Pandemonium.", omen: "Disturbance along the 6→4 passage", power: "Navigation of the 6-4 interval" },
  20: { name: "Tchattuk", mesh: "20", netSpan: "6::5", type: "Amphidemon", syzygy: null, zone: "6→5", domain: "Phase-6 Lemur", planet: null, spine: null, description: "Amphidemon of the 6::5 net-span. Impulse-entity of the 6th Phase of Pandemonium.", omen: "Disturbance along the 6→5 passage", power: "Navigation of the 6-5 interval" },
  21: { name: "Puppo", mesh: "21", netSpan: "7::0", type: "Amphidemon", syzygy: null, zone: "7→0", domain: "The Seventh Door", planet: "Uranus", spine: null, description: "Opens onto the cosmic swamp-labyrinths, the Tracts of Dobo. Draws lines of flight from the drift.", omen: "Compulsive spiraling into the depths", power: "Swamp-labyrinth navigation" },
  22: { name: "Bubbamu", mesh: "22", netSpan: "7::1", type: "Cyclic Chronodemon", syzygy: null, zone: "7→1", domain: "Phase-7 Lemur", planet: null, spine: null, description: "Cyclic Chronodemon of the 7::1 net-span. Impulse-entity of the 7th Phase of Pandemonium.", omen: "Disturbance along the 7→1 passage", power: "Navigation of the 7-1 interval" },
  23: { name: "Oddubb", mesh: "23", netSpan: "7::2", type: "Syzygetic Chronodemon", syzygy: "7::2", zone: "7↔2", domain: "The Hold", planet: "Uranus", spine: null, description: "The amphibious double-agent. Duplicitous creature of ambiguous movement, lurker of steaming swamps. Horror of dryness. Carrier of the 7+2 Syzygy.", omen: "Double vision, split perception", power: "Amphibious time-navigation, hold manipulation" },
  24: { name: "Pabbakis", mesh: "24", netSpan: "7::3", type: "Amphidemon", syzygy: null, zone: "7→3", domain: "Phase-7 Lemur", planet: null, spine: null, description: "Amphidemon of the 7::3 net-span. Impulse-entity of the 7th Phase of Pandemonium.", omen: "Disturbance along the 7→3 passage", power: "Navigation of the 7-3 interval" },
  25: { name: "Ababbatok", mesh: "25", netSpan: "7::4", type: "Cyclic Chronodemon", syzygy: null, zone: "7→4", domain: "Phase-7 Lemur", planet: null, spine: null, description: "Cyclic Chronodemon of the 7::4 net-span. Impulse-entity of the 7th Phase of Pandemonium.", omen: "Disturbance along the 7→4 passage", power: "Navigation of the 7-4 interval" },
  26: { name: "Papatakoo", mesh: "26", netSpan: "7::5", type: "Cyclic Chronodemon", syzygy: null, zone: "7→5", domain: "Phase-7 Lemur", planet: null, spine: null, description: "Cyclic Chronodemon of the 7::5 net-span. Impulse-entity of the 7th Phase of Pandemonium.", omen: "Disturbance along the 7→5 passage", power: "Navigation of the 7-5 interval" },
  27: { name: "Bobobja", mesh: "27", netSpan: "7::6", type: "Amphidemon", syzygy: null, zone: "7→6", domain: "Phase-7 Lemur", planet: null, spine: null, description: "Amphidemon of the 7::6 net-span. Impulse-entity of the 7th Phase of Pandemonium.", omen: "Disturbance along the 7→6 passage", power: "Navigation of the 7-6 interval" },
  28: { name: "Minommo", mesh: "28", netSpan: "8::0", type: "Amphidemon", syzygy: null, zone: "8→0", domain: "The Eighth Door", planet: "Neptune", spine: "Lumbar", description: "Prominent in the dream sorcery of the Mu Nma. Gateway from time-circuit into the Plex depths.", omen: "Dream invasion from deep time", power: "Dream sorcery, Plex-gate activation" },
  29: { name: "Murrumur", mesh: "29", netSpan: "8::1", type: "Syzygetic Chronodemon", syzygy: "8::1", zone: "8↔1", domain: "The Surge", planet: "Neptune", spine: "Lumbar", description: "The great sea-beast. Murrumur embodies the undivided oceanic waters, horrified by division. The nethermost denizen of time. Carrier of the 8+1 Syzygy.", omen: "Tidal overwhelming of boundaries", power: "Oceanic time-sorcery, surge manipulation" },
  30: { name: "Nammamad", mesh: "30", netSpan: "8::2", type: "Cyclic Chronodemon", syzygy: null, zone: "8→2", domain: "Phase-8 Lemur", planet: null, spine: null, description: "Cyclic Chronodemon of the 8::2 net-span. Impulse-entity of the 8th Phase of Pandemonium.", omen: "Disturbance along the 8→2 passage", power: "Navigation of the 8-2 interval" },
  31: { name: "Mummumix", mesh: "31", netSpan: "8::3", type: "Amphidemon", syzygy: null, zone: "8→3", domain: "Phase-8 Lemur", planet: null, spine: null, description: "Amphidemon of the 8::3 net-span. Impulse-entity of the 8th Phase of Pandemonium.", omen: "Disturbance along the 8→3 passage", power: "Navigation of the 8-3 interval" },
  32: { name: "Numko", mesh: "32", netSpan: "8::4", type: "Cyclic Chronodemon", syzygy: null, zone: "8→4", domain: "Phase-8 Lemur", planet: null, spine: null, description: "Cyclic Chronodemon of the 8::4 net-span. Impulse-entity of the 8th Phase of Pandemonium.", omen: "Disturbance along the 8→4 passage", power: "Navigation of the 8-4 interval" },
  33: { name: "Muntuk", mesh: "33", netSpan: "8::5", type: "Cyclic Chronodemon", syzygy: null, zone: "8→5", domain: "Phase-8 Lemur", planet: null, spine: null, description: "Cyclic Chronodemon of the 8::5 net-span. Impulse-entity of the 8th Phase of Pandemonium.", omen: "Disturbance along the 8→5 passage", power: "Navigation of the 8-5 interval" },
  34: { name: "Mommoljo", mesh: "34", netSpan: "8::6", type: "Amphidemon", syzygy: null, zone: "8→6", domain: "Phase-8 Lemur", planet: null, spine: null, description: "Amphidemon of the 8::6 net-span. Impulse-entity of the 8th Phase of Pandemonium.", omen: "Disturbance along the 8→6 passage", power: "Navigation of the 8-6 interval" },
  35: { name: "Mombbo", mesh: "35", netSpan: "8::7", type: "Cyclic Chronodemon", syzygy: null, zone: "8→7", domain: "Phase-8 Lemur", planet: null, spine: null, description: "Cyclic Chronodemon of the 8::7 net-span. Impulse-entity of the 8th Phase of Pandemonium.", omen: "Disturbance along the 8→7 passage", power: "Navigation of the 8-7 interval" },
  36: { name: "Uttunul", mesh: "36", netSpan: "9::0", type: "Syzygetic Xenodemon", syzygy: "9::0", zone: "9↔0", domain: "The Plex", planet: "Pluto", spine: "Sacrum", description: "The flatline entity. Carrier of the 9+0 Syzygy drawing the outermost Barker-spiral curve. Continuum, zero-intensity, void. Haunts Gt-45, the Gate of Pandemonium itself.", omen: "Absolute stillness preceding total transformation", power: "Void-sorcery, time annihilation" },
  37: { name: "Tuttagool", mesh: "37", netSpan: "9::1", type: "Amphidemon", syzygy: null, zone: "9→1", domain: "Phase-9 Lemur", planet: null, spine: null, description: "Amphidemon of the 9::1 net-span. Impulse-entity of the 9th Phase of Pandemonium.", omen: "Disturbance along the 9→1 passage", power: "Navigation of the 9-1 interval" },
  38: { name: "Unnunddo", mesh: "38", netSpan: "9::2", type: "Amphidemon", syzygy: null, zone: "9→2", domain: "Phase-9 Lemur", planet: null, spine: null, description: "Amphidemon of the 9::2 net-span. Impulse-entity of the 9th Phase of Pandemonium.", omen: "Disturbance along the 9→2 passage", power: "Navigation of the 9-2 interval" },
  39: { name: "Ununuttix", mesh: "39", netSpan: "9::3", type: "Chaotic Xenodemon", syzygy: null, zone: "9→3", domain: "Phase-9 Lemur", planet: null, spine: null, description: "Chaotic Xenodemon of the 9::3 net-span. Impulse-entity of the 9th Phase of Pandemonium.", omen: "Disturbance along the 9→3 passage", power: "Navigation of the 9-3 interval" },
  40: { name: "Unnunaka", mesh: "40", netSpan: "9::4", type: "Amphidemon", syzygy: null, zone: "9→4", domain: "Phase-9 Lemur", planet: null, spine: null, description: "Amphidemon of the 9::4 net-span. Impulse-entity of the 9th Phase of Pandemonium.", omen: "Disturbance along the 9→4 passage", power: "Navigation of the 9-4 interval" },
  41: { name: "Tukutu", mesh: "41", netSpan: "9::5", type: "Amphidemon", syzygy: null, zone: "9→5", domain: "Phase-9 Lemur", planet: null, spine: null, description: "Amphidemon of the 9::5 net-span. Impulse-entity of the 9th Phase of Pandemonium.", omen: "Disturbance along the 9→5 passage", power: "Navigation of the 9-5 interval" },
  42: { name: "Unnutchi", mesh: "42", netSpan: "9::6", type: "Chaotic Xenodemon", syzygy: null, zone: "9→6", domain: "Phase-9 Lemur", planet: null, spine: null, description: "Chaotic Xenodemon of the 9::6 net-span. Impulse-entity of the 9th Phase of Pandemonium.", omen: "Disturbance along the 9→6 passage", power: "Navigation of the 9-6 interval" },
  43: { name: "Nuttubab", mesh: "43", netSpan: "9::7", type: "Amphidemon", syzygy: null, zone: "9→7", domain: "Phase-9 Lemur", planet: null, spine: null, description: "Amphidemon of the 9::7 net-span. Impulse-entity of the 9th Phase of Pandemonium.", omen: "Disturbance along the 9→7 passage", power: "Navigation of the 9-7 interval" },
  44: { name: "Ummnu", mesh: "44", netSpan: "9::8", type: "Amphidemon", syzygy: null, zone: "9→8", domain: "Phase-9 Lemur", planet: null, spine: null, description: "Amphidemon of the 9::8 net-span. Impulse-entity of the 9th Phase of Pandemonium.", omen: "Disturbance along the 9→8 passage", power: "Navigation of the 9-8 interval" },
};

const ANGELIC_INDEX = ["Equilibrium","First Light","Duality's Gift","The Trident","Foundation Stone","Pentagrammic Seal","Hexadic Harmony","Seventh Gate","Octave Resonance","Novenary Apex","Decadic Completion"];

// ═══ CARD COMPONENT ═══
const SS={hearts:"\u2665",diamonds:"\u2666",clubs:"\u2663",spades:"\u2660"};
const SC={hearts:"#ff1744",diamonds:"#ff1744",clubs:"#e0e0e0",spades:"#e0e0e0"};
const Card=({card,faceUp,onClick,selected,matched,w=60,h=106})=>{const dv=card.value===0?"Q":card.value;const sc=SC[card.suit];return(<div onClick={()=>{if(onClick){haptic();onClick();}}} style={{width:w,height:h,perspective:600,cursor:onClick?"pointer":"default",flexShrink:0}}><div style={{width:"100%",height:"100%",position:"relative",transformStyle:"preserve-3d",transition:"transform 0.6s cubic-bezier(0.4,0,0.2,1)",transform:faceUp?"rotateY(180deg)":"rotateY(0)"}}>
{/* BACK — numogram.png */}
<div style={{position:"absolute",width:"100%",height:"100%",backfaceVisibility:"hidden",borderRadius:6,background:"#000",border:"1px solid "+(selected?"#0f3":"#1a3a1a"),display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",boxShadow:selected?"0 0 14px rgba(0,255,51,0.4)":"0 2px 6px rgba(0,0,0,0.6)"}}><img src="/numogram.png" alt="" style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:5,opacity:0.85}}/></div>
{/* FACE */}
<div style={{position:"absolute",width:"100%",height:"100%",backfaceVisibility:"hidden",borderRadius:6,transform:"rotateY(180deg)",background:matched?"linear-gradient(145deg,#0a1a0a,#001a00)":"linear-gradient(145deg,#1a1a2e,#0f0f1a)",border:"1px solid "+(matched?"#0f3":selected?"#0ff":"#333"),display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",boxShadow:matched?"0 0 14px rgba(0,255,51,0.3)":selected?"0 0 10px rgba(0,255,255,0.3)":"0 2px 6px rgba(0,0,0,0.6)",opacity:matched?0.4:1,transition:"opacity 0.3s"}}><div style={{position:"absolute",top:3,left:5,color:sc,fontSize:10,fontFamily:"monospace",lineHeight:1}}><div>{dv}</div><div style={{fontSize:9}}>{SS[card.suit]}</div></div><div style={{color:sc,fontSize:Math.max(18,w*0.3),fontWeight:"bold",fontFamily:"'Courier New',monospace",textShadow:"0 0 8px "+sc+"40"}}>{SS[card.suit]}</div><div style={{color:sc,fontSize:Math.max(14,w*0.23),fontWeight:"bold",fontFamily:"monospace"}}>{dv}</div><div style={{position:"absolute",bottom:3,right:5,color:sc,fontSize:10,fontFamily:"monospace",lineHeight:1,transform:"rotate(180deg)"}}><div>{dv}</div><div style={{fontSize:9}}>{SS[card.suit]}</div></div><div style={{position:"absolute",inset:0,borderRadius:6,pointerEvents:"none",background:"repeating-linear-gradient(0deg,transparent,transparent 1px,rgba(0,0,0,0.07) 1px,rgba(0,0,0,0.07) 2px)"}}/></div>
</div></div>);};

// ═══ DEMON ORACLE OVERLAY ═══
const DemonOracle=({result,onClose,onShare})=>{const[vis,setVis]=useState(false);const[gl,setGl]=useState(false);const glRef=useRef({x:0,y:0});useEffect(()=>{hapticHeavy();setTimeout(()=>setVis(true),100);const iv=setInterval(()=>{glRef.current={x:(Math.random()*2-1),y:(Math.random()*2-1)};setGl(true);setTimeout(()=>setGl(false),150);},4000+Math.random()*5000);return()=>clearInterval(iv);},[]);if(!result)return null;const ang=result.type==="angelic";const d=result.demon;const ac=ang?"#ffd700":"#ff0044";const Sec=({label,children})=>(<div style={{borderTop:"1px solid "+ac+"18",paddingTop:12,marginBottom:12}}><div style={{color:ac,fontSize:11,letterSpacing:3,marginBottom:6}}>{label}</div><div style={{color:"#ccc",fontSize:16,lineHeight:1.8}}>{children}</div></div>);
  return(<div style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(0,0,0,0.94)",display:"flex",alignItems:"center",justifyContent:"center",opacity:vis?1:0,transition:"opacity 0.8s",backdropFilter:"blur(10px)",padding:12}} onClick={onClose}><div onClick={e=>e.stopPropagation()} style={{maxWidth:400,width:"100%",maxHeight:"88vh",overflowY:"auto",background:"linear-gradient(180deg,#0a0a0a,#050510)",border:"1px solid "+ac+"30",borderRadius:4,padding:"24px 20px",fontFamily:"'Courier New',monospace",transform:gl?"translate("+glRef.current.x+"px,"+glRef.current.y+"px)":"none",boxShadow:"0 0 50px "+ac+"15",position:"relative",WebkitOverflowScrolling:"touch"}}><div style={{position:"absolute",inset:0,pointerEvents:"none",background:"repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(255,255,255,0.015) 2px,rgba(255,255,255,0.015) 4px)"}}/>
    {ang?(<><div style={{color:"#ffd700",fontSize:12,letterSpacing:5,marginBottom:8}}>◈ ANGELIC INDEX ◈</div><div style={{color:"#ffd700",fontSize:38,fontWeight:"bold",marginBottom:6}}>+{result.score}</div><div style={{color:"#ffd700aa",fontSize:17,marginBottom:16,lineHeight:1.7}}>{ANGELIC_INDEX[Math.min(result.score,ANGELIC_INDEX.length-1)]}</div><div style={{color:"#888",fontSize:15,lineHeight:1.7}}>Positive results contribute to the Angelic Index. Maximum single-game gain is 38.</div></>):(<>
      <div style={{color:ac,fontSize:12,letterSpacing:5,marginBottom:8}}>◈ DEMON CALL ◈</div>
      <div style={{color:ac,fontSize:30,fontWeight:"bold",marginBottom:4,textShadow:"0 0 15px "+ac+"50"}}>{d.name}</div>
      <div style={{color:"#888",fontSize:14,marginBottom:16}}>Mesh-{d.mesh} · {d.type} · [{d.netSpan}]</div>
      <Sec label="ZONE PASSAGE">{d.zone}</Sec>
      {d.syzygy&&<Sec label="SYZYGY">{d.syzygy}</Sec>}
      <Sec label="DOMAIN">{d.domain}</Sec>
      {d.planet&&<Sec label="PLANETARY AFFINITY">{d.planet}{d.spine?" · "+d.spine:""}</Sec>}
      <Sec label="DESCRIPTION">{d.description}</Sec>
      <Sec label="OMEN"><em>{d.omen}</em></Sec>
      <Sec label="POWER">{d.power}</Sec>
      {INTERPRETATIONS[result.score]&&<Sec label="◈ FULL INTERPRETATION ◈"><div style={{color:"#aaa",fontSize:15,lineHeight:1.9,fontStyle:"italic"}}>{INTERPRETATIONS[Math.min(result.score,44)]}</div></Sec>}
      <div style={{color:"#555",fontSize:12,marginTop:16,textAlign:"center"}}>Score: -{result.score} · Aeon Terminated</div>
    </>)}
    <div style={{display:"flex",gap:8,marginTop:18}}>
      <button onClick={onClose} style={{flex:1,padding:"14px",background:"transparent",border:"1px solid "+ac+"40",color:ac,fontFamily:"monospace",fontSize:13,letterSpacing:3,cursor:"pointer",borderRadius:2}}>DISMISS</button>
      {!ang&&onShare&&<button onClick={()=>{haptic();onShare();}} style={{flex:1,padding:"14px",background:"transparent",border:"1px solid "+ac+"40",color:ac,fontFamily:"monospace",fontSize:12,letterSpacing:2,cursor:"pointer",borderRadius:2}}>SHARE</button>}
    </div>
  </div></div>);
};

// ═══ TUTORIAL OVERLAY ═══
const Tutorial=({onClose,mode})=>{const[step,setStep]=useState(0);const accent=mode==="subdecadence"?"#f0f":"#0f3";const steps=[{title:"THE ATLANTEAN CROSS",body:"Five cards are dealt face-up in a cross formation — these are your Set-1 pylons: Far Future, Destructive, Creative, Memories, and Deep Past."},{title:"THE CONCEALED SET",body:"Five more cards are dealt face-down as Set-2. Tap them left-to-right to reveal one at a time."},{title:"PAIR TO SUM "+(mode==="subdecadence"?"9":"10"),body:"When a Set-2 card is revealed, tap a Set-1 card to pair them. The pair must sum to "+(mode==="subdecadence"?"9 (Numogram Syzygies)":"10")+". Score = the difference between the two values."},{title:"THE ORACLE SPEAKS",body:"After all 5 Set-2 cards are revealed, end the round. Positive score = Angelic Index. Negative score = Demon Call from the Pandemonium Matrix. The Aeon ends."},{title:"AEON PERSISTENCE",body:"Your longest Aeon streak and highest scores are tracked. Demons called are logged in your history. Begin."}];
  return(<div style={{position:"fixed",inset:0,zIndex:1100,background:"rgba(0,0,0,0.95)",display:"flex",alignItems:"center",justifyContent:"center",padding:16,backdropFilter:"blur(8px)"}}><div style={{maxWidth:360,width:"100%",background:"#0a0a0a",border:"1px solid "+accent+"30",borderRadius:4,padding:"28px 22px",fontFamily:"monospace"}}><div style={{color:accent,fontSize:9,letterSpacing:5,marginBottom:4}}>TUTORIAL · {step+1}/{steps.length}</div><div style={{color:accent,fontSize:16,fontWeight:"bold",marginBottom:12,letterSpacing:2}}>{steps[step].title}</div><div style={{color:"#999",fontSize:13,lineHeight:1.8,marginBottom:20}}>{steps[step].body}</div><div style={{display:"flex",gap:8}}>{step>0&&<button onClick={()=>{haptic();setStep(s=>s-1);}} style={{flex:1,padding:"10px",background:"transparent",border:"1px solid #333",color:"#666",fontFamily:"monospace",fontSize:11,letterSpacing:2,cursor:"pointer",borderRadius:2}}>BACK</button>}<button onClick={()=>{haptic();if(step<steps.length-1)setStep(s=>s+1);else{saveData("tutorialSeen",true);onClose();}}} style={{flex:1,padding:"10px",background:"transparent",border:"1px solid "+accent,color:accent,fontFamily:"monospace",fontSize:11,letterSpacing:2,cursor:"pointer",borderRadius:2}}>{step<steps.length-1?"NEXT":"BEGIN"}</button></div><div style={{display:"flex",justifyContent:"center",gap:6,marginTop:14}}>{steps.map((_,i)=><div key={i} style={{width:6,height:6,borderRadius:3,background:i===step?accent:"#333"}}/>)}</div></div></div>);
};

// ═══ STANDALONE NUMOGRAM ORACLE ═══

// ═══ MAIN GAME ═══
export default function DecadenceGame(){
  const[mode,setMode]=useState("decadence");
  const targetSum=mode==="decadence"?10:9;
  const[deck,setDeck]=useState([]);
  const[set1,setSet1]=useState([]);
  const[set2,setSet2]=useState([]);
  const[revealedIndex,setRevealedIndex]=useState(-1);
  const[selectedSet2,setSelectedSet2]=useState(null);
  const[matchedSet1,setMatchedSet1]=useState(new Set());
  const[matchedSet2,setMatchedSet2]=useState(new Set());
  const[score,setScore]=useState(0);
  const[aeonScore,setAeonScore]=useState(0);
  const[roundResults,setRoundResults]=useState([]);
  const[gamePhase,setGamePhase]=useState("menu");
  const[oracleResult,setOracleResult]=useState(null);
  const[message,setMessage]=useState("");
  const[roundNum,setRoundNum]=useState(0);
  const[glitchText,setGlitchText]=useState(false);
  const[showTutorial,setShowTutorial]=useState(false);
  const[showHistory,setShowHistory]=useState(false);
  
  const glitchOffset=useRef({x:0,y:0});
  const canvasRef=useRef(null);
  const animRef=useRef(null);

  // Persistence
  const[bestAeon,setBestAeon]=useState(()=>loadData("bestAeon",0));
  const[bestRounds,setBestRounds]=useState(()=>loadData("bestRounds",0));
  const[totalGames,setTotalGames]=useState(()=>loadData("totalGames",0));
  const[demonLog,setDemonLog]=useState(()=>loadData("demonLog",[]));

  const isSub=mode==="subdecadence";
  const accent=isSub?"#f0f":"#0f3";
  const accentRgb=isSub?"255,0,255":"0,255,51";

  // Ambient particles — color shifts with mode
  useEffect(()=>{
    const c=canvasRef.current;if(!c)return;const ctx=c.getContext("2d");let ps=[];
    const resize=()=>{c.width=window.innerWidth;c.height=window.innerHeight;};
    resize();window.addEventListener("resize",resize);
    for(let i=0;i<35;i++)ps.push({x:Math.random()*c.width,y:Math.random()*c.height,vx:(Math.random()-0.5)*0.2,vy:(Math.random()-0.5)*0.2,s:Math.random()*1.5+0.5,o:Math.random()*0.35+0.1,p:Math.random()*6.28});
    const anim=()=>{ctx.clearRect(0,0,c.width,c.height);
      for(let i=0;i<ps.length;i++)for(let j=i+1;j<ps.length;j++){const dx=ps[i].x-ps[j].x,dy=ps[i].y-ps[j].y,d=Math.sqrt(dx*dx+dy*dy);if(d<110){ctx.beginPath();ctx.moveTo(ps[i].x,ps[i].y);ctx.lineTo(ps[j].x,ps[j].y);ctx.strokeStyle="rgba("+accentRgb+","+(0.035*(1-d/110))+")";ctx.lineWidth=0.5;ctx.stroke();}}
      ps.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.p+=0.02;if(p.x<0)p.x=c.width;if(p.x>c.width)p.x=0;if(p.y<0)p.y=c.height;if(p.y>c.height)p.y=0;const g=Math.sin(p.p)*0.3+0.7;ctx.beginPath();ctx.arc(p.x,p.y,p.s*g,0,6.28);ctx.fillStyle="rgba("+accentRgb+","+(p.o*g)+")";ctx.fill();});
      animRef.current=requestAnimationFrame(anim);};
    anim();return()=>{window.removeEventListener("resize",resize);if(animRef.current)cancelAnimationFrame(animRef.current);};
  },[accentRgb]);

  useEffect(()=>{const iv=setInterval(()=>{glitchOffset.current={x:(Math.random()*3-1.5),y:(Math.random()*2-1)};setGlitchText(true);setTimeout(()=>setGlitchText(false),100);},5000+Math.random()*8000);return()=>clearInterval(iv);},[]);

  // Check first visit
  useEffect(()=>{if(!loadData("tutorialSeen",false))setShowTutorial(true);},[]);



  const createDeck=useCallback(()=>{
    const suits=["hearts","diamonds","clubs","spades"],cards=[];
    for(const s of suits){if(mode==="subdecadence")cards.push({value:0,suit:s,id:"Q-"+s});for(let v=1;v<=9;v++)cards.push({value:v,suit:s,id:v+"-"+s});}
    for(let i=cards.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[cards[i],cards[j]]=[cards[j],cards[i]];}return cards;
  },[mode]);

  const startAeon=()=>{haptic();setAeonScore(0);setRoundNum(0);const d=createDeck();const s1=d.splice(0,5),s2=d.splice(0,5);setDeck(d);setSet1(s1);setSet2(s2);setRevealedIndex(-1);setSelectedSet2(null);setMatchedSet1(new Set());setMatchedSet2(new Set());setScore(0);setRoundResults([]);setGamePhase("playing");setMessage("TAP A SET-2 CARD TO REVEAL");setRoundNum(1);setTotalGames(g=>{const n=g+1;saveData("totalGames",n);return n;});};

  const dealRound=useCallback(()=>{haptic();let d=deck.length>=10?[...deck]:createDeck();const s1=d.splice(0,5),s2=d.splice(0,5);setDeck(d);setSet1(s1);setSet2(s2);setRevealedIndex(-1);setSelectedSet2(null);setMatchedSet1(new Set());setMatchedSet2(new Set());setScore(0);setRoundResults([]);setGamePhase("playing");setMessage("TAP A SET-2 CARD TO REVEAL");setRoundNum(r=>r+1);},[deck,createDeck]);

  const revealNext=(i)=>{if(revealedIndex>=i||matchedSet2.has(i))return;haptic();setRevealedIndex(i);setSelectedSet2(i);setGamePhase("pairing");setMessage("SELECT A SET-1 CARD TO PAIR, OR SKIP");};

  const attemptPair=(si)=>{if(gamePhase!=="pairing"||matchedSet1.has(si)||selectedSet2===null)return;const c1=set1[si],c2=set2[selectedSet2];if(c1.value+c2.value===targetSum){haptic(25);const diff=Math.abs(c1.value-c2.value);setMatchedSet1(p=>new Set([...p,si]));setMatchedSet2(p=>new Set([...p,selectedSet2]));setScore(s=>s+diff);setRoundResults(p=>[...p,{score:diff,cards:[c1,c2]}]);setSelectedSet2(null);setMessage("PAIRED: "+c1.value+"+"+c2.value+"="+targetSum+" +"+diff);setGamePhase("playing");}else{haptic(8);setMessage(c1.value+"+"+c2.value+"="+(c1.value+c2.value)+" != "+targetSum);}};

  const skipPair=()=>{if(selectedSet2!==null){const rc=set2[selectedSet2];if(set1.some((c,i)=>!matchedSet1.has(i)&&c.value+rc.value===targetSum)){haptic(40);setMessage("VALID PAIR EXISTS");return;}}haptic();setSelectedSet2(null);setGamePhase("playing");setMessage("NO MATCH — SKIPPED");};

  const endRound=()=>{haptic();let pen=0;set1.forEach((c,i)=>{if(!matchedSet1.has(i))pen+=c.value;});const tot=score-pen;
    if(tot>=0){
      const newAeon=aeonScore+tot;
      setAeonScore(newAeon);
      if(newAeon>bestAeon){setBestAeon(newAeon);saveData("bestAeon",newAeon);}
      if(roundNum>bestRounds){setBestRounds(roundNum);saveData("bestRounds",roundNum);}
      setOracleResult({type:"angelic",score:tot});setGamePhase("roundEnd");
    }else{
      const mesh=Math.min(Math.abs(tot),44);
      const d=DEMONS[mesh];
      // Log demon call
      const entry={demon:d.name,mesh:d.mesh,score:Math.abs(tot),aeonScore,rounds:roundNum,mode,date:new Date().toISOString()};
      const newLog=[entry,...demonLog].slice(0,50);
      setDemonLog(newLog);saveData("demonLog",newLog);
      if(roundNum>bestRounds){setBestRounds(roundNum);saveData("bestRounds",roundNum);}
      setOracleResult({type:"demonic",score:Math.abs(tot),demon:d});setGamePhase("aeonEnd");
    }
  };

  const shareDemonCall=()=>{
    if(!oracleResult||oracleResult.type==="angelic")return;
    const d=oracleResult.demon;
    const text="DEMON CALL: "+d.name+" (Mesh-"+d.mesh+")\n"+d.type+" · ["+d.netSpan+"]\nDomain: "+d.domain+"\nOmen: "+d.omen+"\n\nGet your own reading at\nhttps://playdecadence.online";
    if(navigator.share){navigator.share({title:"Demon Call: "+d.name,text}).catch(()=>{});}
    else if(navigator.clipboard){navigator.clipboard.writeText(text).then(()=>alert("Copied to clipboard"));}
  };

  const allRevealed=revealedIndex>=4;
  
  // Responsive card sizing — fills viewport on any screen
  // Fixed UI ~210px, remaining split across 4 card heights
  // Also constrain by width: 5 cards + gaps must fit in ~390px
  const vh = typeof window !== 'undefined' ? window.innerHeight : 700;
  const vw = typeof window !== 'undefined' ? Math.min(window.innerWidth, 400) : 400;
  const fromHeight = Math.floor((vh - 210) / 4);
  const fromWidth = Math.floor((vw - 30) / 5 * 1.77); // 5 cards in set-2 row
  const CH = Math.max(75, Math.min(130, fromHeight, fromWidth));
  const CW = Math.round(CH / 1.77);

  // ═══ SUBDECADENCE VISUAL OVERHAUL ═══
  const bgOverlay=isSub?"repeating-linear-gradient(0deg,transparent,transparent 1px,rgba(255,0,255,0.04) 1px,rgba(255,0,255,0.04) 3px)":"repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.06) 2px,rgba(0,0,0,0.06) 4px)";
  const vignetteColor=isSub?"rgba(40,0,40,0.6)":"rgba(0,0,0,0.5)";

  return(
    <div style={{minHeight:"100dvh",width:"100%",background:isSub?"#050005":"#000",color:"#ccc",fontFamily:"'Courier New',monospace",position:"relative",overflow:"hidden",WebkitTapHighlightColor:"transparent",transition:"background 0.5s"}}>
      <canvas ref={canvasRef} style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none",opacity:isSub?0.6:0.5}}/>
      <div style={{position:"fixed",inset:0,zIndex:1,pointerEvents:"none",background:bgOverlay,transition:"background 0.5s"}}/>
      <div style={{position:"fixed",inset:0,zIndex:1,pointerEvents:"none",background:"radial-gradient(ellipse at center,transparent 50%,"+vignetteColor+" 100%)"}}/>
      {isSub&&<div style={{position:"fixed",inset:0,zIndex:1,pointerEvents:"none",background:"radial-gradient(circle at 50% 30%,rgba(80,0,80,0.08) 0%,transparent 60%)"}}/>}

      <div style={{position:"relative",zIndex:2,maxWidth:400,margin:"0 auto",padding:"6px 8px 10px",minHeight:"100dvh",overflow:gamePhase==="menu"?"auto":"auto"}}>

        <header style={{textAlign:"center",marginBottom:6,paddingTop:4}}>
          <div style={{fontSize:7,letterSpacing:5,color:accent,opacity:0.4,marginBottom:1}}>◈ PANDEMONIUM MATRIX ◈</div>
          <h1 style={{fontSize:18,fontWeight:"bold",margin:0,letterSpacing:4,color:accent,textShadow:"0 0 20px "+accent+"60,0 0 40px "+accent+"20",transform:glitchText?"translate("+glitchOffset.current.x+"px,"+glitchOffset.current.y+"px)":"none",transition:"color 0.5s"}}>{isSub?"SUBDECADENCE":"DECADENCE"}</h1>
          <div style={{fontSize:8,color:"#555",letterSpacing:2,marginTop:1}}>{isSub?"THE ULTIMATE BLASPHEMY · PAIRS → 9":"ATLANTEAN TIME-SORCERY · PAIRS → 10"}</div>
        </header>

        {/* MODE TOGGLE + CONTROLS */}
        <div style={{display:"flex",justifyContent:"center",gap:6,marginBottom:8,flexWrap:"wrap"}}>
          <button onClick={()=>{haptic();setMode(m=>m==="decadence"?"subdecadence":"decadence");}} style={{padding:"5px 12px",background:"transparent",border:"1px solid "+accent+"40",color:accent,fontFamily:"monospace",fontSize:9,letterSpacing:2,cursor:"pointer",borderRadius:2}}>⇄ {isSub?"DECADENCE":"SUBDECADENCE"}</button>
          {gamePhase==="menu"&&<button onClick={()=>{haptic();setShowTutorial(true);}} style={{padding:"5px 12px",background:"transparent",border:"1px solid #333",color:"#555",fontFamily:"monospace",fontSize:9,letterSpacing:2,cursor:"pointer",borderRadius:2}}>? TUTORIAL</button>}
        </div>

        {/* SCORE BAR */}
        {gamePhase!=="menu"&&(<div style={{display:"flex",justifyContent:"space-around",alignItems:"center",padding:"4px 10px",marginBottom:6,background:"rgba(0,0,0,0.5)",border:"1px solid "+(isSub?"#1a001a":"#1a1a1a"),borderRadius:2,fontSize:10,letterSpacing:1}}>
          <span style={{color:"#555"}}>AEON <span style={{color:accent}}>{aeonScore}</span></span>
          <span style={{color:"#555"}}>ROUND <span style={{color:"#0ff"}}>{roundNum}</span></span>
          <span style={{color:"#555"}}>SCORE <span style={{color:score>=0?accent:"#f04"}}>{score}</span></span>
        </div>)}

        {/* ═══ MENU ═══ */}
        {gamePhase==="menu"&&(
          <div style={{textAlign:"center",paddingTop:12}}>
            <div style={{marginBottom:16,display:"flex",justifyContent:"center"}}><img src="/numogram.png" alt="Numogram" style={{height:160,width:"auto",borderRadius:6,opacity:0.85,filter:"drop-shadow(0 0 12px rgba(0,255,51,0.2))"}}/></div>
            <button onClick={startAeon} style={{padding:"12px 36px",background:"transparent",border:"1px solid "+accent,color:accent,fontFamily:"monospace",fontSize:14,letterSpacing:5,cursor:"pointer",borderRadius:2,boxShadow:"0 0 25px "+accent+"20",marginBottom:10,display:"block",margin:"0 auto 10px"}}>BEGIN AEON</button>



            {/* STATS BAR */}
            {(bestAeon>0||totalGames>0)&&(<div style={{display:"flex",justifyContent:"center",gap:16,marginBottom:16,fontSize:10,color:"#555"}}>
              {bestAeon>0&&<span>BEST AEON: <span style={{color:accent}}>{bestAeon}</span></span>}
              {bestRounds>0&&<span>LONGEST: <span style={{color:"#0ff"}}>{bestRounds}</span> RNDs</span>}
              <span>GAMES: <span style={{color:"#888"}}>{totalGames}</span></span>
            </div>)}

            {/* DEMON LOG */}
            {demonLog.length>0&&(<div style={{marginBottom:16}}>
              <button onClick={()=>setShowHistory(!showHistory)} style={{padding:"4px 12px",background:"transparent",border:"1px solid #222",color:"#444",fontFamily:"monospace",fontSize:9,letterSpacing:2,cursor:"pointer",borderRadius:2,marginBottom:showHistory?8:0}}>{showHistory?"HIDE":"SHOW"} DEMON LOG ({demonLog.length})</button>
              {showHistory&&<div style={{maxHeight:200,overflowY:"auto",border:"1px solid #1a1a1a",borderRadius:2,padding:"6px 8px",background:"rgba(0,0,0,0.3)"}}>
                {demonLog.map((e,i)=><div key={i} style={{fontSize:10,color:"#666",marginBottom:4,borderBottom:"1px solid #111",paddingBottom:4}}>
                  <span style={{color:"#f04"}}>{e.demon}</span> <span style={{color:"#444"}}>Mesh-{e.mesh} · -{e.score} · Rnd {e.rounds} · {e.mode}</span>
                </div>)}
              </div>}
            </div>)}

            {/* RULES */}
            <div style={{padding:"14px 12px",textAlign:"left",border:"1px solid "+(isSub?"#1a001a":"#1a1a1a"),borderRadius:2,background:isSub?"rgba(20,0,20,0.3)":"rgba(0,0,0,0.3)"}}>
              <div style={{color:accent,fontSize:10,letterSpacing:3,marginBottom:8}}>RULES</div>
              <div style={{color:"#999",fontSize:14,lineHeight:1.9,fontFamily:"'Courier New',monospace"}}>{isSub?"40 cards (1-9 x 4 suits + 4 Queens valued 0). Five dealt face-up on the Atlantean Cross, five face-down. Reveal Set-2 cards and pair with Set-1 to sum to 9 (Numogram Syzygies). Pairs score by difference. Unpaired cards penalize. Negative results call demons.":"36 cards (1-9 x 4 suits). Five face-up on the Atlantean Cross (Set-1), five face-down (Set-2). Reveal and pair to sum to 10. Pairs score by difference (5+5=0, 9+1=8). Unpaired cards penalize. An Aeon ends on first negative result."}</div>
            </div>

          </div>
        )}


        {/* ═══ GAME BOARD ═══ */}
        {(gamePhase==="playing"||gamePhase==="pairing")&&(<>
          <div style={{textAlign:"center",padding:"3px 8px",marginBottom:4,color:message.includes("VALID")||message.includes("!=")?"#ff4444":accent,fontSize:10,letterSpacing:1,minHeight:16,fontWeight:message.includes("VALID")?"bold":"normal"}}>{message}</div>

          <div style={{marginBottom:6}}>
            <div style={{color:"#444",fontSize:8,letterSpacing:3,textAlign:"center",marginBottom:4}}>◈ SET-1 · ATLANTEAN CROSS ◈</div>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
              <Card card={set1[0]} faceUp selected={false} matched={matchedSet1.has(0)} onClick={()=>attemptPair(0)} w={CW} h={CH}/>
              <div style={{display:"inline-flex",gap:5}}>
                <Card card={set1[1]} faceUp selected={false} matched={matchedSet1.has(1)} onClick={()=>attemptPair(1)} w={CW} h={CH}/>
                <Card card={set1[2]} faceUp selected={false} matched={matchedSet1.has(2)} onClick={()=>attemptPair(2)} w={CW} h={CH}/>
                <Card card={set1[3]} faceUp selected={false} matched={matchedSet1.has(3)} onClick={()=>attemptPair(3)} w={CW} h={CH}/>
              </div>
              <Card card={set1[4]} faceUp selected={false} matched={matchedSet1.has(4)} onClick={()=>attemptPair(4)} w={CW} h={CH}/>
            </div>
          </div>

          <div style={{height:1,background:"linear-gradient(90deg,transparent,"+accent+"25,transparent)",marginBottom:6}}/>

          <div>
            <div style={{color:"#444",fontSize:8,letterSpacing:3,textAlign:"center",marginBottom:4}}>◈ SET-2 · CONCEALED ◈</div>
            <div style={{display:"flex",justifyContent:"center",gap:Math.max(3, Math.min(5, Math.floor((400 - 5*CW)/6)))}}>
              {set2.map((card,i)=><Card key={card.id} card={card} faceUp={i<=revealedIndex} selected={selectedSet2===i} matched={matchedSet2.has(i)} onClick={gamePhase==="playing"&&i===revealedIndex+1&&!matchedSet2.has(i)?()=>revealNext(i):null} w={CW} h={CH}/>)}
            </div>
          </div>

          <div style={{display:"flex",justifyContent:"center",gap:8,marginTop:10}}>
            {gamePhase==="pairing"&&<button onClick={skipPair} style={{padding:"6px 16px",background:"transparent",border:"1px solid #ff444440",color:"#ff4444",fontFamily:"monospace",fontSize:10,letterSpacing:2,cursor:"pointer",borderRadius:2}}>SKIP</button>}
            {allRevealed&&gamePhase!=="pairing"&&<button onClick={endRound} style={{padding:"6px 20px",background:"transparent",border:"1px solid "+accent,color:accent,fontFamily:"monospace",fontSize:10,letterSpacing:3,cursor:"pointer",borderRadius:2,boxShadow:"0 0 15px "+accent+"18"}}>END ROUND</button>}
          </div>

          {roundResults.length>0&&(<div style={{marginTop:8,padding:"6px 10px",background:"rgba(0,0,0,0.35)",border:"1px solid #1a1a1a",borderRadius:2,fontSize:10}}>
            <div style={{color:"#444",letterSpacing:2,marginBottom:3,fontSize:8}}>PAIRS</div>
            {roundResults.map((r,i)=><div key={i} style={{color:accent,marginBottom:1}}>{r.cards[0].value}{SS[r.cards[0].suit]} + {r.cards[1].value}{SS[r.cards[1].suit]} = {targetSum} +{r.score}</div>)}
          </div>)}
        </>)}

        {/* ═══ ROUND END ═══ */}
        {gamePhase==="roundEnd"&&(<div style={{textAlign:"center",paddingTop:36}}>
          <div style={{color:"#ffd700",fontSize:10,letterSpacing:4,marginBottom:6}}>ROUND COMPLETE</div>
          <div style={{color:"#ffd700",fontSize:36,fontWeight:"bold",marginBottom:6}}>+{score}</div>
          <div style={{color:"#888",fontSize:12,marginBottom:6}}>Aeon Total: {aeonScore}</div>
          <div style={{color:"#ffd70088",fontSize:13,fontStyle:"italic",marginBottom:24}}>{ANGELIC_INDEX[Math.min(score,ANGELIC_INDEX.length-1)]}</div>
          <button onClick={dealRound} style={{padding:"10px 28px",background:"transparent",border:"1px solid #ffd700",color:"#ffd700",fontFamily:"monospace",fontSize:12,letterSpacing:4,cursor:"pointer",borderRadius:2}}>NEXT ROUND</button>
        </div>)}

        {/* ═══ AEON END ═══ */}
        {gamePhase==="aeonEnd"&&(<div style={{textAlign:"center",paddingTop:36}}>
          <div style={{color:"#f04",fontSize:10,letterSpacing:4,marginBottom:6}}>AEON TERMINATED</div>
          <div style={{color:"#f04",fontSize:30,fontWeight:"bold",marginBottom:6}}>DEMON CALL</div>
          <div style={{color:"#888",fontSize:12,marginBottom:24}}>Final Aeon: {aeonScore} · {roundNum} rounds</div>
          <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>
            <button onClick={()=>setOracleResult({type:"demonic",score:Math.abs(score),demon:DEMONS[Math.min(Math.abs(score),44)]||DEMONS[0]})} style={{padding:"10px 20px",background:"transparent",border:"1px solid #f04",color:"#f04",fontFamily:"monospace",fontSize:11,letterSpacing:3,cursor:"pointer",borderRadius:2}}>VIEW ORACLE</button>
            <button onClick={()=>{haptic();setGamePhase("menu");}} style={{padding:"10px 20px",background:"transparent",border:"1px solid #44444440",color:"#666",fontFamily:"monospace",fontSize:11,letterSpacing:3,cursor:"pointer",borderRadius:2}}>NEW AEON</button>
          </div>
        </div>)}

      </div>

      {oracleResult&&<DemonOracle result={oracleResult} onClose={()=>setOracleResult(null)} onShare={shareDemonCall}/>}
      {showTutorial&&<Tutorial onClose={()=>setShowTutorial(false)} mode={mode}/>}
    </div>
  );
}
