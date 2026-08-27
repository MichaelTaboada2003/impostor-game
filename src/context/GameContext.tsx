import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
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
    selectTheme: (themeIdOrTheme: string | Theme, overrideCustomThemes?: Theme[]) => void;
    replayCurrentTheme: () => void;
    markPlayerAsSeen: (playerId: number) => void;
    nextPlayer: () => void;
    previousPlayer: () => void;
    setPhase: (phase: GameState['phase']) => void;
    resetGame: () => void;
    getCurrentPlayer: () => Player | null;
    addCustomTheme: (theme: Theme) => Promise<Theme[]>;
    deleteCustomTheme: (themeId: string) => Promise<void>;

    saveCurrentGroup: (name: string) => Promise<void>;
    loadGroup: (group: PlayerGroup) => void;
    updateGroup: (group: PlayerGroup) => Promise<void>;
    deleteGroup: (groupId: string) => Promise<void>;
    submitVote: (voterId: number, targetId: number) => void;
    calculateVotingResults: () => {
        ejectedPlayer: Player | null;
        winner: 'crewmates' | 'impostors' | null;
        isGameOver: boolean;
        currentRound: number;
        maxRounds: number;
    };
    continueToNextRound: () => void;
}

// Con N jugadores los impostores nunca pueden ser mayoria: como maximo la mitad.
// Centralizado aqui porque numberOfPlayers se cambia por tres vias distintas
// (ajuste manual, cargar un grupo guardado y editar la lista de nombres) y todas
// deben respetar el limite.
export const maxImpostorsFor = (numPlayers: number): number =>
    Math.max(1, Math.floor(numPlayers / 2));

export const clampImpostors = (numImpostors: number, numPlayers: number): number =>
    Math.min(Math.max(1, numImpostors), maxImpostorsFor(numPlayers));

export const calculateMaxRounds = (numPlayers: number): number => {
    if (numPlayers <= 3) return 1;
    if (numPlayers === 4) return 2;
    if (numPlayers === 5) return 3;
    return 4; // Máximo 4 rondas
};

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
    currentRound: 1,
    maxRounds: 2,
    ejectedPlayerId: null,
    winner: null,
    votingHistory: [],
};


const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [gameState, setGameState] = useState<GameState>(initialGameState);

    // setGameState solo surte efecto en el siguiente render, asi que cualquier
    // lectura hecha en el mismo manejador que acaba de escribir ve datos viejos.
    // Esta ref se actualiza de forma sincrona en cada escritura, y es lo que
    // permite que la votacion cuente el ultimo voto emitido.
    const gameStateRef = useRef<GameState>(initialGameState);

    const applyGameState = (
        updater: GameState | ((prev: GameState) => GameState)
    ) => {
        const next =
            typeof updater === 'function'
                ? (updater as (prev: GameState) => GameState)(gameStateRef.current)
                : updater;
        gameStateRef.current = next;
        setGameState(next);
    };
    const [playerNames, setPlayerNames] = useState<string[]>(
        Array.from({ length: 4 }, (_, i) => `Jugador ${i + 1}`)
    );
    const [customThemes, setCustomThemes] = useState<Theme[]>([]);
    const [savedGroups, setSavedGroups] = useState<PlayerGroup[]>([]);

    // Cargar temas personalizados y grupos guardados al iniciar
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [loadedThemes, loadedGroups, recentNames] = await Promise.all([
                    storageService.getCustomThemes(),
                    storageService.getSavedGroups(),
                    storageService.getRecentNames(),
                ]);
                if (Array.isArray(loadedThemes)) {
                    setCustomThemes(loadedThemes);
                }
                if (Array.isArray(loadedGroups)) {
                    setSavedGroups(loadedGroups);
                }
                if (recentNames && Array.isArray(recentNames) && recentNames.length >= 3) {
                    const validNames = recentNames.map(n => String(n || ''));
                    setPlayerNames(validNames);
                    const count = Math.min(16, Math.max(3, validNames.length));
                    applyGameState(prev => ({
                        ...prev,
                        config: {
                            ...prev.config,
                            numberOfPlayers: count,
                            numberOfImpostors: clampImpostors(prev.config.numberOfImpostors, count),
                        },
                    }));
                }
            } catch (err) {
                console.error('Error during GameContext loadInitialData:', err);
            }
        };
        loadInitialData();
    }, []);

    const allThemes = Array.isArray(customThemes)
        ? [...defaultThemes, ...customThemes]
        : defaultThemes;


    const setNumberOfPlayers = (num: number) => {
        applyGameState(prev => ({
            ...prev,
            config: {
                ...prev.config,
                numberOfPlayers: num,
                numberOfImpostors: clampImpostors(prev.config.numberOfImpostors, num),
            },
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
        applyGameState(prev => ({
            ...prev,
            config: {
                ...prev.config,
                numberOfImpostors: clampImpostors(num, prev.config.numberOfPlayers),
            },
        }));
    };

    const setAllowHints = (allow: boolean) => {
        applyGameState(prev => ({
            ...prev,
            config: { ...prev.config, allowHints: allow },
        }));
    };

    const setGameMode = (gameMode: GameMode) => {
        applyGameState(prev => ({
            ...prev,
            config: { ...prev.config, gameMode },
        }));
    };

    const setRoundTimerSeconds = (roundTimerSeconds: number) => {
        applyGameState(prev => ({
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
            applyGameState(prev => ({
                ...prev,
                config: {
                    ...prev.config,
                    numberOfPlayers: validNames.length,
                    numberOfImpostors: clampImpostors(prev.config.numberOfImpostors, validNames.length),
                },
            }));
            storageService.saveRecentNames(validNames);
        }
    };

    const selectTheme = (themeIdOrTheme: string | Theme, overrideCustomThemes?: Theme[]) => {
        let themeObj: Theme | undefined;
        let themeId: string;

        if (typeof themeIdOrTheme === 'object' && themeIdOrTheme !== null) {
            themeObj = themeIdOrTheme;
            themeId = themeObj.id;
        } else {
            themeId = themeIdOrTheme;
            const all = [...defaultThemes, ...(overrideCustomThemes || customThemes)];
            themeObj = all.find(t => t.id === themeId);
        }

        if (!themeObj || !themeObj.words || themeObj.words.length === 0) {
            themeObj = defaultThemes[0];
            themeId = themeObj.id;
        }

        const entry = getRandomWordEntry(themeObj);

        // Se lee de la ref y no del estado del render: selectTheme se llama a
        // menudo justo despues de ajustar la configuracion.
        const { numberOfPlayers, gameMode } = gameStateRef.current.config;
        const numberOfImpostors = clampImpostors(
            gameStateRef.current.config.numberOfImpostors,
            numberOfPlayers
        );

        // Reparto por mezcla en lugar de sortear indices hasta completar el cupo:
        // el bucle de rechazo anterior no terminaba nunca si los impostores
        // superaban a los jugadores, algo alcanzable al cargar un grupo guardado
        // mas pequeno que la partida configurada.
        const shuffledIndices = Array.from({ length: numberOfPlayers }, (_, i) => i);
        for (let i = shuffledIndices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledIndices[i], shuffledIndices[j]] = [shuffledIndices[j], shuffledIndices[i]];
        }
        const impostorIndices = new Set(shuffledIndices.slice(0, numberOfImpostors));

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

        const maxRounds = calculateMaxRounds(numberOfPlayers);

        applyGameState(prev => ({
            ...prev,
            config: { ...prev.config, themeId, numberOfImpostors },
            secretWord: entry.word,
            secretHint: entry.hint,
            undercoverWord,
            players,
            currentPlayerIndex: 0,
            phase: 'role-distribution',
            currentRound: 1,
            maxRounds,
            ejectedPlayerId: null,
            winner: null,
            votingHistory: [],
        }));
    };



    const replayCurrentTheme = () => {
        const themeId = gameStateRef.current.config.themeId;
        if (themeId) {
            selectTheme(themeId);
        }
    };

    const markPlayerAsSeen = (playerId: number) => {
        applyGameState(prev => ({
            ...prev,
            players: prev.players.map(p =>
                p.id === playerId ? { ...p, hasSeenWord: true } : p
            ),
        }));
    };

    const nextPlayer = () => {
        applyGameState(prev => {
            const nextIndex = prev.currentPlayerIndex + 1;
            if (nextIndex >= prev.players.length) {
                return { ...prev, phase: 'playing' };
            }
            return { ...prev, currentPlayerIndex: nextIndex };
        });
    };

    const previousPlayer = () => {
        applyGameState(prev => ({
            ...prev,
            currentPlayerIndex: Math.max(0, prev.currentPlayerIndex - 1),
        }));
    };

    const setPhase = (phase: GameState['phase']) => {
        applyGameState(prev => ({ ...prev, phase }));
    };

    const resetGame = () => {
        applyGameState(prev => ({
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
        return updated;
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
        applyGameState(prev => {
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

    const calculateVotingResults = (): {
        ejectedPlayer: Player | null;
        winner: 'crewmates' | 'impostors' | null;
        isGameOver: boolean;
        currentRound: number;
        maxRounds: number;
    } => {
        // Desde la ref, no desde el estado del render: esta funcion se invoca en
        // el mismo manejador que acaba de registrar el voto del ultimo jugador,
        // que de otro modo quedaba fuera del recuento.
        const current = gameStateRef.current;

        const voteCounts: Record<number, number> = {};
        current.players.forEach(p => {
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
        const ejectedPlayer = finalEjectedId !== null ? current.players.find(p => p.id === finalEjectedId) || null : null;

        let winner: 'crewmates' | 'impostors' | null = null;
        let isGameOver = false;

        if (ejectedPlayer?.isImpostor) {
            // El impostor fue descubierto y expulsado -> Ganan los tripulantes inmediatamente
            winner = 'crewmates';
            isGameOver = true;
        } else {
            // El impostor NO fue expulsado (se expulsó a un inocente o hubo empate)
            if (current.currentRound >= current.maxRounds) {
                // El impostor sobrevivió todas las rondas requeridas -> Gana el impostor
                winner = 'impostors';
                isGameOver = true;
            } else {
                // Aún quedan rondas por jugar
                winner = null;
                isGameOver = false;
            }
        }

        applyGameState(prev => ({
            ...prev,
            ejectedPlayerId: finalEjectedId,
            winner,
            phase: isGameOver ? 'results' : prev.phase,
        }));

        return {
            ejectedPlayer,
            winner,
            isGameOver,
            currentRound: current.currentRound,
            maxRounds: current.maxRounds,
        };
    };

    const continueToNextRound = () => {
        applyGameState(prev => ({
            ...prev,
            currentRound: prev.currentRound + 1,
            ejectedPlayerId: null,
            // Sin esto el historial arrastraba los votos de la ronda anterior
            // mientras votedForId ya se habia limpiado, dejando la votacion en
            // dos estados contradictorios.
            votingHistory: [],
            players: prev.players.map(p => ({
                ...p,
                votedForId: undefined,
                votesReceived: 0,
            })),
            phase: 'playing',
        }));
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
                continueToNextRound,
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
