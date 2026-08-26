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
import { SavedGroupsModal } from '../components/SavedGroupsModal';
import { colors } from '../styles/colors';
import { PlayerGroup } from '../types/game';

interface PlayerNamesScreenProps {
    onBack: () => void;
    onNext: () => void;
}

export const PlayerNamesScreen: React.FC<PlayerNamesScreenProps> = ({
    onBack,
    onNext,
}) => {
    const {
        gameState,
        playerNames,
        setPlayerName,
        savedGroups,
        saveCurrentGroup,
        loadGroup,
        deleteGroup,
    } = useGame();

    const [showGroupsModal, setShowGroupsModal] = useState(false);
    const { numberOfPlayers } = gameState.config;

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const headerAnim = useRef(new Animated.Value(-20)).current;
    const inputRefs = useRef<(TextInput | null)[]>([]);

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
            Animated.spring(headerAnim, { toValue: 0, friction: 8, tension: 50, useNativeDriver: true }),
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
        .every(name => name && name.trim().length > 0);

    return (
        <LinearGradient
            colors={['#0a0a1a', '#141432', '#0a0a1a']}
            style={styles.container}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            <View style={styles.bgCircle1} />
            <View style={styles.bgCircle2} />

            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                {/* Header */}
                <Animated.View
                    style={[
                        styles.header,
                        { opacity: fadeAnim, transform: [{ translateY: headerAnim }] },
                    ]}
                >
                    <View style={styles.topNavRow}>
                        <TouchableOpacity style={styles.backButton} onPress={onBack}>
                            <View style={styles.backButtonInner}>
                                <Text style={styles.backButtonIcon}>←</Text>
                                <Text style={styles.backButtonText}>Atrás</Text>
                            </View>
                        </TouchableOpacity>

                        {/* Saved Groups Trigger */}
                        <TouchableOpacity
                            style={styles.groupsTriggerBtn}
                            onPress={() => setShowGroupsModal(true)}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={['rgba(108, 92, 231, 0.4)', 'rgba(108, 92, 231, 0.15)']}
                                style={styles.groupsTriggerGradient}
                            >
                                <Text style={styles.groupsTriggerText}>👥 Grupos ({savedGroups.length})</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.titleSection}>
                        <View style={styles.titleRow}>
                            <Text style={styles.titleEmoji}>✏️</Text>
                            <Text style={styles.title}>Nombres</Text>
                        </View>
                        <Text style={styles.subtitle}>
                            Ingresa el nombre de cada participante
                        </Text>
                    </View>
                </Animated.View>

                {/* Inputs List */}
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {Array.from({ length: numberOfPlayers }, (_, index) => (
                        <View key={index} style={styles.inputContainer}>
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
                                        placeholderTextColor="rgba(255, 255, 255, 0.35)"
                                        returnKeyType={index < numberOfPlayers - 1 ? 'next' : 'done'}
                                        onSubmitEditing={() => focusNextInput(index)}
                                        maxLength={22}
                                        autoCapitalize="words"
                                    />
                                </View>

                                {playerNames[index]?.trim().length > 0 && (
                                    <View style={styles.checkMark}>
                                        <Text style={styles.checkMarkText}>✓</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    ))}
                </ScrollView>

                {/* Footer */}
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
                            activeOpacity={0.85}
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
                                    !allNamesValid && styles.arrowContainerDisabled,
                                ]}>
                                    <Text style={styles.continueButtonIcon}>→</Text>
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>
                    </LinearGradient>
                </Animated.View>
            </KeyboardAvoidingView>

            {/* Saved Groups Modal */}
            <SavedGroupsModal
                visible={showGroupsModal}
                savedGroups={savedGroups}
                currentNames={playerNames.slice(0, numberOfPlayers)}
                onClose={() => setShowGroupsModal(false)}
                onSelectGroup={(g: PlayerGroup) => loadGroup(g)}
                onSaveGroup={(name: string) => saveCurrentGroup(name)}
                onDeleteGroup={(id: string) => deleteGroup(id)}
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
        backgroundColor: '#00CEC9',
        bottom: 150,
        left: -50,
        opacity: 0.08,
    },
    keyboardView: {
        flex: 1,
    },
    header: {
        paddingTop: 54,
        paddingHorizontal: 22,
        paddingBottom: 16,
    },
    topNavRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    backButton: {
        paddingVertical: 6,
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
    groupsTriggerBtn: {
        borderRadius: 14,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(108, 92, 231, 0.4)',
    },
    groupsTriggerGradient: {
        paddingHorizontal: 14,
        paddingVertical: 8,
    },
    groupsTriggerText: {
        color: '#A29BFE',
        fontSize: 13,
        fontWeight: '700',
    },
    titleSection: {
        gap: 4,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    titleEmoji: {
        fontSize: 28,
    },
    title: {
        fontSize: 30,
        fontWeight: '900',
        color: '#FFFFFF',
    },
    subtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.5)',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 22,
        paddingBottom: 140,
        gap: 10,
    },
    inputContainer: {
        marginBottom: 0,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 18,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        overflow: 'hidden',
    },
    playerNumberBadge: {
        width: 48,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
    },
    playerNumberText: {
        fontSize: 18,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    inputFieldContainer: {
        flex: 1,
    },
    input: {
        height: 56,
        paddingHorizontal: 14,
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: '600',
    },
    checkMark: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#00B894',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    checkMarkText: {
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: '800',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    footerGradient: {
        paddingHorizontal: 22,
        paddingTop: 30,
        paddingBottom: 36,
    },
    continueButton: {
        borderRadius: 22,
        overflow: 'hidden',
        shadowColor: '#6C5CE7',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 18,
        elevation: 10,
    },
    continueButtonDisabled: {
        shadowOpacity: 0,
        elevation: 0,
    },
    continueButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        paddingHorizontal: 28,
        gap: 14,
    },
    continueButtonText: {
        fontSize: 18,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    continueButtonTextDisabled: {
        color: 'rgba(255, 255, 255, 0.4)',
    },
    arrowContainer: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    arrowContainerDisabled: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    continueButtonIcon: {
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: '700',
    },
});
