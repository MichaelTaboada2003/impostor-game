export interface Player {
    id: number;
    name: string;
    isImpostor: boolean;
    word: string;
    hint: string;
    hasSeenWord: boolean;
}

export interface GameConfig {
    numberOfPlayers: number;
    numberOfImpostors: number;
    themeId: string;
}

export interface GameState {
    config: GameConfig;
    players: Player[];
    secretWord: string;
    secretHint: string;
    currentPlayerIndex: number;
    phase: 'setup' | 'player-names' | 'theme-selection' | 'role-distribution' | 'playing' | 'voting' | 'results';
}
