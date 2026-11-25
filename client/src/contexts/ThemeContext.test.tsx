import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ThemeProvider, useTheme } from './ThemeContext';

function TestConsumer() {
  const { theme, setTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme-val">{theme}</span>
      <button onClick={() => setTheme('light')}>Set Light</button>
      <button onClick={() => setTheme('dark')}>Set Dark</button>
      <button onClick={() => setTheme('system')}>Set System</button>
    </div>
  );
}

describe('ThemeContext', () => {
  let matchMediaListeners: ((e: MediaQueryListEvent) => void)[] = [];
  let matchesDark = false;

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
    matchMediaListeners = [];
    matchesDark = false;

    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: matchesDark,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(
        (event: string, listener: (e: MediaQueryListEvent) => void) => {
          if (event === 'change') {
            matchMediaListeners.push(listener);
          }
        },
      ),
      removeEventListener: vi.fn(
        (_event: string, listener: (e: MediaQueryListEvent) => void) => {
          matchMediaListeners = matchMediaListeners.filter(l => l !== listener);
        },
      ),
      dispatchEvent: vi.fn(),
    }));
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
    vi.restoreAllMocks();
  });

  it('defaults to system theme and adds dark class if system prefers dark', () => {
    matchesDark = true;
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>,
    );

    expect(screen.getByTestId('theme-val')).toHaveTextContent('system');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('defaults to system theme and does not add dark class if system prefers light', () => {
    matchesDark = false;
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>,
    );

    expect(screen.getByTestId('theme-val')).toHaveTextContent('system');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('switching between light, dark, and system toggles the dark class on <html>', async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>,
    );

    // Initial (system light)
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    // Switch to dark
    await user.click(screen.getByRole('button', { name: 'Set Dark' }));
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(screen.getByTestId('theme-val')).toHaveTextContent('dark');

    // Switch to light
    await user.click(screen.getByRole('button', { name: 'Set Light' }));
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(screen.getByTestId('theme-val')).toHaveTextContent('light');

    // Switch back to system (with system set to dark)
    matchesDark = true;
    await user.click(screen.getByRole('button', { name: 'Set System' }));
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(screen.getByTestId('theme-val')).toHaveTextContent('system');
  });

  it('persists and restores the theme from localStorage', async () => {
    const user = userEvent.setup();
    const { unmount } = render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Set Dark' }));
    expect(localStorage.getItem('theme')).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    unmount();

    // Re-render and check restored state
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('theme-val')).toHaveTextContent('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('respects prefers-color-scheme live change when set to system', () => {
    matchesDark = false;
    const { unmount } = render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>,
    );

    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(matchMediaListeners.length).toBe(1);

    // Trigger system theme change to dark
    act(() => {
      matchMediaListeners.forEach(listener =>
        listener({ matches: true } as MediaQueryListEvent),
      );
    });
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    // Trigger system theme change to light
    act(() => {
      matchMediaListeners.forEach(listener =>
        listener({ matches: false } as MediaQueryListEvent),
      );
    });
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    // Unmount and verify listener is cleaned up
    unmount();
    expect(matchMediaListeners.length).toBe(0);
  });

  it('throws an error if useTheme is used outside ThemeProvider', () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    expect(() => render(<TestConsumer />)).toThrow(
      'useTheme must be used within a ThemeProvider',
    );
    consoleError.mockRestore();
  });
});
