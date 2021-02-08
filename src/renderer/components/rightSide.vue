<template>
  <div class="right-side">
    <div class="info">
      <div class="title">当前节点名：{{ currZK }}</div>
      <el-table
        :show-header="false"
        :data="node"
        :row-style="{ height: '0' }"
        :cell-style="{ padding: '0' }"
        style="width: 98%"
      >
        <el-table-column prop="name" label="" width="150"> </el-table-column>
        <el-table-column prop="realValue" label="" width="160">
        </el-table-column>
        <el-table-column prop="description" label=""> </el-table-column>
      </el-table>
    </div>
    <div class="doc">
      <div class="title">node value：</div>

      <textarea v-model="value" class="valueArea"></textarea>
      <el-button type="primary" @click="setData(value)" style="margin-top: 10px"
        >保存</el-button
      >
    </div>
  </div>
</template>

<script>
export default {
  name: "rightSide",
  components: {},
  props: ["currZK", "node", "nodeData"],
  data() {
    return { value: this.nodeData };
  },
  methods: {
    setData(value) {
      this.$emit("setData", value);
    },
  },
  watch:{
    nodeData(){
      this.value = this.nodeData
    }
  }
};
</script>
<style scoped>
.right-side {
  width: 55%;
  height: 100%;
  background: white;
  margin-right: 10px;
  margin-left: 5px;
  border-radius: 5px;
  padding: 10px;
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
.valueArea {
  width: 100%;
  height: 80%;
  display: block;
  resize: vertical;
  padding: 5px 15px;
  line-height: 1.5;
  box-sizing: border-box;
  width: 100%;
  font: 13px/1.5 tahoma, arial, Microsoft YaHei, sans-serif;
  color: #606266;
  background-color: #fff;
  background-image: none;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}
.valueArea:focus {
  outline: none;
  border-color: #409eff;
}
</style>>
</style>