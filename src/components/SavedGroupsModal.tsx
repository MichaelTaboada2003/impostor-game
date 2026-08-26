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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PlayerGroup } from '../types/game';

interface SavedGroupsModalProps {
    visible: boolean;
    savedGroups: PlayerGroup[];
    currentNames: string[];
    onClose: () => void;
    onSelectGroup: (group: PlayerGroup) => void;
    onSaveGroup: (name: string) => void;
    onDeleteGroup: (groupId: string) => void;
}

export const SavedGroupsModal: React.FC<SavedGroupsModalProps> = ({
    visible,
    savedGroups,
    currentNames,
    onClose,
    onSelectGroup,
    onSaveGroup,
    onDeleteGroup,
}) => {
    const [newGroupName, setNewGroupName] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const handleSaveNew = () => {
        if (!newGroupName.trim()) {
            Alert.alert('Nombre requerido', 'Por favor ingresa un nombre para el grupo.');
            return;
        }
        onSaveGroup(newGroupName.trim());
        setNewGroupName('');
        setIsCreating(false);
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalCard}>
                    <LinearGradient
                        colors={['#1c1c38', '#101026', '#090918']}
                        style={styles.modalGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        {/* Header */}
                        <View style={styles.header}>
                            <View style={styles.headerTitleRow}>
                                <Text style={styles.headerEmoji}>👥</Text>
                                <View>
                                    <Text style={styles.title}>Grupos de Amigos</Text>
                                    <Text style={styles.subtitle}>Carga o guarda listas de jugadores</Text>
                                </View>
                            </View>
                            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                                <Text style={styles.closeBtnText}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Save Current Group Section */}
                        {isCreating ? (
                            <View style={styles.createBox}>
                                <Text style={styles.createLabel}>Nombre del nuevo grupo:</Text>
                                <View style={styles.createInputRow}>
                                    <TextInput
                                        style={styles.createInput}
                                        placeholder="Ej. Amigos del Colegio, Shalom..."
                                        placeholderTextColor="rgba(255, 255, 255, 0.4)"
                                        value={newGroupName}
                                        onChangeText={setNewGroupName}
                                        autoFocus
                                    />
                                    <TouchableOpacity style={styles.saveBtn} onPress={handleSaveNew}>
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
                                    colors={['rgba(108, 92, 231, 0.25)', 'rgba(108, 92, 231, 0.08)']}
                                    style={styles.saveCurrentGradient}
                                >
                                    <Text style={styles.saveCurrentIcon}>💾</Text>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.saveCurrentTitle}>Guardar grupo actual</Text>
                                        <Text style={styles.saveCurrentSubtitle}>
                                            {currentNames.join(', ')}
                                        </Text>
                                    </View>
                                    <Text style={styles.saveCurrentPlus}>+</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        )}

                        {/* Groups List */}
                        <ScrollView
                            style={styles.groupsList}
                            contentContainerStyle={styles.groupsListContent}
                            showsVerticalScrollIndicator={false}
                        >
                            <Text style={styles.listLabel}>Tus Grupos Guardados:</Text>
                            {savedGroups.length === 0 ? (
                                <Text style={styles.emptyText}>No tienes grupos guardados aún.</Text>
                            ) : (
                                savedGroups.map(group => (
                                    <TouchableOpacity
                                        key={group.id}
                                        style={styles.groupCard}
                                        onPress={() => {
                                            onSelectGroup(group);
                                            onClose();
                                        }}
                                        activeOpacity={0.8}
                                    >
                                        <LinearGradient
                                            colors={['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.02)']}
                                            style={styles.groupGradient}
                                        >
                                            <View style={styles.groupHeader}>
                                                <Text style={styles.groupName}>{group.name}</Text>
                                                <View style={styles.groupBadge}>
                                                    <Text style={styles.groupBadgeText}>
                                                        {group.players.length} jugadores
                                                    </Text>
                                                </View>
                                            </View>

                                            <Text style={styles.groupPlayersPreview} numberOfLines={2}>
                                                {group.players.join(' · ')}
                                            </Text>

                                            <View style={styles.groupActions}>
                                                <Text style={styles.loadActionText}>👉 Toca para cargar</Text>
                                                <TouchableOpacity
                                                    style={styles.deleteGroupBtn}
                                                    onPress={() => {
                                                        Alert.alert(
                                                            'Eliminar Grupo',
                                                            `¿Deseas eliminar el grupo "${group.name}"?`,
                                                            [
                                                                { text: 'Cancelar', style: 'cancel' },
                                                                { text: 'Eliminar', style: 'destructive', onPress: () => onDeleteGroup(group.id) },
                                                            ]
                                                        );
                                                    }}
                                                >
                                                    <Text style={styles.deleteGroupText}>🗑️</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                ))
                            )}
                        </ScrollView>
                    </LinearGradient>
                </View>
            </View>
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
        height: '80%',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    modalGradient: {
        flex: 1,
        padding: 24,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    headerTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    headerEmoji: {
        fontSize: 32,
    },
    title: {
        fontSize: 22,
        fontWeight: '900',
        color: '#FFFFFF',
    },
    subtitle: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.6)',
    },
    closeBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeBtnText: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 16,
        fontWeight: '700',
    },
    saveCurrentTrigger: {
        borderRadius: 18,
        overflow: 'hidden',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(108, 92, 231, 0.4)',
    },
    saveCurrentGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 14,
    },
    saveCurrentIcon: {
        fontSize: 22,
    },
    saveCurrentTitle: {
        fontSize: 15,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    saveCurrentSubtitle: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.5)',
        marginTop: 2,
    },
    saveCurrentPlus: {
        fontSize: 24,
        fontWeight: '700',
        color: '#A29BFE',
    },
    createBox: {
        backgroundColor: 'rgba(108, 92, 231, 0.15)',
        borderRadius: 18,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#6C5CE7',
    },
    createLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    createInputRow: {
        flexDirection: 'row',
        gap: 10,
    },
    createInput: {
        flex: 1,
        height: 48,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        borderRadius: 12,
        paddingHorizontal: 14,
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
    },
    saveBtn: {
        backgroundColor: '#6C5CE7',
        paddingHorizontal: 18,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    saveBtnText: {
        color: '#FFFFFF',
        fontWeight: '800',
        fontSize: 14,
    },
    cancelLink: {
        alignSelf: 'center',
        marginTop: 10,
    },
    cancelLinkText: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 12,
    },
    groupsList: {
        flex: 1,
    },
    groupsListContent: {
        paddingBottom: 20,
    },
    listLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: 'rgba(255, 255, 255, 0.6)',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    emptyText: {
        color: 'rgba(255, 255, 255, 0.4)',
        textAlign: 'center',
        marginTop: 20,
        fontSize: 14,
    },
    groupCard: {
        borderRadius: 18,
        overflow: 'hidden',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    groupGradient: {
        padding: 16,
    },
    groupHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    groupName: {
        fontSize: 17,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    groupBadge: {
        backgroundColor: 'rgba(0, 206, 201, 0.2)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },
    groupBadgeText: {
        fontSize: 11,
        color: '#00CEC9',
        fontWeight: '700',
    },
    groupPlayersPreview: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.6)',
        lineHeight: 18,
    },
    groupActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.05)',
    },
    loadActionText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#A29BFE',
    },
    deleteGroupBtn: {
        padding: 4,
    },
    deleteGroupText: {
        fontSize: 16,
    },
});
