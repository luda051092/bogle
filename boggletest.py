from unittest import TestCase
from app import app
from flask import session
from boggle import Boggle
import json


app.config['TESTING'] = True
app.config['DEBUG_TB_HOSTS'] = ['dont-show-debug-toolbar']

class FlaskTests(TestCase):
    """Test class for boggle game"""
    def test_index(self):
        """testing main page"""
        with app.test_client() as client:
            res = client.get('/')
            html = res.get_data(as_text=True)

            self.assertEqual(res.status_code, 200)
            self.assertIn('''Boggle Game''', Markup(html).striptags())

            board = session["board"]
            self.assertEqual(len(board) , 5)
            self.assertEqual(len(board[0]) , 5)
            self.assertEqual(len(board[1]) , 5)
            self.assertEqual(len(board[2]) , 5)
            self.assertEqual(len(board[3]) , 5)
            self.assertEqual(len(board[4]) , 5)

            for row in board:
                for cell in row:
                    self.assertIn(f'<td>{cell}</td>' , html)

            self.assertEqual(session["scores"] , [])

    def test_find_word(self):
        """testing findword page"""
        with app.test_client() as client:
            boggle_game = Boggle()
            board = boggle_game.make_board()
            with client.session_transaction() as change_session:
                change_session['board'] = board

            res = client.get("/find?word=word")
            html = res.get_data(as_text=True)

            self.assertEqual(res.status_code , 200)
            self.assertEqual(res.content_type , "application/json")
            self.assertIn(boggle_game.check_valid_word(board, "word") , html)

    def test_end_game(self):
        """testing endgame page"""
        with app.test_client() as client:
            boggle_game = Boggle()
            board = boggle_game.make_board()
            with client.session_transaction() as change_session:
                change_session['board'] = board

            res = client.post("/end" , data=json.dumps({"score" : 10 }), content_type='application/json')
            html = res.get_data(as_text=True)

            self.assertEqual(res.status_code , 200)
            self.assertEqual(res.content_type , "application/json")
            scores = session["scores"]
            self.assertEqual(scores[0]["score"] , 10)
            self.assertIn("10" , html)
                             

