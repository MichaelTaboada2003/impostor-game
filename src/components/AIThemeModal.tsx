import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Animated,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Alert,
    Vibration,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { aiThemeService, AI_SUGGESTION_CHIPS } from '../services/aiThemeService';
import { Theme } from '../types/game';
import { colors, gradients } from '../styles/colors';

interface AIThemeModalProps {
    visible: boolean;
    onClose: () => void;
    onThemeCreatedAndSelect: (theme: Theme) => void;
}

const LOADING_MESSAGES = [
    'Sintonizando red neuronal Groq...',
    'Generando conceptos y palabras en secreto...',
    'Diseñando pistas sutiles de infiltración...',
    'Calibrando parejas para modo Undercover...',
    '¡Finalizando temática secreta!',
];

export const AIThemeModal: React.FC<AIThemeModalProps> = ({
    visible,
    onClose,
    onThemeCreatedAndSelect,
}) => {
    const [topic, setTopic] = useState('');
    const [vibe, setVibe] = useState<'casual' | 'experto' | 'picante' | 'familiar'>('casual');
    const [wordCount, setWordCount] = useState(18);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);
    const [generatedTheme, setGeneratedTheme] = useState<Theme | null>(null);

    const pulseAnim = useRef(new Animated.Value(1)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (isLoading) {
            const interval = setInterval(() => {
                setLoadingMsgIndex(prev => (prev + 1) % LOADING_MESSAGES.length);
            }, 1800);

            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, { toValue: 1.08, duration: 700, useNativeDriver: true }),
                    Animated.timing(pulseAnim, { toValue: 0.95, duration: 700, useNativeDriver: true }),
                ])
            ).start();

            Animated.loop(
                Animated.timing(rotateAnim, { toValue: 1, duration: 3000, useNativeDriver: true })
            ).start();

            return () => clearInterval(interval);
        } else {
            pulseAnim.setValue(1);
            rotateAnim.setValue(0);
        }
    }, [isLoading]);

    const handleGenerate = async (selectedTopic?: string) => {
        const query = (selectedTopic || topic).trim();
        if (!query) {
            Alert.alert('Tema Requerido', 'Escribe un tema o selecciona una sugerencia rápida.');
            return;
        }

        setIsLoading(true);
        setLoadingMsgIndex(0);

        try {
            const theme = await aiThemeService.generateTheme({
                topic: query,
                vibe,
                wordCount,
            });
            Vibration.vibrate([0, 100, 50, 150]);
            setGeneratedTheme(theme);
        } catch (error: any) {
            Alert.alert(
                'Generación de IA',
                error.message || 'No fue posible generar el tema. Intenta nuevamente.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleUseTheme = () => {
        if (generatedTheme) {
            Vibration.vibrate(20);
            onThemeCreatedAndSelect(generatedTheme);
            handleClose();
        }
    };

    const handleClose = () => {
        setTopic('');
        setGeneratedTheme(null);
        setIsLoading(false);
        onClose();
    };

    const spinInterpolate = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={handleClose}
        >
            <KeyboardAvoidingView
                style={styles.modalOverlay}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <View style={styles.sheetContainer}>
                    <LinearGradient
                        colors={gradients.sheetGlass}
                        style={styles.sheetGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                    >
                        {/* Drag Handle Indicator */}
                        <View style={styles.handleContainer}>
                            <View style={styles.handle} />
                        </View>

                        {/* Sheet Header */}
                        <View style={styles.modalHeader}>
                            <View style={styles.headerTitleRow}>
                                <LinearGradient
                                    colors={['#7952FF', '#FF4D94']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.aiBadgeIcon}
                                >
                                    <MaterialCommunityIcons name="robot-outline" size={22} color="#FFFFFF" />
                                </LinearGradient>
                                <View style={{ flex: 1 }}>
                                    <View style={styles.aiTitleBadgeRow}>
                                        <Text style={styles.modalTitle}>Generador IA</Text>
                                        <View style={styles.proTag}>
                                            <Text style={styles.proTagText}>GROQ LLM</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.modalSubtitle}>
                                        Crea palabras y pistas secretas sin revelar su contenido
                                    </Text>
                                </View>
                            </View>

                            <TouchableOpacity style={styles.closeBtn} onPress={handleClose} activeOpacity={0.7}>
                                <Ionicons name="close" size={20} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        {/* Content */}
                        <ScrollView
                            style={styles.modalBody}
                            contentContainerStyle={styles.scrollContent}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                        >
                            {!generatedTheme && !isLoading && (
                                <>
                                    {/* Input Section */}
                                    <View style={styles.inputSection}>
                                        <Text style={styles.inputLabel}>¿Qué temática deseas crear?</Text>
                                        <View style={styles.inputWrapper}>
                                            <Ionicons name="sparkles-outline" size={18} color={colors.primaryLight} style={{ marginRight: 10 }} />
                                            <TextInput
                                                style={styles.textInput}
                                                placeholder="Ej. Reggaeton 2000s, Marvel, Cocina..."
                                                placeholderTextColor={colors.textMuted}
                                                value={topic}
                                                onChangeText={setTopic}
                                                maxLength={60}
                                                returnKeyType="done"
                                                onSubmitEditing={() => handleGenerate()}
                                            />
                                            {topic.length > 0 && (
                                                <TouchableOpacity onPress={() => setTopic('')} style={styles.clearInputBtn}>
                                                    <Ionicons name="close-circle" size={18} color={colors.textMuted} />
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    </View>

                                    {/* Quick Suggestions Chips */}
                                    <View style={styles.chipsSection}>
                                        <Text style={styles.sectionMiniLabel}>Sugerencias Rápidas</Text>
                                        <View style={styles.chipsGrid}>
                                            {AI_SUGGESTION_CHIPS.map((chip, index) => (
                                                <TouchableOpacity
                                                    key={index}
                                                    style={styles.chipButton}
                                                    onPress={() => {
                                                        setTopic(chip.prompt);
                                                        handleGenerate(chip.prompt);
                                                    }}
                                                    activeOpacity={0.7}
                                                >
                                                    <Text style={styles.chipText}>{chip.title}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>

                                    {/* Vibe / Tone Selector */}
                                    <View style={styles.vibeSection}>
                                        <Text style={styles.sectionMiniLabel}>Tono de Partida</Text>
                                        <View style={styles.vibeRow}>
                                            {[
                                                { key: 'casual', label: 'Casual', icon: 'happy-outline' },
                                                { key: 'experto', label: 'Experto', icon: 'school-outline' },
                                                { key: 'picante', label: 'Fiesta', icon: 'flame-outline' },
                                                { key: 'familiar', label: 'Familiar', icon: 'people-outline' },
                                            ].map(item => {
                                                const isActive = vibe === item.key;
                                                return (
                                                    <TouchableOpacity
                                                        key={item.key}
                                                        style={[
                                                            styles.vibePill,
                                                            isActive && styles.vibePillActive,
                                                        ]}
                                                        onPress={() => setVibe(item.key as any)}
                                                        activeOpacity={0.75}
                                                    >
                                                        <Ionicons
                                                            name={item.icon as any}
                                                            size={16}
                                                            color={isActive ? '#FFFFFF' : colors.textMuted}
                                                            style={{ marginBottom: 4 }}
                                                        />
                                                        <Text
                                                            style={[
                                                                styles.vibePillText,
                                                                isActive && styles.vibePillTextActive,
                                                            ]}
                                                        >
                                                            {item.label}
                                                        </Text>
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </View>
                                    </View>

                                    {/* Word Count */}
                                    <View style={styles.countSection}>
                                        <Text style={styles.sectionMiniLabel}>Número de Palabras</Text>
                                        <View style={styles.countRow}>
                                            {[12, 18, 24].map(cnt => {
                                                const isActive = wordCount === cnt;
                                                return (
                                                    <TouchableOpacity
                                                        key={cnt}
                                                        style={[
                                                            styles.countPill,
                                                            isActive && styles.countPillActive,
                                                        ]}
                                                        onPress={() => setWordCount(cnt)}
                                                        activeOpacity={0.75}
                                                    >
                                                        <Text
                                                            style={[
                                                                styles.countPillText,
                                                                isActive && styles.countPillTextActive,
                                                            ]}
                                                        >
                                                            {cnt} palabras
                                                        </Text>
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </View>
                                    </View>
                                </>
                            )}

                            {/* Loading State */}
                            {isLoading && (
                                <View style={styles.loadingContainer}>
                                    <Animated.View
                                        style={[
                                            styles.loadingOrb,
                                            {
                                                transform: [
                                                    { scale: pulseAnim },
                                                    { rotate: spinInterpolate },
                                                ],
                                            },
                                        ]}
                                    >
                                        <LinearGradient
                                            colors={['#7952FF', '#FF4D94', '#00F0FF']}
                                            style={styles.orbGradient}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 1 }}
                                        >
                                            <View style={styles.orbInner}>
                                                <MaterialCommunityIcons name="creation" size={32} color="#FFFFFF" />
                                            </View>
                                        </LinearGradient>
                                    </Animated.View>

                                    <ActivityIndicator size="small" color={colors.cyan} style={{ marginTop: 24 }} />
                                    <Text style={styles.loadingStatusText}>
                                        {LOADING_MESSAGES[loadingMsgIndex]}
                                    </Text>
                                    <Text style={styles.loadingSubtext}>
                                        Generando palabras protegidas con Groq
                                    </Text>
                                </View>
                            )}

                            {/* READY STATE (Strictly Hidden to prevent spoiler / advantage) */}
                            {generatedTheme && !isLoading && (
                                <View style={styles.readyContainer}>
                                    {/* Theme Title Card */}
                                    <View style={styles.previewCardHeader}>
                                        <LinearGradient
                                            colors={[`${generatedTheme.color}40`, 'rgba(255, 255, 255, 0.03)']}
                                            style={styles.previewHeaderGradient}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 1 }}
                                        >
                                            <View style={[styles.previewIconBox, { backgroundColor: `${generatedTheme.color}35` }]}>
                                                <Text style={styles.previewIcon}>{generatedTheme.icon}</Text>
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.previewThemeName}>{generatedTheme.name}</Text>
                                                <View style={styles.previewMetaRow}>
                                                    <View style={styles.wordsCountTag}>
                                                        <Text style={styles.wordsCountTagText}>
                                                            {generatedTheme.words.length} palabras generadas
                                                        </Text>
                                                    </View>
                                                    <Text style={styles.readyBadge}>✓ Lista para jugar</Text>
                                                </View>
                                            </View>
                                        </LinearGradient>
                                    </View>

                                    {/* Secret Protection Notice Box */}
                                    <View style={styles.secretShieldCard}>
                                        <LinearGradient
                                            colors={['rgba(0, 240, 255, 0.12)', 'rgba(121, 82, 255, 0.04)']}
                                            style={styles.secretShieldGradient}
                                        >
                                            <View style={styles.secretShieldIconCircle}>
                                                <MaterialCommunityIcons name="incognito" size={32} color={colors.cyan} />
                                            </View>
                                            <Text style={styles.secretShieldTitle}>CONTENIDO OCULTO</Text>
                                            <Text style={styles.secretShieldDescription}>
                                                Las palabras y pistas generadas se mantienen en secreto para que nadie tenga ventaja previa y todos los jugadores compitan en igualdad de condiciones.
                                            </Text>
                                        </LinearGradient>
                                    </View>
                                </View>
                            )}
                        </ScrollView>

                        {/* Footer Action Button */}
                        <View style={styles.modalFooter}>
                            {!generatedTheme ? (
                                <TouchableOpacity
                                    style={[
                                        styles.generateButton,
                                        (!topic.trim() && !isLoading) && styles.generateButtonDisabled,
                                    ]}
                                    onPress={() => handleGenerate()}
                                    disabled={isLoading}
                                    activeOpacity={0.85}
                                >
                                    <LinearGradient
                                        colors={
                                            topic.trim()
                                                ? ['#7952FF', '#FF4D94', '#00F0FF']
                                                : ['#2A2D3D', '#1B1E2B']
                                        }
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={styles.generateButtonGradient}
                                    >
                                        <MaterialCommunityIcons name="lightning-bolt" size={20} color="#FFFFFF" style={{ marginRight: 6 }} />
                                        <Text style={styles.generateButtonText}>
                                            Generar con IA
                                        </Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            ) : (
                                <View style={styles.actionButtonsRow}>
                                    <TouchableOpacity
                                        style={styles.secondaryRegenBtn}
                                        onPress={() => handleGenerate()}
                                        activeOpacity={0.8}
                                    >
                                        <Feather name="refresh-cw" size={16} color={colors.textPrimary} style={{ marginRight: 6 }} />
                                        <Text style={styles.secondaryRegenText}>Regenerar</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.primaryPlayBtn}
                                        onPress={handleUseTheme}
                                        activeOpacity={0.85}
                                    >
                                        <LinearGradient
                                            colors={['#00B894', '#00F59B']}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                            style={styles.primaryPlayGradient}
                                        >
                                            <Ionicons name="play" size={18} color="#07080C" style={{ marginRight: 6 }} />
                                            <Text style={styles.primaryPlayText}>¡Jugar con este Tema!</Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    </LinearGradient>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        justifyContent: 'flex-end',
    },
    sheetContainer: {
        height: '88%',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.borderSubtle,
    },
    sheetGradient: {
        flex: 1,
    },
    handleContainer: {
        alignItems: 'center',
        paddingTop: 10,
        paddingBottom: 6,
    },
    handle: {
        width: 38,
        height: 4,
        borderRadius: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 14,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderSubtle,
    },
    headerTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    aiBadgeIcon: {
        width: 40,
        height: 40,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    aiTitleBadgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: colors.textPrimary,
        letterSpacing: 0.3,
    },
    proTag: {
        backgroundColor: 'rgba(121, 82, 255, 0.25)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: colors.primaryLight,
    },
    proTagText: {
        fontSize: 9,
        fontWeight: '900',
        color: colors.primaryLight,
        letterSpacing: 0.5,
    },
    modalSubtitle: {
        fontSize: 12,
        color: colors.textMuted,
        marginTop: 2,
    },
    closeBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.bgGlassHover,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    modalBody: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 30,
    },
    inputSection: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: 8,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.bgElevated,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.borderLight,
        paddingHorizontal: 14,
    },
    textInput: {
        flex: 1,
        height: 50,
        color: colors.textPrimary,
        fontSize: 15,
        fontWeight: '600',
    },
    clearInputBtn: {
        padding: 4,
    },
    sectionMiniLabel: {
        fontSize: 12,
        fontWeight: '800',
        color: colors.textMuted,
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    chipsSection: {
        marginBottom: 20,
    },
    chipsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    chipButton: {
        backgroundColor: colors.bgGlass,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.borderSubtle,
    },
    chipText: {
        color: colors.textSecondary,
        fontSize: 13,
        fontWeight: '600',
    },
    vibeSection: {
        marginBottom: 20,
    },
    vibeRow: {
        flexDirection: 'row',
        gap: 8,
    },
    vibePill: {
        flex: 1,
        backgroundColor: colors.bgGlass,
        paddingVertical: 10,
        borderRadius: 14,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.borderSubtle,
    },
    vibePillActive: {
        backgroundColor: 'rgba(121, 82, 255, 0.25)',
        borderColor: colors.primary,
    },
    vibePillText: {
        fontSize: 11,
        fontWeight: '600',
        color: colors.textMuted,
    },
    vibePillTextActive: {
        color: colors.textPrimary,
        fontWeight: '800',
    },
    countSection: {
        marginBottom: 20,
    },
    countRow: {
        flexDirection: 'row',
        gap: 8,
    },
    countPill: {
        flex: 1,
        backgroundColor: colors.bgGlass,
        paddingVertical: 10,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.borderSubtle,
    },
    countPillActive: {
        backgroundColor: 'rgba(0, 240, 255, 0.15)',
        borderColor: colors.cyan,
    },
    countPillText: {
        fontSize: 12,
        color: colors.textMuted,
        fontWeight: '600',
    },
    countPillTextActive: {
        color: colors.cyan,
        fontWeight: '800',
    },
    loadingContainer: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    loadingOrb: {
        width: 80,
        height: 80,
        borderRadius: 40,
        padding: 2,
    },
    orbGradient: {
        flex: 1,
        borderRadius: 38,
        padding: 2,
    },
    orbInner: {
        flex: 1,
        backgroundColor: colors.bgDeep,
        borderRadius: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingStatusText: {
        color: colors.textPrimary,
        fontSize: 16,
        fontWeight: '800',
        textAlign: 'center',
        marginTop: 18,
    },
    loadingSubtext: {
        color: colors.textMuted,
        fontSize: 12,
        marginTop: 4,
        textAlign: 'center',
    },
    readyContainer: {
        gap: 16,
        paddingVertical: 10,
    },
    previewCardHeader: {
        borderRadius: 18,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.borderLight,
    },
    previewHeaderGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 12,
    },
    previewIconBox: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    previewIcon: {
        fontSize: 26,
    },
    previewThemeName: {
        fontSize: 18,
        fontWeight: '900',
        color: colors.textPrimary,
    },
    previewMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 4,
    },
    wordsCountTag: {
        backgroundColor: 'rgba(0, 240, 255, 0.15)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    wordsCountTagText: {
        fontSize: 11,
        color: colors.cyan,
        fontWeight: '700',
    },
    readyBadge: {
        fontSize: 11,
        color: colors.success,
        fontWeight: '700',
    },
    secretShieldCard: {
        borderRadius: 18,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(0, 240, 255, 0.25)',
    },
    secretShieldGradient: {
        padding: 20,
        alignItems: 'center',
    },
    secretShieldIconCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(0, 240, 255, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(0, 240, 255, 0.3)',
    },
    secretShieldTitle: {
        fontSize: 13,
        fontWeight: '900',
        color: colors.cyan,
        letterSpacing: 2,
        marginBottom: 8,
    },
    secretShieldDescription: {
        fontSize: 13,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 18,
    },
    modalFooter: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: colors.borderSubtle,
        backgroundColor: colors.bgDeep,
    },
    generateButton: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    generateButtonDisabled: {
        opacity: 0.5,
    },
    generateButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
    },
    generateButtonText: {
        fontSize: 16,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: 0.5,
    },
    actionButtonsRow: {
        flexDirection: 'row',
        gap: 10,
    },
    secondaryRegenBtn: {
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
    secondaryRegenText: {
        color: colors.textPrimary,
        fontSize: 14,
        fontWeight: '700',
    },
    primaryPlayBtn: {
        flex: 1.6,
        borderRadius: 16,
        overflow: 'hidden',
    },
    primaryPlayGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
    },
    primaryPlayText: {
        color: '#07080C',
        fontSize: 15,
        fontWeight: '900',
    },
});
