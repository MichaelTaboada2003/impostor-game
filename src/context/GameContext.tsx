import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Player, GameConfig, GameState, Theme, PlayerGroup, GameMode } from '../types/game';
import { getRandomWordEntry, themes as defaultThemes } from '../data/themes';
import { storageService } from '../services/storageService';

interface GameContextType {
    gameState: GameState;
    playerNames: string[];
    customThemes: Theme[];
    allThemes: Theme[];
    savedGroups: PlayerGroup[];
    setNumberOfPlayers: (num: number) => void;
    setNumberOfImpostors: (num: number) => void;
    setAllowHints: (allow: boolean) => void;
    setGameMode: (mode: GameMode) => void;
    setRoundTimerSeconds: (seconds: number) => void;
    setPlayerName: (index: number, name: string) => void;
    setPlayerNamesList: (names: string[]) => void;
    selectTheme: (themeId: string) => void;
    replayCurrentTheme: () => void;
    markPlayerAsSeen: (playerId: number) => void;
    nextPlayer: () => void;
    previousPlayer: () => void;
    setPhase: (phase: GameState['phase']) => void;
    resetGame: () => void;
    getCurrentPlayer: () => Player | null;
    addCustomTheme: (theme: Theme) => Promise<void>;
    deleteCustomTheme: (themeId: string) => Promise<void>;
    saveCurrentGroup: (name: string) => Promise<void>;
    loadGroup: (group: PlayerGroup) => void;
    updateGroup: (group: PlayerGroup) => Promise<void>;
    deleteGroup: (groupId: string) => Promise<void>;
    submitVote: (voterId: number, targetId: number) => void;
    calculateVotingResults: () => { ejectedPlayer: Player | null; winner: 'crewmates' | 'impostors' };
}

const initialGameState: GameState = {
    config: {
        numberOfPlayers: 4,
        numberOfImpostors: 1,
        themeId: '',
        allowHints: true,
        gameMode: 'classic',
        roundTimerSeconds: 120, // 2 minutos por defecto
    },
    players: [],
    secretWord: '',
    secretHint: '',
    undercoverWord: '',
    currentPlayerIndex: 0,
    phase: 'setup',
    ejectedPlayerId: null,
    winner: null,
    votingHistory: [],
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [gameState, setGameState] = useState<GameState>(initialGameState);
    const [playerNames, setPlayerNames] = useState<string[]>(
        Array.from({ length: 4 }, (_, i) => `Jugador ${i + 1}`)
    );
    const [customThemes, setCustomThemes] = useState<Theme[]>([]);
    const [savedGroups, setSavedGroups] = useState<PlayerGroup[]>([]);

    // Cargar temas personalizados y grupos guardados al iniciar
    useEffect(() => {
        const loadInitialData = async () => {
            const [loadedThemes, loadedGroups, recentNames] = await Promise.all([
                storageService.getCustomThemes(),
                storageService.getSavedGroups(),
                storageService.getRecentNames(),
            ]);
            setCustomThemes(loadedThemes);
            setSavedGroups(loadedGroups);
            if (recentNames && recentNames.length >= 3) {
                setPlayerNames(recentNames);
                setGameState(prev => ({
                    ...prev,
                    config: { ...prev.config, numberOfPlayers: recentNames.length }
                }));
            }
        };
        loadInitialData();
    }, []);

    const allThemes = [...defaultThemes, ...customThemes];

    const setNumberOfPlayers = (num: number) => {
        setGameState(prev => ({
            ...prev,
            config: { ...prev.config, numberOfPlayers: num },
        }));
        setPlayerNames(prev => {
            const newNames = [...prev];
            if (num > prev.length) {
                for (let i = prev.length; i < num; i++) {
                    newNames.push(`Jugador ${i + 1}`);
                }
            } else if (num < prev.length) {
                newNames.length = num;
            }
            storageService.saveRecentNames(newNames);
            return newNames;
        });
    };

    const setNumberOfImpostors = (num: number) => {
        setGameState(prev => ({
            ...prev,
            config: { ...prev.config, numberOfImpostors: num },
        }));
    };

    const setAllowHints = (allow: boolean) => {
        setGameState(prev => ({
            ...prev,
            config: { ...prev.config, allowHints: allow },
        }));
    };

    const setGameMode = (gameMode: GameMode) => {
        setGameState(prev => ({
            ...prev,
            config: { ...prev.config, gameMode },
        }));
    };

    const setRoundTimerSeconds = (roundTimerSeconds: number) => {
        setGameState(prev => ({
            ...prev,
            config: { ...prev.config, roundTimerSeconds },
        }));
    };

    const setPlayerName = (index: number, name: string) => {
        setPlayerNames(prev => {
            const newNames = [...prev];
            newNames[index] = name;
            storageService.saveRecentNames(newNames);
            return newNames;
        });
    };

    const setPlayerNamesList = (names: string[]) => {
        const validNames = names.filter(n => n.trim().length > 0);
        if (validNames.length >= 3) {
            setPlayerNames(validNames);
            setGameState(prev => ({
                ...prev,
                config: { ...prev.config, numberOfPlayers: validNames.length }
            }));
            storageService.saveRecentNames(validNames);
        }
    };

    const selectTheme = (themeId: string) => {
        const entry = getRandomWordEntry(themeId, customThemes);
        const { numberOfPlayers, numberOfImpostors, gameMode } = gameState.config;

        const impostorIndices: Set<number> = new Set();
        while (impostorIndices.size < numberOfImpostors) {
            impostorIndices.add(Math.floor(Math.random() * numberOfPlayers));
        }

        // En modo undercover, la palabra del impostor es una palabra parecida
        const undercoverWord = entry.undercoverPair || (entry.hint ? `${entry.hint} (${entry.word})` : `${entry.word} Alternativo`);

        const players: Player[] = Array.from({ length: numberOfPlayers }, (_, i) => {
            const isImpostor = impostorIndices.has(i);
            let playerWord = entry.word;
            if (isImpostor) {
                playerWord = gameMode === 'undercover' ? undercoverWord : '???';
            }

            return {
                id: i,
                name: playerNames[i] || `Jugador ${i + 1}`,
                isImpostor,
                word: playerWord,
                hint: entry.hint,
                hasSeenWord: false,
                votesReceived: 0,
            };
        });

        setGameState(prev => ({
            ...prev,
            config: { ...prev.config, themeId },
            secretWord: entry.word,
            secretHint: entry.hint,
            undercoverWord,
            players,
            currentPlayerIndex: 0,
            phase: 'role-distribution',
            ejectedPlayerId: null,
            winner: null,
            votingHistory: [],
        }));
    };

    const replayCurrentTheme = () => {
        if (gameState.config.themeId) {
            selectTheme(gameState.config.themeId);
        }
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
        setGameState(prev => ({
            ...initialGameState,
            config: {
                ...initialGameState.config,
                numberOfPlayers: prev.config.numberOfPlayers,
                numberOfImpostors: prev.config.numberOfImpostors,
                allowHints: prev.config.allowHints,
                gameMode: prev.config.gameMode,
                roundTimerSeconds: prev.config.roundTimerSeconds,
            },
        }));
    };

    const getCurrentPlayer = (): Player | null => {
        if (gameState.players.length === 0) return null;
        return gameState.players[gameState.currentPlayerIndex] || null;
    };

    // Temas Personalizados / IA
    const addCustomTheme = async (theme: Theme) => {
        const updated = await storageService.saveCustomTheme(theme);
        setCustomThemes(updated);
    };

    const deleteCustomTheme = async (themeId: string) => {
        const updated = await storageService.deleteCustomTheme(themeId);
        setCustomThemes(updated);
    };

    // Grupos de Jugadores
    const saveCurrentGroup = async (name: string) => {
        const currentActiveNames = playerNames.slice(0, gameState.config.numberOfPlayers);
        const updated = await storageService.saveGroup(name, currentActiveNames);
        setSavedGroups(updated);
    };

    const loadGroup = (group: PlayerGroup) => {
        setPlayerNamesList(group.players);
    };

    const updateGroup = async (group: PlayerGroup) => {
        const updated = await storageService.updateGroup(group);
        setSavedGroups(updated);
    };

    const deleteGroup = async (groupId: string) => {
        const updated = await storageService.deleteGroup(groupId);
        setSavedGroups(updated);
    };

    // Votación y Juicio
    const submitVote = (voterId: number, targetId: number) => {
        setGameState(prev => {
            const voter = prev.players.find(p => p.id === voterId);
            const target = prev.players.find(p => p.id === targetId);
            if (!voter || !target) return prev;

            const updatedPlayers = prev.players.map(p => {
                if (p.id === voterId) {
                    return { ...p, votedForId: targetId };
                }
                return p;
            });

            // Recalcular conteo de votos
            const voteCounts: Record<number, number> = {};
            updatedPlayers.forEach(p => {
                if (p.votedForId !== undefined) {
                    voteCounts[p.votedForId] = (voteCounts[p.votedForId] || 0) + 1;
                }
            });

            const finalPlayers = updatedPlayers.map(p => ({
                ...p,
                votesReceived: voteCounts[p.id] || 0,
            }));

            const newHistoryItem = {
                voterId,
                voterName: voter.name,
                targetId,
                targetName: target.name,
            };

            const updatedHistory = (prev.votingHistory || []).filter(h => h.voterId !== voterId);
            updatedHistory.push(newHistoryItem);

            return {
                ...prev,
                players: finalPlayers,
                votingHistory: updatedHistory,
            };
        });
    };

    const calculateVotingResults = (): { ejectedPlayer: Player | null; winner: 'crewmates' | 'impostors' } => {
        const voteCounts: Record<number, number> = {};
        gameState.players.forEach(p => {
            if (p.votedForId !== undefined) {
                voteCounts[p.votedForId] = (voteCounts[p.votedForId] || 0) + 1;
            }
        });

        let highestVotes = -1;
        let ejectedPlayerId: number | null = null;
        let isTie = false;

        Object.entries(voteCounts).forEach(([playerIdStr, count]) => {
            const pid = parseInt(playerIdStr, 10);
            if (count > highestVotes) {
                highestVotes = count;
                ejectedPlayerId = pid;
                isTie = false;
            } else if (count === highestVotes) {
                isTie = true;
            }
        });

        // En caso de empate o sin votos, no se expulsa a nadie
        const finalEjectedId = isTie ? null : ejectedPlayerId;
        const ejectedPlayer = finalEjectedId !== null ? gameState.players.find(p => p.id === finalEjectedId) || null : null;

        // Si expulsaron al impostor -> ganan tripulantes. Si no, gana el impostor.
        const winner: 'crewmates' | 'impostors' = ejectedPlayer?.isImpostor ? 'crewmates' : 'impostors';

        setGameState(prev => ({
            ...prev,
            ejectedPlayerId: finalEjectedId,
            winner,
            phase: 'results',
        }));

        return { ejectedPlayer, winner };
    };

    return (
        <GameContext.Provider
            value={{
                gameState,
                playerNames,
                customThemes,
                allThemes,
                savedGroups,
                setNumberOfPlayers,
                setNumberOfImpostors,
                setAllowHints,
                setGameMode,
                setRoundTimerSeconds,
                setPlayerName,
                setPlayerNamesList,
                selectTheme,
                replayCurrentTheme,
                markPlayerAsSeen,
                nextPlayer,
                previousPlayer,
                setPhase,
                resetGame,
                getCurrentPlayer,
                addCustomTheme,
                deleteCustomTheme,
                saveCurrentGroup,
                loadGroup,
                updateGroup,
                deleteGroup,
                submitVote,
                calculateVotingResults,
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
