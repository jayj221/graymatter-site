"use client";

import { useEffect, useRef, useState } from "react";

// The glass brain from /brain.png, brought to life.
// Hover: the glass parts under the cursor and breaks into triangles that swirl around it.
// Click or tap: a shock ring ripples through the brain. Drag: turn it, and it springs back.
// `background` pins it behind the page: strong in the hero and in the blank interludes
// (.brain-interlude), and pushed to the side and nearly invisible behind explanatory content.
export default function BrainScene({ background = false }: { background?: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const container = host.current!;
    let stopped = false;
    let cleanup = () => {};
    async function setup() {
      const THREE = await import("three");
      const image = new Image();
      image.src = "/brain.png";
      await image.decode();
      if (stopped) return;

      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
      renderer.setClearColor(0x0b0c12, 0);
      container.appendChild(renderer.domElement);
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(40, 1, .1, 60);
      camera.position.z = 6.5;
      const mobile = matchMedia("(max-width: 760px)").matches;
      const SIZE = 3.3, RADIUS = .4;

      const texture = new THREE.Texture(image);
      texture.colorSpace = THREE.NoColorSpace;
      texture.minFilter = THREE.LinearFilter;
      texture.needsUpdate = true;

      const uniforms = {
        uMap: { value: texture }, uTime: { value: 0 }, uExplode: { value: 0 }, uHover: { value: 0 },
        uPointer: { value: new THREE.Vector2(99, 99) }, uPixel: { value: Math.min(devicePixelRatio, 1.75) },
        uRipple: { value: new THREE.Vector2(99, 99) }, uBulb: { value: 0 }, uRippleT: { value: 9 }, uRadius: { value: RADIUS }, uSize: { value: SIZE },
        uLight: { value: 0 },   // 1 when the page behind the brain is light
        uAccent: { value: new THREE.Color(1, .43, .22) },   // the palette's accent, so the fibres match the site
      };

      const brain = new THREE.Group();
      scene.add(brain);

      // ---- the image given real volume ----
      // A thickness map from the brain's silhouette (distance to its edge, rounded off) inflates the picture into a
      // glass lens: a front surface and a mirrored back surface, so turning it shows a solid, rounded form, not a card.
      const HM = 128, THICK = .62;
      const heights = (() => {
        const c = document.createElement("canvas"); c.width = c.height = HM;
        const g = c.getContext("2d", { willReadFrequently: true })!; g.drawImage(image, 0, 0, HM, HM);
        const px = g.getImageData(0, 0, HM, HM).data, INF = 1e9;
        const dist = new Float32Array(HM * HM);
        for (let i = 0; i < HM * HM; i++) dist[i] = .299 * px[i * 4] + .587 * px[i * 4 + 1] + .114 * px[i * 4 + 2] > 6 ? INF : 0;
        // two-pass chamfer distance transform
        const at = (x: number, y: number) => x < 0 || y < 0 || x >= HM || y >= HM ? 0 : dist[y * HM + x];
        for (let y = 0; y < HM; y++) for (let x = 0; x < HM; x++) { const i = y * HM + x; if (dist[i]) dist[i] = Math.min(dist[i], at(x - 1, y) + 1, at(x, y - 1) + 1, at(x - 1, y - 1) + 1.41, at(x + 1, y - 1) + 1.41); }
        for (let y = HM - 1; y >= 0; y--) for (let x = HM - 1; x >= 0; x--) { const i = y * HM + x; if (dist[i]) dist[i] = Math.min(dist[i], at(x + 1, y) + 1, at(x, y + 1) + 1, at(x + 1, y + 1) + 1.41, at(x - 1, y + 1) + 1.41); }
        let max = 1; dist.forEach(d => { if (d > max) max = d; });
        const h = new Float32Array(HM * HM);
        for (let i = 0; i < HM * HM; i++) { const t = Math.min(1, dist[i] / max); h[i] = Math.sqrt(t * (2 - t)); }   // round profile
        // soften the terraces
        for (let pass = 0; pass < 3; pass++) {
          const src = h.slice();
          for (let y = 1; y < HM - 1; y++) for (let x = 1; x < HM - 1; x++) {
            let sum = 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) sum += src[(y + dy) * HM + x + dx];
            h[y * HM + x] = sum / 9;
          }
        }
        return h;
      })();
      // thickness at an image position (u across, v down from the top), bilinear
      const thicknessAt = (u: number, v: number) => {
        const fx = Math.max(0, Math.min(HM - 1.001, u * HM - .5)), fy = Math.max(0, Math.min(HM - 1.001, v * HM - .5));
        const x = Math.floor(fx), y = Math.floor(fy), tx = fx - x, ty = fy - y, i = y * HM + x;
        return THICK * ((heights[i] * (1 - tx) + heights[i + 1] * tx) * (1 - ty) + (heights[i + HM] * (1 - tx) + heights[i + HM + 1] * tx) * ty);
      };
      const planeGeometry = new THREE.PlaneGeometry(SIZE, SIZE, 180, 180);
      {
        const pa = planeGeometry.attributes.position;
        for (let i = 0; i < pa.count; i++) pa.setZ(i, thicknessAt(pa.getX(i) / SIZE + .5, .5 - pa.getY(i) / SIZE));
        planeGeometry.computeVertexNormals();
      }
      const planeMaterial = new THREE.ShaderMaterial({
        transparent: true, depthWrite: false, uniforms,
        vertexShader: `
          varying vec2 vUv; varying float vRim;
          void main(){
            vUv = uv;
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            // grazing-angle factor: the glass reads brighter where its surface turns away from you
            vRim = 1.0 - abs(dot(normalize(normalMatrix * normal), normalize(-mv.xyz)));
            gl_Position = projectionMatrix * mv;
          }`,
        fragmentShader: `
          precision highp float;
          uniform sampler2D uMap; uniform float uBulb, uTime, uHover, uExplode, uRippleT, uRadius, uSize, uLight;
          uniform vec3 uAccent;
          uniform vec2 uPointer, uRipple;
          varying vec2 vUv; varying float vRim;
          float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
          float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f);
            return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+1.), f.x), f.y); }
          void main(){
            vec2 local = (vUv - .5) * uSize;                          // same space as the particles
            float dist = length(local - uPointer);
            float near = uHover * (1.0 - smoothstep(uRadius * .45, uRadius, dist));
            float rd = length(local - uRipple);
            float ring = exp(-pow((rd - uRippleT * 2.2) / .16, 2.0)) * exp(-uRippleT * 1.6);

            vec3 c = texture2D(uMap, vUv).rgb;
            float lum = dot(c, vec3(.299, .587, .114));
            float fibre = clamp((c.r - c.b) * 2.4 - .2, 0., 1.) * smoothstep(.18, .55, c.r);

            vec2 hub = vec2(.49, .59);
            float r = length((vUv - hub) * vec2(1., 1.15));
            float wobble = noise(vUv * 8.0 + uTime * .12) * 5.0;
            float w1 = pow(.5 + .5 * sin(r * 34.0 - uTime * 2.2 + wobble), 12.0);
            float w2 = pow(.5 + .5 * sin(r * 19.0 - uTime * 1.3 + wobble * .8 + 2.1), 16.0);
            vec2 cell = floor(vUv * 150.0);
            float twinkle = .5 + .5 * sin(uTime * (1.5 + hash(cell) * 4.0) + hash(cell + 7.) * 6.283);
            float synapse = smoothstep(.72, .95, lum) * fibre;

            vec3 glow = uAccent;
            vec3 hot = mix(uAccent, vec3(1.), .45);        // the brighter core of a lit fibre
            vec3 col = c * (.88 + .12 * sin(uTime * .5));
            col += glow * fibre * (w1 * 1.25 + w2 * .7);
            col += hot * synapse * twinkle * .75;
            // on a light page the same brain is drawn in ink, with its fibres and synapses still lit
            vec3 ink = mix(vec3(.60, .61, .66), vec3(.09, .10, .13), smoothstep(.06, .72, lum));
            vec3 light = mix(ink, uAccent, clamp(fibre * .92, 0., 1.));
            light = mix(light, mix(uAccent, vec3(1.), .3), clamp(fibre * (w1 * 1.1 + w2 * .6), 0., 1.));
            light = mix(light, hot, synapse * twinkle * .85);
            col = mix(col, light, uLight);
            // a hot rim where the glass is breaking apart, and a flash as the ripple passes
            float rim = uHover * exp(-pow((dist - uRadius * .75) / .09, 2.0));
            float flash = (rim * .9 + ring * 1.4) * smoothstep(.04, .2, lum);
            col = mix(col + glow * flash, mix(col, glow, clamp(flash, 0., 1.)), uLight);

            float sheen = pow(vRim, 3.0) * .35 * smoothstep(.03, .12, lum);
            col = mix(col + vec3(.75, .8, .9) * sheen, mix(col, vec3(.5, .53, .6), sheen), uLight);
            float alpha = smoothstep(.035, .14, lum + fibre * .25);
            alpha *= 1.0 - near * .7;                                 // the glass opens under the cursor
            alpha *= 1.0 - ring * .7;
            // the burst: fibres flare as the brain swells, then the glass cracks away in pieces (its particles carry on)
            float flare = smoothstep(.0, .22, uExplode) * (1.0 - smoothstep(.3, .5, uExplode));
            col = mix(col + glow * fibre * flare * 1.1 + c * flare * .25, mix(col, glow, clamp(fibre * flare * 1.2, 0., 1.)), uLight);
            float crack = smoothstep(.24, .5, uExplode);
            alpha *= smoothstep(crack - .1, crack + .02, noise(vUv * 26.0) * .75 + (1.0 - length(vUv - .5) * 1.4) * .25);
            alpha *= 1.0 - smoothstep(.02, .25, uBulb);
            gl_FragColor = vec4(col, alpha);
          }`,
      });
      const plane = new THREE.Mesh(planeGeometry, planeMaterial);
      brain.add(plane);
      // the back of the lens: the same surface mirrored through the middle, so it faces outward the other way
      const planeBack = new THREE.Mesh(planeGeometry, planeMaterial);
      planeBack.scale.z = -1;
      brain.add(planeBack);

      // the open end of the brain-stem tube and a point further up it (pixels in /brain.png), on the same dome as the plane.
      // Projected every frame and shared with the nerve, so it always leaves from that opening however the brain moves.
      const onSurface = (px: number, py: number) => {
        const u = px / 1254, v = py / 1254;
        return new THREE.Vector3((u - .5) * SIZE, (.5 - v) * SIZE, thicknessAt(u, v));
      };
      const STEM_END = onSurface(800, 1090), STEM_TOP = onSurface(777, 1010);
      const stemOut = { end: { x: 0, y: 0 }, top: { x: 0, y: 0 }, ready: false };
      const projected = new THREE.Vector3();
      const toPage = (local: InstanceType<typeof THREE.Vector3>, out: { x: number; y: number }, rect: DOMRect) => {
        projected.copy(local).applyMatrix4(brain.matrixWorld).project(camera);
        out.x = rect.left + (projected.x + 1) / 2 * rect.width;
        out.y = rect.top + (1 - projected.y) / 2 * rect.height + scrollY;
      };

      // ---- particles sampled from the image: shards under the cursor, dust when the brain bursts ----
      const canvas = document.createElement("canvas");
      const S = 300; canvas.width = canvas.height = S;
      const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
      ctx.drawImage(image, 0, 0, S, S);
      const pixels = ctx.getImageData(0, 0, S, S).data;
      let seed = 7362;
      const rand = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
      const limit = mobile ? 12000 : 26000;
      const pos: number[] = [], col: number[] = [], rnd: number[] = [], bulb: number[] = [];
      let candidates = 0;
      for (let i = 0; i < pixels.length; i += 4) if (.299 * pixels[i] + .587 * pixels[i+1] + .114 * pixels[i+2] >= 25.5) candidates++;
      const keep = Math.min(1, limit / Math.max(1, candidates));
      for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
        const i = (y * S + x) * 4, r = pixels[i] / 255, g = pixels[i+1] / 255, b = pixels[i+2] / 255;
        const lum = .299 * r + .587 * g + .114 * b;
        if (lum < .1 || rand() > keep) continue;
        const u = (x + rand()) / S, v = 1 - (y + rand()) / S;
        pos.push((u - .5) * SIZE, (v - .5) * SIZE, (rand() < .5 ? 1 : -1) * thicknessAt(u, 1 - v) * (.7 + rand() * .3));
        col.push(r, g, b); rnd.push(rand(), rand(), rand());
        // a second shape for the same particle: a lightbulb, the moment knowledge becomes an idea
        const q = rand(); let bx, by, bz;
        if (q < .66) { const th = rand() * 6.283, ph = Math.acos(2 * rand() - 1); bx = Math.sin(ph) * Math.cos(th); by = Math.cos(ph); bz = Math.sin(ph) * Math.sin(th);
          if (by < -.55) { const kk = .55 + .45 * (by + 1) / .45; bx *= kk; bz *= kk; } bx *= .95; by = by * .95 + .45; bz *= .95; }
        else if (q < .86) { const t = rand(), th = rand() * 6.283, rr = .56 - t * .18; bx = Math.cos(th) * rr; by = -.45 - t * .62; bz = Math.sin(th) * rr; }
        else { const t = rand(), th = rand() * 6.283, rr = .38 + .03 * Math.sin(t * 40); bx = Math.cos(th) * rr; by = -1.07 - t * .5; bz = Math.sin(th) * rr; }
        bulb.push(bx, by, bz);
      }
      const pointsGeometry = new THREE.BufferGeometry();
      pointsGeometry.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      pointsGeometry.setAttribute("aColor", new THREE.Float32BufferAttribute(col, 3));
      pointsGeometry.setAttribute("aRandom", new THREE.Float32BufferAttribute(rnd, 3));
      pointsGeometry.setAttribute("aBulb", new THREE.Float32BufferAttribute(bulb, 3));
      const pointsMaterial = new THREE.ShaderMaterial({
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms,
        vertexShader: `
          attribute vec3 aColor; attribute vec3 aRandom; attribute vec3 aBulb;
          uniform float uBulb, uExplode, uTime, uPixel, uHover, uRadius, uRippleT, uLight;
          uniform vec3 uAccent;
          uniform vec2 uPointer, uRipple;
          varying vec3 vColor; varying float vAlpha, vShard, vAngle;
          void main(){
            vec3 p = position;
            // shards: lift off the glass near the cursor and orbit it
            vec2 d = p.xy - uPointer;
            float dist = length(d);
            float near = uHover * (1.0 - smoothstep(uRadius * .35, uRadius, dist));
            float a = near * (aRandom.z - .5) * 1.1 + near * sin(uTime * (.8 + aRandom.x) + aRandom.y * 6.283) * .18;
            float cs = cos(a), sn = sin(a);
            vec2 swirl = mat2(cs, -sn, sn, cs) * d;
            p.xy = uPointer + swirl * (1.0 + near * (.06 + aRandom.x * .12));
            p.z += near * (.05 + aRandom.y * .18);
            // ripple ring from a click or tap
            vec2 rv = p.xy - uRipple;
            float rd = length(rv);
            float ring = exp(-pow((rd - uRippleT * 2.2) / .16, 2.0)) * exp(-uRippleT * 1.6);
            p.xy += normalize(rv + 1e-4) * ring * (.15 + aRandom.x * .25);
            p.z += ring * (.3 + aRandom.y * .5);
            // morph into the lightbulb, each particle on its own schedule
            float bt = clamp(uBulb * 1.4 - aRandom.x * .4, 0., 1.); bt = bt * bt * (3. - 2. * bt);
            p = mix(p, aBulb * .78 + vec3(0., .12, 0.) + vec3(sin(uTime * .9 + aRandom.y * 20.), cos(uTime * .8 + aRandom.z * 20.), 0.) * .015, bt);
            // scroll burst
            // scroll burst: each particle leaves the spot on the glass it came from, straight out from the core, easing out
            float q = clamp((uExplode - .24 - aRandom.x * .1) / .66, 0., 1.);
            float qe = 1.0 - pow(1.0 - q, 3.0);
            vec3 dir = normalize(vec3(p.xy - vec2(.05, .15), .55) + (aRandom - .5) * .5);
            p += dir * qe * (.7 + aRandom.y * 2.4);
            p += vec3(sin(uTime * .7 + aRandom.y * 30.), cos(uTime * .6 + aRandom.z * 30.), 0.) * qe * .06;
            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            gl_Position = projectionMatrix * mv;
            float shard = clamp(max(max(near, ring * 1.4), max(smoothstep(.1, .6, q) * step(.55, aRandom.z) * .8, uBulb * .8)), 0., 1.);
            vShard = shard;
            gl_PointSize = (1.6 + aRandom.x * 2.2) * (1.0 + max(max(near, ring), qe * .7)) * uPixel * 4.6 / max(.5, -mv.z);
            float inkLum = dot(aColor, vec3(.299, .587, .114));
            vec3 onLight = mix(mix(vec3(.55, .56, .62), vec3(.12, .13, .17), smoothstep(.1, .7, inkLum)), uAccent, shard * .75);
            vColor = mix(mix(aColor * 1.3, mix(uAccent, vec3(1.), .25) + aColor * .6, shard * .55), onLight, uLight);
            // particles light up exactly as the glass cracks, so the brain turns into them, then thin out as they travel
            float burstA = smoothstep(.2, .34, uExplode) * (1.0 - q * q) * 1.4;
            vAlpha = max(max(burstA, smoothstep(.02, .25, uBulb) * .38), max(near * .8, ring * 1.2)) * (.5 + aRandom.y * .4);
            vAngle = aRandom.z * 6.283 + uTime * (aRandom.x - .5) * 2.0 * (.3 + shard);
          }`,
        fragmentShader: `
          precision highp float;
          varying vec3 vColor; varying float vAlpha, vShard, vAngle;
          float seg(vec2 p, vec2 a, vec2 b){ vec2 q = p - a, d = b - a; return length(q - d * clamp(dot(q, d) / dot(d, d), 0., 1.)); }
          void main(){
            vec2 p = gl_PointCoord - .5;
            float c = cos(vAngle), s = sin(vAngle); p = mat2(c, -s, s, c) * p;
            float dot1 = smoothstep(.5, .1, length(p));
            vec2 A = vec2(0., .42), B = vec2(-.37, -.22), C = vec2(.37, -.22);
            float edge = min(seg(p, A, B), min(seg(p, B, C), seg(p, C, A)));
            float tri = 1.0 - smoothstep(.02, .09, edge);
            float a = mix(dot1, tri, smoothstep(.15, .5, vShard)) * vAlpha;
            if (a < .01) discard;
            gl_FragColor = vec4(vColor, a);
          }`,
      });
      const points = new THREE.Points(pointsGeometry, pointsMaterial);
      brain.add(points);

      const dustGeometry = new THREE.BufferGeometry();
      const dustPositions = new Float32Array(260 * 3);
      for (let i = 0; i < dustPositions.length; i += 3) { dustPositions[i] = (rand()-.5)*11; dustPositions[i+1] = (rand()-.5)*8; dustPositions[i+2] = (rand()-.5)*9; }
      dustGeometry.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
      const dustMaterial = new THREE.PointsMaterial({ color: 0xd9a08a, size: .009, transparent: true, opacity: .32, depthWrite: false });
      const dust = new THREE.Points(dustGeometry, dustMaterial);
      scene.add(dust);
      const shards = new THREE.Group(); scene.add(shards);
      const shardMats: InstanceType<typeof THREE.LineBasicMaterial>[] = [], shardGeos: InstanceType<typeof THREE.BufferGeometry>[] = [];
      [0xf4b942, 0xff6a4d, 0x8c84e8, 0xf4f1ff, 0x3fae9b].forEach((color, ci) => {
        for (let i = 0; i < (mobile ? 3 : 7); i++) {
          const g = new THREE.EdgesGeometry(new THREE.TetrahedronGeometry(.05 + Math.pow(rand(), 3) * .28));
          const m = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0, blending: THREE.AdditiveBlending });
          const mesh = new THREE.LineSegments(g, m);
          mesh.position.set((rand() - .5) * 11, (rand() - .5) * 6.5, -rand() * 6 + 1.5);
          mesh.userData = { sx: rand() - .5, sy: rand() - .5, bob: rand() * 6.283, base: .25 + ci * .05 };
          shardGeos.push(g); shardMats.push(m); shards.add(mesh);
        }
      });

      let active = true, frame = 0, last = 0, time = 0, px = 0, py = 0, tx = 0, ty = 0, hoverZoom = 0;
      let pointerInside = false, dragging = false, dragX = 0, dragY = 0, spinY = 0, spinX = 0, velY = 0, velX = 0;
      // choreography state, eased every frame
      const cur = { x: 2, y: .485, z: 7.05, explode: 0, opacity: 1, scale: 1, tilt: 0, bulb: 0, shards: 0 };
      const goal = { ...cur };
      const motion = matchMedia("(prefers-reduced-motion: reduce)");
      let reduced = motion.matches;
      const resize = () => { const w = container.clientWidth, h = container.clientHeight; renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); };
      const observer = new ResizeObserver(resize); observer.observe(container); resize();
      const visibility = new IntersectionObserver(([entry]) => { active = background || entry.isIntersecting; }); visibility.observe(container);

      // don't steal clicks, drags or text selection from real content
      const blocked = (t: EventTarget | null) => !!(t as Element | null)?.closest?.("a,button,input,textarea,select,label,summary,[role=tab],[role=button],[role=option],.demo,.contact-card,.pricing-grid,.wd-card,.dock,p,h1,h2,h3,h4,li");

      const toNdc = (e: PointerEvent) => {
        const r = container.getBoundingClientRect();
        return [(e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height * 2 - 1)];
      };
      const onMove = (e: PointerEvent) => {
        [tx, ty] = toNdc(e);
        pointerInside = e.pointerType !== "touch";
        if (dragging) {
          const dx = e.clientX - dragX, dy = e.clientY - dragY; dragX = e.clientX; dragY = e.clientY;
          velY = dx * .0045; velX = dy * .0035;
          spinY += velY; spinX += velX;
        }
      };
      const hitsBrain = () => { ndc.set(tx, ty); raycaster.setFromCamera(ndc, camera); return raycaster.intersectObject(plane)[0]; };
      const onDown = (e: PointerEvent) => {
        if (cur.opacity < .4 || (background && blocked(e.target))) return;
        [tx, ty] = toNdc(e);
        const hit = hitsBrain();
        if (!hit) return;
        const lp = brain.worldToLocal(hit.point.clone());
        uniforms.uRipple.value.set(lp.x, lp.y); uniforms.uRippleT.value = 0;
        dragging = true; dragX = e.clientX; dragY = e.clientY; velX = velY = 0;
        if (e.pointerType !== "touch") e.preventDefault();
      };
      const onUp = () => { dragging = false; };
      const onLeave = () => { pointerInside = false; dragging = false; };
      const downTarget: EventTarget = background ? window : container;
      const moveTarget: EventTarget = background ? window : container;
      const leaveTarget: EventTarget = background ? document.documentElement : container;
      moveTarget.addEventListener("pointermove", onMove as EventListener);
      downTarget.addEventListener("pointerdown", onDown as EventListener);
      window.addEventListener("pointerup", onUp);
      leaveTarget.addEventListener("pointerleave", onLeave);
      const motionChange = () => { reduced = motion.matches; };
      motion.addEventListener("change", motionChange);

      // the look that follows from how far the burst has got: swell, fade-out at the end, background shards
      let burstMode = false;
      const CRACKED = 320;
      const burstLook = (b: number) => {
        const swell = Math.min(1, b / .25), gone = Math.max(0, (b - .85) / .15);
        return { opacity: 1 - gone * gone * (3 - 2 * gone), scale: 1 + .1 * swell * swell * (3 - 2 * swell) + .06 * b, shards: .6 * (1 - b) };
      };
      // where the brain should be for the current scroll position
      const plan = () => {
        const vh = innerHeight, mobileView = innerWidth < 900;
        if (!background) {
          const hero = container.closest(".hero");
          const r = hero?.getBoundingClientRect();
          const pr = r ? Math.max(0, Math.min(1, -r.top / (r.height * .65))) : 0;
          Object.assign(goal, { x: 0, y: 0, z: 6.5 - pr * 2.3, explode: pr * .55, opacity: 1, scale: 1, tilt: 0, bulb: 0, shards: .6 });
          return;
        }
        const heroEl = document.querySelector(".hero");
        const hr = heroEl?.getBoundingClientRect();
        const heroVis = hr ? Math.max(0, Math.min(1, hr.bottom / Math.max(hr.height, 1))) : 0;
        // one clean exit: as the hero leaves, the brain loosens into an even veil of shards and is gone
        // before the next section starts, so nothing half-dissolved sits behind the content
        const out = 1 - heroVis;                                   // 0 in the hero, 1 once it has scrolled away
        const fade = Math.max(0, Math.min(1, (heroVis - .3) / .5));
        const e = fade * fade * (3 - 2 * fade);
        // Desktop: scroll scrubs one continuous burst, from the very first bit of scroll.
        // 0-.25 the brain swells and its fibres flare, .25-.6 the glass cracks apart into its own particles,
        // which fly outward and thin out.
        // the swell and crack start with the first bit of scroll and are front-loaded: visible within ~20px, cracking by ~50px, fully apart by 320px; the particles then drift and fade past the end of the hero
        const flightEnd = Math.max(CRACKED + 600, (hr ? hr.bottom + scrollY : 900) + 400);
        const b = scrollY < CRACKED
          ? Math.sqrt(Math.max(0, scrollY / CRACKED)) * .6
          : .6 + .4 * Math.min(1, (scrollY - CRACKED) / (flightEnd - CRACKED));
        burstMode = !mobileView;
        if (!mobileView) {
          Object.assign(goal, {
            x: 2, z: 7.05,
            // x=2 clears the hero copy, which ends around 784px of 1440; y=.485 centres the brain
            // on the eyebrow-to-intro block, whose midpoint measures 365px against a 450px
            // viewport centre. Drifts up at half the scroll speed so the burst stays on screen.
            y: .485 + (hr ? Math.min(-hr.top, 0) + Math.max(0, -hr.top) * .5 : 0) / innerHeight * 2 * 7.05 * Math.tan(20 * Math.PI / 180),
            explode: b, ...burstLook(b), tilt: 0, bulb: 0,
          });
          return;
        }
        Object.assign(goal, {
          x: mobileView ? 0 : 2, z: mobileView ? 8.25 : 7.05,
          // scroll up with the hero instead of hanging fixed over the next section
          y: (mobileView ? .2 : .485) + (hr ? -hr.top : 0) / innerHeight * 2 * (mobileView ? 8.25 : 7.05) * Math.tan(20 * Math.PI / 180),
          explode: Math.min(.3, out * .45), opacity: e, scale: 1 + out * .08, tilt: 0, bulb: 0, shards: e * .6,
        });
      };
      window.addEventListener("scroll", plan, { passive: true });
      window.addEventListener("resize", plan);
      plan();

      // watch the page behind the brain: a light palette flips the whole rendering to ink
      const readPage = () => {
        const styles = getComputedStyle(document.documentElement);
        const bg = getComputedStyle(document.body).backgroundColor.match(/[\d.]+/g) || ["0", "0", "0"];
        const [br, bgc, bb] = bg.slice(0, 3).map(Number).map(v => v / 255);
        const light = .2126 * br + .7152 * bgc + .0722 * bb > .45 ? 1 : 0;

        // a palette can hand the brain its own accent, so our coral can stay on the artwork
        const accent = (styles.getPropertyValue("--brain-accent") || styles.getPropertyValue("--primary")).trim();
        if (/^#[0-9a-fA-F]{6}$/.test(accent)) {
          const c = new THREE.Color(accent), hsl = { h: 0, s: 0, l: 0 };
          c.getHSL(hsl);
          // lit fibres need to carry against what is behind them: vivid on a dark page,
          // a touch deeper and calmer on a light one so they never glare
          c.setHSL(hsl.h, light ? Math.min(hsl.s, .58) : Math.max(hsl.s, .62), light ? Math.min(Math.max(hsl.l, .46), .58) : Math.max(hsl.l, .5));
          uniforms.uAccent.value.copy(c);
        }

        if (uniforms.uLight.value === light) return;   // the rest only changes when the page flips
        uniforms.uLight.value = light;
        pointsMaterial.blending = light ? THREE.NormalBlending : THREE.AdditiveBlending;
        pointsMaterial.needsUpdate = true;
        dustMaterial.color.set(light ? 0x8a7d78 : 0xd9a08a);
        dustMaterial.opacity = light ? .16 : .32;
        shardMats.forEach(m => { m.blending = light ? THREE.NormalBlending : THREE.AdditiveBlending; m.needsUpdate = true; });
      };
      readPage();
      const themeWatch = new MutationObserver(() => setTimeout(readPage, 60));
      themeWatch.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

      const contextLost = (event: Event) => { event.preventDefault(); setFailed(true); };
      renderer.domElement.addEventListener("webglcontextlost", contextLost);

      const raycaster = new THREE.Raycaster();
      const ndc = new THREE.Vector2();
      let hoverAmt = 0;

      const tick = (now: number) => {
        if (stopped) return;
        frame = requestAnimationFrame(tick);
        const dt = Math.min((now - last) / 1000 || 0, .04); last = now;
        if (!active || document.hidden || (background && cur.opacity < .005 && goal.opacity < .005)) return;
        if (!reduced) time += dt;
        const ease = 1 - Math.exp(-dt * 4);
        px += (tx - px) * ease; py += (ty - py) * ease;

        const k = reduced ? 1 : 1 - Math.exp(-dt * 2.4);
        // on desktop the burst is scrubbed by scroll, so it follows the scroll closely in both directions
        const kScroll = reduced ? 1 : 1 - Math.exp(-dt * 16);
        const explodeWas = cur.explode;
        (Object.keys(cur) as (keyof typeof cur)[]).forEach(key => { cur[key] += (goal[key] - cur[key]) * (background && key !== "x" && key !== "z" ? kScroll : k); });
        if (burstMode) {
          // A fast flick must not skip the show: going forward the burst plays at most this fast (whole thing ~1.1s),
          // then keeps playing on its own behind the page. Scrolling back up still reassembles at scroll speed.
          cur.explode = goal.explode > explodeWas && !reduced ? Math.min(goal.explode, explodeWas + dt * .9) : cur.explode;
          Object.assign(cur, burstLook(cur.explode));
        }
        cur.y = goal.y;   // position tracks the page exactly; only the look eases
        if (background) {
          container.style.opacity = cur.opacity.toFixed(3); container.style.visibility = cur.opacity < .01 ? "hidden" : "visible";
          // the brain and its burst never cross the industry strip: cut the layer off at the strip's top edge
          const strip = burstMode ? document.querySelector(".industry-strip") : null;
          const cut = strip ? String(Math.round(Math.max(0, Math.min(innerHeight, innerHeight - strip.getBoundingClientRect().top)))) : "0";
          if (container.dataset.cut !== cut) { container.dataset.cut = cut; container.style.clipPath = cut === "0" ? "" : `inset(0 0 ${cut}px 0)`; }
        }

        // drag: follow the hand, then drift and spring back to rest
        if (!dragging) { spinY += velY; spinX += velX; velY *= .93; velX *= .93; spinY *= .965; spinX *= .95; }
        // the brain is the picture given volume, so keep turns to the range where it still reads as a solid
        spinY = Math.max(-.42, Math.min(.42, spinY)); spinX = Math.max(-.26, Math.min(.26, spinX));

        brain.position.set(cur.x, cur.y + (reduced ? 0 : Math.sin(time * .6) * .03), 0);
        brain.scale.setScalar(cur.scale);
        brain.rotation.y = reduced ? 0 : spinY + px * .14 + Math.sin(time * .25) * .06;
        brain.rotation.x = reduced ? 0 : spinX - py * .15 + Math.sin(time * .2) * .03;
        brain.rotation.z = reduced ? 0 : cur.tilt;
        dust.rotation.y = reduced ? 0 : time * .013;
        dustMaterial.opacity = .32 * (1 - Math.min(1, cur.explode * 3));
        shards.children.forEach(o => {
          const u = o.userData; o.rotation.x += u.sx * dt * (reduced ? 0 : .8); o.rotation.y += u.sy * dt * (reduced ? 0 : .8);
          o.position.y += reduced ? 0 : Math.sin(time * .4 + u.bob) * .0012;
          ((o as InstanceType<typeof THREE.LineSegments>).material as InstanceType<typeof THREE.LineBasicMaterial>).opacity = cur.shards * u.base;
        });
        shards.rotation.y = px * .06; shards.rotation.x = -py * .04;

        // cursor over the brain: shards follow it in the brain's own space
        const hit = !reduced && pointerInside && cur.opacity > .4 && cur.explode < .15 ? hitsBrain() : undefined;
        if (hit) {
          const lp = brain.worldToLocal(hit.point.clone());
          const u = uniforms.uPointer.value;
          if (u.x > 50) u.set(lp.x, lp.y); else u.lerp(new THREE.Vector2(lp.x, lp.y), 1 - Math.exp(-dt * 14));
        }
        hoverAmt += ((hit ? 1 : 0) - hoverAmt) * (1 - Math.exp(-dt * (hit ? 6 : 3)));
        uniforms.uHover.value = hoverAmt;
        hoverZoom += ((hit ? 1 : 0) * .12 - hoverZoom) * (1 - Math.exp(-dt * 1.4));
        uniforms.uRippleT.value += dt;
        uniforms.uExplode.value = reduced ? 0 : cur.explode;
        uniforms.uBulb.value = reduced ? 0 : cur.bulb;
        uniforms.uTime.value = time;
        camera.position.z = cur.z - hoverZoom;
        renderer.render(scene, camera);
        if (background) {
          const rect = container.getBoundingClientRect();
          toPage(STEM_END, stemOut.end, rect); toPage(STEM_TOP, stemOut.top, rect);
          (window as unknown as { __gmStem?: typeof stemOut }).__gmStem = stemOut;
          if (!stemOut.ready) { stemOut.ready = true; dispatchEvent(new Event("gm-stem-ready")); }
        }
      };
      frame = requestAnimationFrame(tick);
      setReady(true);
      cleanup = () => {
        cancelAnimationFrame(frame);
        window.removeEventListener("scroll", plan); window.removeEventListener("resize", plan);
        observer.disconnect(); visibility.disconnect(); themeWatch.disconnect();
        motion.removeEventListener("change", motionChange);
        moveTarget.removeEventListener("pointermove", onMove as EventListener);
        downTarget.removeEventListener("pointerdown", onDown as EventListener);
        window.removeEventListener("pointerup", onUp);
        leaveTarget.removeEventListener("pointerleave", onLeave);
        renderer.domElement.removeEventListener("webglcontextlost", contextLost);
        planeGeometry.dispose(); planeMaterial.dispose(); pointsGeometry.dispose(); pointsMaterial.dispose();
        dustGeometry.dispose(); dustMaterial.dispose(); shardGeos.forEach(g => g.dispose()); shardMats.forEach(m => m.dispose()); texture.dispose(); renderer.dispose();
        renderer.domElement.remove();
        delete (window as unknown as { __gmStem?: unknown }).__gmStem;
      };
    }
    setup().catch(() => { if (!stopped) setFailed(true); });
    return () => { stopped = true; cleanup(); };
  }, [background]);

  return <div className={"hero-art particle-brain " + (ready && !failed ? "is-ready" : "")}>
    {(!ready || failed) && <img className="brain brain-fallback" src="/brain.png" alt="GrayMatter neural brain"/>}
    <div ref={host} className="brain-canvas" role="img" aria-label="Glass brain with signals of light moving through its neural fibres"/>
  </div>;
}
