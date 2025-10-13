import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useGameStore } from '@/store/gameStore';
import { SKILL_ICONS, getXpForLevel } from '@/constants/gameData';
import { formatCash } from '@/constants/numberFormat';
import { HeaderXpToasts } from './XpToasts';

interface SkillHeaderProps {
    selectedSkill: string;
}

export function SkillHeader({ selectedSkill }: SkillHeaderProps) {
    const { skills, heat } = useGameStore();
    const skill = skills[selectedSkill];

    if (!skill) {
        return null;
    }

    const renderXpBar = () => {
        const lvl = skill.level ?? 1;
        const exp = skill.experience ?? 0;

        if (lvl >= 100) {
            return (
                <View style={styles.mafiaXpBar}>
                    <View style={[styles.mafiaXpFill, { width: '100%' }]} />
                </View>
            );
        }

        const currentLevelXp = getXpForLevel(lvl);
        const nextLevelXp = getXpForLevel(lvl + 1);
        const denom = Math.max(1, (nextLevelXp ?? 0) - currentLevelXp);
        const pct = Math.min(100, Math.max(0, ((exp - currentLevelXp) / denom) * 100));

        return (
            <View style={styles.mafiaXpBar}>
                <View style={[styles.mafiaXpFill, { width: `${pct}%` }]} />
            </View>
        );
    };

    const renderXpToNext = () => {
        const lvl = skill.level ?? 1;

        if (lvl >= 100) {
            return 'MAX LEVEL';
        }

        const nextLevelXp = getXpForLevel(lvl + 1);
        const remaining = (nextLevelXp ?? 0) - (skill.experience ?? 0);

        return remaining > 0 ? `${formatCash(remaining)} TO NEXT LEVEL` : 'MAX LEVEL';
    };

    return (
        <View style={styles.skillHeader}>
            <View style={styles.mafiaHeaderContainer}>
                <View style={styles.mafiaHeaderLeft}>
                    <View style={styles.skillIconContainer}>
                        <Text style={styles.mafiaSkillIcon}>{SKILL_ICONS[selectedSkill]}</Text>
                    </View>
                    <View style={styles.skillInfoContainer}>
                        <Text style={styles.mafiaSkillName}>{skill.name ?? 'Skill'}</Text>
                        <Text style={styles.mafiaSkillLevel}>LEVEL {skill.level ?? 1}/100</Text>
                    </View>
                </View>
                <View style={styles.mafiaHeaderRight}>
                    <View style={styles.xpContainer}>
                        <Text style={styles.mafiaXpLabel}>EXPERIENCE</Text>
                        <Text style={styles.mafiaXpValue}>{formatCash(skill.experience ?? 0)}</Text>
                    </View>
                    <View style={styles.progressContainer}>
                        {renderXpBar()}
                        <Text style={styles.mafiaXpToNext}>
                            {renderXpToNext()}
                        </Text>
                    </View>
                </View>
                {selectedSkill === 'thieving' && (
                    <View style={styles.headerHeatContainer} testID="heat-section">
                        <View style={styles.heatHeaderBottom}>
                            <Text style={styles.heatLabel}>🔥 Heat Level</Text>
                            <Text style={[
                                styles.heatValue,
                                heat > 75 ? styles.heatCritical : heat > 50 ? styles.heatHigh : heat > 25 ? styles.heatMedium : styles.heatLow
                            ]}>
                                {heat}%
                            </Text>
                        </View>
                        <View style={styles.heatBar}>
                            <View style={[
                                styles.heatFill,
                                heat > 75 ? styles.heatFillCritical : heat > 50 ? styles.heatFillHigh : heat > 25 ? styles.heatFillMedium : styles.heatFillLow,
                                { width: `${Math.min(heat, 100)}%` }
                            ]} />
                        </View>
                    </View>
                )}
            </View>
            <HeaderXpToasts skillId={selectedSkill as string} />
        </View>
    );
}

const styles = StyleSheet.create({
    skillHeader: {
        backgroundColor: '#0f0f1a',
        paddingVertical: 12,
        paddingHorizontal: 16,
        position: 'relative',
      },
      mafiaHeaderContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(139, 69, 19, 0.1)',
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: 'rgba(139, 69, 19, 0.3)',
        shadowColor: '#8b4513',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
        flexWrap: 'wrap',
      },
      mafiaHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        minWidth: 160,
      },
      skillIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(139, 69, 19, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(139, 69, 19, 0.5)',
        marginRight: 12,
      },
      mafiaSkillIcon: {
        fontSize: 24,
        textShadowColor: '#8b4513',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
      },
      skillInfoContainer: {
        flex: 1,
      },
      mafiaSkillName: {
        fontSize: 18,
        fontWeight: '800',
        color: '#f5deb3',
        letterSpacing: 0.5,
        textShadowColor: 'rgba(0, 0, 0, 0.8)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
      },
      mafiaSkillLevel: {
        fontSize: 11,
        color: '#cd853f',
        fontWeight: '700',
        letterSpacing: 1,
        marginTop: 2,
      },
      mafiaHeaderRight: {
        alignItems: 'flex-end',
        minWidth: 120,
      },
      xpContainer: {
        alignItems: 'flex-end',
        marginBottom: 8,
      },
      mafiaXpLabel: {
        fontSize: 9,
        color: '#8b7355',
        fontWeight: '600',
        letterSpacing: 0.5,
      },
      mafiaXpValue: {
        fontSize: 16,
        fontWeight: '800',
        color: '#daa520',
        textShadowColor: 'rgba(218, 165, 32, 0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
      },
      progressContainer: {
        width: '100%',
      },
      mafiaXpBar: {
        height: 6,
        backgroundColor: 'rgba(139, 69, 19, 0.3)',
        borderRadius: 3,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(139, 69, 19, 0.5)',
        marginBottom: 4,
      },
      mafiaXpFill: {
        height: '100%',
        backgroundColor: '#daa520',
        borderRadius: 2,
        shadowColor: '#daa520',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 3,
      },
      mafiaXpToNext: {
        fontSize: 8,
        color: '#8b7355',
        fontWeight: '600',
        letterSpacing: 0.3,
        textAlign: 'right',
      },
      heatHeaderBottom: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
      },
      heatLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#ff6b6b',
      },
      heatValue: {
        fontSize: 16,
        fontWeight: 'bold',
      },
      heatLow: {
        color: '#4ade80',
      },
      heatMedium: {
        color: '#fbbf24',
      },
      heatHigh: {
        color: '#fb923c',
      },
      heatCritical: {
        color: '#ef4444',
      },
      headerHeatContainer: {
        width: '100%',
        marginTop: 10,
      },
      heatBar: {
        height: 6,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: 6,
      },
      heatFill: {
        height: '100%',
        borderRadius: 3,
      },
      heatFillLow: {
        backgroundColor: '#4ade80',
      },
      heatFillMedium: {
        backgroundColor: '#fbbf24',
      },
      heatFillHigh: {
        backgroundColor: '#fb923c',
      },
      heatFillCritical: {
        backgroundColor: '#ef4444',
      },
})
