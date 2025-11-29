/**
 * Knight Piece
 * Movement rules:
 * - Moves in an L-shape: 2 squares in one direction and 1 square perpendicular
 * - Can jump over other pieces
 * - Can capture opponent pieces at destination
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

export class Knight extends Piece {
    // Knight moves in L-shape: all 8 possible positions
    private static readonly MOVE_OFFSETS: readonly Direction[] = [
        { row: -2, col: -1 }, // Up 2, Left 1
        { row: -2, col: 1 }, // Up 2, Right 1
        { row: -1, col: -2 }, // Up 1, Left 2
        { row: -1, col: 2 }, // Up 1, Right 2
        { row: 1, col: -2 }, // Down 1, Left 2
        { row: 1, col: 2 }, // Down 1, Right 2
        { row: 2, col: -1 }, // Down 2, Left 1
        { row: 2, col: 1 } // Down 2, Right 1
    ];

    constructor(color: PieceColor, position: IPosition, hasMoved = false) {
        super(PieceType.KNIGHT, color, position, hasMoved);
    }

    public getPossibleMoves(board: Board, _enPassantTarget: IPosition | null): MoveList {
        return this.getSingleStepMoves(board, [...Knight.MOVE_OFFSETS]);
    }

    public clone(): Knight {
        return new Knight(this._color, this._position, this._hasMoved);
    }

    /**
     * Factory method to create knights at starting positions
     */
    public static createStartingPositions(color: PieceColor): Knight[] {
        const backRow = color === PieceColor.WHITE ? 7 : 0;
        return [
            new Knight(color, { row: backRow, col: 1 }),
            new Knight(color, { row: backRow, col: 6 })
        ];
    }

    /**
     * Verify if a move is a valid knight move (L-shape)
     */
    public static isValidKnightMove(from: IPosition, to: IPosition): boolean {
        const rowDiff = Math.abs(to.row - from.row);
        const colDiff = Math.abs(to.col - from.col);
        return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
    }
}
