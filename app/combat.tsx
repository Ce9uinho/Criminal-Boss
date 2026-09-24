import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Platform, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Sword, Shield, Map as MapIcon, Coins, Gift } from 'lucide-react-native';
import { useGameStore } from '@/store/gameStore';
import { EQUIPMENT_CATALOG } from '@/constants/gameData';
import type { EquipmentSlot as SlotType } from '@/types/game';
import { COMBAT_DUNGEONS, getDungeonGoldReward, getPlayerCombatStats, getPlayerAttackIntervalMs, CombatEnemy, CombatDungeon } from '@/constants/combat';

type CombatTab = 'equipment' | 'combat' | 'dungeons';

type Rarity = 'common' | 'elite' | 'boss';

type SimpleEnemy = CombatEnemy;
type SimpleDungeon = CombatDungeon;
interface SessionLootEntry { type: 'gold' | 'item'; resourceId?: string; quantity: number; at: number }

export default function CombatScreen() {
  const insets = useSafeAreaInsets();
  const combatLastTab = useGameStore(s => s.combatLastTab);
  const setCombatLastTab = useGameStore(s => s.setCombatLastTab);
  const [activeTab, setActiveTab] = useState<CombatTab>(combatLastTab ?? 'combat');
  const combatAutoResume = useGameStore(s => s.combatAutoResume);
  const skillsState = useGameStore(s => s.skills);
  const storeEquipped = useGameStore(s => s.equipped);
  const addGold = useGameStore(s => s.addGold);
  const addResource = useGameStore(s => s.addResource);
  const equipFromBank = useGameStore(s => s.equipFromBank);
  const unequip = useGameStore(s => s.unequip);
  const setCombatAutoResume = useGameStore(s => s.setCombatAutoResume);
  const setCombatSnapshot = useGameStore(s => s.setCombatSnapshot);
  const getCombatSnapshot = useGameStore(s => s.getCombatSnapshot);
  const clearCombatResume = useGameStore(s => s.clearCombatResume);

  const equipmentSlots: { id: SlotType; name: string; icon: string }[] = [
    { id: 'weapon', name: 'Weapon', icon: '🗡️' },
    { id: 'offhand', name: 'Off-hand', icon: '🛡️' },
    { id: 'helmet', name: 'Helmet', icon: '🪖' },
    { id: 'chest', name: 'Chest', icon: '🥋' },
    { id: 'legs', name: 'Legs', icon: '👖' },
    { id: 'boots', name: 'Boots', icon: '🥾' },
    { id: 'amulet', name: 'Amulet', icon: '📿' },
    { id: 'ring', name: 'Ring', icon: '💍' },
    { id: 'ammunition', name: 'Ammunition', icon: '🎯' },
    { id: 'backpack', name: 'Backpack', icon: '🎒' },
    { id: 'scroll', name: 'Scroll', icon: '📜' },
    { id: 'potion', name: 'Potion', icon: '🧪' },
    { id: 'gloves', name: 'Gloves', icon: '🧤' },
  ];

  const totalStats = useMemo(() => getPlayerCombatStats(storeEquipped), [storeEquipped]);
  const dungeons: SimpleDungeon[] = COMBAT_DUNGEONS;
  const combatSelectedDungeon = useGameStore(s => s.combatSelectedDungeon);
  const setCombatSelectedDungeon = useGameStore(s => s.setCombatSelectedDungeon);
  const [selectedDungeon, setSelectedDungeon] = useState<string>(combatSelectedDungeon ?? (dungeons[0]?.id ?? 'back_alley'));

  const [isFighting, setIsFighting] = useState<boolean>(false);
  const [playerHp, setPlayerHp] = useState<number>(totalStats.hp);
  const [enemyHp, setEnemyHp] = useState<number>(dungeons[0]?.enemy?.hp ?? 1);
  const [enemyIndex, setEnemyIndex] = useState<number>(0);
  const [sessionGold, setSessionGold] = useState<number>(0);

  const [sessionLoot, setSessionLoot] = useState<SessionLootEntry[]>([]);
  const currentDungeon = useMemo(() => dungeons.find(d => d.id === selectedDungeon) ?? dungeons[0], [selectedDungeon, dungeons]);
  const currentEnemy = useMemo(() => {
    if (!currentDungeon) return undefined;
    const isBoss = enemyIndex >= currentDungeon.enemyCount;
    return isBoss ? currentDungeon.boss : currentDungeon.enemy;
  }, [currentDungeon, enemyIndex]);
  const fightTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const attackProgress = useRef(new Animated.Value(0)).current;
  const tickMs = 120;
  const playerIntervalMs = useMemo(() => getPlayerAttackIntervalMs(storeEquipped), [storeEquipped]);
  const enemyIntervalMs = useMemo(() => {
    const secPerAttack = (currentEnemy?.attackSpeed ?? 1.8);
    const intervalMs = Math.floor(secPerAttack * 1000);
    return Math.max(600, intervalMs);
  }, [currentEnemy?.attackSpeed]);
  const playerHitAnim = useRef(new Animated.Value(0)).current;
  const enemyHitAnim = useRef(new Animated.Value(0)).current;
  const enemyAttackProgress = useRef(new Animated.Value(0)).current;
  const [lastPlayerDmg, setLastPlayerDmg] = useState<number>(0);
  const [lastEnemyDmg, setLastEnemyDmg] = useState<number>(0);
  const [playerMissText, setPlayerMissText] = useState<string>('');
  const [enemyMissText, setEnemyMissText] = useState<string>('');
  const playerMissAnim = useRef(new Animated.Value(0)).current;
  const enemyMissAnim = useRef(new Animated.Value(0)).current;

  const combatDeath = useGameStore(s => s.combatDeath);

  useEffect(() => {
    setCombatLastTab(activeTab);
  }, [activeTab, setCombatLastTab]);

  useEffect(() => {
    setPlayerHp(totalStats.hp);
  }, [totalStats.hp]);

  const stopFight = useCallback(() => {
    console.log('stopFight called - stopping combat');
    
    // Clear the timer first
    if (fightTimer.current != null) {
      clearInterval(fightTimer.current as ReturnType<typeof setInterval>);
      console.log('Cleared fight timer');
      fightTimer.current = null;
    }
    
    // Stop background combat and clear all combat state
    try { 
      useGameStore.getState().stopBackgroundCombat(); 
      console.log('Stopped background combat');
    } catch (e) {
      console.log('Failed to stop background combat', e);
    }
    
    // Clear resume flags FIRST before resetting state
    try { setCombatAutoResume(false); } catch {}
    try { clearCombatResume(); } catch {}
    
    // Reset all state
    setIsFighting(false);
    setEnemyIndex(0);
    setEnemyHp(currentDungeon?.enemy?.hp ?? 1);
    setPlayerHp(totalStats.hp);
    setSessionGold(0);
    setSessionLoot([]);
    
    // Reset animations
    attackProgress.stopAnimation();
    enemyAttackProgress.stopAnimation();
    attackProgress.setValue(0);
    enemyAttackProgress.setValue(0);
    
    console.log('Combat stopped successfully');
  }, [attackProgress, enemyAttackProgress, currentDungeon, totalStats.hp, setCombatAutoResume, clearCombatResume]);

  const startFight = useCallback((resume?: { enemyIndex: number; enemyHp: number }) => {
    if (isFighting) return;
    
    // Stop all other skills when starting combat
    try {
      const allSkills = Object.keys(skillsState || {});
      allSkills.forEach(skillId => {
        if ((skillsState as any)[skillId]?.isActive) {
          useGameStore.getState().stopActivity(skillId);
        }
      });
      // Also cancel a thieving target queued to restart after its cooldown.
      useGameStore.setState({ thievingAutoResume: false, currentThievingActivity: undefined });
    } catch (e) {
      console.log('Failed to stop other skills', e);
    }
    
    setIsFighting(true);
    setPlayerHp(totalStats.hp);
    if (!resume) {
      // Only reset when explicitly starting fresh from idle; dungeon chaining keeps counters
      // Keep sessionGold and sessionLoot to persist across dungeon completions
    }
    setEnemyIndex(resume?.enemyIndex ?? 0);
    let enemyIdxLocal = resume?.enemyIndex ?? 0;
    let enemyHpLocal = resume?.enemyHp ?? (currentDungeon?.enemy?.hp ?? 1);
    setEnemyHp(enemyHpLocal);

    attackProgress.stopAnimation();
    enemyAttackProgress.stopAnimation();
    playerHitAnim.stopAnimation();
    enemyHitAnim.stopAnimation();
    playerMissAnim.stopAnimation();
    enemyMissAnim.stopAnimation();
    attackProgress.setValue(0);
    enemyAttackProgress.setValue(0);
    Animated.timing(attackProgress, { toValue: 1, duration: playerIntervalMs, useNativeDriver: false }).start();
    Animated.timing(enemyAttackProgress, { toValue: 1, duration: enemyIntervalMs, useNativeDriver: false }).start();

    let playerCd = 0;
    let enemyCd = 0;

    fightTimer.current = setInterval(() => {
      try {
        const isBoss = enemyIdxLocal >= (currentDungeon?.enemyCount ?? 0);
        const activeEnemy = isBoss ? currentDungeon?.boss : currentDungeon?.enemy;
        playerCd += tickMs;
        enemyCd += tickMs;
        if (playerCd >= playerIntervalMs) {
          playerCd -= playerIntervalMs;
          attackProgress.stopAnimation();
          attackProgress.setValue(0);
          Animated.timing(attackProgress, { toValue: 1, duration: playerIntervalMs, useNativeDriver: false }).start();

          const hitChance = Math.min(95, Math.max(5, totalStats.accuracy - (activeEnemy?.evasion ?? 0)));
          const playerHit = Math.random() * 100 < hitChance;
          const base = totalStats.attack;
          const variance = Math.max(1, Math.floor(base * 0.15));
          const roll = base + Math.floor((Math.random() * variance - variance / 2));
          const dmgRaw = Math.max(1, roll - Math.floor((activeEnemy?.defense ?? 0) / 2));
          const crit = Math.random() * 100 < (totalStats.critChance ?? 0);
          const playerDmg = playerHit ? Math.max(1, Math.floor(dmgRaw * (crit ? 1.5 : 1))) : 0;
          if (playerDmg > 0) {
            setLastPlayerDmg(playerDmg);
            enemyHitAnim.stopAnimation();
            enemyHitAnim.setValue(1);
            Animated.timing(enemyHitAnim, { toValue: 0, duration: 900, useNativeDriver: Platform.OS !== 'web' }).start();
          } else {
            setEnemyMissText(Math.random() < 0.5 ? 'Dodged' : 'Blocked');
            enemyMissAnim.stopAnimation();
            enemyMissAnim.setValue(1);
            Animated.timing(enemyMissAnim, { toValue: 0, duration: 1000, useNativeDriver: Platform.OS !== 'web' }).start();
          }
          enemyHpLocal = Math.max(0, enemyHpLocal - playerDmg);
          setEnemyHp(enemyHpLocal);
          if (enemyHpLocal <= 0) {
            const nextLocal = enemyIdxLocal + 1;
            const totalEnemies = (currentDungeon?.enemyCount ?? 0) + 1;
            if (nextLocal >= totalEnemies) {
              const goldReward = currentDungeon ? getDungeonGoldReward(currentDungeon) : 50;
              addGold(goldReward);
              setSessionGold(prev => prev + goldReward);
              addResource('loot_bag', 1);
              useGameStore.getState().trackContract({ type: 'dungeon', qty: 1 });
              useGameStore.getState().bumpStat('dungeonsCleared');
              setSessionLoot(prev => [...prev, { type: 'item', resourceId: 'loot_bag', quantity: 1, at: Date.now() }]);
              if (fightTimer.current != null) clearInterval(fightTimer.current as ReturnType<typeof setInterval>);
              fightTimer.current = null;
              setIsFighting(false);
              setEnemyIndex(0);
              setEnemyHp(currentDungeon?.enemy?.hp ?? 1);
              attackProgress.stopAnimation();
              Animated.timing(attackProgress, { toValue: 0, duration: 120, useNativeDriver: false }).start();
              setTimeout(() => {
                setPlayerHp(totalStats.hp);
                startFight();
              }, 500);
              return;
            }
            enemyIdxLocal = nextLocal;
            setEnemyIndex(nextLocal);
            const nextIsBoss = nextLocal >= (currentDungeon?.enemyCount ?? 0);
            enemyHpLocal = nextIsBoss ? (currentDungeon?.boss?.hp ?? 1) : (currentDungeon?.enemy?.hp ?? 1);
            setEnemyHp(enemyHpLocal);
            return;
          }
        }

        if (enemyCd >= enemyIntervalMs) {
          enemyCd -= enemyIntervalMs;
          enemyAttackProgress.stopAnimation();
          enemyAttackProgress.setValue(0);
          Animated.timing(enemyAttackProgress, { toValue: 1, duration: enemyIntervalMs, useNativeDriver: false }).start();
          const isBossLocal = enemyIdxLocal >= (currentDungeon?.enemyCount ?? 0);
          const enemyEnt = isBossLocal ? currentDungeon?.boss : currentDungeon?.enemy;
          if (enemyEnt) {
            const enemyHitChance = Math.min(95, Math.max(5, (enemyEnt.accuracy ?? 70) - totalStats.evasion));
            const enemyHits = Math.random() * 100 < enemyHitChance;
            const base = enemyEnt.attack ?? 5;
            const variance = Math.max(1, Math.floor(base * 0.15));
            const roll = base + Math.floor((Math.random() * variance - variance / 2));
            const enemyCrit = Math.random() * 100 < (enemyEnt.critChance ?? 0);
            const dmgRaw = Math.max(0, Math.floor(roll - totalStats.defense / 3));
            const enemyDmg = enemyHits ? Math.max(0, Math.floor(dmgRaw * (enemyCrit ? (enemyEnt.critDamage ?? 150) / 100 : 1))) : 0;
            if (enemyDmg > 0) {
              setLastEnemyDmg(enemyDmg);
              playerHitAnim.stopAnimation();
              playerHitAnim.setValue(1);
              Animated.timing(playerHitAnim, { toValue: 0, duration: 900, useNativeDriver: Platform.OS !== 'web' }).start();
            } else {
              setPlayerMissText(Math.random() < 0.5 ? 'Dodged' : 'Blocked');
              playerMissAnim.stopAnimation();
              playerMissAnim.setValue(1);
              Animated.timing(playerMissAnim, { toValue: 0, duration: 1000, useNativeDriver: Platform.OS !== 'web' }).start();
            }
            setPlayerHp(prev => {
              const nextHp = Math.max(0, prev - enemyDmg);
              if (nextHp <= 0) {
                try {
                  const enemyName = enemyEnt?.name ?? 'Enemy';
                  useGameStore.getState().setCombatDeath(enemyName);
                } catch (err) {
                  console.log('setCombatDeath failed', err);
                }
                try { setCombatAutoResume(false); } catch {}
                try { clearCombatResume(); } catch {}
                try { useGameStore.getState().stopBackgroundCombat(); } catch {}
                stopFight();
                return 0;
              }
              return nextHp;
            });
          }
        }
      } catch (e) {
        console.log('combat tick error', e);
        stopFight();
      }
    }, tickMs);
  }, [isFighting, totalStats, currentDungeon, addGold, addResource, stopFight, attackProgress, enemyHitAnim, playerHitAnim, playerIntervalMs, enemyIntervalMs, enemyAttackProgress]);

  useEffect(() => {
    return () => {
      try {
        const anyOtherSkillActive = Object.keys(skillsState || {}).some(k => (skillsState as any)[k]?.isActive);
        if (isFighting && !anyOtherSkillActive) {
          const snap = { dungeonId: selectedDungeon, enemyIndex, enemyHp, at: Date.now() };
          console.log('Combat screen unmounting while fighting, starting background combat');
          if (fightTimer.current != null) {
            clearInterval(fightTimer.current as ReturnType<typeof setInterval>);
            fightTimer.current = null;
          }
          setTimeout(() => {
            try {
              setCombatAutoResume(true);
              setCombatSnapshot(snap);
              useGameStore.getState().startBackgroundCombat({ dungeonId: snap.dungeonId, enemyIndex: snap.enemyIndex, enemyHp: snap.enemyHp, playerHp });
            } catch (err) {
              console.log('startBackgroundCombat on unmount failed', err);
            }
          }, 0);
        } else {
          try { setCombatAutoResume(false); } catch {}
        }
      } catch (e) {
        console.log('Combat unmount cleanup failed', e);
      }
    };
  }, [isFighting, selectedDungeon, enemyIndex, enemyHp, playerHp, setCombatAutoResume, setCombatSnapshot, skillsState]);

  useEffect(() => {
    let cancelled = false;
    setTimeout(() => {
      if (cancelled) return;
      if (activeTab === 'combat') {
        console.log('Returned to combat tab');
        try { useGameStore.getState().stopBackgroundCombat(); } catch (e) { console.log('stopBackgroundCombat failed', e); }
        const snap = getCombatSnapshot?.();
        if (snap) {
          const now = Date.now();
          const elapsed = Math.max(0, now - (snap.at ?? now));
          const playerProg = Math.min(0.99, (elapsed % playerIntervalMs) / playerIntervalMs);
          const enemyProg = Math.min(0.99, (elapsed % enemyIntervalMs) / enemyIntervalMs);
          setEnemyIndex(snap.enemyIndex ?? 0);
          setEnemyHp(snap.enemyHp ?? (currentDungeon?.enemy?.hp ?? 1));
          setPlayerHp((prev) => (prev > 0 ? prev : totalStats.hp));
          attackProgress.setValue(playerProg);
          enemyAttackProgress.setValue(enemyProg);
        } else {
          attackProgress.setValue(0);
          enemyAttackProgress.setValue(0);
        }
        if (fightTimer.current == null && isFighting) {
          setIsFighting(false);
          const resume = { enemyIndex: snap?.enemyIndex ?? enemyIndex, enemyHp: snap?.enemyHp ?? enemyHp };
          setTimeout(() => startFight(resume), 0);
        }
        if (fightTimer.current != null) {
          const ap = (attackProgress as any)?._value ?? 0;
          const ep = (enemyAttackProgress as any)?._value ?? 0;
          const remainingPlayer = Math.max(120, Math.floor(playerIntervalMs * (1 - Math.max(0, Math.min(1, ap)))));
          const remainingEnemy = Math.max(120, Math.floor(enemyIntervalMs * (1 - Math.max(0, Math.min(1, ep)))));
          attackProgress.stopAnimation();
          enemyAttackProgress.stopAnimation();
          Animated.timing(attackProgress, { toValue: 1, duration: remainingPlayer, useNativeDriver: false }).start();
          Animated.timing(enemyAttackProgress, { toValue: 1, duration: remainingEnemy, useNativeDriver: false }).start();
        }
      } else {
        console.log('Leaving combat tab - moving combat to background');
        if (isFighting) {
          if (fightTimer.current != null) {
            clearInterval(fightTimer.current as ReturnType<typeof setInterval>);
            fightTimer.current = null;
          }
          const snap = { dungeonId: selectedDungeon, enemyIndex, enemyHp, at: Date.now() };
          try { setCombatAutoResume(true); } catch {}
          try { setCombatSnapshot(snap); } catch {}
          try { useGameStore.getState().startBackgroundCombat({ dungeonId: snap.dungeonId, enemyIndex: snap.enemyIndex, enemyHp: snap.enemyHp, playerHp }); } catch {}
        }
      }
    }, 0);
    return () => { cancelled = true; };
  }, [activeTab]);

  useEffect(() => {
    if (combatDeath) {
      console.log('Death detected, resetting combat');
      // Stop the fight first
      if (fightTimer.current != null) {
        clearInterval(fightTimer.current as ReturnType<typeof setInterval>);
      }
      fightTimer.current = null;
      
      // Reset all combat state
      setIsFighting(false);
      setEnemyIndex(0);
      setEnemyHp(currentDungeon?.enemy?.hp ?? 1);
      setPlayerHp(totalStats.hp);
      setSessionGold(0);
      setSessionLoot([]);
      
      // Clear all resume flags
      try { (useGameStore as any).setState({ combatSessionItems: {} }); } catch {}
      try { setCombatAutoResume(false); } catch {}
      try { clearCombatResume(); } catch {}
      try { useGameStore.getState().stopBackgroundCombat(); } catch {}
      
      // Reset animations
      attackProgress.stopAnimation();
      enemyAttackProgress.stopAnimation();
      Animated.timing(attackProgress, { toValue: 0, duration: 120, useNativeDriver: false }).start();
      Animated.timing(enemyAttackProgress, { toValue: 0, duration: 120, useNativeDriver: false }).start();
    }
  }, [combatDeath?.at, attackProgress, enemyAttackProgress, currentDungeon, totalStats.hp, setCombatAutoResume, clearCombatResume]);

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'equipment' && styles.tabActive]}
          onPress={() => setActiveTab('equipment')}
        >
          <Shield size={20} color={activeTab === 'equipment' ? '#E0B252' : '#A8A097'} />
          <Text style={[styles.tabText, activeTab === 'equipment' && styles.tabTextActive]}>
            Equipment
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'combat' && styles.tabActive]}
          onPress={() => setActiveTab('combat')}
        >
          <Sword size={20} color={activeTab === 'combat' ? '#E0B252' : '#A8A097'} />
          <Text style={[styles.tabText, activeTab === 'combat' && styles.tabTextActive]}>
            Combat
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'dungeons' && styles.tabActive]}
          onPress={() => setActiveTab('dungeons')}
        >
          <MapIcon size={20} color={activeTab === 'dungeons' ? '#E0B252' : '#A8A097'} />
          <Text style={[styles.tabText, activeTab === 'dungeons' && styles.tabTextActive]}>
            Dungeons
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {activeTab === 'equipment' && (
          <EquipmentTab
            slots={equipmentSlots}
            stats={totalStats}
            storeEquipped={storeEquipped}
            equipFromBank={equipFromBank}
            unequip={unequip}
          />
        )}
        {activeTab === 'combat' && (
          <CombatTabContent
            stats={totalStats}
            playerHp={playerHp}
            enemy={currentEnemy}
            enemyHp={enemyHp}
            isFighting={isFighting}
            onStart={startFight}
            onStop={stopFight}
            attackProgress={attackProgress}
            enemyAttackProgress={enemyAttackProgress}
            playerHitAnim={playerHitAnim}
            enemyHitAnim={enemyHitAnim}
            lastPlayerDmg={lastPlayerDmg}
            lastEnemyDmg={lastEnemyDmg}
            playerMissText={playerMissText}
            enemyMissText={enemyMissText}
            playerMissAnim={playerMissAnim}
            enemyMissAnim={enemyMissAnim}
            enemyIndex={enemyIndex}
            totalEnemies={(currentDungeon?.enemyCount ?? 0) + 1}
            sessionGold={sessionGold}
            sessionLoot={sessionLoot}
          />
        )}
        {activeTab === 'dungeons' && (
          <DungeonsTab dungeons={dungeons} selectedId={selectedDungeon} onSelect={(id) => {
            stopFight();
            try { (useGameStore as any).setState({ combatSessionItems: {} }); } catch {}
            setSelectedDungeon(id);
            setCombatSelectedDungeon(id);
            useGameStore.getState().clearCombatResume();
            setActiveTab('combat');
            const d = dungeons.find(dd => dd.id === id);
            const firstHp = d?.enemy?.hp ?? 1;
            setTimeout(() => startFight({ enemyIndex: 0, enemyHp: firstHp }), 0);
          }} />
        )}
      </ScrollView>
    </View>
  );
}

function EquipmentTab({ slots, stats, storeEquipped, equipFromBank, unequip }: { slots: { id: SlotType; name: string; icon: string }[]; stats: { hp: number; attack: number; defense: number; accuracy: number; evasion: number; critChance: number }; storeEquipped: Partial<Record<SlotType, string>>; equipFromBank: (resourceId: string) => void; unequip: (slot: SlotType) => void }) {
  // 3-column "paper doll": body slots down the middle, hands and accessories either side.
  const layout: (SlotType | null)[][] = [
    ['amulet', 'helmet', 'backpack'],
    ['weapon', 'chest', 'offhand'],
    ['gloves', 'legs', 'ring'],
    ['potion', 'boots', 'scroll'],
    [null, 'ammunition', null],
  ];
  const slotById = Object.fromEntries(slots.map(s => [s.id, s] as const)) as Record<SlotType, { id: SlotType; name: string; icon: string }>;
  const [inspectSlot, setInspectSlot] = useState<SlotType | null>(null);
  const inspectedRid = inspectSlot ? (storeEquipped[inspectSlot] ?? null) : null;
  const inspectedItem = inspectedRid ? (EQUIPMENT_CATALOG as any)[inspectedRid] : null;
  return (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Active Equipment</Text>
      <View style={styles.silhouetteWrap}>
        <View style={styles.silhouetteBody}>
          {layout.map((row, idx) => (
            <View key={`row-${idx}`} style={styles.silhouetteRow}>
              {row.map((sid, cellIdx) => {
                if (!sid) return <View key={`empty-${idx}-${cellIdx}`} style={styles.slotSpacer} />;
                const slot = slotById[sid];
                const rid = storeEquipped[slot.id];
                const eq = rid ? (EQUIPMENT_CATALOG as any)[rid] : null;
                return (
                  <TouchableOpacity
                    key={slot.id}
                    style={[styles.slotBadge, rid ? styles.slotBadgeFilled : styles.slotBadgeEmpty]}
                    onPress={() => { setInspectSlot(slot.id); }}
                    testID={`equip-slot-${slot.id}`}
                  >
                    <Text style={[styles.equipIcon, !rid && styles.equipIconEmpty]}>{eq?.icon ?? slot.icon}</Text>
                    <Text style={[styles.equipName, !rid && styles.equipNameEmpty]} numberOfLines={1}>{eq?.name ?? slot.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      </View>

      <Modal transparent visible={inspectSlot !== null} onRequestClose={() => setInspectSlot(null)}>
        <TouchableOpacity activeOpacity={1} onPress={() => setInspectSlot(null)} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()} style={{ backgroundColor: '#0E0C11', borderRadius: 12, borderWidth: 1, borderColor: '#2C2733', padding: 16, width: '90%', maxWidth: 360 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>{inspectedItem?.name ?? (inspectSlot ? slotById[inspectSlot]?.name : 'Empty slot')}</Text>
              <TouchableOpacity onPress={() => setInspectSlot(null)} testID="equip-inspect-close"><Text style={{ color: '#fff', fontSize: 20 }}>✕</Text></TouchableOpacity>
            </View>
            {inspectedItem ? (
              <View>
                <Text style={{ color: '#D4CCC1', fontSize: 13, lineHeight: 18, fontStyle: 'italic' as const, marginBottom: 12 }}>{inspectedItem.description ?? 'No description'}</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                  {inspectedItem.stats?.attack != null && (<Text style={{ color: '#A8A097' }}>ATK +{inspectedItem.stats.attack}</Text>)}
                  {inspectedItem.stats?.defense != null && (<Text style={{ color: '#A8A097' }}>DEF +{inspectedItem.stats.defense}</Text>)}
                  {inspectedItem.stats?.accuracy != null && (<Text style={{ color: '#A8A097' }}>ACC +{inspectedItem.stats.accuracy}</Text>)}
                  {inspectedItem.stats?.evasion != null && (<Text style={{ color: '#A8A097' }}>EVA +{inspectedItem.stats.evasion}</Text>)}
                  {inspectedItem.stats?.critChance != null && (<Text style={{ color: '#A8A097' }}>CRIT +{inspectedItem.stats.critChance}%</Text>)}
                  {inspectedItem.attackSpeed != null && (<Text style={{ color: '#A8A097' }}>APS {inspectedItem.attackSpeed}</Text>)}
                </View>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <TouchableOpacity style={{ flex: 1, backgroundColor: '#E5484D', paddingVertical: 12, borderRadius: 8, alignItems: 'center' }} onPress={() => { if (inspectSlot) { unequip(inspectSlot); setInspectSlot(null); } }} testID="equip-unequip">
                    <Text style={{ color: '#fff', fontWeight: '700' }}>Unequip</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={{ flex: 1, backgroundColor: '#3E3648', paddingVertical: 12, borderRadius: 8, alignItems: 'center' }} onPress={() => setInspectSlot(null)}>
                    <Text style={{ color: '#fff', fontWeight: '700' }}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View>
                <Text style={{ color: '#A8A097', marginBottom: 12 }}>No item equipped in this slot.</Text>
                <TouchableOpacity style={{ backgroundColor: '#3E3648', paddingVertical: 12, borderRadius: 8, alignItems: 'center' }} onPress={() => setInspectSlot(null)}>
                  <Text style={{ color: '#fff', fontWeight: '700' }}>Close</Text>
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <Text style={styles.sectionTitle}>Combat Stats</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Max Health</Text>
          <Text style={styles.statValue}>{stats.hp}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Attack</Text>
          <Text style={styles.statValue}>{stats.attack}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Defense</Text>
          <Text style={styles.statValue}>{stats.defense}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Accuracy</Text>
          <Text style={styles.statValue}>{stats.accuracy}%</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Evasion</Text>
          <Text style={styles.statValue}>{stats.evasion}%</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Crit Chance</Text>
          <Text style={styles.statValue}>{stats.critChance}%</Text>
        </View>
      </View>
    </View>
  );
}

function CombatTabContent({ stats, playerHp, enemy, enemyHp, isFighting, onStart, onStop, attackProgress, enemyAttackProgress, playerHitAnim, enemyHitAnim, lastPlayerDmg, lastEnemyDmg, playerMissText, enemyMissText, playerMissAnim, enemyMissAnim, enemyIndex, totalEnemies, sessionGold, sessionLoot }: { stats: { hp: number; attack: number; defense: number; accuracy: number; evasion: number; critChance: number }; playerHp: number; enemy?: SimpleEnemy; enemyHp: number; isFighting: boolean; onStart: () => void; onStop: () => void; attackProgress: Animated.Value; enemyAttackProgress: Animated.Value; playerHitAnim: Animated.Value; enemyHitAnim: Animated.Value; lastPlayerDmg: number; lastEnemyDmg: number; playerMissText: string; enemyMissText: string; playerMissAnim: Animated.Value; enemyMissAnim: Animated.Value; enemyIndex: number; totalEnemies: number; sessionGold: number; sessionLoot: SessionLootEntry[] }) {
  const playerHpPct = Math.max(0, Math.min(100, Math.floor((playerHp / (stats.hp || 1)) * 100)));
  const enemyHpPct = Math.max(0, Math.min(100, Math.floor((enemyHp / (enemy?.hp || 1)) * 100)));
  return (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Combat Arena</Text>
      <View style={styles.combatPanel}>
        <View style={styles.playerPanel}>
          <Animated.View style={[styles.avatarBubble, { opacity: Animated.add(0.7, Animated.multiply(playerHitAnim, 0.3)) }]}>
            <Text style={styles.entityIcon}>🧑‍💼</Text>
          </Animated.View>
          <Text style={styles.entityName}>You</Text>
          <View style={styles.hpBar}><View style={[styles.hpFill, { width: `${playerHpPct}%` }]} /></View>
          <Text style={styles.entityHp}>HP {playerHp} / {stats.hp}</Text>
          <View style={[styles.attackTimer, { marginTop: 6 }]}><Animated.View style={[styles.attackFill, { width: attackProgress.interpolate({ inputRange: [0,1], outputRange: ['0%','100%'] }) }]} /></View>
          {lastEnemyDmg > 0 && (
            <Animated.Text style={[styles.damageText, { opacity: playerHitAnim, transform: [{ translateY: Animated.multiply(playerHitAnim, -18) }] }]}>
              {`-${lastEnemyDmg}`}
            </Animated.Text>
          )}
          {playerMissText ? (
            <Animated.Text style={[styles.missText, { opacity: playerMissAnim, transform: [{ translateY: Animated.multiply(playerMissAnim, -18) }] }]}>
              {playerMissText}
            </Animated.Text>
          ) : null}
        </View>
        <View style={styles.vsDivider}>
          <Text style={styles.vsText}>VS</Text>
        </View>
        <View style={styles.enemyPanel}>
          <Animated.View style={[styles.avatarBubble, { opacity: Animated.add(0.7, Animated.multiply(enemyHitAnim, 0.3)) }]}>
            <Text style={styles.entityIcon}>{enemy?.icon ?? '🥊'}</Text>
          </Animated.View>
          <Text style={styles.entityName}>{enemy?.name ?? 'Dummy'}</Text>
          <Text style={styles.enemyMeta}>
            Enemy {enemy ? (enemyIndex + 1) : 0}/{totalEnemies}{enemy?.rarity === 'boss' ? ' (Boss)' : ''}
          </Text>
          <View style={styles.hpBar}><View style={[styles.enemyHpFill, { width: `${enemyHpPct}%` }]} /></View>
          <Text style={styles.entityHp}>HP {Math.max(0, enemyHp)} / {enemy?.hp ?? 0}</Text>
          <View style={[styles.attackTimer, { marginTop: 6 }]}><Animated.View style={[styles.enemyAttackFill, { width: enemyAttackProgress.interpolate({ inputRange: [0,1], outputRange: ['0%','100%'] }) }]} /></View>
          {lastPlayerDmg > 0 && (
            <Animated.Text style={[styles.damageTextEnemy, { opacity: enemyHitAnim, transform: [{ translateY: Animated.multiply(enemyHitAnim, -18) }] }]}>
              {`-${lastPlayerDmg}`}
            </Animated.Text>
          )}
          {enemyMissText ? (
            <Animated.Text style={[styles.missTextEnemy, { opacity: enemyMissAnim, transform: [{ translateY: Animated.multiply(enemyMissAnim, -18) }] }]}>
              {enemyMissText}
            </Animated.Text>
          ) : null}
        </View>
      </View>
      {enemy && (
        <View style={styles.enemyStatsPanel}>
          <Text style={styles.enemyStatsTitle}>Enemy Stats</Text>
          <View style={styles.enemyStatsRow}>
            <Text style={styles.enemyStat}>LVL {enemy.level}</Text>
            <Text style={styles.enemyStat}>ATK {enemy.attack}</Text>
            <Text style={styles.enemyStat}>DEF {enemy.defense}</Text>
            <Text style={styles.enemyStat}>ACC {enemy.accuracy}%</Text>
          </View>
          <View style={styles.enemyStatsRow}>
            <Text style={styles.enemyStat}>EVA {enemy.evasion}%</Text>
            <Text style={styles.enemyStat}>CRIT {enemy.critChance}%</Text>
            <Text style={styles.enemyStat}>CRIT DMG {enemy.critDamage}%</Text>
            <Text style={styles.enemyStat}>ATK SPD {enemy.attackSpeed.toFixed(1)}s</Text>
          </View>
        </View>
      )}
      <View style={styles.combatActions}>
        {!isFighting ? (
          <TouchableOpacity style={styles.startBtn} onPress={onStart} testID="combat-start">
            <Text style={styles.startBtnText}>Start</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.stopBtn} onPress={onStop} testID="combat-stop">
            <Text style={styles.stopBtnText}>Stop</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.lootTrack} testID="combat-loot-track">
        <View style={styles.lootPill}>
          <Coins size={14} color="#E0B252" />
          <Text style={styles.lootText}>Gold: {sessionGold}</Text>
        </View>
      </View>
      {(() => {
        const itemEntries = sessionLoot.filter(e => e.type === 'item' && e.resourceId === 'loot_bag');
        if (itemEntries.length === 0) return null;
        const aggregated: Record<string, number> = {};
        itemEntries.forEach(e => { const k = e.resourceId as string; aggregated[k] = (aggregated[k] ?? 0) + e.quantity; });
        const list = Object.entries(aggregated).slice(-30).reverse();
        return (
          <View style={{ marginTop: 8, backgroundColor: '#0E0C11', borderRadius: 10, borderWidth: 1, borderColor: '#2C2733', padding: 10 }} testID="combat-loot-list">
            <Text style={{ color: '#fff', fontWeight: '700', marginBottom: 6 }}>Recent loot</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {list.map(([rid, qty]) => (
                <View key={`loot-${rid}`} style={{ width: 60, height: 60, backgroundColor: '#16131A', borderColor: '#2C2733', borderWidth: 1, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}>
                  {(() => {
                    const res = (require('@/constants/gameData') as any).RESOURCES?.[rid];
                    const ResourceImage = require('@/components/ResourceImage').ResourceImage;
                    return <ResourceImage resource={res} size={34} />;
                  })()}
                  <View style={{ position: 'absolute', right: 4, bottom: 4, backgroundColor: '#2C2733', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
                    <Text style={{ color: '#E8E1D6', fontSize: 10, fontWeight: '700' }}>x{qty}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        );
      })()}
      <Text style={styles.placeholder}>{enemy ? 'Battling current dungeon...' : 'Tap Dungeons to pick a fight.'}</Text>
    </View>
  );
}

function DungeonsTab({ dungeons, selectedId, onSelect }: { dungeons: SimpleDungeon[]; selectedId: string; onSelect: (id: string) => void }) {
  return (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Available Dungeons</Text>
      {dungeons.map((d) => (
        <TouchableOpacity
          key={d.id}
          style={[styles.dungeonCard, selectedId === d.id && styles.dungeonCardActive]}
          onPress={() => onSelect(d.id)}
          testID={`dungeon-${d.id}`}
        >
          <View style={styles.dungeonHeader}>
            <Text style={styles.dungeonName}>{d.name}</Text>
            <Text style={styles.dungeonMeta}>Recommended LV {d.recommendedLevel}</Text>
          </View>
          <Text style={styles.dungeonDesc}>{d.description}</Text>
          <View style={styles.enemyRow}>
            <View style={styles.enemyPill}>
              <Text style={styles.enemyIcon}>{d.enemy.icon}</Text>
              <Text style={styles.enemyName}>{d.enemy.name}</Text>
              <Text style={[styles.enemyTag, styles.commonTag]}>x{d.enemyCount}</Text>
            </View>
            <View style={styles.enemyPill}>
              <Text style={styles.enemyIcon}>{d.boss.icon}</Text>
              <Text style={styles.enemyName}>{d.boss.name}</Text>
              <Text style={[styles.enemyTag, styles.bossTag]}>boss</Text>
            </View>
          </View>
          <View style={styles.lootRow}>
            <Text style={styles.lootHint}>Clear reward: ${getDungeonGoldReward(d)} + 💰 Loot Bag · {d.enemyCount + 1} fights</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0A0D',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#16131A',
    borderBottomWidth: 1,
    borderBottomColor: '#2C2733',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#E0B252',
  },
  tabText: {
    color: '#A8A097',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  tabTextActive: {
    color: '#E0B252',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  tabContent: {
    flex: 1,
  },
  silhouetteWrap: {
    backgroundColor: '#0E0C11',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2C2733',
    padding: 12,
    marginBottom: 16,
  },
  silhouetteBody: {
    gap: 8,
  },
  silhouetteRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 8,
  },
  slotSpacer: {
    flex: 1,
  },
  slotBadge: {
    flex: 1,
    minWidth: 0,
    minHeight: 76,
    backgroundColor: '#16131A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2C2733',
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotBadgeEmpty: {
    backgroundColor: '#18151D',
    borderColor: '#3E3648',
    borderStyle: 'dashed' as const,
  },
  slotBadgeFilled: {
    borderColor: '#E0B252',
  },
  avatarBubble: { backgroundColor: '#0E0C11', padding: 10, borderRadius: 999, borderWidth: 1, borderColor: '#2C2733' },
  equipIcon: {
    fontSize: 20,
    marginBottom: 6,
    color: '#E8E1D6',
  },
  equipIconEmpty: {
    color: '#5A5249',
    opacity: 0.5,
  },
  equipName: {
    color: '#E8E1D6',
    fontWeight: '700' as const,
    fontSize: 11.5,
    textAlign: 'center' as const,
  },
  equipNameEmpty: {
    color: '#7A7269',
    fontWeight: '500' as const,
    fontSize: 11,
  },
  enemyMeta: { color: '#A8A097', fontSize: 12, marginTop: 2 },
  enemyStatsPanel: { backgroundColor: '#16131A', borderRadius: 12, borderWidth: 1, borderColor: '#2C2733', padding: 12, marginTop: 12 },
  enemyStatsTitle: { color: '#fff', fontSize: 14, fontWeight: '700' as const, marginBottom: 8 },
  enemyStatsRow: { flexDirection: 'row', gap: 12, justifyContent: 'space-around', marginBottom: 4 },
  enemyStat: { color: '#A8A097', fontSize: 12, fontWeight: '600' as const },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 16,
  },
  combatPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#16131A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2C2733',
    padding: 16,
    gap: 12,
  },
  playerPanel: { alignItems: 'center', flex: 1 },
  enemyPanel: { alignItems: 'center', flex: 1 },
  vsDivider: { paddingHorizontal: 8 },
  vsText: { color: '#A8A097', fontWeight: '800' as const },
  entityIcon: { fontSize: 28 },
  entityName: { color: '#E8E1D6', fontWeight: '700' as const, marginTop: 6 },
  entityHp: { color: '#A8A097', marginTop: 2 },
  hpBar: { height: 8, backgroundColor: '#2C2733', borderRadius: 6, overflow: 'hidden', marginTop: 6, width: '100%' },
  hpFill: { height: '100%', backgroundColor: '#3DD68C' },
  enemyHpFill: { height: '100%', backgroundColor: '#E5484D' },
  damageText: { position: 'absolute', top: 10, color: '#E5484D', fontWeight: '800' as const },
  damageTextEnemy: { position: 'absolute', top: 10, right: 10, color: '#E0B252', fontWeight: '800' as const },
  missText: { position: 'absolute', top: 10, color: '#E0B252', fontWeight: '800' as const, fontSize: 14 },
  missTextEnemy: { position: 'absolute', top: 10, right: 10, color: '#E0B252', fontWeight: '800' as const, fontSize: 14 },
  attackTimer: { height: 6, width: 80, backgroundColor: '#2C2733', borderRadius: 4, overflow: 'hidden' },
  attackFill: { height: '100%', backgroundColor: '#E0B252' },
  enemyAttackFill: { height: '100%', backgroundColor: '#E0B252' },
  placeholder: {
    color: '#A8A097',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
  },
  combatActions: { flexDirection: 'row', justifyContent: 'center', marginTop: 12, marginBottom: 8 },
  startBtn: { backgroundColor: '#3DD68C', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  startBtnText: { color: '#0E0C11', fontWeight: '800' as const },
  stopBtn: { backgroundColor: '#E5484D', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  stopBtnText: { color: '#fff', fontWeight: '800' as const },
  lootTrack: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 8 },
  lootPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#16131A', borderColor: '#2C2733', borderWidth: 1, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  lootText: { color: '#E8E1D6', fontSize: 12, fontWeight: '600' as const },
  dungeonCard: {
    backgroundColor: '#16131A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2C2733',
    padding: 16,
    marginBottom: 12,
  },
  dungeonCardActive: {
    borderColor: '#E0B252',
  },
  dungeonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  dungeonName: { color: '#fff', fontSize: 16, fontWeight: '700' as const },
  dungeonMeta: { color: '#A8A097', fontSize: 12 },
  dungeonDesc: { color: '#A8A097', fontSize: 12, marginBottom: 8 },
  enemyRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  enemyPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#0E0C11', borderColor: '#2C2733', borderWidth: 1, paddingHorizontal: 8, paddingVertical: 6, borderRadius: 999 },
  enemyIcon: { fontSize: 12 },
  enemyName: { color: '#E8E1D6', fontSize: 12, fontWeight: '600' as const },
  enemyTag: { fontSize: 10, textTransform: 'uppercase' as const },
  commonTag: { color: '#A8A097' },
  eliteTag: { color: '#a78bfa' },
  bossTag: { color: '#E5484D' },
  lootRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  lootHint: { color: '#A8A097', fontSize: 12 },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: '#16131A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2C2733',
    padding: 16,
    width: '48%',
  },
  statLabel: {
    color: '#A8A097',
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700' as const,
  },
});
