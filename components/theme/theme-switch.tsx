'use client';

import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Moon, Sun } from 'lucide-react';

export default function ThemeSwitch() {
  const { theme, resolvedTheme, setTheme } = useTheme();

  const themes = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
  ];

  const currentTheme = theme === 'system' ? resolvedTheme : theme;
  const CurrentThemeIcon =
    themes.find((t) => t.value === currentTheme)?.icon || Sun;

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
                currentTheme === value
                  ? 'text-primary-500'
                  : 'text-dark300_light900',
              )}
            />
            <span
              className={cn(
                currentTheme === value
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
