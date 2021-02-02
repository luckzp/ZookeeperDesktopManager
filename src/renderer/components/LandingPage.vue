<template>
  <div class="wrapper">

      <div class="left-side">
        <div class="top">
          <input
            v-model="address"
            placeholder="address"
            class="input-address"
          /><input v-model="port" placeholder="port" class="input-port" />
          <div class="submit-btn">
            <el-button
              type="primary"
              class="subit-btn"
              @click="connect(address, port)"
              >连接</el-button
            >
            <el-button
              type="primary"
              class="subit-btn"
              @click="cancel(address, port)"
              >断开</el-button
            >
          </div>
        </div>
        <div class="breadcrumb">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item
              v-for="(item, index) in breadList"
              :key="index"
              :to="{ path: '/' }"
              @click.native="getChildrenByBread(item.path, index)"
              >{{ item.name }}</el-breadcrumb-item
            >
          </el-breadcrumb>
        </div>

        <div>
          <el-table
            :data="tableData"
            style="width: 100%"
            :row-class-name="tableRowClassName"
            @row-click="getChildren"
          >
            <el-table-column prop="label" label="节点名称"> </el-table-column>
            <el-table-column align="right">
              <template slot="header" slot-scope="scope">
                <el-input
                  placeholder="请输入内容"
                  v-model="input"
                  class="input-with-select"
                >
                  <el-button
                    slot="append"
                    icon="el-icon-search"
                    @click="search(input)"
                  ></el-button>
                </el-input>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>

      <div class="right-side">
        <div class="info">
          <div class="title">Getting Started</div>
          <p>
            electron-vue comes packed with detailed documentation that covers
            everything from internal configurations, using the project
            structure, building your application, and so much more.
          </p>
          <button
            @click="
              open('https://simulatedgreg.gitbooks.io/electron-vue/content/')
            "
          >
            Read the Docs</button
          ><br /><br />
        </div>
        -->
        <div class="doc">
          <div class="title alt">Other Documentation</div>
          <button class="alt" @click="open('https://electron.atom.io/docs/')">
            Electron
          </button>
          <button class="alt" @click="open('https://vuejs.org/v2/guide/')">
            Vue.js
          </button>
        </div>
      </div>
  </div>
</template>

<script>
import SystemInformation from "./LandingPage/SystemInformation";
import zkApi from "../common/js/zookeeper.js";
export default {
  name: "landing-page",
  components: { SystemInformation },
  data() {
    return {
      address: "",
      port: "",
      input: "",
      tableData: [],
      tableHeight: 0,
      breadList: [],
      breadIndex: 0,
    };
  },
  mounted() {
    this.$nextTick(() => {
      this.tableHeight = window.innerHeight - 50;
      //后面的50：根据需求空出的高度，自行调整
    });
  },
  methods: {
    connect(address, port) {
      var host = "172.31.12.119:13188";
      var zookeeper = zkApi.connectZKByName(host, (ret) => {
        console.log("this.data is " + ret.zkName);
      });
      this.tableData = zkApi.getChildren("/");
      const bread = { name: "ROOT", path: "/" };
      this.breadList.push(bread);
    },
    addBread(nodeLabel, nodePath) {
      const bread = { name: nodeLabel, path: nodePath };
      this.breadList.push(bread);
    },
    getChildren(row) {
      this.tableData = zkApi.getChildren(row.path);
      if (this.breadList.length > this.breadIndex + 1) {
        this.breadList = this.breadList.splice(0, this.breadIndex + 1);
      }
      this.addBread(row.label, row.path);
      this.breadIndex = this.breadList.length - 1;
    },
    getChildrenByBread(path, index) {
      this.tableData = zkApi.getChildren(path);
      this.breadIndex = index;
    },
    search(input) {
      var newNodes = [];
      for (var i = 0; i < this.tableData.length; i++) {
        if (this.tableData[i].label.startsWith(input)) {
          newNodes.push(this.tableData[i]);
        }
      }
      if (newNodes.length > 0) {
        this.tableData = newNodes;
      }
      this.input = "";
    },
    tableRowClassName({ row, rowIndex }) {
      return "row";
    },
  },
};
</script>

<style>
@import url("https://fonts.googleapis.com/css?family=Source+Sans+Pro");

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: "Source Sans Pro", sans-serif;
}
.wrapper{
  height: 100%;
  width: 100%;
  position: absolute
}
.left-side {
  margin-top: 20px;
  margin-bottom: 20px;
  width: 50%;
  height: 100%;
  float: left;
}
.right-side {
  width: 50%;
  height: 100%;
  float: left;
}
.breadcrumb {
  word-wrap: break-word;
  word-break: break-all;
  overflow: hidden; /*这个参数根据需要来绝对要不要*/
}
.breadcrumb .el-breadcrumb {
  height: 50px;
  line-height: 50px;
  font-size: 16px;
  border-bottom: 2px solid #409eff;
}
.el-table .row {
  font-size: 18px;
}
.input-address {
  background-color: #fff;
  background-image: none;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  box-sizing: border-box;
  color: #606266;
  display: inline-block;
  font-size: inherit;
  height: 40px;
  line-height: 40px;
  outline: none;
  padding: 0 15px;
  width: 50%;
}
.input-port {
  background-color: #fff;
  background-image: none;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  box-sizing: border-box;
  color: #606266;
  display: inline-block;
  font-size: inherit;
  height: 40px;
  line-height: 40px;
  outline: none;
  padding: 0 15px;
  width: 20%;
}
.submit-btn {
  float: right;
  margin-right: 10px;
}
.subit-btn {
  margin-right: 15px;
}

.info {
  height: 80%;
  border: 1px solid  #606266;
}

.doc{
  height: 20%;
}
</style>
