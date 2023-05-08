import inquirer from "inquirer";
import { valueOfUniformArray } from "./utils.js";

type Piece = "x" | "o" | "-";
type Row = [Piece, Piece, Piece, Piece, Piece, Piece, Piece];
type RowIndex = 0 | 1 | 2 | 3 | 4 | 5;
type ColumnIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;
type Board = [Row, Row, Row, Row, Row, Row];

const ROW_BOTTOM: RowIndex = 5;
const ROW_CENTER: RowIndex = 3;
const ROW_TOP: RowIndex = 0;
const COLUMN_CENTER: ColumnIndex = 3;

const PLAYER_PIECE: Piece = "x";
const IA_PIECE: Piece = "o";
const EMPTY_PIECE: Piece = "-";

const MAX_MOVES = 6 * 7;

const IA_START = process.argv[2] === "ia";

const board: Board = [
  ["-", "-", "-", "-", "-", "-", "-"],
  ["-", "-", "-", "-", "-", "-", "-"],
  ["-", "-", "-", "-", "-", "-", "-"],
  ["-", "-", "-", "-", "-", "-", "-"],
  ["-", "-", "-", "-", "-", "-", "-"],
  ["-", "-", "-", "-", "-", "-", "-"],
];

/// BOARD FUNCTIONS

/**
 *
 * @param board The board where to make the movement
 * @param column The column where we will drop the piece
 * @param piece The piece we will drop
 * @returns nothing
 */
const dropPiece = (board: Board, column: ColumnIndex, piece: Piece) => {
  for (let row = ROW_BOTTOM; row >= ROW_TOP; row--) {
    if (board[row][column] !== EMPTY_PIECE) continue;
    board[row][column] = piece;
    return;
  }
};

/**
 *
 * @param board The board from which to get the valid columns
 * @returns an array of valid columns to drop pieces
 */
const validColumnsToDropPieces: (board: Board) => ColumnIndex[] = (board: Board) => {
  const validColums: ColumnIndex[] = [];
  board[ROW_TOP].forEach((pieceOfTopRow, i) => {
    const column = i as ColumnIndex;
    if (pieceOfTopRow === EMPTY_PIECE) validColums.push(column);
  });
  return validColums;
};

/**
 *
 * @param board The board from wich we calculate if there are any remaining moves
 * @returns true is there are any remaiging moves, false otherwise
 */
const movesLeftUntilDraw = (board: Board) => {
  let currentMoves = 0;

  board.forEach((row) =>
    row.forEach((piece) => {
      if (piece !== EMPTY_PIECE) currentMoves++;
    })
  );
  return currentMoves < MAX_MOVES;
};

/**
 *
 * @param board The board from wich retun the winner or not
 * @returns The piece of winner, a empty piece if draw or false if the game continues
 */
const winningPlayer: (board: Board) => Piece | false = (board: Board) => {
  let pieceWinner: Piece | false = movesLeftUntilDraw(board) ? false : EMPTY_PIECE;

  // draw
  if (pieceWinner) return pieceWinner;

  // winner or not
  for (let row = ROW_BOTTOM; row >= ROW_CENTER; row--) {
    board[row].forEach((_, column) => {
      const valueWinner = fourInARow(row, column as ColumnIndex, board);
      if (valueWinner !== EMPTY_PIECE) {
        pieceWinner = valueWinner;
      }
    });
  }
  return pieceWinner;
};

/**
 *
 * @param row Row index for a piece
 * @param column Column index for a piece
 * @param board Board where to get the piece
 * @returns The value of the piece that forms 4 in a row
 */
const fourInARow: (row: RowIndex, column: ColumnIndex, board: Board) => Piece = (row: RowIndex, column: ColumnIndex, board: Board) => {
  const verticalPieces: Piece[] = [0, 1, 2, 3].map((n) => board[row - n][column]);
  let horizontalPiecesLeft: Piece[];
  let horizontalPiecesRight: Piece[];
  let diagonalPiecesLeft: Piece[];
  let diagonalPiecesRight: Piece[];

  if (column <= COLUMN_CENTER) {
    horizontalPiecesRight = [0, 1, 2, 3].map((n) => board[row][column + n]);
    diagonalPiecesRight = [0, 1, 2, 3].map((n) => board[row - n][column + n]);
  }
  if (column >= COLUMN_CENTER) {
    horizontalPiecesLeft = [0, 1, 2, 3].map((n) => board[row][column - n]);
    diagonalPiecesLeft = [0, 1, 2, 3].map((n) => board[row - n][column - n]);
  }

  let valueOfFourInARow = EMPTY_PIECE;

  [verticalPieces, horizontalPiecesLeft, horizontalPiecesRight, diagonalPiecesLeft, diagonalPiecesRight].forEach((arrOfPieces) => {
    const valueOfArrOfPieces = valueOfUniformArray(arrOfPieces);
    valueOfFourInARow = valueOfArrOfPieces ? valueOfArrOfPieces : valueOfFourInARow;
  });

  return valueOfFourInARow;
};

/// MIN MAX FUNCTIONS

/**
 *
 * @param board Node of tree of possible boards
 * @param depth depth of the node
 * @param maximizingPlayer the max(true) or the min(false) player
 * @param alpha alpha value for alpha-beta pruning
 * @param beta beta values for alpha-beta pruning
 * @returns a object containing the best possible column to drop and the score of that column
 */
const minmax = (board: Board, depth: number, maximizingPlayer: boolean, alpha: number = -999999, beta: number = 999999) => {
  const validColumns = validColumnsToDropPieces(board);
  const winner = winningPlayer(board);

  // base case
  if (depth === 0 || winner) {
    if (!winner) return { column: null, score: scoreOfBoardForMinmax(board, IA_PIECE) };
    if (winner === IA_PIECE) return { column: null, score: 100000 };
    else if (winner === PLAYER_PIECE) return { column: null, score: -100000 };
    else return { column: null, score: 0 };
  }

  if (maximizingPlayer) {
    let currentScore = -999999999;
    let currentColumn = validColumns.at(0);

    validColumns.forEach((validColumn) => {
      if (alpha >= beta) return;

      const boardCopy = board.map((row) => [...row]) as Board;
      dropPiece(boardCopy, validColumn, IA_PIECE);

      const { score: newScore } = minmax(boardCopy, depth - 1, false, alpha, beta);

      if (newScore > currentScore) {
        currentScore = newScore;
        currentColumn = validColumn;
      }

      alpha = Math.max(alpha, currentScore);
    });

    return { column: currentColumn, score: currentScore };
  } else {
    let currentScore = 999999999;
    let currentColumn = validColumns.at(0);

    validColumns.forEach((validColumn) => {
      if (alpha >= beta) return;

      const boardCopy = board.map((row) => [...row]) as Board;
      dropPiece(boardCopy, validColumn, PLAYER_PIECE);

      const { score: newScore } = minmax(boardCopy, depth - 1, true, alpha, beta);

      if (newScore < currentScore) {
        currentScore = newScore;
        currentColumn = validColumn;
      }

      beta = Math.min(beta, currentScore);
    });

    return { column: currentColumn, score: currentScore };
  }
};

/**
 *
 * @param board The board for calculate the score
 * @param piece The piece for calculate the score
 * @returns the score for certain player for a board
 */
const scoreOfBoardForMinmax = (board: Board, piece: Piece) => {
  let score = 0;

  // center column score
  const centerColumn = board.map((row) => row[COLUMN_CENTER]);
  const piecesOfCenterColumn = centerColumn.filter((centerPiece) => centerPiece === piece).length;
  score += piecesOfCenterColumn * 3;

  // horizontal score
  board.forEach((row) => {
    // possible 4 pieces set on a row
    [0, 1, 2, 3].forEach((columnLimit) => {
      const fourPieces = row.slice(columnLimit, columnLimit + 4) as [Piece, Piece, Piece, Piece];
      score += scoreOfPiecesForMinmax(fourPieces, piece);
    });
  });

  // vertical score
  const columns = [0, 1, 2, 4, 5, 6];
  columns.forEach((columnIndex) => {
    // possible 4 pieces set on a column
    [0, 1, 2].forEach((rowIndex) => {
      const fourPieces = [0, 1, 2, 3].map((n) => board[rowIndex][columnIndex + n]) as [Piece, Piece, Piece, Piece];
      score += scoreOfPiecesForMinmax(fourPieces, piece);
    });
  });

  // diagonal to right
  const halfLeftColumns = [0, 1, 2, 3];
  halfLeftColumns.forEach((columnIndex) => {
    // possible 4 pieces set on a diagonal to rigth
    [0, 1, 2].forEach((rowIndex) => {
      const fourPieces = [0, 1, 2, 3].map((n) => board[rowIndex + n][columnIndex + n]) as [Piece, Piece, Piece, Piece];
      score += scoreOfPiecesForMinmax(fourPieces, piece);
    });
  });

  // diagonal to left
  const halfRightColumns = [6, 5, 4, 3];
  halfRightColumns.forEach((columnIndex) => {
    // possible 4 pieces set on a diagonal to left
    [0, 1, 2].forEach((rowIndex) => {
      const fourPieces = [0, 1, 2, 3].map((n) => board[rowIndex + n][columnIndex - n]) as [Piece, Piece, Piece, Piece];
      score += scoreOfPiecesForMinmax(fourPieces, piece);
    });
  });

  return score;
};

/**
 *
 * @param pieces an array of 4 pieces
 * @param piece the piece with which to calculate the score
 * @returns the score por the pieces array
 */
const scoreOfPiecesForMinmax = (pieces: [Piece, Piece, Piece, Piece], piece: Piece) => {
  let score = 0;
  const oppPiece = piece === IA_PIECE ? PLAYER_PIECE : IA_PIECE;

  let piecesCant = pieces.filter((arrPiece) => arrPiece === piece).length;
  let oppositePiecesCant = pieces.filter((arrPiece) => arrPiece === oppPiece).length;
  let emptyPiecesCant = pieces.filter((arrPiece) => arrPiece === "-").length;

  if (piecesCant === 4) score += 100;
  else if (piecesCant === 3 && emptyPiecesCant === 1) score += 5;
  else if (piecesCant === 2 && emptyPiecesCant === 2) score += 2;

  if (oppositePiecesCant === 3 && emptyPiecesCant === 1) score -= 4;

  return score;
};

// GAME

const userMove = async () => {
  const { "column(0-6)": columnStr } = await inquirer.prompt([{ type: "input", name: "column(0-6)" }]);
  const column = Number(columnStr) as ColumnIndex;
  if (column < 0 || column > 6) throw new Error("invalid column");

  const boardValidColumns = validColumnsToDropPieces(board);

  if (!boardValidColumns.includes(column)) throw new Error("full column");

  dropPiece(board, column, PLAYER_PIECE);
};

const iaMove = async () => {
  const { column: iaColumn } = minmax(board, 7, true);

  dropPiece(board, iaColumn, IA_PIECE);
};

const checkWinner = () => {
  let winnerPlayer = winningPlayer(board);

  if (winnerPlayer) {
    console.log("winner is: " + winnerPlayer);
    process.exit();
  }
};

const main = async () => {
  while (!winningPlayer(board)) {
    try {
      if (IA_START) iaMove();
      else await userMove();

      console.table(board);
      checkWinner();

      if (IA_START) await userMove();
      else iaMove();

      console.table(board);
      checkWinner();
    } catch (err) {
      console.log(err);
    }
  }
};

main();
