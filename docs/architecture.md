# Architecture: Lumen Pilgrimage Reforge (Phase 2 / slice1)

## レイヤー責務

- `bootstrap/`: 起動シーケンス。
- `core/`: Game 本体、レンダーループ、構成。
- `engine/input`: Desktop/XR の入力抽象。
- `engine/save`: セーブデータと設定保存。
- `engine/debug`: Perf HUD。
- `game/state`: game state machine。
- `game/items`: 武器/副手段のデータ定義。
- `game/sandbox`: 戦闘サンドボックス進行。
- `game/ui`: HUD / menu / VR wrist UI。
- `world/hub`: Hub の最小 3D シーン。

## 主な依存

- `AppBootstrap`
  - `Game`
- `Game`
  - `GameLoop`
  - `GameStateMachine`
  - `DesktopActionAdapter`
  - `XRActionAdapter`
  - `SaveManager`
  - `SettingsStore`
  - `PerfHud`
  - `HudManager`
  - `MenuManager`
  - `VrWristUi`
  - `CombatSandboxDirector`
  - `PilgrimsBelfryScene`
- `CombatSandboxDirector`
  - `WeaponDefs`
  - `OffhandDefs`

## 分岐条件

- XR セッション中は `XRActionAdapter.isPresenting()` により目標 FPS と objective 文言を切替。
- 非 XR 時は Desktop 入力スナップショットを `CombatSandboxDirector` に渡し、攻撃/ダッシュ/副手段を処理。
- `CombatSandboxDirector` は rising edge を使い、押下継続で多重発火しない。
- State 遷移は `GameStateMachine` の遷移表にない遷移を拒否。

## 拡張ポイント

- `WeaponDefs` / `OffhandDefs` に archetype を追加して戦術幅を段階拡張。
- `CombatSandboxDirector` を `PlayerCombat` / `DamageSystem` / `GuardSystem` に分割し、本番戦闘へ移行。
- `ActionMap` に parry, sigil, swap 等のアクションを追加し Desktop/XR を等価拡張。
- `PilgrimsBelfryScene` を Hub 機能（craft, codex, mode select）へ分解。

## 旧構成の扱い

`app/`, `world/`, `ui/`, `export/` の旧 ritual/glyph 系実装は参照用に残置。ランタイムのエントリ経路は `src/main.ts` から新 `AppBootstrap` / `Game` に切替済み。
