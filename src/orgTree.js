import { csvParse } from 'd3-dsv'
import { stratify, hierarchy } from 'd3-hierarchy'

export function buildTree(csvText) {
  // 1. Parse CSV — d3-dsv uses the header row as keys exactly as written
  const rows = csvParse(csvText)

  // 2. stratify() — map to YOUR actual column names
  //    "Employee Id" and "Manager" (with spaces/caps as in the CSV header)
  const stratifier = stratify()
    .id(d => d['Employee Id'])
    .parentId(d => d['Manager'] || null)   // root has empty Manager field

  const stratified = stratifier(rows)

  // 3. Wrap with hierarchy() for traversal methods
  const root = hierarchy(stratified)

  // 4. Single bottom-up pass — note: with stratify() + hierarchy(),
  //    the original CSV row lives at node.data.data
  root.eachAfter(node => {
    const salary = +node.data.data['Salary'] || 0
    const children = node.children || []

    if (children.length === 0) {
      // Leaf (IC — no direct reports)
      node.icCost = salary
      node.mgmtCost = 0
      node.totalCost = salary
      node.descendantCount = 0
      node.nonLeafDescendants = 0
    } else {
      // Manager — aggregate from already-computed children
      node.icCost = children.reduce((s, c) => s + c.icCost, 0)
      node.totalCost = salary + children.reduce((s, c) => s + c.totalCost, 0)
      node.mgmtCost = node.totalCost - node.icCost
      node.descendantCount = children.reduce((s, c) => s + c.descendantCount + 1, 0)
      node.nonLeafDescendants = children.reduce((s, c) => {
        return s + c.nonLeafDescendants + (c.children ? 1 : 0)
      }, 0)
    }

    node.mgmtCostRatio = node.icCost > 0
      ? node.mgmtCost / node.icCost
      : null
  })

  return root
}