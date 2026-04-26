function getDfsTraversal(matrix, startVertex) {
  if (!isValidVertex(matrix, startVertex)) throw new Error("Неправильная стартовая вершина");

  const visited = new Array(matrix.length).fill(false);
  const order = [];
  const steps = [];

  function dfs(vertex, parent = null) {
    visited[vertex] = true;
    order.push(vertex);
    steps.push(parent === null ? { type: "visit", vertex } : { type: "move", from: parent, to: vertex });

    for (const neighbor of getNeighbors(matrix, vertex).sort((a, b) => a - b)) {
      if (visited[neighbor]) continue;
      dfs(neighbor, vertex);
      steps.push({ type: "backtrack", from: neighbor, to: vertex });
    }
  }

  dfs(startVertex);

  for (let vertex = 0; vertex < matrix.length; vertex++) {
    if (!visited[vertex]) dfs(vertex);
  }

  return { order, steps };
}

function getDfsOrder(matrix, startVertex) {
  return getDfsTraversal(matrix, startVertex).order;
}

function parseUserTraversalInput(text, verticesCount) {
  if (!text.trim()) return traversalParseError([], "");

  const order = [];

  for (const token of text.trim().replaceAll(",", " ").split(/\s+/)) {
    const vertex = to_ind(token);

    if (!Number.isInteger(vertex)) {
      return traversalParseError([], `Нужно вводить: A, B, C и т.д.`);
    }

    if (vertex < 0 || vertex >= verticesCount) {
      return traversalParseError(order, `Вершины ${token} нет в графе. Диапазон: ${verticesRangeText(verticesCount)}.`);
    }

    order.push(vertex);
  }

  if (new Set(order).size !== order.length) return traversalParseError(order, "В обходе не должно быть повторяющихся вершин.");
  if (order.length !== verticesCount) {
    return traversalParseError(order, `Обход должен содержать все вершины графа.`);
  }

  return { isValid: true, order, message: "" };
}

function traversalParseError(order, message) {
  return { isValid: false, order, message };
}

function checkDfsOrder(matrix, startVertex, userInputText) {
  return checkTraversalOrder(matrix, startVertex, userInputText, getDfsOrder, "DFS");
}

function checkTraversalOrder(matrix, startVertex, userInputText, getExpectedOrder, name) {
  const parsed = parseUserTraversalInput(userInputText, matrix.length);
  const expectedOrder = parsed.isValid ? getExpectedOrder(matrix, startVertex) : [];

  if (!parsed.isValid) {
    return { isCorrect: false, expectedOrder, userOrder: parsed.order, message: parsed.message };
  }

  const errorIndex = expectedOrder.findIndex((vertex, index) => vertex !== parsed.order[index]);

  if (errorIndex !== -1) {
    return {
      isCorrect: false,
      expectedOrder,
      userOrder: parsed.order,
      message: `Ошибка на ${errorIndex + 1}`
    };
  }

  return {
    isCorrect: true,
    expectedOrder,
    userOrder: parsed.order,
    message: `${name}-обход введён правильно.`
  };
}
