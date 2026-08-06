import UserCard from '@/components/cards/user-card';
import DataRenderer from '@/components/common/data-renderer';
import LocalSearch from '@/components/search/local-search';
import { siteConfig } from '@/config/site';
import { EMPTY_USERS } from '@/constants/states';
import { getUsers } from '@/lib/actions/users.action';
import { RouteParams } from '@/types/global';

export const metadata = {
  title: 'Community',
};

export default async function Community({ searchParams }: RouteParams) {
  const { page, pageSize, filter, query } = await searchParams;

  const { data, success, error } = await getUsers({
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 10,
    filter,
    query,
  });

  const { users } = data || {};
  return (
    <>
      <h1 className="h1-bold text-dark400_light900">All Users</h1>
      <div className="mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center">
        <LocalSearch
          route={siteConfig.ROUTES.COMMUNITY}
          imgSrc="/icons/search.svg"
          placeholder="There are some awesome developers here. Find them!"
          otherClasses="flex-1"
        />
      </div>

      <DataRenderer
        success={success}
        error={error}
        data={users}
        empty={EMPTY_USERS}
        render={(users) => (
          <div className="mt-10 flex flex-wrap gap-4">
            {users.map((user) => (
              <UserCard key={user._id} {...user} />
            ))}
          </div>
        )}
      />
    </>
  );
}
