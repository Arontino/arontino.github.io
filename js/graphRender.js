function create_net() {
  appState.nodes = new vis.DataSet([]);
  appState.edges = new vis.DataSet([]);

  appState.network = new vis.Network(
    document.getElementById("graph"),
    { nodes: appState.nodes, edges: appState.edges },
    {
      nodes: {
        shape: "circle",
        size: 28,
        font: { size: 18, color: "#000000" },
        borderWidth: 2,
        background: "#e3f2fd", border: "#1976d2"
      },
      edges: {
        width: 2,
        color: "#565656",
        font: { align: "top", size: 14 }
      },
      physics: { 
        stabilization: { iterations: 200 },
        solver: "forceAtlas2Based",
        barnesHut: {gravitationalConstant: -80000, springConstant: 0.001, springLength: 200}
       },
      interaction: { dragNodes: true, dragView: true, zoomView: true }
    }
  );
}

function renderGraphFromMatrix(matrix) {
  stopAnimation();

  appState.nodes.clear();
  appState.edges.clear();
  appState.nodes.add(buildVisNodes(matrix));
  appState.edges.add(buildVisEdges(matrix));
  appState.network.fit();
}

function buildVisNodes(matrix) {
  return matrix.map((_, vertex) => ({
    id: vertex,
    label: n_to_l(vertex),
    color: getDefaultNodeColor()
  }));
}

function buildVisEdges(matrix) {
  const edges = [];

  for (let from = 0; from < matrix.length; from++) {
    for (let to = from + 1; to < matrix.length; to++) {
      const weight = matrix[from][to];
      if (weight !== 0) edges.push(makeVisEdge(from, to, weight));
    }
  }

  return edges;
}

function makeVisEdge(from, to, weight) {
  return {
    id: getEdgeId(from, to),
    from,
    to,
    label: weight > 1 ? String(weight) : "",
    color: getDefaultEdgeColor(),
    width: 2
  };
}

function getDefaultNodeColor() {
  return { background: "#e3f2fd", border: "#1976d2" };
}

function getDefaultEdgeColor() {
  return { color: "#555" };
}

function getEdgeId(a, b) {
  return `${Math.min(a, b)}-${Math.max(a, b)}`;
}

function highlightVertex(vertex, color = "#ffca28", border = "#f57f17") {
  if (!appState.nodes) return;
  appState.nodes.update({ id: vertex, color: { background: color, border } });
}

function markVertexVisited(vertex) {
  highlightVertex(vertex, "#a5d6a7", "#2e7d32");
}

function markVertexActive(vertex) {
  highlightVertex(vertex);
}

function highlightEdge(from, to, color = "#f57c00", width = 4) {
  if (!appState.edges) return;

  const id = getEdgeId(from, to);
  if (appState.edges.get(id)) appState.edges.update({ id, color: { color }, width });
}

function markEdgeVisited(from, to) {
  highlightEdge(from, to, "#43a047", 4);
}

function resetGraphColors() {
  if (!appState.nodes || !appState.edges) return;

  appState.nodes.forEach(node => appState.nodes.update({ id: node.id, color: getDefaultNodeColor() }));
  appState.edges.forEach(edge => appState.edges.update({ id: edge.id, color: getDefaultEdgeColor(), width: 2 }));
}
let animationTimer =0;
function playGraphAnimation(steps) {
  stopAnimation();
  resetGraphColors();
  
  let index = 0;
  animationTimer = setInterval(() => {
    if (index >= steps.length) return stopAnimation();
    applyAnimationStep(steps[index++]);
  }, 800);
}

function applyAnimationStep(step) {
  const handlers = {
    visit: () => {
      markVertexVisited(step.vertex);
      markVertexActive(step.vertex);
    },
    move: () => {
      markVertexVisited(step.from);
      markVertexActive(step.to);
      markEdgeVisited(step.from, step.to);
    },
    backtrack: () => {
      markVertexVisited(step.from);
      markVertexActive(step.to);
      highlightEdge(step.from, step.to, "#90a4ae", 3);
    },
    edge: () => markEdgeVisited(step.from, step.to),
    active: () => markVertexActive(step.vertex),
    color: () => highlightVertex(step.vertex, step.color, "#333")
  };

  if (handlers[step.type]) handlers[step.type]();
}

function stopAnimation() {
  if (!animationTimer) return;
  clearInterval(animationTimer);
  animationTimer = null;
}
