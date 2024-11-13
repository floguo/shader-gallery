import * as THREE from 'three'

class AnimatedSunMaterial extends THREE.ShaderMaterial {
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
          vec2 center = vec2(0.5, 0.6);
          float dist = distance(vUv, center);
          float circle = smoothstep(0.2, 0.19, dist);
          vec3 sunColor = vec3(1.0, 0.8, 0.2);
          gl_FragColor = vec4(sunColor * circle, circle);
        }
      `
    })
  }
}

export { AnimatedSunMaterial } 