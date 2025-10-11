import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGameStore } from '@/store/gameStore';
import { SKILL_ICONS, getXpForLevel } from '@/constants/gameData';
import SkillGrid from '@/components/SkillGrid';
import BankView from '@/components/BankView';
import { Store } from '@/components/Store';
import CombatScreen from '@/app/combat';
import { Sword, Coins, Package, Menu, X, Settings, User, Trophy, BookOpen, BarChart3, HelpCircle } from 'lucide-react-native';
import { router } from 'expo-router';
import { formatCash } from '@/constants/numberFormat';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ViewType = 'skills' | 'bank' | 'shop' | 'combat';

export default function GameScreen() {
  const [currentView, setCurrentView] = useState<ViewType>('skills');
  const [selectedSkill, setSelectedSkill] = useState<string | null>('smuggling');
  const [showSidebar, setShowSidebar] = useState(false);
  const [showGameMenu, setShowGameMenu] = useState(false);
  const [targetResourceId, setTargetResourceId] = useState<string | undefined>(undefined);
  const { skills, loadGame, gold, heat, getPlayerLevelAvg } = useGameStore();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadGame();
  }, [loadGame]);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem('lastSelectedSkill');
        if (saved) {
          setSelectedSkill(saved);
        } else {
          setSelectedSkill('smuggling');
        }
      } catch (e) {
        console.log('Failed to load lastSelectedSkill', e);
        setSelectedSkill('smuggling');
      }
    })();
  }, []);

  useEffect(() => {
    if (selectedSkill) {
      AsyncStorage.setItem('lastSelectedSkill', selectedSkill).catch(err => console.log('Persist selectedSkill failed', err));
    }
  }, [selectedSkill]);

  useEffect(() => {
    if (currentView !== 'shop') {
      setTargetResourceId(undefined);
    }
  }, [currentView]);

  useEffect(() => {
    if (currentView !== 'skills' && showSidebar) {
      console.log('[UI] Closing skill sidebar due to view change to', currentView);
      setShowSidebar(false);
    }
  }, [currentView, showSidebar]);

  const renderContent = () => {
    switch (currentView) {
      case 'skills':
        return (
          <SkillGrid 
            selectedSkill={selectedSkill}
            onSelectSkill={setSelectedSkill}
            onNavigateToStore={(resourceId?: string) => {
              setTargetResourceId(resourceId);
              setCurrentView('shop');
            }}
            onNavigateToSmuggling={() => {
              setSelectedSkill('smuggling');
              setCurrentView('skills');
            }}
          />
        );
      case 'bank':
        return <BankView />;
      case 'shop':
        return <Store targetResourceId={targetResourceId} />;
      case 'combat':
        return <CombatScreen />;

      default:
        return null;
    }
  };

  const getPlayerLevel = () => {
    try {
      return getPlayerLevelAvg();
    } catch (e) {
      const skillList = Object.values(skills);
      const count = skillList.length;
      if (count === 0) return 1;
      const sum = skillList.reduce((acc, s) => acc + (typeof s.level === 'number' ? s.level : 1), 0);
      const avg = Math.floor(sum / count);
      return Math.max(1, avg);
    }
  };

  const getTotalXp = () => {
    return Object.values(skills).reduce((sum, skill) => sum + skill.experience, 0);
  };






  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>


      {showGameMenu && (
        <View style={styles.gameMenuFullOverlay}>
          <TouchableOpacity 
            style={styles.gameMenuBackdrop} 
            activeOpacity={1}
            onPress={() => setShowGameMenu(false)}
          >
            <View style={styles.gameMenuContainer}>
              <TouchableOpacity 
                activeOpacity={1}
                onPress={(e) => e.stopPropagation()}
              >
                <View style={styles.gameMenuContent}>
                  <View style={styles.gameMenuHeader}>
                    <Text style={styles.gameMenuTitle}>Game Menu</Text>
                    <TouchableOpacity 
                      style={styles.closeButton}
                      onPress={() => setShowGameMenu(false)}
                    >
                      <X size={24} color="#fff" />
                    </TouchableOpacity>
                  </View>
                  
                  <TouchableOpacity style={styles.gameMenuItem} onPress={() => {
                    setShowGameMenu(false);
                    router.push('/settings');
                  }}>
                    <Settings size={24} color="#4ade80" />
                    <Text style={styles.gameMenuText}>Settings</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.gameMenuItem} onPress={() => {
                    setShowGameMenu(false);
                    router.push('/profile');
                  }}>
                    <User size={24} color="#4ade80" />
                    <Text style={styles.gameMenuText}>Profile</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.gameMenuItem} onPress={() => {
                    setShowGameMenu(false);
                    router.push('/achievements');
                  }}>
                    <Trophy size={24} color="#4ade80" />
                    <Text style={styles.gameMenuText}>Achievements</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.gameMenuItem} onPress={() => {
                    console.log('Wiki pressed');
                    setShowGameMenu(false);
                  }}>
                    <BookOpen size={24} color="#4ade80" />
                    <Text style={styles.gameMenuText}>Wiki</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.gameMenuItem} onPress={() => {
                    console.log('Statistics pressed');
                    setShowGameMenu(false);
                  }}>
                    <BarChart3 size={24} color="#4ade80" />
                    <Text style={styles.gameMenuText}>Statistics</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.gameMenuItem} onPress={() => {
                    console.log('Help pressed');
                    setShowGameMenu(false);
                  }}>
                    <HelpCircle size={24} color="#4ade80" />
                    <Text style={styles.gameMenuText}>Help</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.mobileHeader}>
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => setShowGameMenu(true)}
        >
          <Menu size={24} color="#fff" />
        </TouchableOpacity>
        
        <Text style={styles.gameName} testID="game-title">{selectedSkill ? `${SKILL_ICONS[selectedSkill]} ` : '🎮 '}Criminal Boss</Text>
        
        <View style={styles.headerStats}>
          <View style={styles.statChip} testID="chip-level">
            <Text style={styles.statChipText}>LV {getPlayerLevel()}</Text>
          </View>
          <View style={[styles.statChip, styles.statChipGold]} testID="chip-gold">
            <Text style={styles.statChipText}>${formatCash(gold)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={[styles.navItem, currentView === 'skills' && styles.activeNavItem]}
          onPress={() => {
            if (currentView === 'skills') {
              setShowSidebar(!showSidebar);
            } else {
              setCurrentView('skills');
              setShowSidebar(false);
            }
          }}
        >
          <Text style={styles.navIcon} testID="tab-skills-icon">{selectedSkill ? SKILL_ICONS[selectedSkill] : '🧪'}</Text>
          <Text style={[styles.navText, currentView === 'skills' && styles.activeNavText]}>Skills</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.navItem, currentView === 'bank' && styles.activeNavItem]}
          onPress={() => { setCurrentView('bank'); setShowSidebar(false); }}
        >
          <Package size={20} color={currentView === 'bank' ? '#4ade80' : '#666'} />
          <Text style={[styles.navText, currentView === 'bank' && styles.activeNavText]}>Bank</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.navItem, currentView === 'combat' && styles.activeNavItem]}
          onPress={() => { setCurrentView('combat'); setShowSidebar(false); }}
        >
          <Sword size={20} color={currentView === 'combat' ? '#4ade80' : '#666'} />
          <Text style={[styles.navText, currentView === 'combat' && styles.activeNavText]}>Combat</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.navItem, currentView === 'shop' && styles.activeNavItem]}
          onPress={() => {
            setTargetResourceId(undefined);
            setCurrentView('shop');
            setShowSidebar(false);
          }}
        >
          <Coins size={20} color={currentView === 'shop' ? '#4ade80' : '#666'} />
          <Text style={[styles.navText, currentView === 'shop' && styles.activeNavText]}>Shop</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.mainContent} testID="main-content">
        {showSidebar && (
          <View style={styles.skillOverlay}>
            <ScrollView style={styles.skillList} showsVerticalScrollIndicator={false}>
              <Text style={styles.skillSectionTitle}>PRODUCTION SKILLS</Text>
              {(() => {
                const skillEntries = Object.entries(skills);
                const priorityOrder = ['smuggling', 'thieving'] as const;
                const prioritized = priorityOrder
                  .map((id) => skillEntries.find(([sid]) => sid === id))
                  .filter((e): e is [string, (typeof skills)[keyof typeof skills]] => Array.isArray(e));
                const remaining = skillEntries.filter(([sid]) => !priorityOrder.includes(sid as any));
                const ordered = [...prioritized, ...remaining];
                return ordered.map(([skillId, skill]) => {
                  const isActive = skill.isActive;
                  const isSelected = selectedSkill === skillId;
                  return (
                    <TouchableOpacity
                      key={skillId}
                      style={[
                        styles.skillItem,
                        isSelected && styles.selectedSkillItem,
                        isActive && styles.activeSkillItem
                      ]}
                      onPress={() => {
                        setSelectedSkill(skillId);
                        setShowSidebar(false);
                      }}
                    >
                      <Text style={styles.skillIcon}>{SKILL_ICONS[skillId]}</Text>
                      <View style={styles.skillInfo}>
                        <Text style={styles.skillName}>{skill.name}</Text>
                        <Text style={[styles.skillLevel, isActive && styles.activeSkillLevel]}>
                          Level {skill.level}/100
                        </Text>
                      </View>
                      {isActive && <View style={styles.activeIndicator} />}
                    </TouchableOpacity>
                  );
                });
              })()}
            </ScrollView>
          </View>
        )}
        
        <View style={styles.contentArea}>
          {currentView === 'skills' && selectedSkill && (
            <View style={styles.skillHeader}>
              <View style={styles.mafiaHeaderContainer}>
                <View style={styles.mafiaHeaderLeft}>
                  <View style={styles.skillIconContainer}>
                    <Text style={styles.mafiaSkillIcon}>{SKILL_ICONS[selectedSkill]}</Text>
                  </View>
                  <View style={styles.skillInfoContainer}>
                    <Text style={styles.mafiaSkillName}>{skills[selectedSkill]?.name ?? 'Skill'}</Text>
                    <Text style={styles.mafiaSkillLevel}>LEVEL {skills[selectedSkill]?.level ?? 1}/100</Text>
                  </View>
                </View>
                <View style={styles.mafiaHeaderRight}>
                  <View style={styles.xpContainer}>
                    <Text style={styles.mafiaXpLabel}>EXPERIENCE</Text>
                    <Text style={styles.mafiaXpValue}>{formatCash(skills[selectedSkill]?.experience ?? 0)}</Text>
                  </View>
                  <View style={styles.progressContainer}>
                    {(() => {
                      const lvl = skills[selectedSkill]?.level ?? 1;
                      const exp = skills[selectedSkill]?.experience ?? 0;
                      if (lvl >= 100) {
                        return (
                          <View style={styles.mafiaXpBar}>
                            <View style={[styles.mafiaXpFill, { width: '100%' }]} />
                          </View>
                        );
                      }
                      const currentLevelXp = getXpForLevel(lvl);
                      const nextLevelXp = getXpForLevel(lvl + 1);
                      const denom = Math.max(1, (nextLevelXp ?? 0) - currentLevelXp);
                      const pct = Math.min(100, Math.max(0, ((exp - currentLevelXp) / denom) * 100));
                      return (
                        <View style={styles.mafiaXpBar}>
                          <View style={[styles.mafiaXpFill, { width: `${pct}%` }]} />
                        </View>
                      );
                    })()}
                    <Text style={styles.mafiaXpToNext}>
                      {(() => {
                        const lvl = skills[selectedSkill]?.level ?? 1;
                        if (lvl >= 100) return 'MAX LEVEL';
                        const nextLevelXp = getXpForLevel(lvl + 1);
                        const remaining = (nextLevelXp ?? 0) - (skills[selectedSkill]?.experience ?? 0);
                        return remaining > 0 ? `${formatCash(remaining)} TO NEXT LEVEL` : 'MAX LEVEL';
                      })()}
                    </Text>
                  </View>
                </View>
                {selectedSkill === 'thieving' && (
                  <View style={styles.headerHeatContainer} testID="heat-section">
                    <View style={styles.heatHeaderBottom}>
                      <Text style={styles.heatLabel}>🔥 Heat Level</Text>
                      <Text style={[
                        styles.heatValue,
                        heat > 75 ? styles.heatCritical : heat > 50 ? styles.heatHigh : heat > 25 ? styles.heatMedium : styles.heatLow
                      ]}>
                        {heat}%
                      </Text>
                    </View>
                    <View style={styles.heatBar}>
                      <View style={[
                        styles.heatFill,
                        heat > 75 ? styles.heatFillCritical : heat > 50 ? styles.heatFillHigh : heat > 25 ? styles.heatFillMedium : styles.heatFillLow,
                        { width: `${Math.min(heat, 100)}%` }
                      ]} />
                    </View>
                  </View>
                )}
              </View>
              <HeaderXpToasts skillId={selectedSkill as string} />
            </View>
          )}
          {currentView === 'bank' || currentView === 'combat' ? (
            <View style={styles.scrollContent} testID="scroll-content">
              {renderContent()}
            </View>
          ) : (
            <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false} testID="scroll-content">
              {renderContent()}
            </ScrollView>
          )}
        </View>
      </View>
    </View>
  );
}

function HeaderXpToasts({ skillId }: { skillId: string }) {
  const { xpToasts } = useGameStore();
  const filtered = useMemo(() => xpToasts.filter(t => t.skillId === skillId), [xpToasts, skillId]);
  return (
    <View pointerEvents="none" style={styles.xpToastAnchorRight} testID="xp-toast-anchor">
      {filtered.map(t => (
        <XpToast key={t.id} amount={t.amount} />
      ))}
    </View>
  );
}

function XpToast({ amount }: { amount: number }) {
  const opacity = React.useRef(new (require('react-native').Animated.Value)(0)).current;
  const translateY = React.useRef(new (require('react-native').Animated.Value)(0)).current;

  useEffect(() => {
    opacity.setValue(0);
    translateY.setValue(0);
    const { Animated } = require('react-native');
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 120, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: -14, duration: 400, useNativeDriver: true }),
    ]).start(() => {
      Animated.timing(opacity, { toValue: 0, duration: 300, delay: 120, useNativeDriver: true }).start();
    });
  }, [amount, opacity, translateY]);

  const { Animated } = require('react-native');
  return (
    <Animated.View style={[styles.xpToast, { opacity, transform: [{ translateY }] }]} testID="xp-toast">
      <Text style={styles.xpToastText}>+{amount} XP</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  mobileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a3e',
    zIndex: 1,
  },
  menuButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#2a2a3e',
  },
  gameName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  headerStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.6)',
    marginLeft: 8,
  },
  statChipBlue: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderColor: 'rgba(59, 130, 246, 0.6)',
  },
  statChipGold: {
    backgroundColor: 'rgba(218, 165, 32, 0.15)',
    borderColor: 'rgba(218, 165, 32, 0.6)',
  },
  statChipText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
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
  mainContent: {
    flex: 1,
    position: 'relative',
  },
  skillOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    zIndex: 1000,
    paddingTop: 20,
  },
  skillList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  skillSectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4ade80',
    marginBottom: 16,
    textAlign: 'center',
  },
  skillItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2a2a3e',
  },
  selectedSkillItem: {
    borderColor: '#4ade80',
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
  },
  activeSkillItem: {
    borderColor: '#fbbf24',
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
  },
  skillIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  skillInfo: {
    flex: 1,
  },
  skillName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  skillLevel: {
    fontSize: 14,
    color: '#888',
  },
  activeSkillLevel: {
    color: '#fbbf24',
  },
  activeIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#fbbf24',
  },
  contentArea: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  skillHeader: {
    backgroundColor: '#0f0f1a',
    paddingVertical: 12,
    paddingHorizontal: 16,
    position: 'relative',
  },
  mafiaHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 69, 19, 0.1)',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 69, 19, 0.3)',
    shadowColor: '#8b4513',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
    flexWrap: 'wrap',
  },
  mafiaHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 160,
  },
  skillIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(139, 69, 19, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(139, 69, 19, 0.5)',
    marginRight: 12,
  },
  mafiaSkillIcon: {
    fontSize: 24,
    textShadowColor: '#8b4513',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  skillInfoContainer: {
    flex: 1,
  },
  mafiaSkillName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#f5deb3',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  mafiaSkillLevel: {
    fontSize: 11,
    color: '#cd853f',
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 2,
  },
  mafiaHeaderRight: {
    alignItems: 'flex-end',
    minWidth: 120,
  },
  xpContainer: {
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  mafiaXpLabel: {
    fontSize: 9,
    color: '#8b7355',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  mafiaXpValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#daa520',
    textShadowColor: 'rgba(218, 165, 32, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  progressContainer: {
    width: '100%',
  },
  mafiaXpBar: {
    height: 6,
    backgroundColor: 'rgba(139, 69, 19, 0.3)',
    borderRadius: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(139, 69, 19, 0.5)',
    marginBottom: 4,
  },
  mafiaXpFill: {
    height: '100%',
    backgroundColor: '#daa520',
    borderRadius: 2,
    shadowColor: '#daa520',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
  },
  mafiaXpToNext: {
    fontSize: 8,
    color: '#8b7355',
    fontWeight: '600',
    letterSpacing: 0.3,
    textAlign: 'right',
  },
  mafiaDescriptionContainer: {
    marginTop: 12,
    backgroundColor: 'rgba(139, 69, 19, 0.05)',
    borderRadius: 6,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(139, 69, 19, 0.2)',
  },
  mafiaDescriptionText: {
    fontSize: 12,
    color: '#d2b48c',
    lineHeight: 16,
    textAlign: 'center',
    fontStyle: 'italic',
    letterSpacing: 0.2,
  },
  heatHeaderBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  heatLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ff6b6b',
  },
  heatValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  heatLow: {
    color: '#4ade80',
  },
  heatMedium: {
    color: '#fbbf24',
  },
  heatHigh: {
    color: '#fb923c',
  },
  heatCritical: {
    color: '#ef4444',
  },
  headerHeatContainer: {
    width: '100%',
    marginTop: 10,
  },
  heatBar: {
    height: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  heatFill: {
    height: '100%',
    borderRadius: 3,
  },
  heatFillLow: {
    backgroundColor: '#4ade80',
  },
  heatFillMedium: {
    backgroundColor: '#fbbf24',
  },
  heatFillHigh: {
    backgroundColor: '#fb923c',
  },
  heatFillCritical: {
    backgroundColor: '#ef4444',
  },
  heatDescription: {
    fontSize: 11,
    color: '#aaa',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  skillTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  skillSubtitle: {
    fontSize: 14,
    color: '#4ade80',
  },
  scrollContent: {
    flex: 1,
  },
  comingSoon: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  comingSoonText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
  },
  gameMenuFullOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    elevation: 999,
  },
  gameMenuBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  gameMenuContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  gameMenuContent: {
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 350,
    borderWidth: 2,
    borderColor: '#4ade80',
    shadowColor: '#4ade80',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  gameMenuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  gameMenuTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    padding: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  gameMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#2a2a3e',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  gameMenuText: {
    fontSize: 18,
    color: '#fff',
    marginLeft: 16,
    fontWeight: '600',
  },
  xpToastAnchorRight: {
    position: 'absolute',
    right: 16,
    top: 8,
    alignItems: 'flex-end',
    zIndex: 10000,
    elevation: 1000,
    pointerEvents: 'none',
  },
  xpToast: {
    marginTop: 6,
  },
  xpToastText: {
    color: '#4ade80',
    fontWeight: '700',
    fontSize: 14,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  headerMainContainer: {
    width: '100%',
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerSkillIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  headerSkillName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  headerSkillLevel: {
    fontSize: 14,
    color: '#4ade80',
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  headerXp: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#daa520',
    marginBottom: 2,
  },
  headerXpToNext: {
    fontSize: 12,
    color: '#888',
  },
  headerDescriptionSection: {
    marginTop: 8,
  },
  headerDescriptionText: {
    fontSize: 13,
    color: '#ccc',
    lineHeight: 18,
    textAlign: 'justify',
  },
  xpBar: {
    height: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 8,
  },
  xpFill: {
    height: '100%',
    backgroundColor: '#4ade80',
    borderRadius: 3,
  },
});
