import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Dimensions,
    Vibration,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGame } from '../context/GameContext';
import { themes } from '../data/themes';
import { colors, gradients } from '../styles/colors';

const { width, height } = Dimensions.get('window');

interface RoleDistributionScreenProps {
    onBack: () => void;
    onComplete: () => void;
}

type CardState = 'waiting' | 'revealing' | 'revealed';

export const RoleDistributionScreen: React.FC<RoleDistributionScreenProps> = ({
    onBack,
    onComplete,
}) => {
    const { gameState, markPlayerAsSeen, nextPlayer, getCurrentPlayer } = useGame();
    const [cardState, setCardState] = useState<CardState>('waiting');
    const [isHolding, setIsHolding] = useState(false);
    const holdProgress = useRef(new Animated.Value(0)).current;
    const flipAnim = useRef(new Animated.Value(0)).current;
    const shakeAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const holdTimer = useRef<NodeJS.Timeout | null>(null);

    const currentPlayer = getCurrentPlayer();
    const currentTheme = themes.find(t => t.id === gameState.config.themeId);
    const progress = ((gameState.currentPlayerIndex + 1) / gameState.players.length) * 100;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start();
    }, []);

    useEffect(() => {
        // Reset card when player changes
        setCardState('waiting');
        flipAnim.setValue(0);
        holdProgress.setValue(0);
    }, [gameState.currentPlayerIndex]);

    const startHold = () => {
        if (cardState !== 'waiting') return;

        setIsHolding(true);
        setCardState('revealing');

        Animated.timing(holdProgress, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: false,
        }).start(({ finished }) => {
            if (finished) {
                revealCard();
            }
        });
    };

    const cancelHold = () => {
        if (cardState === 'revealed') return;

        setIsHolding(false);
        setCardState('waiting');
        holdProgress.stopAnimation();

        Animated.timing(holdProgress, {
            toValue: 0,
            duration: 200,
            useNativeDriver: false,
        }).start();
    };

    const revealCard = () => {
        setCardState('revealed');

        // Vibrate for impostor
        if (currentPlayer?.isImpostor) {
            Vibration.vibrate([0, 100, 50, 100, 50, 100]);

            // Shake animation
            Animated.sequence([
                Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
            ]).start();
        }

        // Flip animation
        Animated.spring(flipAnim, {
            toValue: 1,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
        }).start();

        if (currentPlayer) {
            markPlayerAsSeen(currentPlayer.id);
        }
    };

    const handleNext = () => {
        const isLastPlayer = gameState.currentPlayerIndex === gameState.players.length - 1;

        if (isLastPlayer) {
            onComplete();
        } else {
            nextPlayer();
        }
    };

    const frontInterpolate = flipAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg'],
    });

    const backInterpolate = flipAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['180deg', '360deg'],
    });

    const progressWidth = holdProgress.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    });

    if (!currentPlayer) return null;

    return (
        <LinearGradient colors={gradients.dark as [string, string]} style={styles.container}>
            <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.progressContainer}>
                        <View style={styles.progressBar}>
                            <View style={[styles.progressFill, { width: `${progress}%` }]} />
                        </View>
                        <Text style={styles.progressText}>
                            {gameState.currentPlayerIndex + 1} / {gameState.players.length}
                        </Text>
                    </View>
                    <View style={styles.themeTag}>
                        <Text style={styles.themeIcon}>{currentTheme?.icon}</Text>
                        <Text style={styles.themeName}>{currentTheme?.name}</Text>
                    </View>
                </View>

                {/* Player indicator */}
                <View style={styles.playerIndicator}>
                    <Text style={styles.playerNumber}>{currentPlayer.name}</Text>
                    <Text style={styles.playerInstruction}>
                        {cardState === 'waiting' && 'Mantén presionado para ver tu rol'}
                        {cardState === 'revealing' && 'Sigue manteniendo...'}
                        {cardState === 'revealed' && 'Memoriza tu información'}
                    </Text>
                </View>

                {/* Card */}
                <View style={styles.cardContainer}>
                    {/* Front of card (hidden) */}
                    <Animated.View
                        style={[
                            styles.card,
                            styles.cardFront,
                            { transform: [{ rotateY: frontInterpolate }] },
                        ]}
                    >
                        <TouchableOpacity
                            style={styles.cardTouchable}
                            onPressIn={startHold}
                            onPressOut={cancelHold}
                            activeOpacity={1}
                        >
                            <LinearGradient
                                colors={['#2D2D44', '#1A1A2E']}
                                style={styles.cardGradient}
                            >
                                <Text style={styles.cardQuestionMark}>?</Text>
                                <Text style={styles.cardHiddenText}>
                                    {cardState === 'waiting' ? 'Mantén presionado' : 'Revelando...'}
                                </Text>

                                {/* Progress bar */}
                                <View style={styles.holdProgressContainer}>
                                    <Animated.View
                                        style={[
                                            styles.holdProgressBar,
                                            { width: progressWidth },
                                        ]}
                                    />
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Back of card (revealed) */}
                    <Animated.View
                        style={[
                            styles.card,
                            styles.cardBack,
                            {
                                transform: [
                                    { rotateY: backInterpolate },
                                    { translateX: shakeAnim },
                                ],
                            },
                        ]}
                    >
                        <LinearGradient
                            colors={
                                currentPlayer.isImpostor
                                    ? (['#FF4757', '#C0392B'] as [string, string])
                                    : (['#5DADE2', '#3498DB'] as [string, string])
                            }
                            style={styles.cardGradient}
                        >
                            <Text style={styles.roleEmoji}>
                                {currentPlayer.isImpostor ? '🔪' : '👤'}
                            </Text>
                            <Text style={styles.roleTitle}>
                                {currentPlayer.isImpostor ? '¡IMPOSTOR!' : 'TRIPULANTE'}
                            </Text>

                            <View style={styles.wordContainer}>
                                <Text style={styles.wordLabel}>
                                    {currentPlayer.isImpostor ? 'Tu palabra es:' : 'La palabra secreta es:'}
                                </Text>
                                <Text style={styles.wordText}>
                                    {currentPlayer.isImpostor ? '???' : gameState.secretWord}
                                </Text>
                            </View>

                            {currentPlayer.isImpostor && (
                                <Text style={styles.impostorHint}>
                                    No conoces la palabra. ¡Disimula!
                                </Text>
                            )}
                        </LinearGradient>
                    </Animated.View>
                </View>

                {/* Next button */}
                {cardState === 'revealed' && (
                    <Animated.View style={styles.nextButtonContainer}>
                        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                            <LinearGradient
                                colors={gradients.primary as [string, string]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.nextButtonGradient}
                            >
                                <Text style={styles.nextButtonText}>
                                    {gameState.currentPlayerIndex === gameState.players.length - 1
                                        ? '¡Comenzar Juego!'
                                        : 'Siguiente Jugador'}
                                </Text>
                                <Text style={styles.nextButtonIcon}>→</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </Animated.View>
                )}
            </Animated.View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: 24,
        paddingTop: 60,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    progressContainer: {
        flex: 1,
        marginRight: 16,
    },
    progressBar: {
        height: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 4,
    },
    progressFill: {
        height: '100%',
        backgroundColor: colors.primary,
        borderRadius: 4,
    },
    progressText: {
        fontSize: 12,
        color: colors.textMuted,
    },
    themeTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
    },
    themeIcon: {
        fontSize: 18,
    },
    themeName: {
        fontSize: 14,
        color: colors.textSecondary,
        fontWeight: '600',
    },
    playerIndicator: {
        alignItems: 'center',
        marginBottom: 32,
    },
    playerNumber: {
        fontSize: 28,
        fontWeight: '900',
        color: colors.textPrimary,
        marginBottom: 8,
    },
    playerInstruction: {
        fontSize: 16,
        color: colors.textSecondary,
        textAlign: 'center',
    },
    cardContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        width: width - 80,
        height: 400,
        borderRadius: 24,
        backfaceVisibility: 'hidden',
        position: 'absolute',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 20,
    },
    cardFront: {
        zIndex: 1,
    },
    cardBack: {
        zIndex: 0,
    },
    cardTouchable: {
        flex: 1,
        borderRadius: 24,
        overflow: 'hidden',
    },
    cardGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    cardQuestionMark: {
        fontSize: 120,
        fontWeight: '900',
        color: 'rgba(255, 255, 255, 0.2)',
        marginBottom: 16,
    },
    cardHiddenText: {
        fontSize: 18,
        color: colors.textSecondary,
        textAlign: 'center',
    },
    holdProgressContainer: {
        width: '80%',
        height: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 3,
        marginTop: 24,
        overflow: 'hidden',
    },
    holdProgressBar: {
        height: '100%',
        backgroundColor: colors.primary,
        borderRadius: 3,
    },
    roleEmoji: {
        fontSize: 80,
        marginBottom: 16,
    },
    roleTitle: {
        fontSize: 36,
        fontWeight: '900',
        color: colors.textPrimary,
        marginBottom: 24,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    wordContainer: {
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        paddingHorizontal: 32,
        paddingVertical: 20,
        borderRadius: 16,
        marginBottom: 16,
    },
    wordLabel: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.7)',
        marginBottom: 8,
    },
    wordText: {
        fontSize: 32,
        fontWeight: '900',
        color: colors.textPrimary,
        textAlign: 'center',
    },
    impostorHint: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.7)',
        textAlign: 'center',
        fontStyle: 'italic',
    },
    nextButtonContainer: {
        paddingTop: 20,
    },
    nextButton: {
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 12,
    },
    nextButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
        paddingHorizontal: 32,
        gap: 12,
    },
    nextButtonText: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    nextButtonIcon: {
        fontSize: 24,
        color: colors.textPrimary,
    },
});
