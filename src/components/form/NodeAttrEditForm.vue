<template>
  <div>
    <div>名称</div>
    <div>{{ nodeAttr.name }}</div>
    <div>类型</div>
    <div>{{ nodeAttr.type }}</div>
    <div>颜色</div>
    <input type="color" v-model="nodeAttr.color">
    <div>半径</div>
    <input type="range" v-model="nodeAttr.r">
    <div>字体大小</div>
    <input type="number" v-model="nodeAttr.fontSize">
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  name: 'NodeAttrEditForm',
  computed: {
    ...mapState(['nodeAttr'])
  }
}
</script>

<style scoped>
@import url(../../style/nodeAttrEditForm.css);
</style>
