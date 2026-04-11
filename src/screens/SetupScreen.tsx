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

const { width, height } = Dimensions.get('window');

interface SetupScreenProps {
    onNext: () => void;
}

export const SetupScreen: React.FC<SetupScreenProps> = ({ onNext }) => {
    const { gameState, setNumberOfPlayers, setNumberOfImpostors, setAllowHints } = useGame();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const titleAnim = useRef(new Animated.Value(0)).current;
    const card1Anim = useRef(new Animated.Value(50)).current;
    const card2Anim = useRef(new Animated.Value(50)).current;
    const buttonAnim = useRef(new Animated.Value(50)).current;
    const glowAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Secuencia de animaciones de entrada
        Animated.sequence([
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 600,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 8,
                    tension: 40,
                    useNativeDriver: true,
                }),
            ]),
            Animated.timing(titleAnim, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }),
            Animated.stagger(150, [
                Animated.spring(card1Anim, {
                    toValue: 0,
                    friction: 8,
                    tension: 50,
                    useNativeDriver: true,
                }),
                Animated.spring(card2Anim, {
                    toValue: 0,
                    friction: 8,
                    tension: 50,
                    useNativeDriver: true,
                }),
                Animated.spring(buttonAnim, {
                    toValue: 0,
                    friction: 8,
                    tension: 50,
                    useNativeDriver: true,
                }),
            ]),
        ]).start();

        // Animación de glow pulsante
        Animated.loop(
            Animated.sequence([
                Animated.timing(glowAnim, {
                    toValue: 1,
                    duration: 2000,
                    useNativeDriver: true,
                }),
                Animated.timing(glowAnim, {
                    toValue: 0,
                    duration: 2000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const { numberOfPlayers, numberOfImpostors, allowHints } = gameState.config;

    const incrementPlayers = () => {
        if (numberOfPlayers < 15) setNumberOfPlayers(numberOfPlayers + 1);
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
        outputRange: [0.3, 0.8],
    });

    return (
        <LinearGradient
            colors={['#0a0a1a', '#1a1a3a', '#0f0f2a']}
            style={styles.container}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            {/* Version badge */}
            <View style={styles.versionBadge}>
                <Text style={styles.versionText}>v1.3</Text>
            </View>

            {/* Background decorative elements */}
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
                    {/* Header con efecto de glow */}
                    <Animated.View style={[styles.header, { opacity: titleAnim }]}>
                        <View style={styles.logoContainer}>
                            <Animated.Text style={[styles.emoji, { opacity: glowOpacity }]}>
                                🎭
                            </Animated.Text>
                            <View style={styles.glowEffect} />
                        </View>
                        <Text style={styles.title}>IMPOSTOR</Text>
                        <Text style={styles.subtitle}>¿Quién es el impostor entre nosotros?</Text>
                    </Animated.View>

                    {/* Card de Jugadores */}
                    <Animated.View
                        style={[
                            styles.settingCard,
                            { transform: [{ translateY: card1Anim }] }
                        ]}
                    >
                        <LinearGradient
                            colors={['rgba(108, 92, 231, 0.15)', 'rgba(108, 92, 231, 0.05)']}
                            style={styles.cardGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <View style={styles.cardHeader}>
                                <View style={styles.iconBadge}>
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
                                        colors={['#6C5CE7', '#5B4BD5']}
                                        style={styles.counterButtonGradient}
                                    >
                                        <Text style={styles.counterButtonText}>−</Text>
                                    </LinearGradient>
                                </TouchableOpacity>

                                <View style={styles.counterValueContainer}>
                                    <Text style={styles.counterValueText}>{numberOfPlayers}</Text>
                                </View>

                                <TouchableOpacity
                                    style={styles.counterButton}
                                    onPress={incrementPlayers}
                                    activeOpacity={0.7}
                                >
                                    <LinearGradient
                                        colors={['#6C5CE7', '#5B4BD5']}
                                        style={styles.counterButtonGradient}
                                    >
                                        <Text style={styles.counterButtonText}>+</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.settingHint}>Mínimo 3 · Máximo 15</Text>
                        </LinearGradient>
                    </Animated.View>

                    {/* Card de Impostores */}
                    <Animated.View
                        style={[
                            styles.settingCard,
                            { transform: [{ translateY: card2Anim }] }
                        ]}
                    >
                        <LinearGradient
                            colors={['rgba(255, 71, 87, 0.15)', 'rgba(255, 71, 87, 0.05)']}
                            style={styles.cardGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
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
                                Máximo {Math.floor(numberOfPlayers / 2)} impostor(es)
                            </Text>
                        </LinearGradient>
                    </Animated.View>

                    {/* Card de Pistas */}
                    <Animated.View
                        style={[
                            styles.settingCard,
                            { transform: [{ translateY: card2Anim }] }
                        ]}
                    >
                        <LinearGradient
                            colors={['rgba(241, 196, 15, 0.15)', 'rgba(241, 196, 15, 0.05)']}
                            style={styles.cardGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <View style={[styles.cardHeader, { marginBottom: 0 }]}>
                                <View style={[styles.iconBadge, { backgroundColor: 'rgba(241, 196, 15, 0.3)' }]}>
                                    <Text style={styles.settingIcon}>💡</Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.settingLabel}>Permitir Pistas</Text>
                                    <Text style={[styles.settingHint, { textAlign: 'left', marginTop: 2 }]}>
                                        Solo para el Impostor
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
                    </Animated.View>

                    {/* Resumen visual */}
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

                    {/* Botón continuar */}
                    <Animated.View style={{ transform: [{ translateY: buttonAnim }] }}>
                        <TouchableOpacity
                            style={styles.continueButton}
                            onPress={onNext}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={['#6C5CE7', '#A29BFE', '#6C5CE7']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.continueButtonGradient}
                            >
                                <Text style={styles.continueButtonText}>Ingresar Nombres</Text>
                                <View style={styles.arrowContainer}>
                                    <Text style={styles.continueButtonIcon}>→</Text>
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>
                    </Animated.View>
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
        backgroundColor: '#FF4757',
        bottom: 100,
        left: -80,
        opacity: 0.1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingTop: 60,
        paddingBottom: 40,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    logoContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    emoji: {
        fontSize: 80,
    },
    glowEffect: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#6C5CE7',
        opacity: 0.3,
        top: -10,
        left: -10,
        zIndex: -1,
    },
    title: {
        fontSize: 42,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: 6,
        textShadowColor: '#6C5CE7',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 30,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.6)',
        marginTop: 8,
        textAlign: 'center',
    },
    versionBadge: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 100,
        backgroundColor: 'rgba(108, 92, 231, 0.3)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    versionText: {
        fontSize: 11,
        color: 'rgba(255, 255, 255, 0.7)',
        fontWeight: '600',
    },
    settingCard: {
        marginBottom: 16,
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    cardGradient: {
        padding: 24,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    iconBadge: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: 'rgba(108, 92, 231, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    iconBadgeRed: {
        backgroundColor: 'rgba(255, 71, 87, 0.3)',
    },
    settingIcon: {
        fontSize: 24,
    },
    settingLabel: {
        fontSize: 22,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    counterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
        marginBottom: 12,
    },
    counterButton: {
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#6C5CE7',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    counterButtonGradient: {
        width: 56,
        height: 56,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    counterButtonText: {
        fontSize: 28,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    counterValueContainer: {
        width: 90,
        height: 90,
        borderRadius: 24,
        backgroundColor: 'rgba(108, 92, 231, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(108, 92, 231, 0.5)',
    },
    counterValueRed: {
        backgroundColor: 'rgba(255, 71, 87, 0.2)',
        borderColor: 'rgba(255, 71, 87, 0.5)',
    },
    counterValueText: {
        fontSize: 40,
        fontWeight: '900',
        color: '#FFFFFF',
    },
    settingHint: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.4)',
        textAlign: 'center',
    },
    summaryContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 24,
        gap: 12,
    },
    summaryCard: {
        flex: 1,
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    summaryGradient: {
        padding: 16,
        alignItems: 'center',
    },
    summaryEmoji: {
        fontSize: 28,
        marginBottom: 8,
    },
    summaryValue: {
        fontSize: 36,
        fontWeight: '900',
        color: '#5DADE2',
    },
    summaryLabel: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.5)',
        marginTop: 4,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    vsContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    vsText: {
        fontSize: 14,
        fontWeight: '800',
        color: 'rgba(255, 255, 255, 0.5)',
    },
    continueButton: {
        borderRadius: 24,
        overflow: 'hidden',
        shadowColor: '#6C5CE7',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 12,
    },
    continueButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
        paddingHorizontal: 32,
        gap: 16,
    },
    continueButtonText: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    arrowContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    continueButtonIcon: {
        fontSize: 18,
        color: '#FFFFFF',
        fontWeight: '700',
    },
});
