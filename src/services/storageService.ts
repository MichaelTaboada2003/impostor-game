import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme, PlayerGroup } from '../types/game';

const CUSTOM_THEMES_KEY = '@impostor_custom_themes_v1';
const SAVED_GROUPS_KEY = '@impostor_saved_groups_v1';
const RECENT_NAMES_KEY = '@impostor_recent_names_v1';

export const storageService = {
    // Custom AI themes
    async getCustomThemes(): Promise<Theme[]> {
        try {
            const data = await AsyncStorage.getItem(CUSTOM_THEMES_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error loading custom themes:', error);
            return [];
        }
    },

    async saveCustomTheme(theme: Theme): Promise<Theme[]> {
        try {
            const current = await this.getCustomThemes();
            // Remove existing with same id if any, then prepend
            const filtered = current.filter(t => t.id !== theme.id);
            const updated = [theme, ...filtered];
            await AsyncStorage.setItem(CUSTOM_THEMES_KEY, JSON.stringify(updated));
            return updated;
        } catch (error) {
            console.error('Error saving custom theme:', error);
            return [];
        }
    },

    async deleteCustomTheme(themeId: string): Promise<Theme[]> {
        try {
            const current = await this.getCustomThemes();
            const updated = current.filter(t => t.id !== themeId);
            await AsyncStorage.setItem(CUSTOM_THEMES_KEY, JSON.stringify(updated));
            return updated;
        } catch (error) {
            console.error('Error deleting custom theme:', error);
            return [];
        }
    },

    // Player Groups
    async getSavedGroups(): Promise<PlayerGroup[]> {
        try {
            const data = await AsyncStorage.getItem(SAVED_GROUPS_KEY);
            if (data) return JSON.parse(data);

            // Default initial preset groups if none exist
            const defaults: PlayerGroup[] = [
                {
                    id: 'amigos-default',
                    name: 'Amigos de Fiesta',
                    players: ['Carlos', 'Laura', 'Mateo', 'Sofia', 'Andres'],
                    createdAt: Date.now(),
                },
                {
                    id: 'familia-default',
                    name: 'Familia',
                    players: ['Papá', 'Mamá', 'Hijo', 'Hija', 'Tío'],
                    createdAt: Date.now(),
                }
            ];
            await AsyncStorage.setItem(SAVED_GROUPS_KEY, JSON.stringify(defaults));
            return defaults;
        } catch (error) {
            console.error('Error loading saved groups:', error);
            return [];
        }
    },

    async saveGroup(name: string, players: string[]): Promise<PlayerGroup[]> {
        try {
            const current = await this.getSavedGroups();
            const newGroup: PlayerGroup = {
                id: `group_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                name: name.trim() || 'Nuevo Grupo',
                players: players.filter(p => p.trim().length > 0),
                createdAt: Date.now(),
            };
            const updated = [newGroup, ...current];
            await AsyncStorage.setItem(SAVED_GROUPS_KEY, JSON.stringify(updated));
            return updated;
        } catch (error) {
            console.error('Error saving player group:', error);
            return [];
        }
    },

    async updateGroup(updatedGroup: PlayerGroup): Promise<PlayerGroup[]> {
        try {
            const current = await this.getSavedGroups();
            const updated = current.map(g => (g.id === updatedGroup.id ? updatedGroup : g));
            await AsyncStorage.setItem(SAVED_GROUPS_KEY, JSON.stringify(updated));
            return updated;
        } catch (error) {
            console.error('Error updating player group:', error);
            return [];
        }
    },


    async deleteGroup(groupId: string): Promise<PlayerGroup[]> {
        try {
            const current = await this.getSavedGroups();
            const updated = current.filter(g => g.id !== groupId);
            await AsyncStorage.setItem(SAVED_GROUPS_KEY, JSON.stringify(updated));
            return updated;
        } catch (error) {
            console.error('Error deleting player group:', error);
            return [];
        }
    },

    // Save recent players for quick memory
    async saveRecentNames(names: string[]): Promise<void> {
        try {
            await AsyncStorage.setItem(RECENT_NAMES_KEY, JSON.stringify(names));
        } catch (error) {
            console.error('Error saving recent names:', error);
        }
    },

    async getRecentNames(): Promise<string[] | null> {
        try {
            const data = await AsyncStorage.getItem(RECENT_NAMES_KEY);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error getting recent names:', error);
            return null;
        }
    },
};
