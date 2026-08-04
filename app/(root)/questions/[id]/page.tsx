import AllAnswers from '@/components/answers/all-answers';
import TagCard from '@/components/cards/Tag-card';
import Metric from '@/components/common/metric';
import UserAvatar from '@/components/common/user-avatar';
import PreviewContent from '@/components/editor/preview-content';
import AnswerForm from '@/components/forms/answer-form';
import Votes from '@/components/votes/votes';
import { siteConfig } from '@/config/site';
import { getAnswers } from '@/lib/actions/answer.action';
import { getQuestion, IncrementViews } from '@/lib/actions/question.action';
import { hasVoted } from '@/lib/actions/votes.action';
import { formatNumber, getTimeStamp } from '@/lib/utils';
import { RouteParams, TagParams } from '@/types/global';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { after } from 'next/server';
import { Suspense } from 'react';

export const metadata = {
  title: 'Question Details',
};

export default async function QuestionDetails({
  params,
  searchParams,
}: RouteParams) {
  const { id } = await params;
  const { page, pageSize, filter } = await searchParams;
  const { success, data: question } = await getQuestion({ questionId: id });

  after(async () => {
    await IncrementViews({ questionId: id });
  });

  if (!success || !question) return redirect('/404');

  const {
    data: answersResult,
    error: errorAnswers,
    success: areAnswersLoaded,
  } = await getAnswers({
    questionId: id,
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 10,
    filter,
  });

  const hasVotedPromise = hasVoted({
    targetId: question?._id,
    targetType: 'question',
  });

  const { author, createdAt, content, title, views, answers, tags } = question;

  return (
    <>
      <div className="flex-start w-full flex-col">
        <div className="flex w-full flex-col-reverse justify-between">
          <div className="flex items-center justify-start gap-1">
            <UserAvatar
              id={author._id}
              name={author.name}
              imageUrl={author.image}
              classNames="size-[22px]"
              fallBackClassName="text-[10px]"
            />
            <Link href={siteConfig.ROUTES.PROFILE(author._id)}>
              <p className="paragraph-semibold text-dark300_light700">
                {author.name}
              </p>
            </Link>
          </div>

          <div className="flex items-center justify-end gap-4">
            <Suspense fallback={<div>Loading....</div>}>
              <Votes
                upvotes={question.upvotes}
                downvotes={question.downvotes}
                targetId={question._id}
                targetType="question"
                hasVotedPromise={hasVotedPromise}
              />
            </Suspense>
          </div>
        </div>
        <h2 className="h2-semibold text-dark200_light900 mt-3.5 w-full">
          {title}
        </h2>
      </div>

      <div className="mt-5 mb-8 flex flex-wrap gap-4">
        <Metric
          imgUrl="/icons/clock.svg"
          alt="clock icon"
          value={` asked ${getTimeStamp(new Date(createdAt))}`}
          title=""
          textStyles="small-regular text-dark400_light700"
        />
        <Metric
          imgUrl="/icons/message.svg"
          alt="message icon"
          value={answers}
          title=""
          textStyles="small-regular text-dark400_light700"
        />
        <Metric
          imgUrl="/icons/eye.svg"
          alt="eye icon"
          value={formatNumber(views)}
          title=""
          textStyles="small-regular text-dark400_light700"
        />
      </div>

      <PreviewContent content={content} />
      <div className="mt-8 flex flex-wrap gap-2">
        {tags.map((tag: TagParams) => (
          <TagCard
            key={tag._id}
            _id={tag._id as string}
            name={tag.name}
            compact
          />
        ))}
      </div>
      <section className="my-5">
        <AllAnswers
          data={answersResult?.answers}
          error={errorAnswers}
          success={areAnswersLoaded}
          totalAnswers={answersResult?.totalAnswers || 0}
        />
      </section>

      <section className="my-5">
        <AnswerForm
          questionId={question._id}
          questionTitle={question.title}
          questionContent={question.content}
        />
      </section>
    </>
  );
}
