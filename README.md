# Lumen Pilgrimage

Three.js r184 + TypeScript で構築した WebXR VR 体験です。儀式空間（sanctuary）内で glyph を選択し、`LightProbeGrid` と Kelvin 光源制御を用いてドメインごとの雰囲気を変化させます。

## セットアップ

```bash
npm install
npm run dev
```

本番ビルド:

```bash
npm run build
```

CI と同等の検証をローカルで実行する場合:

```bash
npm run check
```

## 実装済みの主要要件

- TypeScript 実装
- Three.js **r184**
- `WebGLRenderer` + `VRButton`
- `renderer.setAnimationLoop()`
- `local-floor` reference space
- XR controller ray interaction
- `LightProbeGrid`（`three/addons/lighting/LightProbeGrid.js`）
- `ColorUtils.setKelvin()`（`three/addons/utils/ColorUtils.js`）
- `LightProbeGridHelper` による spirit vision
- メイン VR ループに WebGPU 専用 postprocess 未使用
- Probe bake は起動時と ritual 状態変化時のみ

## 操作

- ブラウザ画面: Codex パネルで操作説明を表示
- `Enter VR` ボタンで VR 開始
- 右コントローラー: fire wand
- 左コントローラー: moon wand
- 各コントローラーのレイで glyph を照準し、`select` で儀式遷移
- 両コントローラーが同 glyph を照準して選択すると ritual が増幅
- キーボード `V`: spirit vision（`LightProbeGridHelper` の可視化）
- キーボード `E`: 最終状態の JSON export をコンソール出力

## ドメイン

1. candle-cave
2. moon-pool
3. birch-star-garden
4. obsidian-corridor
5. dawn-altar

各ドメインで以下を更新します。

- Probe volume bake
- Fog color
- Kelvin light tone
- Spirit particles hue
- Ambient audio ラベル（状態として保持）

## 構成

```text
src/
  main.ts
  app/
    LumenPilgrimageApp.ts
    XRInputRig.ts
    RitualState.ts
  world/
    Sanctuary.ts
    ProbeVolumeManager.ts
    KelvinLightRig.ts
    GlyphSystem.ts
    SpiritParticles.ts
  ui/
    VrCodexPanel.ts
    FlatCodexPanel.ts
  export/
    DreamExporter.ts
```

詳細は `docs/architecture.md` を参照してください。
