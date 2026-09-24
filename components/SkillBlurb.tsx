import React, { useState } from 'react';
import { Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { theme } from '@/constants/theme';

// Flavour text for a skill: two lines by default, tap to read the whole pitch.
export function SkillBlurb({ text, skillId }: { text: string; skillId?: string }) {
  const [open, setOpen] = useState(false);
  if (!text) return null;
  return (
    <TouchableOpacity activeOpacity={0.8} onPress={() => setOpen(v => !v)} style={styles.box} testID="skill-blurb">
      <Text style={styles.text} numberOfLines={open ? undefined : 2}>{text}</Text>
      <View style={styles.footer}>
        <Text style={styles.more}>{open ? 'Less' : 'More'}</Text>
        {skillId && (
          <Text style={styles.more} onPress={() => router.push({ pathname: '/wiki', params: { skill: skillId } })} testID="skill-wiki-link">
            📖 Wiki: all jobs & drops
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: theme.colors.bgElevated,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  text: {
    color: theme.colors.textMuted,
    fontSize: 12.5,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  more: {
    color: theme.colors.gold,
    fontSize: 11,
    fontWeight: '800',
    marginTop: 4,
  },
});
