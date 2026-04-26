function getNonIsolatedVertices(matrix) {
  return get_stepns(matrix)
    .map((degree, vertex) => degree > 0 ? vertex : null)
    .filter(vertex => vertex !== null);
}

function isConnectedIgnoringIsolatedVertices(matrix) {
  const vertices = getNonIsolatedVertices(matrix);
  if (vertices.length === 0) return true;

  const visited = new Array(matrix.length).fill(false);
  simpleDfs(matrix, vertices[0], visited, []);

  return vertices.every(vertex => visited[vertex]);
}

function getOddDegreeVertices(matrix) {
  return get_stepns(matrix)
    .map((degree, vertex) => degree % 2 ? vertex : null)
    .filter(vertex => vertex !== null);
}

function getEulerStatus(matrix) {
  const oddVertices = getOddDegreeVertices(matrix);
  const isEdgeConnected = isConnectedIgnoringIsolatedVertices(matrix);

  if (!isEdgeConnected) {
    return eulerResult("not-eulerian", oddVertices, false, "Ребра лежат в разных компонентах связности.");
  }

  if (oddVertices.length === 0) {
    return eulerResult("eulerian", oddVertices, true, "Все вершины четной степени, и ребра лежат в одной компоненте.");
  }

  if (oddVertices.length === 2) {
    return eulerResult("semi-eulerian", oddVertices, true, "Две вершины имеют нечётную степень, ребра лежат в одной компоненте связности.");
  }

  return eulerResult("not-eulerian", oddVertices, true, "Количество вершин нечётной степени не равно 0 или 2.");
}

function eulerResult(type, oddVertices, isConnectedIgnoringIsolated, message) {
  return { type, oddVertices, isConnectedIgnoringIsolated, message };
}

function getEulerTypeName(type) {
  return {
    eulerian: "эйлеров",
    "semi-eulerian": "полуэйлеров"
  }[type] || "не эйлеров";
}

function eulerStatusToText(status) {
  const oddText = status.oddVertices.length ? verticesArrayToText(status.oddVertices) : "нет";

  return [
    `Тип ${getEulerTypeName(status.type)}`,
    `Вершины нечетной степени: ${oddText}`,
    `Ребра в одной компоненте: ${status.isConnectedIgnoringIsolated ? "да" : "нет"}`,
    `${status.message}`
  ].join("\n");
}
