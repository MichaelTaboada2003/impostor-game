export const colors = {
    // Primary / Brand Accents (Deep Violet & Neon Indigo)
    primary: '#7952FF',
    primaryDark: '#5E38E6',
    primaryLight: '#9D7DFF',
    primaryGlow: 'rgba(121, 82, 255, 0.35)',

    // Secondary / Crewmate Accents (Electric Cyan)
    cyan: '#00F0FF',
    cyanDark: '#00B8D4',
    cyanLight: '#80F8FF',
    cyanGlow: 'rgba(0, 240, 255, 0.3)',

    // Impostor Danger Accents (Cyber Crimson)
    impostor: '#FF2A55',
    impostorDark: '#D6133C',
    impostorLight: '#FF6B8B',
    impostorGlow: 'rgba(255, 42, 85, 0.35)',

    // AI & Magic Accents (Plasma Pink & Violet)
    aiPurple: '#8A5CFF',
    aiPink: '#FF4D94',
    aiGlow: 'rgba(255, 77, 148, 0.3)',

    // Status Accents
    success: '#00F59B',
    successGlow: 'rgba(0, 245, 155, 0.3)',
    warning: '#FFB800',
    warningGlow: 'rgba(255, 184, 0, 0.3)',
    error: '#FF3355',

    // Deep Obsidian / True Dark Surfaces (OLED Optimized)
    bgDeep: '#07080C',
    bgCard: '#10121B',
    bgElevated: '#171A27',
    bgGlass: 'rgba(255, 255, 255, 0.05)',
    bgGlassHover: 'rgba(255, 255, 255, 0.08)',
    bgGlassActive: 'rgba(255, 255, 255, 0.12)',

    // Borders & Separators
    borderSubtle: 'rgba(255, 255, 255, 0.08)',
    borderLight: 'rgba(255, 255, 255, 0.15)',
    borderGlow: 'rgba(121, 82, 255, 0.4)',

    // Typography Hierarchy
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255, 255, 255, 0.75)',
    textMuted: 'rgba(255, 255, 255, 0.45)',
    textDisabled: 'rgba(255, 255, 255, 0.25)',

    // Legacy compat
    background: '#07080C',
    backgroundLight: '#10121B',
    backgroundCard: '#171A27',
    surface: '#10121B',
    surfaceLight: '#171A27',
    impostorRed: '#FF2A55',
    crewmateBlue: '#00F0FF',
    accent: '#FF4D94',
};

export const gradients = {
    appBackground: ['#07080C', '#0E1019', '#07080C'] as [string, string, string],
    primaryAction: ['#7952FF', '#9D7DFF'] as [string, string],
    cyanAction: ['#00B8D4', '#00F0FF'] as [string, string],
    impostorAction: ['#FF2A55', '#D6133C'] as [string, string],
    aiMagic: ['#7952FF', '#FF4D94', '#00F0FF'] as [string, string, string],
    successAction: ['#00B894', '#00F59B'] as [string, string],
    cardGlass: ['rgba(255, 255, 255, 0.07)', 'rgba(255, 255, 255, 0.02)'] as [string, string],
    cardDark: ['#171A27', '#0F111B'] as [string, string],
    sheetGlass: ['#141724', '#0B0D14'] as [string, string],
};
