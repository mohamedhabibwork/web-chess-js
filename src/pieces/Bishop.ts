/**
 * Bishop Piece
 * Movement rules:
 * - Slides diagonally any number of squares
 * - Cannot jump over pieces
 * - Can capture opponent pieces
 * - Each bishop stays on its starting color squares for the entire game
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

export class Bishop extends Piece {
    // Bishop moves in 4 diagonal directions
    private static readonly DIRECTIONS: readonly Direction[] = [
        { row: -1, col: -1 }, // Up-Left
        { row: -1, col: 1 }, // Up-Right
        { row: 1, col: -1 }, // Down-Left
        { row: 1, col: 1 } // Down-Right
    ];

    constructor(color: PieceColor, position: IPosition, hasMoved = false) {
        super(PieceType.BISHOP, color, position, hasMoved);
    }

    public getPossibleMoves(board: Board, _enPassantTarget: IPosition | null): MoveList {
        const moves: MoveList = [];

        for (const direction of Bishop.DIRECTIONS) {
            moves.push(...this.getSlidingMoves(board, direction));
        }

        return moves;
    }

    public clone(): Bishop {
        return new Bishop(this._color, this._position, this._hasMoved);
    }

    /**
     * Factory method to create bishops at starting positions
     */
    public static createStartingPositions(color: PieceColor): Bishop[] {
        const backRow = color === PieceColor.WHITE ? 7 : 0;
        return [
            new Bishop(color, { row: backRow, col: 2 }),
            new Bishop(color, { row: backRow, col: 5 })
        ];
    }

    /**
     * Check if this is a light-squared bishop
     */
    public get isLightSquare(): boolean {
        return (this._position.row + this._position.col) % 2 === 0;
    }

    /**
     * Check if this is a dark-squared bishop
     */
    public get isDarkSquare(): boolean {
        return !this.isLightSquare;
    }

    /**
     * Verify if a move is on a valid diagonal
     */
    public static isValidDiagonalMove(from: IPosition, to: IPosition): boolean {
        const rowDiff = Math.abs(to.row - from.row);
        const colDiff = Math.abs(to.col - from.col);
        return rowDiff === colDiff && rowDiff > 0;
    }
}
