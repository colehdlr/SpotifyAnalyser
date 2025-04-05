import requests
from bs4 import BeautifulSoup
from transformers import BartTokenizer, BartForConditionalGeneration

tokenizer = BartTokenizer.from_pretrained('facebook/bart-large-cnn')
model = BartForConditionalGeneration.from_pretrained('facebook/bart-large-cnn')

def get_genius_data(artist_name):
    try:
        # Format artist name for Genius URL
        formatted_name = artist_name.replace(' ', '-')
        url = f"https://genius.com/artists/{formatted_name}"

        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }

        # Send HTTP request
        response = requests.get(url, headers=headers)

        # Check if request was successful
        if response.status_code != 200:
            return f"Error: Received status code {response.status_code}"

        soup = BeautifulSoup(response.text, 'html.parser')

        # Find the artist bio section
        summary = soup.find("div", class_="rich_text_formatting")
        print("Summary found:", summary)
        if summary:
            return summary.text.strip()
        else:
            return "No summary found on Genius."

    except Exception as e:
        return f"An error occurred: {str(e)}"

def summarize_artist(artist_name):
    artist_summary1 = get_genius_data(artist_name)
    artist_summary = generate_summary(artist_summary1)
    return artist_summary


def generate_summary(text):
    inputs = tokenizer.encode("summarize" + text, return_tensors="pt", max_length=1024, truncation=True)

    # Modified parameters for shorter summaries
    summary_ids = model.generate(
        inputs,
        max_length=300,
        min_length=10,
        length_penalty=3,
        num_beams=4,
        early_stopping=False
    )

    summary = tokenizer.decode(summary_ids[0], skip_special_tokens=True)
    return summary