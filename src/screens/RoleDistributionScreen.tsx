import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Dimensions,
    Vibration,
    Alert,
    Modal,
} from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useGame } from '../context/GameContext';
import { colors, gradients } from '../styles/colors';

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
    const {
        gameState,
        markPlayerAsSeen,
        nextPlayer,
        getCurrentPlayer,
        allThemes,
        resetGame,
    } = useGame();

    const [showExitModal, setShowExitModal] = useState<boolean>(false);

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
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, { toValue: 1.05, duration: 900, useNativeDriver: true }),
                    Animated.timing(pulseAnim, { toValue: 0.96, duration: 900, useNativeDriver: true }),
                ])
            ),
        ]).start();
    }, [gameState.currentPlayerIndex]);

    useEffect(() => {
        setCardState('waiting');
        cardOpacity.setValue(1);
        revealOpacity.setValue(0);
        cardScale.setValue(1);
        holdProgress.setValue(0);
    }, [gameState.currentPlayerIndex]);

    const startHold = () => {
        setCardState('revealing');
        Vibration.vibrate(20);

        Animated.timing(holdProgress, {
            toValue: 1,
            duration: 500,
            useNativeDriver: false,
        }).start(({ finished }) => {
            if (finished) {
                revealCard();
            }
        });
    };

    const cancelHold = () => {
        if (cardState === 'revealing') {
            holdProgress.stopAnimation();
            holdProgress.setValue(0);
            setCardState('waiting');
        }
    };

    const revealCard = () => {
        setCardState('revealed');

        Animated.parallel([
            Animated.timing(cardOpacity, { toValue: 0, duration: 180, useNativeDriver: true }),
            Animated.timing(cardScale, { toValue: 0.94, duration: 180, useNativeDriver: true }),
        ]).start(() => {
            Animated.parallel([
                Animated.timing(revealOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
                Animated.spring(cardScale, { toValue: 1, friction: 6, tension: 60, useNativeDriver: true }),
            ]).start();
        });

        if (currentPlayer?.isImpostor && !isUndercoverMode) {
            Vibration.vibrate([0, 80, 40, 80, 40, 150]);
            Animated.sequence([
                Animated.timing(shakeAnim, { toValue: 8, duration: 40, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: -8, duration: 40, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: 6, duration: 40, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: 0, duration: 40, useNativeDriver: true }),
            ]).start();
        } else {
            Vibration.vibrate(60);
        }

        if (currentPlayer) {
            markPlayerAsSeen(currentPlayer.id);
        }
    };

    const handleNext = () => {
        Vibration.vibrate(20);
        const isLastPlayer = gameState.currentPlayerIndex === gameState.players.length - 1;
        if (isLastPlayer) {
            onComplete();
        } else {
            nextPlayer();
        }
    };

    const handleOpenExitModal = () => {
        Vibration.vibrate(15);
        setShowExitModal(true);
    };

    const handleChangeTheme = () => {
        setShowExitModal(false);
        onBack();
    };

    const handleResetAll = () => {
        setShowExitModal(false);
        resetGame();
        onBack();
    };

    const progressWidth = holdProgress.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    });

    if (!currentPlayer) return null;

    const isClassicImpostor = currentPlayer.isImpostor && !isUndercoverMode;

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={gradients.appBackground}
                style={StyleSheet.absoluteFillObject}
            />

            <Modal
                transparent
                visible={showExitModal}
                animationType="fade"
                onRequestClose={() => setShowExitModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <LinearGradient
                            colors={gradients.sheetGlass}
                            style={styles.modalGradient}
                        >
                            <View style={styles.modalIconCircle}>
                                <Ionicons name="exit-outline" size={32} color={colors.impostor} />
                            </View>

                            <Text style={styles.modalTitle}>¿Salir de la partida?</Text>
                            <Text style={styles.modalSubtitle}>
                                Si hubo una equivocación, puedes volver atrás o cambiar de tema sin tener que pasar por todos los jugadores.
                            </Text>

                            <TouchableOpacity
                                style={styles.modalPrimaryBtn}
                                onPress={handleChangeTheme}
                                activeOpacity={0.85}
                            >
                                <LinearGradient
                                    colors={['#7952FF', '#9D7DFF']}
                                    style={styles.modalPrimaryGradient}
                                >
                                    <Ionicons name="sparkles-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                                    <Text style={styles.modalPrimaryText}>Cambiar Temática</Text>
                                </LinearGradient>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.modalDangerBtn}
                                onPress={handleResetAll}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="refresh-outline" size={16} color={colors.impostor} style={{ marginRight: 6 }} />
                                <Text style={styles.modalDangerText}>Reiniciar Todo</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.modalCancelBtn}
                                onPress={() => setShowExitModal(false)}
                            >
                                <Text style={styles.modalCancelText}>Continuar Viendo</Text>
                            </TouchableOpacity>
                        </LinearGradient>
                    </View>
                </View>
            </Modal>


            <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                {/* Top Nav with Close / Exit Button */}
                <View style={styles.topNav}>
                    <TouchableOpacity
                        style={styles.exitBtn}
                        onPress={handleOpenExitModal}
                        activeOpacity={0.7}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Ionicons name="close" size={18} color={colors.textSecondary} />
                        <Text style={styles.exitBtnText}>Salir</Text>
                    </TouchableOpacity>

                    <View style={styles.themeTag}>
                        <Text style={styles.themeIcon}>{currentTheme?.icon || '🎭'}</Text>
                        <Text style={styles.themeName}>{currentTheme?.name}</Text>
                    </View>
                </View>

                {/* Header Progress */}
                <View style={styles.header}>
                    <View style={styles.progressSection}>
                        <View style={styles.progressBar}>
                            <View style={[styles.progressFill, { width: `${progress}%` }]} />
                        </View>
                        <Text style={styles.progressText}>
                            Jugador {gameState.currentPlayerIndex + 1} de {gameState.players.length}
                        </Text>
                    </View>
                </View>


                {/* Player Header Avatar */}
                <View style={styles.playerSection}>
                    <View style={styles.playerAvatar}>
                        <Text style={styles.playerInitial}>
                            {currentPlayer.name.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                    <Text style={styles.playerName}>{currentPlayer.name}</Text>
                    <Text style={styles.playerInstruction}>
                        {cardState === 'waiting' && 'Pasa el dispositivo y mantén presionado'}
                        {cardState === 'revealing' && 'Mantén presionado para revelar...'}
                        {cardState === 'revealed' && 'Memoriza tu rol y palabra en secreto'}
                    </Text>
                </View>

                {/* Card Container */}
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
                                colors={['#171A27', '#10121B']}
                                style={styles.cardGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 0, y: 1 }}
                            >
                                <View style={styles.scanIconCircle}>
                                    <MaterialCommunityIcons name="fingerprint" size={60} color={colors.primaryLight} />
                                </View>

                                <Text style={styles.cardHiddenTitle}>IDENTIDAD PRIVADA</Text>
                                <Text style={styles.cardHiddenText}>
                                    {cardState === 'waiting' ? 'Mantén presionado para ver tu rol' : 'Verificando huella...'}
                                </Text>

                                <View style={styles.holdProgressContainer}>
                                    <View style={styles.holdProgressBg}>
                                        <Animated.View style={[styles.holdProgressBar, { width: progressWidth }]}>
                                            <LinearGradient
                                                colors={['#7952FF', '#00F0FF']}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 0 }}
                                                style={StyleSheet.absoluteFillObject}
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
                                    ? ['#261016', '#14080B']
                                    : ['#0E1826', '#090F1A']
                            }
                            style={[
                                styles.cardGradient,
                                { borderColor: isClassicImpostor ? colors.impostor : colors.cyan },
                            ]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 0, y: 1 }}
                        >
                            <View style={styles.roleContent}>
                                <View
                                    style={[
                                        styles.roleIconCircle,
                                        { backgroundColor: isClassicImpostor ? 'rgba(255, 42, 85, 0.2)' : 'rgba(0, 240, 255, 0.2)' },
                                    ]}
                                >
                                    {isClassicImpostor ? (
                                        <MaterialCommunityIcons name="incognito" size={36} color={colors.impostor} />
                                    ) : (
                                        <Ionicons name="shield-checkmark" size={36} color={colors.cyan} />
                                    )}
                                </View>

                                <Text
                                    style={[
                                        styles.roleTitle,
                                        { color: isClassicImpostor ? colors.impostor : colors.cyan },
                                    ]}
                                >
                                    {isClassicImpostor ? 'IMPOSTOR' : 'TRIPULANTE'}
                                </Text>

                                <View style={styles.wordDisplayBox}>
                                    <Text style={styles.wordDisplayLabel}>
                                        {isClassicImpostor ? 'TU SITUACIÓN' : 'TU PALABRA SECRETA'}
                                    </Text>
                                    <Text style={styles.wordDisplayText}>
                                        {currentPlayer.word}
                                    </Text>
                                </View>

                                {isClassicImpostor ? (
                                    <View style={styles.impostorWarningBox}>
                                        <Text style={styles.impostorWarningTitle}>NO CONOCES LA PALABRA</Text>
                                        {hasHints && currentPlayer.hint ? (
                                            <View style={styles.hintLine}>
                                                <Text style={styles.hintPrefix}>Pista de auxilio: </Text>
                                                <Text style={styles.hintHighlight}>{currentPlayer.hint}</Text>
                                            </View>
                                        ) : null}
                                    </View>
                                ) : (
                                    <View style={styles.crewmateRuleBox}>
                                        <Text style={styles.crewmateRuleText}>
                                            {isUndercoverMode
                                                ? 'Da pistas ingeniosas sin hacerte notar'
                                                : 'Da pistas sin regalar la palabra'}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </LinearGradient>
                    </Animated.View>
                </View>

                {/* Bottom Trigger Buttons */}
                <View style={styles.bottomBar}>
                    {cardState !== 'revealed' ? (
                        <TouchableOpacity
                            style={styles.holdTriggerBtn}
                            onPressIn={startHold}
                            onPressOut={cancelHold}
                            activeOpacity={0.9}
                        >
                            <LinearGradient
                                colors={['#7952FF', '#5E38E6']}
                                style={styles.holdTriggerGradient}
                            >
                                <MaterialCommunityIcons name="gesture-tap-hold" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                                <Text style={styles.holdTriggerText}>
                                    {cardState === 'waiting' ? 'MANTÉN PRESIONADO' : 'REVELANDO...'}
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={styles.nextPlayerBtn}
                            onPress={handleNext}
                            activeOpacity={0.85}
                        >
                            <LinearGradient
                                colors={['#7952FF', '#9D7DFF']}
                                style={styles.nextPlayerGradient}
                            >
                                <Text style={styles.nextPlayerText}>
                                    {gameState.currentPlayerIndex === gameState.players.length - 1
                                        ? '¡Comenzar Debate!'
                                        : 'Siguiente Jugador'}
                                </Text>
                                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
                            </LinearGradient>
                        </TouchableOpacity>
                    )}
                </View>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bgDeep,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 50,
    },
    topNav: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    exitBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.bgGlassHover,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 10,
        gap: 4,
        borderWidth: 1,
        borderColor: colors.borderLight,
    },
    exitBtnText: {
        fontSize: 12,
        fontWeight: '700',
        color: colors.textSecondary,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    progressSection: {
        flex: 1,
    },

    progressBar: {
        height: 4,
        backgroundColor: colors.bgElevated,
        borderRadius: 2,
        overflow: 'hidden',
        marginBottom: 6,
    },
    progressFill: {
        height: '100%',
        backgroundColor: colors.cyan,
    },
    progressText: {
        fontSize: 12,
        color: colors.textMuted,
        fontWeight: '600',
    },
    themeTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.bgCard,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
        gap: 6,
        borderWidth: 1,
        borderColor: colors.borderSubtle,
    },
    themeIcon: {
        fontSize: 14,
    },
    themeName: {
        fontSize: 12,
        color: colors.textSecondary,
        fontWeight: '800',
    },
    playerSection: {
        alignItems: 'center',
        marginBottom: 16,
    },
    playerAvatar: {
        width: 52,
        height: 52,
        borderRadius: 16,
        backgroundColor: colors.bgElevated,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        borderWidth: 1,
        borderColor: colors.borderLight,
    },
    playerInitial: {
        fontSize: 22,
        fontWeight: '900',
        color: colors.primaryLight,
    },
    playerName: {
        fontSize: 22,
        fontWeight: '900',
        color: colors.textPrimary,
    },
    playerInstruction: {
        fontSize: 12,
        color: colors.textMuted,
        marginTop: 2,
        textAlign: 'center',
    },
    cardContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        width: width - 48,
        minHeight: 290,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: colors.borderLight,
        overflow: 'hidden',
    },
    cardRevealed: {
        position: 'absolute',
    },
    cardTouchable: {
        flex: 1,
    },
    cardGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        borderRadius: 24,
    },
    scanIconCircle: {
        width: 84,
        height: 84,
        borderRadius: 42,
        backgroundColor: colors.bgGlassHover,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.borderLight,
    },
    cardHiddenTitle: {
        fontSize: 11,
        fontWeight: '900',
        color: colors.textMuted,
        letterSpacing: 2,
        marginBottom: 4,
    },
    cardHiddenText: {
        fontSize: 14,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: 20,
        fontWeight: '600',
    },
    holdProgressContainer: {
        width: '75%',
    },
    holdProgressBg: {
        height: 6,
        backgroundColor: colors.bgGlass,
        borderRadius: 3,
        overflow: 'hidden',
    },
    holdProgressBar: {
        height: '100%',
    },
    roleContent: {
        alignItems: 'center',
        width: '100%',
    },
    roleIconCircle: {
        width: 68,
        height: 68,
        borderRadius: 34,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    roleTitle: {
        fontSize: 24,
        fontWeight: '900',
        letterSpacing: 2,
        marginBottom: 16,
    },
    wordDisplayBox: {
        width: '100%',
        backgroundColor: colors.bgDeep,
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.borderSubtle,
        marginBottom: 12,
    },
    wordDisplayLabel: {
        fontSize: 10,
        fontWeight: '900',
        color: colors.textMuted,
        letterSpacing: 1.5,
        marginBottom: 6,
    },
    wordDisplayText: {
        fontSize: 28,
        fontWeight: '900',
        color: colors.textPrimary,
        textAlign: 'center',
    },
    impostorWarningBox: {
        alignItems: 'center',
        gap: 4,
    },
    impostorWarningTitle: {
        fontSize: 11,
        fontWeight: '900',
        color: colors.impostor,
        letterSpacing: 1,
    },
    hintLine: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    hintPrefix: {
        fontSize: 12,
        color: colors.textMuted,
    },
    hintHighlight: {
        fontSize: 13,
        fontWeight: '800',
        color: colors.warning,
    },
    crewmateRuleBox: {
        alignItems: 'center',
    },
    crewmateRuleText: {
        fontSize: 12,
        color: colors.textMuted,
        textAlign: 'center',
    },
    bottomBar: {
        paddingVertical: 18,
    },
    holdTriggerBtn: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    holdTriggerGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
    },
    holdTriggerText: {
        fontSize: 15,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: 1,
    },
    nextPlayerBtn: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    nextPlayerGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
    },
    nextPlayerText: {
        fontSize: 16,
        fontWeight: '900',
        color: '#FFFFFF',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.88)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalBox: {
        width: '100%',
        maxWidth: 340,
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.borderLight,
    },
    modalGradient: {
        padding: 24,
        alignItems: 'center',
    },
    modalIconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(255, 42, 85, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 14,
        borderWidth: 1,
        borderColor: 'rgba(255, 42, 85, 0.3)',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: colors.textPrimary,
        marginBottom: 8,
        textAlign: 'center',
    },
    modalSubtitle: {
        fontSize: 13,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 18,
        marginBottom: 20,
    },
    modalPrimaryBtn: {
        width: '100%',
        borderRadius: 14,
        overflow: 'hidden',
        marginBottom: 10,
    },
    modalPrimaryGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
    },
    modalPrimaryText: {
        color: '#FFFFFF',
        fontWeight: '900',
        fontSize: 15,
    },
    modalDangerBtn: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 42, 85, 0.12)',
        paddingVertical: 14,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(255, 42, 85, 0.35)',
        marginBottom: 12,
    },
    modalDangerText: {
        color: colors.impostor,
        fontWeight: '800',
        fontSize: 14,
    },
    modalCancelBtn: {
        paddingVertical: 8,
    },
    modalCancelText: {
        color: colors.textMuted,
        fontWeight: '700',
        fontSize: 13,
    },
});

