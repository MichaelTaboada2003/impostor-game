import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Animated,
    ScrollView,
    Switch,
    Vibration,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Updates from 'expo-updates';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useGame } from '../context/GameContext';
import { colors, gradients } from '../styles/colors';

const { width } = Dimensions.get('window');

// Etiqueta de version del badge de cabecera. Al runtimeVersion (que con la policy
// "appVersion" es la version de app.json) se le anade un identificador corto del
// bundle en ejecucion: cambia con cada actualizacion OTA aplicada, asi que sirve
// para comprobar de un vistazo si la actualizacion entro de verdad.
const BUILD_LABEL = (() => {
    try {
        const version = Updates.runtimeVersion || '1.0.0';
        if (__DEV__) return `v${version} · dev`;
        const id = (Updates.updateId || '').replace(/-/g, '');
        return id ? `v${version} · ${id.slice(0, 6)}` : `v${version} · base`;
    } catch {
        return 'v1.0.0';
    }
})();

interface SetupScreenProps {
    onNext: () => void;
}

export const SetupScreen: React.FC<SetupScreenProps> = ({ onNext }) => {
    const {
        gameState,
        setNumberOfPlayers,
        setNumberOfImpostors,
        setAllowHints,
        setGameMode,
        setRoundTimerSeconds,
    } = useGame();

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.95)).current;
    const titleAnim = useRef(new Animated.Value(-15)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 450, useNativeDriver: true }),
            Animated.spring(scaleAnim, { toValue: 1, friction: 8, tension: 50, useNativeDriver: true }),
            Animated.spring(titleAnim, { toValue: 0, friction: 8, tension: 50, useNativeDriver: true }),
        ]).start();
    }, []);

    const {
        numberOfPlayers,
        numberOfImpostors,
        allowHints,
        gameMode = 'classic',
        roundTimerSeconds = 120,
    } = gameState.config;

    const incrementPlayers = () => {
        if (numberOfPlayers < 16) {
            Vibration.vibrate(25);
            setNumberOfPlayers(numberOfPlayers + 1);
        }
    };

    const decrementPlayers = () => {
        if (numberOfPlayers > 3) {
            Vibration.vibrate(25);
            setNumberOfPlayers(numberOfPlayers - 1);
            if (numberOfImpostors >= numberOfPlayers - 1) {
                setNumberOfImpostors(Math.max(1, numberOfPlayers - 2));
            }
        }
    };

    const incrementImpostors = () => {
        const maxImpostors = Math.floor(numberOfPlayers / 2);
        if (numberOfImpostors < maxImpostors) {
            Vibration.vibrate(25);
            setNumberOfImpostors(numberOfImpostors + 1);
        }
    };

    const decrementImpostors = () => {
        if (numberOfImpostors > 1) {
            Vibration.vibrate(25);
            setNumberOfImpostors(numberOfImpostors - 1);
        }
    };

    const timerOptions = [
        { label: 'Libre', seconds: 0 },
        { label: '1 min', seconds: 60 },
        { label: '2 min', seconds: 120 },
        { label: '3 min', seconds: 180 },
        { label: '5 min', seconds: 300 },
    ];

    const crewmatesCount = numberOfPlayers - numberOfImpostors;

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={gradients.appBackground}
                style={StyleSheet.absoluteFillObject}
            />

            {/* Subtle Atmospheric Top Glow */}
            <View style={styles.glowSpotlight} />

            {/* Header */}
            <Animated.View
                style={[
                    styles.header,
                    { opacity: fadeAnim, transform: [{ translateY: titleAnim }] },
                ]}
            >
                <View style={styles.appBadgeRow}>
                    <View style={styles.appIconPill}>
                        <MaterialCommunityIcons name="incognito" size={20} color={colors.primaryLight} />
                        <Text style={styles.appBadgeTitle}>IMPOSTOR GAME</Text>
                    </View>
                    <View style={styles.versionTag}>
                        <Text style={styles.versionText}>{BUILD_LABEL}</Text>
                    </View>
                </View>
                <Text style={styles.mainTitle}>Configura la Partida</Text>
            </Animated.View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View
                    style={[
                        styles.content,
                        { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
                    ]}
                >
                    {/* Game Mode Segmented Switch */}
                    <View style={styles.cardSection}>
                        <View style={styles.sectionHeaderRow}>
                            <Ionicons name="game-controller-outline" size={18} color={colors.primaryLight} />
                            <Text style={styles.sectionTitle}>Modo de Juego</Text>
                        </View>

                        <View style={styles.modeSegmentContainer}>
                            <TouchableOpacity
                                style={[
                                    styles.modeSegmentBtn,
                                    gameMode === 'classic' && styles.modeSegmentBtnActive,
                                ]}
                                onPress={() => {
                                    Vibration.vibrate(20);
                                    setGameMode('classic');
                                }}
                                activeOpacity={0.8}
                            >
                                <Ionicons
                                    name="eye-off-outline"
                                    size={18}
                                    color={gameMode === 'classic' ? '#FFFFFF' : colors.textMuted}
                                />
                                <Text
                                    style={[
                                        styles.modeSegmentText,
                                        gameMode === 'classic' && styles.modeSegmentTextActive,
                                    ]}
                                >
                                    Clásico
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.modeSegmentBtn,
                                    gameMode === 'undercover' && styles.modeSegmentBtnActiveUndercover,
                                ]}
                                onPress={() => {
                                    Vibration.vibrate(20);
                                    setGameMode('undercover');
                                }}
                                activeOpacity={0.8}
                            >
                                <MaterialCommunityIcons
                                    name="shield-account-outline"
                                    size={18}
                                    color={gameMode === 'undercover' ? colors.aiPink : colors.textMuted}
                                />
                                <Text
                                    style={[
                                        styles.modeSegmentText,
                                        gameMode === 'undercover' && styles.modeSegmentTextActiveUndercover,
                                    ]}
                                >
                                    Undercover
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.modeDescription}>
                            {gameMode === 'classic'
                                ? 'El impostor ve "???" y debe deducir la palabra escuchando a los demás.'
                                : 'El infiltrado recibe una palabra muy parecida y cree que es tripulante.'}
                        </Text>
                    </View>

                    {/* Dual Counter: Players & Impostors */}
                    <View style={styles.counterRow}>
                        {/* Players Counter Card */}
                        <View style={styles.counterCard}>
                            <LinearGradient
                                colors={gradients.cardGlass}
                                style={styles.counterCardGradient}
                            >
                                <View style={styles.counterCardHeader}>
                                    <Ionicons name="people" size={16} color={colors.cyan} />
                                    <Text style={styles.counterCardLabel}>Jugadores</Text>
                                </View>

                                <View style={styles.counterBody}>
                                    <TouchableOpacity
                                        style={styles.touchBtn}
                                        onPress={decrementPlayers}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={styles.touchBtnText}>−</Text>
                                    </TouchableOpacity>

                                    <View style={[styles.numberDisplay, { borderColor: colors.cyanGlow }]}>
                                        <Text style={[styles.numberDisplayText, { color: colors.cyan }]}>
                                            {numberOfPlayers}
                                        </Text>
                                    </View>

                                    <TouchableOpacity
                                        style={styles.touchBtn}
                                        onPress={incrementPlayers}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={styles.touchBtnText}>+</Text>
                                    </TouchableOpacity>
                                </View>
                                <Text style={styles.counterHint}>3 a 16 jugadores</Text>
                            </LinearGradient>
                        </View>

                        {/* Impostors Counter Card */}
                        <View style={styles.counterCard}>
                            <LinearGradient
                                colors={['rgba(255, 42, 85, 0.12)', 'rgba(255, 42, 85, 0.02)']}
                                style={styles.counterCardGradient}
                            >
                                <View style={styles.counterCardHeader}>
                                    <MaterialCommunityIcons name="knife-military" size={16} color={colors.impostor} />
                                    <Text style={[styles.counterCardLabel, { color: colors.impostor }]}>Impostores</Text>
                                </View>

                                <View style={styles.counterBody}>
                                    <TouchableOpacity
                                        style={[styles.touchBtn, { backgroundColor: 'rgba(255, 42, 85, 0.15)' }]}
                                        onPress={decrementImpostors}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={[styles.touchBtnText, { color: colors.impostorLight }]}>−</Text>
                                    </TouchableOpacity>

                                    <View style={[styles.numberDisplay, { borderColor: colors.impostorGlow }]}>
                                        <Text style={[styles.numberDisplayText, { color: colors.impostor }]}>
                                            {numberOfImpostors}
                                        </Text>
                                    </View>

                                    <TouchableOpacity
                                        style={[styles.touchBtn, { backgroundColor: 'rgba(255, 42, 85, 0.15)' }]}
                                        onPress={incrementImpostors}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={[styles.touchBtnText, { color: colors.impostorLight }]}>+</Text>
                                    </TouchableOpacity>
                                </View>
                                <Text style={styles.counterHint}>Máx {Math.floor(numberOfPlayers / 2)} impostores</Text>
                            </LinearGradient>
                        </View>
                    </View>

                    {/* Balance Preview Badge */}
                    <View style={styles.balancePill}>
                        <View style={styles.balanceTeam}>
                            <Ionicons name="shield-checkmark" size={14} color={colors.cyan} />
                            <Text style={styles.balanceTeamText}>{crewmatesCount} Tripulantes</Text>
                        </View>
                        <Text style={styles.balanceVs}>VS</Text>
                        <View style={styles.balanceTeam}>
                            <MaterialCommunityIcons name="sword-cross" size={14} color={colors.impostor} />
                            <Text style={[styles.balanceTeamText, { color: colors.impostor }]}>
                                {numberOfImpostors} {numberOfImpostors === 1 ? 'Impostor' : 'Impostores'}
                            </Text>
                        </View>
                    </View>

                    {/* Round Timer Card */}
                    <View style={styles.cardSection}>
                        <View style={styles.sectionHeaderRow}>
                            <Ionicons name="timer-outline" size={18} color={colors.warning} />
                            <Text style={styles.sectionTitle}>Tiempo de Debate</Text>
                        </View>

                        <View style={styles.timerPillsRow}>
                            {timerOptions.map(opt => {
                                const isActive = roundTimerSeconds === opt.seconds;
                                return (
                                    <TouchableOpacity
                                        key={opt.seconds}
                                        style={[
                                            styles.timerPill,
                                            isActive && styles.timerPillActive,
                                        ]}
                                        onPress={() => {
                                            Vibration.vibrate(15);
                                            setRoundTimerSeconds(opt.seconds);
                                        }}
                                        activeOpacity={0.75}
                                    >
                                        <Text
                                            style={[
                                                styles.timerPillText,
                                                isActive && styles.timerPillTextActive,
                                            ]}
                                        >
                                            {opt.label}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>

                    {/* Hints Toggle Card (Classic Mode Only) */}
                    {gameMode === 'classic' && (
                        <View style={styles.switchRowCard}>
                            <View style={styles.switchInfo}>
                                <View style={styles.switchTitleRow}>
                                    <Ionicons name="bulb-outline" size={18} color={colors.warning} />
                                    <Text style={styles.switchTitle}>Pistas para el Impostor</Text>
                                </View>
                                <Text style={styles.switchSubtitle}>
                                    Da una pista temática sutil para que el impostor pueda disimular
                                </Text>
                            </View>
                            <Switch
                                value={allowHints}
                                onValueChange={(val) => {
                                    Vibration.vibrate(20);
                                    setAllowHints(val);
                                }}
                                trackColor={{ false: 'rgba(255, 255, 255, 0.1)', true: colors.primary }}
                                thumbColor={allowHints ? '#FFFFFF' : '#8E8E93'}
                            />
                        </View>
                    )}
                </Animated.View>
            </ScrollView>

            {/* Fixed Bottom CTA Bar */}
            <View style={styles.bottomBar}>
                <TouchableOpacity
                    style={styles.continueButton}
                    onPress={onNext}
                    activeOpacity={0.85}
                >
                    <LinearGradient
                        colors={['#7952FF', '#9D7DFF']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.continueGradient}
                    >
                        <Text style={styles.continueText}>Ingresar Nombres</Text>
                        <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bgDeep,
    },
    glowSpotlight: {
        position: 'absolute',
        top: -60,
        alignSelf: 'center',
        width: 260,
        height: 180,
        borderRadius: 130,
        backgroundColor: colors.primaryGlow,
        opacity: 0.6,
    },
    header: {
        paddingTop: 54,
        paddingHorizontal: 20,
        paddingBottom: 14,
    },
    appBadgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    appIconPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.bgGlassHover,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
        gap: 6,
        borderWidth: 1,
        borderColor: colors.borderSubtle,
    },
    appBadgeTitle: {
        fontSize: 11,
        fontWeight: '900',
        color: colors.primaryLight,
        letterSpacing: 1.2,
    },
    versionTag: {
        backgroundColor: 'rgba(0, 240, 255, 0.15)',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(0, 240, 255, 0.3)',
    },
    versionText: {
        fontSize: 10,
        fontWeight: '900',
        color: colors.cyan,
        letterSpacing: 0.5,
    },
    mainTitle: {
        fontSize: 26,
        fontWeight: '900',
        color: colors.textPrimary,
        letterSpacing: 0.3,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 120,
    },
    content: {
        gap: 14,
    },
    cardSection: {
        backgroundColor: colors.bgCard,
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.borderSubtle,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: colors.textPrimary,
        letterSpacing: 0.3,
    },
    modeSegmentContainer: {
        flexDirection: 'row',
        backgroundColor: colors.bgElevated,
        borderRadius: 14,
        padding: 4,
        gap: 6,
    },
    modeSegmentBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 11,
        gap: 6,
    },
    modeSegmentBtnActive: {
        backgroundColor: colors.primary,
    },
    modeSegmentBtnActiveUndercover: {
        backgroundColor: 'rgba(255, 77, 148, 0.25)',
        borderWidth: 1,
        borderColor: colors.aiPink,
    },
    modeSegmentText: {
        fontSize: 13,
        fontWeight: '700',
        color: colors.textMuted,
    },
    modeSegmentTextActive: {
        color: '#FFFFFF',
        fontWeight: '900',
    },
    modeSegmentTextActiveUndercover: {
        color: colors.aiPink,
        fontWeight: '900',
    },
    modeDescription: {
        fontSize: 12,
        color: colors.textMuted,
        marginTop: 10,
        lineHeight: 16,
    },
    counterRow: {
        flexDirection: 'row',
        gap: 12,
    },
    counterCard: {
        flex: 1,
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.borderSubtle,
    },
    counterCardGradient: {
        padding: 14,
        alignItems: 'center',
    },
    counterCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 10,
    },
    counterCardLabel: {
        fontSize: 13,
        fontWeight: '800',
        color: colors.textSecondary,
    },
    counterBody: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    touchBtn: {
        width: 38,
        height: 38,
        borderRadius: 12,
        backgroundColor: colors.bgGlassHover,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.borderSubtle,
    },
    touchBtnText: {
        fontSize: 22,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    numberDisplay: {
        width: 52,
        height: 52,
        borderRadius: 14,
        backgroundColor: colors.bgElevated,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
    },
    numberDisplayText: {
        fontSize: 26,
        fontWeight: '900',
    },
    counterHint: {
        fontSize: 10,
        color: colors.textMuted,
        textAlign: 'center',
    },
    balancePill: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.bgElevated,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: colors.borderSubtle,
        gap: 12,
    },
    balanceTeam: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    balanceTeamText: {
        fontSize: 12,
        fontWeight: '800',
        color: colors.cyan,
    },
    balanceVs: {
        fontSize: 11,
        fontWeight: '900',
        color: colors.textDisabled,
    },
    timerPillsRow: {
        flexDirection: 'row',
        gap: 6,
    },
    timerPill: {
        flex: 1,
        backgroundColor: colors.bgElevated,
        paddingVertical: 9,
        borderRadius: 10,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.borderSubtle,
    },
    timerPillActive: {
        backgroundColor: 'rgba(255, 184, 0, 0.2)',
        borderColor: colors.warning,
    },
    timerPillText: {
        fontSize: 11,
        fontWeight: '700',
        color: colors.textMuted,
    },
    timerPillTextActive: {
        color: colors.warning,
        fontWeight: '900',
    },
    switchRowCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.bgCard,
        borderRadius: 18,
        padding: 14,
        borderWidth: 1,
        borderColor: colors.borderSubtle,
        gap: 12,
    },
    switchInfo: {
        flex: 1,
    },
    switchTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    switchTitle: {
        fontSize: 13,
        fontWeight: '800',
        color: colors.textPrimary,
    },
    switchSubtitle: {
        fontSize: 11,
        color: colors.textMuted,
        marginTop: 2,
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
    continueButton: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 6,
    },
    continueGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
    },
    continueText: {
        fontSize: 16,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: 0.5,
    },
});
