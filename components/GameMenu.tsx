import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { X, Settings, User, Trophy, HelpCircle, ChevronRight, ChevronDown, BookOpen } from 'lucide-react-native';
import { ACHIEVEMENTS } from '@/constants/achievements';
import { useGameStore } from '@/store/gameStore';
import { formatCash } from '@/constants/numberFormat';
import { theme } from '@/constants/theme';

interface GameMenuProps {
  onClose: () => void;
}

const HOW_TO_PLAY: { icon: string; title: string; text: string }[] = [
  { icon: '🏢', title: 'HQ', text: 'Your command centre: rank, current job, contracts and every operation at a glance.' },
  { icon: '📋', title: 'Contracts', text: 'Three jobs are always on the board. Finish them for cash and respect; swap one you dislike for a fee.' },
  { icon: '🐀', title: 'Rank up', text: 'Skill levels and respect raise your reputation, from Street Rat to Godfather. Higher ranks pay more per contract.' },
  { icon: '🎁', title: 'Daily payoff', text: 'Claim a reward every day. Keep the 7-day streak alive for the jackpot.' },
  { icon: '💼', title: 'Smuggle', text: 'Run crews through smuggling routes to collect goods. Higher levels unlock richer routes.' },
  { icon: '🧪', title: 'Produce', text: 'Drug Factory, Distillery and the Lab turn raw materials into product. Buy materials in the Market.' },
  { icon: '🥷', title: 'Steal', text: 'Thieving pays cash, but builds police Heat. Getting caught puts that job on cooldown.' },
  { icon: '💰', title: 'Profit', text: 'Sell goods from your Stash, buy tools to boost each operation and expand storage.' },
  { icon: '⚔️', title: 'Fight', text: 'Gear up and clear Turf War dungeons for loot bags full of cash and equipment.' },
  { icon: '🌙', title: 'Idle', text: 'Your last job keeps running while you are away (up to 12 hours).' },
];

export function GameMenu({ onClose }: GameMenuProps) {
  const [showHelp, setShowHelp] = useState(false);
  const playerName = useGameStore(s => s.playerName);
  const gold = useGameStore(s => s.gold);
  const totalLevel = useGameStore(s => Object.values(s.skills).reduce((sum, sk) => sum + (sk.level ?? 1), 0));

  const unlocked = useGameStore(s => Object.keys(s.achievementsUnlocked).length);

  const go = (path: '/settings' | '/profile' | '/achievements' | '/wiki') => {
    onClose();
    router.push(path);
  };

  const items = [
    { icon: <User size={20} color={theme.colors.gold} />, label: 'Profile', hint: 'Name, avatar & stats', onPress: () => go('/profile') },
    { icon: <Trophy size={20} color={theme.colors.gold} />, label: 'Achievements', hint: `${unlocked}/${ACHIEVEMENTS.length} unlocked · Collection Log`, onPress: () => go('/achievements') },
    { icon: <BookOpen size={20} color={theme.colors.gold} />, label: 'Wiki', hint: 'Every job, item, upgrade and formula', onPress: () => go('/wiki') },
    { icon: <Settings size={20} color={theme.colors.gold} />, label: 'Settings', hint: 'Save data & options', onPress: () => go('/settings') },
  ];

  return (
    <View style={styles.overlay}>
      <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} testID="game-menu-backdrop" />
      <View style={styles.sheet} testID="game-menu">
        <View style={styles.header}>
          <View>
            <Text style={styles.kicker}>THE BOSS</Text>
            <Text style={styles.name} numberOfLines={1}>{playerName}</Text>
          </View>
          <TouchableOpacity style={styles.close} onPress={onClose} accessibilityLabel="Close menu">
            <X size={20} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{totalLevel}</Text>
            <Text style={styles.statLabel}>TOTAL LEVEL</Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: theme.colors.gold }]}>${formatCash(gold)}</Text>
            <Text style={styles.statLabel}>CASH</Text>
          </View>
        </View>

        <ScrollView style={{ flexGrow: 0 }} showsVerticalScrollIndicator={false}>
          {items.map(item => (
            <TouchableOpacity key={item.label} style={styles.item} onPress={item.onPress} activeOpacity={0.8}>
              <View style={styles.itemIcon}>{item.icon}</View>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemLabel}>{item.label}</Text>
                <Text style={styles.itemHint}>{item.hint}</Text>
              </View>
              <ChevronRight size={18} color={theme.colors.textDim} />
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={styles.item} onPress={() => setShowHelp(v => !v)} activeOpacity={0.8} testID="menu-how-to-play">
            <View style={styles.itemIcon}><HelpCircle size={20} color={theme.colors.gold} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemLabel}>How to play</Text>
              <Text style={styles.itemHint}>Build your criminal empire</Text>
            </View>
            {showHelp ? <ChevronDown size={18} color={theme.colors.textDim} /> : <ChevronRight size={18} color={theme.colors.textDim} />}
          </TouchableOpacity>

          {showHelp && (
            <View style={styles.help}>
              {HOW_TO_PLAY.map(tip => (
                <View key={tip.title} style={styles.tip}>
                  <Text style={styles.tipIcon}>{tip.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.tipTitle}>{tip.title}</Text>
                    <Text style={styles.tipText}>{tip.text}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
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
    zIndex: 9999,
    elevation: 999,
    backgroundColor: theme.colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  sheet: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.goldBorder,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  kicker: {
    color: theme.colors.gold,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
  },
  name: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: '900',
    marginTop: 2,
    maxWidth: 260,
  },
  close: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
    marginBottom: 16,
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
    fontSize: 18,
    fontWeight: '900',
  },
  statLabel: {
    color: theme.colors.textDim,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginTop: 2,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 8,
  },
  itemIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: theme.colors.goldSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemLabel: {
    color: theme.colors.text,
    fontSize: 15.5,
    fontWeight: '800',
  },
  itemHint: {
    color: theme.colors.textDim,
    fontSize: 12,
    marginTop: 1,
  },
  help: {
    backgroundColor: theme.colors.bgElevated,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 12,
    gap: 12,
    marginBottom: 8,
  },
  tip: {
    flexDirection: 'row',
    gap: 10,
  },
  tipIcon: {
    fontSize: 20,
    width: 26,
    textAlign: 'center',
  },
  tipTitle: {
    color: theme.colors.text,
    fontWeight: '800',
    fontSize: 13.5,
  },
  tipText: {
    color: theme.colors.textMuted,
    fontSize: 12.5,
    lineHeight: 17,
    marginTop: 1,
  },
});
