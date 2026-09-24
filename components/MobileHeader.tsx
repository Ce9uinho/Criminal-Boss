import React, { useEffect, useRef } from 'react';
import { Animated, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Menu } from 'lucide-react-native';
import { formatCash } from '@/constants/numberFormat';
import { useGameStore } from '@/store/gameStore';
import { theme } from '@/constants/theme';

interface MobileHeaderProps {
  selectedSkill: string | null;
  playerLevel: number;
  gold: number;
  onShowGameMenu: () => void;
}

// Cash chip that "pops" whenever the player's money goes up.
function CashChip({ gold }: { gold: number }) {
  const prev = useRef(gold);
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (gold > prev.current) {
      pulse.setValue(1);
      Animated.timing(pulse, { toValue: 0, duration: 500, useNativeDriver: true }).start();
    }
    prev.current = gold;
  }, [gold, pulse]);

  return (
    <Animated.View
      style={[
        styles.chip,
        styles.cashChip,
        { transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] }) }] },
      ]}
      testID="chip-gold"
    >
      <Text style={styles.cashSign}>$</Text>
      <Text style={styles.cashText}>{formatCash(gold)}</Text>
    </Animated.View>
  );
}

export function MobileHeader({ playerLevel, gold, onShowGameMenu }: MobileHeaderProps) {
  const playerName = useGameStore(s => s.playerName);

  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.menuButton} onPress={onShowGameMenu} testID="open-game-menu" accessibilityLabel="Open menu">
        <Menu size={22} color={theme.colors.text} />
      </TouchableOpacity>

      <View style={styles.brand}>
        <Text style={styles.brandTitle} testID="game-title" numberOfLines={1}>
          CRIMINAL <Text style={styles.brandAccent}>BOSS</Text>
        </Text>
        <Text style={styles.brandSub} numberOfLines={1}>{playerName}</Text>
      </View>

      <View style={styles.stats}>
        <View style={[styles.chip, styles.levelChip]} testID="chip-level">
          <Text style={styles.levelLabel}>LV</Text>
          <Text style={styles.levelText}>{playerLevel}</Text>
        </View>
        <CashChip gold={gold} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.bgElevated,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    gap: 12,
    zIndex: 1,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    flex: 1,
    minWidth: 0,
  },
  brandTitle: {
    color: theme.colors.text,
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 2,
  },
  brandAccent: {
    color: theme.colors.gold,
  },
  brandSub: {
    color: theme.colors.textDim,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginTop: 1,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
  },
  levelChip: {
    backgroundColor: theme.colors.surfaceAlt,
    borderColor: theme.colors.borderStrong,
    gap: 3,
  },
  levelLabel: {
    color: theme.colors.textDim,
    fontSize: 10,
    fontWeight: '800',
  },
  levelText: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '900',
  },
  cashChip: {
    backgroundColor: theme.colors.goldSoft,
    borderColor: theme.colors.goldBorder,
    gap: 2,
  },
  cashSign: {
    color: theme.colors.gold,
    fontSize: 12,
    fontWeight: '900',
  },
  cashText: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
});
