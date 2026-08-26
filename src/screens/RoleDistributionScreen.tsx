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
import { colors } from '../styles/colors';

const { width } = Dimensions.get('window');

interface RoleDistributionScreenProps {
    onBack: () => void;
    onComplete: () => void;
}

type CardState = 'waiting' | 'revealing' | 'revealed';

export const RoleDistributionScreen: React.FC<RoleDistributionScreenProps> = ({
    onBack,
    onComplete,
}) => {
    const { gameState, markPlayerAsSeen, nextPlayer, getCurrentPlayer, allThemes } = useGame();
    const currentThemeData = allThemes.find(t => t.id === gameState.config.themeId);
    const [cardState, setCardState] = useState<CardState>('waiting');

    const holdProgress = useRef(new Animated.Value(0)).current;
    const cardOpacity = useRef(new Animated.Value(1)).current;
    const revealOpacity = useRef(new Animated.Value(0)).current;
    const cardScale = useRef(new Animated.Value(1)).current;
    const shakeAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    const currentPlayer = getCurrentPlayer();
    const currentTheme = currentThemeData;
    const isUndercoverMode = gameState.config.gameMode === 'undercover';
    const hasHints = !currentThemeData?.noHints && (gameState.config.allowHints ?? true);
    const progress = ((gameState.currentPlayerIndex + 1) / gameState.players.length) * 100;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.02, duration: 1500, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    useEffect(() => {
        setCardState('waiting');
        cardOpacity.setValue(1);
        revealOpacity.setValue(0);
        cardScale.setValue(1);
        holdProgress.setValue(0);
    }, [gameState.currentPlayerIndex]);

    const startHold = () => {
        if (cardState !== 'waiting') return;

        setCardState('revealing');

        Animated.timing(holdProgress, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: false,
        }).start(({ finished }) => {
            if (finished) {
                revealCard();
            }
        });
    };

    const cancelHold = () => {
        if (cardState === 'revealed') return;

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

        Animated.parallel([
            Animated.timing(cardOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
            Animated.timing(cardScale, { toValue: 0.92, duration: 200, useNativeDriver: true }),
        ]).start(() => {
            Animated.parallel([
                Animated.timing(revealOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
                Animated.spring(cardScale, { toValue: 1, friction: 6, tension: 50, useNativeDriver: true }),
            ]).start();
        });

        // Haptic feedback
        if (currentPlayer?.isImpostor && !isUndercoverMode) {
            Vibration.vibrate([0, 100, 50, 100, 50, 100, 50, 200]);
            Animated.sequence([
                Animated.timing(shakeAnim, { toValue: 12, duration: 50, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: -12, duration: 50, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
            ]).start();
        } else {
            Vibration.vibrate(80);
        }

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

    const progressWidth = holdProgress.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    });

    if (!currentPlayer) return null;

    // En Undercover todos ven color de tripulante para no dar pistas al que mira sobre el hombro
    const isClassicImpostor = currentPlayer.isImpostor && !isUndercoverMode;

    return (
        <LinearGradient
            colors={['#0a0a1a', '#141432', '#0a0a1a']}
            style={styles.container}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            <View style={styles.bgCircle1} />
            <View style={styles.bgCircle2} />

            <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.progressSection}>
                        <View style={styles.progressBar}>
                            <LinearGradient
                                colors={['#6C5CE7', '#00CEC9']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={[styles.progressFill, { width: `${progress}%` }]}
                            />
                        </View>
                        <Text style={styles.progressText}>
                            Jugador {gameState.currentPlayerIndex + 1} de {gameState.players.length}
                        </Text>
                    </View>

                    <View style={styles.themeTag}>
                        <Text style={styles.themeIcon}>{currentTheme?.icon || '🎭'}</Text>
                        <Text style={styles.themeName}>{currentTheme?.name}</Text>
                    </View>
                </View>

                {/* Player Section */}
                <View style={styles.playerSection}>
                    <View style={styles.playerAvatarContainer}>
                        <LinearGradient
                            colors={['#6C5CE7', '#A29BFE']}
                            style={styles.playerAvatar}
                        >
                            <Text style={styles.playerInitial}>
                                {currentPlayer.name.charAt(0).toUpperCase()}
                            </Text>
                        </LinearGradient>
                    </View>
                    <Text style={styles.playerName}>{currentPlayer.name}</Text>
                    <Text style={styles.playerInstruction}>
                        {cardState === 'waiting' && '👆 Pasa el teléfono y mantén presionado'}
                        {cardState === 'revealing' && '⏳ Sigue manteniendo presionado...'}
                        {cardState === 'revealed' && '🤫 ¡Memoriza tu palabra en secreto!'}
                    </Text>
                </View>

                {/* Card */}
                <View style={styles.cardContainer}>
                    {/* Hidden Card Front */}
                    <Animated.View
                        style={[
                            styles.card,
                            {
                                opacity: cardOpacity,
                                transform: [{ scale: cardState === 'waiting' ? pulseAnim : cardScale }],
                            },
                        ]}
                    >
                        <TouchableOpacity
                            style={styles.cardTouchable}
                            onPressIn={startHold}
                            onPressOut={cancelHold}
                            activeOpacity={1}
                            disabled={cardState === 'revealed'}
                        >
                            <LinearGradient
                                colors={['#252545', '#16162e', '#121226']}
                                style={styles.cardGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <View style={styles.cardPattern}>
                                    <Text style={styles.cardQuestionMark}>?</Text>
                                </View>

                                <Text style={styles.cardHiddenText}>
                                    {cardState === 'waiting' ? 'Mantén presionado para revelar' : 'Revelando rol...'}
                                </Text>

                                <View style={styles.holdProgressContainer}>
                                    <View style={styles.holdProgressBg}>
                                        <Animated.View
                                            style={[styles.holdProgressBar, { width: progressWidth }]}
                                        >
                                            <LinearGradient
                                                colors={['#6C5CE7', '#FD79A8', '#00CEC9']}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 0 }}
                                                style={styles.holdProgressGradient}
                                            />
                                        </Animated.View>
                                    </View>
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Revealed Card Back */}
                    <Animated.View
                        style={[
                            styles.card,
                            styles.cardRevealed,
                            {
                                opacity: revealOpacity,
                                transform: [{ scale: cardScale }, { translateX: shakeAnim }],
                            },
                        ]}
                    >
                        <LinearGradient
                            colors={
                                isClassicImpostor
                                    ? ['#FF4757', '#C0392B', '#7A1818']
                                    : ['#2980B9', '#3498DB', '#1A365D']
                            }
                            style={styles.cardGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <View style={styles.roleContent}>
                                <View style={styles.roleIconContainer}>
                                    <Text style={styles.roleEmoji}>
                                        {isClassicImpostor ? '🔪' : '👤'}
                                    </Text>
                                </View>

                                <Text style={styles.roleTitle}>
                                    {isClassicImpostor ? '¡IMPOSTOR!' : 'TRIPULANTE'}
                                </Text>

                                <View style={styles.infoWrapper}>
                                    <View style={styles.wordContainer}>
                                        <Text style={styles.wordLabel}>
                                            {isClassicImpostor ? 'Tu rol es:' : 'Tu palabra secreta es:'}
                                        </Text>
                                        <Text style={styles.wordText}>
                                            {currentPlayer.word}
                                        </Text>
                                    </View>

                                    {/* Warnings and Hints */}
                                    {isClassicImpostor ? (
                                        <View style={styles.impostorWarningContainer}>
                                            <Text style={styles.impostorWarning}>
                                                🔪 NO CONOCES LA PALABRA
                                            </Text>
                                            {hasHints && currentPlayer.hint ? (
                                                <View style={styles.hintSectionInside}>
                                                    <View style={styles.hintDivider} />
                                                    <Text style={styles.hintInfoLabel}>💡 PISTA PARA DISIMULAR:</Text>
                                                    <Text style={styles.hintInfoText}>{currentPlayer.hint}</Text>
                                                </View>
                                            ) : null}
                                        </View>
                                    ) : (
                                        <View style={styles.hintStatusContainer}>
                                            <Text style={styles.roleStatusText}>
                                                {isUndercoverMode
                                                    ? '🤫 Da pistas inteligentes sin delatarte'
                                                    : '👤 Da pistas y descubre al impostor'}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        </LinearGradient>
                    </Animated.View>
                </View>

                {/* Bottom Hold Action Button */}
                {cardState !== 'revealed' && (
                    <Animated.View style={styles.actionButtonContainer}>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPressIn={startHold}
                            onPressOut={cancelHold}
                            activeOpacity={0.9}
                        >
                            <LinearGradient
                                colors={['#6C5CE7', '#8E44AD']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.actionButtonGradient}
                            >
                                <Text style={styles.actionButtonText}>
                                    {cardState === 'waiting' ? '🔽 MANTÉN PARA REVELAR' : '⏳ REVELANDO...'}
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </Animated.View>
                )}

                {/* Next Player Action Button */}
                {cardState === 'revealed' && (
                    <Animated.View style={styles.nextButtonContainer}>
                        <TouchableOpacity
                            style={styles.nextButton}
                            onPress={handleNext}
                            activeOpacity={0.85}
                        >
                            <LinearGradient
                                colors={['#6C5CE7', '#A29BFE', '#6C5CE7']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.nextButtonGradient}
                            >
                                <Text style={styles.nextButtonText}>
                                    {gameState.currentPlayerIndex === gameState.players.length - 1
                                        ? '🎮 ¡Comenzar Debate y Juego!'
                                        : '→ Siguiente Jugador'}
                                </Text>
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
    bgCircle1: {
        position: 'absolute',
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: '#6C5CE7',
        top: -100,
        right: -100,
        opacity: 0.08,
    },
    bgCircle2: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: '#FF4757',
        bottom: 50,
        left: -80,
        opacity: 0.08,
    },
    content: {
        flex: 1,
        padding: 22,
        paddingTop: 54,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    progressSection: {
        flex: 1,
        marginRight: 16,
    },
    progressBar: {
        height: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: 6,
    },
    progressFill: {
        height: '100%',
        borderRadius: 3,
    },
    progressText: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.5)',
    },
    themeTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        gap: 6,
    },
    themeIcon: {
        fontSize: 16,
    },
    themeName: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.8)',
        fontWeight: '700',
    },
    playerSection: {
        alignItems: 'center',
        marginBottom: 20,
    },
    playerAvatarContainer: {
        marginBottom: 10,
    },
    playerAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    playerInitial: {
        fontSize: 26,
        fontWeight: '900',
        color: '#FFFFFF',
    },
    playerName: {
        fontSize: 26,
        fontWeight: '900',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    playerInstruction: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.6)',
        textAlign: 'center',
    },
    cardContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        width: width - 64,
        minHeight: 310,
        borderRadius: 28,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 16,
    },
    cardRevealed: {
        position: 'absolute',
    },
    cardTouchable: {
        flex: 1,
        borderRadius: 28,
        overflow: 'hidden',
    },
    cardGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 22,
        borderRadius: 28,
    },
    cardPattern: {
        marginBottom: 12,
    },
    cardQuestionMark: {
        fontSize: 90,
        fontWeight: '900',
        color: 'rgba(255, 255, 255, 0.15)',
    },
    cardHiddenText: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.5)',
        textAlign: 'center',
        marginBottom: 26,
        fontWeight: '600',
    },
    holdProgressContainer: {
        width: '80%',
    },
    holdProgressBg: {
        height: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 4,
        overflow: 'hidden',
    },
    holdProgressBar: {
        height: '100%',
        borderRadius: 4,
        overflow: 'hidden',
    },
    holdProgressGradient: {
        flex: 1,
    },
    roleContent: {
        alignItems: 'center',
        width: '100%',
    },
    roleIconContainer: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    roleEmoji: {
        fontSize: 36,
    },
    roleTitle: {
        fontSize: 28,
        fontWeight: '900',
        color: '#FFFFFF',
        marginBottom: 18,
        letterSpacing: 2,
    },
    infoWrapper: {
        width: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        borderRadius: 22,
        padding: 4,
        overflow: 'hidden',
    },
    wordContainer: {
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    wordLabel: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.55)',
        fontWeight: '700',
        marginBottom: 6,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    wordText: {
        fontSize: 28,
        fontWeight: '900',
        color: '#FFFFFF',
        textAlign: 'center',
    },
    impostorWarningContainer: {
        backgroundColor: 'rgba(255, 71, 87, 0.25)',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomLeftRadius: 18,
        borderBottomRightRadius: 18,
        borderTopWidth: 1,
        borderColor: 'rgba(255, 71, 87, 0.25)',
    },
    impostorWarning: {
        fontSize: 14,
        color: '#FF6B81',
        textAlign: 'center',
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    hintSectionInside: {
        width: '100%',
        alignItems: 'center',
    },
    hintDivider: {
        width: '40%',
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        marginVertical: 8,
    },
    hintInfoLabel: {
        fontSize: 10,
        color: 'rgba(255, 255, 255, 0.5)',
        fontWeight: '800',
        marginBottom: 2,
    },
    hintInfoText: {
        fontSize: 16,
        color: '#FFFFFF',
        textAlign: 'center',
        fontWeight: '700',
    },
    hintStatusContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomLeftRadius: 18,
        borderBottomRightRadius: 18,
        borderTopWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
    },
    roleStatusText: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.7)',
        fontWeight: '700',
        textAlign: 'center',
    },
    actionButtonContainer: {
        alignItems: 'center',
        marginTop: 14,
    },
    actionButton: {
        width: width - 64,
        borderRadius: 18,
        overflow: 'hidden',
    },
    actionButtonGradient: {
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionButtonText: {
        fontSize: 15,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: 1,
    },
    nextButtonContainer: {
        paddingTop: 14,
    },
    nextButton: {
        borderRadius: 22,
        overflow: 'hidden',
        shadowColor: '#6C5CE7',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 18,
        elevation: 10,
    },
    nextButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        paddingHorizontal: 28,
    },
    nextButtonText: {
        fontSize: 17,
        fontWeight: '800',
        color: '#FFFFFF',
    },
});
