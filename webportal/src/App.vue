<script setup lang="ts">
import HelloWorld from './components/HelloWorld.vue'
import NFTManagement from './components/NFTManagement.vue';
import Home from './components/Home.vue';
import Edit from './components/CreateCollection.vue';
import CourseGoals from './components/CourseGoals.vue';
import NFTLoyalty from './components/NFTLoyalty.vue';

</script>

<template>
  <!-- <div>
    <a href="https://vitejs.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
    </a>
  </div> -->
  <!-- <HelloWorld /> -->
  <NFTManagement />
  <!-- <router-view /> -->
  <!-- <Home /> -->
  <!-- <Edit/> -->
  <!-- <CourseGoals/> -->
  <NFTLoyalty></NFTLoyalty>
</template>

<style scoped>

</style>
