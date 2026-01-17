import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Dimensions,
    Modal,
    ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGame } from '../context/GameContext';
import { themes } from '../data/themes';
import { colors, gradients } from '../styles/colors';

const { width } = Dimensions.get('window');

interface PlayingScreenProps {
    onNewGame: () => void;
}

export const PlayingScreen: React.FC<PlayingScreenProps> = ({ onNewGame }) => {
    const { gameState, resetGame } = useGame();
    const [showReveal, setShowReveal] = useState(false);
    const [timer, setTimer] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const timerGlowAnim = useRef(new Animated.Value(0)).current;

    const currentTheme = themes.find(t => t.id === gameState.config.themeId);
    const impostors = gameState.players.filter(p => p.isImpostor);

    useEffect(() => {
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
        ]).start();

        // Animación de pulso
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.02,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isTimerRunning) {
            interval = setInterval(() => {
                setTimer(prev => prev + 1);
            }, 1000);

            // Animación de glow del timer
            Animated.loop(
                Animated.sequence([
                    Animated.timing(timerGlowAnim, {
                        toValue: 1,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(timerGlowAnim, {
                        toValue: 0.5,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        } else {
            timerGlowAnim.stopAnimation();
            timerGlowAnim.setValue(0);
        }
        return () => clearInterval(interval);
    }, [isTimerRunning]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleNewGame = () => {
        resetGame();
        onNewGame();
    };

    const timerGlowOpacity = timerGlowAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0.3, 0.5, 0.8],
    });

    return (
        <LinearGradient
            colors={['#0a0a1a', '#1a1a3a', '#0f0f2a']}
            style={styles.container}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            {/* Background effects */}
            <View style={styles.bgCircle1} />
            <View style={styles.bgCircle2} />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View
                    style={[
                        styles.content,
                        {
                            opacity: fadeAnim,
                            transform: [{ scale: scaleAnim }]
                        }
                    ]}
                >
                    {/* Header Card */}
                    <View style={styles.headerCard}>
                        <LinearGradient
                            colors={[`${currentTheme?.color}30`, `${currentTheme?.color}10`]}
                            style={styles.headerCardGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <View style={styles.themeInfo}>
                                <View style={[
                                    styles.themeIconContainer,
                                    { backgroundColor: `${currentTheme?.color}40` }
                                ]}>
                                    <Text style={styles.themeIcon}>{currentTheme?.icon}</Text>
                                </View>
                                <View style={styles.themeDetails}>
                                    <Text style={styles.themeName}>{currentTheme?.name}</Text>
                                    <Text style={styles.playerCount}>
                                        {gameState.config.numberOfPlayers} jugadores · {gameState.config.numberOfImpostors} impostor
                                    </Text>
                                </View>
                            </View>
                        </LinearGradient>
                    </View>

                    {/* Timer */}
                    <View style={styles.timerSection}>
                        <TouchableOpacity
                            onPress={() => setIsTimerRunning(!isTimerRunning)}
                            activeOpacity={0.9}
                        >
                            <Animated.View style={[
                                styles.timerContainer,
                                { transform: [{ scale: isTimerRunning ? pulseAnim : 1 }] }
                            ]}>
                                {/* Glow effect */}
                                {isTimerRunning && (
                                    <Animated.View
                                        style={[
                                            styles.timerGlow,
                                            { opacity: timerGlowOpacity }
                                        ]}
                                    />
                                )}
                                <LinearGradient
                                    colors={isTimerRunning
                                        ? ['#FF6B35', '#FF4757']
                                        : ['#2a2a4a', '#1a1a3a']
                                    }
                                    style={styles.timerGradient}
                                >
                                    <Text style={styles.timerText}>{formatTime(timer)}</Text>
                                    <Text style={styles.timerLabel}>
                                        {isTimerRunning ? '⏸ Toca para pausar' : '▶ Toca para iniciar'}
                                    </Text>
                                </LinearGradient>
                            </Animated.View>
                        </TouchableOpacity>
                    </View>

                    {/* Instructions Card */}
                    <View style={styles.instructionsCard}>
                        <LinearGradient
                            colors={['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.02)']}
                            style={styles.instructionsGradient}
                        >
                            <View style={styles.instructionsHeader}>
                                <Text style={styles.instructionsIcon}>📋</Text>
                                <Text style={styles.instructionsTitle}>Cómo Jugar</Text>
                            </View>

                            <View style={styles.instructionsList}>
                                {[
                                    '👆 Por turnos, cada jugador da una pista sobre la palabra',
                                    '🤫 El impostor no conoce la palabra, debe disimular',
                                    '🗳️ Después de varias rondas, voten quién es el impostor',
                                    '🎉 Si el impostor es descubierto, ¡ganan los tripulantes!'
                                ].map((instruction, index) => (
                                    <View key={index} style={styles.instructionItem}>
                                        <View style={styles.instructionDot}>
                                            <LinearGradient
                                                colors={['#6C5CE7', '#A29BFE']}
                                                style={styles.instructionDotGradient}
                                            />
                                        </View>
                                        <Text style={styles.instructionText}>{instruction}</Text>
                                    </View>
                                ))}
                            </View>
                        </LinearGradient>
                    </View>

                    {/* Action buttons */}
                    <View style={styles.actionsContainer}>
                        <TouchableOpacity
                            style={styles.revealButton}
                            onPress={() => setShowReveal(true)}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={['#FF4757', '#C0392B']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.revealButtonGradient}
                            >
                                <Text style={styles.revealButtonIcon}>🔍</Text>
                                <Text style={styles.revealButtonText}>Revelar Impostor</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.newGameButton}
                            onPress={handleNewGame}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={['#6C5CE7', '#A29BFE']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.newGameButtonGradient}
                            >
                                <Text style={styles.newGameButtonText}>🔄 Nueva Partida</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </ScrollView>

            {/* Reveal Modal */}
            <Modal
                visible={showReveal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowReveal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <LinearGradient
                            colors={['#1a1a3a', '#0f0f2a']}
                            style={styles.modalGradient}
                        >
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalEmoji}>🔍</Text>
                                <Text style={styles.modalTitle}>Revelación</Text>
                            </View>

                            <View style={styles.revealSection}>
                                <Text style={styles.revealLabel}>La palabra era:</Text>
                                <View style={styles.wordBadge}>
                                    <LinearGradient
                                        colors={['#6C5CE7', '#A29BFE']}
                                        style={styles.wordBadgeGradient}
                                    >
                                        <Text style={styles.revealWord}>{gameState.secretWord}</Text>
                                    </LinearGradient>
                                </View>
                            </View>

                            <View style={styles.revealSection}>
                                <Text style={styles.revealLabel}>
                                    {impostors.length === 1 ? 'El impostor era:' : 'Los impostores eran:'}
                                </Text>
                                <View style={styles.impostorsList}>
                                    {impostors.map(impostor => (
                                        <View key={impostor.id} style={styles.impostorItem}>
                                            <LinearGradient
                                                colors={['rgba(255, 71, 87, 0.3)', 'rgba(255, 71, 87, 0.1)']}
                                                style={styles.impostorItemGradient}
                                            >
                                                <Text style={styles.impostorEmoji}>🔪</Text>
                                                <Text style={styles.impostorName}>{impostor.name}</Text>
                                            </LinearGradient>
                                        </View>
                                    ))}
                                </View>
                            </View>

                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={styles.modalCloseButton}
                                    onPress={() => setShowReveal(false)}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.modalCloseButtonText}>Cerrar</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.modalNewGameButton}
                                    onPress={() => {
                                        setShowReveal(false);
                                        handleNewGame();
                                    }}
                                    activeOpacity={0.8}
                                >
                                    <LinearGradient
                                        colors={['#6C5CE7', '#A29BFE']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={styles.modalNewGameButtonGradient}
                                    >
                                        <Text style={styles.modalNewGameButtonText}>
                                            🔄 Nueva Partida
                                        </Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        </LinearGradient>
                    </View>
                </View>
            </Modal>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    bgCircle1: {
        position: 'absolute',
        width: 250,
        height: 250,
        borderRadius: 125,
        backgroundColor: '#6C5CE7',
        top: -80,
        right: -80,
        opacity: 0.08,
    },
    bgCircle2: {
        position: 'absolute',
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: '#FF4757',
        bottom: 100,
        left: -60,
        opacity: 0.08,
    },
    scrollView: {
        flex: 1,
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
    headerCard: {
        borderRadius: 24,
        overflow: 'hidden',
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    headerCardGradient: {
        padding: 20,
    },
    themeInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    themeIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    themeIcon: {
        fontSize: 36,
    },
    themeDetails: {
        flex: 1,
    },
    themeName: {
        fontSize: 24,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    playerCount: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.6)',
    },
    timerSection: {
        alignItems: 'center',
        marginBottom: 24,
    },
    timerContainer: {
        position: 'relative',
    },
    timerGlow: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: '#FF4757',
        top: -10,
        left: -10,
    },
    timerGradient: {
        width: 180,
        height: 180,
        borderRadius: 90,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    timerText: {
        fontSize: 42,
        fontWeight: '900',
        color: '#FFFFFF',
        fontVariant: ['tabular-nums'],
    },
    timerLabel: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.7)',
        marginTop: 8,
    },
    instructionsCard: {
        borderRadius: 24,
        overflow: 'hidden',
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    instructionsGradient: {
        padding: 20,
    },
    instructionsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    instructionsIcon: {
        fontSize: 24,
    },
    instructionsTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    instructionsList: {
        gap: 14,
    },
    instructionItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
    instructionDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginTop: 6,
        overflow: 'hidden',
    },
    instructionDotGradient: {
        flex: 1,
    },
    instructionText: {
        flex: 1,
        fontSize: 15,
        color: 'rgba(255, 255, 255, 0.7)',
        lineHeight: 22,
    },
    actionsContainer: {
        gap: 12,
    },
    revealButton: {
        borderRadius: 24,
        overflow: 'hidden',
        shadowColor: '#FF4757',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 12,
    },
    revealButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        paddingHorizontal: 32,
        gap: 12,
    },
    revealButtonIcon: {
        fontSize: 22,
    },
    revealButtonText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    newGameButton: {
        borderRadius: 24,
        overflow: 'hidden',
        shadowColor: '#6C5CE7',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    newGameButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 32,
    },
    newGameButtonText: {
        fontSize: 17,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContent: {
        width: '100%',
        maxWidth: 380,
        borderRadius: 28,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    modalGradient: {
        padding: 28,
        alignItems: 'center',
    },
    modalHeader: {
        alignItems: 'center',
        marginBottom: 24,
    },
    modalEmoji: {
        fontSize: 48,
        marginBottom: 12,
    },
    modalTitle: {
        fontSize: 28,
        fontWeight: '900',
        color: '#FFFFFF',
    },
    revealSection: {
        alignItems: 'center',
        marginBottom: 24,
        width: '100%',
    },
    revealLabel: {
        fontSize: 15,
        color: 'rgba(255, 255, 255, 0.6)',
        marginBottom: 12,
    },
    wordBadge: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    wordBadgeGradient: {
        paddingHorizontal: 32,
        paddingVertical: 16,
    },
    revealWord: {
        fontSize: 28,
        fontWeight: '900',
        color: '#FFFFFF',
        textAlign: 'center',
    },
    impostorsList: {
        gap: 10,
        width: '100%',
    },
    impostorItem: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    impostorItemGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 14,
        gap: 12,
    },
    impostorEmoji: {
        fontSize: 24,
    },
    impostorName: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FF4757',
    },
    modalButtons: {
        width: '100%',
        gap: 12,
        marginTop: 8,
    },
    modalCloseButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingVertical: 14,
        borderRadius: 16,
        alignItems: 'center',
    },
    modalCloseButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.7)',
    },
    modalNewGameButton: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    modalNewGameButtonGradient: {
        alignItems: 'center',
        paddingVertical: 16,
    },
    modalNewGameButtonText: {
        fontSize: 17,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});
