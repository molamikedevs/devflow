import TagCard from '@/components/cards/Tag-card';
import { siteConfig } from '@/config/site';
import Image from 'next/image';
import Link from 'next/link';

const questions = [
  {
    _id: '1',
    title: 'How does the Next.js App Router differ from the Pages Router?',
  },
  {
    _id: '2',
    title:
      'What is the difference between Server Components and Client Components in React?',
  },
  {
    _id: '3',
    title:
      'How do you implement dynamic routing with catch-all segments in Next.js?',
  },
  {
    _id: '4',
    title: 'When should you use useCallback vs useMemo in React?',
  },
  {
    _id: '5',
    title:
      'How does Next.js handle data fetching with the fetch API and caching strategies?',
  },
];

const popularTags = [
  {
    _id: '1',
    name: 'next.js',
    questions: 120,
  },
  {
    _id: '2',
    name: 'react',
    questions: 98,
  },
  {
    _id: '3',
    name: 'supabase',
    questions: 56,
  },
  {
    _id: '4',
    name: 'appwrite',
    questions: 42,
  },
];

export default async function RightSidebar() {
  return (
    <section className="custom-scrollbar background-light900_dark200 light-border shadow-light-300 sticky top-0 right-0 flex h-screen w-[350px] flex-col gap-6 overflow-y-auto border-l p-6 pt-36 max-xl:hidden dark:shadow-none">
      <div>
        <h3 className="h3-bold text-dark200_light900">Top Questions</h3>
        <div className="mt-6 flex flex-col gap-[30px] w-full">
          {questions.map(({ _id, title }) => (
            <Link
              className="flex justify-between items-center gap-7"
              key={_id}
              href={siteConfig.ROUTES.QUESTION(_id)}
            >
              <span className="body-medium text-dark500_light700">{title}</span>

              <Image
                src="/icons/chevron-right.svg"
                alt="chevron"
                width={20}
                height={20}
                className="invert-colors"
              />
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-16">
        <h3 className="h3-bold text-dark200_light900">Popular Tags</h3>
        <div className="mt-7 flex flex-col gap-4">
          {popularTags.map(({ _id, name, questions }) => (
            <TagCard
              key={_id}
              _id={_id}
              name={name}
              questions={questions}
              showCount
              compact
            />
          ))}
        </div>
      </div>
    </section>
  );
}
