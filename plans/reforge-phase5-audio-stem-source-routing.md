# Reforge Phase 5: Audio Stem Source Routing

## 目的
`AudioDirector` の stem target（exploration / threat / combat / clutch / boss）を、HUD 表示だけではなく実際の WebAudio gain bus に接続できる実行基盤へ拡張する。

## 非目標
- 新規 BGM アセットの追加
- biome 別 stem 音源の作曲・調整
- reverb / occlusion の本実装

## 対象範囲
- `src/engine/audio/AudioDirector.ts`
- `README.md`

## マイルストーン
- Done: stem ごとの GainNode bus を AudioListener 入力へ接続
- Done: stem source の登録/解除 API（`registerStemSource` / `unregisterStemSource`）を追加
- Done: tick 時に stem smoothing 値を gain bus へ反映
- Done: 型検証 / build 検証

## 受け入れ条件
- `MusicDirector` の mix target が AudioDirector の gain bus に反映される
- 外部 source node を stem 単位で差し替え可能
- `npm run typecheck` / `npm run build` が成功する

## 検証コマンド
- `npm run typecheck`
- `npm run build`

## 既知の blocker
- 実音源（AudioBuffer/MediaElement）ロードは未実装のため、bus 接続のみ

## Feature Flag / Rollback
- 問題時は `registerStemSource` を呼ばなければ無音のまま従来同等動作。
