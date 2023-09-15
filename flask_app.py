from cs50 import SQL
from flask import Flask, flash, redirect, render_template, request, session
from flask_session import Session
from werkzeug.security import check_password_hash, generate_password_hash
from datetime import datetime
from random import randint

from helpers import apology, login_required, lookup, usd, check_limit, get_answer

# Configure application
app = Flask(__name__)

# Custom filter
app.jinja_env.filters["usd"] = usd

# Configure session to use filesystem (instead of signed cookies)
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
app.config['SECRET_KEY'] = 'qwerty'
app.static_folder = 'static'
Session(app)

# Configure SQLite database
db = SQL("sqlite:///finance.db")

# Get current time
now = datetime.now()
current_date = now.strftime("%m-%d-%Y")
current_time = now.strftime("%H:%M:%S")

# Creates a list of 78 notes as for tone.js to play.
notes = [
    "E2", "F2", "F#2", "G2", "G#2",
    "A2", "A#2", "B2", "C3", "C#3", "D3", "D#3", "E3", "F3", "F#3", "G3", "G#3",
    "A3", "A#3", "B3", "C4", "C#4", "D4", "D#4", "E4", "F4", "F#4", "G4", "G#4",
    "A4", "A#4", "B4", "C5", "C#5", "D5", "D#5", "E5", "F5", "F#5", "G5", "G#5",
    "A5", "A#5", "B5", "C6", "C#6", "D6", "D#6", "E6", "F6", "F#6", "G6", "G#6",
    "A6", "A#6", "B6", "C7", "C#7", "D7", "D#7"
]

# Subtract 1 to get the last element in list
length = len(notes) - 1

# Determines how 'random' selects which notes to play
easy_range = 15
normal_range = 10
hard_range = 5

# Sets maximum number of rounds for exercise
max_rounds = 5


@app.after_request
def after_request(response):
    """Ensure responses aren't cached"""
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Expires"] = 0
    response.headers["Pragma"] = "no-cache"
    return response


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/finance_index")
@login_required
def finance_index():
    """Show portfolio of stocks"""
    total = 0
    portfolio = db.execute("SELECT * FROM portfolio WHERE user_id = ?", session["user_id"])

    for purchases in portfolio:
        stock_info = lookup(purchases["symbol"])
        if stock_info is not None:
            name = stock_info["name"]
            price = stock_info["price"]
            symbol = stock_info["symbol"]
            total_shares = price * int(purchases["shares"])
            total += total_shares
            db.execute("UPDATE portfolio SET price = ? WHERE user_id = ? AND symbol = ?",
                       price, session["user_id"], name)

            db.execute("UPDATE portfolio SET total = ? WHERE user_id = ? AND symbol = ?",
                       total_shares, session["user_id"], name)

    all_shares = total_value()
    return render_template("finance_index.html", portfolio=portfolio, total=total, all_shares=all_shares)


@app.route("/buy", methods=["GET", "POST"])
@login_required
def buy():
    """Buy shares of stock"""

    if request.method == "POST":
        get_symbol = request.form.get("symbol")
        get_shares = request.form.get("shares")

        # Checks if user left fields empty
        if not get_symbol or not get_shares:
            flash("field empty", category="emptyfield")
            return apology("field empty", 400)

        # Checks if share amount is valid digit
        elif not get_shares.isdigit():
            flash("Invalid share amount", category="invalidshares")
            return apology("invalid amount", 400)

        bought_shares = int(get_shares)
        # Check if user inputs negative amount of shares
        if bought_shares <= 0:
            flash("Invalid share amount", category="invalidshares")
            return apology("invalid amount", 400)

        # If both fields are fulfilled
        # then look up symbol
        if get_symbol and get_shares:
            info = lookup(get_symbol)

            if info:
                name = info["name"]
                price = info["price"]
                symbol = info["symbol"]
                total = price * bought_shares

                # Obtain current amount of cash user has
                get_cash = db.execute("SELECT cash FROM users WHERE id = ?", session["user_id"])
                cash = get_cash[0]["cash"]

                # Checks if user has enough cash to buy shares
                if cash < total:
                    return apology("Not enough cash", 403)

                # Updates users cash after buying shares
                new_cash = cash - total
                session["cash"] = f"{new_cash:.2f}"
                db.execute("UPDATE users SET cash = ? WHERE id = ?", new_cash, session["user_id"])

                # Add new row in transactions table
                db.execute("INSERT INTO transactions "
                           "(transaction_type, user_id, symbol, name, shares, price, total, date, time)\
                            VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)",
                           "BUY",
                           session["user_id"],
                           symbol,
                           name,
                           bought_shares,
                           price,
                           total,
                           current_date,
                           current_time)

                # Get the current amount of shares the user has
                get_current_shares = db.execute("SELECT shares FROM portfolio WHERE user_id = ? AND symbol = ?",
                                                session["user_id"], name)
                if get_current_shares:
                    current_shares = get_current_shares[0]["shares"]
                else:
                    current_shares = 0
                new_shares = bought_shares + current_shares
                new_total = new_shares * price

                # Loop through portfolio to check if user already purchased
                # the symbol and updates it
                portfolio = db.execute("SELECT * FROM portfolio WHERE user_id = ?", session["user_id"])
                for purchase in portfolio:
                    if name == purchase["symbol"] and session["user_id"] == purchase["user_id"]:
                        db.execute("UPDATE portfolio SET shares = ? WHERE user_id = ? AND symbol = ?",
                                   new_shares,
                                   session["user_id"],
                                   name)
                        db.execute("UPDATE portfolio SET total = ? WHERE user_id = ? AND symbol = ?",
                                   new_total,
                                   session["user_id"],
                                   name)
                        portfolio = db.execute("SELECT * FROM portfolio WHERE user_id = ?", session["user_id"])
                        flash("Purchase Successful!", category="purchased")
                        all_shares = total_value()
                        return render_template("index.html", portfolio=portfolio, total=total, all_shares=all_shares)

                # Else user has not purchased symbol before; insert new row
                db.execute("INSERT INTO portfolio (user_id, symbol, name, shares, price, total)\
                            VALUES(?, ?, ?, ?, ?, ?)", session["user_id"], name, name, bought_shares, price, new_total)

                flash("Purchase Successful!", category="purchased")
                all_shares = total_value()
                portfolio = db.execute("SELECT * FROM portfolio WHERE user_id = ?", session["user_id"])
                return render_template("index.html", portfolio=portfolio, total=total, all_shares=all_shares)

            # Checks if user input is a valid symbol
            else:
                flash("Symbol does not exist", category="invalid-symbol")
                return apology("invalid symbol", 400)

    # User reached route besides "POST"
    else:
        return render_template("buy.html")


@app.route("/history")
@login_required
def history():
    """Show history of transactions"""
    transactions = db.execute("SELECT * FROM transactions WHERE user_id = ?", session["user_id"])
    return render_template("history.html", transactions=transactions)


@app.route("/login", methods=["GET", "POST"])
def login():
    """Log user in"""

    # Forget any user_id
    session.clear()

    # User reached route via POST (as by submitting a form via POST)
    if request.method == "POST":
        remember_me = request.form.get("remember")
        # Ensure username was submitted
        if not request.form.get("username"):
            return apology("must provide username", 403)

        # Ensure password was submitted
        elif not request.form.get("password"):
            return apology("must provide password", 403)

        # Query database for username
        rows = db.execute("SELECT * FROM users WHERE username = ?", request.form.get("username"))

        # Ensure username exists and password is correct
        if len(rows) != 1 or not check_password_hash(rows[0]["hash"], request.form.get("password")):
            return apology("invalid username and/or password", 403)

        # Remember which user has logged in
        session["user_id"] = rows[0]["id"]
        session["cash"] = "%.2f" % rows[0]["cash"]
        session["username"] = rows[0]["username"]

        if remember_me:
            app.config["SESSION_PERMANENT"] = True

        # Redirect user to home page
        return redirect("/finance_index")

    # User reached route via GET (as by clicking a link or via redirect)
    else:
        return render_template("login.html")


@app.route("/logout")
def logout():
    """Log user out"""

    # Forget any user_id
    session.clear()

    # Redirect user to login form
    return redirect("/finance_index")


@app.route("/quote", methods=["GET", "POST"])
@login_required
def quote():
    """Get stock quote."""

    if request.method == "POST":
        get_symbol = request.form.get("symbol")

        if not get_symbol:
            flash("symbol field empty", category="symbol-empty")
            return apology("symbol field empty", 400)

        if get_symbol:
            info = lookup(get_symbol)
            if info:
                return render_template("quoted.html", info=info, current_date=current_date, current_time=current_time,)
            else:
                flash("Symbol does not exist", category="invalid-symbol")
                return apology("Symbol does not exist", 400)

    else:
        return render_template("quote.html", current_date=current_date, current_time=current_time)


@app.route("/register", methods=["GET", "POST"])
def register():
    """Register user"""

    if request.method == "POST":
        name = request.form.get("username")
        password = request.form.get("password")
        confirmpw = request.form.get("confirmation")

        # Ensure username was submitted
        if not name:
            return apology("must provide username", 400)

        # Ensure password was submitted
        elif not password:
            return apology("must provide password", 400)

        elif password != confirmpw:
            return apology("Password does not match", 400)

        name_exist = db.execute("SELECT username FROM users WHERE username = ?", name)

        if name_exist:
            return apology("Name already taken", 400)

        hashed_pw = generate_password_hash(password)
        db.execute("INSERT INTO users (username, hash) VALUES(?, ?)", name, hashed_pw)
        flash("Registration Successful!", category="message")
        return redirect("/finance_index")

    else:
        return render_template("register.html")


@app.route("/sell", methods=["GET", "POST"])
@login_required
def sell():
    """Sell shares of stock"""

    stock_set = set()
    get_stocks = db.execute("SELECT symbol FROM portfolio WHERE user_id = ?", session["user_id"])

    # Add symbols from user's portfolio into set
    for symbol in get_stocks:
        stock = symbol["symbol"]
        stock_set.add(stock)

    if request.method == "POST":
        get_symbol = request.form.get("symbol")
        get_shares = request.form.get("shares")

        # Get current amount of shares for symbol from user portfolio
        shares_amount = db.execute("SELECT shares FROM portfolio WHERE user_id = ? AND symbol = ?",
                                   session["user_id"], get_symbol)
        if not shares_amount:
            return apology("no stocks found", 400)

        user_shares = int(shares_amount[0]["shares"])

        if not get_symbol or not get_shares:
            flash("field empty", category="emptyfield")
            return apology("field empty", 400)

        elif not get_shares.isdigit():
            flash("Invalid share amount", category="invalidshares")
            return apology("invalid amount", 400)

        # Checks if symbol matches with any symbols in portfolio
        elif get_symbol not in stock_set:
            return apology("stock not owned", 400)

        sold_shares = int(get_shares)

        # Checks if user inputs negative amount of shares
        if sold_shares <= 0:
            flash("Invalid share amount", category="invalidshares")
            return apology("invalid amount", 400)

        # Checks if user try's to sell more shares than they have
        elif sold_shares > user_shares:
            return apology("not enough shares", 400)

        if get_symbol and get_shares:
            info = lookup(get_symbol)

            if info:
                name = info["name"]
                price = info["price"]
                symbol = info["symbol"]
                total = price * sold_shares

                get_cash = db.execute("SELECT cash FROM users WHERE id = ?", session["user_id"])
                cash = get_cash[0]["cash"]

                # Subtracts the amount of shares the user has
                # From the amount they want to sell
                shares_left = user_shares - sold_shares

                if shares_left == 0:
                    db.execute("DELETE FROM portfolio WHERE user_id = ? AND symbol = ?", session["user_id"], get_symbol)

                # Update new cash value after selling stock
                new_cash = cash + total
                cash_float = float(new_cash)

                db.execute("UPDATE users SET cash = ? WHERE id = ?", cash_float, session["user_id"])
                db.execute("INSERT INTO transactions "
                           "(transaction_type, user_id, symbol, name, shares, price, total, date, time)\
                            VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)",
                           "SELL",
                           session["user_id"],
                           symbol,
                           name,
                           sold_shares,
                           price,
                           total,
                           current_date,
                           current_time)

                flash("Sold!", category="sold")

                new_total = shares_left * price

                # Update values in portfolio
                db.execute("UPDATE portfolio SET shares = ? WHERE user_id = ? AND symbol = ?",
                           shares_left, session["user_id"], name)

                db.execute("UPDATE portfolio SET total = ? WHERE user_id = ? AND symbol = ?",
                           new_total, session["user_id"], name)

                portfolio = db.execute("SELECT * FROM portfolio WHERE user_id = ?", session["user_id"])
                all_shares = total_value()
                return redirect("/finance_index")

            else:
                flash("Symbol does not exist", category="invalid-symbol")
                return apology("invalid symbol", 403)
    else:
        return render_template("sell.html", get_stocks=get_stocks)


def total_value():
    portfolio = db.execute("SELECT * FROM portfolio WHERE user_id = ?", session["user_id"])
    total = 0
    # Loop through total value for each symbol to sum them all up
    for purchase in portfolio:
        total += purchase["total"]

    cash_float = float(f"{float(session['cash']):.2f}")
    # print(cash_float)
    total += cash_float
    return total


@app.route("/change", methods=["GET", "POST"])
@login_required
def change():
    current_password = db.execute("SELECT hash FROM users WHERE id = ?", session["user_id"])
    if request.method == "POST":
        password = request.form.get("password")
        newpw = request.form.get("newpw")
        confirm_newpw = request.form.get("confirm-newpw")

        if not password or not newpw:
            flash("Password Field Empty", category="password_empty")
            return render_template("changepw.html")

        same_pw = check_password_hash(current_password[0]["hash"], password)

        if same_pw:
            if newpw == confirm_newpw:
                hash_newpw = generate_password_hash(newpw)
                db.execute("UPDATE users SET hash = ? WHERE id = ?", hash_newpw, session["user_id"])
                flash("Password Succesfully Changed!", category="password_change")
                return render_template("login.html")

            flash("Password does not match", category="password_match")
            return render_template("changepw.html")

        else:
            flash("Password does not match", category="password_match")
            return render_template("changepw.html")

    else:
        return render_template("changepw.html")


@app.route("/music_index", methods=["GET", "POST"])
def music_index():
    return render_template("music_index.html")


@app.route("/piano", methods=["GET", "POST"])
def piano():
    return render_template("piano.html")


@app.route("/guitar", methods=["GET", "POST"])
def guitar():
    return render_template("guitar.html")


@app.route("/tone_index", methods=["GET", "POST"])
def tone_index():
    if request.method == "POST":
        get_difficulty: str = request.form.get("difficulty")

        if not get_difficulty:
            flash("Difficulty not selected", category="select_difficulty")
            return redirect("/tone_index")

        elif get_difficulty != "easy" and get_difficulty != "normal" and get_difficulty != "hard":
            flash("Invalid Difficulty", category="select_difficulty")
            return redirect("/tone_index")

        # Tracks the score and difficulty for the user
        session['current_round'] = 0
        session['score'] = 0
        session['difficulty'] = get_difficulty
        session['time_interval'] = {
            "easy": 2000,
            "normal": 2500,
            "hard": 3500,
        }.get(get_difficulty, 0)

        return redirect('/tone_exercise')

    return render_template("tone_index.html")


@app.route('/tone_exercise', methods=["GET", "POST"])
def tone_exercise():
    if request.method == "GET":
        session['current_round'] += 1
        first_note: int = randint(0, length)

        if session['difficulty'] == 'easy':
            lower_limit: int = first_note - easy_range
            upper_limit: int = first_note + easy_range

            new_lower, new_upper = check_limit(lower_limit, upper_limit, length)
            second_note: int = randint(new_lower, new_upper)
            answer = get_answer(first_note, second_note)
            session['correct_answer'] = answer

            note_time = 2000

            print(f"First note is {notes[first_note]}: Second note is {notes[second_note]}")
            return render_template("tone_exercise.html", first_note=notes[first_note],
                                   second_note=notes[second_note], time_interval=session['time_interval'])

        if session['difficulty'] == 'normal':
            lower_limit: int = first_note - normal_range
            upper_limit: int = first_note + normal_range

            new_lower, new_upper = check_limit(lower_limit, upper_limit, length)
            second_note: int = randint(new_lower, new_upper)
            session['correct_answer'] = get_answer(first_note, second_note)

            print(f"First note is {notes[first_note]}: Second note is {notes[second_note]}")
            return render_template("tone_exercise.html", first_note=notes[first_note],
                                   second_note=notes[second_note], time_interval=session['time_interval'])

        if session['difficulty'] == 'hard':
            lower_limit: int = first_note - hard_range
            upper_limit: int = first_note + hard_range

            new_lower, new_upper = check_limit(lower_limit, upper_limit, length)
            second_note: int = randint(new_lower, new_upper)
            session['correct_answer'] = get_answer(first_note, second_note)

            print(f"First note is {notes[first_note]}: Second note is {notes[second_note]}")
            return render_template("tone_exercise.html", first_note=notes[first_note],
                                   second_note=notes[second_note], time_interval=session['time_interval'])

    return render_template("tone_exercise.html")


@app.route("/check_answer", methods=["GET", "POST"])
def check_answer():
    if request.method == "POST":
        user_answer: str = request.form.get("user_answer")
        print(user_answer)
        print(f"checking answer... {session['correct_answer']}")

        if user_answer == session['correct_answer']:
            session['score'] += 1
            flash("Correct!", category="correct_answer")
            print(session['score'])
            if session['current_round'] == max_rounds:
                total_score = session['score']
                return render_template("results.html", total_score=total_score, max_rounds=max_rounds)
            return redirect("/tone_exercise")

        else:
            flash("Incorrect 😞", category="correct_answer")
            if session['current_round'] == max_rounds:
                total_score = session['score']
                return render_template("results.html", total_score=total_score, max_rounds=max_rounds)
            return redirect("/tone_exercise")

    return redirect("/tone_exercise")


@app.route("/tuner", methods=["GET", "POST"])
def tuner():
    return render_template("tuner.html")


if __name__ == "__main__":
    app.run(debug=True)
