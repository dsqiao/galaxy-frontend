<template>
  <transition name="drawer-fade">
    <div class="drawer__wrapper" v-show="visible">
      <div class="drawer__container" :class="visible && 'drawer__open'">
        <div class="drawer">
          <header class="drawer__header">
            <div class="icon" @click="closeDrawer">
              <img src="../assets/svg/return.svg"/>
            </div>
            <div class="title">{{this.title}}</div>
          </header>
          <section class="drawer__body">
            <slot></slot>
          </section>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'Drawer',
  props: {
    visible: {
      type: Boolean
    },
    title: {
      type: String,
      default: '标题',
    }
  },
  computed: {},
  data () {
    return {}
  },
  watch: {},
  methods: {
    closeDrawer () {
      this.$emit('update:visible', false)
    }
  },
  mounted: {},
  destroyed: {},
}
</script>

<style>
.drawer__wrapper {
  position: fixed;
  top: var(--nav-height);
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 2021;
  overflow: hidden;
}
.drawer__container {
  position: relative;
  height: 100%;
  width: 100%;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}
.drawer {
  position: absolute;
  overflow: hidden;
  width: max(18%, 280px);
  height: 100%;
  left: 0;
  top: 0;
  bottom: 0;
  background-color: #202124;
}
.drawer__header {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 24px 30px;
}
.icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 19px;
  cursor: pointer;
  transition: 0.3s; /* unhover 时用 */
}
.icon:hover {
  background-color: #3c4043;
  transition: .3s;
}
.title {
  margin-left: 20px;
  color: white;
}
.drawer__open .drawer {
  animation: drawer-in 0.3s 0ms;
}
@keyframes drawer-in {
  0% {
    transform: translate(-100%, 0);
    opacity: 0;
  }
  100% {
    transform: translate(0, 0);
    opacity: 1;
  }
}
.drawer-fade-leave-to {
  transform: translate(min(-18%, -280px), 0);
  opacity: 0;
}
.drawer-fade-leave-active {
  transition-property: all;
  transition-timing-function: ease;
  transition-delay: 0ms;
  transition-duration: 0.3s;
}
</style>
