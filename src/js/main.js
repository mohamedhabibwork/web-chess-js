import { ChessBoard } from './core/ChessBoard.js';
import { GameController } from './core/GameController.js';
import { HistoryManager } from './core/HistoryManager.js';

class ChessGame {
    constructor() {
        // Use factory method to create board
        this.board = ChessBoard.createStandard();
        this.controller = new GameController(this.board);
        this.boardElement = null;
    }

    /**
     * Initialize the game
     */
    init() {
        // Get board element
        this.boardElement = document.getElementById('chess-board');
        if (!this.boardElement) {
            console.error('Chess board element not found');
            return;
        }

        // Render board
        this.board.render(this.boardElement);

        // Set up event listeners
        this.setupEventListeners();
        this.setupHistoryListeners();

        // Initial UI update
        this.controller.updateUI();
        this.updateHistoryUI();
    }

    /**
     * Set up event listeners for board clicks
     */
    setupEventListeners() {
        this.boardElement.addEventListener('click', (e) => {
            const square = e.target.closest('.square');
            if (!square) {
                return;
            }

            const row = parseInt(square.dataset.row, 10);
            const col = parseInt(square.dataset.col, 10);

            if (isNaN(row) || isNaN(col)) {
                return;
            }

            // Handle the click
            this.controller
                .handleSquareClick(row, col)
                .then((moveExecuted) => {
                    // Only re-render board if a move was actually executed
                    if (moveExecuted) {
                        this.board.render(this.boardElement);
                        this.controller.updateUI();
                        this.updateHistoryUI();
                    }
                    // If no move was executed (just piece selection),
                    // highlights are already applied and board doesn't need re-rendering
                })
                .catch((err) => {
                    console.error('Error handling square click:', err);
                });
        });
    }

    /**
     * Set up history navigation event listeners
     */
    setupHistoryListeners() {
        const backBtn = document.getElementById('history-back');
        const forwardBtn = document.getElementById('history-forward');
        const currentBtn = document.getElementById('history-current');

        if (backBtn) {
            backBtn.addEventListener('click', () => {
                if (this.controller.goBack()) {
                    this.board.render(this.boardElement);
                    this.controller.updateUI();
                    this.updateHistoryUI();
                }
            });
        }

        if (forwardBtn) {
            forwardBtn.addEventListener('click', () => {
                if (this.controller.goForward()) {
                    this.board.render(this.boardElement);
                    this.controller.updateUI();
                    this.updateHistoryUI();
                }
            });
        }

        if (currentBtn) {
            currentBtn.addEventListener('click', () => {
                this.controller.resetToCurrent();
                this.board.render(this.boardElement);
                this.controller.updateUI();
                this.updateHistoryUI();
            });
        }
    }

    /**
     * Update history UI display
     */
    updateHistoryUI() {
        const historyList = document.getElementById('history-list');
        const backBtn = document.getElementById('history-back');
        const forwardBtn = document.getElementById('history-forward');
        const currentBtn = document.getElementById('history-current');

        if (!historyList) {
            return;
        }

        // Update button states
        if (backBtn) {
            backBtn.disabled = !this.controller.canGoBack();
        }
        if (forwardBtn) {
            forwardBtn.disabled = !this.controller.canGoForward();
        }
        if (currentBtn) {
            currentBtn.disabled = this.controller.isAtCurrent();
        }

        // Update history list
        const history = this.controller.getHistory();
        historyList.innerHTML = '';

        if (history.length === 0) {
            historyList.innerHTML = '<span class="text-xs text-gray-500">No moves yet</span>';
            return;
        }

        history.forEach((entry, index) => {
            this.createHistoryBadge(historyList, entry, index);
        });
    }

    /**
     * Create a history badge for a single move entry
     * @param {HTMLElement} historyList - Container element
     * @param {Object} entry - History entry
     * @param {number} index - Move index
     */
    createHistoryBadge(historyList, entry, index) {
        const notation = HistoryManager.getMoveNotation(entry.move);
        const isCurrent = index === this.controller.historyManager.getCurrentIndex();
        const moveColor = entry.move.color;
        const isWhite = moveColor === 'white';

        // Create container for badge and color indicator
        const container = document.createElement('div');
        container.className = 'flex items-center gap-1';

        // Color badge indicator
        const colorBadge = document.createElement('span');
        colorBadge.className = `w-3 h-3 rounded-full ${
            isWhite ? 'bg-white border border-gray-300' : 'bg-gray-800'
        }`;
        colorBadge.title = isWhite ? 'White' : 'Black';

        // Move badge
        const badge = document.createElement('span');
        badge.className = `px-2 py-1 rounded text-xs cursor-pointer transition-colors ${
            isCurrent
                ? 'bg-blue-500 text-white font-semibold'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`;
        badge.textContent = `${index + 1}. ${notation}`;
        badge.dataset.moveIndex = index;

        // Add click handler with confirmation
        badge.addEventListener('click', () => {
            if (isCurrent) {
                return; // Already at this move
            }

            // eslint-disable-next-line no-alert
            const confirmed = window.confirm(`Jump to move ${index + 1}?`);
            if (confirmed) {
                this.controller.goToMove(index);
                this.board.render(this.boardElement);
                this.controller.updateUI();
                this.updateHistoryUI();
            }
        });

        container.appendChild(colorBadge);
        container.appendChild(badge);
        historyList.appendChild(container);
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new ChessGame();
    game.init();
});
