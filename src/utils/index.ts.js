/**
 * 实现数据类型判断
 * - typeof 只能判断基础数据类型, 函数, 而对于其他类型如Date, RegExp, Array则都会是Object
 * @param obj
 * @return {string}
 */
const typeOf = (obj) => {
  return Object.prototype.toString.call(obj).slice(8, -1).toLowerCase()
}

/**
 * 判断是否是构造函数的实例
 * 通过判断构造函数的原型对象, 是否出现在实例的原型链上
 * @param {Object} left - 实例
 * @param {Object} right - 构造函数
 */
function instanceOf1(left, right) {
  let leftProto = Object.getPrototypeOf(left)
  let rightProto = Object.getPrototypeOf(right)


  while (true) {
    if (leftProto === null) {
      return false
    }

    if (leftProto === rightProto) {
      return true
    }
    leftProto = Object.getPrototypeOf(leftProto)
  }
}


/**
 * 判断是否是构造函数的实例
 * 通过判断构造函数的原型对象, 是否出现在实例的原型链上
 * @param {Object} instance - 实例
 * @param {Object} constructor - 构造函数
 */
function instanceOf2(instance, constructor) {
  constructor.prototype.isPrototypeOf(instance)
}


/**
 * 原型链继承
 */

function Animal() {
  this.color = 'rad'
}

Animal.prototype.getColor = function () {
  return this.color
}

/**
 * 盗用构造函数继承
 */

function SuperType() {
  this.color = 'rad'
}

function SubType() {
  SuperType.call(this)
}

/**
 * 组合继承
 */

function SuperType(name) {
  this.name = name
}

function SubType(name, age) {
  // 继承父类属性
  SuperType.call(this, name)
  this.age
}

// 继承父类方法
SubType.prototype = new SubType
// 定义子类自己的方法
SubType.prototype.sayName = function () {
}

/**
 * 寄生式继承
 */
function object(o) {
  function F() {
  }

  F.prototype = o
  return new F
}

function SuperType(name) {
  this.name = name
}

SuperType.prototype.sayName = function () {
}

function SubType(name, age) {
  // 继承属性
  SuperType.call(this, name)
}

// 继承父类方法
SubType.prototype = object(SuperType.prototype)
// 修复constructor丢失
SuperType.prototype.constructor = SubType


/**
 * 数组去重
 */
function unique(arr) {
  return arr.filter(function (item, index, array) {
    return array.indexOf(item) === index
  })
}

function unique2(arr) {
  return [...new Set(arr)]
}


/**
 * 浅拷贝
 */

const isObject = (obj) => {
  return obj !== null && typeof obj === 'object'
}

function shallowCope1(target) {
  if (Array.isArray(target)) {
    return [...target]
  } else if (isObject(target)) {
    return { ...target }
  }
  return target
}

function shallowCopy2(target) {
  const clone = typeOf(target) === 'array'
    ? []
    : {}

  for (const key in target) {
    if (target.hasOwnProperty(key)) {
      clone[key] = target[key]
    }
  }

  return clone
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

function isObject(obj) {
  return (typeof obj === 'object' || typeof === 'function') && obj !== null
}

function deepCloneObj(target, map = new WeakMap) {
  // 处理循环引用
  if (map.has(target)) return map.get(target)

  // 处理对象
  if (type === 'object') {
    const clone = map.set(target, clone)
    for (const key in target) {
      if (target.hasOwnProperty(key)) {
        if (typeOf(target[key]) === 'object') {
          clone[key] = deepCloneObj(target[key], map)
        } else {
          clone[key] = target[key]
        }
      }
    }

    return clone
  } else {
    return target
  }
}


function deepCloneAll(target, map = new WeakMap) {
  if (map.has(target)) return map.get(target)

  const type = typeOf(target)
  let clone
  // 处理正则和日期
  if (type === 'regexp' || type === 'date') {
    const Ctr = Object.getPrototypeOf(target).constructor
    return new Ctr(target)
  }

  // 处理symbol
  if (type === 'symbol') {
    return Symbol.for(target.description) === target ? target : Symbol(target.description)
  }

  // 处理function
  if (type === 'function') {
    return eval(target.toString())
  }

  // 处理set
  if (type === 'set') {
    clone = new Set
    map.set(target, clone)
    target.forEach(item => clone.add(deepCloneAll(item, map)))
    return clone
  }
  // 处理map
  if (type === 'map') {
    clone = new Map
    map.set(target, clone)
    target.forEach((value, key) => {
      map.set(key, deepCloneAll(value, map))
    })
    return map
  }

  // 处理object
  if (type === 'object') {
    clone = Object.create(Object.getPrototypeOf(target))
    map.set(target, clone)
    for (const key of Object.getOwnPropertyNames(target)) {
      // 使用描述对象, 反正出现getter或setter
      const disc = Object.getOwnPropertyDescriptor(target, key)
      disc.value = deepCloneAll(disc.value, map)
      Object.defineProperty(clone, key, disc)
    }

    return clone
  }

  if (type === 'array') {
    clone = []
    map.set(target, clone)
    for (const value of target) {
      clone.push(deepCloneAll(value, map))
    }
  }

  return target
}

let c = {}


let o = {
  a: 1,
  b: Symbol('as'),
  c: Symbol.for('aa'),

  d: c
}

c.b = o

/**
 * 解析url参数
 * @param url
 */
const parseParam = (url) => {
  const pattern = /(?<=\?)[^#]+/
  const params = {}
  const paramsStr = pattern.exec(url)?.[0]
  if (!paramsStr) return params

  for (let param of paramsStr.split('&')) {
    // 包含=
    if (param.includes('=')) {
      let [key, value] = param.split('=')
      value = decodeURIComponent(value)

      if (Object.hasOwnProperty.call(params, key)) {
        params[key] = [].concat(params[key], value)
      } else {
        params[key] = value
      }
    } else {
      // 处理没有=的参数
      params[param] = true
    }
  }
}

const partial = (fun, ...params) => {
  return function (...args) {
    return fun.call(this, ...params, ...args)
  }
}

function render(template, data) {
  const pattern = /\{(\w)}/g
  return template.replaceAll(pattern, (_, key) => {
    return data[key]
  })
}

/**
 * @type{HTMLIFrameElement[]}
 */
const imgList = []
// const length = imgList.length

// const imgLazyload = function () {
//   let count = 0
//   return function() {
//     let deletedIndexList = []
//     const windowHeight = window.innerHeight

//     imgList.forEach((img, index) => {
//       let rect = img.getBoundingClientRect() 
//       if (rect.top < windowHeight) {
//         img.src = img.dataset.src
//         deletedIndexList.push(index)
//         count++
//         if (count === length) {
//           document.removeEventListener('scroll', imgLazyload)
//         }
//       }
//     })
//     imgList = imgList.filter((_, index) => !deletedIndexList.includes(index))
//   }
// }


/**
 * 
 * @param {HTMLImageElement[]} imgList 
 */
const imgLazyload = (imgList) => {
  /**
   * 
   * @param {IntersectionObserverEntry[]} entries 
   */
  const observeCallback = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        img = entry.target
        img.src = img.dataset.src
        observer.unobserve(img)
      }
    })
  }

  const observer = new IntersectionObserver(observeCallback, {
    rootMargin: '50px'
  })
  imgList.forEach(img => observer.observe(img))

}

/**
 *  防抖函数 
 * @param {Function} func - 要防抖的函数
 * @param {number} wait - 等待的时间, 单位为`毫秒`
 * @param {boolean} immediate - 是否立即执行
 * @returns 带有取消功能的已防抖函数
 */
function debounce(func, wait, immediate) {
  let timeout
  let result

  const debounced = function () {
    const context = this
    const args = arguments

    if (timeout) clearTimeout(timeout)

    if (immediate) {    // 立即执行
      // 有timeout则说明已经执行过了
      const callNow = !timeout
      timeout = setTimeout(() => {
        timeout = null
      }, wait)

      if (callNow) result = func.apply(context, [...args])
    } else {     // 不立即执行
      timeout = setTimeout(() => {
        func.apply(context, [...args])
        timeout = null
      })
    }

    return result
  }

  debounced.cancel = () => {
    clearTimeout(timeout)
    timeout = null
  }

  return debounced
}

const throttle = (func, wait, options) => {
  let timeout, context, args
  // 之前执行的时间
  let previous = 0
  options = options ?? {}
  const later = () => {
    previous = options.leading === false ? 0 : Date.now()
    timeout = null
    func.apply(context, args)
    context = args = null
  }

  const throttled = function () {
    const now = Date.now()
    // previous == 0, 且不立即执行
    if (!previous && !options.leading) previous = now

    // 还需要等待多久
    let remaining = wait - (now - previous)
    context = this
    args = [...arguments]
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout)
        timeout = null
      }

      previous = now
      func.apply(context, args)
      if (!timeout) context = args = null
    } else {
      timeout = setTimeout(later, remaining)
    }
  }

  throttled.cancel = () => {
    clearTimeout(timeout)
    previous = 0
    timeout = null
  }

}

/**
 * 
 * @param {Function} func 
 * @param {number} wait 
 * @param {object} options 
 * @param {boolean} options.trailing - 结束后是否再调用一次
 * @param {boolean} options.leading - 是否立即执行一次
 */
function throttle2(func, wait, options) {
  let context, args, timeout
  options = options ?? {}

  let previous = 0

  const later = () => {
    timeout = null
    func.apply(context, args)
    const now = Date.now()
    previous = now
    context = args = null
  }

  return function () {
    const now = Date.now()
    context = this
    args = [...arguments]
    if (previous === 0 && options.leading !== false) {
      previous = now
    }

    const remaining = wait - (now - previous)
    if (remaining <= 0) {
      if (timeout) {
        // 是结束后执行或结束后再执行一次
        clearTimeout(timeout)
        timeout = null
      }

      func.apply(context, args)
      previous = now
      context = args = null
    } else if (!timeout && options.leading === false) {
      timeout = setTimeout(later, remaining)
    }
  }


}


const partial2 = (func, ...args) => {
  const holderIndex = args.findIndex('_')
  return function (...args2) {
    args[holderIndex] = args2.shift()
    return func.call(this, ...args, ...args2)
  }
}


const generUrl = (url, params) => {
  const p = new URLSearchParams(params)
  for (const [key, value] of Object.entries(params)) {
    p.append(key, value)
  }

  return url + '?' + p.toString()
}


const jsonp = ({ url, params, callbackName }) => {
  return new Promise((resolve) => {
    const el = document.body.createElement('script')
    el.src = generUrl(url, {
      ...params,
      callback: callbackName
    })
    document.body.appendChild(el)
    window[callbackName]  = (data) => {
      resolve(data)
      document.body.removeChild(el)
    }
  })
}


function forEach(callback, thisArg) {
  if (this === null) {
    throw new TypeError('this is null or not defined')
  }
  if (typeof callback !== 'function') {
    throw new TypeError('callback is not a function')
  }
  const a = Object(this)
  
}



function throttle3(func, wait, leading = true) {
  let context, args, timeout
  let previous = 0

  const later = () => {
    previous = Date.now()
    if (!leading) {
      func.apply(context, args)
    }
    timeout = null
    context = args = null
  }

  return function (...args2) {
    context = this
    args = args2
    const now = Date.now()

    // 非立即执行
    if (previous === 0 && !leading) {
      previous = now
    }

    let remaining = wait - (now - previous)
    if (remaining <= 0) {
      if (timeout) {
        clearTimeout(timeout)
        timeout = null
      }
        func.apply(context, args)
        previous = now
        context = args = null
    } else if (!timeout && !leading){
      timeout = setTimeout(later, remaining)
    }
  }
}

const jsp = (url, params, callback) => {
  return new Promise(resolve => {
    const query = new URLSearchParams({
      ...params,
      callback
    })
    const script = document.createElement('script')

    window[callback] = (data) => {
      document.body.removeChild(script)
      resolve(data)
    }

    script.src = url + '?' + query.toString()
    document.body.appendChild(script)
  })
}

const curry = (func, ...args) => {
  const total = [...args]
  const curried = (...args2) => {
    total.push(...args2)
    if (total.length < func.length) {
      return curreyed
    } else {
      return func.apply(this, total)
    }
  }

  return curried
}

const partial3 = (func, ...args) => {
  const index = args.indexOf('_')

  return function(...args2) {
    args[index] = args2.shift()   
    return func.apply(this, [...args, ...args2])
  }
}

function forEach(callback, thisArg) {
  if (this === null || this === undefined) {
    throw new TypeError('this is null ro undefined')
  }

  const o = Object(this)

  // 将length转换为正整数
  const len = o.length >>> 0
  for (let i = 0; i < len; i++) {
    if (i in o) {
      callback.call(thisArg, o[i], i, o)
    }
  }
}

function reduce (callback, init) {
  if (this === null || this === undefined) {
    throw new TypeError('this is null ro undefined')
  }

  const o = Object(this)
  // 将length转换为正整数
  const len = o.length >>> 0
  const res = []
  for (let i = 0; i < len; i++) {
    if (i in o) {
      res[i] = callback.call(thisArg, o[i], i, o)
    }
  }

  return res
}

function reduce () {
  if (this === null || this === undefined) {
    throw new TypeError('this is null ro undefined')
  }

  const o = Object(this)

  // 将length转换为正整数
  const len = o.length >>> 0

  if (len === 0) {
    if (init !== undefined) {
      return init
    } else {
      throw new Error('没有传入初始值')
    }
  }


  if (len === 1 && init === undefined) return o[0]

  let acc = init ?? o[o]

  let i = init === undefined ? 1 : 0
  
  for (; i < init; i++) {
    acc = callback(acc, o[i], i, o)
  }

  return acc
}


const call = (fun, self, ...args) => {
  const ctx = self ?? window 
  ctx.$F = fun
  const res = ctx.$F(...args)
  delete ctx.$F
  return res
}

function sayA (name, age) {
  console.log(this.a, name, age)
}


sayA.c  = function () {
  const __func = this
  if (typeof __func !== 'function') {
    throw new TypeError(this, '不是函数')
  }

  const args = []
  for (let i = 0; i < arguments.length; i++) {
    args.push(arguments[i])
  }

  let context = args.shift() ?? window
  if (typeof context !== 'object') context = Object(context)


  let paramsStr = '' 
  for (let i = 0; i < args.length; i++) {
    console.log(paramsStr)
    paramsStr += 'args[' + i + '], '
  }
  console.log(paramsStr, args)
  paramsStr = paramsStr.slice(0, -2)
  

  context.__func = __func
  const result = Function('context', 'args', 'return context.__func(' + paramsStr + ')')(context , args)
  delete context.__func
  return result
}
sayA.c({a: 1}, 'li', 1)


sayA.b = function (thisArg, args) {
  const __func = this
  if (typeof __func !== 'function') {
    throw new TypeError('this is not a funciton')
  }

  let context = thisArg ?? window
  if (typeof thisArg !== 'object') {
    context = Object(thisArg)
  }

  args = args ?? []

  let argStr = ''
  for (let i = 0; i < args.length; i++) {
    argStr += 'args[' + i + '],'
  }
  argStr = argStr.slice(0,-1)
  context.__func = __func
  const res = Function('context', 'args', 'return context.__func(' + argStr + ')')(context, args)
  delete context.__func
  return res
}


class Mp {
  static PENDING = 'pending'
  static FULFILLED = 'fulfilled'
  static REJECTED = 'rejected'

  result = undefined
  state = Mp.PENDING

  resolveTaskList = []
  rejectTaskList = []

  constructor(callback) {
    try {
      callback(tihs.resolve.bind(this), this.reject.bind(this))
    } catch (err) {
      this.reject(err)
    }
  }

  resolve(result) {
    if (this.state === Mp.PENDING) {
      this.state = Mp.FULFILLED
      this.result = result

      for (task of this.resolveTaskList) {
        task(this.result)
      }
    }
  }

  reject(reason) {
    if (this.state === Mp.PENDING) {
      this.state = Mp.REJECTED
      this.result = result

      for (task of this.rejectTaskList) {
        task(this.result)
      }
    }
  }
}