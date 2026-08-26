import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Animated,
    Dimensions,
    TextInput,
    Vibration,
    Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useGame } from '../context/GameContext';
import { AIThemeModal } from '../components/AIThemeModal';
import { Theme } from '../types/game';
import { colors, gradients } from '../styles/colors';

const { width } = Dimensions.get('window');
// El ancho de tarjeta se deriva del padding y el gap reales del grid: dos
// tarjetas mas un gap deben caber exactos en el ancho disponible, o flexWrap
// baja la segunda y deja una sola por fila.
const GRID_H_PADDING = 20;
const CARD_GAP = 10;
const CARD_WIDTH = Math.floor((width - GRID_H_PADDING * 2 - CARD_GAP) / 2);

interface ThemeSelectionScreenProps {
    onBack: () => void;
    onNext: () => void;
}

const CATEGORY_TABS = [
    { id: 'all', label: 'Todos', icon: 'apps-outline' },
    { id: 'ai', label: 'Mis Temas IA', icon: 'sparkles-outline' },
    { id: 'popular', label: 'Populares', icon: 'flame-outline' },
    { id: 'entertainment', label: 'Cultura Pop', icon: 'film-outline' },
    { id: 'culture', label: 'Sociedad', icon: 'earth-outline' },
    { id: 'local', label: 'Colombia / Caribe', icon: 'musical-notes-outline' },
];

export const ThemeSelectionScreen: React.FC<ThemeSelectionScreenProps> = ({
    onBack,
    onNext,
}) => {
    const {
        gameState,
        selectTheme,
        allThemes,
        customThemes,
        addCustomTheme,
        deleteCustomTheme,
    } = useGame();

    const [selectedThemeId, setSelectedThemeId] = useState<string | null>(
        gameState.config.themeId || null
    );
    const [selectedTab, setSelectedTab] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [showAIModal, setShowAIModal] = useState<boolean>(false);
    const [deletingTheme, setDeletingTheme] = useState<{ id: string; name: string } | null>(null);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const headerAnim = useRef(new Animated.Value(-15)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
            Animated.spring(headerAnim, { toValue: 0, friction: 8, tension: 50, useNativeDriver: true }),
        ]).start();
    }, []);

    const filteredThemes = allThemes.filter((theme) => {
        if (selectedTab === 'ai') {
            if (!theme.isAiGenerated && !customThemes.some(ct => ct.id === theme.id)) return false;
        } else if (selectedTab === 'popular') {
            if (!['animales', 'comidas', 'peliculas', 'deportes', 'videojuegos'].includes(theme.id)) return false;
        } else if (selectedTab === 'entertainment') {
            if (!['peliculas', 'videojuegos', 'musica', 'superheroes'].includes(theme.id)) return false;
        } else if (selectedTab === 'culture') {
            if (!['paises', 'profesiones', 'lugares', 'objetos', 'ropa', 'biblia'].includes(theme.id)) return false;
        } else if (selectedTab === 'local') {
            if (!['costeno', 'shalom'].includes(theme.id)) return false;
        }

        if (searchQuery.trim().length > 0) {
            const query = searchQuery.toLowerCase();
            const matchesName = theme.name.toLowerCase().includes(query);
            const matchesWords = theme.words.some(w => w.word.toLowerCase().includes(query));
            return matchesName || matchesWords;
        }

        return true;
    });

    const handleSelectTheme = (themeId: string) => {
        Vibration.vibrate(20);
        setSelectedThemeId(themeId);
    };

    const handleConfirm = () => {
        if (selectedThemeId) {
            const themeObj = allThemes.find(t => t.id === selectedThemeId);
            selectTheme(themeObj || selectedThemeId);
            onNext();
        }
    };

    const handleThemeCreatedByAI = async (newTheme: Theme) => {
        const updated = await addCustomTheme(newTheme);
        setSelectedThemeId(newTheme.id);
        selectTheme(newTheme, updated);
        onNext();
    };


    const handleConfirmDelete = () => {
        if (!deletingTheme) return;
        Vibration.vibrate([0, 50, 50, 100]);
        deleteCustomTheme(deletingTheme.id);
        if (selectedThemeId === deletingTheme.id) {
            setSelectedThemeId(null);
        }
        setDeletingTheme(null);
    };

    const selectedThemeObj = allThemes.find(t => t.id === selectedThemeId);

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={gradients.appBackground}
                style={StyleSheet.absoluteFillObject}
            />

            {/* Header */}
            <Animated.View
                style={[
                    styles.header,
                    { opacity: fadeAnim, transform: [{ translateY: headerAnim }] },
                ]}
            >
                <View style={styles.topNavRow}>
                    <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
                        <Ionicons name="arrow-back" size={20} color={colors.textSecondary} />
                        <Text style={styles.backButtonText}>Jugadores</Text>
                    </TouchableOpacity>

                    <View style={styles.headerBadge}>
                        <Text style={styles.headerBadgeText}>
                            {allThemes.length} Temáticas
                        </Text>
                    </View>
                </View>

                <View style={styles.titleSection}>
                    <Text style={styles.title}>Elige la Temática</Text>
                    <Text style={styles.subtitle}>
                        Selecciona el universo de palabras secretas para esta partida
                    </Text>
                </View>
            </Animated.View>

            {/* Main Scroll Content */}
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* AI Theme Generator Banner */}
                <TouchableOpacity
                    style={styles.aiHeroBanner}
                    onPress={() => {
                        Vibration.vibrate(20);
                        setShowAIModal(true);
                    }}
                    activeOpacity={0.85}
                >
                    <LinearGradient
                        colors={['#7952FF', '#FF4D94', '#00F0FF']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.aiHeroGradient}
                    >
                        <View style={styles.aiHeroInner}>
                            <View style={styles.aiHeroIconBox}>
                                <MaterialCommunityIcons name="robot" size={24} color="#FFFFFF" />
                                <View style={styles.aiSparkleBadge}>
                                    <Text style={styles.aiSparkleText}>IA</Text>
                                </View>
                            </View>

                            <View style={styles.aiHeroContent}>
                                <View style={styles.aiHeroBadgeRow}>
                                    <Text style={styles.aiHeroBadge}>CREADOR MÁGICO</Text>
                                </View>
                                <Text style={styles.aiHeroTitle}>Crear Temática con IA</Text>
                                <Text style={styles.aiHeroSubtitle}>
                                    Genera palabras y pistas sobre cualquier tema al instante
                                </Text>
                            </View>

                            <View style={styles.aiHeroArrow}>
                                <Ionicons name="flash" size={16} color={colors.cyan} />
                            </View>
                        </View>
                    </LinearGradient>
                </TouchableOpacity>

                {/* Search Bar */}
                <View style={styles.searchWrapper}>
                    <Ionicons name="search-outline" size={18} color={colors.textMuted} style={{ marginRight: 8 }} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Buscar temática o palabra..."
                        placeholderTextColor={colors.textMuted}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.searchClearBtn}>
                            <Ionicons name="close-circle" size={16} color={colors.textMuted} />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Category Pills */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.tabsRow}
                >
                    {CATEGORY_TABS.map(tab => {
                        const isActive = selectedTab === tab.id;
                        return (
                            <TouchableOpacity
                                key={tab.id}
                                style={[
                                    styles.tabPill,
                                    isActive && styles.tabPillActive,
                                ]}
                                onPress={() => {
                                    Vibration.vibrate(10);
                                    setSelectedTab(tab.id);
                                }}
                                activeOpacity={0.75}
                            >
                                <Ionicons
                                    name={tab.icon as any}
                                    size={14}
                                    color={isActive ? '#FFFFFF' : colors.textMuted}
                                    style={{ marginRight: 6 }}
                                />
                                <Text
                                    style={[
                                        styles.tabPillText,
                                        isActive && styles.tabPillTextActive,
                                    ]}
                                >
                                    {tab.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                {/* Themes Grid */}
                <View style={styles.themesGrid}>
                    {filteredThemes.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Ionicons name="search-outline" size={40} color={colors.textDisabled} />
                            <Text style={styles.emptyTitle}>No encontramos temáticas</Text>
                            <Text style={styles.emptySubtitle}>
                                Intenta con otro término o crea una personalizada con IA
                            </Text>
                            <TouchableOpacity
                                style={styles.emptyCreateBtn}
                                onPress={() => setShowAIModal(true)}
                            >
                                <MaterialCommunityIcons name="robot" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                                <Text style={styles.emptyCreateText}>Crear con IA</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        filteredThemes.map((theme) => {
                            const isSelected = selectedThemeId === theme.id;
                            const isCustom = theme.isAiGenerated || customThemes.some(ct => ct.id === theme.id);

                            return (
                                <View key={theme.id} style={styles.themeCardContainer}>
                                    <TouchableOpacity
                                        style={[
                                            styles.themeCard,
                                            isSelected && styles.themeCardSelected,
                                        ]}
                                        onPress={() => handleSelectTheme(theme.id)}
                                        activeOpacity={0.8}
                                    >
                                        <LinearGradient
                                            colors={
                                                isSelected
                                                    ? [`${theme.color}45`, 'rgba(255, 255, 255, 0.04)']
                                                    : gradients.cardGlass
                                            }
                                            style={styles.themeCardGradient}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 1 }}
                                        >
                                            {isCustom && (
                                                <View style={styles.customThemeBadge}>
                                                    <Text style={styles.customThemeBadgeText}>IA</Text>
                                                </View>
                                            )}

                                            <View
                                                style={[
                                                    styles.iconContainer,
                                                    { backgroundColor: `${theme.color}25` },
                                                ]}
                                            >
                                                <Text style={styles.themeIcon}>{theme.icon}</Text>
                                            </View>

                                            <Text
                                                style={[
                                                    styles.themeName,
                                                    isSelected && { color: theme.color },
                                                ]}
                                                numberOfLines={1}
                                            >
                                                {theme.name}
                                            </Text>

                                            <View style={styles.wordCountBadge}>
                                                <Text style={styles.themeWordCount}>
                                                    {theme.words.length} palabras
                                                </Text>
                                            </View>

                                            {isSelected && (
                                                <View
                                                    style={[
                                                        styles.selectedBadge,
                                                        { backgroundColor: theme.color },
                                                    ]}
                                                >
                                                    <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                                                </View>
                                            )}

                                            {isSelected && (
                                                <View
                                                    style={[
                                                        styles.selectedBorder,
                                                        { borderColor: theme.color },
                                                    ]}
                                                />
                                            )}
                                        </LinearGradient>
                                    </TouchableOpacity>

                                    {/* Dedicated Delete Button for Custom Themes */}
                                    {isCustom && (
                                        <TouchableOpacity
                                            style={styles.deleteCustomBtn}
                                            onPress={() => {
                                                Vibration.vibrate(15);
                                                setDeletingTheme({ id: theme.id, name: theme.name });
                                            }}
                                            activeOpacity={0.7}
                                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                        >
                                            <View style={styles.deleteCustomInner}>
                                                <Ionicons name="trash" size={14} color={colors.impostor} />
                                            </View>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            );
                        })
                    )}
                </View>
            </ScrollView>

            {/* Fixed Bottom CTA Bar */}
            {selectedThemeId && (
                <View style={styles.bottomBar}>
                    <TouchableOpacity
                        style={styles.confirmButton}
                        onPress={handleConfirm}
                        activeOpacity={0.85}
                    >
                        <LinearGradient
                            colors={[selectedThemeObj?.color || '#7952FF', '#7952FF']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.confirmButtonGradient}
                        >
                            <Text style={styles.confirmButtonText}>
                                Iniciar con {selectedThemeObj?.name}
                            </Text>
                            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            )}

            {/* AI Theme Modal */}
            <AIThemeModal
                visible={showAIModal}
                onClose={() => setShowAIModal(false)}
                onThemeCreatedAndSelect={handleThemeCreatedByAI}
            />

            {/* Delete Theme Confirmation Modal */}
            <Modal
                visible={deletingTheme !== null}
                transparent
                animationType="fade"
                onRequestClose={() => setDeletingTheme(null)}
            >
                <View style={styles.deleteModalOverlay}>
                    <View style={styles.deleteModalCard}>
                        <LinearGradient
                            colors={gradients.sheetGlass}
                            style={styles.deleteModalGradient}
                        >
                            <View style={styles.deleteIconCircle}>
                                <Ionicons name="trash-outline" size={32} color={colors.impostor} />
                            </View>

                            <Text style={styles.deleteModalTitle}>¿Eliminar Temática?</Text>
                            <Text style={styles.deleteModalDescription}>
                                ¿Deseas eliminar permanentemente "{deletingTheme?.name}" de tus temas personalizados de IA?
                            </Text>

                            <View style={styles.deleteModalActionsRow}>
                                <TouchableOpacity
                                    style={styles.cancelDeleteModalBtn}
                                    onPress={() => setDeletingTheme(null)}
                                    activeOpacity={0.8}
                                >
                                    <Text style={styles.cancelDeleteModalText}>Cancelar</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.confirmDeleteModalBtn}
                                    onPress={handleConfirmDelete}
                                    activeOpacity={0.85}
                                >
                                    <LinearGradient
                                        colors={['#FF2A55', '#D6133C']}
                                        style={styles.confirmDeleteModalGradient}
                                    >
                                        <Text style={styles.confirmDeleteModalText}>Sí, Eliminar</Text>
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
    header: {
        paddingTop: 54,
        paddingHorizontal: 20,
        paddingBottom: 12,
    },
    topNavRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 4,
    },
    backButtonText: {
        color: colors.textSecondary,
        fontSize: 14,
        fontWeight: '700',
    },
    headerBadge: {
        backgroundColor: colors.bgGlassHover,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.borderSubtle,
    },
    headerBadgeText: {
        color: colors.cyan,
        fontSize: 12,
        fontWeight: '800',
    },
    titleSection: {
        gap: 4,
    },
    title: {
        fontSize: 26,
        fontWeight: '900',
        color: colors.textPrimary,
        letterSpacing: 0.3,
    },
    subtitle: {
        fontSize: 13,
        color: colors.textMuted,
        lineHeight: 18,
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: GRID_H_PADDING,
        paddingBottom: 100,
    },
    aiHeroBanner: {
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 14,
    },
    aiHeroGradient: {
        padding: 2,
    },
    aiHeroInner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.bgCard,
        borderRadius: 18,
        padding: 14,
        gap: 12,
    },
    aiHeroIconBox: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: 'rgba(121, 82, 255, 0.25)',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    aiSparkleBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: colors.aiPink,
        borderRadius: 6,
        paddingHorizontal: 4,
        paddingVertical: 1,
    },
    aiSparkleText: {
        fontSize: 8,
        fontWeight: '900',
        color: '#FFFFFF',
    },
    aiHeroContent: {
        flex: 1,
    },
    aiHeroBadgeRow: {
        flexDirection: 'row',
        marginBottom: 2,
    },
    aiHeroBadge: {
        fontSize: 9,
        fontWeight: '900',
        color: colors.cyan,
        letterSpacing: 1,
    },
    aiHeroTitle: {
        fontSize: 15,
        fontWeight: '800',
        color: colors.textPrimary,
    },
    aiHeroSubtitle: {
        fontSize: 11,
        color: colors.textMuted,
        marginTop: 1,
    },
    aiHeroArrow: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.bgGlassHover,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.bgCard,
        borderRadius: 14,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: colors.borderSubtle,
        marginBottom: 12,
        height: 44,
    },
    searchInput: {
        flex: 1,
        color: colors.textPrimary,
        fontSize: 14,
        fontWeight: '600',
    },
    searchClearBtn: {
        padding: 4,
    },
    tabsRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 14,
        paddingRight: 20,
    },
    tabPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.bgCard,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.borderSubtle,
    },
    tabPillActive: {
        backgroundColor: 'rgba(121, 82, 255, 0.25)',
        borderColor: colors.primary,
    },
    tabPillText: {
        color: colors.textMuted,
        fontSize: 12,
        fontWeight: '700',
    },
    tabPillTextActive: {
        color: colors.textPrimary,
        fontWeight: '900',
    },
    themesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        gap: CARD_GAP,
    },
    themeCardContainer: {
        width: CARD_WIDTH,
        position: 'relative',
    },
    themeCard: {
        borderRadius: 18,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.borderSubtle,
    },
    themeCardSelected: {
        borderWidth: 0,
    },
    themeCardGradient: {
        padding: 14,
        alignItems: 'center',
        minHeight: 145,
        justifyContent: 'center',
        position: 'relative',
    },
    customThemeBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: 'rgba(0, 240, 255, 0.2)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    customThemeBadgeText: {
        fontSize: 9,
        color: colors.cyan,
        fontWeight: '900',
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    themeIcon: {
        fontSize: 26,
    },
    themeName: {
        fontSize: 14,
        fontWeight: '800',
        color: colors.textPrimary,
        textAlign: 'center',
        marginBottom: 4,
    },
    wordCountBadge: {
        backgroundColor: colors.bgGlassHover,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    themeWordCount: {
        fontSize: 10,
        color: colors.textMuted,
        fontWeight: '600',
    },
    selectedBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 22,
        height: 22,
        borderRadius: 11,
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedBorder: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 18,
        borderWidth: 2,
    },
    deleteCustomBtn: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        zIndex: 30,
        elevation: 30,
    },
    deleteCustomInner: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(255, 42, 85, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 42, 85, 0.4)',
    },
    emptyState: {
        width: '100%',
        alignItems: 'center',
        paddingVertical: 36,
        gap: 8,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: colors.textPrimary,
    },
    emptySubtitle: {
        fontSize: 12,
        color: colors.textMuted,
        textAlign: 'center',
        marginBottom: 10,
    },
    emptyCreateBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
    },
    emptyCreateText: {
        fontSize: 13,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 34,
        backgroundColor: 'rgba(7, 8, 12, 0.95)',
        borderTopWidth: 1,
        borderTopColor: colors.borderSubtle,
    },
    confirmButton: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    confirmButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
    },
    confirmButtonText: {
        fontSize: 16,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: 0.3,
    },
    deleteModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.88)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    deleteModalCard: {
        width: '100%',
        maxWidth: 340,
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.borderLight,
    },
    deleteModalGradient: {
        padding: 24,
        alignItems: 'center',
    },
    deleteIconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(255, 42, 85, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 14,
        borderWidth: 1,
        borderColor: 'rgba(255, 42, 85, 0.3)',
    },
    deleteModalTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: colors.textPrimary,
        marginBottom: 8,
    },
    deleteModalDescription: {
        fontSize: 13,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 18,
        marginBottom: 20,
    },
    deleteModalActionsRow: {
        flexDirection: 'row',
        gap: 10,
        width: '100%',
    },
    cancelDeleteModalBtn: {
        flex: 1,
        backgroundColor: colors.bgGlassHover,
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.borderLight,
    },
    cancelDeleteModalText: {
        color: colors.textSecondary,
        fontWeight: '800',
        fontSize: 14,
    },
    confirmDeleteModalBtn: {
        flex: 1.4,
        borderRadius: 14,
        overflow: 'hidden',
    },
    confirmDeleteModalGradient: {
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    confirmDeleteModalText: {
        color: '#FFFFFF',
        fontWeight: '900',
        fontSize: 14,
    },
});
