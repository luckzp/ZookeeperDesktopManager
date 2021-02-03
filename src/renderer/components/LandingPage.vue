<template>
  <div class="wrapper">
    <div class="nav">
      <el-button-group class="group">
        <el-button
          icon="el-icon-back"
          size="medium"
          style="border: none"
        ></el-button>
        <el-button
          icon="el-icon-right"
          size="medium"
          style="border: none"
        ></el-button>
        <el-button
          icon="el-icon-refresh"
          size="medium"
          style="border: none"
        ></el-button>
      </el-button-group>

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
    </div>
    <div class="left-side">
      <div class="top">
        <input
          v-model="address"
          placeholder="address"
          class="input-address"
        /><input v-model="port" placeholder="port" class="input-port" />
        <div class="submit-btn">
          <el-button type="primary" @click="connect(address, port)"
            >连接</el-button
          >
          <el-button type="primary" @click="cancel(address, port)"
            >断开</el-button
          >
        </div>
      </div>

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
      <div class="table-container">
        <el-table
          :data="tableData"
          style="width: 100%"
          :row-class-name="tableRowClassName"
          :show-header="false"
          @row-click="getChildren"
        >
          <el-table-column prop="label" label="节点名称"> </el-table-column>
        </el-table>
      </div>
    </div>

    <div class="right-side">
      <div class="info">
        <div class="title">节点信息</div>
        <el-table
          :show-header="false"
          :data="node"
          :row-style="{ height: '0' }"
          :cell-style="{ padding: '0' }"
          style="width: 100%"
        >
          <el-table-column prop="name" label="姓名" width="150">
          </el-table-column>
          <el-table-column prop="realValue" label="日期" width="150">
          </el-table-column>
          <el-table-column prop="description" label="地址"> </el-table-column>
        </el-table>
      </div>
      <div class="doc">
        <div class="title">node value：</div>
        <textarea
          v-model="nodeValue"
          style="width: 100%; height: 70%"
        ></textarea>
        <el-button type="primary" @click="setData()">保存</el-button>
        <el-button type="danger" @click="deleteNode()">删除</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import SystemInformation from "./LandingPage/SystemInformation";
import zkApi from "../common/js/zkApi.js";
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
      node: [],
      nodeValue: "",
    };
  },
  mounted() {
    this.$nextTick(() => {
      this.tableHeight = window.innerHeight - 50;
      // 后面的50：根据需求空出的高度，自行调整
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
      var that = this;

      this.node = zkApi.getNodeData("/", (ret) => {
        that.node = ret;
      });
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
      var that = this;
      zkApi.getNodeData(row.path, (ret) => {
        that.node = ret;
      });
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
.wrapper {
  height: 100%;
  width: 100%;
  position: absolute;
}
.left-side {
  width: 50%;
  height: 90%;
  float: left;
  padding-left: 5px;
  padding-right: 5px;
}
.top{
  margin-bottom: 5px;
}
.table-container {
  overflow: auto;
  height: 82%;
}
.right-side {
  width: 50%;
  height: 90%;
  float: left;
  padding-left: 5px;
  padding-right: 5px;
}
.group {
  float: left;
  margin-left: 5px;
}
.breadcrumb {
  height: 50px;
  padding: 8px;
  word-wrap: break-word;
  word-break: break-all;
  overflow: hidden; /*这个参数根据需要来绝对要不要*/
}
.breadcrumb .el-breadcrumb {
  font-size: 16px;
}
.el-table .row {
  font-size: 16px;
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
  width: 45%;
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
}

.info {
  height: 50%;
  border-radius: 4px;
  border: 2px solid #606266;
  overflow: auto;
}
.title {
  color: #888;
  font-size: 18px;
  font-weight: initial;
  letter-spacing: 0.25px;
  margin-top: 10px;
}
.doc {
  height: 48%;
}
</style>
