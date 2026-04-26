n = int(input("Enter the number of rows required: ")) #input the number of rows

for i in range(n,0,-1): #no of rows 
    print(i,end=" ")
    for j in range(i,0,-1): #no of columns
        print("*",end=" ") #prints the stars 
    print("")

# for n = 5

"""
5 * * * * * 
4 * * * * 
3 * * * 
2 * * 
1 * 
"""
