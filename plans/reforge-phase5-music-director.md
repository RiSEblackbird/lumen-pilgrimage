# Reforge Phase 5: Music Director Foundation

## 目的
- biome / combat / boss phase に応じて探索・脅威・戦闘・クラッチ stem をデータ駆動で切り替える `MusicDirector` 基盤を導入し、HUD へ現在のミックス状態を可視化する。

## 非目標
- 実音源アセットの追加。
- WebAudio の本格バス実装（この変更では mix 状態の制御と表示に限定）。

## 対象範囲
- `src/engine/audio/MusicDirector.ts` を新規追加。
- `CombatSandboxDirector` へ `MusicDirector` を統合し、run 状態に応じた stem ミックスラベルを生成。
- HUD 表示へ music ミックス情報を追加。
- README / architecture ドキュメントの更新。

## マイルストーン
1. `MusicDirector` 実装（biome motif + stem ミックス）。
2. `CombatSandboxDirector` 連携（combat 密度 / overburn / boss phase を入力）。
3. HUD 表示更新と文書更新。

## 受け入れ条件
- `MusicDirector` が biome ごとに motif を切り替える。
- 戦闘状態で stem ミックス（exploration/threat/combat/clutch/boss）が変化する。
- HUD で現在の music mix ラベルを確認できる。
- `npm run typecheck` / `npm run build` / `npm run validate:content` が成功する。

## 検証コマンド
- `npm run typecheck`
- `npm run build`
- `npm run validate:content`

## 既知の blocker
- 実音声ステム再生基盤は未導入のため、今回は表示・制御ロジックのみ。

## feature flag / rollback 方針
- フラグは使わず、問題時は `MusicDirector` 呼び出しと HUD フィールドを差し戻して rollback 可能。
