import { Color, Mesh, MeshStandardMaterial } from 'three';

export type HubTerminalAction = 'open-expedition-prep' | 'open-meta-upgrade' | 'back-main-menu';

interface HubTerminalDefinition {
  readonly id: string;
  readonly label: string;
  readonly action: HubTerminalAction;
  readonly idleColor: number;
  readonly activeColor: number;
}

const HUB_TERMINALS: readonly HubTerminalDefinition[] = [
  {
    id: 'expedition-prep-terminal',
    label: 'Expedition Terminal',
    action: 'open-expedition-prep',
    idleColor: 0x35506e,
    activeColor: 0x4d9bff
  },
  {
    id: 'meta-upgrade-terminal',
    label: 'Meta Upgrade Terminal',
    action: 'open-meta-upgrade',
    idleColor: 0x5b3f24,
    activeColor: 0xf0a640
  },
  {
    id: 'main-menu-terminal',
    label: 'Return Terminal',
    action: 'back-main-menu',
    idleColor: 0x4f2454,
    activeColor: 0xcb57d7
  }
] as const;

export class HubTerminalDirector {
  private selectedIndex = 0;

  constructor(private readonly terminals: readonly Mesh[]) {
    this.refreshMaterials();
  }

  cycleSelection(): void {
    if (HUB_TERMINALS.length === 0) {
      return;
    }
    this.selectedIndex = (this.selectedIndex + 1) % HUB_TERMINALS.length;
    this.refreshMaterials();
  }

  setSelectedIndex(index: number): void {
    if (HUB_TERMINALS.length === 0) {
      return;
    }

    const normalizedIndex = ((Math.floor(index) % HUB_TERMINALS.length) + HUB_TERMINALS.length) % HUB_TERMINALS.length;
    if (normalizedIndex === this.selectedIndex) {
      return;
    }

    this.selectedIndex = normalizedIndex;
    this.refreshMaterials();
  }

  activateSelection(): HubTerminalAction {
    return HUB_TERMINALS[this.selectedIndex].action;
  }

  getSelectedLabel(): string {
    return HUB_TERMINALS[this.selectedIndex].label;
  }

  private refreshMaterials(): void {
    for (const [index, terminalMesh] of this.terminals.entries()) {
      const material = terminalMesh.material;
      if (!(material instanceof MeshStandardMaterial)) {
        continue;
      }

      const palette = HUB_TERMINALS[index];
      const colorHex = index === this.selectedIndex ? palette.activeColor : palette.idleColor;
      material.color.copy(new Color(colorHex));
      material.emissive.copy(new Color(colorHex));
      material.emissiveIntensity = index === this.selectedIndex ? 0.35 : 0.14;
    }
  }
}
