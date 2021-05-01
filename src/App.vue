<template>
  <div id="app">
    <Nav />
    <div id="content">
      <div id="listContainer">
        <GraphList />
      </div>
      <GraphContainer />
    </div>
  </div>
</template>

<script>
import GraphContainer from './components/GraphContainer.vue'
import Nav from './components/Nav.vue'
import GraphList from './components/GraphList.vue'
export default {
  name: 'App',
  components: {
    GraphContainer,
    Nav,
    GraphList
  }
}
</script>

<style>
* {
  --app-height: 100vh;
  --nav-height: 65px;
  --content-height: calc(var(--app-height) - var(--nav-height));
}
#app {
  margin: 0;
  padding: 0;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  height: var(--app-height);
}
#content {
  height: var(--content-height);
  display: grid;
  grid-template-columns: 1fr 4fr;
}
</style>
