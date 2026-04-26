n = int(input("Enter the number of rows required: ")) #inputs the number of rows requires

for i in range(1,n+1): # decides the no of rows
    print(i,end=" ") #prints the row number
    for j in range(1,i+1):
        print("*",end=" ") #decides the no of columns based on the row number
    print("") # provides space after each row

# for n = 5
"""
1 * 
2 * * 
3 * * * 
4 * * * * 
5 * * * * * 
"""
