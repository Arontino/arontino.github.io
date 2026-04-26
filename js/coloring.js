const COLORING_PALETTE = [
  "#ef9a9a", "#90caf9", "#a5d6a7", "#fff59d", "#ce93d8",
  "#ffcc80", "#80cbc4", "#bcaaa4", "#b0bec5", "#f48fb1",
  "#654d28", "#274b48", "#422b24", "#1c2d36", "#281219",
  "#0e3b2d", "#00574e", "#521400", "#004060", "#600020"
];

function getColorByIndex(colorIndex) {
  return COLORING_PALETTE[colorIndex % COLORING_PALETTE.length];
}

function greedyColoring(matrix) {
  if (matrix.length === 0) throw new Error("Граф пустой.");

  const colors = new Array(matrix.length).fill(-1);
  const steps = [];

  for (let vertex = 0; vertex < matrix.length; vertex++) {
    const usedColors = new Set(
      getNeighbors(matrix, vertex)
        .map(neighbor => colors[neighbor])
        .filter(color => color !== -1)
    );

    let colorIndex = 0;
    while (usedColors.has(colorIndex)) colorIndex++;

    colors[vertex] = colorIndex;
    steps.push({ type: "color", vertex, colorIndex, color: getColorByIndex(colorIndex) });
  }

  return { colors, colorsCount: Math.max(...colors) + 1, steps };
}

function checkColoringCorrectness(matrix, colors) {
  for (const { from, to } of getEdgesList(matrix)) {
    if (colors[from] === colors[to]) {
      return {
        isCorrect: false,
        conflict: { from, to, color: colors[from] },
        message: `Ошибка раскраски: вершины ${n_to_l(from)} и ${n_to_l(to)} соединены ребром, но имеют одинаковый цвет ${colors[from] + 1}.`
      };
    }
  }

  return {
    isCorrect: true,
    conflict: null,
    message: "Раскраска корректна: соседние вершины имеют разные цвета."
  };
}

function coloringToText(result) {
  return result.colors
    .map((color, vertex) => `Вершина ${n_to_l(vertex)} — цвет ${color + 1}`)
    .join("\n");
}

function coloringGroupsToText(result) {
  const groups = Array.from({ length: result.colorsCount }, () => []);

  result.colors.forEach((color, vertex) => groups[color].push(vertex));

  return groups
    .map((vertices, color) => `Цвет ${color + 1}: ${verticesArrayToText(vertices)}`)
    .join("\n");
}
