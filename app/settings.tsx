import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Share, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Trash2, Download, Upload, Swords, Save } from 'lucide-react-native';
import { useGameStore } from '@/store/gameStore';
import { theme } from '@/constants/theme';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const exportSave = useGameStore(s => s.exportSave);
  const importSave = useGameStore(s => s.importSave);
  const resetGame = useGameStore(s => s.resetGame);
  const saveGame = useGameStore(s => s.saveGame);
  const maxAllSkills = useGameStore(s => s.maxAllSkills);
  const lastSaved = useGameStore(s => s.lastSaved);

  const [exported, setExported] = useState<string | null>(null);
  const [importText, setImportText] = useState('');
  const [importOpen, setImportOpen] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const onExport = async () => {
    const data = exportSave();
    setExported(data);
    if (Platform.OS === 'web') {
      try {
        await (navigator as any)?.clipboard?.writeText(data);
        useGameStore.getState().pushNotice({ kind: 'success', title: 'Save copied', message: 'Paste it somewhere safe.' });
      } catch {
        // Clipboard blocked: the text box below still lets the player copy it manually.
      }
      return;
    }
    try {
      await Share.share({ message: data, title: 'Criminal Boss save' });
    } catch (e) {
      console.log('Share failed', e);
    }
  };

  const onImport = async () => {
    setImportError(null);
    const ok = await importSave(importText);
    if (ok) {
      setImportText('');
      setImportOpen(false);
    } else {
      setImportError("That doesn't look like a valid Criminal Boss save.");
    }
  };

  const onReset = async () => {
    if (!confirmReset) {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 4000);
      return;
    }
    setConfirmReset(false);
    await resetGame();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
      <Text style={styles.sectionHeader}>SAVE DATA</Text>
      <View style={styles.card}>
        <Text style={styles.cardText}>Progress saves automatically every 30 seconds and whenever you leave the game.</Text>
        <Text style={styles.cardMeta}>Last saved {new Date(lastSaved).toLocaleTimeString()}</Text>
        <TouchableOpacity style={styles.button} onPress={() => saveGame()} testID="btn-save-now">
          <Save size={18} color={theme.colors.gold} />
          <Text style={styles.buttonText}>Save now</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionHeader}>BACKUP</Text>
      <View style={styles.card}>
        <TouchableOpacity style={styles.button} onPress={onExport} testID="btn-export-save">
          <Upload size={18} color={theme.colors.gold} />
          <Text style={styles.buttonText}>Export save</Text>
        </TouchableOpacity>
        {exported && (
          <TextInput
            style={styles.codeBox}
            value={exported}
            editable={false}
            multiline
            selectTextOnFocus
            testID="export-text"
          />
        )}

        <TouchableOpacity style={styles.button} onPress={() => setImportOpen(v => !v)} testID="btn-import-save">
          <Download size={18} color={theme.colors.gold} />
          <Text style={styles.buttonText}>Import save</Text>
        </TouchableOpacity>
        {importOpen && (
          <View>
            <TextInput
              style={styles.codeBox}
              value={importText}
              onChangeText={setImportText}
              placeholder="Paste an exported save here"
              placeholderTextColor={theme.colors.textDim}
              multiline
              autoCapitalize="none"
              autoCorrect={false}
              testID="import-text"
            />
            {!!importError && <Text style={styles.error}>{importError}</Text>}
            <TouchableOpacity
              style={[styles.primary, !importText.trim() && styles.primaryDisabled]}
              onPress={onImport}
              disabled={!importText.trim()}
              testID="btn-import-confirm"
            >
              <Text style={styles.primaryText}>Load this save</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <Text style={styles.sectionHeader}>DANGER ZONE</Text>
      <View style={[styles.card, styles.dangerCard]}>
        <Text style={styles.cardText}>Resetting wipes all skills, cash, items and upgrades. This cannot be undone.</Text>
        <TouchableOpacity style={[styles.button, styles.dangerButton]} onPress={onReset} testID="btn-reset">
          <Trash2 size={18} color={theme.colors.crimson} />
          <Text style={[styles.buttonText, { color: theme.colors.crimson }]}>
            {confirmReset ? 'Tap again to confirm reset' : 'Reset game data'}
          </Text>
        </TouchableOpacity>
      </View>

      {__DEV__ && (
        <>
          <Text style={styles.sectionHeader}>DEVELOPER</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.button} onPress={() => maxAllSkills()} testID="btn-max-all-skills">
              <Swords size={18} color={theme.colors.emerald} />
              <Text style={[styles.buttonText, { color: theme.colors.emerald }]}>Max all skills (test)</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>Criminal Boss v1.1.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  content: {
    padding: 16,
  },
  sectionHeader: {
    color: theme.colors.gold,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    marginTop: 12,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 14,
    gap: 10,
  },
  dangerCard: {
    borderColor: theme.colors.crimsonBorder,
  },
  cardText: {
    color: theme.colors.textMuted,
    fontSize: 13.5,
    lineHeight: 19,
  },
  cardMeta: {
    color: theme.colors.textDim,
    fontSize: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: theme.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  dangerButton: {
    backgroundColor: theme.colors.crimsonSoft,
    borderColor: theme.colors.crimsonBorder,
  },
  buttonText: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  codeBox: {
    minHeight: 90,
    maxHeight: 160,
    backgroundColor: theme.colors.bgElevated,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    color: theme.colors.textMuted,
    fontSize: 11,
    padding: 10,
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
    textAlignVertical: 'top',
  },
  error: {
    color: theme.colors.crimson,
    fontSize: 12.5,
    marginTop: 6,
  },
  primary: {
    marginTop: 10,
    backgroundColor: theme.colors.gold,
    borderRadius: theme.radius.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryDisabled: {
    opacity: 0.4,
  },
  primaryText: {
    color: '#1A1408',
    fontWeight: '900',
    fontSize: 15,
  },
  footer: {
    alignItems: 'center',
    marginTop: 28,
  },
  footerText: {
    color: theme.colors.textDim,
    fontSize: 12,
  },
});
