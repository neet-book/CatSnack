import patch from "../Mini-Vue2/vdom/patch"

const isSameVnode = (n1, n2) => {

}

const patchChildren = (c1, c2, parent) => {
    let oldStartIndex = 0
    let newStartIndex = 0

    let oldEndIndex = c1.length - 1
    let newEndIndex = c2.length - 1

    let oldStartVnode = c1[oldStartIndex]
    let newStartVnode = c2[newStartIndex]
    let oldEndVnode = c1[oldEndIndex]
    let newEndVnode = c2[newEndIndex]

    const oldIndexKeyMap = Object.fromEntries(c1.map((node, i) => {
        return [node.key, i]
    }))

    for (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {

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
        // 头与头对比
        if (isSameVnode(oldStartVnode, newStartVnode)) {
            patch(oldStartIndex, newStartVnode, parent)
            oldStartVnode = c1[++oldStartIndex]
            newStartVnode = c2[++newStartIndex]
            continue
        }

        if (isSameVnode(oldEndVnode, newEndVnode)) {
            patch(oldEndVnode, newEndVnode)
            oldEndVnode = c1[--oldEndIndex]
            newEndVnode = c2[--newEndIndex]
            continue
        }


        // 头尾对比
        if (isSameVnode(oldStartVnode, newEndVnode)) {
            patch(oldStartVnode, newEndVnode)
            oldStartVnode = c1[++oldStartIndex]
            newEndVnode = c2[--newEndIndex]
            continue
        }

        // 尾头对比
        if (isSameVnode(oldStartVnode, newStartVnode)) {
            patch(oldEndVnode, newStartVnode)
            oldEndVnode = c1[--oldEndIndex]
            newStartVnode = c2[++newStartIndex]
            continue
        }

        // 暴力对比

        const moveIndex = oldIndexKeyMap[newStartVnode.key]
        if (moveIndex === undefined) {
            parent.insertBefore(newStartVnode, oldStartVnode.el)
        } else {
            let moveVnode = c1[moveIndex]
            parent.insertBefore(moveVnode, oldStartVnode.el)
            patch(moveVnode, newStartVnode)
            c1[moveIndex] = undefined

        }
        newStartVnode = c2[++newStartIndex]
    }

    if (oldStartIndex <= oldEndIndex) {
        for(const i = oldStartIndex; i <=oldEndIndex; i++ ) {
            if (c1[i] !== undefined)  parent.remove(c1[i])  
        }
    }

    if (newStartIndex <= newEndIndex) {
        const anchor = c2[newEndIndex + 1] === null
        ? null
        : c2[newEndIndex + 1].el
        for (const i = newStartIndex; i <= newEndIndex; i++) {
            parent.insertBefore(createEl(c2[i]), anchor)
        }
    }
}