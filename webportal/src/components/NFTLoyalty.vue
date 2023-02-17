<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { Sdk, TokenByIdResponse, Options, IBalance, GetBundleResponse } from "@unique-nft/sdk";
import { IPolkadotExtensionAccount, Polkadot, IPolkadotExtensionLoadWalletsResult } from "@unique-nft/utils/extension"
import NFTManagement from './NFTManagement.vue';

const options: Options = {
    baseUrl: 'https://rest.unique.network/opal/v1'
};

const sdk = new Sdk(options)

const accountRef = ref<IPolkadotExtensionAccount | null>(null)
const walletResult = ref<IPolkadotExtensionLoadWalletsResult | null>(null)
const tokenRef = ref<TokenByIdResponse | null>(null)
const bundleRef = ref<GetBundleResponse | null>(null)
let fromAddress = ""
let toAddress = ""
const accountBalance = ref<IBalance | null>(null);
const collectionNametxt = ref("");
const collectionTokentxt = ref("");
const collectionTaskstxt = ref("");
const RFTTransferAmounttxt = ref("1");
const collectionIDs = ref([]);
const tokenIDs = ref<Array>([]);
let loading = ref<Boolean>(false);
let selectedTokenID = 0;
let RTFtransferStatus = ref("Status");
let RFTcollectionCreationStatus = ref("Status");
let RTFBalanceStatus = ref("Status");
let mintTokenStatus = ref("Status");
let RTFTotalAmount = 0;
let lastCreatedCollectionID = 0
let lastMintedAddress = ""
let lastMintedTokenID = 0
let lastCreatedRFTCollectionID = 0
let lastMintedRFTTokenID = 0
let mainAddressSelected = ""
let RFTCurrentBalance = 0;
const goals = ref([]);

function catchEmit(values: any) {
    lastCreatedCollectionID = values[1];
    lastMintedAddress = values[0];
    lastMintedTokenID = values[2];
    console.log(lastMintedAddress)
    console.log(lastCreatedCollectionID)
    console.log(lastMintedTokenID)
}

onMounted(async () => {
    console.log("Initilization")
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
    mainAddressSelected = event
    recordTransactions("Selected Account " + event)
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

const onCreateRFTCollectionFormSubmit = async () => {
    loading.value = true;
    console.log(collectionNametxt.value)

    const account = await getAddress(fromAddress);
    console.log(account.address)
    RFTcollectionCreationStatus.value = "New RFT Collection Creating... ";
    const collectionCreateResult = await sdk.refungible.createCollection.submitWaitResult({
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
                ipfsCid: "QmYpPqYAeZHXy3zftJVSdKPqVqqXw1rgRHSdywi6NdWk4k"
            },
            attributesSchemaVersion: "1.0.0",
            attributesSchema: {
                0: {
                    name: { _: 'Validity' },
                    type: 'string',
                    optional: true,
                    enumValues: {
                        0: { _: 'One Week' },
                        1: { _: 'Two Weeks' },
                        2: { _: 'One Month' },
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
    loading.value = true;
    const account = await getAddress(fromAddress);
    if (!account) {
        mintTokenStatus.value = "Please select a main accout to mint the tokens"
        throw new Error('No account')
    }

    if (collectionIDs.value.length <= 0) {
        mintTokenStatus.value = "Please create a collection first"
        throw new Error('No Collections Created')
    }
    const collectionId = collectionIDs.value[0]
    mintTokenStatus.value = "DT NFT minting..."
    const tokenResult = await sdk.refungible.createToken.submitWaitResult({
        address: account.address,
        collectionId,
        amount: parseInt(collectionTaskstxt.value),
        data: {
            image: {
                ipfsCid: "QmYpPqYAeZHXy3zftJVSdKPqVqqXw1rgRHSdywi6NdWk4k"
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
    RTFTotalAmount = parseInt(collectionTaskstxt.value);
    await getToken(tokenResult.parsed?.collectionId, tokenResult.parsed?.tokenId);
    lastCreatedRFTCollectionID = tokenResult.parsed?.collectionId!;
    lastMintedRFTTokenID = tokenResult.parsed?.tokenId!;
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
    RTFtransferStatus.value = "";
}

const getFromAccount = async (event: any) => {
    // fromAddress = event;
    RTFtransferStatus.value = "";
    await RTFBalanceCheck();
}

const getToAccount = async (event: any) => {
    toAddress = event;
    RTFtransferStatus.value = "";
}

const RFTTransferToAddress = async () => {

    const fromAccount = await getAddress(getSelectedItem("selectRFTFromAdd"));
    const toAccount = await getAddress(getSelectedItem("selectRFTToAdd"));
    if (!fromAccount || !toAccount) {
        RTFtransferStatus.value = "Please select accounts for the transfer"
        throw new Error('No accounts selected')
    }

    if (collectionIDs.value.length <= 0) {
        RTFtransferStatus.value = "Please create a RTF collection first"
        throw new Error('No Collections Created')
    }

    await RTFBalanceCheck();
    const currentBalance = RFTCurrentBalance;
    if (currentBalance <= 0) {
        RTFtransferStatus.value = "Insufficient token balance, Please change the account";
        throw new Error('Insufficient token balance, Please change the account')
    }
    const collectionId = collectionIDs.value[0]
    let transferAmount = 1;
    if (parseInt(RFTTransferAmounttxt.value) > 0){
        transferAmount = parseInt(RFTTransferAmounttxt.value);
    }
    RTFtransferStatus.value = "DT transfer on progress..."
    const tokenTransferResult = await sdk.refungible.transferToken.submitWaitResult({
        address: fromAccount.address,
        collectionId: collectionId,
        tokenId: selectedTokenID,
        to: toAccount.address,
        amount: transferAmount,
    }, {
        signer: fromAccount.uniqueSdkSigner
    })

    console.log(tokenTransferResult.parsed)
    RTFtransferStatus.value = tokenTransferResult.parsed;
    const RTFAmount = await sdk.refungible.getBalance({
        address: toAccount.address,
        collectionId: collectionId,
        tokenId: 1
    });
    RTFtransferStatus.value = "You got " + RTFAmount.amount +"/"+RTFTotalAmount;
    RTFBalanceStatus.value = "Current balance " + (RTFTotalAmount - RTFAmount.amount) +"/"+RTFTotalAmount;
    if (RTFAmount.amount == RTFTotalAmount) {
        RTFtransferStatus.value = "You got a discout for the next service";
    }


}

const RTFCheckBalanceMainAccount = async () => {
    const fromAccount = await getAddress(mainAddressSelected);
    const collectionId = collectionIDs.value[0];

    const RTFAmount = await sdk.refungible.getBalance({
        address: fromAccount.address,
        collectionId: collectionId,
        tokenId: 1
    });
    RFTCurrentBalance = RTFAmount.amount;
    RTFBalanceStatus.value = "Current balance " + RTFAmount.amount +"/"+RTFTotalAmount;
}

const RTFBalanceCheck = async () => {
    const fromAccount = await getAddress(getSelectedItem("selectRFTFromAdd"));
    const collectionId = collectionIDs.value[0];

    const RTFAmount = await sdk.refungible.getBalance({
        address: fromAccount.address,
        collectionId: collectionId,
        tokenId: 1
    });
    RFTCurrentBalance = RTFAmount.amount;
    RTFBalanceStatus.value = "Current balance " + RTFAmount.amount +"/"+RTFTotalAmount;
}

const taskCompletion = async (e: number) => {
    const tokenId = parseInt(getSelectedItem("selectRFTTokenID"));
    const fromAccount = await getAddress(getSelectedItem("selectRFTFromAdd"));
    const toAccount = await getAddress(getSelectedItem("selectRFTToAdd"));

    if (!fromAccount || !toAccount) {
        RTFtransferStatus.value = "No accounts selected for the transfer"
        throw new Error('No accounts selected')
    }

    if (collectionIDs.value.length <= 0) {
        RTFtransferStatus.value = "Please create a RTF collection first"
        throw new Error('No Collections Created')
    }
    await RTFBalanceCheck();
    const currentBalance = RFTCurrentBalance;

    if (tokenId > 0 && fromAccount && toAccount && currentBalance > 0) {
        console.log(e)
        const input = document.getElementById('Task' + e) as HTMLInputElement;
        input.setAttribute('checked', '');
        input.setAttribute('disabled', '');
        await RFTTransferToAddress();
    }
    else if (currentBalance <= 0) {
        RTFtransferStatus.value = "Insufficient token balance, Please select the correct account";
        throw new Error('Insufficient token balance, Please change the account')
    }
    else {
        RTFtransferStatus.value = "Please select token, from and to accounts";
    }


}

const nestedToken = async () => {
    const account = await getAddress(mainAddressSelected);

    if (lastCreatedCollectionID==0 || lastMintedTokenID==0 || lastCreatedRFTCollectionID == 0 || lastMintedRFTTokenID == 0){
        RTFBalanceStatus.value = "Please makesure NFT and RFT collections and tokens are created";
        throw new Error("Please makesure NFT and RFT collections and tokens are created");
    }

    RTFBalanceStatus.value = "Token Nesting started";
    const result = await sdk.tokens.nest.submitWaitResult({
        address: account.address,
        parent: {
            collectionId: lastCreatedCollectionID,
            tokenId: lastMintedTokenID,
        },
        nested: {
            collectionId: lastCreatedRFTCollectionID,
            tokenId: lastMintedRFTTokenID,
        },
    }, {
        signer: account.uniqueSdkSigner
    });
    console.log(result.parsed);
    if (!result) {
        RTFBalanceStatus.value = "Please change the account for nesting"
    }
    RTFBalanceStatus.value = result.parsed;
}

const getBundle = async () => {
    const result = await sdk.tokens.getBundle({
        collectionId: lastCreatedCollectionID,
        tokenId: lastMintedTokenID,
    });
    bundleRef.value = result;
    console.log(result);
    RTFBalanceStatus.value = result;
}

</script>
<template>
    <h3>Digital Twin NFT</h3>
    <NFTManagement @sharedata="catchEmit" />
    <h3>Digital Twin NFT loyalty platform</h3>


    <div style="border: 2px solid white;padding: 30px 30px;margin: 10px;">
        <h3>Select Account for interact with the system</h3>
        <select @change="getAccount($event.target.value)" class="select-custom">
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
                <label class="lbl-custom">Name</label>
                <input type="text" v-model="collectionNametxt" name="name" placeholder="Collection Name" />
            </div>
            <div class="form-control">
                <label class="lbl-custom">Token</label>
                <input type="text" v-model="collectionTokentxt" name="token" placeholder="Token Prefix" />
            </div>
            <input type="submit" value="Create Collection" class="btn-custom" />
        </form>
        <p> {{ RFTcollectionCreationStatus }}</p>
    </div>
    <div style="border: 2px solid white;padding: 30px 30px;margin: 10px;">
        <h3>Mint RFT Tokens</h3>
        <div class="form-control">
            <label class="lbl-custom">Tasks #</label>
            <input type="text" v-model="collectionTaskstxt" name="token" placeholder="Tasks" />
        </div>
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
        <h3>RFT Transfer (Collecting Loyalty Tokens)</h3>
        <select id="selectRFTTokenID" @change="getTokenIDAccount($event.target.value)" class="select-custom">
            <option>Select Loyalty Token</option>
            <option v-for="option in tokenIDs" :key="option.tokenId" :value="option.tokenId">
                {{ option.tokenId }}
            </option>
        </select>
        <select id="selectRFTFromAdd" @change="getFromAccount($event.target.value)" class="select-custom">
            <option>Select From Address</option>
            <option v-for="option in walletResult?.accounts" :key="option.address" :value="option.address">
                {{ option.name }}
            </option>
        </select>
        <select id="selectRFTToAdd" @change="getToAccount($event.target.value)" class="select-custom">
            <option>Select To Address</option>
            <option v-for="option in walletResult?.accounts" :key="option.address" :value="option.address">
                {{ option.name }}
            </option>
        </select>
        <div style="text-align: left;">
            <div>
                <input type="checkbox" name="subscribe" id="Task1" @change="taskCompletion(1)" />
                <label class="lbl-custom">Task #1: Single journey 1000km </label>
            </div>
            <div>
                <input type="checkbox" name="subscribe" id="Task2" @change="taskCompletion(2)" />
                <label class="lbl-custom">Task #2: Over 90kmph for 1 hour </label>
            </div>
            <div>
                <input type="checkbox" name="subscribe" id="Task3" @change="taskCompletion(3)" />
                <label class="lbl-custom">Task #3: 5000km Service</label>
            </div>

        </div>
        <div class="form-control">
            <label class="lbl-custom">RFT Amount #</label>
            <input type="text" v-model="RFTTransferAmounttxt" name="amount" placeholder="RFT Amount" />
        </div>
        <p>Check boxes will initiate RTF transfers, For manual operation use the "DT Transer"</p>
        <button @click="RFTTransferToAddress">DT Transfer</button>
        <p> {{ RTFtransferStatus }}</p>
    </div>
    <div style="border: 2px solid white;padding: 30px 30px;margin: 10px;">
        <button @click="RTFCheckBalanceMainAccount">Check Balance</button>
        <button @click="nestedToken">Nested</button>
        <button @click="getBundle">Bundle</button>
        <div v-if="bundleRef">
            <p>Main Token</p>
            <img :src="bundleRef.image.fullUrl!" style="width: 100px;" /><br />
            <p>{{ bundleRef.collectionId }} | {{ bundleRef.tokenId }}</p>
            <p>Nested Tokens</p>
            <div v-for="c in bundleRef.nestingChildTokens">
                <p>{{ c.collectionId }} | {{ c.tokenId }}</p>
                <img :src="c.image.fullUrl!" style="width:100px;" />
            </div>
        </div>
        <p>{{ RTFBalanceStatus }}</p>
    </div>
</template>
<style>
.btn-custom {
    border-radius: 8px;
    border: 1px solid transparent;
    padding: 0.6em 1.2em;
    font-size: 1em;
    font-weight: 500;
    font-family: inherit;
    background-color: #1a1a1a;
    cursor: pointer;
    transition: border-color 0.25s;
    margin: 8px;
}

.lbl-custom {
    margin: 5px;
}

.select-custom {
    padding: 10px;
}
</style>