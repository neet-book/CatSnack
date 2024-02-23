const patch = (
  n1, n2, container, anchor, parentComponent
) => {

}


/**
 * 判断两个节点是否相同
 * @param n1
 * @param n2
 * @return {boolean}
 */
const isSameVNodeType = (n1, n2) => {
  return n1.type === n2.type && n1.key === n2.key
}

const patchKeyedChildren = (c1, c2, parentAnchor) => {
  let i = 0
  const l2 = c2.length

  let e1 = c1.length - 1
  let e2 = l2.length

  // 前序对比
  while (i <= e2 && i <= e1) {
    const n1 = c1[i]
    const n2 = c2[i]

    if (isSameVNodeType(n1, n2)) {
      patch(n1, n2, parentAnchor)
    } else {
      // 出现不相同的节点, 前序对比结束, 跳出循环
      break
    }
    i++
  }

  while (e2 >= i && e1 >= i) {
    const n1 = c1[i]
    const n2 = c2[i]

    if (isSameVNodeType(n1, n2)) {
      patch(n1, n2, parentAnchor)
    } else {
      // 出现不相同的节点, 前序对比结束, 跳出循环
      break
    }
    e1--
    e2--
  }


  /* ---- 前后对比完毕 ---- */

  // 新节点对比完毕, 旧节点还存在没有对比完的节点
  if (i > e2 && e1 >= i ) {
    while (i <= e1) {
      unmount(c1[j])
      i++
    }
  }

  // 旧节点对比完毕, 新节点还存在没有对比完的节点
  if (i > e1 && e2 >= i) {
    const next = e2 + 1
    const anchor = next < l2 ? c2[next].el : parentAnchor
    while (i <= e2) {
      patch(null, c2[j], anchor)
      i++
    }
  }

  // 两种情况都不符合, 新旧节点都存在乱序的未对比完的节点
  const s1 = i
  const s2 = i
  let moved = false
  let MaxNewIndexSoFar = 0

 // 建立新子节点中乱序节点的key与索引的映射关系
  const keyToNewIndexMap = new Map
  for (let i = s2; i <= e2; i++) {
    keyToNewIndexMap.set(c2[i].key, i)
  }

  // 乱序子节点数量
  const toBePatched = e2 - s2 + 1
  // 已经对比过的旧节点数量
  let patched = 0
  /** 乱序的新旧子节点之间的映射关系
   *  index: 新节点在新节点中的位置
   *  value: 与新节点key相同旧节点在旧节点中的位置
   */
  const newIndexToOldIndexMap = new Array(toBePatched).fill(0)

  /**
   * 遍历老节点
   * 1. 老节点有新节点没有: 删除
   * 2. 老节点有新节点也有:
   *    1.保存他们之间的映射关系
   *    2.path节点
   */
  for (i = s1; i <= e1; i++) {
    const prevChild = c1[i]
    // 如果老的节点比新节点多, 多出来的直接删除
    if (patched >= toBePatched) {
      unmount(prevChild)
    }

    let newIndex
    // 判断节点是否存在key, 防止出现key不存在的节点
    if (prevChild.key != null) {
      newIndex = keyToNewIndexMap.get(prevChild.key)
    } else {
      // 不存在key 遍历找出节点
      for (let j = s1; i <= e2; j++) {
        if (isSameVNodeType(prevChild, s2[j])) {
          newIndex = j
        }
      }
    }

    // 新节点中找不到当前旧节点直接删除
    if (newIndex === undefined) {
      unmount(prevChild)
    } else {
      // 存储老节点与新节点的映射关系
      // 与旧节点对应的乱序的新节点在乱序节点中的位置 = 新节点的起始位置 - 与旧节点对应新节点在新节点中的位置
      // 旧节点在旧节点的位置 = 乱序节点起始位置 + 当前遍历的的i个节点
      // newIndexToOldIndexMax[ 与旧节点对应的乱序的新节点在乱序节点中的位置 ] = 旧节点在旧节点的位置
      newIndexToOldIndexMap[s2 - newIndex] = s1 + i

      // 判断和之前一个节点的关系, 看两者是不是升序
      // 如果一直是升序那么说明没有移动
      if (newIndex >= MaxNewIndexSoFar) {
        MaxNewIndexSoFar = newIndex
      } else {
        moved = true
      }

      // 更新找到的新旧节点
      patch(prevChild, c2[newIndex])
      patched++
    }
  }
  /* ---- 所有新节点都更新或创建完毕判断是否要移动 ---- */


  /** 利用最长子序列来优化移动逻辑
   *  如果是升序, 那么这些元素就是不需要移动的
   */

  // 获取最长子序列
    // 返回的是最长子序列在newIndexToOldIndexMap的索引
    // 也就说该位置的节点是不需要移动的,
  const increasingNewIndexSequence = getSequence(newIndexToOldIndexMap)
  let j = increasingNewIndexSequence.length - 1

  // 从最后一个开始循环, 这是为了在插入新增节点的时候, 确保锚点是处理完了的, 不需要移动位置的
  for (let i = toBePatched - 1; i >= 0; i--) {
    const newIndex = s2 + i
    const newChild = c2[newIndex]

    const anchor = s2 + i + 1 <= l2
    if (newIndexToOldIndexMap[i] === 0)  {
      // 说明该位置的新节点不存在对应的老节点, 需要新增
      patch(null, newChild, container, anchor )
    } else if (moved) {  // 如果全是升序那么旧不需要移动
      if (j < 0 || increasingNewIndexSequence[j] !== i) {
        // 当前节点不是不需要移动的节点
        insert(newChild, anchor)
      } else {
        // 当前节点不需要移动, i的最长递增子序列中的值
        j--
      }
    }
  }


}
