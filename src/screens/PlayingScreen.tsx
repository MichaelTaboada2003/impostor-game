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
    Vibration,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGame } from '../context/GameContext';
import { WhoStartsModal } from '../components/WhoStartsModal';
import { colors } from '../styles/colors';

const { width } = Dimensions.get('window');

interface PlayingScreenProps {
    onStartVoting: () => void;
    onNewGame: () => void;
}

export const PlayingScreen: React.FC<PlayingScreenProps> = ({
    onStartVoting,
    onNewGame,
}) => {
    const { gameState, resetGame, allThemes, setPhase } = useGame();
    const [showQuickReveal, setShowQuickReveal] = useState(false);
    const [showWhoStarts, setShowWhoStarts] = useState(false);

    const targetSeconds = gameState.config.roundTimerSeconds || 0; // 0 = count up
    const isCountdown = targetSeconds > 0;
    const [timer, setTimer] = useState(isCountdown ? targetSeconds : 0);
    const [isTimerRunning, setIsTimerRunning] = useState(true);

    const pulseAnim = useRef(new Animated.Value(1)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.92)).current;
    const alertGlowAnim = useRef(new Animated.Value(0)).current;

    const currentTheme = allThemes.find(t => t.id === gameState.config.themeId);
    const impostors = gameState.players.filter(p => p.isImpostor);

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
            Animated.spring(scaleAnim, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }),
        ]).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.03, duration: 1000, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isTimerRunning) {
            interval = setInterval(() => {
                setTimer(prev => {
                    if (isCountdown) {
                        if (prev <= 1) {
                            clearInterval(interval);
                            setIsTimerRunning(false);
                            Vibration.vibrate([0, 200, 100, 200, 100, 400]);
                            return 0;
                        }
                        if (prev <= 11) {
                            Vibration.vibrate(40);
                        }
                        return prev - 1;
                    } else {
                        return prev + 1;
                    }
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isTimerRunning, isCountdown]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleNewGame = () => {
        resetGame();
        onNewGame();
    };

    const isNearEnd = isCountdown && timer <= 15 && timer > 0;
    const isEnded = isCountdown && timer === 0;

    return (
        <LinearGradient
            colors={['#0a0a1a', '#141432', '#0a0a1a']}
            style={styles.container}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
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
                        { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
                    ]}
                >
                    {/* Header Banner */}
                    <View style={styles.headerCard}>
                        <LinearGradient
                            colors={[`${currentTheme?.color || '#6C5CE7'}35`, `${currentTheme?.color || '#6C5CE7'}10`]}
                            style={styles.headerCardGradient}
                        >
                            <View style={styles.themeInfo}>
                                <View
                                    style={[
                                        styles.themeIconContainer,
                                        { backgroundColor: `${currentTheme?.color || '#6C5CE7'}45` },
                                    ]}
                                >
                                    <Text style={styles.themeIcon}>{currentTheme?.icon || '🎭'}</Text>
                                </View>
                                <View style={styles.themeDetails}>
                                    <Text style={styles.themeName}>{currentTheme?.name || 'Impostor'}</Text>
                                    <Text style={styles.playerCount}>
                                        {gameState.config.numberOfPlayers} jugadores · {gameState.config.numberOfImpostors} impostor(es)
                                    </Text>
                                </View>

                                {gameState.config.gameMode === 'undercover' && (
                                    <View style={styles.undercoverModeBadge}>
                                        <Text style={styles.undercoverModeText}>🤫 Undercover</Text>
                                    </View>
                                )}
                            </View>
                        </LinearGradient>
                    </View>

                    {/* Who Starts Roulette Shortcut Button */}
                    <TouchableOpacity
                        style={styles.whoStartsBtn}
                        onPress={() => setShowWhoStarts(true)}
                        activeOpacity={0.85}
                    >
                        <LinearGradient
                            colors={['#6C5CE7', '#FD79A8']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.whoStartsGradient}
                        >
                            <Text style={styles.whoStartsIcon}>🎲</Text>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.whoStartsTitle}>¿Quién da la primera pista?</Text>
                                <Text style={styles.whoStartsSub}>Toca para girar la ruleta de turno</Text>
                            </View>
                            <Text style={styles.whoStartsArrow}>➔</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* Timer Section */}
                    <View style={styles.timerSection}>
                        <TouchableOpacity
                            onPress={() => setIsTimerRunning(!isTimerRunning)}
                            activeOpacity={0.9}
                        >
                            <Animated.View
                                style={[
                                    styles.timerContainer,
                                    {
                                        transform: [
                                            { scale: isNearEnd || isEnded ? pulseAnim : 1 },
                                        ],
                                    },
                                ]}
                            >
                                <LinearGradient
                                    colors={
                                        isEnded
                                            ? ['#FF4757', '#C0392B']
                                            : isNearEnd
                                            ? ['#E67E22', '#FF4757']
                                            : isTimerRunning
                                            ? ['#6C5CE7', '#5B4BD5']
                                            : ['#282846', '#1a1a32']
                                    }
                                    style={styles.timerGradient}
                                >
                                    <Text style={styles.timerText}>{formatTime(timer)}</Text>
                                    <Text style={styles.timerLabel}>
                                        {isEnded
                                            ? '⏰ ¡TIEMPO TERMINADO!'
                                            : isTimerRunning
                                            ? '⏸ Toca para pausar'
                                            : '▶ Toca para iniciar'}
                                    </Text>
                                </LinearGradient>
                            </Animated.View>
                        </TouchableOpacity>
                    </View>

                    {/* Game Rules & Turn Guidelines */}
                    <View style={styles.instructionsCard}>
                        <LinearGradient
                            colors={['rgba(255, 255, 255, 0.07)', 'rgba(255, 255, 255, 0.02)']}
                            style={styles.instructionsGradient}
                        >
                            <View style={styles.instructionsHeader}>
                                <Text style={styles.instructionsIcon}>💡</Text>
                                <Text style={styles.instructionsTitle}>Reglas de la Ronda</Text>
                            </View>

                            <View style={styles.instructionsList}>
                                {[
                                    'Por turnos, cada jugador dice UNA sola palabra o frase corta como pista.',
                                    'El impostor no conoce la palabra (o tiene una parecida), ¡debe disimular!',
                                    'Escuchen con atención las pistas sospechosas o dudosas.',
                                    'Cuando todos hayan participado, pasen a la Fase de Votación.',
                                ].map((instruction, index) => (
                                    <View key={index} style={styles.instructionItem}>
                                        <View style={styles.instructionDot}>
                                            <LinearGradient
                                                colors={['#00CEC9', '#6C5CE7']}
                                                style={styles.instructionDotGradient}
                                            />
                                        </View>
                                        <Text style={styles.instructionText}>{instruction}</Text>
                                    </View>
                                ))}
                            </View>
                        </LinearGradient>
                    </View>

                    {/* Primary Actions */}
                    <View style={styles.actionsContainer}>
                        {/* Start Voting Phase Button */}
                        <TouchableOpacity
                            style={styles.votingBtn}
                            onPress={onStartVoting}
                            activeOpacity={0.85}
                        >
                            <LinearGradient
                                colors={['#FF4757', '#FD79A8', '#6C5CE7']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.votingBtnGradient}
                            >
                                <Text style={styles.votingBtnIcon}>🗳️</Text>
                                <Text style={styles.votingBtnText}>¡Ir a Fase de Votación!</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        {/* Quick Reveal / Direct Results Button */}
                        <TouchableOpacity
                            style={styles.quickRevealBtn}
                            onPress={() => setShowQuickReveal(true)}
                            activeOpacity={0.85}
                        >
                            <Text style={styles.quickRevealText}>🔍 Revelación Rápida</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </ScrollView>

            {/* Who Starts Roulette Modal */}
            <WhoStartsModal
                visible={showWhoStarts}
                players={gameState.players}
                onClose={() => setShowWhoStarts(false)}
            />

            {/* Quick Reveal Modal */}
            <Modal
                visible={showQuickReveal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowQuickReveal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <LinearGradient
                            colors={['#1c1c38', '#0f0f2a']}
                            style={styles.modalGradient}
                        >
                            <Text style={styles.modalEmoji}>🔍</Text>
                            <Text style={styles.modalTitle}>Revelación Directa</Text>

                            <View style={styles.revealSection}>
                                <Text style={styles.revealLabel}>La palabra secreta era:</Text>
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
                                    onPress={() => setShowQuickReveal(false)}
                                >
                                    <Text style={styles.modalCloseButtonText}>Cerrar</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.modalNewGameButton}
                                    onPress={() => {
                                        setShowQuickReveal(false);
                                        handleNewGame();
                                    }}
                                >
                                    <LinearGradient
                                        colors={['#6C5CE7', '#A29BFE']}
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
        width: 260,
        height: 260,
        borderRadius: 130,
        backgroundColor: '#6C5CE7',
        top: -80,
        right: -80,
        opacity: 0.08,
    },
    bgCircle2: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
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
        paddingTop: 54,
        paddingBottom: 40,
    },
    content: {
        flex: 1,
        paddingHorizontal: 22,
    },
    headerCard: {
        borderRadius: 22,
        overflow: 'hidden',
        marginBottom: 14,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    headerCardGradient: {
        padding: 16,
    },
    themeInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    themeIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    themeIcon: {
        fontSize: 30,
    },
    themeDetails: {
        flex: 1,
    },
    themeName: {
        fontSize: 22,
        fontWeight: '900',
        color: '#FFFFFF',
        marginBottom: 2,
    },
    playerCount: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.6)',
    },
    undercoverModeBadge: {
        backgroundColor: 'rgba(253, 121, 168, 0.3)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#FD79A8',
    },
    undercoverModeText: {
        fontSize: 11,
        color: '#FD79A8',
        fontWeight: '800',
    },
    whoStartsBtn: {
        borderRadius: 18,
        overflow: 'hidden',
        marginBottom: 18,
        shadowColor: '#6C5CE7',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 6,
    },
    whoStartsGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        gap: 12,
    },
    whoStartsIcon: {
        fontSize: 24,
    },
    whoStartsTitle: {
        fontSize: 15,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    whoStartsSub: {
        fontSize: 11,
        color: 'rgba(255, 255, 255, 0.7)',
        marginTop: 1,
    },
    whoStartsArrow: {
        fontSize: 18,
        color: '#FFFFFF',
        fontWeight: '900',
    },
    timerSection: {
        alignItems: 'center',
        marginBottom: 20,
    },
    timerContainer: {
        position: 'relative',
    },
    timerGradient: {
        width: 170,
        height: 170,
        borderRadius: 85,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: 'rgba(255, 255, 255, 0.15)',
        shadowColor: '#6C5CE7',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 14,
        elevation: 8,
    },
    timerText: {
        fontSize: 40,
        fontWeight: '900',
        color: '#FFFFFF',
        fontVariant: ['tabular-nums'],
    },
    timerLabel: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 6,
        fontWeight: '700',
    },
    instructionsCard: {
        borderRadius: 22,
        overflow: 'hidden',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    instructionsGradient: {
        padding: 18,
    },
    instructionsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 12,
    },
    instructionsIcon: {
        fontSize: 20,
    },
    instructionsTitle: {
        fontSize: 17,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    instructionsList: {
        gap: 10,
    },
    instructionItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
    },
    instructionDot: {
        width: 7,
        height: 7,
        borderRadius: 3.5,
        marginTop: 6,
        overflow: 'hidden',
    },
    instructionDotGradient: {
        flex: 1,
    },
    instructionText: {
        flex: 1,
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.75)',
        lineHeight: 20,
    },
    actionsContainer: {
        gap: 10,
    },
    votingBtn: {
        borderRadius: 22,
        overflow: 'hidden',
        shadowColor: '#FF4757',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 16,
        elevation: 10,
    },
    votingBtnGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        paddingHorizontal: 24,
        gap: 12,
    },
    votingBtnIcon: {
        fontSize: 22,
    },
    votingBtnText: {
        fontSize: 18,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: 0.5,
    },
    quickRevealBtn: {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        paddingVertical: 14,
        borderRadius: 18,
        alignItems: 'center',
    },
    quickRevealText: {
        color: 'rgba(255, 255, 255, 0.65)',
        fontSize: 14,
        fontWeight: '700',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.88)',
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
        borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    modalGradient: {
        padding: 26,
        alignItems: 'center',
    },
    modalEmoji: {
        fontSize: 44,
        marginBottom: 8,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: '#FFFFFF',
        marginBottom: 18,
    },
    revealSection: {
        alignItems: 'center',
        marginBottom: 18,
        width: '100%',
    },
    revealLabel: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.6)',
        marginBottom: 8,
    },
    wordBadge: {
        borderRadius: 16,
        overflow: 'hidden',
        width: '100%',
    },
    wordBadgeGradient: {
        paddingVertical: 14,
        alignItems: 'center',
    },
    revealWord: {
        fontSize: 26,
        fontWeight: '900',
        color: '#FFFFFF',
    },
    impostorsList: {
        gap: 8,
        width: '100%',
    },
    impostorItem: {
        borderRadius: 14,
        overflow: 'hidden',
    },
    impostorItemGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 10,
    },
    impostorEmoji: {
        fontSize: 20,
    },
    impostorName: {
        fontSize: 18,
        fontWeight: '800',
        color: '#FF4757',
    },
    modalButtons: {
        width: '100%',
        gap: 10,
        marginTop: 6,
    },
    modalCloseButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingVertical: 12,
        borderRadius: 14,
        alignItems: 'center',
    },
    modalCloseButtonText: {
        fontSize: 15,
        fontWeight: '700',
        color: 'rgba(255, 255, 255, 0.7)',
    },
    modalNewGameButton: {
        borderRadius: 14,
        overflow: 'hidden',
    },
    modalNewGameButtonGradient: {
        alignItems: 'center',
        paddingVertical: 14,
    },
    modalNewGameButtonText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#FFFFFF',
    },
});
