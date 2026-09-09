import React, { Component, ErrorInfo, ReactNode } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as Updates from 'expo-updates';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { GameProvider, useGame } from './src/context/GameContext';
import { SetupScreen } from './src/screens/SetupScreen';
import { PlayerNamesScreen } from './src/screens/PlayerNamesScreen';
import { ThemeSelectionScreen } from './src/screens/ThemeSelectionScreen';
import { RoleDistributionScreen } from './src/screens/RoleDistributionScreen';
import { PlayingScreen } from './src/screens/PlayingScreen';
import { VotingScreen } from './src/screens/VotingScreen';
import { ResultsScreen } from './src/screens/ResultsScreen';
import { colors } from './src/styles/colors';

// Safe Error Boundary to prevent crashes
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorText: string;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorText: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, errorText: error.message || 'Error inesperado' };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('App ErrorBoundary caught:', error, errorInfo);
  }

  handleRestart = () => {
    this.setState({ hasError: false, errorText: '' });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorEmoji}>⚠️</Text>
          <Text style={styles.errorTitle}>Algo no salió como esperábamos</Text>
          <Text style={styles.errorSubtitle}>{this.state.errorText}</Text>
          <TouchableOpacity style={styles.errorButton} onPress={this.handleRestart} activeOpacity={0.8}>
            <Text style={styles.errorButtonText}>Reiniciar Aplicación</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const GameNavigator: React.FC = () => {
  const { gameState, setPhase } = useGame();

  const handleSetupNext = () => {
    setPhase('player-names');
  };

  const handlePlayerNamesBack = () => {
    setPhase('setup');
  };

  const handlePlayerNamesNext = () => {
    setPhase('theme-selection');
  };

  const handleThemeBack = () => {
    setPhase('player-names');
  };

  const handleThemeNext = () => {
    setPhase('role-distribution');
  };

  const handleRoleBack = () => {
    setPhase('theme-selection');
  };

  const handleRoleComplete = () => {
    setPhase('playing');
  };

  const handleStartVoting = () => {
    setPhase('voting');
  };

  const handleVotingBackToDiscussion = () => {
    setPhase('playing');
  };

  const handleVotingComplete = () => {
    setPhase('results');
  };

  const handleResultsReplay = () => {
    setPhase('role-distribution');
  };

  const handleResultsNewGame = () => {
    setPhase('theme-selection');
  };

  const handleNewGame = () => {
    setPhase('setup');
  };

  switch (gameState.phase) {
    case 'setup':
      return <SetupScreen onNext={handleSetupNext} />;
    case 'player-names':
      return (
        <PlayerNamesScreen
          onBack={handlePlayerNamesBack}
          onNext={handlePlayerNamesNext}
        />
      );
    case 'theme-selection':
      return (
        <ThemeSelectionScreen
          onBack={handleThemeBack}
          onNext={handleThemeNext}
        />
      );
    case 'role-distribution':
      return (
        <RoleDistributionScreen
          onBack={handleRoleBack}
          onComplete={handleRoleComplete}
        />
      );
    case 'playing':
      return (
        <PlayingScreen
          onStartVoting={handleStartVoting}
          onNewGame={handleNewGame}
        />
      );
    case 'voting':
      return (
        <VotingScreen
          onBackToDiscussion={handleVotingBackToDiscussion}
          onVotedComplete={handleVotingComplete}
        />
      );
    case 'results':
      return (
        <ResultsScreen
          onReplay={handleResultsReplay}
          onNewGame={handleResultsNewGame}
        />
      );
    default:
      return <SetupScreen onNext={handleSetupNext} />;
  }
};

// Estado de la actualizacion OTA. 'idle' incluye tanto "no hay nada nuevo" como
// "no se pudo comprobar": en ambos casos la app arranca normal con el bundle actual.
type UpdateStatus = 'idle' | 'downloading' | 'reloading';

// Busca y aplica actualizaciones OTA al arrancar. Sin esto expo-updates descarga
// el bundle en segundo plano pero solo lo aplica en el ARRANQUE SIGUIENTE, asi que
// los cambios tardaban dos aperturas en verse.
function useOtaUpdate(): UpdateStatus {
  const [status, setStatus] = React.useState<UpdateStatus>('idle');

  React.useEffect(() => {
    let cancelled = false;

    // En dev, en Expo Go o en un dev client no hay updates que buscar y
    // checkForUpdateAsync lanza excepcion, asi que ni se intenta.
    if (__DEV__ || !Updates.isEnabled) return;

    (async () => {
      try {
        const result = await Updates.checkForUpdateAsync();
        if (cancelled || !result.isAvailable) return;

        setStatus('downloading');
        await Updates.fetchUpdateAsync();
        if (cancelled) return;

        setStatus('reloading');
        await Updates.reloadAsync();
      } catch {
        // Sin conexion o servidor de updates caido: se sigue con el bundle actual.
        if (!cancelled) setStatus('idle');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return status;
}

// Aviso visible durante la descarga para que el reinicio no tome por sorpresa.
// No se monta en el arranque normal, solo cuando ya se confirmo que hay update.
const UpdateOverlay: React.FC<{ status: UpdateStatus }> = ({ status }) => {
  if (status === 'idle') return null;

  return (
    <View style={styles.updateOverlay}>
      <ActivityIndicator size="large" color="#7952FF" />
      <Text style={styles.updateTitle}>
        {status === 'downloading' ? 'Descargando actualizacion' : 'Aplicando actualizacion'}
      </Text>
      <Text style={styles.updateSubtitle}>Esto toma solo unos segundos</Text>
    </View>
  );
};

export default function App() {
  const updateStatus = useOtaUpdate();

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <GameProvider>
          <SafeAreaView style={styles.container}>
            <StatusBar style="light" />
            <GameNavigator />
            <UpdateOverlay status={updateStatus} />
          </SafeAreaView>
        </GameProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#0a0a1a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: 14,
    color: '#A0A5B5',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  errorButton: {
    backgroundColor: '#7952FF',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
  },
  errorButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  updateOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 10, 26, 0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  updateTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 20,
    textAlign: 'center',
  },
  updateSubtitle: {
    fontSize: 13,
    color: '#A0A5B5',
    marginTop: 6,
    textAlign: 'center',
  },
});
