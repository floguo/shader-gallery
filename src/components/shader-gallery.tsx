'use client'

import React, { Suspense } from 'react'
import { Canvas, extend, useFrame, useThree } from '@react-three/fiber'
import { shaderMaterial, OrbitControls, Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'

// Wrap your main component content in Suspense
export default function ShaderGallery() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Canvas>
        <OrbitControls />
        <mesh>
          <boxGeometry />
          <meshStandardMaterial />
        </mesh>
        <ambientLight intensity={0.5} />
      </Canvas>
    </Suspense>
  )
}