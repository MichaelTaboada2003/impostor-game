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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { aiThemeService, AI_SUGGESTION_CHIPS, GenerateThemeOptions } from '../services/aiThemeService';
import { Theme, WordEntry } from '../types/game';
import { colors } from '../styles/colors';

interface AIThemeModalProps {
    visible: boolean;
    onClose: () => void;
    onThemeCreatedAndSelect: (theme: Theme) => void;
}

const LOADING_MESSAGES = [
    '⚡ Conectando con Groq IA ultra-rápida...',
    '🧠 Creando lista de palabras exclusivas...',
    '🔍 Diseñando pistas sutiles para el impostor...',
    '🎭 Balanceando palabras para el modo Undercover...',
    '✨ ¡Casi listo para jugar!',
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
                    Animated.timing(pulseAnim, { toValue: 1.1, duration: 800, useNativeDriver: true }),
                    Animated.timing(pulseAnim, { toValue: 0.95, duration: 800, useNativeDriver: true }),
                ])
            ).start();

            return () => clearInterval(interval);
        } else {
            pulseAnim.setValue(1);
        }
    }, [isLoading]);

    const handleGenerate = async (selectedTopic?: string) => {
        const query = (selectedTopic || topic).trim();
        if (!query) {
            Alert.alert('Tema Requerido', 'Por favor escribe un tema o elige una de las sugerencias rápidas.');
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
            setGeneratedTheme(theme);
        } catch (error: any) {
            Alert.alert(
                'Error de Generación',
                error.message || 'No pudimos generar el tema. Verifica tu conexión e intenta de nuevo.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleUseTheme = () => {
        if (generatedTheme) {
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

    const removeWord = (indexToRemove: number) => {
        if (!generatedTheme) return;
        const updatedWords = generatedTheme.words.filter((_, i) => i !== indexToRemove);
        setGeneratedTheme({
            ...generatedTheme,
            words: updatedWords,
        });
    };

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
                <View style={styles.modalContainer}>
                    <LinearGradient
                        colors={['#1c1c38', '#101026', '#090918']}
                        style={styles.modalGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        {/* Header */}
                        <View style={styles.modalHeader}>
                            <View style={styles.headerTitleRow}>
                                <LinearGradient
                                    colors={['#6C5CE7', '#FD79A8']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.aiBadgeIcon}
                                >
                                    <Text style={styles.aiBadgeIconText}>🤖</Text>
                                </LinearGradient>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.modalTitle}>Crear Temática con IA</Text>
                                    <Text style={styles.modalSubtitle}>
                                        Escribe cualquier tema y la IA construirá palabras y pistas
                                    </Text>
                                </View>
                            </View>

                            <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
                                <Text style={styles.closeBtnText}>✕</Text>
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
                                        <Text style={styles.inputLabel}>¿Sobre qué tema quieres jugar?</Text>
                                        <View style={styles.inputWrapper}>
                                            <TextInput
                                                style={styles.textInput}
                                                placeholder="Ej. Reggaeton 2000s, Marvel, Comida Mexicana..."
                                                placeholderTextColor="rgba(255, 255, 255, 0.35)"
                                                value={topic}
                                                onChangeText={setTopic}
                                                maxLength={60}
                                                returnKeyType="done"
                                                onSubmitEditing={() => handleGenerate()}
                                            />
                                            {topic.length > 0 && (
                                                <TouchableOpacity onPress={() => setTopic('')} style={styles.clearInputBtn}>
                                                    <Text style={styles.clearInputText}>✕</Text>
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    </View>

                                    {/* Quick Suggestions Chips */}
                                    <View style={styles.chipsSection}>
                                        <Text style={styles.sectionMiniLabel}>💡 O elige una idea popular:</Text>
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
                                        <Text style={styles.sectionMiniLabel}>🎭 Tono de la partida:</Text>
                                        <View style={styles.vibeRow}>
                                            {[
                                                { key: 'casual', label: '🎉 Casual' },
                                                { key: 'experto', label: '🧠 Experto' },
                                                { key: 'picante', label: '🌶️ Fiesta' },
                                                { key: 'familiar', label: '👶 Familiar' },
                                            ].map(item => (
                                                <TouchableOpacity
                                                    key={item.key}
                                                    style={[
                                                        styles.vibePill,
                                                        vibe === item.key && styles.vibePillActive,
                                                    ]}
                                                    onPress={() => setVibe(item.key as any)}
                                                >
                                                    <Text
                                                        style={[
                                                            styles.vibePillText,
                                                            vibe === item.key && styles.vibePillTextActive,
                                                        ]}
                                                    >
                                                        {item.label}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>

                                    {/* Word Count */}
                                    <View style={styles.countSection}>
                                        <Text style={styles.sectionMiniLabel}>🔢 Cantidad de palabras:</Text>
                                        <View style={styles.countRow}>
                                            {[12, 18, 25].map(cnt => (
                                                <TouchableOpacity
                                                    key={cnt}
                                                    style={[
                                                        styles.countPill,
                                                        wordCount === cnt && styles.countPillActive,
                                                    ]}
                                                    onPress={() => setWordCount(cnt)}
                                                >
                                                    <Text
                                                        style={[
                                                            styles.countPillText,
                                                            wordCount === cnt && styles.countPillTextActive,
                                                        ]}
                                                    >
                                                        {cnt} palabras
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
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
                                            { transform: [{ scale: pulseAnim }] },
                                        ]}
                                    >
                                        <LinearGradient
                                            colors={['#6C5CE7', '#00CEC9', '#FD79A8']}
                                            style={styles.orbGradient}
                                        >
                                            <Text style={styles.loadingEmoji}>✨</Text>
                                        </LinearGradient>
                                    </Animated.View>

                                    <ActivityIndicator size="large" color="#00CEC9" style={{ marginTop: 24 }} />
                                    <Text style={styles.loadingStatusText}>
                                        {LOADING_MESSAGES[loadingMsgIndex]}
                                    </Text>
                                    <Text style={styles.loadingSubtext}>
                                        Generando temática inteligente con Groq LLM
                                    </Text>
                                </View>
                            )}

                            {/* Preview State */}
                            {generatedTheme && !isLoading && (
                                <View style={styles.previewContainer}>
                                    <View style={styles.previewCardHeader}>
                                        <LinearGradient
                                            colors={[`${generatedTheme.color}60`, `${generatedTheme.color}20`]}
                                            style={styles.previewHeaderGradient}
                                        >
                                            <View style={[styles.previewIconBox, { backgroundColor: `${generatedTheme.color}50` }]}>
                                                <Text style={styles.previewIcon}>{generatedTheme.icon}</Text>
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.previewThemeName}>{generatedTheme.name}</Text>
                                                <Text style={styles.previewBadge}>
                                                    ✨ {generatedTheme.words.length} palabras generadas
                                                </Text>
                                            </View>
                                        </LinearGradient>
                                    </View>

                                    <Text style={styles.wordsPreviewLabel}>
                                        Palabras y Pistas generadas para el Impostor:
                                    </Text>

                                    <View style={styles.wordsList}>
                                        {generatedTheme.words.map((item, idx) => (
                                            <View key={idx} style={styles.wordItemRow}>
                                                <View style={styles.wordNumberBadge}>
                                                    <Text style={styles.wordNumberText}>{idx + 1}</Text>
                                                </View>
                                                <View style={styles.wordDetails}>
                                                    <Text style={styles.wordTitle}>{item.word}</Text>
                                                    {item.hint ? (
                                                        <Text style={styles.wordHint}>
                                                            💡 Pista: <Text style={{ color: '#F1C40F' }}>{item.hint}</Text>
                                                        </Text>
                                                    ) : null}
                                                </View>
                                                <TouchableOpacity
                                                    onPress={() => removeWord(idx)}
                                                    style={styles.deleteWordBtn}
                                                >
                                                    <Text style={styles.deleteWordText}>✕</Text>
                                                </TouchableOpacity>
                                            </View>
                                        ))}
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
                                                ? ['#6C5CE7', '#FD79A8', '#00CEC9']
                                                : ['#3A3A55', '#2A2A40']
                                        }
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={styles.generateButtonGradient}
                                    >
                                        <Text style={styles.generateButtonText}>
                                            ⚡ Generar Temática con IA
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
                                        <Text style={styles.secondaryRegenText}>🔄 Regenerar</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.primaryPlayBtn}
                                        onPress={handleUseTheme}
                                        activeOpacity={0.8}
                                    >
                                        <LinearGradient
                                            colors={['#00B894', '#00CEC9']}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                            style={styles.primaryPlayGradient}
                                        >
                                            <Text style={styles.primaryPlayText}>🎮 Jugar con este Tema</Text>
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
    modalContainer: {
        height: '92%',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    modalGradient: {
        flex: 1,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    },
    headerTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        flex: 1,
    },
    aiBadgeIcon: {
        width: 46,
        height: 46,
        borderRadius: 23,
        justifyContent: 'center',
        alignItems: 'center',
    },
    aiBadgeIconText: {
        fontSize: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: '#FFFFFF',
    },
    modalSubtitle: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.6)',
        marginTop: 2,
    },
    closeBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
    },
    closeBtnText: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.7)',
        fontWeight: '700',
    },
    modalBody: {
        flex: 1,
    },
    scrollContent: {
        padding: 24,
        paddingBottom: 40,
    },
    inputSection: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 15,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 10,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.07)',
        borderRadius: 18,
        borderWidth: 1.5,
        borderColor: 'rgba(108, 92, 231, 0.4)',
        paddingHorizontal: 16,
    },
    textInput: {
        flex: 1,
        height: 54,
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    clearInputBtn: {
        padding: 6,
    },
    clearInputText: {
        color: 'rgba(255, 255, 255, 0.4)',
        fontSize: 14,
    },
    sectionMiniLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: 'rgba(255, 255, 255, 0.7)',
        marginBottom: 10,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    chipsSection: {
        marginBottom: 22,
    },
    chipsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    chipButton: {
        backgroundColor: 'rgba(108, 92, 231, 0.15)',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(108, 92, 231, 0.3)',
    },
    chipText: {
        color: '#FFFFFF',
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
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        paddingVertical: 12,
        borderRadius: 14,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    vibePillActive: {
        backgroundColor: 'rgba(108, 92, 231, 0.3)',
        borderColor: '#6C5CE7',
    },
    vibePillText: {
        fontSize: 12,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.6)',
    },
    vibePillTextActive: {
        color: '#FFFFFF',
        fontWeight: '800',
    },
    countSection: {
        marginBottom: 20,
    },
    countRow: {
        flexDirection: 'row',
        gap: 10,
    },
    countPill: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        paddingVertical: 12,
        borderRadius: 14,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    countPillActive: {
        backgroundColor: 'rgba(0, 206, 201, 0.25)',
        borderColor: '#00CEC9',
    },
    countPillText: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.6)',
        fontWeight: '600',
    },
    countPillTextActive: {
        color: '#00CEC9',
        fontWeight: '800',
    },
    loadingContainer: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    loadingOrb: {
        width: 100,
        height: 100,
        borderRadius: 50,
        overflow: 'hidden',
    },
    orbGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingEmoji: {
        fontSize: 48,
    },
    loadingStatusText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '700',
        textAlign: 'center',
        marginTop: 16,
    },
    loadingSubtext: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 13,
        marginTop: 6,
        textAlign: 'center',
    },
    previewContainer: {
        gap: 14,
    },
    previewCardHeader: {
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    previewHeaderGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 14,
    },
    previewIconBox: {
        width: 52,
        height: 52,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    previewIcon: {
        fontSize: 28,
    },
    previewThemeName: {
        fontSize: 20,
        fontWeight: '900',
        color: '#FFFFFF',
    },
    previewBadge: {
        fontSize: 12,
        color: '#00CEC9',
        fontWeight: '700',
        marginTop: 2,
    },
    wordsPreviewLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 6,
    },
    wordsList: {
        gap: 8,
    },
    wordItemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 14,
        padding: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.07)',
    },
    wordNumberBadge: {
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: 'rgba(108, 92, 231, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    wordNumberText: {
        color: '#A29BFE',
        fontSize: 12,
        fontWeight: '800',
    },
    wordDetails: {
        flex: 1,
    },
    wordTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    wordHint: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.5)',
        marginTop: 2,
    },
    deleteWordBtn: {
        padding: 8,
    },
    deleteWordText: {
        color: 'rgba(255, 71, 87, 0.8)',
        fontSize: 16,
        fontWeight: '700',
    },
    modalFooter: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.08)',
        backgroundColor: 'rgba(10, 10, 26, 0.95)',
    },
    generateButton: {
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#6C5CE7',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
        elevation: 8,
    },
    generateButtonDisabled: {
        opacity: 0.6,
        shadowOpacity: 0,
        elevation: 0,
    },
    generateButtonGradient: {
        paddingVertical: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    generateButtonText: {
        fontSize: 18,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: 0.5,
    },
    actionButtonsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    secondaryRegenBtn: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingVertical: 16,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    secondaryRegenText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    },
    primaryPlayBtn: {
        flex: 2,
        borderRadius: 18,
        overflow: 'hidden',
    },
    primaryPlayGradient: {
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryPlayText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '800',
    },
});
