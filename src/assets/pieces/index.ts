/**
 * Chess Piece SVG Images
 */

import { PieceType, PieceColor } from '../../types/index.js';

// Import all piece SVGs
import whiteKing from './white-king.svg';
import whiteQueen from './white-queen.svg';
import whiteRook from './white-rook.svg';
import whiteBishop from './white-bishop.svg';
import whiteKnight from './white-knight.svg';
import whitePawn from './white-pawn.svg';

import blackKing from './black-king.svg';
import blackQueen from './black-queen.svg';
import blackRook from './black-rook.svg';
import blackBishop from './black-bishop.svg';
import blackKnight from './black-knight.svg';
import blackPawn from './black-pawn.svg';

export const PIECE_IMAGES: Record<PieceColor, Record<PieceType, string>> = {
    [PieceColor.WHITE]: {
        [PieceType.KING]: whiteKing,
        [PieceType.QUEEN]: whiteQueen,
        [PieceType.ROOK]: whiteRook,
        [PieceType.BISHOP]: whiteBishop,
        [PieceType.KNIGHT]: whiteKnight,
        [PieceType.PAWN]: whitePawn
    },
    [PieceColor.BLACK]: {
        [PieceType.KING]: blackKing,
        [PieceType.QUEEN]: blackQueen,
        [PieceType.ROOK]: blackRook,
        [PieceType.BISHOP]: blackBishop,
        [PieceType.KNIGHT]: blackKnight,
        [PieceType.PAWN]: blackPawn
    }
};

export {
    whiteKing,
    whiteQueen,
    whiteRook,
    whiteBishop,
    whiteKnight,
    whitePawn,
    blackKing,
    blackQueen,
    blackRook,
    blackBishop,
    blackKnight,
    blackPawn
};
