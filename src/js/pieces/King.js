import { Piece } from '../core/Piece.js';
import { PIECE_TYPES, COLORS } from '../utils/constants.js';

export class King extends Piece {
    constructor(color, row, col) {
        super(color, row, col);
        this.type = PIECE_TYPES.KING;
    }

    static create(color, row, col) {
        return new King(color, row, col);
    }

    static getStartingPositions(color) {
        const backRow = color === COLORS.WHITE ? 7 : 0;
        return [{ row: backRow, col: 4 }];
    }

    getValidMoves(board, gameState) {
        const moves = [];
        const directions = [
            { row: -1, col: 0 },   // Up
            { row: 1, col: 0 },    // Down
            { row: 0, col: -1 },   // Left
            { row: 0, col: 1 },    // Right
            { row: -1, col: -1 },  // Up-Left
            { row: -1, col: 1 },   // Up-Right
            { row: 1, col: -1 },   // Down-Left
            { row: 1, col: 1 }     // Down-Right
        ];

        // Regular king moves (one square in any direction)
        directions.forEach(dir => {
            const newRow = this.row + dir.row;
            const newCol = this.col + dir.col;

            if (this.isValidPosition(newRow, newCol)) {
                const piece = board[newRow][newCol];
                if (!piece || this.isOpponent(piece)) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        });

        // Castling
        if (!this.hasMoved && !gameState.isInCheck(this.color)) {
            // Kingside castling
            if (this.canCastleKingside(board, gameState)) {
                moves.push({ row: this.row, col: 6, castling: 'kingside' });
            }
            // Queenside castling
            if (this.canCastleQueenside(board, gameState)) {
                moves.push({ row: this.row, col: 2, castling: 'queenside' });
            }
        }

        return moves;
    }

    canCastleKingside(board, gameState) {
        const rookCol = 7;
        const rook = board[this.row][rookCol];
        
        if (!rook || rook.type !== PIECE_TYPES.ROOK || rook.hasMoved || rook.color !== this.color) {
            return false;
        }

        // Check if squares between king and rook are empty
        if (board[this.row][5] || board[this.row][6]) {
            return false;
        }

        // Check if king would pass through check
        if (gameState.isSquareAttacked(this.row, 5, this.color) || 
            gameState.isSquareAttacked(this.row, 6, this.color)) {
            return false;
        }

        return true;
    }

    canCastleQueenside(board, gameState) {
        const rookCol = 0;
        const rook = board[this.row][rookCol];
        
        if (!rook || rook.type !== PIECE_TYPES.ROOK || rook.hasMoved || rook.color !== this.color) {
            return false;
        }

        // Check if squares between king and rook are empty
        if (board[this.row][1] || board[this.row][2] || board[this.row][3]) {
            return false;
        }

        // Check if king would pass through check
        if (gameState.isSquareAttacked(this.row, 2, this.color) || 
            gameState.isSquareAttacked(this.row, 3, this.color)) {
            return false;
        }

        return true;
    }
}

