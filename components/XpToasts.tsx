import React, { useMemo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useGameStore } from '@/store/gameStore';
import { theme } from '@/constants/theme';

function XpToast({ amount }: { amount: number }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(6)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 120, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: -18, duration: 700, useNativeDriver: true }),
    ]).start(() => {
      Animated.timing(opacity, { toValue: 0, duration: 300, delay: 150, useNativeDriver: true }).start();
    });
  }, [opacity, translateY]);

  return (
    <Animated.View style={[styles.xpToast, { opacity, transform: [{ translateY }] }]} testID="xp-toast">
      <Text style={styles.xpToastText}>+{amount.toLocaleString()} XP</Text>
    </Animated.View>
  );
}

export function HeaderXpToasts({ skillId }: { skillId: string }) {
  const xpToasts = useGameStore(s => s.xpToasts);
  // Only the most recent few, so fast activities don't stack a wall of toasts
  const filtered = useMemo(() => xpToasts.filter(t => t.skillId === skillId).slice(-3), [xpToasts, skillId]);
  return (
    <View pointerEvents="none" style={styles.xpToastAnchorRight} testID="xp-toast-anchor">
      {filtered.map(t => (
        <XpToast key={t.id} amount={t.amount} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  xpToastAnchorRight: {
    position: 'absolute',
    right: 92,
    top: 20,
    alignItems: 'flex-end',
    zIndex: 10000,
    elevation: 1000,
  },
  xpToast: {
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: 'rgba(61, 214, 140, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(61, 214, 140, 0.45)',
  },
  xpToastText: {
    color: theme.colors.xp,
    fontWeight: '800',
    fontSize: 13,
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
