import * as THREE from 'three'

class WarmDaySkyMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      uniforms: {
        time: { value: 0 },
        resolution: { value: new THREE.Vector2() }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec2 resolution;
        varying vec2 vUv;

        void main() {
          vec3 skyColor = vec3(0.4, 0.7, 1.0);
          vec3 horizonColor = vec3(0.9, 0.8, 0.7);
          float blend = smoothstep(0.2, 0.8, vUv.y);
          vec3 finalColor = mix(horizonColor, skyColor, blend);
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `
    })
  }
}

export { WarmDaySkyMaterial } 