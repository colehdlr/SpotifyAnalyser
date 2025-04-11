import unittest
from unittest.mock import patch, MagicMock
from summarizer import get_genius_data, summarize_artist, generate_summary

class TestSummarizer(unittest.TestCase):

    @patch('summarizer.requests.get')
    def test_get_genius_data_success(self, mock_get):
        # Mock a successful response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.text = '<div class="rich_text_formatting">Test Artist Bio</div>'
        mock_get.return_value = mock_response

        result = get_genius_data("Test Artist")
        self.assertEqual(result, "Test Artist Bio")

    @patch('summarizer.requests.get')
    def test_get_genius_data_failure(self, mock_get):
        # Mock a failed response
        mock_response = MagicMock()
        mock_response.status_code = 404
        mock_get.return_value = mock_response

        result = get_genius_data("Nonexistent Artist")
        self.assertFalse(result)

    @patch('summarizer.get_genius_data')
    @patch('summarizer.generate_summary')
    def test_summarize_artist_success(self, mock_generate_summary, mock_get_genius_data):
        # Mock the web scraping and summary generation
        mock_get_genius_data.return_value = "Test Artist Bio"
        mock_generate_summary.return_value = "Test Summary"

        result = summarize_artist("Test Artist")
        self.assertEqual(result, "Test Summary")

    @patch('summarizer.get_genius_data')
    def test_summarize_artist_no_data(self, mock_get_genius_data):
        # Mock no data returned from web scraping
        mock_get_genius_data.return_value = False

        result = summarize_artist("Nonexistent Artist")
        self.assertEqual(result, "No summary available.")

    @patch('summarizer.tokenizer.encode')
    @patch('summarizer.model.generate')
    @patch('summarizer.tokenizer.decode')
    def test_generate_summary(self, mock_decode, mock_generate, mock_encode):
        # Mock the tokenizer and model behavior
        mock_encode.return_value = "encoded text"
        mock_generate.return_value = ["generated summary ids"]
        mock_decode.return_value = "Generated Summary"

        result = generate_summary("Test Artist Bio")
        self.assertEqual(result, "Generated Summary")

if __name__ == '__main__':
    unittest.main()