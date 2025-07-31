import requests
import json
import random
import string
from flask import Flask, request, jsonify
import re 
from urllib.parse import unquote
from datetime import datetime
from flask_cors import CORS
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad, unpad
from base64 import b64encode, b64decode
from flask import Flask, render_template
import subprocess



def decrypt_AES(encrypted_text):
    try:
        encrypted_text = bytes.fromhex(encrypted_text)
        key = b'json'.ljust(32, b'\0')
        iv = b'json'.ljust(16, b'\0')
        cipher = AES.new(key, AES.MODE_CBC, iv)
        encrypted_bytes = b64decode(encrypted_text)
        decrypted = cipher.decrypt(encrypted_bytes)
        unpadded = unpad(decrypted, AES.block_size)
        return unpadded.decode('utf-8')
    except:
        return "error"
app = Flask(__name__)
CORS(app)


@app.route('/')
def home():
    return render_template('index.html')






def random_id():
    return ''.join(random.choices(string.ascii_letters + string.digits, k=24))
headers = {'Cookie': "ndus=YT6MvepteHui8GwDespV3626Ou3yPYjeAw8Dqb7U"}


def add_one(aa):
    pattern = r'([^/, =]+)$'
    matches = re.search(pattern, unquote(aa))
    if matches:
        s = matches.group(0)
        if s[0] != '1':
            s = '1' + s
        return s
    else:
        print("No match found.")
        print(aa)
        
        
        
        
        
def getDownloadLinks(shareid, uk, fsId):
    url = "https://nephobox.com/share/list"
    params = {
      'shareid': str(shareid),
      'uk': str(uk),
      'fid': str(fsId),
      'needsublist': "1",
      'devuid': "6CF3EE84F6F1FBE2C28A6F7FA28C9EA1|V6VYABI4Y",
      'clienttype': "1",
      'channel': "android_13_A063_bd-dubox_1024074a",
      'version': "3.35.3",
      'rand': "82de96e2442f01fc8eccefa053f91a8c17236ff0"
    }
    response = requests.get(url, params=params, headers=headers)
    response_data = response.json()
    list_items = response_data.get('list', [])
    return list_items
    
    




def get_ids2(shareid, uk, fsId):
    api_url = f"https://nephobox.com/share/list?shareid={shareid}&uk={uk}&fid={fsId}&needsublist=1&devuid=081FB72048C3D83568DF05FE3489DC3E|V5P5OIHTP&clienttype=1&channel=android_13_A063_bd-dubox_1024074a&version=3.28.1"
    response = requests.get(api_url)
    response_data = response.json()
    list_items = response_data.get('list', [])
    for result in list_items:
        result.update({"shareid": shareid, "uk": uk})
    return list_items



def GetM3U8Data(shareid, uk, fid):
    url = "https://www.terabox.app/share/streaming"
    params = {
        'uk': uk,
        'shareid': shareid,
        'fid': fid,
        'type': "M3U8_FLV_264_480",
        'sign': random_id(),
        'timestamp': datetime.now().strftime("%s"),
        'clienttype': "1",
        'channel': "dubox"}
    response = requests.get(url, params=params)
    return response.text


def getPopularCh():
    dataList = []
    jsonData = requests.post("https://codebeautify.com/URLService", headers={'origin': 'https://jsonformatter.org'}, data={'path': "https://nephobox.com/group/theme/list"}).json().get("data").get("list")
    for item in jsonData:
        cJson = {"t": item.get("theme_name"),
        "d": item.get("theme_desc"),
        "i": item.get("theme_icon_url"),
        "ut": item.get("update_time"),
        "u": item.get("url")}
        dataList.append(cJson)
    return dataList


def Search(keyword):
    payload = {'key_word': keyword}
    headers = {'Cookie': "ndus=YT17ZeyteHui0Zh_-zlhnTLJCmYvqB-_QbHJVNoO"}
    response = requests.post("https://nephobox.com/group/resource/search", data=payload, headers=headers).json()
    return response

    
    
@app.route("/stream.m3u8", methods=['GET'])
def stream():
    try:
        data = json.loads(decrypt_AES(request.args.get('data', "")))
        data = GetM3U8Data(data["shareid"], data["uk"], data["fs_id"])
        return data, 200, {'Content-Type': 'application/vnd.apple.mpegurl'}
    except Exception as e:
        return jsonify({'Error': str(e)}), 500

@app.route("/download", methods=['GET'])
def getDownloadUrls():
    try:
        data = json.loads(decrypt_AES(request.args.get('data', "")))
        if data:
            data = getDownloadLinks(data["shareid"], data["uk"], data["fs_id"])
            if data:
                cjson = {"downloadUrl": data[0].get("dlink"), "downloadUrlV2": data[0].get("dlink").replace("https://d.nephobox.com", "https://d8.freeterabox.com")}
                return jsonify(cjson), 200
            else:
                return jsonify({'Error': 'No download link found'}), 404
        else:
            return jsonify({'Error': 'Missing parameters'}), 404
    except Exception as e:
        return jsonify({'Error': str(e)}), 500

@app.route("/themes", methods=['GET'])
def getChannels():
    try:
        channelsJson = getPopularCh()
        return jsonify(channelsJson), 200
    except Exception as e:
        return jsonify({'Error': str(e)}), 500


@app.route("/search", methods=['GET', 'POST'])
def SearchEngine():
    try:
        keyword = request.args.get('q', "")
        data = Search(keyword)
        return jsonify(data), 200
    except Exception as e:
        return jsonify({'Error': str(e)}), 500
        


@app.route("/list", methods=['GET', 'POST'])
def Lshorturlinfo():
    try:
        shareid = request.args.get('shareid', "")
        uk = request.args.get('uk', "")
        fsId = request.args.get('fsId', "")
        data = get_ids2(shareid, uk, fsId)
        return jsonify(data), 200
    except Exception as e:
        return jsonify({'Error': str(e)}), 500

@app.route("/shorturlinfo", methods=['GET', 'POST'])
def shorturlinfo():
    url = add_one(decrypt_AES(request.args.get('url')))
    url = "https://nephobox.com/api/shorturlinfo?root=1&shorturl=" + url+ "&devuid=081FB72048C3D83568DF05FE3489DC3E|V5P5OIHTP&clienttype=1&channel=android_13_A063_bd-dubox_1024074a&version=3.28.1"
    response = requests.get(url)
    response_data = response.json()
    data = response_data.get('list', []), response_data.get("shareid", "0"), response_data.get("uk", "0")
    return jsonify(data), 200



if __name__ == "__main__":
    subprocess.run(["termux-open", "http://localhost:3000/"])
    app.run(port=3000, host='0.0.0.0', debug=True)
    
