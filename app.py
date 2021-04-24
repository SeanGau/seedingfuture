import flask
import os, json, hashlib
from flask_sqlalchemy import SQLAlchemy

app = flask.Flask(__name__)
app.jinja_env.globals['GLOBAL_TITLE'] = "Seeding Future Collage"
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ['DATABASE_URL'].replace("postgres://","postgresql://")
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {'encoding': 'utf-8', 'json_serializer': lambda obj: obj, 'echo': False}
db = SQLAlchemy(app)

source_img = []
for (dirpath, dirnames, filenames) in os.walk("./static/source"):
    for filename in filenames:
        _dict = {
            "filename": filename,
            "hashed": hashlib.sha1(filename.encode()).hexdigest() 
        }
        source_img.append(_dict)
    break

print(source_img)

@app.route('/')
def index():
    return flask.render_template('index.html', sources = source_img)

@app.route('/function/submit', methods = ['POST'])
def submit():
    if flask.request.method == 'POST':
        _data_dict = flask.request.get_json()
        _data = json.dumps(_data_dict, ensure_ascii=False).replace('\'','\"').replace('%','%%')
        _sql = f"INSERT INTO collages.\"collage-datas\"(data) VALUES (\'{_data}\');"
        db.session.execute(_sql)
        db.session.commit()
        return "done"

if __name__ == '__main__':
    # Threaded option to enable multiple instances for multiple user access support
    app.run(threaded=True, port=5000, debug=True)