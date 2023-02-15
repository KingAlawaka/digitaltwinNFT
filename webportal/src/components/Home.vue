<template>
  <!-- <select ref="selectElement">
    <option value="option1">Option 1</option>
    <option value="option2">Option 2</option>
    <option value="option3">Option 3</option>
  </select> -->
  <div>
    <CreateCollection />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { onMounted,ref,defineComponent} from 'vue';
import {Sdk, TokenByIdResponse, Options, IBalance} from "@unique-nft/sdk";
import {IPolkadotExtensionAccount,Polkadot,IPolkadotExtensionLoadWalletsResult} from "@unique-nft/utils/extension"
import CreateCollection from './CreateCollection.vue';

const options: Options = {
  baseUrl: 'https://rest.unique.network/opal/v1'
  };

const sdk = new Sdk(options)

const accountRef = ref<IPolkadotExtensionAccount | null>(null)
const walletResult = ref<IPolkadotExtensionLoadWalletsResult | null>(null)
let toAddress = ""
let fromAddress = ""
const accountBalance = ref <IBalance | null>(null);

export default({
  data() {
    return {
      // selectedValue: ''
    };
  },
  async mounted() {
    // this.$refs.selectElement.addEventListener('change', this.changeHandler);
    const results = await Polkadot.enableAndLoadAllWallets()
  accountRef.value = results.accounts[0]
  console.log(accountRef.value.address)
  },
  beforeDestroy() {
    // this.$refs.selectElement.removeEventListener('change', this.changeHandler);
  },
  methods: {
    changeHandler(event: any) {
      this.selectedValue = event.target.value;
      this.callTypeScriptFunction(this.selectedValue);
    },
    callTypeScriptFunction(value: string) {
      console.log('Selected value:', value);
    }
  },
  components:{
    CreateCollection
  }
});
</script>




