# Dayforce

Goal: Build a tree UI showing who reports to who (company org chart)

#### Brute force = recalculate each nodes subtrees totals; O(n^2) tc 

#### Optimized solution = compute and cache all values as I build the tree in 1 pass; O(n) tc
- Simple bottom-up post order traversal of a tree
- This allows each nodes totals to be built from childrens already calculated totals.


## TODO
- clean ui (showcase my love for design) in vue
- recursive aggrregation 


## Requirements
- IC Cost = Sum of salaries of all descendants who have no reports (individual workers)
- Management Cost = Sum of salaries of all descendants who do manage someone
- Total Cost = Sum of all descendants' salaries
- Management Cost Ratio = individual contributers / managers (mgmt cost / ic cost) - how much you're spending on managers vs workers


## Solution
- Indented tree for simple browsing
- 