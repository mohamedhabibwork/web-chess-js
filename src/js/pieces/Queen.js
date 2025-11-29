import { Piece } from '../core/Piece.js';
import { PIECE_TYPES, COLORS } from '../utils/constants.js';

export class Queen extends Piece {
    constructor(color, row, col) {
        super(color, row, col);
        this.type = PIECE_TYPES.QUEEN;
    }

    static create(color, row, col) {
        return new Queen(color, row, col);
    }

    static getStartingPositions(color) {
        const backRow = color === COLORS.WHITE ? 7 : 0;
        return [{ row: backRow, col: 3 }];
    }

    getValidMoves(board, gameState) {
        const moves = [];
        // Queen moves like both Rook and Bishop
        const directions = [
            { row: -1, col: 0 }, // Up
            { row: 1, col: 0 }, // Down
            { row: 0, col: -1 }, // Left
            { row: 0, col: 1 }, // Right
            { row: -1, col: -1 }, // Up-Left
            { row: -1, col: 1 }, // Up-Right
            { row: 1, col: -1 }, // Down-Left
            { row: 1, col: 1 } // Down-Right
        ];

        directions.forEach((dir) => {
            for (let i = 1; i < 8; i++) {
                const newRow = this.row + dir.row * i;
                const newCol = this.col + dir.col * i;

                if (!this.isValidPosition(newRow, newCol)) break;

                const piece = board[newRow][newCol];
                if (!piece) {
                    moves.push({ row: newRow, col: newCol });
                } else if (this.isOpponent(piece)) {
                    moves.push({ row: newRow, col: newCol });
                    break;
                } else {
                    break; // Blocked by own piece
                }
            }
        });

        return moves;
    }
}
