import { XP_TABLE, getXpForLevel } from "@/constants/gameData";

// XP pacing helpers calibrated to your timing targets
function targetXpPerSecond(level: number): number {
  if (level < 5) return 16; // 4,800 XP in ~5 minutes
  if (level < 20) return 30; // ~108,300 XP in ~60 minutes
  const clamped = Math.min(100, Math.max(20, level));
  const t = (clamped - 20) / 80; // 20 -> 0, 100 -> 1
  return 30 + (12 - 30) * t; // ease down towards long-term average ~12 XP/s
}

function unlockBonusFactor(activityUnlockLevel: number): number {
  // Small boost for later-unlocked activities (max +15%)
  const bonus = Math.min(0.15, Math.max(0, activityUnlockLevel / 700));
  return 1 + bonus;
}

// Dynamic XP calculation for Thieving aligned with target progression times
export function getThievingXp(currentLevel: number, activityUnlockLevel: number): number {
  const clampedLevel = Math.max(1, Math.min(100, Math.floor(currentLevel)));

  const baseTimeByUnlock: Record<number, number> = {
    1: 3000,
    3: 6000,
    6: 9000,
    8: 13500,
    12: 26250,
    16: 33750,
    20: 45000,
    25: 67500,
    30: 90000,
    35: 135000,
    40: 112500,
    50: 180000,
    55: 150000,
    60: 225000,
    70: 270000,
    80: 270000,
    90: 285000,
  };

  const timeTargetsSec: Record<number, number> = {
    5: 5 * 60,
    20: 60 * 60,
    60: 90 * 60 * 60,
    100: 14 * 24 * 60 * 60,
  };

  function avgXpsAt(level: number): number {
    const xpNeeded = getXpForLevel(level);
    const timeSec = timeTargetsSec[level as 5 | 20 | 60 | 100];
    if (!timeSec || timeSec <= 0) return 10;
    return Math.max(1, xpNeeded / timeSec);
  }

  const avg5 = avgXpsAt(5);
  const avg20 = avgXpsAt(20);
  const avg60 = avgXpsAt(60);
  const avg100 = avgXpsAt(100);

  function lerp(a: number, b: number, t: number): number {
    const tt = Math.max(0, Math.min(1, t));
    return a + (b - a) * tt;
  }

  let xpsInstant = 10;
  if (clampedLevel < 5) {
    xpsInstant = avg5;
  } else if (clampedLevel < 20) {
    const t = (clampedLevel - 5) / 15;
    xpsInstant = lerp(avg5, avg20, t);
  } else if (clampedLevel < 60) {
    const t = (clampedLevel - 20) / 40;
    xpsInstant = lerp(avg20, avg60, t) * 0.98;
  } else {
    const t = (clampedLevel - 60) / 40;
    xpsInstant = lerp(avg60, avg100, t) * 0.96;
  }

  const baseTime = baseTimeByUnlock[activityUnlockLevel] ?? 60000;
  const bonus = unlockBonusFactor(activityUnlockLevel);
  const perAction = Math.max(1, Math.floor(xpsInstant * bonus * (baseTime / 1000)));
  return perAction;
}

// Smuggling XP per action to match exact time targets
// We compute an XP/sec target based on desired time-to-levels (5,20,60,100)
// then convert to per-action using the activity's baseTime so speed bonuses increase XP/s
export function getSmugglingXp(currentLevel: number, baseTimeMs: number): number {
  const clampedLevel = Math.max(1, Math.min(100, Math.floor(currentLevel)));

  const timeTargetsSec: Record<number, number> = {
    5: 5 * 60,
    20: 60 * 60,
    60: 90 * 60 * 60,
    100: 14 * 24 * 60 * 60,
  };

  function avgXpsAt(level: number): number {
    const xpNeeded = getXpForLevel(level);
    const timeSec = timeTargetsSec[level as 5 | 20 | 60 | 100];
    if (!timeSec || timeSec <= 0) return 10;
    return Math.max(1, xpNeeded / timeSec);
  }

  const avg5 = avgXpsAt(5);
  const avg20 = avgXpsAt(20);
  const avg60 = avgXpsAt(60);
  const avg100 = avgXpsAt(100);

  function lerp(a: number, b: number, t: number): number {
    const tt = Math.max(0, Math.min(1, t));
    return a + (b - a) * tt;
  }

  let xpsInstant = 10;
  if (clampedLevel < 5) {
    xpsInstant = avg5;
  } else if (clampedLevel < 20) {
    const t = (clampedLevel - 5) / 15;
    xpsInstant = lerp(avg5, avg20, t);
  } else if (clampedLevel < 60) {
    const t = (clampedLevel - 20) / 40;
    xpsInstant = lerp(avg20, avg60, t) * 0.98;
  } else {
    const t = (clampedLevel - 60) / 40;
    xpsInstant = lerp(avg60, avg100, t) * 0.96;
  }

  const perAction = Math.max(1, Math.floor(xpsInstant * (baseTimeMs / 1000)));
  return perAction;
}

export function getInvestigationLabXp(currentLevel: number, activityUnlockLevel: number): number {
  const baseTimeByUnlock: Record<number, number> = {
    1: 15000,
    15: 20000,
    25: 18000,
    35: 22000,
    45: 25000,
    55: 23000,
    65: 24000,
    75: 28000,
    85: 35000,
    95: 40000,
  };
  const baseTime = baseTimeByUnlock[activityUnlockLevel] ?? 20000;
  const baseXps = targetXpPerSecond(currentLevel) * unlockBonusFactor(activityUnlockLevel);

  // Late-game pacing to align L60 and L100 with other skills (increase time by reducing XP/s more)
  let levelScale = 1;
  if (currentLevel >= 60) {
    const t = Math.min(1, Math.max(0, (currentLevel - 60) / 40));
    levelScale = 0.75 + (0.35 - 0.75) * t; // 0.75 at 60 -> 0.35 at 100 (slower than before)
  } else if (currentLevel >= 20) {
    const t = Math.min(1, Math.max(0, (currentLevel - 20) / 40));
    levelScale = 1 + (0.75 - 1) * t; // ease down to 0.75 by 60
  }

  const xps = baseXps * levelScale;
  const perAction = Math.max(1, Math.floor(xps * (baseTime / 1000)));
  return perAction;
}

// Dynamic XP calculation for Drug Factory
export function getDrugFactoryXp(currentLevel: number, activityUnlockLevel: number): number {
  const baseTimeByUnlock: Record<number, number> = {
    1: 3000,
    5: 3500,
    12: 4000,
    18: 4500,
    22: 5000,
    25: 5500,
    30: 6000,
    35: 6500,
    45: 7000,
    50: 7500,
    60: 8000,
    65: 8500,
    75: 9000,
    80: 9500,
    95: 10000,
    100: 10500,
  };
  const baseTime = baseTimeByUnlock[activityUnlockLevel] ?? 4000;
  const xps = targetXpPerSecond(currentLevel) * unlockBonusFactor(activityUnlockLevel);
  const perAction = Math.max(1, Math.floor(xps * (baseTime / 1000)));
  return perAction;
}

// Dynamic XP calculation for Distillery
export function getDistilleryXp(currentLevel: number, activityUnlockLevel: number): number {
  const baseTimeByUnlock: Record<number, number> = {
    1: 8000,
    5: 10000,
    10: 9000,
    15: 9000,
    20: 10000,
    30: 11000,
    40: 11000,
    55: 12000,
    65: 13000,
    75: 14000,
    85: 16000,
    90: 17000,
    95: 18000,
    100: 20000,
  };
  const baseTime = baseTimeByUnlock[activityUnlockLevel] ?? 12000;
  const baseXps = targetXpPerSecond(currentLevel) * unlockBonusFactor(activityUnlockLevel);

  // Distillery late-game pacing: slow down after L60 so L60/100 timings aren't too fast
  let levelScale = 1;
  if (currentLevel >= 60) {
    const t = Math.min(1, Math.max(0, (currentLevel - 60) / 40));
    // From 0.85 at 60 down to 0.45 at 100
    levelScale = 0.85 + (0.45 - 0.85) * t;
  } else if (currentLevel >= 20) {
    const t = Math.min(1, Math.max(0, (currentLevel - 20) / 40));
    // From 1.0 at 20 down to 0.85 at 60
    levelScale = 1 + (0.85 - 1) * t;
  }

  const xps = baseXps * levelScale;
  const perAction = Math.max(1, Math.floor(xps * (baseTime / 1000)));
  return perAction;
}
