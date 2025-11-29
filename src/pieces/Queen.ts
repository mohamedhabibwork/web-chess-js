/**
 * Queen Piece
 * Movement rules:
 * - Combines Rook and Bishop movement
 * - Slides horizontally, vertically, or diagonally any number of squares
 * - Cannot jump over pieces
 * - Most powerful piece on the board
 */

import { Piece } from '../core/Piece.js';
import {
    type IPosition,
    type Board,
    type MoveList,
    type Direction,
    PieceType,
    PieceColor
} from '../types/index.js';

export class Queen extends Piece {
    // Queen moves in all 8 directions (combines Rook and Bishop)
    private static readonly DIRECTIONS: readonly Direction[] = [
        // Rook directions
        { row: -1, col: 0 }, // Up
        { row: 1, col: 0 }, // Down
        { row: 0, col: -1 }, // Left
        { row: 0, col: 1 }, // Right
        // Bishop directions
        { row: -1, col: -1 }, // Up-Left
        { row: -1, col: 1 }, // Up-Right
        { row: 1, col: -1 }, // Down-Left
        { row: 1, col: 1 } // Down-Right
    ];

    constructor(color: PieceColor, position: IPosition, hasMoved = false) {
        super(PieceType.QUEEN, color, position, hasMoved);
    }

    public getPossibleMoves(board: Board, _enPassantTarget: IPosition | null): MoveList {
        const moves: MoveList = [];

        for (const direction of Queen.DIRECTIONS) {
            moves.push(...this.getSlidingMoves(board, direction));
        }

        return moves;
    }

    public clone(): Queen {
        return new Queen(this._color, this._position, this._hasMoved);
    }

    /**
     * Factory method to create queen at starting position
     */
    public static createStartingPosition(color: PieceColor): Queen {
        const backRow = color === PieceColor.WHITE ? 7 : 0;
        return new Queen(color, { row: backRow, col: 3 });
    }

    /**
     * Verify if a move is valid for a queen (horizontal, vertical, or diagonal)
     */
    public static isValidQueenMove(from: IPosition, to: IPosition): boolean {
        const rowDiff = Math.abs(to.row - from.row);
        const colDiff = Math.abs(to.col - from.col);

        // Horizontal or vertical (like Rook)
        const isHorizontalOrVertical =
            (from.row === to.row || from.col === to.col) &&
            !(from.row === to.row && from.col === to.col);

        // Diagonal (like Bishop)
        const isDiagonal = rowDiff === colDiff && rowDiff > 0;

        return isHorizontalOrVertical || isDiagonal;
    }
}
