import torch
import torch.nn as nn
import torch.nn.functional as F
import torch.optim as optim
import os
import uuid
import glob

from PIL import Image
from datetime import datetime
from torchvision import transforms
import matplotlib.pyplot as plt

import torchvision.transforms as transforms
from torchvision.models import vgg19, VGG19_Weights

import copy

def perform_style_transfer(content_img_path, style_img_path, output_folder, imsize=128, num_steps=100, style_weight=1000000, content_weight=1):

    # Load images
    content_img = image_loader(content_img_path, imsize)
    style_img = image_loader(style_img_path, imsize)
    
    # Check if images have been loaded successfully
    assert content_img.size() == style_img.size(), "Content and style images must have the same size"
    
    # Initialize VGG19 model
    cnn = vgg19(weights=VGG19_Weights.DEFAULT).features.eval()
    
    # Define normalization parameters
    cnn_normalization_mean = torch.tensor([0.485, 0.456, 0.406])
    cnn_normalization_std = torch.tensor([0.229, 0.224, 0.225])
    
    # Define content and style layers
    content_layers_default = ['conv_4']
    style_layers_default = ['conv_1', 'conv_2', 'conv_3', 'conv_4', 'conv_5']
    
    # Perform style transfer
    output_img = run_style_transfer(cnn, cnn_normalization_mean, cnn_normalization_std,
                                    content_img, style_img, imsize, num_steps, style_weight, content_weight)
    
    # Save output image
    save_image(output_img, output_folder)

def image_loader(path, imsize):
    image = Image.open(path)
    loader = transforms.Compose([
        transforms.Resize((imsize, imsize)),  # Resize images to desired size
        transforms.ToTensor()  # Convert images to tensors
    ])
    image = loader(image).unsqueeze(0)  # Add batch dimension
    return image

def run_style_transfer(cnn, normalization_mean, normalization_std, content_img, style_img,
                       imsize, num_steps, style_weight, content_weight):
    # Define normalization module
    normalization = Normalization(normalization_mean, normalization_std)

    # Get style model and losses
    model, style_losses, content_losses = get_style_model_and_losses(cnn, normalization,
                                                                     style_img, content_img)

    # Initialize input image
    input_img = content_img.clone().requires_grad_(True)

    # Initialize optimizer
    optimizer = optim.LBFGS([input_img])

    # Run style transfer optimization
    run = [0]
    while run[0] <= num_steps:

        def closure():
            # Correct values of updated input image
            input_img.data.clamp_(0, 1)

            optimizer.zero_grad()
            model(input_img)
            style_score = 0
            content_score = 0

            for sl in style_losses:
                style_score += sl.loss
            for cl in content_losses:
                content_score += cl.loss

            style_score *= style_weight
            content_score *= content_weight

            loss = style_score + content_score
            loss.backward()

            run[0] += 1
            if run[0] % 50 == 0:
                print("Step {}:".format(run[0]))
                print('Style Loss : {:4f} Content Loss: {:4f}'.format(
                    style_score.item(), content_score.item()))
                print()

            return style_score + content_score

        optimizer.step(closure)

    # Clamp values of input image
    input_img.data.clamp_(0, 1)

    return input_img

def save_image(output_img, output_folder):
    # Convert tensor to PIL image
    output_img_pil = transforms.ToPILImage()(output_img.squeeze(0).cpu())

    # Define the path to the Generated_data folder
    data_folder = os.path.join(output_folder, "data")
    temp_folder = os.path.join(output_folder, "temp_data")

    # Create the Generated_data folder if it doesn't exist
    os.makedirs(data_folder, exist_ok=True)
    os.makedirs(temp_folder, exist_ok=True)

    # Generate a unique filename using timestamp
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    filename = f"output_{timestamp}.png"

    # Save the output image in the Generated_data folder
    output_img_path = os.path.join(data_folder, filename)
    output_img_pil.save(output_img_path)
    print(f"Image saved in Generated_data folder: {output_img_path}")

    # Define the filename for the output image
    filename = "output.png"

    # Save the output image in the temp folder, overriding existing file if present
    temp_file_path = os.path.join(temp_folder, filename)
    output_img_pil.save(temp_file_path)
    print(f"Image saved in temporary file: {temp_file_path}")


def get_style_model_and_losses(cnn, normalization, style_img, content_img,
                               content_layers=['conv_4'], style_layers=['conv_1', 'conv_2', 'conv_3', 'conv_4', 'conv_5']):
    model = nn.Sequential(normalization)
    style_losses = []
    content_losses = []

    i = 0
    for layer in cnn.children():
        if isinstance(layer, nn.Conv2d):
            i += 1
            name = f'conv_{i}'
        elif isinstance(layer, nn.ReLU):
            name = f'relu_{i}'
            layer = nn.ReLU(inplace=False)
        elif isinstance(layer, nn.MaxPool2d):
            name = f'pool_{i}'
        elif isinstance(layer, nn.BatchNorm2d):
            name = f'bn_{i}'
        else:
            raise RuntimeError(f'Unrecognized layer: {layer.__class__.__name__}')

        model.add_module(name, layer)

        if name in content_layers:
            target = model(content_img).detach()
            content_loss = ContentLoss(target)
            model.add_module(f'content_loss_{i}', content_loss)
            content_losses.append(content_loss)

        if name in style_layers:
            target_feature = model(style_img).detach()
            style_loss = StyleLoss(target_feature)
            model.add_module(f'style_loss_{i}', style_loss)
            style_losses.append(style_loss)

    return model, style_losses, content_losses

class Normalization(nn.Module):
    def __init__(self, mean, std):
        super(Normalization, self).__init__()
        self.mean = torch.tensor(mean).view(-1, 1, 1)
        self.std = torch.tensor(std).view(-1, 1, 1)

    def forward(self, img):
        return (img - self.mean) / self.std

class ContentLoss(nn.Module):
    def __init__(self, target):
        super(ContentLoss, self).__init__()
        self.target = target.detach()

    def forward(self, input):
        self.loss = F.mse_loss(input, self.target)
        return input

class StyleLoss(nn.Module):
    def __init__(self, target_feature):
        super(StyleLoss, self).__init__()
        self.target = gram_matrix(target_feature).detach()

    def forward(self, input):
        G = gram_matrix(input)
        self.loss = F.mse_loss(G, self.target)
        return input

def gram_matrix(input):
    a, b, c, d = input.size()
    features = input.view(a * b, c * d)
    G = torch.mm(features, features.t())
    return G.div(a * b * c * d)


# Define your perform_style_transfer function here

# # Call the function for testing
# if __name__ == "__main__":
#     # Define paths to content and style images
#     content_img_path = "Server/data2/HERO.png"
#     style_img_path = "Server/data2/picasso.jpg"

#     # content_img_path = "data2/HERO.jpg"
#     # style_img_path = "data2/picasso.jpg"

#     # Define output folder where the generated image will be saved
#     output_folder = "temp_data"

#     # Call the perform_style_transfer function
#     perform_style_transfer(content_img_path, style_img_path, output_folder)
