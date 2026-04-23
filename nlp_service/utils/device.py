"""
utils/device.py
---------------
Centralized device management singleton.
Detects GPU/CPU once at startup and provides device info to all services.
"""
import torch
import logging

logger = logging.getLogger(__name__)


class DeviceManager:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialize()
        return cls._instance

    def _initialize(self):
        self.cuda_available = torch.cuda.is_available()
        self.device_str = "cuda" if self.cuda_available else "cpu"
        self.pipeline_device = 0 if self.cuda_available else -1  # for HF pipeline()
        self.torch_device = torch.device(self.device_str)
        self.use_fp16 = self.cuda_available  # half precision only on GPU

        if self.cuda_available:
            gpu_name = torch.cuda.get_device_name(0)
            vram = torch.cuda.get_device_properties(0).total_memory / (1024 ** 3)
            logger.info(f"✅ GPU detected: {gpu_name} ({vram:.1f} GB VRAM)")
            logger.info(f"✅ CUDA version: {torch.version.cuda}")
            logger.info(f"✅ PyTorch version: {torch.__version__}")
        else:
            logger.warning("⚠️  No CUDA GPU detected — running on CPU.")
            logger.info(f"   PyTorch version: {torch.__version__}")

    def info(self) -> dict:
        return {
            "device": self.device_str,
            "cuda_available": self.cuda_available,
            "cuda_device_count": torch.cuda.device_count() if self.cuda_available else 0,
            "gpu_name": torch.cuda.get_device_name(0) if self.cuda_available else "N/A",
            "fp16_enabled": self.use_fp16,
        }


# Module-level singleton — import this everywhere
device_manager = DeviceManager()
