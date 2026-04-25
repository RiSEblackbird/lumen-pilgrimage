# reforge-phase8-release-guardrails

## 目的
- release build から legacy 依存（ritual/glyph/export/codex）と debug helper 痕跡を機械的に検出し、Phase 8 の ship 前品質ゲートを強化する。

## 非目標
- 実際の戦闘挙動・バランス調整の再設計。
- UI/UX の新規機能追加。

## 対象範囲
- `scripts/` の検証スクリプト追加。
- `package.json` と CI の検証コマンド更新。
- `README.md` の release 手順更新。

## マイルストーン
1. release ガード用スクリプトを実装し、src/dist の禁止トークン検査を追加。
2. `npm run check` と CI に release 検証を組み込み。
3. README の検証手順を更新し、コマンドを明文化。
4. mission など player-facing テキストに legacy 語彙（ritual/glyph）が再流入しないよう content validation を追加。

## 受け入れ条件
- `npm run validate:release` が成功する。
- `npm run check` が成功する。
- CI に content/release validation が追加される。
- `npm run validate:content` で mission 文字列の legacy 語彙混入を検出できる。

## 検証コマンド
- `npm run validate:release`
- `npm run check`

## 既知の blocker
- なし。

## feature flag / rollback 方針
- スクリプト追加のみのため feature flag 不要。
- 問題発生時は `validate:release` を一時的に `npm run check` から切り離してロールバック可能。
