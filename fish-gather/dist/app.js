import {createFish, updateFish, resumeWandering, resizeFishHabitat} from './physics.mjs';
import {photoBounds, insidePhoto} from './geometry.mjs';
const ocean=document.querySelector('#ocean'),canvas=document.querySelector('#life'),ctx=canvas.getContext('2d');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let paused=reduced.matches,w=0,h=0,fish=[],last=0,time=0,ripple=0,frame=0;
const target={x:0,y:0,active:false};
const landscape=document.querySelector('.landscape');
let bounds={left:0,top:0,right:0,bottom:0},pointer=null;
const spriteDefinitions=[
  {file:'1_silhouette_gold.jpg',crop:[.07,.27,.84,.44],scale:1},
  {file:'2_silhouette_cyan.jpg',crop:[.035,.27,.9,.48],scale:1},
  {file:'3_silhouette_emerald.jpg',crop:[.065,.29,.88,.41],scale:1},
  {file:'4_silhouette_moonlight.jpg',crop:[.065,.31,.88,.38],scale:1},
  {file:'5_silhouette_violet.jpg',crop:[.035,.265,.9,.485],scale:1},
  {file:'bonus_silhouette_ray.jpg',crop:[.06,.23,.88,.48],scale:1.4},
];
const sprites=spriteDefinitions.map(definition=>{
  const image=new Image(),sprite={...definition,image,ready:false};
  image.onload=()=>{sprite.ready=true;};
  image.onerror=()=>{console.warn('Fish image could not be loaded:',definition.file);};
  image.src='assets/silhouette_fishes/'+definition.file;
  return sprite;
});
function releaseTarget(){if(target.active){target.active=false;resumeWandering(fish,bounds);}}
function measurePhoto(){
  if(!landscape.naturalWidth||!landscape.naturalHeight)return;
  const previous=bounds;
  bounds=photoBounds(w,h,landscape.naturalWidth,landscape.naturalHeight,getComputedStyle(landscape).objectFit);
  if(!fish.length)fish=createFish(w<640?42:66,bounds,Math.random,sprites.length);
  else if(previous.left!==bounds.left||previous.top!==bounds.top||previous.right!==bounds.right||previous.bottom!==bounds.bottom)resizeFishHabitat(fish,previous,bounds);
  if(target.active&&!insidePhoto(target.x,target.y,bounds))releaseTarget();
  if(pointer&&!insidePhoto(pointer.x,pointer.y,bounds))releaseTarget();
}
landscape.addEventListener('load',measurePhoto);
function resize(){w=ocean.clientWidth;h=ocean.clientHeight;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);measurePhoto();}
new ResizeObserver(resize).observe(ocean);resize();
function setTarget(x,y){if(!insidePhoto(x,y,bounds)){releaseTarget();return;}target.x=x;target.y=y;target.active=true;ripple=1;}
function followPointer(e){const rect=ocean.getBoundingClientRect();pointer={x:e.clientX-rect.left,y:e.clientY-rect.top};setTarget(pointer.x,pointer.y);}
ocean.addEventListener('pointermove',followPointer);
ocean.addEventListener('pointerdown',e=>{followPointer(e);if(target.active&&e.pointerType!=='mouse')ocean.setPointerCapture(e.pointerId);});
ocean.addEventListener('pointerleave',()=>{pointer=null;releaseTarget();});
ocean.addEventListener('pointerup',e=>{if(e.pointerType!=='mouse'){pointer=null;releaseTarget();}});
ocean.addEventListener('pointercancel',()=>{pointer=null;releaseTarget();});
ocean.addEventListener('keydown',e=>{if(e.target!==ocean)return;const moves={ArrowLeft:[-35,0],ArrowRight:[35,0],ArrowUp:[0,-35],ArrowDown:[0,35]};if(moves[e.key]){e.preventDefault();if(!target.active){target.x=w/2;target.y=h/2;}setTarget(Math.max(bounds.left+1,Math.min(bounds.right-1,target.x+moves[e.key][0])),Math.max(bounds.top+1,Math.min(bounds.bottom-1,target.y+moves[e.key][1])));}if(e.key==='Escape')releaseTarget();if(e.code==='Space'){e.preventDefault();if(!e.repeat)paused=!paused;}});
ocean.addEventListener('blur',releaseTarget);
window.addEventListener('blur',()=>{pointer=null;releaseTarget();});
const motes=Array.from({length:55},()=>({x:Math.random(),y:Math.random(),size:.5+Math.random()*1.1,speed:2+Math.random()*7,phase:Math.random()*6.28}));
function draw(dt){
  ctx.clearRect(0,0,w,h);
  for(const m of motes){const x=m.x*w+Math.sin(time*.22+m.phase)*9,y=((m.y*h-time*m.speed)%h+h)%h;ctx.fillStyle=`rgba(189,238,244,${.08+(Math.sin(time*.7+m.phase)+1)*.1})`;ctx.beginPath();ctx.arc(x,y,m.size,0,Math.PI*2);ctx.fill();}
  if(target.active){ripple=Math.min(1,ripple+dt);const glow=ctx.createRadialGradient(target.x,target.y,0,target.x,target.y,100);glow.addColorStop(0,'rgba(151,238,244,0.10)');glow.addColorStop(1,'rgba(151,238,244,0)');ctx.fillStyle=glow;ctx.fillRect(target.x-100,target.y-100,200,200);ctx.strokeStyle='rgba(206,250,255,.32)';ctx.lineWidth=1;ctx.beginPath();ctx.arc(target.x,target.y,8+Math.sin(time*1.5)*2,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#d0f7fba8';ctx.beginPath();ctx.arc(target.x,target.y,2,0,Math.PI*2);ctx.fill();}
  if(sprites.some(sprite=>sprite.ready)){
    ctx.save();ctx.beginPath();ctx.rect(bounds.left,bounds.top,bounds.right-bounds.left,bounds.bottom-bounds.top);ctx.clip();
    for(const f of fish){
      const sprite=sprites[f.spriteIndex];if(!sprite.ready)continue;
      const facingLeft=Math.cos(f.angle)<0;
      let tilt=f.angle;if(facingLeft)tilt=Math.PI-f.angle;
      const [cropX,cropY,cropW,cropH]=sprite.crop;
      const sourceW=cropW*sprite.image.naturalWidth,sourceH=cropH*sprite.image.naturalHeight;
      const sw=f.size*sprite.scale*(.87+Math.sin(time*5+f.phase)*.05),sh=sw*sourceH/sourceW;
      ctx.save();ctx.translate(f.x,f.y);if(facingLeft)ctx.scale(-1,1);ctx.rotate(tilt);ctx.globalAlpha=.62+f.depth*.36;ctx.globalCompositeOperation='screen';ctx.filter=f.depth<.2?'blur(.5px)':'none';ctx.drawImage(sprite.image,cropX*sprite.image.naturalWidth,cropY*sprite.image.naturalHeight,sourceW,sourceH,-sw/2,-sh/2,sw,sh);ctx.restore();
    }
    ctx.restore();
  }
}
function loop(now){const dt=Math.min((now-last)/1000||0,.04);last=now;if(!paused&&!document.hidden){time+=dt;updateFish(fish,target,bounds,time,dt);}draw(paused?0:dt);frame=requestAnimationFrame(loop);}
document.addEventListener('visibilitychange',()=>{last=performance.now();if(document.hidden){pointer=null;releaseTarget();}});frame=requestAnimationFrame(loop);
