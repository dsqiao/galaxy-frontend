<template>
  <div class="qForm">
    <div
      class="qFormItem"
      @mouseenter="showEditSvg"
      @mouseleave="concealEditSvg"
    >
     <!-- FIXME 重新打开 drawer 时，里面的数据还是更新之前的（但是更新的数据已经持久话好了 -->
      <div class="key">名称</div>
      <input
        v-if="editingName"
        id="editingNameInput"
        class="value"
        @blur="blur"
        @keyup.enter="$event.target.blur"
        @input="handleNameInput"
        v-model="nodeAttr.name"
      />
      <div v-else class="value">{{ nodeAttr.name }}</div>
      <div
        class="editSvg"
        @click="editName"
        @mouseenter="showEditHint"
        @mouseleave="concealEditHint"
      >
        <img :src="require('../../assets/svg/edit.svg')" />
        <div class="editHint" style="display: none">编辑</div>
      </div>
    </div>
    <div class="qFormItem">
      <div class="key">类型</div>
      <div class="value">{{ nodeAttr.type }}</div>
    </div>
    <div class="qFormItem">
      <div class="key">颜色</div>
      <input
        class="value colorInput"
        type="color"
        v-model="nodeAttr.color"
        @input="changeColor"
      />
    </div>
    <div class="qFormItem">
      <div class="key">字体</div>
      <input
        class="value fontSizeInput"
        type="number"
        v-model="nodeAttr.fontSize"
        @input="changeFontSize"
      />
      <div style="color: white; margin-left: 5px">px</div>
    </div>
    <div class="qFormItem">
      <div class="key">半径</div>
      <input
        class="value radiusInput"
        type="range"
        v-model="nodeAttr.r"
        @input="changeRaduis"
      />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import * as d3 from 'd3'
import $ from 'jquery'
export default {
  name: 'NodeAttrEditForm',
  computed: {
    ...mapState(['nodeAttr']),
  },
  data () {
    return {
      editingName: false,
    }
  },
  methods: {
    changeRaduis () {
      const r = parseInt(this.nodeAttr.r)
      let arc = d3.arc()
        .innerRadius(r)
        .outerRadius(r + r)
      d3.select(`.circle_${this.nodeAttr.uuid}`)
        .attr('r', r)
      const temp = d3.selectAll(`#out_circle${this.nodeAttr.uuid}`)
        .selectAll('g').data(d3.pie()([1, 1, 1, 1, 1]))
      temp
        .select('path')
        .attr('d', function (d) {
          return arc(d)
        })
      temp
        .select('text')
        .attr('transform', function (d, i) {
          return `translate(${arc.centroid(d)})`
        })
    },
    changeColor () {
      d3.select(`.circle_${this.nodeAttr.uuid}`)
        .attr('fill', this.nodeAttr.color)
        .style('stroke', this.nodeAttr.color)
    },
    changeFontSize () {
      d3.select(`.nodeText_${this.nodeAttr.uuid}`)
        .style('font-size', this.nodeAttr.fontSize)
    },
    showEditSvg () {
      d3.select('.editSvg').style('display', 'flex')
    },
    concealEditSvg () {
      d3.select('.editSvg').style('display', 'none')
    },
    showEditHint () {
      d3.select('.editHint').style('display', 'block')
    },
    concealEditHint () {
      d3.select('.editHint').style('display', 'none')
    },
    editName () {
      let _this = this
      let promise = new Promise(function (resolve, reject) {
        _this.editingName = true
        _this.concealEditSvg()
        resolve()
      })
      promise.then(function () {
        document.getElementById('editingNameInput').focus()
      })
    },
    blur () {
      this.editingName = false
    },
    handleNameInput () {
      d3.select(`.nodeText_${this.nodeAttr.uuid}`).text(this.nodeAttr.name)
    },
    submit () {
      const data = { ...this.nodeAttr, domain: this.$store.state.domain }
      $.ajax({
        data: data,
        type: "POST",
        traditional: true,
        url: "http://localhost:8081/update_node",
        success: function (result) {
          console.log('update node successfully')
          // _this.getDomainGraph()
        }
      })
    }
  }
}
</script>

<style scoped>
@import url(../../style/qForm.css);
.fontSizeInput {
  width: 70px;
  height: 22px;
  box-sizing: border-box;
  color: black !important;
}
.colorInput {
  border: none;
  padding: 0;
  box-sizing: border-box;
  width: 70px;
  height: 22px;
}
.radiusInput {
  width: 130px;
  height: 4px;
}
.key,
.value {
  color: var(--gray-400);
}
.value {
  margin-left: 24px;
}
.editSvg {
  display: flex;
  display: none;
  align-items: center;
  justify-content: center;
  position: absolute;
  right: 24px;
  width: 28px;
  height: 28px;
  border-radius: 14px;
  transition: 0.3s;
  cursor: pointer;
}
.editSvg:hover {
  background-color: var(--graph-list-svg-background);
  transition: 0.3s;
}
.editHint {
  position: absolute;
  top: 34px;
  right: -8px;
  left: -8px;
  color: white;
  padding: 5px 4px;
  background-color: black;
  font-size: 12px;
  text-align: center;
  border-radius: 5px;
  transition: 5s;
}
#editingNameInput {
  width: 120px;
  color: black !important;
}
</style>
