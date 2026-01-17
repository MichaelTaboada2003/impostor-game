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
    const [fadeAnim] = useState(new Animated.Value(0));
    const [slideAnim] = useState(new Animated.Value(50));
    const inputRefs = useRef<(TextInput | null)[]>([]);

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

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
        <LinearGradient colors={gradients.dark as [string, string]} style={styles.container}>
            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <Animated.View
                    style={[
                        styles.header,
                        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
                    ]}
                >
                    <TouchableOpacity style={styles.backButton} onPress={onBack}>
                        <Text style={styles.backButtonText}>← Atrás</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>Nombres de Jugadores</Text>
                    <Text style={styles.subtitle}>
                        Ingresa el nombre de cada participante
                    </Text>
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
                                    opacity: fadeAnim,
                                    transform: [
                                        {
                                            translateY: slideAnim.interpolate({
                                                inputRange: [0, 50],
                                                outputRange: [0, 50 + index * 5],
                                            }),
                                        },
                                    ],
                                },
                            ]}
                        >
                            <View style={styles.inputWrapper}>
                                <View style={styles.playerNumber}>
                                    <Text style={styles.playerNumberText}>{index + 1}</Text>
                                </View>
                                <TextInput
                                    ref={ref => { inputRefs.current[index] = ref; }}
                                    style={styles.input}
                                    value={playerNames[index]}
                                    onChangeText={(text) => handleNameChange(index, text)}
                                    placeholder={`Jugador ${index + 1}`}
                                    placeholderTextColor={colors.textMuted}
                                    returnKeyType={index < numberOfPlayers - 1 ? 'next' : 'done'}
                                    onSubmitEditing={() => focusNextInput(index)}
                                    maxLength={20}
                                    autoCapitalize="words"
                                />
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
                    <TouchableOpacity
                        style={[
                            styles.continueButton,
                            !allNamesValid && styles.continueButtonDisabled,
                        ]}
                        onPress={onNext}
                        disabled={!allNamesValid}
                    >
                        <LinearGradient
                            colors={
                                allNamesValid
                                    ? (gradients.primary as [string, string])
                                    : (['#3D3D5C', '#2D2D44'] as [string, string])
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
                            <Text style={styles.continueButtonIcon}>→</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </Animated.View>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
        marginBottom: 16,
    },
    backButtonText: {
        fontSize: 16,
        color: colors.textSecondary,
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
        color: colors.textPrimary,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: colors.textSecondary,
        lineHeight: 24,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 20,
        gap: 12,
    },
    inputContainer: {
        marginBottom: 4,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        overflow: 'hidden',
    },
    playerNumber: {
        width: 48,
        height: 56,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    playerNumberText: {
        fontSize: 20,
        fontWeight: '800',
        color: colors.textPrimary,
    },
    input: {
        flex: 1,
        height: 56,
        paddingHorizontal: 16,
        fontSize: 18,
        color: colors.textPrimary,
        fontWeight: '600',
    },
    checkMark: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.success,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    checkMarkText: {
        fontSize: 16,
        color: colors.textPrimary,
        fontWeight: '700',
    },
    footer: {
        padding: 24,
        paddingBottom: 40,
        backgroundColor: 'rgba(15, 15, 26, 0.95)',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.1)',
    },
    continueButton: {
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
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
        gap: 12,
    },
    continueButtonText: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    continueButtonTextDisabled: {
        color: colors.textMuted,
    },
    continueButtonIcon: {
        fontSize: 24,
        color: colors.textPrimary,
    },
});
