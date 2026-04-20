import { Group, Mesh, MeshBasicMaterial, PlaneGeometry } from 'three';

export class VrCodexPanel {
  readonly group = new Group();

  constructor() {
    const panel = new Mesh(
      new PlaneGeometry(1.1, 0.6),
      new MeshBasicMaterial({ color: 0x1a1f33, transparent: true, opacity: 0.5 })
    );
    panel.position.set(0, 1.65, -1.8);
    this.group.add(panel);
  }
}
