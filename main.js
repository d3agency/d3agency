import { ShaderMount, meshGradientFragmentShader, getShaderColorFromString } from '@paper-design/shaders';

document.querySelector('#year').textContent = new Date().getFullYear();
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const colors = ['#fcfcfa', '#e4e6f3', '#d1d7ed', '#fcf4e6', '#ece7f3', '#fcfcfa'];
const target = document.querySelector('#dream-shader');
try {
  const shader = new ShaderMount(target, meshGradientFragmentShader, {
    u_colors: colors.map(getShaderColorFromString), u_colorsCount: colors.length,
    u_distortion: 0.5, u_swirl: 0.7, u_grainMixer: 0.08, u_grainOverlay: 0.05,
    u_scale: 1, u_rotation: 0, u_offsetX: 0, u_offsetY: 0,
    u_originX: 0.5, u_originY: 0.5, u_worldWidth: 0, u_worldHeight: 0, u_fit: 2,
  }, undefined, reducedMotion.matches ? 0 : 0.08, 18000, 1, 1500000);
  reducedMotion.addEventListener('change', (event) => shader.setSpeed(event.matches ? 0 : 0.08));
  window.addEventListener('pagehide', () => shader.dispose(), { once: true });
} catch {
  // Keep the CSS gradient when WebGL is unavailable.
  target.classList.add('shader-fallback');
}
