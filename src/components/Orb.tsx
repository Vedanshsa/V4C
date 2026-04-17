import { useEffect, useRef } from 'react'
import { Renderer, Camera, Geometry, Program, Mesh, Color, Vec2 } from 'ogl'
import './Orb.css'

const vertex = /* glsl */ `
  attribute vec2 uv;
  attribute vec3 position;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`

const fragment = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform float uHue;
  uniform float uHover;
  uniform float uHoverSpeed;
  uniform vec2 uResolution;
  uniform vec2 uMouse;
  uniform vec3 uBackgroundColor;
  varying vec2 vUv;

  vec3 iov(vec3 color) {
    return color * color;
  }

  void main() {
    float time = uTime * 0.5;
    vec2 uv = vUv;
    vec2 p = (gl_FragCoord.xy * 2.0 - uResolution.xy) / min(uResolution.x, uResolution.y);
    
    vec2 m = uMouse;
    float d = length(p - m);
    
    float wave = sin(d * 10.0 - time * 2.0) * 0.5 + 0.5;
    float strength = smoothstep(0.5, 0.0, d);
    
    float hueOffset = uHue / 360.0;
    
    // Abstract orb pattern
    float noise = sin(p.x * 5.0 + time) * cos(p.y * 5.0 - time);
    float mask = smoothstep(0.4 + uHover * 0.1, 0.3, length(p) + noise * 0.05);
    
    vec3 col = 0.5 + 0.5 * cos(time + uv.xyx + vec3(0, 2, 4) + hueOffset);
    col *= mask;
    
    // Mix with background
    vec3 finalCol = mix(uBackgroundColor, col, mask);
    
    gl_FragColor = vec4(finalCol, 1.0);
  }
`

export default function Orb({
  hoverIntensity = 0.5,
  rotateOnHover = true,
  hue = 0,
  forceHoverState = false,
  backgroundColor = '#000000',
  ...props
}: any) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mouse = new Vec2(0)
  const targetMouse = new Vec2(0)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const renderer = new Renderer({ alpha: true, antialias: true })
    const gl = renderer.gl
    container.appendChild(gl.canvas)

    const camera = new Camera(gl)
    camera.position.z = 5

    const geometry = new Geometry(gl, {
      position: { size: 3, data: new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]) },
      uv: { size: 2, data: new Float32Array([0, 0, 2, 0, 0, 2]) },
    })

    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        uTime: { value: 0 },
        uHue: { value: hue },
        uHover: { value: 0 },
        uResolution: { value: new Vec2() },
        uMouse: { value: mouse },
        uBackgroundColor: { value: hexToVec3(backgroundColor) },
      },
    })

    const mesh = new Mesh(gl, { geometry, program })

    const handleMouseMove = (e: MouseEvent) => {
      // Use window center as origin, or document coordinates
      targetMouse.set(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1
      )
    }

    window.addEventListener('mousemove', handleMouseMove)

    let animationId: number;
    const update = (t: number) => {
      animationId = requestAnimationFrame(update)
      
      mouse.lerp(targetMouse, 0.05)
      
      program.uniforms.uTime.value = t * 0.001
      program.uniforms.uHover.value = forceHoverState ? 1 : (mouse.x !== 0 || mouse.y !== 0) ? hoverIntensity : 0
      
      renderer.setSize(container.offsetWidth, container.offsetHeight)
      program.uniforms.uResolution.value.set(gl.canvas.width, gl.canvas.height)
      
      renderer.render({ scene: mesh })
    }
    animationId = requestAnimationFrame(update)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('mousemove', handleMouseMove)
      container.removeChild(gl.canvas)
    }
  }, [hue, hoverIntensity, forceHoverState, backgroundColor])

  return <div ref={containerRef} className="orb-container" {...props} />
}

function hexToVec3(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  return [r, g, b]
}
