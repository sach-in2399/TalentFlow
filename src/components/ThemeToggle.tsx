import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9">
        <Sun className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="h-9 w-9 transition-smooth hover:bg-accent"
    >
      {theme === 'dark' ? (
        <Sun className="h-4 w-4 text-primary rotate-0 transition-all" />
      ) : (
        <Moon className="h-4 w-4 text-primary rotate-0 transition-all" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
