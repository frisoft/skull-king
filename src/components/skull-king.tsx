import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

// Define types for player score and round
interface SpecialCards {
  [key: string]: number;
}

interface PlayerScore {
  name: string;
  bid: number | null;
  tricks: number | null;
  specialCards: SpecialCards;
  score: number;
}

interface Round {
  roundNumber: number;
  playerScores: PlayerScore[];
}

const SkullKing: React.FC = () => {

  const MIN_PLAYERS = 2;
  const MAX_PLAYERS = 8;
  
  const [players, setPlayers] = useState(['Player 1', 'Player 2']);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);

  const specialCards = [
    { name: 'Mermaid', max: 2 },
    { name: 'Pirate', max: 5 },
    { name: 'S. King', max: 1 },
    { name: '+10', max: 5 }
  ];

  const resetGame = () => {
    // setPlayers(['Player 1', 'Player 2']);
    setRounds([]);
    setCurrentRoundIndex(0);
  };

  const shouldDisableTricks = (playerScore: PlayerScore) => {
    return playerScore.bid === null;
  };

  const shouldEnableSpecialCards = (playerScore: PlayerScore) => {
    return playerScore.bid !== null && playerScore.tricks !== null &&
         playerScore.bid !== 0 && playerScore.tricks !== 0 &&
         playerScore.bid === playerScore.tricks;
  };

  const canAddPlayer = () => {
    return players.length < MAX_PLAYERS;
  };
  
  const canRemovePlayer = () => {
   return players.length > MIN_PLAYERS;
  };
  
  const shouldEnableNextRound = (rounds: Round[], currentRoundIndex: number) => {
    return rounds.length === 0 || (currentRoundIndex === rounds.length - 1 && rounds.length < 10)
  };

  const isCurrentRoundComplete = (rounds: Round[], currentRoundIndex: number) => {
    if (rounds.length === 0) return true;
    const currentRound = rounds[currentRoundIndex];
    return currentRound.playerScores.every(playerScore =>
      playerScore.bid !== null && playerScore.tricks !== null
    );
  };

  const addPlayer = () => {
    setPlayers([...players, `Player ${players.length + 1}`]);
  };

  const removePlayer = (index: number) => {
    const updatedPlayers = players.filter((_, i) => i !== index);
    setPlayers(updatedPlayers);
  };

  const updatePlayerName = (index: number, newName: string) => {
    const updatedPlayers = [...players];
    updatedPlayers[index] = newName;
    setPlayers(updatedPlayers);
  };

  const initializeRound = () => {
    const newRound = {
      roundNumber: rounds.length + 1,
      playerScores: players.map(player => ({
        name: player,
        bid: null,
        tricks: null,
        specialCards: specialCards.reduce((acc, card) => ({ ...acc, [card.name]: 0 }), {}),
        score: 0
      }))
    };

    setRounds([...rounds, newRound]);
    setCurrentRoundIndex(rounds.length);
  };

  const cycleValue = (value: number, max: number) => {
    if (value === null) return 0;
    return (value + 1) > max ? 0 : value + 1;
  };

  const updatePlayerScore = (playerIndex: number, field: keyof PlayerScore) => {
    const updatedRounds = [...rounds];
    const round = updatedRounds[currentRoundIndex];
    const player = round.playerScores[playerIndex];
    
    const maxValue = round.roundNumber;

    if (field === 'bid' || field === 'tricks') {
      if (player[field] === null) {
        player[field] = 0;
      } else {
        player[field] = cycleValue(player[field], maxValue);
      }
    }

    calculateScore(updatedRounds, currentRoundIndex, playerIndex);
    setRounds(updatedRounds);
  };

  const updateSpecialCard = (playerIndex: number, cardName: string) => {
    const updatedRounds = [...rounds];
    const player = updatedRounds[currentRoundIndex].playerScores[playerIndex];
    const card = specialCards.find(card => card.name === cardName);

    if (card) {
      const cardMax = card.max;
      player.specialCards[cardName] = cycleValue(player.specialCards[cardName], cardMax);
      calculateScore(updatedRounds, currentRoundIndex, playerIndex);
      setRounds(updatedRounds);
    }
  };

  const calculateScore = (rounds: Round[], roundIndex: number, playerIndex: number) => {
    const round = rounds[roundIndex];
    const player = round.playerScores[playerIndex];
    const extraPoints =
      player.specialCards['Mermaid'] * 20 +
      player.specialCards['Pirate'] * 30 +
      player.specialCards['S. King'] * 40 +
      player.specialCards['+10'] * 10;

    if (player.bid === null || player.tricks === null) {
      player.score = 0;
    } else if (player.bid === 0) {
      player.score = round.roundNumber * (player.tricks === 0 ? 10 : -10);
    } else {
      if (player.bid === player.tricks) {
        player.score = player.bid * 20 + extraPoints;
      } else {
        player.score = Math.abs(player.bid - player.tricks) * -10;
      }
    }
  };

  const calculateTotal = (playerIndex: number) => {
    return rounds.reduce((total, round) => {
      const playerScore = round.playerScores[playerIndex];
      return total + (playerScore ? playerScore.score : 0);
    }, 0);
  };

  const getSortedPlayerScores = () => {
    return players.map((player, index) => ({
      name: player,
      score: calculateTotal(index)
    })).sort((a, b) => b.score - a.score);
  };

  const navigateRound = (direction: number) => {
    const newIndex = currentRoundIndex + direction;
    if (newIndex >= 0 && newIndex < rounds.length) {
      setCurrentRoundIndex(newIndex);
    }
  };

  if (rounds.length === 0) {
    return (
      <div className="p-2 max-w-sm mx-auto">
        <h1 className="text-xl font-bold mb-2">Skull King</h1>
        <Card className="mb-2">
          <CardHeader className="p-2">
            <CardTitle className="text-lg">Players</CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            {players.map((player, index) => (
              <div key={index} className="flex items-center mb-2">
                <Input
                  value={player}
                  onChange={(e) => updatePlayerName(index, e.target.value)}
                  className="flex-grow mr-2"
                />
                <Button onClick={() => removePlayer(index)} className="p-1" disabled={!canRemovePlayer()}><X size={16} /></Button>
              </div>
            ))}
            <Button onClick={addPlayer} className="w-full mt-2" disabled={!canAddPlayer()}>Add Player</Button>
          </CardContent>
        </Card>
        {shouldEnableNextRound(rounds, currentRoundIndex) && (
          <Button onClick={initializeRound} className="w-full">
            Start Round 1
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="p-2 max-w-sm mx-auto">
      <h1 className="text-xl font-bold mb-2">Skull King</h1>
      <Card className="mb-2">
        <CardHeader className="p-2">
          <CardTitle className="text-lg flex justify-between items-center">
            <Button onClick={() => navigateRound(-1)} disabled={currentRoundIndex === 0} className="p-1"><ChevronLeft size={16} /></Button>
            Round {rounds[currentRoundIndex].roundNumber}
            <Button onClick={() => navigateRound(1)} disabled={currentRoundIndex === rounds.length - 1} className="p-1"><ChevronRight size={16} /></Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          {rounds[currentRoundIndex].playerScores.map((playerScore, playerIndex) => (
            <div key={playerIndex} className="mb-2 p-2 border rounded">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold">{playerScore.name}</span>
                <span className="font-bold">Score: {playerScore.score} / {calculateTotal(playerIndex)}</span>
              </div>
              <div className="flex justify-between mb-1">
                <Button onClick={() => updatePlayerScore(playerIndex, 'bid')} className="text-xs px-2 py-1 flex-1 mr-1">
                  Bid: <span className="font-bold ml-1 text-sm">{playerScore.bid === null ? '' : playerScore.bid}</span>
                </Button>
                <Button onClick={() => updatePlayerScore(playerIndex, 'tricks')}
                  className="text-xs px-2 py-1 flex-1 ml-1"
                  disabled={shouldDisableTricks(playerScore)}
                >
                  Tricks: <span className="font-bold ml-1 text-sm">{playerScore.tricks === null ? '' : playerScore.tricks}</span>
                </Button>
              </div>
              <div className="grid grid-cols-4 gap-1">
                {specialCards.map(card => (
                  <Button 
                    key={card.name} 
                    onClick={() => updateSpecialCard(playerIndex, card.name)} 
                    className="text-xs px-2 py-1 flex items-between"
                    disabled={!shouldEnableSpecialCards(playerScore)}
                  >{card.name}: <span className="font-bold ml-1 text-sm">{playerScore.specialCards[card.name]}</span></Button>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {shouldEnableNextRound(rounds, currentRoundIndex) && (
          <Button onClick={initializeRound} className="w-full" disabled={!isCurrentRoundComplete(rounds, currentRoundIndex)}>
            Start Round {rounds.length + 1}
          </Button>
      )}

      <Card>
        <CardHeader className="p-2">
          <CardTitle className="text-lg">Total Scores</CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          {getSortedPlayerScores().map((player, index) => (
            <div key={index} className="flex justify-between items-center mb-1 text-sm">
              <span>{player.name}</span>
              <span className="font-bold">{player.score}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button className="w-full mt-4">Start a new game</Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="max-w-[300px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will reset all players and scores.
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={resetGame}>Start new game</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SkullKing;
