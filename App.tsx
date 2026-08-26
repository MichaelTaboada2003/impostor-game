import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
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

import * as Updates from 'expo-updates';

export default function App() {
  React.useEffect(() => {
    async function checkForUpdates() {
      try {
        if (!__DEV__) {
          const update = await Updates.checkForUpdateAsync();
          if (update.isAvailable) {
            await Updates.fetchUpdateAsync();
            await Updates.reloadAsync();
          }
        }
      } catch (e) {
        // Silently ignore if offline or in local dev
      }
    }
    checkForUpdates();
  }, []);

  return (
    <SafeAreaProvider>
      <GameProvider>
        <SafeAreaView style={styles.container}>
          <StatusBar style="light" />
          <GameNavigator />
        </SafeAreaView>
      </GameProvider>
    </SafeAreaProvider>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
  },
});
