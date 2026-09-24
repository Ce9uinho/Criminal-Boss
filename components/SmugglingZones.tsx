import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Modal,
} from 'react-native';
import { SMUGGLING_ZONES, SKILL_DESCRIPTIONS, getSmugglingXp, AGENTS } from '@/constants/gameData';
import { useGameStore } from '@/store/gameStore';
import { SmugglingZone } from '@/types/game';
import { Info, Package, X, Anchor, Warehouse, ShoppingBag, Zap, Plane, MapPin, Wifi, Palette, Shield, Globe, Wrench } from 'lucide-react-native';
import { MasteryPerksModal } from './MasteryPerksModal';
import SmugglingToolsModal from './SmugglingToolsModal';

export function SmugglingZones() {
  const skill = useGameStore(state => state.skills.smuggling);
  const currentZone = useGameStore(state => state.currentSmugglingZone);
  const startSmugglingZone = useGameStore(state => state.startSmugglingZone);
  const stopActivity = useGameStore(state => state.stopActivity);
  const getMasteryPercentage = useGameStore(state => state.getMasteryPercentage);
  const getMasteryTimeReduction = useGameStore(state => state.getMasteryTimeReduction);
  const getMasteryLevel = useGameStore(state => state.getMasteryLevel);

  const [perksZone, setPerksZone] = useState<SmugglingZone | null>(null);
  const [dropsZone, setDropsZone] = useState<SmugglingZone | null>(null);
  const [toolsVisible, setToolsVisible] = useState<boolean>(false);

  const progressAnim = useRef(new Animated.Value(0)).current;

  const getSmugglingToolBonuses = useGameStore(state => state.getSmugglingToolBonuses);
  const getActualTime = useGameStore(state => state.getActualTime);
  const equippedSmugglingToolId = useGameStore(state => state.equippedSmugglingToolId);

  useEffect(() => {
    if (skill.isActive && currentZone) {
      const masteryId = `smuggling_${currentZone.id}`;
      const baseActual = getActualTime('smuggling', currentZone.baseTime, masteryId);
      const toolMult = getSmugglingToolBonuses().timeReductionMultiplier ?? 1;
      const actualTime = Math.max(100, Math.floor(baseActual * toolMult));

      progressAnim.setValue(0);
      const animation = Animated.loop(
        Animated.timing(progressAnim, {
          toValue: 1,
          duration: actualTime,
          useNativeDriver: false,
        })
      );
      animation.start();
      return () => {
        animation.stop();
        progressAnim.setValue(0);
      };
    } else {
      progressAnim.setValue(0);
    }
  }, [skill.isActive, currentZone, skill.level, skill.agentUnlocked, equippedSmugglingToolId]);

  const handleZonePress = (zone: SmugglingZone) => {
    if (skill.level < zone.levelRequired) return;
    if (skill.isActive && currentZone?.id === zone.id) {
      stopActivity('smuggling');
    } else {
      startSmugglingZone(zone);
    }
  };

  const formatTime = (ms: number) => `${(ms / 1000).toFixed(1)}s`;

  const getActualXp = (zone: SmugglingZone) => {
    const masteryId = `smuggling_${zone.id}`;
    const baseActual = getActualTime('smuggling', zone.baseTime, masteryId);
    const toolMult = getSmugglingToolBonuses().timeReductionMultiplier ?? 1;
    const actualTime = Math.max(100, Math.floor(baseActual * toolMult));
    return getSmugglingXp(skill.level, actualTime);
  };

  const skillDescription = SKILL_DESCRIPTIONS['smuggling'] || '';

  const getZoneIcon = (zoneId: string, isLocked: boolean) => {
    const iconColor = isLocked ? '#6F685F' : '#E0B252';
    const iconSize = 20;
    
    switch (zoneId) {
      case 'docks':
        return <Anchor size={iconSize} color={iconColor} />;
      case 'warehouse':
        return <Warehouse size={iconSize} color={iconColor} />;
      case 'black_market':
        return <ShoppingBag size={iconSize} color={iconColor} />;
      case 'tunnels':
        return <Zap size={iconSize} color={iconColor} />;
      case 'airport':
        return <Plane size={iconSize} color={iconColor} />;
      case 'border':
        return <MapPin size={iconSize} color={iconColor} />;
      case 'cyber':
        return <Wifi size={iconSize} color={iconColor} />;
      case 'art_underground':
        return <Palette size={iconSize} color={iconColor} />;
      case 'military':
        return <Shield size={iconSize} color={iconColor} />;
      case 'syndicate':
        return <Globe size={iconSize} color={iconColor} />;
      default:
        return <Package size={iconSize} color={iconColor} />;
    }
  };

  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} testID="smuggling-zones">
        <View style={[styles.cardContainer, skill.level >= 100 ? styles.containerWithManager : null]}>
          {skillDescription && (
            <View style={styles.skillDescriptionContainer}>
              <Text style={styles.skillDescriptionText}>{skillDescription}</Text>
            </View>
          )}

          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => setToolsVisible(true)}
            activeOpacity={0.9}
            style={styles.toolsBanner}
            testID="smuggling-tools-banner"
          >
            <View style={styles.toolsBannerLeft}>
              <Wrench size={18} color="#A8A097" />
              <Text style={styles.toolsBannerTitle}>Crews</Text>
            </View>
          </TouchableOpacity>

          {skill.level >= 100 && (
            <View style={styles.managerHeader} testID={`manager-header-smuggling`}>
              <View style={styles.managerHeaderTop}>
                <View style={styles.managerIconContainer}>
                  <Text style={styles.managerIcon}>🕵️</Text>
                  <View style={styles.managerGlow} />
                </View>
                <View style={styles.managerInfo}>
                  <Text style={styles.managerTitle}>MANAGER ACTIVE</Text>
                  <Text style={styles.managerName}>{AGENTS['smuggling']?.name ?? 'Elite Operative'}</Text>
                  <Text style={styles.managerDescription}>{AGENTS['smuggling']?.description ?? ''}</Text>
                </View>
                <View style={styles.managerBadge}>
                  <Text style={styles.managerBadgeText}>LV 100</Text>
                </View>
              </View>
              <View style={styles.managerBonuses}>
                <Text style={styles.managerBonusesTitle}>Active Bonuses:</Text>
                <View style={styles.managerBonusesGrid}>
                  {(AGENTS['smuggling']?.bonuses ?? []).map((b, idx) => (
                    <View key={`smug-bonus-${idx}`} style={styles.managerBonusChip}>
                      <Text style={styles.managerBonusText}>{b}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}

          {SMUGGLING_ZONES.map((zone) => {
            const isActive = skill.isActive && currentZone?.id === zone.id;
            const isLocked = skill.level < zone.levelRequired;
            const masteryId = `smuggling_${zone.id}`;
            const masteryPercentage = getMasteryPercentage(masteryId);
            const masteryLevel = getMasteryLevel(masteryId);
            const toolB = getSmugglingToolBonuses();
            const baseActual = getActualTime('smuggling', zone.baseTime, masteryId);
            const actualTime = Math.max(100, Math.floor(baseActual * (toolB.timeReductionMultiplier ?? 1)));
            const avgXp = getActualXp(zone);
            const baseJunk = Math.max(0, Math.floor(zone.junkChance * (toolB.junkReductionMultiplier ?? 1)));
            const effectiveJunk = Math.max(0, baseJunk - (skill.agentUnlocked ? 15 : 0));
            let bonusItems = 0;
            if (masteryLevel >= 100) bonusItems = 5;
            else if (masteryLevel >= 75) bonusItems = 3;
            else if (masteryLevel >= 50) bonusItems = 2;
            else if (masteryLevel >= 25) bonusItems = 1;
            const managerItems = skill.agentUnlocked ? 1 : 0;
            const itemsPerAction = 1 + bonusItems + (toolB.itemsPerActionBonus ?? 0) + managerItems;

            return (
              <TouchableOpacity
                key={zone.id}
                style={[
                  styles.zoneCard,
                  isActive && styles.activeCard,
                  isLocked && styles.lockedCard,
                ]}
                onPress={() => handleZonePress(zone)}
                disabled={isLocked}
                activeOpacity={0.8}
                testID={`smuggling-zone-${zone.id}`}
              >
                <View style={styles.zoneHeader}>
                  <View style={styles.zoneIconContainer}>
                    {getZoneIcon(zone.id, isLocked)}
                  </View>
                  <View style={styles.zoneInfo}>
                    <Text style={[styles.zoneName, isLocked && styles.lockedText]}>{zone.name}</Text>
                    <View style={styles.zoneMetaRow}>
                      <Text style={[styles.zoneLevel, isLocked && styles.lockedText]}>{isLocked ? `🔒 Unlocks at Lv ${zone.levelRequired}` : `Lv ${zone.levelRequired}`}</Text>
                      {isActive && (
                        <View style={styles.activeIndicator}><View style={styles.activeDot} /><Text style={styles.activeText}>RUNNING</Text></View>
                      )}
                    </View>
                  </View>
                  <View style={styles.headerButtons}>
                    <TouchableOpacity
                      style={styles.iconButton}
                      onPress={() => setPerksZone(zone)}
                      disabled={false}
                      testID={`perks-btn-${zone.id}`}
                    >
                      <Info size={16} color="#A8A097" />
                      <Text style={styles.iconButtonText}>Perks</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.iconButton}
                      onPress={() => setDropsZone(zone)}
                      disabled={false}
                      testID={`drops-btn-${zone.id}`}
                    >
                      <Package size={16} color="#A8A097" />
                      <Text style={styles.iconButtonText}>Drops</Text>
                    </TouchableOpacity>

                  </View>
                </View>

                {isActive && (
                  <View style={styles.progressContainerTop}>
                    <Animated.View
                      style={[
                        styles.progressBar,
                        {
                          width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
                        },
                      ]}
                    />
                  </View>
                )}

                <View style={styles.zoneStats}>
                  <View style={styles.statRow}><Text style={styles.statLabel}>Time</Text><Text style={styles.statValue}>{formatTime(actualTime)}</Text></View>
                  <View style={styles.statRow}><Text style={styles.statLabel}>Items</Text><Text style={[styles.statValue, styles.bonusText]}>{itemsPerAction}</Text></View>
                  <View style={styles.statRow}><Text style={styles.statLabel}>XP</Text><Text style={styles.statValue}>{Math.max(1, Math.floor(avgXp))}</Text></View>
                  <View style={styles.statRow}><Text style={styles.statLabel}>Junk</Text><Text style={styles.statValue}>{effectiveJunk}%</Text></View>
                </View>

                <View style={styles.masteryRow}>
                  <Text style={styles.masteryText}>Mastery: {masteryPercentage.toFixed(1)}%</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <MasteryPerksModal
        visible={!!perksZone}
        onClose={() => setPerksZone(null)}
        itemName={perksZone?.name ?? ''}
        currentMasteryLevel={perksZone ? getMasteryLevel(`smuggling_${perksZone.id}`) : 0}
        isSmuggling
      />

      <DropsModal
        visible={!!dropsZone}
        onClose={() => setDropsZone(null)}
        zone={dropsZone}
        playerLevel={skill.level}
        effectiveJunk={(() => {
          const toolB = getSmugglingToolBonuses();
          const base = Math.max(0, Math.floor((dropsZone?.junkChance ?? 0) * (toolB.junkReductionMultiplier ?? 1)));
          return Math.max(0, base - (skill.agentUnlocked ? 15 : 0));
        })()}
      />

      <SmugglingToolsModal visible={toolsVisible} onClose={() => setToolsVisible(false)} />
    </>
  );
}

type DropsModalProps = { visible: boolean; onClose: () => void; zone: SmugglingZone | null; playerLevel: number; effectiveJunk: number };

function DropsModal({ visible, onClose, zone, playerLevel, effectiveJunk }: DropsModalProps) {
  if (!zone) return null;
  

  
  const all = zone.items
    .map((i, idx) => ({ ...i, index: idx }))
    .sort((a, b) => b.weight - a.weight);

  const totalAvailableWeight = all
    .filter((i) => !i.minLevel || playerLevel >= i.minLevel)
    .reduce((sum, i) => sum + i.weight, 0);

  const poolPercent = Math.max(0, 100 - effectiveJunk);

  const itemsPerRow = 2;
  const rows = [];
  for (let i = 0; i < all.length; i += itemsPerRow) {
    rows.push(all.slice(i, i + itemsPerRow));
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose} testID="drops-modal-backdrop">
        <TouchableOpacity style={styles.modalCard} activeOpacity={1} onPress={(e) => e.stopPropagation()} testID="drops-modal">
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleContainer}>
              <Package size={18} color="#E0B252" />
              <Text style={styles.modalTitle}>Drops — {zone.name}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} testID="drops-modal-close">
              <X size={18} color="#A8A097" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalSubContainer}>
            <View style={styles.statBadge}>
              <Text style={styles.statBadgeLabel}>Junk Chance</Text>
              <Text style={styles.statBadgeValue}>{effectiveJunk}%</Text>
            </View>
            <View style={styles.statBadge}>
              <Text style={styles.statBadgeLabel}>Your Level</Text>
              <Text style={styles.statBadgeValue}>{playerLevel}</Text>
            </View>
          </View>
          
          <View style={styles.modalList}>
            {rows.map((row, rowIndex) => (
              <View key={rowIndex} style={styles.dropRowContainer}>
                {row.map((item) => {
                  const locked = item.minLevel ? playerLevel < item.minLevel : false;
                  const percent = locked || totalAvailableWeight === 0
                    ? 0
                    : (item.weight / totalAvailableWeight) * poolPercent;
                  const percentText = `${percent.toFixed(1)}%`;
                  return (
                    <View key={`${zone.id}-${item.index}`} style={[styles.dropItem, locked && styles.dropItemLocked]} testID={`drop-${zone.id}-${item.index}`}>
                      <View style={styles.dropIconContainer}>
                        <Text style={styles.dropIcon}>{item.resource.icon}</Text>
                      </View>
                      <View style={styles.dropMain}>
                        <Text style={[styles.dropName, locked && styles.dropLockedText]} numberOfLines={1}>{item.resource.name}</Text>
                        <View style={styles.dropMetaRow}>
                          <View style={styles.dropChance}>
                            <Text style={[styles.dropChanceText, locked && styles.dropLockedMeta]}>{percentText}</Text>
                          </View>
                        </View>
                        {item.minLevel && (
                          <View style={[styles.levelBadge, locked && styles.levelBadgeLocked]}>
                            <Text style={[styles.levelBadgeText, locked && styles.levelBadgeTextLocked]}>LV {item.minLevel}+</Text>
                          </View>
                        )}
                      </View>

                    </View>
                  );
                })}
                {row.length === 1 && <View style={styles.dropItem} />}
              </View>
            ))}
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0E0C11',
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  cardContainer: {
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
  zoneCard: {
    backgroundColor: '#1D1922',
    borderRadius: 12,
    padding: 12,
    borderWidth: 2,
    borderColor: '#2A2531',
    marginBottom: 12,
  },
  activeCard: {
    borderColor: '#E0B252',
    backgroundColor: '#2A2531',
  },
  lockedCard: {
    opacity: 0.6,
  },
  zoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  zoneIconContainer: {
    width: 32,
    height: 32,
    backgroundColor: '#121016',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2C2733',
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoneInfo: { flex: 1, marginLeft: 8 },
  zoneName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#fff',
  },
  zoneLevel: {
    fontSize: 11,
    color: '#A8A097',
  },
  lockedText: {
    color: '#6F685F',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  },
  iconButtonText: {
    color: '#A8A097',
    fontSize: 12,
    fontWeight: '600',
  },
  zoneMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  activeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3DD68C',
  },
  activeText: {
    color: '#3DD68C',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  progressContainerTop: {
    height: 4,
    backgroundColor: '#0B0A0D',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#E0B252',
  },
  zoneStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statRow: { alignItems: 'center' },
  statLabel: { fontSize: 11, color: '#A8A097' },
  statValue: { fontSize: 13, color: '#fff', fontWeight: '700', marginTop: 2 },
  bonusText: { color: '#E0B252' },
  masteryRow: {
    borderTopWidth: 1,
    borderTopColor: '#2C2733',
    paddingTop: 8,
  },
  masteryText: { fontSize: 12, color: '#E0B252', fontWeight: '700' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#121016',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#221E29',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#221E29',
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: '700' 
  },
  closeBtn: { 
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#221E29',
  },
  modalSubContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#221E29',
  },
  statBadge: {
    backgroundColor: '#1D1922',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#2C2733',
    alignItems: 'center',
    flex: 1,
  },
  statBadgeLabel: {
    color: '#A8A097',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statBadgeValue: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 1,
  },
  modalList: { 
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dropRowContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  dropItem: {
    flex: 1,
    backgroundColor: '#1D1922',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2C2733',
    padding: 8,
    minHeight: 80,
    position: 'relative',
  },
  dropItemLocked: {
    opacity: 0.5,
  },

  dropIconContainer: {
    width: 32,
    height: 32,
    backgroundColor: '#121016',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#221E29',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 4,
  },
  dropIcon: { 
    fontSize: 16 
  },
  dropMain: { 
    flex: 1,
    alignItems: 'center',
  },
  dropName: { 
    color: '#fff', 
    fontSize: 12, 
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  dropLockedText: { 
    color: '#7A7269' 
  },
  dropMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    justifyContent: 'center',
    marginBottom: 2,
  },
  dropChance: {
    backgroundColor: '#E0B252',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  dropChanceText: {
    color: '#000',
    fontSize: 10,
    fontWeight: '700',
  },
  dropMeta: { 
    color: '#A8A097', 
    fontSize: 10,
    fontWeight: '500',
  },
  dropLockedMeta: {
    color: '#7A7269',
  },
  levelBadge: {
    backgroundColor: '#E0B252',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    alignSelf: 'center',
  },
  levelBadgeLocked: {
    backgroundColor: '#3E3648',
  },
  levelBadgeText: {
    color: '#000',
    fontSize: 9,
    fontWeight: '700',
  },
  levelBadgeTextLocked: {
    color: '#A8A097',
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
  managerHeader: {
    backgroundColor: 'rgba(184, 50, 58, 0.08)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'rgba(184, 50, 58, 0.3)',
    position: 'relative',
    overflow: 'hidden',
  },
  containerWithManager: {
    borderColor: '#B8323A',
    borderWidth: 2,
    shadowColor: '#B8323A',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
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
  managerBonuses: { marginTop: 8 },
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
});
