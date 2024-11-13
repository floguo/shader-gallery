'use client'

import React, { useRef, useMemo } from 'react'
import { Canvas, extend, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { WarmDaySkyMaterial } from './WarmDaySkyMaterial'
import { AnimatedSunMaterial } from './AnimatedSunMaterial'
import { SunRaysMaterial } from './SunRaysMaterial'

extend({ WarmDaySkyMaterial, AnimatedSunMaterial, SunRaysMaterial })

interface ShaderMaterial extends THREE.Material {
  uniforms: {
    time: { value: number };
    resolution: { value: THREE.Vector2 };
  };
}

function WarmDaySky() {
  const mesh = useRef<THREE.Mesh<THREE.BufferGeometry, ShaderMaterial>>(null)
  const { size } = useThree()

  useFrame(({ clock }) => {
    if (mesh.current) {
      mesh.current.material.uniforms.time.value = clock.getElapsedTime()
      mesh.current.material.uniforms.resolution.value.set(size.width, size.height)
    }
  })

  return (
    <mesh ref={mesh} scale={[2, 2, 1]} position={[0, 0, -1]}>
      <planeGeometry args={[1, 1]} />
      {/* @ts-expect-error */}
      <warmDaySkyMaterial />
    </mesh>
  )
}

function AnimatedSun() {
  const mesh = useRef<THREE.Mesh<THREE.BufferGeometry, ShaderMaterial>>(null)
  const { size } = useThree()

  useFrame(({ clock }) => {
    if (mesh.current) {
      mesh.current.material.uniforms.time.value = clock.getElapsedTime()
      mesh.current.material.uniforms.resolution.value.set(size.width, size.height)
    }
  })

  return (
    <mesh ref={mesh} scale={[2, 2, 1]} position={[0, 0, -0.5]}>
      <planeGeometry args={[1, 1]} />
      {/* @ts-expect-error */}
      <animatedSunMaterial transparent blending={THREE.AdditiveBlending} />
    </mesh>
  )
}

function SunRays() {
  const mesh = useRef<THREE.Mesh<THREE.BufferGeometry, ShaderMaterial>>(null)
  const { size } = useThree()

  useFrame(({ clock }) => {
    if (mesh.current) {
      mesh.current.material.uniforms.time.value = clock.getElapsedTime()
      mesh.current.material.uniforms.resolution.value.set(size.width, size.height)
    }
  })

  return (
    <mesh ref={mesh} scale={[2, 2, 1]} position={[0, 0, -0.4]}>
      <planeGeometry args={[1, 1]} />
      {/* @ts-expect-error */}
      <sunRaysMaterial transparent blending={THREE.AdditiveBlending} />
    </mesh>
  )
}

function MeadowParticles({ count = 2000 }) {
  const points = useRef<THREE.Points>(null)

  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10
      positions[i * 3 + 1] = Math.random() * 5 // Concentrate particles in lower half
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10
    }
    return positions
  }, [count])

  useFrame((state) => {
    if (points.current) {
      points.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.1) * 0.01
      points.current.position.y = Math.sin(state.clock.getElapsedTime() * 0.2) * 0.02
    }
  })

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={particlesPosition}
          count={count}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        transparent
        color="#ffffe0"
        size={0.005}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

function SoftLight() {
  return (
    <>
      <ambientLight intensity={0.7} color="#fffaf0" />
      <pointLight position={[0, 5, -5]} intensity={0.8} color="#ffd700" />
    </>
  )
}

export function WarmDayMeadowScene({ isPlaying }: { isPlaying: boolean }) {
  return (
    <Canvas camera={{ position: [0, 0, 1], fov: 75 }}>
      <WarmDaySky />
      <SunRays />
      <AnimatedSun />
      <SoftLight />
      <MeadowParticles />
      <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
    </Canvas>
  )
}