# Task: reforge-phase4-boss-contracts

## 目的
Phase 4 の boss-approach 実装を stub 表示から進め、biome ごとの multi-phase behavior contract をデータ駆動で導入する。

## 非目標
- biome boss の本戦 AI / arena mutation フル実装
- 新 biome（Birch / Obsidian / Dawn / Final Zone）の追加
- XR 専用ボス演出の最終調整

## 対象範囲
- `src/game/encounters/` に boss contract 定義を追加
- `CombatSandboxDirector` を contract 解決・phase 遷移・phase 効果適用に対応
- HUD の boss 表示を stub 文言から contract 文言へ更新
- README / architecture / progress を現状に合わせて更新

## マイルストーン
- [x] M1: 計画作成と適用スコープ確定
- [x] M2: boss contract 定義と biome マッピング追加
- [x] M3: sandbox phase 遷移ロジックと敵圧パラメータ連動
- [x] M4: HUD/readout 文言更新
- [x] M5: docs/progress 更新
- [x] M6: typecheck/build

## 受け入れ条件
- [x] boss-approach 中に biome ごとの contract 名と現在 phase が HUD に表示される
- [x] phase 遷移が時間・戦闘リソース条件で自動進行する
- [x] phase ごとの補正（少なくとも攻撃間隔/被ダメ係数の一部）が戦闘へ反映される
- [x] `npm run typecheck` と `npm run build` が成功する

## 検証コマンド
- `npm run typecheck`
- `npm run build`

## 既知 blocker
- boss encounter は room 内 wave 代理であり、本戦専用ボス actor は未導入
- biome 拡張前のため contract は Ember/Moon の 2 biome のみ実装

## Feature Flag / Rollback
- `CombatSandboxDirector.resolveBossContract` を常に `null` 返却へ戻せば contract を無効化可能
- `BOSS_CONTRACTS` から biome entry を削除すると該当 biome は boss readout を非表示に戻せる
