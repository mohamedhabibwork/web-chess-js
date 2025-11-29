/**
 * King Piece
 * Movement rules:
 * - Moves one square in any direction
 * - Cannot move into check
 * - Castling: Special move with Rook
 *   - Kingside (short): King moves 2 squares towards h-file rook
 *   - Queenside (long): King moves 2 squares towards a-file rook
 *   - Requirements:
 *     - Neither King nor Rook has moved
 *     - No pieces between King and Rook
 *     - King not in check
 *     - King doesn't pass through or land on attacked square
 */

import { Piece } from '../core/Piece.js';
import {
    type IPosition,
    type Board,
    type MoveList,
    type Direction,
    type ICastlingRights,
    PieceType,
    PieceColor
} from '../types/index.js';

export interface ICastlingMove {
    readonly kingTo: IPosition;
    readonly rookFrom: IPosition;
    readonly rookTo: IPosition;
    readonly type: 'kingside' | 'queenside';
}

export class King extends Piece {
    // King moves one square in all 8 directions
    private static readonly MOVE_OFFSETS: readonly Direction[] = [
        { row: -1, col: 0 }, // Up
        { row: 1, col: 0 }, // Down
        { row: 0, col: -1 }, // Left
        { row: 0, col: 1 }, // Right
        { row: -1, col: -1 }, // Up-Left
        { row: -1, col: 1 }, // Up-Right
        { row: 1, col: -1 }, // Down-Left
        { row: 1, col: 1 } // Down-Right
    ];

    constructor(color: PieceColor, position: IPosition, hasMoved = false) {
        super(PieceType.KING, color, position, hasMoved);
    }

    public getPossibleMoves(board: Board, _enPassantTarget: IPosition | null): MoveList {
        // Regular one-square moves
        return this.getSingleStepMoves(board, [...King.MOVE_OFFSETS]);
    }

    /**
     * Get castling moves (called separately because it needs additional game state)
     * @param board Current board state
     * @param castlingRights Castling rights
     * @param isSquareAttacked Function to check if a square is attacked
     */
    public getCastlingMoves(
        board: Board,
        castlingRights: ICastlingRights,
        isSquareAttacked: (row: number, col: number) => boolean
    ): ICastlingMove[] {
        const moves: ICastlingMove[] = [];

        if (this._hasMoved) {
            return moves;
        }

        // Can't castle while in check
        if (isSquareAttacked(this._position.row, this._position.col)) {
            return moves;
        }

        const backRow = this._color === PieceColor.WHITE ? 7 : 0;

        // Kingside castling
        const canKingside =
            this._color === PieceColor.WHITE
                ? castlingRights.whiteKingside
                : castlingRights.blackKingside;

        if (canKingside) {
            const kingsideCastle = this.checkKingsideCastle(board, backRow, isSquareAttacked);
            if (kingsideCastle) {
                moves.push(kingsideCastle);
            }
        }

        // Queenside castling
        const canQueenside =
            this._color === PieceColor.WHITE
                ? castlingRights.whiteQueenside
                : castlingRights.blackQueenside;

        if (canQueenside) {
            const queensideCastle = this.checkQueensideCastle(board, backRow, isSquareAttacked);
            if (queensideCastle) {
                moves.push(queensideCastle);
            }
        }

        return moves;
    }

    /**
     * Check if kingside castling is possible
     */
    private checkKingsideCastle(
        board: Board,
        backRow: number,
        isSquareAttacked: (row: number, col: number) => boolean
    ): ICastlingMove | null {
        const rookCol = 7;
        const rook = board[backRow][rookCol];

        // Check rook exists and hasn't moved
        if (!rook || rook.type !== PieceType.ROOK || rook.hasMoved) {
            return null;
        }

        // Check squares between king and rook are empty (cols 5 and 6)
        if (board[backRow][5] !== null || board[backRow][6] !== null) {
            return null;
        }

        // Check king doesn't pass through or land on attacked square
        if (isSquareAttacked(backRow, 5) || isSquareAttacked(backRow, 6)) {
            return null;
        }

        return {
            kingTo: { row: backRow, col: 6 },
            rookFrom: { row: backRow, col: 7 },
            rookTo: { row: backRow, col: 5 },
            type: 'kingside'
        };
    }

    /**
     * Check if queenside castling is possible
     */
    private checkQueensideCastle(
        board: Board,
        backRow: number,
        isSquareAttacked: (row: number, col: number) => boolean
    ): ICastlingMove | null {
        const rookCol = 0;
        const rook = board[backRow][rookCol];

        // Check rook exists and hasn't moved
        if (!rook || rook.type !== PieceType.ROOK || rook.hasMoved) {
            return null;
        }

        // Check squares between king and rook are empty (cols 1, 2, and 3)
        if (
            board[backRow][1] !== null ||
            board[backRow][2] !== null ||
            board[backRow][3] !== null
        ) {
            return null;
        }

        // Check king doesn't pass through or land on attacked square (cols 2 and 3)
        // Note: col 1 doesn't need to be checked because king doesn't pass through it
        if (isSquareAttacked(backRow, 2) || isSquareAttacked(backRow, 3)) {
            return null;
        }

        return {
            kingTo: { row: backRow, col: 2 },
            rookFrom: { row: backRow, col: 0 },
            rookTo: { row: backRow, col: 3 },
            type: 'queenside'
        };
    }

    public clone(): King {
        return new King(this._color, this._position, this._hasMoved);
    }

    /**
     * Factory method to create king at starting position
     */
    public static createStartingPosition(color: PieceColor): King {
        const backRow = color === PieceColor.WHITE ? 7 : 0;
        return new King(color, { row: backRow, col: 4 });
    }

    /**
     * Check if a position is adjacent to this king (one square away)
     */
    public isAdjacentTo(position: IPosition): boolean {
        const rowDiff = Math.abs(position.row - this._position.row);
        const colDiff = Math.abs(position.col - this._position.col);
        return rowDiff <= 1 && colDiff <= 1 && !(rowDiff === 0 && colDiff === 0);
    }
}
