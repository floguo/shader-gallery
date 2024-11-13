import * as THREE from 'three'

class SunRaysMaterial extends THREE.ShaderMaterial {
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
          float angle = atan(vUv.y - center.y, vUv.x - center.x);
          float rays = sin(angle * 8.0 + time) * 0.5 + 0.5;
          float opacity = rays * smoothstep(0.5, 0.2, dist);
          vec3 rayColor = vec3(1.0, 0.9, 0.5);
          gl_FragColor = vec4(rayColor, opacity * 0.3);
        }
      `
    })
  }
}

export { SunRaysMaterial } 