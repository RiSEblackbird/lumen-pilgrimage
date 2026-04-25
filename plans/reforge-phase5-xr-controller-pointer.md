# reforge-phase5-xr-controller-pointer

## 目的
HubのXR端末選択をHMD前方固定rayから、接続済みコントローラー（left/right）由来rayへ置換し、VR/flatの操作等価性と誤選択耐性を高める。

## 非目標
- Hub端末の3Dモデル/アニメーション全面改修
- 手指ジェスチャーや2段階以上の入力シーケンス導入
- Expedition中の戦闘照準ロジック変更

## 対象範囲
- `XRActionAdapter` に controller pointer ray 取得機能を追加
- `PilgrimsBelfryScene` に複数rayのヒット解決を追加
- `Game` のHubポインタ更新を controller優先へ差し替え
- README / architecture の挙動説明更新

## マイルストーン
1. XR入力層でcontroller接続状態とray取得を実装
2. Hub端末選択で複数rayの最短ヒットを解決
3. GameのHMD fallbackを廃止し、wrist prompt/labelを更新
4. typecheck/build/checkを通す

## 受け入れ条件
- XR Hub時、left/right controller rayのいずれかが端末をヒットすると選択が更新される
- 複数controllerが同時ヒットした場合は距離の近い端末を優先する
- controller rayが取れない場合は「controller aim required」系promptを表示し、HMD前方自動選択しない
- `npm run typecheck` と `npm run build` が成功する

## 検証コマンド
- `npm run typecheck`
- `npm run build`
- `npm run check`

## 既知の blocker
- 実機XR controller接続テストはこの環境では未実施（型安全/ビルド検証で代替）

## feature flag / rollback
- 追加フラグなし。問題時は `Game.updateVrHubPointer` と `XRActionAdapter.getControllerPointerRays` の呼び出し経路を元のcamera rayへロールバック可能。
