import { csvParse } from 'd3-dsv'
import { stratify, hierarchy } from 'd3-hierarchy'

export function buildTree(csvText) {
  const rows = csvParse(csvText)

  const root = hierarchy(
    stratify()
      .id(d => d['Employee Id'])
      .parentId(d => d['Manager'] || null)(rows)
  )

  // Single bottom-up pass — each node's costs reflect descendants only (self excluded).
  // Cache node.salary so children can read it without re-accessing the CSV row.
  root.eachAfter(node => {
    const salary = +node.data.data['Salary'] || 0
    node.salary = salary
    const children = node.children || []

    if (children.length === 0) {
      // Leaf (IC): no descendants, so all cost fields are 0
      node.icCost   = 0
      node.mgmtCost = 0
      node.totalCost = 0
      node.descendantCount    = 0
      node.nonLeafDescendants = 0
    } else {
      let icCost = 0
      let mgmtCost = 0

      for (const child of children) {
        if (!child.children || child.children.length === 0) {
          // IC child: their salary goes into icCost
          icCost += child.salary
        } else {
          // Manager child: their salary goes into mgmtCost;
          // their own aggregated costs bubble up separately
          mgmtCost += child.salary + child.mgmtCost
          icCost   += child.icCost
        }
      }

      node.icCost    = icCost
      node.mgmtCost  = mgmtCost
      node.totalCost = icCost + mgmtCost

      node.descendantCount = children.reduce(
        (s, c) => s + c.descendantCount + 1, 0
      )
      node.nonLeafDescendants = children.reduce(
        (s, c) => s + c.nonLeafDescendants + (c.children ? 1 : 0), 0
      )
    }

    // Mgmt cost ratio: mgmt cost / IC cost (management overhead per IC dollar)
    node.mgmtCostRatio = node.icCost > 0
      ? node.mgmtCost / node.icCost
      : null
  })

  return root
}
