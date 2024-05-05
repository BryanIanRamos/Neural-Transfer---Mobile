from flask import Flask, send_file, jsonify, request
import io
from PIL import Image

app = Flask(__name__)

@app.route('/get_image', methods=['GET'])
def get_image():
    # Load the image file
    image_path = "image.jpeg"  # Replace with the actual path to your image
    try:
        with open(image_path, 'rb') as f:
            image_bytes = f.read()
    except FileNotFoundError:
        return 'Image not found', 404

    # Return the image directly
    return send_file(io.BytesIO(image_bytes), mimetype='image/jpeg')

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
