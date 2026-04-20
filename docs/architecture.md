# Architecture: Lumen Pilgrimage

## レイヤー責務

- `app/`: アプリ全体のオーケストレーション、XR/FPS 入力統合、状態遷移。
- `world/`: 3D 空間要素、光源、probe、glyph、粒子。
- `ui/`: 2D/3D の操作ガイド表示。
- `export/`: 最終 ritual 状態のシリアライズ。

## 主な依存

- `LumenPilgrimageApp`
  - `Sanctuary`
  - `ProbeVolumeManager`
  - `GlyphSystem`
  - `XRInputRig`
  - `FPSInputRig`
  - `DreamExporter`
- `Sanctuary`
  - `KelvinLightRig`
  - `SpiritParticles`

## 重要な分岐条件

- Glyph select 時:
  - 通常は選択された domain へ遷移。
  - 両手同一 glyph + 十分な進行で `dawn-altar` を即時解放。
- 入力モード:
  - XR セッション中は VR モード（`XRInputRig`）を使用。
  - 非 XR セッション中は FPS モード（`FPSInputRig`）を使用。
- キーボード `V`:
  - `LightProbeGridHelper` 可視化の ON/OFF。
- キーボード `E`:
  - 現在状態を JSON で export。

## 拡張ポイント

- `RITUAL_CONFIG` を拡張すると、光・fog・粒子の儀式テーマ追加が可能。
- `DreamExporter` はファイル保存や API 送信の導入に拡張可能。
- `XRInputRig` のイベント連携を拡張すると、複雑なジェスチャーを追加可能。

## パフォーマンス方針

- Quest クラスを想定し pixel ratio を上限化。
- `renderer.xr.setFoveation(1)` を使用。
- 反復要素（粒子）は instancing で描画。
- 重い postprocess は採用せず、probe + fog + light 遷移中心で演出。
