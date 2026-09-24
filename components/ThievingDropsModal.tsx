import React, { useMemo } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { X, List } from 'lucide-react-native';
import { Activity } from '@/types/game';
import { RESOURCES } from '@/constants/gameData';

interface ThievingDropsModalProps {
  visible: boolean;
  onClose: () => void;
  activity: Activity;
}

export default function ThievingDropsModal({ visible, onClose, activity }: ThievingDropsModalProps) {
  const lootTable = activity.lootTable ?? [];

  const computed = useMemo(() => {
    const items = lootTable.map(l => {
      const res = RESOURCES[l.resourceId];
      // For cash, show 100% since it's guaranteed
      // For items, show the actual weight as percentage
      const probability = l.resourceId === 'cash' ? 100 : Math.max(0, Math.min(100, l.weight ?? 0));
      return {
        resourceId: l.resourceId,
        name: l.resourceId === 'cash' ? 'Cash' : (res?.name ?? l.resourceId),
        icon: l.resourceId === 'cash' ? '💵' : (res?.icon ?? '❓'),
        min: l.minQuantity,
        max: l.maxQuantity,
        weight: l.weight,
        probability,
      };
    }).sort((a, b) => {
      // Sort cash first, then by probability
      if (a.resourceId === 'cash') return -1;
      if (b.resourceId === 'cash') return 1;
      return b.probability - a.probability;
    });
    return { totalWeight: 100, items };
  }, [lootTable]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose} testID="drops-modal">
        <View style={styles.modal}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <List size={16} color="#E0B252" />
              <Text style={styles.title} numberOfLines={1}>Drops & Odds</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} testID="drops-close">
              <X size={18} color="#BDB5AA" />
            </TouchableOpacity>
          </View>

          <Text style={styles.activityName}>{activity.name}</Text>
          <Text style={styles.helper}>Cash is guaranteed. Items roll independently with shown chances.</Text>

          <ScrollView style={styles.list} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
            {computed.items.map(item => (
              <View key={item.resourceId} style={styles.row} testID={`drop-item-${item.resourceId}`}>
                <View style={styles.left}>
                  <Text style={styles.icon}>{item.icon}</Text>
                  <View style={styles.meta}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.qty}>Qty {item.min === item.max ? `${item.min}` : `${item.min}-${item.max}`}</Text>
                  </View>
                </View>
                <View style={styles.right}>
                  <Text style={styles.prob}>{item.probability.toFixed(1)}%</Text>
                </View>
              </View>
            ))}

            {computed.items.length === 0 && (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>No drop data available</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modal: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#0E0C11',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2C2733',
    padding: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  closeBtn: { padding: 6 },
  activityName: {
    color: '#A8A097',
    fontSize: 12,
    marginBottom: 8,
  },
  helper: {
    color: '#A8A097',
    fontSize: 11,
    marginBottom: 8,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  list: { maxHeight: 360 },
  listContent: { paddingVertical: 4 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#18151D',
    borderWidth: 1,
    borderColor: '#2C2733',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },
  left: { flexDirection: 'row', alignItems: 'center' },
  icon: { fontSize: 20, marginRight: 10 },
  meta: { },
  name: { color: '#E8E1D6', fontWeight: '600', fontSize: 13 },
  qty: { color: '#A8A097', fontSize: 11, marginTop: 2 },
  right: { },
  prob: { color: '#E0B252', fontWeight: '800', fontSize: 14 },
  empty: { paddingVertical: 24, alignItems: 'center' },
  emptyText: { color: '#A8A097' },
});
