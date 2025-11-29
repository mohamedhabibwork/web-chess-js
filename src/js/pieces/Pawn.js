import { Piece } from '../core/Piece.js';
import { COLORS, PIECE_TYPES } from '../utils/constants.js';

export class Pawn extends Piece {
    constructor(color, row, col) {
        super(color, row, col);
        this.type = PIECE_TYPES.PAWN;
    }

    /**
     * Factory method to create a pawn
     * @param {string} color - Piece color
     * @param {number} row - Row position
     * @param {number} col - Column position
     * @returns {Pawn} New pawn instance
     */
    static create(color, row, col) {
        return new Pawn(color, row, col);
    }

    /**
     * Get starting positions for pawns
     * @param {string} color - Piece color
     * @returns {Array<Object>} Array of starting positions
     */
    static getStartingPositions(color) {
        const positions = [];
        const startRow = color === COLORS.WHITE ? 6 : 1;

        for (let col = 0; col < 8; col++) {
            positions.push({ row: startRow, col });
        }

        return positions;
    }

    getValidMoves(board, gameState) {
        const moves = [];
        const direction = this.color === COLORS.WHITE ? -1 : 1;
        const startRow = this.color === COLORS.WHITE ? 6 : 1;

        // Move forward one square
        const oneForward = this.row + direction;
        if (this.isValidPosition(oneForward, this.col) && !board[oneForward][this.col]) {
            moves.push({ row: oneForward, col: this.col });
        }

        // Move forward two squares from starting position
        if (!this.hasMoved && this.row === startRow) {
            const twoForward = this.row + direction * 2;
            if (
                this.isValidPosition(twoForward, this.col) &&
                !board[twoForward][this.col] &&
                !board[oneForward][this.col]
            ) {
                moves.push({ row: twoForward, col: this.col });
            }
        }

        // Capture diagonally
        const captureLeft = { row: this.row + direction, col: this.col - 1 };
        const captureRight = { row: this.row + direction, col: this.col + 1 };

        [captureLeft, captureRight].forEach((capture) => {
            if (this.isValidPosition(capture.row, capture.col)) {
                const piece = board[capture.row][capture.col];
                if (this.isOpponent(piece)) {
                    moves.push(capture);
                }
            }
        });

        // En passant
        if (gameState.enPassantTarget) {
            const epRow = gameState.enPassantTarget.row;
            const epCol = gameState.enPassantTarget.col;
            if (
                epRow === this.row + direction &&
                (epCol === this.col - 1 || epCol === this.col + 1)
            ) {
                moves.push({ row: epRow, col: epCol, enPassant: true });
            }
        }

        return moves;
    }
}
