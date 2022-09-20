# [Latent Wavetables](https://latentwt.netlify.app)

An autoencoder for wavetables

This project aims to create a latent space of wavetables, such that exploring them is as easy as hovering over a 2D graph. You can generate wavetable sequences from dragging around the graph.

The model is provided at `public/latentwt.onnx` in ONNX format, and runs in the browser.

## Wavetable licences

The wavetables from the web frontend are from [WaveEdit Online](https://waveeditonline.com/), which are CC0 - any wavetable generated from this tool is also CC0.

## Training

To train the model, you'll need a corpus of wavetable sequences to feed to the model. This project feeds from the [WaveEdit Online](https://waveeditonline.com/), but should be flexible enough to be trained on any other wavetable sequences that you may have.

The `model.py` is a runnable script with a CLI interface that allows you to train and save the model with your own wavetables.

```
usage: model.py [-h] -w WAVETABLES [-W WIDTH] [-d {cuda,cpu}] [-e EPOCHS] output

positional arguments:
  output                Output ONNX model

options:
  -h, --help            show this help message and exit
  -w WAVETABLES, --wavetables WAVETABLES
                        Path to the folder containing wavetable sequence wav files 
  -W WIDTH, --width WIDTH
                        Wavetable width (default: 256)
  -d {cuda,cpu}, --device {cuda,cpu}
                        Use CPU/GPU to compute the model (default is detected) 
  -e EPOCHS, --epochs EPOCHS
                        Number of training epochs (default: 50)
```
