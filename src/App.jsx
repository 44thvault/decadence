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
  0: { name: "Lurgo", mesh: "00", netSpan: "1::0", type: "Amphidemon", syzygy: null, zone: "1→0", domain: "The First Door", planet: "Sun", spine: "Coccyx", description: "The Initiator. Gateway between existence and void. Lurgo opens all passages and closes all returns. Associated with Legba, first and last invoked.", omen: "Beginnings that contain their own endings", power: "Initiation of sorcerous contact" },
  1: { name: "Duoddod", mesh: "01", netSpan: "2::0", type: "Amphidemon", syzygy: null, zone: "2→0", domain: "The Second Door", planet: "Mercury", spine: "Lower Sacrum", description: "The Main Lo-Way into the Crypt. Duoddod reduplicates double-twinness through its multitude.", omen: "Paths that fork beneath the surface", power: "Access to hidden passages" },
  2: { name: "Sarkon", mesh: "02", netSpan: "2::1", type: "Cyclic Chronodemon", syzygy: null, zone: "2→1", domain: "Mesh Engineering", planet: null, spine: null, description: "Architect of the mesh-horizon. Sarkon tags encode sequential indices for Axsys code.", omen: "Systematic collapse of temporal intervals", power: "Micropause manipulation" },
  3: { name: "Krako", mesh: "03", netSpan: "3::0", type: "Amphidemon", syzygy: null, zone: "3→0", domain: "The Fourth Door", planet: "Earth", spine: "Mid-Sacrum", description: "Storm-herald of the Warp. Krako clicks the gate between drift and depths.", omen: "Electrical disturbance presaging change", power: "Warp-current navigation" },
  4: { name: "Tchu", mesh: "04", netSpan: "3::1", type: "Chaotic Xenodemon", syzygy: null, zone: "3→1", domain: "The Sixth Door", planet: "Jupiter", spine: "Lower Lumbar", description: "Cipher of the alien gate. Tchu haunts the threshold between Warp and Torque.", omen: "Anomalous intrusions from outside time", power: "Xenodimensional breach" },
  5: { name: "Djungo", mesh: "05", netSpan: "3::2", type: "Cyclic Chronodemon", syzygy: null, zone: "3→2", domain: "Vortical Escalation", planet: null, spine: null, description: "Rising from Lesser Depths to Twin Heavens. Djungo traces the spiral ascent.", omen: "Accelerating cycles of return", power: "Temporal escalation" },
  6: { name: "Nuttubab", mesh: "06", netSpan: "4::0", type: "Amphidemon", syzygy: null, zone: "4→0", domain: "Phase Limit", planet: null, spine: null, description: "Prowler of the Sink Current. Nuttubab marks the boundary of the fourth phase.", omen: "Terminal descent into foundation", power: "Phase dissolution" },
  7: { name: "Sukugool", mesh: "07", netSpan: "4::1", type: "Amphidemon", syzygy: null, zone: "4→1", domain: "Torque Passage", planet: null, spine: null, description: "Thread between falling drift and surge. Sukugool mediates the torque's inner tensions.", omen: "Gravitational anomalies in sequence", power: "Current redirection" },
  8: { name: "Skarkix", mesh: "08", netSpan: "4::2", type: "Cyclic Chronodemon", syzygy: null, zone: "4→2", domain: "Temporal Friction", planet: null, spine: null, description: "Chronodemon of grinding temporal resistance. Where timelines catch and spark.", omen: "Deja vu intensifying to crisis", power: "Time-friction weaponization" },
  9: { name: "Kuttadid", mesh: "09", netSpan: "4::3", type: "Amphidemon", syzygy: null, zone: "4→3", domain: "Spontaneous Emergence", planet: null, spine: null, description: "Born spontaneously between Katak and Oddubb, to neither's knowledge. A secret agent of the drift.", omen: "Unplanned convergences", power: "Covert temporal insertion" },
  10: { name: "Katak", mesh: "10", netSpan: "5::4", type: "Syzygetic Chronodemon", syzygy: "5::4", zone: "5↔4", domain: "The Sink", planet: "Mars", spine: "Solar Plexus", description: "The Desolator. Associated with desert, heat haze, shimmer. Katak hunts amongst raging storms.", omen: "Desiccation of all fluid systems", power: "Storm-sorcery and temporal precipitation" },
  11: { name: "Puppo", mesh: "11", netSpan: "5::0", type: "Amphidemon", syzygy: null, zone: "5→0", domain: "The Seventh Door", planet: "Saturn", spine: "Upper Lumbar", description: "Click of the spiral gate. Puppo draws lines of flight from the Rising Drift to the Plex.", omen: "Compulsive downward spiraling", power: "Gravitational acceleration" },
  12: { name: "Bubbur", mesh: "12", netSpan: "5::1", type: "Amphidemon", syzygy: null, zone: "5→1", domain: "Drift Transit", planet: null, spine: null, description: "Amphidemon of the falling trajectory. Bubbur marks the passage from rising to surge.", omen: "Sudden loss of altitude or status", power: "Controlled descent" },
  13: { name: "Gummo", mesh: "13", netSpan: "5::2", type: "Cyclic Chronodemon", syzygy: null, zone: "5→2", domain: "Hold Disruption", planet: null, spine: null, description: "Disrupts the hold current with insurgent temporality. Gummo is the glitch in the cycle.", omen: "Repetitive loops breaking apart", power: "Cycle interruption" },
  14: { name: "Tukkamu", mesh: "14", netSpan: "5::3", type: "Amphidemon", syzygy: null, zone: "5→3", domain: "Warp Access", planet: null, spine: null, description: "Gateway from the drift to the Twin Heavens. Tukkamu provides escape velocity from time.", omen: "Sudden clarity amid confusion", power: "Warp-entry facilitation" },
  15: { name: "Murrumur", mesh: "15", netSpan: "8::1", type: "Syzygetic Chronodemon", syzygy: "8::1", zone: "8↔1", domain: "The Surge", planet: "Moon", spine: "Heart", description: "The great sea-beast. Murrumur embodies the undivided oceanic waters, horrified by division.", omen: "Tidal overwhelming of boundaries", power: "Oceanic time-sorcery, surge manipulation" },
  16: { name: "Tchakol", mesh: "16", netSpan: "6::0", type: "Chaotic Xenodemon", syzygy: null, zone: "6→0", domain: "Outer Gate", planet: null, spine: null, description: "Xenodemon of absolute exteriority. Tchakol exists entirely outside the time circuit.", omen: "Total systemic alienation", power: "Communication with the Outside" },
  17: { name: "Numko", mesh: "17", netSpan: "6::1", type: "Amphidemon", syzygy: null, zone: "6→1", domain: "Warp Descent", planet: null, spine: null, description: "Traces the line from Twin Heavens down through the Torque.", omen: "Strange messages from unknown sources", power: "Vertical warp transit" },
  18: { name: "Mommoljo", mesh: "18", netSpan: "6::2", type: "Amphidemon", syzygy: null, zone: "6→2", domain: "Hold Invasion", planet: null, spine: null, description: "Amphidemon penetrating the hold current from the Warp.", omen: "Inexplicable interruptions to routine", power: "Temporal contamination" },
  19: { name: "Djynxx", mesh: "19", netSpan: "6::3", type: "Syzygetic Xenodemon", syzygy: "6::3", zone: "6↔3", domain: "The Warp", planet: "Venus", spine: "Throat", description: "The changeling. Defined by jinking, erratic zig-zagging movement. Nomad war machine, fluid metal body. Outside time.", omen: "Reality glitching, deja vu cascades", power: "Temporal jinx, vortical coincidence" },
  20: { name: "Oddubb", mesh: "20", netSpan: "7::2", type: "Syzygetic Chronodemon", syzygy: "7::2", zone: "7↔2", domain: "The Hold", planet: "Jupiter", spine: "Third Eye", description: "The amphibious double-agent. Duplicitous creature of ambiguous movement. Horror of dryness.", omen: "Double vision, split perception", power: "Amphibious time-navigation, hold manipulation" },
  21: { name: "Ixix", mesh: "21", netSpan: "6::4", type: "Chaotic Xenodemon", syzygy: null, zone: "6→4", domain: "Chaotic Gate", planet: null, spine: null, description: "Cipher and click of the storm-gate. Ixix channels pure chaos from the Warp into the Drift.", omen: "Cascading system failures", power: "Chaos injection" },
  22: { name: "Krakoddit", mesh: "22", netSpan: "6::5", type: "Amphidemon", syzygy: null, zone: "6→5", domain: "Upper Passage", planet: null, spine: null, description: "High amphidemon connecting the Warp to the upper drift.", omen: "Atmospheric pressure shifts", power: "Storm-warp navigation" },
  23: { name: "Mummumix", mesh: "23", netSpan: "8::3", type: "Amphidemon", syzygy: null, zone: "8→3", domain: "Tidal Vortex", planet: null, spine: null, description: "Detouring through spiral gates before arriving at the Twin Heavens. The tidal vortex incarnate.", omen: "Whirlpool logic, inescapable spirals", power: "Vortical transit" },
  24: { name: "Ummnu", mesh: "24", netSpan: "9::3", type: "Chaotic Xenodemon", syzygy: null, zone: "9→3", domain: "9th Phase Limit", planet: null, spine: null, description: "Final Phase Limit of all Pandemonium. Ummnu haunts gt-36 and ciphers Djynxx.", omen: "Terminal boundary dissolution", power: "Pandemonium culmination" },
  25: { name: "Oddobod", mesh: "25", netSpan: "7::0", type: "Amphidemon", syzygy: null, zone: "7→0", domain: "Abyssal Gate", planet: null, spine: null, description: "Deep amphidemon drawing lines from the upper torque to absolute zero.", omen: "Vertigo of infinite descent", power: "Abyssal plunge" },
  26: { name: "Obbommo", mesh: "26", netSpan: "7::1", type: "Amphidemon", syzygy: null, zone: "7→1", domain: "Surge Crossing", planet: null, spine: null, description: "Where the hold current meets the surge.", omen: "Cross-currents of conflicting time", power: "Current synthesis" },
  27: { name: "Minommo", mesh: "27", netSpan: "7::3", type: "Amphidemon", syzygy: null, zone: "7→3", domain: "Warp Thread", planet: null, spine: null, description: "Clicked by Djynxx. Second term in the circuit spanning Plex, Warp, and Lesser Depths.", omen: "Thread-like connections across vast distances", power: "Alien intensity distribution" },
  28: { name: "Krakattuk", mesh: "28", netSpan: "7::4", type: "Cyclic Chronodemon", syzygy: null, zone: "7→4", domain: "Storm Cycle", planet: null, spine: null, description: "The storm within the cycle. Krakattuk carries the violence of temporal transition.", omen: "Catastrophic weather, internal storms", power: "Cyclonic temporal force" },
  29: { name: "Doddunmuk", mesh: "29", netSpan: "7::5", type: "Cyclic Chronodemon", syzygy: null, zone: "7→5", domain: "Drift Tension", planet: null, spine: null, description: "Tension between the drifts. Doddunmuk holds the balance before it breaks.", omen: "Escalating tension without resolution", power: "Suspended temporal force" },
  30: { name: "Nuddimmud", mesh: "30", netSpan: "7::6", type: "Amphidemon", syzygy: null, zone: "7→6", domain: "Twin Passage", planet: null, spine: null, description: "Amphidemon of the Twin Heavens approach. Nuddimmud bridges the cranial zones.", omen: "Bilateral thinking, split consciousness", power: "Cranial zone navigation" },
  31: { name: "Murgaxoll", mesh: "31", netSpan: "8::0", type: "Amphidemon", syzygy: null, zone: "8→0", domain: "Deep Plunge", planet: null, spine: null, description: "From the upper depths to absolute zero.", omen: "Free-fall through temporal strata", power: "Extreme depth navigation" },
  32: { name: "Mummumox", mesh: "32", netSpan: "8::2", type: "Cyclic Chronodemon", syzygy: null, zone: "8→2", domain: "Tidal Memory", planet: null, spine: null, description: "Chronodemon of oceanic memory.", omen: "Drowning in memory", power: "Submersion in past-time" },
  33: { name: "Mommukol", mesh: "33", netSpan: "8::4", type: "Amphidemon", syzygy: null, zone: "8→4", domain: "Falling Surge", planet: null, spine: null, description: "Where oceanic force meets gravitational pull.", omen: "Overwhelming cascade of events", power: "Temporal deluge" },
  34: { name: "Mukammul", mesh: "34", netSpan: "8::5", type: "Amphidemon", syzygy: null, zone: "8→5", domain: "Rising Surge", planet: null, spine: null, description: "Tidal uplift through the drifts.", omen: "Rising tide lifting all vessels", power: "Surge elevation" },
  35: { name: "Murrumix", mesh: "35", netSpan: "8::6", type: "Amphidemon", syzygy: null, zone: "8→6", domain: "Deep Warp", planet: null, spine: null, description: "Where oceanic depths meet the alien Warp.", omen: "Deep sea anomalies", power: "Subaquatic warp transit" },
  36: { name: "Murrumux", mesh: "36", netSpan: "8::7", type: "Cyclic Chronodemon", syzygy: null, zone: "8→7", domain: "Surge-Hold", planet: null, spine: null, description: "The pulse between surge and hold.", omen: "Heartbeat irregularities", power: "Rhythmic time manipulation" },
  37: { name: "Uttunux", mesh: "37", netSpan: "9::1", type: "Amphidemon", syzygy: null, zone: "9→1", domain: "Plex Surge", planet: null, spine: null, description: "From the absolute depths to the first zone.", omen: "Something from nothing", power: "Void-surge channeling" },
  38: { name: "Unnubbat", mesh: "38", netSpan: "9::2", type: "Amphidemon", syzygy: null, zone: "9→2", domain: "Deep Hold", planet: null, spine: null, description: "Where the Plex invades the hold current.", omen: "Emptiness within repetition", power: "Void infiltration" },
  39: { name: "Uttundji", mesh: "39", netSpan: "9::4", type: "Amphidemon", syzygy: null, zone: "9→4", domain: "Deep Sink", planet: null, spine: null, description: "Void-force entering the sink.", omen: "Accelerating entropy", power: "Void-sink coupling" },
  40: { name: "Unnunukk", mesh: "40", netSpan: "9::5", type: "Amphidemon", syzygy: null, zone: "9→5", domain: "Deep Drift", planet: null, spine: null, description: "Plex influence reaching into the drifts.", omen: "Abyssal currents felt at surface", power: "Deep-drift resonance" },
  41: { name: "Uttundub", mesh: "41", netSpan: "9::6", type: "Chaotic Xenodemon", syzygy: null, zone: "9→6", domain: "Plex-Warp", planet: null, spine: null, description: "Connection between the two outer regions.", omen: "Contact with absolute outside", power: "Extra-temporal communion" },
  42: { name: "Unnummu", mesh: "42", netSpan: "9::7", type: "Amphidemon", syzygy: null, zone: "9→7", domain: "Deep Torque", planet: null, spine: null, description: "Void-force penetrating the upper torque.", omen: "Creation from void", power: "Void-torque generation" },
  43: { name: "Unnuttam", mesh: "43", netSpan: "9::8", type: "Cyclic Chronodemon", syzygy: null, zone: "9→8", domain: "Plex-Surge", planet: null, spine: null, description: "The deepest chronodemon. Where void meets ocean at the base of all time.", omen: "Primordial return", power: "Time-base manipulation" },
  44: { name: "Uttunul", mesh: "44", netSpan: "9::0", type: "Syzygetic Xenodemon", syzygy: "9::0", zone: "9↔0", domain: "The Plex", planet: "Pluto", spine: "Sacrum/Cthelll", description: "The flatline entity. Continuum, zero-intensity, void. Eternity as No-Time. Haunts gt-45, the gate of Pandemonium itself.", omen: "Absolute stillness preceding total transformation", power: "Void-sorcery, time annihilation, Pandemonium culmination" },
};

const ANGELIC_INDEX = ["Equilibrium","First Light","Duality's Gift","The Trident","Foundation Stone","Pentagrammic Seal","Hexadic Harmony","Seventh Gate","Octave Resonance","Novenary Apex","Decadic Completion"];

// ═══ NUMOGRAM SVG (Card Back) ═══
const NumogramSVG = ({ size = 120 }) => {
  const Z = {3:[82,72],6:[128,48],2:[172,118],7:[188,178],5:[58,168],4:[38,218],1:[125,262],8:[125,328],9:[125,386],0:[125,436]};
  const R=20,gr=8;
  const gates=[["15",128,16],["21",105,96],["5",56,114],["10",82,268],["1",128,232],["28",162,248],["36",156,348],["45",92,390]];
  const triDir={3:"r",6:"l",2:"l",7:"l",5:"r",4:"r",1:"d",8:"u",9:"d",0:"u"};
  const mkTri=(cx,cy,d)=>{const s=6;if(d==="u")return(cx-s)+","+(cy+s*0.6)+" "+cx+","+(cy-s)+" "+(cx+s)+","+(cy+s*0.6);if(d==="d")return(cx-s)+","+(cy-s*0.6)+" "+cx+","+(cy+s)+" "+(cx+s)+","+(cy-s*0.6);if(d==="r")return(cx-s*0.6)+","+(cy-s)+" "+(cx+s)+","+cy+" "+(cx-s*0.6)+","+(cy+s);return(cx+s*0.6)+","+(cy-s)+" "+(cx-s)+","+cy+" "+(cx+s*0.6)+","+(cy+s);};
  return (
    <svg viewBox="0 0 230 470" width={size} height={size*(470/230)} style={{display:"block",filter:"drop-shadow(0 0 4px rgba(0,255,136,0.2))"}}>
      <defs><radialGradient id="nbg" cx="50%" cy="30%" r="65%"><stop offset="0%" stopColor="#060d06"/><stop offset="100%" stopColor="#000"/></radialGradient><filter id="zgl"><feGaussianBlur stdDeviation="1.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
      <rect width="230" height="470" rx="10" fill="url(#nbg)" stroke="#0f3" strokeWidth="0.6" opacity="0.85"/>
      <path d={"M "+Z[6][0]+","+(Z[6][1]-R)+" C "+(Z[6][0]+10)+","+(Z[6][1]-55)+" "+(Z[3][0]-35)+","+(Z[3][1]-55)+" "+(Z[3][0]-25)+","+Z[3][1]+" Q "+(Z[3][0]-35)+","+(Z[3][1]+50)+" "+(Z[4][0]+5)+","+(Z[4][1]-10)} fill="none" stroke="#0f3" strokeWidth="0.8" opacity="0.3"/>
      <path d={"M "+Z[2][0]+","+Z[2][1]+" C "+(Z[2][0]-20)+","+(Z[2][1]+35)+" "+(Z[5][0]+50)+","+(Z[5][1]-15)+" "+Z[5][0]+","+Z[5][1]} fill="none" stroke="#0f3" strokeWidth="1.2" opacity="0.25"/>
      <polygon points={(Z[5][0]+8)+","+(Z[5][1]-5)+" "+(Z[5][0]-2)+","+Z[5][1]+" "+(Z[5][0]+8)+","+(Z[5][1]+5)} fill="#0f3" opacity="0.25"/>
      <path d={"M "+Z[7][0]+","+Z[7][1]+" C "+(Z[7][0]-5)+","+(Z[7][1]+40)+" "+(Z[1][0]+40)+","+(Z[1][1]-15)+" "+(Z[1][0]+R)+","+Z[1][1]} fill="none" stroke="#0f3" strokeWidth="1.2" opacity="0.25"/>
      <line x1={Z[4][0]+12} y1={Z[4][1]-12} x2={Z[5][0]-5} y2={Z[5][1]+12} stroke="#0f3" strokeWidth="3" opacity="0.12"/>
      <line x1={Z[4][0]+14} y1={Z[4][1]-10} x2={Z[5][0]-3} y2={Z[5][1]+14} stroke="#0f3" strokeWidth="1.5" opacity="0.08" strokeDasharray="2,3"/>
      {[[Z[6],Z[3]],[Z[6],Z[2]],[Z[3],Z[1]],[Z[4],Z[1]],[Z[1],Z[8]],[Z[8],Z[9]],[Z[9],Z[0]],[Z[2],Z[7]]].map(([a,b],i)=><line key={"f"+i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#0f3" strokeWidth="0.5" opacity="0.18"/>)}
      {[[Z[9],Z[0]],[Z[8],Z[1]],[Z[7],Z[2]],[Z[6],Z[3]],[Z[5],Z[4]]].map(([a,b],i)=><line key={"s"+i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#0f3" strokeWidth="0.4" opacity="0.1" strokeDasharray="3,4"/>)}
      <ellipse cx={Z[9][0]} cy={(Z[9][1]+Z[0][1])/2} rx="22" ry="32" fill="none" stroke="#0f3" strokeWidth="0.4" opacity="0.08"/>
      {Object.entries(Z).map(([z,[x,y]])=><g key={"z"+z} filter="url(#zgl)"><circle cx={x} cy={y} r={R} fill="#050905" stroke="#0f3" strokeWidth="1.2" opacity="0.85"/><polygon points={mkTri(x,y-1,triDir[z])} fill="#0f3" opacity="0.3"/><text x={x} y={y+7} textAnchor="middle" fill="#0f3" fontSize="16" fontFamily="monospace" fontWeight="bold" opacity="0.9">{z}</text></g>)}
      {gates.map(([v,x,y])=><g key={"g"+v}><circle cx={x} cy={y} r={gr} fill="#020502" stroke="#0f3" strokeWidth="0.5" opacity="0.4"/><text x={x} y={y+3} textAnchor="middle" fill="#0f3" fontSize="7.5" fontFamily="monospace" fontStyle="italic" opacity="0.5">{v}</text></g>)}
      <text x="115" y="462" textAnchor="middle" fill="#0f3" fontSize="6" fontFamily="monospace" opacity="0.25" letterSpacing="3">NUMOGRAM</text>
    </svg>
  );
};

// ═══ CARD COMPONENT ═══
const SS={hearts:"\u2665",diamonds:"\u2666",clubs:"\u2663",spades:"\u2660"};
const SC={hearts:"#ff1744",diamonds:"#ff1744",clubs:"#e0e0e0",spades:"#e0e0e0"};
const Card=({card,faceUp,onClick,selected,matched,w=58,h=87})=>{const dv=card.value===0?"Q":card.value;const sc=SC[card.suit];return(<div onClick={()=>{if(onClick){haptic();onClick();}}} style={{width:w,height:h,perspective:600,cursor:onClick?"pointer":"default",flexShrink:0}}><div style={{width:"100%",height:"100%",position:"relative",transformStyle:"preserve-3d",transition:"transform 0.6s cubic-bezier(0.4,0,0.2,1)",transform:faceUp?"rotateY(180deg)":"rotateY(0)"}}><div style={{position:"absolute",width:"100%",height:"100%",backfaceVisibility:"hidden",borderRadius:6,background:"linear-gradient(145deg,#080e08,#000)",border:"1px solid "+(selected?"#0f3":"#1a3a1a"),display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",boxShadow:selected?"0 0 14px rgba(0,255,51,0.4)":"0 2px 6px rgba(0,0,0,0.6)"}}><NumogramSVG size={w*0.72}/><div style={{position:"absolute",inset:0,borderRadius:6,pointerEvents:"none",background:"repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,255,51,0.03) 2px,rgba(0,255,51,0.03) 4px)"}}/></div><div style={{position:"absolute",width:"100%",height:"100%",backfaceVisibility:"hidden",borderRadius:6,transform:"rotateY(180deg)",background:matched?"linear-gradient(145deg,#0a1a0a,#001a00)":"linear-gradient(145deg,#1a1a2e,#0f0f1a)",border:"1px solid "+(matched?"#0f3":selected?"#0ff":"#333"),display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",boxShadow:matched?"0 0 14px rgba(0,255,51,0.3)":selected?"0 0 10px rgba(0,255,255,0.3)":"0 2px 6px rgba(0,0,0,0.6)",opacity:matched?0.4:1,transition:"opacity 0.3s"}}><div style={{position:"absolute",top:3,left:5,color:sc,fontSize:10,fontFamily:"monospace",lineHeight:1}}><div>{dv}</div><div style={{fontSize:9}}>{SS[card.suit]}</div></div><div style={{color:sc,fontSize:Math.max(18,w*0.3),fontWeight:"bold",fontFamily:"'Courier New',monospace",textShadow:"0 0 8px "+sc+"40"}}>{SS[card.suit]}</div><div style={{color:sc,fontSize:Math.max(14,w*0.23),fontWeight:"bold",fontFamily:"monospace"}}>{dv}</div><div style={{position:"absolute",bottom:3,right:5,color:sc,fontSize:10,fontFamily:"monospace",lineHeight:1,transform:"rotate(180deg)"}}><div>{dv}</div><div style={{fontSize:9}}>{SS[card.suit]}</div></div><div style={{position:"absolute",inset:0,borderRadius:6,pointerEvents:"none",background:"repeating-linear-gradient(0deg,transparent,transparent 1px,rgba(0,0,0,0.07) 1px,rgba(0,0,0,0.07) 2px)"}}/></div></div></div>);};

// ═══ DEMON ORACLE OVERLAY ═══
const DemonOracle=({result,onClose,onShare})=>{const[vis,setVis]=useState(false);const[gl,setGl]=useState(false);useEffect(()=>{hapticHeavy();setTimeout(()=>setVis(true),100);const iv=setInterval(()=>{setGl(true);setTimeout(()=>setGl(false),150);},3000+Math.random()*4000);return()=>clearInterval(iv);},[]);if(!result)return null;const ang=result.type==="angelic";const d=result.demon;const ac=ang?"#ffd700":"#ff0044";const Sec=({label,children})=>(<div style={{borderTop:"1px solid "+ac+"18",paddingTop:10,marginBottom:10}}><div style={{color:ac,fontSize:9,letterSpacing:3,marginBottom:4}}>{label}</div><div style={{color:"#bbb",fontSize:13,lineHeight:1.7}}>{children}</div></div>);
  return(<div style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(0,0,0,0.94)",display:"flex",alignItems:"center",justifyContent:"center",opacity:vis?1:0,transition:"opacity 0.8s",backdropFilter:"blur(10px)",padding:12}} onClick={onClose}><div onClick={e=>e.stopPropagation()} style={{maxWidth:400,width:"100%",maxHeight:"88vh",overflowY:"auto",background:"linear-gradient(180deg,#0a0a0a,#050510)",border:"1px solid "+ac+"30",borderRadius:4,padding:"22px 18px",fontFamily:"'Courier New',monospace",transform:gl?"translate("+(Math.random()*3-1.5)+"px,"+(Math.random()*3-1.5)+"px)":"none",boxShadow:"0 0 50px "+ac+"15",position:"relative",WebkitOverflowScrolling:"touch"}}><div style={{position:"absolute",inset:0,pointerEvents:"none",background:"repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(255,255,255,0.015) 2px,rgba(255,255,255,0.015) 4px)"}}/>
    {ang?(<><div style={{color:"#ffd700",fontSize:10,letterSpacing:5,marginBottom:6}}>◈ ANGELIC INDEX ◈</div><div style={{color:"#ffd700",fontSize:32,fontWeight:"bold",marginBottom:4}}>+{result.score}</div><div style={{color:"#ffd700aa",fontSize:14,marginBottom:14,lineHeight:1.6}}>{ANGELIC_INDEX[Math.min(result.score,ANGELIC_INDEX.length-1)]}</div><div style={{color:"#777",fontSize:12,lineHeight:1.6}}>Positive results contribute to the Angelic Index. Maximum single-game gain is 38.</div></>):(<>
      <div style={{color:ac,fontSize:10,letterSpacing:5,marginBottom:6}}>◈ DEMON CALL ◈</div>
      <div style={{color:ac,fontSize:24,fontWeight:"bold",marginBottom:2,textShadow:"0 0 15px "+ac+"50"}}>{d.name}</div>
      <div style={{color:"#666",fontSize:12,marginBottom:14}}>Mesh-{d.mesh} · {d.type} · [{d.netSpan}]</div>
      <Sec label="ZONE PASSAGE">{d.zone}</Sec>
      {d.syzygy&&<Sec label="SYZYGY">{d.syzygy}</Sec>}
      <Sec label="DOMAIN">{d.domain}</Sec>
      {d.planet&&<Sec label="PLANETARY AFFINITY">{d.planet}{d.spine?" · "+d.spine:""}</Sec>}
      <Sec label="DESCRIPTION">{d.description}</Sec>
      <Sec label="OMEN"><em>{d.omen}</em></Sec>
      <Sec label="POWER">{d.power}</Sec>
      {INTERPRETATIONS[result.score]&&<Sec label="◈ FULL INTERPRETATION ◈"><div style={{color:"#999",fontSize:12,lineHeight:1.8,fontStyle:"italic"}}>{INTERPRETATIONS[Math.min(result.score,44)]}</div></Sec>}
      <div style={{color:"#444",fontSize:10,marginTop:14,textAlign:"center"}}>Score: -{result.score} · Aeon Terminated</div>
    </>)}
    <div style={{display:"flex",gap:8,marginTop:16}}>
      <button onClick={onClose} style={{flex:1,padding:"12px",background:"transparent",border:"1px solid "+ac+"40",color:ac,fontFamily:"monospace",fontSize:12,letterSpacing:3,cursor:"pointer",borderRadius:2}}>DISMISS</button>
      {!ang&&onShare&&<button onClick={()=>{haptic();onShare();}} style={{flex:1,padding:"12px",background:"transparent",border:"1px solid "+ac+"40",color:ac,fontFamily:"monospace",fontSize:10,letterSpacing:2,cursor:"pointer",borderRadius:2}}>SHARE</button>}
    </div>
  </div></div>);
};

// ═══ TUTORIAL OVERLAY ═══
const Tutorial=({onClose,mode})=>{const[step,setStep]=useState(0);const accent=mode==="subdecadence"?"#f0f":"#0f3";const steps=[{title:"THE ATLANTEAN CROSS",body:"Five cards are dealt face-up in a cross formation — these are your Set-1 pylons: Far Future, Destructive, Creative, Memories, and Deep Past."},{title:"THE CONCEALED SET",body:"Five more cards are dealt face-down as Set-2. Tap them left-to-right to reveal one at a time."},{title:"PAIR TO SUM "+(mode==="subdecadence"?"9":"10"),body:"When a Set-2 card is revealed, tap a Set-1 card to pair them. The pair must sum to "+(mode==="subdecadence"?"9 (Numogram Syzygies)":"10")+". Score = the difference between the two values."},{title:"THE ORACLE SPEAKS",body:"After all 5 Set-2 cards are revealed, end the round. Positive score = Angelic Index. Negative score = Demon Call from the Pandemonium Matrix. The Aeon ends."},{title:"AEON PERSISTENCE",body:"Your longest Aeon streak and highest scores are tracked. Demons called are logged in your history. Begin."}];
  return(<div style={{position:"fixed",inset:0,zIndex:1100,background:"rgba(0,0,0,0.95)",display:"flex",alignItems:"center",justifyContent:"center",padding:16,backdropFilter:"blur(8px)"}}><div style={{maxWidth:360,width:"100%",background:"#0a0a0a",border:"1px solid "+accent+"30",borderRadius:4,padding:"28px 22px",fontFamily:"'Courier New',monospace"}}><div style={{color:accent,fontSize:9,letterSpacing:5,marginBottom:4}}>TUTORIAL · {step+1}/{steps.length}</div><div style={{color:accent,fontSize:16,fontWeight:"bold",marginBottom:12,letterSpacing:2}}>{steps[step].title}</div><div style={{color:"#999",fontSize:13,lineHeight:1.8,marginBottom:20}}>{steps[step].body}</div><div style={{display:"flex",gap:8}}>{step>0&&<button onClick={()=>{haptic();setStep(s=>s-1);}} style={{flex:1,padding:"10px",background:"transparent",border:"1px solid #333",color:"#666",fontFamily:"monospace",fontSize:11,letterSpacing:2,cursor:"pointer",borderRadius:2}}>BACK</button>}<button onClick={()=>{haptic();if(step<steps.length-1)setStep(s=>s+1);else{saveData("tutorialSeen",true);onClose();}}} style={{flex:1,padding:"10px",background:"transparent",border:"1px solid "+accent,color:accent,fontFamily:"monospace",fontSize:11,letterSpacing:2,cursor:"pointer",borderRadius:2}}>{step<steps.length-1?"NEXT":"BEGIN"}</button></div><div style={{display:"flex",justifyContent:"center",gap:6,marginTop:14}}>{steps.map((_,i)=><div key={i} style={{width:6,height:6,borderRadius:3,background:i===step?accent:"#333"}}/>)}</div></div></div>);
};

// ═══ STANDALONE NUMOGRAM ORACLE ═══
const NumogramOracle=({onBack,accent})=>{const[selectedZone,setSelectedZone]=useState(null);const[demon,setDemon]=useState(null);
  const zoneDemons={0:[44],1:[0,2],2:[1,5,8],3:[3,4,5],4:[6,7,8,9],5:[10,11,12,13,14],6:[16,17,18,19,21,22],7:[20,25,26,27,28,29,30],8:[15,23,31,32,33,34,35,36],9:[24,37,38,39,40,41,42,43,44]};
  const consult=(z)=>{haptic(25);setSelectedZone(z);const pool=zoneDemons[z]||[0];const mesh=pool[Math.floor(Math.random()*pool.length)];setDemon(DEMONS[mesh]);};
  const Z={3:[82,72],6:[128,48],2:[172,118],7:[188,178],5:[58,168],4:[38,218],1:[125,262],8:[125,328],9:[125,386],0:[125,436]};
  return(<div style={{textAlign:"center",paddingTop:12}}>
    <div style={{color:accent,fontSize:10,letterSpacing:4,marginBottom:12}}>◈ NUMOGRAM ORACLE ◈</div>
    <div style={{color:"#666",fontSize:12,marginBottom:16,lineHeight:1.6}}>Tap a zone to consult the Pandemonium Matrix directly.</div>
    <div style={{position:"relative",margin:"0 auto",marginBottom:16}}>
      <svg viewBox="0 0 230 470" width={200} height={200*(470/230)} style={{display:"block",margin:"0 auto",filter:"drop-shadow(0 0 8px "+accent+"30)"}}>
        <rect width="230" height="470" rx="10" fill="#050505"/>
        {Object.entries(Z).map(([z,[x,y]])=><g key={z} style={{cursor:"pointer"}} onClick={()=>consult(Number(z))}><circle cx={x} cy={y} r={22} fill={selectedZone===Number(z)?accent+"20":"#080808"} stroke={selectedZone===Number(z)?accent:accent+"60"} strokeWidth={selectedZone===Number(z)?2:1} opacity="0.9"/><text x={x} y={y+7} textAnchor="middle" fill={accent} fontSize="18" fontFamily="monospace" fontWeight="bold" opacity="0.9">{z}</text></g>)}
      </svg>
    </div>
    {demon&&(<div style={{textAlign:"left",padding:"16px 14px",background:"rgba(0,0,0,0.4)",border:"1px solid "+accent+"25",borderRadius:2,marginBottom:12}}>
      <div style={{color:accent,fontSize:18,fontWeight:"bold",marginBottom:4}}>{demon.name}</div>
      <div style={{color:"#666",fontSize:11,marginBottom:10}}>Mesh-{demon.mesh} · {demon.type} · [{demon.netSpan}]</div>
      <div style={{color:"#999",fontSize:12,lineHeight:1.7,marginBottom:8}}>{demon.description}</div>
      <div style={{color:accent+"aa",fontSize:11,fontStyle:"italic",marginBottom:4}}>Omen: {demon.omen}</div>
      <div style={{color:"#888",fontSize:11}}>Power: {demon.power}</div>
      {INTERPRETATIONS[Number(demon.mesh)]&&<div style={{borderTop:"1px solid "+accent+"15",marginTop:10,paddingTop:10,color:"#777",fontSize:11,lineHeight:1.7,fontStyle:"italic"}}>{INTERPRETATIONS[Number(demon.mesh)]}</div>}
    </div>)}
    <button onClick={()=>{haptic();onBack();}} style={{padding:"8px 24px",background:"transparent",border:"1px solid #333",color:"#666",fontFamily:"monospace",fontSize:11,letterSpacing:3,cursor:"pointer",borderRadius:2}}>BACK TO MENU</button>
  </div>);
};

const PYLON_LABELS=["FAR FUTURE","DESTRUCTIVE","CREATIVE","MEMORIES","DEEP PAST"];

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
  const[showOracle,setShowOracle]=useState(false);
  const[showHistory,setShowHistory]=useState(false);
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

  useEffect(()=>{const iv=setInterval(()=>{setGlitchText(true);setTimeout(()=>setGlitchText(false),100);},5000+Math.random()*8000);return()=>clearInterval(iv);},[]);

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
  const CW=58,CH=87;

  // ═══ SUBDECADENCE VISUAL OVERHAUL ═══
  const bgOverlay=isSub?"repeating-linear-gradient(0deg,transparent,transparent 1px,rgba(255,0,255,0.04) 1px,rgba(255,0,255,0.04) 3px)":"repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.06) 2px,rgba(0,0,0,0.06) 4px)";
  const vignetteColor=isSub?"rgba(40,0,40,0.6)":"rgba(0,0,0,0.5)";

  return(
    <div style={{minHeight:"100dvh",width:"100%",background:isSub?"#050005":"#000",color:"#ccc",fontFamily:"'Courier New',monospace",position:"relative",overflow:"hidden",WebkitTapHighlightColor:"transparent",transition:"background 0.5s"}}>
      <canvas ref={canvasRef} style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none",opacity:isSub?0.6:0.5}}/>
      <div style={{position:"fixed",inset:0,zIndex:1,pointerEvents:"none",background:bgOverlay,transition:"background 0.5s"}}/>
      <div style={{position:"fixed",inset:0,zIndex:1,pointerEvents:"none",background:"radial-gradient(ellipse at center,transparent 50%,"+vignetteColor+" 100%)"}}/>
      {isSub&&<div style={{position:"fixed",inset:0,zIndex:1,pointerEvents:"none",background:"radial-gradient(circle at 50% 30%,rgba(80,0,80,0.08) 0%,transparent 60%)"}}/>}

      <div style={{position:"relative",zIndex:2,maxWidth:400,margin:"0 auto",padding:"10px 8px 20px",minHeight:"100dvh"}}>

        <header style={{textAlign:"center",marginBottom:10,paddingTop:8}}>
          <div style={{fontSize:8,letterSpacing:6,color:accent,opacity:0.5,marginBottom:2}}>◈ PANDEMONIUM MATRIX ◈</div>
          <h1 style={{fontSize:20,fontWeight:"bold",margin:0,letterSpacing:4,color:accent,textShadow:"0 0 20px "+accent+"60,0 0 40px "+accent+"20",transform:glitchText?"translate("+(Math.random()*3-1.5)+"px,"+(Math.random()*2-1)+"px)":"none",transition:"color 0.5s"}}>{isSub?"SUBDECADENCE":"DECADENCE"}</h1>
          <div style={{fontSize:9,color:"#555",letterSpacing:2,marginTop:2}}>{isSub?"THE ULTIMATE BLASPHEMY · PAIRS → 9":"ATLANTEAN TIME-SORCERY · PAIRS → 10"}</div>
        </header>

        {/* MODE TOGGLE + CONTROLS */}
        <div style={{display:"flex",justifyContent:"center",gap:6,marginBottom:12,flexWrap:"wrap"}}>
          <button onClick={()=>{haptic();setMode(m=>m==="decadence"?"subdecadence":"decadence");}} style={{padding:"5px 12px",background:"transparent",border:"1px solid "+accent+"40",color:accent,fontFamily:"monospace",fontSize:9,letterSpacing:2,cursor:"pointer",borderRadius:2}}>⇄ {isSub?"DECADENCE":"SUBDECADENCE"}</button>
          {gamePhase==="menu"&&!showOracle&&<button onClick={()=>{haptic();setShowTutorial(true);}} style={{padding:"5px 12px",background:"transparent",border:"1px solid #333",color:"#555",fontFamily:"monospace",fontSize:9,letterSpacing:2,cursor:"pointer",borderRadius:2}}>? TUTORIAL</button>}
        </div>

        {/* SCORE BAR */}
        {gamePhase!=="menu"&&(<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 10px",marginBottom:12,background:"rgba(0,0,0,0.5)",border:"1px solid "+(isSub?"#1a001a":"#1a1a1a"),borderRadius:2,fontSize:10,letterSpacing:1}}>
          <span style={{color:"#555"}}>AEON <span style={{color:accent}}>{aeonScore}</span></span>
          <span style={{color:"#555"}}>RND <span style={{color:"#0ff"}}>{roundNum}</span></span>
          <span style={{color:"#555"}}>SCR <span style={{color:score>=0?accent:"#f04"}}>{score}</span></span>
          <span style={{color:"#555"}}>DK <span style={{color:"#888"}}>{deck.length}</span></span>
        </div>)}

        {/* ═══ MENU ═══ */}
        {gamePhase==="menu"&&!showOracle&&(
          <div style={{textAlign:"center",paddingTop:12}}>
            <div style={{marginBottom:20}}><NumogramSVG size={130}/></div>
            <button onClick={startAeon} style={{padding:"12px 36px",background:"transparent",border:"1px solid "+accent,color:accent,fontFamily:"monospace",fontSize:14,letterSpacing:5,cursor:"pointer",borderRadius:2,boxShadow:"0 0 25px "+accent+"20",marginBottom:10,display:"block",margin:"0 auto 10px"}}>BEGIN AEON</button>
            <button onClick={()=>{haptic();setShowOracle(true);}} style={{padding:"8px 20px",background:"transparent",border:"1px solid "+accent+"40",color:accent+"bb",fontFamily:"monospace",fontSize:10,letterSpacing:3,cursor:"pointer",borderRadius:2,marginBottom:16}}>CONSULT ORACLE</button>

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
              <div style={{color:"#777",fontSize:12,lineHeight:1.8}}>{isSub?"40 cards (1-9 x 4 suits + 4 Queens valued 0). Five dealt face-up on the Atlantean Cross, five face-down. Reveal Set-2 cards and pair with Set-1 to sum to 9 (Numogram Syzygies). Pairs score by difference. Unpaired cards penalize. Negative results call demons.":"36 cards (1-9 x 4 suits). Five face-up on the Atlantean Cross (Set-1), five face-down (Set-2). Reveal and pair to sum to 10. Pairs score by difference (5+5=0, 9+1=8). Unpaired cards penalize. An Aeon ends on first negative result."}</div>
            </div>
          </div>
        )}

        {/* ═══ STANDALONE ORACLE ═══ */}
        {gamePhase==="menu"&&showOracle&&<NumogramOracle onBack={()=>setShowOracle(false)} accent={accent}/>}

        {/* ═══ GAME BOARD ═══ */}
        {(gamePhase==="playing"||gamePhase==="pairing")&&(<>
          <div style={{textAlign:"center",padding:"6px 8px",marginBottom:10,color:message.includes("VALID")||message.includes("!=")?"#ff4444":accent,fontSize:11,letterSpacing:1,minHeight:18,fontWeight:message.includes("VALID")?"bold":"normal"}}>{message}</div>

          <div style={{marginBottom:14}}>
            <div style={{color:"#444",fontSize:9,letterSpacing:3,textAlign:"center",marginBottom:6}}>◈ SET-1 · ATLANTEAN CROSS ◈</div>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
              <div style={{textAlign:"center"}}><div style={{fontSize:7,color:"#555",letterSpacing:2,marginBottom:2}}>{PYLON_LABELS[0]}</div><Card card={set1[0]} faceUp selected={false} matched={matchedSet1.has(0)} onClick={()=>attemptPair(0)} w={CW} h={CH}/></div>
              <div style={{display:"flex",gap:6,alignItems:"flex-start"}}>
                {[1,2,3].map(i=><div key={i} style={{textAlign:"center"}}><div style={{fontSize:7,color:"#555",letterSpacing:1,marginBottom:2}}>{PYLON_LABELS[i]}</div><Card card={set1[i]} faceUp selected={false} matched={matchedSet1.has(i)} onClick={()=>attemptPair(i)} w={CW} h={CH}/></div>)}
              </div>
              <div style={{textAlign:"center"}}><div style={{fontSize:7,color:"#555",letterSpacing:2,marginBottom:2}}>{PYLON_LABELS[4]}</div><Card card={set1[4]} faceUp selected={false} matched={matchedSet1.has(4)} onClick={()=>attemptPair(4)} w={CW} h={CH}/></div>
            </div>
          </div>

          <div style={{height:1,background:"linear-gradient(90deg,transparent,"+accent+"25,transparent)",marginBottom:12}}/>

          <div>
            <div style={{color:"#444",fontSize:9,letterSpacing:3,textAlign:"center",marginBottom:6}}>◈ SET-2 · CONCEALED ◈</div>
            <div style={{display:"flex",justifyContent:"center",gap:5}}>
              {set2.map((card,i)=><Card key={card.id} card={card} faceUp={i<=revealedIndex} selected={selectedSet2===i} matched={matchedSet2.has(i)} onClick={gamePhase==="playing"&&i===revealedIndex+1&&!matchedSet2.has(i)?()=>revealNext(i):null} w={CW} h={CH}/>)}
            </div>
          </div>

          <div style={{display:"flex",justifyContent:"center",gap:8,marginTop:16}}>
            {gamePhase==="pairing"&&<button onClick={skipPair} style={{padding:"8px 18px",background:"transparent",border:"1px solid #ff444440",color:"#ff4444",fontFamily:"monospace",fontSize:11,letterSpacing:2,cursor:"pointer",borderRadius:2}}>SKIP</button>}
            {allRevealed&&gamePhase!=="pairing"&&<button onClick={endRound} style={{padding:"8px 22px",background:"transparent",border:"1px solid "+accent,color:accent,fontFamily:"monospace",fontSize:11,letterSpacing:3,cursor:"pointer",borderRadius:2,boxShadow:"0 0 15px "+accent+"18"}}>END ROUND</button>}
          </div>

          {roundResults.length>0&&(<div style={{marginTop:12,padding:"8px 10px",background:"rgba(0,0,0,0.35)",border:"1px solid #1a1a1a",borderRadius:2,fontSize:11}}>
            <div style={{color:"#444",letterSpacing:2,marginBottom:4,fontSize:9}}>PAIRS</div>
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

        <footer style={{textAlign:"center",padding:"32px 0 16px",borderTop:"1px solid #111",marginTop:32}}>
          <div style={{fontSize:8,color:"#2a2a2a",letterSpacing:3,lineHeight:2}}>DERIVED FROM CCRU PANDEMONIUM MATRIX<br/>DECADENCE RULES · ATLANTEAN TRANSMISSION<br/>TECHNOPUNK NUMOGRAMMATIC ENGINE v3.0</div>
        </footer>
      </div>

      {oracleResult&&<DemonOracle result={oracleResult} onClose={()=>setOracleResult(null)} onShare={shareDemonCall}/>}
      {showTutorial&&<Tutorial onClose={()=>setShowTutorial(false)} mode={mode}/>}
    </div>
  );
}
