import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Sword, Store as StoreIcon, Package, LayoutGrid } from 'lucide-react-native';
import { useGameStore } from '@/store/gameStore';
import { SKILL_ICONS } from '@/constants/gameData';
import { theme } from '@/constants/theme';

type ViewType = 'skills' | 'bank' | 'shop' | 'combat';

interface BottomNavProps {
  currentView: ViewType;
  selectedSkill: string | null;
  onSetCurrentView: (view: ViewType) => void;
  onShowSidebar: () => void;
  bottomInset?: number;
}

export function BottomNav({ currentView, selectedSkill, onSetCurrentView, onShowSidebar, bottomInset = 0 }: BottomNavProps) {
  const combatActive = useGameStore(s => s.combatIsActive);
  const anySkillActive = useGameStore(s => Object.values(s.skills).some(sk => sk.isActive));

  const items: { id: ViewType; label: string; render: (color: string) => React.ReactNode; live?: boolean }[] = [
    {
      id: 'skills',
      label: 'Empire',
      render: color =>
        selectedSkill ? <Text style={styles.emojiIcon}>{SKILL_ICONS[selectedSkill]}</Text> : <LayoutGrid size={22} color={color} />,
      live: anySkillActive,
    },
    { id: 'bank', label: 'Stash', render: color => <Package size={22} color={color} /> },
    { id: 'combat', label: 'Turf War', render: color => <Sword size={22} color={color} />, live: combatActive },
    { id: 'shop', label: 'Market', render: color => <StoreIcon size={22} color={color} /> },
  ];

  return (
    <View style={[styles.bar, { paddingBottom: 8 + bottomInset }]} testID="bottom-nav">
      {items.map(item => {
        const active = currentView === item.id;
        const color = active ? theme.colors.gold : theme.colors.textDim;
        return (
          <TouchableOpacity
            key={item.id}
            style={styles.item}
            activeOpacity={0.7}
            testID={`tab-${item.id}`}
            onPress={() => {
              // Tapping the active Empire tab opens the skill switcher.
              if (item.id === 'skills' && currentView === 'skills') onShowSidebar();
              else onSetCurrentView(item.id);
            }}
          >
            <View style={[styles.indicator, active && styles.indicatorActive]} />
            <View style={[styles.iconWrap, active && styles.iconWrapActive]}>
              {item.render(color)}
              {item.live && <View style={styles.liveDot} />}
            </View>
            <Text style={[styles.label, active && styles.labelActive]}>{item.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: theme.colors.bgElevated,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: 0,
    paddingHorizontal: 6,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: 2,
  },
  indicator: {
    width: 28,
    height: 3,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
    backgroundColor: 'transparent',
    marginBottom: 6,
  },
  indicatorActive: {
    backgroundColor: theme.colors.gold,
  },
  iconWrap: {
    width: 44,
    height: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: theme.colors.goldSoft,
  },
  emojiIcon: {
    fontSize: 20,
  },
  liveDot: {
    position: 'absolute',
    top: 3,
    right: 7,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.emerald,
    borderWidth: 1.5,
    borderColor: theme.colors.bgElevated,
  },
  label: {
    fontSize: 11,
    color: theme.colors.textDim,
    fontWeight: '700',
    marginTop: 3,
    letterSpacing: 0.3,
  },
  labelActive: {
    color: theme.colors.gold,
  },
});
