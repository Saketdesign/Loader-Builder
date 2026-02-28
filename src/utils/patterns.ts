import type { LoaderConfig } from '../types';

export const getCellState = (
  x: number,
  y: number,
  time: number,
  config: LoaderConfig,
  outState: { active: boolean; opacity: number }
): void => {
  const { pattern, gridSize, speed } = config;

  // Normalized time based on speed
  // at speed 10, we want ~300ms cycle.
  // wave pattern cycle is approx 20 units.
  // const t = time * (speed * k)
  // wavePos = t * 10
  // 20 = 0.3 * 10 * k * 10 => 20 = 30k => k = 0.66
  const t = time * (speed * 0.7);
  const scale = config.patternScale ?? 1;

  switch (pattern) {
    case 'wave': {
      // Diagonal wave
      const diag = x + y;
      // Expand the loop cycle to guarantee the wave fully exits the grid at any scale
      const cycleLength = gridSize * 2 + 4 * scale;
      const wavePos = ((t * 10) % cycleLength) - 2 * scale;
      const dist = Math.abs(diag - wavePos) / scale;
      const active = dist < 2;
      outState.active = active;
      outState.opacity = active ? 1 - dist * 0.5 : 0.1;
      return;
    }

    case 'radial': {
      const cx = gridSize / 2 - 0.5;
      const cy = gridSize / 2 - 0.5;
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      // Expand the loop cycle based on grid corner distance + wave thickness
      const maxRadius = gridSize * 0.8 + 2 * scale;
      const radius = (t * 5) % maxRadius;
      const wave = Math.abs(dist - radius) / scale;
      const active = wave < 1.5;
      outState.active = active;
      outState.opacity = active ? 1 - wave * 0.4 : 0.1;
      return;
    }

    case 'spiral': {
      // Simple imitation of spiral using angle + dist
      const cx = gridSize / 2 - 0.5;
      const cy = gridSize / 2 - 0.5;
      const angle = Math.atan2(y - cy, x - cx);
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      const spiralPhase = angle + (dist / scale) * 0.5 - t * 5;
      const active = Math.cos(spiralPhase) > 0.8;
      outState.active = active;
      outState.opacity = active ? 1 : 0.1;
      return;
    }

    case 'pulse': {
      const noise =
        Math.sin((x / scale) * 0.5 + t) * Math.cos((y / scale) * 0.5 + t * 0.7);
      const active = noise > 0.6;
      outState.active = active;
      outState.opacity = active ? noise : 0.1;
      return;
    }

    case 'fluid': {
      // Organic fluid-like motion using multiple intersecting offset sine waves
      const nx = x / scale;
      const ny = y / scale;
      const timeScale = t * 0.5;

      const v1 = Math.sin(nx * 0.4 + timeScale);
      const v2 = Math.cos(ny * 0.4 + timeScale * 0.8);
      const v3 = Math.sin((nx + ny) * 0.3 - timeScale * 1.1);
      const v4 = Math.cos((nx - ny) * 0.3 + timeScale * 0.9);

      // Average the waves for a value between roughly -1 and 1
      const noise = (v1 + v2 + v3 + v4) / 4;
      // Normalize to 0-1
      const normalized = (noise + 1) / 2;

      const active = normalized > 0.6;
      // Map the opacity so the center of the 'blobs' is brightest
      // normalized goes from 0 to 1, threshold is 0.6.
      // When normalized is 1.0, we want opacity 1.
      // So we can remap 0.6 -> 1.0 to 0.0 -> 1.0
      const blobIntensity = Math.max(0, (normalized - 0.6) / 0.4);

      outState.active = active;
      outState.opacity = active ? 0.3 + blobIntensity * 0.7 : 0.1;
      return;
    }

    case 'rain': {
      // Vertical falling droplets
      // Create a pseudo-random column offset so they aren't all in sync
      const colOffset = (Math.sin(x * 12.9898) * 43758.5453) % 1;

      // Adjust speed for falling
      const fallSpeed = t * 6;

      // The position of the raindrop in this column
      // We use mod so it wraps around the grid vertical span
      const dropY =
        ((fallSpeed + colOffset * gridSize) % (gridSize + 4 * scale)) -
        2 * scale;

      // Calculate distance from cell y to drop y
      // We only want the trail to be ABOVE the drop head, so dropY >= y
      const dist = dropY - y;

      if (dist >= 0 && dist < 3 * scale) {
        // Inside the raindrop trail
        const intensity = 1 - dist / (3 * scale);
        const active = intensity > 0.2;
        outState.active = active;
        outState.opacity = intensity;
        return;
      }

      outState.active = false;
      outState.opacity = 0.1;
      return;
    }

    case 'radar': {
      // Sweeping cone from the center
      const cx = gridSize / 2 - 0.5;
      const cy = gridSize / 2 - 0.5;
      // Angle of the cell relative to center (-PI to PI)
      let cellAngle = Math.atan2(y - cy, x - cx);
      if (cellAngle < 0) cellAngle += Math.PI * 2; // Normalize to 0 -> 2PI

      // Current angle of the sweeping radar beam
      // Negate to make it sweep clockwise
      const sweepSpeed = t * 2;
      let radarAngle = sweepSpeed % (Math.PI * 2);
      if (radarAngle < 0) radarAngle += Math.PI * 2;

      // Calculate distance between angles, accounting for wrap around
      // The beam trail should trail behind the radarAngle clockwise.
      // So if beam is at 10deg, trail is 10->0, 360->...
      let angleDiff = radarAngle - cellAngle;
      if (angleDiff < 0) angleDiff += Math.PI * 2;

      // Width of the sweeping beam trail. patternScale allows adjusting the tail length.
      const beamWidth = Math.PI * 0.5 * scale;

      if (angleDiff < beamWidth) {
        // Inside the radar beam
        const intensity = 1 - angleDiff / beamWidth;
        const active = intensity > 0.1;
        outState.active = active;
        outState.opacity = intensity;
        return;
      }

      outState.active = false;
      outState.opacity = 0.1;
      return;
    }

    case 'random':
    default: {
      const active = Math.random() > 0.5;
      outState.active = active;
      outState.opacity = active ? 1 : 0.1;
      return;
    }
  }
};
