import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Animated,
    Dimensions,
    Vibration,
    Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGame } from '../context/GameContext';
import { Player } from '../types/game';
import { colors } from '../styles/colors';

const { width } = Dimensions.get('window');

interface VotingScreenProps {
    onVotedComplete: () => void;
    onBackToDiscussion: () => void;
}

export const VotingScreen: React.FC<VotingScreenProps> = ({
    onVotedComplete,
    onBackToDiscussion,
}) => {
    const { gameState, submitVote, calculateVotingResults } = useGame();
    const [selectedSuspectId, setSelectedSuspectId] = useState<number | null>(null);
    const [activeVoterIndex, setActiveVoterIndex] = useState<number>(0);
    const [showEjectionModal, setShowEjectionModal] = useState(false);
    const [ejectedPlayer, setEjectedPlayer] = useState<Player | null>(null);
    const [revealedStatus, setRevealedStatus] = useState(false);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const sirenAnim = useRef(new Animated.Value(0)).current;
    const shakeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
        }).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(sirenAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
                Animated.timing(sirenAnim, { toValue: 0.3, duration: 800, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    const totalPlayers = gameState.players.length;
    const currentVoter = gameState.players[activeVoterIndex];

    const handleSelectVote = (suspectId: number) => {
        setSelectedSuspectId(suspectId);
        Vibration.vibrate(30);
    };

    const handleConfirmVote = () => {
        if (selectedSuspectId === null) return;

        submitVote(currentVoter.id, selectedSuspectId);
        setSelectedSuspectId(null);

        if (activeVoterIndex < totalPlayers - 1) {
            setActiveVoterIndex(prev => prev + 1);
        } else {
            // All players voted -> Trigger Ejection Sequence
            const result = calculateVotingResults();
            setEjectedPlayer(result.ejectedPlayer);
            setShowEjectionModal(true);
            setRevealedStatus(false);
            Vibration.vibrate([0, 150, 100, 200, 100, 400]);
        }
    };

    const handleRevealEjection = () => {
        setRevealedStatus(true);
        if (ejectedPlayer?.isImpostor) {
            Vibration.vibrate([0, 100, 50, 100, 50, 300]);
        } else {
            Vibration.vibrate([0, 300, 100, 300]);
        }

        // Shake animation
        Animated.sequence([
            Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
        ]).start();
    };

    const handleGoToResults = () => {
        setShowEjectionModal(false);
        onVotedComplete();
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

            <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={onBackToDiscussion} style={styles.backBtn}>
                        <Text style={styles.backBtnText}>← Volver a Debate</Text>
                    </TouchableOpacity>

                    <View style={styles.titleRow}>
                        <Text style={styles.titleEmoji}>🗳️</Text>
                        <View>
                            <Text style={styles.title}>Fase de Votación</Text>
                            <Text style={styles.subtitle}>
                                Turno de votar: <Text style={styles.activeVoterName}>{currentVoter?.name}</Text>
                            </Text>
                        </View>
                    </View>

                    {/* Progress */}
                    <View style={styles.voterProgressBar}>
                        <View
                            style={[
                                styles.voterProgressFill,
                                { width: `${((activeVoterIndex + 1) / totalPlayers) * 100}%` },
                            ]}
                        />
                    </View>
                    <Text style={styles.voterProgressText}>
                        Voto {activeVoterIndex + 1} de {totalPlayers}
                    </Text>
                </View>

                {/* Question */}
                <View style={styles.questionCard}>
                    <Text style={styles.questionText}>
                        {currentVoter?.name}, ¿quién crees que es el Impostor?
                    </Text>
                </View>

                {/* Suspects Grid */}
                <ScrollView
                    style={styles.suspectsScroll}
                    contentContainerStyle={styles.suspectsGrid}
                    showsVerticalScrollIndicator={false}
                >
                    {gameState.players.map((player) => {
                        const isSelf = player.id === currentVoter.id;
                        const isSelected = selectedSuspectId === player.id;

                        return (
                            <TouchableOpacity
                                key={player.id}
                                style={[
                                    styles.suspectCard,
                                    isSelected && styles.suspectCardSelected,
                                    isSelf && styles.suspectCardSelf,
                                ]}
                                onPress={() => handleSelectVote(player.id)}
                                activeOpacity={0.8}
                            >
                                <LinearGradient
                                    colors={
                                        isSelected
                                            ? ['rgba(255, 71, 87, 0.4)', 'rgba(255, 71, 87, 0.15)']
                                            : isSelf
                                            ? ['rgba(255, 255, 255, 0.03)', 'rgba(255, 255, 255, 0.01)']
                                            : ['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.03)']
                                    }
                                    style={styles.suspectCardGradient}
                                >
                                    <View
                                        style={[
                                            styles.avatarCircle,
                                            isSelected && styles.avatarCircleSelected,
                                        ]}
                                    >
                                        <Text style={styles.avatarInitial}>
                                            {player.name.charAt(0).toUpperCase()}
                                        </Text>
                                    </View>

                                    <Text
                                        style={[
                                            styles.suspectName,
                                            isSelected && styles.suspectNameSelected,
                                        ]}
                                        numberOfLines={1}
                                    >
                                        {player.name}
                                    </Text>

                                    {isSelf && (
                                        <Text style={styles.selfBadge}>(Tú)</Text>
                                    )}

                                    {isSelected && (
                                        <View style={styles.suspectTag}>
                                            <Text style={styles.suspectTagText}>🎯 Sospechoso</Text>
                                        </View>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                {/* Footer Action */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[
                            styles.confirmVoteBtn,
                            selectedSuspectId === null && styles.confirmVoteBtnDisabled,
                        ]}
                        onPress={handleConfirmVote}
                        disabled={selectedSuspectId === null}
                        activeOpacity={0.85}
                    >
                        <LinearGradient
                            colors={
                                selectedSuspectId !== null
                                    ? ['#FF4757', '#C0392B']
                                    : ['#3A3A55', '#2A2A40']
                            }
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.confirmVoteGradient}
                        >
                            <Text style={styles.confirmVoteText}>
                                {activeVoterIndex < totalPlayers - 1
                                    ? 'Confirmar Voto y Siguiente →'
                                    : '⚖️ Ver Veredicto Final'}
                            </Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </Animated.View>

            {/* Ejection / Trial Modal */}
            <Modal
                visible={showEjectionModal}
                transparent
                animationType="fade"
            >
                <View style={styles.ejectionOverlay}>
                    <Animated.View
                        style={[
                            styles.ejectionCard,
                            { transform: [{ translateX: shakeAnim }] },
                        ]}
                    >
                        <LinearGradient
                            colors={['#1c1c38', '#0f0f2a']}
                            style={styles.ejectionGradient}
                        >
                            <Text style={styles.ejectionSiren}>🚨</Text>
                            <Text style={styles.ejectionHeaderTitle}>VEREDICTO DEL GRUPO</Text>

                            {ejectedPlayer ? (
                                <>
                                    <Text style={styles.ejectedLabel}>El jugador más votado es:</Text>
                                    <View style={styles.ejectedNameBox}>
                                        <Text style={styles.ejectedPlayerName}>{ejectedPlayer.name}</Text>
                                    </View>

                                    {!revealedStatus ? (
                                        <TouchableOpacity
                                            style={styles.revealIdentityBtn}
                                            onPress={handleRevealEjection}
                                            activeOpacity={0.8}
                                        >
                                            <LinearGradient
                                                colors={['#6C5CE7', '#FD79A8']}
                                                style={styles.revealIdentityGradient}
                                            >
                                                <Text style={styles.revealIdentityText}>
                                                    🔍 Revelar si era el Impostor
                                                </Text>
                                            </LinearGradient>
                                        </TouchableOpacity>
                                    ) : (
                                        <View style={styles.verdictResultBox}>
                                            <Text style={styles.verdictBigEmoji}>
                                                {ejectedPlayer.isImpostor ? '🔪' : '😇'}
                                            </Text>
                                            <Text
                                                style={[
                                                    styles.verdictRoleText,
                                                    { color: ejectedPlayer.isImpostor ? '#FF4757' : '#00CEC9' },
                                                ]}
                                            >
                                                {ejectedPlayer.isImpostor
                                                    ? '¡ERA EL IMPOSTOR!'
                                                    : '¡ERA UN TRIPULANTE INOCENTE!'}
                                            </Text>
                                            <Text style={styles.verdictSub}>
                                                {ejectedPlayer.isImpostor
                                                    ? '¡La tripulación ha ganado la partida!'
                                                    : 'El impostor ha engañado a todos...'}
                                            </Text>

                                            <TouchableOpacity
                                                style={styles.goToResultsBtn}
                                                onPress={handleGoToResults}
                                                activeOpacity={0.8}
                                            >
                                                <LinearGradient
                                                    colors={['#00B894', '#00CEC9']}
                                                    style={styles.goToResultsGradient}
                                                >
                                                    <Text style={styles.goToResultsText}>
                                                        🏆 Ver Resultados y Estadísticas
                                                    </Text>
                                                </LinearGradient>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </>
                            ) : (
                                <View style={styles.tieBox}>
                                    <Text style={styles.tieEmoji}>⚖️</Text>
                                    <Text style={styles.tieTitle}>¡EMPATE DE VOTOS!</Text>
                                    <Text style={styles.tieSub}>
                                        Nadie fue expulsado. La partida termina sin veredicto claro.
                                    </Text>
                                    <TouchableOpacity
                                        style={styles.goToResultsBtn}
                                        onPress={handleGoToResults}
                                    >
                                        <LinearGradient
                                            colors={['#6C5CE7', '#A29BFE']}
                                            style={styles.goToResultsGradient}
                                        >
                                            <Text style={styles.goToResultsText}>Ver Quién Era</Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </LinearGradient>
                    </Animated.View>
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
        backgroundColor: '#FF4757',
        top: -80,
        right: -80,
        opacity: 0.08,
    },
    bgCircle2: {
        position: 'absolute',
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: '#6C5CE7',
        bottom: 50,
        left: -60,
        opacity: 0.08,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 54,
    },
    header: {
        marginBottom: 16,
    },
    backBtn: {
        marginBottom: 12,
    },
    backBtnText: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 14,
        fontWeight: '600',
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    titleEmoji: {
        fontSize: 32,
    },
    title: {
        fontSize: 26,
        fontWeight: '900',
        color: '#FFFFFF',
    },
    subtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.6)',
        marginTop: 2,
    },
    activeVoterName: {
        color: '#00CEC9',
        fontWeight: '800',
    },
    voterProgressBar: {
        height: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 3,
        overflow: 'hidden',
        marginTop: 8,
    },
    voterProgressFill: {
        height: '100%',
        backgroundColor: '#FF4757',
        borderRadius: 3,
    },
    voterProgressText: {
        fontSize: 11,
        color: 'rgba(255, 255, 255, 0.4)',
        marginTop: 4,
        textAlign: 'right',
    },
    questionCard: {
        backgroundColor: 'rgba(255, 71, 87, 0.12)',
        borderRadius: 16,
        padding: 14,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 71, 87, 0.3)',
    },
    questionText: {
        fontSize: 15,
        color: '#FFFFFF',
        fontWeight: '700',
        textAlign: 'center',
    },
    suspectsScroll: {
        flex: 1,
    },
    suspectsGrid: {
        gap: 10,
        paddingBottom: 20,
    },
    suspectCard: {
        borderRadius: 18,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    suspectCardSelected: {
        borderColor: '#FF4757',
        borderWidth: 2,
    },
    suspectCardSelf: {
        opacity: 0.7,
    },
    suspectCardGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        gap: 14,
    },
    avatarCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(108, 92, 231, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarCircleSelected: {
        backgroundColor: '#FF4757',
    },
    avatarInitial: {
        fontSize: 20,
        fontWeight: '900',
        color: '#FFFFFF',
    },
    suspectName: {
        flex: 1,
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    suspectNameSelected: {
        color: '#FF6B81',
        fontWeight: '900',
    },
    selfBadge: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.4)',
        fontWeight: '600',
    },
    suspectTag: {
        backgroundColor: '#FF4757',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },
    suspectTagText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '800',
    },
    footer: {
        paddingVertical: 18,
    },
    confirmVoteBtn: {
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#FF4757',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    },
    confirmVoteBtnDisabled: {
        opacity: 0.5,
        shadowOpacity: 0,
        elevation: 0,
    },
    confirmVoteGradient: {
        paddingVertical: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    confirmVoteText: {
        fontSize: 17,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: 0.5,
    },
    ejectionOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.92)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    ejectionCard: {
        width: '100%',
        maxWidth: 380,
        borderRadius: 28,
        overflow: 'hidden',
        borderWidth: 1.5,
        borderColor: 'rgba(255, 71, 87, 0.4)',
    },
    ejectionGradient: {
        padding: 26,
        alignItems: 'center',
    },
    ejectionSiren: {
        fontSize: 48,
        marginBottom: 8,
    },
    ejectionHeaderTitle: {
        fontSize: 14,
        fontWeight: '900',
        color: '#FF4757',
        letterSpacing: 2,
        marginBottom: 16,
    },
    ejectedLabel: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.6)',
        marginBottom: 8,
    },
    ejectedNameBox: {
        backgroundColor: 'rgba(255, 71, 87, 0.2)',
        paddingHorizontal: 28,
        paddingVertical: 14,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#FF4757',
        marginBottom: 24,
    },
    ejectedPlayerName: {
        fontSize: 28,
        fontWeight: '900',
        color: '#FFFFFF',
        textAlign: 'center',
    },
    revealIdentityBtn: {
        width: '100%',
        borderRadius: 18,
        overflow: 'hidden',
    },
    revealIdentityGradient: {
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    revealIdentityText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '800',
    },
    verdictResultBox: {
        width: '100%',
        alignItems: 'center',
    },
    verdictBigEmoji: {
        fontSize: 56,
        marginBottom: 10,
    },
    verdictRoleText: {
        fontSize: 24,
        fontWeight: '900',
        letterSpacing: 1,
        textAlign: 'center',
    },
    verdictSub: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.7)',
        textAlign: 'center',
        marginTop: 6,
        marginBottom: 20,
    },
    goToResultsBtn: {
        width: '100%',
        borderRadius: 18,
        overflow: 'hidden',
    },
    goToResultsGradient: {
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    goToResultsText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '800',
    },
    tieBox: {
        alignItems: 'center',
        width: '100%',
    },
    tieEmoji: {
        fontSize: 48,
        marginBottom: 10,
    },
    tieTitle: {
        fontSize: 22,
        fontWeight: '900',
        color: '#F1C40F',
        marginBottom: 8,
    },
    tieSub: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.7)',
        textAlign: 'center',
        marginBottom: 20,
    },
});
