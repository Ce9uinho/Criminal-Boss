
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { X, Settings, User, Trophy, BookOpen, BarChart3, HelpCircle } from 'lucide-react-native';

interface GameMenuProps {
  onClose: () => void;
}

export function GameMenu({ onClose }: GameMenuProps) {
  return (
    <View style={styles.gameMenuFullOverlay}>
      <TouchableOpacity
        style={styles.gameMenuBackdrop}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.gameMenuContainer}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.gameMenuContent}>
              <View style={styles.gameMenuHeader}>
                <Text style={styles.gameMenuTitle}>Game Menu</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={onClose}
                >
                  <X size={24} color="#fff" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.gameMenuItem} onPress={() => {
                onClose();
                router.push('/settings');
              }}>
                <Settings size={24} color="#4ade80" />
                <Text style={styles.gameMenuText}>Settings</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.gameMenuItem} onPress={() => {
                onClose();
                router.push('/profile');
              }}>
                <User size={24} color="#4ade80" />
                <Text style={styles.gameMenuText}>Profile</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.gameMenuItem} onPress={() => {
                onClose();
                router.push('/achievements');
              }}>
                <Trophy size={24} color="#4ade80" />
                <Text style={styles.gameMenuText}>Achievements</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.gameMenuItem} onPress={() => {
                console.log('Wiki pressed');
                onClose();
              }}>
                <BookOpen size={24} color="#4ade80" />
                <Text style={styles.gameMenuText}>Wiki</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.gameMenuItem} onPress={() => {
                console.log('Statistics pressed');
                onClose();
              }}>
                <BarChart3 size={24} color="#4ade80" />
                <Text style={styles.gameMenuText}>Statistics</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.gameMenuItem} onPress={() => {
                console.log('Help pressed');
                onClose();
              }}>
                <HelpCircle size={24} color="#4ade80" />
                <Text style={styles.gameMenuText}>Help</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
    gameMenuFullOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        elevation: 999,
      },
      gameMenuBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
      },
      gameMenuContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
      },
      gameMenuContent: {
        backgroundColor: '#1a1a2e',
        borderRadius: 20,
        padding: 24,
        width: '100%',
        maxWidth: 350,
        borderWidth: 2,
        borderColor: '#4ade80',
        shadowColor: '#4ade80',
        shadowOffset: {
          width: 0,
          height: 0,
        },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
      },
      gameMenuHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
      },
      gameMenuTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        flex: 1,
        textAlign: 'center',
      },
      closeButton: {
        position: 'absolute',
        right: 0,
        top: 0,
        padding: 4,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
      },
      gameMenuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 12,
        backgroundColor: '#2a2a3e',
        borderWidth: 1,
        borderColor: 'transparent',
      },
      gameMenuText: {
        fontSize: 18,
        color: '#fff',
        marginLeft: 16,
        fontWeight: '600',
      },
})
