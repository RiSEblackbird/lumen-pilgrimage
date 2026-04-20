# Task: lumen-pilgrimage-webxr

## 目的
Three.js r184 + TypeScript で WebXR VR 対応の Lumen Pilgrimage 体験を実装し、指定ファイル構成に沿った最小実装を完成させる。

## 非目標
- 高品質アセット制作
- ネットワーク同期
- 本格的な音源管理最適化

## 対象範囲
- ビルド基盤 (Vite + TypeScript)
- WebXR アプリ実装
- Sanctuary / Glyph / Probe / Kelvin / UI / Export 各モジュール
- README / docs 更新

## マイルストーン
- [x] M1: 計画作成
- [x] M2: プロジェクト基盤と依存セットアップ
- [x] M3: コア VR 体験実装 (WebXR, controller ray, ritual state)
- [x] M4: Probe/Kelvin/Spirit vision 機能実装
- [x] M5: ドキュメント更新
- [x] M6: 検証・最終確認

## 受け入れ条件
- [x] TypeScript + Three.js r184 でビルド可能
- [x] `WebGLRenderer` + `VRButton` + `setAnimationLoop` 使用
- [x] `local-floor` 参照空間設定
- [x] XR controller ray で glyph 選択可能
- [x] 5 ritual domains の状態遷移実装
- [x] `LightProbeGrid` / `ColorUtils.setKelvin` / `LightProbeGridHelper` を利用
- [x] spirit vision トグルで helper 可視化
- [x] Final ritual で dawn-altar 開放
- [x] Optional export API 実装
- [x] README/docs 更新

## 検証コマンド
- `npm run typecheck` ✅
- `npm run build` ✅

## 既知 blocker
- なし

## Feature Flag / Rollback
- なし（単一 MVP 実装）

## 再開コマンド
- `cd /workspace/lumen-pilgrimage && git status -sb`
- `npm run dev`
