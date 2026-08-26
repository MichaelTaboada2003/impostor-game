import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Vibration,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { PlayerGroup } from '../types/game';
import { colors, gradients } from '../styles/colors';

interface SavedGroupsModalProps {
    visible: boolean;
    savedGroups: PlayerGroup[];
    currentNames: string[];
    onClose: () => void;
    onSelectGroup: (group: PlayerGroup) => void;
    onSaveGroup: (name: string) => void;
    onUpdateGroup: (group: PlayerGroup) => void;
    onDeleteGroup: (groupId: string) => void;
}

export const SavedGroupsModal: React.FC<SavedGroupsModalProps> = ({
    visible,
    savedGroups,
    currentNames,
    onClose,
    onSelectGroup,
    onSaveGroup,
    onUpdateGroup,
    onDeleteGroup,
}) => {
    const [newGroupName, setNewGroupName] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    // Edit Template State
    const [editingGroup, setEditingGroup] = useState<PlayerGroup | null>(null);
    const [editName, setEditName] = useState('');
    const [editPlayers, setEditPlayers] = useState<string[]>([]);
    const [newPlayerInput, setNewPlayerInput] = useState('');

    const handleStartEdit = (group: PlayerGroup) => {
        Vibration.vibrate(15);
        setEditingGroup(group);
        setEditName(group.name);
        setEditPlayers([...group.players]);
        setNewPlayerInput('');
        setIsCreating(false);
    };

    const handleCancelEdit = () => {
        setEditingGroup(null);
        setEditName('');
        setEditPlayers([]);
        setNewPlayerInput('');
    };

    const handleSaveEdit = () => {
        if (!editingGroup) return;
        if (!editName.trim()) {
            Alert.alert('Nombre Requerido', 'El nombre de la plantilla no puede estar vacío.');
            return;
        }

        const validPlayers = editPlayers.filter(p => p.trim().length > 0);
        if (validPlayers.length < 3) {
            Alert.alert('Jugadores Insuficientes', 'La plantilla debe tener al menos 3 jugadores.');
            return;
        }

        Vibration.vibrate(20);
        const updated: PlayerGroup = {
            ...editingGroup,
            name: editName.trim(),
            players: validPlayers,
        };

        onUpdateGroup(updated);
        handleCancelEdit();
    };

    const handleAddPlayerToEdit = () => {
        const trimmed = newPlayerInput.trim();
        if (!trimmed) return;
        if (editPlayers.length >= 16) {
            Alert.alert('Límite alcanzado', 'Una plantilla puede tener un máximo de 16 jugadores.');
            return;
        }
        setEditPlayers([...editPlayers, trimmed]);
        setNewPlayerInput('');
    };

    const handleRemovePlayerFromEdit = (index: number) => {
        if (editPlayers.length <= 3) {
            Alert.alert('Mínimo requerido', 'La plantilla necesita al menos 3 jugadores.');
            return;
        }
        setEditPlayers(editPlayers.filter((_, i) => i !== index));
    };

    const handleEditPlayerName = (index: number, val: string) => {
        const next = [...editPlayers];
        next[index] = val;
        setEditPlayers(next);
    };

    const handleSyncCurrentToEdit = () => {
        const validCurrent = currentNames.filter(n => n.trim().length > 0);
        if (validCurrent.length >= 3) {
            setEditPlayers([...validCurrent]);
            Vibration.vibrate(15);
        } else {
            Alert.alert('Atención', 'Se necesitan al menos 3 nombres actuales válidos.');
        }
    };

    const handleSaveNew = () => {
        if (!newGroupName.trim()) {
            Alert.alert('Nombre requerido', 'Ingresa un nombre para identificar este grupo.');
            return;
        }
        onSaveGroup(newGroupName.trim());
        setNewGroupName('');
        setIsCreating(false);
    };

    const handleCloseModal = () => {
        handleCancelEdit();
        setIsCreating(false);
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={handleCloseModal}
        >
            <KeyboardAvoidingView
                style={styles.modalOverlay}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <View style={styles.modalCard}>
                    <LinearGradient
                        colors={gradients.sheetGlass}
                        style={styles.modalGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                    >
                        {/* Drag Handle */}
                        <View style={styles.handleContainer}>
                            <View style={styles.handle} />
                        </View>

                        {/* Header */}
                        <View style={styles.header}>
                            <View style={styles.headerTitleRow}>
                                <View style={styles.iconCircle}>
                                    <Ionicons
                                        name={editingGroup ? 'create-outline' : 'people-outline'}
                                        size={20}
                                        color={colors.primaryLight}
                                    />
                                </View>
                                <View>
                                    <Text style={styles.title}>
                                        {editingGroup ? 'Editar Plantilla' : 'Plantillas de Jugadores'}
                                    </Text>
                                    <Text style={styles.subtitle}>
                                        {editingGroup
                                            ? 'Modifica el nombre y los integrantes del grupo'
                                            : 'Carga, edita o guarda listas de jugadores'}
                                    </Text>
                                </View>
                            </View>
                            <TouchableOpacity onPress={handleCloseModal} style={styles.closeBtn} activeOpacity={0.7}>
                                <Ionicons name="close" size={20} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        {/* ----------------- EDITING TEMPLATE VIEW ----------------- */}
                        {editingGroup ? (
                            <ScrollView
                                style={styles.editScroll}
                                contentContainerStyle={styles.editScrollContent}
                                showsVerticalScrollIndicator={false}
                                keyboardShouldPersistTaps="handled"
                            >
                                {/* Edit Template Title */}
                                <View style={styles.editSection}>
                                    <Text style={styles.fieldLabel}>Nombre de la Plantilla</Text>
                                    <View style={styles.editInputWrapper}>
                                        <TextInput
                                            style={styles.editTitleInput}
                                            value={editName}
                                            onChangeText={setEditName}
                                            placeholder="Nombre del grupo..."
                                            placeholderTextColor={colors.textMuted}
                                            maxLength={30}
                                        />
                                    </View>
                                </View>

                                {/* Sync current players shortcut */}
                                <TouchableOpacity
                                    style={styles.syncBtn}
                                    onPress={handleSyncCurrentToEdit}
                                    activeOpacity={0.8}
                                >
                                    <Feather name="refresh-cw" size={14} color={colors.cyan} style={{ marginRight: 6 }} />
                                    <Text style={styles.syncBtnText}>
                                        Reemplazar con los nombres actuales de la partida
                                    </Text>
                                </TouchableOpacity>

                                {/* Players in template list */}
                                <View style={styles.editSection}>
                                    <View style={styles.playersListHeader}>
                                        <Text style={styles.fieldLabel}>
                                            Integrantes ({editPlayers.length})
                                        </Text>
                                        <Text style={styles.fieldSubLabel}>Mínimo 3 · Máximo 16</Text>
                                    </View>

                                    <View style={styles.editPlayersList}>
                                        {editPlayers.map((player, idx) => (
                                            <View key={idx} style={styles.editPlayerRow}>
                                                <View style={styles.editPlayerBadge}>
                                                    <Text style={styles.editPlayerNumber}>{idx + 1}</Text>
                                                </View>
                                                <TextInput
                                                    style={styles.editPlayerInput}
                                                    value={player}
                                                    onChangeText={(t) => handleEditPlayerName(idx, t)}
                                                    placeholder={`Jugador ${idx + 1}`}
                                                    placeholderTextColor={colors.textMuted}
                                                    maxLength={20}
                                                />
                                                <TouchableOpacity
                                                    style={styles.removePlayerBtn}
                                                    onPress={() => handleRemovePlayerFromEdit(idx)}
                                                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                                >
                                                    <Ionicons name="close-circle" size={20} color={colors.impostor} />
                                                </TouchableOpacity>
                                            </View>
                                        ))}
                                    </View>

                                    {/* Add New Player to template row */}
                                    <View style={styles.addPlayerRow}>
                                        <TextInput
                                            style={styles.addPlayerInput}
                                            placeholder="Agregar nuevo jugador..."
                                            placeholderTextColor={colors.textMuted}
                                            value={newPlayerInput}
                                            onChangeText={setNewPlayerInput}
                                            onSubmitEditing={handleAddPlayerToEdit}
                                            returnKeyType="done"
                                            maxLength={20}
                                        />
                                        <TouchableOpacity
                                            style={[
                                                styles.addPlayerBtn,
                                                !newPlayerInput.trim() && styles.addPlayerBtnDisabled,
                                            ]}
                                            onPress={handleAddPlayerToEdit}
                                            disabled={!newPlayerInput.trim()}
                                            activeOpacity={0.8}
                                        >
                                            <Ionicons name="add" size={20} color="#FFFFFF" />
                                            <Text style={styles.addPlayerBtnText}>Añadir</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Edit Actions Bottom */}
                                <View style={styles.editActionRow}>
                                    <TouchableOpacity
                                        style={styles.cancelEditBtn}
                                        onPress={handleCancelEdit}
                                        activeOpacity={0.8}
                                    >
                                        <Text style={styles.cancelEditBtnText}>Cancelar</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.saveEditBtn}
                                        onPress={handleSaveEdit}
                                        activeOpacity={0.85}
                                    >
                                        <LinearGradient
                                            colors={['#00B894', '#00F59B']}
                                            style={styles.saveEditGradient}
                                        >
                                            <Ionicons name="checkmark" size={18} color="#07080C" style={{ marginRight: 6 }} />
                                            <Text style={styles.saveEditBtnText}>Guardar Cambios</Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </View>
                            </ScrollView>
                        ) : (
                            /* ----------------- TEMPLATES LIST VIEW ----------------- */
                            <>
                                {/* Save Current Group Trigger / Form */}
                                {isCreating ? (
                                    <View style={styles.createBox}>
                                        <Text style={styles.createLabel}>Nombre para el grupo actual:</Text>
                                        <View style={styles.createInputRow}>
                                            <TextInput
                                                style={styles.createInput}
                                                placeholder="Ej. Amigos de Fiesta, Familia..."
                                                placeholderTextColor={colors.textMuted}
                                                value={newGroupName}
                                                onChangeText={setNewGroupName}
                                                autoFocus
                                            />
                                            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveNew} activeOpacity={0.8}>
                                                <Text style={styles.saveBtnText}>Guardar</Text>
                                            </TouchableOpacity>
                                        </View>
                                        <TouchableOpacity onPress={() => setIsCreating(false)} style={styles.cancelLink}>
                                            <Text style={styles.cancelLinkText}>Cancelar</Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <TouchableOpacity
                                        style={styles.saveCurrentTrigger}
                                        onPress={() => setIsCreating(true)}
                                        activeOpacity={0.8}
                                    >
                                        <LinearGradient
                                            colors={['rgba(121, 82, 255, 0.2)', 'rgba(121, 82, 255, 0.05)']}
                                            style={styles.saveCurrentGradient}
                                        >
                                            <View style={styles.saveIconBox}>
                                                <Feather name="bookmark" size={18} color={colors.primaryLight} />
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.saveCurrentTitle}>Guardar grupo actual como plantilla</Text>
                                                <Text style={styles.saveCurrentSubtitle} numberOfLines={1}>
                                                    {currentNames.join(' · ')}
                                                </Text>
                                            </View>
                                            <Ionicons name="add-circle-outline" size={22} color={colors.primaryLight} />
                                        </LinearGradient>
                                    </TouchableOpacity>
                                )}

                                {/* Groups List */}
                                <ScrollView
                                    style={styles.groupsList}
                                    contentContainerStyle={styles.groupsListContent}
                                    showsVerticalScrollIndicator={false}
                                >
                                    <Text style={styles.listLabel}>Tus Plantillas:</Text>
                                    {savedGroups.length === 0 ? (
                                        <View style={styles.emptyContainer}>
                                            <Ionicons name="folder-open-outline" size={36} color={colors.textDisabled} />
                                            <Text style={styles.emptyText}>No tienes grupos guardados aún.</Text>
                                        </View>
                                    ) : (
                                        savedGroups.map(group => (
                                            <View key={group.id} style={styles.groupCard}>
                                                <LinearGradient
                                                    colors={gradients.cardGlass}
                                                    style={styles.groupGradient}
                                                >
                                                    {/* Card Header with Name & Count */}
                                                    <View style={styles.groupHeader}>
                                                        <Text style={styles.groupName}>{group.name}</Text>
                                                        <View style={styles.groupBadge}>
                                                            <Text style={styles.groupBadgeText}>
                                                                {group.players.length} jugadores
                                                            </Text>
                                                        </View>
                                                    </View>

                                                    {/* Player chips preview */}
                                                    <Text style={styles.groupPlayersPreview} numberOfLines={2}>
                                                        {group.players.join(' · ')}
                                                    </Text>

                                                    {/* Card Action Buttons (Load, Edit, Delete) */}
                                                    <View style={styles.groupActions}>
                                                        <TouchableOpacity
                                                            style={styles.loadActionBtn}
                                                            onPress={() => {
                                                                Vibration.vibrate(20);
                                                                onSelectGroup(group);
                                                                onClose();
                                                            }}
                                                            activeOpacity={0.8}
                                                        >
                                                            <LinearGradient
                                                                colors={['#7952FF', '#9D7DFF']}
                                                                style={styles.loadActionGradient}
                                                            >
                                                                <Ionicons name="play" size={13} color="#FFFFFF" style={{ marginRight: 4 }} />
                                                                <Text style={styles.loadActionText}>Cargar</Text>
                                                            </LinearGradient>
                                                        </TouchableOpacity>

                                                        <View style={styles.groupTools}>
                                                            <TouchableOpacity
                                                                style={styles.editGroupBtn}
                                                                onPress={() => handleStartEdit(group)}
                                                                activeOpacity={0.7}
                                                            >
                                                                <Ionicons name="create-outline" size={16} color={colors.cyan} />
                                                                <Text style={styles.editGroupBtnText}>Editar</Text>
                                                            </TouchableOpacity>

                                                            <TouchableOpacity
                                                                style={styles.deleteGroupBtn}
                                                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                                                onPress={() => {
                                                                    Alert.alert(
                                                                        'Eliminar Plantilla',
                                                                        `¿Deseas eliminar "${group.name}"?`,
                                                                        [
                                                                            { text: 'Cancelar', style: 'cancel' },
                                                                            { text: 'Eliminar', style: 'destructive', onPress: () => onDeleteGroup(group.id) },
                                                                        ]
                                                                    );
                                                                }}
                                                            >
                                                                <Ionicons name="trash-outline" size={16} color={colors.impostor} />
                                                            </TouchableOpacity>
                                                        </View>
                                                    </View>
                                                </LinearGradient>
                                            </View>
                                        ))
                                    )}
                                </ScrollView>
                            </>
                        )}
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
    modalCard: {
        height: '86%',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.borderSubtle,
    },
    modalGradient: {
        flex: 1,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    handleContainer: {
        alignItems: 'center',
        paddingTop: 10,
        paddingBottom: 8,
    },
    handle: {
        width: 38,
        height: 4,
        borderRadius: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    headerTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    iconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.bgGlassHover,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: '900',
        color: colors.textPrimary,
    },
    subtitle: {
        fontSize: 12,
        color: colors.textMuted,
    },
    closeBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.bgGlassHover,
        justifyContent: 'center',
        alignItems: 'center',
    },
    saveCurrentTrigger: {
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.borderLight,
    },
    saveCurrentGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        gap: 12,
    },
    saveIconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: colors.bgGlassHover,
        justifyContent: 'center',
        alignItems: 'center',
    },
    saveCurrentTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: colors.textPrimary,
    },
    saveCurrentSubtitle: {
        fontSize: 12,
        color: colors.textMuted,
        marginTop: 2,
    },
    createBox: {
        backgroundColor: colors.bgElevated,
        borderRadius: 16,
        padding: 14,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.primary,
    },
    createLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: 8,
    },
    createInputRow: {
        flexDirection: 'row',
        gap: 8,
    },
    createInput: {
        flex: 1,
        height: 44,
        backgroundColor: colors.bgDeep,
        borderRadius: 12,
        paddingHorizontal: 12,
        color: colors.textPrimary,
        fontSize: 14,
        fontWeight: '600',
    },
    saveBtn: {
        backgroundColor: colors.primary,
        paddingHorizontal: 16,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    saveBtnText: {
        color: '#FFFFFF',
        fontWeight: '800',
        fontSize: 13,
    },
    cancelLink: {
        alignSelf: 'center',
        marginTop: 8,
    },
    cancelLinkText: {
        color: colors.textMuted,
        fontSize: 12,
    },
    groupsList: {
        flex: 1,
    },
    groupsListContent: {
        paddingBottom: 20,
    },
    listLabel: {
        fontSize: 12,
        fontWeight: '800',
        color: colors.textMuted,
        marginBottom: 10,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 30,
        gap: 8,
    },
    emptyText: {
        color: colors.textMuted,
        fontSize: 13,
    },
    groupCard: {
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 10,
        borderWidth: 1,
        borderColor: colors.borderSubtle,
    },
    groupGradient: {
        padding: 14,
    },
    groupHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    groupName: {
        fontSize: 16,
        fontWeight: '800',
        color: colors.textPrimary,
    },
    groupBadge: {
        backgroundColor: 'rgba(0, 240, 255, 0.15)',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    groupBadgeText: {
        fontSize: 10,
        color: colors.cyan,
        fontWeight: '800',
    },
    groupPlayersPreview: {
        fontSize: 12,
        color: colors.textSecondary,
        lineHeight: 16,
    },
    groupActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: colors.borderSubtle,
    },
    loadActionBtn: {
        borderRadius: 10,
        overflow: 'hidden',
    },
    loadActionGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 7,
    },
    loadActionText: {
        fontSize: 12,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    groupTools: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    editGroupBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.bgGlassHover,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        gap: 4,
        borderWidth: 1,
        borderColor: colors.borderLight,
    },
    editGroupBtnText: {
        color: colors.cyan,
        fontSize: 12,
        fontWeight: '700',
    },
    deleteGroupBtn: {
        padding: 4,
    },

    // Edit View Styles
    editScroll: {
        flex: 1,
    },
    editScrollContent: {
        paddingBottom: 24,
        gap: 16,
    },
    editSection: {
        backgroundColor: colors.bgCard,
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: colors.borderSubtle,
    },
    fieldLabel: {
        fontSize: 13,
        fontWeight: '800',
        color: colors.textPrimary,
        marginBottom: 8,
    },
    fieldSubLabel: {
        fontSize: 11,
        color: colors.textMuted,
    },
    playersListHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    editInputWrapper: {
        backgroundColor: colors.bgDeep,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.borderLight,
        paddingHorizontal: 12,
    },
    editTitleInput: {
        height: 44,
        color: colors.textPrimary,
        fontSize: 15,
        fontWeight: '700',
    },
    syncBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 240, 255, 0.1)',
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(0, 240, 255, 0.25)',
    },
    syncBtnText: {
        fontSize: 12,
        fontWeight: '700',
        color: colors.cyan,
    },
    editPlayersList: {
        gap: 6,
        marginBottom: 12,
    },
    editPlayerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.bgElevated,
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: colors.borderSubtle,
        gap: 8,
    },
    editPlayerBadge: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: colors.bgGlassHover,
        justifyContent: 'center',
        alignItems: 'center',
    },
    editPlayerNumber: {
        fontSize: 11,
        fontWeight: '800',
        color: colors.primaryLight,
    },
    editPlayerInput: {
        flex: 1,
        height: 38,
        color: colors.textPrimary,
        fontSize: 14,
        fontWeight: '600',
    },
    removePlayerBtn: {
        padding: 4,
    },
    addPlayerRow: {
        flexDirection: 'row',
        gap: 8,
    },
    addPlayerInput: {
        flex: 1,
        height: 42,
        backgroundColor: colors.bgDeep,
        borderRadius: 12,
        paddingHorizontal: 12,
        color: colors.textPrimary,
        fontSize: 14,
        borderWidth: 1,
        borderColor: colors.borderLight,
    },
    addPlayerBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary,
        paddingHorizontal: 14,
        borderRadius: 12,
        gap: 4,
    },
    addPlayerBtnDisabled: {
        opacity: 0.4,
    },
    addPlayerBtnText: {
        color: '#FFFFFF',
        fontWeight: '800',
        fontSize: 13,
    },
    editActionRow: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 6,
    },
    cancelEditBtn: {
        flex: 1,
        backgroundColor: colors.bgGlassHover,
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.borderLight,
    },
    cancelEditBtnText: {
        color: colors.textSecondary,
        fontSize: 14,
        fontWeight: '700',
    },
    saveEditBtn: {
        flex: 1.5,
        borderRadius: 14,
        overflow: 'hidden',
    },
    saveEditGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
    },
    saveEditBtnText: {
        color: '#07080C',
        fontSize: 14,
        fontWeight: '900',
    },
});
