import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Animated,
    ScrollView,
    Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGame } from '../context/GameContext';
import { colors, gradients } from '../styles/colors';
import { GameMode } from '../types/game';

const { width } = Dimensions.get('window');

interface SetupScreenProps {
    onNext: () => void;
}

export const SetupScreen: React.FC<SetupScreenProps> = ({ onNext }) => {
    const {
        gameState,
        setNumberOfPlayers,
        setNumberOfImpostors,
        setAllowHints,
        setGameMode,
        setRoundTimerSeconds,
    } = useGame();

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const titleAnim = useRef(new Animated.Value(0)).current;
    const glowAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
            Animated.spring(scaleAnim, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }),
            Animated.timing(titleAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        ]).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(glowAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
                Animated.timing(glowAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    const {
        numberOfPlayers,
        numberOfImpostors,
        allowHints,
        gameMode = 'classic',
        roundTimerSeconds = 120,
    } = gameState.config;

    const incrementPlayers = () => {
        if (numberOfPlayers < 16) setNumberOfPlayers(numberOfPlayers + 1);
    };

    const decrementPlayers = () => {
        if (numberOfPlayers > 3) {
            setNumberOfPlayers(numberOfPlayers - 1);
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

    const glowOpacity = glowAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.2, 0.7],
    });

    const timerOptions = [
        { label: 'Libre', seconds: 0 },
        { label: '1 min', seconds: 60 },
        { label: '2 min', seconds: 120 },
        { label: '3 min', seconds: 180 },
        { label: '5 min', seconds: 300 },
    ];

    return (
        <LinearGradient
            colors={['#0a0a1a', '#141432', '#0a0a1a']}
            style={styles.container}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            <View style={styles.versionBadge}>
                <Text style={styles.versionText}>v2.0 IA</Text>
            </View>

            <Animated.View style={[styles.bgCircle1, { opacity: glowOpacity }]} />
            <Animated.View style={[styles.bgCircle2, { opacity: glowOpacity }]} />

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
                    {/* Header */}
                    <Animated.View style={[styles.header, { opacity: titleAnim }]}>
                        <View style={styles.logoContainer}>
                            <Text style={styles.emoji}>🎭</Text>
                            <View style={styles.glowEffect} />
                        </View>
                        <Text style={styles.title}>IMPOSTOR</Text>
                        <Text style={styles.subtitle}>Juego de deducción, engaño y astucia</Text>
                    </Animated.View>

                    {/* Mode Selector */}
                    <View style={styles.settingCard}>
                        <LinearGradient
                            colors={['rgba(108, 92, 231, 0.15)', 'rgba(108, 92, 231, 0.04)']}
                            style={styles.cardGradient}
                        >
                            <View style={styles.cardHeader}>
                                <View style={styles.iconBadge}>
                                    <Text style={styles.settingIcon}>🎮</Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.settingLabel}>Modo de Juego</Text>
                                    <Text style={styles.settingSubtext}>
                                        {gameMode === 'classic'
                                            ? 'El impostor ve "???" y debe fingir'
                                            : 'El impostor recibe una palabra parecida (Undercover)'}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.modeToggleRow}>
                                <TouchableOpacity
                                    style={[
                                        styles.modeOption,
                                        gameMode === 'classic' && styles.modeOptionActive,
                                    ]}
                                    onPress={() => setGameMode('classic')}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.modeOptionIcon}>🕵️</Text>
                                    <Text
                                        style={[
                                            styles.modeOptionText,
                                            gameMode === 'classic' && styles.modeOptionTextActive,
                                        ]}
                                    >
                                        Clásico
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.modeOption,
                                        gameMode === 'undercover' && styles.modeOptionActiveUndercover,
                                    ]}
                                    onPress={() => setGameMode('undercover')}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.modeOptionIcon}>🤫</Text>
                                    <Text
                                        style={[
                                            styles.modeOptionText,
                                            gameMode === 'undercover' && styles.modeOptionTextActiveUndercover,
                                        ]}
                                    >
                                        Undercover
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </LinearGradient>
                    </View>

                    {/* Players Card */}
                    <View style={styles.settingCard}>
                        <LinearGradient
                            colors={['rgba(0, 206, 201, 0.15)', 'rgba(0, 206, 201, 0.04)']}
                            style={styles.cardGradient}
                        >
                            <View style={styles.cardHeader}>
                                <View style={[styles.iconBadge, { backgroundColor: 'rgba(0, 206, 201, 0.25)' }]}>
                                    <Text style={styles.settingIcon}>👥</Text>
                                </View>
                                <Text style={styles.settingLabel}>Jugadores</Text>
                            </View>

                            <View style={styles.counterContainer}>
                                <TouchableOpacity
                                    style={styles.counterButton}
                                    onPress={decrementPlayers}
                                    activeOpacity={0.7}
                                >
                                    <LinearGradient
                                        colors={['#00B894', '#00CEC9']}
                                        style={styles.counterButtonGradient}
                                    >
                                        <Text style={styles.counterButtonText}>−</Text>
                                    </LinearGradient>
                                </TouchableOpacity>

                                <View style={[styles.counterValueContainer, { borderColor: 'rgba(0, 206, 201, 0.5)' }]}>
                                    <Text style={styles.counterValueText}>{numberOfPlayers}</Text>
                                </View>

                                <TouchableOpacity
                                    style={styles.counterButton}
                                    onPress={incrementPlayers}
                                    activeOpacity={0.7}
                                >
                                    <LinearGradient
                                        colors={['#00B894', '#00CEC9']}
                                        style={styles.counterButtonGradient}
                                    >
                                        <Text style={styles.counterButtonText}>+</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.settingHint}>Mínimo 3 · Máximo 16 jugadores</Text>
                        </LinearGradient>
                    </View>

                    {/* Impostors Card */}
                    <View style={styles.settingCard}>
                        <LinearGradient
                            colors={['rgba(255, 71, 87, 0.15)', 'rgba(255, 71, 87, 0.04)']}
                            style={styles.cardGradient}
                        >
                            <View style={styles.cardHeader}>
                                <View style={[styles.iconBadge, styles.iconBadgeRed]}>
                                    <Text style={styles.settingIcon}>🔪</Text>
                                </View>
                                <Text style={styles.settingLabel}>Impostores</Text>
                            </View>

                            <View style={styles.counterContainer}>
                                <TouchableOpacity
                                    style={styles.counterButton}
                                    onPress={decrementImpostors}
                                    activeOpacity={0.7}
                                >
                                    <LinearGradient
                                        colors={['#FF4757', '#E84141']}
                                        style={styles.counterButtonGradient}
                                    >
                                        <Text style={styles.counterButtonText}>−</Text>
                                    </LinearGradient>
                                </TouchableOpacity>

                                <View style={[styles.counterValueContainer, styles.counterValueRed]}>
                                    <Text style={styles.counterValueText}>{numberOfImpostors}</Text>
                                </View>

                                <TouchableOpacity
                                    style={styles.counterButton}
                                    onPress={incrementImpostors}
                                    activeOpacity={0.7}
                                >
                                    <LinearGradient
                                        colors={['#FF4757', '#E84141']}
                                        style={styles.counterButtonGradient}
                                    >
                                        <Text style={styles.counterButtonText}>+</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.settingHint}>
                                Máximo {Math.floor(numberOfPlayers / 2)} impostor(es) para {numberOfPlayers} jugadores
                            </Text>
                        </LinearGradient>
                    </View>

                    {/* Timer Options Card */}
                    <View style={styles.settingCard}>
                        <LinearGradient
                            colors={['rgba(253, 121, 168, 0.12)', 'rgba(253, 121, 168, 0.03)']}
                            style={styles.cardGradient}
                        >
                            <View style={styles.cardHeader}>
                                <View style={[styles.iconBadge, { backgroundColor: 'rgba(253, 121, 168, 0.25)' }]}>
                                    <Text style={styles.settingIcon}>⏱️</Text>
                                </View>
                                <Text style={styles.settingLabel}>Temporizador de Debate</Text>
                            </View>

                            <View style={styles.timerPickerRow}>
                                {timerOptions.map(opt => (
                                    <TouchableOpacity
                                        key={opt.seconds}
                                        style={[
                                            styles.timerPill,
                                            roundTimerSeconds === opt.seconds && styles.timerPillActive,
                                        ]}
                                        onPress={() => setRoundTimerSeconds(opt.seconds)}
                                        activeOpacity={0.8}
                                    >
                                        <Text
                                            style={[
                                                styles.timerPillText,
                                                roundTimerSeconds === opt.seconds && styles.timerPillTextActive,
                                            ]}
                                        >
                                            {opt.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </LinearGradient>
                    </View>

                    {/* Hints Toggle Card */}
                    {gameMode === 'classic' && (
                        <View style={styles.settingCard}>
                            <LinearGradient
                                colors={['rgba(241, 196, 15, 0.15)', 'rgba(241, 196, 15, 0.04)']}
                                style={styles.cardGradient}
                            >
                                <View style={[styles.cardHeader, { marginBottom: 0 }]}>
                                    <View style={[styles.iconBadge, { backgroundColor: 'rgba(241, 196, 15, 0.3)' }]}>
                                        <Text style={styles.settingIcon}>💡</Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.settingLabel}>Pistas de Ayuda</Text>
                                        <Text style={[styles.settingHint, { textAlign: 'left', marginTop: 2 }]}>
                                            Da una pista contextual al impostor
                                        </Text>
                                    </View>
                                    <Switch
                                        value={allowHints}
                                        onValueChange={setAllowHints}
                                        trackColor={{ false: 'rgba(255, 255, 255, 0.2)', true: '#F1C40F' }}
                                        thumbColor={allowHints ? '#FFFFFF' : '#f4f3f4'}
                                    />
                                </View>
                            </LinearGradient>
                        </View>
                    )}

                    {/* Summary Balance */}
                    <View style={styles.summaryContainer}>
                        <View style={styles.summaryCard}>
                            <LinearGradient
                                colors={['rgba(93, 173, 226, 0.2)', 'rgba(93, 173, 226, 0.05)']}
                                style={styles.summaryGradient}
                            >
                                <Text style={styles.summaryEmoji}>👤</Text>
                                <Text style={styles.summaryValue}>{numberOfPlayers - numberOfImpostors}</Text>
                                <Text style={styles.summaryLabel}>Tripulantes</Text>
                            </LinearGradient>
                        </View>

                        <View style={styles.vsContainer}>
                            <Text style={styles.vsText}>VS</Text>
                        </View>

                        <View style={styles.summaryCard}>
                            <LinearGradient
                                colors={['rgba(255, 71, 87, 0.2)', 'rgba(255, 71, 87, 0.05)']}
                                style={styles.summaryGradient}
                            >
                                <Text style={styles.summaryEmoji}>🔪</Text>
                                <Text style={[styles.summaryValue, { color: colors.impostorRed }]}>
                                    {numberOfImpostors}
                                </Text>
                                <Text style={styles.summaryLabel}>
                                    {numberOfImpostors === 1 ? 'Impostor' : 'Impostores'}
                                </Text>
                            </LinearGradient>
                        </View>
                    </View>

                    {/* Continue Button */}
                    <TouchableOpacity
                        style={styles.continueButton}
                        onPress={onNext}
                        activeOpacity={0.85}
                    >
                        <LinearGradient
                            colors={['#6C5CE7', '#A29BFE', '#6C5CE7']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.continueButtonGradient}
                        >
                            <Text style={styles.continueButtonText}>Configurar Nombres</Text>
                            <View style={styles.arrowContainer}>
                                <Text style={styles.continueButtonIcon}>→</Text>
                            </View>
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
    bgCircle1: {
        position: 'absolute',
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: '#6C5CE7',
        top: -100,
        right: -100,
        opacity: 0.1,
    },
    bgCircle2: {
        position: 'absolute',
        width: 250,
        height: 250,
        borderRadius: 125,
        backgroundColor: '#00CEC9',
        bottom: 100,
        left: -80,
        opacity: 0.1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingTop: 54,
        paddingBottom: 40,
    },
    content: {
        flex: 1,
        paddingHorizontal: 22,
    },
    versionBadge: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 100,
        backgroundColor: 'rgba(108, 92, 231, 0.35)',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(108, 92, 231, 0.5)',
    },
    versionText: {
        fontSize: 11,
        color: '#A29BFE',
        fontWeight: '800',
    },
    header: {
        alignItems: 'center',
        marginBottom: 24,
    },
    logoContainer: {
        position: 'relative',
        marginBottom: 12,
    },
    emoji: {
        fontSize: 70,
    },
    glowEffect: {
        position: 'absolute',
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: '#6C5CE7',
        opacity: 0.3,
        top: -10,
        left: -10,
        zIndex: -1,
    },
    title: {
        fontSize: 38,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: 5,
    },
    subtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.6)',
        marginTop: 6,
        textAlign: 'center',
    },
    settingCard: {
        marginBottom: 14,
        borderRadius: 22,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    cardGradient: {
        padding: 18,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
    },
    iconBadge: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: 'rgba(108, 92, 231, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    iconBadgeRed: {
        backgroundColor: 'rgba(255, 71, 87, 0.3)',
    },
    settingIcon: {
        fontSize: 22,
    },
    settingLabel: {
        fontSize: 18,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    settingSubtext: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.5)',
        marginTop: 2,
    },
    modeToggleRow: {
        flexDirection: 'row',
        gap: 10,
    },
    modeOption: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        paddingVertical: 14,
        borderRadius: 16,
        gap: 8,
        borderWidth: 1.5,
        borderColor: 'transparent',
    },
    modeOptionActive: {
        backgroundColor: 'rgba(108, 92, 231, 0.3)',
        borderColor: '#6C5CE7',
    },
    modeOptionActiveUndercover: {
        backgroundColor: 'rgba(253, 121, 168, 0.3)',
        borderColor: '#FD79A8',
    },
    modeOptionIcon: {
        fontSize: 18,
    },
    modeOptionText: {
        fontSize: 14,
        fontWeight: '700',
        color: 'rgba(255, 255, 255, 0.6)',
    },
    modeOptionTextActive: {
        color: '#FFFFFF',
        fontWeight: '900',
    },
    modeOptionTextActiveUndercover: {
        color: '#FD79A8',
        fontWeight: '900',
    },
    counterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        marginBottom: 10,
    },
    counterButton: {
        borderRadius: 18,
        overflow: 'hidden',
    },
    counterButtonGradient: {
        width: 52,
        height: 52,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    counterButtonText: {
        fontSize: 26,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    counterValueContainer: {
        width: 80,
        height: 80,
        borderRadius: 22,
        backgroundColor: 'rgba(0, 0, 0, 0.25)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
    },
    counterValueRed: {
        borderColor: 'rgba(255, 71, 87, 0.5)',
    },
    counterValueText: {
        fontSize: 36,
        fontWeight: '900',
        color: '#FFFFFF',
    },
    settingHint: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.45)',
        textAlign: 'center',
    },
    timerPickerRow: {
        flexDirection: 'row',
        gap: 6,
    },
    timerPill: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        paddingVertical: 10,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    timerPillActive: {
        backgroundColor: 'rgba(253, 121, 168, 0.3)',
        borderColor: '#FD79A8',
    },
    timerPillText: {
        fontSize: 12,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.6)',
    },
    timerPillTextActive: {
        color: '#FD79A8',
        fontWeight: '800',
    },
    summaryContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 16,
        gap: 12,
    },
    summaryCard: {
        flex: 1,
        borderRadius: 18,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    summaryGradient: {
        padding: 14,
        alignItems: 'center',
    },
    summaryEmoji: {
        fontSize: 24,
        marginBottom: 4,
    },
    summaryValue: {
        fontSize: 32,
        fontWeight: '900',
        color: '#5DADE2',
    },
    summaryLabel: {
        fontSize: 11,
        color: 'rgba(255, 255, 255, 0.5)',
        marginTop: 2,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    vsContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    vsText: {
        fontSize: 13,
        fontWeight: '800',
        color: 'rgba(255, 255, 255, 0.5)',
    },
    continueButton: {
        borderRadius: 22,
        overflow: 'hidden',
        marginTop: 8,
        marginBottom: 20,
        shadowColor: '#6C5CE7',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 18,
        elevation: 10,
    },
    continueButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        paddingHorizontal: 28,
        gap: 14,
    },
    continueButtonText: {
        fontSize: 18,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    arrowContainer: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    continueButtonIcon: {
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: '700',
    },
});
