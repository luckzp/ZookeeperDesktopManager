
<template>
  <div>
    <el-input
      type="textarea"
      :rows="2"
      placeholder="请输入内容"
      v-model="textarea"
    >
    </el-input>
<el-input v-model="input" placeholder="请输入内容"></el-input>
    <input type="file" @change="loadTextFromFile" />
    <el-button type="primary" @click="save">连接</el-button>
  </div>
</template>

<script>
export default {
  name: "node-pad",
  data() {
    return { textarea: "hello world", filePath: "", fileText: "",input:"" };
  },
  methods: {
    loadTextFromFile(ev) {
      const file = ev.target.files[0];
      const reader = new FileReader();

      reader.onload = (e) => this.$emit("load", e.target.result);
      reader.readAsText(file);
      this.filePath = file.path;
      var that = this;
      reader.onload = function () {
        that.textarea = this.result;
        that.fileText = this.result;
        let searchStr = "ddl-auto: update";
        let replaceStr = "ddl-auto: insert";
        that.textarea = that.textarea.replace(searchStr, replaceStr);
      };
    },
    save() {
      let fs = require("fs");
      var a = this.input;
var b = JSON.stringify({a});
console.log(b);
var c = b.split('"');
console.log(c);
console.log(c[3]);

      var data = fs.readFileSync("C:\\Users\\24552\\Desktop\\1.txt");

      console.log("我是同步执行的结果集：" + data.toString());

      let jsonObj = data+"123";
      fs.writeFile(this.filePath, jsonObj, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("file success！！！");
        }
      });
    },
  },
};
</script>

<style>
</style>
