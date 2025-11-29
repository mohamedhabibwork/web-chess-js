import { Piece } from '../core/Piece.js';
import { PIECE_TYPES, COLORS } from '../utils/constants.js';

export class Knight extends Piece {
    constructor(color, row, col) {
        super(color, row, col);
        this.type = PIECE_TYPES.KNIGHT;
    }

    static create(color, row, col) {
        return new Knight(color, row, col);
    }

    static getStartingPositions(color) {
        const backRow = color === COLORS.WHITE ? 7 : 0;
        return [
            { row: backRow, col: 1 },
            { row: backRow, col: 6 }
        ];
    }

    getValidMoves(board, gameState) {
        const moves = [];
        const knightMoves = [
            { row: -2, col: -1 }, { row: -2, col: 1 },
            { row: -1, col: -2 }, { row: -1, col: 2 },
            { row: 1, col: -2 },  { row: 1, col: 2 },
            { row: 2, col: -1 },  { row: 2, col: 1 }
        ];

        knightMoves.forEach(move => {
            const newRow = this.row + move.row;
            const newCol = this.col + move.col;

            if (this.isValidPosition(newRow, newCol)) {
                const piece = board[newRow][newCol];
                if (!piece || this.isOpponent(piece)) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        });

        return moves;
    }
}

