async function algorithm_deep() {                       //асинхронная функция - выполнение на фоне
    const area = document.getElementById('textarea1');  //Сохранение поля и взятие его значение
    const text = area.value;
    try {
        const response = await fetch('/get_deep', {     //Отправка файла json в основной питон файл. Подумать как сделать через url_for
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',     //Определение типа отправляемого типа
            },
            body: JSON.stringify({key: text})           //Отправляемые данные (ключ-значение)
        });
        const data = await response.json();             //Ожидание ответа, а после замена
        area.value = data.res;
    }
    catch{                                              //В случае ошибки, дописать

    }
}