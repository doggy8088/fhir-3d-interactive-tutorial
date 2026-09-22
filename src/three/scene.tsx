import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { OrbitControls, Line, useCursor } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { CORE_POS, NODE_POS, RESOURCES, type ResourceData } from "../data/fhir";

export type Packet = { id: number; from: number; t: number; kind: "req" | "res" };
export type FxState = { packets: Packet[] };

type SceneProps = {
  selected: string | null;
  onSelect: (id: string | null) => void;
  fx: React.MutableRefObject<FxState>;
  onArrive: (id: number) => void;
  controlsRef: React.MutableRefObject<any>;
};

/* ---------------- label textures (canvas → sprite) ---------------- */

function makeLabelTexture(
  main: string,
  sub: string | null,
  color: string
): { tex: THREE.CanvasTexture; aspect: number } {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  const mainFont = '700 58px "Chakra Petch", "JetBrains Mono", Menlo, monospace';
  const subFont = '500 30px "Noto Sans TC", "PingFang TC", "Microsoft JhengHei", sans-serif';

  ctx.font = mainFont;
  const mainW = ctx.measureText(main).width;
  let subW = 0;
  if (sub) {
    ctx.font = subFont;
    subW = ctx.measureText(sub).width;
  }
  const cw = Math.ceil(Math.max(mainW, subW) + 96);
  const ch = sub ? 138 : 92;
  canvas.width = cw;
  canvas.height = ch;

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = color;
  ctx.shadowBlur = 26;
  ctx.fillStyle = color;
  ctx.font = mainFont;
  ctx.fillText(main, cw / 2, 46);
  if (sub) {
    ctx.shadowBlur = 8;
    ctx.fillStyle = "rgba(213, 238, 248, 0.82)";
    ctx.font = subFont;
    ctx.fillText(sub, cw / 2, 102);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return { tex, aspect: cw / ch };
}

/* ---------------- resource node ---------------- */

function ResourceNode({
  res,
  index,
  selected,
  onSelect,
}: {
  res: ResourceData;
  index: number;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  const group = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  const mat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#0a1522",
        emissive: new THREE.Color(res.color),
        emissiveIntensity: 0.6,
        roughness: 0.28,
        metalness: 0.4,
      }),
    [res.color]
  );
  const ringMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(res.color),
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        toneMapped: false,
      }),
    [res.color]
  );
  const label = useMemo(
    () => makeLabelTexture(res.name, res.purpose, res.color),
    [res.name, res.purpose, res.color]
  );

  useEffect(
    () => () => {
      mat.dispose();
      ringMat.dispose();
      label.tex.dispose();
    },
    [mat, ringMat, label]
  );

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const g = group.current;
    if (!g) return;
    const targetScale = selected ? 1.24 : hovered ? 1.1 : 1;
    const s = THREE.MathUtils.damp(g.scale.x, targetScale, 8, delta);
    g.scale.setScalar(s);
    const targetGlow = selected ? 1.5 : hovered ? 1.0 : 0.55 + Math.sin(t * 2 + index) * 0.12;
    mat.emissiveIntensity = THREE.MathUtils.damp(mat.emissiveIntensity, targetGlow, 6, delta);
    if (ring.current) {
      ring.current.rotation.z += delta * (selected ? 1.4 : 0.35);
      const targetOp = selected ? 0.9 : hovered ? 0.45 : 0;
      ringMat.opacity = THREE.MathUtils.damp(ringMat.opacity, targetOp, 7, delta);
      ring.current.visible = ringMat.opacity > 0.02;
    }
  });

  const worldPos = NODE_POS[index];
  return (
    <group position={worldPos}>
      <group
        ref={group}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(res.id);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
      >
        <mesh material={mat} rotation={res.shape === "pill" ? [0, 0, 0.85] : [0, 0, 0]}>
          {res.shape === "capsule" && <capsuleGeometry args={[0.27, 0.5, 8, 18]} />}
          {res.shape === "octa" && <octahedronGeometry args={[0.52, 0]} />}
          {res.shape === "torus" && <torusGeometry args={[0.4, 0.14, 20, 44]} />}
          {res.shape === "pill" && <capsuleGeometry args={[0.19, 0.34, 8, 16]} />}
          {res.shape === "doc" && <boxGeometry args={[0.66, 0.07, 0.48]} />}
        </mesh>
        {res.shape === "doc" && (
          <>
            <mesh material={mat} position={[0.05, 0.13, 0.03]} rotation={[0, 0.3, 0]}>
              <boxGeometry args={[0.62, 0.07, 0.45]} />
            </mesh>
            <mesh material={mat} position={[-0.05, 0.27, -0.03]} rotation={[0, -0.25, 0]}>
              <boxGeometry args={[0.58, 0.07, 0.42]} />
            </mesh>
          </>
        )}
        <mesh ref={ring} rotation={[Math.PI / 2.2, 0, 0]} material={ringMat}>
          <torusGeometry args={[0.82, 0.014, 8, 60]} />
        </mesh>
        <sprite
          position={[0, 1.42, 0]}
          scale={[0.52 * label.aspect, 0.52, 1]}
          raycast={() => null}
        >
          <spriteMaterial map={label.tex} transparent depthWrite={false} />
        </sprite>
      </group>
    </group>
  );
}

/* ---------------- central FHIR core ---------------- */

function FhirCore() {
  const inner = useRef<THREE.Mesh>(null);
  const wire = useRef<THREE.Mesh>(null);
  const rings = useRef<THREE.Mesh[]>([]);
  const light = useRef<THREE.PointLight>(null);
  const label = useMemo(() => makeLabelTexture("FHIR API CORE", "REST · JSON · XML · Bundle", "#67e8f9"), []);
  useEffect(() => () => label.tex.dispose(), [label]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (inner.current) {
      inner.current.rotation.y += delta * 0.4;
      inner.current.rotation.x += delta * 0.12;
    }
    if (wire.current) {
      wire.current.rotation.y -= delta * 0.18;
      wire.current.rotation.z += delta * 0.07;
    }
    const r = rings.current;
    if (r[0]) r[0].rotation.z += delta * 0.5;
    if (r[1]) r[1].rotation.x += delta * 0.35;
    if (r[2]) r[2].rotation.y += delta * 0.28;
    if (light.current) light.current.intensity = 5.5 + Math.sin(t * 2.1) * 1.6;
  });

  return (
    <group position={CORE_POS}>
      <pointLight ref={light} color="#22d3ee" intensity={5.5} distance={14} decay={2} />
      <mesh ref={inner}>
        <icosahedronGeometry args={[0.62, 1]} />
        <meshStandardMaterial
          color="#06222b"
          emissive="#22d3ee"
          emissiveIntensity={1.35}
          roughness={0.2}
          metalness={0.6}
          flatShading
        />
      </mesh>
      <mesh ref={wire}>
        <icosahedronGeometry args={[1.02, 1]} />
        <meshBasicMaterial wireframe color="#22d3ee" transparent opacity={0.14} />
      </mesh>
      <mesh ref={(m) => void (m && (rings.current[0] = m))} rotation={[1.2, 0, 0]}>
        <torusGeometry args={[1.38, 0.012, 8, 80]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.5} toneMapped={false} />
      </mesh>
      <mesh ref={(m) => void (m && (rings.current[1] = m))} rotation={[0.4, 0.7, 0]}>
        <torusGeometry args={[1.72, 0.01, 8, 80]} />
        <meshBasicMaterial color="#f5a524" transparent opacity={0.4} toneMapped={false} />
      </mesh>
      <mesh ref={(m) => void (m && (rings.current[2] = m))} rotation={[-0.8, 0.3, 0.5]}>
        <torusGeometry args={[2.05, 0.008, 8, 80]} />
        <meshBasicMaterial color="#ff6b6b" transparent opacity={0.3} toneMapped={false} />
      </mesh>
      <sprite position={[0, -1.62, 0]} scale={[0.5 * label.aspect, 0.5, 1]} raycast={() => null}>
        <spriteMaterial map={label.tex} transparent depthWrite={false} />
      </sprite>
    </group>
  );
}

/* ---------------- platform ---------------- */

function Platform() {
  const glowTex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const ctx = c.getContext("2d")!;
    const g = ctx.createRadialGradient(128, 128, 10, 128, 128, 128);
    g.addColorStop(0, "rgba(34, 211, 238, 0.55)");
    g.addColorStop(0.5, "rgba(34, 211, 238, 0.12)");
    g.addColorStop(1, "rgba(34, 211, 238, 0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);
  useEffect(() => () => glowTex.dispose(), [glowTex]);

  return (
    <group position={[0, -1.62, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[5.6, 72]} />
        <meshStandardMaterial color="#060d16" roughness={0.85} metalness={0.45} />
      </mesh>
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10.5, 10.5]} />
        <meshBasicMaterial map={glowTex} transparent opacity={0.5} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <torusGeometry args={[5.55, 0.02, 8, 120]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.55} toneMapped={false} />
      </mesh>
      {[3.5, 2.3].map((r) => (
        <mesh key={r} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.008, 0]}>
          <torusGeometry args={[r, 0.007, 8, 100]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.16} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

/* ---------------- particles ---------------- */

function ParticleCloud({
  count,
  inner,
  outer,
  color,
  size,
  opacity,
  speed,
}: {
  count: number;
  inner: number;
  outer: number;
  color: string;
  size: number;
  opacity: number;
  speed: number;
}) {
  const ref = useRef<THREE.Points>(null);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const v = new THREE.Vector3();
    for (let i = 0; i < count; i++) {
      v.randomDirection().multiplyScalar(inner + Math.random() * (outer - inner));
      pos[i * 3] = v.x;
      pos[i * 3 + 1] = v.y * 0.7;
      pos[i * 3 + 2] = v.z;
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, [count, inner, outer]);
  useEffect(() => () => geo.dispose(), [geo]);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * speed;
  });

  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial
        size={size}
        color={color}
        transparent
        opacity={opacity}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ---------------- packets (request / response) ---------------- */

function PacketLayer({ fx, onArrive }: { fx: React.MutableRefObject<FxState>; onArrive: (id: number) => void }) {
  const pool = useRef<(THREE.Mesh | null)[]>([]);
  const onArriveRef = useRef(onArrive);
  useEffect(() => {
    onArriveRef.current = onArrive;
  }, [onArrive]);

  const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  useFrame((_, delta) => {
    const fxs = fx.current;
    if (fxs.packets.length) {
      for (const p of fxs.packets) p.t += delta / 0.85;
      const done = fxs.packets.filter((p) => p.t >= 1);
      if (done.length) {
        fxs.packets = fxs.packets.filter((p) => p.t < 1);
        for (const d of done) {
          if (d.kind === "req") fxs.packets.push({ id: d.id, from: d.from, t: 0, kind: "res" });
          else onArriveRef.current(d.id);
        }
      }
    }
    pool.current.forEach((m, i) => {
      if (!m) return;
      const p = fxs.packets[i];
      if (!p) {
        m.visible = false;
        return;
      }
      m.visible = true;
      const a = p.kind === "req" ? NODE_POS[p.from] : CORE_POS;
      const b = p.kind === "req" ? CORE_POS : NODE_POS[p.from];
      const t = ease(Math.min(1, Math.max(0, p.t)));
      m.position.set(
        a[0] + (b[0] - a[0]) * t,
        a[1] + (b[1] - a[1]) * t + Math.sin(t * Math.PI) * 0.55,
        a[2] + (b[2] - a[2]) * t
      );
      m.scale.setScalar(0.65 + Math.sin(t * Math.PI) * 0.55);
      const mat = m.material as THREE.MeshBasicMaterial;
      mat.color.set(p.kind === "req" ? "#7df9ff" : RESOURCES[p.from].color);
      mat.opacity = 0.35 + Math.sin(t * Math.PI) * 0.65;
    });
  });

  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh
          key={i}
          visible={false}
          ref={(m) => {
            pool.current[i] = m;
          }}
        >
          <sphereGeometry args={[0.09, 16, 16]} />
          <meshBasicMaterial transparent toneMapped={false} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
    </>
  );
}

/* ---------------- data lines + motes ---------------- */

function DataLines({ selected }: { selected: string | null }) {
  const hiRefs = useRef<(any)[]>([]);
  const motes = useRef<(THREE.Mesh | null)[]>([]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    RESOURCES.forEach((r, i) => {
      const l = hiRefs.current[i];
      if (l?.material) {
        const target = selected === r.id ? 0.85 : 0;
        l.material.opacity = THREE.MathUtils.damp(l.material.opacity, target, 7, delta);
      }
      const m = motes.current[i];
      if (m) {
        const phase = (t * 0.16 + i / RESOURCES.length) % 1;
        const e = easeInOut(phase);
        const a = NODE_POS[i];
        m.position.set(
          a[0] + (CORE_POS[0] - a[0]) * e,
          a[1] + (CORE_POS[1] - a[1]) * e + Math.sin(e * Math.PI) * 0.3,
          a[2] + (CORE_POS[2] - a[2]) * e
        );
        (m.material as THREE.MeshBasicMaterial).opacity = 0.15 + Math.sin(phase * Math.PI) * 0.75;
      }
    });
  });

  return (
    <>
      {RESOURCES.map((r, i) => (
        <group key={r.id}>
          <Line
            points={[NODE_POS[i], CORE_POS]}
            color="#3b5b70"
            lineWidth={1}
            transparent
            opacity={0.4}
          />
          <Line
            ref={(l: any) => {
              if (l) hiRefs.current[i] = l;
            }}
            points={[NODE_POS[i], CORE_POS]}
            color={r.color}
            lineWidth={2.5}
            transparent
            opacity={0}
          />
          <mesh
            ref={(m) => {
              motes.current[i] = m;
            }}
          >
            <sphereGeometry args={[0.05, 10, 10]} />
            <meshBasicMaterial color={r.color} transparent toneMapped={false} blending={THREE.AdditiveBlending} />
          </mesh>
        </group>
      ))}
    </>
  );
}

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

/* ---------------- scene root ---------------- */

export default function FhirScene({ selected, onSelect, fx, onArrive, controlsRef }: SceneProps) {
  const root = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (root.current) {
      root.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.07) * 0.05;
      root.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.04;
    }
  });

  return (
    <>
      <color attach="background" args={["#04070d"]} />
      <fog attach="fog" args={["#04070d", 11, 27]} />

      <ambientLight intensity={0.4} color="#8fd8ff" />
      <directionalLight position={[6, 9, 4]} intensity={1.1} color="#eaf6ff" />
      <pointLight position={[-7, -2, -5]} intensity={12} distance={20} color="#f5a524" decay={2} />
      <pointLight position={[7, 3, -6]} intensity={7} distance={18} color="#ff6b6b" decay={2} />

      <group ref={root}>
        <FhirCore />
        <DataLines selected={selected} />
        {RESOURCES.map((r, i) => (
          <ResourceNode key={r.id} res={r} index={i} selected={selected === r.id} onSelect={onSelect} />
        ))}
        <PacketLayer fx={fx} onArrive={onArrive} />
        <Platform />
      </group>

      <ParticleCloud count={750} inner={7} outer={16} color="#3aa9c9" size={0.05} opacity={0.5} speed={0.012} />
      <ParticleCloud count={280} inner={5.5} outer={13} color="#f5a524" size={0.07} opacity={0.3} speed={-0.02} />

      <OrbitControls
        ref={controlsRef}
        makeDefault
        target={[0, 0.4, 0]}
        enablePan={false}
        minDistance={5.5}
        maxDistance={15}
        minPolarAngle={0.35}
        maxPolarAngle={1.5}
        autoRotate={!selected}
        autoRotateSpeed={0.55}
        enableDamping
        dampingFactor={0.08}
      />

      <EffectComposer>
        <Bloom mipmapBlur intensity={0.9} luminanceThreshold={0.22} luminanceSmoothing={0.2} radius={0.75} />
        <Vignette eskil={false} offset={0.22} darkness={0.82} />
      </EffectComposer>
    </>
  );
}
