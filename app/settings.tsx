import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGameStore } from '@/store/gameStore';
import { Volume2, VolumeX, Smartphone, Trash2, Download, Upload, Bell, BellOff, Swords } from 'lucide-react-native';

type Theme = 'dark' | 'light';
type NotificationSetting = 'all' | 'important' | 'none';

interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  notificationsEnabled: boolean;
  notificationLevel: NotificationSetting;
  theme: Theme;
  autoSave: boolean;
  compactMode: boolean;
}

const DEFAULT_SETTINGS: GameSettings = {
  soundEnabled: true,
  musicEnabled: true,
  notificationsEnabled: true,
  notificationLevel: 'all',
  theme: 'dark',
  autoSave: true,
  compactMode: false,
};

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { skills, bank, mastery, gold, maxAllSkills } = useGameStore();
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting] = useState(false);

  const updateSetting = <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    // In a real app, save settings to storage here
    console.log('Setting updated:', key, value);
  };

  const exportSave = async () => {
    try {
      setIsExporting(true);
      const gameData = {
        skills,
        bank,
        mastery,
        gold,
        lastSaved: Date.now(),
        exportedAt: new Date().toISOString(),
        version: '1.0.0'
      };
      
      const saveString = JSON.stringify(gameData, null, 2);
      console.log('Save data exported:', saveString.length, 'characters');
      
      console.log('Export completed - Size:', (saveString.length / 1024).toFixed(1), 'KB');
    } catch {
      console.error('Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const resetGame = () => {
    console.log('Reset game requested - would show confirmation modal in real app');
  };

  const SettingRow = ({ 
    icon, 
    title, 
    subtitle, 
    children 
  }: { 
    icon: React.ReactNode; 
    title: string; 
    subtitle?: string; 
    children: React.ReactNode; 
  }) => (
    <View style={styles.settingRow}>
      <View style={styles.settingIcon}>
        {icon}
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      <View style={styles.settingControl}>
        {children}
      </View>
    </View>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <SectionHeader title="AUDIO" />
        
        <SettingRow
          icon={settings.soundEnabled ? <Volume2 size={20} color="#4ade80" /> : <VolumeX size={20} color="#666" />}
          title="Sound Effects"
          subtitle="Play sound effects for actions"
        >
          <Switch
            value={settings.soundEnabled}
            onValueChange={(value) => updateSetting('soundEnabled', value)}
            trackColor={{ false: '#2a2a3e', true: '#4ade80' }}
            thumbColor={settings.soundEnabled ? '#fff' : '#666'}
          />
        </SettingRow>

        <SettingRow
          icon={settings.musicEnabled ? <Volume2 size={20} color="#4ade80" /> : <VolumeX size={20} color="#666" />}
          title="Background Music"
          subtitle="Play ambient background music"
        >
          <Switch
            value={settings.musicEnabled}
            onValueChange={(value) => updateSetting('musicEnabled', value)}
            trackColor={{ false: '#2a2a3e', true: '#4ade80' }}
            thumbColor={settings.musicEnabled ? '#fff' : '#666'}
          />
        </SettingRow>

        <SectionHeader title="NOTIFICATIONS" />
        
        <SettingRow
          icon={settings.notificationsEnabled ? <Bell size={20} color="#4ade80" /> : <BellOff size={20} color="#666" />}
          title="Push Notifications"
          subtitle="Receive notifications when offline"
        >
          <Switch
            value={settings.notificationsEnabled}
            onValueChange={(value) => updateSetting('notificationsEnabled', value)}
            trackColor={{ false: '#2a2a3e', true: '#4ade80' }}
            thumbColor={settings.notificationsEnabled ? '#fff' : '#666'}
          />
        </SettingRow>

        <SectionHeader title="GAMEPLAY" />
        
        <SettingRow
          icon={<Download size={20} color="#4ade80" />}
          title="Auto Save"
          subtitle="Automatically save progress every 30 seconds"
        >
          <Switch
            value={settings.autoSave}
            onValueChange={(value) => updateSetting('autoSave', value)}
            trackColor={{ false: '#2a2a3e', true: '#4ade80' }}
            thumbColor={settings.autoSave ? '#fff' : '#666'}
          />
        </SettingRow>

        <SettingRow
          icon={<Smartphone size={20} color="#4ade80" />}
          title="Compact Mode"
          subtitle="Reduce UI elements for smaller screens"
        >
          <Switch
            value={settings.compactMode}
            onValueChange={(value) => updateSetting('compactMode', value)}
            trackColor={{ false: '#2a2a3e', true: '#4ade80' }}
            thumbColor={settings.compactMode ? '#fff' : '#666'}
          />
        </SettingRow>

        <SectionHeader title="DATA MANAGEMENT" />
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={exportSave}
          disabled={isExporting}
          testID="btn-export-save"
        >
          <Upload size={20} color="#4ade80" />
          <Text style={styles.actionButtonText}>
            {isExporting ? 'Exporting...' : 'Export Save Data'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.successButton]}
          onPress={() => {
            console.log('Max all skills requested');
            try { maxAllSkills(); } catch (e) { console.log('maxAllSkills failed', e); }
          }}
          testID="btn-max-all-skills"
        >
          <Swords size={20} color="#22c55e" />
          <Text style={[styles.actionButtonText, styles.successText]}>
            Max All Skills (Test)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => console.log('Import save requested')}
          disabled={isImporting}
        >
          <Download size={20} color="#4ade80" />
          <Text style={styles.actionButtonText}>
            {isImporting ? 'Importing...' : 'Import Save Data'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.dangerButton]}
          onPress={resetGame}
        >
          <Trash2 size={20} color="#ef4444" />
          <Text style={[styles.actionButtonText, styles.dangerText]}>
            Reset Game Data
          </Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Drug Empire v1.0.0</Text>
          <Text style={styles.footerSubtext}>Settings are saved automatically</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  scrollView: {
    flex: 1,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4ade80',
    marginTop: 24,
    marginBottom: 12,
    marginHorizontal: 20,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a3e',
  },
  settingIcon: {
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
    color: '#888',
  },
  settingControl: {
    marginLeft: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a3e',
  },
  dangerButton: {
    borderColor: '#ef4444',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  successButton: {
    borderColor: '#22c55e',
    backgroundColor: 'rgba(34, 197, 94, 0.1)'
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4ade80',
    marginLeft: 12,
  },
  dangerText: {
    color: '#ef4444',
  },
  successText: {
    color: '#22c55e',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4ade80',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#666',
  },
});
