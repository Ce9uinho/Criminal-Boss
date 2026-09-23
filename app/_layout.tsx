import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { Component, ReactNode, useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useGameStore } from "@/store/gameStore";
import { theme } from "@/constants/theme";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: unknown) {
    console.error("Unhandled UI error", error);
  }
  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer} accessibilityRole="alert" testID="global-error">
          <Text style={styles.errorIcon}>🚨</Text>
          <Text style={styles.errorTitle}>The heat is on</Text>
          <Text style={styles.errorText}>Something went wrong. Your progress is saved.</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => this.setState({ hasError: false })}>
            <Text style={styles.primaryButtonText}>Try again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children as React.ReactElement;
  }
}

const screenHeader = {
  headerStyle: { backgroundColor: theme.colors.bgElevated },
  headerTintColor: theme.colors.text,
  headerTitleStyle: { fontWeight: "800" as const },
  headerShadowVisible: false,
  contentStyle: { backgroundColor: theme.colors.bg },
};

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back", contentStyle: { backgroundColor: theme.colors.bg } }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ title: "Settings", ...screenHeader }} />
      <Stack.Screen name="profile" options={{ title: "Profile", ...screenHeader }} />
      <Stack.Screen name="achievements" options={{ title: "Achievements", ...screenHeader }} />
      <Stack.Screen name="combat" options={{ title: "Turf War", ...screenHeader }} />
      <Stack.Screen name="+not-found" options={{ title: "Lost", ...screenHeader }} />
    </Stack>
  );
}

function CombatDeathAlert() {
  const death = useGameStore(s => s.combatDeath);
  const clearCombatDeath = useGameStore(s => s.clearCombatDeath);

  if (!death) return null;

  return (
    <View style={styles.alertOverlay} testID="combat-death-overlay">
      <View style={styles.alertCard} accessible accessibilityRole="alert">
        <Text style={styles.alertIcon}>💀</Text>
        <Text style={styles.alertTitle}>You got whacked</Text>
        <Text style={styles.alertText}>
          {death.enemyName} put you down. Upgrade your gear and hit the streets again.
        </Text>
        <TouchableOpacity style={[styles.primaryButton, { alignSelf: "stretch" }]} onPress={clearCombatDeath} testID="combat-death-dismiss">
          <Text style={styles.primaryButtonText}>Patch up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={styles.root}>
        <StatusBar style="light" />
        <ErrorBoundary>
          <>
            <RootLayoutNav />
            <CombatDeathAlert />
          </>
        </ErrorBoundary>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.bg,
    padding: 24,
  },
  errorIcon: {
    fontSize: 44,
    marginBottom: 8,
  },
  errorTitle: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 6,
  },
  errorText: {
    color: theme.colors.textMuted,
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: theme.colors.gold,
    paddingVertical: 13,
    paddingHorizontal: 24,
    borderRadius: theme.radius.md,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#1A1408",
    fontWeight: "900",
    fontSize: 15,
  },
  alertOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.overlay,
    padding: 24,
  },
  alertCard: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.crimsonBorder,
    padding: 22,
    alignItems: "center",
  },
  alertIcon: { fontSize: 44, marginBottom: 6 },
  alertTitle: { color: theme.colors.crimson, fontSize: 22, fontWeight: "900" },
  alertText: { color: theme.colors.textMuted, marginTop: 8, marginBottom: 20, textAlign: "center", lineHeight: 20 },
});
