/**
 * Game History Manager
 * Manages move history, snapshots, and rollback functionality
 */

import type { IGameState, IMove } from '../types/index.js';
import { MoveType, PieceType } from '../types/index.js';

export interface IHistorySnapshot {
    readonly moveNumber: number;
    readonly move: IMove | null; // null for initial state
    readonly gameState: IGameState;
    readonly notation: string;
    readonly timestamp: number;
}

export class GameHistory {
    private _snapshots: IHistorySnapshot[] = [];
    private _currentSnapshotIndex: number = 0;

    constructor() {
        this._snapshots = [];
        this._currentSnapshotIndex = 0;
    }

    /**
     * Add a new snapshot to history
     */
    public addSnapshot(move: IMove | null, gameState: IGameState, notation: string): void {
        // If we're not at the latest snapshot, remove all future snapshots
        if (this._currentSnapshotIndex < this._snapshots.length - 1) {
            this._snapshots = this._snapshots.slice(0, this._currentSnapshotIndex + 1);
        }

        const snapshot: IHistorySnapshot = {
            moveNumber: this._snapshots.length,
            move,
            gameState: this.cloneGameState(gameState),
            notation,
            timestamp: Date.now()
        };

        this._snapshots.push(snapshot);
        this._currentSnapshotIndex = this._snapshots.length - 1;
    }

    /**
     * Go back to a specific snapshot
     */
    public goToSnapshot(index: number): IGameState | null {
        if (index < 0 || index >= this._snapshots.length) {
            return null;
        }

        this._currentSnapshotIndex = index;
        return this.cloneGameState(this._snapshots[index].gameState);
    }

    /**
     * Go back one move
     */
    public goBack(): IGameState | null {
        if (this._currentSnapshotIndex > 0) {
            return this.goToSnapshot(this._currentSnapshotIndex - 1);
        }
        return null;
    }

    /**
     * Go forward one move
     */
    public goForward(): IGameState | null {
        if (this._currentSnapshotIndex < this._snapshots.length - 1) {
            return this.goToSnapshot(this._currentSnapshotIndex + 1);
        }
        return null;
    }

    /**
     * Go to the latest move
     */
    public goToLatest(): IGameState | null {
        if (this._snapshots.length > 0) {
            return this.goToSnapshot(this._snapshots.length - 1);
        }
        return null;
    }

    /**
     * Go to the start
     */
    public goToStart(): IGameState | null {
        if (this._snapshots.length > 0) {
            return this.goToSnapshot(0);
        }
        return null;
    }

    /**
     * Get all snapshots
     */
    public getSnapshots(): IHistorySnapshot[] {
        return [...this._snapshots];
    }

    /**
     * Get current snapshot
     */
    public getCurrentSnapshot(): IHistorySnapshot | null {
        return this._snapshots[this._currentSnapshotIndex] ?? null;
    }

    /**
     * Get current snapshot index
     */
    public getCurrentIndex(): number {
        return this._currentSnapshotIndex;
    }

    /**
     * Check if we can go back
     */
    public canGoBack(): boolean {
        return this._currentSnapshotIndex > 0;
    }

    /**
     * Check if we can go forward
     */
    public canGoForward(): boolean {
        return this._currentSnapshotIndex < this._snapshots.length - 1;
    }

    /**
     * Check if we're at the latest move
     */
    public isAtLatest(): boolean {
        return this._currentSnapshotIndex === this._snapshots.length - 1;
    }

    /**
     * Clear all history
     */
    public clear(): void {
        this._snapshots = [];
        this._currentSnapshotIndex = 0;
    }

    /**
     * Get move count
     */
    public getMoveCount(): number {
        return this._snapshots.length - 1; // -1 for initial state
    }

    /**
     * Deep clone game state
     */
    private cloneGameState(state: IGameState): IGameState {
        return JSON.parse(JSON.stringify(state));
    }
}

/**
 * Convert move to algebraic notation
 */
export class NotationConverter {
    private static readonly FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    private static readonly RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

    public static positionToAlgebraic(row: number, col: number): string {
        return `${this.FILES[col]}${this.RANKS[row]}`;
    }

    public static moveToNotation(move: IMove, piece: PieceType, isCapture: boolean, isCheck: boolean, isCheckmate: boolean): string {
        let notation = '';

        // Handle castling
        if (move.type === MoveType.CASTLE_KINGSIDE) {
            return isCheckmate ? 'O-O#' : isCheck ? 'O-O+' : 'O-O';
        }
        if (move.type === MoveType.CASTLE_QUEENSIDE) {
            return isCheckmate ? 'O-O-O#' : isCheck ? 'O-O-O+' : 'O-O-O';
        }

        // Piece symbol (empty for pawn)
        const pieceSymbol = piece === PieceType.PAWN ? '' : piece.charAt(0).toUpperCase();
        notation += pieceSymbol;

        // From square (for pawns only on capture)
        if (isCapture && piece === PieceType.PAWN) {
            notation += this.FILES[move.from.col];
        }

        // Capture indicator
        if (isCapture) {
            notation += 'x';
        }

        // To square
        notation += this.positionToAlgebraic(move.to.row, move.to.col);

        // Promotion
        if (move.promotionPiece) {
            notation += '=' + move.promotionPiece.charAt(0).toUpperCase();
        }

        // Check/Checkmate
        if (isCheckmate) {
            notation += '#';
        } else if (isCheck) {
            notation += '+';
        }

        return notation;
    }
}
