import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGameStore } from '@/store/gameStore';
import SkillGrid from '@/components/SkillGrid';
import BankView from '@/components/BankView';
import { Store } from '@/components/Store';
import CombatScreen from '@/app/combat';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameMenu } from '@/components/GameMenu';
import { BottomNav } from '@/components/BottomNav';
import { MobileHeader } from '@/components/MobileHeader';
import { SkillHeader } from '@/components/SkillHeader';
import { SkillList } from '@/components/SkillList';

type ViewType = 'skills' | 'bank' | 'shop' | 'combat';

export default function GameScreen() {
  const [currentView, setCurrentView] = useState<ViewType>('skills');
  const [selectedSkill, setSelectedSkill] = useState<string | null>('smuggling');
  const [showSidebar, setShowSidebar] = useState(false);
  const [showGameMenu, setShowGameMenu] = useState(false);
  const [targetResourceId, setTargetResourceId] = useState<string | undefined>(undefined);
  const { skills, loadGame, gold, getPlayerLevelAvg } = useGameStore();
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

  const handleSetCurrentView = (view: ViewType) => {
    if (view === 'shop') {
      setTargetResourceId(undefined);
    }
    setCurrentView(view);
    setShowSidebar(false);
  };

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

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>

      {showGameMenu && <GameMenu onClose={() => setShowGameMenu(false)} />}

      <MobileHeader
        selectedSkill={selectedSkill}
        playerLevel={getPlayerLevel()}
        gold={gold}
        onShowGameMenu={() => setShowGameMenu(true)}
      />

      <BottomNav
        currentView={currentView}
        selectedSkill={selectedSkill}
        onSetCurrentView={handleSetCurrentView}
        onShowSidebar={() => setShowSidebar(!showSidebar)}
      />

      <View style={styles.mainContent} testID="main-content">
        {showSidebar && (
            <SkillList
                selectedSkill={selectedSkill}
                onSetSelectedSkill={setSelectedSkill}
                onClose={() => setShowSidebar(false)}
            />
        )}
        
        <View style={styles.contentArea}>
          {currentView === 'skills' && selectedSkill && (
            <SkillHeader selectedSkill={selectedSkill} />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  mainContent: {
    flex: 1,
    position: 'relative',
  },
  contentArea: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  scrollContent: {
    flex: 1,
  },
});
