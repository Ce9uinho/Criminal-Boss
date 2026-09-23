import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGameStore } from '@/store/gameStore';
import { ACHIEVEMENTS, ACHIEVEMENT_CATEGORIES, getAchievementDescription } from '@/constants/achievements';
import { Trophy, Coins, Package, Boxes, TrendingUp, Award, Wrench, GraduationCap, Crown, Factory, Gem, Target, Flag, Wine, Microscope, UserX } from 'lucide-react-native';
import { AchievementCategory } from '@/types/game';
import { useAchievementSnapshot } from '@/hooks/useAchievementSnapshot';

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
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | null>('smuggling');
  const snapshot = useAchievementSnapshot();

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
                  <Icon size={24} color="#E0B252" />
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
        <CategoryIcon size={28} color="#E0B252" />
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
              <Icon size={20} color="#E0B252" />
              <Text style={styles.cardTitle}>{def.title}</Text>
              <Text style={styles.achievementPercentage}>{percentage}%</Text>
            </View>
            <Text style={styles.desc}>{getAchievementDescription(def, level)}</Text>

            <View style={styles.progressBarContainer}>
              {Array.from({ length: 5 }).map((_, idx) => {
                const filled = idx < level;
                const labels = ['basics','easy','medium','hard','expert'] as const;
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
    backgroundColor: '#0B0A0D',
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
    color: '#A8A097',
    fontSize: 12,
    marginBottom: 16,
  },
  categoryCard: {
    backgroundColor: '#16131A',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2C2733',
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
    color: '#E0B252',
    fontSize: 18,
    fontWeight: '700' as const,
  },
  categoryProgressBar: {
    height: 8,
    backgroundColor: '#2C2733',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  categoryProgressFill: {
    height: '100%',
    backgroundColor: '#E0B252',
    borderRadius: 4,
  },
  categoryStats: {
    color: '#A8A097',
    fontSize: 12,
  },
  backButton: {
    marginBottom: 16,
  },
  backText: {
    color: '#E0B252',
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
    backgroundColor: '#16131A',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2C2733',
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
    color: '#E0B252',
    fontSize: 14,
    fontWeight: '700' as const,
  },
  desc: {
    color: '#E8E1D6',
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
    backgroundColor: '#2C2733',
  },
  barPieceFilled: {
    backgroundColor: '#E0B252',
  },
  barLabel: {
    fontSize: 9,
    textAlign: 'center',
  },
  barLabelOn: {
    color: '#E0B252',
    fontWeight: '700' as const,
  },
  barLabelOff: {
    color: '#7A7269',
  },
});
