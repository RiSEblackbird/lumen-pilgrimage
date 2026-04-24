# Architecture: Lumen Pilgrimage Reforge (Phase 4)

## レイヤー責務

- `bootstrap/`: 起動シーケンス。
- `core/`: Game 本体、レンダーループ、構成。
- `engine/input`: Desktop/XR の入力抽象。
- `engine/save`: セーブデータ（expedition + meta progression）と設定保存。
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
- `SaveManager` は expedition snapshot に `roomId` を含めて保存し、旧 save（roomId 未保存）を読み込む場合は空文字で互換復帰する。
- `SaveManager` は expedition snapshot に `missionId` を含めて保存し、旧 save（missionId 未保存）は missionName 互換復帰を許容する。
- `MenuManager` は `SaveManager` の expedition snapshot を読み、Hub の Continue 情報として biome/sector/room/vitals/relic を表示する。
- `MenuManager` は MainMenu/Hub/MetaUpgrade コマンドキュー（continue/new-game/enter-hub/launch-expedition/unlock/craft/open-settings/open-credits）を公開し、`Game` が毎 tick で消費して遷移を決定する。
- `MenuManager` は MainMenu / Settings / Credits の各パネルを描画し、settings 操作用コマンド（toggle/volume/back）を `Game` へ通知する。
- `Game` は Settings 変更を `SettingsStore` へ即時保存し、MainMenu へ戻る導線を state machine で保証する。
- `Game` は Hub で `MetaUpgrade` へ遷移し、unlock/craft コマンドを `SaveManager.updateMetaProgress` へ接続して保存値を更新する。
- mission は `MissionTypes` でデータ駆動定義し、sandbox でローテーション表示しつつ route bias を EncounterDirector へ注入する。
- `Game` は起動時に Continue snapshot を `CombatSandboxDirector` へ注入し、mission/room/vitals/relic を run 状態へ再適用する。
- `Game` は起動直後に MainMenu で待機し、Continue / New Game の明示選択を受けるまで expedition 更新/自動保存を開始しない。
- `SaveManager` は `metaProgress`（通貨 + unlock 状態）を save slot に保存し、旧 save 互換として `metaProgress` 欠落時は default 値を補完する。
- `SaveManager.resetSlot` は New Game の slot 初期化を担い、既存 continue snapshot と meta progression を安全に再生成する。
- `CombatSandboxDirector` は `boss-approach` room tag を検知すると biome 別 Warden stub（Bell of Cinders / The Thirteen-Eyed Pool）の phase readout を HUD 表示する。
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
