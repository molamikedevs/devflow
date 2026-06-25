'use client';

import { Button } from '@/components/ui/button';
import { filters } from '@/constants/filters';
import { formUrlQuery, removeKeysFormUrlQuery } from '@/lib/url';
import { cn } from '@/lib/utils';
import { useRouter, useSearchParams } from 'next/navigation';

export default function HomeFilter() {
  const searchParams = useSearchParams();
  const activeFilter = searchParams.get('filter') ?? '';
  const router = useRouter();

  const handleClick = (filter: string) => {
    let newUrl = '';
    const paramsToString = searchParams.toString();

    // Clicking the active filter clears it; clicking another switches to it
    if (filter === activeFilter) {
      newUrl = removeKeysFormUrlQuery({
        params: paramsToString,
        keysToRemove: ['filter'],
      });
    } else {
      newUrl = formUrlQuery({
        params: paramsToString,
        key: 'filter',
        value: filter.toString(),
      });
    }

    if (newUrl) router.push(newUrl, { scroll: false });
  };

  return (
    <div className="mt-10 hidden flex-wrap gap-3 sm:flex">
      {filters.map(({ name, value }) => (
        <Button
          key={name}
          onClick={() => handleClick(value)}
          className={cn(
            'body-medium rounded-lg px-6 py-3 capitalize shadow-none',
            activeFilter === value
              ? 'bg-primary-100 text-primary-500 hover:bg-primary-100 dark:bg-dark-400 dark:text-primary-500 dark:hover:bg-dark-400'
              : 'bg-light-800 text-light-500 hover:bg-light-800 dark:bg-dark-300 dark:text-light-500 dark:hover:bg-dark-300',
          )}
        >
          {name}
        </Button>
      ))}
    </div>
  );
}
