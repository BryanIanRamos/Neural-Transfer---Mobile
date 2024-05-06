import os
from flask import Flask, send_file, jsonify, request
import io
from PIL import Image
import subprocess

app = Flask(__name__)

# Specify the full path to the image file relative to the script
image_folder = os.path.join(os.path.dirname(__file__), "data")

@app.route('/get_image', methods=['GET'])
def get_image():
    image_path = os.path.join(image_folder, "image.png")
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

@app.route('/upload_image', methods=['POST'])
def upload_image():
    if 'file' not in request.files:
        return 'No file part', 400
    file = request.files['file']
    if file.filename == '':
        return 'No selected file', 400
    if file:
        filename = 'image.png'
        file_path = os.path.join(image_folder, filename)
        file.save(file_path)
        try:
            subprocess.run(["jupyter", "nbconvert", "--execute", "neural_transfer.pynb"])
            processed_image_url = '/processed_image'  # URL of the processed image
            return jsonify({"message": "Image uploaded and neural transfer executed successfully", "processed_image_url": processed_image_url}), 200
        except Exception as e:
            print("Error running neural transfer:", e)
            return 'Error running neural transfer', 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)
