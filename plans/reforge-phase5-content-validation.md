# Reforge Phase 5: Content Validation Gate

## 目的
- Reforge のデータ駆動コンテンツ（biome / mission / loadout / relic / boss contract）が最小実装基準を満たしているかを、リリース前に機械検証できるようにする。
- release build に debug 文言が混入していないかをチェックし、ship 前の見落としを減らす。

## 非目標
- 実ゲームロジックの大規模変更。
- 既存データ定義の全面再配置。

## 対象範囲
- `scripts/validate-content.mjs` の追加。
- `package.json` に検証スクリプト導線を追加。
- `README.md` に実行手順を追記。

## マイルストーン
1. データ定義ファイルから主要クォータを検証するスクリプトを実装する。
2. debug 文言スキャンを追加する。
3. npm script と README を更新し、検証コマンドを実行して通過を確認する。

## 受け入れ条件
- `npm run validate:content` が成功し、以下を最低限検証する:
  - biomes 6（hub 外の campaign order）
  - missions 8
  - weapons 4
  - offhands 4
  - sigils 12
  - relics 24
  - boss contracts 6
- `src/` 内の dev/placeholder 文言を release guard として検知できる。
- `npm run check` が成功する。

## 検証コマンド
- `npm run validate:content`
- `npm run typecheck`
- `npm run build`
- `npm run check`

## 既知の blocker
- TypeScript ソースを実行せずに検証するため、初版は source text parse ベースで実装する。

## feature flag / rollback
- script 追加のみのため feature flag 不要。
- 問題時は `validate:content` script を削除すれば即時ロールバック可能。
