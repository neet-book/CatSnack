const createElm = () => {
}


/**
 * 判断是否是相同节点
 * 如果tag和key相同那就是相同节点, 进行就地复用
 * @param oldVnode
 * @param newVnode
 * @return {boolean}
 */
const isSameVnode = (oldVnode, newVnode) => {
  return oldVnode.tag === newVnode.tag && oldVnode.key === newVnode.key
}


function makeIndexByKey(children) {
  let map = {}
  children.forEach((item, index) => {
    map[item.key] = index
  })

  return map
}


const updateChildren = (parent, oldCh, newCh) => {
  // 旧子节点起始下标
  let oldStartIndex = 0
  // 第一个旧子节点
  let oldStartVnode = oldCh[0]
  // 旧子节点的结束下标
  let oldEndIndex = oldCh.length - 1
  // 旧子节点的结束节点
  let oldEndVnode = oldCh[oldEndIndex]

  // 旧子节点起始下标
  let newStartIndex = 0
  // 第一个旧子节点
  let newStartVnode = newCh[0]
  // 旧子节点的结束下标
  let newEndIndex = newCh.length - 1
  // 旧子节点的结束节点
  let newEndVnode = newCh[newEndIndex]

  // 用key来创建旧子节点的index映射表, 类似 {'a':0,'b':1} 代表key为'a'的节点在第一个位置 key为'b'的节点在第二个位置
  // 保留对比之前, 旧节点列表的index映射关系
  let map = makeIndexByKey(oldCh)

  // 新老双指针起始位置不大于结束位置的时候, 才能循环, 一方停止了循环就要结束循环
  while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
    // 暴力对比过程吧移动的vnode设为undefined, 不存在vnode则跳过
    if (!oldStartVnode) {
      oldStartVnode = oldCh[++oldStartIndex]
      continue
    }
    // 暴力对比过程吧移动的vnode设为undefined, 不存在vnode则跳过
    if (!oldEndVnode) {
      oldEndVnode = oldCh[--oldEndIndex]
      continue
    }

    // 头和头对比, 依次向后追加
    if (isSameVnode(oldStartVnode, newStartVnode)) {
      patch(oldStartVnode, newStartVnode) // 递归比较子节点和他们的子节点
      // 比较或更新完毕, 指针向下一个节点移动
      oldStartVnode = oldCh[++oldStartIndex]
      newStartVnode = newCh[++newStartIndex]
      continue
    }

    // 尾和尾对比, 依次向前追加
    if (isSameVnode(oldEndVnode, newEndVnode)) {
      patch(oldEndVnode, newEndVnode) // 递归比较子节点和他们的子节点
      // 比较或更新完毕, 指针向前一个节点移动
      oldEndVnode = oldCh[--oldEndIndex]
      newEndVnode = newCh[--newEndIndex]
      continue
    }


    // 旧的头部和新的尾部比较, 相同把老的头部移动到新的尾部
    if (isSameVnode(oldStartVnode, newEndVnode)) {

      patch(oldStartVnode, newEndVnode)
      // insertBefore可以移动或者插入真实dom
      // nextSibling: 返回父节点childNodes中当前节点的下一个节点
      parent.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling)
      oldStartVnode = oldCh[++oldStartIndex]
      newEndVnode = newCh(--oldEndIndex)
      continue
    }

    // 旧的尾部和新的头部节点进行对比
    if (isSameVnode(oldEndVnode, newStartVnode)) {
      patch(oldEndVnode, newStartVnode)
      // 把老的尾部移动到新的头部
      parent.insertBefore(oldEndVnode.el, oldStartVnode.el)
      oldEndVnode = oldCh[--oldEndIndex]
      newStartVnode = newCh[++newStartIndex]
      continue
    }

    // 4种情况都不对, 进行暴力对比
    // 查找老节点
    let moveIndex = map[newStartVnode.key]

    if (!moveIndex) {
      // 不存在老节点, 直接插入
      parent.insertBefore(createElm(newStartVnode), oldStartVnode.el)
    } else {
      let moveVnode = oldCh[moveIndex]
      oldCh[moveIndex] = undefined  // 占位符, 防止数组塌陷, 防止老节点移走之后破坏最初的映射表
      parent.insertBefore(moveVnode.el, oldStartVnode)  // 找到的节点移动到最前面
      patch(moveVnode, newStartVnode)
    }

    newStartVnode = newCh[++newStartIndex]
  }


  // 老节点循环完毕, 新节点还有, 证明新节点需要被添加到头部或尾部
  if (newStartIndex <= newEndIndex) {
    for (let i = newStartIndex; i <= newEndIndex; i++) {
      const el = newCh[newEndIndex + 1] == null
        ? null
        : newCh[newEndIndex + 1].el
      parent.insertBefore(createElm(newCh[i]), el)
    }
  }

// 新节点循环完毕, 老节点还有, 说明老的节点需要被删除
  if (oldStartIndex <= oldEndIndex) {
    for (let i = oldStartIndex; i <= oldEndIndex; i++) {
      const child = oldCh[i]
      if (child !== undefined) {
        parent.el.removeChild(child.el)
      }
    }
  }
}

/**
 * 更新节点属性
 * @param vnode - 新节点
 * @param oldProps - 旧节点的属性
 */
const updateProperties = (vnode, oldProps = {}) => {
  const newProps = vnode.data ?? {}
  // 真实节点
  const el = vnode.el

  // 如果新节点没有, 就需要把老节点的属性移除
  for (const key in oldProps) {
    if (!newProps[key]) {
      el.removeAttribute(key)
    }
  }

  // 如果新节点没有该样式则设置为空
  const newStyle = newProps.style || {}
  const oldStyle = oldProps.style || {}
  for (const key in oldStyle) {
    if (!newStyle[key]) {
      el.style[key] = ''
    }
  }

  // 遍历新属性进行增加
  for (const key in newProps) {
    if (key === 'style') {
      for (const styleName in newProps.style) {
        el.style[styleName] = newStyle.style[styleName]
      }
    } else if (key === 'class') {
      el.className = newProps.class
    } else {
      el.setAttribute(key, newProps[key])
    }
  }
}

const patch = (oldVnode, vnode) => {
  const isRealElement = oldVnode.nodeType

  if (isRealElement) {
    // 初次渲染
  } else {

    // 判断新旧节点是否相同
    if (oldVnode.tag !== vnode.tag) {
      // 用新的替换旧的 oldVnode.el代表的是真实dom节点--同级比较
      // 直接用将新节点替换掉旧节点
      const newEl = createElm(vnode)
      oldVnode.el.parentNode.replaceChildren(newEl, oldVnode.el)
      oldVnode.el = newEl
    }

    // 旧节点是一个文本节点
    // 复用元素, 只替换文本
    if (!oldVnode.tag) {
      if (oldVnode.text !== vnode.text) {
        oldVnode.el.textContent = vnode.text
      }
    }

    // 不是文本节点, 且标签相同

    const el = (vnode.el = oldVnode.el)   // 节点复用, 所以要将旧的虚拟dom节点对应的真实dom赋值给新的虚拟dom
    // 先更新属性
    updateProperties(vnode, oldVnode.data)  // 更新属性

    // 更新子节点

    // 旧虚拟节点的子节点
    const oldCh = oldVnode.children || []
    // 新虚拟节点的子节点
    const newCh = vnode.children || []

    // 新老节点都存在子节点
    if (oldCh.length > 0 && newCh.length > 0) {
      // 更新子节点
      updateChildren(el, oldCh, newCh)
    } else if (oldCh.length) {
      // 老节点有子节点说明是新节点没有子节点
      el.innerHTML = ''
    } else if (newCh.length) {

      // 旧的没有子节点, 新的节点有子节点
      // 添加子节点
      const fragment = document.createDocumentFragment()

      for (const child of newCh) {
        // 添加子节点
        fragment.appendChild(createElm(child))
      }
      el.appendChild(fragment)
    }
  }
}

export default patch

/**
 * diff
 * @param {HTMLElement}parent
 * @param newCh
 * @param oldCh
 */
const patchChildren = (parent, newCh, oldCh) => {
  let newStarIndex = 0
  let newStartVnode = newCh[newStarIndex]
  let oldStartIndex = 0
  let oldStartVnode = oldCh[oldStartIndex]

  let newEndIndex = newCh.length - 1
  let newEndVnode = newCh[newEndIndex]
  let oldEndIndex = oldCh.length - 1
  let oldEndVnode = oldCh[oldEndIndex]

  // 缓存旧节点最初的映射关系
  const map = makeIndexByKey(oldCh)

  while (newStarIndex <= newEndIndex && oldStartIndex <= oldEndIndex) {
    // 因为暴力对比删除的旧节点
    if (oldStartVnode === undefined) {
      oldStartVnode = oldCh[++oldStartIndex]
      continue
    }

    // 因为暴力对比删除的旧节点
    if (oldEndVnode === undefined) {
      oldEndVnode = oldCh[--oldEndIndex]
    }

    // 头与头对比
    if (isSameVnode(oldStartVnode, newStartVnode)) {
      patch(oldStartVnode, newStartVnode)
      oldStartVnode = oldCh[++oldStartIndex]
      newStartVnode = newCh[++newStarIndex]
      continue
    }

    // 尾与尾对比
    if (isSameVnode(oldEndVnode, newEndVnode)) {
      patch(oldEndVnode, newEndVnode)
      oldEndVnode = oldCh[--oldEndIndex]
      newEndVnode = newCh[--newEndIndex]
      continue
    }

    // 头与尾对比
    if (isSameVnode(oldStartVnode, newEndVnode)) {
      // 将头部节点移动到尾部
      parent.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling)
      oldStartVnode = oldCh[++oldStartIndex]
      newEndVnode = newCh[--newEndIndex]
      continue
    }

    // 尾与头对比
    if (isSameVnode(oldEndVnode, newStartVnode)) {
      // 插入当前oldStartVnode的前面
      parent.insertBefore(oldEndVnode.el, oldStartVnode.el)
      oldEndVnode = [--oldEndIndex]
      newStartVnode = [++newStarIndex]
      continue
    }

    // 4种情况都不对
    // 暴力对比
    const moveIndex = map[newStartVnode.key]

    if (moveIndex=== undefined) {
      // 如果旧节点中不存在则直接插入到当前旧节点前面
      parent.insertBefore(createElm(newStartVnode), oldStartVnode.el)
    } else {
      const moveVnode = oldCh[moveIndex]
      parent.insertBefore(moveVnode, oldStartVnode.el)
      patch(moveVnode, newStartVnode)
      oldCh[moveIndex] = undefined
    }

    newStartVnode = [++newStarIndex]
  }

  // 循环对比结束

  // 新节点有多
  if (newStarIndex <= newEndIndex) {
     for (let i = newStarIndex; i <= newEndIndex; i++) {
       // 判断当前newEndIndex所指向的成员后面是否还有一个成员
       // 有则说明后面这个是在旧节点中也存在的被复用的节点, 并且多出来的节点是位于中间位置的不是结尾, 应该插到它前面
       // 如果没有说明多出的节点位于结尾, 直接插入到最后面
       const endEl = newCh[newEndIndex + 1] == null
         ? null
         : newCh[newEndIndex + 1].el

       parent.insertBefore(createElm(newCh[i]), endEl)
     }
  }

  // 旧节点有多
  if (oldStartIndex <= oldEndIndex) {
    for (let i = oldStartIndex; i <= oldEndIndex; i++) {
      // 删除相应的旧节点
      if (oldCh[i]) parent.removeChild(oldCh[i].el)
    }
  }
}