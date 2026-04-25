# reforge-phase5-run-summary-stats

## 目的
DreamExporter 廃止後の代替として、run 中の戦闘統計を収集して要約できる `StatsTracker` / `RunSummaryBuilder` を導入し、HUD へ可視化する。

## 非目標
- 永続 save slot への run summary 履歴保存
- 新モード追加や戦闘バランス再調整
- UI レイアウト刷新

## 対象範囲
- `src/game/state/StatsTracker.ts`
- `src/engine/save/RunSummaryBuilder.ts`
- `src/game/sandbox/CombatSandboxDirector.ts`
- `src/game/ui/HudManager.ts`
- `src/core/Game.ts`
- `README.md`

## マイルストーン
1. StatsTracker/RunSummaryBuilder の実装
2. CombatSandboxDirector でイベント計測を接続
3. HUD 表示と非run時の表示整合
4. typecheck/build/check の実行と README 更新

## 受け入れ条件
- run 中にキル数・与ダメ・被ダメ・parry・dash・Ash Sight 使用回数を追跡できる
- 統計から 1 行の run summary ラベルが生成される
- HUD に summary ラベルが表示される
- `npm run check` が成功する

## 検証コマンド
- `npm run typecheck`
- `npm run build`
- `npm run check`

## 既知の blocker
- なし

## feature flag / rollback 方針
- フラグ追加は不要。問題時は HUD 表示行と tracker 呼び出しを切り戻し可能。
