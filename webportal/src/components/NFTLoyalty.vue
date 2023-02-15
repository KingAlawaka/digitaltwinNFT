<script setup lang="ts">
import { onMounted, ref} from 'vue';
import { Sdk, TokenByIdResponse, Options, IBalance } from "@unique-nft/sdk";
import { IPolkadotExtensionAccount, Polkadot, IPolkadotExtensionLoadWalletsResult } from "@unique-nft/utils/extension"

const options: Options = {
    baseUrl: 'https://rest.unique.network/opal/v1'
};

const sdk = new Sdk(options)

const accountRef = ref<IPolkadotExtensionAccount | null>(null)
const walletResult = ref<IPolkadotExtensionLoadWalletsResult | null>(null)
const tokenRef = ref<TokenByIdResponse | null>(null)
let fromAddress = ""
let toAddress = ""
const accountBalance = ref<IBalance | null>(null);
const collectionNametxt = ref("");
const collectionTokentxt = ref("");
const collectionIDs = ref([]);
const tokenIDs = ref<Array>([]);
let loading = ref<Boolean>(false);
let selectedTokenID = 0;
let transferStatus = ref("status");
let RFTcollectionCreationStatus = ref("status");
let RTFBalanceStatus = ref("status");
let mintTokenStatus = ref("status");
let RTFTotalAmount = 3;
const goals = ref([]);

onMounted(async () => {
    console.log("Wada")
    loading.value = true;
    const results = await Polkadot.enableAndLoadAllWallets()
    accountRef.value = results.accounts[0]
    console.log(accountRef.value)
    walletResult.value = results
    loading.value = false;
})

const getAccount = async (event: any) => {
    loading.value = true;
    fromAddress = event
    console.log(event)
    console.log(fromAddress)
    getMyBalance()
    loading.value = false;
    recordTransactions("Selected Account " + event)
    // getOwnTokens()
}

function recordTransactions(msg: any) {
    const newTrans = {
        id: new Date().toISOString(),
        text: msg,
    };
    goals.value.push(newTrans);
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

const onCreateRFTCollectionFormSubmit = async () =>{
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
    RFTcollectionCreationStatus.value = "New RFT Collection Creating... ";
    const collectionCreateResult = await sdk.refungible.createCollection.submitWaitResult({
    // const collectionCreateResult = await sdk.collections.creation.submitWaitResult({
        address: account.address,
        name: collectionNametxt.value,
        description: "DT RFT collection",
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
    RFTcollectionCreationStatus.value = "Collection Created " + collectionCreateResult.parsed?.collectionId;
}

function getRndInteger(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const mintRFTToken = async () => {
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
const tokenResult = await sdk.refungible.createToken.submitWaitResult({
// const tokenResult = await sdk.tokens.create.submitWaitResult({
    address: account.address,
    collectionId,
    amount: 3,
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

function getSelectedItem(ele: any) {
    var e = (document.getElementById(ele)) as HTMLSelectElement;
    var sel = e.selectedIndex;
    var opt = e.options[sel];
    console.log((<HTMLSelectElement>opt).value);
    return (<HTMLSelectElement>opt).value;
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

const RFTTransferToAddress = async () => {

const fromAccount = await getAddress(getSelectedItem("selectRFTFromAdd"));
const toAccount = await getAddress(getSelectedItem("selectRFTToAdd"));
if (!fromAccount || !toAccount) {
    throw new Error('No accounts selected')
}

if (collectionIDs.value.length <= 0) {
    throw new Error('No Collections Created')
}
const collectionId = collectionIDs.value[0]
transferStatus.value = "DT transfer on progress..."
const tokenTransferResult = await sdk.refungible.transferToken.submitWaitResult({
    address: fromAccount.address,
    collectionId: collectionId,
    tokenId: selectedTokenID,
    to: toAccount.address,
    amount: 1,
}, {
    signer: fromAccount.uniqueSdkSigner
})

console.log(tokenTransferResult.parsed)
transferStatus.value = tokenTransferResult.parsed;


    

    const RTFAmount = await sdk.refungible.getBalance({
        address:toAccount.address,
        collectionId:collectionId,
        tokenId: 1
    });
if (RTFAmount.amount == RTFTotalAmount){
    transferStatus.value = "You got a discout for next service";
}


}

const RTFBalanceCheck = async () => {
    const fromAccount = await getAddress(getSelectedItem("selectRFTFromAdd"));
    const collectionId = collectionIDs.value[0];

    const RTFAmount = await sdk.refungible.getBalance({
        address:fromAccount.address,
        collectionId:collectionId,
        tokenId: 1
    });
    RTFBalanceStatus.value = RTFAmount.amount;
}

</script>
<template>
    <div style="border: 2px solid white;padding: 30px 30px;margin: 10px;">
        <h3>Account Balance</h3>
        <p>{{ accountBalance }}</p>
    </div>

    <div style="border: 2px solid white;padding: 30px 30px;margin: 10px;">
        <h3>Select Account for interact with the system</h3>
        <select @change="getAccount($event.target.value)">
            <option>--Select Address--</option>
            <option v-for="option in walletResult?.accounts" :key="option.address" :value="option.address">
                {{ option.name }}
            </option>
        </select>
    </div>
    <div style="border: 2px solid white;padding: 30px 30px;margin: 10px;">
        <h3>Create RFT Collection</h3>
        <form @submit.prevent="onCreateRFTCollectionFormSubmit()" class="add-form">
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
        <p> {{ RFTcollectionCreationStatus }}</p>
    </div>
    <div style="border: 2px solid white;padding: 30px 30px;margin: 10px;">
        <h3>Mint Tokens</h3>
        <button @click="mintRFTToken">Mint Token</button>
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
        <h3>RFT transfer</h3>
        <select id="selectRFTTokenID" @change="getTokenIDAccount($event.target.value)">
            <option>--Select DT Token--</option>
            <option v-for="option in tokenIDs" :key="option.tokenId" :value="option.tokenId">
                {{ option.tokenId }}
            </option>
        </select>
        <select id="selectRFTFromAdd" @change="getFromAccount($event.target.value)">
            <option>--Select From Address--</option>
            <option v-for="option in walletResult?.accounts" :key="option.address" :value="option.address">
                {{ option.name }}
            </option>
        </select>
        <select id="selectRFTToAdd" @change="getToAccount($event.target.value)">
            <option>--Select To Address--</option>
            <option v-for="option in walletResult?.accounts" :key="option.address" :value="option.address">
                {{ option.name }}
            </option>
        </select>
        <button @click="RFTTransferToAddress">DT Transfer</button>
        <p> {{ transferStatus }}</p>
    </div>
    <div style="border: 2px solid white;padding: 30px 30px;margin: 10px;">
        <button @click="RTFBalanceCheck">Check Balance</button>
        <p>{{ RTFBalanceStatus }}</p>
    </div>
</template>