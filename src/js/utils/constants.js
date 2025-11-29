// Chess game constants
export const COLORS = {
    WHITE: 'white',
    BLACK: 'black'
};

export const PIECE_TYPES = {
    PAWN: 'pawn',
    ROOK: 'rook',
    KNIGHT: 'knight',
    BISHOP: 'bishop',
    QUEEN: 'queen',
    KING: 'king'
};

export const PIECE_SYMBOLS = {
    white: {
        pawn: '♙',
        rook: '♖',
        knight: '♘',
        bishop: '♗',
        queen: '♕',
        king: '♔'
    },
    black: {
        pawn: '♟',
        rook: '♜',
        knight: '♞',
        bishop: '♝',
        queen: '♛',
        king: '♚'
    }
};

export const BOARD_SIZE = 8;

export const GAME_STATUS = {
    IN_PROGRESS: 'In Progress',
    CHECK: 'Check',
    CHECKMATE: 'Checkmate',
    STALEMATE: 'Stalemate'
};
