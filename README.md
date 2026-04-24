# Lumen Pilgrimage: Reforge

Lumen Pilgrimage を、旧 ritual/glyph デモ構成から **XR + flat 両対応のアクション探索ゲーム基盤**へ移行中です。現状は Phase 2 の初回スライスとして、Hub で戦闘サンドボックス（主武器/副手段/仮敵）を確認できる状態です。

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

## 現在の実装範囲（Phase 1 + Phase 2 slice1）

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

Phase 2 継続として、guard/parry の明確分離、敵 telegraph の可視化、tutorial room、hit reaction と stagger の実体システムを追加します。
