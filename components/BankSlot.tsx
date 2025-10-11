import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, useWindowDimensions, TouchableOpacity, Modal, Animated, TextInput, Platform, ScrollView, Image } from 'react-native';
import type { BankItem } from '@/types/game';
import { RESOURCES } from '@/constants/gameData';
import { useGameStore } from '@/store/gameStore';
import * as LucideIcons from 'lucide-react-native';
import { X } from 'lucide-react-native';
import { ResourceImage } from '@/components/ResourceImage';
import { formatCash } from '@/constants/numberFormat';

type Props = {
  slotIndex: number;
  item: BankItem | null;
  position: number;
  isSelected?: boolean;
  onTap?: (index: number) => void;
  isReorderMode?: boolean;
};



const SellModal: React.FC<{
  item: BankItem | null;
  resource: any;
  onClose: () => void;
  onSell: (amount: number) => void;
  onAssignTab?: (tabId: string) => void;
  itemIndex: number;
}> = ({ item, resource, onClose, onSell, onAssignTab, itemIndex }) => {
  const maxQuantity = Math.max(item?.quantity ?? 0, 1);
  const [sellAmount, setSellAmount] = useState<number>(Math.min(1, maxQuantity));
  const [inputValue, setInputValue] = useState<string>(Math.min(1, maxQuantity).toString());
  const [showTabMenu, setShowTabMenu] = useState<boolean>(false);
  const [showDrops, setShowDrops] = useState<boolean>(false);
  const [lootRewards, setLootRewards] = useState<{ items: { resourceId: string; quantity: number }[]; gold: number } | null>(null);
  const sellPrice = resource?.value ?? 1;
  const totalValue = sellAmount * sellPrice;
  const bankTabs = useGameStore(state => state.bankTabs);
  const activeBankTab = useGameStore(state => state.activeBankTab);
  const inputRef = useRef<TextInput>(null);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const sellTextAnim = useRef(new Animated.Value(0)).current;
  const sellTextY = useRef(new Animated.Value(0)).current;
  const [sellAnimText, setSellAnimText] = useState<string>('');
  
  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();
  }, []);
  
  // Check which tab this item is in
  const getItemTab = () => {
    for (const [tabId, tab] of Object.entries(bankTabs)) {
      if (tab.order.includes(itemIndex)) {
        return tabId;
      }
    }
    return null;
  };
  const itemTabId = getItemTab();

  const handleInputChange = (text: string) => {
    // Only allow numbers
    const cleanedText = text.replace(/[^0-9]/g, '');
    
    if (cleanedText === '') {
      setInputValue('');
      setSellAmount(1);
      return;
    }
    
    const num = parseInt(cleanedText, 10);
    if (!isNaN(num)) {
      if (num <= maxQuantity) {
        setSellAmount(num);
        setInputValue(cleanedText);
      } else {
        setSellAmount(maxQuantity);
        setInputValue(maxQuantity.toString());
      }
    }
  };
  
  const handleSell = (amount: number) => {
    // Show sell animation text
    setSellAnimText(`+${amount}`);
    
    // Animate the text floating up and fading
    sellTextAnim.setValue(0);
    sellTextY.setValue(0);
    
    Animated.parallel([
      Animated.timing(sellTextAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.sequence([
        Animated.delay(100),
        Animated.timing(sellTextAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]),
      Animated.timing(sellTextY, {
        toValue: -30,
        duration: 500,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start(() => {
      setSellAnimText('');
      onSell(amount);
      
      // Check if all items have been sold
      const remainingQuantity = (item?.quantity ?? 0) - amount;
      if (remainingQuantity <= 0) {
        // Close the modal if all items are sold
        onClose();
      } else {
        // Keep the modal open and reset to 1 for next sell
        setSellAmount(1);
        setInputValue('1');
      }
    });
  };

  return (
    <View 
      style={styles.modalOverlay}
      testID="sell-modal-overlay"
    >
      <TouchableOpacity style={StyleSheet.absoluteFill as any} activeOpacity={1} onPress={onClose} testID="sell-modal-backdrop" />
      <Animated.View 
        style={[
          styles.modalCard,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]} 
        testID="sell-modal-card"
        onStartShouldSetResponder={() => true}
        onTouchEnd={(e) => e.stopPropagation()}
      >
        <View style={styles.modalHeaderRow}>
          <Text style={styles.modalTitle}>
            {resource ? `Sell ${resource.name}` : 'Sell'}
          </Text>
          <TouchableOpacity onPress={onClose} accessibilityLabel="Close" testID="sell-modal-close">
            <X size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
        
        <View style={[
          styles.itemDisplay,
          itemTabId && styles.itemDisplayWithTab
        ]}>
          <ResourceImage resource={resource} size={28} testID="sell-modal-resource-image" />
          <Text style={styles.itemDisplayName}>{resource?.name}</Text>
          {itemTabId && (
            <View style={styles.tabIndicator}>
              {(() => {
                const iconName = bankTabs[itemTabId]?.icon ?? '';
                const IconComponent = iconName ? (LucideIcons as any)[iconName] : null;
                if (IconComponent) {
                  return <IconComponent size={14} color="#ffffff" />;
                }
                return <Text style={styles.tabIndicatorText}>📁</Text>;
              })()}
            </View>
          )}
          {sellAnimText !== '' && (
            <Animated.View
              style={[
                styles.sellAnimContainer,
                {
                  opacity: sellTextAnim,
                  transform: [{ translateY: sellTextY }],
                },
              ]}
              pointerEvents="none"
            >
              <Text style={styles.sellAnimText}>{sellAnimText}</Text>
            </Animated.View>
          )}
        </View>

        {resource?.description && (
          <View style={styles.descriptionSection}>
            <Text style={styles.descriptionText}>{resource.description}</Text>
          </View>
        )}

        {(() => {
          const EQUIPPABLE_IDS = new Set([
            'iron_dagger','wooden_shield','leather_cap','leather_vest','leather_pants','leather_boots','simple_ring','street_amulet'
          ]);
          const isEquippable = Boolean(item?.resourceId && EQUIPPABLE_IDS.has(item.resourceId));
          if (!isEquippable) return null;
          const catalog = (require('@/constants/gameData') as any).EQUIPMENT_CATALOG;
          const defItem = item?.resourceId ? catalog?.[item.resourceId] : undefined;
          const aps = typeof defItem?.attackSpeed === 'number' ? defItem.attackSpeed : undefined;
          const stats = defItem?.stats ?? {};
          return (
            <View style={styles.equipStatsCard}>
              <Text style={styles.equipStatsTitle}>Equipment Stats</Text>
              <View style={styles.equipStatsRow}>
                {'attack' in stats && (<Text style={styles.equipStat}>ATK +{stats.attack}</Text>)}
                {'defense' in stats && (<Text style={styles.equipStat}>DEF +{stats.defense}</Text>)}
                {'accuracy' in stats && (<Text style={styles.equipStat}>ACC +{stats.accuracy}</Text>)}
                {'evasion' in stats && (<Text style={styles.equipStat}>EVA +{stats.evasion}</Text>)}
                {'critChance' in stats && (<Text style={styles.equipStat}>CRIT +{stats.critChance}%</Text>)}
                {aps != null && (<Text style={styles.equipStat}>APS {aps}</Text>)}
              </View>
            </View>
          );
        })()}

        <View style={styles.quantitySection}>
          <Text style={styles.quantityLabel}>Amount to sell:</Text>
          <View style={styles.quantityInputRow}>
            <TouchableOpacity
              style={styles.quantityInputWrapper}
              onPress={() => inputRef.current?.focus()}
              activeOpacity={1}
            >
              <TextInput
                ref={inputRef}
                style={styles.quantityInput}
                value={inputValue}
                onChangeText={handleInputChange}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor="#6b7280"
                maxLength={10}
                selectTextOnFocus
                returnKeyType="done"
                autoCorrect={false}
                onFocus={() => {
                  if (Platform.OS !== 'web') {
                    setTimeout(() => {
                      inputRef.current?.setSelection?.(0, inputValue.length);
                    }, 50);
                  }
                }}
              />
            </TouchableOpacity>
            <Text style={styles.quantityMax}>/ {maxQuantity}</Text>
          </View>
        </View>

        <View style={styles.priceInfo}>
          <Text style={styles.priceText}>Price per item: {formatCash(sellPrice)} gp</Text>
          <Text style={styles.totalText}>Total: {formatCash(totalValue)} gp</Text>
        </View>

        <View style={styles.quickButtons}>
          <TouchableOpacity
            style={styles.quickButton}
            onPress={() => {
              setSellAmount(1);
              setInputValue('1');
            }}
          >
            <Text style={styles.quickButtonText}>1</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickButton}
            onPress={() => {
              const half = Math.floor(maxQuantity / 2);
              setSellAmount(half);
              setInputValue(half.toString());
            }}
          >
            <Text style={styles.quickButtonText}>50%</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickButton}
            onPress={() => {
              setSellAmount(maxQuantity);
              setInputValue(maxQuantity.toString());
            }}
          >
            <Text style={styles.quickButtonText}>All</Text>
          </TouchableOpacity>
        </View>

        {item?.resourceId === 'loot_bag' && (
          <TouchableOpacity
            style={[styles.modalButton, { backgroundColor: 'rgba(251, 191, 36, 0.15)', borderColor: '#fbbf24', marginBottom: 12 }]}
            onPress={() => setShowDrops(true)}
            testID="view-drops-button"
          >
            <Text style={styles.modalButtonText}>View Possible Drops</Text>
          </TouchableOpacity>
        )}

        <View style={styles.modalActions}>
          <TouchableOpacity
            style={[
              styles.modalButton, 
              styles.sellButton
            ]}
            onPress={() => handleSell(sellAmount)}
            testID="sell-button"
          >
            <Text style={styles.modalButtonText}>
              {`Sell ${sellAmount}`}
            </Text>
          </TouchableOpacity>

          {(() => {
            const EQUIPPABLE_IDS = new Set([
              'iron_dagger','wooden_shield','leather_cap','leather_vest','leather_pants','leather_boots','simple_ring','street_amulet'
            ]);
            const isEquippable = Boolean(item?.resourceId && EQUIPPABLE_IDS.has(item.resourceId));
            if (!isEquippable) return null;
            const equipFromBank = useGameStore.getState().equipFromBank;
            return (
              <TouchableOpacity
                style={[styles.modalButton, styles.assignTabButton]}
                onPress={() => {
                  if (item?.resourceId) {
                    equipFromBank(item.resourceId);
                    onClose();
                  }
                }}
                testID="equip-item-button"
              >
                <Text style={styles.modalButtonText}>Equip</Text>
              </TouchableOpacity>
            );
          })()}
          {item?.resourceId === 'loot_bag' && (
            <>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderColor: '#10b981' }]}
                onPress={() => {
                  const openLootBag = useGameStore.getState().openLootBag;
                  const rewards = openLootBag();
                  if (rewards) {
                    setLootRewards(rewards);
                  }
                }}
                testID="open-loot-bag-button"
              >
                <Text style={styles.modalButtonText}>Open</Text>
              </TouchableOpacity>
              {(item?.quantity ?? 0) > 1 && (
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderColor: '#10b981' }]}
                  onPress={() => {
                    const openAllLootBags = useGameStore.getState().openAllLootBags;
                    const rewardsAll = openAllLootBags();
                    if (rewardsAll) {
                      setLootRewards(rewardsAll);
                    }
                  }}
                  testID="open-all-loot-bags-button"
                >
                  <Text style={styles.modalButtonText}>Open All</Text>
                </TouchableOpacity>
              )}
            </>
          )}
          {onAssignTab && (
            <TouchableOpacity
              style={[styles.modalButton, styles.assignTabButton]}
              onPress={() => setShowTabMenu(true)}
            >
              <Text style={styles.modalButtonText}>Assign Tab</Text>
            </TouchableOpacity>
          )}
        </View>

        {lootRewards && (
          <View style={styles.tabMenuOverlay}>
            <TouchableOpacity style={StyleSheet.absoluteFill as any} activeOpacity={1} onPress={() => { setLootRewards(null); onClose(); }} />
            <View style={[styles.tabMenu, { maxHeight: '90%', width: '90%', maxWidth: 420 }]}>
              <Text style={styles.tabMenuTitle}>🎉 Loot Received!</Text>
              <View style={{ gap: 8 }}>
                <View style={styles.dropItem}>
                  <Text style={styles.dropIcon}>💰</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.dropName}>Gold</Text>
                    <Text style={styles.dropChance}>+{lootRewards.gold} gp</Text>
                  </View>
                </View>
                {lootRewards.items.map((item, idx) => {
                  const res = RESOURCES[item.resourceId];
                  return (
                    <View key={`${item.resourceId}-${idx}`} style={styles.dropItem}>
                      <Text style={styles.dropIcon}>{res?.icon ?? '❓'}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.dropName}>{res?.name ?? item.resourceId}</Text>
                        <Text style={styles.dropChance}>x{item.quantity}</Text>
                      </View>
                    </View>
                  );
                })}
                {lootRewards.items.length === 0 && (
                  <Text style={{ color: '#9ca3af', textAlign: 'center', marginVertical: 12 }}>No items this time, better luck next bag!</Text>
                )}
              </View>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton, { marginTop: 12 }]}
                onPress={() => { setLootRewards(null); onClose(); }}
              >
                <Text style={styles.modalButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {showDrops && (
          <View style={styles.tabMenuOverlay}>
            <TouchableOpacity style={StyleSheet.absoluteFill as any} activeOpacity={1} onPress={() => setShowDrops(false)} />
            <View style={[styles.tabMenu, { maxHeight: '90%', width: '90%', maxWidth: 420 }]}>
              <Text style={styles.tabMenuTitle}>Possible Drops</Text>
              <View style={{ gap: 8 }}>
                <View style={styles.dropItem}>
                  <Text style={styles.dropIcon}>🗡️</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.dropName}>Iron Dagger</Text>
                    <Text style={styles.dropChance}>Common (15%)</Text>
                  </View>
                </View>
                <View style={styles.dropItem}>
                  <Text style={styles.dropIcon}>🛡️</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.dropName}>Wooden Shield</Text>
                    <Text style={styles.dropChance}>Common (15%)</Text>
                  </View>
                </View>
                <View style={styles.dropItem}>
                  <Text style={styles.dropIcon}>🪖</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.dropName}>Leather Cap</Text>
                    <Text style={styles.dropChance}>Common (12%)</Text>
                  </View>
                </View>
                <View style={styles.dropItem}>
                  <Text style={styles.dropIcon}>🥋</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.dropName}>Leather Vest</Text>
                    <Text style={styles.dropChance}>Common (12%)</Text>
                  </View>
                </View>
                <View style={styles.dropItem}>
                  <Text style={styles.dropIcon}>👖</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.dropName}>Leather Pants</Text>
                    <Text style={styles.dropChance}>Common (10%)</Text>
                  </View>
                </View>
                <View style={styles.dropItem}>
                  <Text style={styles.dropIcon}>🥾</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.dropName}>Leather Boots</Text>
                    <Text style={styles.dropChance}>Common (10%)</Text>
                  </View>
                </View>
                <View style={styles.dropItem}>
                  <Text style={styles.dropIcon}>💍</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.dropName}>Simple Ring</Text>
                    <Text style={styles.dropChance}>Uncommon (8%)</Text>
                  </View>
                </View>
                <View style={styles.dropItem}>
                  <Text style={styles.dropIcon}>📿</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.dropName}>Street Amulet</Text>
                    <Text style={styles.dropChance}>Uncommon (8%)</Text>
                  </View>
                </View>
                <View style={styles.dropItem}>
                  <Text style={styles.dropIcon}>💰</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.dropName}>Gold (50-150)</Text>
                    <Text style={styles.dropChance}>Guaranteed (100%)</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton, { marginTop: 12 }]}
                onPress={() => setShowDrops(false)}
              >
                <Text style={styles.modalButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {showTabMenu && (
          <View style={styles.tabMenuOverlay}>
            <TouchableOpacity style={StyleSheet.absoluteFill as any} activeOpacity={1} onPress={() => setShowTabMenu(false)} />
            <View style={styles.tabMenu}>
              <Text style={styles.tabMenuTitle}>Select Tab</Text>
              {Object.entries(bankTabs).map(([tabId, tab]) => (
                <TouchableOpacity
                  key={tabId}
                  style={[
                    styles.tabMenuItem,
                    activeBankTab === tabId && styles.tabMenuItemActive,
                    itemTabId === tabId && styles.tabMenuItemAssigned
                  ]}
                  onPress={() => {
                    onAssignTab?.(tabId);
                    setShowTabMenu(false);
                  }}
                >
                  <View style={styles.tabMenuItemRow}>
                    {(() => {
                      const iconName = tab.icon ?? '';
                      const IconComponent = iconName ? (LucideIcons as any)[iconName] : null;
                      if (IconComponent) {
                        return <IconComponent size={16} color="#ffffff" />;
                      }
                      return <Text>📁</Text>;
                    })()}
                    <Text style={styles.tabMenuItemText}>{tab.name}</Text>
                  </View>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowTabMenu(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Animated.View>
    </View>
  );
};

export const BankSlot: React.FC<Props> = ({ slotIndex, item, position, isSelected, onTap, isReorderMode = false }) => {
  const { width: screenWidth } = useWindowDimensions();
  const SLOT_SIZE = Math.floor((screenWidth - 48 - 7 * 8) / 8);
  const [showSell, setShowSell] = useState<boolean>(false);
  const resource = item ? RESOURCES[item.resourceId] : null;
  const sellItem = useGameStore(state => state.sellItem);
  const assignToTab = useGameStore(state => state.assignToTab);
  const activeBankTab = useGameStore(state => state.activeBankTab);
  const hasItem = Boolean(item && (item.quantity ?? 0) > 0);

  // Change detection for add/remove animations
  const prevItemRef = useRef<BankItem | null>(item ?? null);
  const [changeText, setChangeText] = useState<string>('');
  const [changeColor, setChangeColor] = useState<string>('#10b981');
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const badgeOpacity = useRef(new Animated.Value(0)).current;
  const badgeTranslateY = useRef(new Animated.Value(0)).current;
  const lastAnimationTime = useRef<number>(0);
  const activeAnimId = useRef<number>(0);
  const lastGroupedAt = useGameStore(state => (state as any).lastGroupedAt as number | undefined);

  useEffect(() => {
    // Don't trigger animations during reorder mode
    if (isReorderMode) {
      prevItemRef.current = item ?? null;
      return;
    }

    const prev = prevItemRef.current;
    const curr = item ?? null;
    let delta = 0;
    let shouldAnimate = false;
    const now = Date.now();
    const justGrouped = typeof lastGroupedAt === 'number' && (now - lastGroupedAt) < 800;

    if (prev && curr && prev.resourceId === curr.resourceId) {
      // Same item type - only animate if quantity actually changed
      delta = (curr.quantity ?? 0) - (prev.quantity ?? 0);
      shouldAnimate = delta !== 0;
    } else if (!prev && curr) {
      // New item appeared - animate only for genuine additions, not for recent auto-group reflow
      delta = curr.quantity ?? 0;
      shouldAnimate = !justGrouped && (now - lastAnimationTime.current) > 200;
    } else if (prev && !curr) {
      // Item disappeared - don't animate to prevent false positives from reordering
      delta = -(prev.quantity ?? 0);
      shouldAnimate = false;
    } else if (prev && curr && prev.resourceId !== curr.resourceId) {
      // Different item type in same slot - this is from reordering, don't animate
      shouldAnimate = false;
    }

    if (shouldAnimate && delta !== 0) {
      const positive = delta > 0;
      setChangeText(`${positive ? '+' : ''}${delta}`);
      setChangeColor(positive ? '#10b981' : '#ef4444');
      lastAnimationTime.current = now;

      // Bump animation id to invalidate previous completions
      const myId = activeAnimId.current + 1;
      activeAnimId.current = myId;

      pulseAnim.setValue(0);
      badgeOpacity.setValue(0);
      badgeTranslateY.setValue(0);

      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1, duration: 180, useNativeDriver: Platform.OS !== 'web' }),
          Animated.timing(pulseAnim, { toValue: 0, duration: 320, useNativeDriver: Platform.OS !== 'web' }),
        ]),
        Animated.sequence([
          Animated.timing(badgeOpacity, { toValue: 1, duration: 120, useNativeDriver: Platform.OS !== 'web' }),
          Animated.timing(badgeTranslateY, { toValue: -12, duration: 450, useNativeDriver: Platform.OS !== 'web' }),
          Animated.timing(badgeOpacity, { toValue: 0, duration: 220, delay: 80, useNativeDriver: Platform.OS !== 'web' }),
        ]),
      ]).start(() => {
        if (activeAnimId.current === myId) {
          setChangeText('');
        }
      });
    }

    prevItemRef.current = curr;
  }, [item?.resourceId, item?.quantity, isReorderMode, lastGroupedAt]);

  const handleLongPress = () => {
    console.log(`Long press triggered on slot ${slotIndex}, hasItem: ${hasItem}`);
    if (!hasItem || !item || !resource) {
      console.log('Long press ignored - no item in slot');
      return;
    }
    setShowSell(true);
  };

  const handlePress = () => {
    console.log(`Short press triggered on slot ${slotIndex}, hasItem: ${hasItem}, isReorderMode: ${isReorderMode}`);
    
    if (isReorderMode) {
      // In reorder mode, only handle the reorder logic
      console.log(`Reorder mode: calling onTap for slot ${slotIndex}`);
      onTap?.(slotIndex);
    } else if (hasItem) {
      // Normal mode: open sell menu
      console.log(`Opening sell menu for slot ${slotIndex} via single tap`);
      setShowSell(true);
    } else {
      console.log('Tap ignored - no item in slot');
    }
  };

  const sellPrice = resource?.value ?? 1;

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={handlePress}
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        style={[
          styles.slot,
          { width: SLOT_SIZE, height: SLOT_SIZE },
          hasItem ? styles.slotWithItem : styles.emptySlot,
          isSelected && styles.selectedSlot,
        ]}
        testID={`bank-slot-${slotIndex}`}
      >
        {hasItem && resource ? (
          <View style={styles.itemContainer}>
            <ResourceImage resource={resource} size={24} testID={`bank-slot-${slotIndex}-image`} />
            <Text style={styles.itemQuantity}>{formatCash(item?.quantity ?? 0)}</Text>
          </View>
        ) : null}

        <Animated.View
          pointerEvents="none"
          style={[
            styles.pulseOverlay,
            {
              opacity: pulseAnim,
              borderColor: changeColor,
              transform: [{ scale: Animated.add(1, Animated.multiply(pulseAnim, 0.06)) }],
            },
          ]}
          testID={`bank-slot-${slotIndex}-pulse`}
        />

        {changeText !== '' && (
          <Animated.View
            style={[
              styles.changeBadge,
              {
                opacity: badgeOpacity,
                transform: [{ translateY: badgeTranslateY }],
                borderColor: changeColor,
                backgroundColor: 'rgba(0,0,0,0.6)',
              },
            ]}
            testID={`bank-slot-${slotIndex}-change-badge`}
          >
            <Text style={[styles.changeBadgeText, { color: changeColor }]}>{changeText}</Text>
          </Animated.View>
        )}
      </TouchableOpacity>

      <Modal
        visible={showSell}
        transparent
        animationType="none"
        onRequestClose={() => setShowSell(false)}
        statusBarTranslucent
      >
        <SellModal
          item={item}
          resource={resource}
          itemIndex={slotIndex}
          onClose={() => setShowSell(false)}
          onAssignTab={activeBankTab === 'all' ? (tabId) => {
            if (item) {
              assignToTab(slotIndex, tabId);
            }
          } : undefined}
          onSell={(amount) => {
            if (item && resource && amount > 0 && amount <= (item.quantity ?? 0)) {
              console.log(`Selling ${amount} ${resource.name} for ${amount * sellPrice} gp`);
              try {
                sellItem(item.resourceId, amount);
              } catch (error) {
                console.error('Error selling item:', error);
              }
            } else {
              console.error('Invalid sell amount or missing item/resource');
            }
          }}
        />
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  slot: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 4,
  },
  slotWithItem: {
    borderWidth: 1,
    borderColor: '#2a2a3e',
    backgroundColor: '#1a1a2e',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  emptySlot: {
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.15)',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderStyle: 'solid' as const,
  },
  selectedSlot: {
    borderWidth: 2,
    borderColor: '#10b981',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  itemContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    width: '100%',
    height: '100%',
  },
  itemIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  itemQuantity: {
    position: 'absolute',
    bottom: 2,
    right: 4,
    fontSize: 10,
    fontWeight: 'bold' as const,
    color: '#fff',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderRadius: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '90%',
    maxWidth: 380,
    backgroundColor: '#0f0f23',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#2a2a3e',
  },
  modalHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700' as const,
    textAlign: 'center',
  },
  itemDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    position: 'relative',
  },
  itemDisplayWithTab: {
    borderWidth: 2,
    borderColor: '#10b981',
  },
  animatedIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemDisplayIcon: {
    fontSize: 28,
  },
  itemDisplayName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  quantitySection: {
    marginBottom: 16,
  },
  quantityLabel: {
    color: '#9ca3af',
    fontSize: 14,
    marginBottom: 8,
  },
  quantityInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quantityInputWrapper: {
    flex: 1,
  },
  quantityInput: {
    backgroundColor: '#1a1a2e',
    borderWidth: 1,
    borderColor: '#2a2a3e',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  quantityMax: {
    color: '#6b7280',
    fontSize: 14,
  },
  tabIndicator: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#10b981',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIndicatorText: {
    fontSize: 12,
  },
  priceInfo: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  priceText: {
    color: '#9ca3af',
    fontSize: 13,
    marginBottom: 4,
  },
  totalText: {
    color: '#10b981',
    fontSize: 16,
    fontWeight: '700' as const,
  },
  quickButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  quickButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a3e',
  },
  quickButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600' as const,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  sellButton: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#10b981',
  },

  cancelButton: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: '#374151',
  },
  equipStatsCard: { backgroundColor: '#111827', borderRadius: 10, borderWidth: 1, borderColor: '#1f2937', padding: 12, marginBottom: 12 },
  equipStatsTitle: { color: '#e5e7eb', fontWeight: '700' as const, marginBottom: 6, textAlign: 'center' },
  equipStatsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  equipStat: { color: '#9ca3af', fontSize: 12 },
  pulseOverlay: {
    ...StyleSheet.absoluteFillObject as any,
    borderWidth: 2,
    borderRadius: 8,
  },
  changeBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  changeBadgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600' as const,
  },
  assignTabButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderColor: '#3b82f6',
  },
  tabMenuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabMenu: {
    backgroundColor: '#0f0f23',
    borderRadius: 12,
    padding: 16,
    width: '80%',
    maxWidth: 300,
    borderWidth: 1,
    borderColor: '#2a2a3e',
  },
  tabMenuTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 16,
    textAlign: 'center',
  },
  tabMenuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#2a2a3e',
  },
  tabMenuItemActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#10b981',
  },
  tabMenuItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tabMenuItemText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500' as const,
  },
  tabMenuItemAssigned: {
    borderColor: '#10b981',
    borderWidth: 2,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  sellAnimContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -20,
    marginTop: -10,
  },
  sellAnimText: {
    color: '#10b981',
    fontSize: 24,
    fontWeight: 'bold' as const,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  descriptionSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  descriptionText: {
    color: '#d1d5db',
    fontSize: 13,
    lineHeight: 18,
    fontStyle: 'italic' as const,
    textAlign: 'center',
  },
  dropItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#2a2a3e',
  },
  dropIcon: {
    fontSize: 24,
  },
  dropName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  dropChance: {
    color: '#9ca3af',
    fontSize: 12,
  },
});
