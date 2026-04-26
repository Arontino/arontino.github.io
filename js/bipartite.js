function checkBipartite(matrix) {
  const colors = new Array(matrix.length).fill(-1);

  for (let start = 0; start < matrix.length; start++) {
    if (colors[start] !== -1) continue;

    colors[start] = 0;
    const queue = [start];

    for (let i = 0; i < queue.length; i++) {
      const vertex = queue[i];

      for (const neighbor of getNeighbors(matrix, vertex)) {
        if (colors[neighbor] === -1) {
          colors[neighbor] = 1 - colors[vertex];
          queue.push(neighbor);
        } else if (colors[neighbor] === colors[vertex]) {
          return {
            isBipartite: false,
            colors,
            partA: [],
            partB: [],
            conflict: { from: vertex, to: neighbor },
            message: `Граф не двудольный.`
          };
        }
      }
    }
  }

  const { partA, partB } = getBipartiteParts(colors);
  return {
    isBipartite: true,
    colors,
    partA,
    partB,
    conflict: null,
    message: "Граф двудольный"
  };
}

function getBipartiteParts(colors) {
  return {
    partA: colors.map((color, vertex) => color === 0 ? vertex : null).filter(vertex => vertex !== null),
    partB: colors.map((color, vertex) => color === 1 ? vertex : null).filter(vertex => vertex !== null)
  };
}

function checkCompleteBipartite(matrix) {
  const bipartiteStatus = checkBipartite(matrix);
  const { partA, partB } = bipartiteStatus;

  if (!bipartiteStatus.isBipartite) {
    return completeBipartiteResult(false, bipartiteStatus, "");
  }

  if (partA.length === 0 || partB.length === 0) {
    return completeBipartiteResult(false, bipartiteStatus, "Граф двудольный, но не полный двудольный");
  }

  for (const vertexA of partA) {
    for (const vertexB of partB) {
      if (matrix[vertexA][vertexB] === 0) {
        return completeBipartiteResult(false, bipartiteStatus, `Граф двудольный, но не полный двудольный.`);
      }
    }
  }

  return completeBipartiteResult(true, bipartiteStatus, "Граф является полным двудольным.");
}

function completeBipartiteResult(isCompleteBipartite, bipartiteStatus, message) {
  return { isCompleteBipartite, bipartiteStatus, message };
}

function bipartiteStatusToText(status) {
  if (!status.isBipartite) {
    return `Граф двудольный: нет\n${status.message}`;
  }

  return [
    "Граф двудольный: да",
    `Первая доля: ${verticesArrayToText(status.partA)}`,
    `Вторая доля: ${verticesArrayToText(status.partB)}`,
    `${status.message}`
  ].join("\n");
}

function completeBipartiteStatusToText(status) {
  return `Граф полный двудольный: ${status.isCompleteBipartite ? "да" : "нет"}\n${status.message}`;
}
