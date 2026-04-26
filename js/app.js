const appState = {
  adjacencyMatrix: null,
  verticesCount: 0,
  network: null,
  nodes: null,
  edges: null
};

const get_id = id => document.getElementById(id);

const INPUT_TYPE_NAMES = {
  adjacencyMatrix: "Матрица смежности",
  incidenceMatrix: "Матрица инцидентности",
  adjacencyList: "Список смежности"
};

const ALGORITHM_NAMES = {
  analysis: "Анализ графа",
  dfs: "Обход в глубину (DFS)",
  checkDfs: "Проверка DFS",
  bfs: "Обход в ширину (BFS)",
  checkBfs: "Проверка BFS",
  components: "Компоненты связности",
  checkComponents: "Проверка числа компонент связности",
  mst: "Минимальное остовное дерево",
  dijkstra: "Алгоритм Дейкстры",
  shortestMatrix: "Матрица кратчайших путей",
  pruferEncode: "Кодирование Прюфера",
  pruferDecode: "Декодирование Прюфера",
  coloring: "Раскраска графа"
};

const CONTROL_BUILDERS = {
  analysis: () => note("Будет выведена степень каждой вершины, число компонент связности, эйлеровость и двудольность."),
  dfs: () => startVertexControl("Будет показан DFS-обход."),
  bfs: () => startVertexControl("Будет показан BFS-обход."),
  checkDfs: () => traversalCheckControl("DFS", "Например: A B D C"),
  checkBfs: () => traversalCheckControl("BFS", "Например: A B C D"),
  checkComponents: componentsCheckControl,
  dijkstra: () => startVertexControl("Таблица минимального пути от вершины"),
  pruferDecode: pruferDecodeControl,
  mst: () => note("Будут показаны ребра минимального остовного дерева алгоритмом Прима. Граф должен быть связным."),
  shortestMatrix: () => document.createDocumentFragment(),
  pruferEncode: () => note("Код Прюфера можно построить только для дерева."),
  coloring: () => note("Будет выполнена раскраска графа.")
};

const RUNNERS = {
  analysis: runGraphAnalysis,
  dfs: matrix => runTraversal(matrix, "dfs"),
  checkDfs: matrix => runTraversalCheck(matrix, "dfs"),
  bfs: matrix => runTraversal(matrix, "bfs"),
  checkBfs: matrix => runTraversalCheck(matrix, "bfs"),
  components: runComponentsAnalysis,
  checkComponents: runCheckComponents,
  mst: runMst,
  dijkstra: runDijkstra,
  shortestMatrix: runShortestPathsMatrix,
  pruferEncode: runPruferEncode,
  pruferDecode: runPruferDecode,
  coloring: runColoring
};

const TRAVERSALS = {
  dfs: {
    title: "DFS — обход в глубину",
    name: "DFS",
    get: getDfsTraversal,
    check: checkDfsOrder
  },
  bfs: {
    title: "BFS — обход в ширину",
    name: "BFS",
    get: getBfsTraversal,
    check: checkBfsOrder
  }
};

window.addEventListener("load", initApp);

function initApp() {
  create_net();

  get_id("buildGraphBtn").addEventListener("click", handleBuildGraph);
  get_id("generateGraphBtn").addEventListener("click", handleGenerateGraph);
  get_id("algorithmSelect").addEventListener("change", updateAlgorithmControls);
  get_id("runAlgorithmBtn").addEventListener("click", handleRunAlgorithm);
  get_id("generatorVerticesCount").addEventListener("keyup", check_this);
  get_id("generatorEdgeProbability").addEventListener("keyup", check_this);
  get_id("generatorMinWeight").addEventListener("keyup", check_this);
  get_id("generatorMaxWeight").addEventListener("keyup", check_this);
  
  updateAlgorithmControls();
}

function check_this(){
  const a = get_id("generatorVerticesCount");
  const b = get_id("generatorEdgeProbability");
  const c = get_id("generatorMinWeight");
  const d = get_id("generatorMaxWeight");
  let q = parseInt(a.value, 10);
  if (q > 20 || q < 1) a.value = 6;
  q = parseFloat(b.value);
  if (q > 1 || q < 0) b.value = 0.35;
  q = parseInt(c.value, 10);
  if (q > 500000 || q < 1) q = 1;
  c.value = q;
  let w = parseInt(d.value, 10);
  if (w > 500000 || w < 1) w = q;
  if (w < q) w = q;
  d.value = w;
}

function handleBuildGraph() {
  const inputType = get_id("inputType").value;
  const text = get_id("graphInput").value.trim();

  if (!text) return printResult("Cначала введите граф.");

  try {
    get_id("table").replaceChildren();
    const matrix = parseGraphInput(inputType, text);

    setGraph(matrix);
    printResult(
      `Формат ввода: ${INPUT_TYPE_NAMES[inputType]}\n` +
      graphInfoText(matrix) + matrixToText(matrix)
    );
  } catch (error) {
    printResult("Ошибка:\n" + error.message);
  }
}

function handleGenerateGraph() {
  try {
    get_id("table").replaceChildren();
    const isWeighted = get_id("generatorWeighted").checked;
    const matrix = generateRandomGraph({
      verticesCount: Number(get_id("generatorVerticesCount").value),
      edgeProbability: Number(get_id("generatorEdgeProbability").value),
      isWeighted,
      minWeight: Number(get_id("generatorMinWeight").value),
      maxWeight: Number(get_id("generatorMaxWeight").value),
      ensureConnected: get_id("generatorConnected").checked
    });

    setGraph(matrix);
    get_id("inputType").value = "adjacencyMatrix";
    get_id("graphInput").value = matrixToText(matrix);

    printResult(
      graphInfoText(matrix) +
      `Взвешенный граф: ${isWeighted ? "да" : "нет"}\n` +
      "Матрица смежности:\n" + matrixToText(matrix)
    );
  } catch (error) {
    printResult("Ошибка:\n" + error.message);
  }
}

function setGraph(matrix) {
  appState.adjacencyMatrix = matrix;
  appState.verticesCount = matrix.length;
  renderGraphFromMatrix(matrix);
}

function handleRunAlgorithm() {
  const algorithm = get_id("algorithmSelect").value;
  const runner = RUNNERS[algorithm];
  get_id("table").replaceChildren();
  if (algorithm !== "pruferDecode" && !appState.adjacencyMatrix) {
    return printResult("Сначала нужно построить граф");
  }
  stopAnimation();
  resetGraphColors();
  runner(appState.adjacencyMatrix);
}

function updateAlgorithmControls() {
  const container = get_id("algorithmControls");
  const builder = CONTROL_BUILDERS[get_id("algorithmSelect").value];

  container.replaceChildren();
  container.append(builder());
}

function runGraphAnalysis(matrix) {
  const components = getConnectedComponents(matrix);

  printResult([
    "Степени вершин:",
    degreesToText(get_stepns(matrix)),
    "",
    `Число компонент связности: ${components.length}`,
    componentsToText(components),
    "",
    eulerStatusToText(getEulerStatus(matrix)),
    "",
    bipartiteStatusToText(checkBipartite(matrix)),
    completeBipartiteStatusToText(checkCompleteBipartite(matrix))
  ].join("\n"));
}

function runTraversal(matrix, type) {
  try {
    const startVertex = getStartVertexFromInput(matrix);
    const traversal = TRAVERSALS[type].get(matrix, startVertex);

    printResult(
      `Стартовая вершина: ${n_to_l(startVertex)}\n` +
      `Порядок посещения вершин:\n${verticesArrayToText(traversal.order)}`
    );

    playGraphAnimation(traversal.steps);
  } catch (error) {
    printResult(`Ошибка ${TRAVERSALS[type].name}:\n` + error.message);
  }
}

function runTraversalCheck(matrix, type) {
  try {
    const startVertex = getStartVertexFromInput(matrix);
    const input = get_id("userTraversal");

    const traversal = TRAVERSALS[type];
    const check = traversal.check(matrix, startVertex, input.value);
    const expectedOrder = traversal.get(matrix, startVertex).order;

    printResult(
      (check.isCorrect
        ? `Правильно.\n`
        : `Неправильно.\n` +
          `Ваш обход: ${check.userOrder.length ? verticesArrayToText(check.userOrder) : ""}\n` +
          `Правильный: ${verticesArrayToText(expectedOrder)}`)
    );
  } catch (error) {
    printResult(`Ошибка  ${TRAVERSALS[type].name}:\n` + error.message);
  }
}

function runComponentsAnalysis(matrix) {
  const components = getConnectedComponents(matrix);
  printResult(
    `Число компонент связности: ${components.length}\n\n` +
    componentsToText(components)
  );
}

function runCheckComponents(matrix) {
  const userAnswer = Number(get_id("userComponentsCount").value);
  const correctAnswer = getConnectedComponents(matrix).length;

  if (!Number.isInteger(userAnswer) || userAnswer <= 0) {
    return printResult("Введите положительное число.");
  }

  printResult(
    userAnswer === correctAnswer
      ? `Правильно.\n\nЧисло компонент связности: ${correctAnswer}`
      : `Неправильно.\n\nВаш ответ: ${userAnswer}\nПравильный ответ: ${correctAnswer}`
  );
}

function runMst(matrix) {
  runAnimatedSteps(
    "Минимальное остовное дерево",
    () => Mst(matrix),
    "Ошибка"
  );
}

function runDijkstra(matrix) {
  try {
    
    const startVertex = getStartVertexFromInput(matrix);
    const result = dijkstraWithTable(matrix, startVertex);
    get_id("table").replaceChildren(buildDijkstraResult(result));
    printResult();
  } catch (error) {
    printResult("Ошибка:\n" + error.message);
  }
}

function runShortestPathsMatrix(matrix) {
  try {
    const result = floydWarshall(matrix);
    get_id("table").replaceChildren(buildShortestPathsResult(result));
    printResult();
  } catch (error) {
    printResult("Ошибка:\n" + error.message);
  }
}

function runPruferEncode(matrix) {
  try {
    const result = encodeP(matrix);
    printResult(
      stepsToText("Ход кодирования", result.steps) +
      `\n\nКод Прюфера: ${result.code.join(' ')}`
    );
    playGraphAnimation(result.steps);
  } catch (error) {
    printResult("Ошибка:\n" + error.message);
  }
}

function runPruferDecode() {
  try {
    const result = decodeP(get_id("pruferCode").value.trim());
    setGraph(result.matrix);
    get_id("inputType").value = "adjacencyMatrix";
    get_id("graphInput").value = matrixToText(result.matrix);

    printResult(stepsToText("Декодирование Прюфера\n\nРёбра построенного дерева", result.steps));
    playGraphAnimation(result.steps);
  } catch (error) {
    printResult("Ошибка:\n" + error.message);
  }
}

function runColoring(matrix) {
  try {
    const result = greedyColoring(matrix);
    const check = checkColoringCorrectness(matrix, result.colors);

    printResult([
      "Вершины:",
      coloringToText(result),
      "",
    ].join("\n"));

    playGraphAnimation(result.steps);
  } catch (error) {
    printResult("Ошибка при раскраске графа:\n" + error.message);
  }
}

function runAnimatedSteps(title, getSteps, errorTitle) {
  try {
    const steps = getSteps();
    printResult(stepsToText(title + "\n\nХод алгоритма", steps));
    playGraphAnimation(steps);
  } catch (error) {
    printResult(`${errorTitle}:\n` + error.message);
  }
}

function getStartVertexFromInput(matrix) {
  const userVertex = get_id("startVertex").value;
  const vertex = to_ind(userVertex);

  if (!Number.isInteger(vertex)) {
    throw new Error("Стартовую вершину нужно вводить: A, B, C и т.д.");
  }

  if (!isValidVertex(matrix, vertex)) {
    throw new Error(`Стартовая вершина должна быть в диапазоне ${verticesRangeText(matrix.length)}.`);
  }

  return vertex;
}

function startVertexControl(text = "") {
  const fragment = document.createDocumentFragment();

  fragment.append(
    createLabel("startVertex", "Стартовая вершина:"),
    createInput({ id: "startVertex", type: "text", value: "A" })
  );

  if (text) fragment.append(createElement("p", { className: "small-note", textContent: text }));

  return fragment;
}

function traversalCheckControl(name, placeholder) {
  const fragment = document.createDocumentFragment();

  fragment.append(
    createLabel("startVertex", "Стартовая вершина:"),
    createInput({ id: "startVertex", type: "text", value: "A" }),
    createLabel("userTraversal", `Введите ${name}-обход:`),
    createInput({ id: "userTraversal", type: "text", placeholder })
  );

  return fragment;
}

function componentsCheckControl() {
  const fragment = document.createDocumentFragment();

  fragment.append(
    createLabel("userComponentsCount", "Введите число компонент связности:"),
    createInput({ id: "userComponentsCount", type: "number", min: "1", value: "1" })
  );

  return fragment;
}

function pruferDecodeControl() {
  const fragment = document.createDocumentFragment();

  fragment.append(
    createLabel("pruferCode", "Код Прюфера:"),
    createInput({ id: "pruferCode", type: "text", placeholder: "Например: D D B A" }),
    createElement("p", {
      className: "small-note",
      textContent: "Декодирование кода Прюфера"
    })
  );

  return fragment;
}

function note(text) {
  return createElement("p", { className: "small-note", textContent: text });
}

function buildDijkstraResult(result) {
  const fragment = document.createDocumentFragment();
  fragment.append(buildDijkstraTable(result));
  return fragment;
}

function buildShortestPathsResult(result) {
  const fragment = document.createDocumentFragment();
  fragment.append(buildShortestPathsMatrixTable(result));
  return fragment;
}

function createElement(tagName, options = {}) {
  const element = document.createElement(tagName);

  for (const [key, value] of Object.entries(options)) {
    if (key === "textContent") element.textContent = value;
    else if (key === "className") element.className = value;
    else element.setAttribute(key, value);
  }

  return element;
}

function createLabel(forId, text) {
  return createElement("label", { for: forId, textContent: text });
}

function createInput(options) {
  return createElement("input", options);
}

function graphInfoText(matrix) {
  return `Количество вершин: ${matrix.length} (${verticesRangeText(matrix.length)})\nКоличество рёбер: ${countEdges(matrix)}\n`;
}

function stepsToText(title, steps) {
  return title + "\n" + steps.map((step, index) => `${index + 1}. ${step.text}`).join("\n");
}

function matrixToText(matrix) {
  return matrix.map(row => row.join(" ")).join("\n");
}

function printResult(text) {
  get_id("resultOutput").textContent = text;
}