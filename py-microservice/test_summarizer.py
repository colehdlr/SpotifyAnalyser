import unittest
from unittest.mock import patch, MagicMock

from summarizer import get_wiki_url, scrape_artist_info, summarize_artist, generate_summary

class test_summarizer(unittest.TestCase):

    def test_get_wiki_url(self):
        # Test the URL formatting function
        test_cases = [
            ("Taylor Swift", "https://en.wikipedia.org/wiki/Taylor_Swift"),
            ("The Beatles", "https://en.wikipedia.org/wiki/The_Beatles")
        ]

        for artist_name, expected_url in test_cases:
            with self.subTest(artist_name=artist_name):
                self.assertEqual(get_wiki_url(artist_name), expected_url)

    @patch('summarizer.requests.get')
    def test_scrape_artist_info_success(self, mock_get):
        # mock a successful response
        mock_response = MagicMock()
        mock_response.status_code = 200

        # Create mock HTML with an infobox and paragraphs
        mock_html = """
        <html>
            <body>
                <table class="infobox biography vcard">
                    <tr><th>Name</th><td>Test Artist</td></tr>
                </table>
                <p>First paragraph about the artist[1][2].</p>
                <p>Second paragraph with more details.</p>
                <h2>Early Life</h2>
                <p>This should not be included.</p>
            </body>
        </html>
        """
        mock_response.text = mock_html
        mock_get.return_value = mock_response

        expected_result = "First paragraph about the artist.\n\nSecond paragraph with more details."
        result = scrape_artist_info("Test Artist")

        self.assertEqual(result, expected_result)
        mock_get.assert_called_once()

    @patch('summarizer.requests.get')
    def test_scrape_artist_info_no_infobox(self, mock_get):
        # mock response with no infobox
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.text = "<html><body><p>Content but no infobox</p></body></html>"
        mock_get.return_value = mock_response

        result = scrape_artist_info("Unknown Artist")
        self.assertEqual(result, "")

    @patch('summarizer.requests.get')
    def test_scrape_artist_info_http_error(self, mock_get):
        # Mock an HTTP error
        mock_response = MagicMock()
        mock_response.status_code = 404
        mock_get.return_value = mock_response

        result = scrape_artist_info("Nonexistent Artist")
        self.assertEqual(result, "")

    @patch('summarizer.scrape_artist_info')
    @patch('summarizer.generate_summary')
    def test_summarize_artist_success(self, mock_generate_summary, mock_scrape_artist_info):
        # Mock the web scraping and summary generation
        mock_scrape_artist_info.return_value = "Test Artist Bio from Wikipedia"
        mock_generate_summary.return_value = "Test Summary"

        result = summarize_artist("Test Artist")
        self.assertEqual(result, "Test Summary")
        mock_scrape_artist_info.assert_called_once_with("Test Artist")
        mock_generate_summary.assert_called_once_with("Test Artist Bio from Wikipedia")

    @patch('summarizer.scrape_artist_info')
    def test_summarize_artist_no_data(self, mock_scrape_artist_info):
        # Mock no data returned from web scraping
        mock_scrape_artist_info.return_value = ""

        result = summarize_artist("Nonexistent Artist")
        self.assertEqual(result, "No summary available.")

    @patch('summarizer.tokenizer.encode')
    @patch('summarizer.model.generate')
    @patch('summarizer.tokenizer.decode')
    def test_generate_summary(self, mock_decode, mock_generate, mock_encode):
        mock_encode.return_value = MagicMock()
        mock_generate.return_value = [MagicMock()]
        mock_decode.return_value = "Generated Summary"

        result = generate_summary("Test Artist Bio")
        self.assertEqual(result, "Generated Summary")

if __name__ == '__main__':
    unittest.main()
