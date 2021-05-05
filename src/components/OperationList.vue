<template>
  <div id="operationList">
    <ul id="operations">
      <li class="operation">
        <button class="operation_button">
          <img src="../assets/svg/fullscreen.svg" />
        </button>
      </li>
      <li class="operation">
        <button class="operation_button" @click="btnAddNode">
          <img src="../assets/svg/new.svg" />
        </button>
      </li>
      <li class="operation">
        <button class="operation_button" @click="displayAttributeTable">
          <img src="../assets/svg/table.svg" />
        </button>
      </li>
      <li class="operation">
        <button class="operation_button" @click="refreshGraph">
          <img src="../assets/svg/refresh.svg" />
        </button>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'OperationList',
  data () {
    return {}
  }
}
</script>

<style>
#operationList {
  position: absolute;
  left: 27%;
  top: 35%;
  min-height: 150px;
}

#operations {
  margin-left: 2%;
  text-align: left;
  list-style: none;
}

.operation {
  margin-top: 50%;
}

.operation .operation_button {
  border-radius: 15px;
  padding: 2px 5px;
  color: #1179b3;
  background-color: #dcdcdc;
  font-weight: bold;
}
.operation_button img {
  margin-top: 2px;
}
.operation .operation_button:hover {
  transform: scale(1.1);
  background-color: #fff;
  transition: 0.2s;
}
</style>
