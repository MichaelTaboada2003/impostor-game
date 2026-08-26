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
import { Player } from '../types/game';

interface WhoStartsModalProps {
    visible: boolean;
    players: Player[];
    onClose: () => void;
}

const { width } = Dimensions.get('window');

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
        const totalSteps = 24 + Math.floor(Math.random() * players.length);
        let speed = 60;

        const step = () => {
            const currentIdx = counter % players.length;
            setSelectedPlayer(players[currentIdx]);
            Vibration.vibrate(20);
            counter++;

            if (counter < totalSteps) {
                if (counter > totalSteps - 8) {
                    speed += 45; // Slow down effect
                }
                setTimeout(step, speed);
            } else {
                // Final selection
                const finalChosen = players[Math.floor(Math.random() * players.length)];
                setSelectedPlayer(finalChosen);
                setIsSpinning(false);
                Vibration.vibrate([0, 100, 50, 150]);

                Animated.sequence([
                    Animated.spring(scaleAnim, { toValue: 1.15, friction: 4, useNativeDriver: true }),
                    Animated.spring(scaleAnim, { toValue: 1, friction: 6, useNativeDriver: true }),
                ]).start();

                Animated.loop(
                    Animated.sequence([
                        Animated.timing(pulseAnim, { toValue: 1.05, duration: 600, useNativeDriver: true }),
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
                        colors={['#1c1c38', '#101026', '#090918']}
                        style={styles.modalGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <View style={styles.header}>
                            <Text style={styles.headerEmoji}>🎲</Text>
                            <Text style={styles.title}>¿Quién Empieza?</Text>
                            <Text style={styles.subtitle}>
                                Ruleta para definir el primer jugador en dar la pista
                            </Text>
                        </View>

                        {/* Spotlight Box */}
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
                                            ? ['rgba(108, 92, 231, 0.4)', 'rgba(108, 92, 231, 0.1)']
                                            : ['#6C5CE7', '#FD79A8', '#00CEC9']
                                    }
                                    style={styles.spotlightGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                >
                                    <View style={styles.innerPlayerBadge}>
                                        <Text style={styles.avatarEmoji}>
                                            {isSpinning ? '🔄' : '👑'}
                                        </Text>
                                        <Text style={styles.playerName}>
                                            {selectedPlayer?.name || 'Sorteando...'}
                                        </Text>
                                        {!isSpinning && (
                                            <Text style={styles.winnerLabel}>¡DA LA PRIMERA PISTA!</Text>
                                        )}
                                    </View>
                                </LinearGradient>
                            </Animated.View>
                        </View>

                        <Text style={styles.directionHint}>
                            💡 Ronda recomendada: en sentido de las agujas del reloj ↻
                        </Text>

                        {/* Actions */}
                        <View style={styles.actions}>
                            <TouchableOpacity
                                style={styles.spinAgainBtn}
                                onPress={spinRoulette}
                                disabled={isSpinning}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.spinAgainText}>🔄 Girar de Nuevo</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.readyBtn}
                                onPress={onClose}
                                disabled={isSpinning}
                                activeOpacity={0.8}
                            >
                                <LinearGradient
                                    colors={['#00B894', '#00CEC9']}
                                    style={styles.readyBtnGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                >
                                    <Text style={styles.readyBtnText}>¡A Jugar!</Text>
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
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalCard: {
        width: '100%',
        maxWidth: 380,
        borderRadius: 28,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    modalGradient: {
        padding: 26,
        alignItems: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 20,
    },
    headerEmoji: {
        fontSize: 48,
        marginBottom: 8,
    },
    title: {
        fontSize: 26,
        fontWeight: '900',
        color: '#FFFFFF',
    },
    subtitle: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.6)',
        textAlign: 'center',
        marginTop: 4,
    },
    spotlightContainer: {
        width: '100%',
        marginVertical: 14,
        alignItems: 'center',
    },
    spotlightBox: {
        width: '100%',
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    spotlightGradient: {
        padding: 3,
    },
    innerPlayerBadge: {
        backgroundColor: '#121226',
        borderRadius: 22,
        paddingVertical: 24,
        paddingHorizontal: 16,
        alignItems: 'center',
    },
    avatarEmoji: {
        fontSize: 38,
        marginBottom: 8,
    },
    playerName: {
        fontSize: 28,
        fontWeight: '900',
        color: '#FFFFFF',
        textAlign: 'center',
    },
    winnerLabel: {
        fontSize: 12,
        fontWeight: '800',
        color: '#00CEC9',
        letterSpacing: 1.5,
        marginTop: 6,
    },
    directionHint: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.5)',
        textAlign: 'center',
        marginBottom: 20,
    },
    actions: {
        width: '100%',
        flexDirection: 'row',
        gap: 10,
    },
    spinAgainBtn: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    spinAgainText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },
    readyBtn: {
        flex: 1.3,
        borderRadius: 16,
        overflow: 'hidden',
    },
    readyBtnGradient: {
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    readyBtnText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '800',
    },
});
