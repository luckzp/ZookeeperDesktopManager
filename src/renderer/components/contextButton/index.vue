 <!-- 菜单页代码  contextButton/index.vue -->
<template>
  <div id="contextmenu" class="contextmenu">
    <div class="contextmenu__item" @click="handleOne()">菜单一</div>
    <div class="contextmenu__item" @click="handleTwo()">菜单二</div>
    <div class="contextmenu__item" @click="handleThree()">菜单三</div>
  </div>
</template>

<script>
    export default {
      name: "index",
      data () {
         return {
          }
      },
      methods: {
        init (row, column,event) {
          // 设置菜单出现的位置
          // 具体显示位置根据自己需求进行调节
          let menu = document.querySelector('#contextmenu')
          let cha = document.body.clientHeight - event.clientY
          console.log(document.body.clientHeight,event.clientY,cha)
          // 防止菜单太靠底，根据可视高度调整菜单出现位置
          if (cha < 150) {
            menu.style.top = event.clientY  + 'px'
          } else {
            menu.style.top = event.clientY -10 + 'px'
          }
          menu.style.left = event.clientX + 10 + 'px'
          document.addEventListener('click', this.foo) // 给整个document添加监听鼠标事件，点击任何位置执行foo方法

        },
        foo () {
          this.$emit('foo')
        },
        handleOne () {
          this.$emit('handleOne')
        },
        handleTwo () {
          this.$emit('handleTwo')
        },
        handleThree () {
          this.$emit('handleThree')
        },
      }
    }
</script>

<style scoped>
  .contextmenu__item {
    display: block;
    line-height: 34px;
    text-align: center;
  }
  .contextmenu__item:not(:last-child) {
    border-bottom: 1px solid rgba(64,158,255,.2);
  }
  .contextmenu {
    position: absolute;
    background-color: #ecf5ff;
    width: 100px;
    /*height: 106px;*/
    font-size: 12px;
    color: #409EFF;
    border-radius: 4px;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    border: 1px solid rgba(64,158,255,.2);
    white-space: nowrap;
    z-index: 1000;
  }
  .contextmenu__item:hover {
    cursor: pointer;
    background: #66b1ff;
    border-color: #66b1ff;
    color: #fff;
  }
</style>