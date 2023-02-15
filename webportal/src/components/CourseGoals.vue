<template>
    <div>
      <goals-list :goals="filteredGoals"></goals-list>
      <add-goal @add-goal="addGoal"></add-goal>
    </div>
    <div>
      <button @click="getAccountAddress()">get Accounts</button>
      <select @change="getAccountDetails($event.target.value)">
        <option>--Select Address--</option>
      <option v-for="option in accountList?.accounts" :key="option.address" :value="option.address">
        {{ option.name }}
      </option>
    </select>
    </div>
    <div>
      <button @click="getBalance()"></button>
      <p>{{ accountBalance }}</p>
    </div>
    <div>
      <add-collection @add-collection="addCollection"></add-collection>
    </div>
  </template>
  
  <script lang="ts">
  import { ref, computed } from 'vue';
  import { onMounted,defineComponent} from 'vue';
import {Sdk, TokenByIdResponse, Options, IBalance} from "@unique-nft/sdk";
import {IPolkadotExtensionAccount,Polkadot,IPolkadotExtensionLoadWalletsResult} from "@unique-nft/utils/extension"
import CreateCollection from './CreateCollection.vue';
import AddCollection from "./AddCollection.vue";

// let options = Options = {
//   baseUrl: 'https://rest.unique.network/opal/v1'
//   };

const sdk = new Sdk({baseUrl: 'https://rest.unique.network/opal/v1'})

  import GoalsList from "./GoalsList.vue";
  import AddGoal from "./AddGoal.vue";

  const accountRef = ref<IPolkadotExtensionAccount | null>(null)
const walletResult = ref<IPolkadotExtensionLoadWalletsResult | null>(null)
let toAddress = ""
let fromAddress = ref<IPolkadotExtensionAccount | null>(null)


  export default {
    components: {
      GoalsList,
      AddGoal,
      AddCollection,
    },
    setup() {
      const goals = ref([]);
      const accountList = ref<IPolkadotExtensionLoadWalletsResult | null>(null)
      const accountBalance = ref <IBalance | null>(null);

      const filteredGoals = computed(function() {
        return goals.value.filter(
          (goal) => !goal.text.includes("Angular") && !goal.text.includes("React")
        );
      });

      function addGoal(text1,text2) {
        const newGoal = {
          id: new Date().toISOString(),
          text: text1,
        };
        goals.value.push(newGoal);
        console.log("second ",text2)
      }

     async function addCollection(nametxt,desctxt,tokentxt){
        const account = fromAddress 
  if (!account){
    throw new Error('No account')
  }

  const collectionCreateResult = await sdk.collections.creation.submitWaitResult({
    address: account.address,
    name: nametxt,
    description: desctxt,
    tokenPrefix: tokentxt,
    schema: {
      schemaName: "unique",
      schemaVersion: "1.0.0",
      image:{
        urlTemplate: "https://gateway.ipfs.io/ipfs/{infix}"
      },
      coverPicture: {
        ipfsCid: "QmPWdEpCY5uMqerUxMsPoXbUwRqdRSvr6zo3NY8ubtRDZr"
      },
      attributesSchemaVersion: "1.0.0",
      attributesSchema:{
        0: {
          name: {_:'color'},
          type: 'string',
          optional: true,
          enumValues:{
            0: {_:'red'},
            1: {_:'blue'},
            2: {_:'green'},
          }
        },
      }
    }
  },{
    signer: account.uniqueSdkSigner
  })

  console.log(collectionCreateResult.parsed)
      }

      async function getAccountAddress(){
        const results = await Polkadot.enableAndLoadAllWallets()
        accountRef.value = results.accounts[0]
        accountList.value = results
        console.log(accountRef.value.address)
      }

      async function getAccountDetails(event:any){
        console.log(event)
        fromAddress = event
        getBalance()
      }

      async function getBalance() {
        // const account = fromAddress

        if (!fromAddress){
          throw new Error('No Account')
        }

        const balance = await sdk.balance.get({
          address: fromAddress,
        })
        accountBalance.value = balance.availableBalance.amount
        console.log(accountBalance)
        console.log(balance)
      }


      return {
        accountList: accountList,
        filteredGoals: filteredGoals,
        accountBalance: accountBalance,
        addGoal: addGoal,
        addCollection:addCollection,
        getAccountAddress:getAccountAddress,
        getAccountDetails:getAccountDetails,
        getBalance: getBalance
      };
    }
}
</script>