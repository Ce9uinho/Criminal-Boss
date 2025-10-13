import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useGameStore } from '@/store/gameStore';
import { SKILL_ICONS } from '@/constants/gameData';

interface SkillListProps {
    selectedSkill: string | null;
    onSetSelectedSkill: (skillId: string) => void;
    onClose: () => void;
}

export function SkillList({ selectedSkill, onSetSelectedSkill, onClose }: SkillListProps) {
    const { skills } = useGameStore();

    const skillEntries = Object.entries(skills);
    const priorityOrder = ['smuggling', 'thieving'] as const;
    const prioritized = priorityOrder
        .map((id) => skillEntries.find(([sid]) => sid === id))
        .filter((e): e is [string, (typeof skills)[keyof typeof skills]] => Array.isArray(e));
    const remaining = skillEntries.filter(([sid]) => !priorityOrder.includes(sid as any));
    const ordered = [...prioritized, ...remaining];

    return (
        <View style={styles.skillOverlay}>
            <ScrollView style={styles.skillList} showsVerticalScrollIndicator={false}>
                <Text style={styles.skillSectionTitle}>PRODUCTION SKILLS</Text>
                {ordered.map(([skillId, skill]) => {
                    const isActive = skill.isActive;
                    const isSelected = selectedSkill === skillId;
                    return (
                        <TouchableOpacity
                            key={skillId}
                            style={[
                                styles.skillItem,
                                isSelected && styles.selectedSkillItem,
                                isActive && styles.activeSkillItem
                            ]}
                            onPress={() => {
                                onSetSelectedSkill(skillId);
                                onClose();
                            }}
                        >
                            <Text style={styles.skillIcon}>{SKILL_ICONS[skillId]}</Text>
                            <View style={styles.skillInfo}>
                                <Text style={styles.skillName}>{skill.name}</Text>
                                <Text style={[styles.skillLevel, isActive && styles.activeSkillLevel]}>
                                    Level {skill.level}/100
                                </Text>
                            </View>
                            {isActive && <View style={styles.activeIndicator} />}
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    skillOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        zIndex: 1000,
        paddingTop: 20,
      },
      skillList: {
        flex: 1,
        paddingHorizontal: 16,
      },
      skillSectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#4ade80',
        marginBottom: 16,
        textAlign: 'center',
      },
      skillItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a1a2e',
        padding: 16,
        marginBottom: 8,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#2a2a3e',
      },
      selectedSkillItem: {
        borderColor: '#4ade80',
        backgroundColor: 'rgba(74, 222, 128, 0.1)',
      },
      activeSkillItem: {
        borderColor: '#fbbf24',
        backgroundColor: 'rgba(251, 191, 36, 0.1)',
      },
      skillIcon: {
        fontSize: 32,
        marginRight: 16,
      },
      skillInfo: {
        flex: 1,
      },
      skillName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
      },
      skillLevel: {
        fontSize: 14,
        color: '#888',
      },
      activeSkillLevel: {
        color: '#fbbf24',
      },
      activeIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#fbbf24',
      },
})
