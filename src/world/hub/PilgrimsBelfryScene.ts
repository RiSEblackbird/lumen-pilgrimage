import { AmbientLight, BoxGeometry, Color, DirectionalLight, Mesh, MeshStandardMaterial, Scene } from 'three';

export class PilgrimsBelfryScene {
  private readonly arena: Mesh;

  constructor(private readonly scene: Scene) {
    this.scene.background = new Color(0x06080f);

    const ambience = new AmbientLight(0x7f8aa8, 0.9);
    const key = new DirectionalLight(0xffe4bc, 1.2);
    key.position.set(3, 8, 2);

    this.arena = new Mesh(
      new BoxGeometry(2.4, 0.6, 2.4),
      new MeshStandardMaterial({ color: 0x4f5568, roughness: 0.78, metalness: 0.1 })
    );
    this.arena.position.set(0, 1, -3);

    this.scene.add(ambience, key, this.arena);
  }

  tick(elapsedSeconds: number): void {
    this.arena.rotation.y = elapsedSeconds * 0.25;
  }
}
