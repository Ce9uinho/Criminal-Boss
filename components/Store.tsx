import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Animated,
} from 'react-native';
import { STORE_ITEMS, RESOURCES } from '@/constants/gameData';
import { useGameStore } from '@/store/gameStore';
import { Plus, Minus, ShoppingCart, Crown, CreditCard, Coins, Bitcoin, X } from 'lucide-react-native';

interface StoreProps {
  targetResourceId?: string;
}

type StoreTab = 'materials' | 'upgrades' | 'premium';

import { formatCash } from '@/constants/numberFormat';

export function Store({ targetResourceId }: StoreProps) {
  const { gold, premiumCurrency, addPremium, spendPremium, buyItem, bank, maxBankSlots, addBankSlotWithGold, grantBankSlot, adsWatched, adsGoal, watchAd } = useGameStore();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [tab, setTab] = useState<StoreTab>('materials');
  const [popupVisible, setPopupVisible] = useState<boolean>(false);
  const [popupMessage, setPopupMessage] = useState<string>('');
  const [adPopupVisible, setAdPopupVisible] = useState<boolean>(false);
  const [adAwarded, setAdAwarded] = useState<string[]>([]);
  const [adPremiumDelta, setAdPremiumDelta] = useState<number>(0);
  const [adProgress, setAdProgress] = useState<{ watched: number; goal: number } | null>(null);
  const popupOpacity = useRef(new Animated.Value(0)).current;
  const [pendingPremiumIncrease, setPendingPremiumIncrease] = useState<number>(0);
  const expectedPremiumRef = useRef<number | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const itemRefs = useRef<Record<string, any>>({});
  const itemPositions = useRef<Record<string, number>>({});
  const highlightAnimation = useRef(new Animated.Value(0)).current;
  const PREMIUM_SLOT_PRICE = 100000;
  const PREMIUM_SLOT_GEMS = 5;

  const getQuantity = (resourceId: string) => quantities[resourceId] || 1;

  const setQuantity = (resourceId: string, quantity: number) => {
    setQuantities(prev => ({
      ...prev,
      [resourceId]: Math.max(1, quantity)
    }));
  };

  const handleBuy = (resourceId: string, price: number) => {
    const quantity = getQuantity(resourceId);
    const totalCost = price * quantity;
    
    if (gold < totalCost) {
      Alert.alert('Not Enough Gold', `You need ${totalCost} but only have ${gold}`);
      return;
    }
    
    buyItem(resourceId, quantity, price);
    Alert.alert('Purchase Successful', `Bought ${quantity}x ${RESOURCES[resourceId]?.name} for ${totalCost}`);
  };

  const getBankQuantity = (resourceId: string) => {
    return bank[resourceId]?.quantity || 0;
  };

  const handleItemLayout = (resourceId: string, event: any) => {
    const { y } = event.nativeEvent.layout;
    itemPositions.current[resourceId] = y;
  };

  // Scroll to target item when it's set
  useEffect(() => {
    if (targetResourceId && scrollViewRef.current) {
      console.log('Auto-scrolling to target resource:', targetResourceId);
      
      const performScroll = () => {
        // First try to use stored positions
        const targetPosition = itemPositions.current[targetResourceId];
        if (targetPosition !== undefined && targetPosition > 0) {
          console.log('Using stored position:', targetPosition);
          scrollViewRef.current?.scrollTo({ 
            y: Math.max(0, targetPosition - 100),
            animated: true 
          });
          
          // Start highlight animation
          highlightAnimation.setValue(0);
          Animated.sequence([
            Animated.timing(highlightAnimation, {
              toValue: 1,
              duration: 500,
              useNativeDriver: false,
            }),
            Animated.delay(2000),
            Animated.timing(highlightAnimation, {
              toValue: 0,
              duration: 500,
              useNativeDriver: false,
            }),
          ]).start();
          return true;
        }
        
        return false;
      };
      
      // Try multiple times with increasing delays to ensure layout is complete
      const attempts = [200, 500, 1000, 1500, 2000];
      let attemptIndex = 0;
      
      const tryScroll = () => {
        if (performScroll()) {
          return;
        }
        
        // Try again with next delay if available
        if (attemptIndex < attempts.length - 1) {
          attemptIndex++;
          setTimeout(tryScroll, attempts[attemptIndex]);
        } else {
          // Final fallback: scroll to end and then try to find the item
          console.log('Using fallback scroll method');
          scrollViewRef.current?.scrollToEnd({ animated: false });
          
          setTimeout(() => {
            const targetPosition = itemPositions.current[targetResourceId];
            if (targetPosition !== undefined && targetPosition > 0) {
              console.log('Found position after scrollToEnd:', targetPosition);
              scrollViewRef.current?.scrollTo({ 
                y: Math.max(0, targetPosition - 100),
                animated: true 
              });
              
              // Start highlight animation
              highlightAnimation.setValue(0);
              Animated.sequence([
                Animated.timing(highlightAnimation, {
                  toValue: 1,
                  duration: 500,
                  useNativeDriver: false,
                }),
                Animated.delay(2000),
                Animated.timing(highlightAnimation, {
                  toValue: 0,
                  duration: 500,
                  useNativeDriver: false,
                }),
              ]).start();
            }
          }, 300);
        }
      };
      
      // Start first attempt
      setTimeout(tryScroll, attempts[0]);
    }
  }, [targetResourceId, highlightAnimation]);

  const showThankYouPopup = (amount: number) => {
    try {
      setPopupMessage(
        `Thank you. The family appreciates your generosity. Consider it a small tribute to keep the lights on and the gears turning. ${amount} CBcoin just found a cozy spot in your wallet — spend it wisely, capisce?`
      );
      setPopupVisible(true);
      popupOpacity.setValue(0);
      Animated.timing(popupOpacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    } catch (e) {
      console.log('Failed to show thank you popup', e);
    }
  };

  useEffect(() => {
    if (pendingPremiumIncrease > 0 && expectedPremiumRef.current != null) {
      if ((premiumCurrency ?? 0) >= expectedPremiumRef.current) {
        showThankYouPopup(pendingPremiumIncrease);
        setPendingPremiumIncrease(0);
        expectedPremiumRef.current = null;
      }
    }
  }, [premiumCurrency, pendingPremiumIncrease]);

  return (
    <ScrollView 
      ref={scrollViewRef}
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <ShoppingCart size={32} color="#E0B252" />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Black Market Store</Text>
            <Text style={styles.headerSubtitle}>Buy materials, upgrades, and CBcoin</Text>
          </View>
          <View style={styles.walletRow}>
            <View style={styles.walletPill} testID="wallet-gold">
              <Coins size={14} color="#E0B252" />
              <Text style={styles.walletText}>${formatCash(gold)}</Text>
            </View>
            <View style={[styles.walletPill, styles.walletPillPremium]} testID="wallet-cbcoin">
              <Bitcoin size={14} color="#fff" />
              <Text style={styles.walletText}>{formatCash(premiumCurrency ?? 0)} CBcoin</Text>
            </View>
          </View>
        </View>

        <View style={styles.tabsRow}>
          <TouchableOpacity onPress={() => setTab('materials')} style={[styles.tabBtn, tab === 'materials' && styles.tabBtnActive]} testID="tab-materials">
            <Text style={[styles.tabText, tab === 'materials' && styles.tabTextActive]}>Materials</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setTab('upgrades')} style={[styles.tabBtn, tab === 'upgrades' && styles.tabBtnActive]} testID="tab-upgrades">
            <Text style={[styles.tabText, tab === 'upgrades' && styles.tabTextActive]}>Upgrades</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setTab('premium')} style={[styles.tabBtn, tab === 'premium' && styles.tabBtnActive]} testID="tab-premium">
            <Text style={[styles.tabText, tab === 'premium' && styles.tabTextActive]}>Premium</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.itemsContainer}>
        {tab === 'materials' && (
          <>
            <Text style={styles.sectionTitle}>Basic Materials</Text>
            {STORE_ITEMS.filter(item => item.price <= 10).map((item) => {
          const resource = RESOURCES[item.resourceId];
          const quantity = getQuantity(item.resourceId);
          const totalCost = item.price * quantity;
          const bankQty = getBankQuantity(item.resourceId);
          
          const isHighlighted = targetResourceId === item.resourceId;
          
          return (
            <Animated.View 
              key={item.resourceId} 
              ref={(ref: any) => { itemRefs.current[item.resourceId] = ref; }}
              onLayout={(event) => handleItemLayout(item.resourceId, event)}
              style={[
                styles.itemCard,
                isHighlighted && {
                  borderColor: highlightAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['#2C2733', '#E0B252'],
                  }),
                  borderWidth: highlightAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 3],
                  }),
                  backgroundColor: highlightAnimation.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: ['#18151D', '#3E3648', '#18151D'],
                  }),
                }
              ]}
            >
              <View style={styles.itemHeader}>
                <Text style={styles.itemIcon}>{resource?.icon}</Text>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{resource?.name}</Text>
                  <Text style={styles.itemPrice}>${formatCash(item.price)} each</Text>
                  <Text style={styles.bankQuantity}>In Bank: {formatCash(bankQty)}</Text>
                  {resource?.description && (
                    <Text style={styles.itemDescription}>{resource.description}</Text>
                  )}
                </View>
              </View>
              
              <View style={styles.purchaseControls}>
                <View style={styles.quantitySection}>
                  <View style={styles.quantityControls}>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => setQuantity(item.resourceId, quantity - 1)}
                    >
                      <Minus size={16} color="#fff" />
                    </TouchableOpacity>
                    
                    <TextInput
                      style={styles.quantityInput}
                      value={quantity.toString()}
                      onChangeText={(text) => {
                        const num = parseInt(text) || 1;
                        setQuantity(item.resourceId, num);
                      }}
                      keyboardType="numeric"
                      selectTextOnFocus
                    />
                    
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => setQuantity(item.resourceId, quantity + 1)}
                    >
                      <Plus size={16} color="#fff" />
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.quickButtons}>
                    <TouchableOpacity
                      style={styles.quickButton}
                      onPress={() => setQuantity(item.resourceId, quantity + 10)}
                    >
                      <Text style={styles.quickButtonText}>+10</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.quickButton}
                      onPress={() => setQuantity(item.resourceId, quantity + 100)}
                    >
                      <Text style={styles.quickButtonText}>+100</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.quickButton}
                      onPress={() => setQuantity(item.resourceId, quantity + 1000)}
                    >
                      <Text style={styles.quickButtonText}>+1000</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                
                <TouchableOpacity
                  style={[
                    styles.buyButton,
                    gold < totalCost && styles.buyButtonDisabled
                  ]}
                  onPress={() => handleBuy(item.resourceId, item.price)}
                  disabled={gold < totalCost}
                >
                  <Text style={[
                    styles.buyButtonText,
                    gold < totalCost && styles.buyButtonTextDisabled
                  ]}>
                    Buy ${formatCash(totalCost)}
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          );
        })}
          </>
        )}

        {tab === 'upgrades' && (
          <>
            <Text style={styles.sectionTitle}>Upgrades</Text>
            <View style={[styles.itemCard, { borderColor: '#a855f7' }]} testID="premium-bank-slot-card">
              <View style={styles.itemHeader}>
                <Text style={styles.itemIcon}>💼</Text>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>+1 Bank Slot</Text>
                  <Text style={[styles.itemPrice, { color: '#a855f7' }]}>Expand capacity. Current: {maxBankSlots}</Text>
                  <Text style={styles.itemDescription}>Buy with gold or CBcoin.</Text>
                </View>
              </View>

              <View style={styles.premiumActionsRow}>
                <TouchableOpacity
                  style={[styles.premiumButton, styles.goldButton]}
                  onPress={() => {
                    const canAfford = gold >= PREMIUM_SLOT_PRICE;
                    if (!canAfford) {
                      Alert.alert('Not Enough Gold', `Requires ${PREMIUM_SLOT_PRICE.toLocaleString()} gold.`);
                      return;
                    }
                    Alert.alert(
                      'Confirm Purchase',
                      `Spend ${PREMIUM_SLOT_PRICE.toLocaleString()} gold for +1 bank slot?`,
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Buy', style: 'default', onPress: () => addBankSlotWithGold(PREMIUM_SLOT_PRICE) }
                      ]
                    );
                  }}
                  testID="buy-slot-gold"
                >
                  <Coins size={16} color="#000" />
                  <Text style={styles.premiumButtonText}>Buy ${formatCash(PREMIUM_SLOT_PRICE)}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.premiumButton, styles.realMoneyButton]}
                  onPress={() => {
                    if (!spendPremium(PREMIUM_SLOT_GEMS)) {
                      Alert.alert('Not Enough CBcoin', `Requires ${PREMIUM_SLOT_GEMS} CBcoin.`);
                      return;
                    }
                    grantBankSlot();
                    Alert.alert('Success', 'Bank capacity increased by 1.');
                  }}
                  testID="buy-slot-premium"
                >
                  <Bitcoin size={16} color="#fff" />
                  <Text style={styles.premiumButtonTextAlt}>Spend {PREMIUM_SLOT_GEMS} CBcoin</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}

        {tab === 'premium' && (
          <>
            <Text style={styles.sectionTitle}>CBcoin Shop</Text>
            <View style={[styles.itemCard, { borderColor: '#3DD68C' }]} testID="rewarded-ads-card">
              <View style={styles.itemHeader}>
                <Crown size={28} color="#3DD68C" />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>Watch Ads • Earn CBcoin</Text>
                  <Text style={[styles.itemPrice, { color: '#3DD68C' }]}>Each ad grants 5 common input items. Watch {adsGoal} ads to earn 5 CBcoin</Text>
                  <Text style={styles.itemDescription}>Tap Watch Ad to simulate a rewarded video. Progress: {adsWatched}/{adsGoal}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.premiumButton, styles.goldButton]}
                onPress={() => {
                  try {
                    const result = watchAd();
                    if (!result) {
                      Alert.alert('Aguarde', 'Por favor, aguarde um pouco antes de ver outro anúncio.');
                      return;
                    }
                    setAdAwarded(result.awarded);
                    setAdPremiumDelta(result.premiumDelta);
                    setAdProgress({ watched: result.watched, goal: result.goal });
                    setAdPopupVisible(true);
                    try {
                      popupOpacity.setValue(0);
                      Animated.timing(popupOpacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
                    } catch (e2) {
                      console.log('Ad popup animation failed', e2);
                    }
                  } catch (e) {
                    Alert.alert('Falha no anúncio', 'Tente novamente.');
                  }
                }}
                testID="watch-ad-btn"
              >
                <Crown size={16} color="#000" />
                <Text style={styles.premiumButtonText}>Watch Ad</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.itemCard, { borderColor: '#6d28d9' }]} testID="premium-pack-1">
              <View style={styles.itemHeader}>
                <Bitcoin size={28} color="#E0B252" />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>Small Pack</Text>
                  <Text style={[styles.itemPrice, { color: '#a78bfa' }]}>50 CBcoin</Text>
                  <Text style={styles.itemDescription}>Simulated real-money purchase (emulated checkout).</Text>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.premiumButton, styles.realMoneyButton]}
                onPress={() => {
                  try {
                    expectedPremiumRef.current = (premiumCurrency ?? 0) + 50;
                    setPendingPremiumIncrease(50);
                    addPremium(50);
                  } catch (e) {
                    console.log('Premium purchase failed', e);
                    Alert.alert('Purchase failed', 'Something went wrong while adding CBcoin. Please try again.');
                  }
                }}
                testID="buy-cbcoin-50"
              >
                <CreditCard size={16} color="#fff" />
                <Text style={styles.premiumButtonTextAlt}>$4.99</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.itemCard, { borderColor: '#6d28d9' }]} testID="premium-pack-2">
              <View style={styles.itemHeader}>
                <Bitcoin size={28} color="#E0B252" />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>Medium Pack</Text>
                  <Text style={[styles.itemPrice, { color: '#c4b5fd' }]}>120 CBcoin</Text>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.premiumButton, styles.realMoneyButton]}
                onPress={() => {
                  try {
                    expectedPremiumRef.current = (premiumCurrency ?? 0) + 120;
                    setPendingPremiumIncrease(120);
                    addPremium(120);
                  } catch (e) {
                    console.log('Premium purchase failed', e);
                    Alert.alert('Purchase failed', 'Something went wrong while adding CBcoin. Please try again.');
                  }
                }}
                testID="buy-cbcoin-120"
              >
                <CreditCard size={16} color="#fff" />
                <Text style={styles.premiumButtonTextAlt}>$9.99</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.itemCard, { borderColor: '#6d28d9' }]} testID="premium-pack-3">
              <View style={styles.itemHeader}>
                <Bitcoin size={28} color="#fde68a" />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>Big Pack</Text>
                  <Text style={[styles.itemPrice, { color: '#ddd6fe' }]}>300 CBcoin</Text>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.premiumButton, styles.realMoneyButton]}
                onPress={() => {
                  try {
                    expectedPremiumRef.current = (premiumCurrency ?? 0) + 300;
                    setPendingPremiumIncrease(300);
                    addPremium(300);
                  } catch (e) {
                    console.log('Premium purchase failed', e);
                    Alert.alert('Purchase failed', 'Something went wrong while adding CBcoin. Please try again.');
                  }
                }}
                testID="buy-cbcoin-300"
              >
                <CreditCard size={16} color="#fff" />
                <Text style={styles.premiumButtonTextAlt}>$19.99</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      {popupVisible && (
        <View pointerEvents="auto" style={styles.popupOverlay} testID="cbcoin-purchase-popup">
          <Animated.View style={[styles.popupCard, { opacity: popupOpacity, transform: [{ scale: popupOpacity.interpolate({ inputRange: [0, 1], outputRange: [0.98, 1] }) }] }]}>

            <View style={styles.popupHeaderRow}>
              <Bitcoin size={22} color="#fde68a" />
              <Text style={styles.popupTitle}>Thank you!</Text>
              <View style={{ flex: 1 }} />
              <TouchableOpacity onPress={() => setPopupVisible(false)} style={styles.closeBtn} testID="popup-close">
                <X size={18} color="#fff" />
              </TouchableOpacity>
            </View>
            <Text style={styles.popupMessage}>{popupMessage}</Text>
            <TouchableOpacity onPress={() => setPopupVisible(false)} style={styles.primaryCloseBtn} testID="popup-dismiss">
              <Text style={styles.primaryCloseBtnText}>Close</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}

      {adPopupVisible && (
        <View pointerEvents="auto" style={styles.popupOverlay} testID="ad-reward-popup">
          <Animated.View style={[styles.popupCard, { opacity: popupOpacity, transform: [{ scale: popupOpacity.interpolate({ inputRange: [0, 1], outputRange: [0.98, 1] }) }] }]}>
            <View style={styles.popupHeaderRow}>
              <Crown size={22} color="#3DD68C" />
              <Text style={styles.popupTitle}>Recompensa do anúncio</Text>
              <View style={{ flex: 1 }} />
              <TouchableOpacity onPress={() => setAdPopupVisible(false)} style={styles.closeBtn} testID="ad-popup-close">
                <X size={18} color="#fff" />
              </TouchableOpacity>
            </View>
            <View style={{ gap: 8 }}>
              <Text style={styles.popupMessage}>Ganhaste 5 itens comuns:</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {adAwarded.map((rid, i) => {
                  const res = RESOURCES[rid];
                  const icon = res?.icon ?? '📦';
                  const name = res?.name ?? rid;
                  return (
                    <View key={`${rid}-${i}`} style={styles.awardPill} testID={`ad-award-${rid}-${i}`}>
                      <Text style={styles.awardIcon}>{icon}</Text>
                      <Text style={styles.awardText}>{name}</Text>
                    </View>
                  );
                })}
              </View>
              {adPremiumDelta > 0 ? (
                <View style={styles.rewardBanner} testID="cbcoin-earned-banner">
                  <Bitcoin size={16} color="#fff" />
                  <Text style={styles.rewardBannerText}>+{adPremiumDelta} CBcoin</Text>
                </View>
              ) : null}
              {adProgress ? (
                <Text style={styles.progressText}>Progresso: {adProgress.watched}/{adProgress.goal} anúncios</Text>
              ) : null}
            </View>
            <TouchableOpacity onPress={() => setAdPopupVisible(false)} style={styles.primaryCloseBtn} testID="ad-popup-dismiss">
              <Text style={styles.primaryCloseBtnText}>Fechar</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0E0C11',
  },
  contentContainer: {
    paddingBottom: 20,
  },
  header: {
    backgroundColor: '#18151D',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2733',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8F877E',
    marginTop: 2,
  },
  walletRow: {
    flexDirection: 'row',
    gap: 8,
  },
  walletPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2C2733',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#2C2733',
  },
  walletPillPremium: {
    backgroundColor: '#92400e',
    borderColor: '#E0B252',
  },
  walletText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  itemsContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E0B252',
    marginTop: 16,
    marginBottom: 12,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  tabBtn: {
    flex: 1,
    backgroundColor: '#0E0C11',
    borderColor: '#2C2733',
    borderWidth: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabBtnActive: {
    backgroundColor: 'rgba(224, 178, 82, 0.1)',
    borderColor: '#E0B252',
  },
  tabText: {
    color: '#8F877E',
    fontWeight: '700',
    fontSize: 12,
  },
  tabTextActive: {
    color: '#E0B252',
  },
  itemCard: {
    backgroundColor: '#18151D',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2C2733',
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  itemPrice: {
    fontSize: 14,
    color: '#E0B252',
    marginTop: 2,
  },
  bankQuantity: {
    fontSize: 12,
    color: '#8F877E',
    marginTop: 2,
  },
  itemDescription: {
    fontSize: 11,
    color: '#A8A097',
    marginTop: 4,
    fontStyle: 'italic',
    lineHeight: 14,
  },
  purchaseControls: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  quantitySection: {
    flex: 1,
    marginRight: 12,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  quickButton: {
    backgroundColor: '#2C2733',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E0B252',
  },
  quickButtonText: {
    color: '#E0B252',
    fontSize: 12,
    fontWeight: 'bold',
  },
  quantityButton: {
    backgroundColor: '#2C2733',
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityInput: {
    backgroundColor: '#0E0C11',
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    width: 60,
    height: 32,
    marginHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#2C2733',
  },
  buyButton: {
    backgroundColor: '#E0B252',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buyButtonDisabled: {
    backgroundColor: '#3E3648',
  },
  buyButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14,
  },
  buyButtonTextDisabled: {
    color: '#6F685F',
  },
  premiumActionsRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  premiumButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  goldButton: {
    backgroundColor: '#E0B252',
    borderColor: '#2FA86C',
  },
  realMoneyButton: {
    backgroundColor: '#b45309',
    borderColor: '#92400e',
  },
  premiumButtonText: {
    color: '#000',
    fontWeight: 'bold' as const,
    fontSize: 13,
  },
  premiumButtonTextAlt: {
    color: '#fff',
    fontWeight: 'bold' as const,
    fontSize: 13,
  },
  popupOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  popupCard: {
    backgroundColor: 'rgba(24, 21, 29,0.98)',
    borderWidth: 1,
    borderColor: '#E0B252',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    maxWidth: 520,
    width: '90%',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  popupHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  popupTitle: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
  popupMessage: {
    color: '#F6E7C1',
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 12,
  },
  awardPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(52,211,153,0.08)',
    borderColor: '#3DD68C',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 999,
  },
  awardIcon: { fontSize: 14 },
  awardText: { color: '#E8E1D6', fontSize: 12, fontWeight: '700' as const },
  rewardBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#1E5B3F', borderColor: '#3DD68C', borderWidth: 1, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 10 },
  rewardBannerText: { color: '#ecfccb', fontSize: 12, fontWeight: '800' as const },
  progressText: { color: '#A8A097', fontSize: 12 },
  closeBtn: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 8,
    padding: 6,
    borderWidth: 1,
    borderColor: '#2C2733',
  },
  primaryCloseBtn: {
    marginTop: 8,
    backgroundColor: '#E0B252',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryCloseBtnText: {
    color: '#0E0C11',
    fontWeight: 'bold' as const,
    fontSize: 14,
  },
});
