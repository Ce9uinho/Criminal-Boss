import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Menu } from 'lucide-react-native';
import { SKILL_ICONS } from '@/constants/gameData';
import { formatCash } from '@/constants/numberFormat';

interface MobileHeaderProps {
    selectedSkill: string | null;
    playerLevel: number;
    gold: number;
    onShowGameMenu: () => void;
}

export function MobileHeader({ selectedSkill, playerLevel, gold, onShowGameMenu }: MobileHeaderProps) {
    return (
        <View style={styles.mobileHeader}>
            <TouchableOpacity
                style={styles.menuButton}
                onPress={onShowGameMenu}
            >
                <Menu size={24} color="#fff" />
            </TouchableOpacity>

            <Text style={styles.gameName} testID="game-title">{selectedSkill ? `${SKILL_ICONS[selectedSkill]} ` : '🎮 '}Criminal Boss</Text>

            <View style={styles.headerStats}>
                <View style={styles.statChip} testID="chip-level">
                    <Text style={styles.statChipText}>LV {playerLevel}</Text>
                </View>
                <View style={[styles.statChip, styles.statChipGold]} testID="chip-gold">
                    <Text style={styles.statChipText}>${formatCash(gold)}</Text>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    mobileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#1a1a2e',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#2a2a3e',
        zIndex: 1,
    },
    menuButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: '#2a2a3e',
    },
    gameName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        flex: 1,
        textAlign: 'center',
    },
    headerStats: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statChip: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: 'rgba(74, 222, 128, 0.15)',
        borderWidth: 1,
        borderColor: 'rgba(74, 222, 128, 0.6)',
        marginLeft: 8,
    },
    statChipGold: {
        backgroundColor: 'rgba(218, 165, 32, 0.15)',
        borderColor: 'rgba(218, 165, 32, 0.6)',
    },
    statChipText: {
        fontSize: 12,
        color: '#fff',
        fontWeight: '700',
        letterSpacing: 0.3,
    },
})
