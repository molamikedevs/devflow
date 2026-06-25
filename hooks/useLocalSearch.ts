import { useDebounce } from '@/hooks/useDebounce';
import { formUrlQuery, removeKeysFormUrlQuery } from '@/lib/url';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Props {
  route: string;
}

export function useLocalSearch({ route }: Props) {
  const searchParams = useSearchParams();
  const query = searchParams.get('query') ?? '';
  const [searchQuery, setSearchQuery] = useState(query);
  const pathname = usePathname();
  const router = useRouter();

  const debounceSearchQuery = useDebounce(searchQuery);

  useEffect(() => {
    // Bail if the URL already reflects the search — prevents a push→rerender→push loop
    if (debounceSearchQuery === query) return;

    let newUrl = '';
    const paramsToString = searchParams.toString();

    if (debounceSearchQuery) {
      // Add/update the query param
      newUrl = formUrlQuery({
        params: paramsToString,
        key: 'query',
        value: debounceSearchQuery,
      });
    } else if (pathname === route) {
      // Empty search: clear the param, but only on this search's own route
      newUrl = removeKeysFormUrlQuery({
        params: paramsToString,
        keysToRemove: ['query'],
      });
    }

    if (newUrl) router.push(newUrl, { scroll: false });
  }, [debounceSearchQuery, query, router, pathname, searchParams, route]);

  return { searchQuery, setSearchQuery };
}
