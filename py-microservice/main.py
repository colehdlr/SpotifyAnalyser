from flask import Flask, jsonify, request
import summarizer
app = Flask(__name__)


@app.route('/artistSummary', methods=['POST'])
def get_artist_summary():
    print("Request received")
    request_data = request.get_json()
    artist_name = request_data['artistName']

    summary_dict = {}
    artist_summary = summarizer.summarize_artist(artist_name)
    summary_dict['artist_summary'] = artist_summary
    return jsonify(summary_dict)


if __name__ == '__main__':
    app.run()