function Mst(m) {
  const n = m.length;
  if (n === 1) return [{ type: "text", text: `Остовное дерево состоит только из вершины ${n_to_l(0)}` }];
  const was = new Array(n).fill(false);
  const mn = new Array(n).fill(Infinity);
  const pr = new Array(n).fill(-1);
  const steps = [{ type: "text", text: `Добавляем вершину ${n_to_l(0)}` }];
  mn[0] = 0;

  for (let i=0; i<n;i++) {
    let q = -1;
    for (let j = 0; j < mn.length; j++) {
      if (!was[j] && (q===-1 ||mn[j] < mn[q])) q = j;
    }
    was[q] = true;
    if (pr[q] !== -1) {
      steps.push({type: "edge",from: pr[q],to: q,
        text: `Добавили ребро ${n_to_l(pr[q])}-${n_to_l(q)}} с весом ${m[pr[q]][q]} и вершину ${n_to_l(q)}.`
      });
    }
    for (let to = 0; to < n; to++) {
      const w = m[q][to];
      if (w !== 0 && !was[to] && w < mn[to]) {
        mn[to] = w;
        pr[to] = q;
      }
    }
  }
  return steps;
}