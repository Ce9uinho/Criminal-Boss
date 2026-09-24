import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useGameStore } from '@/store/gameStore';
import { DAILY_REWARDS, DailyReward, nextStreakDay } from '@/constants/progression';
import { theme } from '@/constants/theme';

interface Props {
  visible: boolean;
  onClose: () => void;
}

// 7-day streak board. Missing a day sends you back to day 1 — the classic
// "don't break the chain" hook.
export function DailyRewardModal({ visible, onClose }: Props) {
  const last = useGameStore(s => s.lastDailyClaim);
  const streak = useGameStore(s => s.dailyStreak);
  const claim = useGameStore(s => s.claimDailyReward);
  const [claimed, setClaimed] = useState<DailyReward | null>(null);
  const { claimable, day } = nextStreakDay(last, streak);
  const shownDay = claimed ? claimed.day : day;

  const close = () => {
    setClaimed(null);
    onClose();
  };

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={close}>
      <View style={styles.backdrop}>
        <View style={styles.card} testID="daily-modal">
          <Text style={styles.kicker}>DAILY PAYOFF</Text>
          <Text style={styles.title}>{claimed ? 'Cash in hand.' : 'The family takes care of its own.'}</Text>
          <Text style={styles.subtitle}>Come back every day. Miss one and the streak starts over.</Text>

          <View style={styles.grid}>
            {DAILY_REWARDS.map(r => {
              const isToday = r.day === shownDay;
              const isPast = claimed ? r.day <= claimed.day : r.day < day;
              const isJackpot = r.day === 7;
              return (
                <View
                  key={r.day}
                  style={[
                    styles.cell,
                    isJackpot && styles.cellJackpot,
                    isPast && styles.cellPast,
                    isToday && !claimed && styles.cellToday,
                  ]}
                >
                  <Text style={[styles.cellDay, isToday && !claimed && { color: theme.colors.gold }]}>DAY {r.day}</Text>
                  <Text style={styles.cellIcon}>{isPast ? '✅' : isJackpot ? '💰' : r.items.length ? '📦' : '💵'}</Text>
                  <Text style={styles.cellLabel} numberOfLines={2}>{r.label}</Text>
                </View>
              );
            })}
          </View>

          {claimed ? (
            <TouchableOpacity style={styles.cta} onPress={close} testID="daily-done">
              <Text style={styles.ctaText}>+${claimed.gold.toLocaleString()} · +{claimed.respect} rep — Nice</Text>
            </TouchableOpacity>
          ) : claimable ? (
            <TouchableOpacity style={styles.cta} onPress={() => setClaimed(claim())} testID="daily-claim">
              <Text style={styles.ctaText}>Claim day {day}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.cta, styles.ctaMuted]} onPress={close}>
              <Text style={[styles.ctaText, { color: theme.colors.text }]}>Come back tomorrow</Text>
            </TouchableOpacity>
          )}
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
    padding: 18,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.goldBorder,
    padding: 20,
  },
  kicker: {
    color: theme.colors.gold,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2,
  },
  title: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: '900',
    marginTop: 6,
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: 13,
    marginTop: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
  },
  cell: {
    width: '22.5%',
    flexGrow: 1,
    backgroundColor: theme.colors.bgElevated,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: 10,
    paddingHorizontal: 4,
    alignItems: 'center',
    gap: 4,
  },
  cellJackpot: {
    width: '46%',
    borderColor: theme.colors.goldBorder,
    backgroundColor: theme.colors.goldSoft,
  },
  cellPast: {
    opacity: 0.45,
  },
  cellToday: {
    borderColor: theme.colors.gold,
    borderWidth: 2,
  },
  cellDay: {
    color: theme.colors.textDim,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  cellIcon: {
    fontSize: 22,
  },
  cellLabel: {
    color: theme.colors.textMuted,
    fontSize: 10.5,
    fontWeight: '700',
    textAlign: 'center',
  },
  cta: {
    marginTop: 18,
    backgroundColor: theme.colors.gold,
    borderRadius: theme.radius.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  ctaMuted: {
    backgroundColor: theme.colors.surfaceAlt,
  },
  ctaText: {
    color: '#1A1408',
    fontSize: 15.5,
    fontWeight: '900',
  },
});
