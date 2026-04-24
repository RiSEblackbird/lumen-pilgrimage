# Architecture: Lumen Pilgrimage Reforge (Phase 4.3)

## レイヤー責務

- `bootstrap/`: 起動シーケンス。
- `core/`: Game 本体、レンダーループ、構成。
- `engine/input`: Desktop/XR の入力抽象。
- `engine/save`: セーブデータと設定保存。
- `engine/debug`: Perf HUD。
- `game/state`: game state machine。
- `game/items`: 武器/副手段/sigil/relic のデータ定義と relic stat modifier。
- `game/director`: 敵圧制御、reward 選択、room 進行制御。
- `game/encounters`: mission / biome room rule / room-tag spawn table のデータ定義。
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
- wave clear 後は `EncounterDirector` が room graph を辿って次 room を選択し、mission contract の routeBias と clear pace / 被ダメ結果を合成した優先順位で risk・recovery 分岐を評価する。
- wave spawn は `EncounterSpawnTables` が biome + room tags + sector から算出し、linear 固定 wave を置き換える。
- relic 取得後は `RelicEffects` を通じて dash cost、guard 被ダメ、room clear Focus 回復、parry 報酬などに補正を適用する。
- `SaveManager` は slot0 を `loadOrCreate` し、sandbox の expedition 進行を 1 秒間隔で保存する。snapshot には routeStyle と relicModifiers を含め、旧形式セーブは default modifiers で後方互換を維持する。
- `MenuManager` は `SaveManager` の expedition snapshot を読み、Hub の Continue 情報として biome/sector/room/vitals/relic を表示する。
- mission は `MissionTypes` でデータ駆動定義し、sandbox でローテーション表示しつつ route bias を EncounterDirector へ注入する。
- State 遷移は `GameStateMachine` の遷移表にない遷移を拒否。

## 拡張ポイント

- `WeaponDefs` / `OffhandDefs` / `SigilDefs` / `RelicDefs` に archetype を追加して戦術幅を段階拡張。
- `CombatSandboxDirector` を `PlayerCombat` / `DamageSystem` / `GuardSystem` / `EncounterDirector` に分割し、本番戦闘へ移行。
- `ActionMap` を起点に、weapon-alt/lock-on/active-sigil の個別入力を Desktop/XR 双方へ等価拡張。
- `EncounterDirector` の route 選択を mission type / contract modifier と接続し、探索導線の性格を調整。
- `RewardDirector` を biome ごとの loot table と rarity 重みへ接続して drop 品質を調整。
- `PilgrimsBelfryScene` を Hub 機能（craft, codex, mode select）へ分解。

## 旧構成の扱い

`app/`, `world/`, `ui/`, `export/` の旧 ritual/glyph 系実装は参照用に残置。ランタイムのエントリ経路は `src/main.ts` から新 `AppBootstrap` / `Game` に切替済み。
