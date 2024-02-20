import Dep from "./dep.js";
export default class Observer {
  constructor(data) {
    // 遍历data
    this.walk(data)
  }

  /**
   * 遍历data对象
   * @param data - data对象
   */
  walk(data) {
    // 判断是否为空或非对象
    if (!data || typeof data !== 'object') return

    Object.keys(data).forEach(key => {
      this.defineReactive(data, key, data[key])
    })
  }

  /**
   * 将对象属性转化为响应式
   * @param obj - 要转换成响应式的对象
   * @param key - 属性值
   * @param value -
   */
  defineReactive(obj, key, value) {
    // 如果值是对象则继续遍历, 变成响应式, 如果不是则会被return
    this.walk(value)

    // 创建当前属性的Dep对象, 用来收集依赖和触发更新
    const dep = new Dep()
    // 保存一下this
    const self = this
    Object.defineProperty(obj, key, {
      enumerable: true,
      configurable: true,
      get() {
        // target表示观察者, 全局唯一的
        Dep.target && dep.addSub(Dep.target)
        return value
      },
      set(newValue) {
        if (newValue === value) return
        // 存储新值
        value = newValue
        // 如果新对象是对象则遍历, 将其转换为响应式的
        self.walk(newValue)
        // 触发通知, 更新视图
        dep.notify()
      }
    })
  }
}