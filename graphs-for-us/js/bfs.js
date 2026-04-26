function getBfsTraversal(matrix, startVertex) {
  if (!isValidVertex(matrix, startVertex)) throw new Error("Неправильная стартовая вершина.");

  const visited = new Array(matrix.length).fill(false);
  const order = [];
  const steps = [];

  function bfs(start) {
    const queue = [start];
    visited[start] = true;
    order.push(start);
    steps.push({ type: "visit", vertex: start });

    for (let i = 0; i < queue.length; i++) {
      const vertex = queue[i];
      steps.push({ type: "active", vertex });

      for (const neighbor of getNeighbors(matrix, vertex).sort((a, b) => a - b)) {
        if (visited[neighbor]) continue;

        visited[neighbor] = true;
        queue.push(neighbor);
        order.push(neighbor);
        steps.push({ type: "move", from: vertex, to: neighbor });
      }
    }
  }

  bfs(startVertex);

  for (let vertex = 0; vertex < matrix.length; vertex++) {
    if (!visited[vertex]) bfs(vertex);
  }

  return { order, steps };
}

function getBfsOrder(matrix, startVertex) {
  return getBfsTraversal(matrix, startVertex).order;
}

function checkBfsOrder(matrix, startVertex, userInputText) {
  return checkTraversalOrder(matrix, startVertex, userInputText, getBfsOrder, "BFS");
}
