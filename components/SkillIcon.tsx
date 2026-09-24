import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ship, Fingerprint, FlaskConical, Wine, Microscope, Briefcase, LucideIcon } from 'lucide-react-native';
import { skillColor } from '@/constants/theme';

// One consistent vector icon per operation (emoji render differently on every
// platform, which made the skill tiles feel cheap).
const SKILL_GLYPHS: Record<string, LucideIcon> = {
  smuggling: Ship,
  thieving: Fingerprint,
  drug_factory: FlaskConical,
  distillery: Wine,
  investigation_lab: Microscope,
};

interface SkillIconProps {
  skillId: string;
  size?: number;
  // "tile" draws the tinted rounded square; "bare" is just the glyph.
  variant?: 'tile' | 'bare';
  color?: string;
}

export function SkillIcon({ skillId, size = 48, variant = 'tile', color }: SkillIconProps) {
  const Glyph = SKILL_GLYPHS[skillId] ?? Briefcase;
  const accent = color ?? skillColor(skillId);
  if (variant === 'bare') return <Glyph size={size} color={accent} strokeWidth={2.2} />;
  return (
    <View
      style={[
        styles.tile,
        {
          width: size,
          height: size,
          borderRadius: Math.round(size * 0.28),
          backgroundColor: `${accent}1F`,
          borderColor: `${accent}66`,
        },
      ]}
    >
      <Glyph size={Math.round(size * 0.5)} color={accent} strokeWidth={2.2} />
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
