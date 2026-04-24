export interface RelicDef {
  readonly id: string;
  readonly displayName: string;
  readonly rarity: 'common' | 'rare' | 'mythic';
  readonly summary: string;
}

export const RELIC_DEFS: readonly RelicDef[] = [
  { id: 'parry-ember-ring', displayName: 'Parry Ember Ring', rarity: 'common', summary: 'Perfect parry 後 3 秒間、主武器の crit 率が上昇する。' },
  { id: 'shock-ink-script', displayName: 'Shock Ink Script', rarity: 'rare', summary: '弱点 hit 時に近傍へ shock chain が伝播する。' },
  { id: 'dash-furnace-spine', displayName: 'Dash Furnace Spine', rarity: 'common', summary: 'dash 貫通時に projectile を燃料化して Focus を回収する。' },
  { id: 'overburn-cinder-trail', displayName: 'Overburn Cinder Trail', rarity: 'rare', summary: 'Overburn 中の移動経路に短時間の炎跡を残す。' },
  { id: 'moonbreak-prayer', displayName: 'Moonbreak Prayer', rarity: 'common', summary: 'guard break 直後に月霧爆発を発生し、周囲を stagger させる。' },
  { id: 'hushed-thurible', displayName: 'Hushed Thurible', rarity: 'common', summary: 'offhand 使用後 2 秒間、被弾時の guard 消費を軽減する。' },
  { id: 'cathedral-fuse', displayName: 'Cathedral Fuse', rarity: 'rare', summary: '連続撃破で overburn 減衰が一時的に遅くなる。' },
  { id: 'bloodglass-resonator', displayName: 'Bloodglass Resonator', rarity: 'mythic', summary: '低体力時に telegraph が強調され、parry 成功報酬が増える。' },
  { id: 'lumen-votive', displayName: 'Lumen Votive', rarity: 'common', summary: 'room clear 時の Focus 回復量が増える。' },
  { id: 'ward-carillon', displayName: 'Ward Carillon', rarity: 'common', summary: 'guard 中の移動速度低下を軽減する。' },
  { id: 'penitent-spike', displayName: 'Penitent Spike', rarity: 'rare', summary: 'stagger 中の敵へ与えるダメージが増加する。' },
  { id: 'null-chalice', displayName: 'Null Chalice', rarity: 'rare', summary: '被弾時に確率で Focus を少量回収する。' },
  { id: 'hymn-of-ash', displayName: 'Hymn of Ash', rarity: 'common', summary: 'telegraph 中の敵に初撃を当てると追加ダメージが発生する。' },
  { id: 'oracle-needle', displayName: 'Oracle Needle', rarity: 'mythic', summary: 'weakpoint hit で sigil cooldown を短縮する。' },
  { id: 'mirror-wake', displayName: 'Mirror Wake', rarity: 'rare', summary: 'dash 直後の 1 発目が反射弾扱いになり shield を貫通する。' },
  { id: 'grave-censer', displayName: 'Grave Censer', rarity: 'common', summary: '敵撃破時に小規模な DoT 雲を残す。' },
  { id: 'sunshard-buckle', displayName: 'Sunshard Buckle', rarity: 'rare', summary: 'overburn 50 以上で主武器の stagger 値が上がる。' },
  { id: 'veil-thread', displayName: 'Veil Thread', rarity: 'common', summary: 'dash 消費 Focus を低減し、連続回避を支援する。' },
  { id: 'anchor-chime', displayName: 'Anchor Chime', rarity: 'common', summary: 'support enemy への初撃で brief silence を付与する。' },
  { id: 'covenant-gear', displayName: 'Covenant Gear', rarity: 'rare', summary: '連続 parry 成功で guard 自動回復速度が上昇する。' },
  { id: 'thorned-litany', displayName: 'Thorned Litany', rarity: 'rare', summary: '近接被弾時に反撃棘を展開し、群れを剥がす。' },
  { id: 'choir-axis', displayName: 'Choir Axis', rarity: 'mythic', summary: 'mission objective 更新時に overburn を即時獲得する。' },
  { id: 'saint-glass-node', displayName: 'Saint Glass Node', rarity: 'mythic', summary: 'HP 最大時に受ける初回被弾を無効化する。' },
  { id: 'executor-seal', displayName: 'Executor Seal', rarity: 'mythic', summary: 'ボス/エリートへの初回 stagger で大幅な追撃猶予を得る。' }
] as const;
