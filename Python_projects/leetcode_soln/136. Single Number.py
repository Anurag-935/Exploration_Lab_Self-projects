class Solution(object):
    def singleNumber(self, nums): #Takes in nums as an array input
        unq = 0
        for i in nums: # EXOR's eah number with every other number thus leaving only the unique number out
            unq ^= i

        return unq #returns unique number

        
