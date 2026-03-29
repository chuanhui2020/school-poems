export const inkLineVertex = /* glsl */ `
attribute float aProgress;
varying float vProgress;
varying vec2 vUv;

void main() {
  vProgress = aProgress;
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

export const inkLineFragment = /* glsl */ `
uniform float uTime;
uniform vec3 uColor;
uniform float uOpacity;
uniform float uHighlighted;

varying float vProgress;
varying vec2 vUv;

void main() {
  // Core line: bright center, soft edges
  float centerDist = abs(vUv.y - 0.5) * 2.0;
  float coreLine = smoothstep(1.0, 0.2, centerDist);
  float sharpCore = smoothstep(0.4, 0.0, centerDist);

  // Taper at endpoints
  float taper = smoothstep(0.0, 0.08, vProgress) * smoothstep(1.0, 0.92, vProgress);

  // Flowing light pulse along the line
  float flow = sin((vProgress - uTime * 0.8) * 12.0) * 0.5 + 0.5;
  float flowPulse = pow(flow, 3.0) * uHighlighted;

  // Secondary faster flow (opposite direction)
  float flow2 = sin((vProgress + uTime * 0.5) * 20.0) * 0.5 + 0.5;
  float flowPulse2 = pow(flow2, 4.0) * uHighlighted * 0.4;

  // Color: bright line color with white-hot core when highlighted
  vec3 lineColor = uColor * (1.0 + flowPulse * 1.5 + flowPulse2);
  vec3 coreColor = mix(lineColor, vec3(1.0), sharpCore * 0.3 * (1.0 + uHighlighted));

  // Outer glow (feeds into bloom)
  float outerGlow = smoothstep(1.0, 0.0, centerDist) * 0.3;

  float alpha = (coreLine * 0.8 + outerGlow) * taper * uOpacity;
  alpha *= 1.0 + flowPulse * 0.5;

  gl_FragColor = vec4(coreColor, alpha);
}
`
