import TagCard from '@/components/cards/Tag-card';
import DataRenderer from '@/components/common/data-renderer';
import LocalSearch from '@/components/search/local-search';
import { siteConfig } from '@/config/site';
import { EMPTY_TAGS } from '@/constants/states';
import { getTags } from '@/lib/actions/tag.action';
import { RouteParams } from '@/types/global';

export default async function Tags({ searchParams }: RouteParams) {
  const { page, pageSize, filter, query } = await searchParams;
  const { data, error, success } = await getTags({
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 10,
    query,
    filter,
  });

  const { tags } = data || {};

  return (
    <>
      <h1 className="h1-bold text-dark100_light900 text-3xl">Tags</h1>
      <section className="mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center">
        {/* Search tags */}
        <LocalSearch
          route={siteConfig.ROUTES.TAGS}
          imgSrc="/icons/search.svg"
          placeholder="Search tags..."
          otherClasses="flex-1"
        />
      </section>

      {/* Data Renderer */}
      <DataRenderer
        success={success}
        error={error}
        data={tags}
        empty={EMPTY_TAGS}
        render={(tags) => (
          <div className="mt-10 grid w-full gap-6 sm:grid-cols-2 xl:grid-cols-2">
            {tags.map((tag) => (
              <TagCard key={tag._id} {...tag} />
            ))}
          </div>
        )}
      />
    </>
  );
}
