export interface Player {
    id: number;
    name: string;
    isImpostor: boolean;
    word: string;
    hint: string;
    hasSeenWord: boolean;
    votedForId?: number;
    votesReceived?: number;
}

export type GameMode = 'classic' | 'undercover';

export interface GameConfig {
    numberOfPlayers: number;
    numberOfImpostors: number;
    themeId: string;
    allowHints: boolean;
    gameMode: GameMode;
    roundTimerSeconds: number; // 0 = sin límite, 60, 120, 180, 300
}

export interface WordEntry {
    word: string;
    hint: string;
    undercoverPair?: string; // Palabra similar para el impostor en modo undercover
}

export interface Theme {
    id: string;
    name: string;
    icon: string;
    color: string;
    words: WordEntry[];
    noHints?: boolean;
    isAiGenerated?: boolean;
    createdAt?: number;
    description?: string;
}

export interface PlayerGroup {
    id: string;
    name: string;
    players: string[];
    createdAt: number;
}

export interface GameState {
    config: GameConfig;
    players: Player[];
    secretWord: string;
    secretHint: string;
    undercoverWord?: string;
    currentPlayerIndex: number;
    phase: 'setup' | 'player-names' | 'theme-selection' | 'role-distribution' | 'playing' | 'voting' | 'results';
    currentRound: number;
    maxRounds: number;
    ejectedPlayerId?: number | null;
    winner?: 'crewmates' | 'impostors' | null;
    votingHistory?: {
        voterId: number;
        voterName: string;
        targetId: number;
        targetName: string;
    }[];
}
