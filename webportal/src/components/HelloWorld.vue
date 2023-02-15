<script setup lang="ts">
import { onMounted,ref,defineComponent} from 'vue';
import {Sdk, TokenByIdResponse, Options} from "@unique-nft/sdk";
import {IPolkadotExtensionAccount,Polkadot} from "@unique-nft/utils/extension"
import { firestoreAction } from 'vuexfire';

import {getUsers} from './NFTManagement.vue'

const options: Options = {
  baseUrl: 'https://rest.unique.network/opal/v1'
  };

const sdk = new Sdk(options)

const accountRef = ref<IPolkadotExtensionAccount | null>(null)

onMounted(async()=>{
  console.log("Wada")
  const results = await Polkadot.enableAndLoadAllWallets()
  accountRef.value = results.accounts[0]
  console.log(accountRef.value.address)
  console.log(getUsers())
})

</script>

<template>
  <p> hello</p>
  <div>
    <!-- Create a document -->
    <button @click="createDocument()">Create Document</button>
    <!-- Read documents -->
    <ul v-for="(doc, index) in documents" :key="index">
      {{ doc.id }} - {{ doc.data().message }}
    </ul>
    <!-- Update a document -->
    <button @click="updateDocument(documents[0].id)">Update Document</button>
    <!-- Delete a document -->
    <button @click="deleteDocument(documents[0].id)">Delete Document</button>
  </div>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
