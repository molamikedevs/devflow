'use client';

import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/useDebounce';
import { formUrlQuery, removeKeysFormUrlQuery } from '@/lib/url';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Props {
  route: string;
  imgSrc: string;
  placeholder: string;
  iconPosition?: 'left' | 'right';
  otherClasses?: string;
}

export default function LocalSearch({
  imgSrc,
  iconPosition,
  otherClasses,
  route,
  placeholder,
}: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const query = searchParams.get('query') || '';
  const [searchQuery, setSearchQuery] = useState(query);
  const debounceSearchQuery = useDebounce(searchQuery);

  useEffect(() => {
    if (debounceSearchQuery) {
      const newUrl = formUrlQuery({
        params: searchParams.toString(),
        key: 'query',
        value: debounceSearchQuery,
      });
      router.push(newUrl, { scroll: false });
    } else {
      if (pathname === route) {
        const newUrl = removeKeysFormUrlQuery({
          params: searchParams.toString(),
          keysToRemove: ['query'],
        });

        router.push(newUrl, { scroll: false });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounceSearchQuery, route, pathname]);

  return (
    <div
      className={`background-light800_darkgradient flex min-h-14 grow items-center gap-4 rounded-[10px] px-4 ${otherClasses}`}
    >
      {iconPosition === 'left' && (
        <Image
          src={imgSrc}
          width={24}
          height={24}
          alt="Search"
          className="cursor-pointer"
        />
      )}

      <Input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="paragraph-regular no-focus placeholder text-dark400_light700 border-none shadow-none outline-none"
      />

      {iconPosition === 'right' && (
        <Image
          src={imgSrc}
          width={24}
          height={24}
          alt="Search"
          className="cursor-pointer"
        />
      )}
    </div>
  );
}
