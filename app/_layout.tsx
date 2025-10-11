import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { Component, ReactNode, useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { View, Text, StyleSheet } from "react-native";
import { trpc, trpcClient } from "@/lib/trpc";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer} accessibilityRole="alert" testID="global-error">
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorText}>Please reload the app.</Text>
        </View>
      );
    }
    return this.props.children as React.ReactElement;
  }
}

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ title: "Settings", headerStyle: { backgroundColor: '#1a1a2e' }, headerTintColor: '#fff' }} />
      <Stack.Screen name="profile" options={{ title: "Profile", headerStyle: { backgroundColor: '#1a1a2e' }, headerTintColor: '#fff' }} />
      <Stack.Screen name="achievements" options={{ title: "Achievements", headerStyle: { backgroundColor: '#1a1a2e' }, headerTintColor: '#fff' }} />
      <Stack.Screen name="combat" options={{ title: "Combat", headerStyle: { backgroundColor: '#1a1a2e' }, headerTintColor: '#fff' }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

function GlobalAlerts() {
  const [visible, setVisible] = React.useState<boolean>(false);
  const death = require("@/store/gameStore").useGameStore((s: any) => s.combatDeath);
  const clearCombatDeath = require("@/store/gameStore").useGameStore((s: any) => s.clearCombatDeath);

  React.useEffect(() => {
    if (death) {
      setVisible(true);
    }
  }, [death?.at]);

  if (!death || !visible) return null as unknown as React.ReactElement;

  return (
    <View style={styles.alertOverlay} pointerEvents="box-none" testID="combat-death-overlay">
      <View style={styles.alertCard} accessible accessibilityRole="alert">
        <Text style={styles.alertTitle}>You were defeated</Text>
        <Text style={styles.alertText}>Fallen to {death.enemyName}. Gear up and try again.</Text>
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
          <Text onPress={() => { setVisible(false); clearCombatDeath(); }} style={styles.alertButton} testID="combat-death-dismiss">OK</Text>
        </View>
      </View>
    </View>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={styles.root}>
          <ErrorBoundary>
            <>
              <RootLayoutNav />
              <GlobalAlerts />
            </>
          </ErrorBoundary>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </trpc.Provider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0a0a0f',
    padding: 24,
  },
  errorTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  errorText: {
    color: '#9ca3af',
    fontSize: 14,
  },
  alertOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 24,
  },
  alertCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#111827',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1f2937',
    padding: 16,
  },
  alertTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  alertText: { color: '#9ca3af', marginTop: 6 },
  alertButton: { color: '#0b1220', backgroundColor: '#60a5fa', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, overflow: 'hidden', fontWeight: '700' },
});
