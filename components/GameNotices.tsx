import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useGameStore, GameNotice } from '@/store/gameStore';
import { SKILL_ICONS } from '@/constants/gameData';
import { theme, skillColor } from '@/constants/theme';

const KIND_STYLE: Record<GameNotice['kind'], { accent: string; icon: string }> = {
  levelup: { accent: theme.colors.gold, icon: '⬆️' },
  agent: { accent: theme.colors.premium, icon: '🕴️' },
  warning: { accent: theme.colors.crimson, icon: '⚠️' },
  success: { accent: theme.colors.emerald, icon: '✅' },
  info: { accent: theme.colors.info, icon: 'ℹ️' },
};

function NoticeCard({ notice }: { notice: GameNotice }) {
  const dismiss = useGameStore(s => s.dismissNotice);
  const enter = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(enter, { toValue: 1, useNativeDriver: true, friction: 7, tension: 80 }).start();
  }, [enter]);

  const kind = KIND_STYLE[notice.kind];
  const accent = notice.kind === 'levelup' && notice.skillId ? skillColor(notice.skillId) : kind.accent;
  const icon = notice.icon ?? (notice.skillId && notice.kind === 'levelup' ? SKILL_ICONS[notice.skillId] : kind.icon);

  return (
    <Animated.View
      style={[
        styles.card,
        { borderColor: accent, shadowColor: accent },
        {
          opacity: enter,
          transform: [
            { translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [-24, 0] }) },
            { scale: enter.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] }) },
          ],
        },
      ]}
    >
      <TouchableOpacity style={styles.row} onPress={() => dismiss(notice.id)} activeOpacity={0.8} testID={`notice-${notice.kind}`}>
        <View style={[styles.iconWrap, { backgroundColor: `${accent}22` }]}>
          <Text style={styles.icon}>{icon}</Text>
        </View>
        <View style={styles.textWrap}>
          <Text style={[styles.title, notice.kind === 'levelup' && { color: accent }]} numberOfLines={1}>{notice.title}</Text>
          {!!notice.message && <Text style={styles.message} numberOfLines={2}>{notice.message}</Text>}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// Stack of transient toasts shown at the top of the game screen.
export function GameNotices({ top = 0 }: { top?: number }) {
  const notices = useGameStore(s => s.notices);
  if (notices.length === 0) return null;
  return (
    <View pointerEvents="box-none" style={[styles.anchor, { top: top + 8 }]}>
      {notices.map(n => (
        <NoticeCard key={n.id} notice={n} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  anchor: {
    position: 'absolute',
    left: 12,
    right: 12,
    zIndex: 5000,
    elevation: 50,
    alignItems: 'center',
    gap: 8,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: 'rgba(24, 21, 29, 0.97)',
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 22,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  message: {
    color: theme.colors.textMuted,
    fontSize: 12.5,
    marginTop: 2,
  },
});
