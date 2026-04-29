# NUMBER GUESSING GAME
import random

print("Welcome to the NUMBER GUESSING GAME".center(200,"-"))

print("""Rules: \n You get 10 chances to guess the number between 1 to 20, you win if you guess the number within 10 guesses or else lose""")
count = 0
ans = random.randint(1,20) #Generates and random number that the plyer has t guess
choice = str()
while True:
    for i in range(0,10):
        guess = int(input("Enter you choice: "))# User input of choice
        count += 1
        if guess>20:
            print("Not in range!!")
        elif guess == ans:
            print("Congratulations You have guessed right!!")
            break
        else:
            print("Your guess is wrong try again!!") # This aids the player with what numebr to guess next, works similar to binary sort
            if guess<ans:
                print("Try a number greater than {}".format(guess))
            else:
                print(f"Try a number less than {guess}")

    print("Your Number of guesses are over")
    choice = input("Do you want to play again?(y/n)")
    if choice == "n":
        break
    if choice == 'y':
        continue
    else:
        break
print("GAME OVER!!")





