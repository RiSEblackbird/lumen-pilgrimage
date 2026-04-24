# Task: reforge-phase3-encounter-foundation-slice1

## 目的
Phase 3 の初手として、戦闘サンドボックスに enemy coordinator と mission variety のデータ定義を導入し、遭遇密度制御と目標提示の土台を作る。

## 非目標
- 本番 EncounterDirector の実装
- 新規敵アセット追加
- biome 連動の room graph 実装

## 対象範囲
- `EnemyCoordinator` を追加して melee token / ranged pressure budget を実装
- mission 8系統のデータ定義を `MissionTypes` として追加
- `CombatSandboxDirector` に coordinator 評価と mission ローテーションを接続
- HUD に mission 名と pressure 状況を表示
- README / docs/architecture 反映

## マイルストーン
- [x] M1: 計画作成とスコープ固定
- [x] M2: EnemyCoordinator 実装
- [x] M3: MissionTypes 実装
- [x] M4: Sandbox + HUD 統合
- [x] M5: typecheck/build 検証

## 受け入れ条件
- [x] 一度に攻撃可能な敵が coordinator の予算で制御される
- [x] mission 8系統のデータ定義が存在し、sandbox でローテーション表示できる
- [x] HUD で pressure 情報を確認できる
- [x] `npm run typecheck` / `npm run build` が成功

## 検証コマンド
- `npm run typecheck`
- `npm run build`

## 既知 blocker
- なし

## Feature Flag / Rollback
- coordinator 連携を外せば、enemy の従来処理（attackTimer 到達で即攻撃）へ段階的に戻せる

## 再開コマンド
- `cd /workspace/lumen-pilgrimage && git status -sb`
- `npm run dev`
