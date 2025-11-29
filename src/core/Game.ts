/**
 * Chess Game Controller
 * Manages game state, validates moves, detects check/checkmate/stalemate
 */

import { Board } from './Board.js';
import { Piece } from './Piece.js';
import { Pawn, Rook, Knight, Bishop, Queen, King } from '../pieces/index.js';
import { GameHistory, NotationConverter } from './GameHistory.js';
import {
    type IPosition,
    type IMove,
    type IGameState,
    type IGameSettings,
    type ICapturedPieces,
    type MoveList,
    PieceType,
    PieceColor,
    GameStatus,
    MoveType
} from '../types/index.js';

export interface IMoveResult {
    success: boolean;
    move?: IMove;
    needsPromotion?: boolean;
    promotionPosition?: IPosition;
    error?: string;
}

export class Game {
    private _board: Board;
    private _currentPlayer: PieceColor;
    private _status: GameStatus;
    private _moveHistory: IMove[];
    private _capturedPieces: ICapturedPieces;
    private _settings: IGameSettings | null;
    private _selectedPiece: Piece | null;
    private _pendingPromotion: { position: IPosition; color: PieceColor } | null;
    private _history: GameHistory;

    constructor() {
        this._board = Board.createStandard();
        this._currentPlayer = PieceColor.WHITE;
        this._status = GameStatus.IN_PROGRESS;
        this._moveHistory = [];
        this._capturedPieces = { white: [], black: [] };
        this._settings = null;
        this._selectedPiece = null;
        this._pendingPromotion = null;
        this._history = new GameHistory();

        // Save initial state
        this._history.addSnapshot(null, this.getState(), 'Start');
    }

    // ============================================================================
    // GETTERS
    // ============================================================================

    public get board(): Board {
        return this._board;
    }

    public get currentPlayer(): PieceColor {
        return this._currentPlayer;
    }

    public get status(): GameStatus {
        return this._status;
    }

    public get moveHistory(): IMove[] {
        return [...this._moveHistory];
    }

    public get capturedPieces(): ICapturedPieces {
        return {
            white: [...this._capturedPieces.white],
            black: [...this._capturedPieces.black]
        };
    }

    public get selectedPiece(): Piece | null {
        return this._selectedPiece;
    }

    public get pendingPromotion(): { position: IPosition; color: PieceColor } | null {
        return this._pendingPromotion;
    }

    public get settings(): IGameSettings | null {
        return this._settings;
    }

    public get history(): GameHistory {
        return this._history;
    }

    // ============================================================================
    // GAME SETUP
    // ============================================================================

    public initialize(settings: IGameSettings): void {
        this._settings = settings;
        this.reset();
    }

    public reset(): void {
        this._board = Board.createStandard();
        this._currentPlayer = PieceColor.WHITE;
        this._status = GameStatus.IN_PROGRESS;
        this._moveHistory = [];
        this._capturedPieces = { white: [], black: [] };
        this._selectedPiece = null;
        this._pendingPromotion = null;

        this._history.clear();
        this._history.addSnapshot(null, this.getState(), 'Start');
    }

    // ============================================================================
    // PIECE SELECTION
    // ============================================================================

    public selectPiece(position: IPosition): MoveList {
        const piece = this._board.getPiece(position);

        if (!piece || piece.color !== this._currentPlayer) {
            this._selectedPiece = null;
            return [];
        }

        this._selectedPiece = piece;
        return this.getValidMovesForPiece(piece);
    }

    public clearSelection(): void {
        this._selectedPiece = null;
    }

    // ============================================================================
    // MOVE EXECUTION
    // ============================================================================

    /**
     * Execute a move from the selected piece to target position
     */
    public makeMove(to: IPosition): IMoveResult {
        if (!this._selectedPiece) {
            return { success: false, error: 'No piece selected' };
        }

        const from = this._selectedPiece.position;
        const validMoves = this.getValidMovesForPiece(this._selectedPiece);

        // Check if target is a valid move
        const isValidMove = validMoves.some((m) => m.row === to.row && m.col === to.col);
        if (!isValidMove) {
            return { success: false, error: 'Invalid move' };
        }

        return this.executeMove(from, to);
    }

    /**
     * Execute a move between two positions
     */
    public executeMove(from: IPosition, to: IPosition): IMoveResult {
        const piece = this._board.getPiece(from);
        if (!piece) {
            return { success: false, error: 'No piece at source position' };
        }

        let moveType = MoveType.NORMAL;
        let capturedPiece: PieceType | undefined;

        // Determine move type
        const targetPiece = this._board.getPiece(to);
        if (targetPiece) {
            moveType = MoveType.CAPTURE;
            capturedPiece = targetPiece.type;
            this._capturedPieces[targetPiece.color].push(targetPiece.type);
        }

        // Handle special moves
        if (piece.type === PieceType.KING) {
            const castleResult = this.handleCastling(piece as King, from, to);
            if (castleResult) {
                moveType = castleResult;
            }
        }

        if (piece.type === PieceType.PAWN) {
            const pawnResult = this.handlePawnSpecialMoves(piece as Pawn, from, to);
            if (pawnResult.type) {
                moveType = pawnResult.type;
            }
            if (pawnResult.capturedPiece) {
                capturedPiece = pawnResult.capturedPiece;
            }
        }

        // Execute the move
        this._board.movePiece(from, to);

        // Update en passant target
        this.updateEnPassantTarget(piece, from, to);

        // Check for pawn promotion
        if (piece.type === PieceType.PAWN && (piece as Pawn).canPromote(to.row)) {
            this._pendingPromotion = { position: to, color: piece.color };

            const move: IMove = {
                from,
                to,
                type: MoveType.PROMOTION,
                capturedPiece
            };

            return {
                success: true,
                move,
                needsPromotion: true,
                promotionPosition: to
            };
        }

        // Complete the move
        const move: IMove = { from, to, type: moveType, capturedPiece };
        this._moveHistory.push(move);
        this._selectedPiece = null;

        // Switch player and update game status
        this.switchPlayer();
        this.updateGameStatus();

        // Save to history
        const pieceData = this._board.getPieceData(to);
        const notation = pieceData
            ? NotationConverter.moveToNotation(
                move,
                pieceData.type,
                !!capturedPiece,
                this._status === GameStatus.CHECK,
                this._status === GameStatus.CHECKMATE
            )
            : '';
        this._history.addSnapshot(move, this.getState(), notation);

        return { success: true, move };
    }

    /**
     * Complete pawn promotion
     */
    public promotePawn(pieceType: PieceType): IMoveResult {
        if (!this._pendingPromotion) {
            return { success: false, error: 'No pending promotion' };
        }

        const { position, color } = this._pendingPromotion;

        // Create the promoted piece
        let newPiece: Piece;
        switch (pieceType) {
            case PieceType.QUEEN:
                newPiece = new Queen(color, position, true);
                break;
            case PieceType.ROOK:
                newPiece = new Rook(color, position, true);
                break;
            case PieceType.BISHOP:
                newPiece = new Bishop(color, position, true);
                break;
            case PieceType.KNIGHT:
                newPiece = new Knight(color, position, true);
                break;
            default:
                return { success: false, error: 'Invalid promotion piece' };
        }

        // Replace pawn with promoted piece
        this._board.setPieceAt(position, newPiece);

        // Get the last move info
        const lastMoveIndex = this._moveHistory.length;
        const from = lastMoveIndex > 0 ? this._moveHistory[lastMoveIndex - 1]?.from : position;

        const move: IMove = {
            from: from ?? position,
            to: position,
            type: MoveType.PROMOTION,
            promotionPiece: pieceType
        };

        this._moveHistory.push(move);
        this._pendingPromotion = null;
        this._selectedPiece = null;

        // Switch player and update game status
        this.switchPlayer();
        this.updateGameStatus();

        // Save to history
        const notation = NotationConverter.moveToNotation(
            move,
            pieceType,
            false,
            this._status === GameStatus.CHECK,
            this._status === GameStatus.CHECKMATE
        );
        this._history.addSnapshot(move, this.getState(), notation);

        return { success: true, move };
    }

    // ============================================================================
    // SPECIAL MOVE HANDLERS
    // ============================================================================

    private handleCastling(_king: King, from: IPosition, to: IPosition): MoveType | null {
        const colDiff = to.col - from.col;

        if (Math.abs(colDiff) !== 2) {
            return null;
        }

        // Kingside castling
        if (colDiff === 2) {
            const rookFrom = { row: from.row, col: 7 };
            const rookTo = { row: from.row, col: 5 };
            this._board.movePiece(rookFrom, rookTo);
            return MoveType.CASTLE_KINGSIDE;
        }

        // Queenside castling
        if (colDiff === -2) {
            const rookFrom = { row: from.row, col: 0 };
            const rookTo = { row: from.row, col: 3 };
            this._board.movePiece(rookFrom, rookTo);
            return MoveType.CASTLE_QUEENSIDE;
        }

        return null;
    }

    private handlePawnSpecialMoves(
        pawn: Pawn,
        _from: IPosition,
        to: IPosition
    ): { type?: MoveType; capturedPiece?: PieceType } {
        const enPassantTarget = this._board.enPassantTarget;

        // En passant capture
        if (enPassantTarget && to.row === enPassantTarget.row && to.col === enPassantTarget.col) {
            const capturedPawnRow = pawn.color === PieceColor.WHITE ? to.row + 1 : to.row - 1;
            const capturedPawn = this._board.removePiece({ row: capturedPawnRow, col: to.col });

            if (capturedPawn) {
                this._capturedPieces[capturedPawn.color].push(PieceType.PAWN);
                return { type: MoveType.EN_PASSANT, capturedPiece: PieceType.PAWN };
            }
        }

        return {};
    }

    private updateEnPassantTarget(piece: Piece, from: IPosition, to: IPosition): void {
        // Only pawns can create en passant targets
        if (piece.type !== PieceType.PAWN) {
            this._board.setEnPassantTarget(null);
            return;
        }

        const rowDiff = Math.abs(to.row - from.row);

        // If pawn moved two squares, set en passant target
        if (rowDiff === 2) {
            const direction = piece.color === PieceColor.WHITE ? 1 : -1;
            this._board.setEnPassantTarget({
                row: to.row + direction,
                col: to.col
            });
        } else {
            this._board.setEnPassantTarget(null);
        }
    }

    // ============================================================================
    // VALID MOVES CALCULATION
    // ============================================================================

    /**
     * Get all valid moves for a piece (filtered for check)
     */
    public getValidMovesForPiece(piece: Piece): MoveList {
        const possibleMoves = piece.getPossibleMoves(
            this._board.squares,
            this._board.enPassantTarget
        );

        // Add castling moves for king
        if (piece.type === PieceType.KING) {
            const king = piece as King;
            const castlingMoves = king.getCastlingMoves(
                this._board.squares,
                this._board.castlingRights,
                (row, col) => this.isSquareAttacked(row, col, piece.color)
            );

            for (const castle of castlingMoves) {
                possibleMoves.push(castle.kingTo);
            }
        }

        // Filter out moves that would leave king in check
        return possibleMoves.filter((move) => !this.wouldMoveLeaveKingInCheck(piece, move));
    }

    /**
     * Check if a move would leave own king in check
     */
    private wouldMoveLeaveKingInCheck(piece: Piece, to: IPosition): boolean {
        // Clone the board
        const testBoard = this._board.clone();

        // Make the move on the test board
        testBoard.movePiece(piece.position, to);

        // Find the king
        const king = testBoard.findKing(piece.color);
        if (!king) {
            return true; // No king found, invalid state
        }

        // Check if king is under attack
        return this.isKingInCheckOnBoard(testBoard, piece.color);
    }

    // ============================================================================
    // CHECK DETECTION
    // ============================================================================

    /**
     * Check if current player's king is in check
     */
    public isInCheck(color: PieceColor = this._currentPlayer): boolean {
        return this.isKingInCheckOnBoard(this._board, color);
    }

    /**
     * Check if king is in check on a specific board
     */
    private isKingInCheckOnBoard(board: Board, color: PieceColor): boolean {
        const king = board.findKing(color);
        if (!king) {
            return false;
        }

        return this.isSquareAttackedOnBoard(board, king.row, king.col, color);
    }

    /**
     * Check if a square is attacked by opponent
     */
    public isSquareAttacked(row: number, col: number, defendingColor: PieceColor): boolean {
        return this.isSquareAttackedOnBoard(this._board, row, col, defendingColor);
    }

    /**
     * Check if a square is attacked on a specific board
     */
    private isSquareAttackedOnBoard(
        board: Board,
        row: number,
        col: number,
        defendingColor: PieceColor
    ): boolean {
        const opponentColor =
            defendingColor === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE;

        const opponentPieces = board.getPiecesByColor(opponentColor);

        for (const piece of opponentPieces) {
            const moves = piece.getPossibleMoves(board.squares, null);
            if (moves.some((m) => m.row === row && m.col === col)) {
                return true;
            }
        }

        return false;
    }

    // ============================================================================
    // GAME STATUS
    // ============================================================================

    private switchPlayer(): void {
        this._currentPlayer =
            this._currentPlayer === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE;
    }

    private updateGameStatus(): void {
        const hasValidMoves = this.hasAnyValidMoves(this._currentPlayer);
        const isInCheck = this.isInCheck(this._currentPlayer);

        if (!hasValidMoves) {
            if (isInCheck) {
                this._status = GameStatus.CHECKMATE;
            } else {
                this._status = GameStatus.STALEMATE;
            }
        } else if (isInCheck) {
            this._status = GameStatus.CHECK;
        } else {
            this._status = GameStatus.IN_PROGRESS;
        }
    }

    /**
     * Check if player has any valid moves
     */
    private hasAnyValidMoves(color: PieceColor): boolean {
        const pieces = this._board.getPiecesByColor(color);

        for (const piece of pieces) {
            const validMoves = this.getValidMovesForPiece(piece);
            if (validMoves.length > 0) {
                return true;
            }
        }

        return false;
    }

    /**
     * Get all valid moves for current player
     */
    public getAllValidMoves(): Array<{ piece: Piece; moves: MoveList }> {
        const result: Array<{ piece: Piece; moves: MoveList }> = [];
        const pieces = this._board.getPiecesByColor(this._currentPlayer);

        for (const piece of pieces) {
            const moves = this.getValidMovesForPiece(piece);
            if (moves.length > 0) {
                result.push({ piece, moves });
            }
        }

        return result;
    }

    // ============================================================================
    // GAME STATE
    // ============================================================================

    /**
     * Get complete game state
     */
    public getState(): IGameState {
        return {
            status: this._status,
            currentPlayer: this._currentPlayer,
            board: {
                squares: this._board.squares,
                currentPlayer: this._currentPlayer,
                enPassantTarget: this._board.enPassantTarget,
                castlingRights: this._board.castlingRights,
                halfMoveClock: 0,
                fullMoveNumber: Math.floor(this._moveHistory.length / 2) + 1
            },
            moveHistory: [...this._moveHistory],
            capturedPieces: this.capturedPieces
        };
    }

    /**
     * Get position of king in check (for UI highlighting)
     */
    public getKingInCheckPosition(): IPosition | null {
        if (this._status !== GameStatus.CHECK && this._status !== GameStatus.CHECKMATE) {
            return null;
        }

        const king = this._board.findKing(this._currentPlayer);
        return king ? king.position : null;
    }

    /**
     * Check if game is over
     */
    public isGameOver(): boolean {
        return (
            this._status === GameStatus.CHECKMATE ||
            this._status === GameStatus.STALEMATE ||
            this._status === GameStatus.DRAW ||
            this._status === GameStatus.RESIGNED
        );
    }

    /**
     * Get winner (null for draw/stalemate)
     */
    public getWinner(): PieceColor | null {
        if (this._status === GameStatus.CHECKMATE) {
            return this._currentPlayer === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE;
        }
        return null;
    }

    // ============================================================================
    // HISTORY & ROLLBACK
    // ============================================================================

    /**
     * Restore game state from a snapshot
     */
    private restoreStateFromSnapshot(state: IGameState): void {
        this._currentPlayer = state.currentPlayer;
        this._status = state.status;
        this._moveHistory = [...state.moveHistory];
        this._capturedPieces = {
            white: [...state.capturedPieces.white],
            black: [...state.capturedPieces.black]
        };
        this._selectedPiece = null;
        this._pendingPromotion = null;

        // Restore board state
        this._board = Board.fromBoardState(state.board);
    }

    /**
     * Go back to a specific point in history
     */
    public goToHistoryPoint(index: number): boolean {
        const state = this._history.goToSnapshot(index);
        if (state) {
            this.restoreStateFromSnapshot(state);
            return true;
        }
        return false;
    }

    /**
     * Go back one move
     */
    public undoMove(): boolean {
        const state = this._history.goBack();
        if (state) {
            this.restoreStateFromSnapshot(state);
            return true;
        }
        return false;
    }

    /**
     * Go forward one move (redo)
     */
    public redoMove(): boolean {
        const state = this._history.goForward();
        if (state) {
            this.restoreStateFromSnapshot(state);
            return true;
        }
        return false;
    }

    /**
     * Go to the latest move
     */
    public goToLatest(): boolean {
        if (!this._history.isAtLatest()) {
            const state = this._history.goToLatest();
            if (state) {
                this.restoreStateFromSnapshot(state);
                return true;
            }
        }
        return false;
    }

    /**
     * Go to the start of the game
     */
    public goToStart(): boolean {
        const state = this._history.goToStart();
        if (state) {
            this.restoreStateFromSnapshot(state);
            return true;
        }
        return false;
    }
}
