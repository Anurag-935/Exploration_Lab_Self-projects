class Solution(object):
    def isPalindrome(self, x):
        if x<0 :
            return False

        if x == 0:
            return True

        a = list()
        n = x
        while n != 0:
            a.append(n%10)
            n = int(n/10)
        b = list()
        for i in range(1,len(a)):
            b.append(a[-i])
        b.append(a[0])
        if a == b:
            return True
        else:
            return False
        
       
        
