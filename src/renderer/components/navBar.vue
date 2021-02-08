<template>
  <div class="nav">
    <el-button-group class="group">
      <el-button
        icon="el-icon-back"
        size="medium"
        style="border: none"
        :disabled="currentBreadIndex == 0 ? true : false"
        @click="back($event)"
      ></el-button>
      <el-button
        icon="el-icon-right"
        size="medium"
        style="border: none"
        :disabled="
          currentBreadIndex < breadList.length - 1 || goStack._length > 0
            ? false
            : true
        "
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
</template>

<script>
export default {
  name: "navBar",
  data() {
    return {};
  },
  props: ["currentBreadIndex", "breadList", "goStack"],

  methods: {
    back(e) {
      this.$emit("back", e)
    },
    go(e) {
      this.$emit("go", e)
    },
    refresh(e) {
      this.$emit("refresh", e)
    },
    getChildrenByBread(path, index){
      this.$emit("getChildrenByBread", path, index)
    }
  }
};
</script>
<style scoped>
.nav {
  margin: 10px;
  background: white;
  border-radius: 5px;
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
</style>