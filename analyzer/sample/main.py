from auth import authenticate

def run():
    user = authenticate("Wonmin")
    print(user.greet())

run()