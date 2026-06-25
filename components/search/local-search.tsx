'use client';

import { Input } from '@/components/ui/input';
import { useLocalSearch } from '@/hooks/useLocalSearch';
import Image from 'next/image';

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
  const { searchQuery, setSearchQuery } = useLocalSearch({ route });

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
