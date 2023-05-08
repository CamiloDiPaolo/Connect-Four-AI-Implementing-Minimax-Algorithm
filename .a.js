import inquirer from "inquirer";

const ROW_BOTTOM = 5;
const ROW_TOP = 0;
const ROW_CENTER = 3;
const COLUMN_CENTER = 3;
const PLAYER_PIECE = "x";
const IA_PIECE = "o";

const board = [
  ["-", "-", "-", "-", "-", "-", "-"],
  ["-", "-", "-", "-", "-", "-", "-"],
  ["-", "-", "-", "-", "-", "-", "-"],
  ["-", "-", "-", "-", "-", "-", "-"],
  ["-", "-", "-", "-", "-", "-", "-"],
  ["-", "-", "-", "-", "-", "-", "-"],
];

// x: PLAYER, o: IA
let currentPlayer = "x";
let moves = 0;

const move = (board, column, piece) => {
  for (let row = ROW_BOTTOM; row >= ROW_TOP; row--) {
    if (board[row][column] !== "-") continue;
    board[row][column] = piece;
    return true;
  }
  return false;
};

const validColumns = (board) => {
  const validColums = [];
  board[0].forEach((value, column) => {
    if (value === "-") validColums.push(column);
  });
  return validColums;
};

const movesLeft = (board) => {
  const MAX_MOVES = 6 * 7;
  let currentMoves = 0;
  board.forEach((row) =>
    row.forEach((cell) => {
      if (cell !== "-") currentMoves++;
    })
  );
  return currentMoves < MAX_MOVES;
};

const winner = (board) => {
  let pieceWinner = movesLeft(board) ? false : "-";

  // draw
  if (pieceWinner) return pieceWinner;

  for (let row = ROW_BOTTOM; row >= ROW_CENTER; row--) {
    board[row].forEach((_, column) => {
      const valueWinner = fourInARow(row, column, board);
      if (valueWinner) {
        pieceWinner = valueWinner;
      }
    });
  }
  return pieceWinner;
};

const fourInARow = (row, column, board) => {
  const verticalValues = [board[row][column], board[row - 1][column], board[row - 2][column], board[row - 3][column]];

  let valueUnique = checkUnique(verticalValues);
  if (valueUnique && valueUnique !== "-") return valueUnique;

  if (column <= COLUMN_CENTER) {
    const horizontalValuesRight = [board[row][column], board[row][column + 1], board[row][column + 2], board[row][column + 3]];
    const diagonalValuesRight = [board[row][column], board[row - 1][column + 1], board[row - 2][column + 2], board[row - 3][column + 3]];

    valueUnique = checkUnique(horizontalValuesRight);
    if (valueUnique && valueUnique !== "-") return valueUnique;
    valueUnique = checkUnique(diagonalValuesRight);
    if (valueUnique && valueUnique !== "-") return valueUnique;
  }
  if (column >= COLUMN_CENTER) {
    const horizontalValuesLeft = [board[row][column], board[row][column - 1], board[row][column - 2], board[row][column - 3]];
    const diagonalValuesLeft = [board[row][column], board[row - 1][column - 1], board[row - 2][column - 2], board[row - 3][column - 3]];

    valueUnique = checkUnique(horizontalValuesLeft);
    if (valueUnique && valueUnique !== "-") return valueUnique;
    valueUnique = checkUnique(diagonalValuesLeft);
    if (valueUnique && valueUnique !== "-") return valueUnique;
  }

  return false;
};

const checkUnique = (values) => {
  const set = new Set(values);
  if (set.size === 1 && values[0]) {
    return values[0];
  }
  return false;
};

const printBoard = () => {
  console.table(board);
};

// const readline = require("readline").createInterface({
//   input: process.stdin,
//   output: process.stdout,
// });
// const main = async () => {
//   while (moves < 6 * 7) {
//     const { "column(0-6)": columnStr } = await inquirer.prompt([{ type: "input", name: "column(0-6)" }]);

//     try {
//       const column = Number(columnStr);
//       if (column < 0 || column > 6) throw new Error("invalid column");

//       const validMove = await move(board, column);

//       if (!validMove) throw new Error("full column");

//       const winnerPlayer = winner();

//       if (winnerPlayer) {
//         console.log("winner is: " + currentPlayer);
//         printBoard();
//         return;
//       }

//       moves++;
//       currentPlayer = currentPlayer === "x" ? "o" : "x";
//       printBoard();
//     } catch (err) {
//       console.log(err);
//     }
//   }
// };

// main();

///////////////////////////////////////////////////////////////
// class Board {
//   constructor(
//     board = [
//       ["-", "-", "-", "-", "-", "-", "-"],
//       ["-", "-", "-", "-", "-", "-", "-"],
//       ["-", "-", "-", "-", "-", "-", "-"],
//       ["-", "-", "-", "-", "-", "-", "-"],
//       ["-", "-", "-", "-", "-", "-", "-"],
//       ["-", "-", "-", "-", "-", "-", "-"],
//     ]
//   ) {
//     this.board = board;
//     this.currentPlayer = PLAYER_PIECE;
//   }

//   dropPiece(column, piece) {
//     let validDrop = false;
//     for (let row = ROW_BOTTOM; row >= ROW_TOP; row--) {
//       if (this.board[row][column] !== "-") continue;
//       this.board[row][column] = piece;
//       validDrop = true;
//     }
//     if (!validDrop) throw new Error("full column");
//   }

//   validColums() {
//     const validColums = [];
//     this.board[0].forEach((value, column) => {
//       if (value === "-") validColums.push(column);
//     });
//     return validColums;
//   }

//   getBoard() {
//     return this.board;
//   }

//   getWinner(){

//   }
// }

const minmax = (board, depth, maximizingPlayer, alpha = -9999999, beta = 9999999) => {
  const validColums = validColumns(board);
  const pieceWinner = winner(board);

  // console.log("BOARD on " + i + " - " + maximizingPlayer);
  // console.table(board);
  // console.log(pieceWinner);
  if (depth === 0 || pieceWinner) {
    if (pieceWinner) {
      // console.log("WIINER", pieceWinner);
      if (pieceWinner === IA_PIECE) return { column: null, score: 100000 };
      else if (pieceWinner === PLAYER_PIECE) return { column: null, score: -100000 };
      else {
        return { column: null, score: 0 };
      }
    } else {
      // console.log("SCOREBOARD ON DEPTH 0: ", scoreBoard(board, IA_PIECE));
      return { column: null, score: scoreBoard(board, IA_PIECE) };
    }
  }

  if (maximizingPlayer) {
    let currentScore = -999999999;
    let currentColumn = validColums.at(0);

    validColums.forEach((validColumn) => {
      if (alpha >= beta) return;

      const boardCopy = board.map((row) => [...row]);
      // console.log("COPY");
      // console.table(boardCopy);
      move(boardCopy, validColumn, IA_PIECE);

      const newScore = minmax(boardCopy, depth - 1, false, alpha, beta).score;

      // console.log(depth, newScore, validColumn);

      if (newScore > currentScore) {
        currentScore = newScore;
        currentColumn = validColumn;
      }

      alpha = Math.max(alpha, currentScore);
    });
    // console.log(depth, currentScore);
    return { column: currentColumn, score: currentScore };
  } else {
    let currentScore = 999999999;
    let currentColumn = validColums.at(0);

    validColums.forEach((validColumn) => {
      if (alpha >= beta) return;

      const boardCopy = board.map((row) => [...row]);
      move(boardCopy, validColumn, PLAYER_PIECE);

      const newScore = minmax(boardCopy, depth - 1, true, alpha, beta).score;

      if (newScore < currentScore) {
        currentScore = newScore;
        currentColumn = validColumn;
      }

      beta = Math.min(beta, currentScore);
    });

    // console.log(depth, currentScore);
    return { column: currentColumn, score: currentScore };
  }
};

// score for piece on certain board
const scoreBoard = (board, piece) => {
  let score = 0;

  // score center column
  const centerArr = board.map((row) => row[COLUMN_CENTER]);
  const centerPiecesCount = centerArr.filter((centerPiece) => centerPiece === piece).length;
  score += centerPiecesCount * 3;

  // console.log("CENTER SCORE: ", score);

  // score horizontal
  board.forEach((row) => {
    // posible horizontal 4-row combinations
    [0, 1, 2, 3].forEach((columnLimit) => {
      score += scoreArr(row.slice(columnLimit, columnLimit + 4), piece);
    });
  });

  // console.log("HORIZONTAL SCORE: ", score);

  new Array(0, 1, 2, 3, 4, 5, 6).forEach((columnIndex) => {
    // posible vertical combinations
    [(0, 1, 2)].forEach((rowIndex) => {
      const columnArr = [board[rowIndex][columnIndex], board[rowIndex + 1][columnIndex], board[rowIndex + 2][columnIndex], board[rowIndex + 3][columnIndex]];
      score += scoreArr(columnArr, piece);
    });
  });

  // console.log("VERTICAL SCORE: ", score);
  // score diagonal rigth
  new Array(0, 1, 2, 3).forEach((columnnIndex) => {
    // posible diagonal rigth combinations
    [0, 1, 2].forEach((rowIndex) => {
      const columnArr = [board[rowIndex][columnnIndex], board[rowIndex + 1][columnnIndex + 1], board[rowIndex + 2][columnnIndex + 2], board[rowIndex + 3][columnnIndex + 3]];
      score += scoreArr(columnArr, piece);
    });
  });

  // console.log("Diagonal R SCORE: ", score);
  // score diagonal left
  new Array(6, 5, 4, 3).forEach((columnnIndex) => {
    // posible diagonal rigth combinations
    [0, 1, 2].forEach((rowIndex) => {
      const columnArr = [board[rowIndex][columnnIndex], board[rowIndex + 1][columnnIndex - 1], board[rowIndex + 2][columnnIndex - 2], board[rowIndex + 3][columnnIndex - 3]];
      score += scoreArr(columnArr, piece);
    });
  });

  // console.log("Diagonal L SCORE: ", score);

  return score;
};

// score of arr of 4 pieces
const scoreArr = (arr, piece) => {
  let score = 0;
  const oppPiece = piece === IA_PIECE ? PLAYER_PIECE : IA_PIECE;

  let pieceCant = arr.filter((arrPiece) => arrPiece === piece).length;
  let oppPieceCant = arr.filter((arrPiece) => arrPiece === oppPiece).length;
  let emptyCant = arr.filter((arrPiece) => arrPiece === "-").length;

  if (pieceCant === 4) score += 100;
  else if (pieceCant === 3 && emptyCant === 1) score += 5;
  else if (pieceCant === 2 && emptyCant === 2) score += 2;

  if (oppPieceCant === 3 && emptyCant === 1) score -= 4;

  return score;
};

// move(board, 0, PLAYER_PIECE);
// move(board, 0, PLAYER_PIECE);
// move(board, 0, PLAYER_PIECE);
// console.log(minmax(board, 2, true, 0));

// const boarda = [
//   ["-", "-", "-", "-", "-", "-", "-"],
//   ["-", "-", "-", "-", "-", "-", "-"],
//   ["o", "-", "-", "o", "-", "-", "-"],
//   ["-", "o", "-", "o", "-", "-", "-"],
//   ["o", "o", "o", "o", "-", "-", "-"],
//   ["-", "-", "-", "o", "-", "-", "-"],
// ];

// console.log(scoreBoard(boarda, IA_PIECE));

const IA_START = process.argv[2] === "ia";

const userMove = async () => {
  const { "column(0-6)": columnStr } = await inquirer.prompt([{ type: "input", name: "column(0-6)" }]);
  const column = Number(columnStr);
  if (column < 0 || column > 6) throw new Error("invalid column");

  const boardValidColumns = validColumns(board);

  if (!boardValidColumns.includes(column)) throw new Error("full column");

  move(board, column, PLAYER_PIECE);

  printBoard();
};

const iaMove = () => {
  const { column: iaColumn } = minmax(board, 7, true);

  console.log("IA MOVE: ", iaColumn);

  move(board, iaColumn, IA_PIECE);

  printBoard();
};

const main = async () => {
  while (moves < 6 * 7) {
    try {
      let winnerPlayer = winner(board);

      if (winnerPlayer) {
        console.log("winner is: " + winnerPlayer);
        printBoard();
        return;
      }

      if (IA_START) {
        iaMove();
      } else {
        await userMove();
      }

      moves++;

      winnerPlayer = winner(board);

      if (winnerPlayer) {
        console.log("winner is: " + winnerPlayer);
        printBoard();
        return;
      }

      if (IA_START) {
        await userMove();
      } else {
        iaMove();
      }

      moves++;
    } catch (err) {
      console.log(err);
    }
  }
};

main();
