import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGameStore } from '@/store/gameStore';
import { ACHIEVEMENTS, ACHIEVEMENT_CATEGORIES, getAchievementDescription } from '@/constants/achievements';
import { Trophy, Coins, Package, Boxes, TrendingUp, Award, Wrench, GraduationCap, Crown, Factory, Gem, Target, Flag, Wine, Microscope, UserX } from 'lucide-react-native';
import { AchievementCategory } from '@/types/game';

const iconMap: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
  Trophy,
  Coins,
  Package,
  Boxes,
  TrendingUp,
  Award,
  Wrench,
  GraduationCap,
  Crown,
  Factory,
  Gem,
  Target,
  Flag,
  Wine,
  Microscope,
  UserX,
};

export default function AchievementsScreen() {
  const insets = useSafeAreaInsets();
  const { skills, bank, mastery, gold } = useGameStore();
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | null>('smuggling');

  const snapshot = React.useMemo(() => {
    const skillsArray = Object.values(skills ?? {});
    const skillLevels: Record<string, number> = Object.fromEntries(Object.entries(skills ?? {}).map(([id, s]) => [id, s.level ?? 1]));
    const averageSkillLevel = (() => {
      const count = skillsArray.length;
      if (count === 0) return 1;
      const sum = skillsArray.reduce((acc, s) => acc + (s.level || 1), 0);
      return Math.floor(sum / count);
    })();
    const highestSkillLevel = skillsArray.reduce((max, s) => Math.max(max, s.level || 1), 1);
    const totalItemsInBank = Object.values(bank ?? {}).reduce((sum, it) => sum + (it.quantity || 0), 0);
    const uniqueItemsInBank = Object.keys(bank ?? {}).length;
    const masteryLevels = Object.values(mastery ?? {}).map(m => m.level || 1);
    const masteryMilestones25 = masteryLevels.filter(l => l >= 25).length;
    const masteryMilestones50 = masteryLevels.filter(l => l >= 50).length;
    const masteryMilestones75 = masteryLevels.filter(l => l >= 75).length;
    const masteryMilestones100 = masteryLevels.filter(l => l >= 100).length;
    return {
      gold: gold ?? 0,
      totalItemsInBank,
      uniqueItemsInBank,
      averageSkillLevel,
      highestSkillLevel,
      masteryMilestones25,
      masteryMilestones50,
      masteryMilestones75,
      masteryMilestones100,
      skillLevels,
      perSkill: {},
    };
  }, [skills, bank, mastery, gold]);

  const achievementsByCategory = useMemo(() => {
    const grouped: Record<AchievementCategory, typeof ACHIEVEMENTS> = {
      general: [],
      drug_factory: [],
      distillery: [],
      smuggling: [],
      investigation_lab: [],
      thieving: [],
    };
    ACHIEVEMENTS.forEach(ach => {
      grouped[ach.category].push(ach);
    });
    return grouped;
  }, []);

  const categoryProgress = useMemo(() => {
    const progress: Record<AchievementCategory, { completed: number; total: number; percentage: number }> = {
      general: { completed: 0, total: 0, percentage: 0 },
      drug_factory: { completed: 0, total: 0, percentage: 0 },
      distillery: { completed: 0, total: 0, percentage: 0 },
      smuggling: { completed: 0, total: 0, percentage: 0 },
      investigation_lab: { completed: 0, total: 0, percentage: 0 },
      thieving: { completed: 0, total: 0, percentage: 0 },
    };

    ACHIEVEMENTS.forEach(ach => {
      const level = ach.evaluate(snapshot);
      const maxTiers = 5;
      progress[ach.category].completed += level;
      progress[ach.category].total += maxTiers;
    });

    Object.keys(progress).forEach(cat => {
      const key = cat as AchievementCategory;
      if (progress[key].total > 0) {
        progress[key].percentage = Math.floor((progress[key].completed / progress[key].total) * 100);
      }
    });

    return progress;
  }, [snapshot]);

  const displayedAchievements = useMemo(() => {
    if (!selectedCategory) return [];
    return achievementsByCategory[selectedCategory];
  }, [selectedCategory, achievementsByCategory]);

  if (!selectedCategory) {
    return (
      <ScrollView 
        style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]} 
        contentContainerStyle={styles.content} 
        testID="achievements-screen"
      >
        <Text style={styles.title}>Achievements</Text>
        <Text style={styles.subtitle}>Select a category to view achievements.</Text>

        {ACHIEVEMENT_CATEGORIES.map(cat => {
          const Icon = iconMap[cat.icon] ?? Trophy;
          const prog = categoryProgress[cat.id];
          return (
            <TouchableOpacity 
              key={cat.id} 
              style={styles.categoryCard}
              onPress={() => setSelectedCategory(cat.id)}
              testID={`category-${cat.id}`}
            >
              <View style={styles.categoryHeader}>
                <View style={styles.categoryTitleRow}>
                  <Icon size={24} color="#fbbf24" />
                  <Text style={styles.categoryTitle}>{cat.name}</Text>
                </View>
                <Text style={styles.categoryPercentage}>{prog.percentage}%</Text>
              </View>
              <View style={styles.categoryProgressBar}>
                <View style={[styles.categoryProgressFill, { width: `${prog.percentage}%` }]} />
              </View>
              <Text style={styles.categoryStats}>{prog.completed} / {prog.total} tiers completed</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );
  }

  const currentCategory = ACHIEVEMENT_CATEGORIES.find(c => c.id === selectedCategory);
  const CategoryIcon = currentCategory ? iconMap[currentCategory.icon] ?? Trophy : Trophy;

  return (
    <ScrollView 
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]} 
      contentContainerStyle={styles.content} 
      testID="achievements-screen"
    >
      <TouchableOpacity onPress={() => setSelectedCategory(null)} style={styles.backButton}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.categoryHeaderInline}>
        <CategoryIcon size={28} color="#fbbf24" />
        <Text style={styles.title}>{currentCategory?.name}</Text>
      </View>
      <Text style={styles.subtitle}>
        {categoryProgress[selectedCategory].completed} / {categoryProgress[selectedCategory].total} tiers completed ({categoryProgress[selectedCategory].percentage}%)
      </Text>

      {displayedAchievements.map(def => {
        const level = Math.max(0, Math.min(5, def.evaluate(snapshot)));
        const Icon = iconMap[def.icon] ?? Trophy;
        const percentage = Math.floor((level / 5) * 100);
        
        return (
          <View key={def.id} style={styles.card} testID={`ach-${def.id}`}>
            <View style={styles.headerRow}>
              <Icon size={20} color="#fbbf24" />
              <Text style={styles.cardTitle}>{def.title}</Text>
              <Text style={styles.achievementPercentage}>{percentage}%</Text>
            </View>
            <Text style={styles.desc}>{getAchievementDescription(def, level)}</Text>

            <View style={styles.progressBarContainer}>
              {Array.from({ length: 5 }).map((_, idx) => {
                const filled = idx < level;
                const labels = ['basics','easy','médium','hard','expert'] as const;
                return (
                  <View key={idx} style={styles.barSegment}>
                    <View style={[styles.barPiece, filled ? styles.barPieceFilled : styles.barPieceEmpty]} />
                    <Text style={[styles.barLabel, filled ? styles.barLabelOn : styles.barLabelOff]}>{labels[idx]}</Text>
                  </View>
                );
              })}
            </View>


          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800' as const,
    marginBottom: 4,
  },
  subtitle: {
    color: '#9ca3af',
    fontSize: 12,
    marginBottom: 16,
  },
  categoryCard: {
    backgroundColor: '#111827',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1f2937',
    padding: 16,
    marginBottom: 12,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700' as const,
  },
  categoryPercentage: {
    color: '#4ade80',
    fontSize: 18,
    fontWeight: '700' as const,
  },
  categoryProgressBar: {
    height: 8,
    backgroundColor: '#1f2937',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  categoryProgressFill: {
    height: '100%',
    backgroundColor: '#4ade80',
    borderRadius: 4,
  },
  categoryStats: {
    color: '#9ca3af',
    fontSize: 12,
  },
  backButton: {
    marginBottom: 16,
  },
  backText: {
    color: '#60a5fa',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  categoryHeaderInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1f2937',
    padding: 14,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700' as const,
    flex: 1,
  },
  achievementPercentage: {
    color: '#4ade80',
    fontSize: 14,
    fontWeight: '700' as const,
  },
  desc: {
    color: '#cbd5e1',
    fontSize: 12,
    marginBottom: 12,
  },
  progressBarContainer: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 12,
  },
  barSegment: {
    flex: 1,
    alignItems: 'center',
  },
  barPiece: {
    width: '100%',
    height: 24,
    borderRadius: 4,
    marginBottom: 4,
  },
  barPieceEmpty: {
    backgroundColor: '#1f2937',
  },
  barPieceFilled: {
    backgroundColor: '#4ade80',
  },
  barLabel: {
    fontSize: 9,
    textAlign: 'center',
  },
  barLabelOn: {
    color: '#4ade80',
    fontWeight: '700' as const,
  },
  barLabelOff: {
    color: '#64748b',
  },
});
