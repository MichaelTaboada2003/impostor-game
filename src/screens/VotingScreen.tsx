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
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useGame } from '../context/GameContext';
import { Player } from '../types/game';
import { colors, gradients } from '../styles/colors';

const { width } = Dimensions.get('window');

interface VotingScreenProps {
    onVotedComplete: () => void;
    onBackToDiscussion: () => void;
}

interface VotingOutcome {
    ejectedPlayer: Player | null;
    winner: 'crewmates' | 'impostors' | null;
    isGameOver: boolean;
    currentRound: number;
    maxRounds: number;
}

export const VotingScreen: React.FC<VotingScreenProps> = ({
    onVotedComplete,
    onBackToDiscussion,
}) => {
    const { gameState, submitVote, calculateVotingResults, continueToNextRound } = useGame();
    const [selectedSuspectId, setSelectedSuspectId] = useState<number | null>(null);
    const [activeVoterIndex, setActiveVoterIndex] = useState<number>(0);
    const [showEjectionModal, setShowEjectionModal] = useState(false);
    const [votingOutcome, setVotingOutcome] = useState<VotingOutcome | null>(null);
    const [revealedStatus, setRevealedStatus] = useState(false);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const shakeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }, []);

    const totalPlayers = gameState.players.length;
    const currentVoter = gameState.players[activeVoterIndex];

    const handleSelectVote = (suspectId: number) => {
        Vibration.vibrate(25);
        setSelectedSuspectId(suspectId);
    };

    const handleConfirmVote = () => {
        if (selectedSuspectId === null) return;

        submitVote(currentVoter.id, selectedSuspectId);
        setSelectedSuspectId(null);

        if (activeVoterIndex < totalPlayers - 1) {
            setActiveVoterIndex(prev => prev + 1);
        } else {
            const outcome = calculateVotingResults();
            setVotingOutcome(outcome);
            setShowEjectionModal(true);
            setRevealedStatus(false);
            Vibration.vibrate([0, 100, 80, 150, 80, 300]);
        }
    };

    const handleRevealEjection = () => {
        setRevealedStatus(true);
        if (votingOutcome?.ejectedPlayer?.isImpostor) {
            Vibration.vibrate([0, 80, 40, 80, 40, 200]);
        } else {
            Vibration.vibrate([0, 200, 100, 200]);
        }

        Animated.sequence([
            Animated.timing(shakeAnim, { toValue: 8, duration: 40, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -8, duration: 40, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 6, duration: 40, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 0, duration: 40, useNativeDriver: true }),
        ]).start();
    };

    const handleGoToNextRound = () => {
        setShowEjectionModal(false);
        continueToNextRound();
        onBackToDiscussion();
    };

    const handleGoToResults = () => {
        setShowEjectionModal(false);
        onVotedComplete();
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={gradients.appBackground}
                style={StyleSheet.absoluteFillObject}
            />

            <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.topNavRow}>
                        <TouchableOpacity onPress={onBackToDiscussion} style={styles.backBtn} activeOpacity={0.7}>
                            <Ionicons name="arrow-back" size={16} color={colors.textSecondary} />
                            <Text style={styles.backBtnText}>Volver a Debate</Text>
                        </TouchableOpacity>

                        <View style={styles.roundHeaderBadge}>
                            <Text style={styles.roundHeaderBadgeText}>
                                Ronda {gameState.currentRound} de {gameState.maxRounds}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.voterHeaderCard}>
                        <View style={styles.voterTagRow}>
                            <View style={styles.voterBadge}>
                                <Text style={styles.voterBadgeText}>
                                    VOTO {activeVoterIndex + 1} DE {totalPlayers}
                                </Text>
                            </View>
                        </View>
                        <Text style={styles.title}>Fase de Votación</Text>
                        <Text style={styles.subtitle}>
                            Turno de <Text style={styles.highlightName}>{currentVoter?.name}</Text>
                        </Text>

                        {/* Progress */}
                        <View style={styles.progressBarBg}>
                            <View
                                style={[
                                    styles.progressBarFill,
                                    { width: `${((activeVoterIndex + 1) / totalPlayers) * 100}%` },
                                ]}
                            />
                        </View>
                    </View>
                </View>

                {/* Prompt Card */}
                <View style={styles.promptCard}>
                    <Ionicons name="finger-print" size={18} color={colors.impostor} style={{ marginRight: 8 }} />
                    <Text style={styles.promptText}>
                        ¿Quién es el sospechoso de ser el Impostor?
                    </Text>
                </View>

                {/* Suspects List */}
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
                                            ? ['rgba(255, 42, 85, 0.3)', 'rgba(255, 42, 85, 0.08)']
                                            : gradients.cardGlass
                                    }
                                    style={styles.suspectGradient}
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

                                    <View style={{ flex: 1 }}>
                                        <Text
                                            style={[
                                                styles.suspectName,
                                                isSelected && { color: colors.impostorLight },
                                            ]}
                                            numberOfLines={1}
                                        >
                                            {player.name}
                                        </Text>
                                        {isSelf && (
                                            <Text style={styles.selfLabel}>Tu voto</Text>
                                        )}
                                    </View>

                                    {isSelected ? (
                                        <View style={styles.suspectTagBox}>
                                            <Ionicons name="checkmark-circle" size={18} color={colors.impostor} />
                                        </View>
                                    ) : (
                                        <View style={styles.emptyCheckRadio} />
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                {/* Fixed Bottom CTA Bar */}
                <View style={styles.bottomBar}>
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
                                    ? ['#FF2A55', '#D6133C']
                                    : ['#232635', '#161822']
                            }
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.confirmVoteGradient}
                        >
                            <Text
                                style={[
                                    styles.confirmVoteText,
                                    selectedSuspectId === null && { color: colors.textDisabled },
                                ]}
                            >
                                {activeVoterIndex < totalPlayers - 1
                                    ? 'Confirmar Voto'
                                    : 'Ver Veredicto del Grupo'}
                            </Text>
                            <Ionicons
                                name="arrow-forward"
                                size={18}
                                color={selectedSuspectId !== null ? '#FFFFFF' : colors.textDisabled}
                                style={{ marginLeft: 8 }}
                            />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </Animated.View>

            {/* Verdict / Trial Modal */}
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
                            colors={gradients.sheetGlass}
                            style={styles.ejectionGradient}
                        >
                            <View style={styles.verdictHeaderBox}>
                                <MaterialCommunityIcons name="gavel" size={24} color={colors.impostor} />
                                <Text style={styles.ejectionHeaderTitle}>VEREDICTO DEL GRUPO</Text>
                            </View>

                            {/* Round Badge */}
                            {votingOutcome && (
                                <View style={styles.verdictRoundBadge}>
                                    <Text style={styles.verdictRoundBadgeText}>
                                        RONDA {votingOutcome.currentRound} DE {votingOutcome.maxRounds}
                                    </Text>
                                </View>
                            )}

                            {votingOutcome?.ejectedPlayer ? (
                                <>
                                    <Text style={styles.ejectedLabel}>El más votado por la tripulación es:</Text>
                                    <View style={styles.ejectedNameBox}>
                                        <Text style={styles.ejectedPlayerName}>
                                            {votingOutcome.ejectedPlayer.name}
                                        </Text>
                                    </View>

                                    {!revealedStatus ? (
                                        <TouchableOpacity
                                            style={styles.revealIdentityBtn}
                                            onPress={handleRevealEjection}
                                            activeOpacity={0.85}
                                        >
                                            <LinearGradient
                                                colors={['#7952FF', '#FF2A55']}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 0 }}
                                                style={styles.revealIdentityGradient}
                                            >
                                                <Ionicons name="eye-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                                                <Text style={styles.revealIdentityText}>
                                                    Revelar Identidad
                                                </Text>
                                            </LinearGradient>
                                        </TouchableOpacity>
                                    ) : (
                                        <View style={styles.verdictResultBox}>
                                            <View
                                                style={[
                                                    styles.verdictIconCircle,
                                                    {
                                                        backgroundColor: votingOutcome.ejectedPlayer.isImpostor
                                                            ? 'rgba(255, 42, 85, 0.2)'
                                                            : 'rgba(0, 240, 255, 0.2)',
                                                    },
                                                ]}
                                            >
                                                {votingOutcome.ejectedPlayer.isImpostor ? (
                                                    <MaterialCommunityIcons name="knife-military" size={40} color={colors.impostor} />
                                                ) : (
                                                    <Ionicons name="shield-checkmark" size={40} color={colors.cyan} />
                                                )}
                                            </View>

                                            <Text
                                                style={[
                                                    styles.verdictRoleText,
                                                    {
                                                        color: votingOutcome.ejectedPlayer.isImpostor
                                                            ? colors.impostor
                                                            : colors.cyan,
                                                    },
                                                ]}
                                            >
                                                {votingOutcome.ejectedPlayer.isImpostor
                                                    ? '¡ERA EL IMPOSTOR!'
                                                    : '¡ERA UN TRIPULANTE!'}
                                            </Text>

                                            <Text style={styles.verdictSub}>
                                                {votingOutcome.ejectedPlayer.isImpostor
                                                    ? '¡La tripulación descubrió al impostor y gana la partida!'
                                                    : votingOutcome.isGameOver
                                                    ? `El impostor sobrevivió las ${votingOutcome.maxRounds} rondas y gana la partida.`
                                                    : `"${votingOutcome.ejectedPlayer.name}" era inocente. El impostor sigue en juego.`}
                                            </Text>

                                            {/* If game is over (Impostor caught OR reached max rounds) */}
                                            {votingOutcome.isGameOver ? (
                                                <TouchableOpacity
                                                    style={styles.goToResultsBtn}
                                                    onPress={handleGoToResults}
                                                    activeOpacity={0.85}
                                                >
                                                    <LinearGradient
                                                        colors={['#00B894', '#00F59B']}
                                                        style={styles.goToResultsGradient}
                                                    >
                                                        <Text style={styles.goToResultsText}>
                                                            Ver Resultados Finales
                                                        </Text>
                                                        <Ionicons name="arrow-forward" size={18} color="#07080C" style={{ marginLeft: 6 }} />
                                                    </LinearGradient>
                                                </TouchableOpacity>
                                            ) : (
                                                /* If game continues to next round */
                                                <View style={styles.roundActionCol}>
                                                    <TouchableOpacity
                                                        style={styles.nextRoundPrimaryBtn}
                                                        onPress={handleGoToNextRound}
                                                        activeOpacity={0.85}
                                                    >
                                                        <LinearGradient
                                                            colors={['#7952FF', '#9D7DFF']}
                                                            style={styles.nextRoundGradient}
                                                        >
                                                            <Text style={styles.nextRoundText}>
                                                                ▶ Ir a Ronda {votingOutcome.currentRound + 1} de {votingOutcome.maxRounds}
                                                            </Text>
                                                        </LinearGradient>
                                                    </TouchableOpacity>

                                                    <TouchableOpacity
                                                        style={styles.endGameNowBtn}
                                                        onPress={handleGoToResults}
                                                    >
                                                        <Text style={styles.endGameNowText}>
                                                            Terminar partida y revelar ahora
                                                        </Text>
                                                    </TouchableOpacity>
                                                </View>
                                            )}
                                        </View>
                                    )}
                                </>
                            ) : (
                                /* TIE STATE */
                                <View style={styles.tieBox}>
                                    <Ionicons name="scale-outline" size={44} color={colors.warning} style={{ marginBottom: 8 }} />
                                    <Text style={styles.tieTitle}>EMPATE DE VOTOS</Text>
                                    <Text style={styles.tieSub}>
                                        {votingOutcome?.isGameOver
                                            ? `No hubo consenso y el impostor superó las ${votingOutcome?.maxRounds} rondas requeridas.`
                                            : 'No hubo consenso para expulsar a un sospechoso. El impostor sigue libre.'}
                                    </Text>

                                    {votingOutcome?.isGameOver ? (
                                        <TouchableOpacity
                                            style={styles.goToResultsBtn}
                                            onPress={handleGoToResults}
                                        >
                                            <LinearGradient
                                                colors={['#7952FF', '#9D7DFF']}
                                                style={styles.goToResultsGradient}
                                            >
                                                <Text style={styles.goToResultsText}>Ver Resultados</Text>
                                            </LinearGradient>
                                        </TouchableOpacity>
                                    ) : (
                                        <View style={styles.roundActionCol}>
                                            <TouchableOpacity
                                                style={styles.nextRoundPrimaryBtn}
                                                onPress={handleGoToNextRound}
                                                activeOpacity={0.85}
                                            >
                                                <LinearGradient
                                                    colors={['#7952FF', '#9D7DFF']}
                                                    style={styles.nextRoundGradient}
                                                >
                                                    <Text style={styles.nextRoundText}>
                                                        ▶ Ir a Ronda {(votingOutcome?.currentRound || 1) + 1} de {votingOutcome?.maxRounds || 2}
                                                    </Text>
                                                </LinearGradient>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                style={styles.endGameNowBtn}
                                                onPress={handleGoToResults}
                                            >
                                                <Text style={styles.endGameNowText}>
                                                    Terminar partida y revelar ahora
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </View>
                            )}
                        </LinearGradient>
                    </Animated.View>
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
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 54,
    },
    header: {
        marginBottom: 14,
    },
    topNavRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    backBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 4,
    },
    backBtnText: {
        color: colors.textSecondary,
        fontSize: 13,
        fontWeight: '700',
    },
    roundHeaderBadge: {
        backgroundColor: 'rgba(121, 82, 255, 0.2)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.primaryLight,
    },
    roundHeaderBadgeText: {
        fontSize: 11,
        fontWeight: '800',
        color: colors.primaryLight,
    },
    voterHeaderCard: {
        backgroundColor: colors.bgCard,
        borderRadius: 18,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.borderSubtle,
    },
    voterTagRow: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    voterBadge: {
        backgroundColor: 'rgba(255, 42, 85, 0.15)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    voterBadgeText: {
        fontSize: 10,
        fontWeight: '900',
        color: colors.impostor,
        letterSpacing: 0.8,
    },
    title: {
        fontSize: 22,
        fontWeight: '900',
        color: colors.textPrimary,
        marginTop: 4,
    },
    subtitle: {
        fontSize: 13,
        color: colors.textMuted,
        marginTop: 2,
    },
    highlightName: {
        color: colors.cyan,
        fontWeight: '900',
    },
    progressBarBg: {
        height: 4,
        backgroundColor: colors.bgElevated,
        borderRadius: 2,
        overflow: 'hidden',
        marginTop: 12,
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: colors.impostor,
    },
    promptCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 42, 85, 0.1)',
        borderRadius: 14,
        padding: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 42, 85, 0.25)',
    },
    promptText: {
        fontSize: 13,
        fontWeight: '700',
        color: colors.textPrimary,
        flex: 1,
    },
    suspectsScroll: {
        flex: 1,
    },
    suspectsGrid: {
        gap: 8,
        paddingBottom: 100,
    },
    suspectCard: {
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.borderSubtle,
    },
    suspectCardSelected: {
        borderColor: colors.impostor,
        borderWidth: 1.5,
    },
    suspectCardSelf: {
        opacity: 0.7,
    },
    suspectGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        gap: 12,
    },
    avatarCircle: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: colors.bgElevated,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarCircleSelected: {
        backgroundColor: colors.impostor,
    },
    avatarInitial: {
        fontSize: 16,
        fontWeight: '900',
        color: '#FFFFFF',
    },
    suspectName: {
        fontSize: 16,
        fontWeight: '800',
        color: colors.textPrimary,
    },
    selfLabel: {
        fontSize: 11,
        color: colors.textMuted,
        marginTop: 1,
    },
    suspectTagBox: {
        padding: 4,
    },
    emptyCheckRadio: {
        width: 18,
        height: 18,
        borderRadius: 9,
        borderWidth: 1.5,
        borderColor: colors.borderLight,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
        paddingTop: 14,
        paddingBottom: 36,
        backgroundColor: 'rgba(7, 8, 12, 0.95)',
        borderTopWidth: 1,
        borderTopColor: colors.borderSubtle,
    },
    confirmVoteBtn: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    confirmVoteBtnDisabled: {
        opacity: 0.5,
    },
    confirmVoteGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
    },
    confirmVoteText: {
        fontSize: 16,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: 0.3,
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
        maxWidth: 360,
        borderRadius: 26,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.borderLight,
    },
    ejectionGradient: {
        padding: 24,
        alignItems: 'center',
    },
    verdictHeaderBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 6,
    },
    ejectionHeaderTitle: {
        fontSize: 12,
        fontWeight: '900',
        color: colors.impostor,
        letterSpacing: 2,
    },
    verdictRoundBadge: {
        backgroundColor: 'rgba(121, 82, 255, 0.2)',
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 8,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: colors.primary,
    },
    verdictRoundBadgeText: {
        fontSize: 10,
        fontWeight: '800',
        color: colors.primaryLight,
        letterSpacing: 1,
    },
    ejectedLabel: {
        fontSize: 13,
        color: colors.textMuted,
        marginBottom: 8,
    },
    ejectedNameBox: {
        backgroundColor: 'rgba(255, 42, 85, 0.15)',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: colors.impostor,
        marginBottom: 20,
    },
    ejectedPlayerName: {
        fontSize: 24,
        fontWeight: '900',
        color: colors.textPrimary,
        textAlign: 'center',
    },
    revealIdentityBtn: {
        width: '100%',
        borderRadius: 14,
        overflow: 'hidden',
    },
    revealIdentityGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
    },
    revealIdentityText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '900',
    },
    verdictResultBox: {
        width: '100%',
        alignItems: 'center',
    },
    verdictIconCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    verdictRoleText: {
        fontSize: 22,
        fontWeight: '900',
        letterSpacing: 1,
        textAlign: 'center',
    },
    verdictSub: {
        fontSize: 13,
        color: colors.textSecondary,
        textAlign: 'center',
        marginTop: 4,
        marginBottom: 18,
        lineHeight: 18,
    },
    goToResultsBtn: {
        width: '100%',
        borderRadius: 14,
        overflow: 'hidden',
    },
    goToResultsGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
    },
    goToResultsText: {
        color: '#07080C',
        fontSize: 15,
        fontWeight: '900',
    },
    roundActionCol: {
        width: '100%',
        gap: 10,
    },
    nextRoundPrimaryBtn: {
        width: '100%',
        borderRadius: 14,
        overflow: 'hidden',
    },
    nextRoundGradient: {
        paddingVertical: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    nextRoundText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '900',
    },
    endGameNowBtn: {
        alignItems: 'center',
        paddingVertical: 6,
    },
    endGameNowText: {
        fontSize: 12,
        color: colors.textMuted,
        fontWeight: '700',
    },
    tieBox: {
        alignItems: 'center',
        width: '100%',
    },
    tieTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: colors.warning,
        marginBottom: 6,
    },
    tieSub: {
        fontSize: 13,
        color: colors.textMuted,
        textAlign: 'center',
        marginBottom: 18,
        lineHeight: 18,
    },
});
