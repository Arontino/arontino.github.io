const GRAPH_INPUT_PARSERS = {
  adjacencyMatrix: parseAdjacencyMatrix,
  incidenceMatrix: parseIncidenceMatrix,
  adjacencyList: parseAdjacencyList
};

function parseGraphInput(inputType, text) {
  const parser = GRAPH_INPUT_PARSERS[inputType];
  return parser(text);
}

function checkVerticesLimit(n) {
  if (n > 20) throw new Error("По условию число вершин не должно быть больше 20.");
}

function create_zm(n) {
  return Array.from({ length: n }, () => Array(n).fill(0));
}

function readNumberRows(text, emptyMessage) {
  const rows = text
    .trim()
    .split(/\n+/)
    .map(row => row.trim())
    .filter(Boolean)
    .map(row => row.split(/\s+/).map(Number));

  if (rows.length === 0) throw new Error(emptyMessage);
  return rows;
}

function ensureOnlyNumbers(rows, message) {
  if (rows.some(row => row.some(value => !Number.isFinite(value)))) {
    throw new Error(message);
  }
}

function set_edge(matrix, a, b, weight) {
  matrix[a][b] = weight;
  matrix[b][a] = weight;
}

function parseAdjacencyMatrix(text) {
  const rows = readNumberRows(text, "Матрица смежности пустая.");
  const n = rows.length;

  checkVerticesLimit(n);
  ensureOnlyNumbers(rows, "Матрица смежности должна содержать только числа.");

  for (let i = 0; i < n; i++) {
    if (rows[i].length !== n) throw new Error("Матрица смежности должна быть квадратной.");

    for (let j = 0; j < n; j++) {
      if (rows[i][j] < 0) throw new Error("Вес ребра не может быть отрицательным.");
      if (i === j && rows[i][j] !== 0) throw new Error("На главной диагонали должны быть нули.");
      if (rows[i][j] !== rows[j][i]) {
        throw new Error("Для неориентированного графа матрица смежности должна быть симметричной.");
      }
    }
  }

  return rows;
}

function parseIncidenceMatrix(text) {
  const rows = readNumberRows(text, "Матрица инцидентности пустая.");
  const verticesCount = rows.length;
  const edgesCount = rows[0].length;

  checkVerticesLimit(verticesCount);
  ensureOnlyNumbers(rows, "Матрица инцидентности должна содержать только числа.");

  if (edgesCount === 0) throw new Error("В матрице инцидентности должен быть хотя бы один столбец.");

  for (const row of rows) {
    if (row.length !== edgesCount) throw new Error("Все строки матрицы инцидентности должны иметь одинаковую длину.");
    if (row.some(value => value < 0)) throw new Error("Матрица инцидентности не должна содержать отрицательные числа.");
  }

  const matrix = create_zm(verticesCount);

  for (let edgeIndex = 0; edgeIndex < edgesCount; edgeIndex++) {
    const incident = [];

    for (let vertex = 0; vertex < verticesCount; vertex++) {
      const value = rows[vertex][edgeIndex];
      if (value !== 0) incident.push({ vertex, value });
    }

    if (incident.length !== 2) {
      throw new Error(`Столбец ${edgeIndex + 1} матрицы инцидентности должен содержать ровно две ненулевые ячейки.`);
    }

    const [first, second] = incident;
    if (first.value !== second.value) throw new Error(`В столбце ${edgeIndex + 1} значения у двух вершин должны совпадать.`);
    if (first.vertex === second.vertex) throw new Error("Петли пока не поддерживаются.");

    set_edge(matrix, first.vertex, second.vertex, first.value);
  }

  return matrix;
}

function parseAdjacencyList(text) {
  const lines = text.split("\n").map(line => line.trim()).filter(Boolean);
  if (lines.length === 0) throw new Error("Список смежности пустой.");

  const edges = [];
  let maxVertexIndex = -1;

  for (const line of lines) {
    const [left, right, extra] = line.split(":");
    if (extra !== undefined || right === undefined) throw new Error(`Строка "${line}" должна иметь формат "вершина: соседи".`);

    const from = to_ind(left.trim());
    if (!Number.isInteger(from) || from < 0) throw new Error(`Некорректная вершина в строке "${line}".`);

    maxVertexIndex = Math.max(maxVertexIndex, from);

    for (const token of right.trim().split(/\s+/).filter(Boolean)) {
      const { vertex: to, weight } = parseNeighborToken(token);
      if (to === from) throw new Error("Петли пока не поддерживаются.");

      maxVertexIndex = Math.max(maxVertexIndex, to);
      edges.push({ from, to, weight });
    }
  }

  checkVerticesLimit(maxVertexIndex + 1);
  const matrix = create_zm(maxVertexIndex + 1);

  for (const { from, to, weight } of edges) {
    const oldWeight = matrix[from][to];
    if (oldWeight !== 0 && oldWeight !== weight) {
      throw new Error(`Ребро ${edgeToText(from, to)} указано с разными весами.`);
    }
    set_edge(matrix, from, to, weight);
  }

  return matrix;
}

function parseNeighborToken(token) {
  const match = token.match(/^([a-z]+|\d+)(?:\((\d+)\))?$/i);
  if (!match) throw new Error(`Некорректная запись соседа: "${token}".`);

  const vertex = to_ind(match[1]);
  const weight = match[2] ? Number(match[2]) : 1;

  if (!Number.isInteger(vertex) || vertex < 0) throw new Error(`Некорректная вершина в записи "${token}".`);
  if (weight <= 0) throw new Error(`Вес ребра должен быть положительным в записи "${token}".`);

  return { vertex, weight };
}

function generateRandomGraph(options) {

  const { verticesCount, edgeProbability, isWeighted, minWeight, maxWeight, ensureConnected } = options;
  const matrix = create_zm(verticesCount);

  const randomWeight = () => isWeighted ? getRandomInteger(minWeight, maxWeight) : 1;

  if (ensureConnected) {
    for (let vertex = 1; vertex < verticesCount; vertex++) {
      set_edge(matrix, vertex, getRandomInteger(0, vertex - 1), randomWeight());
    }
  }

  for (let from = 0; from < verticesCount; from++) {
    for (let to = from + 1; to < verticesCount; to++) {
      if (matrix[from][to] === 0 && Math.random() < edgeProbability) {
        set_edge(matrix, from, to, randomWeight());
      }
    }
  }

  return matrix;
}

function getRandomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
