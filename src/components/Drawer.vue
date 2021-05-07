<template>
  <transition name="drawer-fade">
    <div class="drawer__wrapper" v-show="visible">
      <div class="drawer__container" :class="visible && 'drawer__open'">
        <div class="drawer" :style="{ width: this.width }">
          <header class="drawer__header">
            <div class="icon" @click="closeDrawer">
              <img src="../assets/svg/return.svg" />
            </div>
            <div class="title">{{ this.title }}</div>
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
    },
    width: {
      type: String,
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
    },
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
  transition: 0.3s;
}
.title {
  margin-left: 20px;
  color: white;
}
.drawer-fade-enter-active {
  animation: drawer-fade-in 0.4s ease;
}
.drawer-fade-leave-active {
  animation: drawer-fade-in 0.4s ease reverse;
}
@keyframes drawer-fade-in {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
.drawer__open .drawer {
  animation: drawer-in 0.4s;
}
.drawer {
  animation: drawer-out 0.4s;
}
@keyframes drawer-in {
  0% {
    transform: translate(-100%, 0);
  }
  100% {
    transform: translate(0, 0);
  }
}
@keyframes drawer-out {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(-100%, 0);
  }
}
</style>
