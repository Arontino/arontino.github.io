function formatDistance(distance) {
  return distance === Infinity ? "\u221e" : String(distance);
}

function findNearestUnvisitedVertex(distances, visited) {
  let best = null;

  for (let vertex = 0; vertex < distances.length; vertex++) {
    if (!visited[vertex] && (best === null || distances[vertex] < distances[best])) best = vertex;
  }

  return best;
}

function dijkstraWithTable(matrix, startVertex) {
  if (!isValidVertex(matrix, startVertex)) throw new Error("Некорректная стартовая вершина.");

  const distances = new Array(matrix.length).fill(Infinity);
  const previous = new Array(matrix.length).fill(null);
  const visited = new Array(matrix.length).fill(false);
  const tableSteps = [];

  distances[startVertex] = 0;
  addDijkstraStep(tableSteps, 0, null, null, distances, [startVertex]);

  for (let step = 1; step <= matrix.length; step++) {
    const current = findNearestUnvisitedVertex(distances, visited);

    if (current === null || distances[current] === Infinity) {
      addDijkstraStep(tableSteps, step, null, null, distances, []);
      break;
    }

    visited[current] = true;
    const changedVertices = relaxDijkstraEdges(matrix, current, distances, previous, visited);
    addDijkstraStep(tableSteps, step, current, distances[current], distances, changedVertices);
  }

  return { distances, previous, tableSteps };
}

function relaxDijkstraEdges(matrix, current, distances, previous, visited) {
  const changed = [];

  for (let neighbor = 0; neighbor < matrix.length; neighbor++) {
    const weight = matrix[current][neighbor];
    const newDistance = distances[current] + weight;

    if (weight === 0 || visited[neighbor] || newDistance >= distances[neighbor]) continue;

    distances[neighbor] = newDistance;
    previous[neighbor] = current;
    changed.push(neighbor);
  }

  return changed;
}

function addDijkstraStep(tableSteps, step, selectedVertex, selectedDistance, distances, changedVertices) {
  tableSteps.push({ step, selectedVertex, selectedDistance, distances: [...distances], changedVertices });
}

function restoreShortestPath(previous, startVertex, targetVertex) {
  const path = [];

  for (let current = targetVertex; current !== null; current = previous[current]) {
    path.push(current);
    if (current === startVertex) return path.reverse();
  }

  return [];
}

function buildDijkstraTable(result) {
  const wrapper = createElement("div", { className: "table-wrapper" });
  const table = createElement("table", { className: "dijkstra-table" });
  const thead = table.createTHead();
  const headerRow = thead.insertRow();

  ["шаг", "v", "d(v)", ...result.distances.map((_, vertex) => n_to_l(vertex))]
    .forEach(value => appendCell(headerRow, "th", value));

  const tbody = table.createTBody();
  result.tableSteps.forEach(row => {
    const tr = tbody.insertRow();
    appendCell(tr, "td", row.step);
    appendCell(tr, "td", row.selectedVertex === null ? "—" : n_to_l(row.selectedVertex));
    appendCell(tr, "td", row.selectedDistance === null ? "—" : formatDistance(row.selectedDistance));

    row.distances.forEach((distance, vertex) => {
      appendCell(tr, "td", formatDistance(distance), getDijkstraCellClasses(row, vertex));
    });
  });

  wrapper.append(table);
  return wrapper;
}

function appendCell(row, tagName, text, className = "") {
  const cell = document.createElement(tagName);
  cell.textContent = text;
  if (className) cell.className = className;
  row.append(cell);
  return cell;
}

function getDijkstraCellClasses(row, vertex) {
  return [
    row.changedVertices.includes(vertex) ? "changed-cell" : "",
    row.selectedVertex === vertex ? "selected-cell" : "",
    row.distances[vertex] === Infinity ? "infinity-cell" : ""
  ].filter(Boolean).join(" ");
}

function floydWarshall(matrix) {
  const distances = matrix.map((row, from) =>
    row.map((weight, to) => from === to ? 0 : weight || Infinity)
  );

  for (let through = 0; through < matrix.length; through++) {
    for (let from = 0; from < matrix.length; from++) {
      for (let to = 0; to < matrix.length; to++) {
        const newDistance = distances[from][through] + distances[through][to];
        if (newDistance < distances[from][to]) distances[from][to] = newDistance;
      }
    }
  }

  return { distances };
}

function buildShortestPathsMatrixTable(result) {
  const matrix = result.distances;
  const wrapper = createElement("div", { className: "table-wrapper" });
  const table = createElement("table", { className: "shortest-matrix-table" });
  const thead = table.createTHead();
  const headerRow = thead.insertRow();

  appendCell(headerRow, "th", "");
  matrix.forEach((_, vertex) => appendCell(headerRow, "th", n_to_l(vertex)));

  const tbody = table.createTBody();
  matrix.forEach((row, from) => {
    const tr = tbody.insertRow();
    appendCell(tr, "th", n_to_l(from));
    row.forEach((value, to) => appendCell(tr, "td", formatDistance(value), getShortestMatrixCellClass(value, from, to)));
  });

  wrapper.append(table);
  return wrapper;
}

function getShortestMatrixCellClass(value, from, to) {
  if (value === Infinity) return "infinity-cell";
  if (from === to) return "selected-cell";
  return "";
}
