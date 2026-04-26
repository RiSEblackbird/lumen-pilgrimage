# reforge-phase6-biome-transition-spectacle

## 目的
`WorldAssembler` を Phase 6 向けに拡張し、biome 遷移時に light sweep / altar flare / caustic proxy をデータ駆動で再生できるようにする。hub と expedition の切替が「色替えだけ」に見えない土台を作る。

## 非目標
- 各 biome 専用の 3D メッシュ・VFX アセット追加
- post-processing の導入
- ボス専用 cinematic の実装

## 対象範囲
- `BiomeMoodDefs` に遷移演出パラメータを追加
- `WorldAssembler` に遷移ビート再生ロジックを追加
- 進捗管理ファイルの更新

## マイルストーン
1. biome ごとの transition profile を content 定義へ追加する（Done）
2. `WorldAssembler` で transition state を持ち、sweep / flare / caustic の light を更新する（Done）
3. typecheck/build/check を実行して整合を確認する（Done）

## 受け入れ条件
- biome 切替時に key/fill 以外の演出チャンネル（sweep / flare / caustic）が再生される
- arena pressure と共存し、tick で安定して減衰する
- `npm run typecheck` / `npm run build` / `npm run check` が成功する

## 検証コマンド
- `npm run typecheck`
- `npm run build`
- `npm run check`

## 既知の blocker
- 実アセット未接続のため、視覚差はライト挙動中心

## feature flag / rollback 方針
- `WorldAssembler` の transition 更新処理を削除し、既存 key/fill 運用へ即時ロールバック可能
- profile 定義が欠けた biome は fallback で hub profile を使用
