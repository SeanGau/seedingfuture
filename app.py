import flask
import os, shutil, json, hashlib
from PIL import Image
from flask_sqlalchemy import SQLAlchemy

app = flask.Flask(__name__)
app.jinja_env.globals['GLOBAL_TITLE'] = "未來種子｜Seeding Future"
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ['DATABASE_URL'].replace("postgres://","postgresql://")
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {'encoding': 'utf-8', 'json_serializer': lambda obj: obj, 'echo': False}
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

source_img = []
bg_img = []
try:
    shutil.rmtree("./static/source/bg/thumb")
    shutil.rmtree("./static/source/thumb")
except:
    print("dir_error")
os.mkdir("./static/source/bg/thumb")
os.mkdir("./static/source/thumb")

for (dirpath, dirnames, filenames) in os.walk("./static/source/bg"):
    for filename in filenames:
        #read the image
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
        #read the image
        im = Image.open("./static/source/"+filename)
        im.thumbnail((200,200))
        im.save("./static/source/thumb/"+filename)

        _dict = {
            "filename": filename,
            "hashed": hashlib.sha1(filename.encode()).hexdigest() 
        }
        source_img.append(_dict)
    break

@app.route('/')
def index():
    return flask.render_template('index.html', sources = source_img, bgs = bg_img)

@app.route('/function/submit', methods = ['POST'])
def submit():
    if flask.request.method == 'POST':
        _data_dict = flask.request.get_json()
        if len(_data_dict['collage']) < 1:
            return "Empty data"

        _data = json.dumps(_data_dict, ensure_ascii=False).replace('\'','\"').replace('%','%%')
        _sql = f"INSERT INTO collages.\"collage-datas\"(data) VALUES (\'{_data}\');"
        db.session.execute(_sql)
        db.session.commit()
        return "done"

if __name__ == '__main__':
    # Threaded option to enable multiple instances for multiple user access support
    app.run(threaded=True, port=5000, debug=True)