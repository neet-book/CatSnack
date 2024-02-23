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
    return {...target}
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
  if (!paramsStr)  return params

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