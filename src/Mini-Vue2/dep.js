/**
 * 观察发布者模式中的观测发布者
 * 负责收集依赖该属性的watcher
 * 在对响应式属性进行更新的时候setter会调用Dep的notify方法通知更新
 */
export default class Dep {
  // 当前的函数
  static Target

  // 存储观察者
  sub = []

  /**
   * 添加依赖属性的观察者
   * @param sub - 观察者
   */
  addSub(sub) {
    if (sub && sub.update) {
      // 是否有传入sub, 并且是具有update方法的sub
      this.sub.push(sub)
    }
  }

  /**
   * 发布通知
   */
  notify() {
    this.sub.forEach(sub => sub.update())
  }
}