// import { Suspense } from "react";
import { siteConfig } from '@/config/site';
import { cn, getTimeStamp } from '@/lib/utils';
import { AnswerParams } from '@/types/global';
import Link from 'next/link';
import { Suspense } from 'react';

import UserAvatar from '@/components/common/user-avatar';
import Votes from '@/components/votes/votes';
import { hasVoted } from '@/lib/actions/votes.action';
import PreviewContent from '../editor/preview-content';

export default function AnswerCard({
  _id,
  author: { _id: authorId, name, image },
  createdAt,
  upvotes,
  downvotes,
  content,
}: AnswerParams) {
  const firstName = name?.split(' ')[0] || 'User';
  const hasVotedPromise = hasVoted({
    targetId: _id,
    targetType: 'answer',
  });
  return (
    <article className={cn('light-border relative border-b py-10')}>
      <span id={`answer-${_id}`} className="hash-span" />

      <div className="mb-5 flex flex-col-reverse justify-between gap-5 sm:flex-row sm:items-center sm:gap-2">
        <div className="flex flex-1 items-start gap-1 sm:items-center">
          <UserAvatar
            id={authorId}
            name={name}
            imageUrl={image}
            classNames="size-5 rounded-full object-cover max-sm:mt-2"
          />

          <Link
            href={siteConfig.ROUTES.PROFILE(authorId)}
            className="flex flex-col max-sm:ml-1 sm:flex-row sm:items-center"
          >
            <p className="body-semibold text-dark300_light700">
              {firstName ?? 'Anonymous'}
            </p>

            <p className="small-regular text-light400_light500 mt-0.5 ml-0.5 line-clamp-1">
              <span className="max-sm:hidden"> • </span>
              answered {getTimeStamp(createdAt)}
            </p>
          </Link>
        </div>

        <div className="flex justify-end">
          <Suspense fallback={<div>Loading....</div>}>
            <Votes
              targetId={_id}
              upvotes={upvotes}
              downvotes={downvotes}
              targetType="answer"
              hasVotedPromise={hasVotedPromise}
            />
          </Suspense>
        </div>
      </div>
      <PreviewContent content={content} />
    </article>
  );
}
