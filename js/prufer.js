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
  let s = code.trim().split(/\s+/);
  let ind = [];
  for (let i=0;i<s.length;i++) ind.push(to_ind(s[i]));
  const n = ind.length + 2;
  const d = new Array(n).fill(1);
  const edges = [];
  const steps = [];
  for (const i of ind) d[i]++;
  for (const i of ind) {
    const from = d.findIndex(i=>i === 1);
    edges.push({ from: from, to: i });
    steps.push({ type: "edge", from: from, to: i,
     text: `Вершину ${n_to_l(from)} соединяем с ${n_to_l(i)}` });
    d[from]--;
    d[i]--;
  }
  const q = [];
  for (let i = 0; i < d.length; i++) if (d[i]===1) q.push(i);
  edges.push({ from: q[0], to: q[1] });
  steps.push({ type: "edge", from: q[0], to: q[1],
   text: `Вершину ${n_to_l(q[0])} соединяем с ${n_to_l(q[1])}` });
  const matrix = create_zm(n);
  for (const { from, to } of edges) set_edge(matrix, from, to, 1);
  return { matrix, steps };
}