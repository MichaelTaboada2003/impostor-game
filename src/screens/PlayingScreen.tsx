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
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useGame } from '../context/GameContext';
import { WhoStartsModal } from '../components/WhoStartsModal';
import { colors, gradients } from '../styles/colors';

const { width } = Dimensions.get('window');

interface PlayingScreenProps {
    onStartVoting: () => void;
    onNewGame: () => void;
}

export const PlayingScreen: React.FC<PlayingScreenProps> = ({
    onStartVoting,
    onNewGame,
}) => {
    const { gameState, resetGame, allThemes } = useGame();
    const [showQuickReveal, setShowQuickReveal] = useState(false);
    const [showWhoStarts, setShowWhoStarts] = useState(false);

    const targetSeconds = gameState.config.roundTimerSeconds || 0;
    const isCountdown = targetSeconds > 0;
    const [timer, setTimer] = useState(isCountdown ? targetSeconds : 0);
    const [isTimerRunning, setIsTimerRunning] = useState(true);

    const pulseAnim = useRef(new Animated.Value(1)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const currentTheme = allThemes.find(t => t.id === gameState.config.themeId);
    const impostors = gameState.players.filter(p => p.isImpostor);

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.04, duration: 900, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
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
                            Vibration.vibrate([0, 150, 80, 150, 80, 300]);
                            return 0;
                        }
                        if (prev <= 11) {
                            Vibration.vibrate(30);
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
        <View style={styles.container}>
            <LinearGradient
                colors={gradients.appBackground}
                style={StyleSheet.absoluteFillObject}
            />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                    {/* Header Info Bar */}
                    <View style={styles.headerInfoCard}>
                        <View style={styles.themeInfoLeft}>
                            <View
                                style={[
                                    styles.themeIconBox,
                                    { backgroundColor: `${currentTheme?.color || colors.primary}25` },
                                ]}
                            >
                                <Text style={styles.themeEmojiText}>{currentTheme?.icon || '🎭'}</Text>
                            </View>
                            <View>
                                <Text style={styles.themeTitleText}>{currentTheme?.name}</Text>
                                <Text style={styles.themeMetaText}>
                                    {gameState.players.length} Jugadores · {impostors.length} Impostor(es)
                                </Text>
                            </View>
                        </View>

                        <View style={styles.headerBadgesRow}>
                            <View style={styles.roundBadge}>
                                <Text style={styles.roundBadgeText}>
                                    Ronda {gameState.currentRound || 1}/{gameState.maxRounds || 2}
                                </Text>
                            </View>

                            {gameState.config.gameMode === 'undercover' && (
                                <View style={styles.undercoverBadge}>
                                    <Text style={styles.undercoverBadgeText}>UNDERCOVER</Text>
                                </View>
                            )}
                        </View>
                    </View>


                    {/* Who Starts Roulette Button */}
                    <TouchableOpacity
                        style={styles.rouletteCard}
                        onPress={() => {
                            Vibration.vibrate(15);
                            setShowWhoStarts(true);
                        }}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={['rgba(121, 82, 255, 0.25)', 'rgba(121, 82, 255, 0.05)']}
                            style={styles.rouletteGradient}
                        >
                            <View style={styles.rouletteIconBox}>
                                <MaterialCommunityIcons name="dice-multiple" size={20} color={colors.primaryLight} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.rouletteTitle}>¿Quién da la primera pista?</Text>
                                <Text style={styles.rouletteSubtitle}>Toca para sortear el jugador inicial</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color={colors.primaryLight} />
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* Cockpit Digital Timer */}
                    <View style={styles.timerDialSection}>
                        <TouchableOpacity
                            onPress={() => {
                                Vibration.vibrate(20);
                                setIsTimerRunning(!isTimerRunning);
                            }}
                            activeOpacity={0.88}
                        >
                            <Animated.View
                                style={[
                                    styles.timerDialOuter,
                                    {
                                        transform: [{ scale: isNearEnd || isEnded ? pulseAnim : 1 }],
                                        borderColor: isEnded
                                            ? colors.impostor
                                            : isNearEnd
                                            ? colors.warning
                                            : isTimerRunning
                                            ? colors.borderGlow
                                            : colors.borderSubtle,
                                    },
                                ]}
                            >
                                <LinearGradient
                                    colors={
                                        isEnded
                                            ? ['#2E0B12', '#140508']
                                            : isNearEnd
                                            ? ['#2E1805', '#140B02']
                                            : colors.bgElevated ? [colors.bgElevated, colors.bgCard] : ['#171A27', '#10121B']
                                    }
                                    style={styles.timerDialInner}
                                >
                                    <Text
                                        style={[
                                            styles.timerClockText,
                                            isEnded && { color: colors.impostor },
                                            isNearEnd && { color: colors.warning },
                                        ]}
                                    >
                                        {formatTime(timer)}
                                    </Text>
                                    <View style={styles.timerStatusPill}>
                                        <Feather
                                            name={isTimerRunning ? 'pause' : 'play'}
                                            size={12}
                                            color={colors.textSecondary}
                                            style={{ marginRight: 4 }}
                                        />
                                        <Text style={styles.timerStatusText}>
                                            {isEnded
                                                ? '¡TIEMPO AGOTADO!'
                                                : isTimerRunning
                                                ? 'Toca para pausar'
                                                : 'Toca para reanudar'}
                                        </Text>
                                    </View>
                                </LinearGradient>
                            </Animated.View>
                        </TouchableOpacity>
                    </View>

                    {/* Turn Guidelines Card */}
                    <View style={styles.guidelinesCard}>
                        <View style={styles.guidelinesHeader}>
                            <Ionicons name="bulb-outline" size={16} color={colors.primaryLight} />
                            <Text style={styles.guidelinesTitle}>Dinámica de la Ronda</Text>
                        </View>
                        <View style={styles.guidelinesList}>
                            <View style={styles.guidelineRow}>
                                <View style={styles.dot} />
                                <Text style={styles.guidelineText}>
                                    Por turnos, cada jugador dice <Text style={{ fontWeight: '800', color: '#FFFFFF' }}>UNA</Text> palabra o pista corta.
                                </Text>
                            </View>
                            <View style={styles.guidelineRow}>
                                <View style={styles.dot} />
                                <Text style={styles.guidelineText}>
                                    El impostor no conoce la palabra secreta e intentará camuflarse.
                                </Text>
                            </View>
                            <View style={styles.guidelineRow}>
                                <View style={styles.dot} />
                                <Text style={styles.guidelineText}>
                                    Al completar las pistas, pasen a la <Text style={{ fontWeight: '800', color: colors.impostorLight }}>Fase de Votación</Text>.
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Actions */}
                    <View style={styles.actionsBox}>
                        <TouchableOpacity
                            style={styles.votingActionBtn}
                            onPress={() => {
                                Vibration.vibrate(25);
                                onStartVoting();
                            }}
                            activeOpacity={0.85}
                        >
                            <LinearGradient
                                colors={['#FF2A55', '#7952FF']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.votingActionGradient}
                            >
                                <MaterialCommunityIcons name="vote" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                                <Text style={styles.votingActionText}>Iniciar Votación</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.quickRevealLink}
                            onPress={() => setShowQuickReveal(true)}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="eye-outline" size={15} color={colors.textMuted} style={{ marginRight: 6 }} />
                            <Text style={styles.quickRevealLinkText}>Revelación Rápida Directa</Text>
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
                            colors={gradients.sheetGlass}
                            style={styles.modalGradient}
                        >
                            <Text style={styles.modalHeaderTitle}>REVELACIÓN DIRECTA</Text>

                            <View style={styles.revealSection}>
                                <Text style={styles.revealLabel}>Palabra Secreta:</Text>
                                <View style={styles.wordBadge}>
                                    <Text style={styles.revealWord}>{gameState.secretWord}</Text>
                                </View>
                            </View>

                            <View style={styles.revealSection}>
                                <Text style={styles.revealLabel}>
                                    {impostors.length === 1 ? 'El Impostor era:' : 'Los Impostores eran:'}
                                </Text>
                                <View style={styles.impostorsList}>
                                    {impostors.map(imp => (
                                        <View key={imp.id} style={styles.impostorItem}>
                                            <MaterialCommunityIcons name="incognito" size={18} color={colors.impostor} />
                                            <Text style={styles.impostorName}>{imp.name}</Text>
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
                                        colors={['#7952FF', '#9D7DFF']}
                                        style={styles.modalNewGameButtonGradient}
                                    >
                                        <Text style={styles.modalNewGameButtonText}>
                                            Nueva Partida
                                        </Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        </LinearGradient>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bgDeep,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 54,
        paddingBottom: 40,
    },
    content: {
        gap: 14,
    },
    headerInfoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.bgCard,
        borderRadius: 18,
        padding: 14,
        borderWidth: 1,
        borderColor: colors.borderSubtle,
    },
    themeInfoLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    themeIconBox: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    themeEmojiText: {
        fontSize: 22,
    },
    themeTitleText: {
        fontSize: 17,
        fontWeight: '900',
        color: colors.textPrimary,
    },
    themeMetaText: {
        fontSize: 12,
        color: colors.textMuted,
    },
    headerBadgesRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    roundBadge: {
        backgroundColor: 'rgba(121, 82, 255, 0.2)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: colors.primaryLight,
    },
    roundBadgeText: {
        fontSize: 10,
        fontWeight: '900',
        color: colors.primaryLight,
        letterSpacing: 0.5,
    },
    undercoverBadge: {
        backgroundColor: 'rgba(255, 77, 148, 0.2)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: colors.aiPink,
    },
    undercoverBadgeText: {
        fontSize: 9,
        fontWeight: '900',
        color: colors.aiPink,
        letterSpacing: 0.8,
    },

    rouletteCard: {
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.borderLight,
    },
    rouletteGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        gap: 12,
    },
    rouletteIconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: colors.bgGlassHover,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rouletteTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: colors.textPrimary,
    },
    rouletteSubtitle: {
        fontSize: 11,
        color: colors.textMuted,
    },
    timerDialSection: {
        alignItems: 'center',
        marginVertical: 6,
    },
    timerDialOuter: {
        width: 170,
        height: 170,
        borderRadius: 85,
        borderWidth: 2,
        padding: 4,
    },
    timerDialInner: {
        flex: 1,
        borderRadius: 80,
        justifyContent: 'center',
        alignItems: 'center',
    },
    timerClockText: {
        fontSize: 38,
        fontWeight: '900',
        color: colors.textPrimary,
        fontVariant: ['tabular-nums'],
    },
    timerStatusPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.bgGlassHover,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
        marginTop: 6,
    },
    timerStatusText: {
        fontSize: 11,
        color: colors.textSecondary,
        fontWeight: '700',
    },
    guidelinesCard: {
        backgroundColor: colors.bgCard,
        borderRadius: 18,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.borderSubtle,
        gap: 10,
    },
    guidelinesHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    guidelinesTitle: {
        fontSize: 13,
        fontWeight: '800',
        color: colors.textPrimary,
    },
    guidelinesList: {
        gap: 6,
    },
    guidelineRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
    },
    dot: {
        width: 5,
        height: 5,
        borderRadius: 2.5,
        backgroundColor: colors.cyan,
        marginTop: 6,
    },
    guidelineText: {
        flex: 1,
        fontSize: 12,
        color: colors.textSecondary,
        lineHeight: 16,
    },
    actionsBox: {
        gap: 10,
        marginTop: 6,
    },
    votingActionBtn: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    votingActionGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
    },
    votingActionText: {
        fontSize: 16,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: 0.5,
    },
    quickRevealLink: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
    },
    quickRevealLinkText: {
        fontSize: 13,
        fontWeight: '700',
        color: colors.textMuted,
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
        maxWidth: 360,
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.borderLight,
    },
    modalGradient: {
        padding: 22,
        alignItems: 'center',
    },
    modalHeaderTitle: {
        fontSize: 12,
        fontWeight: '900',
        color: colors.textMuted,
        letterSpacing: 2,
        marginBottom: 16,
    },
    revealSection: {
        alignItems: 'center',
        marginBottom: 14,
        width: '100%',
    },
    revealLabel: {
        fontSize: 12,
        color: colors.textMuted,
        marginBottom: 6,
    },
    wordBadge: {
        backgroundColor: colors.bgElevated,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.primary,
        width: '100%',
        alignItems: 'center',
    },
    revealWord: {
        fontSize: 22,
        fontWeight: '900',
        color: colors.textPrimary,
    },
    impostorsList: {
        gap: 6,
        width: '100%',
    },
    impostorItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 42, 85, 0.15)',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12,
        gap: 8,
        borderWidth: 1,
        borderColor: 'rgba(255, 42, 85, 0.3)',
    },
    impostorName: {
        fontSize: 16,
        fontWeight: '800',
        color: colors.impostorLight,
    },
    modalButtons: {
        width: '100%',
        gap: 8,
        marginTop: 10,
    },
    modalCloseButton: {
        backgroundColor: colors.bgGlassHover,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    modalCloseButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.textSecondary,
    },
    modalNewGameButton: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    modalNewGameButtonGradient: {
        alignItems: 'center',
        paddingVertical: 14,
    },
    modalNewGameButtonText: {
        fontSize: 15,
        fontWeight: '800',
        color: '#FFFFFF',
    },
});
