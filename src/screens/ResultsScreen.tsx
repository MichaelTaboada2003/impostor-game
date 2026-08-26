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
import { useGame } from '../context/GameContext';
import { colors } from '../styles/colors';

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
    const crewmates = gameState.players.filter(p => !p.isImpostor);
    const isCrewmatesWinner = gameState.winner === 'crewmates';

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const bannerAnim = useRef(new Animated.Value(-40)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
            Animated.spring(scaleAnim, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }),
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
        <LinearGradient
            colors={['#0a0a1a', '#1a1a3a', '#0f0f2a']}
            style={styles.container}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            <View style={styles.bgCircle1} />
            <View style={styles.bgCircle2} />

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
                                    ? ['rgba(0, 184, 148, 0.4)', 'rgba(0, 206, 201, 0.15)']
                                    : ['rgba(255, 71, 87, 0.4)', 'rgba(232, 65, 65, 0.15)']
                            }
                            style={styles.bannerGradient}
                        >
                            <Text style={styles.bannerEmoji}>
                                {isCrewmatesWinner ? '🏆' : '🔪'}
                            </Text>
                            <Text
                                style={[
                                    styles.bannerTitle,
                                    { color: isCrewmatesWinner ? '#00CEC9' : '#FF4757' },
                                ]}
                            >
                                {isCrewmatesWinner
                                    ? '¡TRIPULANTES GANAN!'
                                    : '¡EL IMPOSTOR GANA!'}
                            </Text>
                            <Text style={styles.bannerSubtitle}>
                                {isCrewmatesWinner
                                    ? 'El impostor fue descubierto y neutralizado.'
                                    : 'El impostor logró infiltrarse y engañar a todos.'}
                            </Text>
                        </LinearGradient>
                    </Animated.View>

                    {/* Secret Word Reveal Card */}
                    <View style={styles.card}>
                        <LinearGradient
                            colors={['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.02)']}
                            style={styles.cardGradient}
                        >
                            <Text style={styles.cardLabel}>PALABRA SECRETA</Text>
                            <View style={styles.secretWordBadge}>
                                <LinearGradient
                                    colors={['#6C5CE7', '#A29BFE']}
                                    style={styles.secretWordGradient}
                                >
                                    <Text style={styles.secretWordText}>{gameState.secretWord}</Text>
                                </LinearGradient>
                            </View>

                            <View style={styles.themeInfoRow}>
                                <Text style={styles.themeBadgeText}>
                                    {currentTheme?.icon} {currentTheme?.name}
                                </Text>
                                {gameState.secretHint ? (
                                    <Text style={styles.hintBadgeText}>
                                        💡 Pista: {gameState.secretHint}
                                    </Text>
                                ) : null}
                            </View>

                            {gameState.config.gameMode === 'undercover' && gameState.undercoverWord ? (
                                <View style={styles.undercoverCard}>
                                    <Text style={styles.undercoverLabel}>
                                        🕵️ Palabra Camuflada del Impostor:
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
                            colors={['rgba(255, 71, 87, 0.15)', 'rgba(255, 71, 87, 0.03)']}
                            style={styles.cardGradient}
                        >
                            <Text style={[styles.cardLabel, { color: '#FF6B81' }]}>
                                {impostors.length === 1 ? '🔪 EL IMPOSTOR ERA' : '🔪 LOS IMPOSTORES ERAN'}
                            </Text>
                            <View style={styles.impostorList}>
                                {impostors.map(imp => (
                                    <View key={imp.id} style={styles.impostorRow}>
                                        <View style={styles.impostorAvatar}>
                                            <Text style={styles.impostorAvatarText}>🔪</Text>
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
                                colors={['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.01)']}
                                style={styles.cardGradient}
                            >
                                <Text style={styles.cardLabel}>🗳️ RESUMEN DE VOTOS</Text>
                                <View style={styles.voteList}>
                                    {gameState.votingHistory.map((item, idx) => (
                                        <View key={idx} style={styles.voteItem}>
                                            <Text style={styles.voterName}>{item.voterName}</Text>
                                            <Text style={styles.voteArrow}>votó por ➔</Text>
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
                                colors={['#6C5CE7', '#A29BFE', '#6C5CE7']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.replayGradient}
                            >
                                <Text style={styles.replayButtonText}>
                                    🔄 Revancha (Misma Temática)
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.newGameButton}
                            onPress={handleNewGame}
                            activeOpacity={0.85}
                        >
                            <LinearGradient
                                colors={['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.05)']}
                                style={styles.newGameGradient}
                            >
                                <Text style={styles.newGameButtonText}>
                                    🎭 Cambiar Temática / Configuración
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
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
        backgroundColor: '#00CEC9',
        top: -100,
        right: -100,
        opacity: 0.08,
    },
    bgCircle2: {
        position: 'absolute',
        width: 250,
        height: 250,
        borderRadius: 125,
        backgroundColor: '#6C5CE7',
        bottom: 80,
        left: -80,
        opacity: 0.08,
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingTop: 54,
        paddingBottom: 40,
    },
    content: {
        paddingHorizontal: 24,
    },
    bannerContainer: {
        borderRadius: 28,
        overflow: 'hidden',
        marginBottom: 20,
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    bannerGradient: {
        padding: 24,
        alignItems: 'center',
    },
    bannerEmoji: {
        fontSize: 54,
        marginBottom: 8,
    },
    bannerTitle: {
        fontSize: 26,
        fontWeight: '900',
        letterSpacing: 1.5,
        textAlign: 'center',
    },
    bannerSubtitle: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.7)',
        textAlign: 'center',
        marginTop: 6,
    },
    card: {
        borderRadius: 22,
        overflow: 'hidden',
        marginBottom: 14,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    cardGradient: {
        padding: 20,
        alignItems: 'center',
    },
    cardLabel: {
        fontSize: 12,
        fontWeight: '800',
        color: 'rgba(255, 255, 255, 0.5)',
        letterSpacing: 1.5,
        marginBottom: 12,
        textAlign: 'center',
    },
    secretWordBadge: {
        borderRadius: 18,
        overflow: 'hidden',
        width: '100%',
        marginBottom: 12,
    },
    secretWordGradient: {
        paddingVertical: 18,
        paddingHorizontal: 24,
        alignItems: 'center',
    },
    secretWordText: {
        fontSize: 32,
        fontWeight: '900',
        color: '#FFFFFF',
        textAlign: 'center',
    },
    themeInfoRow: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    themeBadgeText: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 13,
        fontWeight: '600',
    },
    hintBadgeText: {
        color: '#F1C40F',
        fontSize: 13,
        fontWeight: '600',
    },
    undercoverCard: {
        marginTop: 14,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        borderRadius: 14,
        padding: 12,
        width: '100%',
        alignItems: 'center',
    },
    undercoverLabel: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.6)',
        fontWeight: '600',
    },
    undercoverWordText: {
        fontSize: 18,
        fontWeight: '800',
        color: '#FD79A8',
        marginTop: 4,
    },
    impostorList: {
        gap: 10,
        width: '100%',
    },
    impostorRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 71, 87, 0.2)',
        borderRadius: 16,
        padding: 12,
        gap: 14,
    },
    impostorAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 71, 87, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    impostorAvatarText: {
        fontSize: 20,
    },
    impostorName: {
        fontSize: 20,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    voteList: {
        gap: 8,
        width: '100%',
    },
    voteItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    },
    voterName: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        fontWeight: '600',
    },
    voteArrow: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.4)',
    },
    targetName: {
        fontSize: 14,
        color: '#FF6B81',
        fontWeight: '700',
    },
    actions: {
        marginTop: 10,
        gap: 12,
    },
    replayButton: {
        borderRadius: 22,
        overflow: 'hidden',
        shadowColor: '#6C5CE7',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.5,
        shadowRadius: 14,
        elevation: 8,
    },
    replayGradient: {
        paddingVertical: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    replayButtonText: {
        fontSize: 18,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    newGameButton: {
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    newGameGradient: {
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    newGameButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});
