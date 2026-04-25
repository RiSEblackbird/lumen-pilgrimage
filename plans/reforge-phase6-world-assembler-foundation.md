# reforge-phase6-world-assembler-foundation

## 目的
hub / expedition の見た目遷移を `Game` の分岐ロジックから分離し、biome ごとの背景・fog・light をデータ駆動で切り替える `WorldAssembler` 基盤を導入する。

## 非目標
- biome 専用メッシュや VFX アセットの新規追加
- post-processing の導入
- room-level authored lighting の最終調整

## 対象範囲
- biome mood 定義を content 層へ追加
- `WorldAssembler` を追加して scene 背景/fog/key-fill light を管理
- `Game` から `WorldAssembler` を呼び出し、hub/expedition と arena pressure を反映
- 進捗管理ファイルの更新

## マイルストーン
1. `BiomeMoodDefs` を追加し、biome ごとの mood パラメータを定義する（Done）
2. `WorldAssembler` を追加し、mood 適用・arena pressure 連動 API を実装する（Done）
3. `Game` に統合して run 状態に応じた呼び出しへ切替える（Done）
4. typecheck/build/check を実行して進捗を更新する（Done）

## 受け入れ条件
- hub と各 biome で background/fog/light パラメータが切り替わる
- boss arena visual hook の pressure を world lighting intensity に反映できる
- `npm run typecheck` / `npm run build` / `npm run check` が成功する

## 検証コマンド
- `npm run typecheck`
- `npm run build`
- `npm run check`

## 既知の blocker
- 実アセットを使った zone 固有 geometry / caustics / volumetric は別タスク

## feature flag / rollback 方針
- `WorldAssembler` 呼び出しを `Game` から除去すれば既存 hub sandbox 表示へ即時ロールバック可能
- mood 定義は `resolveBiomeMood` の fallback で保守され、未知 biome が来ても hub mood へ退避する
