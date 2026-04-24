# Architecture: Lumen Pilgrimage Reforge (Phase 3.5)

## レイヤー責務

- `bootstrap/`: 起動シーケンス。
- `core/`: Game 本体、レンダーループ、構成。
- `engine/input`: Desktop/XR の入力抽象。
- `engine/save`: セーブデータと設定保存。
- `engine/debug`: Perf HUD。
- `game/state`: game state machine。
- `game/items`: 武器/副手段/sigil/relic のデータ定義。
- `game/director`: 敵圧制御、reward 選択、room 進行制御。
- `game/encounters`: mission と biome room rule のデータ定義。
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
  - `EncounterDirector`
  - `EnemyCoordinator`
  - `RewardDirector`
  - `MissionTypes`
  - `EncounterRuleSet`
  - `WeaponDefs`
  - `OffhandDefs`
  - `SigilDefs`
  - `RelicDefs`

## 分岐条件

- XR セッション中は `XRActionAdapter.isPresenting()` により目標 FPS と objective 文言を切替。
- 非 XR 時は Desktop 入力スナップショットを `CombatSandboxDirector` に渡し、攻撃/ガード/パリィ/副手段を処理。
- `CombatSandboxDirector` は rising edge を使い、押下継続で多重発火しない。
- 敵ごとに telegraph lead を持ち、telegraph 中のみ parry 成功。成功時は stagger と Focus/Overburn 報酬を返す。
- `EnemyCoordinator` が melee token / ranged pressure budget を評価し、同時攻撃数を制御する。
- wave clear 後は `EncounterDirector` が sector/room を進行し、結果係数を `RewardDirector` の 3 択 relic フローへ接続する。
- mission は `MissionTypes` でデータ駆動定義し、sandbox でローテーション表示する。
- State 遷移は `GameStateMachine` の遷移表にない遷移を拒否。

## 拡張ポイント

- `WeaponDefs` / `OffhandDefs` / `SigilDefs` / `RelicDefs` に archetype を追加して戦術幅を段階拡張。
- `CombatSandboxDirector` を `PlayerCombat` / `DamageSystem` / `GuardSystem` / `EncounterDirector` に分割し、本番戦闘へ移行。
- `ActionMap` を起点に、weapon-alt/lock-on/active-sigil の個別入力を Desktop/XR 双方へ等価拡張。
- `EncounterDirector` を room graph と spawn rule へ接続して探索導線を構築。
- `RewardDirector` を biome ごとの loot table と rarity 重みへ接続して drop 品質を調整。
- `PilgrimsBelfryScene` を Hub 機能（craft, codex, mode select）へ分解。

## 旧構成の扱い

`app/`, `world/`, `ui/`, `export/` の旧 ritual/glyph 系実装は参照用に残置。ランタイムのエントリ経路は `src/main.ts` から新 `AppBootstrap` / `Game` に切替済み。
