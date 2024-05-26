from flask import Flask, request, jsonify, send_file, send_from_directory, url_for, abort, make_response
import os
import io
from PIL import Image
from datetime import datetime
import base64 
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

@app.route('/recent_images')
def get_all_images():
    try:
        directory = 'Server/Generated_Data/data'
        # Check if the directory exists
        if not os.path.exists(directory):
            abort(404, description="Directory not found")
        
        # List files in the directory
        image_files = os.listdir(directory)
        
        # Filter out non-image files (basic filtering, assuming image files have common image extensions)
        valid_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.bmp'}
        image_files = [f for f in image_files if os.path.splitext(f)[1].lower() in valid_extensions]
        
        # If no images are found, return an appropriate message
        if not image_files:
            return jsonify({'message': 'No images found'}), 200
        
        # Generate URLs for each image and reverse the list
        images = [url_for('get_image_source', filename=filename, _external=True) for filename in image_files]
        images.reverse()  # Reverse the list
        
        response = make_response(jsonify({'images': images}), 200)
        response.headers['Cache-Control'] = 'no-store'
        return response

    except Exception as e:
        # Generic error handling, ideally you should log the error
        return jsonify({'error': str(e)}), 500

    
@app.route('/images/<path:filename>')
def get_image_source(filename):
    try:
        directory = 'Generated_Data/data'
        response = send_from_directory(directory, filename)
        response.headers['Cache-Control'] = 'no-store'
        return response
    except FileNotFoundError:
        abort(404, description="File not found")
    except Exception as e:
        # Generic error handling, ideally you should log the error
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)
