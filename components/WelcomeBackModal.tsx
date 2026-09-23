import React from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useGameStore, MAX_OFFLINE_MS } from '@/store/gameStore';
import { RESOURCES, SKILL_ICONS } from '@/constants/gameData';
import { formatCash } from '@/constants/numberFormat';
import { theme, skillColor } from '@/constants/theme';
import { ResourceImage } from '@/components/ResourceImage';

function formatDuration(ms: number): string {
  const totalMin = Math.floor(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m.toString().padStart(2, '0')}m`;
}

// "While you were away" report shown after offline progress is applied.
export function WelcomeBackModal() {
  const summary = useGameStore(s => s.offlineSummary);
  const clear = useGameStore(s => s.clearOfflineSummary);
  const skillName = useGameStore(s => (summary ? s.skills[summary.skillId]?.name : ''));
  if (!summary) return null;

  const accent = skillColor(summary.skillId);
  const capped = summary.elapsedMs > MAX_OFFLINE_MS;
  const leveled = summary.levelAfter > summary.levelBefore;

  return (
    <Modal transparent animationType="fade" visible onRequestClose={clear}>
      <View style={styles.backdrop}>
        <View style={[styles.card, { borderColor: `${accent}66` }]} testID="welcome-back-modal">
          <Text style={styles.kicker}>WHILE YOU WERE AWAY</Text>
          <Text style={styles.title}>Business kept running.</Text>
          <Text style={styles.subtitle}>
            {formatDuration(summary.elapsedMs)} away{capped ? ` · ${formatDuration(MAX_OFFLINE_MS)} counted (max)` : ''}
          </Text>

          <View style={[styles.activityRow, { backgroundColor: `${accent}14`, borderColor: `${accent}40` }]}>
            <Text style={styles.activityIcon}>{SKILL_ICONS[summary.skillId]}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.activitySkill, { color: accent }]}>{skillName}</Text>
              <Text style={styles.activityName}>{summary.activityName} · {summary.actions.toLocaleString()} jobs</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: theme.colors.xp }]}>+{summary.xp.toLocaleString()}</Text>
              <Text style={styles.statLabel}>XP</Text>
            </View>
            <View style={styles.stat}>
              <Text style={[styles.statValue, { color: leveled ? theme.colors.gold : theme.colors.text }]}>
                {leveled ? `${summary.levelBefore} → ${summary.levelAfter}` : summary.levelAfter}
              </Text>
              <Text style={styles.statLabel}>LEVEL</Text>
            </View>
            {summary.gold > 0 && (
              <View style={styles.stat}>
                <Text style={[styles.statValue, { color: theme.colors.gold }]}>+${formatCash(summary.gold)}</Text>
                <Text style={styles.statLabel}>CASH</Text>
              </View>
            )}
          </View>

          {(summary.items.length > 0 || summary.consumed.length > 0) && (
            <ScrollView style={styles.itemsScroll} contentContainerStyle={styles.itemsWrap}>
              {summary.items.map(it => (
                <View key={`g_${it.resourceId}`} style={styles.itemChip}>
                  <ResourceImage resource={RESOURCES[it.resourceId]} size={18} />
                  <Text style={styles.itemGain}>+{it.quantity.toLocaleString()}</Text>
                  <Text style={styles.itemName} numberOfLines={1}>{RESOURCES[it.resourceId]?.name ?? it.resourceId}</Text>
                </View>
              ))}
              {summary.consumed.map(it => (
                <View key={`c_${it.resourceId}`} style={[styles.itemChip, styles.itemChipSpent]}>
                  <ResourceImage resource={RESOURCES[it.resourceId]} size={18} />
                  <Text style={styles.itemSpent}>−{it.quantity.toLocaleString()}</Text>
                  <Text style={styles.itemName} numberOfLines={1}>{RESOURCES[it.resourceId]?.name ?? it.resourceId}</Text>
                </View>
              ))}
            </ScrollView>
          )}

          <TouchableOpacity style={styles.cta} onPress={clear} activeOpacity={0.85} testID="welcome-back-collect">
            <Text style={styles.ctaText}>Collect</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    padding: 22,
  },
  kicker: {
    color: theme.colors.gold,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
  },
  title: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: '900',
    marginTop: 6,
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: 13,
    marginTop: 4,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    padding: 12,
    marginTop: 18,
  },
  activityIcon: {
    fontSize: 28,
  },
  activitySkill: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  activityName: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
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
    fontSize: 17,
    fontWeight: '900',
  },
  statLabel: {
    color: theme.colors.textDim,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginTop: 2,
  },
  itemsScroll: {
    maxHeight: 180,
    marginTop: 14,
  },
  itemsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  itemChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.bgElevated,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.emeraldBorder,
    paddingVertical: 5,
    paddingHorizontal: 10,
    maxWidth: '100%',
  },
  itemChipSpent: {
    borderColor: theme.colors.border,
  },
  itemGain: {
    color: theme.colors.emerald,
    fontWeight: '800',
    fontSize: 12.5,
  },
  itemSpent: {
    color: theme.colors.textMuted,
    fontWeight: '800',
    fontSize: 12.5,
  },
  itemName: {
    color: theme.colors.textMuted,
    fontSize: 12.5,
    flexShrink: 1,
  },
  cta: {
    marginTop: 20,
    backgroundColor: theme.colors.gold,
    borderRadius: theme.radius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  ctaText: {
    color: '#1A1408',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
