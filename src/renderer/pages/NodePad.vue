
<template>
  <div>
    <el-input v-model="input" placeholder="请输入文件路径"></el-input>
    <el-radio v-model="radio" label="test">test</el-radio>
    <el-radio v-model="radio" label="pre">pre</el-radio>
    <el-button type="primary" @click="save(1)">不注册</el-button>
    <el-button type="primary" @click="save(2)">还原</el-button>
  </div>
</template>

<script>
export default {
  name: "node-pad",
  data() {
    return {
      textarea: "hello world",
      input: "",
      radio: "test",
    };
  },
  methods: {
    save(type) {
      let fs = require("fs");
      var arr = new Array();
      if (this.input.replace(/(^s*)|(s*$)/g, "").length == 0) {
        this.input = "E:\\iflytek_code\\homework-platform";
      }
      var coreAsync =
        this.input +
        "\\core-async-task\\src\\main\\resources\\application-" +
        this.radio +
        ".yml";
      var coreSvc =
        this.input +
        "\\core-svc\\src\\main\\resources\\application-" +
        this.radio +
        ".yml";
      var agentSvc =
        this.input +
        "\\agent-svc\\src\\main\\resources\\application-" +
        this.radio +
        ".yml";
      var bizSvc =
        this.input +
        "\\biz-svc\\src\\main\\resources\\application-" +
        this.radio +
        ".yml";
      arr.push(coreAsync);
      arr.push(coreSvc);
      arr.push(agentSvc);
      arr.push(bizSvc);
      for (var i = 0; i < arr.length; i++) {
        var path = arr[i];
        var data = fs.readFileSync(path);
        var res;
        if (type == 1) {
          res = data.toString().replace("register: true", "register: false");
        } else {
          res = data.toString().replace("register: false", "register: true");
        }

        fs.writeFile(path, res, function (err) {
          if (err) {
            console.log(err);
          }
        });
      }
      var bizAppliaction =
        this.input +
        "\\biz-svc\\src\\main\\java\\com\\iflytek\\edu\\homework\\platform\\biz\\BizSvcApplication.java";
      var data = fs.readFileSync(bizAppliaction);
      if (type == 1) {
        res = data
          .toString()
          .replace("epas-dubbo-beans.xml", "epas-dubbo-beans-direct.xml");
      } else {
        res = data
          .toString()
          .replace("epas-dubbo-beans-direct.xml", "epas-dubbo-beans.xml");
      }
      fs.writeFile(bizAppliaction, res, function (err) {
        if (err) {
          console.log(err);
        }
      });
      console.log("file end success！！！");
    },
  },
};
</script>

<style>
</style>
