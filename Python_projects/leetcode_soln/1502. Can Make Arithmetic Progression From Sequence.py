class Solution(object):
    def canMakeArithmeticProgression(self, arr):
        arr.sort()
        count = 0
        for i in range(1,(len(arr)-1)):
            c1 = abs(arr[i] - arr[i-1])
            c2= abs(arr[i+1] - arr[i])
            if c1 == c2:
                count += 1
        if count == (len(arr)-2):
            return True
        else: 
            return False


        
        
