<script setup lang="ts">
import Vue from 'vue';
import { onMounted, ref, defineComponent } from 'vue';
import { Sdk, TokenByIdResponse, Options, IBalance } from "@unique-nft/sdk";
import { IPolkadotExtensionAccount, Polkadot, IPolkadotExtensionLoadWalletsResult } from "@unique-nft/utils/extension"
import { AccountTokensResult, CollectionAccess } from '@unique-nft/substrate-client/tokens';
import TransactionList from "./TransactionList.vue";
import { defineEmits } from 'vue';

const options: Options = {
    baseUrl: 'https://rest.unique.network/opal/v1'
};

const sdk = new Sdk(options)

const accountRef = ref<IPolkadotExtensionAccount | null>(null)
const walletResult = ref<IPolkadotExtensionLoadWalletsResult | null>(null)
const tokenRef = ref<TokenByIdResponse | null>(null)
let toAddress = ""
let fromAddress = ""
let mainAddressSelected = ""
let lastCreatedCollectionID = 0
let lastMintedTokenID = 0
let lastMintedAddress = ""
const accountBalance = ref<IBalance | null>(null);
const collectionNametxt = ref("");
const collectionTokentxt = ref("");
const dtTranstxt = ref("");
const collectionIDs = ref([]);
const createCollectionIDs = ref([])
const tokenIDs = ref<Array>([]);
let loading = ref<Boolean>(false);
let selectedCollectionID = 0;
let dtTransferSelectedTokenID = 0;
let transferStatus = ref("Status");
let transactionStatus = ref("Status");
let collectionCreationStatus = ref("Status");
let mintTokenStatus = ref("Status");
let dtFromAddress = ""
let selectedDTID = 0;
const goals = ref([]);
const transactionsList = ref([]);
let selectedCreatedCollectionID = -1;

const emits = defineEmits(['sharedata'])

function shareDataBetweenComponents() {
    emits('sharedata', [lastMintedAddress, lastCreatedCollectionID, lastMintedTokenID])
}

onMounted(async () => {
    console.log("Webporatal Loading")
    const results = await Polkadot.enableAndLoadAllWallets()
    walletResult.value = results
})

const getMainAccount = async (event: any) => {
    mainAddressSelected = event
    console.log(mainAddressSelected)
    getMyBalance()
    recordTransactions("Selected Account " + event)
}

const getMyBalance = async () => {
    const account = await getAddress(mainAddressSelected);
    if (!account) {
        throw new Error('No Account')
    }

    const balance = await sdk.balance.get({
        address: account.address,
    })
    accountBalance.value = balance.availableBalance.amount
    console.log(accountBalance)
    recordTransactions("Called my balance " + accountBalance.value)
}

function recordTransactions(msg: any) {
    const newTrans = {
        id: new Date().toISOString(),
        text: msg,
    };
    transactionsList.value.push(newTrans);
}

const getAccounts = async () => {
    loading.value = true;
    const results = await Polkadot.enableAndLoadAllWallets()

    walletResult.value = results

    console.log(walletResult)
    loading.value = false;
}


function getSelectedItem(ele: any) {
    var e = (document.getElementById(ele)) as HTMLSelectElement;
    var sel = e.selectedIndex;
    var opt = e.options[sel];
    console.log((<HTMLSelectElement>opt).value);
    return (<HTMLSelectElement>opt).value;
}



const getTokenIDSelectedDT = async (event: any) => {
    selectedDTID = event;
}

const getTokenIDAccount = async (event: any) => {
    dtTransferSelectedTokenID = event;
    transferStatus.value = "";
}

const getFromAccount = async (event: any) => {
    // fromAddress = event;
    transferStatus.value = "";
}

const getToAccount = async (event: any) => {
    toAddress = event;
    transferStatus.value = "";
    console.log(event)
}

async function getAddress(a: string) {
    loading.value = true;
    let accountIndex = -1;
    const enablingResult = await Polkadot.enableAndLoadAllWallets()
    for (var i = 0; i < enablingResult.accounts.length; i++) {
        if (a == enablingResult.accounts[i].address) {
            console.log(i)
            accountIndex = i;
        }
    }
    loading.value = false;
    if (accountIndex != -1) {
        return enablingResult.accounts[accountIndex];
    }
    else {
        return false;
    }

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

const getTokensByCollectionAndAddress = async (event: any) => {
    const account = await getAddress(mainAddressSelected);
    tokenIDs.value.length = 0;
    console.log(tokenIDs.value)
    if (!account) {
        throw new Error("No account");
    }
    else if (event != -1) {
        const tokenResult = await sdk.tokens.accountTokens({
            collectionId: event,
            address: account.address
        });
        for (var i = 0; i < tokenResult.tokens.length; i++) {
            console.log(tokenResult.tokens[i].tokenId)
            console.log(tokenResult.tokens[i])
            tokenIDs.value.push(tokenResult.tokens[i])
        }
    }
    console.log(tokenIDs.value)
}

const onDTTransactionFormSubmit = async () => {

    const colID = parseInt(getSelectedItem("DTTransactionCollectionSelect"));
    const toID = parseInt(getSelectedItem("DTTransactionTokenSelect"));
    const fromAccount = await getAddress(mainAddressSelected);

    if (!fromAccount) {
        throw new Error('No accounts selected')
    }

    if (createCollectionIDs.value.length <= 0) {
        throw new Error('No Collections Created')
    }

    const ret = await sdk.tokens.topmostOwner({
        collectionId: colID,
        tokenId: toID,
    })
    console.log(ret.topmostOwner)

    if (fromAccount.address != ret.topmostOwner) {
        transactionStatus.value = "DT inaccessible using this account";
        recordTransactions("Account: " + fromAccount.address + " tried to do a transaction.")
        throw new Error('Transaction executed by external party')
    }
    else {
        transactionStatus.value = "Sucessfully submited";
        recordTransactions("Account: " + fromAccount.address + " sucuessfuly did a transaction")
    }

}

const onCreateCollectionFormSubmit = async () => {
    const account = await getAddress(mainAddressSelected);
    if (!account) {
        collectionCreationStatus.value = "New Collection Creating error...Please select an account... ";
        throw new Error('No account')

    }
    else {
        collectionCreationStatus.value = "New Collection Creating... ";
        const collectionCreateResult = await sdk.collections.creation.submitWaitResult({
            address: account.address,
            name: collectionNametxt.value,
            description: "DT NFT collections",
            tokenPrefix: collectionTokentxt.value,
            permissions: {
                access: CollectionAccess.Normal,
                mintMode: true,
                nesting: {
                    collectionAdmin: true,
                    tokenOwner: true,
                },
            },
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
        const tempCollection = {
            cID: collectionCreateResult.parsed?.collectionId,
            cName: collectionNametxt.value
        }

        createCollectionIDs.value.push(tempCollection);

        collectionNametxt.value = ""
        collectionTokentxt.value = ""
        console.log(collectionCreateResult.parsed)
        //     if (collectionCreateResult.parsed?.collectionId! >= 0) {
        //         let colID = collectionCreateResult.parsed?.collectionId!;
        //         collectionCreationStatus.value = "Collection Permission Update";
        //         const res = await sdk.collections.setPermissions.submitWaitResult({
        //             address: account.address,
        //             collectionId: colID,
        //             permissions: {
        //                 access: CollectionAccess.Normal,
        //                 mintMode: true,
        //                 nesting: {
        //                     collectionAdmin: true,
        //                     tokenOwner: true,
        //                 },
        //             },
        //         }, {
        //         signer: account.uniqueSdkSigner
        //     });

        //         const allowList = await sdk.collections.addToAllowList.submitWaitResult({
        //             address: account.address,
        // collectionId: colID,
        // newAdminId: '5FWqed322nC3Yt8utfsgsjDnK9iVv4qbgqaCiZsf3avF2C8c'
        //         }, {
        //         signer: account.uniqueSdkSigner
        //     });
        //     }

        collectionCreationStatus.value = "Collection Created " + collectionCreateResult.parsed?.collectionId;
    }
}

const getSelectedCreatedCollectionID = async (event: any) => {
    selectedCreatedCollectionID = event;
}

const dtTransferToAddress = async () => {

    console.log(getSelectedItem("selectDTTransferFromAdd"))
    const colID = parseInt(getSelectedItem("DTTransferollectionSelect"));
    const fromAccount = await getAddress(getSelectedItem("selectDTTransferFromAdd"));
    const toAccount = await getAddress(getSelectedItem("selectDTTransferToAdd"));
    if (!fromAccount || !toAccount) {
        throw new Error('No accounts selected')
    }
    else if (colID < 0) {
        throw new Error('No Collections Created')
    }
    else {
        const ret = await sdk.tokens.topmostOwner({
            collectionId: colID,
            tokenId: dtTransferSelectedTokenID,
        });
        console.log(ret.topmostOwner)

        if (fromAccount.address != ret.topmostOwner) {
            transferStatus.value = "DT inaccessible using this account";
            throw new Error('No Collections Created')
        } else {
            transferStatus.value = "DT transfer on progress..."
            const tokenTransferResult = await sdk.tokens.transfer.submitWaitResult({
                address: fromAccount.address,
                collectionId: colID,
                tokenId: dtTransferSelectedTokenID,
                to: toAccount.address
            }, {
                signer: fromAccount.uniqueSdkSigner
            });

            console.log(tokenTransferResult.parsed)
            transferStatus.value = tokenTransferResult.parsed;
        }

    }
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

    const account = await getAddress(mainAddressSelected);
    if (!account) {
        throw new Error('No account')
    } else if (createCollectionIDs.value.length <= 0) {
        throw new Error('No Collections Created')
    }
    else if (selectedCreatedCollectionID >= 0) {
        mintTokenStatus.value = "DT NFT minting..."
        const tokenResult = await sdk.tokens.create.submitWaitResult({
            address: account.address,
            collectionId: selectedCreatedCollectionID,
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
        loading.value = false;
        console.log(tokenResult.parsed)
        mintTokenStatus.value = "Minted DT NFT: Collection= " + tokenResult.parsed?.collectionId + " NFT ID= " + tokenResult.parsed?.tokenId;
        lastCreatedCollectionID = tokenResult.parsed?.collectionId!;
        lastMintedTokenID = tokenResult.parsed?.tokenId!
        lastMintedAddress = mainAddressSelected;
        for (var i = 0; i < tokenIDs.value.length; i++) {
            console.log(tokenIDs.value[i].collectionId)
            console.log(tokenIDs.value[i].tokenId)
        }
        await getToken(tokenResult.parsed?.collectionId, tokenResult.parsed?.tokenId);
        shareDataBetweenComponents()

    }
    else {
        mintTokenStatus.value = "DT NFT minting error... please try again"
    }
}



const getToken = async (collectionId: number, tokenId: number) => {
    const token = await sdk.tokens.get({
        collectionId,
        tokenId,
    })

    tokenRef.value = token

    console.log(token)
}


const nestedToken = async () => {
    const account = await getAddress("5GHG4w2AE95WBFvZh36wjEaiyt1gfYk97k5wWSkEDqeKVaj6");

    const result = await sdk.tokens.nest.submitWaitResult({
        address: account.address,
        parent: {
            collectionId: 529,
            tokenId: 2,
        },
        nested: {
            collectionId: 532,
            tokenId: 1,
        },
    }, {
        signer: account.uniqueSdkSigner
    });
    console.log(result.parsed);
}

const getBundle = async () => {
    const result = await sdk.tokens.getBundle({
        collectionId: 529,
        tokenId: 2,
    });

    console.log(result);
}

</script>
<template>
    <div style="border: 2px solid white;padding: 30px 30px;margin: 10px;">
        <h3>Account Balance</h3>
        <p>{{ accountBalance }}</p>
    </div>

    <div style="border: 2px solid white;padding: 30px 30px;margin: 10px;">
        <h3>Select Account for interact with the system</h3>
        <select @change="getMainAccount($event.target.value)" class="select-custom">
            <option>--Select Address--</option>
            <option v-for="option in walletResult?.accounts" :key="option.address" :value="option.address">
                {{ option.name }}
            </option>
        </select>
    </div>
    <div style="border: 2px solid white;padding: 30px 30px;margin: 10px;">
        <h3>Create Collection</h3>
        <form @submit.prevent="onCreateCollectionFormSubmit()" class="add-form">
            <div class="form-control">
                <label class="lbl-custom">Name</label>
                <input type="text" v-model="collectionNametxt" name="name" placeholder="Collection Name" />
            </div>
            <div class="form-control">
                <label class="lbl-custom">Token</label>
                <input type="text" v-model="collectionTokentxt" name="token" placeholder="Token Prefix" maxlength="4" />
            </div>
            <input type="submit" value="Create Collection" class="btn-custom" />
        </form>
        <p> {{ collectionCreationStatus }}</p>
    </div>
    <div style="border: 2px solid white;padding: 30px 30px;margin: 10px;">
        <h3>Mint Tokens</h3>
        <select id="mintTokenCollectionSelect" @change="getSelectedCreatedCollectionID($event.target.value)"
            class="select-custom">
            <option>--Select Collection--</option>
            <option v-for="ci in createCollectionIDs" :key="ci.cID" :value="ci.cID">
                {{ ci.cName }}
            </option>
        </select>
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
        <select id="DTTransactionCollectionSelect" @change="getTokensByCollectionAndAddress($event.target.value)"
            class="select-custom">
            <option value="-1">--Select Collection--</option>
            <option v-for="ci in createCollectionIDs" :key="ci.cID" :value="ci.cID">
                {{ ci.cName }}
            </option>
        </select>
        <select id="DTTransactionTokenSelect" @change="getTokenIDSelectedDT($event.target.value)" class="select-custom">
            <option value="-1">--Select DT--</option>
            <option v-for="option in tokenIDs" :key="option.tokenId" :value="option.tokenId">
                {{ option.tokenId }}
            </option>
        </select>
        <form @submit.prevent="onDTTransactionFormSubmit()" class="add-form">
            <div class="form-control">
                <label class="lbl-custom">Transaction</label>
                <input type="text" v-model="dtTranstxt" name="dtTrans" placeholder="Transaction" />
            </div>
            <input type="submit" value="Transaction" class="btn-custom" />
        </form>
        <p> {{ transactionStatus }}</p>
    </div>
    <div style="border: 2px solid white;padding: 30px 30px;margin: 10px;">
        <h3>DT Transfer</h3>
        <div>
            <select id="DTTransferollectionSelect" @change="getTokensByCollectionAndAddress($event.target.value)"
                class="select-custom">
                <option value="-1">--Select Collection--</option>
                <option v-for="ci in createCollectionIDs" :key="ci.cID" :value="ci.cID">
                    {{ ci.cName }}
                </option>
            </select>
            <select id="selectDTTransferTokenID" @change="getTokenIDAccount($event.target.value)" class="select-custom">
                <option>--Select DT Token--</option>
                <option v-for="option in tokenIDs" :key="option.tokenId" :value="option.tokenId">
                    {{ option.tokenId }}
                </option>
            </select>
            <br />
            <select id="selectDTTransferFromAdd" @change="getFromAccount($event.target.value)" class="select-custom">
                <option>--Select From Address--</option>
                <option v-for="option in walletResult?.accounts" :key="option.address" :value="option.address">
                    {{ option.name }}
                </option>
            </select>
            <select id="selectDTTransferToAdd" @change="getToAccount($event.target.value)" class="select-custom">
                <option>--Select To Address--</option>
                <option v-for="option in walletResult?.accounts" :key="option.address" :value="option.address">
                    {{ option.name }}
                </option>
            </select>
        </div>
        <br />
        <button @click="dtTransferToAddress">DT Transfer</button>
        <p> {{ transferStatus }}</p>
    </div>
    <transaction-list :transactionsList=transactionsList></transaction-list>
</template>
<style>
body {
    font-family: Arial, sans-serif;
    background-color: #f4f4f4;
}

/* Style the header of the dashboard */
header {
    background-color: #336699;
    color: #fff;
    padding: 20px;
}

/* Style the main content area */
main {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    margin: 20px;
}

/* Style the cards containing the dashboard data */
.card {
    background-color: #fff;
    border-radius: 5px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    margin: 10px;
    padding: 20px;
    width: 30%;
}

/* Style the headings in the cards */
.card h2 {
    font-size: 1.5rem;
    margin-bottom: 10px;
}

/* Style the data in the cards */
.card p {
    font-size: 1.2rem;
}

/* Style the footer of the dashboard */
footer {
    background-color: #ccc;
    color: #333;
    padding: 20px;
    text-align: center;
}

form-submit-button {
    background-color: #336699;
    border: none;
    color: #fff;
    padding: 10px 20px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 16px;
    margin: 4px 2px;
    cursor: pointer;
    border-radius: 4px;
}

/* Default button style */
button {
    background-color: #336699;
    border: none;
    color: #fff;
    padding: 10px 20px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 16px;
    margin: 4px 2px;
    cursor: pointer;
    border-radius: 4px;
}

/* Hover effect for buttons */
button:hover {
    background-color: #214266;
}

/* Active effect for buttons */
button:active {
    background-color: #3e4d66;
}

/* Default input text style */
input[type="text"] {
    padding: 10px;
    border-radius: 4px;
    border: none;
    background-color: #1A1A1A;
    box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
    font-size: 16px;
    width: 30%;
    margin-bottom: 10px;
    margin-right: 5px;
    color: #f4f4f4;
}

/* Focus effect for input text */
input[type="text"]:focus {
    outline: none;
    box-shadow: 0px 2px 5px rgba(51, 153, 255, 0.5);
}

/* Default select box style */
select {
    padding: 10px;
    border-radius: 4px;
    border: none;
    background-color: #1A1A1A;
    box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
    font-size: 16px;
    width: 30%;
    margin-bottom: 10px;
    margin-right: 10px;
    color: #f4f4f4;
}

/* Focus effect for select box */
select:focus {
    outline: none;
    box-shadow: 0px 2px 5px rgba(51, 153, 255, 0.5);
}

.btn-custom {
    background-color: #336699;
    border: none;
    color: #fff;
    padding: 10px 20px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 16px;
    margin: 4px 2px;
    cursor: pointer;
    border-radius: 4px;
}

.lbl-custom {
    margin: 5px;
}

.select-custom {
    padding: 10px;
}
</style>