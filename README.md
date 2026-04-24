# Lumen Pilgrimage: Reforge

Lumen Pilgrimage を、旧 ritual/glyph デモ構成から **XR + flat 両対応のアクション探索ゲーム基盤**へ移行中です。現状は Phase 2 の第2スライスとして、Hub の戦闘サンドボックスで guard/parry/telegraph 読み合いを確認できる状態です。

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

## 現在の実装範囲（Phase 1 + Phase 2 slice2）

- 新エントリ: `AppBootstrap` → `Game`
- state machine（Boot〜EndlessCollapse）
- Desktop/XR 入力抽象（ActionMap）
- `SaveManager` / `SettingsStore`
- `PerfHud`（簡易 FPS 監視）
- Hub skeleton (`PilgrimsBelfryScene`)
- HUD / Menu の最小 UI
- combat sandbox (`CombatSandboxDirector`)
  - 主武器 2 種（Prism Blade / Censer Carbine）
  - 副手段 2 種（Ward Aegis / Grasp Tether）
  - 仮敵 3 種（Ash Mote / Candle Penitent / Furnace Thurifer）
  - guard / parry 分離
  - telegraph 読み合い + stagger リワード

## サンドボックス操作（flat-screen）

- `LMB` / `Space`: primary attack
- `RMB`: guard
- `F`: parry
- `Q`: offhand module
- `Shift`: dash
- `E`: loadout rotate

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

Phase 2 継続として、tutorial room、hit reaction / damage-stagger の本番分離、敵 archetype 別 telegraph と遭遇型の拡張を進めます。
