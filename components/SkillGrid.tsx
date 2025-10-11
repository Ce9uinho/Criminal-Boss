import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, useWindowDimensions } from 'react-native';
import { useGameStore } from '@/store/gameStore';
import { ACTIVITIES, RESOURCES, getXpForLevel } from '@/constants/gameData';
import { Lock, Trophy, Info } from 'lucide-react-native';
import { MasteryPerksModal } from './MasteryPerksModal';
import { SmugglingZones } from './SmugglingZones';
import SkillCard from './SkillCard';


interface SkillGridProps {
  selectedSkill: string | null;
  onSelectSkill: (skill: string) => void;
  onNavigateToStore?: (targetResourceId?: string) => void;
  onNavigateToSmuggling?: () => void;
}

export default function SkillGrid({ selectedSkill, onSelectSkill, onNavigateToStore, onNavigateToSmuggling }: SkillGridProps) {
  const { skills, startActivity, stopActivity, getMasteryPercentage, getMasteryLevel, thievingCooldowns } = useGameStore();
  const [activeActivity, setActiveActivity] = useState<string | null>(null);
  const [selectedMasteryItem, setSelectedMasteryItem] = useState<{ name: string; activityId: string } | null>(null);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);
  const { width } = useWindowDimensions();
  
  // Header animation values
  const headerScale = useRef(new Animated.Value(1)).current;
  const headerGlow = useRef(new Animated.Value(0)).current;
  const xpBarGlow = useRef(new Animated.Value(0)).current;

  
  const CARD_WIDTH = (width - 48) / 2 - 8;

  const activities = selectedSkill ? ACTIVITIES[selectedSkill] || [] : [];
  const skill = selectedSkill ? skills[selectedSkill] : null;
  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    if (skill?.isActive && skill.currentActivity) {
      setActiveActivity(skill.currentActivity.id);
      startProgressAnimation(skill.currentActivity.baseTime);
    } else {
      setActiveActivity(null);
      stopProgressAnimation();
    }
  }, [skill?.isActive, skill?.currentActivity]);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, []);



  // Animate XP progress bar with glow effect
  useEffect(() => {
    Animated.parallel([
      Animated.timing(progressAnim, {
        toValue: getProgressPercentage(),
        duration: 500,
        useNativeDriver: false,
      }),
      Animated.sequence([
        Animated.timing(xpBarGlow, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(xpBarGlow, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
      ]),
    ]).start();
  }, [skill?.experience, skill?.level]);
  
  // Header entrance animation
  useEffect(() => {
    if (selectedSkill && skill) {
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
    }
  }, [selectedSkill]);
  


  const startProgressAnimation = (duration: number) => {
    progressAnim.setValue(0);
    
    animationRef.current = Animated.loop(
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: duration,
        useNativeDriver: false,
      })
    );
    
    animationRef.current.start();
  };

  const stopProgressAnimation = () => {
    if (animationRef.current) {
      animationRef.current.stop();
      progressAnim.setValue(0);
    }
  };

  const handleActivityPress = (activity: any) => {
    if (!selectedSkill || !skill) return;
    
    if (skill.level < activity.levelRequired) return;
    
    if (activeActivity === activity.id) {
      stopActivity(selectedSkill);
      setActiveActivity(null);
      stopProgressAnimation();
    } else {
      startActivity(selectedSkill, activity);
      setActiveActivity(activity.id);
      startProgressAnimation(activity.baseTime);
    }
  };

  const getNextLevelXp = () => {
    if (!skill) return 0;
    return getXpForLevel(skill.level + 1);
  };

  const getCurrentLevelXp = () => {
    if (!skill) return 0;
    return getXpForLevel(skill.level);
  };

  const getProgressPercentage = () => {
    if (!skill) return 0;
    const currentLevelXp = getCurrentLevelXp();
    const nextLevelXp = getNextLevelXp();
    const progress = ((skill.experience - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;
    return Math.min(100, Math.max(0, progress));
  };

  const formatTime = (ms: number) => {
    const seconds = ms / 1000;
    return `${seconds.toFixed(1)}s`;
  };

  if (!selectedSkill || !skill) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>Select a skill from the sidebar</Text>
      </View>
    );
  }

  // Special handling for Smuggling skill
  if (selectedSkill === 'smuggling') {
    return <SmugglingZones />;
  }

  // Use SkillCard for skills that have activities with inputs OR for thieving to show Tools and rich header
  const hasInputActivities = activities.some(activity => activity.inputs && activity.inputs.length > 0);
  const shouldUseSkillCard = hasInputActivities || selectedSkill === 'thieving';
  
  if (shouldUseSkillCard) {
    return (
      <View style={styles.container}>
        <SkillCard 
          skill={skill} 
          onNavigateToStore={onNavigateToStore}
          onNavigateToSmuggling={onNavigateToSmuggling}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Skill Header with XP */}
      <Animated.View style={[
        styles.skillHeader,
        {
          transform: [{ scale: headerScale }],
          shadowOpacity: headerGlow.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 0.3],
          }),
        },
      ]}>
        <View style={styles.skillHeaderLeft}>
          <Animated.Text style={[
            styles.skillName,
            {
              opacity: headerGlow.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0, 0.8, 1],
              }),
            },
          ]}>
            {skill.name}
          </Animated.Text>
          <Animated.Text style={[
            styles.skillLevel,
            {
              opacity: headerGlow.interpolate({
                inputRange: [0, 0.7, 1],
                outputRange: [0, 0.8, 1],
              }),
            },
          ]}>
            Level {skill.level}
          </Animated.Text>
        </View>
        <View style={styles.skillHeaderRight}>
          <View style={styles.xpInfo}>
            <Text style={styles.xpText}>{skill.experience.toLocaleString()} XP</Text>
            <Text style={styles.xpToNext}>
              {skill.level >= 99 ? 'MAX' : `${((getNextLevelXp() - skill.experience)).toLocaleString()} to next`}
            </Text>
          </View>
          {skill.level < 99 && (
            <Animated.View style={[
              styles.xpProgressBar,
              {
                shadowColor: '#ffd700',
                shadowOpacity: xpBarGlow,
                shadowRadius: xpBarGlow.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 8],
                }),
                elevation: xpBarGlow.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 4],
                }),
              },
            ]}>
              <Animated.View 
                style={[
                  styles.xpProgressFill,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 100],
                      outputRange: ['0%', '100%'],
                      extrapolate: 'clamp',
                    }),
                    backgroundColor: xpBarGlow.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['#ffd700', '#ffed4e'],
                    }),
                  }
                ]}
              />
            </Animated.View>
          )}
        </View>
      </Animated.View>





      <View style={styles.grid}>
        {activities.map((activity) => {
          const isLocked = skill.level < activity.levelRequired;
          const isActive = activeActivity === activity.id;
          const resource = activity.resource;
          const isThieving = selectedSkill === 'thieving';
          const cooldownUntil = isThieving ? (thievingCooldowns?.[activity.id] ?? 0) : 0;
          const remainingMs = Math.max(0, cooldownUntil - now);
          const isOnCooldown = isThieving && remainingMs > 0;
          const remainingSec = Math.max(0, Math.floor(remainingMs / 1000));
          
          return (
            <TouchableOpacity
              key={activity.id}
              style={[
                styles.card,
                { width: CARD_WIDTH },
                isActive && styles.activeCard,
                isLocked && styles.lockedCard
              ]}
              onPress={() => handleActivityPress(activity)}
              disabled={isLocked || isOnCooldown}
              testID={`activity-card-${activity.id}`}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.actionText}>PRODUCE</Text>
                <Text style={styles.resourceName}>{resource.name.toUpperCase()}</Text>
              </View>
              
              <View style={styles.cardContent}>
                <Text style={styles.resourceIcon}>{resource.icon}</Text>
                <View style={styles.statsContainer}>
                  <Text style={styles.xpPerAction}>+{activity.baseXp} XP</Text>
                  <Text style={styles.timePerAction}>{formatTime(activity.baseTime)}</Text>
                </View>
              </View>

              {isActive && (
                <View style={styles.progressContainer}>
                  <Animated.View
                    style={[
                      styles.activityProgress,
                      {
                        width: progressAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', '100%']
                        })
                      }
                    ]}
                  />
                </View>
              )}

              {isOnCooldown && (
                <View style={styles.cooldownOverlay} pointerEvents="none" testID={`cooldown-${activity.id}`}>
                  <Text style={styles.cooldownTitle}>COOLDOWN</Text>
                  <Text style={styles.cooldownTimer}>{remainingSec}s</Text>
                </View>
              )}

              <View style={styles.cardFooter}>
                {isLocked ? (
                  <>
                    <Lock size={14} color="#ef4444" />
                    <Text style={styles.lockedText}>LV {activity.levelRequired}</Text>
                  </>
                ) : (
                  <View style={styles.masteryContainer}>
                    <View style={styles.masteryInfo}>
                      <Trophy size={14} color="#fbbf24" />
                      <Text style={styles.masteryText}>
                        Mastery {getMasteryPercentage(activity.id).toFixed(1)}%
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.masteryButton}
                      onPress={() => setSelectedMasteryItem({ name: resource.name, activityId: activity.id })}
                    >
                      <Info size={16} color="#94a3b8" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}

        {activities.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No activities available for this skill</Text>
          </View>
        )}
      </View>

      {selectedMasteryItem && (
        <MasteryPerksModal
          visible={!!selectedMasteryItem}
          onClose={() => setSelectedMasteryItem(null)}
          itemName={selectedMasteryItem.name}
          currentMasteryLevel={getMasteryLevel(selectedMasteryItem.activityId)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  skillHeader: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2a2a3e',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#ffd700',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
  },
  skillHeaderLeft: {
    flex: 1,
  },
  skillName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  skillLevel: {
    fontSize: 14,
    color: '#4ade80',
    fontWeight: '600',
  },
  skillHeaderRight: {
    flex: 1.5,
    alignItems: 'flex-end',
  },
  xpInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 6,
  },
  xpText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffd700',
  },
  xpToNext: {
    fontSize: 11,
    color: '#888',
  },
  xpProgressBar: {
    height: 6,
    backgroundColor: '#16213e',
    borderRadius: 3,
    overflow: 'hidden',
    width: '100%',
    shadowOffset: { width: 0, height: 1 },
  },
  xpProgressFill: {
    height: '100%',
    backgroundColor: '#ffd700',
    borderRadius: 3,
  },
  levelInfo: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2a2a3e',
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  levelText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4ade80',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#2a2a3e',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4ade80',
    borderRadius: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2a2a3e',
    padding: 16,
    minHeight: 180,
  },
  activeCard: {
    borderColor: '#4ade80',
    backgroundColor: 'rgba(74, 222, 128, 0.05)',
  },
  lockedCard: {
    opacity: 0.6,
    borderColor: '#ef4444',
  },
  cardHeader: {
    marginBottom: 12,
  },
  actionText: {
    fontSize: 10,
    color: '#64748b',
    marginBottom: 4,
    fontWeight: '600',
  },
  resourceName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#fff',
  },
  cardContent: {
    alignItems: 'center',
    marginBottom: 12,
    flex: 1,
    justifyContent: 'center',
  },
  resourceIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  statsContainer: {
    alignItems: 'center',
  },
  xpPerAction: {
    fontSize: 12,
    color: '#4ade80',
    fontWeight: '600',
    marginBottom: 2,
  },
  timePerAction: {
    fontSize: 11,
    color: '#94a3b8',
  },
  progressContainer: {
    height: 3,
    backgroundColor: '#2a2a3e',
    borderRadius: 2,
    marginVertical: 8,
    overflow: 'hidden',
  },
  activityProgress: {
    height: '100%',
    backgroundColor: '#4ade80',
  },
  cooldownOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(239, 68, 68, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  cooldownTitle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  cooldownTimer: {
    color: '#fff',
    fontSize: 18,
    marginTop: 4,
    fontWeight: '800',
  },
  // Heat styles
  heatContainer: {
    backgroundColor: 'rgba(255, 107, 107, 0.05)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.2)',
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
  heatBarContainer: {
    height: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  heatBarFill: {
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
  },
  toolsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#111827',
    borderColor: '#1f2937',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  toolsLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  toolsTitle: { color: '#e5e7eb', fontWeight: '700', fontSize: 14, marginLeft: 8 },
  toolsRight: { alignItems: 'flex-end' },
  toolsEquippedText: { color: '#4ade80', fontWeight: '800', fontSize: 13 },
  toolsHint: { color: '#94a3b8', fontSize: 11 },

  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  masteryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  masteryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  masteryText: {
    fontSize: 10,
    color: '#fbbf24',
    fontWeight: '500',
  },
  masteryButton: {
    padding: 4,
    marginLeft: 8,
  },
  lockedText: {
    fontSize: 10,
    color: '#ef4444',
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});
