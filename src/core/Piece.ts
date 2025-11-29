/**
 * Abstract Piece Class - Base class for all chess pieces
 * Implements common functionality and defines abstract methods for specific pieces
 */

import {
    type IPosition,
    type IPieceData,
    type Board,
    type MoveList,
    type Direction,
    PieceType,
    PieceColor,
    BOARD_SIZE
} from '../types/index.js';

export abstract class Piece {
    protected readonly _type: PieceType;
    protected readonly _color: PieceColor;
    protected _position: IPosition;
    protected _hasMoved: boolean;

    constructor(type: PieceType, color: PieceColor, position: IPosition, hasMoved = false) {
        this._type = type;
        this._color = color;
        this._position = { ...position };
        this._hasMoved = hasMoved;
    }

    // ============================================================================
    // GETTERS
    // ============================================================================

    public get type(): PieceType {
        return this._type;
    }

    public get color(): PieceColor {
        return this._color;
    }

    public get position(): IPosition {
        return { ...this._position };
    }

    public get hasMoved(): boolean {
        return this._hasMoved;
    }

    public get row(): number {
        return this._position.row;
    }

    public get col(): number {
        return this._position.col;
    }

    // ============================================================================
    // SETTERS
    // ============================================================================

    public setPosition(position: IPosition): void {
        this._position = { ...position };
        this._hasMoved = true;
    }

    public setHasMoved(hasMoved: boolean): void {
        this._hasMoved = hasMoved;
    }

    // ============================================================================
    // ABSTRACT METHODS - Must be implemented by subclasses
    // ============================================================================

    /**
     * Get all possible moves for this piece (without considering check)
     */
    public abstract getPossibleMoves(board: Board, enPassantTarget: IPosition | null): MoveList;

    /**
     * Clone the piece
     */
    public abstract clone(): Piece;

    // ============================================================================
    // COMMON METHODS
    // ============================================================================

    /**
     * Check if position is within board boundaries
     */
    protected isValidPosition(row: number, col: number): boolean {
        return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
    }

    /**
     * Check if square is empty
     */
    protected isSquareEmpty(board: Board, row: number, col: number): boolean {
        if (!this.isValidPosition(row, col)) {
            return false;
        }
        return board[row][col] === null;
    }

    /**
     * Check if square has an opponent's piece
     */
    protected isOpponentPiece(board: Board, row: number, col: number): boolean {
        if (!this.isValidPosition(row, col)) {
            return false;
        }
        const piece = board[row][col];
        return piece !== null && piece.color !== this._color;
    }

    /**
     * Check if square has own piece
     */
    protected isOwnPiece(board: Board, row: number, col: number): boolean {
        if (!this.isValidPosition(row, col)) {
            return false;
        }
        const piece = board[row][col];
        return piece !== null && piece.color === this._color;
    }

    /**
     * Get all moves in a single direction (for sliding pieces)
     */
    protected getSlidingMoves(board: Board, direction: Direction): MoveList {
        const moves: MoveList = [];
        let row = this._position.row + direction.row;
        let col = this._position.col + direction.col;

        while (this.isValidPosition(row, col)) {
            if (this.isSquareEmpty(board, row, col)) {
                moves.push({ row, col });
            } else if (this.isOpponentPiece(board, row, col)) {
                moves.push({ row, col });
                break; // Can capture but can't go further
            } else {
                break; // Own piece blocks
            }
            row += direction.row;
            col += direction.col;
        }

        return moves;
    }

    /**
     * Get single step moves (for King and Knight)
     */
    protected getSingleStepMoves(board: Board, offsets: Direction[]): MoveList {
        const moves: MoveList = [];

        for (const offset of offsets) {
            const row = this._position.row + offset.row;
            const col = this._position.col + offset.col;

            if (this.isValidPosition(row, col) && !this.isOwnPiece(board, row, col)) {
                moves.push({ row, col });
            }
        }

        return moves;
    }

    /**
     * Convert piece to serializable data
     */
    public toData(): IPieceData {
        return {
            type: this._type,
            color: this._color,
            position: { ...this._position },
            hasMoved: this._hasMoved
        };
    }

    /**
     * Check if two positions are equal
     */
    protected positionsEqual(a: IPosition, b: IPosition): boolean {
        return a.row === b.row && a.col === b.col;
    }
}
