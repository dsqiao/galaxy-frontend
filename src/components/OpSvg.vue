<template>
  <div
    class="svg"
    @mouseenter="this.hover"
    @mouseleave="this.unhover"
    :style="active && 'background: var(--tool-bar-svg-background);'"
  >
    <img :src="active ? this.activeSrc : this.src" />
    <transition name="hint-fade">
      <div class="hint" v-show="isHovered">{{ this.hint }}</div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'OpSvg',
  props: {
    hint: {
      type: String,
      default: 'hint',
    },
    src: {
      type: String,
      default: '',
    },
    active: {
      type: Boolean,
      default: false,
    },
    activeSrc: {
      type: String,
      default: '',
    }
  },
  data () {
    return {
      isHovered: false,
    }
  },
  methods: {
    hover () {
      this.isHovered = true
    },
    unhover () {
      this.isHovered = false
    }
  }
}
</script>

<style scoped>
.svg {
  height: 38px;
  width: 38px;
  border-radius: 19px;
  transition: 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin: 15px 0;
  box-sizing: border-box;
}
.svg:hover {
  background-color: var(--tool-bar-svg-background);
  transition: 0.3s;
}
.hint {
  position: absolute;
  left: calc(var(--toolbar-width) + 6px);
  border: none;
  background-color: #202124;
  border-radius: 3px;
  padding: 6px;
  color: var(--gray-400);
  font-size: 12px;
}
.hint-fade-enter {
  opacity: 0;
}
.hint-fade-enter-active {
  transition-delay: 0.3s;
  transition-duration: 0.6s;
}
.hint-fade-leave-to {
  opacity: 0;
}
.hint-fade-leave-active {
  transition-delay: 0;
  transition-duration: 0.6s;
}
</style>
