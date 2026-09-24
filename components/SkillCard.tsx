import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Modal, ScrollView, TextInput } from 'react-native';
import { Skill, Activity } from '@/types/game';
import { ACTIVITIES, getXpForLevel, RESOURCES, hasRequiredInputs, getMissingInputs, SMUGGLING_ZONES, STORE_ITEMS, MAX_LEVEL, SKILL_DESCRIPTIONS, AGENTS, getSmugglingXp } from '@/constants/gameData';
import { useGameStore } from '@/store/gameStore';
import { X, ShoppingCart, Minus, Plus, Trophy, Package, Wrench } from 'lucide-react-native';
import { ResourceImage } from '@/components/ResourceImage';
import { MasteryPerksModal } from './MasteryPerksModal';
import ThievingDropsModal from './ThievingDropsModal';
import ThievingToolsModal from './ThievingToolsModal';
import DrugToolsModal from './DrugToolsModal';
import DistilleryToolsModal from './DistilleryToolsModal';
import InvestigationLabToolsModal from './InvestigationLabToolsModal';
import { THIEVING_TOOLS } from '@/constants/thievingTools';

interface SkillCardProps {
  skill: Skill;
  onNavigateToStore?: (targetResourceId?: string) => void;
  onNavigateToSmuggling?: () => void;
}

export default function SkillCard({ skill, onNavigateToStore, onNavigateToSmuggling }: SkillCardProps) {
  const { startActivity, stopActivity, bank, heat, getMasteryPercentage, getMasteryLevel, getMasteryTimeReduction, mastery, thievingCooldowns, getThievingMasteryBonus } = useGameStore();
  const getActualTime = useGameStore(state => state.getActualTime);
  const getDrugToolBonuses = useGameStore(state => state.getDrugToolBonuses);
  const getDistilleryToolBonuses = useGameStore(state => state.getDistilleryToolBonuses);
  const getInvestigationLabToolBonuses = useGameStore(state => state.getInvestigationLabToolBonuses);
  const equippedDrugToolId = useGameStore(state => state.equippedDrugToolId);
  const equippedDistilleryToolId = useGameStore(state => state.equippedDistilleryToolId);
  const equippedInvestigationLabToolId = useGameStore(state => state.equippedInvestigationLabToolId);
  const equippedToolId = useGameStore(state => state.equippedThievingToolId);
  const activities = ACTIVITIES[skill.id] || [];
  
  // Animation refs
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const xpGainAnimation = useRef(new Animated.Value(0)).current;
  const levelUpAnimation = useRef(new Animated.Value(0)).current;
  const activityPulse = useRef(new Animated.Value(1)).current;
  const actionProgressAnimation = useRef(new Animated.Value(0)).current;
  
  // Header animation values
  const headerScale = useRef(new Animated.Value(1)).current;
  const headerGlow = useRef(new Animated.Value(0)).current;
  const xpBarPulse = useRef(new Animated.Value(0)).current;
  const heatWarningPulse = useRef(new Animated.Value(1)).current;
  
  // State for floating XP text and modal
  const [floatingXp, setFloatingXp] = useState<number | null>(null);
  const [previousLevel, setPreviousLevel] = useState(skill.level);
  const [showSourcesModal, setShowSourcesModal] = useState<boolean>(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  const [showQuickShop, setShowQuickShop] = useState<string | null>(null);
  const [quickShopQuantity, setQuickShopQuantity] = useState<number>(1);
  const [showMasteryModal, setShowMasteryModal] = useState<{ activity: Activity; masteryLevel: number } | null>(null);
  const [showDropsFor, setShowDropsFor] = useState<Activity | null>(null);
  const [showToolsModal, setShowToolsModal] = useState<boolean>(false);
  const [showDrugToolsModal, setShowDrugToolsModal] = useState<boolean>(false);
  const [showDistilleryToolsModal, setShowDistilleryToolsModal] = useState<boolean>(false);
  const [showInvestigationLabToolsModal, setShowInvestigationLabToolsModal] = useState<boolean>(false);

  // Ticking state to refresh cooldown UI precisely every second
  const [nowTick, setNowTick] = useState<number>(Date.now());
  
  const currentLevelXp = getXpForLevel(skill.level);
  const activeTool = equippedToolId ? THIEVING_TOOLS.find(t => t.id === equippedToolId) : undefined;
  const toolsCount = THIEVING_TOOLS.length;  const nextLevelXp = getXpForLevel(skill.level + 1);
  const progressXp = Math.max(0, (skill.experience ?? 0) - (currentLevelXp ?? 0));
  const requiredXp = Math.max(1, (nextLevelXp ?? currentLevelXp + 1) - (currentLevelXp ?? 0));
  const progressPercent = Math.min(100, Math.max(0, (skill.level >= 100 ? 100 : (progressXp / requiredXp) * 100)));
  
  // Animate progress bar with pulse effect
  useEffect(() => {
    Animated.parallel([
      Animated.timing(progressAnimation, {
        toValue: progressPercent,
        duration: 500,
        useNativeDriver: false,
      }),
      Animated.sequence([
        Animated.timing(xpBarPulse, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(xpBarPulse, {
          toValue: 0,
          duration: 400,
          useNativeDriver: false,
        }),
      ]),
    ]).start();
  }, [progressPercent]);
  
  // Header entrance animation
  useEffect(() => {
    headerScale.setValue(0.95);
    headerGlow.setValue(0);
    
    Animated.parallel([
      Animated.spring(headerScale, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(headerGlow, {
        toValue: 1,
        duration: 600,
        useNativeDriver: false,
      }),
    ]).start();
  }, [skill.id]);
  
  // Heat warning pulse for thieving
  useEffect(() => {
    if (skill.id === 'thieving' && heat > 75) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(heatWarningPulse, {
            toValue: 1.02,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(heatWarningPulse, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();
      
      return () => pulseAnimation.stop();
    }
  }, [heat, skill.id]);
  
  // Detect level up and show celebration
  useEffect(() => {
    if (skill.level > previousLevel) {
      levelUpAnimation.setValue(0);
      Animated.sequence([
        Animated.timing(levelUpAnimation, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.delay(2000),
        Animated.timing(levelUpAnimation, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }
    setPreviousLevel(skill.level);
  }, [skill.level]);
  
  // Action progress bar animation
  useEffect(() => {
    if (skill.isActive && skill.currentActivity) {
      // Same duration the store uses for the real timer (level, mastery, agent and tool bonuses).
      const actualTime = useGameStore.getState().getAdjustedActionTime(skill.id, skill.currentActivity.baseTime, skill.currentActivity.id);

      const startAnimation = () => {
        actionProgressAnimation.setValue(0);
        Animated.timing(actionProgressAnimation, {
          toValue: 1,
          duration: actualTime,
          useNativeDriver: false,
        }).start((finished) => {
          if (finished && useGameStore.getState().skills[skill.id]?.isActive) {
            startAnimation();
          }
        });
      };
      startAnimation();
    } else {
      actionProgressAnimation.setValue(0);
    }
  }, [skill.isActive, skill.currentActivity, skill.level, mastery, equippedDrugToolId, equippedDistilleryToolId, equippedInvestigationLabToolId]);

  // Show all activities, not just available ones - they'll be shown as locked if level is too low
  const availableActivities = activities;

  // Calculate thieving stats for all activities at the top level to ensure reactivity
  const thievingAgentUnlocked = useGameStore(state => state.skills.thieving.agentUnlocked ?? false);
  const getThievingToolBonuses = useGameStore(state => state.getThievingToolBonuses);

  // Heartbeat to refresh cooldown UI while any cooldown is active
  useEffect(() => {
    if (skill.id !== 'thieving') return;
    const values = Object.values(thievingCooldowns ?? {});
    const anyActive = values.some(v => typeof v === 'number' && v > Date.now());
    if (!anyActive) return;
    const interval = setInterval(() => {
      setNowTick(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [skill.id, thievingCooldowns]);

  const thievingStatsMap = React.useMemo(() => {
    if (skill.id !== 'thieving') return {} as Record<string, { catchRate: number; cooldownTime: number; currentCooldown: number }>;

    const statsMap: Record<string, { catchRate: number; cooldownTime: number; currentCooldown: number }> = {};

    const toolBonuses = getThievingToolBonuses();
    const agentActive = thievingAgentUnlocked;

    availableActivities.forEach(activity => {
      const masteryBonus = getThievingMasteryBonus(activity.id);

      let catchRate = activity.failureChance ?? 0;

      const levelFactor = Math.max(0.5, Math.min(1.5, activity.levelRequired / 40));
      catchRate *= levelFactor;

      catchRate *= (masteryBonus.failureReduction * toolBonuses.failureReductionMultiplier);

      let heatPercentageBonus = 0;
      if (heat <= 30) {
        heatPercentageBonus = heat * 0.1;
      } else if (heat <= 70) {
        heatPercentageBonus = (30 * 0.1) + ((heat - 30) * 0.2);
      } else {
        heatPercentageBonus = (30 * 0.1) + (40 * 0.2) + ((heat - 70) * 0.4);
      }
      catchRate += heatPercentageBonus;

      // Apply agent catch-rate reduction in UI as well (−40%)
      if (agentActive) {
        catchRate *= 0.5;
      }
      // Align UI clamp with runtime: [1,95]
      catchRate = Math.min(95, Math.max(1, catchRate));

      const baseFailCooldown = Math.min(15000 + activity.levelRequired * 500, 45000);
      const reducedByAgent = agentActive ? Math.floor(baseFailCooldown * 0.5) : baseFailCooldown;
      const afterFlat = Math.floor(reducedByAgent * (1 - (toolBonuses.cooldownTimeReduction ?? 0)));
      const finalCooldownMs = Math.max(1000, Math.floor(afterFlat * toolBonuses.cooldownReductionMultiplier));
      const cooldownTime = finalCooldownMs / 1000;

      const cooldownUntil = thievingCooldowns?.[activity.id];
      let currentCooldown = 0;
      const now = Date.now();
      if (cooldownUntil && cooldownUntil > now) {
        currentCooldown = Math.max(0, Math.ceil((cooldownUntil - now) / 1000));
      }

      statsMap[activity.id] = {
        catchRate,
        cooldownTime,
        currentCooldown,
      };
    });

    return statsMap;
  }, [skill.id, skill.level, availableActivities, heat, mastery, thievingCooldowns, equippedToolId, thievingAgentUnlocked, nowTick, getThievingMasteryBonus, getThievingToolBonuses]);

  const handleActivityPress = (activity: Activity) => {
    // Check if player meets level requirement
    if (skill.level < activity.levelRequired) {
      console.log('Level requirement not met for activity:', activity.name);
      return;
    }
    
    // Button press animation
    Animated.sequence([
      Animated.timing(activityPulse, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(activityPulse, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    if (skill.isActive && skill.currentActivity?.id === activity.id) {
      stopActivity(skill.id);
    } else {
      // The store validates inputs (after tool reductions) and tells the player what's missing.
      startActivity(skill.id, activity);
    }
  };

  const handleShowSources = (activity: Activity) => {
    setSelectedActivity(activity);
    setShowSourcesModal(true);
  };

  const skillDescription = SKILL_DESCRIPTIONS[skill.id] || '';

  return (
    <Animated.View style={[
      styles.container,
      skill.level >= 100 && styles.containerWithManager,
      {
        transform: [{ scale: headerScale }],
        shadowOpacity: headerGlow.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 0.2],
        }),
      },
    ]}>
      {/* Skill Description - Above the cards */}
      {skillDescription && (
        <View style={styles.skillDescriptionContainer}>
          <Text style={styles.skillDescriptionText}>{skillDescription}</Text>
        </View>
      )}

      {/* Tools Banners */}
      {skill.id === 'thieving' && (
        <TouchableOpacity
          accessibilityRole="button"
          onPress={() => setShowToolsModal(true)}
          activeOpacity={0.9}
          style={styles.toolsBanner}
          testID="thieving-tools-banner"
        >
          <View style={styles.toolsBannerLeft}>
            <Wrench size={18} color="#A8A097" />
            <Text style={styles.toolsBannerTitle}>Heist Gear</Text>
          </View>
          <View style={styles.toolsBannerRight}>
            <View style={styles.toolsMeta}>
              {activeTool && (
                <View style={styles.activePill} testID="active-tool-pill">
                  <Text style={styles.activeIcon}>{activeTool.icon}</Text>
                  <Text style={styles.activeText}>Active</Text>
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>
      )}
      {skill.id === 'drug_factory' && (
        <TouchableOpacity
          accessibilityRole="button"
          onPress={() => setShowDrugToolsModal(true)}
          activeOpacity={0.9}
          style={styles.toolsBanner}
          testID="drug-tools-banner"
        >
          <View style={styles.toolsBannerLeft}>
            <Wrench size={18} color="#A8A097" />
            <Text style={styles.toolsBannerTitle}>Facilities</Text>
          </View>
        </TouchableOpacity>
      )}
      {skill.id === 'distillery' && (
        <TouchableOpacity
          accessibilityRole="button"
          onPress={() => setShowDistilleryToolsModal(true)}
          activeOpacity={0.9}
          style={styles.toolsBanner}
          testID="distillery-tools-banner"
        >
          <View style={styles.toolsBannerLeft}>
            <Wrench size={18} color="#A8A097" />
            <Text style={styles.toolsBannerTitle}>Equipment</Text>
          </View>
        </TouchableOpacity>
      )}
      {skill.id === 'investigation_lab' && (
        <TouchableOpacity
          accessibilityRole="button"
          onPress={() => setShowInvestigationLabToolsModal(true)}
          activeOpacity={0.9}
          style={styles.toolsBanner}
          testID="investigation-lab-tools-banner"
        >
          <View style={styles.toolsBannerLeft}>
            <Wrench size={18} color="#A8A097" />
            <Text style={styles.toolsBannerTitle}>Lab Sets</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Manager Header */}
      {skill.level >= 100 && (
        <View style={styles.managerHeader} testID={`manager-header-${skill.id}`}>
          <View style={styles.managerHeaderTop}>
            <View style={styles.managerIconContainer}>
              <Text style={styles.managerIcon}>🕵️</Text>
              <View style={styles.managerGlow} />
            </View>
            <View style={styles.managerInfo}>
              <Text style={styles.managerTitle}>MANAGER ACTIVE</Text>
              <Text style={styles.managerName}>{AGENTS[skill.id]?.name ?? 'Elite Operative'}</Text>
              <Text style={styles.managerDescription}>{AGENTS[skill.id]?.description ?? ''}</Text>
            </View>
            <View style={styles.managerBadge}>
              <Text style={styles.managerBadgeText}>LV 100</Text>
            </View>
          </View>
          
          <View style={styles.managerBonuses}>
            <Text style={styles.managerBonusesTitle}>Active Bonuses:</Text>
            <View style={styles.managerBonusesGrid}>
              {(AGENTS[skill.id]?.bonuses ?? []).map((bonus, idx) => (
                <View key={`${skill.id}-bonus-${idx}`} style={styles.managerBonusChip}>
                  <Text style={styles.managerBonusText}>{bonus}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      )}

      <View style={styles.activitiesGrid}>
        {availableActivities.map(activity => {
          const isActiveActivity = skill.isActive && skill.currentActivity?.id === activity.id;
          const hasInputs = hasRequiredInputs(bank, activity);
          const missingInputs = getMissingInputs(bank, activity);
          const masteryPercent = getMasteryPercentage(activity.id);
          const masteryLevel = getMasteryLevel(activity.id);
          const isLocked = skill.level < activity.levelRequired;
          
          // Calculate actual time based on level + mastery + equipped tool multipliers
          let actualTime = getActualTime(skill.id, activity.baseTime, activity.id);
          if (skill.id === 'drug_factory') {
            const b = getDrugToolBonuses();
            actualTime = Math.max(100, Math.floor(actualTime * (b.timeReductionMultiplier ?? 1)));
          } else if (skill.id === 'distillery') {
            const b = getDistilleryToolBonuses();
            actualTime = Math.max(100, Math.floor(actualTime * (b.timeReductionMultiplier ?? 1)));
          } else if (skill.id === 'investigation_lab') {
            const b = getInvestigationLabToolBonuses();
            actualTime = Math.max(100, Math.floor(actualTime * (b.timeReductionMultiplier ?? 1)));
          }
          
          // Get thieving stats from the pre-calculated map
          const thievingStats = thievingStatsMap[activity.id] || { catchRate: 0, cooldownTime: 0, currentCooldown: 0 };
          const { catchRate, cooldownTime, currentCooldown } = thievingStats;
          
          return (
          <Animated.View
            key={activity.id}
            style={[
              styles.activityCard,
              {
                transform: [
                  { scale: activityPulse }
                ]
              }
            ]}
          >
            <TouchableOpacity
              style={[
                styles.activityCardInner,
                isActiveActivity && styles.activeActivityCard,
                isLocked && styles.lockedActivityCard,
                !hasInputs && !isActiveActivity && !isLocked && styles.disabledActivityCard,
                missingInputs.length > 0 && !isActiveActivity && !isLocked && styles.missingInputsActivityCard
              ]}
              onPress={() => handleActivityPress(activity)}
              disabled={isLocked}
            >
              {/* Card Header */}
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{activity.name}</Text>
                <View style={styles.cardHeaderRight}>
                  {skill.id === 'thieving' && (
                    <TouchableOpacity
                      accessibilityRole="button"
                      testID={`drops-button-${activity.id}`}
                      style={styles.iconButton}
                      onPress={() => setShowDropsFor(activity)}
                    >
                      <Package size={16} color="#A8A097" />
                      <Text style={styles.iconButtonText}>Drops</Text>
                    </TouchableOpacity>
                  )}
                  {(isLocked || (!hasInputs && !isActiveActivity)) && (
                    <Text style={[
                      styles.cardStatus,
                      isActiveActivity && styles.activeCardStatus,
                      isLocked && styles.lockedCardStatus,
                      !hasInputs && !isActiveActivity && !isLocked && styles.disabledCardStatus
                    ]}>
                      {isLocked ? `LV ${activity.levelRequired}` : 'NO INPUTS'}
                    </Text>
                  )}
                </View>
              </View>
              
              {/* Product Display */}
              <View style={styles.productDisplay}>
                <ResourceImage resource={activity.resource} size={24} />
                <Text style={[
                  styles.productName,
                  isLocked && styles.lockedText,
                  !hasInputs && !isActiveActivity && !isLocked && styles.disabledText
                ]}>
                  {activity.resource.name}
                </Text>
              </View>
              
              {/* Active Progress Bar - Above content for drug skills */}
              {isActiveActivity && (skill.id === 'drug_factory' || skill.id === 'distillery' || skill.id === 'investigation_lab') && (
                <View style={styles.cardProgressContainer}>
                  <Animated.View
                    style={[
                      styles.cardProgressFill,
                      {
                        width: actionProgressAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', '100%'],
                        }),
                      },
                    ]}
                  />
                </View>
              )}
              
              {/* Active Progress Bar for thieving */}
              {isActiveActivity && skill.id === 'thieving' && (
                <View style={styles.cardProgressContainer}>
                  <Animated.View
                    style={[
                      styles.cardProgressFill,
                      {
                        width: actionProgressAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', '100%'],
                        }),
                      },
                    ]}
                  />
                </View>
              )}
              
              {/* Stats Row */}
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Time</Text>
                  <Text style={[
                    styles.statValue,
                    isLocked && styles.lockedText,
                    !hasInputs && !isActiveActivity && !isLocked && styles.disabledText
                  ]}>
                    {(actualTime / 1000).toFixed(1)}s
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>XP</Text>
                  <Text style={[
                    styles.statValue,
                    styles.xpValue,
                    isLocked && styles.lockedText,
                    !hasInputs && !isActiveActivity && !isLocked && styles.disabledText
                  ]}>
                    +{activity.getDynamicXp ? activity.getDynamicXp(skill.level) : (skill.id === 'smuggling' ? getSmugglingXp(skill.level, activity.baseTime) : activity.baseXp)}
                  </Text>
                </View>
                {skill.id === 'thieving' && activity.heatGenerated !== undefined ? (
                  (() => {
                    const agentActive = useGameStore.getState().skills.thieving.agentUnlocked ?? false;
                    const toolB = useGameStore.getState().getThievingToolBonuses();
                    const baseHeat = activity.heatGenerated ?? 0;
                    const afterAgent = baseHeat;
                    const displayHeat = Math.max(0, Math.floor(afterAgent * (toolB.heatReductionMultiplier ?? 1)));
                    return (
                      <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Heat</Text>
                        <Text style={[
                          styles.statValue,
                          displayHeat > 0 ? styles.heatStatPositive : styles.heatStatNegative,
                          isLocked && styles.lockedText,
                          !hasInputs && !isActiveActivity && !isLocked && styles.disabledText
                        ]}>
                          {displayHeat > 0 ? '+' : ''}{displayHeat}
                        </Text>
                      </View>
                    );
                  })()
                ) : (skill.id === 'drug_factory' || skill.id === 'distillery' || skill.id === 'investigation_lab') ? (
                  (() => {
                    const agentActive = useGameStore.getState().skills[skill.id]?.agentUnlocked ?? false;
                    let fail = Math.max(0, Math.min(100, activity.failureChance ?? 0));
                    if (agentActive) fail = Math.max(0, fail - 10);
                    if (skill.id === 'drug_factory') {
                      const b = getDrugToolBonuses();
                      fail = Math.max(0, Math.min(100, Math.floor(fail * (b.failureReductionMultiplier ?? 1))));
                    }
                    if (skill.id === 'distillery') {
                      const b = getDistilleryToolBonuses();
                      fail = Math.max(0, Math.min(100, Math.floor(fail * (b.failureReductionMultiplier ?? 1))));
                    }
                    if (skill.id === 'investigation_lab') {
                      const b = getInvestigationLabToolBonuses();
                      fail = Math.max(0, Math.min(100, Math.floor(fail * (b.failureReductionMultiplier ?? 1))));
                    }
                    return (
                      <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Failure</Text>
                        <Text style={[
                          styles.statValue,
                          styles.failureChance,
                          isLocked && styles.lockedText,
                          !hasInputs && !isActiveActivity && !isLocked && styles.disabledText
                        ]}>
                          {fail}%
                        </Text>
                      </View>
                    );
                  })()
                ) : (
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Mastery</Text>
                    <View style={styles.masteryStatContainer}>
                      <Text style={[
                        styles.statValue,
                        styles.masteryValue,
                        isLocked && styles.lockedText,
                        !hasInputs && !isActiveActivity && !isLocked && styles.disabledText
                      ]}>
                        {masteryPercent.toFixed(1)}%
                      </Text>
                    </View>
                  </View>
                )}
              </View>
              
              {/* Thieving Stats Display */}
              {skill.id === 'thieving' && !isLocked && (
                <>
                  {/* Catch Rate and Cooldown Stats */}
                  <Animated.View style={[
                    styles.thievingStatsRow,
                    {
                      transform: [
                        { scale: catchRate > 50 ? heatWarningPulse : 1 },
                      ],
                    },
                  ]}>
                    <View style={styles.thievingStatItem}>
                      <Text style={styles.thievingStatLabel}>Catch Rate</Text>
                      <Text
                        testID={`catch-rate-${activity.id}`}
                        style={[
                          styles.thievingStatValue,
                          catchRate > 50 ? styles.catchRateHigh : catchRate > 25 ? styles.catchRateMedium : styles.catchRateLow
                        ]}
                      >
                        {catchRate.toFixed(1)}%
                      </Text>
                    </View>
                    <View style={styles.thievingStatItem}>
                      <Text style={styles.thievingStatLabel}>Cooldown</Text>
                      <Text style={[
                        styles.thievingStatValue,
                        currentCooldown > 0 ? styles.cooldownActive : styles.cooldownInactive
                      ]}>
                        {currentCooldown > 0 ? `${currentCooldown}s` : `${cooldownTime.toFixed(1)}s`}
                      </Text>
                    </View>
                  </Animated.View>
                  
                  {/* Show active cooldown warning */}
                  {currentCooldown > 0 && (
                    <View style={styles.cooldownWarning}>
                      <Text style={styles.cooldownWarningText}>
                        ⏱️ On cooldown: {currentCooldown}s remaining
                      </Text>
                    </View>
                  )}
                  
                  {/* Mastery Display */}
                  <TouchableOpacity
                    style={styles.masterySection}
                    onPress={() => setShowMasteryModal({ 
                      activity, 
                      masteryLevel: useGameStore.getState().getMasteryLevel(activity.id) 
                    })}
                  >
                    <View style={styles.masteryHeader}>
                      <Trophy size={14} color="#E0B252" />
                      <Text style={styles.masteryLabel}>Mastery</Text>
                      <Text style={styles.masteryPercent}>{masteryPercent.toFixed(1)}%</Text>
                    </View>
                    <View style={styles.masteryBar}>
                      <View 
                        style={[
                          styles.masteryFill,
                          { width: `${masteryPercent}%` }
                        ]} 
                      />
                    </View>
                    {masteryPercent >= 25 && (
                      <Text style={styles.masteryPerkText}>
                        {masteryPercent >= 100 ? '✓ All perks unlocked' :
                         masteryPercent >= 75 ? '✓ 3/4 perks unlocked' :
                         masteryPercent >= 50 ? '✓ 2/4 perks unlocked' :
                         '✓ 1/4 perks unlocked'}
                      </Text>
                    )}
                  </TouchableOpacity>
                </>
              )}
              
              {/* Drug Skills - Input Requirements in Red Zone */}
              {(skill.id === 'drug_factory' || skill.id === 'distillery' || skill.id === 'investigation_lab') && !isLocked && (
                <>
                  {/* Input Requirements in Red Zone */}
                  {activity.inputs && activity.inputs.length > 0 && (
                    <View style={[
                      styles.thievingStatsRow,
                      !hasInputs && !isActiveActivity && styles.inputsSectionMissing
                    ]}>
                      <View style={styles.inputsGrid}>
                        {activity.inputs.map((input) => {
                          const resource = RESOURCES[input.resourceId];
                          const bankItem = bank[input.resourceId];
                          const hasEnough = bankItem && bankItem.quantity >= input.quantity;
                          const currentAmount = bankItem?.quantity || 0;
                          
                          return (
                            <TouchableOpacity 
                              key={input.resourceId} 
                              style={[
                                styles.inputChip,
                                !hasEnough && styles.inputChipMissing
                              ]}
                              onPress={() => handleShowSources(activity)}
                            >
                              <ResourceImage resource={resource} size={14} />
                              <Text style={[
                                styles.inputChipText,
                                !hasEnough && styles.inputChipTextMissing
                              ]}>
                                {currentAmount}/{input.quantity}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  )}
                  
                  {/* Mastery Display with Green Border */}
                  <TouchableOpacity
                    style={styles.masterySection}
                    onPress={() => setShowMasteryModal({ 
                      activity, 
                      masteryLevel: useGameStore.getState().getMasteryLevel(activity.id) 
                    })}
                  >
                    <View style={styles.masteryHeader}>
                      <Trophy size={14} color="#E0B252" />
                      <Text style={styles.masteryLabel}>Mastery</Text>
                      <Text style={styles.masteryPercent}>{masteryPercent.toFixed(1)}%</Text>
                    </View>
                    <View style={styles.masteryBar}>
                      <View 
                        style={[
                          styles.masteryFill,
                          { width: `${masteryPercent}%` }
                        ]} 
                      />
                    </View>
                    {masteryPercent >= 25 && (
                      <Text style={styles.masteryPerkText}>
                        {masteryPercent >= 100 ? '✓ All perks unlocked' :
                         masteryPercent >= 75 ? '✓ 3/4 perks unlocked' :
                         masteryPercent >= 50 ? '✓ 2/4 perks unlocked' :
                         '✓ 1/4 perks unlocked'}
                      </Text>
                    )}
                  </TouchableOpacity>
                </>
              )}
              
              {/* Active Progress Bar - Below content for other skills */}
              {isActiveActivity && skill.id !== 'drug_factory' && skill.id !== 'distillery' && skill.id !== 'investigation_lab' && skill.id !== 'thieving' && (
                <View style={styles.cardProgressContainer}>
                  <Animated.View
                    style={[
                      styles.cardProgressFill,
                      {
                        width: actionProgressAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', '100%'],
                        }),
                      },
                    ]}
                  />
                </View>
              )}
              
              {/* Input Requirements - Only for non-drug skills */}
              {activity.inputs && activity.inputs.length > 0 && !isLocked && 
               skill.id !== 'drug_factory' && skill.id !== 'distillery' && skill.id !== 'investigation_lab' && (
                <View style={[
                  styles.inputsSection,
                  !hasInputs && !isActiveActivity && styles.inputsSectionMissing
                ]}>
                  <Text style={[
                    styles.inputsTitle,
                    !hasInputs && !isActiveActivity && styles.disabledText
                  ]}>REQUIRES</Text>
                  <View style={styles.inputsGrid}>
                    {activity.inputs.map((input) => {
                      const resource = RESOURCES[input.resourceId];
                      const bankItem = bank[input.resourceId];
                      const hasEnough = bankItem && bankItem.quantity >= input.quantity;
                      const currentAmount = bankItem?.quantity || 0;
                      
                      return (
                        <TouchableOpacity 
                          key={input.resourceId} 
                          style={[
                            styles.inputChip,
                            !hasEnough && styles.inputChipMissing
                          ]}
                          onPress={() => handleShowSources(activity)}
                        >
                          <Text style={styles.inputChipIcon}>{resource?.icon}</Text>
                          <Text style={[
                            styles.inputChipText,
                            !hasEnough && styles.inputChipTextMissing
                          ]}>
                            {currentAmount}/{input.quantity}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}
              

              
              {/* Level Lock Warning */}
              {isLocked && (
                <View style={styles.lockedOverlay}>
                  <Text style={styles.lockedOverlayText}>🔒 Unlocks at Lv {activity.levelRequired}</Text>
                </View>
              )}
              
              {/* Cooldown Overlay for Thieving */}
              {skill.id === 'thieving' && currentCooldown > 0 && (
                <View style={styles.cooldownOverlay}>
                  <Text style={styles.cooldownOverlayTitle}>🚨 Busted</Text>
                  <View style={styles.cooldownTimerContainer}>
                    <Text style={styles.cooldownTimerValue}>{currentCooldown}</Text>
                    <Text style={styles.cooldownTimerLabel}>seconds</Text>
                  </View>
                  <Text style={styles.cooldownOverlaySubtext}>Lying low. Resumes automatically.</Text>
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>
          );
        })}
      </View>
      

      
      {/* Level Up Celebration */}
      {skill.level > previousLevel && (
        <Animated.View
          style={[
            styles.levelUpContainer,
            {
              opacity: levelUpAnimation,
              transform: [
                {
                  scale: levelUpAnimation.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.5, 1.3, 1],
                  })
                }
              ]
            }
          ]}
        >
          <Text style={styles.levelUpText}>🎉 LEVEL UP! 🎉</Text>
          <Text style={styles.levelUpLevel}>Level {skill.level}</Text>
        </Animated.View>
      )}
      
      {/* Sources Modal */}
      <Modal
        visible={showSourcesModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSourcesModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSourcesModal(false)}
        >
          <TouchableOpacity 
            style={styles.modalContainer}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedActivity?.name} - Required Items
              </Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowSourcesModal(false)}
              >
                <X size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              {selectedActivity && (
                <View>
                  {/* Show all required inputs */}
                  <Text style={styles.modalSectionTitle}>Required Ingredients:</Text>
                  {selectedActivity.inputs?.map((input) => {
                    const resource = RESOURCES[input.resourceId];
                    const bankItem = bank[input.resourceId];
                    const hasEnough = bankItem && bankItem.quantity >= input.quantity;
                    const currentAmount = bankItem?.quantity || 0;
                    
                    return (
                      <View key={input.resourceId} style={styles.modalInputItem}>
                        <View style={styles.modalInputHeader}>
                          <ResourceImage resource={resource} size={20} />
                          <Text style={styles.modalInputName}>{resource?.name}</Text>
                          <Text style={[
                            styles.modalInputQuantity,
                            hasEnough ? styles.modalInputSufficient : styles.modalInputInsufficient
                          ]}>
                            {currentAmount}/{input.quantity}
                          </Text>
                        </View>
                        
                        {/* Show sources for this ingredient */}
                        <View style={styles.modalSourcesContainer}>
                          <Text style={styles.modalSourcesLabel}>Available from:</Text>
                          
                          {/* Store - Only show if item exists in store */}
                          {(() => {
                            const storeItem = STORE_ITEMS.find(s => s.resourceId === input.resourceId);
                            return storeItem ? (
                              <View style={styles.modalStoreContainer}>
                                <TouchableOpacity 
                                  style={styles.modalSourceItem}
                                  onPress={() => {
                                    setShowSourcesModal(false);
                                    setShowQuickShop(input.resourceId);
                                    setQuickShopQuantity(input.quantity - currentAmount);
                                  }}
                                >
                                  <Text style={styles.modalSourceIcon}>🏪</Text>
                                  <Text style={styles.modalSourceText}>
                                    Store - ${storeItem.price}
                                  </Text>
                                </TouchableOpacity>
                              </View>
                            ) : null;
                          })()}
                          
                          {/* Smuggling zones */}
                          {SMUGGLING_ZONES.filter(zone => 
                            zone.items.some(zoneItem => zoneItem.resource.id === input.resourceId)
                          ).map(zone => (
                            <TouchableOpacity 
                              key={zone.id} 
                              style={styles.modalSourceItem}
                              onPress={() => {
                                setShowSourcesModal(false);
                                onNavigateToSmuggling?.();
                              }}
                            >
                              <Text style={styles.modalSourceIcon}>📦</Text>
                              <Text style={styles.modalSourceText}>
                                {zone.name} (Level {zone.levelRequired}+)
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
      
      {/* Quick Shop Modal */}
      {showQuickShop && (() => {
        const storeItem = STORE_ITEMS.find(s => s.resourceId === showQuickShop);
        const resource = RESOURCES[showQuickShop];
        const { gold, buyItem } = useGameStore.getState();
        const totalPrice = storeItem ? storeItem.price * quickShopQuantity : 0;
        const canAfford = gold >= totalPrice;
        
        return storeItem ? (
          <Modal
            visible={true}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowQuickShop(null)}
          >
            <TouchableOpacity 
              style={styles.quickShopOverlay}
              activeOpacity={1}
              onPress={() => setShowQuickShop(null)}
            >
              <TouchableOpacity 
                style={styles.quickShopContainer}
                activeOpacity={1}
                onPress={(e) => e.stopPropagation()}
              >
                <View style={styles.quickShopHeader}>
                  <ShoppingCart size={20} color="#E0B252" />
                  <Text style={styles.quickShopTitle}>Quick Shop</Text>
                  <TouchableOpacity
                    style={styles.quickShopCloseButton}
                    onPress={() => setShowQuickShop(null)}
                  >
                    <X size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.quickShopContent}>
                  <View style={styles.quickShopItem}>
                    <ResourceImage resource={resource} size={32} />
                    <View style={styles.quickShopItemInfo}>
                      <Text style={styles.quickShopItemName}>{resource?.name}</Text>
                      <Text style={styles.quickShopItemPrice}>${storeItem.price} each</Text>
                    </View>
                  </View>
                  
                  <View style={styles.quickShopQuantitySection}>
                    <Text style={styles.quickShopQuantityLabel}>Quantity:</Text>
                    <View style={styles.quickShopQuantityControls}>
                      <TouchableOpacity
                        style={styles.quickShopQuantityButton}
                        onPress={() => setQuickShopQuantity(Math.max(1, quickShopQuantity - 1))}
                      >
                        <Minus size={16} color="#fff" />
                      </TouchableOpacity>
                      
                      <TextInput
                        style={styles.quickShopQuantityInput}
                        value={quickShopQuantity.toString()}
                        onChangeText={(text: string) => {
                          const num = parseInt(text) || 1;
                          setQuickShopQuantity(Math.max(1, num));
                        }}
                        keyboardType="numeric"
                        selectTextOnFocus
                      />
                      
                      <TouchableOpacity
                        style={styles.quickShopQuantityButton}
                        onPress={() => setQuickShopQuantity(quickShopQuantity + 1)}
                      >
                        <Plus size={16} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  
                  <View style={styles.quickShopQuickButtons}>
                    <TouchableOpacity
                      style={styles.quickShopQuickButton}
                      onPress={() => setQuickShopQuantity(quickShopQuantity + 10)}
                    >
                      <Text style={styles.quickShopQuickButtonText}>+10</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.quickShopQuickButton}
                      onPress={() => setQuickShopQuantity(quickShopQuantity + 100)}
                    >
                      <Text style={styles.quickShopQuickButtonText}>+100</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.quickShopQuickButton}
                      onPress={() => setQuickShopQuantity(quickShopQuantity + 1000)}
                    >
                      <Text style={styles.quickShopQuickButtonText}>+1000</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.quickShopTotalSection}>
                    <Text style={styles.quickShopTotalLabel}>Total Cost:</Text>
                    <Text style={[
                      styles.quickShopTotalPrice,
                      !canAfford && styles.quickShopInsufficientFunds
                    ]}>
                      ${totalPrice}
                    </Text>
                  </View>
                  
                  <View style={styles.quickShopBalance}>
                    <Text style={styles.quickShopBalanceLabel}>Your Balance:</Text>
                    <Text style={[
                      styles.quickShopBalanceAmount,
                      !canAfford && styles.quickShopInsufficientFunds
                    ]}>
                      ${gold}
                    </Text>
                  </View>
                  
                  <TouchableOpacity
                    style={[
                      styles.quickShopBuyButton,
                      !canAfford && styles.quickShopBuyButtonDisabled
                    ]}
                    onPress={() => {
                      if (canAfford) {
                        buyItem(storeItem.resourceId, quickShopQuantity, storeItem.price);
                        setShowQuickShop(null);
                      }
                    }}
                    disabled={!canAfford}
                  >
                    <ShoppingCart size={18} color={canAfford ? '#000' : '#6F685F'} />
                    <Text style={[
                      styles.quickShopBuyButtonText,
                      !canAfford && styles.quickShopBuyButtonTextDisabled
                    ]}>
                      {canAfford ? 'Purchase' : 'Insufficient Funds'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </TouchableOpacity>
          </Modal>
        ) : null;
      })()}
      
      {/* Mastery Perks Modal */}
      {showMasteryModal && (
        <MasteryPerksModal
          visible={true}
          onClose={() => setShowMasteryModal(null)}
          itemName={showMasteryModal.activity.name}
          currentMasteryLevel={showMasteryModal.masteryLevel}
          isThieving={skill.id === 'thieving'}
          isSmuggling={skill.id === 'smuggling'}
          isInvestigationLab={skill.id === 'investigation_lab'}
        />
      )}

      {/* Thieving Drops Modal */}
      {showDropsFor && (
        <ThievingDropsModal
          visible={true}
          onClose={() => setShowDropsFor(null)}
          activity={showDropsFor}
        />
      )}

      {showToolsModal && (
        <ThievingToolsModal
          visible={true}
          onClose={() => setShowToolsModal(false)}
        />
      )}

      {showDrugToolsModal && (
        <DrugToolsModal
          visible={true}
          onClose={() => setShowDrugToolsModal(false)}
        />
      )}

      {showDistilleryToolsModal && (
        <DistilleryToolsModal
          visible={true}
          onClose={() => setShowDistilleryToolsModal(false)}
        />
      )}

      {showInvestigationLabToolsModal && (
        <InvestigationLabToolsModal
          visible={true}
          onClose={() => setShowInvestigationLabToolsModal(false)}
        />
      )}

    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#18151D',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1D1922',
    shadowColor: '#E0B252',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
  },
  skillDescriptionContainer: {
    backgroundColor: 'rgba(139, 69, 19, 0.05)',
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 69, 19, 0.2)',
  },
  skillDescriptionText: {
    fontSize: 12,
    color: '#d2b48c',
    lineHeight: 16,
    textAlign: 'center',
    fontStyle: 'italic',
    letterSpacing: 0.2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2733',
  },
  skillIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  skillInfo: {
    flex: 1,
  },
  level: {
    fontSize: 14,
    color: '#2A2531',
    fontWeight: '600',
  },
  xpSection: {
    flex: 1,
    marginLeft: 12,
  },
  xpInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  xp: {
    fontSize: 13,
    fontWeight: '600',
    color: '#E0B252',
  },
  xpToNext: {
    fontSize: 11,
    color: '#8F877E',
  },
  headerProgressBar: {
    height: 6,
    backgroundColor: '#1D1922',
    borderRadius: 3,
    overflow: 'hidden',
  },
  headerProgressFill: {
    height: '100%',
    backgroundColor: '#E0B252',
    borderRadius: 3,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#1D1922',
    borderRadius: 4,
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2A2531',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#8F877E',
    minWidth: 40,
    textAlign: 'right',
  },

  toolsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#121016',
    borderWidth: 1,
    borderColor: '#2C2733',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
  },
  toolsBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  toolsBannerTitle: {
    color: '#E8E1D6',
    fontWeight: '800',
    fontSize: 16,
  },
  toolsBannerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toolsMeta: {
    alignItems: 'flex-end',
  },
  toolsTierText: {
    color: '#E0B252',
    fontWeight: '900',
    fontSize: 14,
  },
  toolsHint: {
    color: '#A8A097',
    fontSize: 12,
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34,197,94,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.24)'
  },
  activeIcon: { fontSize: 14, marginRight: 6 },
  activeText: { color: '#E0B252', fontSize: 12, fontWeight: '700' },

  activitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  activityCard: {
    width: '48%',
    marginBottom: 4,
  },
  activityCardInner: {
    backgroundColor: '#18151D',
    borderRadius: 12,
    padding: 8,
    borderWidth: 2,
    borderColor: '#2A2531',
    height: 250,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  activeActivityCard: {
    backgroundColor: '#2A2531',
    borderColor: '#E0B252',
    borderWidth: 2,
    shadowColor: '#E0B252',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  disabledActivityCard: {
    backgroundColor: '#0B0A0D',
    borderColor: '#3E3648',
    opacity: 0.6,
  },
  missingInputsActivityCard: {
    borderColor: '#E5484D',
    backgroundColor: 'rgba(229, 72, 77, 0.05)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardHeaderRight: {
    alignItems: 'flex-end',
    gap: 2,
    flexDirection: 'row',
    maxWidth: '50%',
    flexShrink: 1,
  },
  levelIndicator: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#E0B252',
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#ffffff',
    flex: 1,
    flexShrink: 1,
    marginRight: 4,
  },
  cardStatus: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#2A2531',
    paddingHorizontal: 4,
    paddingVertical: 1,
    backgroundColor: '#1D1922',
    borderRadius: 3,
    flexShrink: 1,
    textAlign: 'center',
  },
  iconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#16131A',
    borderWidth: 1,
    borderColor: '#2C2733',
    borderRadius: 8,
    marginRight: 6,
  },
  iconButtonText: {
    color: '#A8A097',
    fontSize: 12,
    fontWeight: '600',
  },
  activeCardStatus: {
    color: '#E0B252',
    backgroundColor: '#18151D',
  },
  disabledCardStatus: {
    color: '#6F685F',
    backgroundColor: '#0B0A0D',
  },
  lockedActivityCard: {
    backgroundColor: '#0E0C11',
    borderColor: '#2C2733',
    borderStyle: 'dashed',
  },
  lockedCardStatus: {
    color: '#A8A097',
    backgroundColor: '#18151D',
  },
  lockedIcon: {
    opacity: 0.5,
  },
  lockedText: {
    color: '#6F685F',
  },
  lockedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(11, 10, 13, 0.82)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  lockedOverlayText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#A8A097',
    textAlign: 'center',
    letterSpacing: 0.3,
    backgroundColor: '#18151D',
    borderWidth: 1,
    borderColor: '#3E3648',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    overflow: 'hidden',
  },
  productDisplay: {
    alignItems: 'center',
    marginVertical: 12,
  },
  productIcon: {
    fontSize: 24,
    marginBottom: 2,
  },
  productName: {
    fontSize: 10,
    color: '#E0B252',
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 6,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 8,
    color: '#8F877E',
    marginBottom: 1,
  },
  statValue: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  xpValue: {
    color: '#E0B252',
  },
  masteryValue: {
    color: '#E0B252',
  },
  masteryInfoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(251, 191, 36, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.35)'
  },
  masteryInfoText: {
    fontSize: 10,
    color: '#E0B252',
    fontWeight: '600'
  },
  masteryStatContainer: {
    alignItems: 'center',
  },
  cardProgressContainer: {
    height: 3,
    backgroundColor: '#0B0A0D',
    borderRadius: 2,
    overflow: 'hidden',
    marginVertical: 6,
  },
  cardProgressFill: {
    height: '100%',
    backgroundColor: '#E0B252',
  },
  inputsSection: {
    backgroundColor: 'rgba(42, 37, 49, 0.2)',
    padding: 6,
    borderRadius: 6,
    marginTop: 4,
  },
  inputsSectionMissing: {
    backgroundColor: 'rgba(229, 72, 77, 0.15)',
    borderWidth: 1,
    borderColor: '#E5484D',
  },
  inputsTitle: {
    fontSize: 9,
    color: '#A8A097',
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  inputsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
    justifyContent: 'center',
    maxWidth: '100%',
  },
  inputChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1D1922',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#2A2531',
    maxWidth: '48%',
    minWidth: 40,
    flexShrink: 1,
  },
  inputChipMissing: {
    backgroundColor: 'rgba(229, 72, 77, 0.15)',
    borderColor: '#E5484D',
  },
  inputChipIcon: {
    fontSize: 10,
    marginRight: 2,
  },
  inputChipText: {
    fontSize: 8,
    color: '#fff',
    fontWeight: '600',
    flexShrink: 1,
  },
  inputChipTextMissing: {
    color: '#E5484D',
  },
  warningButton: {
    marginTop: 6,
    padding: 4,
    backgroundColor: 'rgba(229, 72, 77, 0.1)',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E5484D',
  },
  warningButtonText: {
    fontSize: 9,
    color: '#E5484D',
    textAlign: 'center',
    fontWeight: '600',
  },
  activitiesContainer: {
    gap: 8,
  },
  activityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1D1922',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2A2531',
  },
  activeActivity: {
    backgroundColor: '#2A2531',
    borderColor: '#E0B252',
  },
  activityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  activityIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  activityTextContainer: {
    flex: 1,
  },
  activityName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  activityStats: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 2,
  },
  activityDetails: {
    fontSize: 12,
    color: '#8F877E',
    fontWeight: '500',
  },
  activityStatus: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2A2531',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#1D1922',
    borderRadius: 4,
  },
  activeStatus: {
    color: '#E0B252',
    backgroundColor: '#18151D',
  },
  floatingXp: {
    position: 'absolute',
    top: -50,
    right: 20,
    zIndex: 1000,
  },
  floatingXpText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3DD68C',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  levelUpContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -100 }, { translateY: -30 }],
    backgroundColor: 'rgba(255, 215, 0, 0.95)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    zIndex: 20,
    borderWidth: 2,
    borderColor: '#E0B252',
  },
  levelUpText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  levelUpLevel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginTop: 2,
  },
  activityWrapper: {
    // Wrapper for activity button animations
  },
  disabledActivity: {
    backgroundColor: '#0B0A0D',
    borderColor: '#3E3648',
    opacity: 0.6,
  },
  disabledText: {
    color: '#555',
  },
  disabledStatus: {
    color: '#6F685F',
    backgroundColor: '#0B0A0D',
  },
  failureChance: {
    color: '#E5484D',
  },
  inputsContainer: {
    marginTop: 8,
    backgroundColor: 'rgba(42, 37, 49, 0.2)',
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#2A2531',
  },
  inputsContainerMissing: {
    backgroundColor: 'rgba(229, 72, 77, 0.15)',
    borderColor: '#E5484D',
    borderWidth: 2,
  },
  inputsLabel: {
    fontSize: 11,
    color: '#A8A097',
    marginBottom: 6,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  inputItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1D1922',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#2A2531',
  },
  inputItemMissing: {
    backgroundColor: 'rgba(229, 72, 77, 0.15)',
    borderColor: '#E5484D',
    borderWidth: 2,
  },
  inputIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  inputText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '600',
  },
  missingInput: {
    color: '#E5484D',
    fontWeight: 'bold',
  },
  missingInputsContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: 'rgba(229, 72, 77, 0.1)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5484D',
  },
  missingInputsText: {
    fontSize: 11,
    color: '#E5484D',
    textAlign: 'center',
    fontWeight: '600',
  },
  sourcesContainer: {
    marginTop: 4,
  },
  sourcesLabel: {
    fontSize: 9,
    color: '#A8A097',
    marginBottom: 4,
    fontWeight: 'bold',
  },
  sourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  sourceIcon: {
    fontSize: 12,
    marginRight: 6,
  },
  sourceInfo: {
    flex: 1,
  },
  sourceName: {
    fontSize: 9,
    color: '#D4CCC1',
    fontWeight: 'bold',
  },
  sourceOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 2,
  },
  sourceOption: {
    fontSize: 8,
    color: '#8F877E',
    backgroundColor: '#0B0A0D',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2,
  },
  missingInputsActivity: {
    borderColor: '#E5484D',
    borderWidth: 2,
    backgroundColor: 'rgba(229, 72, 77, 0.05)',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#18151D',
    borderRadius: 12,
    width: '100%',
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: '#1D1922',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1D1922',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    flex: 1,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalContent: {
    padding: 16,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  modalInputItem: {
    backgroundColor: '#1D1922',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2A2531',
  },
  modalInputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalInputIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  modalInputName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    flex: 1,
  },
  modalInputQuantity: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalInputSufficient: {
    color: '#3DD68C',
  },
  modalInputInsufficient: {
    color: '#E5484D',
  },
  modalSourcesContainer: {
    marginTop: 8,
  },
  modalSourcesLabel: {
    fontSize: 12,
    color: '#A8A097',
    marginBottom: 6,
    fontWeight: 'bold',
  },
  modalSourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2531',
    padding: 8,
    borderRadius: 6,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#1D1922',
  },
  modalSourceIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  modalSourceText: {
    fontSize: 12,
    color: '#D4CCC1',
    flex: 1,
  },
  productText: {
    color: '#E0B252',
    fontWeight: '600',
  },
  modalStoreContainer: {
    marginBottom: 8,
  },
  
  // Quick Shop Modal Styles
  quickShopOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'flex-end',
  },
  quickShopContainer: {
    backgroundColor: '#18151D',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderTopColor: '#E0B252',
    borderLeftColor: '#E0B252',
    borderRightColor: '#E0B252',
    maxHeight: '70%',
  },
  quickShopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  quickShopTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    marginLeft: 10,
  },
  quickShopCloseButton: {
    padding: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  quickShopContent: {
    gap: 16,
  },
  quickShopItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1D1922',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A2531',
  },
  quickShopItemIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  quickShopItemInfo: {
    flex: 1,
  },
  quickShopItemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  quickShopItemPrice: {
    fontSize: 14,
    color: '#E0B252',
    fontWeight: '600',
  },
  quickShopQuantitySection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1D1922',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A2531',
  },
  quickShopQuantityLabel: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  quickShopQuantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quickShopQuantityButton: {
    width: 36,
    height: 36,
    backgroundColor: '#2A2531',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0B252',
  },
  quickShopQuantityText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    minWidth: 40,
    textAlign: 'center',
  },
  quickShopTotalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#2C2733',
  },
  quickShopTotalLabel: {
    fontSize: 16,
    color: '#8F877E',
    fontWeight: '600',
  },
  quickShopTotalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E0B252',
  },
  quickShopBalance: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  quickShopBalanceLabel: {
    fontSize: 14,
    color: '#8F877E',
  },
  quickShopBalanceAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E0B252',
  },
  quickShopInsufficientFunds: {
    color: '#E5484D',
  },
  quickShopQuickButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
  },
  quickShopQuickButton: {
    backgroundColor: '#1D1922',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0B252',
  },
  quickShopQuickButtonText: {
    color: '#E0B252',
    fontSize: 12,
    fontWeight: 'bold',
  },
  quickShopBuyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E0B252',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 12,
    gap: 8,
  },
  quickShopBuyButtonDisabled: {
    backgroundColor: '#2C2733',
    opacity: 0.6,
  },
  quickShopBuyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  quickShopBuyButtonTextDisabled: {
    color: '#6F685F',
  },
  quickShopQuantityInput: {
    backgroundColor: '#121016',
    color: '#fff',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    width: 70,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0B252',
    paddingHorizontal: 4,
  },

  // Heat styles
  heatContainer: {
    backgroundColor: 'rgba(229, 72, 77, 0.05)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(229, 72, 77, 0.2)',
  },
  heatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  heatLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#E5484D',
  },
  heatValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  heatLow: {
    color: '#E0B252',
  },
  heatMedium: {
    color: '#E0B252',
  },
  heatHigh: {
    color: '#fb923c',
  },
  heatCritical: {
    color: '#E5484D',
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
    backgroundColor: '#E0B252',
  },
  heatFillMedium: {
    backgroundColor: '#E0B252',
  },
  heatFillHigh: {
    backgroundColor: '#fb923c',
  },
  heatFillCritical: {
    backgroundColor: '#E5484D',
  },
  heatDescription: {
    fontSize: 11,
    color: '#A8A097',
    fontStyle: 'italic',
  },
  heatStatPositive: {
    color: '#E5484D',
  },
  heatStatNegative: {
    color: '#E0B252',
  },
  
  // Mastery styles for thieving
  masterySection: {
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    borderRadius: 4,
    padding: 4,
    marginTop: 4,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  masteryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  masteryLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#E0B252',
    flex: 1,
  },
  masteryPercent: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#E0B252',
  },
  masteryBar: {
    height: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  masteryFill: {
    height: '100%',
    backgroundColor: '#E0B252',
    borderRadius: 2,
  },
  masteryPerkText: {
    fontSize: 7,
    color: '#E0B252',
    marginTop: 2,
    fontWeight: '600',
  },

  agentBanner: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: 'rgba(184, 50, 58, 0.12)',
    borderColor: 'rgba(184, 50, 58, 0.4)',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  agentIcon: {
    fontSize: 28,
  },
  agentTitle: {
    fontSize: 10,
    color: '#E0B252',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  agentName: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '800',
  },
  agentDesc: {
    fontSize: 10,
    color: '#E8E1D6',
    marginTop: 2,
  },
  agentBonusesRow: {
    marginTop: 6,
    gap: 2,
  },
  agentBonusChip: {
    fontSize: 10,
    color: '#F6E7C1',
  },
  
  // Thieving specific stats
  thievingStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(229, 72, 77, 0.05)',
    borderRadius: 4,
    padding: 4,
    marginTop: 4,
    borderWidth: 1,
    borderColor: 'rgba(229, 72, 77, 0.2)',
  },
  thievingStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  thievingStatLabel: {
    fontSize: 8,
    color: '#A8A097',
    marginBottom: 1,
    fontWeight: '600',
  },
  thievingStatValue: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  catchRateLow: {
    color: '#E0B252',
  },
  catchRateMedium: {
    color: '#E0B252',
  },
  catchRateHigh: {
    color: '#E5484D',
  },
  cooldownInactive: {
    color: '#8F877E',
  },
  cooldownActive: {
    color: '#E5484D',
  },
  cooldownWarning: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 4,
    padding: 6,
    marginTop: 6,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  cooldownWarningText: {
    fontSize: 10,
    color: '#E5484D',
    textAlign: 'center',
    fontWeight: '600',
  },
  
  // Cooldown overlay styles
  cooldownOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(14, 12, 17, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(229, 72, 77, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    zIndex: 100,
  },
  cooldownOverlayTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#E5484D',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  cooldownTimerContainer: {
    alignItems: 'center',
    marginBottom: 6,
  },
  cooldownTimerValue: {
    fontSize: 34,
    fontWeight: '900',
    color: '#F4EFE6',
  },
  cooldownTimerLabel: {
    fontSize: 11,
    color: '#A8A097',
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  cooldownOverlaySubtext: {
    fontSize: 11,
    color: '#8F877E',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingHorizontal: 8,
  },

  // Manager UI styles
  containerWithManager: {
    borderColor: '#B8323A',
    borderWidth: 2,
    shadowColor: '#B8323A',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  managerHeader: {
    backgroundColor: 'rgba(184, 50, 58, 0.08)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(184, 50, 58, 0.3)',
    position: 'relative',
    overflow: 'hidden',
  },
  managerHeaderTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  managerIconContainer: {
    position: 'relative',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  managerIcon: {
    fontSize: 32,
    zIndex: 2,
  },
  managerGlow: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(184, 50, 58, 0.2)',
    zIndex: 1,
  },
  managerInfo: {
    flex: 1,
    marginRight: 12,
  },
  managerTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: '#E0B252',
    letterSpacing: 1,
    marginBottom: 2,
  },
  managerName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
  },
  managerDescription: {
    fontSize: 11,
    color: '#E8E1D6',
    lineHeight: 14,
    fontStyle: 'italic',
  },
  managerBadge: {
    backgroundColor: 'rgba(184, 50, 58, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(184, 50, 58, 0.4)',
  },
  managerBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#E0B252',
    letterSpacing: 0.5,
  },
  managerBonuses: {
    marginTop: 8,
  },
  managerBonusesTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#A8A097',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  managerBonusesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  managerBonusChip: {
    backgroundColor: 'rgba(184, 50, 58, 0.15)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(184, 50, 58, 0.3)',
  },
  managerBonusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#F6E7C1',
  },

});
