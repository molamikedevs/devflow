'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { LaptopMinimal, Moon, Sun } from 'lucide-react';

export default function ThemeSwitch() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Only render after component mounts. Defer setMounted to the next frame
  // to avoid synchronous setState inside the effect which can trigger
  // cascading renders.
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const themes = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: LaptopMinimal },
  ];

  const CurrentThemeIcon = mounted
    ? themes.find((t) => t.value === theme)?.icon || Sun
    : Sun; // Default to Sun during SSR

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <CurrentThemeIcon className="text-primary-500 h-[1.2rem] w-[1.2rem] transition-all" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {themes.map(({ value, icon: Icon, label }) => (
          <DropdownMenuItem
            key={value}
            onClick={() => setTheme(value)}
            className="flex items-center gap-2"
          >
            <Icon
              className={cn(
                'size-5',
                mounted && theme === value
                  ? 'text-primary-500'
                  : 'text-dark300_light900',
              )}
            />
            <span
              className={cn(
                mounted && theme === value
                  ? 'primary-text-gradient'
                  : 'text-dark300_light900',
              )}
            >
              {label}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
