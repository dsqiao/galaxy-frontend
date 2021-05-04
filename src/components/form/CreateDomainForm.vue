<template>
  <div id="createDomainForm" v-if="show">
    <div id="closeCreateDomainForm" @click="closeForm">关闭</div>
    <span id="domainLabel">请输入要创建的领域名称</span>
    <input id="createDomainName" type="text" placeholder="Domain Name" />
    <div id="createDomainNameConfirmGroup">
      <button type="button" id="createConfirm" @click="confirm">确定</button>
      <button type="button" id="createCancel" @click="closeForm">取消</button>
    </div>
  </div>
</template>

<script>
import $ from 'jquery'
export default {
  name: 'CreateDomainForm',
  data () {
    return {
      show: false
    }
  },
  methods: {
    closeForm () {
      this.show = false
    },
    showForm () {
      this.show = true
    },
    confirm () {
      const _this = this
      const value = document.getElementById('createDomainName').value
      if (value === '') {
        alert('领域名不能为空')
        return
      }
      const data = { domain: value } // 这里叫 domain 是为了与后端参数匹配
      $.ajax({
        data: data,
        type: 'POST',
        url: 'create_domain',
        success: function (result) {
          if (result.code === 200) {
            // _this.getDomainNameByUser()
            _this.getLabels()
            _this.doamin = value
            _this.getDomainGraph()
            document.getElementById('createDomainForm').style.display = 'None'
          } else {
            _this.$message({
              showClose: true,
              message: result.msg,
              type: 'warning'
            })
          }
        },
      })
    }
  }
}
</script>

<style>
#createDomainForm {
  z-index: 999;
  border-radius: 10px;
  background-color: #dcdcdc;
  text-align: center;
  height: 20%;
  width: 24%;
  min-width: 200px;
  min-height: 130px;
  position: absolute;
  left: 38%;
  top: 30%;
}
#createDomainForm #createDomainName {
  height: 20%;
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
#createDomainForm #domainLabel {
  display: block;
  color: black;
  font-size: 14px;
  font-weight: bold;
  margin-top: 5%;
  margin-left: 10%;
}

#createDomainForm #createDomainNameConfirmGroup {
  margin-top: 5%;
  display: block;
}

#closeCreateDomainForm {
  float: right;
  margin-top: 1%;
  margin-right: 2%;
  padding: 1% 1%;
  font-size: 10px;
  color: gray;
  text-decoration: none;
  border-radius: 10px;
  cursor: pointer;
}

#closeCreateDomainForm:hover {
  background-color: red;
  color: white;
  transition: 0.2s;
}

#createConfirm {
  background-color: #003399;
  padding: 2% 4%;
  margin-left: 20%;
  float: left;
  color: white;
  font-size: 14px;
  border-radius: 20px;
}
#createConfirm:hover {
  transform: scale(1.1);
  transition: 0.2s;
}

#createCancel {
  background-color: #663366;
  padding: 2% 4%;
  color: white;
  font-size: 14px;
  border-radius: 20px;
  margin-right: 20%;
  float: right;
}

#createCancel:hover {
  transform: scale(1.1);
  transition: 0.2s;
}
</style>
