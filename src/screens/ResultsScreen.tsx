import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Animated,
    Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useGame } from '../context/GameContext';
import { colors, gradients } from '../styles/colors';

const { width } = Dimensions.get('window');

interface ResultsScreenProps {
    onReplay: () => void;
    onNewGame: () => void;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
    onReplay,
    onNewGame,
}) => {
    const { gameState, replayCurrentTheme, resetGame, allThemes } = useGame();
    const currentTheme = allThemes.find(t => t.id === gameState.config.themeId);
    const impostors = gameState.players.filter(p => p.isImpostor);
    const isCrewmatesWinner = gameState.winner === 'crewmates';

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.95)).current;
    const bannerAnim = useRef(new Animated.Value(-20)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 450, useNativeDriver: true }),
            Animated.spring(scaleAnim, { toValue: 1, friction: 8, tension: 50, useNativeDriver: true }),
            Animated.spring(bannerAnim, { toValue: 0, friction: 7, useNativeDriver: true }),
        ]).start();
    }, []);

    const handleReplay = () => {
        replayCurrentTheme();
        onReplay();
    };

    const handleNewGame = () => {
        resetGame();
        onNewGame();
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={gradients.appBackground}
                style={StyleSheet.absoluteFillObject}
            />

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View
                    style={[
                        styles.content,
                        { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
                    ]}
                >
                    {/* Victory Banner */}
                    <Animated.View
                        style={[
                            styles.bannerContainer,
                            { transform: [{ translateY: bannerAnim }] },
                        ]}
                    >
                        <LinearGradient
                            colors={
                                isCrewmatesWinner
                                    ? ['rgba(0, 240, 255, 0.25)', 'rgba(0, 184, 148, 0.05)']
                                    : ['rgba(255, 42, 85, 0.25)', 'rgba(214, 19, 60, 0.05)']
                            }
                            style={[
                                styles.bannerGradient,
                                { borderColor: isCrewmatesWinner ? colors.cyanGlow : colors.impostorGlow },
                            ]}
                        >
                            <View
                                style={[
                                    styles.bannerIconCircle,
                                    { backgroundColor: isCrewmatesWinner ? 'rgba(0, 240, 255, 0.2)' : 'rgba(255, 42, 85, 0.2)' },
                                ]}
                            >
                                {isCrewmatesWinner ? (
                                    <Ionicons name="trophy" size={32} color={colors.cyan} />
                                ) : (
                                    <MaterialCommunityIcons name="knife-military" size={32} color={colors.impostor} />
                                )}
                            </View>

                            <Text
                                style={[
                                    styles.bannerTitle,
                                    { color: isCrewmatesWinner ? colors.cyan : colors.impostor },
                                ]}
                            >
                                {isCrewmatesWinner
                                    ? '¡VICTORIA TRIPULANTE!'
                                    : '¡VICTORIA DEL IMPOSTOR!'}
                            </Text>

                            <Text style={styles.bannerSubtitle}>
                                {isCrewmatesWinner
                                    ? 'La tripulación descubrió y expulsó al infiltrado.'
                                    : 'El impostor logró pasar desapercibido y triunfar.'}
                            </Text>
                        </LinearGradient>
                    </Animated.View>

                    {/* Secret Word Card */}
                    <View style={styles.card}>
                        <LinearGradient
                            colors={gradients.cardGlass}
                            style={styles.cardGradient}
                        >
                            <Text style={styles.cardLabel}>PALABRA SECRETA</Text>

                            <View style={styles.secretWordBox}>
                                <Text style={styles.secretWordText}>{gameState.secretWord}</Text>
                            </View>

                            <View style={styles.themeInfoRow}>
                                <View style={styles.themeBadge}>
                                    <Text style={styles.themeBadgeText}>
                                        {currentTheme?.icon} {currentTheme?.name}
                                    </Text>
                                </View>
                                {gameState.secretHint ? (
                                    <View style={styles.hintBadge}>
                                        <Text style={styles.hintBadgeText}>
                                            Pista: {gameState.secretHint}
                                        </Text>
                                    </View>
                                ) : null}
                            </View>

                            {gameState.config.gameMode === 'undercover' && gameState.undercoverWord ? (
                                <View style={styles.undercoverWordCard}>
                                    <Text style={styles.undercoverLabel}>
                                        Palabra Camuflada (Undercover):
                                    </Text>
                                    <Text style={styles.undercoverWordText}>
                                        "{gameState.undercoverWord}"
                                    </Text>
                                </View>
                            ) : null}
                        </LinearGradient>
                    </View>

                    {/* Impostor Identity Card */}
                    <View style={styles.card}>
                        <LinearGradient
                            colors={['rgba(255, 42, 85, 0.1)', 'rgba(255, 42, 85, 0.02)']}
                            style={styles.cardGradient}
                        >
                            <Text style={[styles.cardLabel, { color: colors.impostorLight }]}>
                                {impostors.length === 1 ? 'EL IMPOSTOR ERA' : 'LOS IMPOSTORES ERAN'}
                            </Text>
                            <View style={styles.impostorList}>
                                {impostors.map(imp => (
                                    <View key={imp.id} style={styles.impostorRow}>
                                        <View style={styles.impostorAvatarBox}>
                                            <MaterialCommunityIcons name="incognito" size={20} color={colors.impostor} />
                                        </View>
                                        <Text style={styles.impostorName}>{imp.name}</Text>
                                    </View>
                                ))}
                            </View>
                        </LinearGradient>
                    </View>

                    {/* Voting History Summary */}
                    {gameState.votingHistory && gameState.votingHistory.length > 0 && (
                        <View style={styles.card}>
                            <LinearGradient
                                colors={gradients.cardGlass}
                                style={styles.cardGradient}
                            >
                                <Text style={styles.cardLabel}>REGISTRO DE VOTOS</Text>
                                <View style={styles.voteList}>
                                    {gameState.votingHistory.map((item, idx) => (
                                        <View key={idx} style={styles.voteItem}>
                                            <Text style={styles.voterName}>{item.voterName}</Text>
                                            <Ionicons name="arrow-forward" size={12} color={colors.textDisabled} style={{ marginHorizontal: 6 }} />
                                            <Text style={styles.targetName}>{item.targetName}</Text>
                                        </View>
                                    ))}
                                </View>
                            </LinearGradient>
                        </View>
                    )}

                    {/* Action Buttons */}
                    <View style={styles.actions}>
                        <TouchableOpacity
                            style={styles.replayButton}
                            onPress={handleReplay}
                            activeOpacity={0.85}
                        >
                            <LinearGradient
                                colors={['#7952FF', '#9D7DFF']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.replayGradient}
                            >
                                <Feather name="refresh-cw" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                                <Text style={styles.replayButtonText}>
                                    Revancha Inmediata
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.newGameButton}
                            onPress={handleNewGame}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="grid-outline" size={16} color={colors.textSecondary} style={{ marginRight: 6 }} />
                            <Text style={styles.newGameButtonText}>
                                Cambiar Temática
                            </Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bgDeep,
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingTop: 54,
        paddingBottom: 40,
    },
    content: {
        paddingHorizontal: 20,
        gap: 12,
    },
    bannerContainer: {
        borderRadius: 24,
        overflow: 'hidden',
    },
    bannerGradient: {
        padding: 22,
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 24,
    },
    bannerIconCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    bannerTitle: {
        fontSize: 22,
        fontWeight: '900',
        letterSpacing: 1,
        textAlign: 'center',
    },
    bannerSubtitle: {
        fontSize: 12,
        color: colors.textSecondary,
        textAlign: 'center',
        marginTop: 4,
    },
    card: {
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.borderSubtle,
    },
    cardGradient: {
        padding: 18,
        alignItems: 'center',
    },
    cardLabel: {
        fontSize: 11,
        fontWeight: '900',
        color: colors.textMuted,
        letterSpacing: 1.5,
        marginBottom: 10,
        textAlign: 'center',
    },
    secretWordBox: {
        backgroundColor: colors.bgElevated,
        borderRadius: 16,
        paddingVertical: 16,
        paddingHorizontal: 24,
        width: '100%',
        alignItems: 'center',
        marginBottom: 10,
        borderWidth: 1,
        borderColor: colors.borderLight,
    },
    secretWordText: {
        fontSize: 28,
        fontWeight: '900',
        color: colors.textPrimary,
        textAlign: 'center',
    },
    themeInfoRow: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    themeBadge: {
        backgroundColor: colors.bgGlassHover,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    themeBadgeText: {
        color: colors.textSecondary,
        fontSize: 12,
        fontWeight: '700',
    },
    hintBadge: {
        backgroundColor: 'rgba(255, 184, 0, 0.15)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    hintBadgeText: {
        color: colors.warning,
        fontSize: 12,
        fontWeight: '700',
    },
    undercoverWordCard: {
        marginTop: 12,
        backgroundColor: colors.bgElevated,
        borderRadius: 12,
        padding: 10,
        width: '100%',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 77, 148, 0.3)',
    },
    undercoverLabel: {
        fontSize: 11,
        color: colors.textMuted,
        fontWeight: '700',
    },
    undercoverWordText: {
        fontSize: 16,
        fontWeight: '900',
        color: colors.aiPink,
        marginTop: 2,
    },
    impostorList: {
        gap: 8,
        width: '100%',
    },
    impostorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 42, 85, 0.15)',
        borderRadius: 14,
        padding: 12,
        gap: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 42, 85, 0.3)',
    },
    impostorAvatarBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: 'rgba(255, 42, 85, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    impostorName: {
        fontSize: 18,
        fontWeight: '900',
        color: colors.textPrimary,
    },
    voteList: {
        gap: 6,
        width: '100%',
    },
    voteItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderSubtle,
    },
    voterName: {
        fontSize: 13,
        color: colors.textSecondary,
        fontWeight: '700',
    },
    targetName: {
        fontSize: 13,
        color: colors.impostorLight,
        fontWeight: '800',
    },
    actions: {
        marginTop: 6,
        gap: 10,
    },
    replayButton: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    replayGradient: {
        flexDirection: 'row',
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    replayButtonText: {
        fontSize: 16,
        fontWeight: '900',
        color: '#FFFFFF',
    },
    newGameButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.bgGlassHover,
        borderRadius: 16,
        paddingVertical: 14,
        borderWidth: 1,
        borderColor: colors.borderLight,
    },
    newGameButtonText: {
        fontSize: 14,
        fontWeight: '800',
        color: colors.textSecondary,
    },
});
