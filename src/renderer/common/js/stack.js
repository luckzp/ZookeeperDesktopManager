class Stack {
    constructor() {
      this._storage = {};
      this._length = 0; // 这是栈的大小
    }
  
    push(value) {
      // 将值添加到栈顶
      this._storage[this._length] = value;
      // 因为增加了一个值，所以也应该将长度加1
      this._length++;
    }

    pop() {
        // we first get the last val so we have it to return
        var lastIndex = this._length - 1;
        const lastVal = this._storage[lastIndex]
        // now remove the item which is the length - 1 
        delete this._storage[lastIndex]
        // decrement the length
        this._length--;
        // now return the last value
        return lastVal
      }
  }
  

  export {Stack}