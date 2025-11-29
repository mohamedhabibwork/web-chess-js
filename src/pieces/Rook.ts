/**
 * Rook Piece
 * Movement rules:
 * - Slides horizontally or vertically any number of squares
 * - Cannot jump over pieces
 * - Can capture opponent pieces
 * - Participates in castling
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

export class Rook extends Piece {
    // Rook moves in 4 directions: up, down, left, right
    private static readonly DIRECTIONS: readonly Direction[] = [
        { row: -1, col: 0 }, // Up
        { row: 1, col: 0 }, // Down
        { row: 0, col: -1 }, // Left
        { row: 0, col: 1 } // Right
    ];

    constructor(color: PieceColor, position: IPosition, hasMoved = false) {
        super(PieceType.ROOK, color, position, hasMoved);
    }

    public getPossibleMoves(board: Board, _enPassantTarget: IPosition | null): MoveList {
        const moves: MoveList = [];

        for (const direction of Rook.DIRECTIONS) {
            moves.push(...this.getSlidingMoves(board, direction));
        }

        return moves;
    }

    public clone(): Rook {
        return new Rook(this._color, this._position, this._hasMoved);
    }

    /**
     * Factory method to create rooks at starting positions
     */
    public static createStartingPositions(color: PieceColor): Rook[] {
        const backRow = color === PieceColor.WHITE ? 7 : 0;
        return [
            new Rook(color, { row: backRow, col: 0 }),
            new Rook(color, { row: backRow, col: 7 })
        ];
    }

    /**
     * Check if this is the kingside rook
     */
    public get isKingsideRook(): boolean {
        const startCol = 7;
        return (
            this._position.col === startCol || (!this._hasMoved && this._position.col === startCol)
        );
    }

    /**
     * Check if this is the queenside rook
     */
    public get isQueensideRook(): boolean {
        const startCol = 0;
        return (
            this._position.col === startCol || (!this._hasMoved && this._position.col === startCol)
        );
    }
}
