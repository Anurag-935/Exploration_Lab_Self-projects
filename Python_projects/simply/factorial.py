def factorial(num):
    """
    This function makes use of recursive calling of a function
    to find the factorial of a number"""
    if num == 1:  #This acts like a gate that checks if the factorial is = 1
        return 1
    else:
        fact = num * factorial(num - 1)   #This is the recursive element that calls itself till 1 resturend then it moves upward calculating the factorial
        return fact
