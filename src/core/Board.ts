/**
 * Chess Board Class
 * Manages the board state and piece positions
 */

import { Piece } from './Piece.js';
import { Pawn, Rook, Knight, Bishop, Queen, King } from '../pieces/index.js';
import {
    type IPosition,
    type IPieceData,
    type Board as BoardType,
    type ICastlingRights,
    PieceType,
    PieceColor,
    BOARD_SIZE
} from '../types/index.js';

export class Board {
    private _squares: (Piece | null)[][];
    private _enPassantTarget: IPosition | null = null;
    private _castlingRights: ICastlingRights;

    constructor() {
        this._squares = this.createEmptyBoard();
        this._castlingRights = {
            whiteKingside: true,
            whiteQueenside: true,
            blackKingside: true,
            blackQueenside: true
        };
    }

    // ============================================================================
    // GETTERS
    // ============================================================================

    public get squares(): BoardType {
        return this._squares.map((row) => row.map((piece) => (piece ? piece.toData() : null)));
    }

    public get enPassantTarget(): IPosition | null {
        return this._enPassantTarget ? { ...this._enPassantTarget } : null;
    }

    public get castlingRights(): ICastlingRights {
        return { ...this._castlingRights };
    }

    // ============================================================================
    // SETTERS
    // ============================================================================

    public setEnPassantTarget(target: IPosition | null): void {
        this._enPassantTarget = target ? { ...target } : null;
    }

    public updateCastlingRights(rights: Partial<ICastlingRights>): void {
        this._castlingRights = { ...this._castlingRights, ...rights };
    }

    // ============================================================================
    // BOARD SETUP
    // ============================================================================

    private createEmptyBoard(): (Piece | null)[][] {
        return Array(BOARD_SIZE)
            .fill(null)
            .map(() => Array(BOARD_SIZE).fill(null));
    }

    /**
     * Initialize board with standard starting position
     */
    public setupStandardPosition(): void {
        this._squares = this.createEmptyBoard();
        this._enPassantTarget = null;
        this._castlingRights = {
            whiteKingside: true,
            whiteQueenside: true,
            blackKingside: true,
            blackQueenside: true
        };

        // Place pawns
        for (const pawn of Pawn.createStartingPositions(PieceColor.WHITE)) {
            this.setPiece(pawn);
        }
        for (const pawn of Pawn.createStartingPositions(PieceColor.BLACK)) {
            this.setPiece(pawn);
        }

        // Place rooks
        for (const rook of Rook.createStartingPositions(PieceColor.WHITE)) {
            this.setPiece(rook);
        }
        for (const rook of Rook.createStartingPositions(PieceColor.BLACK)) {
            this.setPiece(rook);
        }

        // Place knights
        for (const knight of Knight.createStartingPositions(PieceColor.WHITE)) {
            this.setPiece(knight);
        }
        for (const knight of Knight.createStartingPositions(PieceColor.BLACK)) {
            this.setPiece(knight);
        }

        // Place bishops
        for (const bishop of Bishop.createStartingPositions(PieceColor.WHITE)) {
            this.setPiece(bishop);
        }
        for (const bishop of Bishop.createStartingPositions(PieceColor.BLACK)) {
            this.setPiece(bishop);
        }

        // Place queens
        this.setPiece(Queen.createStartingPosition(PieceColor.WHITE));
        this.setPiece(Queen.createStartingPosition(PieceColor.BLACK));

        // Place kings
        this.setPiece(King.createStartingPosition(PieceColor.WHITE));
        this.setPiece(King.createStartingPosition(PieceColor.BLACK));
    }

    // ============================================================================
    // PIECE MANAGEMENT
    // ============================================================================

    /**
     * Get piece at position
     */
    public getPiece(position: IPosition): Piece | null {
        if (!this.isValidPosition(position)) {
            return null;
        }
        return this._squares[position.row][position.col];
    }

    /**
     * Get piece data at position (for external use)
     */
    public getPieceData(position: IPosition): IPieceData | null {
        const piece = this.getPiece(position);
        return piece ? piece.toData() : null;
    }

    /**
     * Set piece at its current position
     */
    public setPiece(piece: Piece): void {
        const { row, col } = piece.position;
        if (this.isValidPosition({ row, col })) {
            this._squares[row][col] = piece;
        }
    }

    /**
     * Set piece at specific position
     */
    public setPieceAt(position: IPosition, piece: Piece | null): void {
        if (this.isValidPosition(position)) {
            this._squares[position.row][position.col] = piece;
            if (piece) {
                piece.setPosition(position);
            }
        }
    }

    /**
     * Remove piece at position
     */
    public removePiece(position: IPosition): Piece | null {
        const piece = this.getPiece(position);
        if (piece) {
            this._squares[position.row][position.col] = null;
        }
        return piece;
    }

    /**
     * Move piece from one position to another
     * Returns captured piece if any
     */
    public movePiece(from: IPosition, to: IPosition): Piece | null {
        const piece = this.getPiece(from);
        if (!piece) {
            return null;
        }

        const capturedPiece = this.getPiece(to);

        // Remove from old position
        this._squares[from.row][from.col] = null;

        // Place at new position
        piece.setPosition(to);
        this._squares[to.row][to.col] = piece;

        // Update castling rights if king or rook moves
        this.updateCastlingRightsAfterMove(piece, from);

        return capturedPiece;
    }

    /**
     * Update castling rights after a piece moves
     */
    private updateCastlingRightsAfterMove(piece: Piece, from: IPosition): void {
        // If king moves, lose both castling rights
        if (piece.type === PieceType.KING) {
            if (piece.color === PieceColor.WHITE) {
                this._castlingRights = {
                    ...this._castlingRights,
                    whiteKingside: false,
                    whiteQueenside: false
                };
            } else {
                this._castlingRights = {
                    ...this._castlingRights,
                    blackKingside: false,
                    blackQueenside: false
                };
            }
        }

        // If rook moves, lose that side's castling right
        if (piece.type === PieceType.ROOK) {
            if (piece.color === PieceColor.WHITE) {
                if (from.col === 0) {
                    this._castlingRights = { ...this._castlingRights, whiteQueenside: false };
                } else if (from.col === 7) {
                    this._castlingRights = { ...this._castlingRights, whiteKingside: false };
                }
            } else {
                if (from.col === 0) {
                    this._castlingRights = { ...this._castlingRights, blackQueenside: false };
                } else if (from.col === 7) {
                    this._castlingRights = { ...this._castlingRights, blackKingside: false };
                }
            }
        }
    }

    // ============================================================================
    // VALIDATION
    // ============================================================================

    /**
     * Check if position is within board boundaries
     */
    public isValidPosition(position: IPosition): boolean {
        return (
            position.row >= 0 &&
            position.row < BOARD_SIZE &&
            position.col >= 0 &&
            position.col < BOARD_SIZE
        );
    }

    /**
     * Check if square is empty
     */
    public isSquareEmpty(position: IPosition): boolean {
        return this.getPiece(position) === null;
    }

    // ============================================================================
    // FINDING PIECES
    // ============================================================================

    /**
     * Find king of specified color
     */
    public findKing(color: PieceColor): King | null {
        for (let row = 0; row < BOARD_SIZE; row++) {
            for (let col = 0; col < BOARD_SIZE; col++) {
                const piece = this._squares[row][col];
                if (piece && piece.type === PieceType.KING && piece.color === color) {
                    return piece as King;
                }
            }
        }
        return null;
    }

    /**
     * Get all pieces of a specific color
     */
    public getPiecesByColor(color: PieceColor): Piece[] {
        const pieces: Piece[] = [];
        for (let row = 0; row < BOARD_SIZE; row++) {
            for (let col = 0; col < BOARD_SIZE; col++) {
                const piece = this._squares[row][col];
                if (piece && piece.color === color) {
                    pieces.push(piece);
                }
            }
        }
        return pieces;
    }

    // ============================================================================
    // CLONING & SERIALIZATION
    // ============================================================================

    /**
     * Create a deep clone of the board
     */
    public clone(): Board {
        const newBoard = new Board();
        newBoard._enPassantTarget = this._enPassantTarget ? { ...this._enPassantTarget } : null;
        newBoard._castlingRights = { ...this._castlingRights };

        for (let row = 0; row < BOARD_SIZE; row++) {
            for (let col = 0; col < BOARD_SIZE; col++) {
                const piece = this._squares[row][col];
                if (piece) {
                    newBoard._squares[row][col] = piece.clone();
                }
            }
        }

        return newBoard;
    }

    /**
     * Create board from piece data (for deserialization)
     */
    public static fromData(data: (IPieceData | null)[][]): Board {
        const board = new Board();

        for (let row = 0; row < BOARD_SIZE; row++) {
            for (let col = 0; col < BOARD_SIZE; col++) {
                const pieceData = data[row][col];
                if (pieceData) {
                    const piece = Board.createPieceFromData(pieceData);
                    if (piece) {
                        board._squares[row][col] = piece;
                    }
                }
            }
        }

        return board;
    }

    /**
     * Create piece instance from piece data
     */
    private static createPieceFromData(data: IPieceData): Piece | null {
        const { type, color, position, hasMoved } = data;

        switch (type) {
            case PieceType.PAWN:
                return new Pawn(color, position, hasMoved);
            case PieceType.ROOK:
                return new Rook(color, position, hasMoved);
            case PieceType.KNIGHT:
                return new Knight(color, position, hasMoved);
            case PieceType.BISHOP:
                return new Bishop(color, position, hasMoved);
            case PieceType.QUEEN:
                return new Queen(color, position, hasMoved);
            case PieceType.KING:
                return new King(color, position, hasMoved);
            default:
                return null;
        }
    }

    /**
     * Create board from board state (for history restoration)
     */
    public static fromBoardState(boardState: import('../types/index.js').IBoardState): Board {
        const board = Board.fromData(boardState.squares);
        board._enPassantTarget = boardState.enPassantTarget ? { ...boardState.enPassantTarget } : null;
        board._castlingRights = { ...boardState.castlingRights };
        return board;
    }

    /**
     * Factory method to create a standard board
     */
    public static createStandard(): Board {
        const board = new Board();
        board.setupStandardPosition();
        return board;
    }
}
