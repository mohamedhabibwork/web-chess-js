# Clean Code Rules

This document outlines the clean code rules and standards enforced in this project.

## Code Quality Tools

- **ESLint** - JavaScript linting and code quality
- **Prettier** - Code formatting
- **EditorConfig** - Editor consistency

## Code Style Rules

### General Principles

1. **Consistency** - Follow the same patterns throughout the codebase
2. **Readability** - Code should be self-documenting
3. **Simplicity** - Prefer simple solutions over complex ones
4. **DRY** - Don't Repeat Yourself
5. **SOLID** - Follow SOLID principles for OOP design

### JavaScript/ES6 Rules

#### Formatting
- Use 4 spaces for indentation
- Use single quotes for strings
- Always use semicolons
- Maximum line length: 100 characters
- Use LF line endings (Unix style)

#### Naming Conventions
- Use `camelCase` for variables and functions
- Use `PascalCase` for classes and constructors
- Use descriptive names that explain intent
- Avoid abbreviations unless widely understood

#### Variables
- Always use `const` by default, `let` only when reassignment is needed
- Never use `var`
- Declare variables at the top of their scope
- Initialize variables when declaring them

#### Functions
- Keep functions small and focused (max 50 lines)
- Maximum 5 parameters per function
- Use arrow functions for callbacks
- Prefer function declarations for named functions
- Avoid deep nesting (max 4 levels)

#### Code Complexity
- Maximum cyclomatic complexity: 10
- Maximum nested callbacks: 3
- Maximum function depth: 4

#### Best Practices
- Use strict equality (`===` and `!==`)
- Avoid `eval()`, `with()`, and `Function()` constructor
- No console.log in production code (use console.warn/error if needed)
- No debugger statements
- Use object shorthand notation
- Prefer arrow functions for callbacks
- Use template literals for string concatenation

#### Error Handling
- Always handle errors appropriately
- Use try-catch for async operations
- Provide meaningful error messages

#### Comments
- Write self-documenting code (minimal comments needed)
- Use JSDoc for function documentation
- Explain "why", not "what"

### OOP Principles

#### Class Design
- Single Responsibility Principle - Each class should have one reason to change
- Open/Closed Principle - Open for extension, closed for modification
- Liskov Substitution Principle - Subtypes must be substitutable for their base types
- Interface Segregation - Many specific interfaces are better than one general
- Dependency Inversion - Depend on abstractions, not concretions

#### Class Structure
- Keep classes focused and cohesive
- Use factory methods for object creation
- Prefer composition over inheritance
- Use abstract base classes appropriately

### File Organization

#### File Structure
- One class per file (when possible)
- Group related functionality together
- Use clear, descriptive file names
- Follow the project's directory structure

#### Imports/Exports
- Use ES6 modules (`import`/`export`)
- Group imports: external, internal, relative
- Use named exports for utilities
- Use default exports for main class/component

### Documentation

#### JSDoc Comments
- Document all public methods and classes
- Include parameter types and return types
- Add examples for complex functions
- Document edge cases and exceptions

Example:
```javascript
/**
 * Get valid moves for a piece
 * @param {Piece} piece - The piece to get moves for
 * @returns {Array<Object>} Array of {row, col} move objects
 */
getValidMovesForPiece(piece) {
    // ...
}
```

## Running Linters

### Check Code Quality
```bash
npm run lint
```

### Auto-fix Issues
```bash
npm run lint:fix
```

### Format Code
```bash
npm run format
```

### Check Formatting
```bash
npm run format:check
```

### Run All Checks
```bash
npm run check
```

## Pre-commit Guidelines

Before committing code:
1. Run `npm run check` to ensure code quality
2. Fix all linting errors
3. Ensure code is properly formatted
4. Verify all tests pass (if applicable)
5. Update documentation if needed

## CI/CD Integration

GitHub Actions automatically:
- Runs ESLint on all JavaScript files
- Checks code formatting with Prettier
- Builds the project to ensure it compiles
- Runs on every push and pull request

## Common Issues and Solutions

### "Unexpected console statement"
- Use `console.warn()` or `console.error()` instead of `console.log()`
- Remove debug console statements before committing

### "Line too long"
- Break long lines into multiple lines
- Use template literals for long strings
- Extract complex expressions into variables

### "Function too complex"
- Break down complex functions into smaller ones
- Extract logic into helper functions
- Reduce nesting levels

### "Too many parameters"
- Use object parameters for functions with many arguments
- Group related parameters into objects
- Consider using a configuration object

## Resources

- [ESLint Rules](https://eslint.org/docs/rules/)
- [Prettier Options](https://prettier.io/docs/en/options.html)
- [Clean Code JavaScript](https://github.com/ryanmcdermott/clean-code-javascript)

