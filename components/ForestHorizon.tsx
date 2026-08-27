/**
 * The treeline along the bottom of the landing page. Three layers of pines at
 * different depths, so the forest has a sense of distance.
 *
 * Positions and heights come from fixed lists rather than Math.random(), so the
 * server and the browser always draw exactly the same forest.
 */

const BASELINE = 130;

/** One pine, drawn as a jagged silhouette. */
function pine(x: number, height: number, width: number): string {
  const b = BASELINE;
  return [
    `M ${x} ${b}`,
    `L ${x - width} ${b}`,
    `L ${x - width * 0.55} ${b - height * 0.42}`,
    `L ${x - width * 0.82} ${b - height * 0.4}`,
    `L ${x - width * 0.34} ${b - height * 0.72}`,
    `L ${x - width * 0.52} ${b - height * 0.7}`,
    `L ${x} ${b - height}`,
    `L ${x + width * 0.52} ${b - height * 0.7}`,
    `L ${x + width * 0.34} ${b - height * 0.72}`,
    `L ${x + width * 0.82} ${b - height * 0.4}`,
    `L ${x + width * 0.55} ${b - height * 0.42}`,
    `L ${x + width} ${b}`,
    "Z",
  ].join(" ");
}

/** A repeatable wobble so the pines aren't a picket fence. */
const JITTER = [0, 7, -5, 3, -8, 5, -3, 9, -6, 2, 8, -4, 6, -9, 4, -2];

function layer(spacing: number, baseHeight: number, width: number, heightVariance: number): string {
  const paths: string[] = [];
  let i = 0;
  for (let x = -20; x < 1240; x += spacing) {
    const wobble = JITTER[i % JITTER.length];
    paths.push(pine(x + wobble, baseHeight + (wobble / 9) * heightVariance, width));
    i += 1;
  }
  return paths.join(" ");
}

const FAR = layer(52, 52, 15, 12);
const MID = layer(88, 76, 21, 16);
const NEAR = layer(146, 108, 29, 22);

export default function ForestHorizon() {
  return (
    <svg
      className="horizon"
      viewBox="0 0 1200 130"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
    >
      <path d={FAR} fill="#12301b" opacity={0.62} />
      <path d={MID} fill="#0c2412" opacity={0.85} />
      <path d={NEAR} fill="#050f06" />
      <rect x={0} y={BASELINE - 2} width={1200} height={12} fill="#050f06" />
    </svg>
  );
}
