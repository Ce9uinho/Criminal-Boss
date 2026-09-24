import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ChevronRight, RefreshCw, Swords, Gift, Lock } from 'lucide-react-native';
import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from '@/store/gameStore';
import { RESOURCES, getXpForLevel, MAX_LEVEL } from '@/constants/gameData';
import { Contract, getRankInfo, nextStreakDay, DAILY_REWARDS, getNextUnlock } from '@/constants/progression';
import { formatCash } from '@/constants/numberFormat';
import { theme, skillColor } from '@/constants/theme';
import { SkillIcon } from '@/components/SkillIcon';
import { ResourceImage } from '@/components/ResourceImage';

const OPERATIONS = ['smuggling', 'thieving', 'drug_factory', 'distillery', 'investigation_lab'];

interface HQProps {
  onOpenSkill: (skillId: string) => void;
  onOpenView: (view: 'combat' | 'bank' | 'shop') => void;
  onOpenDaily: () => void;
}

function ProgressBar({ pct, color, height = 6 }: { pct: number; color: string; height?: number }) {
  return (
    <View style={[styles.track, { height, borderRadius: height / 2 }]}>
      <View style={[styles.fill, { width: `${Math.max(0, Math.min(100, pct))}%`, backgroundColor: color, borderRadius: height / 2 }]} />
    </View>
  );
}

function BossCard() {
  const { playerName, gold, bank, respect, contractsCompleted, dailyStreak } = useGameStore(useShallow(s => ({
    playerName: s.playerName,
    gold: s.gold,
    bank: s.bank,
    respect: s.respect,
    contractsCompleted: s.contractsCompleted,
    dailyStreak: s.dailyStreak,
  })));
  const totalLevel = useGameStore(s => Object.values(s.skills).reduce((sum, sk) => sum + (sk.level ?? 1), 0));
  const reputation = Math.floor(totalLevel * 10 + respect);
  const { rank, next, progress } = getRankInfo(reputation);
  const netWorth = useMemo(
    () => gold + Object.values(bank).reduce((sum, it) => sum + (RESOURCES[it.resourceId]?.value ?? 0) * it.quantity, 0),
    [gold, bank],
  );

  return (
    <View style={styles.bossCard} testID="hq-boss-card">
      <View style={styles.bossTop}>
        <View style={styles.rankMedal}>
          <Text style={styles.rankEmoji}>{rank.icon}</Text>
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.kicker}>RANK</Text>
          <Text style={styles.rankTitle} numberOfLines={1}>{rank.title}</Text>
          <Text style={styles.bossName} numberOfLines={1}>{playerName}</Text>
        </View>
      </View>

      <View style={styles.repRow}>
        <Text style={styles.repText}>{reputation.toLocaleString()} rep</Text>
        <Text style={styles.repText}>{next ? `${next.icon} ${next.title} at ${next.minReputation.toLocaleString()}` : 'Top of the city'}</Text>
      </View>
      <ProgressBar pct={progress * 100} color={theme.colors.gold} height={8} />
      <Text style={styles.perk}>{rank.perk}</Text>

      <View style={styles.statRow}>
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: theme.colors.gold }]}>${formatCash(netWorth)}</Text>
          <Text style={styles.statLabel}>NET WORTH</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{contractsCompleted}</Text>
          <Text style={styles.statLabel}>CONTRACTS</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>🔥 {dailyStreak}</Text>
          <Text style={styles.statLabel}>DAY STREAK</Text>
        </View>
      </View>
    </View>
  );
}

function DailyBanner({ onOpen }: { onOpen: () => void }) {
  const last = useGameStore(s => s.lastDailyClaim);
  const streak = useGameStore(s => s.dailyStreak);
  const { claimable, day } = nextStreakDay(last, streak);
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!claimable) return;
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [claimable, pulse]);
  if (!claimable) return null;
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onOpen} testID="hq-daily-banner">
      <Animated.View style={[styles.dailyBanner, { transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.015] }) }] }]}>
        <Gift size={26} color="#1A1408" />
        <View style={{ flex: 1 }}>
          <Text style={styles.dailyTitle}>Daily payoff ready</Text>
          <Text style={styles.dailySub}>Day {day} · {DAILY_REWARDS[day - 1].label}</Text>
        </View>
        <ChevronRight size={20} color="#1A1408" />
      </Animated.View>
    </TouchableOpacity>
  );
}

function CurrentJob({ onOpenSkill, onOpenView }: { onOpenSkill: (id: string) => void; onOpenView: HQProps['onOpenView'] }) {
  const active = useGameStore(s => Object.values(s.skills).find(sk => sk.isActive));
  const combatActive = useGameStore(s => s.combatIsActive);
  const anim = useRef(new Animated.Value(0)).current;
  const activityId = active?.currentActivity?.id;

  useEffect(() => {
    if (!active?.currentActivity) {
      anim.setValue(0);
      return;
    }
    const duration = useGameStore.getState().getAdjustedActionTime(active.id, active.currentActivity.baseTime, active.currentActivity.id);
    anim.setValue(0);
    const loop = Animated.loop(Animated.timing(anim, { toValue: 1, duration, useNativeDriver: false }));
    loop.start();
    return () => loop.stop();
  }, [active?.id, activityId, active?.level, anim, active?.currentActivity]);

  if (active) {
    const accent = skillColor(active.id);
    return (
      <TouchableOpacity style={[styles.jobCard, { borderColor: `${accent}66` }]} activeOpacity={0.85} onPress={() => onOpenSkill(active.id)} testID="hq-current-job">
        <SkillIcon skillId={active.id} size={46} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <View style={styles.liveRow}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>RUNNING · {active.name.toUpperCase()}</Text>
          </View>
          <Text style={styles.jobName} numberOfLines={1}>{active.currentActivity?.name ?? 'Working'}</Text>
          <View style={[styles.track, { height: 6, borderRadius: 3, marginTop: 8 }]}>
            <Animated.View style={[styles.fill, { backgroundColor: accent, borderRadius: 3, width: anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]} />
          </View>
        </View>
        <ChevronRight size={20} color={theme.colors.textDim} />
      </TouchableOpacity>
    );
  }
  if (combatActive) {
    return (
      <TouchableOpacity style={[styles.jobCard, { borderColor: theme.colors.crimsonBorder }]} activeOpacity={0.85} onPress={() => onOpenView('combat')}>
        <View style={[styles.combatIcon]}><Swords size={24} color={theme.colors.crimson} /></View>
        <View style={{ flex: 1 }}>
          <View style={styles.liveRow}>
            <View style={[styles.liveDot, { backgroundColor: theme.colors.crimson }]} />
            <Text style={[styles.liveText, { color: theme.colors.crimson }]}>TURF WAR IN PROGRESS</Text>
          </View>
          <Text style={styles.jobName}>Your crew is fighting</Text>
        </View>
        <ChevronRight size={20} color={theme.colors.textDim} />
      </TouchableOpacity>
    );
  }
  return (
    <TouchableOpacity style={[styles.jobCard, styles.idleCard]} activeOpacity={0.85} onPress={() => onOpenSkill('smuggling')} testID="hq-idle-job">
      <Text style={{ fontSize: 30 }}>💤</Text>
      <View style={{ flex: 1 }}>
        <Text style={[styles.liveText, { color: theme.colors.crimson }]}>YOUR CREW IS IDLE</Text>
        <Text style={styles.jobName}>Idle crews earn nothing. Put them to work.</Text>
      </View>
      <View style={styles.idleCta}><Text style={styles.idleCtaText}>GO</Text></View>
    </TouchableOpacity>
  );
}

function ContractCard({ c }: { c: Contract }) {
  const claim = useGameStore(s => s.claimContract);
  const reroll = useGameStore(s => s.rerollContract);
  const cost = useGameStore(s => s.getContractRerollCost());
  const reputation = useGameStore(s => s.getReputation());
  const done = c.progress >= c.target;
  const accent = c.skillId ? skillColor(c.skillId) : theme.colors.gold;
  const bonus = getRankInfo(reputation).cashBonus;
  const cash = Math.round(c.reward.gold * (1 + bonus));

  return (
    <View style={[styles.contract, done && styles.contractDone]} testID={`contract-${c.kind}`}>
      <View style={styles.contractTop}>
        <View style={[styles.contractIcon, { backgroundColor: `${accent}1A`, borderColor: `${accent}55` }]}>
          <Text style={{ fontSize: 22 }}>{c.icon}</Text>
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.contractTitle} numberOfLines={1}>{c.title}</Text>
          <Text style={styles.contractDesc} numberOfLines={2}>{c.description}</Text>
        </View>
        {!done && (
          <TouchableOpacity style={styles.rerollBtn} onPress={() => reroll(c.id)} accessibilityLabel={`Swap contract for $${cost}`} testID="contract-reroll">
            <RefreshCw size={14} color={theme.colors.textMuted} />
            <Text style={styles.rerollText}>${formatCash(cost)}</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.contractProgressRow}>
        <View style={{ flex: 1 }}>
          <ProgressBar pct={(c.progress / c.target) * 100} color={done ? theme.colors.emerald : accent} />
        </View>
        <Text style={styles.contractCount}>
          {c.kind === 'sell' ? `$${formatCash(c.progress)} / $${formatCash(c.target)}` : `${c.progress} / ${c.target}`}
        </Text>
      </View>
      <View style={styles.rewardRow}>
        <View style={styles.rewardChip}><Text style={[styles.rewardText, { color: theme.colors.gold }]}>+${formatCash(cash)}</Text></View>
        <View style={styles.rewardChip}><Text style={styles.rewardText}>+{c.reward.respect} rep</Text></View>
        {c.reward.items.map(it => (
          <View key={it.resourceId} style={styles.rewardChip}>
            <ResourceImage resource={RESOURCES[it.resourceId]} size={14} />
            <Text style={styles.rewardText}>×{it.quantity}</Text>
          </View>
        ))}
        <View style={{ flex: 1 }} />
        {done && (
          <TouchableOpacity style={styles.claimBtn} onPress={() => claim(c.id)} testID="contract-claim">
            <Text style={styles.claimText}>COLLECT</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

function OperationTile({ skillId, onPress }: { skillId: string; onPress: () => void }) {
  const skill = useGameStore(s => s.skills[skillId]);
  if (!skill) return null;
  const accent = skillColor(skillId);
  const lvl = skill.level ?? 1;
  const cur = getXpForLevel(lvl);
  const next = getXpForLevel(lvl + 1);
  const pct = lvl >= MAX_LEVEL ? 100 : ((skill.experience - cur) / Math.max(1, next - cur)) * 100;
  const unlock = getNextUnlock(skillId, lvl);

  return (
    <TouchableOpacity style={[styles.opTile, skill.isActive && { borderColor: accent }]} activeOpacity={0.85} onPress={onPress} testID={`hq-op-${skillId}`}>
      <View style={styles.opTop}>
        <SkillIcon skillId={skillId} size={40} />
        <View style={styles.opLevel}>
          <Text style={styles.opLevelLabel}>LV</Text>
          <Text style={[styles.opLevelValue, { color: accent }]}>{lvl}</Text>
        </View>
      </View>
      <Text style={styles.opName} numberOfLines={1}>{skill.name}</Text>
      <ProgressBar pct={pct} color={accent} height={4} />
      <View style={styles.opFooter}>
        {skill.isActive ? (
          <Text style={[styles.opStatus, { color: theme.colors.emerald }]} numberOfLines={1}>● Running</Text>
        ) : unlock ? (
          <View style={styles.opUnlock}>
            <Lock size={10} color={theme.colors.textDim} />
            <Text style={styles.opStatus} numberOfLines={1}>{unlock.name} · Lv {unlock.level}</Text>
          </View>
        ) : (
          <Text style={styles.opStatus}>All jobs unlocked</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

export function HQ({ onOpenSkill, onOpenView, onOpenDaily }: HQProps) {
  const contracts = useGameStore(s => s.contracts);

  return (
    <View style={styles.container}>
      <BossCard />
      <DailyBanner onOpen={onOpenDaily} />

      <Text style={styles.section}>CURRENT JOB</Text>
      <CurrentJob onOpenSkill={onOpenSkill} onOpenView={onOpenView} />

      <View style={styles.sectionRow}>
        <Text style={styles.section}>CONTRACTS</Text>
        <Text style={styles.sectionHint}>Finish jobs for cash & respect</Text>
      </View>
      {contracts.map(c => <ContractCard key={c.id} c={c} />)}

      <Text style={styles.section}>OPERATIONS</Text>
      <View style={styles.opGrid}>
        {OPERATIONS.map(id => <OperationTile key={id} skillId={id} onPress={() => onOpenSkill(id)} />)}
        <TouchableOpacity style={[styles.opTile, styles.turfTile]} activeOpacity={0.85} onPress={() => onOpenView('combat')} testID="hq-op-combat">
          <View style={styles.opTop}>
            <View style={styles.combatIconSm}><Swords size={20} color={theme.colors.crimson} /></View>
          </View>
          <Text style={styles.opName}>Turf War</Text>
          <Text style={[styles.opStatus, { marginTop: 4 }]}>Fight for loot bags</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    paddingBottom: 24,
    gap: 10,
  },
  track: {
    backgroundColor: theme.colors.bgElevated,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
  section: {
    color: theme.colors.gold,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2,
    marginTop: 8,
    marginLeft: 4,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingRight: 4,
  },
  sectionHint: {
    color: theme.colors.textDim,
    fontSize: 11,
  },
  // Boss card
  bossCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.goldBorder,
    padding: 16,
    overflow: 'hidden',
  },
  bossGlow: {
    position: 'absolute',
    top: -80,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: theme.colors.gold,
    opacity: 0.07,
  },
  bossTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  rankMedal: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: theme.colors.gold,
    backgroundColor: theme.colors.goldSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankEmoji: {
    fontSize: 32,
  },
  kicker: {
    color: theme.colors.textDim,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
  },
  rankTitle: {
    color: theme.colors.gold,
    fontSize: 24,
    fontWeight: '900',
  },
  bossName: {
    color: theme.colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  repRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    marginBottom: 6,
  },
  repText: {
    color: theme.colors.textMuted,
    fontSize: 11.5,
    fontWeight: '700',
  },
  perk: {
    color: theme.colors.textDim,
    fontSize: 11.5,
    marginTop: 6,
  },
  statRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  stat: {
    flex: 1,
    backgroundColor: theme.colors.bgElevated,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: 10,
    alignItems: 'center',
  },
  statValue: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  statLabel: {
    color: theme.colors.textDim,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginTop: 2,
  },
  // Daily
  dailyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: theme.colors.gold,
    borderRadius: theme.radius.lg,
    padding: 14,
  },
  dailyTitle: {
    color: '#1A1408',
    fontSize: 16,
    fontWeight: '900',
  },
  dailySub: {
    color: '#3A2A08',
    fontSize: 12.5,
    fontWeight: '700',
  },
  // Current job
  jobCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 14,
  },
  idleCard: {
    borderColor: theme.colors.crimsonBorder,
    backgroundColor: theme.colors.crimsonSoft,
  },
  idleCta: {
    backgroundColor: theme.colors.gold,
    borderRadius: theme.radius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  idleCtaText: {
    color: '#1A1408',
    fontWeight: '900',
    letterSpacing: 1,
  },
  liveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: theme.colors.emerald,
  },
  liveText: {
    color: theme.colors.emerald,
    fontSize: 10.5,
    fontWeight: '900',
    letterSpacing: 1,
  },
  jobName: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '800',
    marginTop: 2,
  },
  combatIcon: {
    width: 46,
    height: 46,
    borderRadius: 13,
    backgroundColor: theme.colors.crimsonSoft,
    borderWidth: 1,
    borderColor: theme.colors.crimsonBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Contracts
  contract: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 12,
    gap: 10,
  },
  contractDone: {
    borderColor: theme.colors.emeraldBorder,
    backgroundColor: 'rgba(61, 214, 140, 0.06)',
  },
  contractTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  contractIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contractTitle: {
    color: theme.colors.text,
    fontSize: 14.5,
    fontWeight: '800',
  },
  contractDesc: {
    color: theme.colors.textMuted,
    fontSize: 12.5,
    marginTop: 1,
  },
  rerollBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  rerollText: {
    color: theme.colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
  },
  contractProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  contractCount: {
    color: theme.colors.textMuted,
    fontSize: 11.5,
    fontWeight: '800',
    minWidth: 64,
    textAlign: 'right',
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  rewardChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.bgElevated,
    borderRadius: theme.radius.pill,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  rewardText: {
    color: theme.colors.textMuted,
    fontSize: 11.5,
    fontWeight: '800',
  },
  claimBtn: {
    backgroundColor: theme.colors.emerald,
    borderRadius: theme.radius.md,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  claimText: {
    color: '#062414',
    fontWeight: '900',
    letterSpacing: 1,
    fontSize: 12.5,
  },
  // Operations grid
  opGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  opTile: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 12,
    gap: 8,
  },
  turfTile: {
    borderColor: theme.colors.crimsonBorder,
  },
  combatIconSm: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: theme.colors.crimsonSoft,
    borderWidth: 1,
    borderColor: theme.colors.crimsonBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  opTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  opLevel: {
    alignItems: 'flex-end',
  },
  opLevelLabel: {
    color: theme.colors.textDim,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  opLevelValue: {
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 22,
  },
  opName: {
    color: theme.colors.text,
    fontSize: 14.5,
    fontWeight: '800',
  },
  opFooter: {
    minHeight: 14,
  },
  opUnlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  opStatus: {
    color: theme.colors.textDim,
    fontSize: 11,
    fontWeight: '700',
    flexShrink: 1,
  },
});
