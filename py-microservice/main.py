from flask import Flask, jsonify, request
import summarizer
app = Flask(__name__)


@app.route('/artistSummary', methods=['POST'])
def get_artist_summary():
    print("Request received")
    print(request.data)
    request_data = request.get_json()
    print(request_data)
    artist_id = request_data['artistID']
    artist_name = request_data['artistName']
    print(artist_id)

    summary_dict = {}


    artist_summary = summarizer.summarize_artist(artist_name)
    summary_dict['artist_summary'] = artist_summary
    print("Artist summary generated")
    print(artist_summary)

    return jsonify(summary_dict)


# main driver function
if __name__ == '__main__':
    app.run()