/**
 * Theme Manager
 * Handles board theme selection and application
 */

import { type ITheme } from '../types/index.js';

export const THEMES: Record<string, ITheme> = {
    classic: {
        name: 'Classic',
        lightSquare: '#fef3c7',
        darkSquare: '#92400e',
        selectedSquare: 'rgba(59, 130, 246, 0.6)',
        validMove: 'rgba(34, 197, 94, 0.7)',
        validMoveBg: 'rgba(34, 197, 94, 0.3)',
        captureHighlight: 'rgba(220, 38, 38, 0.8)',
        captureHighlightBg: 'rgba(220, 38, 38, 0.3)',
        checkHighlight: '#d97706',
        lastMove: 'rgba(251, 191, 36, 0.4)'
    },
    blue: {
        name: 'Blue Ocean',
        lightSquare: '#dbeafe',
        darkSquare: '#1e40af',
        selectedSquare: 'rgba(251, 191, 36, 0.6)',
        validMove: 'rgba(34, 197, 94, 0.7)',
        validMoveBg: 'rgba(34, 197, 94, 0.3)',
        captureHighlight: 'rgba(220, 38, 38, 0.8)',
        captureHighlightBg: 'rgba(220, 38, 38, 0.3)',
        checkHighlight: '#d97706',
        lastMove: 'rgba(251, 191, 36, 0.4)'
    },
    green: {
        name: 'Forest Green',
        lightSquare: '#d1fae5',
        darkSquare: '#065f46',
        selectedSquare: 'rgba(59, 130, 246, 0.6)',
        validMove: 'rgba(251, 191, 36, 0.7)',
        validMoveBg: 'rgba(251, 191, 36, 0.3)',
        captureHighlight: 'rgba(220, 38, 38, 0.8)',
        captureHighlightBg: 'rgba(220, 38, 38, 0.3)',
        checkHighlight: '#d97706',
        lastMove: 'rgba(59, 130, 246, 0.4)'
    },
    purple: {
        name: 'Royal Purple',
        lightSquare: '#ede9fe',
        darkSquare: '#6b21a8',
        selectedSquare: 'rgba(251, 191, 36, 0.6)',
        validMove: 'rgba(34, 197, 94, 0.7)',
        validMoveBg: 'rgba(34, 197, 94, 0.3)',
        captureHighlight: 'rgba(220, 38, 38, 0.8)',
        captureHighlightBg: 'rgba(220, 38, 38, 0.3)',
        checkHighlight: '#d97706',
        lastMove: 'rgba(251, 191, 36, 0.4)'
    },
    red: {
        name: 'Ruby Red',
        lightSquare: '#fee2e2',
        darkSquare: '#991b1b',
        selectedSquare: 'rgba(59, 130, 246, 0.6)',
        validMove: 'rgba(34, 197, 94, 0.7)',
        validMoveBg: 'rgba(34, 197, 94, 0.3)',
        captureHighlight: 'rgba(251, 191, 36, 0.8)',
        captureHighlightBg: 'rgba(251, 191, 36, 0.3)',
        checkHighlight: '#d97706',
        lastMove: 'rgba(59, 130, 246, 0.4)'
    },
    dark: {
        name: 'Dark Mode',
        lightSquare: '#4b5563',
        darkSquare: '#1f2937',
        selectedSquare: 'rgba(59, 130, 246, 0.6)',
        validMove: 'rgba(34, 197, 94, 0.7)',
        validMoveBg: 'rgba(34, 197, 94, 0.3)',
        captureHighlight: 'rgba(220, 38, 38, 0.8)',
        captureHighlightBg: 'rgba(220, 38, 38, 0.3)',
        checkHighlight: '#d97706',
        lastMove: 'rgba(251, 191, 36, 0.4)'
    },
    wood: {
        name: 'Wooden',
        lightSquare: '#fde68a',
        darkSquare: '#78350f',
        selectedSquare: 'rgba(59, 130, 246, 0.6)',
        validMove: 'rgba(34, 197, 94, 0.7)',
        validMoveBg: 'rgba(34, 197, 94, 0.3)',
        captureHighlight: 'rgba(220, 38, 38, 0.8)',
        captureHighlightBg: 'rgba(220, 38, 38, 0.3)',
        checkHighlight: '#d97706',
        lastMove: 'rgba(251, 191, 36, 0.4)'
    },
    tournament: {
        name: 'Tournament',
        lightSquare: '#f0d9b5',
        darkSquare: '#b58863',
        selectedSquare: 'rgba(59, 130, 246, 0.6)',
        validMove: 'rgba(34, 197, 94, 0.7)',
        validMoveBg: 'rgba(34, 197, 94, 0.3)',
        captureHighlight: 'rgba(220, 38, 38, 0.8)',
        captureHighlightBg: 'rgba(220, 38, 38, 0.3)',
        checkHighlight: '#d97706',
        lastMove: 'rgba(251, 191, 36, 0.4)'
    }
};

const STORAGE_KEY = 'chess-theme';

export class ThemeManager {
    private _currentTheme: string;

    constructor() {
        this._currentTheme = this.loadFromStorage() ?? 'classic';
    }

    public get currentTheme(): string {
        return this._currentTheme;
    }

    public get theme(): ITheme {
        return THEMES[this._currentTheme] ?? THEMES.classic;
    }

    public getAllThemes(): Record<string, ITheme> {
        return { ...THEMES };
    }

    public getThemeNames(): string[] {
        return Object.keys(THEMES);
    }

    /**
     * Apply a theme
     */
    public applyTheme(themeName: string): void {
        if (!THEMES[themeName]) {
            console.warn(`Theme "${themeName}" not found, using classic`);
            themeName = 'classic';
        }

        this._currentTheme = themeName;
        const theme = THEMES[themeName];

        // Update CSS custom properties
        const root = document.documentElement;
        root.style.setProperty('--color-board-light', theme.lightSquare);
        root.style.setProperty('--color-board-dark', theme.darkSquare);
        root.style.setProperty('--color-selected', theme.selectedSquare);
        root.style.setProperty('--color-valid-move', theme.validMove);
        root.style.setProperty('--color-valid-move-bg', theme.validMoveBg);
        root.style.setProperty('--color-valid-capture', theme.captureHighlight);
        root.style.setProperty('--color-valid-capture-bg', theme.captureHighlightBg);
        root.style.setProperty('--color-status-check', theme.checkHighlight);
        root.style.setProperty('--color-last-move', theme.lastMove);

        this.saveToStorage();
    }

    /**
     * Save theme to localStorage
     */
    private saveToStorage(): void {
        try {
            localStorage.setItem(STORAGE_KEY, this._currentTheme);
        } catch {
            // Ignore storage errors
        }
    }

    /**
     * Load theme from localStorage
     */
    private loadFromStorage(): string | null {
        try {
            return localStorage.getItem(STORAGE_KEY);
        } catch {
            return null;
        }
    }
}
