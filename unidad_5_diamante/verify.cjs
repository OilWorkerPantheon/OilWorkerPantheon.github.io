const fs=require("fs"),vm=require("vm"),assert=require("assert");
let source=fs.readFileSync("app.js","utf8");
source=source.slice(0,source.indexOf('const canvas='))+source.slice(source.indexOf('const clamp='),source.indexOf('function layout()'));
const brief=fs.readFileSync("C:/Users/ddkpl/.codex/attachments/e2f1476b-2ed9-48ca-abe5-78046b72ee74/Texto pegado.txt","utf8");
const expected=[...brief.matchAll(/^## "([^"]+)"/gm)].map(x=>x[1]);
const context={assert,expected,console};vm.createContext(context);
vm.runInContext(source+ `
assert.strictEqual(JSON.stringify(titles),JSON.stringify(expected));
for(let s=0;s<13;s++)for(const t of [0,.5,3,8,16,60,600])for(const p of particles){
 const q=target(p,s,t);assert(Number.isFinite(q.x)&&Number.isFinite(q.y));assert(q.size>0);assert(q.c.every(v=>v>=0&&v<=255));
}
for(const s of [5,8,11,12])for(const p of particles.filter((_,i)=>i%50===0)){
 const a=target(p,s,60),b=target(p,s,600);assert(Math.hypot(a.x-b.x,a.y-b.y)<.011);
}
console.log("PASS: 13 exact titles; 218400 finite particle states; bounded resting scenes.");
`,context);

