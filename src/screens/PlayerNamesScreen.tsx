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
    Vibration,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useGame } from '../context/GameContext';
import { SavedGroupsModal } from '../components/SavedGroupsModal';
import { colors, gradients } from '../styles/colors';
import { PlayerGroup } from '../types/game';

interface PlayerNamesScreenProps {
    onBack: () => void;
    onNext: () => void;
}

const PLAYER_GRADIENTS = [
    ['#7952FF', '#9D7DFF'],
    ['#00B8D4', '#00F0FF'],
    ['#FF2A55', '#FF6B8B'],
    ['#00B894', '#00F59B'],
    ['#FF9F1C', '#FFD166'],
    ['#E040FB', '#EA80FC'],
    ['#3D5AFE', '#8C9EFF'],
    ['#00E676', '#B9F6CA'],
];

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
        updateGroup,
        deleteGroup,
    } = useGame();

    const [showGroupsModal, setShowGroupsModal] = useState(false);
    const { numberOfPlayers } = gameState.config;

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const headerAnim = useRef(new Animated.Value(-15)).current;
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
        <View style={styles.container}>
            <LinearGradient
                colors={gradients.appBackground}
                style={StyleSheet.absoluteFillObject}
            />

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
                        <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
                            <Ionicons name="arrow-back" size={20} color={colors.textSecondary} />
                            <Text style={styles.backButtonText}>Atrás</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.groupsTriggerBtn}
                            onPress={() => {
                                Vibration.vibrate(15);
                                setShowGroupsModal(true);
                            }}
                            activeOpacity={0.75}
                        >
                            <Ionicons name="people-outline" size={16} color={colors.primaryLight} style={{ marginRight: 4 }} />
                            <Text style={styles.groupsTriggerText}>Plantillas ({savedGroups.length})</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.titleSection}>
                        <Text style={styles.title}>Nombres de Jugadores</Text>
                        <Text style={styles.subtitle}>
                            Identifica a cada participante para la ronda de roles
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
                    {Array.from({ length: numberOfPlayers }, (_, index) => {
                        const avatarGradient = PLAYER_GRADIENTS[index % PLAYER_GRADIENTS.length];
                        const hasName = playerNames[index]?.trim().length > 0;

                        return (
                            <View key={index} style={styles.inputCard}>
                                <LinearGradient
                                    colors={avatarGradient as [string, string]}
                                    style={styles.avatarPill}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                >
                                    <Text style={styles.avatarNumberText}>{index + 1}</Text>
                                </LinearGradient>

                                <View style={styles.inputWrapper}>
                                    <TextInput
                                        ref={ref => { inputRefs.current[index] = ref; }}
                                        style={styles.textInput}
                                        value={playerNames[index]}
                                        onChangeText={(text) => handleNameChange(index, text)}
                                        placeholder={`Jugador ${index + 1}`}
                                        placeholderTextColor={colors.textMuted}
                                        returnKeyType={index < numberOfPlayers - 1 ? 'next' : 'done'}
                                        onSubmitEditing={() => focusNextInput(index)}
                                        maxLength={20}
                                        autoCapitalize="words"
                                    />
                                </View>

                                {hasName && (
                                    <View style={styles.checkCircle}>
                                        <Ionicons name="checkmark" size={14} color="#07080C" />
                                    </View>
                                )}
                            </View>
                        );
                    })}
                </ScrollView>

                {/* Fixed Bottom CTA Bar */}
                <View style={styles.bottomBar}>
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
                                    ? ['#7952FF', '#9D7DFF']
                                    : ['#232635', '#161822']
                            }
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.continueGradient}
                        >
                            <Text
                                style={[
                                    styles.continueText,
                                    !allNamesValid && styles.continueTextDisabled,
                                ]}
                            >
                                Elegir Temática
                            </Text>
                            <Ionicons
                                name="arrow-forward"
                                size={18}
                                color={allNamesValid ? '#FFFFFF' : colors.textDisabled}
                                style={{ marginLeft: 8 }}
                            />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>

            {/* Saved Groups Modal */}
            <SavedGroupsModal
                visible={showGroupsModal}
                savedGroups={savedGroups}
                currentNames={playerNames.slice(0, numberOfPlayers)}
                onClose={() => setShowGroupsModal(false)}
                onSelectGroup={(g: PlayerGroup) => loadGroup(g)}
                onSaveGroup={(name: string) => saveCurrentGroup(name)}
                onUpdateGroup={(g: PlayerGroup) => updateGroup(g)}
                onDeleteGroup={(id: string) => deleteGroup(id)}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bgDeep,
    },
    keyboardView: {
        flex: 1,
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
        fontSize: 14,
        fontWeight: '700',
        color: colors.textSecondary,
    },
    groupsTriggerBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.bgElevated,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.borderLight,
    },
    groupsTriggerText: {
        color: colors.primaryLight,
        fontSize: 12,
        fontWeight: '800',
    },
    titleSection: {
        gap: 2,
    },
    title: {
        fontSize: 24,
        fontWeight: '900',
        color: colors.textPrimary,
        letterSpacing: 0.3,
    },
    subtitle: {
        fontSize: 12,
        color: colors.textMuted,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 110,
        gap: 8,
    },
    inputCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.bgCard,
        borderRadius: 16,
        padding: 6,
        borderWidth: 1,
        borderColor: colors.borderSubtle,
        gap: 10,
    },
    avatarPill: {
        width: 42,
        height: 42,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarNumberText: {
        fontSize: 16,
        fontWeight: '900',
        color: '#FFFFFF',
    },
    inputWrapper: {
        flex: 1,
    },
    textInput: {
        height: 46,
        color: colors.textPrimary,
        fontSize: 15,
        fontWeight: '700',
    },
    checkCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: colors.success,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
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
    continueButtonDisabled: {
        shadowOpacity: 0,
        elevation: 0,
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
    continueTextDisabled: {
        color: colors.textDisabled,
    },
});
