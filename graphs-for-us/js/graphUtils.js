function getNeighbors(matrix, vertex) {
  return matrix[vertex]
    .map((weight, index) => weight !== 0 ? index : null)
    .filter(index => index !== null);
}

function get_stepns(matrix) {
  return matrix.map(row => row.filter(weight => weight !== 0).length);
}

function getEdgesList(matrix) {
  const edges = [];

  for (let from = 0; from < matrix.length; from++) {
    for (let to = from + 1; to < matrix.length; to++) {
      if (matrix[from][to] !== 0) edges.push({ from, to, weight: matrix[from][to] });
    }
  }

  return edges;
}

function countEdges(matrix) {
  return getEdgesList(matrix).length;
}

function isValidVertex(matrix, vertex) {
  return Number.isInteger(vertex) && vertex >= 0 && vertex < matrix.length;
}

function simpleDfs(matrix, startVertex, visited, component) {
  visited[startVertex] = true;
  component.push(startVertex);

  for (const neighbor of getNeighbors(matrix, startVertex)) {
    if (!visited[neighbor]) simpleDfs(matrix, neighbor, visited, component);
  }
}

function getConnectedComponents(matrix) {
  const visited = new Array(matrix.length).fill(false);
  const components = [];

  for (let vertex = 0; vertex < matrix.length; vertex++) {
    if (visited[vertex]) continue;

    const component = [];
    simpleDfs(matrix, vertex, visited, component);
    components.push(component);
  }

  return components;
}

function isConnected(matrix) {
  return matrix.length === 0 || getConnectedComponents(matrix).length === 1;
}

function isTree(matrix) {
  return isConnected(matrix) && countEdges(matrix) === matrix.length - 1;
}

function isWeightedGraph(matrix) {
  return getEdgesList(matrix).some(edge => edge.weight !== 1);
}

function userVertexToIndex(userVertex) {
  return to_ind(userVertex);
}

function indexToUserVertex(index) {
  return n_to_l(index);
}

function n_to_l(index) {
  let number = index + 1;
  let name = "";

  while (number > 0) {
    number--;
    name = String.fromCharCode(65 + (number % 26)) + name;
    number = Math.floor(number / 26);
  }

  return name;
}

function to_ind(token) {
  const value = String(token).trim();
  if (!value) return NaN;

  if (/^\d+$/.test(value)) return Number(value) - 1;
  if (!/^[a-z]+$/i.test(value)) return NaN;

  return value
    .toUpperCase()
    .split("")
    .reduce((index, char) => index * 26 + char.charCodeAt(0) - 64, 0) - 1;
}

function verticesRangeText(count) {
  return count <= 0 ? "" : `${n_to_l(0)}-${n_to_l(count - 1)}`;
}

function edgeToText(from, to) {
  return `${n_to_l(from)}-${n_to_l(to)}`;
}

function verticesArrayToText(vertices) {
  return vertices.map(indexToUserVertex).join(" ");
}

function componentsToText(components) {
  return components
    .map((component, index) => `Компонента ${index + 1}: ${verticesArrayToText(component)}`)
    .join("\n");
}

function degreesToText(degrees) {
  return degrees
    .map((degree, index) => `deg(${n_to_l(index)}) = ${degree}`)
    .join("\n");
}
