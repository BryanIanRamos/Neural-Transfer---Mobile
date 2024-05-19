from flask import Flask, request, jsonify, send_file, send_from_directory
import os
import io
from PIL import Image

import subprocess

from style_transfer import perform_style_transfer

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
    if request.method == 'GET':
        image_path = 'Generated_Data/temp_data/output.png'
        return send_file(image_path, mimetype='image/png')
    else:
        return 'Method Not Allowed', 405

@app.route('/print_info', methods=['POST'])
def print_info():
    # Get the values from the request
    name = request.form.get('name')
    age = request.form.get('age')
    sex = request.form.get('sex')

    # Pass the values to the other file to be printed
    # style_transfer.print_info(name, age, sex)

    return jsonify({'message': 'Information received and printed successfully'})

# Define the route for performing style transfer
@app.route('/perform_style_transfer', methods=['POST'])
def perform_style_transfer_route():
    # Check if files are in the request
    if 'content_img' not in request.files:
        return jsonify({"error": "Content image is required."}), 400
    if 'style_img' not in request.files:
        return jsonify({"error": "Style image is required."}), 400
    
    # Get the content and style images from the request
    content_img = request.files['content_img']
    style_img = request.files['style_img']
    imgSize = int(request.form['img_size'])
    transSteps = int(request.form['num_steps'])

    print("imgSize:", imgSize)
    print("transSteps:", transSteps)

    # Check if file names are empty
    if content_img.filename == '':
        return jsonify({"error": "Content image file name is empty."}), 400
    if style_img.filename == '':
        return jsonify({"error": "Style image file name is empty."}), 400

    # Define output folder where the generated image will be saved
    output_folder = "Server/Generated_Data"

    # Call the perform_style_transfer function
    perform_style_transfer(content_img, style_img, output_folder, imgSize, transSteps)

    # Return success response
    return jsonify({"message": "Style transfer completed successfully."})

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
