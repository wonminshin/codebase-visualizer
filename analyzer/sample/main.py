from auth import authenticate

#main.py -> auth.py -> user.py
def run():
    user = authenticate("Name")
    print(user.greet())

run()