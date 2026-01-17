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

    const currentTheme = themes.find(t => t.id === gameState.config.themeId);
    const impostors = gameState.players.filter(p => p.isImpostor);

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();

        // Pulse animation for the timer
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.05,
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

    return (
        <LinearGradient colors={gradients.dark as [string, string]} style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.themeInfo}>
                            <Text style={styles.themeIcon}>{currentTheme?.icon}</Text>
                            <View>
                                <Text style={styles.themeName}>{currentTheme?.name}</Text>
                                <Text style={styles.playerCount}>
                                    {gameState.config.numberOfPlayers} jugadores · {gameState.config.numberOfImpostors} impostor(es)
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Timer */}
                    <Animated.View style={[styles.timerContainer, { transform: [{ scale: pulseAnim }] }]}>
                        <TouchableOpacity
                            onPress={() => setIsTimerRunning(!isTimerRunning)}
                            style={styles.timerButton}
                        >
                            <LinearGradient
                                colors={isTimerRunning ? ['#FF6B35', '#E84118'] : ['#2D2D44', '#1A1A2E']}
                                style={styles.timerGradient}
                            >
                                <Text style={styles.timerText}>{formatTime(timer)}</Text>
                                <Text style={styles.timerLabel}>
                                    {isTimerRunning ? 'Toca para pausar' : 'Toca para iniciar'}
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Instructions */}
                    <View style={styles.instructionsContainer}>
                        <Text style={styles.instructionsTitle}>📋 Instrucciones</Text>
                        <View style={styles.instructionsList}>
                            <View style={styles.instructionItem}>
                                <Text style={styles.instructionNumber}>1</Text>
                                <Text style={styles.instructionText}>
                                    Por turnos, cada jugador da una pista sobre la palabra
                                </Text>
                            </View>
                            <View style={styles.instructionItem}>
                                <Text style={styles.instructionNumber}>2</Text>
                                <Text style={styles.instructionText}>
                                    El impostor no conoce la palabra, debe disimular
                                </Text>
                            </View>
                            <View style={styles.instructionItem}>
                                <Text style={styles.instructionNumber}>3</Text>
                                <Text style={styles.instructionText}>
                                    Después de varias rondas, voten quién es el impostor
                                </Text>
                            </View>
                            <View style={styles.instructionItem}>
                                <Text style={styles.instructionNumber}>4</Text>
                                <Text style={styles.instructionText}>
                                    Si el impostor es descubierto, ¡ganan los tripulantes!
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Action buttons */}
                    <View style={styles.actionsContainer}>
                        <TouchableOpacity
                            style={styles.revealButton}
                            onPress={() => setShowReveal(true)}
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

                        <TouchableOpacity style={styles.newGameButton} onPress={handleNewGame}>
                            <LinearGradient
                                colors={gradients.primary as [string, string]}
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
                            colors={['#2D2D44', '#1A1A2E']}
                            style={styles.modalGradient}
                        >
                            <Text style={styles.modalTitle}>🔍 Revelación</Text>

                            <View style={styles.revealSection}>
                                <Text style={styles.revealLabel}>La palabra era:</Text>
                                <Text style={styles.revealWord}>{gameState.secretWord}</Text>
                            </View>

                            <View style={styles.revealSection}>
                                <Text style={styles.revealLabel}>
                                    {impostors.length === 1 ? 'El impostor era:' : 'Los impostores eran:'}
                                </Text>
                                <View style={styles.impostorsList}>
                                    {impostors.map(impostor => (
                                        <View key={impostor.id} style={styles.impostorItem}>
                                            <Text style={styles.impostorEmoji}>🔪</Text>
                                            <Text style={styles.impostorName}>
                                                {impostor.name}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            </View>

                            <View style={styles.modalButtonsContainer}>
                                <TouchableOpacity
                                    style={styles.modalCloseButton}
                                    onPress={() => setShowReveal(false)}
                                >
                                    <Text style={styles.modalCloseButtonText}>Cerrar</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.modalNewGameButton}
                                    onPress={() => {
                                        setShowReveal(false);
                                        handleNewGame();
                                    }}
                                >
                                    <LinearGradient
                                        colors={gradients.primary as [string, string]}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={styles.modalNewGameButtonGradient}
                                    >
                                        <Text style={styles.modalNewGameButtonText}>🔄 Nueva Partida</Text>
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
        padding: 24,
        paddingTop: 0,
    },
    header: {
        marginBottom: 24,
    },
    themeInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        padding: 16,
        borderRadius: 16,
        gap: 16,
    },
    themeIcon: {
        fontSize: 48,
    },
    themeName: {
        fontSize: 24,
        fontWeight: '800',
        color: colors.textPrimary,
    },
    playerCount: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: 4,
    },
    timerContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    timerButton: {
        borderRadius: 100,
        overflow: 'hidden',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 12,
    },
    timerGradient: {
        width: 180,
        height: 180,
        borderRadius: 90,
        justifyContent: 'center',
        alignItems: 'center',
    },
    timerText: {
        fontSize: 42,
        fontWeight: '900',
        color: colors.textPrimary,
        fontVariant: ['tabular-nums'],
    },
    timerLabel: {
        fontSize: 12,
        color: colors.textSecondary,
        marginTop: 8,
    },
    instructionsContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 20,
        padding: 16,
        marginBottom: 20,
    },
    instructionsTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: 12,
    },
    instructionsList: {
        gap: 10,
    },
    instructionItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
    },
    instructionNumber: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: colors.primary,
        color: colors.textPrimary,
        fontSize: 12,
        fontWeight: '700',
        textAlign: 'center',
        lineHeight: 24,
        overflow: 'hidden',
    },
    instructionText: {
        flex: 1,
        fontSize: 14,
        color: colors.textSecondary,
        lineHeight: 20,
    },
    actionsContainer: {
        gap: 12,
        marginTop: 'auto',
    },
    revealButton: {
        borderRadius: 20,
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
        color: colors.textPrimary,
    },
    newGameButton: {
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: colors.primary,
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
        fontSize: 18,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalContent: {
        width: '100%',
        maxWidth: 400,
        borderRadius: 24,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.5,
        shadowRadius: 30,
        elevation: 20,
    },
    modalGradient: {
        padding: 32,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 28,
        fontWeight: '900',
        color: colors.textPrimary,
        marginBottom: 24,
    },
    revealSection: {
        alignItems: 'center',
        marginBottom: 20,
        width: '100%',
    },
    revealLabel: {
        fontSize: 16,
        color: colors.textSecondary,
        marginBottom: 8,
    },
    revealWord: {
        fontSize: 32,
        fontWeight: '900',
        color: colors.secondary,
        textAlign: 'center',
    },
    impostorsList: {
        gap: 12,
        marginTop: 8,
    },
    impostorItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 71, 87, 0.2)',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
        gap: 12,
    },
    impostorEmoji: {
        fontSize: 24,
    },
    impostorName: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.impostorRed,
    },
    modalButtonsContainer: {
        width: '100%',
        gap: 12,
        marginTop: 8,
    },
    modalCloseButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 16,
        alignItems: 'center',
    },
    modalCloseButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textSecondary,
    },
    modalNewGameButton: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    modalNewGameButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 32,
    },
    modalNewGameButtonText: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.textPrimary,
    },
});
