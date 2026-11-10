// The moon is Luau Academy's progress indicator: it grows from a new moon (0%) to a full moon (100%).
// "Luau" comes from "Lua", which means "moon" in Portuguese.

export function phaseName(percent) {
  if (percent <= 0) return 'New moon';
  if (percent < 45) return 'Waxing crescent';
  if (percent <= 55) return 'First quarter';
  if (percent < 100) return 'Waxing gibbous';
  return 'Full moon';
}

/** Returns an SVG string whose lit area matches the given percentage. */
export function moonSvg(percent) {
  const fraction = Math.min(1, Math.max(0, percent / 100));
  const radius = 50;
  const center = 60;
  // The terminator (edge between light and dark) is an ellipse that narrows toward the half moon.
  const rx = (Math.abs(1 - 2 * fraction) * radius).toFixed(2);
  const sweep = fraction < 0.5 ? 0 : 1;
  const lit = fraction > 0
    ? `<path class="moon-lit" d="M${center} ${center - radius}A${radius} ${radius} 0 0 1 ${center} ${center + radius}A${rx} ${radius} 0 0 ${sweep} ${center} ${center - radius}Z"/>`
    : '';

  return `<svg class="moon" viewBox="9 9 102 102" role="img" aria-label="Moon phase showing ${Math.round(percent)} percent of the course complete">
    <circle class="moon-dark" cx="60" cy="60" r="50"/>
    ${lit}
    <circle class="moon-rim" cx="60" cy="60" r="50"/>
  </svg>`;
}
