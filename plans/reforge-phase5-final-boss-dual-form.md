# reforge-phase5-final-boss-dual-form

## 目的
Final Zone のボスを 2 form 構成としてデータ駆動で表現し、phase 進行に応じて UI 表示名が切り替わる基盤を導入する。

## 非目標
- ボス AI のフル再実装
- 新規 3D アセットやアニメーション実装
- ダメージモデル全体の再チューニング

## 対象範囲
- `src/game/encounters/BossContracts.ts`
- `src/content/enemies/EnemyCatalog.ts`
- `src/game/director/BossActorDirector.ts`
- `scripts/validate-content.mjs`

## マイルストーン
1. `BossContract` に form 定義（phase 紐付け）を追加
2. Final Zone に第2形態 enemy id を追加
3. `BossActorDirector` の snapshot 表示名を phase 連動 form 名へ切替
4. content validation で form 参照整合を検証

## 受け入れ条件
- Final Zone contract に 2 つの form が定義される
- phase 3 到達時に `BossActorSnapshot.bossName` が第2形態名へ切替される
- form の enemy id が EnemyCatalog に存在しない場合 `validate:content` が失敗する
- `npm run check` が成功する

## 検証コマンド
- `npm run typecheck`
- `npm run build`
- `npm run validate:content`
- `npm run validate:release`
- `npm run check`

## 既知の blocker
- なし

## feature flag / rollback 方針
- 後方互換として `bossForms` 未定義時は既存 `bossName` を使用する。
- 問題時は `bossForms` を削除すれば旧挙動へ即時ロールバック可能。
