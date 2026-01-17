import React, { useState, useEffect, useRef } from 'react';
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
import { themes } from '../data/themes';
import { colors, gradients } from '../styles/colors';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 72) / 2;

interface ThemeSelectionScreenProps {
    onBack: () => void;
    onNext: () => void;
}

export const ThemeSelectionScreen: React.FC<ThemeSelectionScreenProps> = ({
    onBack,
    onNext,
}) => {
    const { selectTheme, initializePlayers } = useGame();
    const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const headerAnim = useRef(new Animated.Value(-30)).current;
    const cardAnims = useRef(themes.map(() => new Animated.Value(0))).current;
    const scaleAnims = useRef(themes.map(() => new Animated.Value(1))).current;

    useEffect(() => {
        // Animación del header
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }),
            Animated.spring(headerAnim, {
                toValue: 0,
                friction: 8,
                tension: 50,
                useNativeDriver: true,
            }),
        ]).start();

        // Animación escalonada de las tarjetas
        const staggeredAnimations = cardAnims.map((anim, index) =>
            Animated.timing(anim, {
                toValue: 1,
                duration: 400,
                delay: index * 50,
                useNativeDriver: true,
            })
        );
        Animated.stagger(50, staggeredAnimations).start();
    }, []);

    const handleSelectTheme = (themeId: string, index: number) => {
        // Animación de selección
        Animated.sequence([
            Animated.timing(scaleAnims[index], {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnims[index], {
                toValue: 1,
                friction: 3,
                tension: 100,
                useNativeDriver: true,
            }),
        ]).start();

        setSelectedTheme(themeId);
    };

    const handleConfirm = () => {
        if (selectedTheme) {
            selectTheme(selectedTheme);
            initializePlayers();
            onNext();
        }
    };

    return (
        <LinearGradient
            colors={['#0a0a1a', '#1a1a3a', '#0f0f2a']}
            style={styles.container}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            {/* Background effects */}
            <View style={styles.bgCircle1} />
            <View style={styles.bgCircle2} />

            <Animated.View
                style={[
                    styles.header,
                    {
                        opacity: fadeAnim,
                        transform: [{ translateY: headerAnim }]
                    },
                ]}
            >
                <TouchableOpacity style={styles.backButton} onPress={onBack}>
                    <View style={styles.backButtonInner}>
                        <Text style={styles.backButtonIcon}>←</Text>
                        <Text style={styles.backButtonText}>Atrás</Text>
                    </View>
                </TouchableOpacity>

                <View style={styles.titleContainer}>
                    <Text style={styles.title}>Elige una temática</Text>
                    <Text style={styles.subtitle}>
                        Selecciona la categoría de palabras para esta partida
                    </Text>
                </View>
            </Animated.View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.themesGrid}>
                    {themes.map((theme, index) => {
                        const isSelected = selectedTheme === theme.id;

                        return (
                            <Animated.View
                                key={theme.id}
                                style={[
                                    styles.themeCardContainer,
                                    {
                                        opacity: cardAnims[index],
                                        transform: [
                                            { scale: scaleAnims[index] },
                                            {
                                                translateY: cardAnims[index].interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [30, 0],
                                                }),
                                            },
                                        ],
                                    },
                                ]}
                            >
                                <TouchableOpacity
                                    style={[
                                        styles.themeCard,
                                        isSelected && styles.themeCardSelected,
                                    ]}
                                    onPress={() => handleSelectTheme(theme.id, index)}
                                    activeOpacity={0.8}
                                >
                                    <LinearGradient
                                        colors={
                                            isSelected
                                                ? [`${theme.color}50`, `${theme.color}20`]
                                                : ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)']
                                        }
                                        style={styles.themeCardGradient}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                    >
                                        <View
                                            style={[
                                                styles.iconContainer,
                                                { backgroundColor: `${theme.color}30` }
                                            ]}
                                        >
                                            <Text style={styles.themeIcon}>{theme.icon}</Text>
                                        </View>

                                        <Text
                                            style={[
                                                styles.themeName,
                                                isSelected && { color: theme.color }
                                            ]}
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
                                                    { backgroundColor: theme.color }
                                                ]}
                                            >
                                                <Text style={styles.selectedBadgeText}>✓</Text>
                                            </View>
                                        )}

                                        {isSelected && (
                                            <View
                                                style={[
                                                    styles.selectedBorder,
                                                    { borderColor: theme.color }
                                                ]}
                                            />
                                        )}
                                    </LinearGradient>
                                </TouchableOpacity>
                            </Animated.View>
                        );
                    })}
                </View>
            </ScrollView>

            {/* Footer con botón */}
            <Animated.View
                style={[
                    styles.footer,
                    {
                        opacity: fadeAnim,
                        transform: [{
                            translateY: selectedTheme ? 0 : 100
                        }]
                    }
                ]}
            >
                <LinearGradient
                    colors={['rgba(10, 10, 26, 0)', 'rgba(10, 10, 26, 0.95)', 'rgba(10, 10, 26, 1)']}
                    style={styles.footerGradient}
                >
                    {selectedTheme && (
                        <TouchableOpacity
                            style={styles.confirmButton}
                            onPress={handleConfirm}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={[
                                    themes.find(t => t.id === selectedTheme)?.color || '#6C5CE7',
                                    '#6C5CE7',
                                ]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.confirmButtonGradient}
                            >
                                <Text style={styles.confirmButtonText}>
                                    Repartir Roles
                                </Text>
                                <View style={styles.confirmButtonIconContainer}>
                                    <Text style={styles.confirmButtonIcon}>🎭</Text>
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>
                    )}
                </LinearGradient>
            </Animated.View>
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
        backgroundColor: '#FF4757',
        bottom: 200,
        left: -50,
        opacity: 0.08,
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: 24,
        paddingBottom: 16,
    },
    backButton: {
        marginBottom: 20,
    },
    backButtonInner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    backButtonIcon: {
        fontSize: 20,
        color: 'rgba(255, 255, 255, 0.6)',
    },
    backButtonText: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.6)',
    },
    titleContainer: {
        gap: 8,
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        color: '#FFFFFF',
    },
    subtitle: {
        fontSize: 15,
        color: 'rgba(255, 255, 255, 0.5)',
        lineHeight: 22,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 140,
    },
    themesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 16,
    },
    themeCardContainer: {
        width: CARD_WIDTH,
    },
    themeCard: {
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    themeCardSelected: {
        borderWidth: 0,
    },
    themeCardGradient: {
        padding: 20,
        alignItems: 'center',
        minHeight: 160,
        justifyContent: 'center',
        position: 'relative',
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    themeIcon: {
        fontSize: 36,
    },
    themeName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 8,
    },
    wordCountBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    themeWordCount: {
        fontSize: 11,
        color: 'rgba(255, 255, 255, 0.5)',
    },
    selectedBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    selectedBadgeText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    selectedBorder: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 24,
        borderWidth: 2,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    footerGradient: {
        paddingHorizontal: 24,
        paddingTop: 40,
        paddingBottom: 40,
    },
    confirmButton: {
        borderRadius: 24,
        overflow: 'hidden',
        shadowColor: '#6C5CE7',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 12,
    },
    confirmButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
        paddingHorizontal: 32,
        gap: 16,
    },
    confirmButtonText: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    confirmButtonIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    confirmButtonIcon: {
        fontSize: 20,
    },
});
