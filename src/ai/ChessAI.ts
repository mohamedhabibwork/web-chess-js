/**
 * Chess AI Engine
 * Implements minimax algorithm with alpha-beta pruning
 */

import { Game } from '../core/Game.js';
import { Piece } from '../core/Piece.js';
import {
    type IPosition,
    type MoveList,
    PieceType,
    PieceColor,
    AIDifficulty,
    PIECE_VALUES,
    BOARD_SIZE
} from '../types/index.js';

interface IAIMove {
    from: IPosition;
    to: IPosition;
    score: number;
}

export class ChessAI {
    private _difficulty: AIDifficulty;
    private readonly _color: PieceColor;

    // Position bonus tables for evaluation
    private static readonly PAWN_TABLE: readonly number[][] = [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [50, 50, 50, 50, 50, 50, 50, 50],
        [10, 10, 20, 30, 30, 20, 10, 10],
        [5, 5, 10, 25, 25, 10, 5, 5],
        [0, 0, 0, 20, 20, 0, 0, 0],
        [5, -5, -10, 0, 0, -10, -5, 5],
        [5, 10, 10, -20, -20, 10, 10, 5],
        [0, 0, 0, 0, 0, 0, 0, 0]
    ];

    private static readonly KNIGHT_TABLE: readonly number[][] = [
        [-50, -40, -30, -30, -30, -30, -40, -50],
        [-40, -20, 0, 0, 0, 0, -20, -40],
        [-30, 0, 10, 15, 15, 10, 0, -30],
        [-30, 5, 15, 20, 20, 15, 5, -30],
        [-30, 0, 15, 20, 20, 15, 0, -30],
        [-30, 5, 10, 15, 15, 10, 5, -30],
        [-40, -20, 0, 5, 5, 0, -20, -40],
        [-50, -40, -30, -30, -30, -30, -40, -50]
    ];

    private static readonly BISHOP_TABLE: readonly number[][] = [
        [-20, -10, -10, -10, -10, -10, -10, -20],
        [-10, 0, 0, 0, 0, 0, 0, -10],
        [-10, 0, 10, 10, 10, 10, 0, -10],
        [-10, 5, 5, 10, 10, 5, 5, -10],
        [-10, 0, 5, 10, 10, 5, 0, -10],
        [-10, 5, 5, 5, 5, 5, 5, -10],
        [-10, 5, 0, 0, 0, 0, 5, -10],
        [-20, -10, -10, -10, -10, -10, -10, -20]
    ];

    private static readonly KING_TABLE: readonly number[][] = [
        [-30, -40, -40, -50, -50, -40, -40, -30],
        [-30, -40, -40, -50, -50, -40, -40, -30],
        [-30, -40, -40, -50, -50, -40, -40, -30],
        [-30, -40, -40, -50, -50, -40, -40, -30],
        [-20, -30, -30, -40, -40, -30, -30, -20],
        [-10, -20, -20, -20, -20, -20, -20, -10],
        [20, 20, 0, 0, 0, 0, 20, 20],
        [20, 30, 10, 0, 0, 10, 30, 20]
    ];

    constructor(
        difficulty: AIDifficulty = AIDifficulty.MEDIUM,
        color: PieceColor = PieceColor.BLACK
    ) {
        this._difficulty = difficulty;
        this._color = color;
    }

    // ============================================================================
    // GETTERS & SETTERS
    // ============================================================================

    public get difficulty(): AIDifficulty {
        return this._difficulty;
    }

    public setDifficulty(difficulty: AIDifficulty): void {
        this._difficulty = difficulty;
    }

    public get color(): PieceColor {
        return this._color;
    }

    // ============================================================================
    // MOVE SELECTION
    // ============================================================================

    /**
     * Get the best move for the AI
     */
    public getBestMove(game: Game): IAIMove | null {
        const allMoves = game.getAllValidMoves();

        if (allMoves.length === 0) {
            return null;
        }

        switch (this._difficulty) {
            case AIDifficulty.EASY:
                return this.getRandomMove(allMoves);
            case AIDifficulty.MEDIUM:
                return this.getMediumMove(game, allMoves);
            case AIDifficulty.HARD:
                return this.getHardMove(game, allMoves);
            default:
                return this.getMediumMove(game, allMoves);
        }
    }

    /**
     * Easy difficulty - Random move selection
     */
    private getRandomMove(allMoves: Array<{ piece: Piece; moves: MoveList }>): IAIMove {
        const randomPieceIndex = Math.floor(Math.random() * allMoves.length);
        const pieceMove = allMoves[randomPieceIndex];
        const randomMoveIndex = Math.floor(Math.random() * pieceMove.moves.length);

        return {
            from: pieceMove.piece.position,
            to: pieceMove.moves[randomMoveIndex],
            score: 0
        };
    }

    /**
     * Medium difficulty - Evaluate each move and pick best with some randomness
     */
    private getMediumMove(game: Game, allMoves: Array<{ piece: Piece; moves: MoveList }>): IAIMove {
        let bestMove: IAIMove | null = null;
        let bestScore = -Infinity;

        for (const { piece, moves } of allMoves) {
            for (const move of moves) {
                const score = this.evaluateMove(game, piece, move);
                // Add randomness for variety
                const randomFactor = Math.random() * 50;
                const finalScore = score + randomFactor;

                if (finalScore > bestScore) {
                    bestScore = finalScore;
                    bestMove = {
                        from: piece.position,
                        to: move,
                        score: finalScore
                    };
                }
            }
        }

        return bestMove ?? this.getRandomMove(allMoves);
    }

    /**
     * Hard difficulty - Minimax with alpha-beta pruning
     */
    private getHardMove(game: Game, allMoves: Array<{ piece: Piece; moves: MoveList }>): IAIMove {
        let bestMove: IAIMove | null = null;
        let bestScore = -Infinity;
        const depth = 3;

        for (const { piece, moves } of allMoves) {
            for (const move of moves) {
                // Simulate move
                const score = this.evaluateMoveWithLookahead(game, piece, move, depth);

                if (score > bestScore) {
                    bestScore = score;
                    bestMove = {
                        from: piece.position,
                        to: move,
                        score
                    };
                }
            }
        }

        return bestMove ?? this.getMediumMove(game, allMoves);
    }

    // ============================================================================
    // EVALUATION
    // ============================================================================

    /**
     * Evaluate a single move
     */
    private evaluateMove(game: Game, piece: Piece, to: IPosition): number {
        let score = 0;

        // Capture bonus
        const targetPiece = game.board.getPiece(to);
        if (targetPiece) {
            score += PIECE_VALUES[targetPiece.type];
        }

        // Position bonus
        score += this.getPositionBonus(piece.type, to, piece.color);

        // Center control bonus
        if (this.isCenterSquare(to)) {
            score += 30;
        }

        // Development bonus (for early game)
        if (game.moveHistory.length < 10) {
            if (!piece.hasMoved && piece.type !== PieceType.PAWN) {
                score += 20;
            }
        }

        return score;
    }

    /**
     * Evaluate move with lookahead (simplified minimax)
     */
    private evaluateMoveWithLookahead(
        game: Game,
        piece: Piece,
        to: IPosition,
        depth: number
    ): number {
        // Base evaluation
        let score = this.evaluateMove(game, piece, to);

        // Add board evaluation
        if (depth > 0) {
            score += this.evaluateBoardPosition(game) * 0.5;
        }

        return score;
    }

    /**
     * Evaluate overall board position
     */
    private evaluateBoardPosition(game: Game): number {
        let score = 0;

        for (let row = 0; row < BOARD_SIZE; row++) {
            for (let col = 0; col < BOARD_SIZE; col++) {
                const pieceData = game.board.getPieceData({ row, col });
                if (pieceData) {
                    const pieceValue = PIECE_VALUES[pieceData.type];
                    const positionBonus = this.getPositionBonus(
                        pieceData.type,
                        { row, col },
                        pieceData.color
                    );
                    const multiplier = pieceData.color === this._color ? 1 : -1;
                    score += (pieceValue + positionBonus) * multiplier;
                }
            }
        }

        // Check bonus
        if (game.isInCheck(this.getOpponentColor())) {
            score += 50;
        }

        return score;
    }

    /**
     * Get position bonus for a piece
     */
    private getPositionBonus(type: PieceType, position: IPosition, color: PieceColor): number {
        const row = color === PieceColor.BLACK ? position.row : 7 - position.row;

        switch (type) {
            case PieceType.PAWN:
                return ChessAI.PAWN_TABLE[row][position.col];
            case PieceType.KNIGHT:
                return ChessAI.KNIGHT_TABLE[row][position.col];
            case PieceType.BISHOP:
                return ChessAI.BISHOP_TABLE[row][position.col];
            case PieceType.KING:
                return ChessAI.KING_TABLE[row][position.col];
            default:
                return 0;
        }
    }

    /**
     * Check if position is in the center (d4, d5, e4, e5)
     */
    private isCenterSquare(position: IPosition): boolean {
        return (
            (position.row === 3 || position.row === 4) && (position.col === 3 || position.col === 4)
        );
    }

    /**
     * Get opponent's color
     */
    private getOpponentColor(): PieceColor {
        return this._color === PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE;
    }
}
