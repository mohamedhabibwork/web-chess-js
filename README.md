# Chess Game

A full-featured chess game built with vanilla JavaScript, Tailwind CSS v4, and Vite. Features clean OOP architecture, move history navigation, and a modern minimalist UI.

## Features

- **Complete Chess Rules**
  - All standard piece movements (Pawn, Rook, Knight, Bishop, Queen, King)
  - Check and checkmate detection
  - Castling (kingside and queenside)
  - En passant capture
  - Pawn promotion (auto-promotes to Queen)

- **Interactive Gameplay**
  - Click on any piece to see valid moves highlighted
  - Visual indicators for valid moves (green) and captures (red)
  - Selected piece highlighting
  - Turn-based gameplay with current player indicator

- **Move History**
  - Complete move history with navigation
  - Back/Forward buttons to navigate through moves
  - Click any move in history to jump directly to that position
  - Color-coded move indicators (white/black badges)
  - "Go to Current" button to return to latest move

- **Modern UI**
  - Tailwind CSS v4 with theme-based color system
  - Responsive design
  - Clean, minimalist interface
  - Theme colors easily customizable via CSS variables

- **Clean Architecture**
  - Object-Oriented Programming (OOP) design
  - Separate file for each chess piece
  - Factory pattern for piece and board creation
  - Modular code structure

## Technologies

- **Vite** - Build tool and dev server
- **Tailwind CSS v4** - Utility-first CSS framework with CSS-first configuration
- **Vanilla JavaScript (ES6+)** - No frameworks, pure JavaScript
- **ES6 Modules** - Modern module system
- **ESLint** - Code linting and quality
- **Prettier** - Code formatting
- **GitHub Actions** - CI/CD pipeline

## Project Structure

```
chess/
├── index.html              # Main HTML file
├── package.json            # Dependencies and scripts
├── vite.config.js          # Vite configuration
├── postcss.config.js       # PostCSS configuration
├── src/
│   ├── css/
│   │   └── index.css      # Tailwind CSS and custom styles
│   └── js/
│       ├── main.js        # Entry point and game initialization
│       ├── core/
│       │   ├── Piece.js           # Base piece class
│       │   ├── ChessBoard.js       # Board management and rendering
│       │   ├── GameController.js   # Game logic and flow
│       │   └── HistoryManager.js   # Move history management
│       ├── pieces/
│       │   ├── Pawn.js
│       │   ├── Rook.js
│       │   ├── Knight.js
│       │   ├── Bishop.js
│       │   ├── Queen.js
│       │   └── King.js
│       └── utils/
│           └── constants.js # Chess constants and symbols
└── .gitignore
```

## Installation

1. Clone the repository:
```bash
git clone git@github.com:mohamedhabibwork/web-chess-js.git  chess
cd chess
```

2. Install dependencies:
```bash
npm install
```

## Usage

### Development

Start the development server:
```bash
npm run dev
```

The game will open in your browser at `http://localhost:3000`

### Build for Production

Build the project:
```bash
npm run build
```

The built files will be in the `dist/` directory.

### Preview Production Build

Preview the production build:
```bash
npm run preview
```

## How to Play

1. **Select a Piece**: Click on any piece of your color (indicated by "Current Player")
2. **View Valid Moves**: Valid move squares will be highlighted in green with a dot indicator
3. **View Capture Moves**: Squares with opponent pieces will be highlighted in red with a border
4. **Make a Move**: Click on a highlighted square to move your piece
5. **Navigate History**: Use the Back/Forward buttons or click any move in the history panel to navigate through the game

## Code Quality

This project follows strict clean code rules enforced by ESLint and Prettier. See [CLEAN_CODE.md](./CLEAN_CODE.md) for detailed guidelines.

### Quick Checks

Before committing, run:
```bash
npm run check
```

This will:
- Lint all JavaScript files
- Check code formatting
- Ensure code quality standards

### Auto-fix Issues

```bash
npm run lint:fix    # Fix linting issues
npm run format      # Format code
```

## CI/CD

GitHub Actions automatically runs on every push and pull request:
- ✅ Linting checks (ESLint)
- ✅ Formatting checks (Prettier)
- ✅ Build verification

See `.github/workflows/ci.yml` for the CI configuration.

## Customization

### Theme Colors

You can easily customize the game's color scheme by modifying CSS variables in `src/css/index.css`:

```css
@theme {
  --color-board-light: #fef3c7;      /* Light squares */
  --color-board-dark: #92400e;       /* Dark squares */
  --color-selected: rgba(59, 130, 246, 0.6);      /* Selected piece */
  --color-valid-move: rgba(34, 197, 94, 0.7);     /* Valid moves */
  --color-valid-capture: rgba(220, 38, 38, 0.8);  /* Capture moves */
}
```

## Architecture

### Piece Classes

Each chess piece has its own class file extending the base `Piece` class:
- Implements piece-specific movement rules
- Provides factory methods for creation
- Defines starting positions

### Board Management

The `ChessBoard` class handles:
- Board state management
- Piece placement and movement
- Board rendering with Tailwind CSS
- Move highlighting

### Game Controller

The `GameController` class manages:
- Game flow and turn management
- Move validation (prevents illegal moves)
- Check/checkmate detection
- Special move handling (castling, en passant, promotion)
- History integration

### History Manager

The `HistoryManager` class provides:
- Move history storage with board state snapshots
- Navigation through game history
- Move notation generation

## Scripts

### Development
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Code Quality
- `npm run lint` - Run ESLint to check code quality
- `npm run lint:fix` - Auto-fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run check` - Run all code quality checks

## Browser Support

Modern browsers that support:
- ES6+ JavaScript
- CSS Custom Properties
- ES6 Modules

## License

This project is open source and available for personal and educational use.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

