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
    const currentThemeData = themes.find(t => t.id === gameState.config.themeId);
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
    const hasHints = !currentThemeData?.noHints;
    const progress = ((gameState.currentPlayerIndex + 1) / gameState.players.length) * 100;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start();

        // Animacion de pulso para la tarjeta
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.02,
                    duration: 1500,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1500,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    useEffect(() => {
        // Reset cuando cambia el jugador
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

        // Animacion simple de fade/scale en lugar de flip
        Animated.parallel([
            Animated.timing(cardOpacity, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(cardScale, {
                toValue: 0.9,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start(() => {
            // Mostrar la carta revelada
            Animated.parallel([
                Animated.timing(revealOpacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.spring(cardScale, {
                    toValue: 1,
                    friction: 6,
                    tension: 50,
                    useNativeDriver: true,
                }),
            ]).start();
        });

        // Vibracion dramatica para impostor
        if (currentPlayer?.isImpostor) {
            Vibration.vibrate([0, 100, 50, 100, 50, 100, 50, 200]);

            // Animacion de shake
            Animated.sequence([
                Animated.timing(shakeAnim, { toValue: 15, duration: 50, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: -15, duration: 50, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: 15, duration: 50, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: -15, duration: 50, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
            ]).start();
        } else {
            Vibration.vibrate(100);
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

            <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.progressSection}>
                        <View style={styles.progressBar}>
                            <LinearGradient
                                colors={['#6C5CE7', '#A29BFE']}
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
                        <Text style={styles.themeIcon}>{currentTheme?.icon}</Text>
                        <Text style={styles.themeName}>{currentTheme?.name}</Text>
                    </View>
                </View>

                {/* Player info */}
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
                        {cardState === 'waiting' && '👆 Manten presionada la carta'}
                        {cardState === 'revealing' && '⏳ Sigue manteniendo...'}
                    </Text>
                </View>

                {/* Card */}
                <View style={styles.cardContainer}>
                    {/* Hidden card (front) */}
                    <Animated.View
                        style={[
                            styles.card,
                            {
                                opacity: cardOpacity,
                                transform: [
                                    { scale: cardState === 'waiting' ? pulseAnim : cardScale },
                                ],
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
                                colors={['#2a2a4a', '#1a1a3a', '#15152a']}
                                style={styles.cardGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <View style={styles.cardPattern}>
                                    <Text style={styles.cardQuestionMark}>?</Text>
                                </View>

                                <Text style={styles.cardHiddenText}>
                                    {cardState === 'waiting'
                                        ? 'Manten presionado'
                                        : 'Revelando...'}
                                </Text>

                                {/* Progress bar */}
                                <View style={styles.holdProgressContainer}>
                                    <View style={styles.holdProgressBg}>
                                        <Animated.View
                                            style={[
                                                styles.holdProgressBar,
                                                { width: progressWidth },
                                            ]}
                                        >
                                            <LinearGradient
                                                colors={['#6C5CE7', '#A29BFE']}
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

                    {/* Revealed card (back) */}
                    <Animated.View
                        style={[
                            styles.card,
                            styles.cardRevealed,
                            {
                                opacity: revealOpacity,
                                transform: [
                                    { scale: cardScale },
                                    { translateX: shakeAnim },
                                ],
                            },
                        ]}
                    >
                        <LinearGradient
                            colors={
                                currentPlayer.isImpostor
                                    ? ['#FF4757', '#C0392B', '#8B0000']
                                    : ['#5DADE2', '#3498DB', '#1A5276']
                            }
                            style={styles.cardGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <View style={styles.roleContent}>
                                <View style={styles.roleIconContainer}>
                                    <Text style={styles.roleEmoji}>
                                        {currentPlayer.isImpostor ? '🔪' : '👤'}
                                    </Text>
                                </View>

                                <Text style={styles.roleTitle}>
                                    {currentPlayer.isImpostor ? '¡IMPOSTOR!' : 'TRIPULANTE'}
                                </Text>

                                {/* Contenedor de información para el jugador */}
                                <View style={styles.infoWrapper}>
                                    <View style={styles.wordContainer}>
                                        <Text style={styles.wordLabel}>
                                            {currentPlayer.isImpostor
                                                ? 'Tu palabra es:'
                                                : 'La palabra secreta es:'}
                                        </Text>
                                        <Text style={styles.wordText}>
                                            {currentPlayer.isImpostor ? '???' : gameState.secretWord}
                                        </Text>
                                    </View>

                                    {/* Estado y Pista (Unificados) */}
                                    <View style={currentPlayer.isImpostor ? styles.impostorWarningContainer : styles.hintStatusContainer}>
                                        <Text style={currentPlayer.isImpostor ? styles.impostorWarning : styles.roleStatusText}>
                                            {currentPlayer.isImpostor ? '🔪 ERES EL IMPOSTOR' : '👤 ERES TRIPULANTE'}
                                        </Text>
                                        
                                        {hasHints && currentPlayer.hint !== '' && (
                                            <View style={styles.hintSectionInside}>
                                                <View style={styles.hintDivider} />
                                                <Text style={styles.hintInfoLabel}>💡 PISTA:</Text>
                                                <Text style={styles.hintInfoText}>{currentPlayer.hint}</Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            </View>
                        </LinearGradient>
                    </Animated.View>
                </View>

                {/* Main Action Button (Hold to reveal) */}
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
                        <Text style={styles.actionButtonHelp}>
                            O mantén presionada la carta👆
                        </Text>
                    </Animated.View>
                )}

                {/* Next button */}
                {cardState === 'revealed' && (
                    <Animated.View style={styles.nextButtonContainer}>
                        <TouchableOpacity
                            style={styles.nextButton}
                            onPress={handleNext}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={['#6C5CE7', '#A29BFE', '#6C5CE7']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.nextButtonGradient}
                            >
                                <Text style={styles.nextButtonText}>
                                    {gameState.currentPlayerIndex === gameState.players.length - 1
                                        ? '🎮 ¡Comenzar Juego!'
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
        padding: 24,
        paddingTop: 60,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
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
        marginBottom: 8,
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
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 8,
    },
    themeIcon: {
        fontSize: 18,
    },
    themeName: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.7)',
        fontWeight: '600',
    },
    playerSection: {
        alignItems: 'center',
        marginBottom: 24,
    },
    playerAvatarContainer: {
        marginBottom: 12,
    },
    playerAvatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    playerInitial: {
        fontSize: 28,
        fontWeight: '900',
        color: '#FFFFFF',
    },
    playerName: {
        fontSize: 28,
        fontWeight: '900',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    playerInstruction: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.6)',
        textAlign: 'center',
    },
    cardContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        width: width - 80,
        minHeight: 360,
        borderRadius: 28,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 15 },
        shadowOpacity: 0.4,
        shadowRadius: 25,
        elevation: 20,
    },
    actionButtonContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    actionButton: {
        width: width - 80,
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#6C5CE7',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    actionButtonGradient: {
        paddingVertical: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionButtonText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: 1,
    },
    actionButtonHelp: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.4)',
        marginTop: 8,
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
        padding: 32,
        borderRadius: 28,
    },
    cardPattern: {
        marginBottom: 16,
    },
    cardQuestionMark: {
        fontSize: 100,
        fontWeight: '900',
        color: 'rgba(255, 255, 255, 0.15)',
    },
    cardHiddenText: {
        fontSize: 18,
        color: 'rgba(255, 255, 255, 0.5)',
        textAlign: 'center',
        marginBottom: 32,
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
    },
    roleIconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    roleEmoji: {
        fontSize: 50,
    },
    roleTitle: {
        fontSize: 32,
        fontWeight: '900',
        color: '#FFFFFF',
        marginBottom: 24,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
        letterSpacing: 2,
    },
    infoWrapper: {
        width: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.25)',
        borderRadius: 24,
        padding: 4,
        overflow: 'hidden',
    },
    wordContainer: {
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 24,
    },
    wordLabel: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.5)',
        fontWeight: '600',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    wordText: {
        fontSize: 36,
        fontWeight: '900',
        color: '#FFFFFF',
        textAlign: 'center',
    },
    impostorWarningContainer: {
        backgroundColor: 'rgba(255, 71, 87, 0.2)',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        borderTopWidth: 1,
        borderColor: 'rgba(255, 71, 87, 0.2)',
    },
    impostorWarning: {
        fontSize: 15,
        color: '#FF6B81',
        textAlign: 'center',
        fontWeight: '700',
    },
    hintInfoContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        borderTopWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
    },
    hintInfoLabel: {
        fontSize: 11,
        color: 'rgba(255, 255, 255, 0.4)',
        fontWeight: '800',
        marginBottom: 4,
        letterSpacing: 1,
    },
    hintInfoText: {
        fontSize: 18,
        color: '#FFFFFF',
        textAlign: 'center',
        fontWeight: '600',
    },
    hintStatusContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        borderTopWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
    },
    roleStatusText: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.6)',
        fontWeight: '800',
        letterSpacing: 1.5,
    },
    hintSectionInside: {
        width: '100%',
        alignItems: 'center',
    },
    hintDivider: {
        width: '40%',
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        marginVertical: 12,
    },
    nextButtonContainer: {
        paddingTop: 20,
    },
    nextButton: {
        borderRadius: 24,
        overflow: 'hidden',
        shadowColor: '#6C5CE7',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 12,
    },
    nextButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
        paddingHorizontal: 32,
    },
    nextButtonText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});
