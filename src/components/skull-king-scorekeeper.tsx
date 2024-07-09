import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Define types for player score and round
interface SpecialCards {
  [key: string]: number;
}

interface PlayerScore {
  name: string;
  bid: number;
  tricks: number;
  specialCards: SpecialCards;
  score: number;
}

interface Round {
  roundNumber: number;
  playerScores: PlayerScore[];
}

const SkullKingScoreKeeper: React.FC = () => {
  const [players, setPlayers] = useState(['Player 1', 'Player 2']);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);

  const specialCards = [
    { name: 'Pirate', max: 5 },
    { name: 'Mermaid', max: 2 },
    { name: 'Skull King', max: 1 }
  ];

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
        bid: 0,
        tricks: 0,
        specialCards: specialCards.reduce((acc, card) => ({ ...acc, [card.name]: 0 }), {}),
        score: 0
      }))
    };
    setRounds([...rounds, newRound]);
    setCurrentRoundIndex(rounds.length);
  };

  const cycleValue = (value: number, max: number) => {
    return (value + 1) > max ? 0 : value + 1;
  };

  const updatePlayerScore = (playerIndex: number, field: keyof PlayerScore) => {
    const updatedRounds = [...rounds];
    const round = updatedRounds[currentRoundIndex];
    const player = round.playerScores[playerIndex];
    
    const maxValue = round.roundNumber;

    if (field === 'bid' || field === 'tricks') {
      player[field] = cycleValue(player[field], maxValue);
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
    const extraPoints = Object.values(player.specialCards).reduce((sum, count) => sum + count, 0) * 30;
    
    if (player.bid === player.tricks) {
      player.score = player.bid * 20 + extraPoints;
      if (player.bid === 0) {
        player.score += round.roundNumber * 10;
      }
    } else {
      player.score = -Math.abs(player.bid - player.tricks) * 10;
    }
  };

  const calculateTotal = (playerName: string) => {
    return rounds.reduce((total, round) => {
      const playerScore = round.playerScores.find(score => score.name === playerName);
      return total + (playerScore ? playerScore.score : 0);
    }, 0);
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
        <h1 className="text-xl font-bold mb-2">Skull King Score Keeper</h1>
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
                <Button onClick={() => removePlayer(index)} className="p-1"><X size={16} /></Button>
              </div>
            ))}
            <Button onClick={addPlayer} className="w-full mt-2">Add Player</Button>
          </CardContent>
        </Card>
        <Button onClick={initializeRound} className="w-full">Start Game</Button>
      </div>
    );
  }

  return (
    <div className="p-2 max-w-sm mx-auto">
      <h1 className="text-xl font-bold mb-2">Skull King Score Keeper</h1>
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
              <div className="font-bold mb-1">{playerScore.name}</div>
              <div className="flex justify-between mb-1">
                <Button onClick={() => updatePlayerScore(playerIndex, 'bid')} className="text-xs px-2 py-1 flex-1 mr-1">
                  Bid: {playerScore.bid}
                </Button>
                <Button onClick={() => updatePlayerScore(playerIndex, 'tricks')} className="text-xs px-2 py-1 flex-1 ml-1">
                  Tricks: {playerScore.tricks}
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-1">
                {specialCards.map(card => (
                  <Button 
                    key={card.name} 
                    onClick={() => updateSpecialCard(playerIndex, card.name)} 
                    className="text-xs px-2 py-1 flex items-center justify-between"
                  >
                    {card.name}: {playerScore.specialCards[card.name]}
                    <RotateCw size={12} />
                  </Button>
                ))}
              </div>
              <div className="text-right font-bold mt-1">
                Score: {playerScore.score}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      
      {currentRoundIndex === rounds.length - 1 && (
        <Button onClick={initializeRound} className="w-full mb-2">Start Round {rounds.length + 1}</Button>
      )}
      
      <Card>
        <CardHeader className="p-2">
          <CardTitle className="text-lg">Total Scores</CardTitle>
        </CardHeader>
        <CardContent className="p-2">
          {players.map((player, index) => (
            <div key={index} className="flex justify-between items-center mb-1 text-sm">
              <span>{player}</span>
              <span className="font-bold">{calculateTotal(player)}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default SkullKingScoreKeeper;
