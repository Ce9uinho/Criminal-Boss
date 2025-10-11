import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import { useGameStore } from '@/store/gameStore';
import { RESOURCES } from '@/constants/gameData';
import { BANK_TAB_ICONS } from '@/constants/bankIcons';
import { X, Coins, Plus, Package } from 'lucide-react-native';
import * as LucideIcons from 'lucide-react-native';
import { BankGrid } from './BankGrid';

import { formatCash } from '@/constants/numberFormat';

export default function BankView() {
  const bankItems = useGameStore(state => state.bankItems);
  const bankTabs = useGameStore(state => state.bankTabs);
  const activeBankTab = useGameStore(state => state.activeBankTab);
  const gold = useGameStore(state => state.gold);
  const setActiveBankTab = useGameStore(state => state.setActiveBankTab);
  const createBankTab = useGameStore(state => state.createBankTab);
  const deleteBankTab = useGameStore(state => state.deleteBankTab);
  const renameBankTab = useGameStore(state => state.renameBankTab);
  const setTabIcon = useGameStore(state => state.setTabIcon);
  const setTabDisplayMode = useGameStore(state => state.setTabDisplayMode);
  const swapBankTabs = useGameStore(state => state.swapBankTabs);
  const bankTabsOrder = useGameStore(state => state.bankTabsOrder ?? []);

  const [isCreatingTab, setIsCreatingTab] = useState(false);
  const [newTabName, setNewTabName] = useState('');
  const [showTabOptions, setShowTabOptions] = useState<string | null>(null);
  const [renameModalTabId, setRenameModalTabId] = useState<string | null>(null);
  const [renameModalName, setRenameModalName] = useState('');
  const [renameModalIcon, setRenameModalIcon] = useState('');
  const [renameModalDisplayMode, setRenameModalDisplayMode] = useState<'both' | 'icon' | 'text'>('both');
  const [confirmDeleteTabId, setConfirmDeleteTabId] = useState<string | null>(null);
  const [selectedTabForSwap, setSelectedTabForSwap] = useState<string | null>(null);
  const [isInMoveMode, setIsInMoveMode] = useState(false);
  const [isBankReorderMode, setIsBankReorderMode] = useState(false);

  const maxBankSlots = useGameStore(state => state.maxBankSlots);

  const { totalValue, usedSlots, maxSlots } = useMemo(() => {
    const allItems = bankItems.filter(item => item !== null && item.quantity > 0);
    const value = allItems.reduce((sum, item) => {
      if (!item) return sum;
      const resource = RESOURCES[item.resourceId];
      return sum + (resource?.value || 0) * item.quantity;
    }, 0);
    return {
      totalValue: value,
      usedSlots: allItems.length,
      maxSlots: maxBankSlots
    };
  }, [bankItems, maxBankSlots]);



  const handleTabRename = (tabId: string) => {
    const tab = bankTabs[tabId];
    if (tab) {
      setRenameModalTabId(tabId);
      setRenameModalName(tab.name);
      setRenameModalIcon(tab.icon || '');
      setRenameModalDisplayMode(tab.displayMode || 'both');
      setShowTabOptions(null);
    }
  };

  const saveTabName = () => {
    if (renameModalTabId && renameModalName.trim()) {
      renameBankTab(renameModalTabId, renameModalName.trim());
      setTabIcon(renameModalTabId, renameModalIcon);
      setTabDisplayMode(renameModalTabId, renameModalDisplayMode);
      setRenameModalTabId(null);
      setRenameModalName('');
      setRenameModalIcon('');
      setRenameModalDisplayMode('both');
    }
  };

  const createNewTab = () => {
    const trimmedName = newTabName.trim();
    if (trimmedName) {
      const newTabId = createBankTab(trimmedName);
      setActiveBankTab(newTabId);
      setNewTabName('');
      setIsCreatingTab(false);
      return true;
    }
    return false;
  };

  const performDeleteTab = (tabId: string) => {
    deleteBankTab(tabId);
    setConfirmDeleteTabId(null);
    setShowTabOptions(null);
  };

  const deleteTab = (tabId: string) => {
    setConfirmDeleteTabId(tabId);
  };

  const handleTabLongPress = (tabId: string) => {
    setShowTabOptions(tabId);
  };

  // Create tabs array for rendering: 'all' + ordered custom tabs
  const tabsArray = [
    { id: 'all', name: 'All', order: 0 },
    ...bankTabsOrder
      .map((id) => bankTabs[id])
      .filter((t): t is typeof bankTabs[string] => Boolean(t))
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.bankInfo}>
            <Text style={styles.bankSpaceLabel}>BANK SPACE</Text>
            <Text style={styles.bankSpace}>{usedSlots} / {maxSlots}</Text>
          </View>
          <View style={styles.bankInfo}>
            <Text style={styles.bankValueLabel}>TOTAL VALUE</Text>
            <Text style={styles.bankValue}>{formatCash(totalValue)}</Text>
          </View>
          <View style={styles.bankInfo}>
            <Text style={styles.goldLabel}>GOLD</Text>
            <View style={styles.goldContainer}>
              <Coins size={16} color="#fbbf24" />
              <Text style={styles.goldValue}>{formatCash(gold)}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.groupButton, isBankReorderMode && styles.reorderButtonActive]}
            onPress={() => setIsBankReorderMode(!isBankReorderMode)}
            testID="reorder-items-button"
          >
            <Package size={16} color={isBankReorderMode ? "#10b981" : "#888"} />
            <Text style={[styles.groupButtonText, isBankReorderMode && styles.reorderButtonTextActive]}>Reorder</Text>
          </TouchableOpacity>

        </View>
      </View>

      {/* Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
      >
        {tabsArray.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              activeBankTab === tab.id && styles.activeTab,
              isInMoveMode && selectedTabForSwap === tab.id && styles.swapSelectedTab
            ]}
            onPress={() => {
              if (isInMoveMode && tab.id !== 'all') {
                // In move mode - handle tab swapping
                if (selectedTabForSwap && selectedTabForSwap !== tab.id) {
                  swapBankTabs(selectedTabForSwap, tab.id);
                  setSelectedTabForSwap(null);
                  setIsInMoveMode(false);
                  setActiveBankTab(tab.id);
                } else if (selectedTabForSwap === tab.id) {
                  // Deselect if clicking the same tab
                  setSelectedTabForSwap(null);
                } else {
                  // Select this tab for swapping
                  setSelectedTabForSwap(tab.id);
                }
              } else {
                // Normal mode - just switch tabs
                setActiveBankTab(tab.id);
              }
            }}
            onLongPress={() => tab.id !== 'all' && handleTabLongPress(tab.id)}
            testID={`bank-tab-${tab.id}`}
          >
            {tab.id !== 'all' && (() => {
              const tabData = bankTabs[tab.id];
              const displayMode = tabData?.displayMode || 'both';
              const IconComponent = tabData?.icon ? (LucideIcons as any)[tabData.icon] : null;
              const showIcon = displayMode !== 'text' && IconComponent;
              const showText = displayMode !== 'icon';
              
              return (
                <>
                  {showIcon && (
                    <IconComponent 
                      size={14} 
                      color={activeBankTab === tab.id ? '#fff' : '#888'} 
                    />
                  )}
                  {showText && (
                    <Text style={[
                      styles.tabText,
                      activeBankTab === tab.id && styles.activeTabText
                    ]}>
                      {tab.name}
                    </Text>
                  )}
                </>
              );
            })()}
            {tab.id === 'all' && (
              <Text style={[
                styles.tabText,
                activeBankTab === tab.id && styles.activeTabText
              ]}>
                {tab.name}
              </Text>
            )}

          </TouchableOpacity>
        ))}
        
        {/* Add Tab Button */}
        {isCreatingTab ? (
          <View style={styles.newTabContainer}>
            <TextInput
              style={styles.newTabInput}
              value={newTabName}
              onChangeText={setNewTabName}
              onBlur={() => {
                const success = createNewTab();
                if (!success) {
                  setIsCreatingTab(false);
                  setNewTabName('');
                }
              }}
              onSubmitEditing={() => {
                const success = createNewTab();
                if (!success) {
                  console.log('Tab creation failed - name is required');
                }
              }}
              placeholder="Tab name"
              placeholderTextColor="#666"
              autoFocus
              maxLength={20}
              returnKeyType="done"
            />
          </View>
        ) : (
          <TouchableOpacity
            style={styles.addTabButton}
            onPress={() => setIsCreatingTab(true)}
          >
            <Plus size={16} color="#888" />
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Move Mode Indicator */}
      {isInMoveMode && (
        <View style={styles.moveModeIndicator}>
          <Text style={styles.moveModeText}>Select a tab to swap positions</Text>
          <TouchableOpacity
            style={styles.moveModeCancel}
            onPress={() => {
              setIsInMoveMode(false);
              setSelectedTabForSwap(null);
            }}
          >
            <Text style={styles.moveModeCancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Reorder Mode Indicator */}
      {isBankReorderMode && (
        <View style={styles.reorderModeIndicator}>
          <Text style={styles.reorderModeText}>Tap items to swap positions</Text>
          <TouchableOpacity
            style={styles.reorderModeCancel}
            onPress={() => setIsBankReorderMode(false)}
          >
            <Text style={styles.reorderModeCancelText}>Done</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Bank Grid */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <BankGrid columns={8} isReorderMode={isBankReorderMode} />
      </ScrollView>

      {/* Tab Options Modal */}
      <Modal
        visible={showTabOptions !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTabOptions(null)}
      >
        <View style={styles.optionsOverlay}>
          <TouchableOpacity style={styles.optionsBackdrop} activeOpacity={1} onPress={() => setShowTabOptions(null)} />
          <View style={styles.optionsCard}>
            <Text style={styles.optionsTitle}>Tab Options</Text>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => {
                if (showTabOptions) {
                  setSelectedTabForSwap(showTabOptions);
                  setIsInMoveMode(true);
                  setShowTabOptions(null);
                }
              }}
              testID="tab-option-move"
            >
              <Text style={styles.optionButtonText}>Move</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => {
                if (showTabOptions) {
                  handleTabRename(showTabOptions);
                }
              }}
              testID="tab-option-rename"
            >
              <Text style={styles.optionButtonText}>Customize Tab</Text>
            </TouchableOpacity>

            {confirmDeleteTabId === showTabOptions ? (
              <View>
                <Text style={styles.optionsTitle}>Confirm delete?</Text>
                <TouchableOpacity
                  style={[styles.optionButton, styles.optionDestructive]}
                  onPress={() => {
                    if (confirmDeleteTabId) performDeleteTab(confirmDeleteTabId);
                  }}
                  testID="tab-option-delete-confirm"
                >
                  <Text style={[styles.optionButtonText, styles.optionDestructiveText]}>Delete Tab</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.optionCancel}
                  onPress={() => setConfirmDeleteTabId(null)}
                  testID="tab-option-delete-cancel"
                >
                  <Text style={styles.optionCancelText}>Keep Tab</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <TouchableOpacity
                  style={[styles.optionButton, styles.optionDestructive]}
                  onPress={() => {
                    if (showTabOptions) {
                      deleteTab(showTabOptions);
                    }
                  }}
                  testID="tab-option-delete"
                >
                  <Text style={[styles.optionButtonText, styles.optionDestructiveText]}>Delete</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.optionCancel}
                  onPress={() => setShowTabOptions(null)}
                  testID="tab-option-cancel"
                >
                  <Text style={styles.optionCancelText}>Cancel</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Rename & Icon Modal */}
      <Modal
        visible={renameModalTabId !== null}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setRenameModalTabId(null);
          setRenameModalIcon('');
          setRenameModalDisplayMode('both');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.customizeModalContent}>
            <View style={styles.renameModalHeader}>
              <Text style={styles.renameModalTitle}>Customize Tab</Text>
              <TouchableOpacity style={styles.renameCloseButton} onPress={() => {
                setRenameModalTabId(null);
                setRenameModalIcon('');
                setRenameModalDisplayMode('both');
              }}>
                <X size={20} color="#888" />
              </TouchableOpacity>
            </View>
            
            {/* Tab Name Input */}
            <Text style={styles.sectionLabel}>Tab Name</Text>
            <TextInput
              style={styles.renameInput}
              value={renameModalName}
              onChangeText={(text) => setRenameModalName(text.substring(0, 20))}
              maxLength={20}
              placeholder="Enter tab name"
              placeholderTextColor="#666"
              returnKeyType="done"
            />
            
            {/* Display Mode Options */}
            <Text style={styles.sectionLabel}>Display Mode</Text>
            <View style={styles.displayModeContainer}>
              <TouchableOpacity
                style={[
                  styles.displayModeOption,
                  renameModalDisplayMode === 'both' && styles.displayModeActive
                ]}
                onPress={() => setRenameModalDisplayMode('both')}
              >
                <Text style={[
                  styles.displayModeText,
                  renameModalDisplayMode === 'both' && styles.displayModeTextActive
                ]}>Icon & Text</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.displayModeOption,
                  renameModalDisplayMode === 'icon' && styles.displayModeActive
                ]}
                onPress={() => setRenameModalDisplayMode('icon')}
              >
                <Text style={[
                  styles.displayModeText,
                  renameModalDisplayMode === 'icon' && styles.displayModeTextActive
                ]}>Icon Only</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.displayModeOption,
                  renameModalDisplayMode === 'text' && styles.displayModeActive
                ]}
                onPress={() => setRenameModalDisplayMode('text')}
              >
                <Text style={[
                  styles.displayModeText,
                  renameModalDisplayMode === 'text' && styles.displayModeTextActive
                ]}>Text Only</Text>
              </TouchableOpacity>
            </View>
            
            {/* Icon Selection */}
            <Text style={styles.sectionLabel}>Tab Icon</Text>
            <ScrollView style={styles.iconSelectionGrid} showsVerticalScrollIndicator={false}>
              <View style={styles.iconSelectionContent}>
                {/* No icon option */}
                <TouchableOpacity
                  style={[
                    styles.iconSelectionOption,
                    renameModalIcon === '' && styles.iconSelectionActive
                  ]}
                  onPress={() => setRenameModalIcon('')}
                >
                  <View style={styles.iconSelectionIcon}>
                    <X size={20} color="#888" />
                  </View>
                </TouchableOpacity>
                
                {/* Icon options */}
                {BANK_TAB_ICONS.map((iconData) => {
                  const IconComponent = (LucideIcons as any)[iconData.icon];
                  return (
                    <TouchableOpacity
                      key={iconData.id}
                      style={[
                        styles.iconSelectionOption,
                        renameModalIcon === iconData.icon && styles.iconSelectionActive
                      ]}
                      onPress={() => setRenameModalIcon(iconData.icon)}
                    >
                      <View style={styles.iconSelectionIcon}>
                        {IconComponent && <IconComponent size={20} color="#fff" />}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
            
            <View style={styles.renameModalActions}>
              <TouchableOpacity style={styles.renameSaveButton} onPress={saveTabName} testID="rename-tab-confirm">
                <Text style={styles.renameSaveButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.renameCancelButton} 
                onPress={() => {
                  setRenameModalTabId(null);
                  setRenameModalIcon('');
                  setRenameModalDisplayMode('both');
                }}
                testID="rename-tab-cancel"
              >
                <Text style={styles.renameCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>


    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f23',
  },
  header: {
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a3e',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  bankInfo: {
    alignItems: 'center',
  },
  bankSpaceLabel: {
    fontSize: 10,
    color: '#888',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  bankSpace: {
    fontSize: 14,
    color: '#fb923c',
    fontWeight: 'bold' as const,
  },
  bankValueLabel: {
    fontSize: 10,
    color: '#888',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  bankValue: {
    fontSize: 14,
    color: '#fbbf24',
    fontWeight: 'bold' as const,
  },
  goldLabel: {
    fontSize: 10,
    color: '#888',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  goldContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  goldValue: {
    fontSize: 14,
    color: '#fbbf24',
    fontWeight: 'bold' as const,
  },
  tabsContainer: {
    backgroundColor: '#16213e',
    maxHeight: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a3e',
  },
  tabsContent: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    minHeight: 44,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2a2a3e',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activeTab: {
    backgroundColor: '#2563eb',
    borderColor: '#3b82f6',
  },
  tabText: {
    fontSize: 13,
    color: '#888',
    fontWeight: '500' as const,
  },
  activeTabText: {
    color: '#fff',
  },
  swapSelectedTab: {
    borderColor: '#10b981',
    backgroundColor: 'rgba(16, 185, 129, 0.15)'
  },
  tabBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  tabBadgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold' as const,
  },
  addTabButton: {
    width: 32,
    height: 32,
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2a2a3e',
    borderStyle: 'dashed' as const,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newTabContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#3b82f6',
    backgroundColor: 'transparent',
    paddingLeft: 4,
    maxWidth: 200,
  },
  newTabInput: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500' as const,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flex: 1,
    minWidth: 80,
    backgroundColor: 'transparent',
  },
  scrollView: {
    flex: 1,
  },
  optionsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  optionsBackdrop: {
    ...StyleSheet.absoluteFillObject as any,
  },
  optionsCard: {
    backgroundColor: '#1a1a2e',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    borderTopWidth: 1,
    borderColor: '#2a2a3e',
    paddingBottom: 30,
  },
  optionsTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 16,
    textAlign: 'center',
  },
  optionButton: {
    backgroundColor: '#16213e',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2a2a3e',
    marginTop: 10,
  },
  optionButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500' as const,
    textAlign: 'center',
  },
  optionDestructive: {
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    borderColor: '#dc2626',
  },
  optionDestructiveText: {
    color: '#ef4444',
  },
  optionCancel: {
    marginTop: 16,
    paddingVertical: 14,
  },
  optionCancelText: {
    color: '#888',
    fontSize: 15,
    textAlign: 'center',
    fontWeight: '500' as const,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  renameModalContent: {
    backgroundColor: '#0f0f23',
    borderRadius: 12,
    padding: 24,
    width: '85%',
    maxWidth: 320,
    borderWidth: 2,
    borderColor: '#2a2a3e',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  renameModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  renameModalTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
    letterSpacing: 0.5,
  },
  renameCloseButton: {
    padding: 8,
    backgroundColor: '#1a1a2e',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#2a2a3e',
  },
  renameInput: {
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#fff',
    fontSize: 16,
    borderWidth: 2,
    borderColor: '#3b82f6',
    marginBottom: 20,
    fontWeight: '500' as const,
  },
  renameModalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  renameSaveButton: {
    flex: 1,
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  renameSaveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  },
  renameCancelButton: {
    flex: 1,
    backgroundColor: '#f59e0b',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fbbf24',
  },
  renameCancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  },
  groupButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#1a1a2e',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#2a2a3e',
    gap: 2,
  },
  groupButtonText: {
    fontSize: 10,
    color: '#888',
    fontWeight: '500' as const,
  },
  moveModeIndicator: {
    backgroundColor: '#16213e',
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a3e',
  },
  moveModeText: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '500' as const,
  },
  moveModeCancel: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#1a1a2e',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#2a2a3e',
  },
  moveModeCancelText: {
    color: '#888',
    fontSize: 12,
    fontWeight: '500' as const,
  },
  reorderButtonActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#10b981',
  },
  reorderButtonTextActive: {
    color: '#10b981',
  },
  reorderModeIndicator: {
    backgroundColor: '#16213e',
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a3e',
  },
  reorderModeText: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '500' as const,
  },
  reorderModeCancel: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#10b981',
    borderRadius: 6,
  },
  reorderModeCancelText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600' as const,
  },
  iconModalContent: {
    backgroundColor: '#0f0f23',
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    maxHeight: '70%',
    borderWidth: 2,
    borderColor: '#2a2a3e',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  iconModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconModalTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#fff',
    letterSpacing: 0.5,
  },
  iconCloseButton: {
    padding: 8,
    backgroundColor: '#1a1a2e',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#2a2a3e',
  },
  iconGrid: {
    maxHeight: 400,
  },
  iconGridContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 10,
  },
  iconOption: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2a2a3e',
  },
  iconOptionIcon: {
    width: 50,
    height: 50,
    backgroundColor: '#16213e',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#2a2a3e',
  },
  iconOptionText: {
    fontSize: 11,
    color: '#888',
    fontWeight: '500' as const,
    textAlign: 'center',
  },
  customizeModalContent: {
    backgroundColor: '#0f0f23',
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    borderWidth: 2,
    borderColor: '#2a2a3e',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  sectionLabel: {
    fontSize: 12,
    color: '#888',
    fontWeight: '600' as const,
    marginTop: 16,
    marginBottom: 8,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },
  displayModeContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  displayModeOption: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2a2a3e',
    alignItems: 'center',
  },
  displayModeActive: {
    backgroundColor: '#2563eb',
    borderColor: '#3b82f6',
  },
  displayModeText: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500' as const,
  },
  displayModeTextActive: {
    color: '#fff',
  },
  iconSelectionGrid: {
    maxHeight: 200,
    marginBottom: 16,
  },
  iconSelectionContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  iconSelectionOption: {
    width: '22%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2a2a3e',
    padding: 8,
  },
  iconSelectionActive: {
    backgroundColor: '#2563eb',
    borderColor: '#3b82f6',
  },
  iconSelectionIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconSelectionText: {
    fontSize: 9,
    color: '#888',
    fontWeight: '500' as const,
    marginTop: 4,
    textAlign: 'center',
  },
});
