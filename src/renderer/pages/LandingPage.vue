<template>
  <div class="container">
    <navBar
      :currentBreadIndex="currentBreadIndex"
      :breadList="breadList"
      :goStack="goStack"
      @back="back"
      @go="go"
      @refresh="refresh"
      @getChildrenByBread="getChildrenByBread"
    ></navBar>
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
              @click="connect(address, port)"
              icon="el-icon-connection"
              >连接</el-button
            >
          </div>
        </div>

        <el-input
          placeholder="请输入内容"
          v-model="input"
          class="input-with-select"
          @keyup.enter.native="search(input)"
        >
          <el-button
            slot="append"
            icon="el-icon-search"
            @click="search(input)"
          ></el-button>
        </el-input>
        <div class="table-container" v-contextmenu:contextmenu>
          <el-table
            :data="tableData"
            style="width: 100%"
            :row-class-name="tableRowClassName"
            :show-header="false"
            @row-click="getChildren"
            @row-contextmenu="rowContextmenu"
          >
            <el-table-column prop="label" label="节点名称"> </el-table-column>
          </el-table>

          <v-contextmenu ref="contextmenu">
            <v-contextmenu-item @click="createNode()"
              ><span
                class="el-icon-circle-plus-outline"
                style="margin-right: 8px"
              ></span
              >新增节点</v-contextmenu-item
            >
            <v-contextmenu-item @click="deleteNode()"
              ><span class="el-icon-delete" style="margin-right: 8px"></span
              >删除</v-contextmenu-item
            >
          </v-contextmenu>
        </div>
      </div>
      <rightSide
        :currZK="currZK"
        :node="node"
        :nodeData="nodeData"
        @setData="setData"
      >
      </rightSide>

      <el-dialog title="创建新节点" :visible.sync="dialogVisible" width="50%">
        <el-form
          :model="dynamicValidateForm2"
          ref="dynamicValidateForm2"
          label-width="auto"
          class="demo-dynamic"
          size="mini"
        >
        <div class="nodeInfo">
          <p style="margin-botton:5px;">当前zk：{{ currZK }}</p>
          <p>当前path：{{ currPath }}</p>
          </div>
          <el-form-item
            prop="nodePath"
            label="nodeName"
            :rules="[
              { required: true, message: '请输入节点名', trigger: 'blur' },
            ]"
          >
            <el-input v-model="dynamicValidateForm2.nodePath"></el-input>
          </el-form-item>
          <el-form-item
            prop="nodeValue"
            label="nodeValue"
            :rules="[
              { required: false, message: '请输入节点值', trigger: 'blur' },
            ]"
          >
            <el-input v-model="dynamicValidateForm2.nodeValue"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              @click="submitForm2('dynamicValidateForm2')"
              >提交</el-button
            >
          </el-form-item>
        </el-form>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import SystemInformation from "../components/SystemInformation";
import zkApi from "../common/js/zkApi.js";
import { Stack } from "../common/js/stack.js";
import navBar from "../components/navBar";
import rightSide from "../components/rightSide";
export default {
  name: "landing-page",
  components: { navBar, rightSide },
  data() {
    return {
      address: "",
      port: "",
      input: "",
      currPath: "",
      currZK: "",
      tableData: [],
      breadList: [],
      currentBreadIndex: 0,
      node: [],
      nodeData: "",
      dialogVisible: false,
      dynamicValidateForm2: {
        nodePath: "newChild",
        nodeValue: "new child value",
      },
      goStack: new Stack(),
    };
  },

  methods: {
    connect(address, port) {
      if(address.replace(/(^s*)|(s*$)/g, "").length ==0 || port.replace(/(^s*)|(s*$)/g, "").length ==0){
        this.$message({
            message: "地址和端口不能为空",
            type: "error",
          });
          return;
      }
      var host = address + ":" + port;
      var zk = zkApi.connectZKByName(host);
      if(zk.state.name == 'DISCONNECTED'){
        this.$message({
            message: "无法连接服务器",
            type: "error",
          });
      }
      Object.assign(this.$data, this.$options.data());
      this.tableData = zkApi.getChildren("/");
      const bread = { name: "ROOT", path: "/" };
      this.breadList.push(bread);
      this.currPath = "/";
      this.currZK = "ROOT";
      var that = this;

      zkApi.getNodeData("/", (ret, val) => {
        that.node = ret;
        that.nodeData = val;
      });
    },
    addBread(nodeLabel, nodePath) {
      const bread = { name: nodeLabel, path: nodePath };
      this.breadList.push(bread);
    },
    getChildren(row) {
      this.tableData = zkApi.getChildren(row.path);
      if (this.breadList.length > this.currentBreadIndex + 1) {
        this.breadList = this.breadList.splice(0, this.currentBreadIndex + 1);
      }
      this.addBread(row.label, row.path);
      this.currentBreadIndex = this.breadList.length - 1;
      this.currZK = this.breadList[this.currentBreadIndex].name;
      if (this.goStack._length > 0) {
        this.goStack = new Stack();
      }
      var that = this;
      zkApi.getNodeData(row.path, (ret, val) => {
        that.node = ret;
        that.nodeData = val;
      });
    },
    back(e) {
      var target = e.target;
      if (target.nodeName == "SPAN" || target.nodeName == "I") {
        target = e.target.parentNode;
      }
      target.blur();
      this.goStack.push(this.breadList[this.currentBreadIndex]);
      this.breadList.pop();
      this.currentBreadIndex = this.currentBreadIndex - 1;
      this.currZK = this.breadList[this.currentBreadIndex].name;
      this.tableData = zkApi.getChildren(
        this.breadList[this.currentBreadIndex].path,
        this.currentBreadIndex
      );
      var that = this;
      zkApi.getNodeData(
        this.breadList[this.currentBreadIndex].path,
        (ret, val) => {
          that.node = ret;
          that.nodeData = val;
        }
      );
    },
    go(e) {
      var target = e.target;
      if (target.nodeName == "SPAN" || target.nodeName == "I") {
        target = e.target.parentNode;
      }
      target.blur();
      if (
        this.currentBreadIndex < this.breadList.length - 1 ||
        this.goStack._length > 0
      ) {
        this.breadList.push(this.goStack.pop());
        this.currentBreadIndex = this.currentBreadIndex + 1;
        this.currZK = this.breadList[this.currentBreadIndex].name;
        this.tableData = zkApi.getChildren(
          this.breadList[this.currentBreadIndex].path,
          this.currentBreadIndex
        );
        var that = this;
        zkApi.getNodeData(
          this.breadList[this.currentBreadIndex].path,
          (ret, val) => {
            that.node = ret;
            that.nodeData = val;
          }
        );
      }
    },
    refresh(e) {
      var target = e.target;
      if (target.nodeName == "SPAN" || target.nodeName == "I") {
        target = e.target.parentNode;
      }
      target.blur();
      this.tableData = zkApi.getChildren(
        this.breadList[this.currentBreadIndex].path,
        this.currentBreadIndex
      );
    },
    getChildrenByBread(path, index) {
      this.tableData = zkApi.getChildren(path);
      this.currZK = this.breadList[index].name;
      var that = this;
      zkApi.getNodeData(this.breadList[index].path, (ret, val) => {
        that.node = ret;
        that.nodeData = val;
      });
    },
    search(input) {

      var newNodes = [];
      for (var i = 0; i < this.tableData.length; i++) {
        if (this.tableData[i].label.indexOf(input) != -1) {
          newNodes.push(this.tableData[i]);
        }
      }
      if(this.newNodes.length == 0){
        this.$message({
            message: "没有查到任何数据",
            type: "error",
          });
          return;
      }
      this.tableData = newNodes;
      this.input = "";
    },
    tableRowClassName({ row, rowIndex }) {
      return "row";
    },
    rowContextmenu(row, column, event) {
      this.currPath = row.path;
    },
    deleteNode() {
      zkApi.operateZKNode("deleteNode", this.currPath, null, (ret) => {
        if (ret == 1) {
          console.log("delete node success");
          this.$message({
            message: "删除节点成功",
            type: "success",
          });
        }
      });
    },
    setData(nodeData) {
      zkApi.operateZKNode(
        "setData",
        this.breadList[this.currentBreadIndex].path,
        nodeData,
        (ret) => {
          if (ret == 1) {
            this.$message({
              message: "设置节点数据成功",
              type: "success",
            });
          }
        }
      );
    },
    createNode() {
      this.dialogVisible = true;
    },
    submitForm2(formName) {
      zkApi.operateZKNode(
        "createNode",
        this.breadList[this.currentBreadIndex].path +
          "/" +
          this.dynamicValidateForm2.nodePath,
        this.dynamicValidateForm2.nodeValue,
        (ret) => {
          this.dialogVisible = false;
          if (ret == 1) {
            console.log("create data success");
            this.$message({
              message: "创建节点成功",
              type: "success",
            });
          }
        }
      );
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
  font: 15px/1.5 tahoma, arial, Microsoft YaHei, sans-serif;
  background: #f6f6f6;
}
.v-contextmenu .v-contextmenu-item {
  color: #888 !important;
  font-size: 15px;
  font-weight: initial;
  letter-spacing: 0.25px;
}

.wrapper {
  height: 90%;
  width: 100%;
  position: absolute;
  display: flex;
  justify-content: space-between;
}
.left-side {
  width: 45%;
  height: 100%;
  background: white;
  margin-right: 5px;
  margin-left: 10px;
  border-radius: 5px;
  padding: 10px;
}
.top {
  margin-bottom: 5px;
  background: white;
}
.table-container {
  overflow: auto;
  height: 82%;
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
.nodeInfo {
  margin-left: 10px;
  margin-bottom: 5px;
}
</style>
