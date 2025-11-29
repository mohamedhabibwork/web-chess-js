import { COLORS, GAME_STATUS, PIECE_TYPES, PIECE_SYMBOLS } from '../utils/constants.js';
import { HistoryManager } from './HistoryManager.js';

export class GameController {
    constructor(board) {
        this.board = board;
        this.currentPlayer = COLORS.WHITE;
        this.gameStatus = GAME_STATUS.IN_PROGRESS;
        this.selectedPiece = null;
        this.capturedPieces = {
            [COLORS.WHITE]: [],
            [COLORS.BLACK]: []
        };
        this.moveHistory = [];
        this.enPassantTarget = null;
        this.historyManager = new HistoryManager();
        this.isNavigatingHistory = false;
    }

    /**
     * Handle piece/square click
     * @param {number} row 
     * @param {number} col 
     * @returns {boolean} Returns true if a move was executed, false otherwise
     */
    async handleSquareClick(row, col) {
        const piece = this.board.getPieceAt(row, col);

        // If a piece is already selected
        if (this.selectedPiece) {
            const selectedRow = this.selectedPiece.row;
            const selectedCol = this.selectedPiece.col;

            // Check if clicking on a valid move
            const validMoves = this.getValidMovesForPiece(this.selectedPiece);
            const isValidMove = validMoves.some(m => m.row === row && m.col === col);

            if (isValidMove) {
                // Execute the move
                await this.executeMove({ row: selectedRow, col: selectedCol }, { row, col });
                this.selectedPiece = null;
                this.board.clearHighlights();
                return true; // Move was executed
            } else {
                // Clicked on different piece or empty square
                if (piece && piece.color === this.currentPlayer) {
                    // Select new piece
                    this.selectPiece(piece);
                } else {
                    // Deselect
                    this.selectedPiece = null;
                    this.board.clearHighlights();
                }
                return false; // No move executed
            }
        } else {
            // No piece selected - select if it's current player's piece
            if (piece && piece.color === this.currentPlayer) {
                this.selectPiece(piece);
            }
            return false; // No move executed
        }
    }

    /**
     * Select a piece and highlight its valid moves
     * @param {Piece} piece 
     */
    selectPiece(piece) {
        this.selectedPiece = piece;
        this.board.highlightSelected(piece.row, piece.col);
        
        const validMoves = this.getValidMovesForPiece(piece);
        this.board.highlightMoves(validMoves);
    }

    /**
     * Get valid moves for a piece (filtered to prevent moving into check)
     * @param {Piece} piece 
     * @returns {Array<Object>}
     */
    getValidMovesForPiece(piece) {
        const gameState = this.getGameState();
        let moves = piece.getValidMoves(this.board.board, gameState);
        
        // Filter moves that would leave own king in check
        moves = moves.filter(move => {
            return !this.wouldMoveLeaveKingInCheck(piece, move);
        });

        return moves;
    }

    /**
     * Check if a move would leave the king in check
     * @param {Piece} piece 
     * @param {Object} move {row, col}
     * @returns {boolean}
     */
    wouldMoveLeaveKingInCheck(piece, move) {
        if (!piece) return true;

        // Store original position before modifying
        const originalRow = piece.row;
        const originalCol = piece.col;
        const originalHasMoved = piece.hasMoved;
        
        // Get pieces at positions
        const originalPiece = this.board.getPieceAt(originalRow, originalCol);
        const targetPiece = this.board.getPieceAt(move.row, move.col);
        
        // Validate we have the piece
        if (!originalPiece || originalPiece !== piece) {
            return true;
        }
        
        // Validate move position
        if (!this.board.isValidPosition(move.row, move.col)) {
            return true;
        }
        
        // Make the move temporarily - update board array directly
        this.board.board[move.row][move.col] = piece;
        this.board.board[originalRow][originalCol] = null;
        
        // Temporarily update piece position
        piece.row = move.row;
        piece.col = move.col;

        // Check if king is in check after the move
        const inCheck = this.isInCheck(piece.color);

        // Restore board state - restore board array directly
        this.board.board[originalRow][originalCol] = originalPiece;
        this.board.board[move.row][move.col] = targetPiece;
        
        // Restore piece position
        piece.row = originalRow;
        piece.col = originalCol;
        piece.hasMoved = originalHasMoved;

        return inCheck;
    }

    /**
     * Execute a move
     * @param {Object} from {row, col}
     * @param {Object} to {row, col}
     */
    async executeMove(from, to) {
        const piece = this.board.getPieceAt(from.row, from.col);
        if (!piece) return;

        const capturedPiece = this.board.movePiece(from, to);
        
        // Handle captured piece
        if (capturedPiece) {
            this.capturedPieces[capturedPiece.color].push(capturedPiece);
        }

        // Handle special moves
        this.handleSpecialMoves(piece, from, to);

        // Update en passant target
        this.updateEnPassantTarget(piece, from, to);

        // Record move
        const moveData = {
            from,
            to,
            piece: piece.type,
            color: piece.color,
            captured: capturedPiece ? capturedPiece.type : null
        };
        
        this.moveHistory.push(moveData);

        // Check for pawn promotion
        await this.handlePawnPromotion(piece, to);

        // Switch turn
        this.switchTurn();

        // Check game status
        this.updateGameStatus();

        // Save to history manager with board state snapshot
        if (!this.isNavigatingHistory) {
            const boardState = this.board.serialize();
            this.historyManager.addMove(moveData, boardState);
        }
    }

    /**
     * Handle special moves (castling, en passant)
     * @param {Piece} piece 
     * @param {Object} from 
     * @param {Object} to 
     */
    handleSpecialMoves(piece, from, to) {
        // Castling
        if (piece.type === PIECE_TYPES.KING && Math.abs(to.col - from.col) === 2) {
            if (to.col === 6) {
                // Kingside castling
                const rook = this.board.getPieceAt(to.row, 7);
                this.board.movePiece({ row: to.row, col: 7 }, { row: to.row, col: 5 });
            } else if (to.col === 2) {
                // Queenside castling
                const rook = this.board.getPieceAt(to.row, 0);
                this.board.movePiece({ row: to.row, col: 0 }, { row: to.row, col: 3 });
            }
        }

        // En passant capture
        if (piece.type === PIECE_TYPES.PAWN && this.enPassantTarget) {
            if (to.row === this.enPassantTarget.row && to.col === this.enPassantTarget.col) {
                const capturedPawnRow = piece.color === COLORS.WHITE ? to.row + 1 : to.row - 1;
                const capturedPawn = this.board.getPieceAt(capturedPawnRow, to.col);
                if (capturedPawn) {
                    this.capturedPieces[capturedPawn.color].push(capturedPawn);
                    this.board.setPieceAt(capturedPawnRow, to.col, null);
                }
            }
        }
    }

    /**
     * Update en passant target after pawn double move
     * @param {Piece} piece 
     * @param {Object} from 
     * @param {Object} to 
     */
    updateEnPassantTarget(piece, from, to) {
        if (piece.type === PIECE_TYPES.PAWN && Math.abs(to.row - from.row) === 2) {
            const direction = piece.color === COLORS.WHITE ? -1 : 1;
            this.enPassantTarget = {
                row: from.row + direction,
                col: from.col
            };
        } else {
            this.enPassantTarget = null;
        }
    }

    /**
     * Handle pawn promotion
     * @param {Piece} piece 
     * @param {Object} position 
     */
    async handlePawnPromotion(piece, position) {
        if (piece.type === PIECE_TYPES.PAWN) {
            const promotionRow = piece.color === COLORS.WHITE ? 0 : 7;
            if (position.row === promotionRow) {
                // Auto-promote to queen
                const { Queen } = await import('../pieces/Queen.js');
                const promotedQueen = new Queen(piece.color, position.row, position.col);
                promotedQueen.hasMoved = true;
                this.board.setPieceAt(position.row, position.col, promotedQueen);
            }
        }
    }

    /**
     * Switch turn to next player
     */
    switchTurn() {
        this.currentPlayer = this.currentPlayer === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;
    }

    /**
     * Check if a color's king is in check
     * @param {string} color 
     * @returns {boolean}
     */
    isInCheck(color) {
        const king = this.findKing(color);
        if (!king) return false;

        return this.isSquareAttacked(king.row, king.col, color);
    }

    /**
     * Check if a square is attacked by opponent
     * @param {number} row 
     * @param {number} col 
     * @param {string} defendingColor 
     * @returns {boolean}
     */
    isSquareAttacked(row, col, defendingColor) {
        const opponentColor = defendingColor === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;
        
        // Create a simplified game state for move calculation (without check validation to avoid recursion)
        const simplifiedGameState = {
            currentPlayer: this.currentPlayer,
            enPassantTarget: this.enPassantTarget,
            isInCheck: () => false, // Simplified - no recursive check
            isSquareAttacked: () => false // Simplified - no recursive check
        };

        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = this.board.getPieceAt(r, c);
                if (piece && piece.color === opponentColor) {
                    // Get raw moves without filtering for check (to avoid recursion)
                    const moves = piece.getValidMoves(this.board.board, simplifiedGameState);
                    if (moves.some(m => m.row === row && m.col === col)) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    /**
     * Find the king of a given color
     * @param {string} color 
     * @returns {Piece|null}
     */
    findKing(color) {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board.getPieceAt(row, col);
                if (piece && piece.type === PIECE_TYPES.KING && piece.color === color) {
                    return piece;
                }
            }
        }
        return null;
    }

    /**
     * Check if a color is in checkmate
     * @param {string} color 
     * @returns {boolean}
     */
    isCheckmate(color) {
        if (!this.isInCheck(color)) return false;

        // Check if any piece can make a legal move
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board.getPieceAt(row, col);
                if (piece && piece.color === color) {
                    const validMoves = this.getValidMovesForPiece(piece);
                    if (validMoves.length > 0) {
                        return false;
                    }
                }
            }
        }

        return true;
    }

    /**
     * Check if a color is in stalemate
     * @param {string} color 
     * @returns {boolean}
     */
    isStalemate(color) {
        if (this.isInCheck(color)) return false;

        // Check if any piece can make a legal move
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board.getPieceAt(row, col);
                if (piece && piece.color === color) {
                    const validMoves = this.getValidMovesForPiece(piece);
                    if (validMoves.length > 0) {
                        return false;
                    }
                }
            }
        }

        return true;
    }

    /**
     * Update game status
     */
    updateGameStatus() {
        if (this.isCheckmate(this.currentPlayer)) {
            this.gameStatus = GAME_STATUS.CHECKMATE;
        } else if (this.isStalemate(this.currentPlayer)) {
            this.gameStatus = GAME_STATUS.STALEMATE;
        } else if (this.isInCheck(this.currentPlayer)) {
            this.gameStatus = GAME_STATUS.CHECK;
        } else {
            this.gameStatus = GAME_STATUS.IN_PROGRESS;
        }
    }

    /**
     * Get game state object for piece move calculations
     * @returns {Object}
     */
    getGameState() {
        return {
            currentPlayer: this.currentPlayer,
            enPassantTarget: this.enPassantTarget,
            isInCheck: (color) => this.isInCheck(color),
            isSquareAttacked: (row, col, color) => this.isSquareAttacked(row, col, color)
        };
    }

    /**
     * Update UI elements
     */
    updateUI() {
        // Update current player
        const currentPlayerEl = document.getElementById('current-player');
        if (currentPlayerEl) {
            currentPlayerEl.textContent = this.currentPlayer.charAt(0).toUpperCase() + this.currentPlayer.slice(1);
            currentPlayerEl.className = `text-2xl font-bold ${this.currentPlayer === COLORS.WHITE ? 'text-gray-800' : 'text-gray-600'}`;
        }

        // Update game status
        const gameStatusEl = document.getElementById('game-status');
        if (gameStatusEl) {
            let statusText = this.gameStatus;
            let statusColor = 'text-gray-800';
            
            if (this.gameStatus === GAME_STATUS.CHECK) {
                statusText = `Check - ${this.currentPlayer}`;
                statusColor = 'text-yellow-600';
            } else if (this.gameStatus === GAME_STATUS.CHECKMATE) {
                const winner = this.currentPlayer === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;
                statusText = `Checkmate - ${winner} wins!`;
                statusColor = 'text-red-600 font-bold';
            } else if (this.gameStatus === GAME_STATUS.STALEMATE) {
                statusText = 'Stalemate - Draw!';
                statusColor = 'text-blue-600';
            }
            
            gameStatusEl.textContent = statusText;
            gameStatusEl.className = `text-lg font-medium ${statusColor}`;
        }

        // Update captured pieces
        this.updateCapturedPieces();
    }

    /**
     * Update captured pieces display
     */
    updateCapturedPieces() {
        const capturedWhiteEl = document.getElementById('captured-white');
        const capturedBlackEl = document.getElementById('captured-black');
        
        if (capturedWhiteEl) {
            capturedWhiteEl.innerHTML = '';
            this.capturedPieces[COLORS.WHITE].forEach(piece => {
                const symbol = this.getPieceSymbol(piece);
                const span = document.createElement('span');
                span.className = 'text-xl';
                span.textContent = symbol;
                capturedWhiteEl.appendChild(span);
            });
        }

        if (capturedBlackEl) {
            capturedBlackEl.innerHTML = '';
            this.capturedPieces[COLORS.BLACK].forEach(piece => {
                const symbol = this.getPieceSymbol(piece);
                const span = document.createElement('span');
                span.className = 'text-xl';
                span.textContent = symbol;
                capturedBlackEl.appendChild(span);
            });
        }
    }

    /**
     * Get piece symbol for display
     * @param {Piece} piece 
     * @returns {string}
     */
    getPieceSymbol(piece) {
        return PIECE_SYMBOLS[piece.color][piece.type];
    }

    /**
     * History Navigation Methods
     */

    /**
     * Go back one move in history
     */
    goBack() {
        if (!this.historyManager.canGoBack()) {
            return false;
        }

        this.isNavigatingHistory = true;
        const historyEntry = this.historyManager.goBack();
        
        if (historyEntry) {
            this.restoreBoardState(historyEntry.boardState);
            this.updateGameStateFromHistory();
        }

        this.isNavigatingHistory = false;
        return true;
    }

    /**
     * Go forward one move in history
     */
    goForward() {
        if (!this.historyManager.canGoForward()) {
            return false;
        }

        this.isNavigatingHistory = true;
        const historyEntry = this.historyManager.goForward();
        
        if (historyEntry) {
            this.restoreBoardState(historyEntry.boardState);
            this.updateGameStateFromHistory();
        }

        this.isNavigatingHistory = false;
        return true;
    }

    /**
     * Go to specific move in history
     * @param {number} index 
     */
    goToMove(index) {
        this.isNavigatingHistory = true;
        const historyEntry = this.historyManager.goToMove(index);
        
        if (historyEntry) {
            this.restoreBoardState(historyEntry.boardState);
            this.updateGameStateFromHistory();
        }

        this.isNavigatingHistory = false;
    }

    /**
     * Go to current (latest) move
     */
    resetToCurrent() {
        if (this.historyManager.isAtCurrent()) {
            return;
        }

        this.isNavigatingHistory = true;
        const historyEntry = this.historyManager.goToCurrent();
        
        if (historyEntry) {
            this.restoreBoardState(historyEntry.boardState);
            this.updateGameStateFromHistory();
        }

        this.isNavigatingHistory = false;
    }

    /**
     * Check if can go back
     * @returns {boolean}
     */
    canGoBack() {
        return this.historyManager.canGoBack();
    }

    /**
     * Check if can go forward
     * @returns {boolean}
     */
    canGoForward() {
        return this.historyManager.canGoForward();
    }

    /**
     * Check if at current move
     * @returns {boolean}
     */
    isAtCurrent() {
        return this.historyManager.isAtCurrent();
    }

    /**
     * Get history for UI display
     * @returns {Array<Object>}
     */
    getHistory() {
        return this.historyManager.getAllMoves();
    }

    /**
     * Restore board state from serialized data
     * @param {Array<Array<Object|null>>} boardState 
     */
    restoreBoardState(boardState) {
        this.board.deserialize(boardState);
    }

    /**
     * Update game state based on current history position
     */
    updateGameStateFromHistory() {
        // Recalculate current player based on history
        const currentEntry = this.historyManager.getCurrentMove();
        if (currentEntry) {
            // Next player after the move
            this.currentPlayer = currentEntry.move.color === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;
        } else {
            // At start position
            this.currentPlayer = COLORS.WHITE;
        }

        // Recalculate game status
        this.updateGameStatus();
    }
}

