# 🔧 OCR Troubleshooting Guide

## Issue: "Extracted only 12 characters"

### Root Cause
EasyOCR failed to properly extract text from the image due to:
- Poor image quality
- Low resolution
- Bad lighting/contrast
- Text too small
- Image format issues

---

## Solution Implemented

### 1. Image Preprocessing
```python
def preprocess_image_for_ocr(img):
    # Grayscale conversion
    # OTSU thresholding for better contrast
    # Denoising
    # CLAHE contrast enhancement
```

### 2. Better Error Messages
Now shows:
- Exact character count extracted
- Text preview for debugging
- Specific suggestions

### 3. Fallback Mechanism
- Try with preprocessing first
- If fails, try original image
- Skip low confidence results (<0.3)

---

## Installation

### Install OpenCV (Required for preprocessing)
```bash
pip install opencv-python
```

### Verify Installation
```bash
python -c "import cv2; print(cv2.__version__)"
```

---

## Image Quality Requirements

### ✅ Good Images
- **Resolution**: 1200x1600 or higher
- **DPI**: 300+ for scanned documents
- **Format**: PNG or high-quality JPG
- **Contrast**: Clear black text on white background
- **Lighting**: Even, no shadows
- **Text Size**: Minimum 12pt font

### ❌ Poor Images
- Low resolution (<800px width)
- Blurry or out of focus
- Poor lighting/shadows
- Handwritten text
- Colored backgrounds
- Watermarks over text

---

## Testing Your Image

### Method 1: Check Image Properties
```python
from PIL import Image
img = Image.open('your_report.png')
print(f"Size: {img.size}")  # Should be >1200x1600
print(f"Mode: {img.mode}")  # Should be RGB or L
```

### Method 2: Test OCR Directly
```python
import easyocr
reader = easyocr.Reader(['en'])
results = reader.readtext('your_report.png')
print(f"Detected {len(results)} text blocks")
for bbox, text, conf in results:
    print(f"{text} (confidence: {conf:.2f})")
```

---

## Recommendations

### For Best Results:

1. **Use PDF Instead**
   - PDFs preserve text layer
   - No OCR needed
   - 100% accuracy

2. **Improve Image Quality**
   ```bash
   # Use scanner at 300 DPI
   # Or take photo with good camera in bright light
   # Ensure document is flat and in focus
   ```

3. **Preprocess Image Before Upload**
   ```python
   from PIL import Image, ImageEnhance
   
   img = Image.open('report.jpg')
   
   # Increase contrast
   enhancer = ImageEnhance.Contrast(img)
   img = enhancer.enhance(2.0)
   
   # Increase sharpness
   enhancer = ImageEnhance.Sharpness(img)
   img = enhancer.enhance(2.0)
   
   img.save('report_enhanced.png')
   ```

4. **Use Proper Format**
   - PNG > JPG (lossless)
   - Avoid heavily compressed JPGs
   - Don't use screenshots (use scan/photo)

---

## Debug Steps

### Step 1: Check Logs
```
INFO: OCR extracted X text blocks with preprocessing
INFO: OCR final text length: Y characters, Z lines
```

### Step 2: Check Response
```json
{
  "debug_info": {
    "text_length": 12,
    "text_preview": "..."
  }
}
```

### Step 3: Verify Text Content
If text_preview shows gibberish or wrong characters:
- Image quality is too poor
- Try different image

---

## Alternative Solutions

### Option 1: Manual Entry
If OCR consistently fails:
- Use manual parameter entry forms
- Navigate to specific disease models
- Enter values directly

### Option 2: Use PDF
Convert image to PDF with text layer:
```bash
# Using online tools or:
img2pdf report.png -o report.pdf
```

### Option 3: Improve Scan
- Rescan at higher DPI (300+)
- Use document scanner app on phone
- Ensure good lighting
- Keep document flat

---

## Common Issues

### Issue 1: "Extracted 0 characters"
**Cause**: Image is completely unreadable
**Solution**: 
- Check if image file is corrupted
- Try different image
- Use PDF instead

### Issue 2: "Extracted 12 characters" (very few)
**Cause**: OCR detected only header/footer
**Solution**:
- Crop image to show only report content
- Remove headers/footers/logos
- Increase image resolution

### Issue 3: Wrong values extracted
**Cause**: OCR misread numbers
**Solution**:
- Improve image quality
- Use higher resolution
- Ensure clear contrast

---

## Expected Behavior

### Good OCR Result
```
INFO: OCR extracted 150 text blocks with preprocessing
INFO: OCR final text length: 2450 characters, 45 lines
INFO: Processing 45 lines
INFO: Detected 8 potential table rows
INFO: Final extraction: 12 unique parameters
```

### Poor OCR Result
```
INFO: OCR extracted 3 text blocks with preprocessing
INFO: OCR final text length: 12 characters, 2 lines
INFO: Processing 2 lines
INFO: Detected 0 potential table rows
INFO: Final extraction: 0 unique parameters
```

---

## Quick Fix Checklist

- [ ] Install opencv-python: `pip install opencv-python`
- [ ] Restart backend server
- [ ] Check image resolution (>1200px width)
- [ ] Verify image is clear and readable
- [ ] Try PDF format if available
- [ ] Check backend logs for OCR output
- [ ] Review debug_info in API response

---

## Status

✅ **Image preprocessing added**
✅ **Better error messages**
✅ **Debug info included**
⚠️ **Requires opencv-python installation**
📝 **Recommend using PDF for best results**
