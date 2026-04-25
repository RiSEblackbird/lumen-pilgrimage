# reforge-phase6-arena-device-runtime

## 目的
boss phase ごとの `arenaMutationSummary` を、HUD の文字列だけでなく gameplay 側で扱えるデータ駆動の arena device runtime へ拡張し、今後の geometry/VFX 接続先を確立する。

## 非目標
- 実ジオメトリの配置やシェーダー実装
- 新規アセット導入
- ボス契約/フェーズ定義の全面改稿

## 対象範囲
- `ArenaMutationDirector` に biome/device ごとの runtime effect 定義を追加
- sandbox 更新ループへ arena device effect を統合
- HUD へ device effect の可読ラベルを追加
- 進捗ファイル更新

## マイルストーン
1. ArenaMutationDirector へ effect runtime API を実装する
2. CombatSandboxDirector で effect の tick/適用を実装する
3. HudManager に effect ラベルを表示し、型を更新する
4. typecheck/build/check を通して進捗ファイルを更新する

## 受け入れ条件
- arena mutation が biome/device ごとに effect 種別（hazard/focus-drain/overburn/guard-tax）を持つ
- boss 戦中、effect の出力が objective/HUD へ反映される
- `npm run check` が成功する

## 検証コマンド
- `npm run typecheck`
- `npm run build`
- `npm run check`

## 既知の blocker
- 3D geometry/VFX フックは別タスク（world assembler 後）

## feature flag / rollback 方針
- 追加 API は既存 snapshot を壊さない後方互換形で追加
- 問題時は `ArenaMutationDirector` の新 API 呼び出しを除去し、従来ラベル表示のみへロールバック可能
