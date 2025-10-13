import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Sword, Coins, Package } from 'lucide-react-native';
import { SKILL_ICONS } from '@/constants/gameData';

type ViewType = 'skills' | 'bank' | 'shop' | 'combat';

interface BottomNavProps {
  currentView: ViewType;
  selectedSkill: string | null;
  onSetCurrentView: (view: ViewType) => void;
  onShowSidebar: () => void;
}

export function BottomNav({ currentView, selectedSkill, onSetCurrentView, onShowSidebar }: BottomNavProps) {
  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity
        style={[styles.navItem, currentView === 'skills' && styles.activeNavItem]}
        onPress={() => {
          if (currentView === 'skills') {
            onShowSidebar();
          } else {
            onSetCurrentView('skills');
          }
        }}
      >
        <Text style={styles.navIcon} testID="tab-skills-icon">{selectedSkill ? SKILL_ICONS[selectedSkill] : '🧪'}</Text>
        <Text style={[styles.navText, currentView === 'skills' && styles.activeNavText]}>Skills</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.navItem, currentView === 'bank' && styles.activeNavItem]}
        onPress={() => onSetCurrentView('bank')}
      >
        <Package size={20} color={currentView === 'bank' ? '#4ade80' : '#666'} />
        <Text style={[styles.navText, currentView === 'bank' && styles.activeNavText]}>Bank</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.navItem, currentView === 'combat' && styles.activeNavItem]}
        onPress={() => onSetCurrentView('combat')}
      >
        <Sword size={20} color={currentView === 'combat' ? '#4ade80' : '#666'} />
        <Text style={[styles.navText, currentView === 'combat' && styles.activeNavText]}>Combat</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.navItem, currentView === 'shop' && styles.activeNavItem]}
        onPress={() => onSetCurrentView('shop')}
      >
        <Coins size={20} color={currentView === 'shop' ? '#4ade80' : '#666'} />
        <Text style={[styles.navText, currentView === 'shop' && styles.activeNavText]}>Shop</Text>
      </TouchableOpacity>
    </View>
  );
}


const styles = StyleSheet.create({
    bottomNav: {
        flexDirection: 'row',
        backgroundColor: '#1a1a2e',
        borderTopWidth: 1,
        borderTopColor: '#2a2a3e',
        paddingVertical: 8,
        paddingHorizontal: 4,
      },
      navItem: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 8,
        borderRadius: 8,
      },
      activeNavItem: {
        backgroundColor: 'rgba(74, 222, 128, 0.1)',
      },
      navIcon: {
        fontSize: 20,
        marginBottom: 2,
      },
      navText: {
        fontSize: 11,
        color: '#666',
        fontWeight: '500',
      },
      activeNavText: {
        color: '#4ade80',
      },
})
