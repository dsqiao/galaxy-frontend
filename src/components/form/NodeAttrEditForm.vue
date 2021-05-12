<template>
  <div>
    <div class="attr">名称</div>
    <div>{{ nodeAttr.name }}</div>
    <div class="attr">类型</div>
    <div>{{ nodeAttr.type }}</div>
    <div class="attr">颜色</div>
    <input type="color" v-model="nodeAttr.color" />
    <div class="attr">半径</div>
    <input type="range" v-model="nodeAttr.r" @change="changeRaduis" />
    <div class="attr">字体大小</div>
    <input type="number" v-model="nodeAttr.fontSize" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import * as d3 from 'd3'
export default {
  name: 'NodeAttrEditForm',
  computed: {
    ...mapState(['nodeAttr'])
  },
  methods: {
    changeRaduis () {
      d3.select(`.circle_${this.nodeAttr.id}`)
        .attr('r', this.nodeAttr.r)
    }
  }
}
</script>

<style scoped>
@import url(../../style/nodeAttrEditForm.css);
</style>
