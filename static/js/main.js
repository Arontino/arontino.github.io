
(function () {
  window.addEventListener("load", loadsait);
  function loadsait() {                                                         //После загрузки сайта
    document.getElementById('myButton').addEventListener('click', function() {  //Навесит на кнопку вызов функции при нажатии на неё
        algorithm_deep();
    });
  }
})();




