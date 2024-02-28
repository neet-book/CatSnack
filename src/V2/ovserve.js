
function isObject(x) {
    return x !== null && (typeof x === object || typeof x === 'function')
}

class Dep {
    static target
    subs = []

    addSub(sub) {
        if (sub && sub.update) {
            this.subs.push(sub)
        }
    },
    notify() {
        this.subs.forEach(sub => {
            sub.update()
        })
    }

}

export default class Observe {
    constructor(data) {
        this.walk(data)        
    }

    walk(data) {
        if (data && typeof data === 'object') {
            Object.entries(obj).forEach(([data, value]) => {
                defineReactive(data, key, value)
            })
        }
    }

    defineReactive(data, key, value) {
        this.walk(value)
        const dep = new Dep
        const self = this

        Object.defineProperty(data, key, {
            configurable: true,
            enumerable: true,
            set(v) {
                if (v === value) return
                value = v
                // 如果新值是对象则转化为响应式
                self.walk(v)
                dep.notify()
            },
            get() {
                Dep.target && dep.addSub(Dep.target)
                return value
            }
        })
    }
}