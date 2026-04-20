import {
  BufferAttribute,
  Color,
  Group,
  InstancedMesh,
  Matrix4,
  MeshBasicMaterial,
  SphereGeometry
} from 'three';

export class SpiritParticles {
  readonly group = new Group();
  private readonly mesh: InstancedMesh;
  private readonly count = 180;
  private readonly matrix = new Matrix4();

  constructor() {
    const geometry = new SphereGeometry(0.03, 6, 6);
    const material = new MeshBasicMaterial({ color: 0xa8bfff, transparent: true, opacity: 0.7 });
    this.mesh = new InstancedMesh(geometry, material, this.count);

    const colors = new Float32Array(this.count * 3);
    for (let i = 0; i < this.count; i += 1) {
      const angle = (i / this.count) * Math.PI * 2;
      const radius = 1.5 + (i % 9) * 0.35;
      const x = Math.cos(angle) * radius;
      const y = 0.6 + (i % 7) * 0.25;
      const z = Math.sin(angle) * radius;
      this.matrix.makeTranslation(x, y, z);
      this.mesh.setMatrixAt(i, this.matrix);

      const c = new Color().setHSL(0.57, 0.7, 0.72);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    geometry.setAttribute('instanceColor', new BufferAttribute(colors, 3));
    this.group.add(this.mesh);
  }

  setHue(hue: number): void {
    const color = new Color();
    for (let i = 0; i < this.count; i += 1) {
      color.setHSL(hue, 0.7, 0.72);
      this.mesh.setColorAt(i, color);
    }
    if (this.mesh.instanceColor) {
      this.mesh.instanceColor.needsUpdate = true;
    }
  }

  tick(timeSeconds: number): void {
    for (let i = 0; i < this.count; i += 1) {
      const angle = timeSeconds * 0.12 + i * 0.09;
      const radius = 1.5 + (i % 9) * 0.35;
      const x = Math.cos(angle) * radius;
      const y = 0.7 + Math.sin(angle * 1.3) * 0.2 + (i % 7) * 0.25;
      const z = Math.sin(angle) * radius;
      this.matrix.makeTranslation(x, y, z);
      this.mesh.setMatrixAt(i, this.matrix);
    }
    this.mesh.instanceMatrix.needsUpdate = true;
  }
}
