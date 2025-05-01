from flask import Flask, jsonify, request
from flask_cors import CORS
import summarizer
import logging
import sys
import traceback

app = Flask(__name__)
CORS(app)

# Set up basic logging to stdout
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    stream=sys.stdout
)
logger = logging.getLogger(__name__)

@app.route('/artistSummary', methods=['POST'])
def get_artist_summary():
    try:
        logger.info("Request received for artist summary")
        request_data = request.get_json()
        artist_name = request_data['artistName']
        logger.info(f"Processing request for artist: {artist_name}")

        summary_dict = {}
        artist_summary = summarizer.summarize_artist(artist_name)
        summary_dict['artist_summary'] = artist_summary
        
        logger.info(f"Successfully processed request for {artist_name}")
        return jsonify(summary_dict)
        
    except Exception as e:
        logger.error(f"Error processing request: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
