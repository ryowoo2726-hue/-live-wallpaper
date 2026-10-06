const TAU=Math.PI*2;
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
function margin(f,b){return Math.min((b.right-b.left)*.2,(b.bottom-b.top)*.2,f.size*(f.spriteIndex===5?1.4:1)*.6+3);}
function chooseDestination(f,b,random){
  const padding=margin(f,b)+10;
  f.wanderX=b.left+padding+random()*Math.max(0,b.right-b.left-padding*2);
  f.wanderY=b.top+padding+random()*Math.max(0,b.bottom-b.top-padding*2);
  f.wanderTimer=5+random()*10;
}
export function createFish(count,bounds,random=Math.random,spriteCount=6){
  return Array.from({length:count},(_,index)=>{
    const angle=random()*TAU;
    const f={x:bounds.left+random()*(bounds.right-bounds.left),y:bounds.top+random()*(bounds.bottom-bounds.top),vx:Math.cos(angle)*22,vy:Math.sin(angle)*22,angle,phase:random()*TAU,size:28+random()*28,depth:random(),orbit:24+random()*60,side:index%2?1:-1,spriteIndex:index%spriteCount,cruiseSpeed:17+random()*18,steeringTime:.65+random()*.65,interest:0,linger:0,forgetRate:.7+random()*.8,foodX:0,foodY:0,wanderTimer:0};
    const padding=margin(f,bounds);
    f.x=clamp(f.x,bounds.left+padding,bounds.right-padding);
    f.y=clamp(f.y,bounds.top+padding,bounds.bottom-padding);
    chooseDestination(f,bounds,random);
    return f;
  });
}
// Losing food changes attention, never the current velocity or direction.
export function resumeWandering(fish,bounds,random=Math.random){
  for(const f of fish){f.linger=.15+random()*1.1;f.forgetRate=.7+random()*.8;chooseDestination(f,bounds,random);}
}
export function resizeFishHabitat(fish,previous,next){
  const width=previous.right-previous.left,height=previous.bottom-previous.top;
  const nextWidth=next.right-next.left,nextHeight=next.bottom-next.top;
  if(width<=0||height<=0)return;
  for(const f of fish){
    const padding=margin(f,next);
    f.x=clamp(next.left+(f.x-previous.left)/width*nextWidth,next.left+padding,next.right-padding);
    f.y=clamp(next.top+(f.y-previous.top)/height*nextHeight,next.top+padding,next.bottom-padding);
    f.wanderX=next.left+(f.wanderX-previous.left)/width*nextWidth;
    f.wanderY=next.top+(f.wanderY-previous.top)/height*nextHeight;
    f.foodX=next.left+(f.foodX-previous.left)/width*nextWidth;
    f.foodY=next.top+(f.foodY-previous.top)/height*nextHeight;
  }
}
export function updateFish(fish,target,bounds,time,dt,random=Math.random){
  const width=bounds.right-bounds.left;
  for(let index=0;index<fish.length;index++){
    const f=fish[index];
    f.wanderTimer-=dt;
    if(f.wanderTimer<=0||Math.hypot(f.wanderX-f.x,f.wanderY-f.y)<25)chooseDestination(f,bounds,random);
    if(target.active){f.foodX=target.x;f.foodY=target.y;f.interest+=(1-f.interest)*(1-Math.exp(-dt*1.8));f.linger=0;}
    else{f.linger=Math.max(0,f.linger-dt);if(f.linger===0)f.interest*=Math.exp(-f.forgetRate*dt);}
    const meander=Math.sin(time*.37+f.phase)*.3+Math.sin(time*.19+f.phase*2)*.16;
    const heading=Math.atan2(f.wanderY-f.y,f.wanderX-f.x)+meander;
    const cruise=f.cruiseSpeed*(1+Math.sin(time*.8+f.phase)*.12);
    let vx=Math.cos(heading)*cruise,vy=Math.sin(heading)*cruise;
    if(f.interest>.001){
      const angle=time*.22*f.side+f.phase,radius=f.orbit*Math.min(1,width/450);
      const dx=f.foodX+Math.cos(angle)*radius-f.x,dy=f.foodY+Math.sin(angle)*radius*.7-f.y;
      const seekScale=Math.min(.72,85/Math.max(1,Math.hypot(dx,dy)));
      vx=vx*(1-f.interest)+dx*seekScale*f.interest;vy=vy*(1-f.interest)+dy*seekScale*f.interest;
    }
    for(let other=0;other<fish.length;other++){
      if(other===index)continue;
      const dx=f.x-fish[other].x,dy=f.y-fish[other].y,distance=Math.hypot(dx,dy);
      if(distance>.01&&distance<24){const separation=(1-distance/24)*18;vx+=dx/distance*separation;vy+=dy/distance*separation;}
    }
    // Anticipate the photo edge and turn before reaching it.
    const padding=margin(f,bounds),projectedX=f.x+f.vx*1.5,projectedY=f.y+f.vy*1.5,edge=Math.min(40,width*.09);
    vx+=Math.max(0,bounds.left+padding+edge-projectedX)*1.3;
    vx-=Math.max(0,projectedX-bounds.right+padding+edge)*1.3;
    vy+=Math.max(0,bounds.top+padding+edge-projectedY)*1.3;
    vy-=Math.max(0,projectedY-bounds.bottom+padding+edge)*1.3;
    const speed=Math.hypot(vx,vy),limit=45+f.interest*40;
    if(speed>limit){vx*=limit/speed;vy*=limit/speed;}
    const steering=1-Math.exp(-dt/f.steeringTime);
    f.vx+=(vx-f.vx)*steering;f.vy+=(vy-f.vy)*steering;
    f.x=clamp(f.x+f.vx*dt,bounds.left+padding,bounds.right-padding);
    f.y=clamp(f.y+f.vy*dt,bounds.top+padding,bounds.bottom-padding);
    const desired=Math.atan2(f.vy,f.vx),turn=Math.atan2(Math.sin(desired-f.angle),Math.cos(desired-f.angle));
    f.angle+=turn*(1-Math.exp(-3*dt));
  }
}
