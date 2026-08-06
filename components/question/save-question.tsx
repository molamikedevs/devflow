'use client';

import { toggledSavedQuestions } from '@/lib/actions/collection.action';
import { ActionResponse } from '@/types/global';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { use, useState } from 'react';
import { toast } from 'sonner';

interface CollectionBaseParams {
  questionId: string;
  hasSavedPromise: Promise<ActionResponse<{ saved: boolean }>>;
}

export default function SaveQuestion({
  questionId,
  hasSavedPromise,
}: CollectionBaseParams) {
  const [isLoading, setIsLoading] = useState(false);
  const session = useSession();
  const userId = session.data?.user?.id;

  const { data } = use(hasSavedPromise);
  const { saved: hasSaved } = data || {};

  const handleSave = async () => {
    if (isLoading) return;
    if (!userId) {
      toast.error('You need to be logged in to save questions.');
    }
    setIsLoading(true);

    try {
      const { success, data, error } = await toggledSavedQuestions({
        questionId,
      });
      if (!success)
        throw new Error(error?.message || 'Failed to save the question.');
      toast.success(
        data?.saved
          ? 'Question saved to your collection.'
          : 'Question removed from your collection.',
      );
    } catch (error) {
      toast.error('An error occurred while saving the question.', {
        description: (error as Error).message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Image
      src={hasSaved ? '/icons/star-filled.svg' : '/icons/star-red.svg'}
      alt="Save Question"
      width={18}
      height={18}
      className={`cursor-pointer ${isLoading ? 'opacity-50' : 'opacity-100'}`}
      onClick={handleSave}
    />
  );
}
