<template>
  <div class="container">
    <div class="nav">
      <el-button-group class="group">
        <el-button
          icon="el-icon-back"
          size="medium"
          style="border: none"
          :disabled="breadIndex == 0 ? true : false"
          @click="back($event)"
        ></el-button>
        <el-button
          icon="el-icon-right"
          size="medium"
          style="border: none"
          :disabled="breadIndex >= breadList.length - 1 ? true : false"
          @click="go($event)"
        ></el-button>
        <el-button
          icon="el-icon-refresh"
          size="medium"
          style="border: none"
          @click="refresh($event)"
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
        <div class="table-container">
          <el-table
            :data="tableData"
            style="width: 100%"
            :row-class-name="tableRowClassName"
            :show-header="false"
            @row-click="getChildren"
            @row-contextmenu="rowContextmenu"
            v-contextmenu:contextmenu
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

      <div class="right-side">
        <div class="info">
          <div class="title">当前节点名：{{currZK}}</div>
          <el-table
            :show-header="false"
            :data="node"
            :row-style="{ height: '0' }"
            :cell-style="{ padding: '0' }"
            style="width: 98%"
          >
            <el-table-column prop="name" label="" width="150">
            </el-table-column>
            <el-table-column prop="realValue" label="" width="160">
            </el-table-column>
            <el-table-column prop="description" label="" > </el-table-column>
          </el-table>
        </div>
        <div class="doc">
          <div class="title">node value：</div>
          <textarea
            v-model="nodeData"
            style="width: 100%; height: 80%"
          ></textarea>
          <el-button type="primary" @click="setData()">保存</el-button>
        </div>
      </div>

      <el-dialog title="创建新节点" :visible.sync="dialogVisible" width="50%">
        <el-form
          :model="dynamicValidateForm2"
          ref="dynamicValidateForm2"
          label-width="auto"
          class="demo-dynamic"
          size="mini"
        >
          <p>当前zk：{{ currZK }}</p>
          <p>当前path：{{ currPath }}</p>
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
              type="danger"
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
import SystemInformation from "./LandingPage/SystemInformation";
import zkApi from "../common/js/zkApi.js";
import contextButton from "./contextButton/index";
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
      nodeData: "",
      menuVisible: false,
      dialogVisible: false,
      currZK: "",
      currPath: "",
      dynamicValidateForm2: {
        nodePath: "newChild",
        nodeValue: "new child value",
      },
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
      var host = "127.0.0.1:2181";
      var zookeeper = zkApi.connectZKByName(host, (ret) => {
        console.log("this.data is " + ret.zkName);
      });
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
      if (this.breadList.length > this.breadIndex + 1) {
        this.breadList = this.breadList.splice(0, this.breadIndex + 1);
      }
      this.addBread(row.label, row.path);
      this.breadIndex = this.breadList.length - 1;
      this.currPath = row.path;
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
      if (this.breadIndex == 0) {
        return;
      }
      this.breadIndex = this.breadIndex - 1;
      this.tableData = zkApi.getChildren(
        this.breadList[this.breadIndex].path,
        this.breadIndex
      );
    },
    go(e) {
      var target = e.target;
      if (target.nodeName == "SPAN" || target.nodeName == "I") {
        target = e.target.parentNode;
      }
      target.blur();
      if (this.breadIndex >= this.breadList.length - 1) {
        return;
      }
      this.breadIndex = this.breadIndex + 1;
      this.tableData = zkApi.getChildren(
        this.breadList[this.breadIndex].path,
        this.breadIndex
      );
    },
    refresh(e) {
      var target = e.target;
      if (target.nodeName == "SPAN" || target.nodeName == "I") {
        target = e.target.parentNode;
      }
      target.blur();
      this.tableData = zkApi.getChildren(
        this.breadList[this.breadIndex].path,
        this.breadIndex
      );
    },
    getChildrenByBread(path, index) {
      this.tableData = zkApi.getChildren(path);
      this.breadIndex = index;
    },
    search(input) {
      var newNodes = [];
      for (var i = 0; i < this.tableData.length; i++) {
        if (this.tableData[i].label.indexOf(input) != -1) {
          newNodes.push(this.tableData[i]);
        }
      }
      this.tableData = newNodes;
      this.input = "";
    },
    tableRowClassName({ row, rowIndex }) {
      return "row";
    },
    rowContextmenu(row, column, event) {
      this.currZK = row.label;
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
    setData() {
      zkApi.operateZKNode("setData", this.currPath, this.nodeData, (ret) => {
        if (ret == 1) {
          this.$message({
            message: "设置节点数据成功",
            type: "success",
          });
        }
      });
    },
    createNode() {
      this.dialogVisible = true;
    },
    submitForm2(formName) {
      zkApi.operateZKNode(
        "createNode",
        this.currPath + "/" + this.dynamicValidateForm2.nodePath,
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

.nav {
  margin: 10px;
  background: white;
  border-radius: 5px;
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
.right-side {
  width: 55%;
  height: 100%;
  background: white;
  margin-right: 10px;
  margin-left: 5px;
  border-radius: 5px;
  padding: 10px;
}
.group {
  float: left;
  margin-left: 5px;
}
.breadcrumb {
  font-family: "Source Sans Pro", sans-serif;
  height: 36px;
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
  overflow: auto;
   height: 53%;
}
.title {
  color: #888;
  font-size: 15px;
  font-weight: initial;
  letter-spacing: 0.25px;
  margin-left: 5px;
  margin-bottom: 5px;
}
.doc {
  height: 43%;
}
</style>
