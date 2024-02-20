import Watcher from "./watcher.js";


export default class Compiler {

  /**
   * @param {Vue} vm - vue实例
   */
  constructor(vm) {
    this.vm = vm
    this.el = vm.$el

    this.compile(this.el)
  }

  /**
   * 编译模板, 递归所有子节点, 根据子节点类型进行相应的编译操作
   * @param {HTMLElement} el - 模板挂载的节点
   */
  compile(el) {
    // 获取所有子节点
    const childNodes = [...el.childNodes]
    childNodes.forEach(node => {
      // 根据不同节点类型来进行编译
      // 文本类型
      if (this.isTextNode(node)) {
        // 编译文本
        this.compileText(node)
      }

      // 元素节点
      if (this.isElementNode(node)) {
        // 编译元素节点
        this.compileElement(node)
      }

      // 判断是否存在子节点, 考虑是否要递归
      if (node.childNodes && node.childNodes.length) {
        this.compile(node)
      }
    })
  }

  /**
   * 判断元素属性是否是指令
   * @param {string} attr - 属性
   * @return {boolean}
   */
  isDirective(attr) {
    return attr.startsWith('v-')
  }

  /**
   * 判断是否是文本节点
   * @param {Node} node - 要判断的节点
   * @return {boolean}
   */
  isTextNode(node) {
    return node.nodeType === 3
  }

  /**
   * 判断是否是元素节点
   * @param {Node} node - 要判断的节点
   * @return {boolean}
   */
  isElementNode(node) {
    return node.nodeType === 1
  }

  /**
   * 编译文本节点
   * 1. 判断是否有动态绑定
   * 2. 有动态绑定则去掉括号, 获取其中的变量名, 不考虑表达式的情况
   * 3. 去vm中找到这个变量, 赋值给nodeContent
   * @param {Node} node - 文本节点
   */
  compileText(node) {
    // 匹配双大括号
    const patten = /\{\{([^}]+)}}/
    const text = node.textContent
    if (patten.test(text)) {
      let [_, key] = text.match(patten)
      key = key.trim()
      // 将双大括号替换
      node.textContent = text.replace(patten, this.vm.$data[key] ?? '')
      // 创建观察者
      new Watcher(this.vm, key, newValue => {
        node.textContent = newValue
      })
    }

  }

  /**
   * 编译元素节点
   * 1. 子处理指令
   * @param {HTMLElement} node - 要编译的元素
   */
  compileElement(node) {
    // 遍历节点上的属性
    [...node.attributes].forEach(attr => {
      if (this.isDirective(attr.name)) {
        const key = attr.value
        const attrName = attr.name
        // 将处理指令的操作采用update方法处理
        this.update(node, key, attrName.slice(2))
      }
    })
  }

  /**
   * 添加指令方法并执行
   * @param node - 元素
   * @param key - 指令的值, vm中的方法或值
   * @param attrName - 指令名
   */
  update(node, key, attrName) {
    let fun = this[attrName + 'Update']
    if (fun) {
      this[attrName + 'Update'](node, key, this.vm[key])
    }
  }

  /**
   * 执行text命令
   * @param node - 挂载的节点
   * @param key - vm上的属性名
   * @param value - 属性值
   */
  textUpdate(node, key, value) {
    node.textContent = value
  }

  /**
   * v-model命令
   * @param node
   * @param key - vm的属性名
   * @param value
   */
  modelUpdate(node, key, value) {
    console.log('model')
    node.value = value
    new Watcher(this.vm, key, (newValue) => {
      node.value = newValue
    })
    // 简单的双向绑定
    node.addEventListener('input', () => {
      console.log('model', key)
      this.vm[key] = node.value
    })
  }
}