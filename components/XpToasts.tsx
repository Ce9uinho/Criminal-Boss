import React, { useMemo, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useGameStore } from '@/store/gameStore';

function XpToast({ amount }: { amount: number }) {
    const opacity = React.useRef(new (require('react-native').Animated.Value)(0)).current;
    const translateY = React.useRef(new (require('react-native').Animated.Value)(0)).current;
  
    useEffect(() => {
      opacity.setValue(0);
      translateY.setValue(0);
      const { Animated } = require('react-native');
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 120, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: -14, duration: 400, useNativeDriver: true }),
      ]).start(() => {
        Animated.timing(opacity, { toValue: 0, duration: 300, delay: 120, useNativeDriver: true }).start();
      });
    }, [amount, opacity, translateY]);
  
    const { Animated } = require('react-native');
    return (
      <Animated.View style={[styles.xpToast, { opacity, transform: [{ translateY }] }]} testID="xp-toast">
        <Text style={styles.xpToastText}>+{amount} XP</Text>
      </Animated.View>
    );
  }

export function HeaderXpToasts({ skillId }: { skillId: string }) {
    const { xpToasts } = useGameStore();
    const filtered = useMemo(() => xpToasts.filter(t => t.skillId === skillId), [xpToasts, skillId]);
    return (
      <View pointerEvents="none" style={styles.xpToastAnchorRight} testID="xp-toast-anchor">
        {filtered.map(t => (
          <XpToast key={t.id} amount={t.amount} />
        ))}
      </View>
    );
  }

  const styles = StyleSheet.create({
    xpToastAnchorRight: {
        position: 'absolute',
        right: 16,
        top: 8,
        alignItems: 'flex-end',
        zIndex: 10000,
        elevation: 1000,
        pointerEvents: 'none',
      },
      xpToast: {
        marginTop: 6,
      },
      xpToastText: {
        color: '#4ade80',
        fontWeight: '700',
        fontSize: 14,
        textShadowColor: '#000',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
      },
  })
