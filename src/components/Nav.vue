<template>
  <div id="nav">
    <img
      id="logo"
      src="https://dongyuanjushi.oss-cn-beijing.aliyuncs.com/image/logo.png"
    />
    <span id="appName">GalaxyKG</span>
    <div id="port">
      <button id="import" @click="importDomain">导入</button>
      <input type="file" id="fileUploader" />
      <button id="export" @click="exportDomain">导出</button>
      <ExportDomainForm ref='exportForm'/>
    </div>
  </div>
</template>

<script>
import ExportDomainForm from './form/ExportDomainForm.vue'
import $ from 'jquery'
export default {
  name: 'Nav',
  components: {
    ExportDomainForm
  },
  methods: {
    importDomain () {
      const fileUploader = document.getElementById('fileUploader')
      fileUploader.addEventListener('change', this.handleImportFiles)
      fileUploader.click()
    },
    handleImportFiles (event) {
      const _this = this
      const file = event.target.files[0]
      const formData = new FormData()
      let name = file.name
      name = name.slice(0, name.length - 4)
      formData.append('file', file)
      formData.append('domain', name)
      $.ajax({
        data: formData,
        type: 'POST',
        url: 'import_graph',
        processData: false,
        contentType: false,
        success: function (result) {
          if (result.code === 200) {
            _this.getLabels()
          }
        }
      })
    },
    exportDomain () {
      this.$refs.exportForm.switchVisibility()
    }
  }
}
</script>

<style scoped>
#nav {
  background-color: rgba(17, 121, 179, 0.8);
  display: flex;
  height: var(--nav-height); /* 这里能访问到 app 中定义的变量 */
  padding: 7px 0;
  box-sizing: border-box;
  align-items: center;
}
#logo {
  margin-left: 6%;
  width: 50px;
  height: 50px;
}

#appName {
  margin-left: 1%;
  /*color: #FEE064;*/
  color: lemonchiffon;
  font-size: 24px;
  font-weight: bold;
  /* font-family: "Times New Roman"; */
}

#port {
  width: 70%;
  min-width: 100px;
  margin-left: 70%;
  display: grid;
  grid-template-columns: 1fr 1fr;
}

#export,
#import {
  margin-right: 10%;
  background-color: lightgray;
  padding: 5% 10%;
  font-size: 16px;
  color: #1179b3;
  border-radius: 15px;
  font-weight: bold;
}

#port #export:hover {
  transform: scale(1.1);
  background-color: white;
  transition: 0.2s;
}

#port #import:hover {
  transform: scale(1.1);
  background-color: white;
  transition: 0.2s;
}
#fileUploader {
  display: none;
}
</style>
