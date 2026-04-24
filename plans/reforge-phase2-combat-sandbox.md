# Task: reforge-phase2-combat-sandbox-slice1

## 目的
Phase 2 の初回スライスとして、Hub 上で戦闘手触りを確認できる combat sandbox（主武器2種/副手段2種/3種仮敵/基本リソース循環）を導入する。

## 非目標
- 実 biome への遭遇生成
- 本番敵 AI とボス実装
- 完全な HUD デザインとチュートリアル演出

## 対象範囲
- CombatSandboxDirector の追加
- データ駆動の武器/副手段定義の追加
- HUD 表示項目の拡張
- Game ループへの sandbox 接続
- README / docs 更新

## マイルストーン
- [x] M1: 計画作成と対象スコープ確定
- [x] M2: 武器/副手段データ定義を追加
- [x] M3: combat sandbox ロジック（攻撃/ガード/リソース）を実装
- [x] M4: HUD へ loadout と敵残数を表示
- [x] M5: typecheck/build 検証

## 受け入れ条件
- [x] primary attack で敵 HP が減少し、撃破で次対象へ遷移する
- [x] offhand 使用時に Focus 消費と効果分岐が動作する
- [x] HUD に weapon/offhand/enemies が表示される
- [x] 全体が `npm run typecheck` / `npm run build` を通過する

## 検証コマンド
- `npm run typecheck`
- `npm run build`

## 既知 blocker
- なし

## Feature Flag / Rollback
- sandbox は `Game` 内の `CombatSandboxDirector` 接続を外せば無効化可能

## 再開コマンド
- `cd /workspace/lumen-pilgrimage && git status -sb`
- `npm run dev`
