# Reforge Phase 5: Music Runtime Bus Wiring

## 目的
`MusicDirector` が算出する stem mix（exploration / threat / combat / clutch / boss）をランタイムの音響層へ接続し、HUD 表示と実オーディオ遷移の責務を分離した状態で同期させる。

## 非目標
- 実オーディオアセット（BGM stem wav/ogg）の追加
- DAW 相当のミキシングやマスタリング
- biome 専用 reverb/occlusion の完全実装

## 対象範囲
- `src/engine/audio/MusicDirector.ts`
- `src/engine/audio/AudioDirector.ts`（新規）
- `src/game/sandbox/CombatSandboxDirector.ts`
- `src/core/Game.ts`

## マイルストーン
- Done: `MusicDirector` snapshot に stem 値を追加
- Done: `AudioDirector` を新設し、music stem target/smoothing を集中管理
- Done: `Game` で run/hub 状態に応じて `AudioDirector` へ mix を供給
- Done: 型検証 / build 検証

## 受け入れ条件
- `MusicDirector` の mix が HUD 文言だけでなく `AudioDirector` に渡る
- run 中は encounter 状態で stem target が更新される
- hub 待機中は ambient 固定ミックスへ戻る
- `npm run typecheck` / `npm run build` が通る

## 検証コマンド
- `npm run typecheck`
- `npm run build`

## 既知の blocker
- 実際の BGM source node は未接続（現時点は bus 値同期まで）

## Feature Flag / Rollback
- 新規 `AudioDirector` が問題を起こす場合、`Game.tick` の `applyMusicMix` / `setHubAmbientMix` 呼び出しを外せば旧 HUD-only 挙動へ戻せる。
