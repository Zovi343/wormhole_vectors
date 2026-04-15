import * as THREE from "three";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { GRAPH_SPACE } from "./config";

function makeLabel(text: string, className: string): CSS2DObject {
  const el = document.createElement("div");
  el.className = className;
  el.textContent = text;
  const obj = new CSS2DObject(el);
  obj.center.set(0.5, 1);
  return obj;
}

export class GraphSpace {
  readonly group: THREE.Group;
  private readonly baseRotation: THREE.Euler;
  private angleX = 0;
  private angleY = 0;
  private angleZ = 0;

  constructor() {
    this.group = new THREE.Group();
    this.baseRotation = GRAPH_SPACE.initialRotation.clone();
    this.group.position.copy(GRAPH_SPACE.position);
    this.group.rotation.copy(this.baseRotation);
    this.build();
  }

  private build(): void {
    const { nodes, edges, accent, title, subtitle } = GRAPH_SPACE;
    const nodeMap = new Map(nodes.map((n) => [n.id, n.position.clone()]));

    const lineMat = new THREE.LineBasicMaterial({
      color: accent,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    for (const [a, b] of edges) {
      const pa = nodeMap.get(a);
      const pb = nodeMap.get(b);
      if (!pa || !pb) continue;
      const geom = new THREE.BufferGeometry().setFromPoints([pa, pb]);
      const line = new THREE.Line(geom, lineMat);
      this.group.add(line);
    }

    const sphereGeom = new THREE.SphereGeometry(0.15, 18, 18);
    for (const n of nodes) {
      const mat = new THREE.MeshStandardMaterial({
        color: 0xfae8ff,
        emissive: accent,
        emissiveIntensity: 0.55,
        metalness: 0.2,
        roughness: 0.4,
      });
      const mesh = new THREE.Mesh(sphereGeom, mat);
      mesh.position.copy(n.position);
      this.group.add(mesh);

      const label = makeLabel(n.id, "label");
      label.position.copy(n.position).add(new THREE.Vector3(0, 0.28, 0));
      this.group.add(label);
    }

    const header = makeLabel(
      `${title}  ·  ${subtitle}`,
      GRAPH_SPACE.titleLabelClass,
    );
    header.position.set(0, 1.28, 0);
    header.center.set(0.5, 0);
    this.group.add(header);
  }

  update(delta: number, speed: number): void {
    const v = delta * speed;
    this.angleX += v * 0.31;
    this.angleY += v * 0.5;
    this.angleZ += v * 0.34;
    const b = this.baseRotation;
    this.group.rotation.x = b.x + this.angleX;
    this.group.rotation.y = b.y + this.angleY;
    this.group.rotation.z = b.z + this.angleZ;
  }
}
