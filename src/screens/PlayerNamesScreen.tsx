import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Animated,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGame } from '../context/GameContext';
import { colors, gradients } from '../styles/colors';

interface PlayerNamesScreenProps {
    onBack: () => void;
    onNext: () => void;
}

export const PlayerNamesScreen: React.FC<PlayerNamesScreenProps> = ({
    onBack,
    onNext,
}) => {
    const { gameState, playerNames, setPlayerName } = useGame();
    const { numberOfPlayers } = gameState.config;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const headerAnim = useRef(new Animated.Value(-30)).current;
    const inputAnims = useRef(
        Array.from({ length: 15 }, () => new Animated.Value(0))
    ).current;
    const inputRefs = useRef<(TextInput | null)[]>([]);

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

        // Animación escalonada de los inputs
        const animations = inputAnims.slice(0, numberOfPlayers).map((anim, index) =>
            Animated.timing(anim, {
                toValue: 1,
                duration: 300,
                delay: index * 60,
                useNativeDriver: true,
            })
        );
        Animated.stagger(60, animations).start();
    }, [numberOfPlayers]);

    const handleNameChange = (index: number, name: string) => {
        setPlayerName(index, name);
    };

    const focusNextInput = (currentIndex: number) => {
        if (currentIndex < numberOfPlayers - 1) {
            inputRefs.current[currentIndex + 1]?.focus();
        }
    };

    const allNamesValid = playerNames
        .slice(0, numberOfPlayers)
        .every(name => name.trim().length > 0);

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

            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
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

                    <View style={styles.titleSection}>
                        <View style={styles.titleRow}>
                            <Text style={styles.titleEmoji}>✏️</Text>
                            <Text style={styles.title}>Nombres</Text>
                        </View>
                        <Text style={styles.subtitle}>
                            Ingresa el nombre de cada jugador
                        </Text>
                    </View>

                    <View style={styles.countBadge}>
                        <Text style={styles.countText}>{numberOfPlayers}</Text>
                        <Text style={styles.countLabel}>jugadores</Text>
                    </View>
                </Animated.View>

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {Array.from({ length: numberOfPlayers }, (_, index) => (
                        <Animated.View
                            key={index}
                            style={[
                                styles.inputContainer,
                                {
                                    opacity: inputAnims[index],
                                    transform: [{
                                        translateX: inputAnims[index].interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [-30, 0],
                                        }),
                                    }],
                                },
                            ]}
                        >
                            <View style={styles.inputWrapper}>
                                <LinearGradient
                                    colors={['#6C5CE7', '#5B4BD5']}
                                    style={styles.playerNumberBadge}
                                >
                                    <Text style={styles.playerNumberText}>{index + 1}</Text>
                                </LinearGradient>

                                <View style={styles.inputFieldContainer}>
                                    <TextInput
                                        ref={ref => { inputRefs.current[index] = ref; }}
                                        style={styles.input}
                                        value={playerNames[index]}
                                        onChangeText={(text) => handleNameChange(index, text)}
                                        placeholder={`Nombre del jugador ${index + 1}`}
                                        placeholderTextColor="rgba(255, 255, 255, 0.3)"
                                        returnKeyType={index < numberOfPlayers - 1 ? 'next' : 'done'}
                                        onSubmitEditing={() => focusNextInput(index)}
                                        maxLength={20}
                                        autoCapitalize="words"
                                    />
                                </View>

                                {playerNames[index]?.trim().length > 0 && (
                                    <View style={styles.checkMark}>
                                        <Text style={styles.checkMarkText}>✓</Text>
                                    </View>
                                )}
                            </View>
                        </Animated.View>
                    ))}
                </ScrollView>

                <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
                    <LinearGradient
                        colors={['rgba(10, 10, 26, 0)', 'rgba(10, 10, 26, 0.95)', 'rgba(10, 10, 26, 1)']}
                        style={styles.footerGradient}
                    >
                        <TouchableOpacity
                            style={[
                                styles.continueButton,
                                !allNamesValid && styles.continueButtonDisabled,
                            ]}
                            onPress={onNext}
                            disabled={!allNamesValid}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={
                                    allNamesValid
                                        ? ['#6C5CE7', '#A29BFE', '#6C5CE7']
                                        : ['#3D3D5C', '#2D2D44']
                                }
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.continueButtonGradient}
                            >
                                <Text
                                    style={[
                                        styles.continueButtonText,
                                        !allNamesValid && styles.continueButtonTextDisabled,
                                    ]}
                                >
                                    Elegir Temática
                                </Text>
                                <View style={[
                                    styles.arrowContainer,
                                    !allNamesValid && styles.arrowContainerDisabled
                                ]}>
                                    <Text style={styles.continueButtonIcon}>→</Text>
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>
                    </LinearGradient>
                </Animated.View>
            </KeyboardAvoidingView>
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
        backgroundColor: '#A29BFE',
        bottom: 150,
        left: -50,
        opacity: 0.08,
    },
    keyboardView: {
        flex: 1,
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: 24,
        paddingBottom: 20,
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
    titleSection: {
        marginBottom: 16,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 8,
    },
    titleEmoji: {
        fontSize: 32,
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        color: '#FFFFFF',
    },
    subtitle: {
        fontSize: 15,
        color: 'rgba(255, 255, 255, 0.5)',
    },
    countBadge: {
        position: 'absolute',
        top: 60,
        right: 24,
        backgroundColor: 'rgba(108, 92, 231, 0.2)',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 16,
        alignItems: 'center',
    },
    countText: {
        fontSize: 24,
        fontWeight: '900',
        color: '#6C5CE7',
    },
    countLabel: {
        fontSize: 10,
        color: 'rgba(255, 255, 255, 0.5)',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 140,
        gap: 12,
    },
    inputContainer: {
        marginBottom: 0,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        overflow: 'hidden',
    },
    playerNumberBadge: {
        width: 50,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    playerNumberText: {
        fontSize: 20,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    inputFieldContainer: {
        flex: 1,
    },
    input: {
        height: 60,
        paddingHorizontal: 16,
        fontSize: 17,
        color: '#FFFFFF',
        fontWeight: '600',
    },
    checkMark: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#00B894',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    checkMarkText: {
        fontSize: 18,
        color: '#FFFFFF',
        fontWeight: '700',
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
    continueButton: {
        borderRadius: 24,
        overflow: 'hidden',
        shadowColor: '#6C5CE7',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 12,
    },
    continueButtonDisabled: {
        shadowOpacity: 0,
        elevation: 0,
    },
    continueButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
        paddingHorizontal: 32,
        gap: 16,
    },
    continueButtonText: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    continueButtonTextDisabled: {
        color: 'rgba(255, 255, 255, 0.4)',
    },
    arrowContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    arrowContainerDisabled: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    continueButtonIcon: {
        fontSize: 18,
        color: '#FFFFFF',
        fontWeight: '700',
    },
});
