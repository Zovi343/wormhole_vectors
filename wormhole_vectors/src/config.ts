import * as THREE from "three";

/** World-space anchors for wormhole lines (centers of each region). */
export const ANCHORS = {
  sparse: new THREE.Vector3(-4.5, 1.55, 0),
  dense: new THREE.Vector3(4.5, 1.55, 0),
  graph: new THREE.Vector3(0, -2.4, 0.5),
} as const;

/**
 * Wormhole segment endpoints in world space — offset from space centers so
 * tunnels start/end at "ports" near doc clusters, not at group origins.
 */
export const TUNNEL = (() => {
  const s = ANCHORS.sparse.clone();
  const d = ANCHORS.dense.clone();
  const g = ANCHORS.graph.clone();

  const horiz = new THREE.Vector3().subVectors(d, s).normalize();
  const portH = 1.38;
  const sparseToDenseStart = s.clone().addScaledVector(horiz, portH);
  const sparseToDenseEnd = d.clone().addScaledVector(horiz, -portH);

  const diag = new THREE.Vector3().subVectors(g, d).normalize();
  const portDenseOut = 0.9;
  const portGraphIn = 0.55;
  const denseToGraphStart = d.clone().addScaledVector(diag, portDenseOut);
  const denseToGraphEnd = g.clone().addScaledVector(diag, -portGraphIn);

  return {
    sparseToDenseStart,
    sparseToDenseEnd,
    denseToGraphStart,
    denseToGraphEnd,
  };
})();

export const TIMING = {
  /** Seconds before any beam starts. */
  beamWarmup: 2.8,
  /** Duration of sparse → dense beam stream. */
  beamSparseToDense: 2.4,
  /** Delay before dense → graph beam starts (overlap with first beam tail). */
  beamDenseStartAfterWarmup: 4.6,
  /** Duration of dense → graph beam. */
  beamDenseToGraph: 2.2,
} as const;

export const ROTATION_SPEED = 0.35;

export type DocPoint = {
  id: string;
  local: THREE.Vector3;
  isQuery?: boolean;
};

export type ArrowSpec = {
  label: string;
  /** Direction from origin (normalized internally). */
  direction: THREE.Vector3;
  length: number;
  color: number;
};

export type VectorSpaceConfig = {
  key: "sparse" | "dense";
  title: string;
  subtitle: string;
  position: THREE.Vector3;
  /** Base tilt before animated spin (radians). */
  initialRotation: THREE.Euler;
  /** Accent for wireframe borders. */
  accent: number;
  /** Secondary tint for alternate plane borders. */
  accent2: number;
  planeCount: number;
  planeSpacing: number;
  planeSize: number;
  documents: DocPoint[];
  arrows: ArrowSpec[];
  titleLabelClass: string;
};

/** Sparse: cluster toward +local X (toward dense). Dense: toward -X and slightly -Y (toward sparse / graph). */
export const SPARSE_SPACE: VectorSpaceConfig = {
  key: "sparse",
  title: "SPARSE SPACE",
  subtitle: "TF-IDF Keywords",
  position: new THREE.Vector3(-4.5, 1.55, 0),
  initialRotation: new THREE.Euler(0.25, 0, 0.1),
  accent: 0xfbbf24,
  accent2: 0xf97316,
  planeCount: 5,
  planeSpacing: 0.55,
  planeSize: 3.6,
  titleLabelClass: "label label--title",
  documents: [
    { id: "DOC_E", local: new THREE.Vector3(0.72, 0.18, 0.12) },
    { id: "DOC_B", local: new THREE.Vector3(0.55, -0.12, -0.18) },
    { id: "DOC_D", local: new THREE.Vector3(0.88, -0.22, 0.08) },
    { id: "DOC_F", local: new THREE.Vector3(0.62, 0.28, -0.06) },
    { id: "QUERY", local: new THREE.Vector3(0.28, 0.02, 0.04), isQuery: true },
  ],
  arrows: [
    {
      label: "machine",
      direction: new THREE.Vector3(1, 0.15, 0.1),
      length: 1.35 * 1.35,
      color: 0xfff59a,
    },
    {
      label: "algorithm",
      direction: new THREE.Vector3(-0.35, 1, 0.2),
      length: 1.25 * 1.35,
      color: 0xfde047,
    },
    {
      label: "learning",
      direction: new THREE.Vector3(0.2, 0.2, 1),
      length: 1.2 * 1.35,
      color: 0xfbbf24,
    },
  ],
};

export const DENSE_SPACE: VectorSpaceConfig = {
  key: "dense",
  title: "DENSE SPACE",
  subtitle: "Semantic Embeddings",
  position: new THREE.Vector3(4.5, 1.55, 0),
  initialRotation: new THREE.Euler(0.2, 0, -0.1),
  accent: 0x2dd4bf,
  accent2: 0x22d3ee,
  planeCount: 5,
  planeSpacing: 0.55,
  planeSize: 3.6,
  titleLabelClass: "label label--title label--dense-title",
  documents: [
    { id: "DOC_B", local: new THREE.Vector3(-0.58, 0.08, 0.06) },
    { id: "DOC_A", local: new THREE.Vector3(-0.42, 0.22, -0.14) },
    { id: "DOC_C", local: new THREE.Vector3(-0.72, -0.32, 0.12) },
    { id: "DOC_D", local: new THREE.Vector3(-0.35, -0.48, -0.08) },
  ],
  arrows: [
    {
      label: "Formality",
      direction: new THREE.Vector3(1, 0.05, 0),
      length: 1.2 * 1.35,
      color: 0xa5f3fc,
    },
    {
      label: "Semantics",
      direction: new THREE.Vector3(-0.2, 1, 0.15),
      length: 1.3 * 1.35,
      color: 0xf9a8d4,
    },
    {
      label: "Frequency",
      direction: new THREE.Vector3(0.15, 0.25, 1),
      length: 1.15 * 1.35,
      color: 0x99f6e4,
    },
  ],
};

export type GraphNodeSpec = { id: string; position: THREE.Vector3 };
export type GraphEdgeSpec = [string, string];

const g = 1.6;

export const GRAPH_SPACE = {
  title: "GRAPH SPACE",
  subtitle: "Knowledge Graph",
  position: new THREE.Vector3(0, -2.4, 0.5),
  initialRotation: new THREE.Euler(0.06, 0, -0.04),
  accent: 0xe879f9,
  titleLabelClass: "label label--title label--graph-title",
  nodes: [
    { id: "DOC_A", position: new THREE.Vector3(0.9 * g, 0.35 * g, 0.2 * g) },
    { id: "DOC_B", position: new THREE.Vector3(-0.5 * g, 0.55 * g, -0.35 * g) },
    { id: "DOC_C", position: new THREE.Vector3(-0.85 * g, -0.25 * g, 0.45 * g) },
    { id: "DOC_D", position: new THREE.Vector3(0.35 * g, -0.65 * g, -0.2 * g) },
    { id: "DOC_E", position: new THREE.Vector3(0.15 * g, 0.05 * g, 0.75 * g) },
  ] satisfies GraphNodeSpec[],
  edges: [
    ["DOC_A", "DOC_B"],
    ["DOC_B", "DOC_C"],
    ["DOC_C", "DOC_D"],
    ["DOC_D", "DOC_A"],
    ["DOC_A", "DOC_E"],
    ["DOC_C", "DOC_E"],
    ["DOC_B", "DOC_E"],
  ] satisfies GraphEdgeSpec[],
} as const;
