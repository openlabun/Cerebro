// =====================================
// RNG con seed (Mulberry32)
// =====================================

function mulberry32(seed) {
    return function() {
        let t = seed += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

// Shuffle Fisher-Yates determinístico
function shuffle(array, random) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// =====================================
// Dancing Links Nodes
// =====================================

class Node {
    constructor() {
        this.left = this;
        this.right = this;
        this.up = this;
        this.down = this;
        this.column = null;
    }
}

class ColumnNode extends Node {
    constructor(name) {
        super();
        this.name = name;
        this.size = 0;
    }
}

// =====================================
// Dancing Links
// =====================================

class DancingLinks {
    constructor(matrix, columnNames, randomFunc = Math.random) {
        this.header = new ColumnNode("header");
        this.columns = [];
        this.solution = [];
        this.random = randomFunc;

        let prev = this.header;

        for (let name of columnNames) {
            let col = new ColumnNode(name);
            this.columns.push(col);
            prev.right = col;
            col.left = prev;
            prev = col;
        }

        prev.right = this.header;
        this.header.left = prev;

        for (let row of matrix) {
            let first = null;

            for (let colIndex of row) {
                let col = this.columns[colIndex];
                let node = new Node();
                node.column = col;

                // Vertical
                node.down = col;
                node.up = col.up;
                col.up.down = node;
                col.up = node;
                col.size++;

                // Horizontal
                if (!first) {
                    first = node;
                } else {
                    node.left = first.left;
                    node.right = first;
                    first.left.right = node;
                    first.left = node;
                }
            }
        }
    }

    cover(col) {
        col.right.left = col.left;
        col.left.right = col.right;

        for (let row = col.down; row !== col; row = row.down) {
            for (let node = row.right; node !== row; node = node.right) {
                node.down.up = node.up;
                node.up.down = node.down;
                node.column.size--;
            }
        }
    }

    uncover(col) {
        for (let row = col.up; row !== col; row = row.up) {
            for (let node = row.left; node !== row; node = node.left) {
                node.column.size++;
                node.down.up = node;
                node.up.down = node;
            }
        }

        col.right.left = col;
        col.left.right = col;
    }

    search(limit = 1) {
        if (this.header.right === this.header) {
            return 1;
        }

        // columna con menos nodos
        let col = this.header.right;
        let min = col.size;

        for (let temp = col.right; temp !== this.header; temp = temp.right) {
            if (temp.size < min) {
                col = temp;
                min = temp.size;
            }
        }

        this.cover(col);

        let rows = [];
        for (let row = col.down; row !== col; row = row.down) {
            rows.push(row);
        }

        shuffle(rows, this.random);

        let solutions = 0;

        for (let row of rows) {
            this.solution.push(row);

            for (let node = row.right; node !== row; node = node.right) {
                this.cover(node.column);
            }

            solutions += this.search(limit);

            if (solutions >= limit) return solutions;

            this.solution.pop();

            for (let node = row.left; node !== row; node = node.left) {
                this.uncover(node.column);
            }
        }

        this.uncover(col);
        return solutions;
    }
}

// =====================================
// Sudoku Exact Cover
// =====================================

function sudokuExactCover(board = null) {
    let matrix = [];

    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            for (let n = 0; n < 9; n++) {

                if (board && board[r][c] !== 0 && board[r][c] !== n + 1)
                    continue;

                let row = [];

                row.push(r * 9 + c);
                row.push(81 + r * 9 + n);
                row.push(162 + c * 9 + n);

                let block = Math.floor(r / 3) * 3 + Math.floor(c / 3);
                row.push(243 + block * 9 + n);

                matrix.push(row);
            }
        }
    }

    return matrix;
}

// =====================================
// Resolver
// =====================================

function resolverSudoku(board) {
    let matrix = sudokuExactCover(board);
    let columns = Array.from({ length: 324 }, (_, i) => i);
    let dlx = new DancingLinks(matrix, columns);

    dlx.search();

    return construirTableroDesdeSolucion(dlx.solution);
}

function construirTableroDesdeSolucion(solution) {
    let board = Array.from({ length: 9 }, () => Array(9).fill(0));

    for (let row of solution) {
        let cols = [];
        let node = row;

        do {
            cols.push(node.column.name);
            node = node.right;
        } while (node !== row);

        let cell = cols.find(c => c < 81);
        let rowNum = cols.find(c => c >= 81 && c < 162);

        let r = Math.floor(cell / 9);
        let c = cell % 9;
        let n = (rowNum - 81) % 9 + 1;

        board[r][c] = n;
    }

    return board;
}

// =====================================
// Generar solución con SEED
// =====================================

function generarSolucion(seed = 1234) {
    let random = mulberry32(seed);

    let matrix = sudokuExactCover();
    let columns = Array.from({ length: 324 }, (_, i) => i);

    let dlx = new DancingLinks(matrix, columns, random);
    dlx.search();

    return construirTableroDesdeSolucion(dlx.solution);
}

// =====================================
// Verificar solución única
// =====================================

function tieneSolucionUnica(board) {
    let matrix = sudokuExactCover(board);
    let columns = Array.from({ length: 324 }, (_, i) => i);
    let dlx = new DancingLinks(matrix, columns);

    return dlx.search(2) === 1;
}

// =====================================
// Crear puzzle con SEED
// =====================================

function crearPuzzle(board, vacios = 40, seed = 1234) {
    let random = mulberry32(seed);
    let puzzle = board.map(row => [...row]);

    let attempts = vacios;

    while (attempts > 0) {
        let r = Math.floor(random() * 9);
        let c = Math.floor(random() * 9);

        if (puzzle[r][c] !== 0) {
            let temp = puzzle[r][c];
            puzzle[r][c] = 0;

            if (!tieneSolucionUnica(puzzle)) {
                puzzle[r][c] = temp;
            } else {
                attempts--;
            }
        }
    }

    return puzzle;
}

// =====================================
// EJEMPLO
// =====================================

let seed = 5678;

console.log("Solución con seed:", seed);
let solucion = generarSolucion(seed);
console.table(solucion);

console.log("Puzzle con misma seed:");
let puzzle = crearPuzzle(solucion, 40, seed);
console.table(puzzle);


