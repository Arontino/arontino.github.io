(function () {
  window.addEventListener("load", loadsait);

  function loadsait() {

    function randomInt(mn,mx) {
      return Math.floor(Math.random()*(mx-mn+1))+mn;
    }

      //Создание массива вершин (n = число вершин). Реализовать: 
      function create_nodes_massive(n){
        const names = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z']
        const nodes_massive =[];
        for (let i=0; i<n; i++) {
          nodes_massive.push({
            id: i,
            label: String(names[i])
          });
        }
        return nodes_massive
      }

      //Создание массива ребер для полного графа (n = число вершин). Реализовать: 
      function create_edges_massive(n){
        const edges_massive = [];
        for (let i=0; i<n-1; i++) {
          for (let j=i+1; j<n; j++) {
            edges_massive.push({from: i, to: j});
            console.log(i,j);
          }
        }
        return edges_massive
      }

      //Создание массива из рандомного количества ребер (n = число вершин). Реализовать: перевод в
      //список смежности для дальнейших переводов в матрицу смежности и инцидентности
      function create_edges_massive_2(n){
        const edges_massive = [];
        for (let i=0; i<n-1; i++) {
          for (let j=i+1; j<n; j++) {
            edges_massive.push({from: i, to: j});
          }
        }

        for (let i = edges_massive.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random()*(i + 1));
          [edges_massive[i], edges_massive[j]] = [edges_massive[j], edges_massive[i]];
        }
        let a =edges_massive.slice(0, randomInt(0,n*(n-1)/2));
        console.log(a)
        return a
      }
      
      let n = 6;
      let mas_nodes = create_nodes_massive(n);
      let mas_edges = create_edges_massive_2(n);

      // create a network
      let container = document.getElementById("mynetwork");
      let data = {
        nodes: mas_nodes,
        edges: mas_edges
      };
      let options = {
        //Редактирование графа пользователем:

        // manipulation: {
        //   editEdge: {
        //     editWithoutDrag: function (data, callback) {
        //       console.info(data);
        //       alert("The callback data has been logged to the console.");
        //       // you can do something with the data here
        //       callback(data);
        //     },
        //   },
        // },
      };
      let network = new vis.Network(container, data, options);




  }




})();




