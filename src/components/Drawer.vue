<template>
  <transition name="drawer-fade">
    <div class="drawer__wrapper" v-show="visible">
      <div class="drawer__container" :class="visible && 'drawer__open'">
        <div class="drawer">
          <header class="drawer__header">
            <div class="icon" @click="closeDrawer">
              <img src="../assets/svg/return.svg" />
            </div>
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
.icon {
  width: 32px;
  height: 32px;
  border-radius: 16px;
  border: 1px solid #0011ff;
}
/* in 的时候，display 先被设置为 block，然后运行 animation，没问题 */
/* out 的时候，display 先被设置为 none，然后运行 animation，所以 animtaion 就看不到了 */
.drawer__open .drawer {
  animation: drawer-in 0.3s 0ms;
}
/* .drawer {
  animation: drawer-out 1s 100ms;
} */
@keyframes drawer-in {
  0% {
    transform: translate(-100%, 0);
  }
}
.drawer-fade-leave-to {
  /* 这里不应该用 100%，因为 transition 的宽度有整个元素那么宽了。应该用 drawer 的宽度 */
  transform: translate(min(-18%, -280px), 0);
  opacity: 0;
}
.drawer-fade-leave-active {
  transition-property: all;
  transition-timing-function: ease;
  transition-delay: 0ms;
  transition-duration: 0.3s; /* 这里不能用 .3s，必须把0写上 */
}

</style>
