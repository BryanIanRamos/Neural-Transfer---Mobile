from flask import Flask, send_file, jsonify, request
import io
from PIL import Image
import os

app = Flask(__name__)

# Specify the full path to the image file relative to the script
image_path = os.path.join(os.path.dirname(__file__), "image.png")

@app.route('/get_image', methods=['GET'])
def get_image():
    print("Image Path:", image_path)
    try:
        with open(image_path, 'rb') as f:
            image_bytes = f.read()
    except FileNotFoundError:
        print("Image not found")
        return 'Image not found', 404

    return send_file(io.BytesIO(image_bytes), mimetype='image/png')

@app.route('/get_data', methods=['GET'])
def get_data():
    data = {
        'name': 'John Doe',
        'age': 30,
        'city': 'New York'
    }
    return jsonify(data)

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)
