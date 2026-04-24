# Architecture: Lumen Pilgrimage Reforge (Phase 1)

## レイヤー責務

- `bootstrap/`: 起動シーケンス。
- `core/`: Game 本体、レンダーループ、構成。
- `engine/input`: Desktop/XR の入力抽象。
- `engine/save`: セーブデータと設定保存。
- `engine/debug`: Perf HUD。
- `game/state`: game state machine。
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
  - `PilgrimsBelfryScene`

## 分岐条件

- XR セッション中は `XRActionAdapter.isPresenting()` により目標 FPS と objective 表示を切替。
- 非 XR 時は Desktop 入力スナップショットで interact 状態を objective 文言へ反映。
- State 遷移は `GameStateMachine` の遷移表にない遷移を拒否。

## 拡張ポイント

- `GameStateMachine` に Phase 2 以降の戦闘/モード遷移を追加。
- `ActionMap` に combat / traversal のアクションを追加し、Desktop/XR を等価拡張。
- `PilgrimsBelfryScene` を Hub 機能（craft, codex, mode select）へ分解。
- `SaveManager` の slot schema を campaign/meta progression 対応へ拡張。

## 旧構成の扱い

`app/`, `world/`, `ui/`, `export/` の旧 ritual/glyph 系実装は参照用に残置。ランタイムのエントリ経路は `src/main.ts` から新 `AppBootstrap` / `Game` に切替済み。
