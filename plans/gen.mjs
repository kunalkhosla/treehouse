// Generates engineering SVG drawings for the treehouse from the design numbers.
// Run: node plans/gen.mjs
import { writeFileSync } from 'node:fs';

// ---- Design constants (inches) ----
const W = 96;            // platform width (cross-slope, X)
const D = 96;            // platform depth/run (uphill->downhill, Y)
const DROP = 26;         // grade drop across the run (15 deg over 96")
const TRUNK = 17.5;      // trunk diameter
const OPEN = 26;         // tree opening (square)
const DECK_UP = 28;      // deck height above grade, uphill edge
const DECK_DN = 54;      // deck height above grade, downhill edge
const FOOT = 42;         // footing depth below grade
const RAIL = 36;         // railing height above deck
const JOIST_OC = 16;     // joist spacing
const BEAM = 7.25;       // 2x8 actual depth
const JOIST = 7.25;
const DECKT = 1;         // decking thickness

const C = {
  paper:'#fbfaf7', ink:'#222', line:'#333', faint:'#bbb',
  dim:'#1d6fb8', dimtxt:'#1d6fb8',
  wood:'#c89b6a', woodDk:'#a9794a', beam:'#8a5a2b',
  post:'#6b4a2a', deck:'#d8b483', trunk:'#7d8a6a', trunkBark:'#9aa07e',
  ftg:'#9a9a9a', grade:'#7a6a55', accent:'#c0392b'
};

const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
function svg(w,h,body,title){
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" font-family="ui-sans-serif,Arial,Helvetica,sans-serif">
<rect width="${w}" height="${h}" fill="${C.paper}"/>
<text x="${w/2}" y="26" text-anchor="middle" font-size="17" font-weight="700" fill="${C.ink}">${esc(title)}</text>
${body}
</svg>`;
}
const T=(x,y,t,{s=12,a='middle',f=C.ink,w=400,rot=0}={})=>
  `<text x="${x}" y="${y}" text-anchor="${a}" font-size="${s}" font-weight="${w}" fill="${f}"${rot?` transform="rotate(${rot} ${x} ${y})"`:''}>${esc(t)}</text>`;
const L=(x1,y1,x2,y2,{c=C.line,w=1.5,d=''}={})=>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}"${d?` stroke-dasharray="${d}"`:''}/>`;
const R=(x,y,w,h,{f='none',s=C.line,sw=1.5,rx=0}={})=>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${f}" stroke="${s}" stroke-width="${sw}" rx="${rx}"/>`;
const Cir=(x,y,r,{f='none',s=C.line,sw=1.5}={})=>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="${f}" stroke="${s}" stroke-width="${sw}"/>`;

// linear dimension between two points (horizontal or vertical), label = text
function dimH(x1,x2,y,label,{above=true,off=0}={}){
  const tick=5, ty=y+(above?-7:15);
  return [
    L(x1,y-tick,x1,y+tick,{c:C.dim,w:1}),
    L(x2,y-tick,x2,y+tick,{c:C.dim,w:1}),
    L(x1,y,x2,y,{c:C.dim,w:1}),
    T((x1+x2)/2,ty,label,{s:11,f:C.dimtxt,w:600})
  ].join('');
}
function dimV(y1,y2,x,label,{left=true}={}){
  const tick=5;
  return [
    L(x-tick,y1,x+tick,y1,{c:C.dim,w:1}),
    L(x-tick,y2,x+tick,y2,{c:C.dim,w:1}),
    L(x,y1,x,y2,{c:C.dim,w:1}),
    T(x+(left?-8:8),(y1+y2)/2+4,label,{s:11,f:C.dimtxt,w:600,a:left?'end':'start'})
  ].join('');
}

// ============================================================ 1. PLAN
function plan(){
  const s=4, m=80, ox=m, oy=92;
  const w=W*s+2*m, h=D*s+oy+70;
  const X=v=>ox+v*s, Y=v=>oy+v*s;
  let b='';
  // platform fill
  b+=R(X(0),Y(0),W*s,D*s,{f:'#f0e6d6',s:C.woodDk,sw:2});
  // joists (run in Y), spaced along X
  for(let x=0;x<=W;x+=JOIST_OC){
    const dbl=(x===W/2-JOIST_OC||x===W/2+JOIST_OC); // trimmers flanking opening
    b+=L(X(x),Y(0),X(x),Y(D),{c:dbl?C.beam:C.woodDk,w:dbl?3:1.5});
  }
  // beams (run in X) at uphill & downhill edges — draw doubled
  for(const y of [0,D]){
    b+=L(X(0),Y(y)-2,X(W),Y(y)-2,{c:C.beam,w:3});
    b+=L(X(0),Y(y)+2,X(W),Y(y)+2,{c:C.beam,w:3});
  }
  // tree opening
  const o0=W/2-OPEN/2, o1=W/2+OPEN/2;
  b+=R(X(o0),Y(o0),OPEN*s,OPEN*s,{f:C.paper,s:C.accent,sw:2});
  // doubled headers (top/bottom of opening)
  b+=L(X(o0),Y(o0),X(o1),Y(o0),{c:C.beam,w:3});
  b+=L(X(o0),Y(o1),X(o1),Y(o1),{c:C.beam,w:3});
  // trunk
  b+=Cir(X(W/2),Y(D/2),(TRUNK/2)*s,{f:C.trunk,s:'#5f6b4f',sw:1.5});
  b+=T(X(W/2),Y(D/2)+4,'trunk Ø17.5"',{s:9,f:'#fff',w:700});
  // posts
  for(const py of [0,D]) for(const px of [0,W/2,W]){
    b+=R(X(px)-5,Y(py)-5,10,10,{f:C.post,s:'#3d2a17',sw:1.5});
  }
  // labels
  b+=T(X(W/2),Y(0)-50,'UPHILL  (grade ~26\" higher) — beam line',{s:11,w:600,f:C.woodDk});
  b+=T(X(W/2),Y(D)+30,'DOWNHILL  (deck ~4.5 ft up) — beam line + ladder',{s:11,w:600,f:C.woodDk});
  b+=T(X(0)+30,Y(D/2),'joists 2×8 @16\" o.c. →',{s:10,f:C.woodDk,a:'start',rot:-90});
  // dims
  b+=dimH(X(0),X(W),Y(0)-28,'8\'-0\" (96\")');
  b+=dimV(Y(0),Y(D),X(0)-46,'8\'-0\" (96\")');
  b+=dimH(X(0),X(W/2),Y(D)+50,'48\"');
  b+=dimH(X(W/2),X(W),Y(D)+50,'48\"');
  b+=dimH(X(o0),X(o1),Y(o1)+18,'26\" opening',{});
  // OC tick
  b+=dimH(X(0),X(JOIST_OC),Y(0)-10,'16\"');
  return svg(w,h,b,'1 · FRAMING PLAN (top view)');
}

// ============================================================ 2. ELEVATION ALONG SLOPE (side)
function elevSlope(){
  const s=3.4, m=92, w=D*s+2*m+40, h=420;
  const baseY=300;                 // uphill grade screen-y
  const Y=v=>m+v*s;                // along-slope position
  const Z=z=>baseY - z*s;          // height (z up)
  // grade: uphill grade z=0 at Y0, downhill grade z=-DROP at YD
  const gradeZ=v=> -DROP*(v/D);
  let b='';
  // sky/ground
  // grade line
  b+=`<path d="M ${Y(0)} ${Z(gradeZ(0))} L ${Y(D)} ${Z(gradeZ(D))} L ${Y(D)} ${Z(gradeZ(D))-2}" />`;
  b+=L(Y(-12),Z(0),Y(D+12),Z(gradeZ(D+12)),{c:C.grade,w:2.5});
  // hatch under grade
  for(let v=-8;v<=D+8;v+=10){ b+=L(Y(v),Z(gradeZ(v)),Y(v)-7,Z(gradeZ(v))-9,{c:C.faint,w:1}); }
  // deck level z=28
  const deckZ=DECK_UP;
  // posts: uphill at Y0, downhill at YD; post top = beam bottom = deckZ - DECKT - JOIST - BEAM
  const beamBot=deckZ-DECKT-JOIST-BEAM;
  for(const v of [0,D]){
    const g=gradeZ(v);
    b+=R(Y(v)-5,Z(beamBot),10,(beamBot-(g-FOOT))*s,{f:C.post,s:'#3d2a17',sw:1.5}); // post+below
    // footing
    b+=R(Y(v)-9,Z(g-FOOT),18,FOOT*s*0.0+ (FOOT*s),{f:C.ftg,s:'#777',sw:1.2});
  }
  // beams (at both ends) z beamBot..beamBot+BEAM
  for(const v of [0,D]) b+=R(Y(v)-7,Z(beamBot+BEAM),14,BEAM*s,{f:C.beam,s:'#5a3a1b',sw:1.2});
  // joists band beamBot+BEAM .. +JOIST across whole run
  b+=R(Y(0),Z(beamBot+BEAM+JOIST),D*s,JOIST*s,{f:C.wood,s:C.woodDk,sw:1});
  // deck
  b+=R(Y(0),Z(deckZ),D*s,DECKT*s+2,{f:C.deck,s:C.woodDk,sw:1});
  // trunk through center (capped below the title)
  b+=R(Y(D/2)-(TRUNK/2)*s,46,TRUNK*s,(Z(gradeZ(D/2))+8)-46,{f:C.trunkBark,s:'#6f7758',sw:1.2});
  // railing
  const rt=deckZ+RAIL;
  for(const v of [2,D-2]){ b+=L(Y(v),Z(deckZ),Y(v),Z(rt),{c:C.post,w:3}); }
  b+=L(Y(2),Z(rt),Y(D-2),Z(rt),{c:C.post,w:3});
  b+=L(Y(2),Z(deckZ+18),Y(D-2),Z(deckZ+18),{c:C.post,w:1.5});
  // ladder downhill
  b+=L(Y(D)+10,Z(deckZ),Y(D)+26,Z(gradeZ(D)),{c:C.woodDk,w:2.5});
  b+=L(Y(D)+22,Z(deckZ),Y(D)+38,Z(gradeZ(D)),{c:C.woodDk,w:2.5});
  for(let k=0;k<4;k++){const t=k/4;b+=L(Y(D)+10+16*t,Z(deckZ)+ (Z(gradeZ(D))-Z(deckZ))*t,Y(D)+22+16*t,Z(deckZ)+(Z(gradeZ(D))-Z(deckZ))*t,{c:C.woodDk,w:2});}
  // dims
  b+=dimV(Z(deckZ),Z(gradeZ(0)),Y(0)-30,'28\" up');
  b+=dimV(Z(deckZ),Z(gradeZ(D)),Y(D)+58,'54\" down',{left:false});
  b+=dimV(Z(gradeZ(0)),Z(gradeZ(D)),Y(D/2),'26\" drop',{left:false});
  b+=L(Y(0),Z(gradeZ(0)),Y(D/2),Z(gradeZ(0)),{c:C.dim,w:1,d:'4 3'});
  b+=dimV(Z(gradeZ(D)),Z(gradeZ(D)-FOOT),Y(D)+58,'42\" ftg',{left:false});
  b+=T(Y(14),Z(gradeZ(7))+24,'~15°',{s:12,f:C.accent,w:700});
  b+=dimH(Y(0),Y(D),baseY+96,'96\" run');
  b+=T(Y(0),36,'UPHILL',{s:11,a:'start',f:C.woodDk,w:600});
  b+=T(Y(D),36,'DOWNHILL',{s:11,a:'end',f:C.woodDk,w:600});
  b+=T(w/2,h-12,'Deck is dead LEVEL; the slope is absorbed by different post heights.',{s:11,f:'#555'});
  return svg(w,h,b,'2 · ELEVATION ALONG THE SLOPE (the key drawing)');
}

// ============================================================ 3. CROSS ELEVATION
function elevCross(){
  const s=3.4, m=80, w=W*s+2*m, h=400;
  const baseY=300;
  const X=v=>m+v*s, Z=z=>baseY-z*s;
  const deckZ=DECK_DN; // show the downhill (tall) face
  const beamBot=deckZ-DECKT-JOIST-BEAM;
  let b='';
  // grade flat (cross-slope ~level)
  b+=L(X(-10),Z(0),X(W+10),Z(0),{c:C.grade,w:2.5});
  for(let v=-8;v<=W+8;v+=10) b+=L(X(v),Z(0),X(v)-7,Z(0)-9,{c:C.faint,w:1});
  // 3 posts + footings
  for(const px of [0,W/2,W]){
    b+=R(X(px)-5,Z(beamBot),10,beamBot*s,{f:C.post,s:'#3d2a17',sw:1.5});
    b+=R(X(px)-9,Z(0-FOOT),18,FOOT*s,{f:C.ftg,s:'#777',sw:1.2});
    // knee braces
    b+=L(X(px),Z(beamBot),X(px)-18,Z(beamBot-18),{c:C.woodDk,w:2.5});
    b+=L(X(px),Z(beamBot),X(px)+18,Z(beamBot-18),{c:C.woodDk,w:2.5});
  }
  // doubled beam across
  b+=R(X(0)-7,Z(beamBot+BEAM),W*s+14,BEAM*s,{f:C.beam,s:'#5a3a1b',sw:1.2});
  b+=L(X(0)-7,Z(beamBot+BEAM/2),X(W)+7,Z(beamBot+BEAM/2),{c:'#5a3a1b',w:0.8,d:'3 3'});
  // joists end-on
  for(let x=0;x<=W;x+=JOIST_OC) b+=R(X(x)-2,Z(beamBot+BEAM+JOIST),4,JOIST*s,{f:C.wood,s:C.woodDk,sw:0.8});
  // deck
  b+=R(X(0),Z(deckZ),W*s,DECKT*s+2,{f:C.deck,s:C.woodDk,sw:1});
  // tree opening gap in deck center + trunk behind (capped below title)
  b+=R(X(W/2)-(TRUNK/2)*s,46,TRUNK*s,(Z(0)+8)-46,{f:C.trunkBark,s:'#6f7758',sw:1.2});
  // railing
  const rt=deckZ+RAIL;
  for(const px of [2,W-2]) b+=L(X(px),Z(deckZ),X(px),Z(rt),{c:C.post,w:3});
  b+=L(X(2),Z(rt),X(W-2),Z(rt),{c:C.post,w:3});
  // balusters
  for(let x=4;x<W;x+=5.5) b+=L(X(x),Z(deckZ),X(x),Z(rt),{c:C.faint,w:1.2});
  // dims
  b+=dimH(X(0),X(W/2),baseY+70,'48\"');
  b+=dimH(X(W/2),X(W),baseY+70,'48\"');
  b+=dimV(Z(deckZ),Z(0),X(W)+42,'54\"',{left:false});
  b+=dimV(Z(rt),Z(deckZ),X(0)-30,'36\" rail');
  b+=T(w/2,h-12,'Downhill beam line: 3 posts @48\", doubled 2×8 beam, knee braces.',{s:11,f:'#555'});
  return svg(w,h,b,'3 · CROSS ELEVATION (downhill face)');
}

// ============================================================ 4. FOOTINGS
function footings(){
  const s=4, m=90, ox=m, oy=84, w=W*s+2*m, h=D*s+oy+50;
  const X=v=>ox+v*s, Y=v=>oy+v*s;
  let b='';
  b+=R(X(0),Y(0),W*s,D*s,{f:'none',s:C.faint,sw:1.5,rx:0});
  b+=L(X(0),Y(0),X(W),Y(0),{c:C.faint,w:1,d:'5 4'});
  for(const py of [0,D]) for(const px of [0,W/2,W]){
    b+=Cir(X(px),Y(py),11,{f:'#e9e3d6',s:C.ftg,sw:2});
    b+=Cir(X(px),Y(py),3,{f:C.post,s:'#3d2a17',sw:1});
  }
  b+=T(X(W/2),Y(0)-20,'UPHILL line — 3 footings',{s:11,w:600,f:C.woodDk});
  b+=T(X(W/2),Y(D)+24,'DOWNHILL line — 3 footings',{s:11,w:600,f:C.woodDk});
  b+=dimH(X(0),X(W/2),Y(0)-44,'48\"');
  b+=dimH(X(W/2),X(W),Y(0)-44,'48\"');
  b+=dimV(Y(0),Y(D),X(0)-40,'96\"');
  b+=T(w/2,h-14,'6 piers · 10–12\" dia · poured ~42\" deep (below frost) · Simpson ABU66 standoff bases',{s:11,f:'#555'});
  return svg(w,h,b,'4 · FOOTING LAYOUT');
}

// ============================================================ 5. TREE OPENING DETAIL
function treeDetail(){
  const s=9, m=110, w=OPEN*s+2*m, h=OPEN*s+m+70, ox=m, oy=58;
  const X=v=>ox+v*s, Y=v=>oy+v*s;
  let b='';
  // opening
  b+=R(X(0),Y(0),OPEN*s,OPEN*s,{f:C.paper,s:C.accent,sw:2});
  // doubled trimmers (left/right) and headers (top/bottom)
  b+=R(X(-3),Y(-3),3*s,(OPEN+6)*s,{f:C.beam,s:'#5a3a1b',sw:1});
  b+=R(X(OPEN),Y(-3),3*s,(OPEN+6)*s,{f:C.beam,s:'#5a3a1b',sw:1});
  b+=R(X(0),Y(-3),OPEN*s,3*s,{f:C.woodDk,s:'#5a3a1b',sw:1});
  b+=R(X(0),Y(OPEN),OPEN*s,3*s,{f:C.woodDk,s:'#5a3a1b',sw:1});
  // trunk
  const g=(OPEN-TRUNK)/2;
  b+=Cir(X(OPEN/2),Y(OPEN/2),(TRUNK/2)*s,{f:C.trunk,s:'#5f6b4f',sw:1.5});
  b+=T(X(OPEN/2),Y(OPEN/2)+4,'Ø17.5\"',{s:13,f:'#fff',w:700});
  // gap callout
  b+=dimV(Y(0),Y(g),X(OPEN/2)+ (TRUNK/2)*s+0, '');
  b+=T(X(OPEN/2),Y(g/2)+4,`~${g.toFixed(1)}\" gap`,{s:11,f:C.dimtxt,w:700});
  // labels
  b+=T(X(-3)-6,Y(OPEN/2),'doubled trimmer',{s:10,a:'end',f:C.beam,w:600,rot:-90});
  b+=T(X(OPEN/2),Y(-3)-8,'doubled header',{s:10,f:C.beam,w:600});
  b+=dimH(X(0),X(OPEN),Y(OPEN)+3*s+18,'26\" opening');
  b+=T(w/2,h-14,'~4\" clear gap all around for growth + sway. Framing never touches bark.',{s:11,f:'#555'});
  return svg(w,h,b,'5 · TREE-OPENING DETAIL');
}

// ============================================================ 6. RAILING DETAIL
function railDetail(){
  const s=3.0, m=70, segW=60, w=segW*s+2*m, h=(RAIL+20)*s+90;
  const baseY=h-60, X=v=>m+v*s, Z=z=>baseY-z*s;
  let b='';
  // deck
  b+=R(X(0),Z(0),segW*s,8,{f:C.deck,s:C.woodDk,sw:1});
  // 4x4 posts at ends
  for(const px of [3,segW-3]) b+=R(X(px)-7,Z(RAIL),14,RAIL*s,{f:C.post,s:'#3d2a17',sw:1.2});
  // top & bottom rails
  b+=R(X(0),Z(RAIL),segW*s,2.0*s,{f:C.woodDk,s:'#5a3a1b',sw:1});
  b+=R(X(0),Z(4),segW*s,2.0*s,{f:C.woodDk,s:'#5a3a1b',sw:1});
  // balusters @ <4" gap (use 3.5" gap, 1.5" baluster -> 5" pitch)
  let xx=6;
  while(xx<segW-4){ b+=R(X(xx)-2,Z(RAIL-2),4,(RAIL-6)*s,{f:C.wood,s:C.woodDk,sw:0.8}); xx+=5; }
  b+=dimV(Z(RAIL),Z(0),X(0)-28,'36\" min');
  b+=dimH(X(6),X(11),Z(RAIL)-14,'<4\" gap');
  b+=T(w/2,h-14,'Vertical 2×2 balusters; no gap > 4\". 4×4 posts bolted to rim joist.',{s:11,f:'#555'});
  return svg(w,h,b,'6 · RAILING DETAIL (kid safety)');
}

// ============================================================ ISOMETRIC 3D (staged)
// stage: how many build steps are shown (1..8). hot stage gets a highlight.
function isoStage(stage, title){
  const w=720,h=540, cx=355, cy=350, s=1.95;
  const a=Math.PI/6;
  const P=(x,y,z)=>[cx+(x-y)*Math.cos(a)*s, cy+((x+y)*Math.sin(a)-z)*s];
  const poly=(pts,f,st,sw=1)=>`<polygon points="${pts.map(p=>p.join(',')).join(' ')}" fill="${f}" stroke="${st}" stroke-width="${sw}"/>`;
  const seg=(p,q,c,sw)=>`<line x1="${p[0]}" y1="${p[1]}" x2="${q[0]}" y2="${q[1]}" stroke="${c}" stroke-width="${sw}"/>`;
  function box(x,y,z,dx,dy,dz,col,colT,colS,hot=false){
    const p=[P(x,y,z),P(x+dx,y,z),P(x+dx,y+dy,z),P(x,y+dy,z),
             P(x,y,z+dz),P(x+dx,y,z+dz),P(x+dx,y+dy,z+dz),P(x,y+dy,z+dz)];
    const st=hot?C.accent:'#3d2a17', sw=hot?2:1;
    return poly([p[4],p[5],p[6],p[7]],colT,st,sw)+
           poly([p[1],p[2],p[6],p[5]],colS,st,sw)+
           poly([p[2],p[3],p[7],p[6]],col,st,sw);
  }
  const beamBot=DECK_UP-DECKT-JOIST-BEAM, rt=DECK_UP+RAIL;
  const o0=W/2-OPEN/2, o1=W/2+OPEN/2;
  let b='';
  // ground
  const gA=P(-14,-14,2),gB=P(W+14,-14,2),gC=P(W+14,D+14,2-DROP),gD=P(-14,D+14,2-DROP);
  b+=poly([gA,gB,gC,gD],'#e6ecdc','#b9c4a6',1);
  // 1 footings
  for(const py of [0,D]) for(const px of [0,W/2,W]){ const g=-DROP*py/D;
    b+=box(px-3,py-3,g-FOOT,6,6,FOOT,'#8f8f8f','#bdbdbd','#9c9c9c',stage===1); }
  // 2 posts
  if(stage>=2) for(const py of [0,D]) for(const px of [0,W/2,W]){ const g=-DROP*py/D;
    b+=box(px-2.75,py-2.75,g,5.5,5.5,beamBot-g,C.post,'#7a5530','#5b3f22',stage===2); }
  // 3 beams
  if(stage>=3) for(const py of [0,D]) b+=box(0,py-3.6,beamBot,W,7.2,BEAM,C.beam,'#a8702f','#6f481c',stage===3);
  // 4 joists (split around opening)
  if(stage>=4) for(let x=0;x<=W;x+=16){
    const inOpen = x>o0-2 && x<o1+2;
    if(inOpen){ b+=box(x-1.5,0,beamBot+BEAM,3,o0,JOIST,C.wood,'#dcb784','#a9794a',stage===4);
                b+=box(x-1.5,o1,beamBot+BEAM,3,D-o1,JOIST,C.wood,'#dcb784','#a9794a',stage===4); }
    else b+=box(x-1.5,0,beamBot+BEAM,3,D,JOIST,C.wood,'#dcb784','#a9794a',stage===4);
  }
  // 5 tree-opening framing + trunk
  if(stage>=5){
    b+=box(o0-3,o0,beamBot+BEAM,3,OPEN,JOIST,C.beam,'#a8702f','#6f481c',stage===5); // trimmer L
    b+=box(o1,o0,beamBot+BEAM,3,OPEN,JOIST,C.beam,'#a8702f','#6f481c',stage===5);    // trimmer R
    b+=box(o0,o0-3,beamBot+BEAM,OPEN,3,JOIST,C.beam,'#a8702f','#6f481c',stage===5);  // header top
    b+=box(o0,o1,beamBot+BEAM,OPEN,3,JOIST,C.beam,'#a8702f','#6f481c',stage===5);    // header bot
    b+=box(W/2-TRUNK/2,D/2-TRUNK/2,-DROP/2-12,TRUNK,TRUNK,150,C.trunkBark,'#aab089','#828a63');
  } else if(stage>=1){ // faint trunk reference from the start
    b+=box(W/2-TRUNK/2,D/2-TRUNK/2,-DROP/2-12,TRUNK,TRUNK,150,'#cdd3bd','#b9c0a4','#bcc3a6');
  }
  // 6 deck (4 boards framing the hole)
  if(stage>=6){ const z=DECK_UP-DECKT, hot=stage===6;
    b+=box(0,0,z,W,o0,DECKT,C.deck,'#e6c79a','#c39a63',hot);
    b+=box(0,o1,z,W,D-o1,DECKT,C.deck,'#e6c79a','#c39a63',hot);
    b+=box(0,o0,z,o0,OPEN,DECKT,C.deck,'#e6c79a','#c39a63',hot);
    b+=box(o1,o0,z,W-o1,OPEN,DECKT,C.deck,'#e6c79a','#c39a63',hot);
  }
  // 7 railing
  if(stage>=7){ const hot=stage===7;
    const rpost=(x,y)=>box(x-1,y-1,DECK_UP,2,2,RAIL,C.post,'#7a5530','#5b3f22',hot);
    for(const c of [[0,0],[W,0],[0,D],[W,D],[W/2,0],[0,D/2],[W,D/2]]) b+=rpost(c[0],c[1]);
    const cr=[P(0,0,rt),P(W,0,rt),P(W,D,rt),P(0,D,rt)];
    b+=seg(cr[0],cr[1],hot?C.accent:C.post,2.5)+seg(cr[1],cr[2],hot?C.accent:C.post,2.5)+seg(cr[3],cr[0],hot?C.accent:C.post,2.5);
  }
  // 8 ladder (downhill)
  if(stage>=8){ const lx=W*0.68; const top=P(lx,D+3,DECK_UP), bot=P(lx,D+22,-DROP);
    b+=seg(top,bot,C.woodDk,3); const top2=P(lx+7,D+3,DECK_UP),bot2=P(lx+7,D+22,-DROP); b+=seg(top2,bot2,C.woodDk,3);
    for(let k=0;k<=4;k++){const t=k/4; const pa=P(lx,D+3+19*t,DECK_UP-(DECK_UP+DROP)*t),pb=P(lx+7,D+3+19*t,DECK_UP-(DECK_UP+DROP)*t); b+=seg(pa,pb,C.woodDk,2);} }
  // compass
  b+=T(110,505,'UPHILL (low) ↖       ↘ DOWNHILL (high)',{s:11,f:C.woodDk,a:'start'});
  return svg(w,h,b,title);
}

const STEPS=[
  ['Footings','01 · Pour 6 footings'],
  ['Posts','02 · Set 6 posts, cut level'],
  ['Beams','03 · Bolt on 2 doubled beams'],
  ['Joists','04 · Lay joists @16\" o.c.'],
  ['Opening','05 · Frame tree opening + trunk'],
  ['Decking','06 · Screw down decking'],
  ['Railing','07 · Build the railing'],
  ['Ladder','08 · Add ladder / steps'],
];

const files={
  '01-plan.svg':plan(),
  '02-elevation-slope.svg':elevSlope(),
  '03-elevation-cross.svg':elevCross(),
  '04-footings.svg':footings(),
  '05-tree-opening-detail.svg':treeDetail(),
  '06-railing-detail.svg':railDetail(),
  '07-isometric-3d.svg':isoStage(8,'7 · ISOMETRIC ASSEMBLY (3D)'),
};
STEPS.forEach((st,i)=>{ files[`step-${i+1}-${st[0].toLowerCase()}.svg`]=isoStage(i+1, st[1]); });
for(const [n,c] of Object.entries(files)){ writeFileSync(new URL(n,import.meta.url),c); console.log('wrote',n); }
