export interface SigilDef {
  readonly id: string;
  readonly displayName: string;
  readonly focusCost: number;
  readonly cooldownSeconds: number;
  readonly summary: string;
}

export const SIGIL_DEFS: readonly SigilDef[] = [
  { id: 'blink-dash', displayName: 'Blink Dash', focusCost: 18, cooldownSeconds: 7, summary: '短距離転移で危険地帯を横断しつつ次弾を回避する。' },
  { id: 'shock-nova', displayName: 'Shock Nova', focusCost: 26, cooldownSeconds: 10, summary: '周囲に衝撃波を展開し、近接圧を剥がす。' },
  { id: 'prism-mine', displayName: 'Prism Mine', focusCost: 22, cooldownSeconds: 12, summary: '設置した地雷が連鎖閃光を起こし弱点を露出させる。' },
  { id: 'silence-bell', displayName: 'Silence Bell', focusCost: 24, cooldownSeconds: 14, summary: '詠唱系の敵を沈黙させ、support 行動を遮断する。' },
  { id: 'moon-veil', displayName: 'Moon Veil', focusCost: 28, cooldownSeconds: 15, summary: '短時間の幻幕で lock-on 弾を逸らしながら移動する。' },
  { id: 'ash-cyclone', displayName: 'Ash Cyclone', focusCost: 30, cooldownSeconds: 16, summary: '前方扇形に灰旋風を生成し、群れを押し戻す。' },
  { id: 'root-snare', displayName: 'Root Snare', focusCost: 20, cooldownSeconds: 11, summary: '床面拘束で fast flanker の突進を止める。' },
  { id: 'sun-lance', displayName: 'Sun Lance', focusCost: 32, cooldownSeconds: 18, summary: '高貫通の聖槍を放ち、armor 部位に強い。' },
  { id: 'blackglass-mirror', displayName: 'Blackglass Mirror', focusCost: 25, cooldownSeconds: 13, summary: '短時間の反射壁を展開して投射物を跳ね返す。' },
  { id: 'choir-pulse', displayName: 'Choir Pulse', focusCost: 21, cooldownSeconds: 9, summary: '敵の telegraph を強調し、parry の成功窓を補助する。' },
  { id: 'gravity-knot', displayName: 'Gravity Knot', focusCost: 29, cooldownSeconds: 15, summary: '重力結節で敵群を一点へ引き寄せる。' },
  { id: 'mercy-flare', displayName: 'Mercy Flare', focusCost: 27, cooldownSeconds: 17, summary: '緊急回復と短時間の guard 補強を同時に行う。' }
] as const;
