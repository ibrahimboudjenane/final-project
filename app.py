from flask import Flask, render_template, request, session, jsonify
from flask_session import Session

app = Flask(__name__)

app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
app.secret_key = "supersecret123"   

Session(app)
from flask import redirect, url_for
# ...existing code...
@app.route('/', methods=['GET', 'POST'])
def index():
    if 'tasks' not in session:
        session['tasks'] = []
    if 'completed_tasks' not in session:
        session['completed_tasks'] = []
    
    if request.method == 'POST':
        task = request.form.get('task')
        if task and task.strip():
            session['tasks'].append(task)
            session.modified = True
            return redirect(url_for('index'))  # <--- Add this line
    
    return render_template('to_do_list.html', 
                         tasks=session['tasks'], 
                         completed_tasks=session['completed_tasks'])
# ...existing code...
@app.route('/complete_task', methods=['POST'])
def complete_task():
    data = request.get_json()
    task = data.get('task')
    
    if task in session['tasks']:
        session['tasks'].remove(task)
        session['completed_tasks'].append(task)
        session.modified = True
        return jsonify(success=True)
    
    return jsonify(success=False)

@app.route('/uncomplete_task', methods=['POST'])
def uncomplete_task():
    data = request.get_json()
    task = data.get('task')
    
    if task in session['completed_tasks']:
        session['completed_tasks'].remove(task)
        session['tasks'].append(task)
        session.modified = True
        return jsonify(success=True)
    
    return jsonify(success=False)

@app.route('/delete_all', methods=['POST'])
def delete_all():
    session['tasks'] = []
    session['completed_tasks'] = []
    session.modified = True
    return jsonify(success=True)

if __name__ == '__main__':
    app.run(debug=True)

@app.route('/cutdown')
def cutdown():
    return render_template('cutdown.html')