import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { cn } from "@/lib/utils";
import { PlayerScore, Round, SortedPlayerScore } from '@/types';
import { encode, decode } from '@hugov/shorter-string';
import QRCode from 'qrcode.react';

const SkullKing: React.FC = () => {

  const MIN_PLAYERS = 2;
  const MAX_PLAYERS = 8;
  
  const [players, setPlayers] = useState(['Player 1', 'Player 2']);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [newPlayerIndex, setNewPlayerIndex] = useState<number | null>(null);
  const playerInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [showQRCode, setShowQRCode] = useState(false);

  const specialCards = [
    { name: 'Mermaid', max: 2 },
    { name: 'Pirate', max: 6 },
    { name: 'S. King', max: 1 },
    { name: '+10', max: 5 }
  ];

  const getButtonClasses = (cardName: string): string => {
    switch (cardName) {
      case 'Pirate':
        return 'bg-red-700 hover:bg-red-800 text-white border-red-700';
      case 'Mermaid':
        return 'bg-[#20B2AA] hover:bg-[#008B8B] text-white border-[#20B2AA]';
      case '+10':
        return 'bg-[#2E8B57] hover:bg-[#228B22] text-white border-[#2E8B57]';
      default:
        return '';
    }
  };

  const resetGame = () => {
    // setPlayers(['Player 1', 'Player 2']);
    setRounds([]);
    setCurrentRoundIndex(0);
  };

  const calculateTotalTricks = (round: Round): number => {
    return round.playerScores.reduce((total, player) => total + (player.tricks ?? 0), 0);
  };

  const isTrickLimitReached = (round: Round): boolean => {
    return calculateTotalTricks(round) >= round.roundNumber;
  };

  const shouldDisableTricks = (playerScore: PlayerScore) => {
    return playerScore.bid === null;
  };

  const shouldEnableSpecialCards = (playerScore: PlayerScore) => {
    return playerScore.bid !== null && playerScore.tricks !== null &&
         playerScore.bid !== 0 && playerScore.tricks !== 0 &&
         playerScore.bid === playerScore.tricks;
  };

  useEffect(() => {
    if (newPlayerIndex !== null && playerInputRefs.current[newPlayerIndex]) {
      playerInputRefs.current[newPlayerIndex]?.focus();
      setNewPlayerIndex(null);
    }
  }, [newPlayerIndex]);

  // When mounting the component, check if there is a state in the URL
  useEffect(() => {
    const decodedState = decodeStateFromUrl();
    if (decodedState) {
      setPlayers(decodedState.players);
      setRounds(decodedState.rounds);
      setCurrentRoundIndex(decodedState.rounds.length - 1);
    }
  }, []);

  useEffect(() => {
    // Hide QR code when state changes
    setShowQRCode(false);
  }, [players, rounds]);

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
      playerScore.bid !== null && playerScore.tricks !== null && isTrickLimitReached(rounds[currentRoundIndex])
    );
  };

  const addPlayer = () => {
    const newIndex = players.length;
    setPlayers([...players, `Player ${players.length + 1}`]);
    setNewPlayerIndex(newIndex);
  };

  const removePlayer = (index: number) => {
    const updatedPlayers = players.filter((_, i) => i !== index);
    setPlayers(updatedPlayers);
    playerInputRefs.current = playerInputRefs.current.filter((_, i) => i !== index);
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

    player.score = calculatePlayerScore(player, round.roundNumber);
  };

  const calculatePlayerScore = (playerScore: PlayerScore, roundNumber: number): number => {
    const { bid, tricks, specialCards } = playerScore;
    let score = 0;

    if (bid === null || tricks === null) {
      return 0;
    }

    if (bid === 0) {
      score = roundNumber * (tricks === 0 ? 10 : -10);
    } else if (bid === tricks) {
      score = bid * 20;
      score += specialCards['Mermaid'] * 20;
      score += specialCards['Pirate'] * 30;
      score += specialCards['S. King'] * 40;
      score += specialCards['+10'] * 10;
    } else {
      score = Math.abs(bid - tricks) * -10;
    }

    return score;
  };

  const calculateTotal = (playerIndex: number) => {
    return rounds.reduce((total, round) => {
      const playerScore = round.playerScores[playerIndex];
      return total + (playerScore ? playerScore.score : 0);
    }, 0);
  };

  const getSortedPlayerScores = () => {
    return players.map((player, index): SortedPlayerScore => ({
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

  const generateShareableLink = () => {
    const compressedState = compressState(players, rounds);
    const json = JSON.stringify(compressedState);
    // console.log(json);
    const encoded = encode(json);
    // console.log(encoded);
    const urlEncoded = encodeURIComponent(encoded);
    // console.log(urlEncoded);
    return `${window.location.origin}${window.location.pathname}?s=${urlEncoded}`;
  };

  const handleShareLink = async () => {
    const link = generateShareableLink();

    // Update the URL without reloading the page
    window.history.pushState({}, '', link);

    try {
      await navigator.clipboard.writeText(link);
      // Toggle QR code display
      setShowQRCode(!showQRCode);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const decodeStateFromUrl = (): { players: string[], rounds: Round[] } | null => {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get('s');
    if (encoded) {
      try {
        const decodedString = decode(decodeURIComponent(encoded));
        const compressedState = JSON.parse(decodedString);
        return decompressState(compressedState);
      } catch (error) {
        console.error('Failed to decode state from URL', error);
      }
    }
    return null;
  };

  const compressState = (players: string[], rounds: Round[]): any => {
    const compressedSpecialCards = (cards: Record<string, number>) => {
      const values = [cards['Mermaid'], cards['Pirate'], cards['S. King'], cards['+10']];
      return values.every(v => v === 0) ? [] : values;
    };

    return [
      players,
      rounds.map(round => [
        round.roundNumber,
        round.playerScores.map(score => [
          score.bid,
          score.tricks,
          compressedSpecialCards(score.specialCards)
        ])
      ])
    ];
  };

  const decompressState = (compressed: any): { players: string[], rounds: Round[] } => {
    const [players, compressedRounds] = compressed;
    const specialCardNames = ['Mermaid', 'Pirate', 'S. King', '+10'];

    const rounds: Round[] = compressedRounds.map((round: any) => ({
      roundNumber: round[0],
      playerScores: round[1].map((score: any, index: number) => {
        const specialCards = score[2].length === 0 ? [0, 0, 0, 0] : score[2];
        const playerScore: PlayerScore = {
          name: players[index],
          bid: score[0],
          tricks: score[1],
          specialCards: Object.fromEntries(specialCardNames.map((name, i) => [name, specialCards[i]])),
          score: 0
        };
        playerScore.score = calculatePlayerScore(playerScore, round[0]);  // Recalculate score
        return playerScore;
      })
    }));

    return { players, rounds };
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
                  ref={(el) => playerInputRefs.current[index] = el}
                  value={player}
                  onChange={(e) => updatePlayerName(index, e.target.value)}
                  onFocus={(e) => e.target.setSelectionRange(0, e.target.value.length)}
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
                    className={cn("text-xs px-2 py-1 flex items-center", getButtonClasses(card.name))}
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

      <div className="mt-4">
        {showQRCode && (
          <div className="mt-4 flex flex-col items-center">
            <QRCode value={window.location.href} size={200} />
            <p className="mt-2 text-sm">Link copied to clipboard! Or scan this QR code</p>
          </div>
        )}
        {!showQRCode && (
        <Button onClick={handleShareLink} className="h-8 px-3 text-sm" variant="outline">
          <Share2 className="mr-2" size={16} /> Share
        </Button>
        )}
      </div>
    </div>
  );
};

export default SkullKing;
