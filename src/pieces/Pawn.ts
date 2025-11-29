/**
 * Pawn Piece
 * Movement rules:
 * - Forward 1 square (or 2 from starting position)
 * - Diagonal capture only
 * - En passant capture
 * - Promotion when reaching opposite end
 */

import { Piece } from '../core/Piece.js';
import {
    type IPosition,
    type Board,
    type MoveList,
    PieceType,
    PieceColor
} from '../types/index.js';

export class Pawn extends Piece {
    constructor(color: PieceColor, position: IPosition, hasMoved = false) {
        super(PieceType.PAWN, color, position, hasMoved);
    }

    /**
     * Get the direction pawns move based on color
     * White moves up (negative row), Black moves down (positive row)
     */
    private get direction(): number {
        return this._color === PieceColor.WHITE ? -1 : 1;
    }

    /**
     * Get the starting row for this pawn's color
     */
    private get startRow(): number {
        return this._color === PieceColor.WHITE ? 6 : 1;
    }

    /**
     * Get the promotion row for this pawn's color
     */
    public get promotionRow(): number {
        return this._color === PieceColor.WHITE ? 0 : 7;
    }

    public getPossibleMoves(board: Board, enPassantTarget: IPosition | null): MoveList {
        const moves: MoveList = [];
        const { row, col } = this._position;

        // Forward one square
        const oneForward = row + this.direction;
        if (this.isValidPosition(oneForward, col) && this.isSquareEmpty(board, oneForward, col)) {
            moves.push({ row: oneForward, col });

            // Forward two squares from starting position
            if (!this._hasMoved && row === this.startRow) {
                const twoForward = row + this.direction * 2;
                if (this.isSquareEmpty(board, twoForward, col)) {
                    moves.push({ row: twoForward, col });
                }
            }
        }

        // Diagonal captures
        const captureLeft = { row: row + this.direction, col: col - 1 };
        const captureRight = { row: row + this.direction, col: col + 1 };

        for (const capture of [captureLeft, captureRight]) {
            if (this.isValidPosition(capture.row, capture.col)) {
                // Regular capture
                if (this.isOpponentPiece(board, capture.row, capture.col)) {
                    moves.push(capture);
                }
                // En passant capture
                else if (enPassantTarget && this.positionsEqual(capture, enPassantTarget)) {
                    moves.push(capture);
                }
            }
        }

        return moves;
    }

    /**
     * Check if this pawn can be promoted at the given row
     */
    public canPromote(row: number): boolean {
        return row === this.promotionRow;
    }

    public clone(): Pawn {
        return new Pawn(this._color, this._position, this._hasMoved);
    }

    /**
     * Factory method to create pawns at starting positions
     */
    public static createStartingPositions(color: PieceColor): Pawn[] {
        const startRow = color === PieceColor.WHITE ? 6 : 1;
        const pawns: Pawn[] = [];

        for (let col = 0; col < 8; col++) {
            pawns.push(new Pawn(color, { row: startRow, col }));
        }

        return pawns;
    }
}
