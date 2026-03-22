import mysql.connector
from flask import Flask, request, jsonify,session
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS
import cloudinary,os
import cloudinary.uploader
from datetime import timedelta
from dotenv import load_dotenv
load_dotenv()
cloudinary.config(
    cloud_name=os.getenv("CLOUD_NAME"),
    api_key=os.getenv("API_KEY"),
    api_secret=os.getenv("API_SECRET")
)
app = Flask(__name__)
app.secret_key = "supersecret"
app.config.update(
    SESSION_COOKIE_SAMESITE="Lax",   
    SESSION_COOKIE_SECURE=False,
    SESSION_COOKIE_HTTPONLY=True
)
app.permanent_session_lifetime = timedelta(days=1)
CORS(app, origins=["http://localhost:5173"], supports_credentials=True)

def get_db_connection():
    mycon = mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME")
    )
    return mycon, mycon.cursor(dictionary=True)
@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    username = data["userName"]
    password = generate_password_hash(data["password"])
    mycon, mycur = get_db_connection()
    mycur.execute("SELECT * FROM users WHERE username=%s", (username,))
    if mycur.fetchone():
        return jsonify(msg="username already exists"), 409
    mycur.execute("INSERT INTO users (username, password) VALUES (%s, %s)", (username, password))
    mycon.commit()
    return jsonify(msg="registered")
@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data["userName"]
    password = data["password"]

    mycon, mycur = get_db_connection()
    mycur.execute("SELECT * FROM users WHERE username=%s", (username,))
    user = mycur.fetchone()

    if not user or not check_password_hash(user["password"], password):
        return jsonify(msg="INVALID USERNAME OR PASSWORD"), 401

    session["username"] = username
    session.permanent = True

    print("Session after login:", dict(session)) 

    return jsonify(msg="logged in"), 200

@app.route("/load_all_recipe", methods=["GET"])
def load_all_recipe():
    print("Cookies received:", request.cookies)
    print("Session:", dict(session))
    username = session.get("username")
    if not username:
        return jsonify({"error": "User not logged in"}), 401
    mycon, mycur = get_db_connection()
    mycur.execute("SELECT id, title, photo_url FROM Recipe")
    res = mycur.fetchall()
    return jsonify({"Recipies": res})

@app.route("/load_my_recipe", methods=["GET"])
def load_my_recipe():
    print("Cookies received:", request.cookies)
    print("Session:", dict(session))
    username = session.get("username")
    if not username:
        return jsonify({"error": "User not logged in"}), 401

    mycon, mycur = get_db_connection()
    mycur.execute("SELECT id, title, photo_url FROM Recipe WHERE username=%s", (username,))
    res = mycur.fetchall()
    return jsonify({"Recipies": res})

@app.route("/view_current_recipe",methods=["GET"])
def view_recipe():
    id=request.args.get("id", type=int) 
    mycon, mycur = get_db_connection()
    mycur.execute("SELECT * FROM RECIPE where id= %s",(id,))
    res=mycur.fetchone()
    mycur.execute("SELECT comment,username FROM Comments where rec_id=%s",(id,))
    result=mycur.fetchall()
    return jsonify({"Recipe":res,"Comments":result})

@app.route("/myrecipe", methods=["POST"])
def myrecipe():
    try:
        username = session.get("username")
        if not username:
            return jsonify({"error": "User not logged in"}), 401

        print("FORM:", request.form)
        print("FILES:", request.files)

        title = request.form.get("recipeTitle")
        ingredients = request.form.get("ingredients")
        preparation = request.form.get("preparation")
        photo = request.files.get("photo")

        if not title or not ingredients or not preparation:
            return jsonify({"error": "Missing fields"}), 400

        # SAFE image upload
        if photo and photo.filename != "":
            try:
                upload_result = cloudinary.uploader.upload(photo)
                photo_url = upload_result["secure_url"]
            except Exception as e:
                print("Cloudinary ERROR:", e)
                photo_url = "UPLOAD FAILED"
        else:
            photo_url = "NO IMAGE"

        mycon, mycur = get_db_connection()

        mycur.execute(
            "INSERT INTO Recipe (username, title, ingredients, preparation, photo_url) VALUES (%s, %s, %s, %s, %s)",
            (username, title, ingredients, preparation, photo_url),
        )
        mycon.commit()

        new_id = mycur.lastrowid

        return jsonify({
            "id": new_id,
            "title": title,
            "photo_url": photo_url
        })

    except Exception as e:
        print("SERVER ERROR:", e)
        return jsonify({"error": str(e)}), 500

@app.route('/delete_recipe',methods=['POST'])
def delete_recipe():
    data=request.get_json()
    username=session.get("username")
    if not username:
        return jsonify({"error": "User not logged in"}), 401
    rec_id=data.get("rec_id")
    mycon, mycur = get_db_connection()
    mycur.execute("DELETE FROM Recipe where id=%s",(rec_id,))
    mycon.commit()
    return jsonify(msg="deleted")

@app.route('/check_saved',methods=['GET'])
def check_saved():
    id=request.args.get("id")
    username=session.get("username")
    mycon,mycur=get_db_connection()
    mycur.execute("SELECT EXISTS (SELECT 1 FROM saved WHERE rec_id=%s and username=%s) AS Result",(id,username))
    res=mycur.fetchone()
    if(res['Result']==1):
        return jsonify(Result=1)
    else:
        return jsonify(Result=0)

@app.route('/saverecipe',methods=['POST'])
def save():
    data=request.get_json()
    username=session.get("username")
    if not username:
        return jsonify({"error": "User not logged in"}), 401
    rec_id=data.get("rec_id")
    mycon, mycur = get_db_connection()
    mycur.execute("INSERT INTO saved values(%s,%s)",(rec_id,username))
    mycon.commit()
    return jsonify(msg="saved")

@app.route('/unsaverecipe',methods=['POST'])
def unsave():
    data=request.get_json()
    username=session.get("username")
    if not username:
        return jsonify({"error": "User not logged in"}), 401
    rec_id=data.get("rec_id")
    mycon, mycur = get_db_connection()
    mycur.execute("DELETE FROM saved where rec_id=%s AND username=%s",(rec_id,username))
    mycon.commit()
    return jsonify(msg="unsaved")

@app.route("/load_saved_recipe", methods=["GET"])
def load_saved_recipe():
    username = session.get("username")
    if not username:
        return jsonify({"error": "User not logged in"}), 401
    mycon, mycur = get_db_connection()
    mycur.execute("SELECT rec_id FROM saved where username=%s",(username,))
    result=mycur.fetchall()
    ID=[]
    for row in result:
        ID.append(row["rec_id"])
    if not ID:
        return jsonify({"Recipies": []})
    placeholder=','.join(["%s"]*len(ID))
    query=f"SELECT id, title, photo_url FROM Recipe WHERE id IN ({placeholder})"
    mycur.execute(query,ID)
    res = mycur.fetchall()
    return jsonify({"Recipies": res})

@app.route('/edit_recipe', methods=['POST'])
def edit_recipe():
    try:
        username = session.get("username")
        if not username:
            return jsonify({"error": "User not logged in"}), 401

        rec_id = request.form.get("rec_id", type=int)
        if not rec_id:
            return jsonify({"error": "Recipe ID required"}), 400

        mycon, mycur = get_db_connection()

       
        mycur.execute(
            "SELECT * FROM Recipe WHERE id=%s AND username=%s",
            (rec_id, username)
        )
        recipe = mycur.fetchone()

        if not recipe:
            return jsonify({"error": "Recipe not found or access denied"}), 404

       
        title = request.form.get("recipeTitle", recipe["title"])
        ingredients = request.form.get("ingredients", recipe["ingredients"])
        preparation = request.form.get("preparation", recipe["preparation"])

        photo_url = recipe["photo_url"]

       
        if "photo" in request.files and request.files["photo"].filename:
            try:
                photo = request.files["photo"]
                upload_result = cloudinary.uploader.upload(photo)
                photo_url = upload_result["secure_url"]
            except Exception as e:
                print("Cloudinary ERROR:", e)

        
        mycur.execute(
            """
            UPDATE Recipe 
            SET title=%s, ingredients=%s, preparation=%s, photo_url=%s 
            WHERE id=%s
            """,
            (title, ingredients, preparation, photo_url, rec_id)
        )
        mycon.commit()

       
        return jsonify({
            "id": rec_id,
            "title": title,
            "photo_url": photo_url,
            "ingredients": ingredients,
            "preparation": preparation
        })

    except Exception as e:
        print("EDIT ERROR:", e)
        return jsonify({"error": str(e)}), 500
@app.route("/upload_comment", methods=["POST"])
def upload_comment():
    try:
        username = session.get("username")
        if not username:
            return jsonify({"error": "User not logged in"}), 401

        data = request.get_json()
        comment = data.get("comment")
        rec_id = data.get("id")

        if not comment or not rec_id:
            return jsonify({"error": "Missing data"}), 400

        mycon, mycur = get_db_connection()
        mycur.execute(
            "INSERT INTO Comments (rec_id, username, comment) VALUES (%s, %s, %s)",
            (rec_id, username, comment)
        )
        mycon.commit()

        return jsonify({"msg": "Comment added successfully"})

    except Exception as e:
        print("COMMENT ERROR:", e)
        return jsonify({"error": str(e)}), 500
@app.route('/get_current_user', methods=['GET'])
def get_current_user():
    username = session.get("username")
    if not username:
        return jsonify({"username": None}), 200
    return jsonify({"username": username}), 200

@app.route('/logout',methods=["POST"])
def logout():
    session.clear()
    return {"message": "Logged out successfully"}, 200

if __name__ == "__main__":
    app.run(debug=True)
