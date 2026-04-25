# Lumen Pilgrimage: Reforge

Lumen Pilgrimage を、旧 ritual/glyph デモ構成から **XR + flat 両対応のアクション探索ゲーム基盤**へ移行中です。現状は Phase 5 着手段階として、Hub の戦闘サンドボックスに EncounterDirector を接続し、sector/room 進行に加えて room graph 分岐（risk/recovery/secret）と biome ごと 10 room 構成、enemy coordinator 圧制御、reward 選択、relic 取得、continue snapshot からの run 復帰、boss-approach room で biome 別 Warden contract（multi-phase）HUD readout と phase 連動の戦闘補正を確認できる状態です。さらに `BossActorDirector` を追加し、wave だけに依存しないボス専用 HP・攻撃ローテーション・telegraph 表示の基盤を導入しました。`ArenaMutationDirector` は boss phase の `arenaMutationSummary` を biome 別 device 強度ラベルと定期 pulse callout に変換して HUD/objective に反映します。加えて `BossArenaAudioDirector` を導入し、boss phase / overburn / mutation pulse を biome 固有 motif（例: ember choir, moon bell, blackglass ticks）へマッピングして、objective callout と HUD に audio-reactive ミックス状態を表示するようにしました。今回 `MusicDirector` も追加し、探索/脅威/戦闘/クラッチ/ボス stem ミックスを biome・敵圧・overburn・boss phase に応じて算出し、HUD から現在の music レイヤー状態を追跡できるようにしました。加えて `AudioDirector` を導入し、run/hub 状態に応じた stem target をランタイムで平滑化更新する経路を追加しました。さらに stem ごとの `GainNode` bus と source 登録 API（`registerStemSource`）を実装し、authored WebAudio source graph を接続できる状態へ拡張しています。`StatsTracker` と `RunSummaryBuilder` を新設し、キル数・与被ダメージ・parry・dash・Ash Sight・relic 選択を集計した run summary を HUD で確認できるようにしています。MainMenu には Continue / New Game / Mode Select / Settings / Accessibility / Controls / Credits と 3 つの Save Slot 切替を実装し、Mode Select から Campaign / Contracts / Boss Rush / Endless Collapse を選択して run state を切り替えられます。Accessibility では subtitle・colorblind-safe cue・reduce flashing/shake・tinnitus-safe・sudden peak 抑制、Controls では dominant hand・hold/toggle guard・flat aim assist などを永続化できます。Hub のXR端末選択は HMD 前方固定ではなく left/right controller ray の最短ヒット解決に更新し、VR の意図しない terminal 誤ロックを抑えています。さらに、選択中 terminal に対して left/right hand 別の world-space beacon を表示し、wrist prompt と合わせてどちらの手が lock しているかを即時判別できるようにしました。

## セットアップ

```bash
npm install
npm run dev
```

## 検証コマンド

```bash
npm run typecheck
npm run build
npm run validate:content
npm run validate:release
npm run check
```

## build / check / release 手順

1. 開発中の検証

```bash
npm run check
```

2. リリースビルド生成

```bash
npm run build
```

3. 生成物確認（任意）

```bash
npm run preview
```

- `DEFAULT_GAME_CONFIG.enableDebugHud` は `import.meta.env.MODE !== "production"` に連動しており、release build（`vite build`）では `PerfHud` を生成しません。
- release 前に `npm run validate:content` と `npm run validate:release` を含む `npm run check` を必ず通してください。

## 現在の実装範囲（Phase 1〜Phase 3 基盤）

- 新エントリ: `AppBootstrap` → `Game`
- state machine（Boot〜EndlessCollapse）
- state model 分離（`CampaignState` / `ExpeditionState` / `MetaProgressionState`）で campaign objective・run 進行・loadout pool 表示責務を整理
- `SaveManager.updateState` により menu/hub/run 遷移時の save slot `state` を永続化
- continue snapshot に `runSeed` を保存し、EncounterDirector の room 分岐を deterministic seed で再現可能化
- Desktop/XR 入力抽象（ActionMap）
- `SaveManager` / `SettingsStore`（slot0 の初期化 + expedition 進行スナップショット自動保存 + meta progression 永続化）
- `PerfHud`（簡易 FPS 監視）
- Hub skeleton (`PilgrimsBelfryScene`) + Hub/MetaUpgrade メニュー導線
- HUD / Menu の最小 UI（保存済み expedition snapshot を Continue 情報として表示）
- MainMenu コマンド UI（Continue / New Game / Settings / Credits）と command queue
- MainMenu の Mode Select（Campaign / Contracts / Boss Rush / Endless Collapse）
- run 開始の明示分岐（起動直後は MainMenu 待機、選択後に InExpedition へ遷移）
- run mode に応じた state 遷移（Campaign/Contracts: `InExpedition`、Boss Rush: `BossRush`、Endless: `EndlessCollapse`）

- legacy ritual/glyph/export/codex 実装（`RitualState` / `GlyphSystem` / `DreamExporter` / `Sanctuary` ほか）を `src/` から削除し、新基盤のみを保守対象へ整理
- New Game 時の slot reset と sandbox 初期化
- Settings パネル（snap turn / seated mode / reduce flashing / UI scale / master volume / difficulty）と保存
- Settings の実ランタイム反映（UI scale: HUD/Menu/PerfHud、master volume: AudioListener、XR comfort: wrist UI 表示、reduce flashing: hub scene motion、difficulty: combat sandbox enemy scaling）
- Credits パネルと MainMenu 復帰導線
- Hub パネルで恒久通貨（Lumen Ash / Choir Thread / Saint Glass / Echo Script）と unlock 状態を表示
- Hub パネルで loadout 候補の解放済み/未解放一覧（Weapons / Offhands / Sigils）を表示し、出撃前に unlock 影響を確認可能
- Hub の XR terminal は controller ray（left/right）で選択し、同時ヒット時は距離の近い端末を優先
- MetaUpgrade で Astral Pike unlock / Beacon Crucible craft の保存連動プレースホルダ
- HUD に loadout pool（解放数/総数）を常時表示し、run 中の装備循環候補を可視化
- combat sandbox (`CombatSandboxDirector`)
  - 主武器 4 種（Prism Blade / Censer Carbine / Astral Pike / Thurible Chain）
  - 副手段 4 種（Ward Aegis / Grasp Tether / Beacon Crucible / Siphon Engine）
  - active sigils 12 種のローテーション表示
  - relic 24 種データと reward 選択（3択）
  - 仮敵 3 種（Ash Mote / Candle Penitent / Furnace Thurifer）
  - guard / parry 分離
  - telegraph 読み合い + stagger リワード
  - enemy coordinator（melee token / ranged budget）
  - mission 12系統ローテーション表示（Purge Nest / Echo Rescue に加えて Veil Infiltration / Litany Conflux / Warden Remix / Collapse Protocol を含む） + contract route bias 適用
  - EncounterDirector による biome/sector/room graph 進行表示（Ember Ossuary / Moon Reservoir）
  - room tag 連動の wave spawn table（arena / traversal / elite / reward / secret / boss-approach）
  - biome ごと 10 room の modular encounter graph（10〜14 room quota 対応）
  - 取得 relic の stat modifier を combat resource/damage へ反映（dash cost / guard mitigation / parry bonus / room-clear focus 等）
  - continue snapshot に route style + relic modifier を保存し、Menu continue 表示へ反映
  - continue snapshot に roomId を保存し、起動時に mission/room/vitals/relic を sandbox へ再適用
  - continue snapshot に missionId を保存し、mission 表示名変更に影響されない復帰解決へ移行（旧 save は missionName 互換復帰）
  - boss-approach room 到達時に biome 別 Warden contract（Cinder Litany / Lunar Refraction）を起動し、時間+Overburn 条件で phase を進行
  - `BossActorDirector` により biome 別 boss profile（HP/攻撃タイプ/telegraph）を管理し、phase 連動で攻撃間隔・被弾圧を更新
  - `ArenaMutationDirector` により arena mutation を biome 固有 device（例: Censer Vents, Mirror Gates, Overcharge Rails）へ投影し、phase 進行で強度を更新
  - boss 戦中に arena device pulse callout を objective へ注入し、phase 情報の読解レイヤーを追加
  - `BossArenaAudioDirector` により arena mutation pulse / hazard tick を biome 固有 audio motif に変換し、phase ごとの reactive mix を HUD/objective へ反映
  - `MusicDirector` により biome / enemy pressure / overburn / boss phase に応じた music stem mix（exploration / threat / combat / clutch / boss）を算出し、HUD へ可視化
  - run mode modifier（Campaign / Contracts / Boss Rush / Endless Collapse）をデータ駆動で導入し、敵圧・報酬倍率・resource 消耗・hazard 強度を mode ごとに差別化
  - HUD に boss HP readout と boss 専用 telegraph を表示
  - `Ash Sight`（Focus 消費 + cooldown）を tactical reveal として追加し、telegraph/route 読解を補助
  - difficulty layer（Pilgrim / Trial / Martyr）を追加し、敵HP/被ダメージ圧/telegraph 速度を mode 横断で調整


## コンテンツ検証ゲート

`npm run validate:content` は次を静的に検証します。

- コンテンツ最低数（biome / mission / weapon / offhand / sigil / relic / boss contract / enemy）
- データ定義の重複 ID 検出（weapon / offhand / sigil / relic / mission / enemy）
- EncounterSpawnTables の archetype 参照が EnemyCatalog と整合すること
- biome room graph の 10〜14 room quota・dead end・soft lock 検出
- `src/` 配下に `dev` / `placeholder` 文言が残っていないこと（`src/engine/debug/PerfHud.ts` は許可）
- `src/` に legacy 参照（`RitualState` / `GlyphSystem` / `DreamExporter` / `FlatCodexPanel` / `VrCodexPanel` / `Sanctuary`）が残っていないこと
- `dist/` に debug helper / legacy loop のトークン（`PerfHud` / `DevOverlay` / `SpawnCheats` / `RitualState` / `GlyphSystem` / `DreamExporter`）が残っていないこと

リリース前は `npm run check`（typecheck + build + content validation + release validation）を実行してください。

## サンドボックス操作（flat-screen）

- `LMB` / `Space`: primary attack
- `RMB`: guard
- `F`: parry
- `Q`: offhand module
- `Shift`: dash
- `R`: Ash Sight（Focus を使って短時間の tactical reveal）
- `A` / `D`: reward 選択時の左右移動
- `E`: reward 決定（通常時は loadout rotate）
- MainMenu の `Mode Select` ボタン: run mode 選択

## 現在のディレクトリ構成（主要）

```text
src/
  main.ts
  bootstrap/
    AppBootstrap.ts
  core/
    Game.ts
    GameConfig.ts
    GameLoop.ts
  engine/
    input/
      ActionMap.ts
      DesktopActionAdapter.ts
      XRActionAdapter.ts
    save/
      SaveManager.ts
      SettingsStore.ts
    audio/
      MusicDirector.ts
    debug/
      PerfHud.ts
  game/
    state/
      GameState.ts
      GameStateMachine.ts
    director/
      ArenaMutationDirector.ts
      BossArenaAudioDirector.ts
      BossActorDirector.ts
      EnemyCoordinator.ts
    encounters/
      MissionTypes.ts
    items/
      WeaponDefs.ts
      OffhandDefs.ts
    sandbox/
      CombatSandboxDirector.ts
    ui/
      HudManager.ts
      MenuManager.ts
      VrWristUi.ts
  world/
    hub/
      PilgrimsBelfryScene.ts
```

## 次フェーズ方針

Phase 4 継続として、arena device を実ジオメトリ/VFX へ接続しつつ、Hub unlock/craft の実戦ロードアウト反映、Ember/Moon boss の本戦挙動強化を進めます。
