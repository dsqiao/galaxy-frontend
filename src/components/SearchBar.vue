<template>
  <div class="filterInputWrapper">
    <img
      :src="require('../assets/svg/filter.svg')"
      class="filter-icon"
      @click="triggerFilterCheckbox"
    />
    <input
      id="filterInput"
      placeholder="查找"
      @keyup.enter="filterEnter"
      @input="filterInputChange"
    />
    <div id="filter-modes">
      <input
        class="filter-mode"
        type="radio"
        v-model="picked"
        value="node"
        @change="filterInputChange"
      />
      <label class="filter-mode-name">结点</label>
      <input
        class="filter-mode"
        type="radio"
        v-model="picked"
        value="link"
        @change="filterInputChange"
      />
      <label class="filter-mode-name">关系</label>
    </div>
    <img
      :src="require('../assets/svg/clear.svg')"
      class="clear-icon"
      @click="clearFilterInput"
    />
  </div>
</template>

<script>
export default {
  name: 'SearchBar',
  methods: {
    clearFilterInput () {
      document.getElementById('filterInput').value = ''
      this.showAll()
    },
    showAll () {
      let paths = document.getElementsByClassName('link')[0].children
      for (let path of paths) {
        path.style.display = 'block'
      }

      let nodes = document.getElementsByClassName('node')[0].children
      for (let node of nodes) {
        node.style.display = 'block'
      }

      // 去除 node text 高亮
      let nodeTexts = document.getElementsByClassName('nodeText')[0].children
      for (let text of nodeTexts) {
        text.style.display = 'block'
        if (text.children.length > 0) {
          let nodeName = ''
          for (let tspan of text.children) {
            nodeName += tspan.innerHTML
          }
          text.innerHTML = nodeName
        }
      }
      // 去除 link text 高亮
      let linkTexts = document.getElementsByClassName('linkText')[0].children
      for (let text of linkTexts) {
        text.style.display = 'block'
        text = text.children[0]
        if (text.children.length > 0) {
          let originalLinkText = ''
          for (let tspan of text.children) {
            originalLinkText += tspan.innerHTML
          }
          text.innerHTML = originalLinkText
        }
      }
    }
  }
}
</script>

<style>
.filterInputWrapper {
  position: absolute;
  margin-top: 15px;
  left: 50px;
  background: white;
  overflow: hidden;
  display: flex;
  padding: 5px 10px;
  border-radius: 25px;
  height: 20px;
  width: 250px;
}

#filterInput {
  border: none;
  margin: 0 0 0 5px;
  width: 120px;
}
#filterInput {
  outline: none;
}
.clear-icon {
  float: right;
  width: 16px;
  cursor: pointer;
}
.filter-icon {
  cursor: pointer;
}
#filterCheckboxContainer {
  position: absolute;
  margin-top: 52px;
  left: 53.5%;
  background-color: rgba(169, 169, 169, 0.8);
  color: white;
  font-size: 14px;
  width: 90px;
  min-width: 80px;
  height: 110px;
  min-height: 80px;
  overflow-y: auto;
  border-radius: 8px;
}
#filterCheckbox {
  position: relative;
  margin-top: 5%;
  margin-bottom: 5%;
}
.filterCheckboxIcon {
  margin-left: 15%;
  margin-top: 4%;
}
.filterCheckboxContent {
  margin-left: 5%;
}

#filter-modes {
  width: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 3px;
}
.filter-mode-name {
  font-size: 12px;
  margin-left: 2%;
}
</style>
