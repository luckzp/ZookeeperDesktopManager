<template>
  <div>
    <el-upload
      action=""
      :on-change="readFile"
      :show-file-list="false"
      :auto-upload="false"
    >
      <el-button size="small" type="primary">点击上传(自由出题)</el-button>
      <div class="el-upload__tip" slot="tip">只支持上传JSON文件</div>
    </el-upload>
    <el-upload
      action=""
      :on-change="readMysqlFile"
      :show-file-list="false"
      :auto-upload="false"
    >
      <el-button size="small" type="primary">点击上传(打卡作业)</el-button>
      <div class="el-upload__tip" slot="tip">只支持上传JSON文件</div>
    </el-upload>
    <el-button icon="el-icon-download" @click="download">下载</el-button>
    <div>下载图片总数{{ total }},当前已下载图片数{{ current }}</div>
    <el-progress
      :text-inside="true"
      :stroke-width="26"
      :percentage="progress"
    ></el-progress>
    <div class="wrapper">
      <h2>下载耗时:</h2>
      <h1 id="mytime">{{ str }}</h1>
    </div>
  </div>
</template>

<script>
var request = require("request");
var fs = require("fs");
var Bagpipe = require("bagpipe");
const ipc = require("electron").ipcRenderer;
export default {
    name: "image-download",
  created() {
    ipc.on("selected-directory", function (event, path) {
      console.log(`You selected: ${path}`);
    });
  },
  data() {
    return {
      urls: [],
      dir: "",
      progress: 0,
      total: 0,
      current: 0,
      h: 0, //定义时，分，秒，毫秒并初始化为0；
      m: 0,
      ms: 0,
      s: 0,
      time: 0,
      str: "",
      mytime: "",
      success: [],
    };
  },
  methods: {
    readFile(file) {
      // TODO: file.type === 'XXX' 校验是否是指定的文本文件
      let reader = new FileReader();
      reader.readAsText(file.raw);
      var that = this;
      reader.onload = (e) => {
        // 读取文件内容
        const cont = e.target.result;

        // 接下来可对文件内容进行处理
        var jsonObj = JSON.parse(cont);
        var jsonArr = [];
        var urls = [];
        for (var i = 0; i < jsonObj.length; i++) {
          jsonArr[i] = jsonObj[i];
          for (var j = 0; j < jsonObj[i].questions.length; j++) {
            for (
              var k = 0;
              k < jsonObj[i].questions[j].submitAttachment.length;
              k++
            ) {
              urls.push(jsonObj[i].questions[j].submitAttachment[k].path);
            }
          }
        }
        that.urls = Array.from(new Set(urls));
        that.total = that.urls.length;
        that.$message({
          message: "上传成功",
          type: "success",
        });
        console.log(urls);
      };
    },
    readMysqlFile(file){
    let reader = new FileReader();
      reader.readAsText(file.raw);
      var that = this;
      reader.onload = (e) => {
        // 读取文件内容
        const cont = e.target.result;

        // 接下来可对文件内容进行处理
        var jsonObj = JSON.parse(cont);
        var urls = [];
        for (var i = 0; i < jsonObj.RECORDS.length; i++) {
              urls.push(jsonObj.RECORDS[i].path);
        }
        
        that.urls = Array.from(new Set(urls));
        that.total = that.urls.length;
        that.$message({
          message: "上传成功",
          type: "success",
        });
        console.log(urls);
      };
    },
    download() {
      var downloadsFolder = ipc.sendSync("open-file-dialog");
      var bagpipe = new Bagpipe(20);
      var that = this;
      this.start();
      for (var i = 0; i < this.urls.length; i++) {
        var fileURL = this.urls[i];
        // butterfly-wallpaper.jpeg
        var filename = fileURL.substring(fileURL.lastIndexOf("/") + 1);
        var finalPath = downloadsFolder + "\\" + filename;
        bagpipe.push(
          this.downloadFile,
          fileURL,
          finalPath,
          function (err, data) {
            that.success.push("1");
            that.current = that.success.length;
            that.progress =
              Math.round((that.current / that.total) * 10000) / 100;
          }
        );
      }
    },

    downloadFile(uri, filename, callback) {
      request.head(uri, function (err, res, body) {
        request(uri).pipe(fs.createWriteStream(filename)).on("close", callback);
      });
    },

    showProgress(received, total) {
      var percentage = (received * 100) / total;
      console.log(
        percentage + "% | " + received + " bytes out of " + total + " bytes."
      );
    },
    timer() {
      //定义计时函数
      this.ms = this.ms + 50; //毫秒
      if (this.ms >= 1000) {
        this.ms = 0;
        this.s = this.s + 1; //秒
      }
      if (this.s >= 60) {
        this.s = 0;
        this.m = this.m + 1; //分钟
      }
      if (this.m >= 60) {
        this.m = 0;
        this.h = this.h + 1; //小时
      }
      this.str =
        this.toDub(this.h) +
        ":" +
        this.toDub(this.m) +
        ":" +
        this.toDub(this.s) +
        "" /*+this.toDubms(this.ms)+"毫秒"*/;
      // document.getElementById('mytime').innerHTML=h+"时"+m+"分"+s+"秒"+ms+"毫秒";
    },

    reset() {
      //重置
      clearInterval(this.time);
      this.h = 0;
      this.m = 0;
      this.ms = 0;
      this.s = 0;
      this.str = "00:00:00";
    },

    start() {
      //开始
      this.time = setInterval(this.timer, 50);
    },

    stop() {
      //暂停
      clearInterval(this.time);
    },

    toDub(n) {
      //补0操作
      if (n < 10) {
        return "0" + n;
      } else {
        return "" + n;
      }
    },

    toDubms(n) {
      //给毫秒补0操作
      if (n < 10) {
        return "00" + n;
      } else {
        return "0" + n;
      }
    },
  },
};
</script>

<style>
.el-header {
  background-color: #b3c0d1;
  color: #333;
  line-height: 60px;
}

.el-aside {
  color: #333;
}
#mytime {
  background: #bbb;
  color: #fff;
  display: block;
}
.wrapper {
  text-align: center;
  width: 60%;
  margin: 250px auto;
}
</style>