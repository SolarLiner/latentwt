import argparse
import json
from pathlib import Path
from typing import Any

import numpy as np
import numpy.typing as npt
from scipy.io import wavfile
import torch
from torch import nn
from tqdm import tqdm

class WavetableAE(nn.Module):
    def __init__(self):
        super().__init__()
        self.encoder = nn.Sequential(
            nn.Linear(256, 64),
            nn.LeakyReLU(),
            nn.Linear(64, 8),
            nn.LeakyReLU(),
            nn.Linear(8, 2),
            nn.Sigmoid(),
        )
        self.decoder = nn.Sequential(
            nn.Linear(2, 8),
            nn.LeakyReLU(),
            nn.Linear(8, 64),
            nn.LeakyReLU(),
            nn.Linear(64, 256),
        )
        
    def forward(self, x):
        return self.decoder(self.encoder(x))

arr1 = np.ndarray[int, np.dtype[np.float32]]
arr2 = np.ndarray[tuple[int, int], np.dtype[np.float32]]

def coerce_audio_to_float(samples: npt.NDArray[Any]) -> arr1:
    match samples.dtype:
        case np.uint8: return samples.astype(np.float32) / 255
        case np.uint16: return samples.astype(np.float32) / (2**15) - 1
        case np.uint32: return samples.astype(np.float32) / (2**31) - 1
        case np.int8: return samples.astype(np.float32) / 127
        case np.int16: return samples.astype(np.float32) / (2**16-1)
        case np.int32: return samples.astype(np.float32) / (2**32-1)
        case _: return samples.astype(np.float32)

def readfile(path: Path):
    _, data = wavfile.read(path)
    return np.atleast_2d(coerce_audio_to_float(data)).sum(axis=0)

def fold_wavetables(wt: arr1, length=256) -> arr2:
    return wt.reshape((-1, length))

def load_wavetables(folder: Path, length=256) -> arr2:
    data = [readfile(p) for p in folder.glob("*.wav")]
    return np.concatenate([fold_wavetables(x, length) for x in data if x.shape[0] % length == 0], axis=0)

if __name__ == "__main__":
    p = argparse.ArgumentParser(formatter_class=argparse.ArgumentDefaultsHelpFormatter)
    p.add_argument("-w", "--wavetables", type=Path, help="Path to the folder containing wavetable sequence wav files", required=True)
    p.add_argument("-W", "--width", type=int, default=256, help="Wavetable width")
    p.add_argument("-d", "--device", choices=["cuda", "cpu"], default="cuda" if torch.cuda.is_available() else "cpu", help="Use CPU/GPU to compute the model (default is detected)")
    p.add_argument("-e", "--epochs", type=int, default=50, help="Number of training epochs")
    p.add_argument("output", type=Path, default="public/latentwt.onnx", help="Output ONNX model")

    args = p.parse_args()

    data = load_wavetables(args.wavetables, args.width)

    device = torch.device(args.device)
    model = WavetableAE().to(device)
    criterion = nn.MSELoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=1e-2, weight_decay=1e-8)
    losses = []
    batch_data = torch.from_numpy(data.reshape((-1, 64, 256))).float().to(device)

    for _ in tqdm(range(args.epochs)):
        loss = torch.zeros((1,)).to(device)
        for batch in batch_data:
            optimizer.zero_grad()
            x = model(batch)
            l = criterion(batch, x)
            l.backward()
            loss += l
            optimizer.step()
            losses.append(loss.item())
        tqdm.write(str(loss.item() / len(batch_data)))

    dummy_input = torch.zeros(2, device=device)
    torch.onnx.export(model.decoder, dummy_input, args.output, input_names=["pos"], output_names=["wavetable"])

    with (args.output.parent / "wavetables.json").open("wt") as f:
        with torch.no_grad():
            selection = data[np.random.choice(len(data), 100)]
            x = model.encoder(torch.from_numpy(selection).float().to(device)).cpu().numpy()
        save_data = list(zip(selection.tolist(), x.tolist()))
        json.dump(save_data, f)