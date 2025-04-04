import { create } from 'zustand';


interface ThemeState {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  isDarkMode: typeof window !== 'undefined' ? 
    localStorage.getItem('theme') === 'dark' ||
    (localStorage.getItem('theme') === null && 
     window.matchMedia('(prefers-color-scheme: dark)').matches) 
    : false,

  toggleDarkMode: () => set((state) => {
    const newMode = !state.isDarkMode;
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newMode ? 'dark' : 'light');
      document.body.classList.toggle('dark', newMode);
    }
    return { isDarkMode: newMode };
  }),
}));

if (typeof window !== 'undefined') {
  const savedTheme = localStorage.getItem('theme');
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  document.body.classList.toggle(
    'dark',
    savedTheme === 'dark' || (savedTheme === null && systemDark)
  );
}