import { Pawn } from '../pieces/Pawn.js';
import { Rook } from '../pieces/Rook.js';
import { Knight } from '../pieces/Knight.js';
import { Bishop } from '../pieces/Bishop.js';
import { Queen } from '../pieces/Queen.js';
import { King } from '../pieces/King.js';
import { COLORS, PIECE_SYMBOLS, BOARD_SIZE } from '../utils/constants.js';

export class ChessBoard {
    constructor() {
        this.board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
        this.selectedSquare = null;
        this.validMoves = [];
        this.boardElement = null;
    }

    /**
     * Factory method to create a board with standard starting position
     * @returns {ChessBoard} New board instance
     */
    static createStandard() {
        const board = new ChessBoard();
        board.initializeBoard();
        return board;
    }

    /**
     * Factory method to create an empty board
     * @returns {ChessBoard} New empty board instance
     */
    static createEmpty() {
        const board = new ChessBoard();
        board.clear();
        return board;
    }

    /**
     * Clear the board
     */
    clear() {
        this.board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
    }

    /**
     * Initialize the board with standard starting position using factory methods
     */
    initializeBoard() {
        this.clear();

        // Place pawns using factory method
        const whitePawnPositions = Pawn.getStartingPositions(COLORS.WHITE);
        const blackPawnPositions = Pawn.getStartingPositions(COLORS.BLACK);
        
        whitePawnPositions.forEach(pos => {
            this.setPieceAt(pos.row, pos.col, Pawn.create(COLORS.WHITE, pos.row, pos.col));
        });
        
        blackPawnPositions.forEach(pos => {
            this.setPieceAt(pos.row, pos.col, Pawn.create(COLORS.BLACK, pos.row, pos.col));
        });

        // Place rooks using factory method
        [...Rook.getStartingPositions(COLORS.WHITE), ...Rook.getStartingPositions(COLORS.BLACK)]
            .forEach(pos => {
                this.setPieceAt(pos.row, pos.col, Rook.create(
                    pos.row === 7 ? COLORS.WHITE : COLORS.BLACK,
                    pos.row,
                    pos.col
                ));
            });

        // Place knights using factory method
        [...Knight.getStartingPositions(COLORS.WHITE), ...Knight.getStartingPositions(COLORS.BLACK)]
            .forEach(pos => {
                this.setPieceAt(pos.row, pos.col, Knight.create(
                    pos.row === 7 ? COLORS.WHITE : COLORS.BLACK,
                    pos.row,
                    pos.col
                ));
            });

        // Place bishops using factory method
        [...Bishop.getStartingPositions(COLORS.WHITE), ...Bishop.getStartingPositions(COLORS.BLACK)]
            .forEach(pos => {
                this.setPieceAt(pos.row, pos.col, Bishop.create(
                    pos.row === 7 ? COLORS.WHITE : COLORS.BLACK,
                    pos.row,
                    pos.col
                ));
            });

        // Place queens using factory method
        [...Queen.getStartingPositions(COLORS.WHITE), ...Queen.getStartingPositions(COLORS.BLACK)]
            .forEach(pos => {
                this.setPieceAt(pos.row, pos.col, Queen.create(
                    pos.row === 7 ? COLORS.WHITE : COLORS.BLACK,
                    pos.row,
                    pos.col
                ));
            });

        // Place kings using factory method
        [...King.getStartingPositions(COLORS.WHITE), ...King.getStartingPositions(COLORS.BLACK)]
            .forEach(pos => {
                this.setPieceAt(pos.row, pos.col, King.create(
                    pos.row === 7 ? COLORS.WHITE : COLORS.BLACK,
                    pos.row,
                    pos.col
                ));
            });
    }

    /**
     * Get piece at position
     * @param {number} row 
     * @param {number} col 
     * @returns {Piece|null}
     */
    getPieceAt(row, col) {
        if (!this.isValidPosition(row, col)) return null;
        return this.board[row][col];
    }

    /**
     * Set piece at position
     * @param {number} row 
     * @param {number} col 
     * @param {Piece|null} piece 
     */
    setPieceAt(row, col, piece) {
        if (this.isValidPosition(row, col)) {
            this.board[row][col] = piece;
            if (piece) {
                piece.setPosition(row, col);
            }
        }
    }

    /**
     * Move piece from one position to another
     * @param {Object} from {row, col}
     * @param {Object} to {row, col}
     * @returns {Piece|null} Captured piece if any
     */
    movePiece(from, to) {
        const piece = this.getPieceAt(from.row, from.col);
        if (!piece) return null;

        const capturedPiece = this.getPieceAt(to.row, to.col);
        this.setPieceAt(to.row, to.col, piece);
        this.setPieceAt(from.row, from.col, null);

        return capturedPiece;
    }

    /**
     * Check if position is valid
     * @param {number} row 
     * @param {number} col 
     * @returns {boolean}
     */
    isValidPosition(row, col) {
        return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
    }

    /**
     * Render the board
     * @param {HTMLElement} container 
     */
    render(container) {
        this.boardElement = container;
        container.innerHTML = '';

        for (let row = 0; row < BOARD_SIZE; row++) {
            for (let col = 0; col < BOARD_SIZE; col++) {
                const square = document.createElement('div');
                const isLight = (row + col) % 2 === 0;
                const bgColor = isLight 
                    ? 'bg-[var(--color-board-light)]' 
                    : 'bg-[var(--color-board-dark)]';
                
                square.className = `square ${bgColor}`;
                square.dataset.row = row;
                square.dataset.col = col;

                const piece = this.board[row][col];
                if (piece) {
                    const symbol = PIECE_SYMBOLS[piece.color][piece.type];
                    const pieceElement = document.createElement('div');
                    pieceElement.className = 'piece';
                    pieceElement.textContent = symbol;
                    square.appendChild(pieceElement);
                }

                container.appendChild(square);
            }
        }
    }

    /**
     * Highlight valid moves
     * @param {Array<Object>} moves Array of {row, col} objects
     */
    highlightMoves(moves) {
        this.validMoves = moves;
        const squares = this.boardElement.querySelectorAll('.square');
        
        squares.forEach(square => {
            const row = parseInt(square.dataset.row);
            const col = parseInt(square.dataset.col);
            
            const isMove = moves.some(m => m.row === row && m.col === col);
            const hasPiece = this.getPieceAt(row, col) !== null;
            
            if (isMove) {
                square.classList.add(hasPiece ? 'valid-capture' : 'valid-move');
            }
        });
    }

    /**
     * Highlight selected square
     * @param {number} row 
     * @param {number} col 
     */
    highlightSelected(row, col) {
        this.clearHighlights();
        this.selectedSquare = { row, col };
        
        const squares = this.boardElement.querySelectorAll('.square');
        squares.forEach(square => {
            const squareRow = parseInt(square.dataset.row);
            const squareCol = parseInt(square.dataset.col);
            
            if (squareRow === row && squareCol === col) {
                square.classList.add('selected');
            }
        });
    }

    /**
     * Clear all highlights
     */
    clearHighlights() {
        this.selectedSquare = null;
        this.validMoves = [];
        
        const squares = this.boardElement.querySelectorAll('.square');
        squares.forEach(square => {
            square.classList.remove('selected', 'valid-move', 'valid-capture');
        });
    }

    /**
     * Get a copy of the board state (for move validation)
     * @returns {Array<Array<Piece|null>>}
     */
    getBoardCopy() {
        return this.board.map(row => [...row]);
    }

    /**
     * Create a deep copy of the board state for history
     * @returns {Array<Array<Piece|null>>}
     */
    serialize() {
        return this.board.map(row => 
            row.map(piece => piece ? {
                type: piece.type,
                color: piece.color,
                row: piece.row,
                col: piece.col,
                hasMoved: piece.hasMoved
            } : null)
        );
    }

    /**
     * Restore board state from serialized data
     * @param {Array<Array<Object|null>>} serializedBoard 
     */
    deserialize(serializedBoard) {
        this.clear();
        
        const pieceClasses = {
            pawn: Pawn,
            rook: Rook,
            knight: Knight,
            bishop: Bishop,
            queen: Queen,
            king: King
        };
        
        for (let row = 0; row < BOARD_SIZE; row++) {
            for (let col = 0; col < BOARD_SIZE; col++) {
                const pieceData = serializedBoard[row][col];
                if (pieceData) {
                    const PieceClass = pieceClasses[pieceData.type];
                    if (PieceClass) {
                        const piece = PieceClass.create(pieceData.color, pieceData.row, pieceData.col);
                        piece.hasMoved = pieceData.hasMoved;
                        this.setPieceAt(row, col, piece);
                    }
                }
            }
        }
    }
}

