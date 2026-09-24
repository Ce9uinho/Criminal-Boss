import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGameStore } from '@/store/gameStore';
import { ACHIEVEMENTS } from '@/constants/achievements';
import { formatCash } from '@/constants/numberFormat';
import { SKILL_ICONS, getXpForLevel, RESOURCES } from '@/constants/gameData';
import { User, Crown, Trophy, Clock, Coins, TrendingUp, Star, Award, Target, Calendar, Skull, Cigarette, Bomb, Car, DollarSign, Save, Briefcase, Bike, Syringe } from 'lucide-react-native';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { skills, bank, mastery, gold, playerName, playerIcon, setPlayerName, setPlayerIcon, lifetimeStats } = useGameStore();
  const unlockedCount = useGameStore(s => Object.keys(s.achievementsUnlocked).length);
  const achievementTotals = { completed: unlockedCount, total: ACHIEVEMENTS.length };
  const totalProduced = Object.values(lifetimeStats?.produced ?? {}).reduce((sum, n) => sum + n, 0);
  const [editOpen, setEditOpen] = useState<boolean>(false);
  const [draftName, setDraftName] = useState<string>(playerName ?? '');
  const ICONS = useMemo(() => ['Skull','Cigarette','Bomb','Car','DollarSign','Safe','Briefcase','Knife','Syringe','Crown'] as const, []);
  const renderIcon = useCallback((name: string, size: number, color: string) => {
    const common = { size, color } as const;
    switch (name) {
      case 'Skull': return <Skull {...common} />;
      case 'Cigarette': return <Cigarette {...common} />;
      case 'Bomb': return <Bomb {...common} />;
      case 'Car': return <Car {...common} />;
      case 'DollarSign': return <DollarSign {...common} />;
      case 'Safe': return <Save {...common} />;
      case 'Briefcase': return <Briefcase {...common} />;
      case 'Knife': return <Bike {...common} />;
      case 'Syringe': return <Syringe {...common} />;
      case 'Crown': return <Crown {...common} />;
      default: return <User {...common} />;
    }
  }, []);
  const onOpenEdit = useCallback(() => {
    console.log('Opening profile edit modal');
    setDraftName(playerName ?? '');
    setEditOpen(true);
  }, [playerName]);
  const onSave = useCallback(() => {
    const sanitized = (draftName ?? '').trim().substring(0, 20);
    setPlayerName(sanitized || 'Player');
    setEditOpen(false);
  }, [draftName, setPlayerName]);

  const getPlayerLevel = () => {
    const skillList = Object.values(skills);
    const count = skillList.length;
    if (count === 0) return 1;
    const sum = skillList.reduce((acc, s) => acc + (typeof s.level === 'number' ? s.level : 1), 0);
    const avg = Math.floor(sum / count);
    return Math.max(1, avg);
  };

  const getTotalXp = () => {
    return Object.values(skills).reduce((sum, skill) => sum + skill.experience, 0);
  };

  const getHighestSkill = () => {
    return Object.values(skills).reduce((highest, skill) => 
      skill.level > highest.level ? skill : highest
    );
  };

  const getTotalBankValue = () => {
    return Object.values(bank).reduce((total, item) => {
      const resource = RESOURCES[item.resourceId];
      return total + (resource ? resource.value * item.quantity : 0);
    }, 0);
  };

  const getTotalMasteryLevels = () => {
    return Object.values(mastery).reduce((total, m) => total + m.level, 0);
  };

  const StatCard = ({ 
    icon, 
    title, 
    value, 
    subtitle,
    color = '#E0B252' 
  }: { 
    icon: React.ReactNode; 
    title: string; 
    value: string | number; 
    subtitle?: string;
    color?: string;
  }) => (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: `${color}20` }]}>
        <Text>{icon}</Text>
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statTitle}>{title}</Text>
        <Text style={[styles.statValue, { color }]}>{value}</Text>
        {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
      </View>
    </View>
  );

  const SkillProgress = ({ skillId, skill }: { skillId: string; skill: any }) => {
    const currentLevelXp = getXpForLevel(skill.level);
    const nextLevelXp = getXpForLevel(skill.level + 1);
    const progress = skill.level >= 100 ? 100 : 
      ((skill.experience - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;

    return (
      <View style={styles.skillProgress}>
        <View style={styles.skillHeader}>
          <Text style={styles.skillEmoji}>{SKILL_ICONS[skillId]}</Text>
          <View style={styles.skillInfo}>
            <Text style={styles.skillName}>{skill.name}</Text>
            <Text style={styles.skillLevel}>Level {skill.level}</Text>
          </View>
          <Text style={styles.skillXp}>{skill.experience.toLocaleString()} XP</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${Math.min(progress, 100)}%` }]} />
        </View>
      </View>
    );
  };

  const SectionHeader = ({ title, icon }: { title: string; icon?: React.ReactNode }) => (
    <View style={styles.sectionHeader}>
      {icon && <View style={styles.sectionIcon}><Text>{icon}</Text></View>}
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  const highestSkill = getHighestSkill();
  const playerLevel = getPlayerLevel();
  const totalXp = getTotalXp();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <TouchableOpacity style={styles.avatarContainer} onPress={onOpenEdit} accessibilityRole="button" testID="editProfileButton">
            {renderIcon(playerIcon ?? 'Skull', 48, '#E0B252')}
          </TouchableOpacity>
          <View style={styles.profileInfo}>
            <Text style={styles.playerName}>{playerName ?? 'Player'}</Text>
            <Text style={styles.playerTitle}>Level {Math.floor(playerLevel)} Criminal</Text>
            <View style={styles.xpContainer}>
              <Text style={styles.xpText}>{totalXp.toLocaleString()} Total XP</Text>
              <Crown size={16} color="#E0B252" />
            </View>
          </View>
        </View>

        {/* Quick Stats */}
        <SectionHeader title="OVERVIEW" icon={<TrendingUp size={20} color="#E0B252" />} />
        
        <View style={styles.statsGrid}>
          <StatCard
            icon={<Coins size={20} color="#E0B252" />}
            title="Net Worth"
            value={`$${(gold + getTotalBankValue()).toLocaleString()}`}
            subtitle="Gold + Bank Value"
            color="#E0B252"
          />
          
          <StatCard
            icon={<Clock size={20} color="#8b5cf6" />}
            title="Goods Moved"
            value={formatCash(totalProduced)}
            subtitle="Crafted + stolen"
            color="#8b5cf6"
          />
          
          <StatCard
            icon={<Trophy size={20} color="#E0B252" />}
            title="Achievements"
            value={`${achievementTotals.completed}/${achievementTotals.total}`}
            subtitle="Unlocked"
            color="#E0B252"
          />
          
          <StatCard
            icon={<Star size={20} color="#ec4899" />}
            title="Mastery Levels"
            value={getTotalMasteryLevels()}
            subtitle="Total"
            color="#ec4899"
          />
        </View>

        {/* Detailed Stats */}
        <SectionHeader title="STATISTICS" icon={<Target size={20} color="#E0B252" />} />
        
        <View style={styles.detailedStats}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Highest Skill</Text>
            <Text style={styles.statValue}>
              {SKILL_ICONS[highestSkill.id]} {highestSkill.name} (Lv.{highestSkill.level})
            </Text>
          </View>
          
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Bank Items</Text>
            <Text style={styles.statValue}>{Object.keys(bank).length} Types</Text>
          </View>
          
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Total Items</Text>
            <Text style={styles.statValue}>
              {Object.values(bank).reduce((sum, item) => sum + item.quantity, 0).toLocaleString()}
            </Text>
          </View>
          
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Bank Value</Text>
            <Text style={styles.statValue}>${getTotalBankValue().toLocaleString()}</Text>
          </View>
          
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Active Skills</Text>
            <Text style={styles.statValue}>
              {Object.values(skills).filter(skill => skill.isActive).length}
            </Text>
          </View>
        </View>

        {/* Skills Progress */}
        <SectionHeader title="SKILL PROGRESS" icon={<Award size={20} color="#E0B252" />} />
        
        <View style={styles.skillsContainer}>
          {Object.entries(skills)
            .sort(([,a], [,b]) => b.level - a.level)
            .map(([skillId, skill]) => (
              <SkillProgress key={skillId} skillId={skillId} skill={skill} />
            ))}
        </View>

        {/* Recent Achievements */}
        <SectionHeader title="RECENT MILESTONES" icon={<Calendar size={20} color="#E0B252" />} />
        
        <View style={styles.achievementsContainer}>
          {playerLevel >= 50 && (
            <TouchableOpacity style={styles.achievementItem}>
              <Crown size={24} color="#E0B252" />
              <View style={styles.achievementContent}>
                <Text style={styles.achievementTitle}>High Roller</Text>
                <Text style={styles.achievementDesc}>Reached level 50</Text>
              </View>
            </TouchableOpacity>
          )}
          
          {gold >= 50000 && (
            <TouchableOpacity style={styles.achievementItem}>
              <Coins size={24} color="#E0B252" />
              <View style={styles.achievementContent}>
                <Text style={styles.achievementTitle}>Money Bags</Text>
                <Text style={styles.achievementDesc}>Accumulated $50,000</Text>
              </View>
            </TouchableOpacity>
          )}
          
          {Object.keys(bank).length >= 20 && (
            <TouchableOpacity style={styles.achievementItem}>
              <Trophy size={24} color="#E0B252" />
              <View style={styles.achievementContent}>
                <Text style={styles.achievementTitle}>Collector</Text>
                <Text style={styles.achievementDesc}>Own 20+ different items</Text>
              </View>
            </TouchableOpacity>
          )}
          
          {getTotalBankValue() >= 100000 && (
            <TouchableOpacity style={styles.achievementItem}>
              <Star size={24} color="#ec4899" />
              <View style={styles.achievementContent}>
                <Text style={styles.achievementTitle}>Empire Builder</Text>
                <Text style={styles.achievementDesc}>Bank worth $100,000+</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Keep building your empire!</Text>
        </View>
        {/* Edit Modal */}
        <Modal visible={editOpen} transparent animationType={Platform.OS === 'web' ? 'fade' : 'slide'} onRequestClose={() => setEditOpen(false)}>
          <View style={styles.modalBackdrop} testID="profileEditModal_backdrop">
            <TouchableOpacity style={styles.modalBackdropTouchable} activeOpacity={1} onPress={() => setEditOpen(false)} testID="profileEditModal_backdropTap" />
            <View style={styles.modalCard} testID="profileEditModal">
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                testID="nameInput"
                value={draftName}
                onChangeText={setDraftName}
                placeholder="Enter name"
                placeholderTextColor="#6F685F"
                style={styles.input}
                maxLength={20}
                returnKeyType="done"
              />
              <Text style={[styles.inputLabel, { marginTop: 16 }]}>Choose Icon</Text>
              <View style={styles.iconGrid}>
                {ICONS.map((name) => {
                  const selected = (playerIcon ?? 'Skull') === name;
                  return (
                    <TouchableOpacity
                      key={name}
                      style={[styles.iconCell, selected ? styles.iconCellSelected : undefined]}
                      onPress={() => setPlayerIcon(name)}
                      testID={`icon_${name}`}
                    >
                      {renderIcon(name, 28, selected ? '#121016' : '#E0B252')}
                      <Text style={styles.iconLabel}>{name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <View style={styles.modalActions}>
                <TouchableOpacity onPress={() => setEditOpen(false)} style={[styles.actionBtn, styles.cancelBtn]} testID="cancelEditBtn">
                  <Text style={styles.actionText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onSave} style={[styles.actionBtn, styles.saveBtn]} testID="saveEditBtn">
                  <Text style={[styles.actionText, { color: '#121016' }]}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0A0D',
  },
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18151D',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E0B252',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(224, 178, 82, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#E0B252',
  },
  profileInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  playerTitle: {
    fontSize: 16,
    color: '#E0B252',
    marginBottom: 8,
  },
  xpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  xpText: {
    fontSize: 14,
    color: '#8F877E',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 12,
    marginHorizontal: 20,
  },
  sectionIcon: {
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#E0B252',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 8,
    gap: 8,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18151D',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2C2733',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statTitle: {
    fontSize: 12,
    color: '#8F877E',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E0B252',
  },
  statSubtitle: {
    fontSize: 10,
    color: '#6F685F',
    marginTop: 2,
  },
  detailedStats: {
    backgroundColor: '#18151D',
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2C2733',
    padding: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2733',
  },
  statLabel: {
    fontSize: 14,
    color: '#8F877E',
  },
  skillsContainer: {
    marginHorizontal: 16,
  },
  skillProgress: {
    backgroundColor: '#18151D',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2C2733',
    marginBottom: 8,
  },
  skillHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  skillEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  skillInfo: {
    flex: 1,
  },
  skillName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  skillLevel: {
    fontSize: 12,
    color: '#E0B252',
  },
  skillXp: {
    fontSize: 12,
    color: '#8F877E',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#2C2733',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#E0B252',
    borderRadius: 3,
  },
  achievementsContainer: {
    marginHorizontal: 16,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18151D',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2C2733',
    marginBottom: 8,
  },
  achievementContent: {
    flex: 1,
    marginLeft: 16,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  achievementDesc: {
    fontSize: 13,
    color: '#8F877E',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 16,
    color: '#E0B252',
    fontStyle: 'italic',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalBackdropTouchable: {
    flex: 1,
  },
  modalCard: {
    backgroundColor: '#16131A',
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 1,
    borderColor: '#2C2733',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  inputLabel: {
    color: '#A8A097',
    fontSize: 12,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#0E0C11',
    borderWidth: 1,
    borderColor: '#2C2733',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    color: '#fff',
    fontSize: 16,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  iconCell: {
    width: '30%',
    backgroundColor: '#0E0C11',
    borderWidth: 1,
    borderColor: '#2C2733',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCellSelected: {
    borderColor: '#3DD68C',
    backgroundColor: '#3DD68C33',
  },
  iconLabel: {
    color: '#A8A097',
    fontSize: 11,
    marginTop: 6,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
  },
  actionBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
  },
  cancelBtn: {
    borderColor: '#3E3648',
  },
  saveBtn: {
    borderColor: '#3DD68C',
    backgroundColor: '#3DD68C',
  },
  actionText: {
    color: '#E8E1D6',
    fontWeight: '600',
  },
});
