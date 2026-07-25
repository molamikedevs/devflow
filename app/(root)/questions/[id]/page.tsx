import TagCard from '@/components/cards/Tag-card';
import Metric from '@/components/common/metric';
import UserAvatar from '@/components/common/user-avatar';
import PreviewContent from '@/components/editor/preview-content';
import { siteConfig } from '@/config/site';
import { getQuestion, IncrementViews } from '@/lib/actions/question.action';
import { formatNumber, getTimeStamp } from '@/lib/utils';
import { RouteParams, TagParams } from '@/types/global';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { after } from 'next/server';

export const metadata = {
  title: 'Question Details',
};

export default async function QuestionDetails({ params }: RouteParams) {
  const { id } = await params;
  const { success, data: question } = await getQuestion({ questionId: id });

  after(async () => {
    await IncrementViews({ questionId: id });
  });

  if (!success || !question) return redirect('/404');

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
            <p>Votes</p>
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
    </>
  );
}
