import os
from flask import Flask, render_template, request
import pymongo
import simplejson

app = Flask(__name__)

# this environment variable is set in .env locally (heroku sets it itself
# when I deploy to heroku)
# start with "foreman start" to get that .env value set as a system environment
# variable so that this line can pick it up.
# note also that I probably shouldn't be using my "production" db for local
# testing but what the heck this is a toy anyway
client = pymongo.MongoClient(os.environ['MONGOHQ_URL'])
db = client.get_default_database()
stories = db['stories']

print "starting"
@app.route('/')
def hello():
    return render_template('index.html')

@app.route('/save', methods=['GET', 'POST'])
def save():
    print "you called save"
    story = request.get_json()
    stories.insert(story)
    print "saved"
    # print request.form['ages[3]']
    # print request.form['texts']
    # print request
    return "hello world"

if __name__ == '__main__':
    app.run()

