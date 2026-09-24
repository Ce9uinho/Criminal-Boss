import React, { useMemo } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { X, Wrench } from 'lucide-react-native';
import { INVESTIGATION_LAB_TOOLS } from '@/constants/investigationLabTools';
import { useGameStore } from '@/store/gameStore';
import { RESOURCES } from '@/constants/gameData';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function InvestigationLabToolsModal({ visible, onClose }: Props) {
  const { investigationLabToolsOwned, equippedInvestigationLabToolId, acquireInvestigationLabTool, equipInvestigationLabTool, bank, gold } = useGameStore();

  const tools = useMemo(() => INVESTIGATION_LAB_TOOLS.slice().sort((a, b) => a.tier - b.tier), []);
  const activeTool = useMemo(() => INVESTIGATION_LAB_TOOLS.find(t => t.id === equippedInvestigationLabToolId), [equippedInvestigationLabToolId]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose} testID="investigation-lab-tools-modal">
        <View style={styles.modal}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Wrench size={16} color="#E0B252" />
              <Text style={styles.title}>Lab Sets</Text>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn} testID="investigation-lab-tools-close">
                <X size={18} color="#BDB5AA" />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.helper}>Acquire lab sets using refined materials and cash. Equip one to boost speed, success, and efficiency.</Text>

          <ScrollView style={styles.list} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
            {tools.map(tool => {
              const owned = !!investigationLabToolsOwned?.[tool.id];
              const equipped = equippedInvestigationLabToolId === tool.id;
              const canAcquire = tool.requirements.every(r => {
                const isCash = r.resourceId === 'loose_change' || r.resourceId === 'cash';
                const have = isCash ? gold : (bank?.[r.resourceId]?.quantity ?? 0);
                return have >= r.quantity;
              });
              return (
                <View key={tool.id} style={styles.card} testID={`investigation-lab-tool-${tool.id}`}>
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
                        onPress={() => acquireInvestigationLabTool(tool.id)}
                        disabled={!canAcquire}
                        style={[styles.btn, !canAcquire && styles.btnDisabled]}
                        testID={`investigation-lab-tool-acquire-${tool.id}`}
                      >
                        <Text style={styles.btnText}>{canAcquire ? 'Acquire' : 'Need Items'}</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        onPress={() => equipInvestigationLabTool(tool.id)}
                        disabled={equipped}
                        style={[styles.btn, equipped && styles.btnDisabled]}
                        testID={`investigation-lab-tool-equip-${tool.id}`}
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
  modal: { width: '100%', maxWidth: 460, backgroundColor: '#0E0C11', borderRadius: 14, borderWidth: 1, borderColor: '#2C2733', padding: 14 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { color: '#fff', fontSize: 16, fontWeight: '700' },
  headerRight: { flexDirection: 'row', alignItems: 'center' },

  closeBtn: { padding: 6 },
  helper: { color: '#A8A097', fontSize: 11, marginBottom: 8, fontStyle: 'italic', textAlign: 'center' },
  list: { maxHeight: 520 },
  listContent: { paddingVertical: 4 },
  card: { backgroundColor: '#18151D', borderWidth: 1, borderColor: '#2C2733', borderRadius: 12, padding: 12, marginBottom: 10 },
  rowTop: { flexDirection: 'row', alignItems: 'center' },
  icon: { fontSize: 22, marginRight: 10 },
  meta: { flex: 1 },
  name: { color: '#E8E1D6', fontWeight: '700', fontSize: 14 },
  tier: { color: '#A8A097', fontSize: 11, marginTop: 2 },
  statusPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, backgroundColor: 'rgba(168, 160, 151,0.12)' },
  statusText: { fontSize: 11, fontWeight: '700' },
  owned: { color: '#fde68a' },
  eq: { color: '#E0B252' },
  locked: { color: '#F2A3A5' },
  bonusesRow: { marginTop: 8 },
  bonus: { color: '#a3e635', fontSize: 11, marginRight: 8 },
  reqBox: { marginTop: 10, backgroundColor: '#0E0C11', borderRadius: 8, borderWidth: 1, borderColor: '#2C2733', padding: 10 },
  reqRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  reqIcon: { fontSize: 18, marginRight: 8 },
  reqText: { fontSize: 12 },
  reqOk: { color: '#F6E7C1' },
  reqMissing: { color: '#F2A3A5' },
  actions: { marginTop: 10, alignItems: 'flex-end' },
  btn: { backgroundColor: '#3DD68C', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  btnDisabled: { backgroundColor: '#3A2E14' },
  btnText: { color: '#0E0C11', fontWeight: '800' },
});
