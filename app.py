import flask
import hashlib
from os import walk
app = flask.Flask(__name__)
app.jinja_env.globals['GLOBAL_TITLE'] = "Seeding Future 產生器"

source_img = []
for (dirpath, dirnames, filenames) in walk("./static/source"):
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

if __name__ == '__main__':
    # Threaded option to enable multiple instances for multiple user access support
    app.run(threaded=True, port=5000, debug=True)