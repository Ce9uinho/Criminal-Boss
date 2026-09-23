import React from 'react';
import { Image } from 'expo-image';
import { Text, View, StyleSheet } from 'react-native';
import { Resource } from '@/types/game';

interface ResourceImageProps {
  resource?: Pick<Resource, 'icon' | 'name' | 'imageUri'> | null;
  size?: number;
  testID?: string;
}

// Renders a resource's artwork when it has one, falling back to its emoji icon.
export function ResourceImage({ resource, size = 24, testID }: ResourceImageProps) {
  if (resource?.imageUri) {
    return (
      <Image
        source={{ uri: resource.imageUri }}
        style={{ width: size, height: size }}
        contentFit="contain"
        accessibilityLabel={resource.name}
        testID={testID}
      />
    );
  }
  return (
    <View style={[styles.box, { width: size, height: size }]} testID={testID}>
      <Text
        style={{ fontSize: Math.round(size * 0.82), lineHeight: Math.round(size * 1.05) }}
        accessibilityLabel={resource?.name}
      >
        {resource?.icon ?? '❔'}
      </Text>
    </View>
  );
}

export default ResourceImage;

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
