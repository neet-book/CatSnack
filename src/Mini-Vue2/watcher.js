import Dep from "./dep.js";

export default class Watcher {

  /**
   * 创建观察者实例
   * @param vm - Vue实例
   * @param key - data的属性值
   * @param cb - 回调函数, 更新视图的具体方法
   */
  constructor(vm, key, cb) {
    this.vm = vm
    this.key = key
    this.cb = cb

    // 设置观察者为当前实例
    Dep.target = this
    // 存储旧数据, 更新视图是用来比较
    // 同时触发get收集依赖
    this.oldValue = vm[key]
    //  依赖已经收集到了, Dep.target重置
    Dep.target = null
  }

  /**
   * 更新
   */
  update () {
    let newValue = this.vm[this.key]
    // 值没有变化则不更新视图
    if (newValue === this.oldValue) return
    // 调用具体的更新方法
    this.cb(newValue)
  }
}