import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Player, GameConfig, GameState } from '../types/game';
import { getRandomWordEntry, themes } from '../data/themes';

interface GameContextType {
    gameState: GameState;
    playerNames: string[];
    setNumberOfPlayers: (num: number) => void;
    setNumberOfImpostors: (num: number) => void;
    setPlayerName: (index: number, name: string) => void;
    selectTheme: (themeId: string) => void;
    initializePlayers: () => void;
    markPlayerAsSeen: (playerId: number) => void;
    nextPlayer: () => void;
    previousPlayer: () => void;
    setPhase: (phase: GameState['phase']) => void;
    resetGame: () => void;
    getCurrentPlayer: () => Player | null;
}

const initialGameState: GameState = {
    config: {
        numberOfPlayers: 4,
        numberOfImpostors: 1,
        themeId: '',
    },
    players: [],
    secretWord: '',
    secretHint: '',
    currentPlayerIndex: 0,
    phase: 'setup',
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [gameState, setGameState] = useState<GameState>(initialGameState);
    const [playerNames, setPlayerNames] = useState<string[]>(
        Array.from({ length: 4 }, (_, i) => `Jugador ${i + 1}`)
    );

    const setNumberOfPlayers = (num: number) => {
        setGameState(prev => ({
            ...prev,
            config: { ...prev.config, numberOfPlayers: num },
        }));
        // Ajustar el array de nombres
        setPlayerNames(prev => {
            const newNames = [...prev];
            if (num > prev.length) {
                // Agregar nuevos nombres
                for (let i = prev.length; i < num; i++) {
                    newNames.push(`Jugador ${i + 1}`);
                }
            } else if (num < prev.length) {
                // Recortar nombres
                newNames.length = num;
            }
            return newNames;
        });
    };

    const setNumberOfImpostors = (num: number) => {
        setGameState(prev => ({
            ...prev,
            config: { ...prev.config, numberOfImpostors: num },
        }));
    };

    const setPlayerName = (index: number, name: string) => {
        setPlayerNames(prev => {
            const newNames = [...prev];
            newNames[index] = name;
            return newNames;
        });
    };

    const selectTheme = (themeId: string) => {
        const entry = getRandomWordEntry(themeId);
        
        // Actualizar el estado del juego
        setGameState(prev => ({
            ...prev,
            config: { ...prev.config, themeId },
            secretWord: entry.word,
            secretHint: entry.hint,
            phase: 'role-distribution',
        }));

        // Inicializar jugadores inmediatamente con los datos frescos (evitando delay de state)
        const { numberOfPlayers, numberOfImpostors } = gameState.config;
        const impostorIndices: Set<number> = new Set();
        while (impostorIndices.size < numberOfImpostors) {
            impostorIndices.add(Math.floor(Math.random() * numberOfPlayers));
        }

        const players: Player[] = Array.from({ length: numberOfPlayers }, (_, i) => ({
            id: i,
            name: playerNames[i] || `Jugador ${i + 1}`,
            isImpostor: impostorIndices.has(i),
            word: impostorIndices.has(i) ? '???' : entry.word,
            hint: entry.hint,
            hasSeenWord: false,
        }));

        setGameState(prev => ({
            ...prev,
            players,
            currentPlayerIndex: 0,
        }));
    };

    const initializePlayers = () => {
        // Esta función ahora es redundante pero la mantenemos para compatibilidad
        // si se llama desde otros sitios, aunque ahora selectTheme hace el trabajo sucio.
    };

    const markPlayerAsSeen = (playerId: number) => {
        setGameState(prev => ({
            ...prev,
            players: prev.players.map(p =>
                p.id === playerId ? { ...p, hasSeenWord: true } : p
            ),
        }));
    };

    const nextPlayer = () => {
        setGameState(prev => {
            const nextIndex = prev.currentPlayerIndex + 1;
            if (nextIndex >= prev.players.length) {
                return { ...prev, phase: 'playing' };
            }
            return { ...prev, currentPlayerIndex: nextIndex };
        });
    };

    const previousPlayer = () => {
        setGameState(prev => ({
            ...prev,
            currentPlayerIndex: Math.max(0, prev.currentPlayerIndex - 1),
        }));
    };

    const setPhase = (phase: GameState['phase']) => {
        setGameState(prev => ({ ...prev, phase }));
    };

    const resetGame = () => {
        // Preservar los nombres de jugadores al iniciar nueva partida
        setGameState(prev => ({
            ...initialGameState,
            config: {
                ...initialGameState.config,
                // Mantener el número de jugadores actual para que coincida con los nombres
                numberOfPlayers: prev.config.numberOfPlayers,
                numberOfImpostors: prev.config.numberOfImpostors,
            },
        }));
        // Los nombres NO se resetean — se conservan para la próxima partida
    };

    const getCurrentPlayer = (): Player | null => {
        if (gameState.players.length === 0) return null;
        return gameState.players[gameState.currentPlayerIndex] || null;
    };

    return (
        <GameContext.Provider
            value={{
                gameState,
                playerNames,
                setNumberOfPlayers,
                setNumberOfImpostors,
                setPlayerName,
                selectTheme,
                initializePlayers,
                markPlayerAsSeen,
                nextPlayer,
                previousPlayer,
                setPhase,
                resetGame,
                getCurrentPlayer,
            }}
        >
            {children}
        </GameContext.Provider>
    );
};

export const useGame = () => {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error('useGame must be used within a GameProvider');
    }
    return context;
};
