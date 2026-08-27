/* The vine is drawn in its own little coordinate system and then scaled to fit
   the screen UNIFORMLY (same amount across and down). If we stretched it only
   across, the leaves would squash into wide blobs on a laptop. */
const W = 600;
const H = 18;
const LEFT = 5;
const RIGHT = W - 5;

/** A gently waving line, so progress looks like a growing vine and not a battery meter. */
function vineY(x: number): number {
  return H / 2 + Math.sin(((x - LEFT) / (RIGHT - LEFT)) * Math.PI * 3.1) * 3.1;
}

const VINE_PATH = (() => {
  const points: string[] = [`M ${LEFT} ${vineY(LEFT).toFixed(2)}`];
  for (let x = LEFT + 8; x < RIGHT; x += 8) {
    points.push(`L ${x} ${vineY(x).toFixed(2)}`);
  }
  points.push(`L ${RIGHT} ${vineY(RIGHT).toFixed(2)}`);
  return points.join(" ");
})();

/** Leaves unfurl as the reader passes them. Little milestones along the way. */
const LEAF_STOPS = [0.22, 0.45, 0.68, 0.9];

const LEAF_SHAPE = "M -6 0 C -2.5 -4.2 2.5 -4.2 6 0 C 2.5 4.2 -2.5 4.2 -6 0 Z";

export default function VineProgress({
  progress,
  label,
}: {
  /** 0 to 1. */
  progress: number;
  label: string;
}) {
  const clamped = Math.min(1, Math.max(0, progress));

  return (
    <svg className="vine" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label}>
      <path className="vine-track" d={VINE_PATH} />
      {/* pathLength="1" lets us treat the whole vine as exactly 1 unit long, so the
          dash offset IS the fraction still to read. No measuring required. */}
      <path
        className="vine-grown"
        d={VINE_PATH}
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - clamped}
      />
      {LEAF_STOPS.map((stop, i) => {
        const x = LEFT + (RIGHT - LEFT) * stop;
        const y = vineY(x);
        const angle = i % 2 === 0 ? -34 : 34;
        return (
          <g key={stop} transform={`translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${angle})`}>
            <path
              className="vine-leaf"
              d={LEAF_SHAPE}
              data-reached={clamped >= stop ? "true" : "false"}
            />
          </g>
        );
      })}
    </svg>
  );
}
