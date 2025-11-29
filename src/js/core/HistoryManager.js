import { COLORS } from '../utils/constants.js';

/**
 * Manages move history and board state snapshots
 */
export class HistoryManager {
    constructor() {
        this.history = [];
        this.currentIndex = -1;
    }

    /**
     * Add a move to history with board state snapshot
     * @param {Object} moveData - Move information
     * @param {Array<Array<Piece|null>>} boardState - Board state snapshot
     */
    addMove(moveData, boardState) {
        // Remove any future moves if we're not at the end
        if (this.currentIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.currentIndex + 1);
        }

        this.history.push({
            move: moveData,
            boardState: boardState,
            timestamp: Date.now()
        });

        this.currentIndex = this.history.length - 1;
    }

    /**
     * Get current move index
     * @returns {number}
     */
    getCurrentIndex() {
        return this.currentIndex;
    }

    /**
     * Get total number of moves
     * @returns {number}
     */
    getTotalMoves() {
        return this.history.length;
    }

    /**
     * Check if can go back
     * @returns {boolean}
     */
    canGoBack() {
        return this.currentIndex > 0;
    }

    /**
     * Check if can go forward
     * @returns {boolean}
     */
    canGoForward() {
        return this.currentIndex < this.history.length - 1;
    }

    /**
     * Check if at current (latest) move
     * @returns {boolean}
     */
    isAtCurrent() {
        return this.currentIndex === this.history.length - 1;
    }

    /**
     * Go to previous move
     * @returns {Object|null} Move data and board state, or null if can't go back
     */
    goBack() {
        if (!this.canGoBack()) {
            return null;
        }

        this.currentIndex--;
        return this.getCurrentMove();
    }

    /**
     * Go to next move
     * @returns {Object|null} Move data and board state, or null if can't go forward
     */
    goForward() {
        if (!this.canGoForward()) {
            return null;
        }

        this.currentIndex++;
        return this.getCurrentMove();
    }

    /**
     * Go to specific move index
     * @param {number} index
     * @returns {Object|null} Move data and board state
     */
    goToMove(index) {
        if (index < 0 || index >= this.history.length) {
            return null;
        }

        this.currentIndex = index;
        return this.getCurrentMove();
    }

    /**
     * Go to current (latest) move
     * @returns {Object|null} Latest move data and board state
     */
    goToCurrent() {
        if (this.history.length === 0) {
            return null;
        }

        this.currentIndex = this.history.length - 1;
        return this.getCurrentMove();
    }

    /**
     * Get current move data
     * @returns {Object|null} Current move data and board state
     */
    getCurrentMove() {
        if (this.currentIndex < 0 || this.currentIndex >= this.history.length) {
            return null;
        }

        return this.history[this.currentIndex];
    }

    /**
     * Get all history entries
     * @returns {Array<Object>}
     */
    getAllMoves() {
        return this.history;
    }

    /**
     * Get move notation for display
     * @param {Object} moveData
     * @returns {string}
     */
    static getMoveNotation(moveData) {
        const fromSquare = this.positionToSquare(moveData.from);
        const toSquare = this.positionToSquare(moveData.to);
        let notation = `${fromSquare}-${toSquare}`;

        if (moveData.captured) {
            notation = `${fromSquare}x${toSquare}`;
        }

        if (moveData.castling) {
            notation = moveData.castling === 'kingside' ? 'O-O' : 'O-O-O';
        }

        if (moveData.promotion) {
            notation += `=${moveData.promotion.toUpperCase()}`;
        }

        return notation;
    }

    /**
     * Convert position to chess notation (e.g., {row: 0, col: 0} -> "a8")
     * @param {Object} position
     * @returns {string}
     */
    static positionToSquare(position) {
        const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
        return files[position.col] + ranks[position.row];
    }

    /**
     * Clear history
     */
    clear() {
        this.history = [];
        this.currentIndex = -1;
    }
}
