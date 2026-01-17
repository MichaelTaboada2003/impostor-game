import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Animated,
    ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGame } from '../context/GameContext';
import { colors, gradients } from '../styles/colors';

const { width, height } = Dimensions.get('window');

interface SetupScreenProps {
    onNext: () => void;
}

export const SetupScreen: React.FC<SetupScreenProps> = ({ onNext }) => {
    const { gameState, setNumberOfPlayers, setNumberOfImpostors } = useGame();
    const [fadeAnim] = useState(new Animated.Value(0));
    const [scaleAnim] = useState(new Animated.Value(0.8));

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const { numberOfPlayers, numberOfImpostors } = gameState.config;

    const incrementPlayers = () => {
        if (numberOfPlayers < 15) setNumberOfPlayers(numberOfPlayers + 1);
    };

    const decrementPlayers = () => {
        if (numberOfPlayers > 3) {
            setNumberOfPlayers(numberOfPlayers - 1);
            // Ajustar impostores si es necesario
            if (numberOfImpostors >= numberOfPlayers - 1) {
                setNumberOfImpostors(Math.max(1, numberOfPlayers - 2));
            }
        }
    };

    const incrementImpostors = () => {
        const maxImpostors = Math.floor(numberOfPlayers / 2);
        if (numberOfImpostors < maxImpostors) setNumberOfImpostors(numberOfImpostors + 1);
    };

    const decrementImpostors = () => {
        if (numberOfImpostors > 1) setNumberOfImpostors(numberOfImpostors - 1);
    };

    return (
        <LinearGradient colors={gradients.dark as [string, string]} style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View
                    style={[
                        styles.content,
                        { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
                    ]}
                >
                    <View style={styles.header}>
                        <Text style={styles.emoji}>🎭</Text>
                        <Text style={styles.title}>IMPOSTOR</Text>
                        <Text style={styles.subtitle}>¿Quién es el impostor?</Text>
                    </View>

                    <View style={styles.settingsContainer}>
                        {/* Número de jugadores */}
                        <View style={styles.settingCard}>
                            <LinearGradient
                                colors={['rgba(108, 92, 231, 0.3)', 'rgba(108, 92, 231, 0.1)']}
                                style={styles.settingGradient}
                            >
                                <Text style={styles.settingIcon}>👥</Text>
                                <Text style={styles.settingLabel}>Jugadores</Text>
                                <View style={styles.counterContainer}>
                                    <TouchableOpacity
                                        style={styles.counterButton}
                                        onPress={decrementPlayers}
                                    >
                                        <Text style={styles.counterButtonText}>−</Text>
                                    </TouchableOpacity>
                                    <View style={styles.counterValue}>
                                        <Text style={styles.counterValueText}>{numberOfPlayers}</Text>
                                    </View>
                                    <TouchableOpacity
                                        style={styles.counterButton}
                                        onPress={incrementPlayers}
                                    >
                                        <Text style={styles.counterButtonText}>+</Text>
                                    </TouchableOpacity>
                                </View>
                                <Text style={styles.settingHint}>Mínimo 3, Máximo 15</Text>
                            </LinearGradient>
                        </View>

                        {/* Número de impostores */}
                        <View style={styles.settingCard}>
                            <LinearGradient
                                colors={['rgba(255, 71, 87, 0.3)', 'rgba(255, 71, 87, 0.1)']}
                                style={styles.settingGradient}
                            >
                                <Text style={styles.settingIcon}>🔪</Text>
                                <Text style={styles.settingLabel}>Impostores</Text>
                                <View style={styles.counterContainer}>
                                    <TouchableOpacity
                                        style={[styles.counterButton, styles.impostorButton]}
                                        onPress={decrementImpostors}
                                    >
                                        <Text style={styles.counterButtonText}>−</Text>
                                    </TouchableOpacity>
                                    <View style={[styles.counterValue, styles.impostorValue]}>
                                        <Text style={styles.counterValueText}>{numberOfImpostors}</Text>
                                    </View>
                                    <TouchableOpacity
                                        style={[styles.counterButton, styles.impostorButton]}
                                        onPress={incrementImpostors}
                                    >
                                        <Text style={styles.counterButtonText}>+</Text>
                                    </TouchableOpacity>
                                </View>
                                <Text style={styles.settingHint}>
                                    Máx: {Math.floor(numberOfPlayers / 2)} impostor(es)
                                </Text>
                            </LinearGradient>
                        </View>
                    </View>

                    {/* Resumen */}
                    <View style={styles.summaryContainer}>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryValue}>{numberOfPlayers - numberOfImpostors}</Text>
                            <Text style={styles.summaryLabel}>Tripulantes</Text>
                        </View>
                        <Text style={styles.summaryDivider}>vs</Text>
                        <View style={styles.summaryItem}>
                            <Text style={[styles.summaryValue, { color: colors.impostorRed }]}>
                                {numberOfImpostors}
                            </Text>
                            <Text style={styles.summaryLabel}>
                                {numberOfImpostors === 1 ? 'Impostor' : 'Impostores'}
                            </Text>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.continueButton} onPress={onNext}>
                        <LinearGradient
                            colors={gradients.primary as [string, string]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.continueButtonGradient}
                        >
                            <Text style={styles.continueButtonText}>Ingresar Nombres</Text>
                            <Text style={styles.continueButtonIcon}>→</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </Animated.View>
            </ScrollView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingTop: 40,
        paddingBottom: 40,
    },
    content: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    emoji: {
        fontSize: 80,
        marginBottom: 16,
    },
    title: {
        fontSize: 48,
        fontWeight: '900',
        color: colors.textPrimary,
        letterSpacing: 8,
        textShadowColor: colors.primary,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 20,
    },
    subtitle: {
        fontSize: 18,
        color: colors.textSecondary,
        marginTop: 8,
    },
    settingsContainer: {
        gap: 20,
        marginBottom: 30,
    },
    settingCard: {
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    settingGradient: {
        padding: 24,
        alignItems: 'center',
    },
    settingIcon: {
        fontSize: 40,
        marginBottom: 12,
    },
    settingLabel: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: 16,
    },
    counterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    counterButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 8,
    },
    impostorButton: {
        backgroundColor: colors.impostorRed,
        shadowColor: colors.impostorRed,
    },
    counterButtonText: {
        fontSize: 32,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    counterValue: {
        width: 80,
        height: 80,
        borderRadius: 16,
        backgroundColor: 'rgba(108, 92, 231, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.primary,
    },
    impostorValue: {
        backgroundColor: 'rgba(255, 71, 87, 0.3)',
        borderColor: colors.impostorRed,
    },
    counterValueText: {
        fontSize: 36,
        fontWeight: '900',
        color: colors.textPrimary,
    },
    settingHint: {
        fontSize: 14,
        color: colors.textMuted,
        marginTop: 12,
    },
    summaryContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
        gap: 20,
    },
    summaryItem: {
        alignItems: 'center',
    },
    summaryValue: {
        fontSize: 32,
        fontWeight: '900',
        color: colors.crewmateBlue,
    },
    summaryLabel: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: 4,
    },
    summaryDivider: {
        fontSize: 24,
        fontWeight: '700',
        color: colors.textMuted,
    },
    continueButton: {
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 12,
    },
    continueButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
        paddingHorizontal: 32,
        gap: 12,
    },
    continueButtonText: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    continueButtonIcon: {
        fontSize: 24,
        color: colors.textPrimary,
    },
});
