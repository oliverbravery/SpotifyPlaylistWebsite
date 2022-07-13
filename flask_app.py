import json
import requests
from flask import Flask, make_response, request
from flask_cors import CORS, cross_origin
import hashlib
import datetime
from dotenv import load_dotenv
import os

app = Flask(__name__)
cors = CORS(app, resources={r"/api/*": {"origins": "*"}})

load_dotenv('.env')
refreshToken = os.environ["refreshToken"]
storedPassword = os.environ["storedPassword"]
client_id = os.environ["client_id"]
client_secret = os.environ["client_secret"]

def CheckIfCookieValid(givenCookieValue):
    minOfRequest = datetime.datetime.now().minute
    for i in range(0, 15): #for 30min gap
        valueToInput = (minOfRequest - i) % 60
        hashedStoredPassword = hashlib.sha256((storedPassword + str(valueToInput)).encode()).hexdigest()
        if hashedStoredPassword == givenCookieValue:
            return True

def GetSpotifyToken():
    x = requests.post("https://accounts.spotify.com/api/token", {
        "client_secret":client_secret,
        "client_id":client_id,
        "grant_type":"refresh_token",
        "refresh_token":refreshToken},
                      headers={"Content-Type": "application/x-www-form-urlencoded"})
    jsonRes = json.loads(x.text)
    tok = f"Bearer {str(jsonRes['access_token'])}"
    return tok


@app.route("/GetAccessToken", methods=["GET"])
@cross_origin(supports_credentials=True)
def GetAccessToken():
    givenCookie = request.args.get('cookie')
    if CheckIfCookieValid(givenCookie):
        tempVal = GetSpotifyToken()
        return tempVal
    else:
        return "-1"


@app.route("/Login", methods=["GET"])
@cross_origin(supports_credentials=True)
def LoginFunc():
    givenPassword = request.args.get('password')
    passwordIsEqual = False
    minOfRequest = datetime.datetime.now().minute
    for i in range(-1, 2):
        hashedStoredPassword = hashlib.sha256((storedPassword + str(minOfRequest + i)).encode()).hexdigest()
        if hashedStoredPassword == givenPassword:
            passwordIsEqual = True
    if(passwordIsEqual):
        response = make_response(f"ThePasswordString={givenPassword}")
        return response
    else:
        return "-1"