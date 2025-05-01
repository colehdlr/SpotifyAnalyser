import requests
from bs4 import BeautifulSoup
import re
from urllib.parse import quote
from transformers import BartTokenizer, BartForConditionalGeneration
tokenizer = BartTokenizer.from_pretrained('facebook/bart-large-cnn')
model = BartForConditionalGeneration.from_pretrained('facebook/bart-large-cnn')

def get_wiki_url(artist_name):
    """
    Converts artist name to a Wikipedia URL.
   
    Args:
        artist_name (str): Name of the artist
       
    Returns:
        str: Wikipedia URL for the artist
    """
    # replace spaces with underscores and URL encode the name
    formatted_name = quote(artist_name.replace(' ', '_'))
    return f"https://en.wikipedia.org/wiki/{formatted_name}"
 
def scrape_artist_info(artist_name):
    """
    Scrapes artist information from Wikipedia, extracting paragraphs from after
    the infobox until the next heading.
   
    Args:
        artist_name (str): Name of the artist
   
    Returns:
        str: The extracted artist information
    """
    # generate the Wikipedia URL
    artist_url = get_wiki_url(artist_name)
    print(f"Retrieving data from: {artist_url}")
   
    # request page
    response = requests.get(artist_url)
    if response.status_code != 200:
        print(f"Failed to retrieve page: Status code {response.status_code}")
        return ""
   
    # parse HTML content
    soup = BeautifulSoup(response.text, 'html.parser')
   
    # find the infobox - try different possible infobox classes
    infobox = None
    possible_infobox_classes = [
        {'class_': 'infobox biography vcard'},
        {'class_': 'infobox vcard'},
        {'class_': 'infobox'},
        {'class_': 'wikitable'}
    ]
   
    for class_dict in possible_infobox_classes:
        infobox = soup.find('table', **class_dict)
        if infobox:
            break
   
    if not infobox:
        # If no table-based infobox is found, try to start from the first paragraph
        parser_output = soup.find('div', {'class': 'mw-parser-output'})
        if parser_output:
            first_p = parser_output.find('p', recursive=False)
            if first_p:
                infobox = first_p.find_previous()
            else:
                print("No artist infobox or initial paragraph found on this page.")
                return ""
        else:
            print("Could not find main content area.")
            return ""
   
    # get all paragraphs after the infobox until the next heading
    content = []
    current_element = infobox.find_next('p')
 
    while current_element and not current_element.name.startswith('h'):
        if current_element.name == 'p' and current_element.text.strip():
            content.append(current_element.text.strip())
        current_element = current_element.find_next()
   
    info_text = '\n\n'.join(content)
   
    # clean up text - remove citation brackets [1], [2]
    info_text = re.sub(r'\[\d+\]', '', info_text)
 
    if not info_text:
        print("No relevant information found after the infobox.")
        return ""
   
    return info_text
 
def summarize_artist(artist_name):
    web_scraped_data = scrape_artist_info(artist_name)
    if len(web_scraped_data) ==  0:
        return "No summary available."
    artist_summary = generate_summary(web_scraped_data)
    return artist_summary
 
def generate_summary(text):
    inputs = tokenizer.encode("summarize " + text, return_tensors="pt", max_length=1024)
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
