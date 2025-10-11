import React, { useState, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useGameStore } from '@/store/gameStore';
import { BankSlot } from './BankSlot';

type Props = { columns?: number; isReorderMode?: boolean };

export const BankGrid: React.FC<Props> = ({ columns = 8, isReorderMode = false }) => {
  const bankItems = useGameStore(state => state.bankItems);
  const bankTabs = useGameStore(state => state.bankTabs);
  const activeBankTab = useGameStore(state => state.activeBankTab);
  const swapInAll = useGameStore(state => state.swapInAll);
  const swapInTab = useGameStore(state => state.swapInTab);
  
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const totalSlots = bankItems.length;

  const slotIndices = useMemo(() => {
    if (activeBankTab === 'all') {
      return Array.from({ length: totalSlots }, (_, i) => i);
    }
    const tab = bankTabs[activeBankTab];
    return tab ? tab.order : [];
  }, [activeBankTab, bankTabs, totalSlots]);

  const performSwap = (fromIndex: number, toIndex: number) => {
    if (fromIndex < 0 || fromIndex >= totalSlots || toIndex < 0 || toIndex >= totalSlots) {
      console.log('Invalid indices for swap');
      return;
    }
    
    if (activeBankTab === 'all') {
      console.log('Swapping in ALL tab');
      swapInAll(fromIndex, toIndex);
    } else {
      const tab = bankTabs[activeBankTab];
      if (tab) {
        const fromPos = tab.order.indexOf(fromIndex);
        const toPos = tab.order.indexOf(toIndex);
        if (fromPos !== -1 && toPos !== -1) {
          console.log('Swapping in custom tab');
          swapInTab(activeBankTab, fromPos, toPos);
        }
      }
    }
  };

  const handleSlotTap = (index: number) => {
    if (!isReorderMode) return;
    if (index < 0 || index >= totalSlots) return;
    
    const item = bankItems[index];
    
    if (selectedIndex !== null) {
      if (selectedIndex === index) {
        setSelectedIndex(null);
        console.log('Deselected slot:', index);
      } else {
        const targetItem = bankItems[index];
        const hasTargetItem = Boolean(targetItem && (targetItem.quantity ?? 0) > 0);
        if (!hasTargetItem) {
          console.log('Ignored swap: target slot is empty');
          return;
        }
        console.log('Tap swap:', selectedIndex, 'with', index);
        performSwap(selectedIndex, index);
        setSelectedIndex(null);
      }
    } else {
      const hasItem = Boolean(item && (item.quantity ?? 0) > 0);
      if (hasItem) {
        setSelectedIndex(index);
        console.log('Selected slot:', index, 'Item:', item?.resourceId);
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {slotIndices.map((slotIndex, position) => {
          const item = (slotIndex >= 0 && slotIndex < bankItems.length) ? bankItems[slotIndex] : null;
          const isSelected = isReorderMode && selectedIndex === slotIndex;

          return (
            <BankSlot
              key={`slot-${activeBankTab}-${slotIndex}-${position}`}
              slotIndex={slotIndex}
              item={item}
              position={position}
              isSelected={isSelected}
              onTap={handleSlotTap}
              isReorderMode={isReorderMode}
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
