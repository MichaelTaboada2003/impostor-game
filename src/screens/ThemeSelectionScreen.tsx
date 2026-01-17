import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Animated,
    Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGame } from '../context/GameContext';
import { themes } from '../data/themes';
import { colors, gradients } from '../styles/colors';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 72) / 2;

interface ThemeSelectionScreenProps {
    onBack: () => void;
    onNext: () => void;
}

export const ThemeSelectionScreen: React.FC<ThemeSelectionScreenProps> = ({
    onBack,
    onNext,
}) => {
    const { selectTheme, initializePlayers } = useGame();
    const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
    const [fadeAnim] = useState(new Animated.Value(0));
    const [slideAnim] = useState(new Animated.Value(50));

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handleSelectTheme = (themeId: string) => {
        setSelectedTheme(themeId);
    };

    const handleConfirm = () => {
        if (selectedTheme) {
            selectTheme(selectedTheme);
            initializePlayers();
            onNext();
        }
    };

    return (
        <LinearGradient colors={gradients.dark as [string, string]} style={styles.container}>
            <Animated.View
                style={[
                    styles.header,
                    { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
                ]}
            >
                <TouchableOpacity style={styles.backButton} onPress={onBack}>
                    <Text style={styles.backButtonText}>← Atrás</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Elige una temática</Text>
                <Text style={styles.subtitle}>
                    Las palabras serán secretas hasta repartir los roles
                </Text>
            </Animated.View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.themesGrid}>
                    {themes.map((theme, index) => (
                        <Animated.View
                            key={theme.id}
                            style={[
                                styles.themeCardContainer,
                                {
                                    opacity: fadeAnim,
                                    transform: [
                                        {
                                            translateY: slideAnim.interpolate({
                                                inputRange: [0, 50],
                                                outputRange: [0, 50 + index * 10],
                                            }),
                                        },
                                    ],
                                },
                            ]}
                        >
                            <TouchableOpacity
                                style={[
                                    styles.themeCard,
                                    selectedTheme === theme.id && styles.themeCardSelected,
                                    { borderColor: theme.color },
                                ]}
                                onPress={() => handleSelectTheme(theme.id)}
                                activeOpacity={0.7}
                            >
                                <LinearGradient
                                    colors={[
                                        `${theme.color}40`,
                                        `${theme.color}10`,
                                    ]}
                                    style={styles.themeCardGradient}
                                >
                                    <Text style={styles.themeIcon}>{theme.icon}</Text>
                                    <Text style={styles.themeName}>{theme.name}</Text>
                                    <Text style={styles.themeWordCount}>
                                        {theme.words.length} palabras
                                    </Text>
                                    {selectedTheme === theme.id && (
                                        <View style={[styles.selectedBadge, { backgroundColor: theme.color }]}>
                                            <Text style={styles.selectedBadgeText}>✓</Text>
                                        </View>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </Animated.View>
                    ))}
                </View>
            </ScrollView>

            {selectedTheme && (
                <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
                    <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
                        <LinearGradient
                            colors={[
                                themes.find(t => t.id === selectedTheme)?.color || colors.primary,
                                colors.primaryDark,
                            ]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.confirmButtonGradient}
                        >
                            <Text style={styles.confirmButtonText}>
                                Repartir Roles
                            </Text>
                            <Text style={styles.confirmButtonIcon}>🎭</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </Animated.View>
            )}
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: 24,
        paddingBottom: 20,
    },
    backButton: {
        marginBottom: 16,
    },
    backButtonText: {
        fontSize: 16,
        color: colors.textSecondary,
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        color: colors.textPrimary,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: colors.textSecondary,
        lineHeight: 24,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 120,
    },
    themesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        justifyContent: 'space-between',
    },
    themeCardContainer: {
        width: CARD_WIDTH,
    },
    themeCard: {
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    themeCardSelected: {
        borderWidth: 3,
        shadowColor: '#FFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    themeCardGradient: {
        padding: 20,
        alignItems: 'center',
        minHeight: 140,
        justifyContent: 'center',
    },
    themeIcon: {
        fontSize: 48,
        marginBottom: 12,
    },
    themeName: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.textPrimary,
        textAlign: 'center',
        marginBottom: 4,
    },
    themeWordCount: {
        fontSize: 12,
        color: colors.textMuted,
    },
    selectedBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    selectedBadgeText: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 24,
        paddingBottom: 40,
        backgroundColor: 'rgba(15, 15, 26, 0.95)',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.1)',
    },
    confirmButton: {
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 12,
    },
    confirmButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
        paddingHorizontal: 32,
        gap: 12,
    },
    confirmButtonText: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    confirmButtonIcon: {
        fontSize: 24,
    },
});
