import type { RouteStyle } from './EncounterRuleSet';

export interface MissionTypeDef {
  readonly id: string;
  readonly displayName: string;
  readonly summary: string;
  readonly targetObjective: string;
  readonly routeBias: readonly RouteStyle[];
}

export const MISSION_TYPE_DEFS: readonly MissionTypeDef[] = [
  {
    id: 'purge-nest',
    displayName: 'Purge Nest',
    summary: 'Destroy clustered enemy growths before reinforcement thresholds are met.',
    targetObjective: 'Purge hostile nests and secure extraction lanes.',
    routeBias: ['risk', 'standard', 'secret', 'recovery']
  },
  {
    id: 'seal-the-breach',
    displayName: 'Seal the Breach',
    summary: 'Hold multiple seals while enemy squads pressure from layered angles.',
    targetObjective: 'Stabilize breach points and prevent collapse.',
    routeBias: ['standard', 'recovery', 'risk', 'secret']
  },
  {
    id: 'hunt-contract',
    displayName: 'Hunt Contract',
    summary: 'Track an elite target through chained arenas and deny its escape windows.',
    targetObjective: 'Track and execute the marked elite.',
    routeBias: ['risk', 'standard', 'secret', 'recovery']
  },
  {
    id: 'choir-relay',
    displayName: 'Choir Relay',
    summary: 'Carry a core through active kill-zones while under periodic ambush.',
    targetObjective: 'Escort the relay core to the sanctified terminal.',
    routeBias: ['standard', 'recovery', 'secret', 'risk']
  },
  {
    id: 'distillation-chamber',
    displayName: 'Distillation Chamber',
    summary: 'Extract volatile resources from hazard fields under sustained pressure.',
    targetObjective: 'Distill lumen ash and survive hazard surges.',
    routeBias: ['secret', 'standard', 'risk', 'recovery']
  },
  {
    id: 'eclipse-trial',
    displayName: 'Eclipse Trial',
    summary: 'Complete precision challenge constraints while preserving combat tempo.',
    targetObjective: 'Clear trial constraints to claim high-risk rewards.',
    routeBias: ['risk', 'secret', 'standard', 'recovery']
  },
  {
    id: 'warden-antechamber',
    displayName: 'Warden Antechamber',
    summary: 'Survive a stacked pre-boss gauntlet that tests full kit mastery.',
    targetObjective: 'Break through the antechamber before the Warden gate seals.',
    routeBias: ['risk', 'standard', 'recovery', 'secret']
  },
  {
    id: 'echo-rescue',
    displayName: 'Echo Rescue',
    summary: 'Recover vulnerable echo targets while intercepting elite hunters.',
    targetObjective: 'Rescue echoes and escort them to a safe ward circle.',
    routeBias: ['recovery', 'standard', 'secret', 'risk']
  }
] as const;
