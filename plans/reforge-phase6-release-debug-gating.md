# Reforge Phase 6: release debug gating

## 目的
- release build に debug UI を残さないため、開発専用 HUD を本番バンドル実行時に自動無効化する。
- README の build/check/release 手順を明示し、検証導線を固定化する。

## 非目標
- PerfHud の機能追加や可視化項目の拡張。
- HUD/Menu のゲーム内演出刷新。

## 対象範囲
- `src/core/GameConfig.ts`
- `src/core/Game.ts`
- `README.md`

## マイルストーン
1. GameConfig に release 時の debug UI 制御フラグを追加する。
2. Game 初期化で PerfHud をフラグ制御に変更し、無効時は更新処理をスキップする。
3. README に release build 手順と debug UI 非表示仕様を追記する。

## 受け入れ条件
- `import.meta.env.DEV` が false の実行で PerfHud が描画されない。
- `npm run check` が成功する。
- README に check/release 手順が明記されている。

## 検証コマンド
- `npm run typecheck`
- `npm run build`
- `npm run check`

## 既知の blocker
- なし。

## feature flag / rollback
- `DEFAULT_GAME_CONFIG.enableDebugHud` を `true` に戻せば即時ロールバック可能。
