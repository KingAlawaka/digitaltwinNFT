<template>
    <section class="container">
      <form @submit.prevent="addCollection">
        <div>
          <label for="goaltext">Name</label>
          <input type="text" id="goaltext" v-model="nametxt" />
        </div>
        <div>
          <label for="goaltext">Description</label>
          <input type="text" id="goaltext" v-model="desctxt" />
        </div>
        <div>
          <label for="goaltext">Token</label>
          <input type="text" id="goaltext" v-model="tokentxt" />
        </div>
        <p v-if="invalidInput">Please enter a valid collection details.</p>
        <button>Add Collection</button>
      </form>
    </section>
  </template>
  
  <script>
  import { ref, watch } from "vue";
  
  export default {
    emits: ["add-collection"],
    setup(_, context) {
      const nametxt = ref("");
      const desctxt = ref("");
      const tokentxt = ref("");
      const invalidInput = ref(false);
  
      watch(invalidInput, function (val) {
        if (val) {
          console.log("Analytics: Invalid Input");
        }
      });
  
      function addCollection() {
        invalidInput.value = false;
        if (nametxt.value === "" || tokentxt.value ==="") {
          invalidInput.value = true;
          return;
        }
        context.emit("add-collection", nametxt.value,desctxt.value,tokentxt.value);
        nametxt.value = "";
        desctxt.value = "";
        tokentxt.value = "";
      }
  
      return {
        nametxt,
        desctxt,
        tokentxt,
        addCollection,
      };
    },
  };
  </script>
  
  <style scoped>
  form {
    text-align: center;
  }
  
  label {
    display: block;
    font-weight: bold;
    margin-bottom: 0.5rem;
  }
  
  input {
    font: inherit;
    display: block;
    width: 100%;
    margin-bottom: 0.5rem;
  }
  </style>