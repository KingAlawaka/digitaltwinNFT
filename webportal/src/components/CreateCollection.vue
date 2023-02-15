<template>
    <!-- <div id="from-address">
        {{ fromAddress }}
    </div> -->
    <div style="border: 2px solid white;padding: 30px 30px;margin: 10px;">
        <button @click="getAccounts()">Get Accounts</button>
    <select @change="getAccount($event.target.value)">
        <option> --Select Address-- </option>
      <option v-for="option in walletResult?.accounts" :key="option.address" :value="option.address">
        {{ option.name }}
      </option>
    </select>
    <form @submit="onSubmit" class="add-form">
    <div class="form-control">
      <label>Collection Name</label>
      <input type="text" v-model="collectionName" name="collectionName" placeholder="Collection Name" />
    </div>
    <div class="form-control">
      <label>Description</label>
      <input type="text" v-model="collectionDesc" name="collectionDesc" placeholder="Collection Description"/>
    </div>
    <div class="form-control">
      <label>Token Prefix</label>
      <input type="text" v-model="tokenPrefix" name="token" placeholder="Token Prefix"/>
    </div>
    <input type="submit" value="Create Collection" class="btn btn-block" />
  </form>
</div>
</template>
<script lang="ts">
import Vue from 'vue';
import { onMounted,ref,defineComponent} from 'vue';
import {Sdk, TokenByIdResponse, Options,IBalance} from "@unique-nft/sdk";
import {IPolkadotExtensionAccount,Polkadot,IPolkadotExtensionLoadWalletsResult} from "@unique-nft/utils/extension"
import Edit from './CreateCollection.vue';

const accountRef = ref<IPolkadotExtensionAccount | null>(null)
const walletResult = ref<IPolkadotExtensionLoadWalletsResult | null>(null)
let toAddress = ""
let fromAddress = ""
const accountBalance = ref <IBalance | null>(null);

    export default {
        name : 'AddInformation',
        // props: ['fromAddress'],
        data (){
            return {
                collectionName : '',
                collectionDesc : '',
                tokenPrefix: '',
                selectAddress: walletResult
            }
        },
        async mounted() {
    // this.$refs.selectElement.addEventListener('change', this.changeHandler);
    const results = await Polkadot.enableAndLoadAllWallets()
  accountRef.value = results.accounts[0]
  console.log(accountRef.value.address)
  walletResult.value = results
  },
  beforeDestroy() {
    // this.$refs.selectElement.removeEventListener('change', this.changeHandler);
  },
        methods : {
            onSubmit(e){
                e.preventDefault()
                if(!this.collectionName || !this.collectionDesc || !this.tokenPrefix){
                    alert('Please Add Collection Details')
                    return
                }
                const collectionInfo = {
                    collectionName : this.collectionName,
                    collectionDesc : this.collectionDesc,
                    tokenPrefix : this.tokenPrefix
                    
                }
                console.log(collectionInfo.collectionName)

                // this.$emit('add-information', newInformation)
                this.collectionName = ' ',
                this.collectionDesc = ' ',
                this.tokenPrefix = ''
            },
            async getAccounts(){
                const results = await Polkadot.enableAndLoadAllWallets()

                    walletResult.value = results

                    console.log(walletResult)
            }
        }
    }
</script>