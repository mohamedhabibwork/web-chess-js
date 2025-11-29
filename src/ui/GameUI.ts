/**
 * Game UI Controller
 * Handles all DOM interactions and rendering
 */

import { Game } from '../core/Game.js';
import { ChessAI } from '../ai/ChessAI.js';
import { ThemeManager, THEMES } from './ThemeManager.js';
import {
    type IPosition,
    type IGameSettings,
    type MoveList,
    PieceType,
    PieceColor,
    GameMode,
    GameStatus,
    AIDifficulty,
    BOARD_SIZE
} from '../types/index.js';
import { PIECE_IMAGES } from '../assets/pieces/index.js';

export class GameUI {
    private readonly _game: Game;
    private readonly _ai: ChessAI;
    private readonly _themeManager: ThemeManager;

    // DOM Elements
    private _boardElement: HTMLElement | null = null;
    private _startupPage: HTMLElement | null = null;
    private _gameContainer: HTMLElement | null = null;

    // UI State
    private _selectedSquare: IPosition | null = null;
    private _validMoves: MoveList = [];
    private _playerNames: { white: string; black: string } = { white: 'White', black: 'Black' };
    private _isAIEnabled = false;

    constructor() {
        this._game = new Game();
        this._ai = new ChessAI(AIDifficulty.MEDIUM, PieceColor.BLACK);
        this._themeManager = new ThemeManager();
    }

    // ============================================================================
    // INITIALIZATION
    // ============================================================================

    public initialize(): void {
        this._startupPage = document.getElementById('startup-page');
        this._gameContainer = document.getElementById('game-container');
        this._boardElement = document.getElementById('chess-board');

        this.showStartupPage();
    }

    // ============================================================================
    // STARTUP PAGE
    // ============================================================================

    private showStartupPage(): void {
        if (!this._startupPage) {
            return;
        }

        this._startupPage.innerHTML = this.createStartupHTML();
        this._startupPage.classList.remove('hidden');

        if (this._gameContainer) {
            this._gameContainer.classList.add('hidden');
        }

        this.setupStartupListeners();
    }

    private createStartupHTML(): string {
        const themeOptions = Object.entries(THEMES)
            .map(([key, theme]) => `<option value="${key}">${theme.name}</option>`)
            .join('');

        return `
      <div class="startup-content">
        <div class="text-center mb-8">
          <h1 class="text-4xl font-bold text-white mb-2">♔ Chess Game ♚</h1>
          <p class="text-white/70">Choose your game mode and settings</p>
        </div>
        
        <div class="mb-6">
          <h2 class="text-lg font-semibold mb-3 text-white/90">Game Mode</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button class="game-mode-btn" data-mode="pvp">
              <div class="text-4xl mb-2">👥</div>
              <div class="font-semibold text-lg text-white">Player vs Player</div>
              <div class="text-sm text-white/60 mt-1">Play with a friend</div>
            </button>
            <button class="game-mode-btn" data-mode="ai">
              <div class="text-4xl mb-2">🤖</div>
              <div class="font-semibold text-lg text-white">Player vs AI</div>
              <div class="text-sm text-white/60 mt-1">Challenge the computer</div>
            </button>
          </div>
        </div>

        <div id="player-names-section" class="mb-6 hidden">
          <h2 class="text-lg font-semibold mb-3 text-white/90">Player Names</h2>
          <div class="space-y-3">
            <div>
              <label class="block text-sm font-medium text-white/80 mb-1">White Player ♔</label>
              <input type="text" id="white-player-name" 
                class="w-full px-4 py-2 bg-white/10 border-2 border-white/20 rounded-lg text-white placeholder:text-white/40 focus:border-purple-400 focus:outline-none transition-colors" 
                placeholder="Enter name" maxlength="20">
            </div>
            <div>
              <label class="block text-sm font-medium text-white/80 mb-1">Black Player ♚</label>
              <input type="text" id="black-player-name" 
                class="w-full px-4 py-2 bg-white/10 border-2 border-white/20 rounded-lg text-white placeholder:text-white/40 focus:border-purple-400 focus:outline-none transition-colors" 
                placeholder="Enter name" maxlength="20">
            </div>
          </div>
        </div>

        <div id="ai-section" class="mb-6 hidden">
          <h2 class="text-lg font-semibold mb-3 text-white/90">AI Difficulty</h2>
          <select id="ai-difficulty" class="w-full px-4 py-2 bg-white/10 border-2 border-white/20 rounded-lg text-white focus:border-purple-400 focus:outline-none transition-colors">
            <option value="easy">🟢 Easy - Great for beginners</option>
            <option value="medium" selected>🟡 Medium - Balanced challenge</option>
            <option value="hard">🔴 Hard - For experienced players</option>
          </select>
        </div>

        <div class="mb-8">
          <h2 class="text-lg font-semibold mb-3 text-white/90">Board Theme</h2>
          <select id="theme-select" class="w-full px-4 py-2 bg-white/10 border-2 border-white/20 rounded-lg text-white focus:border-purple-400 focus:outline-none transition-colors">
            ${themeOptions}
          </select>
        </div>

        <button id="start-game-btn" disabled
          class="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg rounded-xl
                 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 
                 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]">
          🎮 Start Game
        </button>
      </div>
    `;
    }

    private setupStartupListeners(): void {
        const modeButtons = document.querySelectorAll('.game-mode-btn');
        const playerNamesSection = document.getElementById('player-names-section');
        const aiSection = document.getElementById('ai-section');
        const startBtn = document.getElementById('start-game-btn') as HTMLButtonElement;
        const themeSelect = document.getElementById('theme-select') as HTMLSelectElement;

        let selectedMode: string | null = null;

        modeButtons.forEach((btn) => {
            btn.addEventListener('click', () => {
                modeButtons.forEach((b) => b.classList.remove('selected'));
                btn.classList.add('selected');

                selectedMode = btn.getAttribute('data-mode');

                if (selectedMode === 'pvp') {
                    playerNamesSection?.classList.remove('hidden');
                    aiSection?.classList.add('hidden');
                } else {
                    playerNamesSection?.classList.add('hidden');
                    aiSection?.classList.remove('hidden');
                }

                if (startBtn) {
                    startBtn.disabled = false;
                }
            });
        });

        // Preview theme on change
        if (themeSelect) {
            themeSelect.addEventListener('change', () => {
                this._themeManager.applyTheme(themeSelect.value);
            });

            // Set initial theme
            themeSelect.value = this._themeManager.currentTheme;
            this._themeManager.applyTheme(this._themeManager.currentTheme);
        }

        if (startBtn) {
            startBtn.addEventListener('click', () => {
                if (!selectedMode) {
                    return;
                }

                const mode = selectedMode === 'pvp' ? GameMode.PVP : GameMode.AI;
                const settings = this.getGameSettings(mode);
                this.startGame(settings);
            });
        }
    }

    private getGameSettings(mode: GameMode): IGameSettings {
        const themeSelect = document.getElementById('theme-select') as HTMLSelectElement;
        const theme = themeSelect?.value ?? 'classic';

        if (mode === GameMode.PVP) {
            const whiteName =
                (document.getElementById('white-player-name') as HTMLInputElement)?.value.trim() ||
                'White';
            const blackName =
                (document.getElementById('black-player-name') as HTMLInputElement)?.value.trim() ||
                'Black';

            return {
                mode: GameMode.PVP,
                players: {
                    white: { name: whiteName, color: PieceColor.WHITE, isAI: false },
                    black: { name: blackName, color: PieceColor.BLACK, isAI: false }
                },
                theme
            };
        } else {
            const difficultySelect = document.getElementById('ai-difficulty') as HTMLSelectElement;
            const difficulty = (difficultySelect?.value ?? 'medium') as AIDifficulty;

            return {
                mode: GameMode.AI,
                players: {
                    white: { name: 'You', color: PieceColor.WHITE, isAI: false },
                    black: { name: 'AI', color: PieceColor.BLACK, isAI: true }
                },
                aiDifficulty: difficulty,
                theme
            };
        }
    }

    // ============================================================================
    // GAME START
    // ============================================================================

    private startGame(settings: IGameSettings): void {
        this._game.initialize(settings);

        this._playerNames = {
            white: settings.players.white.name,
            black: settings.players.black.name
        };

        this._isAIEnabled = settings.mode === GameMode.AI;

        if (settings.aiDifficulty) {
            this._ai.setDifficulty(settings.aiDifficulty);
        }

        this._themeManager.applyTheme(settings.theme);

        // Hide startup, show game
        if (this._startupPage) {
            this._startupPage.classList.add('hidden');
        }
        if (this._gameContainer) {
            this._gameContainer.classList.remove('hidden');
        }

        this.renderBoard();
        this.updateUI();
        this.setupBoardListeners();
        this.setupInlineNewGameButton();
    }

    private setupInlineNewGameButton(): void {
        const newGameBtn = document.getElementById('new-game-btn-inline');
        if (newGameBtn) {
            newGameBtn.addEventListener('click', () => {
                this.showStartupPage();
            });
        }
    }

    // ============================================================================
    // BOARD RENDERING
    // ============================================================================

    private renderBoard(): void {
        if (!this._boardElement) {
            return;
        }

        this._boardElement.innerHTML = '';
        const kingInCheck = this._game.getKingInCheckPosition();

        for (let row = 0; row < BOARD_SIZE; row++) {
            for (let col = 0; col < BOARD_SIZE; col++) {
                const square = this.createSquare(row, col, kingInCheck);
                this._boardElement.appendChild(square);
            }
        }
    }

    private createSquare(row: number, col: number, kingInCheck: IPosition | null): HTMLElement {
        const square = document.createElement('div');
        const isLight = (row + col) % 2 === 0;

        square.className = `square ${isLight ? 'light' : 'dark'}`;
        square.dataset.row = String(row);
        square.dataset.col = String(col);

        // Check highlight
        if (kingInCheck && kingInCheck.row === row && kingInCheck.col === col) {
            square.classList.add('king-check');
        }

        // Selected highlight
        if (this._selectedSquare?.row === row && this._selectedSquare?.col === col) {
            square.classList.add('selected');
        }

        // Valid move highlight
        const isValidMove = this._validMoves.some((m) => m.row === row && m.col === col);
        if (isValidMove) {
            const hasPiece = this._game.board.getPiece({ row, col }) !== null;
            square.classList.add(hasPiece ? 'valid-capture' : 'valid-move');
        }

        // Add piece
        const pieceData = this._game.board.getPieceData({ row, col });
        if (pieceData) {
            const pieceEl = document.createElement('img');
            pieceEl.className = 'piece';
            pieceEl.src = PIECE_IMAGES[pieceData.color][pieceData.type];
            pieceEl.alt = `${pieceData.color} ${pieceData.type}`;
            pieceEl.draggable = false;
            square.appendChild(pieceEl);
        }

        return square;
    }

    // ============================================================================
    // EVENT HANDLING
    // ============================================================================

    private setupBoardListeners(): void {
        this._boardElement?.addEventListener('click', (e) => {
            void this.handleBoardClick(e);
        });
    }

    private async handleBoardClick(e: Event): Promise<void> {
        const target = e.target as HTMLElement;
        const square = target.closest('.square') as HTMLElement;
        if (!square) {
            return;
        }

        const row = parseInt(square.dataset.row ?? '-1', 10);
        const col = parseInt(square.dataset.col ?? '-1', 10);
        if (row < 0 || col < 0) {
            return;
        }

        const position: IPosition = { row, col };

        // If we have a valid move selected, try to make it
        if (this._selectedSquare && this._validMoves.some((m) => m.row === row && m.col === col)) {
            await this.handleMove(position);
            return;
        }

        // Otherwise, try to select a piece
        this.handleSelection(position);
    }

    private handleSelection(position: IPosition): void {
        const piece = this._game.board.getPiece(position);

        // Can only select own pieces
        if (piece && piece.color === this._game.currentPlayer) {
            this._selectedSquare = position;
            this._validMoves = this._game.selectPiece(position);
        } else {
            this._selectedSquare = null;
            this._validMoves = [];
            this._game.clearSelection();
        }

        this.renderBoard();
    }

    private async handleMove(to: IPosition): Promise<void> {
        const result = this._game.makeMove(to);

        if (!result.success) {
            return;
        }

        this._selectedSquare = null;
        this._validMoves = [];

        if (result.needsPromotion && result.promotionPosition) {
            this.showPromotionModal(result.promotionPosition);
            return;
        }

        this.renderBoard();
        this.updateUI();
        this.checkGameOver();

        // AI move
        if (
            this._isAIEnabled &&
            this._game.currentPlayer === PieceColor.BLACK &&
            !this._game.isGameOver()
        ) {
            await this.makeAIMove();
        }
    }

    // ============================================================================
    // PROMOTION MODAL
    // ============================================================================

    private showPromotionModal(position: IPosition): void {
        const pieceData = this._game.board.getPieceData(position);
        if (!pieceData) {
            return;
        }

        const modal = document.createElement('div');
        modal.className = 'promotion-modal';
        modal.innerHTML = `
      <div class="promotion-content">
        <h2 class="text-2xl font-bold mb-4 text-white">Promote Pawn</h2>
        <p class="text-white/80 mb-6">Choose a piece:</p>
        <div class="promotion-pieces">
          ${this.createPromotionOptions(pieceData.color)}
        </div>
      </div>
    `;

        document.body.appendChild(modal);

        modal.querySelectorAll('.promotion-piece').forEach((btn) => {
            btn.addEventListener('click', () => {
                const pieceType = btn.getAttribute('data-type') as PieceType;
                void this.handlePromotion(pieceType, modal);
            });
        });
    }

    private createPromotionOptions(color: PieceColor): string {
        const pieces = [
            { type: PieceType.QUEEN, name: 'Queen' },
            { type: PieceType.ROOK, name: 'Rook' },
            { type: PieceType.BISHOP, name: 'Bishop' },
            { type: PieceType.KNIGHT, name: 'Knight' }
        ];

        return pieces
            .map(
                (p) => `
      <button class="promotion-piece" data-type="${p.type}" title="${p.name}">
        <img src="${PIECE_IMAGES[color][p.type]}" alt="${p.name}" class="w-full h-full" draggable="false">
      </button>
    `
            )
            .join('');
    }

    private async handlePromotion(pieceType: PieceType, modal: HTMLElement): Promise<void> {
        this._game.promotePawn(pieceType);
        modal.remove();

        this.renderBoard();
        this.updateUI();
        this.checkGameOver();

        // AI move
        if (
            this._isAIEnabled &&
            this._game.currentPlayer === PieceColor.BLACK &&
            !this._game.isGameOver()
        ) {
            await this.makeAIMove();
        }
    }

    // ============================================================================
    // AI
    // ============================================================================

    private async makeAIMove(): Promise<void> {
        if (this._boardElement) {
            this._boardElement.style.pointerEvents = 'none';
        }

        // Thinking delay
        await this.delay(500);

        const aiMove = this._ai.getBestMove(this._game);

        if (aiMove) {
            this._game.selectPiece(aiMove.from);
            const result = this._game.makeMove(aiMove.to);

            if (result.needsPromotion) {
                // AI always promotes to Queen
                this._game.promotePawn(PieceType.QUEEN);
            }

            this.renderBoard();
            this.updateUI();
            this.checkGameOver();
        }

        if (this._boardElement) {
            this._boardElement.style.pointerEvents = 'auto';
        }
    }

    private delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    // ============================================================================
    // UI UPDATES
    // ============================================================================

    private updateUI(): void {
        this.updateCurrentPlayer();
        this.updateGameStatus();
        this.updateCapturedPieces();
    }

    private updateCurrentPlayer(): void {
        const el = document.getElementById('current-player');
        if (!el) {
            return;
        }

        const playerName =
            this._game.currentPlayer === PieceColor.WHITE
                ? this._playerNames.white
                : this._playerNames.black;

        el.textContent = playerName;
        el.className = `text-2xl font-bold ${this._game.currentPlayer === PieceColor.WHITE ? 'text-white' : 'text-white/90'
            }`;
    }

    private updateGameStatus(): void {
        const el = document.getElementById('game-status');
        if (!el) {
            return;
        }

        const statusConfig: Record<GameStatus, { text: string; class: string }> = {
            [GameStatus.NOT_STARTED]: { text: 'Not Started', class: 'text-white/70' },
            [GameStatus.IN_PROGRESS]: { text: 'In Progress', class: 'text-white' },
            [GameStatus.CHECK]: {
                text: `Check - ${this.getCurrentPlayerName()}`,
                class: 'text-yellow-400 font-semibold'
            },
            [GameStatus.CHECKMATE]: {
                text: `Checkmate - ${this.getWinnerName()} wins!`,
                class: 'text-red-400 font-bold'
            },
            [GameStatus.STALEMATE]: {
                text: 'Stalemate - Draw!',
                class: 'text-blue-400 font-semibold'
            },
            [GameStatus.DRAW]: { text: 'Draw', class: 'text-blue-400' },
            [GameStatus.RESIGNED]: { text: 'Resigned', class: 'text-white/70' }
        };

        const config = statusConfig[this._game.status];
        el.textContent = config.text;
        el.className = `text-lg ${config.class}`;
    }

    private updateCapturedPieces(): void {
        const captured = this._game.capturedPieces;

        const whiteEl = document.getElementById('captured-white');
        const blackEl = document.getElementById('captured-black');

        if (whiteEl) {
            whiteEl.innerHTML = captured.white
                .map(
                    (t) =>
                        `<img src="${PIECE_IMAGES[PieceColor.WHITE][t]}" alt="${t}" class="w-6 h-6 sm:w-7 sm:h-7">`
                )
                .join('');
        }

        if (blackEl) {
            blackEl.innerHTML = captured.black
                .map(
                    (t) =>
                        `<img src="${PIECE_IMAGES[PieceColor.BLACK][t]}" alt="${t}" class="w-6 h-6 sm:w-7 sm:h-7">`
                )
                .join('');
        }
    }

    private getCurrentPlayerName(): string {
        return this._game.currentPlayer === PieceColor.WHITE
            ? this._playerNames.white
            : this._playerNames.black;
    }

    private getWinnerName(): string {
        const winner = this._game.getWinner();
        if (!winner) {
            return '';
        }
        return winner === PieceColor.WHITE ? this._playerNames.white : this._playerNames.black;
    }

    // ============================================================================
    // GAME OVER
    // ============================================================================

    private checkGameOver(): void {
        if (!this._game.isGameOver()) {
            return;
        }

        setTimeout(() => this.showGameOverModal(), 500);
    }

    private showGameOverModal(): void {
        const isCheckmate = this._game.status === GameStatus.CHECKMATE;
        const winnerName = this.getWinnerName();
        const winnerColor = this._game.getWinner();

        const modal = document.createElement('div');
        modal.className = 'game-over-modal';

        modal.innerHTML = `
      <div class="game-over-content">
        <div class="text-6xl mb-4">
          ${isCheckmate ? (winnerColor === PieceColor.WHITE ? '♔' : '♚') : '⚖️'}
        </div>
        <h2 class="text-3xl font-bold mb-2 victory-text">
          ${isCheckmate ? '🎉 Checkmate!' : '🤝 Stalemate'}
        </h2>
        <p class="text-xl text-white/90 mb-6">
          ${isCheckmate ? `${winnerName} wins!` : "It's a draw!"}
        </p>
        <div class="flex gap-4 justify-center">
          <button id="new-game-btn" class="px-6 py-3 bg-linear-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-500 hover:to-blue-500 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
            New Game
          </button>
          <button id="close-modal-btn" class="px-6 py-3 bg-white/10 text-white border border-white/20 rounded-lg hover:bg-white/20 transition-all font-semibold backdrop-blur-sm">
            Close
          </button>
        </div>
      </div>
    `;

        if (isCheckmate) {
            this.addConfetti(modal);
        }

        document.body.appendChild(modal);

        document.getElementById('new-game-btn')?.addEventListener('click', () => {
            modal.remove();
            this.showStartupPage();
        });

        document.getElementById('close-modal-btn')?.addEventListener('click', () => {
            modal.remove();
        });
    }

    private addConfetti(container: HTMLElement): void {
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];

        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = `${Math.random() * 100}%`;
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = `${Math.random() * 3}s`;
            confetti.style.animationDuration = `${Math.random() * 2 + 2}s`;
            container.appendChild(confetti);
        }
    }
}
