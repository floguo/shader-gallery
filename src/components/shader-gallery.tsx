'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import Link from 'next/link'
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Canvas, extend, useFrame, useThree } from '@react-three/fiber'
import { shaderMaterial, OrbitControls, Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'

type Shader = {
  id: number;
  name: string;
  component: React.ComponentType<{ isPlaying: boolean }>;
};

const WarmDaySkyMaterial = shaderMaterial(
  {
    time: 0,
    resolution: new THREE.Vector2(),
  },
  // Vertex Shader
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment Shader
  `
    uniform float time;
    uniform vec2 resolution;
    varying vec2 vUv;

    float noise(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
      vec2 uv = vUv;
      vec3 skyColorTop = vec3(0.4, 0.6, 0.8); // Light blue for upper sky
      vec3 skyColorBottom = vec3(0.8, 0.7, 0.5); // Warm light for horizon
      vec3 cloudColor = vec3(1.0, 0.95, 0.9); // Soft white for clouds
      vec3 oceanColor = vec3(0.2, 0.4, 0.6); // Light blue for ocean

      // Create gradients
      float skyGradient = smoothstep(0.0, 1.0, length(uv - vec2(0.5, 0.5)));
      float oceanGradient = smoothstep(0.3, 0.4, uv.y);

      // Add warm glow around centered sun
      float glow = smoothstep(0.5, 0.0, length(uv - vec2(0.5, 0.5))) * 0.5;
      vec3 warmGlow = vec3(1.0, 0.6, 0.4); // Warm orange-pink

      // Create more obvious, slow-moving clouds
      float cloudNoise1 = noise((uv + vec2(time * 0.005, 0.0)) * 3.0);
      float cloudNoise2 = noise((uv + vec2(-time * 0.0075, time * 0.002)) * 5.0);
      float clouds = smoothstep(0.4, 0.6, cloudNoise1 * cloudNoise2);

      // Add cloud shadows
      float cloudShadow = smoothstep(0.4, 0.6, cloudNoise1 * cloudNoise2 * 0.8);

      // Mix the colors
      vec3 finalColor = mix(skyColorBottom, skyColorTop, skyGradient);
      finalColor = mix(finalColor, warmGlow, glow);
      finalColor = mix(finalColor, cloudColor, clouds * 0.7);
      finalColor = mix(finalColor, finalColor * 0.8, cloudShadow * 0.3); // Subtle cloud shadows
      finalColor = mix(oceanColor, finalColor, oceanGradient);

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
)

const AnimatedSunMaterial = shaderMaterial(
  {
    time: 0,
    resolution: new THREE.Vector2(),
  },
  // Vertex Shader
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment Shader
  `
    uniform float time;
    uniform vec2 resolution;
    varying vec2 vUv;

    float noise(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
      vec2 uv = vUv - 0.5;
      vec2 sunCenter = vec2(0.0, 0.0); // Sun position (center of screen)
      float dist = length(uv - sunCenter);
      
      // Smaller sun
      float sunRadius = 0.05;
      
      // Animate sun rays
      float angle = atan(uv.y - sunCenter.y, uv.x - sunCenter.x);
      float rays = sin(angle * 20.0 + time) * 0.5 + 0.5;
      rays *= smoothstep(sunRadius, sunRadius * 0.8, dist); // Softer edge
      
      // Spinning effect
      float spin = sin(angle * 5.0 - time * 0.2) * 0.5 + 0.5;
      
      // Pulsating glow
      float glow = (sin(time) * 0.5 + 0.5) * 0.1 + 0.9;
      
      // Noise for texture
      float noiseValue = noise(uv * 20.0 + time * 0.1) * 0.1;
      
      vec3 sunColor = vec3(1.0, 0.8, 0.5); // Warm sun color
      vec3 finalColor = sunColor * (rays * 0.5 + spin * 0.5 + glow) * (1.0 - noiseValue);
      
      float alpha = smoothstep(sunRadius, sunRadius * 0.8, dist) * glow;
      gl_FragColor = vec4(finalColor, alpha);
    }
  `
)

const SunRaysMaterial = shaderMaterial(
  {
    time: 0,
    resolution: new THREE.Vector2(),
  },
  // Vertex Shader
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment Shader
  `
    uniform float time;
    uniform vec2 resolution;
    varying vec2 vUv;

    float noise(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
      vec2 uv = vUv - 0.5;
      float dist = length(uv);
      float angle = atan(uv.y, uv.x);
      
      // Create conical rays
      float rays = sin(angle * 8.0 + time * 0.5) * 0.5 + 0.5;
      rays *= smoothstep(1.0, 0.2, dist); // Fade out towards edges
      
      // Add some noise for a softer look
      float noiseValue = noise(uv * 5.0 + time * 0.1) * 0.2;
      rays *= 1.0 - noiseValue;
      
      // Warm, soft color for the rays
      vec3 rayColor = vec3(1.0, 0.9, 0.7);
      
      vec3 finalColor = rayColor * rays;
      float alpha = rays * 0.7; // Adjust for desired intensity
      
      gl_FragColor = vec4(finalColor, alpha);
    }
  `
)

extend({ WarmDaySkyMaterial, AnimatedSunMaterial, SunRaysMaterial })

// Add this type declaration for the custom material
declare type WarmDaySkyMaterialImpl = {
  uniforms: {
    time: { value: number };
    resolution: { value: THREE.Vector2 };
  };
} & THREE.Material;

function WarmDaySky() {
  const mesh = useRef<THREE.Mesh<THREE.PlaneGeometry, WarmDaySkyMaterialImpl>>(null)
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
      {/* @ts-ignore */}
      <warmDaySkyMaterial />
    </mesh>
  )
}

function AnimatedSun() {
  const mesh = useRef<THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>>(null)
  const { size } = useThree()

  useFrame(({ clock }) => {
    if (mesh.current && 'uniforms' in mesh.current.material) {
      mesh.current.material.uniforms.time.value = clock.getElapsedTime()
      mesh.current.material.uniforms.resolution.value.set(size.width, size.height)
    }
  })

  return (
    <mesh ref={mesh} scale={[2, 2, 1]} position={[0, 0, -0.5]}>
      <planeGeometry args={[1, 1]} />
      {/* @ts-ignore */}
      <animatedSunMaterial transparent blending={THREE.AdditiveBlending} />
    </mesh>
  )
}

declare type SunRaysMaterialImpl = {
  uniforms: {
    time: { value: number };
    resolution: { value: THREE.Vector2 };
  };
} & THREE.Material;

function SunRays() {
  const mesh = useRef<THREE.Mesh<THREE.PlaneGeometry, SunRaysMaterialImpl>>(null)
  const { size } = useThree()

  useFrame(({ clock }) => {
    if (mesh.current && 'uniforms' in mesh.current.material) {
      mesh.current.material.uniforms.time.value = clock.getElapsedTime()
      mesh.current.material.uniforms.resolution.value.set(size.width, size.height)
    }
  })

  return (
    <mesh ref={mesh} scale={[2, 2, 1]} position={[0, 0, -0.4]}>
      <planeGeometry args={[1, 1]} />
      {/* @ts-ignore */}
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
    <Points ref={points} positions={particlesPosition}>
      <PointMaterial
        transparent
        color="#ffffe0"
        size={0.005}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
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

function WarmDayMeadowScene({ isPlaying }: { isPlaying: boolean }) {
  const [time, setTime] = useState(0)

  useEffect(() => {
    let animationFrameId: number

    const animate = () => {
      setTime((prevTime) => prevTime + 0.01)
      animationFrameId = requestAnimationFrame(animate)
    }

    if (isPlaying) {
      animate()
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [isPlaying])

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

const shaders: Shader[] = [
  { 
    id: 1, 
    name: 'Warm Day Meadow Scene', 
    component: WarmDayMeadowScene
  },
]

function ShaderPreview({ 
  shader, 
  onClick, 
  isPlaying, 
  togglePlay, 
  onHover,
  onUnhover,
}: {
  shader: Shader;
  onClick: () => void;
  isPlaying: boolean;
  togglePlay?: () => void;
  onHover: (id: number) => void;
  onUnhover: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    if (isPlaying !== isHovered) {
      setIsTransitioning(true)
      const timer = setTimeout(() => setIsTransitioning(false), 300)
      return () => clearTimeout(timer)
    }
  }, [isPlaying, isHovered])

  const handleMouseEnter = () => {
    setIsHovered(true)
    onHover(shader.id)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    onUnhover()
  }

  return (
    <button
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="text-left w-full group"
    >
      <div className="relative overflow-hidden aspect-video">
        <div className={`w-full h-full transition-all duration-300 ease-in-out ${
          isHovered ? 'scale-105 brightness-110' : 'scale-100 brightness-100'
        } ${isTransitioning ? 'blur-[2px]' : 'blur-none'}`}>
          <shader.component isPlaying={isPlaying} />
        </div>
        <div className={`absolute inset-0 bg-black transition-opacity duration-500 ease-in-out ${
          isHovered ? 'opacity-0' : 'opacity-30'
        }`}></div>
      </div>
      <div className="font-mono text-xs tracking-wider mt-2 flex justify-between items-center">
        <span>{shader.name}</span>
        {togglePlay && (
          <button 
            onClick={(e) => { e.stopPropagation(); togglePlay(); }} 
            className="text-xs border border-white px-2 py-1 rounded"
          >
            {isPlaying ? 'Pause' : 'Play'}
          </button>
        )}
      </div>
    </button>
  )
}

export default function ShaderGallery() {
  const [selectedShader, setSelectedShader] = useState<Shader | null>(null)
  const [playingShader, setPlayingShader] = useState(1) // Start with the first shader playing

  const handleShaderClick = (shader: Shader) => {
    setSelectedShader(shader)
    setPlayingShader(shader.id)
  }

  const toggleModalShaderPlay = () => {
    if (selectedShader) {
      setPlayingShader(playingShader === selectedShader.id ? 0 : selectedShader.id)
    }
  }

  const handleShaderHover = (shaderId: number) => {
    setPlayingShader(shaderId)
  }

  const handleShaderUnhover = () => {
    // We'll keep this empty for now, as the transition is handled within the ShaderPreview component
  }

  return (
    <div className="min-h-screen bg-black text-white p-8 flex justify-center">
      <div className="w-full max-w-2xl">
        <header className="mb-16 grid grid-cols-2 font-mono text-xs tracking-wider">
          <div>FLOGUO LABS</div>
          <div className="text-right">
            <Link href="https://x.com/floguo" target="_blank" rel="noopener noreferrer" className="hover:underline">
              X: @floguo
            </Link>
          </div>
        </header>

        <div className="mb-16 font-mono text-xs">
          <div className="text-neutral-500 mb-2">ABOUT</div>
          <div>A collection of shader experiments</div>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {shaders.map((shader) => (
            <ShaderPreview
              key={shader.id}
              shader={shader}
              onClick={() => handleShaderClick(shader)}
              isPlaying={playingShader === shader.id}
              onHover={handleShaderHover}
              onUnhover={handleShaderUnhover}
            />
          ))}
        </div>

        <Dialog open={!!selectedShader} onOpenChange={() => setSelectedShader(null)}>
          <DialogContent className="sm:max-w-[600px] bg-black text-white border-neutral-800 p-6">
            <div className="relative pt-6">
              {selectedShader && (
                <ShaderPreview 
                  shader={selectedShader} 
                  onClick={() => {}} 
                  isPlaying={playingShader === selectedShader.id}
                  togglePlay={toggleModalShaderPlay}
                  onHover={() => {}}
                  onUnhover={() => {}}
                />
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}