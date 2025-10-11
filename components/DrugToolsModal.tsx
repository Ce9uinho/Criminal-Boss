import React, { useMemo } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { X, Wrench } from 'lucide-react-native';
import { DRUG_TOOLS } from '@/constants/drugTools';
import { useGameStore } from '@/store/gameStore';
import { RESOURCES } from '@/constants/gameData';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function DrugToolsModal({ visible, onClose }: Props) {
  const { drugToolsOwned, equippedDrugToolId, acquireDrugTool, equipDrugTool, bank, gold } = useGameStore();

  const tools = useMemo(() => DRUG_TOOLS.slice().sort((a, b) => a.tier - b.tier), []);
  const activeTool = useMemo(() => DRUG_TOOLS.find(t => t.id === equippedDrugToolId), [equippedDrugToolId]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose} testID="drug-tools-modal">
        <View style={styles.modal}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Wrench size={16} color="#4ade80" />
              <Text style={styles.title}>Facilities</Text>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn} testID="drug-tools-close">
                <X size={18} color="#bbb" />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.helper}>Acquire facilities using loot and cash. Equip one to boost production speed, success, and efficiency.</Text>

          <ScrollView style={styles.list} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
            {tools.map(tool => {
              const owned = !!drugToolsOwned?.[tool.id];
              const equipped = equippedDrugToolId === tool.id;
              const canAcquire = tool.requirements.every(r => {
                const isCash = r.resourceId === 'loose_change' || r.resourceId === 'cash';
                const have = isCash ? gold : (bank?.[r.resourceId]?.quantity ?? 0);
                return have >= r.quantity;
              });
              return (
                <View key={tool.id} style={styles.card} testID={`drug-tool-${tool.id}`}>
                  <View style={styles.rowTop}>
                    <Text style={styles.icon}>{tool.icon}</Text>
                    <View style={styles.meta}>
                      <Text style={styles.name}>{tool.name}</Text>
                      <Text style={styles.tier}>Tier {tool.tier}</Text>
                    </View>
                    <View style={styles.statusPill}>
                      <Text style={[styles.statusText, owned ? (equipped ? styles.eq : styles.owned) : styles.locked]}>
                        {equipped ? 'Equipped' : owned ? 'Owned' : 'Locked'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.bonusesRow}>
                    <Text style={styles.bonus}>- {(100 - Math.round((tool.bonuses.timeReductionMultiplier ?? 1) * 100))}% Time</Text>
                    <Text style={styles.bonus}>- {(100 - Math.round((tool.bonuses.failureReductionMultiplier ?? 1) * 100))}% Failure</Text>
                    {typeof tool.bonuses.inputSaveChance === 'number' && (
                      <Text style={styles.bonus}>+ {Math.round((tool.bonuses.inputSaveChance ?? 0) * 100)}% Save 1 Input</Text>
                    )}
                  </View>

                  <View style={styles.reqBox}>
                    {tool.requirements.map((req) => {
                      const isCash = req.resourceId === 'loose_change' || req.resourceId === 'cash';
                      const res = isCash ? undefined : RESOURCES[req.resourceId];
                      const have = isCash ? gold : (bank?.[req.resourceId]?.quantity ?? 0);
                      const ok = have >= req.quantity;
                      const name = isCash ? 'Cash' : (res?.name ?? req.resourceId);
                      const icon = isCash ? '💵' : (res?.icon ?? '📦');
                      return (
                        <View key={req.resourceId} style={styles.reqRow}>
                          <Text style={styles.reqIcon}>{icon}</Text>
                          <Text style={[styles.reqText, ok ? styles.reqOk : styles.reqMissing]}>
                            {name}: {have} / {req.quantity}
                          </Text>
                        </View>
                      );
                    })}
                  </View>

                  <View style={styles.actions}>
                    {!owned ? (
                      <TouchableOpacity
                        onPress={() => acquireDrugTool(tool.id)}
                        disabled={!canAcquire}
                        style={[styles.btn, !canAcquire && styles.btnDisabled]}
                        testID={`drug-tool-acquire-${tool.id}`}
                      >
                        <Text style={styles.btnText}>{canAcquire ? 'Acquire' : 'Need Items'}</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        onPress={() => equipDrugTool(tool.id)}
                        disabled={equipped}
                        style={[styles.btn, equipped && styles.btnDisabled]}
                        testID={`drug-tool-equip-${tool.id}`}
                      >
                        <Text style={styles.btnText}>{equipped ? 'Equipped' : 'Equip'}</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  modal: { width: '100%', maxWidth: 460, backgroundColor: '#0f0f1a', borderRadius: 14, borderWidth: 1, borderColor: '#223', padding: 14 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { color: '#fff', fontSize: 16, fontWeight: '700' },
  headerRight: { flexDirection: 'row', alignItems: 'center' },

  closeBtn: { padding: 6 },
  helper: { color: '#9ca3af', fontSize: 11, marginBottom: 8, fontStyle: 'italic', textAlign: 'center' },
  list: { maxHeight: 520 },
  listContent: { paddingVertical: 4 },
  card: { backgroundColor: '#151826', borderWidth: 1, borderColor: '#233', borderRadius: 12, padding: 12, marginBottom: 10 },
  rowTop: { flexDirection: 'row', alignItems: 'center' },
  icon: { fontSize: 22, marginRight: 10 },
  meta: { flex: 1 },
  name: { color: '#e5e7eb', fontWeight: '700', fontSize: 14 },
  tier: { color: '#9ca3af', fontSize: 11, marginTop: 2 },
  statusPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, backgroundColor: 'rgba(148,163,184,0.12)' },
  statusText: { fontSize: 11, fontWeight: '700' },
  owned: { color: '#fde68a' },
  eq: { color: '#4ade80' },
  locked: { color: '#fca5a5' },
  bonusesRow: { marginTop: 8 },
  bonus: { color: '#a3e635', fontSize: 11, marginRight: 8 },
  reqBox: { marginTop: 10, backgroundColor: '#0b0f1f', borderRadius: 8, borderWidth: 1, borderColor: '#1f2937', padding: 10 },
  reqRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  reqIcon: { fontSize: 18, marginRight: 8 },
  reqText: { fontSize: 12 },
  reqOk: { color: '#d1fae5' },
  reqMissing: { color: '#fca5a5' },
  actions: { marginTop: 10, alignItems: 'flex-end' },
  btn: { backgroundColor: '#22c55e', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  btnDisabled: { backgroundColor: '#164e2b' },
  btnText: { color: '#0b0f1f', fontWeight: '800' },
});
