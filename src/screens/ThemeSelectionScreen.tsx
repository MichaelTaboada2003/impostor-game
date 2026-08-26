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
    Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGame } from '../context/GameContext';
import { Theme } from '../types/game';
import { AIThemeModal } from '../components/AIThemeModal';
import { colors } from '../styles/colors';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 64) / 2;

interface ThemeSelectionScreenProps {
    onBack: () => void;
    onNext: () => void;
}

const CATEGORY_TABS = [
    { id: 'all', label: '✨ Todos' },
    { id: 'ai', label: '🤖 IA & Mis Temas' },
    { id: 'popular', label: '🔥 Populares' },
    { id: 'entertainment', label: '🎬 Entretenimiento' },
    { id: 'culture', label: '🧠 Cultura' },
    { id: 'local', label: '🌴 Caribe' },
];

export const ThemeSelectionScreen: React.FC<ThemeSelectionScreenProps> = ({
    onBack,
    onNext,
}) => {
    const {
        selectTheme,
        allThemes,
        customThemes,
        addCustomTheme,
        deleteCustomTheme,
    } = useGame();

    const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null);
    const [selectedTab, setSelectedTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [showAIModal, setShowAIModal] = useState(false);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const headerAnim = useRef(new Animated.Value(-20)).current;
    const heroGlowAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
            Animated.spring(headerAnim, { toValue: 0, friction: 8, tension: 50, useNativeDriver: true }),
        ]).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(heroGlowAnim, { toValue: 1, duration: 1800, useNativeDriver: true }),
                Animated.timing(heroGlowAnim, { toValue: 0.2, duration: 1800, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    // Filter themes
    const filteredThemes = allThemes.filter((theme) => {
        // Tab filtering
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

        // Search query filtering
        if (searchQuery.trim().length > 0) {
            const query = searchQuery.toLowerCase();
            const matchesName = theme.name.toLowerCase().includes(query);
            const matchesWords = theme.words.some(w => w.word.toLowerCase().includes(query));
            return matchesName || matchesWords;
        }

        return true;
    });

    const handleSelectTheme = (themeId: string) => {
        setSelectedThemeId(themeId);
    };

    const handleConfirm = () => {
        if (selectedThemeId) {
            selectTheme(selectedThemeId);
            onNext();
        }
    };

    const handleThemeCreatedByAI = (newTheme: Theme) => {
        addCustomTheme(newTheme);
        setSelectedThemeId(newTheme.id);
        // Automatically proceed or select
        selectTheme(newTheme.id);
        onNext();
    };

    const handleDeleteCustomTheme = (themeId: string, themeName: string) => {
        Alert.alert(
            'Eliminar Temática',
            `¿Deseas eliminar "${themeName}" de tus temas personalizados?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: () => {
                        deleteCustomTheme(themeId);
                        if (selectedThemeId === themeId) {
                            setSelectedThemeId(null);
                        }
                    },
                },
            ]
        );
    };

    const selectedThemeObj = allThemes.find(t => t.id === selectedThemeId);

    return (
        <LinearGradient
            colors={['#0a0a1a', '#141432', '#0a0a1a']}
            style={styles.container}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            <View style={styles.bgCircle1} />
            <View style={styles.bgCircle2} />

            {/* Header */}
            <Animated.View
                style={[
                    styles.header,
                    { opacity: fadeAnim, transform: [{ translateY: headerAnim }] },
                ]}
            >
                <TouchableOpacity style={styles.backButton} onPress={onBack}>
                    <View style={styles.backButtonInner}>
                        <Text style={styles.backButtonIcon}>←</Text>
                        <Text style={styles.backButtonText}>Atrás</Text>
                    </View>
                </TouchableOpacity>

                <View style={styles.titleContainer}>
                    <Text style={styles.title}>Elige una Temática</Text>
                    <Text style={styles.subtitle}>
                        Selecciona o crea con IA la categoría de palabras para esta partida
                    </Text>
                </View>
            </Animated.View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* HERO: Crear con IA Card */}
                <TouchableOpacity
                    style={styles.aiHeroCard}
                    onPress={() => setShowAIModal(true)}
                    activeOpacity={0.85}
                >
                    <LinearGradient
                        colors={['#6C5CE7', '#FD79A8', '#00CEC9']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.aiHeroGradient}
                    >
                        <View style={styles.aiHeroInner}>
                            <View style={styles.aiHeroIconBox}>
                                <Text style={styles.aiHeroIcon}>🤖</Text>
                                <View style={styles.aiSparkleBadge}>
                                    <Text style={styles.aiSparkleText}>IA</Text>
                                </View>
                            </View>

                            <View style={styles.aiHeroContent}>
                                <View style={styles.aiHeroBadgeRow}>
                                    <Text style={styles.aiHeroBadge}>NUEVO · CREADOR MÁGICO</Text>
                                </View>
                                <Text style={styles.aiHeroTitle}>Crear Temática con IA</Text>
                                <Text style={styles.aiHeroSubtitle}>
                                    Escribe cualquier tema (anime, series, cocina, oficina...) y la IA creará las palabras y pistas
                                </Text>
                            </View>

                            <View style={styles.aiHeroArrow}>
                                <Text style={styles.aiHeroArrowText}>⚡</Text>
                            </View>
                        </View>
                    </LinearGradient>
                </TouchableOpacity>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <View style={styles.searchWrapper}>
                        <Text style={styles.searchIcon}>🔍</Text>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Buscar temática o palabra..."
                            placeholderTextColor="rgba(255, 255, 255, 0.4)"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.searchClearBtn}>
                                <Text style={styles.searchClearText}>✕</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Category Tabs */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.tabsRow}
                >
                    {CATEGORY_TABS.map(tab => (
                        <TouchableOpacity
                            key={tab.id}
                            style={[
                                styles.tabPill,
                                selectedTab === tab.id && styles.tabPillActive,
                            ]}
                            onPress={() => setSelectedTab(tab.id)}
                        >
                            <Text
                                style={[
                                    styles.tabPillText,
                                    selectedTab === tab.id && styles.tabPillTextActive,
                                ]}
                            >
                                {tab.label}
                                {tab.id === 'ai' && customThemes.length > 0 ? ` (${customThemes.length})` : ''}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Themes Grid */}
                <View style={styles.themesGrid}>
                    {filteredThemes.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyEmoji}>🔍</Text>
                            <Text style={styles.emptyTitle}>No encontramos temáticas</Text>
                            <Text style={styles.emptySubtitle}>
                                ¿Por qué no creas este tema con el Creador de IA?
                            </Text>
                            <TouchableOpacity
                                style={styles.emptyCreateBtn}
                                onPress={() => setShowAIModal(true)}
                            >
                                <Text style={styles.emptyCreateBtnText}>⚡ Crear "{searchQuery}" con IA</Text>
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
                                                    ? [`${theme.color}55`, `${theme.color}20`]
                                                    : ['rgba(255,255,255,0.07)', 'rgba(255,255,255,0.02)']
                                            }
                                            style={styles.themeCardGradient}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 1 }}
                                        >
                                            {/* AI badge if custom */}
                                            {isCustom && (
                                                <View style={styles.customThemeBadge}>
                                                    <Text style={styles.customThemeBadgeText}>✨ IA</Text>
                                                </View>
                                            )}

                                            <View
                                                style={[
                                                    styles.iconContainer,
                                                    { backgroundColor: `${theme.color}35` },
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
                                                    <Text style={styles.selectedBadgeText}>✓</Text>
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

                                            {/* Delete option for custom themes */}
                                            {isCustom && (
                                                <TouchableOpacity
                                                    style={styles.deleteCustomBtn}
                                                    onPress={() => handleDeleteCustomTheme(theme.id, theme.name)}
                                                >
                                                    <Text style={styles.deleteCustomText}>🗑️</Text>
                                                </TouchableOpacity>
                                            )}
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </View>
                            );
                        })
                    )}
                </View>
            </ScrollView>

            {/* Footer with Start Button */}
            {selectedThemeId && (
                <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
                    <LinearGradient
                        colors={['rgba(10, 10, 26, 0)', 'rgba(10, 10, 26, 0.95)', 'rgba(10, 10, 26, 1)']}
                        style={styles.footerGradient}
                    >
                        <TouchableOpacity
                            style={styles.confirmButton}
                            onPress={handleConfirm}
                            activeOpacity={0.85}
                        >
                            <LinearGradient
                                colors={[selectedThemeObj?.color || '#6C5CE7', '#6C5CE7']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.confirmButtonGradient}
                            >
                                <Text style={styles.confirmButtonText}>
                                    Repartir Roles ({selectedThemeObj?.name})
                                </Text>
                                <View style={styles.confirmButtonIconContainer}>
                                    <Text style={styles.confirmButtonIcon}>🎭</Text>
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>
                    </LinearGradient>
                </Animated.View>
            )}

            {/* AI Theme Creator Modal */}
            <AIThemeModal
                visible={showAIModal}
                onClose={() => setShowAIModal(false)}
                onThemeCreatedAndSelect={handleThemeCreatedByAI}
            />
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    bgCircle1: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: '#6C5CE7',
        top: -50,
        right: -50,
        opacity: 0.08,
    },
    bgCircle2: {
        position: 'absolute',
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: '#FD79A8',
        bottom: 200,
        left: -50,
        opacity: 0.08,
    },
    header: {
        paddingTop: 54,
        paddingHorizontal: 22,
        paddingBottom: 14,
    },
    backButton: {
        marginBottom: 12,
    },
    backButtonInner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    backButtonIcon: {
        fontSize: 18,
        color: 'rgba(255, 255, 255, 0.7)',
    },
    backButtonText: {
        fontSize: 15,
        color: 'rgba(255, 255, 255, 0.7)',
    },
    titleContainer: {
        gap: 4,
    },
    title: {
        fontSize: 30,
        fontWeight: '900',
        color: '#FFFFFF',
    },
    subtitle: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.55)',
        lineHeight: 18,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 22,
        paddingBottom: 130,
    },
    aiHeroCard: {
        borderRadius: 24,
        overflow: 'hidden',
        marginBottom: 18,
        shadowColor: '#6C5CE7',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.5,
        shadowRadius: 16,
        elevation: 8,
    },
    aiHeroGradient: {
        padding: 2,
    },
    aiHeroInner: {
        backgroundColor: '#12122b',
        borderRadius: 22,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    aiHeroIconBox: {
        width: 52,
        height: 52,
        borderRadius: 18,
        backgroundColor: 'rgba(108, 92, 231, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    aiHeroIcon: {
        fontSize: 28,
    },
    aiSparkleBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: '#FD79A8',
        paddingHorizontal: 5,
        paddingVertical: 2,
        borderRadius: 8,
    },
    aiSparkleText: {
        fontSize: 9,
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
        fontSize: 10,
        fontWeight: '800',
        color: '#00CEC9',
        letterSpacing: 1,
    },
    aiHeroTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: '#FFFFFF',
    },
    aiHeroSubtitle: {
        fontSize: 11,
        color: 'rgba(255, 255, 255, 0.65)',
        marginTop: 2,
        lineHeight: 15,
    },
    aiHeroArrow: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    aiHeroArrowText: {
        fontSize: 16,
    },
    searchContainer: {
        marginBottom: 14,
    },
    searchWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        borderRadius: 16,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    searchIcon: {
        fontSize: 16,
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        height: 46,
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    searchClearBtn: {
        padding: 4,
    },
    searchClearText: {
        color: 'rgba(255, 255, 255, 0.4)',
        fontSize: 14,
    },
    tabsRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 16,
        paddingRight: 20,
    },
    tabPill: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    tabPillActive: {
        backgroundColor: 'rgba(108, 92, 231, 0.3)',
        borderColor: '#6C5CE7',
    },
    tabPillText: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 12,
        fontWeight: '700',
    },
    tabPillTextActive: {
        color: '#FFFFFF',
        fontWeight: '900',
    },
    themesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 14,
    },
    themeCardContainer: {
        width: CARD_WIDTH,
    },
    themeCard: {
        borderRadius: 22,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    themeCardSelected: {
        borderWidth: 0,
    },
    themeCardGradient: {
        padding: 16,
        alignItems: 'center',
        minHeight: 155,
        justifyContent: 'center',
        position: 'relative',
    },
    customThemeBadge: {
        position: 'absolute',
        top: 10,
        left: 10,
        backgroundColor: 'rgba(0, 206, 201, 0.3)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    customThemeBadgeText: {
        fontSize: 10,
        color: '#00CEC9',
        fontWeight: '800',
    },
    iconContainer: {
        width: 58,
        height: 58,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    themeIcon: {
        fontSize: 32,
    },
    themeName: {
        fontSize: 15,
        fontWeight: '800',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 6,
    },
    wordCountBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
    },
    themeWordCount: {
        fontSize: 10,
        color: 'rgba(255, 255, 255, 0.6)',
        fontWeight: '600',
    },
    selectedBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedBadgeText: {
        fontSize: 12,
        fontWeight: '900',
        color: '#FFFFFF',
    },
    selectedBorder: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 22,
        borderWidth: 2,
    },
    deleteCustomBtn: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        padding: 4,
    },
    deleteCustomText: {
        fontSize: 14,
    },
    emptyState: {
        width: '100%',
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyEmoji: {
        fontSize: 42,
        marginBottom: 8,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    emptySubtitle: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.5)',
        textAlign: 'center',
        marginTop: 4,
        marginBottom: 16,
    },
    emptyCreateBtn: {
        backgroundColor: '#6C5CE7',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 16,
    },
    emptyCreateBtnText: {
        color: '#FFFFFF',
        fontWeight: '800',
        fontSize: 14,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    footerGradient: {
        paddingHorizontal: 22,
        paddingTop: 28,
        paddingBottom: 34,
    },
    confirmButton: {
        borderRadius: 22,
        overflow: 'hidden',
        shadowColor: '#6C5CE7',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 18,
        elevation: 10,
    },
    confirmButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        paddingHorizontal: 28,
        gap: 14,
    },
    confirmButtonText: {
        fontSize: 18,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    confirmButtonIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    confirmButtonIcon: {
        fontSize: 18,
    },
});
