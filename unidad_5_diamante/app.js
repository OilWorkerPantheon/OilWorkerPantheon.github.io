"use strict";
const titles = [
"RELEVO GENERACIONAL: LA VENTAJA QUE NADIE ESTÁ APROVECHANDO",
"¿Un gran auditorio solo para hacer grados?",
"Los eventos no llegaron a la Universidad. La Universidad decidió encontrarse con el mundo.",
"Academia + Industria + Ciudad",
"Los eventos nunca fueron el objetivo. El impacto sí.",
"Un evento trae personas. Una comunidad trae transformación.",
"El talento crece a la velocidad de la confianza.",
"La experiencia construye el camino. Las nuevas generaciones descubren nuevas rutas.",
"Una visión. Dos generaciones.",
"El crecimiento no ocurre cuando una generación reemplaza a otra. Ocurre cuando trabajan juntas.",
"Los jóvenes no son el futuro. Son el presente que muchas organizaciones aún no ven.",
"El futuro no se hereda. Se construye.",
"@centrodeeventosupb"];
const chapters=["01 — Potencial oculto","02 — Descubrimiento","03 — Activación","04 — Tres sistemas","05 — Encuentro e impacto","06 — Comunidad","07 — Confianza","08 — Experiencia y rutas","09 — Dos generaciones juntas","10 — Integración","11 — Nuevas generaciones","12 — Construcción colectiva","13 — Futuro consolidado"];
const C={blue:[93,173,246],green:[66,208,153],yellow:[250,209,91],white:[202,226,233],dark:[82,103,122]};
const colors=[C.blue,C.green,C.yellow], N=2400, TAU=Math.PI*2;
const canvas=document.querySelector("#field"),ctx=canvas.getContext("2d");
let w=innerWidth,h=innerHeight,scene=0,entered=performance.now(),last=entered;
const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x)},mix=(a,b,t)=>a+(b-a)*t;
const blend=(a,b,t)=>a.map((v,i)=>mix(v,b[i],t));
function random(i,k){const x=Math.sin(i*127.1+k*311.7)*43758.5453;return x-Math.floor(x)}
const particles=Array.from({length:N},(_,i)=>({i,u:random(i,1),v:random(i,2),q:random(i,3),phase:random(i,4)*TAU,x:0,y:0,c:[...C.dark],size:1}));
function diamond(p,cx,cy,s){
 // A faceted gem silhouette sampled by circular points, never gem-shaped sprites.
 const y=p.v*1.6-.65;
 const half=y<-.23?mix(.42,.85,(y+.65)/.42):.85*(1-(y+.23)/1.18);
 const edge=p.q<.28;
 let x=(p.u*2-1)*half;
 if(edge)x=(p.u<.5?-1:1)*half+(p.q-.14)*.035;
 return [cx+x*s,cy+y*s];
}
function ball(p,cx,cy,r){const a=p.u*TAU,rad=Math.sqrt(p.v)*r;return[cx+Math.cos(a)*rad,cy+Math.sin(a)*rad]}
function target(p,s,t){
 let x=0,y=0,c=C.yellow,size=1.15+s*.065,alpha=.8;const g=p.i%4,k=p.i%3;
 const a=p.u*TAU;
 if(s===0){[x,y]=diamond(p,0,0,.78);c=C.dark;alpha=.45+p.q*.42;if(p.i<60){x=(p.u-.5)*.65+Math.sin(t*.2+p.phase)*.04;y=-.87-p.v*.17;c=C.white;size=1.35}}
 if(s===1){const z=mix(.78,2.8,ease(t/7));[x,y]=diamond(p,0,.12,z);c=p.i<250?C.white:C.dark;alpha=p.i<250?.8:.32;if(p.i<250){x=(p.u-.5)*1.5;y=mix(-1.1,(p.v-.5)*.7,ease((t-p.q*2)/5))}}
 if(s===2){[x,y]=diamond(p,0,0,.79);c=C.white;alpha=.5;if(p.i%3===0){[x,y]=ball(p,0,0,.21);c=C.blue;alpha=.9}else if(p.i%3===1){const r=mix(.65,.16,ease((t-p.q*4)/8));x=Math.cos(a)*r;y=Math.sin(a)*r;c=C.yellow;alpha=.9}}
 if(s===3){[x,y]=diamond(p,[-.65,0,.65][k],[.1,-.1,.1][k],.36);c=colors[k]}
 if(s===4){
 const approach=ease(t/3.5),spread=ease((t-3.5)/4.8);
 const start=diamond(p,[-.65,0,.65][k]*(1-approach),[.1,-.1,.1][k]*(1-approach),mix(.36,.12,approach));
 const rad=.09+p.v*.86,angle=p.v*TAU*2.2+k*TAU/3+t*.1;
 x=mix(start[0],Math.cos(angle)*rad,spread);y=mix(start[1],Math.sin(angle)*rad*.78,spread);c=colors[k];
 }
 if(s===5){const group=p.i%7,angle=group*TAU/7-.4;const radius=mix(.94,.49,ease(t/7));[x,y]=diamond(p,Math.cos(angle)*radius,Math.sin(angle)*radius*.8,.24);c=colors[group%3];if(p.q<.08){const b=angle+TAU/7;x=mix(Math.cos(angle),Math.cos(b),p.u)*radius;y=mix(Math.sin(angle),Math.sin(b),p.u)*radius*.8}}
 if(s===6){
 // Bounded, delayed impulses pass from one mass to the next.
 const cycle=t%7,delay=g*.56,local=cycle-delay;
 const impulse=local>0&&local<1.12?Math.sin(local/1.12*Math.PI)*.13:0;
 [x,y]=ball(p,-.6+g*.4+impulse,(g===0||g===3?-.09:.13),.19);c=C.blue;
 }
 if(s===7){const phase=t*.38+g*TAU/4,depth=(1-Math.cos(phase))/2;const cx=-.57+g*.38;[x,y]=ball(p,cx+Math.sin(phase)*.18,Math.sin(phase*.999)*.38,.19*(1-depth*.58));c=blend(C.blue,C.green,depth*.85);size*=1-depth*.35}
 if(s===8){const join=ease(t/8);const cx=(g<2?-1:1)*mix(.51,.175,join);[x,y]=ball(p,cx,(g%2?1:-1)*.16,.225);c=g<2?C.blue:C.green}
 if(s===9){const f=ease(t/9);const from=ball(p,(g<2?-1:1)*.175,(g%2?1:-1)*.16,.225),to=ball(p,0,0,.51);const rotation=(1-f)*Math.sin(t*.5)*.15;x=mix(from[0],to[0],f)+rotation;y=mix(from[1],to[1],f);c=blend(g<2?C.blue:C.green,C.yellow,f)}
 if(s===10||s===11){
 const group=p.i%16,angle=group*2.39996,rad=.25+Math.sqrt(group/15)*.65;
 const miniature=diamond(p,Math.cos(angle)*rad,Math.sin(angle)*rad*.79,.115);
 if(s===10){const emit=ease((t-group*.27)/4.5);const from=ball(p,0,0,.51);x=mix(from[0],miniature[0],emit);y=mix(from[1],miniature[1],emit);size=1.5}
 else {const f=ease((t-p.q*2)/14);const end=diamond(p,0,0,.84);x=mix(miniature[0],end[0],f);y=mix(miniature[1],end[1],f);size=mix(1.5,2.1,f)}
 c=C.yellow;
 }
 if(s===12){[x,y]=diamond(p,-.09,0,.86);c=C.yellow;size=2.15;alpha=.7+p.q*.3}
 const micro=.0035; x+=Math.sin(t*.48+p.phase)*micro;y+=Math.cos(t*.39+p.phase)*micro;
 return{x,y,c,size,alpha};
}
function layout(){return w<700||w<h?{cx:w*.5,cy:h*.65,scale:Math.min(w*.43,h*.265)}:{cx:w*.715,cy:h*.51,scale:Math.min(w*.255,h*.395)}}
function resize(){w=innerWidth;h=innerHeight;const d=Math.min(devicePixelRatio||1,2);canvas.width=w*d;canvas.height=h*d;ctx.setTransform(d,0,0,d,0,0)}
// Photos 1–6 are local copies of the supplied Drive assets, assigned by the original narrative.
const photoScenes={1:{id:1,focus:"50% 70%"},3:{id:2,focus:"50% 67%"},4:{id:3,focus:"47% 66%"},7:{id:4,focus:"50% 62%"},11:{id:5,focus:"50% 63%"},12:{id:6,focus:"50% 55%"}};
const photoLayers=Array.from(document.querySelectorAll(".scene-photo"));
let photoSlot=0,photoRequest=0,currentPhoto=null;
Object.values(photoScenes).forEach(({id})=>{const preload=new Image();preload.src="assets/foto-"+id+".jpg"});
function showPhoto(n){
 const spec=photoScenes[n],request=++photoRequest;
 document.body.classList.toggle("has-photo",!!spec);
 if(!spec){photoLayers.forEach(el=>el.classList.remove("visible"));currentPhoto=null;return}
 if(currentPhoto===spec.id)return;
 currentPhoto=spec.id;
 photoSlot=1-photoSlot;
 const incoming=photoLayers[photoSlot],outgoing=photoLayers[1-photoSlot];
 incoming.classList.remove("visible");
 incoming.style.setProperty("--photo-focus",spec.focus);
 incoming.onload=()=>{if(request!==photoRequest)return;incoming.classList.add("visible");outgoing.classList.remove("visible")};
 incoming.onerror=()=>{if(request!==photoRequest)return;photoLayers.forEach(el=>el.classList.remove("visible"));currentPhoto=null};
 incoming.src="assets/foto-"+spec.id+".jpg";
 if(incoming.complete&&incoming.naturalWidth)incoming.onload();
}
function go(n){n=Math.max(0,Math.min(12,n));scene=n;showPhoto(n);entered=performance.now();document.querySelector("#title").textContent=titles[n];document.querySelector("#chapter").textContent=chapters[n];document.querySelector("#count").textContent=String(n+1).padStart(2,"0")+" / 13";document.querySelector("#progress").style.width=((n+1)/13*100)+"%";document.body.classList.toggle("long",titles[n].length>79);document.body.classList.toggle("final",n===12);document.querySelector("#prev").disabled=n===0;document.querySelector("#next").disabled=n===12;document.documentElement.style.setProperty("--accent",n===6||n===7?"#74baff":n===8?"#70d4bb":"#f6d36a")}
const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
function frame(now){
 const dt=Math.min((now-last)/1000,.05);last=now;let t=(now-entered)/1000;if(reduced)t=30;
 ctx.clearRect(0,0,w,h);const {cx,cy,scale}=layout();
 const glow=ctx.createRadialGradient(cx,cy,0,cx,cy,scale*1.3);glow.addColorStop(0,scene<3?"#14263755":"#17313a40");glow.addColorStop(1,"#080e1400");ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);
 const follow=1-Math.exp(-dt*(reduced?12:3.2));
 for(const p of particles){const q=target(p,scene,t);p.x=mix(p.x,q.x,follow);p.y=mix(p.y,q.y,follow);p.size=mix(p.size,q.size,follow);p.c=blend(p.c,q.c,follow);ctx.fillStyle="rgba("+p.c.map(Math.round).join(",")+","+q.alpha+")";ctx.beginPath();ctx.arc(cx+p.x*scale,cy+p.y*scale,Math.max(.55,p.size*scale/350),0,TAU);ctx.fill()}
 if(scene===3&&t>1){ctx.font="10px Arial";ctx.textAlign="center";["ACADEMIA","INDUSTRIA","CIUDAD"].forEach((label,k)=>{ctx.fillStyle="rgb("+colors[k].join(",")+")";ctx.fillText(label,cx+[-.65,0,.65][k]*scale,cy+([.1,-.1,.1][k]+.48)*scale)})}
 requestAnimationFrame(frame);
}
function fullscreen(){if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});else document.documentElement.requestFullscreen().catch(()=>{})}
const guide=document.querySelector("#guide");function help(){guide.open?guide.close():guide.showModal()}
document.querySelector("#prev").onclick=()=>go(scene-1);document.querySelector("#next").onclick=()=>go(scene+1);document.querySelector("#full").onclick=fullscreen;document.querySelector("#help").onclick=help;document.querySelector("#close").onclick=()=>guide.close();
addEventListener("keydown",e=>{if(e.key.toLowerCase()==="h"){e.preventDefault();help();return}if(guide.open)return;if(e.target.closest("button")&&(e.key===" "||e.key==="Enter"))return;if(["ArrowRight","ArrowLeft"," "].includes(e.key))e.preventDefault();if(e.key==="ArrowRight"||e.key===" ")go(scene+1);if(e.key==="ArrowLeft")go(scene-1);if(e.key.toLowerCase()==="r")go(0);if(e.key.toLowerCase()==="f")fullscreen()});
addEventListener("resize",resize);resize();go(0);for(const p of particles){const q=target(p,0,0);p.x=q.x;p.y=q.y}requestAnimationFrame(frame);


