# Dayforce

Goal: Build a tree UI showing who reports to who (company org chart)

#### Brute force = recalculate each nodes subtrees totals; O(n^2) tc

#### Optimized solution = compute and cache all values as I build the tree in 1 pass; O(n) tc

- Simple bottom-up post order traversal of a tree
- This allows each nodes totals to be built from childrens already calculated totals.

### Requirements

- clean ui (showcase my love for design) in vue
- recursive aggrregation

- IC Cost = Sum of salaries of all descendants who have no reports (individual workers)
- Management Cost = Sum of salaries of all descendants who do manage someone
- Total Cost = Sum of all descendants' salaries
- Management Cost Ratio = individual contributers / managers (mgmt cost / ic cost) - how much you're spending on managers vs workers

## Solution

- Indented tree for simple browsing
- d3.stratify to convert flat CSV rows into a hierarchy using id and parentId fields
- d3.hierarchy to wrap the stratified data with traversal methods
- Built seperately and self hosted since codesandobx doesn't work.

#### `orgTree.js`

Parses and transforms the CSV into a traversable hierarchy, with all metrics pre-computed once at load time. No values are recalculated on user interaction.

1. Parses the CSV with d3-dsv's csvParse()
2. Builds the hierarchy with d3.stratify() using Employee Id as the node id and Manager as the parent reference
3. Wraps it with d3.hierarchy() to gain traversal methods
4. Runs a single bottom-up pass with node.eachAfter()` to pre-compute and cache on every node:

#### `OrgChart.vue`

- **Recursive self-referencing component** each instance renders one node and calls itself for children
- Children are only mounted when expanded (`v-if`), keeping 40k nodes out of the DOM

#### `NodeDetail.vue`

Shown on node click, displaying: Name, job title, performance badge (color-coded), department, location, and calculated fields (added currency formatting).

#### `App.vue`

- **CSV upload** via FileReader so no server needed, works entirely client-side
- Centered upload screen on first load; switches to a two-panel layout after a file is parsed (didnt want to upload the dataset incase that was sensitive)
- **Resizable divider** between panels (drag handle)
- **Zoom controls** (− / % / +) in the header using the CSS zoom property, range 40% to 200%
