'use client';

import { createVote } from '@/lib/actions/votes.action';
import { formatNumber } from '@/lib/utils';
import { HasVotedResponse } from '@/types/action';
import { ActionResponse } from '@/types/global';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { use, useState } from 'react';
import { toast } from 'sonner';

interface Props {
  upvotes: number;
  downvotes: number;
  targetId: string;
  targetType: 'question' | 'answer';
  hasVotedPromise: Promise<ActionResponse<HasVotedResponse>>;
}

export default function Votes({
  upvotes,
  downvotes,
  targetId,
  targetType,
  hasVotedPromise,
}: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const session = useSession();
  const userId = session?.data?.user?.id;

  const { success, data } = use(hasVotedPromise);
  const { hasupVoted, hasdownVoted } = data || {};

  const handleVote = async (voteType: 'upvotes' | 'downvotes') => {
    if (!userId)
      return toast.error('You must be logged in to vote.', {
        description: 'Only a login user can vote',
      });
    setIsLoading(true);

    try {
      const result = await createVote({
        targetId,
        targetType,
        voteType,
      });

      if (!result.success) {
        return toast.error('Failed to voted', {
          description: result.error?.message,
        });
      }
      const successMessage =
        voteType === 'upvotes'
          ? `Upvote ${!hasupVoted ? 'added' : 'removed'} successfully`
          : `Downvote ${!hasdownVoted ? 'added' : 'removed'} successfully`;

      toast.success(successMessage, {
        description: 'Your vote has been recorded.',
      });
    } catch (error) {
      toast.error('An error occurred while processing your vote.', {
        description: (error as Error).message,
        descriptionClassName: 'danger',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-center gap-2.5">
      <div className="flex-center gap-1.5">
        <Image
          src={
            success && hasupVoted ? '/icons/upvote.svg' : '/icons/upvoted.svg'
          }
          width={18}
          height={18}
          alt="upvote"
          className={`cursor-pointer ${isLoading && 'opacity-50'}`}
          aria-label="Upvote"
          onClick={() => !isLoading && handleVote('upvotes')}
        />

        <div className="flex-center background-light700_dark400 min-w-5 rounded-sm p-1">
          <p className="subtle-medium text-dark400_light900">
            {formatNumber(upvotes)}
          </p>
        </div>
      </div>

      <div className="flex-center gap-1.5">
        <Image
          src={
            success && hasdownVoted
              ? '/icons/downvote.svg'
              : '/icons/downvoted.svg'
          }
          width={18}
          height={18}
          alt="downvote"
          className={`cursor-pointer ${isLoading && 'opacity-50'}`}
          aria-label="Downvote"
          onClick={() => !isLoading && handleVote('downvotes')}
        />

        <div className="flex-center background-light700_dark400 min-w-5 rounded-sm p-1">
          <p className="subtle-medium text-dark400_light900">
            {formatNumber(downvotes)}
          </p>
        </div>
      </div>
    </div>
  );
}
