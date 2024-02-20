import Observe from './observer.js'
import Compiler from "./compiler.js";

export default class Vue {
  options
  constructor(options) {
    this.options = options ?? {}
    // 获取el
    this.$el = typeof this.options.el === "string"
      ? document.querySelector(this.options.el)
      : options.el

    // 获取data
    this.$data = options.data || {}
    // 处理data中的属性
    this._proxyData(this.$data)

    // 用Observe将data转换为响应式
    new Observe(this.$data)
    new Compiler(this)
  }

  /**
   * 将对象中的属性转换为响应式并挂载到vue实例上
   * @param data - 要转换的data
   * @private
   */

  _proxyData(data) {
    Object.keys(data).forEach(key => {
      // 将data中的数据转化为getter和setter挂载到vue实例中
      Object.defineProperty(this, key, {
        enumerable: true,
        configurable: true,
        get() {
          return data[key]
        },
        set(newValue)  {
          // 判断新旧值是否相等
          if (newValue === data[key]) return
          data[key] = newValue
        }
      })
    })
  }
}