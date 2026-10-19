import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { Color, DynamicDrawUsage, Vector3 } from 'three';
import type { Group, InstancedMesh } from 'three';
import { cssColor } from './palette';
import { ChromeFallback } from './ChromeFallback';
import { createMirrorTiles, DESKTOP_TILE_ROWS, MOBILE_TILE_ROWS } from './mirrorTiles';
import { createTileColors, lightPositions, lightTokens, RaveAnimation, tintTokens } from './raveEffects';

export interface SceneProps { mobile: boolean; reducedMotion: boolean; active: boolean }
interface MirrorColors { bg: string; silver: Color; white: Color; accents: Color[]; lights: string[] }

function RaveBall({ mobile, reducedMotion, active, colors }: SceneProps & { colors: MirrorColors }) {
  const mirrors = useRef<InstancedMesh>(null);
  const rotating = useRef<Group>(null);
  const lights = useRef<Group>(null);
  const normal = useMemo(() => new Vector3(), []);
  const invalidate = useThree(state => state.invalidate);
  const tiles = useMemo(() => createMirrorTiles(mobile ? MOBILE_TILE_ROWS : DESKTOP_TILE_ROWS), [mobile]);
  const baseColors = useMemo(() => createTileColors(tiles.length, colors.silver, colors.accents), [tiles, colors]);
  const animation = useMemo(() => new RaveAnimation(baseColors), [baseColors]);
  const positions = useMemo(() => lightPositions(mobile), [mobile]);

  useLayoutEffect(() => {
    const mesh = mirrors.current;
    if (!mesh) return;
    tiles.forEach(({ matrix }, index) => {
      mesh.setMatrixAt(index, matrix);
      mesh.setColorAt(index, baseColors[index]);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.instanceColor!.setUsage(DynamicDrawUsage);
    mesh.instanceColor!.needsUpdate = true;
    mesh.computeBoundingSphere();
    invalidate();
  }, [tiles, baseColors, invalidate]);

  useLayoutEffect(() => {
    const mesh = mirrors.current;
    if (!mesh || (active && !reducedMotion)) return;
    // Clear a glint immediately before demand rendering freezes the scene.
    if (animation.update(0, false, (index, color) => mesh.setColorAt(index, color))) {
      mesh.instanceColor!.needsUpdate = true;
    }
    invalidate();
  }, [active, reducedMotion, animation, invalidate]);

  useFrame((_, delta) => {
    const mesh = mirrors.current;
    if (!mesh || !rotating.current || !lights.current || reducedMotion || !active) return;
    const dirty = animation.update(delta, true,
      (index, color) => mesh.setColorAt(index, color),
      index => normal.setFromMatrixPosition(tiles[index].matrix).transformDirection(mesh.matrixWorld).z > 0.35,
    );
    rotating.current.rotation.y = -animation.rotation;
    lights.current.rotation.y = animation.lightRotation;
    if (dirty) mesh.instanceColor!.needsUpdate = true;
  });

  return <>
    <group rotation={[0.12, 0, -0.1]}>
      <group ref={rotating}>
        <mesh>
          <sphereGeometry args={[0.983, mobile ? 24 : 48, mobile ? 16 : 32]} />
          <meshStandardMaterial color={colors.bg} metalness={1} roughness={0.3} />
        </mesh>
        <instancedMesh key={tiles.length} ref={mirrors} args={[undefined, undefined, tiles.length]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={colors.white} metalness={1} roughness={0.1} envMapIntensity={1.4} />
        </instancedMesh>
      </group>
    </group>
    <group ref={lights}>
      {positions.map((position, index) => <pointLight key={lightTokens[index]} position={position}
        color={colors.lights[index]} intensity={mobile ? 14 : 12} decay={2} />)}
    </group>
  </>;
}

export default function DiscoBallScene(props: SceneProps) {
  const [contextLost, setContextLost] = useState(false);
  const colors = useMemo(() => {
    const silver = new Color(cssColor('silver'));
    return { bg: cssColor('bg'), silver, white: new Color(1, 1, 1),
      accents: tintTokens.map(token => new Color(cssColor(token))), lights: lightTokens.map(cssColor) };
  }, []);
  if (contextLost) return <ChromeFallback />;
  return <Canvas
    camera={{ position: [0, 0, 3.5], fov: 34, near: 0.1, far: 20 }}
    dpr={[1, 2]}
    frameloop={props.reducedMotion || !props.active ? 'demand' : 'always'}
    gl={{ alpha: true, antialias: true, powerPreference: props.mobile ? 'low-power' : 'high-performance' }}
    fallback={<ChromeFallback />}
    onCreated={({ gl }) => {
      gl.setClearColor(colors.bg, 0);
      gl.domElement.addEventListener('webglcontextlost', event => { event.preventDefault(); setContextLost(true); }, { once: true });
    }}>
    <Environment preset="city" />
    <RaveBall {...props} colors={colors} />
  </Canvas>;
}
