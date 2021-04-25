<template>
  <div id="exportDomainForm" v-if="show">
    <div id="closeExportDomainForm" @click="closeForm">关闭</div>
    <span id="exportDomainLabel">请输入要导出的领域名称</span>
    <input id="exportDomainName" type="text" placeholder="Domain Name" />
    <span id="exportTypeLabel">请选择要导出的类型</span>
    <select id="exportSelection">
      <option value="image">图片</option>
      <option value="csv">csv文件</option>
      <option value="json">json文件</option>
    </select>
    <div id="exportDomainConfirmGroup">
      <button type="button" id="exportConfirm" @click="confirm">确定</button>
      <button type="button" id="exportCancel" @click="closeForm">取消</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ExportDomainForm',
  data () {
    return {
      show: false,
      uploadParam: { domain: '' }
    }
  },
  methods: {
    switchVisibility () {
      this.show = !this.show
    },
    closeForm () {
      this.show = false
    },
    confirmForm () {
      const domainName = document.getElementById('exportDomainName').value
      const exportType = document.getElementById('exportSelection').value
      this.uploadParam.domain = domainName
      if (exportType === 'image') {
        this.exportImage()
      } else if (exportType === 'csv') {
        this.exportCsv()
      } else if (exportType === 'json') {
        this.exportJson()
      }
      this.closeForm()
    }
  }
}
</script>

<style scoped>
#exportDomainForm {
  z-index: 999;
  border-radius: 10px;
  background-color: #dcdcdc;
  text-align: center;
  height: 32%;
  width: 24%;
  min-width: 200px;
  min-height: 230px;
  position: absolute;
  left: 38%;
  top: 20%;
}
#exportDomainName {
  height: 12%;
  width: 80%;
  outline: none;
  margin-top: 3%;
  padding: 1% 2%;
  border: none;
  display: inline-block;
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 14px;
}
#exportDomainLabel {
  display: block;
  color: black;
  font-size: 14px;
  font-weight: bold;
  margin-top: 5%;
  margin-left: 10%;
}

#exportTypeLabel {
  display: block;
  color: black;
  font-size: 14px;
  font-weight: bold;
  margin-top: 5%;
  /* margin-left: 10%; */
}

#exportSelection {
  outline: none;
  border: none;
  border-radius: 15px;
  width: 70%;
  margin-top: 4%;
  padding: 2% 2%;
}

#exportDomainConfirmGroup {
  margin-top: 5%;
  display: block;
}

#closeExportDomainForm {
  float: right;
  margin-top: 1%;
  margin-right: 2%;
  padding: 1% 1%;
  font-size: 10px;
  color: gray;
  /* font-weight: bold; */
  text-decoration: none;
  border-radius: 10px;
  cursor: pointer;
  transition: 0.2s;
}

#closeExportDomainForm:hover {
  background-color: red;
  color: white;
}

#exportConfirm {
  background-color: #003399;
  padding: 2% 4%;
  margin-left: 20%;
  float: left;
  color: white;
  font-size: 14px;
  /* font-weight: bold; */
  border-radius: 20px;
}
#exportConfirm:hover {
  /*background-color: #6666cc;*/
  transform: scale(1.1);
  transition: 0.2s;
}

#exportCancel {
  background-color: #663366;
  padding: 2% 4%;
  /*float: left;*/
  color: white;
  font-size: 14px;
  /* font-weight: bold; */
  border-radius: 20px;
  margin-right: 20%;
  float: right;
}

#exportCancel:hover {
  /*background-color: #993366;*/
  transform: scale(1.1);
  transition: 0.2s;
}
</style>
