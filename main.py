from flask import Flask, render_template,request,request,jsonify
from py.algorithm_deep import algorithm_deep

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')        #Создание html страницы

@app.route('/get_deep', methods=['POST'])       #Принимает post запрос от deep
def get_deep():
    inp = request.json.get('key', '')
    res = algorithm_deep(inp)                   #Достоет данные, отправляет функции в другом файле питона и полученный ответ возращает в виде списка
    return jsonify({'res': res})

if __name__ == "__main__":
    app.run(debug=True)