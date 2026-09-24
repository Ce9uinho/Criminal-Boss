import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useGameStore } from '@/store/gameStore';
import { SKILL_ICONS, getXpForLevel, MAX_LEVEL } from '@/constants/gameData';
import { theme, skillColor } from '@/constants/theme';

interface SkillListProps {
  selectedSkill: string | null;
  onSetSelectedSkill: (skillId: string) => void;
  onClose: () => void;
}

const ORDER = ['smuggling', 'thieving', 'drug_factory', 'distillery', 'investigation_lab'];

export function SkillList({ selectedSkill, onSetSelectedSkill, onClose }: SkillListProps) {
  const skills = useGameStore(s => s.skills);
  const ordered = [
    ...ORDER.filter(id => skills[id]),
    ...Object.keys(skills).filter(id => !ORDER.includes(id)),
  ];

  return (
    <View style={styles.overlay}>
      <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} testID="skill-list-backdrop" />
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>YOUR OPERATIONS</Text>
        {ordered.map(skillId => {
          const skill = skills[skillId];
          const accent = skillColor(skillId);
          const isSelected = selectedSkill === skillId;
          const lvl = skill.level ?? 1;
          const cur = getXpForLevel(lvl);
          const next = getXpForLevel(lvl + 1);
          const pct = lvl >= MAX_LEVEL ? 100 : Math.max(0, Math.min(100, ((skill.experience - cur) / Math.max(1, next - cur)) * 100));
          return (
            <TouchableOpacity
              key={skillId}
              style={[styles.item, isSelected && { borderColor: accent, backgroundColor: `${accent}14` }]}
              activeOpacity={0.8}
              onPress={() => {
                onSetSelectedSkill(skillId);
                onClose();
              }}
              testID={`skill-list-${skillId}`}
            >
              <View style={[styles.iconBox, { backgroundColor: `${accent}1F`, borderColor: `${accent}55` }]}>
                <Text style={styles.icon}>{SKILL_ICONS[skillId]}</Text>
              </View>
              <View style={styles.info}>
                <View style={styles.row}>
                  <Text style={styles.name} numberOfLines={1}>{skill.name}</Text>
                  <Text style={[styles.level, { color: accent }]}>Lv {lvl}</Text>
                </View>
                <View style={styles.track}>
                  <View style={[styles.fill, { width: `${pct}%`, backgroundColor: accent }]} />
                </View>
                <Text style={[styles.status, skill.isActive && { color: theme.colors.emerald }]} numberOfLines={1}>
                  {skill.isActive ? `● ${skill.currentActivity?.name ?? 'Running'}` : 'Idle'}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(8, 7, 10, 0.96)',
    zIndex: 1000,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingTop: 20,
  },
  title: {
    color: theme.colors.gold,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 12,
    marginLeft: 4,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 14,
    marginBottom: 10,
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
  info: {
    flex: 1,
    minWidth: 0,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  name: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '800',
    flexShrink: 1,
  },
  level: {
    fontSize: 13,
    fontWeight: '900',
    marginLeft: 8,
  },
  track: {
    height: 5,
    borderRadius: 3,
    backgroundColor: theme.colors.bgElevated,
    marginTop: 8,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
  status: {
    color: theme.colors.textDim,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
  },
});
