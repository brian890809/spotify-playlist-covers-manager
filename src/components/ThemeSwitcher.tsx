"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from 'lucide-react';

const ThemeSwitcher = () => {
    const [mount, setMount] = useState(false);
    const { systemTheme, theme, setTheme } = useTheme();
    const currentTheme = theme === "system" ? systemTheme : theme;
    useEffect(() => {
        setMount(true);
    }, []);

    return mount ? (
        <button
            onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
        >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
    ) : null;
};
export default ThemeSwitcher;
