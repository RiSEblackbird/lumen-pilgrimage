# Task: reforge-phase3-reward-foundation

## 目的
Phase 3 基盤を拡張し、run 内成長の核となる relic/sigil データ定義と room clear reward 選択フローを sandbox に導入する。

## 非目標
- hub 恒久成長の UI 実装
- biome 固有 room graph 実装
- save への relic 永続化

## 対象範囲
- 主武器 4 archetype / 副手段 4 module のデータ拡張
- active sigils 12 個のデータ定義追加
- relic 24 個のデータ定義追加
- RewardDirector による選択式報酬ロジック導入
- CombatSandboxDirector/HUD 連携更新
- README / docs 更新

## マイルストーン
- [x] M1: 計画作成と現状確認
- [x] M2: items 定義（weapon/offhand/sigil/relic）更新
- [x] M3: RewardDirector と sandbox 連携
- [x] M4: HUD 表示更新
- [x] M5: ドキュメント更新
- [x] M6: typecheck/build 検証

## 受け入れ条件
- [x] 武器4・副手段4・sigil12・relic24 の定義がコード上に存在
- [x] wave clear 後に reward 選択状態へ入り、入力で取得できる
- [x] HUD で reward と獲得 relic を確認できる
- [x] `npm run typecheck` と `npm run build` が成功

## 検証コマンド
- `npm run typecheck`
- `npm run build`

## 既知 blocker
- relic 効果そのものはまだ数値シミュレーションへ未適用（現時点は build 方向性の固定が目的）

## Feature Flag / Rollback
- reward 選択は `CombatSandboxDirector` の `pendingReward` で局所制御可能
- 不具合時は `RewardDirector` 呼び出しを除去して旧 sandbox ループへロールバック可能

## 再開コマンド
- `cd /workspace/lumen-pilgrimage && git status -sb`
- `npm run dev`
