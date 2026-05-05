# Reforge Phase 6: Particle Director Arena Hook Integration

## 目的
- Arena mutation の channel 圧（hazard/focus/guard/overburn）を XR safe な world-side particle 演出へ接続し、postprocess 依存なしの視覚フィードバックを強化する。

## 非目標
- 新しい biome room geometry の量産。
- 戦闘ロジックや敵 AI の再設計。
- 高コストな volumetric/postprocess 演出の導入。

## 対象範囲
- `src/engine/render/ParticleDirector.ts` の新規追加。
- `src/core/Game.ts` への統合（tick/update/hud 反映）。
- HUD に particle runtime 状態を表示。
- `docs/architecture.md` に責務を追記。

## マイルストーン
| ID | 内容 | 状態 |
| --- | --- | --- |
| M1 | ParticleDirector 実装（pooled emitter + channel weights） | Done |
| M2 | Game 統合（arena hooks 入力、tick、HUD 連携） | Done |
| M3 | ドキュメント更新・型検証・build 検証 | Done |

## 受け入れ条件
- arena visual hooks を入力すると particle intensity と pulse が更新される。
- hub idle 時は particle 出力が沈静化する。
- HUD に particle system の状態ラベルが表示される。
- `npm run typecheck` と `npm run build` が成功する。

## 検証コマンド
- `npm run typecheck`
- `npm run build`

## 既知の blocker
- browser screenshot tool が本セッションでは利用できないため、実画面キャプチャは未取得。

## Feature Flag / Rollback
- 既存処理を壊した場合は `Game` で `ParticleDirector` 呼び出しを削除すれば従来挙動へ戻せる。
