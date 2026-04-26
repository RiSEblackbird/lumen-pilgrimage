# reforge-phase6-boss-arena-device-presets

## 目的
`ArenaMutationDirector.visualHooksSnapshot()` の出力を受けて、biome ごとに差別化された arena device のライティング挙動を `WorldAssembler` へ接続し、boss 戦の phase 圧力が視覚的に判別できる状態を作る。

## 非目標
- 新規 3D アセット導入
- shader 実装やポストプロセス追加
- boss contract の難易度再調整

## 対象範囲
- biome 別 arena visual preset のデータ定義を追加
- `WorldAssembler` が dominant channel / dominant device を参照して sweep/flare/caustic/fog の挙動を変えるよう更新
- `reforge-progress.json` の in-progress / next actions を最新化

## マイルストーン
1. preset データ定義を追加し、biome ごとの visual channel weight を表現できる形にする
2. `WorldAssembler.applyArenaVisualHooks` と `tickTransitionFx` を更新し、phase 圧力が light/fog へ反映されるようにする
3. typecheck/build/check を実行し、進捗メタデータを更新する

## 受け入れ条件
- `ArenaDeviceVisualHooks` の channel が biome preset と合成され、同一 pressure でも biome で見え方が変わる
- dominant device が flare/caustic/sweep の偏りに反映される
- `npm run check` が成功する

## 検証コマンド
- `npm run typecheck`
- `npm run build`
- `npm run check`

## 既知の blocker
- authored mesh / particle の実装は別タスク（phase6 VFX/material pass）

## feature flag / rollback 方針
- preset が見つからない場合は neutral preset にフォールバックする
- 問題が発生した場合は `WorldAssembler` の preset 適用ロジックを削除し、pressure ベースの既存挙動へ戻せる
