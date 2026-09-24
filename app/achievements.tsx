import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGameStore } from '@/store/gameStore';
import {
  ACHIEVEMENTS,
  ACHIEVEMENT_CATEGORIES,
  Achievement,
  AchievementCategory,
  TIER_COLORS,
  TIER_POINTS,
  TOTAL_ACHIEVEMENT_POINTS,
  TOTAL_ITEMS,
  achievementReward,
} from '@/constants/achievements';
import { ITEM_GROUPS, itemsByGroup } from '@/constants/wiki';
import { RESOURCES } from '@/constants/gameData';
import { formatCash } from '@/constants/numberFormat';
import { theme } from '@/constants/theme';
import { ResourceImage } from '@/components/ResourceImage';

type Tab = 'achievements' | 'collection';

const NO_ITEMS: Record<string, number> = {};

function AchievementRow({ a, value, unlockedAt }: { a: Achievement; value: number; unlockedAt?: number }) {
  const unlocked = unlockedAt !== undefined;
  const secret = a.hidden && !unlocked;
  const color = TIER_COLORS[a.tier];
  const pct = Math.max(0, Math.min(1, value / a.target));
  const reward = achievementReward(a);
  return (
    <View style={[styles.row, unlocked && { borderColor: `${color}77`, backgroundColor: `${color}0D` }]} testID={`ach-${a.id}`}>
      <View style={[styles.medal, { borderColor: unlocked ? color : theme.colors.borderStrong, backgroundColor: unlocked ? `${color}22` : theme.colors.bgElevated }]}>
        <Text style={[styles.medalIcon, !unlocked && styles.medalLocked]}>{secret ? '❔' : a.icon}</Text>
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={styles.rowTop}>
          <Text style={[styles.title, !unlocked && { color: theme.colors.textMuted }]} numberOfLines={1}>{secret ? 'Secret achievement' : a.title}</Text>
          <Text style={[styles.tier, { color }]}>{a.tier.toUpperCase()}</Text>
        </View>
        <Text style={styles.desc} numberOfLines={2}>{secret ? 'Keep playing to find out.' : a.description}</Text>
        {unlocked ? (
          <Text style={[styles.unlocked, { color }]}>
            ✓ Unlocked {unlockedAt ? new Date(unlockedAt).toLocaleDateString() : ''} · +${formatCash(reward.gold)} · +{reward.respect} rep
          </Text>
        ) : !secret ? (
          <View style={styles.progressRow}>
            <View style={[styles.track, { flex: 1 }]}>
              <View style={[styles.fill, { width: `${pct * 100}%`, backgroundColor: color }]} />
            </View>
            <Text style={styles.count}>{formatCash(Math.min(value, a.target))} / {formatCash(a.target)}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

function CollectionLog() {
  const discovered = useGameStore(s => s.lifetimeStats.discovered ?? NO_ITEMS);
  const groups = useMemo(() => itemsByGroup(), []);
  const found = Object.keys(discovered).filter(id => RESOURCES[id]).length;
  return (
    <View>
      <View style={styles.summary}>
        <Text style={styles.kicker}>COLLECTION LOG</Text>
        <Text style={styles.bigNumber}>{found} <Text style={styles.bigOf}>/ {TOTAL_ITEMS}</Text></Text>
        <Text style={styles.summaryHint}>Every item you've ever had in your stash. Tap one to read its wiki entry.</Text>
        <View style={[styles.track, { marginTop: 10, height: 8 }]}>
          <View style={[styles.fill, { width: `${(found / TOTAL_ITEMS) * 100}%`, backgroundColor: theme.colors.gold }]} />
        </View>
      </View>
      {ITEM_GROUPS.map(g => {
        const ids = groups[g.id];
        if (!ids.length) return null;
        const have = ids.filter(id => discovered[id] !== undefined).length;
        return (
          <View key={g.id} style={styles.group}>
            <View style={styles.groupHeader}>
              <Text style={styles.groupTitle}>{g.icon} {g.name}</Text>
              <Text style={[styles.groupCount, have === ids.length && { color: theme.colors.emerald }]}>{have}/{ids.length}</Text>
            </View>
            <View style={styles.grid}>
              {ids.map(id => {
                const known = discovered[id] !== undefined;
                const res = RESOURCES[id];
                return (
                  <TouchableOpacity
                    key={id}
                    style={[styles.cell, !known && styles.cellUnknown]}
                    disabled={!known}
                    onPress={() => router.push({ pathname: '/wiki', params: { item: id } })}
                    testID={`log-${id}`}
                  >
                    {known ? <ResourceImage resource={res} size={26} /> : <Text style={styles.unknownMark}>?</Text>}
                    <Text style={[styles.cellName, !known && { color: theme.colors.textDim }]} numberOfLines={2}>{known ? res.name : '???'}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );
      })}
    </View>
  );
}

export default function AchievementsScreen() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<Tab>('achievements');
  const [category, setCategory] = useState<AchievementCategory | 'all'>('all');
  const unlocked = useGameStore(s => s.achievementsUnlocked);
  // Stats are derived from many slices; a 1s tick keeps progress bars live without
  // a selector that returns a fresh object (which would re-render forever).
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick(v => v + 1), 1000);
    return () => clearInterval(t);
  }, []);
  const stats = useMemo(() => useGameStore.getState().getAchievementStats(), [tick, unlocked]);

  const unlockedCount = ACHIEVEMENTS.filter(a => unlocked[a.id]).length;
  const points = ACHIEVEMENTS.reduce((sum, a) => sum + (unlocked[a.id] ? TIER_POINTS[a.tier] : 0), 0);

  const list = useMemo(() => {
    const filtered = ACHIEVEMENTS.filter(a => category === 'all' || a.category === category);
    // Closest-to-done first, unlocked at the bottom: always shows the next goal.
    return filtered
      .map(a => ({ a, value: a.value(stats), done: !!unlocked[a.id] }))
      .sort((x, y) => Number(x.done) - Number(y.done) || (y.value / y.a.target) - (x.value / x.a.target));
  }, [category, stats, unlocked]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
      <View style={styles.tabs}>
        {(['achievements', 'collection'] as Tab[]).map(t => (
          <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)} testID={`tab-${t}`}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t === 'achievements' ? '🏆 Achievements' : '📚 Collection Log'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'collection' ? (
        <CollectionLog />
      ) : (
        <>
          <View style={styles.summary}>
            <Text style={styles.kicker}>COMPLETION</Text>
            <Text style={styles.bigNumber}>
              {Math.round((unlockedCount / ACHIEVEMENTS.length) * 100)}%
            </Text>
            <View style={styles.summaryStats}>
              <Text style={styles.summaryStat}><Text style={styles.summaryStrong}>{unlockedCount}</Text> / {ACHIEVEMENTS.length} unlocked</Text>
              <Text style={styles.summaryStat}><Text style={[styles.summaryStrong, { color: theme.colors.gold }]}>{points}</Text> / {TOTAL_ACHIEVEMENT_POINTS} points</Text>
            </View>
            <View style={styles.tierLegend}>
              {(['bronze', 'silver', 'gold', 'diamond'] as const).map(t => (
                <Text key={t} style={[styles.legendItem, { color: TIER_COLORS[t] }]}>● {t} {TIER_POINTS[t]}</Text>
              ))}
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            {[{ id: 'all' as const, name: 'All', icon: '⭐' }, ...ACHIEVEMENT_CATEGORIES].map(c => {
              const inCat = ACHIEVEMENTS.filter(a => c.id === 'all' || a.category === c.id);
              const done = inCat.filter(a => unlocked[a.id]).length;
              const active = category === c.id;
              return (
                <TouchableOpacity key={c.id} style={[styles.chip, active && styles.chipActive]} onPress={() => setCategory(c.id)} testID={`cat-${c.id}`}>
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{c.icon} {c.name}</Text>
                  <Text style={[styles.chipCount, active && styles.chipTextActive]}>{done}/{inCat.length}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {list.map(({ a, value }) => (
            <AchievementRow key={a.id} a={a} value={value} unlockedAt={unlocked[a.id]} />
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  content: { padding: 14, gap: 10 },
  tabs: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 4,
    gap: 4,
  },
  tab: { flex: 1, paddingVertical: 10, borderRadius: theme.radius.sm, alignItems: 'center' },
  tabActive: { backgroundColor: theme.colors.goldSoft },
  tabText: { color: theme.colors.textDim, fontWeight: '800', fontSize: 13.5 },
  tabTextActive: { color: theme.colors.gold },
  summary: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.goldBorder,
    padding: 16,
  },
  kicker: { color: theme.colors.gold, fontSize: 11, fontWeight: '900', letterSpacing: 2 },
  bigNumber: { color: theme.colors.text, fontSize: 38, fontWeight: '900', marginTop: 2 },
  bigOf: { color: theme.colors.textDim, fontSize: 22 },
  summaryHint: { color: theme.colors.textMuted, fontSize: 12.5 },
  summaryStats: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  summaryStat: { color: theme.colors.textMuted, fontSize: 13 },
  summaryStrong: { color: theme.colors.text, fontWeight: '900' },
  tierLegend: { flexDirection: 'row', gap: 12, marginTop: 10, flexWrap: 'wrap' },
  legendItem: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  chips: { gap: 8, paddingVertical: 2 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  chipActive: { borderColor: theme.colors.gold, backgroundColor: theme.colors.goldSoft },
  chipText: { color: theme.colors.textMuted, fontWeight: '700', fontSize: 12.5 },
  chipCount: { color: theme.colors.textDim, fontWeight: '800', fontSize: 11 },
  chipTextActive: { color: theme.colors.gold },
  row: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 12,
  },
  medal: { width: 50, height: 50, borderRadius: 25, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  medalIcon: { fontSize: 24 },
  medalLocked: { opacity: 0.35 },
  rowTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  title: { color: theme.colors.text, fontSize: 15, fontWeight: '800', flexShrink: 1 },
  tier: { fontSize: 9.5, fontWeight: '900', letterSpacing: 1 },
  desc: { color: theme.colors.textMuted, fontSize: 12.5, marginTop: 2 },
  unlocked: { fontSize: 11.5, fontWeight: '800', marginTop: 6 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  track: { height: 5, borderRadius: 3, backgroundColor: theme.colors.bgElevated, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 3 },
  count: { color: theme.colors.textDim, fontSize: 11, fontWeight: '800', minWidth: 70, textAlign: 'right' },
  group: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 12,
    marginTop: 10,
  },
  groupHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  groupTitle: { color: theme.colors.text, fontWeight: '800', fontSize: 14.5 },
  groupCount: { color: theme.colors.textMuted, fontWeight: '900', fontSize: 12.5 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  cell: {
    width: '23%',
    flexGrow: 1,
    maxWidth: '25%',
    minHeight: 70,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.bgElevated,
    padding: 6,
  },
  cellUnknown: { borderStyle: 'dashed', backgroundColor: theme.colors.bg },
  unknownMark: { color: theme.colors.textDim, fontSize: 22, fontWeight: '900' },
  cellName: { color: theme.colors.textMuted, fontSize: 9.5, fontWeight: '700', textAlign: 'center' },
});
