# Lumen Pilgrimage: Reforge

Lumen Pilgrimage を、旧 ritual/glyph デモ構成から **XR + flat 両対応のアクション探索ゲーム基盤**へ移行中です。現状は Phase 4 着手段階として、Hub の戦闘サンドボックスに EncounterDirector を接続し、sector/room 進行に加えて room graph 分岐（risk/recovery/secret）、enemy coordinator 圧制御、reward 選択、relic 取得の基盤を確認できる状態です。

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
- `SaveManager` / `SettingsStore`（slot0 の初期化 + expedition 進行スナップショット自動保存）
- `PerfHud`（簡易 FPS 監視）
- Hub skeleton (`PilgrimsBelfryScene`)
- HUD / Menu の最小 UI（保存済み expedition snapshot を Continue 情報として表示）
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

Phase 4 継続として、Hub 恒久成長 UI、Ember/Moon boss 基盤、continue 復帰時の状態再適用を実装します。
