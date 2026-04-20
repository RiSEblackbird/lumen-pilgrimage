import { Color, Group, Mesh, MeshBasicMaterial, Object3D, TorusGeometry, Vector3 } from 'three';
import { RITUAL_ORDER, RitualDomain } from '../app/RitualState';

export class GlyphSystem {
  readonly group = new Group();
  readonly pickables: Object3D[] = [];

  private readonly glyphMap = new Map<Mesh, RitualDomain>();

  constructor() {
    const tempPosition = new Vector3();

    RITUAL_ORDER.forEach((domain, index) => {
      const theta = (index / RITUAL_ORDER.length) * Math.PI * 2;
      tempPosition.set(Math.cos(theta) * 2.6, 1.4, Math.sin(theta) * 2.6);

      const glyph = new Mesh(
        new TorusGeometry(0.22, 0.06, 12, 24),
        new MeshBasicMaterial({ color: 0x89a4ff, transparent: true, opacity: 0.95 })
      );
      glyph.position.copy(tempPosition);
      glyph.lookAt(0, 1.4, 0);
      glyph.userData.domain = domain;
      this.pickables.push(glyph);
      this.glyphMap.set(glyph, domain);
      this.group.add(glyph);
    });
  }

  setActivated(domain: RitualDomain): void {
    for (const [glyph, glyphDomain] of this.glyphMap.entries()) {
      const material = glyph.material as MeshBasicMaterial;
      material.color = new Color(glyphDomain === domain ? 0xffd4a3 : 0x89a4ff);
    }
  }
}
