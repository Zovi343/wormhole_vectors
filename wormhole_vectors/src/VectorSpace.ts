import * as THREE from "three";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import type { VectorSpaceConfig } from "./config";

function makeLabel(text: string, className: string): CSS2DObject {
  const el = document.createElement("div");
  el.className = className;
  el.textContent = text;
  const obj = new CSS2DObject(el);
  obj.center.set(0.5, 1);
  return obj;
}

function strengthenArrow(arrow: THREE.ArrowHelper): void {
  const lineMat = arrow.line.material as THREE.LineBasicMaterial;
  lineMat.transparent = true;
  lineMat.opacity = 1;
  const coneMat = arrow.cone.material as THREE.MeshBasicMaterial;
  coneMat.transparent = true;
  coneMat.opacity = 1;
}

export class VectorSpace {
  readonly group: THREE.Group;
  private readonly config: VectorSpaceConfig;
  private readonly baseRotation: THREE.Euler;
  private angleX = 0;
  private angleY = 0;
  private angleZ = 0;

  constructor(config: VectorSpaceConfig) {
    this.config = config;
    this.baseRotation = config.initialRotation.clone();
    this.group = new THREE.Group();
    this.group.position.copy(config.position);
    this.group.rotation.copy(this.baseRotation);
    this.build();
  }

  private build(): void {
    const { accent, accent2, planeCount, planeSpacing, planeSize, documents, arrows } =
      this.config;

    const half = ((planeCount - 1) * planeSpacing) / 2;

    for (let i = 0; i < planeCount; i++) {
      const z = -half + i * planeSpacing;
      const geom = new THREE.PlaneGeometry(planeSize, planeSize);
      const borderColor = i % 2 === 0 ? accent : accent2;
      const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(geom, 1),
        new THREE.LineBasicMaterial({
          color: borderColor,
          transparent: true,
          opacity: 0.92,
          depthWrite: false,
        }),
      );
      edges.position.z = z;
      this.group.add(edges);
      geom.dispose();
    }

    const sphereGeom = new THREE.SphereGeometry(0.14, 20, 20);
    for (const doc of documents) {
      const color = doc.isQuery ? 0xfbbf24 : 0xf8fafc;
      const mat = new THREE.MeshStandardMaterial({
        color,
        emissive: doc.isQuery ? 0xf59e0b : 0xe2e8f0,
        emissiveIntensity: doc.isQuery ? 0.9 : 0.45,
        metalness: 0.15,
        roughness: 0.35,
      });
      const mesh = new THREE.Mesh(sphereGeom, mat);
      mesh.position.copy(doc.local);
      this.group.add(mesh);

      const labelClass = doc.isQuery
        ? "label label--query"
        : "label";
      const label = makeLabel(doc.id, labelClass);
      label.position.copy(doc.local).add(new THREE.Vector3(0, 0.26, 0));
      this.group.add(label);
    }

    const origin = new THREE.Vector3(0, 0, 0);
    for (const spec of arrows) {
      const dir = spec.direction.clone().normalize();
      const headLen = 0.32;
      const headWidth = 0.22;
      const arrow = new THREE.ArrowHelper(
        dir,
        origin,
        spec.length,
        spec.color,
        headLen,
        headWidth,
      );
      strengthenArrow(arrow);
      this.group.add(arrow);

      const tip = origin.clone().addScaledVector(dir, spec.length + headLen * 0.55 + 0.12);
      const dimLabel = makeLabel(spec.label, "label label--dim");
      dimLabel.position.copy(tip);
      this.group.add(dimLabel);
    }

    const header = makeLabel(
      `${this.config.title}  ·  ${this.config.subtitle}`,
      this.config.titleLabelClass,
    );
    header.position.set(0, 1.55, 0);
    header.center.set(0.5, 0);
    this.group.add(header);
  }

  update(delta: number, speed: number): void {
    const v = delta * speed;
    this.angleX += v * 0.36;
    this.angleY += v * 0.58;
    this.angleZ += v * 0.29;
    const b = this.baseRotation;
    this.group.rotation.x = b.x + this.angleX;
    this.group.rotation.y = b.y + this.angleY;
    this.group.rotation.z = b.z + this.angleZ;
  }
}
