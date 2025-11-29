/**
 * Chess Game Type Definitions
 * Full TypeScript interfaces and types for the chess game
 */

// ============================================================================
// ENUMS
// ============================================================================

export enum PieceColor {
    WHITE = 'white',
    BLACK = 'black'
}

export enum PieceType {
    PAWN = 'pawn',
    ROOK = 'rook',
    KNIGHT = 'knight',
    BISHOP = 'bishop',
    QUEEN = 'queen',
    KING = 'king'
}

export enum GameStatus {
    NOT_STARTED = 'not_started',
    IN_PROGRESS = 'in_progress',
    CHECK = 'check',
    CHECKMATE = 'checkmate',
    STALEMATE = 'stalemate',
    DRAW = 'draw',
    RESIGNED = 'resigned'
}

export enum GameMode {
    PVP = 'pvp',
    AI = 'ai'
}

export enum AIDifficulty {
    EASY = 'easy',
    MEDIUM = 'medium',
    HARD = 'hard'
}

export enum MoveType {
    NORMAL = 'normal',
    CAPTURE = 'capture',
    CASTLE_KINGSIDE = 'castle_kingside',
    CASTLE_QUEENSIDE = 'castle_queenside',
    EN_PASSANT = 'en_passant',
    PROMOTION = 'promotion',
    CHECK = 'check',
    CHECKMATE = 'checkmate'
}

// ============================================================================
// INTERFACES
// ============================================================================

export interface IPosition {
    readonly row: number;
    readonly col: number;
}

export interface IMove {
    readonly from: IPosition;
    readonly to: IPosition;
    readonly type: MoveType;
    readonly capturedPiece?: PieceType;
    readonly promotionPiece?: PieceType;
}

export interface IMoveValidation {
    readonly isValid: boolean;
    readonly reason?: string;
}

export interface IPieceData {
    readonly type: PieceType;
    readonly color: PieceColor;
    readonly position: IPosition;
    readonly hasMoved: boolean;
}

export interface IBoardState {
    readonly squares: (IPieceData | null)[][];
    readonly currentPlayer: PieceColor;
    readonly enPassantTarget: IPosition | null;
    readonly castlingRights: ICastlingRights;
    readonly halfMoveClock: number;
    readonly fullMoveNumber: number;
}

export interface ICastlingRights {
    readonly whiteKingside: boolean;
    readonly whiteQueenside: boolean;
    readonly blackKingside: boolean;
    readonly blackQueenside: boolean;
}

export interface IGameState {
    readonly status: GameStatus;
    readonly currentPlayer: PieceColor;
    readonly board: IBoardState;
    readonly moveHistory: IMove[];
    readonly capturedPieces: ICapturedPieces;
}

export interface ICapturedPieces {
    readonly white: PieceType[];
    readonly black: PieceType[];
}

export interface IPlayer {
    readonly name: string;
    readonly color: PieceColor;
    readonly isAI: boolean;
}

export interface IGameSettings {
    readonly mode: GameMode;
    readonly players: {
        readonly white: IPlayer;
        readonly black: IPlayer;
    };
    readonly aiDifficulty?: AIDifficulty;
    readonly theme: string;
    readonly timeControl?: ITimeControl;
}

export interface ITimeControl {
    readonly initialTime: number; // in seconds
    readonly increment: number; // in seconds
}

export interface IGameResult {
    readonly winner: PieceColor | null; // null for draw
    readonly reason: GameStatus;
    readonly moves: number;
}

// ============================================================================
// UI INTERFACES
// ============================================================================

export interface ITheme {
    readonly name: string;
    readonly lightSquare: string;
    readonly darkSquare: string;
    readonly selectedSquare: string;
    readonly validMove: string;
    readonly validMoveBg: string;
    readonly captureHighlight: string;
    readonly captureHighlightBg: string;
    readonly checkHighlight: string;
    readonly lastMove: string;
}

export interface IUIState {
    readonly selectedSquare: IPosition | null;
    readonly validMoves: IPosition[];
    readonly lastMove: IMove | null;
    readonly isThinking: boolean;
    readonly showPromotionModal: boolean;
    readonly promotionPosition: IPosition | null;
}

// ============================================================================
// AI INTERFACES
// ============================================================================

export interface IAIMove {
    readonly move: IMove;
    readonly score: number;
}

export interface IEvaluation {
    readonly score: number;
    readonly bestMove: IMove | null;
    readonly depth: number;
}

// ============================================================================
// EVENT INTERFACES
// ============================================================================

export interface IGameEvent {
    readonly type: GameEventType;
    readonly data: unknown;
    readonly timestamp: number;
}

export enum GameEventType {
    GAME_START = 'game_start',
    MOVE_MADE = 'move_made',
    PIECE_CAPTURED = 'piece_captured',
    CHECK = 'check',
    CHECKMATE = 'checkmate',
    STALEMATE = 'stalemate',
    PROMOTION = 'promotion',
    CASTLE = 'castle',
    GAME_END = 'game_end'
}

// ============================================================================
// TYPE ALIASES
// ============================================================================

export type Board = (IPieceData | null)[][];
export type MoveList = IPosition[];
export type Direction = { readonly row: number; readonly col: number };

// ============================================================================
// CONSTANTS
// ============================================================================

export const BOARD_SIZE = 8;

export const PIECE_VALUES: Record<PieceType, number> = {
    [PieceType.PAWN]: 100,
    [PieceType.KNIGHT]: 320,
    [PieceType.BISHOP]: 330,
    [PieceType.ROOK]: 500,
    [PieceType.QUEEN]: 900,
    [PieceType.KING]: 20000
};

export const PIECE_SYMBOLS: Record<PieceColor, Record<PieceType, string>> = {
    [PieceColor.WHITE]: {
        [PieceType.PAWN]: '♙',
        [PieceType.ROOK]: '♖',
        [PieceType.KNIGHT]: '♘',
        [PieceType.BISHOP]: '♗',
        [PieceType.QUEEN]: '♕',
        [PieceType.KING]: '♔'
    },
    [PieceColor.BLACK]: {
        [PieceType.PAWN]: '♟',
        [PieceType.ROOK]: '♜',
        [PieceType.KNIGHT]: '♞',
        [PieceType.BISHOP]: '♝',
        [PieceType.QUEEN]: '♛',
        [PieceType.KING]: '♚'
    }
};

export const FILE_LETTERS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const;
export const RANK_NUMBERS = ['8', '7', '6', '5', '4', '3', '2', '1'] as const;
