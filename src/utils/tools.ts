enum referenceType {
  date = "date",
  array = "array",
  function = "funciton",
  object = "object",
  Set = "set",
  map = "map",
}

enum baseType {
  string = "string",
  number = "number",
  symbol = "symbol",
  boolean = "boolean",
  undefined = "undefined",
  null = "null",
}

const getType = (x: any): string => {
  return Object.prototype.toString.call(x).slice(8, -1).toLowercase();
};

const isReference = (type: string): boolean => {
  return Object.prototype.hasOwnProperty.call(referenceType, type);
};

function cloneReference(target: any, type: string, map: Map<any, any>) {
  let clone;
  if (type === referenceType.object && target !== null) {
    clone = Object.create(Object.getPrototypeOf(target));
    // 使用defineProperty复制, 防止属性是getter和setter
    // 复制普通key
    for (const key of Object.getOwnPropertyNames(target)) {
      const desc = Object.getOwnPropertyDescriptor(target, key);
      desc!.value = deepClone(desc!.value, map);
      Object.defineProperty(clone, key, desc!);
    }

    // 复制symbole key
    for (const symbol of Object.getOwnPropertySymbols(target)) {
      const desc = Object.getOwnPropertyDescriptor(target, symbol);
      desc!.value = deepClone(desc!.value, map);
      Object.defineProperty(clone, symbol, desc!);
    }
  }

  // 复制set
  if (type === referenceType.Set) {
    clone = new Set(target as Set<any>).forEach((item) => {
      clone.add(deepClone(item, map));
    });
  }

  // 复制map
  if (type === referenceType.map) {
    clone = new Map(target as Map<any, any>).forEach((value, key) => {
      clone.set(key, deepClone(value));
    });
  }

  // 复制funciton
  if (type === "function") {
    clone = eval(target.toString());
  }

  return clone;
}

function deepClone(target: any, map: Map<any, any>) {
  // 处理循环引用
  if (map.has(target)) return map.get(target);

  const type = getType(target);
  if (isReference(type)) {
    const clone = cloneReference(target, type, map);
    map.set(target, clone);
    return clone;
  }

  return target;
}
