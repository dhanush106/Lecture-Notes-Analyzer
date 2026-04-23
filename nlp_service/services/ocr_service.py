import cv2
import numpy as np
import easyocr
import logging
import os
from PIL import Image
from typing import Dict, Tuple

logger = logging.getLogger(__name__)

class OCRService:
    def __init__(self):
        logger.info("Initializing EasyOCR reader...")
        self.reader = easyocr.Reader(['en'], gpu=os.getenv("USE_GPU", "True") == "True")
        logger.info("EasyOCR reader initialized")

    def preprocess_image(self, image_path: str, mode: str = "auto") -> Tuple[np.ndarray, Dict]:
        # Load image
        img = cv2.imread(image_path)
        if img is None:
            raise ValueError("Could not read image")

        # Convert to grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Quality detection (Blur detection)
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
        is_blurry = laplacian_var < 100
        
        # Stats for response
        stats = {
            "original_resolution": f"{img.shape[1]}x{img.shape[0]}",
            "sharpness_score": laplacian_var,
            "detected_blur": is_blurry
        }

        if mode == "auto":
            if is_blurry:
                mode = "blur_enhancement"
            else:
                mode = "basic"

        processed = gray
        
        if mode == "blur_enhancement":
            # Denoise
            processed = cv2.fastNlMeansDenoising(processed, None, 10, 7, 21)
            # Sharpen
            kernel = np.array([[-1,-1,-1], [-1,9,-1], [-1,-1,-1]])
            processed = cv2.filter2D(processed, -1, kernel)
            # Contrast
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
            processed = clahe.apply(processed)
        
        elif mode == "noise_removal":
            processed = cv2.medianBlur(processed, 3)
            processed = cv2.fastNlMeansDenoising(processed, None, 15, 7, 21)
            
        elif mode == "basic":
            # Simple thresholding or just grayscale
            _, processed = cv2.threshold(processed, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

        return processed, stats

    def extract_text(self, image_path: str, mode: str = "auto") -> Dict:
        try:
            processed_img, stats = self.preprocess_image(image_path, mode)
            
            # Temporary save for debugging or passing to reader if needed (EasyOCR accepts ndarray)
            results = self.reader.readtext(processed_img)
            
            text = " ".join([res[1] for res in results])
            
            return {
                "success": True,
                "text": text,
                "stats": stats,
                "mode_used": mode
            }
        except Exception as e:
            logger.error(f"OCR extraction failed: {e}")
            return {
                "success": False,
                "error": str(e)
            }

ocr_service = OCRService()
