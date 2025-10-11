import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { X, Clock, CheckCircle } from 'lucide-react-native';
import { MasteryPerk } from '@/types/game';

interface MasteryPerksModalProps {
  visible: boolean;
  onClose: () => void;
  itemName: string;
  currentMasteryLevel: number;
  isThieving?: boolean;
  isSmuggling?: boolean;
  isInvestigationLab?: boolean;
}

const MASTERY_PERKS: MasteryPerk[] = [
  {
    level: 1,
    description: 'Basic production efficiency unlocked',
    timeReduction: 0,
  },
  {
    level: 25,
    description: 'Production time reduced by 5%',
    timeReduction: 5,
  },
  {
    level: 50,
    description: 'Production time reduced by 10%',
    timeReduction: 10,
  },
  {
    level: 75,
    description: 'Production time reduced by 15%',
    timeReduction: 15,
  },
  {
    level: 100,
    description: 'Production time reduced by 25% (MAX)',
    timeReduction: 25,
  },
];

const THIEVING_MASTERY_PERKS: MasteryPerk[] = [
  {
    level: 1,
    description: 'Basic thieving techniques unlocked',
    timeReduction: 0,
  },
  {
    level: 25,
    description: 'Failure chance reduced by 24% • Cooldown reduced by 12.5%',
    timeReduction: 0,
  },
  {
    level: 50,
    description: 'Failure chance reduced by 48% • Cooldown reduced by 25%',
    timeReduction: 0,
  },
  {
    level: 75,
    description: 'Failure chance reduced by 71% • Cooldown reduced by 37.5%',
    timeReduction: 0,
  },
  {
    level: 100,
    description: 'Failure chance reduced by 95% (MAX) • Cooldown reduced by 50% (MAX)',
    timeReduction: 0,
  },
];

function getSmugglingPerks(): MasteryPerk[] {
  return [
    {
      level: 1,
      description: 'Items per action +1 (2 total)',
      timeReduction: 0,
    },
    {
      level: 25,
      description: 'Items per action +1 • Time reduced by 5%',
      timeReduction: 5,
    },
    {
      level: 50,
      description: 'Items per action +2 • Time reduced by 10%',
      timeReduction: 10,
    },
    {
      level: 75,
      description: 'Items per action +3 • Time reduced by 15%',
      timeReduction: 15,
    },
    {
      level: 100,
      description: 'Items per action +5 • Time reduced by 25% (MAX)',
      timeReduction: 25,
    },
  ];
}

export const MasteryPerksModal: React.FC<MasteryPerksModalProps> = ({
  visible,
  onClose,
  itemName,
  currentMasteryLevel,
  isThieving = false,
  isSmuggling = false,
  isInvestigationLab = false,
}) => {
  const perks = isThieving ? THIEVING_MASTERY_PERKS : isSmuggling ? getSmugglingPerks() : MASTERY_PERKS;
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Mastery Perks</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={20} color="#ccc" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.itemName}>{itemName}</Text>
          <Text style={styles.currentLevel}>
            Current Level: {currentMasteryLevel}
          </Text>
          
          <Text style={styles.description}>
            Higher mastery levels unlock better perks
          </Text>
          
          <View style={styles.perksContainer}>
            {perks.map((perk) => {
              const isUnlocked = currentMasteryLevel >= perk.level;
              return (
                <View
                  key={perk.level}
                  style={[
                    styles.perkItem,
                    isUnlocked && styles.perkItemUnlocked,
                  ]}
                >
                  <View style={styles.perkHeader}>
                    <View style={styles.perkLevel}>
                      {isUnlocked ? (
                        <CheckCircle size={12} color="#4CAF50" />
                      ) : (
                        <Clock size={12} color="#999" />
                      )}
                      <Text
                        style={[
                          styles.perkLevelText,
                          isUnlocked && styles.perkLevelTextUnlocked,
                        ]}
                      >
                        Lv {perk.level}
                      </Text>
                    </View>
                    {isUnlocked && (
                      <View style={styles.activeBadge}>
                        <Text style={styles.activeBadgeText}>✓</Text>
                      </View>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.perkDescription,
                      isUnlocked && styles.perkDescriptionUnlocked,
                    ]}
                  >
                    {perk.description}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    width: '90%',
    maxWidth: 380,
    maxHeight: '80%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    padding: 4,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ccc',
    marginBottom: 6,
  },
  currentLevel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
  },
  perksContainer: {
    gap: 6,
  },
  perkItem: {
    backgroundColor: '#2a2a2a',
    borderRadius: 6,
    padding: 8,
    borderWidth: 1,
    borderColor: '#333',
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 50,
  },
  perkItemUnlocked: {
    backgroundColor: '#1a3a1a',
    borderColor: '#4CAF50',
  },
  perkHeader: {
    alignItems: 'center',
    marginRight: 12,
    minWidth: 50,
  },
  perkLevel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  perkLevelText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#999',
  },
  perkLevelTextUnlocked: {
    color: '#4CAF50',
  },
  activeBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 6,
    minWidth: 14,
    alignItems: 'center',
  },
  activeBadgeText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
  },
  perkDescription: {
    fontSize: 10,
    color: '#ccc',
    lineHeight: 13,
    flex: 1,
  },
  perkDescriptionUnlocked: {
    color: '#fff',
    fontWeight: '500',
  },
  description: {
    fontSize: 11,
    color: '#aaa',
    lineHeight: 14,
    marginBottom: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
