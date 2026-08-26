import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Animated,
    Dimensions,
    Vibration,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons, Feather } from '@expo/vector-icons';
import { Player } from '../types/game';
import { colors, gradients } from '../styles/colors';

interface WhoStartsModalProps {
    visible: boolean;
    players: Player[];
    onClose: () => void;
}

export const WhoStartsModal: React.FC<WhoStartsModalProps> = ({
    visible,
    players,
    onClose,
}) => {
    const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
    const [isSpinning, setIsSpinning] = useState(false);
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (visible && players.length > 0) {
            spinRoulette();
        }
    }, [visible]);

    const spinRoulette = () => {
        setIsSpinning(true);
        setSelectedPlayer(null);

        let counter = 0;
        const totalSteps = 22 + Math.floor(Math.random() * players.length);
        let speed = 50;

        const step = () => {
            const currentIdx = counter % players.length;
            setSelectedPlayer(players[currentIdx]);
            Vibration.vibrate(20);
            counter++;

            if (counter < totalSteps) {
                if (counter > totalSteps - 7) {
                    speed += 40;
                }
                setTimeout(step, speed);
            } else {
                const finalChosen = players[Math.floor(Math.random() * players.length)];
                setSelectedPlayer(finalChosen);
                setIsSpinning(false);
                Vibration.vibrate([0, 80, 50, 180]);

                Animated.sequence([
                    Animated.spring(scaleAnim, { toValue: 1.12, friction: 4, useNativeDriver: true }),
                    Animated.spring(scaleAnim, { toValue: 1, friction: 6, useNativeDriver: true }),
                ]).start();

                Animated.loop(
                    Animated.sequence([
                        Animated.timing(pulseAnim, { toValue: 1.04, duration: 600, useNativeDriver: true }),
                        Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
                    ])
                ).start();
            }
        };

        step();
    };

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalCard}>
                    <LinearGradient
                        colors={gradients.sheetGlass}
                        style={styles.modalGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                    >
                        {/* Header */}
                        <View style={styles.header}>
                            <View style={styles.iconCircle}>
                                <MaterialCommunityIcons name="dice-multiple-outline" size={28} color={colors.cyan} />
                            </View>
                            <Text style={styles.title}>¿Quién Inicia?</Text>
                            <Text style={styles.subtitle}>
                                Sorteo aleatorio para el primer turno de pistas
                            </Text>
                        </View>

                        {/* Spotlight Spotlight Box */}
                        <View style={styles.spotlightContainer}>
                            <Animated.View
                                style={[
                                    styles.spotlightBox,
                                    {
                                        transform: [{ scale: isSpinning ? 1 : scaleAnim }],
                                    },
                                ]}
                            >
                                <LinearGradient
                                    colors={
                                        isSpinning
                                            ? ['rgba(121, 82, 255, 0.4)', 'rgba(0, 240, 255, 0.1)']
                                            : ['#7952FF', '#00F0FF']
                                    }
                                    style={styles.spotlightGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                >
                                    <View style={styles.innerPlayerBadge}>
                                        <View style={styles.avatarPill}>
                                            {isSpinning ? (
                                                <Feather name="loader" size={24} color={colors.cyan} />
                                            ) : (
                                                <MaterialCommunityIcons name="crown" size={28} color={colors.warning} />
                                            )}
                                        </View>

                                        <Text style={styles.playerName} numberOfLines={1}>
                                            {selectedPlayer?.name || 'Sorteando...'}
                                        </Text>

                                        {!isSpinning && (
                                            <View style={styles.firstTurnBadge}>
                                                <Text style={styles.winnerLabel}>DA LA PRIMERA PISTA</Text>
                                            </View>
                                        )}
                                    </View>
                                </LinearGradient>
                            </Animated.View>
                        </View>

                        <View style={styles.hintContainer}>
                            <Ionicons name="information-circle-outline" size={16} color={colors.textMuted} />
                            <Text style={styles.directionHint}>
                                Continuar en sentido horario ↻
                            </Text>
                        </View>

                        {/* Actions */}
                        <View style={styles.actions}>
                            <TouchableOpacity
                                style={styles.spinAgainBtn}
                                onPress={spinRoulette}
                                disabled={isSpinning}
                                activeOpacity={0.75}
                            >
                                <Feather name="refresh-cw" size={16} color={colors.textSecondary} style={{ marginRight: 6 }} />
                                <Text style={styles.spinAgainText}>Girar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.readyBtn}
                                onPress={onClose}
                                disabled={isSpinning}
                                activeOpacity={0.85}
                            >
                                <LinearGradient
                                    colors={['#00B894', '#00F59B']}
                                    style={styles.readyBtnGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                >
                                    <Text style={styles.readyBtnText}>¡A Jugar!</Text>
                                    <Ionicons name="arrow-forward" size={18} color="#07080C" style={{ marginLeft: 6 }} />
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </LinearGradient>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.88)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalCard: {
        width: '100%',
        maxWidth: 360,
        borderRadius: 28,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.borderLight,
    },
    modalGradient: {
        padding: 24,
        alignItems: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 16,
    },
    iconCircle: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: 'rgba(0, 240, 255, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        borderWidth: 1,
        borderColor: 'rgba(0, 240, 255, 0.3)',
    },
    title: {
        fontSize: 22,
        fontWeight: '900',
        color: colors.textPrimary,
        letterSpacing: 0.5,
    },
    subtitle: {
        fontSize: 12,
        color: colors.textMuted,
        textAlign: 'center',
        marginTop: 4,
    },
    spotlightContainer: {
        width: '100%',
        marginVertical: 12,
        alignItems: 'center',
    },
    spotlightBox: {
        width: '100%',
        borderRadius: 22,
        overflow: 'hidden',
    },
    spotlightGradient: {
        padding: 2,
    },
    innerPlayerBadge: {
        backgroundColor: colors.bgElevated,
        borderRadius: 20,
        paddingVertical: 22,
        paddingHorizontal: 16,
        alignItems: 'center',
    },
    avatarPill: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.bgGlassHover,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    playerName: {
        fontSize: 24,
        fontWeight: '900',
        color: colors.textPrimary,
        textAlign: 'center',
    },
    firstTurnBadge: {
        backgroundColor: 'rgba(0, 240, 255, 0.15)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        marginTop: 8,
        borderWidth: 1,
        borderColor: 'rgba(0, 240, 255, 0.3)',
    },
    winnerLabel: {
        fontSize: 10,
        fontWeight: '900',
        color: colors.cyan,
        letterSpacing: 1.2,
    },
    hintContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 20,
    },
    directionHint: {
        fontSize: 12,
        color: colors.textMuted,
    },
    actions: {
        width: '100%',
        flexDirection: 'row',
        gap: 10,
    },
    spinAgainBtn: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: colors.bgGlassHover,
        paddingVertical: 15,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.borderLight,
    },
    spinAgainText: {
        color: colors.textSecondary,
        fontSize: 14,
        fontWeight: '700',
    },
    readyBtn: {
        flex: 1.4,
        borderRadius: 16,
        overflow: 'hidden',
    },
    readyBtnGradient: {
        flexDirection: 'row',
        paddingVertical: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    readyBtnText: {
        color: '#07080C',
        fontSize: 15,
        fontWeight: '900',
    },
});
