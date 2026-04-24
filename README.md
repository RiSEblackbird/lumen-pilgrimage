# Lumen Pilgrimage: Reforge

Lumen Pilgrimage を、旧 ritual/glyph デモ構成から **XR + flat 両対応のアクション探索ゲーム基盤**へ移行中です。現状は Phase 4 着手段階として、Hub の戦闘サンドボックスに EncounterDirector を接続し、sector/room 進行に加えて room graph 分岐（risk/recovery/secret）、enemy coordinator 圧制御、reward 選択、relic 取得、continue snapshot からの run 復帰、boss-approach room の Warden stub HUD readout を確認できる状態です。加えて MainMenu で Continue / New Game の起動分岐、Settings / Credits の専用パネル遷移、Hub/MetaUpgrade の恒久成長プレースホルダ（通貨表示・unlock/craft保存）を導入しました。

## セットアップ

```bash
npm install
npm run dev
```

## 検証コマンド

```bash
npm run typecheck
npm run build
npm run check
```

## 現在の実装範囲（Phase 1〜Phase 3 基盤）

- 新エントリ: `AppBootstrap` → `Game`
- state machine（Boot〜EndlessCollapse）
- Desktop/XR 入力抽象（ActionMap）
- `SaveManager` / `SettingsStore`（slot0 の初期化 + expedition 進行スナップショット自動保存 + meta progression 永続化）
- `PerfHud`（簡易 FPS 監視）
- Hub skeleton (`PilgrimsBelfryScene`) + Hub/MetaUpgrade メニュー導線
- HUD / Menu の最小 UI（保存済み expedition snapshot を Continue 情報として表示）
- MainMenu コマンド UI（Continue / New Game / Settings / Credits）と command queue
- run 開始の明示分岐（起動直後は MainMenu 待機、選択後に InExpedition へ遷移）
- New Game 時の slot reset と sandbox 初期化
- Settings パネル（snap turn / seated mode / reduce flashing / UI scale / master volume）と保存
- Settings の実ランタイム反映（UI scale: HUD/Menu/PerfHud、master volume: AudioListener、XR comfort: wrist UI 表示、reduce flashing: hub scene motion）
- Credits パネルと MainMenu 復帰導線
- Hub パネルで恒久通貨（Lumen Ash / Choir Thread / Saint Glass / Echo Script）と unlock 状態を表示
- Hub パネルで loadout 候補の解放済み/未解放一覧（Weapons / Offhands / Sigils）を表示し、出撃前に unlock 影響を確認可能
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
  - mission 8系統ローテーション表示（Purge Nest 〜 Echo Rescue） + contract route bias 適用
  - EncounterDirector による biome/sector/room graph 進行表示（Ember Ossuary / Moon Reservoir）
  - room tag 連動の wave spawn table（arena / traversal / elite / reward / secret / boss-approach）
  - 取得 relic の stat modifier を combat resource/damage へ反映（dash cost / guard mitigation / parry bonus / room-clear focus 等）
  - continue snapshot に route style + relic modifier を保存し、Menu continue 表示へ反映
  - continue snapshot に roomId を保存し、起動時に mission/room/vitals/relic を sandbox へ再適用
  - continue snapshot に missionId を保存し、mission 表示名変更に影響されない復帰解決へ移行（旧 save は missionName 互換復帰）
  - boss-approach room 到達時に biome 別の Warden stub phase readout を HUD 表示（Ember/Moon）

## サンドボックス操作（flat-screen）

- `LMB` / `Space`: primary attack
- `RMB`: guard
- `F`: parry
- `Q`: offhand module
- `Shift`: dash
- `A` / `D`: reward 選択時の左右移動
- `E`: reward 決定（通常時は loadout rotate）

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
    debug/
      PerfHud.ts
  game/
    state/
      GameState.ts
      GameStateMachine.ts
    director/
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

Phase 4 継続として、Hub unlock/craft の実戦ロードアウト反映、Ember/Moon boss の本戦挙動、Settings 値の実ランタイム反映（音量/UI スケール/快適性設定）を実装します。
