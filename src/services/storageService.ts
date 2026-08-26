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
            if (!data) return [];
            const parsed = JSON.parse(data);
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            console.error('Error loading custom themes:', error);
            return [];
        }
    },

    async saveCustomTheme(theme: Theme): Promise<Theme[]> {
        try {
            if (!theme || !theme.id) return [];
            const current = await this.getCustomThemes();
            const filtered = current.filter(t => t && t.id !== theme.id);
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
            if (!themeId) return [];
            const current = await this.getCustomThemes();
            const updated = current.filter(t => t && t.id !== themeId);
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
            if (!data) return [];
            const parsed = JSON.parse(data);
            return Array.isArray(parsed) ? parsed : [];
        } catch (error) {
            console.error('Error loading saved groups:', error);
            return [];
        }
    },

    async saveGroup(name: string, players: string[]): Promise<PlayerGroup[]> {
        try {
            const current = await this.getSavedGroups();
            const validPlayers = Array.isArray(players) ? players.filter(p => typeof p === 'string' && p.trim().length > 0) : [];
            const newGroup: PlayerGroup = {
                id: `group_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                name: name && name.trim() ? name.trim() : 'Nuevo Grupo',
                players: validPlayers.length > 0 ? validPlayers : ['Jugador 1', 'Jugador 2', 'Jugador 3', 'Jugador 4'],
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
            if (!updatedGroup || !updatedGroup.id) return [];
            const current = await this.getSavedGroups();
            const updated = current.map(g => (g && g.id === updatedGroup.id ? updatedGroup : g));
            await AsyncStorage.setItem(SAVED_GROUPS_KEY, JSON.stringify(updated));
            return updated;
        } catch (error) {
            console.error('Error updating player group:', error);
            return [];
        }
    },

    async deleteGroup(groupId: string): Promise<PlayerGroup[]> {
        try {
            if (!groupId) return [];
            const current = await this.getSavedGroups();
            const updated = current.filter(g => g && g.id !== groupId);
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
            if (Array.isArray(names)) {
                await AsyncStorage.setItem(RECENT_NAMES_KEY, JSON.stringify(names));
            }
        } catch (error) {
            console.error('Error saving recent names:', error);
        }
    },

    async getRecentNames(): Promise<string[] | null> {
        try {
            const data = await AsyncStorage.getItem(RECENT_NAMES_KEY);
            if (!data) return null;
            const parsed = JSON.parse(data);
            return Array.isArray(parsed) ? parsed : null;
        } catch (error) {
            console.error('Error getting recent names:', error);
            return null;
        }
    },
};
