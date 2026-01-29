#!/usr/bin/env python3
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from app import bone_model, hf_model, hf_processor
    print("=== Model Loading Status ===")
    print(f"Bone model loaded: {bone_model is not None}")
    print(f"Bone model type: {type(bone_model) if bone_model else 'None'}")
    print(f"HF model loaded: {hf_model is not None}")
    print(f"HF processor loaded: {hf_processor is not None}")

    if hf_model:
        print(f"HF model config: {hf_model.config}")
        print(f"HF model device: {hf_model.device}")

    print("\n=== Test Complete ===")
except Exception as e:
    print(f"Error testing models: {e}")
    import traceback
    traceback.print_exc()
