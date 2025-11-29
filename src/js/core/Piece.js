import { BOARD_SIZE, COLORS } from '../utils/constants.js';

/**
 * Base abstract class for all chess pieces
 */
export class Piece {
    constructor(color, row, col) {
        if (this.constructor === Piece) {
            throw new Error('Piece is an abstract class and cannot be instantiated directly');
        }
        this.color = color;
        this.row = row;
        this.col = col;
        this.hasMoved = false;
        this.type = null; // To be set by subclasses
    }

    /**
     * Factory method to create a piece instance
     * @param {string} color - Piece color (white/black)
     * @param {number} row - Row position
     * @param {number} col - Column position
     * @returns {Piece} New piece instance
     */
    static create(color, row, col) {
        throw new Error('create must be implemented by subclass');
    }

    /**
     * Get starting positions for this piece type
     * @param {string} color - Piece color
     * @returns {Array<Object>} Array of {row, col} starting positions
     */
    static getStartingPositions(color) {
        throw new Error('getStartingPositions must be implemented by subclass');
    }

    /**
     * Get the current position
     * @returns {Object} {row, col}
     */
    getPosition() {
        return { row: this.row, col: this.col };
    }

    /**
     * Set the position of the piece
     * @param {number} row 
     * @param {number} col 
     */
    setPosition(row, col) {
        this.row = row;
        this.col = col;
        this.hasMoved = true;
    }

    /**
     * Check if a position is within board bounds
     * @param {number} row 
     * @param {number} col 
     * @returns {boolean}
     */
    isValidPosition(row, col) {
        return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
    }

    /**
     * Check if a piece at position is the same color
     * @param {Piece|null} piece 
     * @returns {boolean}
     */
    isSameColor(piece) {
        return piece && piece.color === this.color;
    }

    /**
     * Check if a piece at position is opponent's piece
     * @param {Piece|null} piece 
     * @returns {boolean}
     */
    isOpponent(piece) {
        return piece && piece.color !== this.color;
    }

    /**
     * Abstract method to get valid moves - must be implemented by subclasses
     * @param {Array<Array<Piece|null>>} board 
     * @param {Object} gameState 
     * @returns {Array<Object>} Array of {row, col} objects
     */
    getValidMoves(board, gameState) {
        throw new Error('getValidMoves must be implemented by subclass');
    }

    /**
     * Filter moves that would leave own king in check
     * @param {Array<Object>} moves 
     * @param {Array<Array<Piece|null>>} board 
     * @param {Object} gameState 
     * @returns {Array<Object>}
     */
    filterMovesInCheck(moves, board, gameState) {
        // This will be implemented in GameController
        return moves;
    }
}

