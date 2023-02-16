<template>
    <section class="container">
      <h3>Transactions</h3>
      <ul>
        <li v-for="transaction in transactionsList" :key="transaction.id">{{ transaction.text }}</li>
      </ul>
    </section>
  </template>
  
  <script>
  export default {
    props: ["transactionsList"],
  };
  </script>
  
  <style scoped>
  ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  
  li {
    margin: 1rem 0;
    border: 1px solid #ccc;
  }
  </style>