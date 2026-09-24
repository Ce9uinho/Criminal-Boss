import React, { useEffect, useRef } from 'react';
import { Animated, View, Text, StyleSheet } from 'react-native';
import { useGameStore } from '@/store/gameStore';
import { SKILL_ICONS, getXpForLevel, MAX_LEVEL } from '@/constants/gameData';
import { formatCash } from '@/constants/numberFormat';
import { theme, skillColor } from '@/constants/theme';
import { HeaderXpToasts } from './XpToasts';

interface SkillHeaderProps {
  selectedSkill: string;
}

function heatTone(heat: number) {
  if (heat > 75) return { color: theme.colors.crimson, label: 'WANTED' };
  if (heat > 50) return { color: theme.colors.heat, label: 'HOT' };
  if (heat > 25) return { color: theme.colors.gold, label: 'WARM' };
  return { color: theme.colors.emerald, label: 'COOL' };
}

export function SkillHeader({ selectedSkill }: SkillHeaderProps) {
  const skill = useGameStore(s => s.skills[selectedSkill]);
  const heat = useGameStore(s => s.heat);
  const pulse = useRef(new Animated.Value(0)).current;

  const isActive = !!skill?.isActive;
  useEffect(() => {
    if (!isActive) {
      pulse.stopAnimation();
      pulse.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [isActive, pulse]);

  if (!skill) return null;

  const accent = skillColor(selectedSkill);
  const lvl = skill.level ?? 1;
  const exp = skill.experience ?? 0;
  const maxed = lvl >= MAX_LEVEL;
  const currentLevelXp = getXpForLevel(lvl);
  const nextLevelXp = getXpForLevel(lvl + 1);
  const pct = maxed ? 100 : Math.min(100, Math.max(0, ((exp - currentLevelXp) / Math.max(1, nextLevelXp - currentLevelXp)) * 100));
  const remaining = Math.max(0, nextLevelXp - exp);
  const tone = heatTone(heat);

  return (
    <View style={styles.wrap}>
      <View style={[styles.card, { borderColor: `${accent}55` }]}>
        <View style={[styles.glow, { backgroundColor: accent }]} />
        <View style={styles.topRow}>
          <View style={[styles.iconBox, { backgroundColor: `${accent}1F`, borderColor: `${accent}66` }]}>
            <Text style={styles.icon}>{SKILL_ICONS[selectedSkill]}</Text>
          </View>
          <View style={styles.titleCol}>
            <Text style={styles.name} numberOfLines={1}>{skill.name ?? 'Skill'}</Text>
            <View style={styles.statusRow}>
              <Animated.View
                style={[
                  styles.statusDot,
                  { backgroundColor: isActive ? theme.colors.emerald : theme.colors.textDim },
                  isActive && { opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 0.35] }) },
                ]}
              />
              <Text style={[styles.statusText, isActive && { color: theme.colors.emerald }]} numberOfLines={1}>
                {isActive ? skill.currentActivity?.name ?? 'Working' : 'Idle — pick a job below'}
              </Text>
            </View>
          </View>
          <View style={styles.levelBadge}>
            <Text style={styles.levelLabel}>LEVEL</Text>
            <Text style={[styles.levelValue, { color: accent }]}>{lvl}</Text>
          </View>
        </View>

        <View style={styles.xpTrack}>
          <View style={[styles.xpFill, { width: `${pct}%`, backgroundColor: accent }]} />
        </View>
        <View style={styles.xpMeta}>
          <Text style={styles.xpText}>{formatCash(exp)} XP</Text>
          <Text style={styles.xpText}>{maxed ? 'MAX LEVEL' : `${formatCash(remaining)} to Lv ${lvl + 1}`}</Text>
        </View>

        {selectedSkill === 'thieving' && (
          <View style={styles.heatBox} testID="heat-section">
            <View style={styles.heatRow}>
              <Text style={styles.heatLabel}>🔥 POLICE HEAT</Text>
              <Text style={[styles.heatValue, { color: tone.color }]}>{tone.label} · {heat}%</Text>
            </View>
            <View style={styles.heatTrack}>
              <View style={[styles.heatFill, { width: `${Math.min(heat, 100)}%`, backgroundColor: tone.color }]} />
            </View>
          </View>
        )}
      </View>
      <HeaderXpToasts skillId={selectedSkill} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 4,
    position: 'relative',
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    padding: 14,
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    top: -60,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    opacity: 0.08,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 28,
  },
  titleCol: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusText: {
    color: theme.colors.textMuted,
    fontSize: 12.5,
    fontWeight: '600',
    flexShrink: 1,
  },
  levelBadge: {
    alignItems: 'center',
    minWidth: 54,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.bgElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  levelLabel: {
    color: theme.colors.textDim,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  levelValue: {
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 26,
  },
  xpTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.bgElevated,
    marginTop: 14,
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    borderRadius: 4,
  },
  xpMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  xpText: {
    color: theme.colors.textDim,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  heatBox: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  heatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  heatLabel: {
    color: theme.colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  heatValue: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  heatTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.bgElevated,
    overflow: 'hidden',
  },
  heatFill: {
    height: '100%',
    borderRadius: 3,
  },
});
