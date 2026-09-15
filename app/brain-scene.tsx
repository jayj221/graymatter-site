"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, Plus, Minus, RotateCcw } from "lucide-react";

export default function BrainScene() {
  const host = useRef<HTMLDivElement>(null);
  const controls = useRef({ zoom: 0, paused: false });
  const [zoom, setZoom] = useState(false);
  const [paused, setPaused] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const changeZoom = (value: boolean) => { controls.current.zoom = value ? 1 : 0; setZoom(value); };

  useEffect(() => {
    const container = host.current!;
    const abort = new AbortController();
    let stopped = false;
    let cleanup = () => {};
    async function setup() {
      const THREE = await import("three");
      const response = await fetch("/brain-particles.bin", { signal: abort.signal });
      if (!response.ok) throw new Error("Brain asset unavailable");
      const positions = new Float32Array(await response.arrayBuffer());
      if (stopped) return;
      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: "low-power" });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
      renderer.setClearColor(0x0b0c12, 0);
      container.appendChild(renderer.domElement);
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(40, 1, .1, 60);
      camera.position.z = 4.9;
      const mobile = matchMedia("(max-width: 760px)").matches;
      const count = mobile ? 10000 : 18000;
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(positions.slice(0, count * 3), 3));
      const random = new Float32Array(count * 3);
      let seed = 7362;
      const rand = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
      for (let i = 0; i < random.length; i++) random[i] = rand();
      geometry.setAttribute("aRandom", new THREE.BufferAttribute(random, 3));
      const uniforms = { uTime: { value: 0 }, uExplode: { value: 0 }, uHover: { value: 0 }, uPointer: { value: new THREE.Vector2(5, 5) }, uPixel: { value: Math.min(devicePixelRatio, 1.75) } };
      const material = new THREE.ShaderMaterial({
        transparent: true, depthWrite: false, uniforms,
        vertexShader: `
          attribute vec3 aRandom;
          uniform float uTime, uExplode, uHover, uPixel;
          uniform vec2 uPointer;
          varying vec3 vColor;
          varying float vAlpha, vAngle;
          void main() {
            vec3 p = position;
            vec3 burst = normalize(p + (aRandom - .5) * 1.4);
            p += burst * uExplode * (1.8 + aRandom.x * 3.0);
            p.y += sin(uTime * .45 + aRandom.z * 6.283) * .015;
            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            vec4 projected = projectionMatrix * mv;
            vec2 ndc = projected.xy / projected.w;
            float nearCursor = exp(-dot(ndc - uPointer, ndc - uPointer) * 10.0) * uHover;
            mv.xy += normalize(ndc - uPointer + .001) * nearCursor * .10;
            gl_Position = projectionMatrix * mv;
            float band = sin(position.z * 3.8 + position.x * 3.0 + position.y * 4.5);
            vec3 silver = vec3(.97, .96, 1.0);
            vec3 coral = vec3(1.0, .43, .26);
            vec3 indigo = vec3(.43, .34, .84);
            vColor = mix(silver, coral, smoothstep(.3, .85, band) * .88);
            vColor = mix(vColor, indigo, smoothstep(.45, .95, -band) * .65);
            vColor += nearCursor * .24;
            vAlpha = clamp((1.0 / max(.5, -mv.z)) * 4.6, .25, 1.0) * (.68 + aRandom.y * .32);
            gl_PointSize = clamp((2.7 + aRandom.x * 2.3 + nearCursor * 2.5) * uPixel * 4.6 / max(.5, -mv.z), 1.0, 35.0);
            vAngle = aRandom.z * 6.283 + uTime * .06;
          }
        `,
        fragmentShader: `
          precision mediump float;
          varying vec3 vColor;
          varying float vAlpha, vAngle;
          float segment(vec2 p, vec2 a, vec2 b) { vec2 q=p-a, d=b-a; return length(q-d*clamp(dot(q,d)/dot(d,d),0.,1.)); }
          void main() {
            vec2 p = gl_PointCoord - .5;
            float c=cos(vAngle),s=sin(vAngle); p=mat2(c,-s,s,c)*p;
            vec2 a=vec2(0.,.43),b=vec2(-.38,-.24),d=vec2(.38,-.24);
            float edge=min(segment(p,a,b),min(segment(p,b,d),segment(p,d,a)));
            float alpha=1.-smoothstep(.018,.10,edge);
            if(alpha<.04)discard;
            gl_FragColor=vec4(vColor,alpha*vAlpha);
          }
        `
      });
      const brain = new THREE.Points(geometry, material);
      brain.rotation.set(.12, -1.03, -.06);
      scene.add(brain);
      const dustGeometry = new THREE.BufferGeometry();
      const dustPositions = new Float32Array(260 * 3);
      for (let i=0; i<dustPositions.length; i+=3) { dustPositions[i]=(rand()-.5)*11; dustPositions[i+1]=(rand()-.5)*8; dustPositions[i+2]=(rand()-.5)*9; }
      dustGeometry.setAttribute("position", new THREE.BufferAttribute(dustPositions,3));
      const dustMaterial = new THREE.PointsMaterial({ color:0xb3a4d7, size:.009, transparent:true, opacity:.36, depthWrite:false });
      const dust = new THREE.Points(dustGeometry,dustMaterial); scene.add(dust);
      let width=0, height=0, active=true, frame=0, last=0, time=0, hover=0, zoomValue=0, px=0, py=0, tx=0, ty=0, scrollZoom=0;
      const motion=matchMedia("(prefers-reduced-motion: reduce)");
      let reduced=motion.matches;
      const resize=()=>{width=container.clientWidth;height=container.clientHeight;renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();};
      const observer=new ResizeObserver(resize);observer.observe(container);resize();
      const visibility=new IntersectionObserver(([entry])=>{active=entry.isIntersecting;});visibility.observe(container);
      const pointer=(e:PointerEvent)=>{if(e.pointerType==='touch')return;const r=container.getBoundingClientRect();tx=(e.clientX-r.left)/width*2-1;ty=-((e.clientY-r.top)/height*2-1);hover=1;};
      const leave=()=>{hover=0;tx=0;ty=0;};
      const motionChange=()=>{reduced=motion.matches;};
      const scroll=()=>{const hero=container.closest(".hero");if(hero){const r=hero.getBoundingClientRect();scrollZoom=Math.max(0,Math.min(1,-r.top/(r.height*.65)));}};
      window.addEventListener("scroll",scroll,{passive:true});scroll();
      container.addEventListener('pointermove',pointer);container.addEventListener('pointerleave',leave);motion.addEventListener('change',motionChange);
      const contextLost=(event:Event)=>{event.preventDefault();setFailed(true);};renderer.domElement.addEventListener('webglcontextlost',contextLost);
      const tick=(now:number)=>{
        if(stopped)return;frame=requestAnimationFrame(tick);
        const dt=Math.min((now-last)/1000||0,.04);last=now;
        if(!active||document.hidden)return;
        const frozen=controls.current.paused||reduced;
        if(!frozen)time+=dt;
        const ease=1-Math.exp(-dt*5.5);
        px+=(tx-px)*ease;py+=(ty-py)*ease;
        const target=Math.max(controls.current.zoom, reduced ? 0 : scrollZoom);
        zoomValue=reduced?target:zoomValue+(target-zoomValue)*(1-Math.exp(-dt*2.8));
        uniforms.uTime.value=time;
        uniforms.uHover.value=frozen?0:uniforms.uHover.value+(hover-uniforms.uHover.value)*ease;
        uniforms.uPointer.value.set(px,py);
        uniforms.uExplode.value=zoomValue*.52;
        if(!controls.current.paused){
          brain.rotation.y=-1.03+(reduced?0:Math.sin(time*.12)*.18+px*.55+scrollZoom*.55);
          brain.rotation.x=.12+(reduced?0:-py*.22);
          brain.rotation.z=-.06+(reduced?0:px*.035);
          dust.rotation.y=reduced?0:time*.013;
        }
        camera.position.z=4.9-zoomValue*2.3-uniforms.uHover.value*.35;
        renderer.render(scene,camera);
      };
      frame=requestAnimationFrame(tick);
      setReady(true);
      cleanup=()=>{cancelAnimationFrame(frame);window.removeEventListener("scroll",scroll);observer.disconnect();visibility.disconnect();motion.removeEventListener('change',motionChange);container.removeEventListener('pointermove',pointer);container.removeEventListener('pointerleave',leave);renderer.domElement.removeEventListener('webglcontextlost',contextLost);geometry.dispose();material.dispose();dustGeometry.dispose();dustMaterial.dispose();renderer.dispose();renderer.domElement.remove();};
    }
    setup().catch(()=>{if(!stopped)setFailed(true);});
    return ()=>{stopped=true;abort.abort();cleanup();};
  }, []);

  return <div className={"hero-art particle-brain " + (ready && !failed ? "is-ready" : "")}>
    {(!ready || failed) && <img className="brain brain-fallback" src="/brain.png" alt="GrayMatter neural brain"/>}
    <div ref={host} className="brain-canvas" role="img" aria-label="Interactive three-dimensional brain made of coral and silver particles"/>
    <span className="art-label top">01 / FIRM MEMORY</span>
    {ready && !failed && <>
      <div className="brain-controls" aria-label="Brain animation controls">
        <button onClick={()=>changeZoom(!zoom)} aria-label={zoom?"Zoom out of brain":"Zoom into brain"} aria-pressed={zoom}>{zoom?<Minus size={16}/>:<Plus size={16}/>}</button>
        <button onClick={()=>{const value=!paused;controls.current.paused=value;setPaused(value);}} aria-label={paused?"Play brain animation":"Pause brain animation"} aria-pressed={paused}>{paused?<Play size={14}/>:<Pause size={14}/>}</button>
        <button onClick={()=>changeZoom(false)} aria-label="Reset brain view"><RotateCcw size={14}/></button>
      </div>
      <button className="brain-explore" onClick={()=>changeZoom(!zoom)}>{zoom?"RETURN TO THE BRAIN":"EXPLORE THE BRAIN"} <span>{zoom?'−':'+'}</span></button>
      <span className="brain-hint">MOVE TO ROTATE · SCROLL TO EXPLORE</span>
    </>}
  </div>;
}
