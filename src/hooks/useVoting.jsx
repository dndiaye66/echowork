// src/hooks/useVoting.jsx
import { useState } from 'react';
import { voteService } from '../services/voteService';

export const useVoting = () => {
  const [votingStates, setVotingStates] = useState({});

  const vote = async (reviewId, voteType) => {
    // Éviter les votes multiples
    if (votingStates[reviewId]) return;

    try {
      setVotingStates(prev => ({ ...prev, [reviewId]: true }));

      let result;
      if (voteType === 'upvote') {
        result = await voteService.upvoteReview(reviewId);
      } else {
        result = await voteService.downvoteReview(reviewId);
      }

      return result;
    } catch (error) {
      console.error('Erreur vote:', error);
      throw error;
    } finally {
      setVotingStates(prev => ({ ...prev, [reviewId]: false }));
    }
  };

  const upvote = (reviewId) => vote(reviewId, 'upvote');
  const downvote = (reviewId) => vote(reviewId, 'downvote');

  return { upvote, downvote, votingStates };
};
