# Reforge Phase6: Authored Setpiece Integration

## 目的
- biome ごとの arena visual preset に authored setpiece anchor を追加し、ライト/VFX の当たり先をルーム文脈に寄せる。

## 非目標
- メッシュ配置や新規アセット追加。
- ボス挙動ロジックの再設計。

## 対象範囲
- `src/content/biomes/ArenaDeviceVisualPresets.ts`
- `src/world/WorldAssembler.ts`

## マイルストーン
1. preset 定義に setpiece anchor（sweep/caustic/flare）を追加する。
2. `WorldAssembler` が anchor を lerp で追従するよう更新する。
3. typecheck/build を通す。

## 受け入れ条件
- 各 biome preset が anchor を持つ。
- world lighting が anchor を利用して遷移する。
- `npm run typecheck` と `npm run build` が成功。

## 検証コマンド
- `npm run typecheck`
- `npm run build`

## 既知の blocker
- authored room mesh 側の hook は別タスク。

## feature flag / rollback
- 破綻時は anchor 適用式を neutral preset 値に戻せばロールバック可能。
