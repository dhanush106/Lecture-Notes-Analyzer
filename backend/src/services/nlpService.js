import axios from 'axios';

class NLPService {
  constructor() {
    this.baseURL = process.env.NLP_SERVICE_URL || 'http://localhost:8000';
    this.timeout = 60000;
  }

  async analyzeText(text) {
    try {
      const response = await axios.post(
        `${this.baseURL}/analyze`,
        { text },
        {
          timeout: this.timeout,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('NLP Service Error:', error.message);

      if (error.code === 'ECONNREFUSED') {
        return {
          success: false,
          error: 'NLP service is not available. Please try again later.'
        };
      }

      if (error.code === 'ETIMEDOUT' || error.response?.status === 408) {
        return {
          success: false,
          error: 'NLP analysis timed out. Please try with shorter text.'
        };
      }

      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to analyze text'
      };
    }
  }

  async performOCR(filePath, mode = "auto") {
    try {
      const FormData = (await import('form-data')).default;
      const fs = (await import('fs')).default;
      
      const form = new FormData();
      form.append('file', fs.createReadStream(filePath));
      form.append('mode', mode);

      const response = await axios.post(
        `${this.baseURL}/ocr`,
        form,
        {
          timeout: this.timeout,
          headers: {
            ...form.getHeaders()
          }
        }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('OCR Service Error:', error.message);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to perform OCR'
      };
    }
  }

  async checkHealth() {
    try {
      const response = await axios.get(`${this.baseURL}/health`, {
        timeout: 5000
      });
      return response.data;
    } catch (error) {
      return { status: 'unavailable', error: error.message };
    }
  }
}

export default new NLPService();