<script setup lang="ts">
import Vue from 'vue';
import { onMounted, ref, defineComponent } from 'vue';
import { Sdk, TokenByIdResponse, Options, IBalance } from "@unique-nft/sdk";
import { IPolkadotExtensionAccount, Polkadot, IPolkadotExtensionLoadWalletsResult } from "@unique-nft/utils/extension"
import { async } from '@firebase/util';
// import { AccountTokensResult } from '@unique-nft/substrate-client/tokens';
import { AccountTokensResult } from '@unique-nft/substrate-client/tokens';
import GoalsList from "./GoalsList.vue";
// import {fs} from 'fs';


const options: Options = {
    baseUrl: 'https://rest.unique.network/opal/v1'
};

const sdk = new Sdk(options)

const accountRef = ref<IPolkadotExtensionAccount | null>(null)
const walletResult = ref<IPolkadotExtensionLoadWalletsResult | null>(null)
const tokenRef = ref<TokenByIdResponse | null>(null)
let toAddress = ""
let fromAddress = ""
const accountBalance = ref<IBalance | null>(null);
const collectionNametxt = ref("");
const collectionTokentxt = ref("");
const dtTranstxt = ref("");
const collectionIDs = ref([]);
const tokenIDs = ref<Array>([]);
let loading = ref<Boolean>(false);
let selectedCollectionID = 0;
let selectedTokenID = 0;
let transferStatus = ref("status");
let transactionStatus = ref("status");
let collectionCreationStatus = ref("status");
let mintTokenStatus = ref("status");
let dtFromAddress = ""
let selectedDTID = 0;
const goals = ref([]);


// const options = ''

onMounted(async () => {
    console.log("Wada")
    loading.value = true;
    const results = await Polkadot.enableAndLoadAllWallets()
    accountRef.value = results.accounts[0]
    console.log(accountRef.value)
    walletResult.value = results
    loading.value = false;
    var e = (document.getElementById("selectDTTransferTokenID")) as HTMLSelectElement;
    var sel = e.selectedIndex;
    var opt = e.options[sel];
    console.log((<HTMLSelectElement>opt).value);

})

const getAccounts = async () => {
    loading.value = true;
    const results = await Polkadot.enableAndLoadAllWallets()

    walletResult.value = results

    console.log(walletResult)
    loading.value = false;
}

function recordTransactions(msg: any) {
    const newTrans = {
        id: new Date().toISOString(),
        text: msg,
    };
    goals.value.push(newTrans);
}

function getSelectedItem(ele: any) {
    var e = (document.getElementById(ele)) as HTMLSelectElement;
    var sel = e.selectedIndex;
    var opt = e.options[sel];
    console.log((<HTMLSelectElement>opt).value);
    return (<HTMLSelectElement>opt).value;
}

const getMainAccount = async (event: any) => {
    loading.value = true;
    fromAddress = event
    console.log(event)
    console.log(fromAddress)
    getMyBalance()
    loading.value = false;
    recordTransactions("Selected Account " + event)
    // getOwnTokens()
}

const getTokenIDSelectedDT = async (event: any) => {
    selectedDTID = event;
}

const getTokenIDAccount = async (event: any) => {
    selectedTokenID = event;
    transferStatus.value = "";
}

const getFromAccount = async (event: any) => {
    // fromAddress = event;
    transferStatus.value = "";
}

const getToAccount = async (event: any) => {
    toAddress = event;
    transferStatus.value = "";
}

async function getAddress(a: string) {
    loading.value = true;
    let accountIndex = 0;
    const enablingResult = await Polkadot.enableAndLoadAllWallets()
    for (var i = 0; i < enablingResult.accounts.length; i++) {
        if (a == enablingResult.accounts[i].address) {
            console.log(i)
            accountIndex = i;
        }
    }
    loading.value = false;
    return enablingResult.accounts[accountIndex]
}

const getMyBalance = async () => {
    loading.value = true;
    const account = await getAddress(fromAddress);

    if (!account) {
        throw new Error('No Account')
    }

    const balance = await sdk.balance.get({
        address: account.address,
    })
    accountBalance.value = balance.availableBalance.amount
    console.log(accountBalance)
    console.log(balance)
    loading.value = false;
    recordTransactions("Called my balance " + accountBalance.value)
}

const getOwnTokens = async () => {

    const account = await getAddress(fromAddress);
    if (!account) {
        throw new Error('No Account')
    }

    if (collectionIDs.value.length <= 0) {
        throw new Error('No Collections Created')
    }
    const collectionId = collectionIDs.value[0]

    const tokensResult: AccountTokensResult = await sdk.tokens.accountTokens({
        collectionId: collectionId,
        address: account.address,
    });

    const token = tokensResult.tokens[0];
    console.log(tokensResult)
    const { collectionNumber, tokenId } = token;
}

const onDTFormSubmit = async () => {
    const fromAccount = await getAddress(fromAddress);

    if (!fromAccount) {
        throw new Error('No accounts selected')
    }

    if (collectionIDs.value.length <= 0) {
        throw new Error('No Collections Created')
    }
    const collectionId = collectionIDs.value[0]

    const ret = await sdk.tokens.topmostOwner({
        collectionId: collectionId,
        tokenId: selectedDTID,
    })
    console.log(ret.topmostOwner)

    if (fromAccount.address != ret.topmostOwner) {
        transactionStatus.value = "DT inaccessible using this account";
        recordTransactions("Account: " + fromAccount.address + " tried to do a transaction.")
        throw new Error('No Collections Created')
    }
    else {
        transactionStatus.value = "Sucessfully submited";
        recordTransactions("Account: " + fromAccount.address + " sucuessfuly did a transaction")
    }

}

const onFormSubmit = async () => {
    loading.value = true;
    console.log(collectionNametxt.value)
    // const enablingResult = await Polkadot.enableAndLoadAllWallets()
    // let accountIndex = 0;
    // for (var i=0; i<enablingResult.accounts.length;i++){
    //     if (fromAddress == enablingResult.accounts[i].address){
    //         console.log(i)
    //         accountIndex=i;
    //     }
    // }
    // const account = enablingResult.accounts[accountIndex];
    const account = await getAddress(fromAddress);
    console.log(account.address)
    collectionCreationStatus.value = "New Collection Creating... ";
    const collectionCreateResult = await sdk.collections.creation.submitWaitResult({
        address: account.address,
        name: collectionNametxt.value,
        description: "DT NFT collection",
        tokenPrefix: collectionTokentxt.value,
        schema: {
            schemaName: "unique",
            schemaVersion: "1.0.0",
            image: {
                urlTemplate: "https://gateway.ipfs.io/ipfs/{infix}"
            },
            coverPicture: {
                ipfsCid: "QmPWdEpCY5uMqerUxMsPoXbUwRqdRSvr6zo3NY8ubtRDZr"
            },
            attributesSchemaVersion: "1.0.0",
            attributesSchema: {
                0: {
                    name: { _: 'color' },
                    type: 'string',
                    optional: true,
                    enumValues: {
                        0: { _: 'red' },
                        1: { _: 'blue' },
                        2: { _: 'green' },
                    }
                },
            }
        }
    }, {
        signer: account.uniqueSdkSigner
    })
    collectionIDs.value.push(collectionCreateResult.parsed?.collectionId)
    loading.value = false;
    console.log(collectionCreateResult.parsed)
    collectionCreationStatus.value = "Collection Created " + collectionCreateResult.parsed?.collectionId;
}

const dtTransferToAddress = async () => {

    console.log(getSelectedItem("selectDTTransferFromAdd"))

    const fromAccount = await getAddress(getSelectedItem("selectDTTransferFromAdd"));
    const toAccount = await getAddress(getSelectedItem("selectDTTransferToAdd"));
    if (!fromAccount || !toAccount) {
        throw new Error('No accounts selected')
    }

    if (collectionIDs.value.length <= 0) {
        throw new Error('No Collections Created')
    }
    const collectionId = collectionIDs.value[0]

    const ret = await sdk.tokens.topmostOwner({
        collectionId: collectionId,
        tokenId: selectedTokenID,
    })
    console.log(ret.topmostOwner)

    if (fromAccount.address != ret.topmostOwner) {
        transferStatus.value = "DT inaccessible using this account";
        throw new Error('No Collections Created')
    }
    transferStatus.value = "DT transfer on progress..."
    const tokenTransferResult = await sdk.tokens.transfer.submitWaitResult({
        address: fromAccount.address,
        collectionId: collectionId,
        tokenId: selectedTokenID,
        to: toAccount.address
    }, {
        signer: fromAccount.uniqueSdkSigner
    })

    console.log(tokenTransferResult.parsed)
    transferStatus.value = tokenTransferResult.parsed;
}

const uploadFileToIPFS = async () => {
    const file = fs.readFileSync('../assets/car1.jpeg');

    const { fullUrl, cid } = await sdk.ipfs.uploadFile({ file });

    console.log(`Open by browser -> ${fullUrl}`);
    console.log(`Or use CID if you need -> ${cid}`);
}
function getRndInteger(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
const mintToken = async () => {
    let imageArr: string[];

    imageArr = [
        "QmSy8hkdkSoiMnCo4tjGsCewg8Wenq4z7KtMwyaJKURw58",
        "QmSgvVsKowbPRkWjBCbeLqyPAKyxNRT2hdTM3bKVJtA11R",
        "QmTWdbsCtuSM39HJXditR3VUg27qUXtrQor1omokpzdtUa",
        "QmPWdEpCY5uMqerUxMsPoXbUwRqdRSvr6zo3NY8ubtRDZr"];

    let imgIndex = getRndInteger(0, 3);

    loading.value = true;
    const account = await getAddress(fromAddress);
    if (!account) {
        throw new Error('No account')
    }

    if (collectionIDs.value.length <= 0) {
        throw new Error('No Collections Created')
    }
    const collectionId = collectionIDs.value[0]
    mintTokenStatus.value = "DT NFT minting..."
    const tokenResult = await sdk.tokens.create.submitWaitResult({
        address: account.address,
        collectionId,
        data: {
            image: {
                ipfsCid: imageArr[imgIndex]
            },
            encodedAttributes: {
                0: 0
            }
        }
    }, {
        signer: account.uniqueSdkSigner
    })
    tokenIDs.value.push(tokenResult.parsed)
    loading.value = false;
    console.log(tokenResult.parsed)
    mintTokenStatus.value = "Minted DT NFT: Collection= " + tokenResult.parsed?.collectionId + " NFT ID= " + tokenResult.parsed?.tokenId;
    for (var i = 0; i < tokenIDs.value.length; i++) {
        console.log(tokenIDs.value[i].collectionId)
        console.log(tokenIDs.value[i].tokenId)
    }
    await getToken(tokenResult.parsed?.collectionId, tokenResult.parsed?.tokenId);

}



const getToken = async (collectionId: number, tokenId: number) => {
    const token = await sdk.tokens.get({
        collectionId,
        tokenId,
    })

    tokenRef.value = token

    console.log(token)
}


// export default defineComponent({
//   data() {
//     return {
//       selectedValue: ''
//     };
//   },
//   methods: {
//     changeHandler(event: any) {
//       this.selectedValue = event.target.value;
//       this.callTypeScriptFunction(this.selectedValue);
//     },
//     callTypeScriptFunction(value: string) {
//       console.log('Selected value:', value);
//     }
//   }
// });

// export default Vue.extend({
//   data() {
//     return {
//       selectedValue: ''
//     };
//   },
//   methods: {
//     changeHandler(event: any) {
//       this.selectedValue = event.target.value;
//       this.callTypeScriptFunction(this.selectedValue);
//     },
//     callTypeScriptFunction(value: string) {
//       console.log('Selected value:', value);
//     }
//   }
// });

</script>
<template>
    <!-- <h1>{{ loading }}</h1> -->
    <!-- <button @click="getAccounts">Accounts</button>
        <button @click="getMyBalance">Balance</button> -->
    <div style="border: 2px solid white;padding: 30px 30px;margin: 10px;">
        <h3>Account Balance</h3>
        <p>{{ accountBalance }}</p>
    </div>

    <div style="border: 2px solid white;padding: 30px 30px;margin: 10px;">
        <h3>Select Account for interact with the system</h3>
        <select @change="getMainAccount($event.target.value)">
            <option>--Select Address--</option>
            <option v-for="option in walletResult?.accounts" :key="option.address" :value="option.address">
                {{ option.name }}
            </option>
        </select>
    </div>
    <div style="border: 2px solid white;padding: 30px 30px;margin: 10px;">
        <h3>Create Collection</h3>
        <form @submit.prevent="onFormSubmit()" class="add-form">
            <div class="form-control">
                <label>Name</label>
                <input type="text" v-model="collectionNametxt" name="name" placeholder="Enter Your Name" />
            </div>
            <div class="form-control">
                <label>Token</label>
                <input type="text" v-model="collectionTokentxt" name="token" placeholder="Enter Your Age" />
            </div>
            <input type="submit" value="Create Collection" class="btn btn-block" />
        </form>
        <p> {{ collectionCreationStatus }}</p>
    </div>
    <div style="border: 2px solid white;padding: 30px 30px;margin: 10px;">
        <h3>Mint Tokens</h3>
        <button @click="mintToken">Mint Token</button>
        <p> {{ mintTokenStatus }}</p>
        <div v-if="tokenRef">
            <img :src="tokenRef.image.fullUrl!" style="width: 100px;"><br />
            <div>
                {{ tokenRef.collection.tokenPrefix }} #{{ tokenRef.tokenId }}
            </div>
            <div>
                owner: {{ tokenRef.owner }}
            </div>
            <div v-for="attr in tokenRef.attributes">
                {{ attr.name?._ }}: {{ attr.value }}
            </div>
        </div>
    </div>
    <div style="border: 2px solid white;padding: 30px 30px;margin: 10px;">
        <h3>DT transactions</h3>
        <!-- <button @click="getOwnTokens">Get Own Tokens</button> -->
        <select @change="getTokenIDSelectedDT($event.target.value)">
            <option>--Select DT--</option>
            <option v-for="option in tokenIDs" :key="option.tokenId" :value="option.tokenId">
                {{ option.tokenId }}
            </option>
        </select>
        <form @submit.prevent="onDTFormSubmit()" class="add-form">
            <div class="form-control">
                <label>Transaction</label>
                <input type="text" v-model="dtTranstxt" name="dtTrans" placeholder="Transaction" />
            </div>
            <input type="submit" value="Transaction" class="btn btn-block" />
        </form>
        <p> {{ transactionStatus }}</p>
    </div>
    <div style="border: 2px solid white;padding: 30px 30px;margin: 10px;">
        <h3>DT transfer</h3>
        <!-- <button @click="getOwnTokens">Get Own Tokens</button> -->
        <select id="selectDTTransferTokenID" @change="getTokenIDAccount($event.target.value)">
            <option>--Select DT Token--</option>
            <option v-for="option in tokenIDs" :key="option.tokenId" :value="option.tokenId">
                {{ option.tokenId }}
            </option>
        </select>
        <select id="selectDTTransferFromAdd" @change="getFromAccount($event.target.value)">
            <option>--Select From Address--</option>
            <option v-for="option in walletResult?.accounts" :key="option.address" :value="option.address">
                {{ option.name }}
            </option>
        </select>
        <select id="selectDTTransferToAdd" @change="getToAccount($event.target.value)">
            <option>--Select To Address--</option>
            <option v-for="option in walletResult?.accounts" :key="option.address" :value="option.address">
                {{ option.name }}
            </option>
        </select>
        <button @click="dtTransferToAddress">DT Transfer</button>
        <p> {{ transferStatus }}</p>
    </div>
    <goals-list :goals=goals></goals-list>
</template>
