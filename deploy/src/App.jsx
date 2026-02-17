import { useState, useEffect, useRef, useCallback } from "react";

const DEMONS = {
  0: { name: "Lurgo", mesh: "00", netSpan: "1::0", type: "Amphidemon", syzygy: null, zone: "1→0", domain: "The First Door", planet: "Sun", spine: "Coccyx", description: "The Initiator. Gateway between existence and void. Lurgo opens all passages and closes all returns. Associated with Legba, first and last invoked.", omen: "Beginnings that contain their own endings", power: "Initiation of sorcerous contact" },
  1: { name: "Duoddod", mesh: "01", netSpan: "2::0", type: "Amphidemon", syzygy: null, zone: "2→0", domain: "The Second Door", planet: "Mercury", spine: "Lower Sacrum", description: "The Main Lo-Way into the Crypt. Duoddod reduplicates double-twinness through its multitude.", omen: "Paths that fork beneath the surface", power: "Access to hidden passages" },
  2: { name: "Sarkon", mesh: "02", netSpan: "2::1", type: "Cyclic Chronodemon", syzygy: null, zone: "2→1", domain: "Mesh Engineering", planet: null, spine: null, description: "Architect of the mesh-horizon. Sarkon tags encode sequential indices for Axsys code.", omen: "Systematic collapse of temporal intervals", power: "Micropause manipulation" },
  3: { name: "Krako", mesh: "03", netSpan: "3::0", type: "Amphidemon", syzygy: null, zone: "3→0", domain: "The Fourth Door", planet: "Earth", spine: "Mid-Sacrum", description: "Storm-herald of the Warp. Krako clicks the gate between drift and depths.", omen: "Electrical disturbance presaging change", power: "Warp-current navigation" },
  4: { name: "Tchu", mesh: "04", netSpan: "3::1", type: "Chaotic Xenodemon", syzygy: null, zone: "3→1", domain: "The Sixth Door", planet: "Jupiter", spine: "Lower Lumbar", description: "Cipher of the alien gate. Tchu haunts the threshold between Warp and Torque.", omen: "Anomalous intrusions from outside time", power: "Xenodimensional breach" },
  5: { name: "Djungo", mesh: "05", netSpan: "3::2", type: "Cyclic Chronodemon", syzygy: null, zone: "3→2", domain: "Vortical Escalation", planet: null, spine: null, description: "Rising from Lesser Depths to Twin Heavens. Djungo traces the spiral ascent.", omen: "Accelerating cycles of return", power: "Temporal escalation" },
  6: { name: "Nuttubab", mesh: "06", netSpan: "4::0", type: "Amphidemon", syzygy: null, zone: "4→0", domain: "Phase Limit", planet: null, spine: null, description: "Prowler of the Sink Current. Nuttubab marks the boundary of the fourth phase.", omen: "Terminal descent into foundation", power: "Phase dissolution" },
  7: { name: "Sukugool", mesh: "07", netSpan: "4::1", type: "Amphidemon", syzygy: null, zone: "4→1", domain: "Torque Passage", planet: null, spine: null, description: "Thread between falling drift and surge. Sukugool mediates the torque's inner tensions.", omen: "Gravitational anomalies in sequence", power: "Current redirection" },
  8: { name: "Skarkix", mesh: "08", netSpan: "4::2", type: "Cyclic Chronodemon", syzygy: null, zone: "4→2", domain: "Temporal Friction", planet: null, spine: null, description: "Chronodemon of grinding temporal resistance. Where timelines catch and spark.", omen: "Déjà vu intensifying to crisis", power: "Time-friction weaponization" },
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
  19: { name: "Djynxx", mesh: "19", netSpan: "6::3", type: "Syzygetic Xenodemon", syzygy: "6::3", zone: "6↔3", domain: "The Warp", planet: "Venus", spine: "Throat", description: "The changeling. Defined by jinking, erratic zig-zagging movement. Nomad war machine, fluid metal body. Outside time.", omen: "Reality glitching, déjà vu cascades", power: "Temporal jinx, vortical coincidence" },
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

const ANGELIC_INDEX = ["Equilibrium — the scales hold steady","First Light — a single ray pierces the void","Duality's Gift — the twin currents align","The Trident — three forces converge","Foundation Stone — the base is secured","Pentagrammic Seal — five points of power","Hexadic Harmony — the sixfold pattern emerges","Seventh Gate — passage through the threshold","Octave Resonance — the cycle completes","Novenary Apex — approaching the limit","Decadic Completion — the full circle turns"];

const NumogramSVG = ({ size = 120 }) => {
  const Z = {6:[120,38],3:[72,65],2:[162,130],7:[174,190],5:[46,175],4:[32,225],1:[115,255],8:[115,318],9:[115,372],0:[115,420]};
  const gates = [["15",138,18],["21",90,90],["5",50,112],["10",78,258],["1",120,230],["28",152,242],["36",144,334],["45",88,376]];
  const flows = [[Z[6],Z[3]],[Z[6],Z[2]],[Z[2],Z[7]],[Z[2],Z[5]],[Z[5],Z[4]],[Z[4],Z[1]],[Z[7],Z[1]],[Z[3],Z[1]],[Z[1],Z[8]],[Z[8],Z[9]],[Z[9],Z[0]]];
  const syz = [[Z[9],Z[0]],[Z[8],Z[1]],[Z[7],Z[2]],[Z[6],Z[3]],[Z[5],Z[4]]];
  const tri = {0:"up",1:"down",2:"left",3:"right",4:"right",5:"right",6:"left",7:"left",8:"up",9:"down"};
  const mkTri = (cx,cy,dir) => {const s=5; if(dir==="up")return cx+","+(cy-s)+" "+(cx-s)+","+(cy+s*0.7)+" "+(cx+s)+","+(cy+s*0.7); if(dir==="down")return cx+","+(cy+s)+" "+(cx-s)+","+(cy-s*0.7)+" "+(cx+s)+","+(cy-s*0.7); if(dir==="left")return (cx-s)+","+cy+" "+(cx+s*0.7)+","+(cy-s)+" "+(cx+s*0.7)+","+(cy+s); return (cx+s)+","+cy+" "+(cx-s*0.7)+","+(cy-s)+" "+(cx-s*0.7)+","+(cy+s);};

  return (
    <svg viewBox="0 0 230 455" width={size} height={size*(455/230)} style={{display:"block"}}>
      <defs>
        <radialGradient id="nbg" cx="50%" cy="35%" r="65%"><stop offset="0%" stopColor="#060d06"/><stop offset="100%" stopColor="#000"/></radialGradient>
        <filter id="zg"><feGaussianBlur stdDeviation="1.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <rect width="230" height="455" rx="12" fill="url(#nbg)" stroke="#0f3" strokeWidth="0.7" opacity="0.85"/>
      <path d={"M "+(Z[3][0]-10)+","+(Z[3][1]-15)+" C "+(Z[3][0]-30)+","+(Z[3][1]-50)+" "+(Z[6][0]+30)+","+(Z[6][1]-50)+" "+(Z[6][0]+10)+","+(Z[6][1]-15)} fill="none" stroke="#0f3" strokeWidth="0.7" opacity="0.2"/>
      <path d={"M "+Z[2][0]+","+Z[2][1]+" Q "+(Z[2][0]-30)+","+(Z[2][1]+30)+" "+(Z[5][0]+30)+","+(Z[5][1])+" L "+Z[5][0]+","+Z[5][1]} fill="none" stroke="#0f3" strokeWidth="0.9" opacity="0.18"/>
      <path d={"M "+Z[7][0]+","+Z[7][1]+" Q "+(Z[7][0]-15)+","+(Z[7][1]+35)+" "+(Z[1][0]+25)+","+Z[1][1]+" L "+(Z[1][0]+18)+","+Z[1][1]} fill="none" stroke="#0f3" strokeWidth="0.9" opacity="0.18"/>
      <ellipse cx={Z[9][0]} cy={(Z[9][1]+Z[0][1])/2} rx="16" ry="28" fill="none" stroke="#0f3" strokeWidth="0.4" opacity="0.1"/>
      {flows.map(([a,b],i) => <line key={"f"+i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#0f3" strokeWidth="0.6" opacity="0.2"/>)}
      {syz.map(([a,b],i) => <line key={"s"+i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#0f3" strokeWidth="0.5" opacity="0.12" strokeDasharray="3,3"/>)}
      {Object.entries(Z).map(([z,[x,y]]) => <g key={z} filter="url(#zg)"><circle cx={x} cy={y} r="18" fill="#040804" stroke="#0f3" strokeWidth="1.1" opacity="0.8"/><polygon points={mkTri(x,y-2,tri[z])} fill="#0f3" opacity="0.25"/><text x={x} y={y+7} textAnchor="middle" fill="#0f3" fontSize="16" fontFamily="monospace" fontWeight="bold" opacity="0.9">{z}</text></g>)}
      {gates.map(([v,x,y]) => <g key={"g"+v}><circle cx={x} cy={y} r="9" fill="#020502" stroke="#0f3" strokeWidth="0.5" opacity="0.45"/><text x={x} y={y+3.5} textAnchor="middle" fill="#0f3" fontSize="8" fontFamily="monospace" fontStyle="italic" opacity="0.55">{v}</text></g>)}
      <text x="115" y="449" textAnchor="middle" fill="#0f3" fontSize="6.5" fontFamily="monospace" opacity="0.3" letterSpacing="4">NUMOGRAM</text>
    </svg>
  );
};

const SUIT_SYMBOLS = {hearts:"♥",diamonds:"♦",clubs:"♣",spades:"♠"};
const SUIT_COLORS = {hearts:"#ff1744",diamonds:"#ff1744",clubs:"#e0e0e0",spades:"#e0e0e0"};

const Card = ({card,faceUp,onClick,selected,matched,w=58,h=87}) => {
  const dv = card.value===0?"Q":card.value;
  const sc = SUIT_COLORS[card.suit];
  return (
    <div onClick={onClick} style={{width:w,height:h,perspective:600,cursor:onClick?"pointer":"default",flexShrink:0}}>
      <div style={{width:"100%",height:"100%",position:"relative",transformStyle:"preserve-3d",transition:"transform 0.6s cubic-bezier(0.4,0,0.2,1)",transform:faceUp?"rotateY(180deg)":"rotateY(0)"}}>
        <div style={{position:"absolute",width:"100%",height:"100%",backfaceVisibility:"hidden",borderRadius:6,background:"linear-gradient(145deg,#080e08,#000)",border:"1px solid "+(selected?"#0f3":"#1a3a1a"),display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",boxShadow:selected?"0 0 14px rgba(0,255,51,0.4)":"0 2px 6px rgba(0,0,0,0.6)"}}>
          <NumogramSVG size={w*0.72}/>
          <div style={{position:"absolute",inset:0,borderRadius:6,pointerEvents:"none",background:"repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,255,51,0.03) 2px,rgba(0,255,51,0.03) 4px)"}}/>
        </div>
        <div style={{position:"absolute",width:"100%",height:"100%",backfaceVisibility:"hidden",borderRadius:6,transform:"rotateY(180deg)",background:matched?"linear-gradient(145deg,#0a1a0a,#001a00)":"linear-gradient(145deg,#1a1a2e,#0f0f1a)",border:"1px solid "+(matched?"#0f3":selected?"#0ff":"#333"),display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",boxShadow:matched?"0 0 14px rgba(0,255,51,0.3)":selected?"0 0 10px rgba(0,255,255,0.3)":"0 2px 6px rgba(0,0,0,0.6)",opacity:matched?0.4:1,transition:"opacity 0.3s"}}>
          <div style={{position:"absolute",top:3,left:5,color:sc,fontSize:10,fontFamily:"monospace",lineHeight:1}}><div>{dv}</div><div style={{fontSize:9}}>{SUIT_SYMBOLS[card.suit]}</div></div>
          <div style={{color:sc,fontSize:Math.max(18,w*0.3),fontWeight:"bold",fontFamily:"'Courier New',monospace",textShadow:"0 0 8px "+sc+"40"}}>{SUIT_SYMBOLS[card.suit]}</div>
          <div style={{color:sc,fontSize:Math.max(14,w*0.23),fontWeight:"bold",fontFamily:"monospace"}}>{dv}</div>
          <div style={{position:"absolute",bottom:3,right:5,color:sc,fontSize:10,fontFamily:"monospace",lineHeight:1,transform:"rotate(180deg)"}}><div>{dv}</div><div style={{fontSize:9}}>{SUIT_SYMBOLS[card.suit]}</div></div>
          <div style={{position:"absolute",inset:0,borderRadius:6,pointerEvents:"none",background:"repeating-linear-gradient(0deg,transparent,transparent 1px,rgba(0,0,0,0.07) 1px,rgba(0,0,0,0.07) 2px)"}}/>
        </div>
      </div>
    </div>
  );
};

const DemonOracle = ({result,onClose}) => {
  const [vis,setVis] = useState(false);
  const [gl,setGl] = useState(false);
  useEffect(() => {setTimeout(()=>setVis(true),100);const iv=setInterval(()=>{setGl(true);setTimeout(()=>setGl(false),150);},3000+Math.random()*4000);return()=>clearInterval(iv);},[]);
  if(!result)return null;
  const ang=result.type==="angelic";const d=result.demon;const ac=ang?"#ffd700":"#ff0044";
  const Sec=({label,children})=>(<div style={{borderTop:"1px solid "+ac+"18",paddingTop:10,marginBottom:10}}><div style={{color:ac,fontSize:9,letterSpacing:3,marginBottom:4}}>{label}</div><div style={{color:"#bbb",fontSize:13,lineHeight:1.7}}>{children}</div></div>);
  return (
    <div style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(0,0,0,0.94)",display:"flex",alignItems:"center",justifyContent:"center",opacity:vis?1:0,transition:"opacity 0.8s",backdropFilter:"blur(10px)",padding:12}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{maxWidth:400,width:"100%",maxHeight:"88vh",overflowY:"auto",background:"linear-gradient(180deg,#0a0a0a,#050510)",border:"1px solid "+ac+"30",borderRadius:4,padding:"22px 18px",fontFamily:"'Courier New',monospace",transform:gl?"translate("+(Math.random()*3-1.5)+"px,"+(Math.random()*3-1.5)+"px)":"none",boxShadow:"0 0 50px "+ac+"15",position:"relative",WebkitOverflowScrolling:"touch"}}>
        <div style={{position:"absolute",inset:0,pointerEvents:"none",background:"repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(255,255,255,0.015) 2px,rgba(255,255,255,0.015) 4px)"}}/>
        {ang?(<>
          <div style={{color:"#ffd700",fontSize:10,letterSpacing:5,marginBottom:6}}>◈ ANGELIC INDEX ◈</div>
          <div style={{color:"#ffd700",fontSize:32,fontWeight:"bold",marginBottom:4}}>+{result.score}</div>
          <div style={{color:"#ffd700aa",fontSize:14,marginBottom:14,lineHeight:1.6}}>{ANGELIC_INDEX[Math.min(result.score,ANGELIC_INDEX.length-1)]}</div>
          <div style={{color:"#777",fontSize:12,lineHeight:1.6}}>Positive results contribute to the Angelic Index. Maximum single-game gain is 38; exceeding possible by Aeon cumulation.</div>
        </>):(<>
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
          <div style={{color:"#444",fontSize:10,marginTop:14,textAlign:"center"}}>Score: −{result.score} · Aeon Terminated</div>
        </>)}
        <button onClick={onClose} style={{marginTop:16,width:"100%",padding:"12px",background:"transparent",border:"1px solid "+ac+"40",color:ac,fontFamily:"monospace",fontSize:12,letterSpacing:3,cursor:"pointer",borderRadius:2}}>DISMISS</button>
      </div>
    </div>
  );
};

const PYLON_LABELS = ["FAR FUTURE","DESTRUCTIVE","CREATIVE","MEMORIES","DEEP PAST"];

export default function DecadenceGame() {
  const [mode,setMode] = useState("decadence");
  const targetSum = mode==="decadence"?10:9;
  const [deck,setDeck] = useState([]);
  const [set1,setSet1] = useState([]);
  const [set2,setSet2] = useState([]);
  const [revealedIndex,setRevealedIndex] = useState(-1);
  const [selectedSet2,setSelectedSet2] = useState(null);
  const [matchedSet1,setMatchedSet1] = useState(new Set());
  const [matchedSet2,setMatchedSet2] = useState(new Set());
  const [score,setScore] = useState(0);
  const [aeonScore,setAeonScore] = useState(0);
  const [roundResults,setRoundResults] = useState([]);
  const [gamePhase,setGamePhase] = useState("menu");
  const [oracleResult,setOracleResult] = useState(null);
  const [message,setMessage] = useState("");
  const [roundNum,setRoundNum] = useState(0);
  const [glitchText,setGlitchText] = useState(false);
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const accent = mode==="subdecadence"?"#f0f":"#0f3";

  useEffect(()=>{
    const c=canvasRef.current;if(!c)return;const ctx=c.getContext("2d");let ps=[];
    const resize=()=>{c.width=window.innerWidth;c.height=window.innerHeight;};
    resize();window.addEventListener("resize",resize);
    for(let i=0;i<35;i++)ps.push({x:Math.random()*c.width,y:Math.random()*c.height,vx:(Math.random()-0.5)*0.2,vy:(Math.random()-0.5)*0.2,s:Math.random()*1.5+0.5,o:Math.random()*0.35+0.1,p:Math.random()*6.28});
    const anim=()=>{ctx.clearRect(0,0,c.width,c.height);for(let i=0;i<ps.length;i++)for(let j=i+1;j<ps.length;j++){const dx=ps[i].x-ps[j].x,dy=ps[i].y-ps[j].y,d=Math.sqrt(dx*dx+dy*dy);if(d<110){ctx.beginPath();ctx.moveTo(ps[i].x,ps[i].y);ctx.lineTo(ps[j].x,ps[j].y);ctx.strokeStyle="rgba(0,255,51,"+(0.035*(1-d/110))+")";ctx.lineWidth=0.5;ctx.stroke();}}ps.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.p+=0.02;if(p.x<0)p.x=c.width;if(p.x>c.width)p.x=0;if(p.y<0)p.y=c.height;if(p.y>c.height)p.y=0;const g=Math.sin(p.p)*0.3+0.7;ctx.beginPath();ctx.arc(p.x,p.y,p.s*g,0,6.28);ctx.fillStyle="rgba(0,255,51,"+(p.o*g)+")";ctx.fill();});animRef.current=requestAnimationFrame(anim);};
    anim();return()=>{window.removeEventListener("resize",resize);if(animRef.current)cancelAnimationFrame(animRef.current);};
  },[]);

  useEffect(()=>{const iv=setInterval(()=>{setGlitchText(true);setTimeout(()=>setGlitchText(false),100);},5000+Math.random()*8000);return()=>clearInterval(iv);},[]);

  const createDeck=useCallback(()=>{
    const suits=["hearts","diamonds","clubs","spades"],cards=[];
    for(const s of suits){if(mode==="subdecadence")cards.push({value:0,suit:s,id:"Q-"+s});for(let v=1;v<=9;v++)cards.push({value:v,suit:s,id:v+"-"+s});}
    for(let i=cards.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[cards[i],cards[j]]=[cards[j],cards[i]];}return cards;
  },[mode]);

  const startAeon=()=>{setAeonScore(0);setRoundNum(0);const d=createDeck();const s1=d.splice(0,5),s2=d.splice(0,5);setDeck(d);setSet1(s1);setSet2(s2);setRevealedIndex(-1);setSelectedSet2(null);setMatchedSet1(new Set());setMatchedSet2(new Set());setScore(0);setRoundResults([]);setGamePhase("playing");setMessage("TAP A SET-2 CARD TO REVEAL");setRoundNum(1);};

  const dealRound=useCallback(()=>{let d=deck.length>=10?[...deck]:createDeck();const s1=d.splice(0,5),s2=d.splice(0,5);setDeck(d);setSet1(s1);setSet2(s2);setRevealedIndex(-1);setSelectedSet2(null);setMatchedSet1(new Set());setMatchedSet2(new Set());setScore(0);setRoundResults([]);setGamePhase("playing");setMessage("TAP A SET-2 CARD TO REVEAL");setRoundNum(r=>r+1);},[deck,createDeck]);

  const revealNext=(i)=>{if(revealedIndex>=i||matchedSet2.has(i))return;setRevealedIndex(i);setSelectedSet2(i);setGamePhase("pairing");setMessage("SELECT A SET-1 CARD TO PAIR, OR SKIP");};

  const attemptPair=(si)=>{if(gamePhase!=="pairing"||matchedSet1.has(si)||selectedSet2===null)return;const c1=set1[si],c2=set2[selectedSet2];if(c1.value+c2.value===targetSum){const diff=Math.abs(c1.value-c2.value);setMatchedSet1(p=>new Set([...p,si]));setMatchedSet2(p=>new Set([...p,selectedSet2]));setScore(s=>s+diff);setRoundResults(p=>[...p,{score:diff,cards:[c1,c2]}]);setSelectedSet2(null);setMessage("PAIRED: "+c1.value+"+"+c2.value+"="+targetSum+" → +"+diff);setGamePhase("playing");}else{setMessage(c1.value+"+"+c2.value+"="+(c1.value+c2.value)+" ≠ "+targetSum+" — INVALID");}};

  const skipPair=()=>{if(selectedSet2!==null){const rc=set2[selectedSet2];if(set1.some((c,i)=>!matchedSet1.has(i)&&c.value+rc.value===targetSum)){setMessage("⚠ VALID PAIR EXISTS — LOOK AGAIN");return;}}setSelectedSet2(null);setGamePhase("playing");setMessage("NO MATCH — SKIPPED");};

  const endRound=()=>{let pen=0;set1.forEach((c,i)=>{if(!matchedSet1.has(i))pen+=c.value;});const tot=score-pen;if(tot>=0){setAeonScore(a=>a+tot);setOracleResult({type:"angelic",score:tot});setGamePhase("roundEnd");}else{setOracleResult({type:"demonic",score:Math.abs(tot),demon:DEMONS[Math.min(Math.abs(tot),44)]});setGamePhase("aeonEnd");}};

  const allRevealed=revealedIndex>=4;
  const CW=58,CH=87;

  return (
    <div style={{minHeight:"100dvh",width:"100%",background:"#000",color:"#ccc",fontFamily:"'Courier New',monospace",position:"relative",overflow:"hidden",WebkitTapHighlightColor:"transparent"}}>
      <canvas ref={canvasRef} style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none",opacity:0.5}}/>
      <div style={{position:"fixed",inset:0,zIndex:1,pointerEvents:"none",background:"repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.06) 2px,rgba(0,0,0,0.06) 4px)"}}/>
      <div style={{position:"fixed",inset:0,zIndex:1,pointerEvents:"none",background:"radial-gradient(ellipse at center,transparent 50%,rgba(0,0,0,0.5) 100%)"}}/>

      <div style={{position:"relative",zIndex:2,maxWidth:400,margin:"0 auto",padding:"10px 8px 20px",minHeight:"100dvh"}}>

        <header style={{textAlign:"center",marginBottom:10,paddingTop:8}}>
          <div style={{fontSize:8,letterSpacing:6,color:accent,opacity:0.5,marginBottom:2}}>◈ PANDEMONIUM MATRIX ◈</div>
          <h1 style={{fontSize:20,fontWeight:"bold",margin:0,letterSpacing:4,color:accent,textShadow:"0 0 20px "+accent+"60,0 0 40px "+accent+"20",transform:glitchText?"translate("+(Math.random()*3-1.5)+"px,"+(Math.random()*2-1)+"px)":"none",transition:"color 0.5s"}}>{mode==="subdecadence"?"SUBDECADENCE":"DECADENCE"}</h1>
          <div style={{fontSize:9,color:"#555",letterSpacing:2,marginTop:2}}>{mode==="subdecadence"?"THE ULTIMATE BLASPHEMY · PAIRS → 9":"ATLANTEAN TIME-SORCERY · PAIRS → 10"}</div>
        </header>

        <div style={{display:"flex",justifyContent:"center",marginBottom:12}}>
          <button onClick={()=>setMode(m=>m==="decadence"?"subdecadence":"decadence")} style={{padding:"5px 14px",background:"transparent",border:"1px solid "+accent+"40",color:accent,fontFamily:"monospace",fontSize:10,letterSpacing:2,cursor:"pointer",borderRadius:2}}>⇄ {mode==="decadence"?"SUBDECADENCE":"DECADENCE"}</button>
        </div>

        {gamePhase!=="menu"&&(<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 10px",marginBottom:12,background:"rgba(0,0,0,0.5)",border:"1px solid #1a1a1a",borderRadius:2,fontSize:10,letterSpacing:1}}>
          <span style={{color:"#555"}}>AEON <span style={{color:"#0f3"}}>{aeonScore}</span></span>
          <span style={{color:"#555"}}>RND <span style={{color:"#0ff"}}>{roundNum}</span></span>
          <span style={{color:"#555"}}>SCR <span style={{color:score>=0?"#0f3":"#f04"}}>{score}</span></span>
          <span style={{color:"#555"}}>DK <span style={{color:"#888"}}>{deck.length}</span></span>
        </div>)}

        {gamePhase==="menu"&&(
          <div style={{textAlign:"center",paddingTop:16}}>
            <div style={{marginBottom:28}}><NumogramSVG size={140}/></div>
            <button onClick={startAeon} style={{padding:"12px 36px",background:"transparent",border:"1px solid "+accent,color:accent,fontFamily:"monospace",fontSize:14,letterSpacing:5,cursor:"pointer",borderRadius:2,boxShadow:"0 0 25px "+accent+"20"}}>BEGIN AEON</button>
            <div style={{marginTop:28,padding:"14px 12px",textAlign:"left",border:"1px solid #1a1a1a",borderRadius:2,background:"rgba(0,0,0,0.3)"}}>
              <div style={{color:accent,fontSize:10,letterSpacing:3,marginBottom:8}}>RULES</div>
              <div style={{color:"#777",fontSize:12,lineHeight:1.8}}>{mode==="subdecadence"?"40 cards (1–9 × 4 suits + 4 Queens valued 0). Five dealt face-up on the Atlantean Cross, five face-down. Reveal Set-2 cards and pair with Set-1 to sum to 9 (Numogram Syzygies). Pairs score by difference. Unpaired cards penalize. Negative results call demons.":"36 cards (1–9 × 4 suits). Five face-up on the Atlantean Cross (Set-1), five face-down (Set-2). Reveal and pair to sum to 10. Pairs score by difference (5+5=0, 9+1=8). Unpaired cards penalize. An Aeon ends on first negative result."}</div>
            </div>
          </div>
        )}

        {(gamePhase==="playing"||gamePhase==="pairing")&&(<>
          <div style={{textAlign:"center",padding:"6px 8px",marginBottom:10,color:message.startsWith("⚠")?"#ff4444":accent,fontSize:11,letterSpacing:1,minHeight:18,fontWeight:message.startsWith("⚠")?"bold":"normal"}}>{message}</div>

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
              {set2.map((card,i)=><Card key={card.id} card={card} faceUp={i<=revealedIndex} selected={selectedSet2===i} matched={matchedSet2.has(i)} onClick={()=>{if(gamePhase==="playing"&&i===revealedIndex+1&&!matchedSet2.has(i))revealNext(i);}} w={CW} h={CH}/>)}
            </div>
          </div>

          <div style={{display:"flex",justifyContent:"center",gap:8,marginTop:16}}>
            {gamePhase==="pairing"&&<button onClick={skipPair} style={{padding:"8px 18px",background:"transparent",border:"1px solid #ff444440",color:"#ff4444",fontFamily:"monospace",fontSize:11,letterSpacing:2,cursor:"pointer",borderRadius:2}}>SKIP</button>}
            {allRevealed&&gamePhase!=="pairing"&&<button onClick={endRound} style={{padding:"8px 22px",background:"transparent",border:"1px solid "+accent,color:accent,fontFamily:"monospace",fontSize:11,letterSpacing:3,cursor:"pointer",borderRadius:2,boxShadow:"0 0 15px "+accent+"18"}}>END ROUND</button>}
          </div>

          {roundResults.length>0&&(<div style={{marginTop:12,padding:"8px 10px",background:"rgba(0,0,0,0.35)",border:"1px solid #1a1a1a",borderRadius:2,fontSize:11}}>
            <div style={{color:"#444",letterSpacing:2,marginBottom:4,fontSize:9}}>PAIRS</div>
            {roundResults.map((r,i)=><div key={i} style={{color:"#0f3",marginBottom:1}}>{r.cards[0].value}{SUIT_SYMBOLS[r.cards[0].suit]} + {r.cards[1].value}{SUIT_SYMBOLS[r.cards[1].suit]} = {targetSum} → +{r.score}</div>)}
          </div>)}
        </>)}

        {gamePhase==="roundEnd"&&(
          <div style={{textAlign:"center",paddingTop:36}}>
            <div style={{color:"#ffd700",fontSize:10,letterSpacing:4,marginBottom:6}}>ROUND COMPLETE</div>
            <div style={{color:"#ffd700",fontSize:36,fontWeight:"bold",marginBottom:6}}>+{score}</div>
            <div style={{color:"#888",fontSize:12,marginBottom:6}}>Aeon Total: {aeonScore}</div>
            <div style={{color:"#ffd70088",fontSize:13,fontStyle:"italic",marginBottom:24}}>{ANGELIC_INDEX[Math.min(score,ANGELIC_INDEX.length-1)]}</div>
            <button onClick={dealRound} style={{padding:"10px 28px",background:"transparent",border:"1px solid #ffd700",color:"#ffd700",fontFamily:"monospace",fontSize:12,letterSpacing:4,cursor:"pointer",borderRadius:2}}>NEXT ROUND</button>
          </div>
        )}

        {gamePhase==="aeonEnd"&&(
          <div style={{textAlign:"center",paddingTop:36}}>
            <div style={{color:"#f04",fontSize:10,letterSpacing:4,marginBottom:6}}>AEON TERMINATED</div>
            <div style={{color:"#f04",fontSize:30,fontWeight:"bold",marginBottom:6}}>DEMON CALL</div>
            <div style={{color:"#888",fontSize:12,marginBottom:24}}>Final Aeon Score: {aeonScore}</div>
            <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>
              <button onClick={()=>setOracleResult({type:"demonic",score:Math.abs(score),demon:DEMONS[Math.min(Math.abs(score),44)]||DEMONS[0]})} style={{padding:"10px 20px",background:"transparent",border:"1px solid #f04",color:"#f04",fontFamily:"monospace",fontSize:11,letterSpacing:3,cursor:"pointer",borderRadius:2}}>VIEW ORACLE</button>
              <button onClick={()=>setGamePhase("menu")} style={{padding:"10px 20px",background:"transparent",border:"1px solid #44444440",color:"#666",fontFamily:"monospace",fontSize:11,letterSpacing:3,cursor:"pointer",borderRadius:2}}>NEW AEON</button>
            </div>
          </div>
        )}

        <footer style={{textAlign:"center",padding:"32px 0 16px",borderTop:"1px solid #111",marginTop:32}}>
          <div style={{fontSize:8,color:"#2a2a2a",letterSpacing:3,lineHeight:2}}>DERIVED FROM CCRU PANDEMONIUM MATRIX<br/>DECADENCE RULES · ATLANTEAN TRANSMISSION<br/>TECHNOPUNK NUMOGRAMMATIC ENGINE v2.1</div>
        </footer>
      </div>

      {oracleResult&&<DemonOracle result={oracleResult} onClose={()=>setOracleResult(null)}/>}
    </div>
  );
}
