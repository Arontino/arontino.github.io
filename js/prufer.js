function encodeP(m) {
  let nm = [];
  for (let i = 0; i < m.length; i++) {
    let q = [];
    for (let j = 0; j < m[i].length; j++) {
      q.push(m[i][j]);
    }
    nm.push(q);
  }
  const d = get_stepns(nm);
  const code = [];
  const steps = [];

  for (let i = 0; i < m.length - 2; i++) {
    const from = d.findIndex(i => i === 1);
    const to = nm[from].findIndex(i => i !== 0);
    code.push(n_to_l(to));
    steps.push({type: "edge", from: from, to: to,
      text: `Удаление ребра ${n_to_l(from)}-${n_to_l(to)} и вершины ${n_to_l(from)}. Код: ${code}`
    });
    set_edge(nm, from, to, 0);
    d[from]--;
    d[to]--;
  }
  return { code, steps };
}

function decodeP(code) {
  const ind = code.trim().split(/\s+/).map(i=>{return to_ind(i);});
  const n = ind.length + 2;
  const d = new Array(n).fill(1);
  const edges = [];
  const steps = [];
  for (const i of ind) {
    if (!(i >= 0 && i < n)) throw new Error(`Неправильная вершина -${n_to_l(i)}.`);
    d[i]++;
  }
  for (const i of ind) {
    const leaf = d.findIndex(i => i === 1);
    edges.push({ from: leaf, to: i });
    steps.push({ type: "edge", from: leaf, to: i, text: `Вершину ${n_to_l(leaf)} соединяем с ${n_to_l(i)}` });
    d[leaf]--;
    d[i]--;
  }
  const from = d.map((i, j) => i === 1 ? j : null).filter(i => i !== null);
  edges.push({ from: from[0], to: from[1] });
  steps.push({ type: "edge", from: from[0], to: from[1], text: `Вершину ${n_to_l(from[0])} соединяем с ${n_to_l(from[1])}` });
  const matrix = create_zm(n);
  for (const { from, to } of edges) set_edge(matrix, from, to, 1);
  return { matrix, steps };
}