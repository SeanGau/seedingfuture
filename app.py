import flask
import os, shutil, json, hashlib
from datetime import datetime
from PIL import Image
from flask_sqlalchemy import SQLAlchemy

app = flask.Flask(__name__)
app.config.from_object('config')
app.jinja_env.globals['GLOBAL_TITLE'] = "未來種子｜Seeding Future"
app.jinja_env.globals['GLOBAL_VERSION'] = datetime.now().timestamp()
db = SQLAlchemy(app)

for (dirpath, dirnames, filenames) in os.walk("./static/source/bg"):
    for filename in filenames:
        #read the image
        if not os.path.exists("./static/source/bg/thumb/"+filename):            
            im = Image.open("./static/source/bg/"+filename)
            im.thumbnail((2000,2000))
            nim = im.crop((0,0,200,200))
            nim.save("./static/source/bg/thumb/"+filename)
    break

for (dirpath, dirnames, filenames) in os.walk("./static/source"):
    for filename in filenames:
        if filename == "category.json":
            continue
        #read the image
        if not os.path.exists("./static/source/thumb/"+filename):
            im = Image.open("./static/source/"+filename)
            im.thumbnail((150,150))
            im.save("./static/source/thumb/"+filename)
    break
    

@app.route('/works')
def works():
        cb = db.session.execute(f"SELECT * FROM public.collage_datas;").all()
        return flask.render_template('works.html', works_data = cb)


@app.route('/loadfile', methods = ['GET', 'POST'])
def loadfile():
    if flask.request.method == 'POST':
        _data = flask.request.form
        print(_data)
    else:
        return flask.render_template('loadfile.html')

@app.route('/')
def index():    
    source_img = []
    bg_img = []
    for (dirpath, dirnames, filenames) in os.walk("./static/source/bg"):
        for filename in filenames:
            #read the image
            if not os.path.exists("./static/source/bg/thumb/"+filename):            
                im = Image.open("./static/source/bg/"+filename)
                im.thumbnail((2000,2000))
                nim = im.crop((0,0,200,200))
                nim.save("./static/source/bg/thumb/"+filename)

            _dict = {
                "filename": filename,
                "hashed": hashlib.sha1(filename.encode()).hexdigest() 
            }
            bg_img.append(_dict)
        break
    for (dirpath, dirnames, filenames) in os.walk("./static/source"):
        for filename in filenames:
            if filename == "category.json":
                continue
            #read the image
            if not os.path.exists("./static/source/thumb/"+filename):
                im = Image.open("./static/source/"+filename)
                im.thumbnail((150,150))
                im.save("./static/source/thumb/"+filename)
                #        _dict = {                "filename": filename,                "hashed": hashlib.sha1(filename.encode()).hexdigest()             }
            source_img.append(filename)
        break
    
    _category_data = {}
    with open("./static/source/category.json") as json_file:
        _category_data = json.load(json_file)
    for category in _category_data:
        for index in range(len(_category_data[category])):
            img = _category_data[category][index]
            if "." not in img:
                img+=".png"
                _category_data[category][index] = img
            print(img)
            source_img.remove(img)
    _category_data['未分類 Uncategorized'] = source_img
    print(_category_data)
    return flask.render_template('index.html', bgs = bg_img, categories = _category_data)

@app.route('/function/submit', methods = ['POST'])
def submit():
    if flask.request.method == 'POST':
        _data_dict = flask.request.get_json()
        if len(_data_dict['collage']) < 1:
            return "Empty data"

        _data = json.dumps(_data_dict, ensure_ascii=False)
        _sql = f"INSERT INTO public.collage_datas (data) VALUES (\'{_data}\');"
        db.session.execute(_sql)
        db.session.commit()
        return "done"

if __name__ == '__main__':
    # Threaded option to enable multiple instances for multiple user access support
    app.run(threaded=True, port=5000, debug=True)