/**
 * Chess Game - Main Entry Point
 * TypeScript version with full OOP architecture
 */

import { GameUI } from './ui/GameUI.js';

// Initialize the game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const gameUI = new GameUI();
    gameUI.initialize();
});
