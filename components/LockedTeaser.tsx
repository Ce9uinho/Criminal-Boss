import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Lock } from 'lucide-react-native';
import { theme } from '@/constants/theme';

// Summary row for jobs further down the ladder: keeps the list short while
// still showing there's plenty left to unlock.
export function LockedTeaser({ count, noun, levels }: { count: number; noun: string; levels: number[] }) {
  if (count <= 0) return null;
  const top = levels.length ? Math.max(...levels) : 0;
  return (
    <View style={styles.row} testID="locked-teaser">
      <Lock size={16} color={theme.colors.textDim} />
      <Text style={styles.text}>
        <Text style={styles.strong}>{count} more {noun}</Text> unlock as you level up{top ? ` (up to Lv ${top})` : ''}.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.colors.borderStrong,
    borderRadius: theme.radius.md,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginTop: 4,
  },
  text: {
    color: theme.colors.textDim,
    fontSize: 12.5,
    flex: 1,
  },
  strong: {
    color: theme.colors.textMuted,
    fontWeight: '800',
  },
});
