import { ShaderMount, meshGradientFragmentShader, getShaderColorFromString } from '@paper-design/shaders';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const colors = ['#dceaf7', '#d2e4f5', '#c7dcf0', '#e6f1fa', '#d5e5f4', '#dceaf7'];
const clouds = document.querySelector('.hero-clouds');
Promise.all([...clouds.querySelectorAll('img')].map((image) => image.decode().catch(() => {})))
  .then(() => clouds.classList.add('clouds-ready'));

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
