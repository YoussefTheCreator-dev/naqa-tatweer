"""
Run with Python 3.11:  py -3.11 convert_palm_to_onnx.py
Converts palm_model.keras → palm_model.onnx for use with onnxruntime on Python 3.14.
"""
import sys
from pathlib import Path

ROOT = Path(__file__).parent.parent
KERAS_PATH = ROOT / "palm_model.keras"
ONNX_PATH = ROOT / "palm_model.onnx"

print(f"Loading {KERAS_PATH} ...")
import tensorflow as tf
model = tf.keras.models.load_model(str(KERAS_PATH))
model.summary()

print(f"\nConverting to ONNX -> {ONNX_PATH} ...")
import tf2onnx
import numpy as np

input_signature = [tf.TensorSpec(shape=(None, 224, 224, 3), dtype=tf.float32, name="input")]
onnx_model, _ = tf2onnx.convert.from_keras(model, input_signature=input_signature, opset=13)

import onnx
onnx.save(onnx_model, str(ONNX_PATH))
print(f"Saved: {ONNX_PATH}  ({ONNX_PATH.stat().st_size // 1024 // 1024} MB)")

# Quick sanity check with onnxruntime
import onnxruntime as ort
sess = ort.InferenceSession(str(ONNX_PATH))
dummy = np.zeros((1, 224, 224, 3), dtype=np.float32)
out = sess.run(None, {"input": dummy})
print(f"Test inference output shape: {out[0].shape}  values: {out[0]}")
print("Done.")
