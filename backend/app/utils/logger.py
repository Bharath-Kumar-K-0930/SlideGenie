import logging
import sys
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger("slidegenie")

def log_request(endpoint: str, status: str, duration_ms: float = 0):
    """Log API request details"""
    logger.info(f"API Request: {endpoint} | Status: {status} | Duration: {duration_ms:.2f}ms")

def log_error(error: Exception, context: str = ""):
    """Log error with context"""
    logger.error(f"Error in {context}: {str(error)}", exc_info=True)

def log_ai_usage(model: str, tokens: int = 0):
    """Log AI API usage for cost tracking"""
    logger.info(f"AI Usage: Model={model} | Tokens={tokens}")
