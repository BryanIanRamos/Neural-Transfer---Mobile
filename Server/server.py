from flask import Flask, request, jsonify, send_file, send_from_directory
import os
import io
from PIL import Image

import subprocess

# from style_transfer import style_transfer
# from Server.style_transfer import style_transfer


app = Flask(__name__)

UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route('/upload_image', methods=['POST'])
def upload_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No file part'})
    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No selected file'})
    if file:
        filename = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(filename)
        return jsonify({'message': 'File uploaded successfully', 'filename': filename})

@app.route('/get_image', methods=['GET'])
def get_image():
    image_path = os.path.join(os.path.dirname(__file__), "image.png")
    try:
        with open(image_path, 'rb') as f:
            image_bytes = f.read()
    except FileNotFoundError:
        print("Image not found")
        return 'Image not found', 404

    return send_file(io.BytesIO(image_bytes), mimetype='image/png')

@app.route('/get_result', methods=['GET'])
def get_result():
    folder_path = 'Server/data2'
    file_directory = "temp_data"
    temp_filename = "output.png"
    style_img_path = os.path.join(folder_path, 'dancing.jpg')
    content_img_path = os.path.join(folder_path, 'HERO.jpg')

    # Check if the style and content images exist
    if os.path.exists(style_img_path) and os.path.exists(content_img_path):
        # Perform style transfer
        subprocess.run(["python", "Server/style_transfer.py"])

        print(file_directory)
        print(temp_filename)

        return send_from_directory(file_directory, temp_filename)
    else:
        return jsonify({'message': 'Files not found in folder.'}), 404
    

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
