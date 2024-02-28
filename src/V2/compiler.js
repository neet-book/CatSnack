import Watcher from "./watch"

class Compiler {
    constructor(vm) {
        this.vm = vm
        this.el = vm.$el

        this.compile(this.el)
    }

    compile(el) {

    }

    modelUpdate(node, key, value){ 
        node.value = value
        new Watcher(this.vm, key, newValue => {
            node.value = newValue
        })
    } 

}
