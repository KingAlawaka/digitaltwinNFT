# Digital twin NFT (DT-NFT)

A Digital Twin (DT) is a virtual representation of a physical asset or process used to improve its physical counterpart's operational conditions and enhance its capabilities. To do that, data is essential, and service providers need access to this generated data to provide improved services. However, currently there needs to be a proper platform to harvest this from data owners. The proposed Digital Twin NFTs will provide a loyalty platform that rewards shared data to incentivise this collaboration. Another problem of the current DT landscape is tracking DT's operational history and transferring its ownership transparently. Using NFTs, transfers and tracking changes are streamlined. 

[Demo video](https://youtu.be/Ju8dIW6mcjk)

```yarn create vite webportal --template=vue-ts

cd webportal

yarn

yarn dev

yarn install

yarn dev
```
Please make sure you install the [Polkadot{.js} extension](https://polkadot.js.org/extension/) and create at least two accounts.
Use [Unique Opal Network faucet bot](https://t.me/unique2faucet_opal_bot) for get testing tokens.

### Workflow of the application

#### DT NFT management
1. Select an account that is going to represent the asset manufacturer
2. Create a collection
3. Mint token
4. Transfer the token to another account to showcase asset handover
5. Change the main account to submit transactions

#### RFT based loyalty platform
1. Select an account to interact with the loyalty platform
2. Create an RFT collection
3. Mint an RFT token by specifying how many divisions need the token. For example, in the demo, how many tasks does the user need to complete to get the reward.
4. RFT transfer will simulate real-world task completion. Checking the checkboxes will automatically do the transfer operation, but please select the correct accounts for transferring these tokens.
5. RFT transfer button can also be used to transfer RFT funds, but if you use checked boxes, there is no need to press the button.
6. Balance and amount received will be mentioned in the status text. After getting all the tokens, to reward message will be displayed. 
7. After getting all the RFT tokens, change the account to nest the tokens. 
8. Using the bundle button, you can see the nested token.

### Known issues and limitations
1. Limited account token validations and error checks are implemented in the current version.
2. Only the collection owner can mint NFT/RFT tokens. Already tried updating the permission, but it did not work. 
3. Nesting is only possible when the same account owns both tokens. Therefore, please select the correct account to create the NFT token.
4. Since the application is connected to the Opal network, sometimes transactions fail due to network issues. Currently, these errors are not validated. 
5. Current application does not store any off-chain data, and planning to improve that part.
6. Current transaction records are not stored in the BC. A smart contract was created but did not work with the Unique SDK.

### Possible imporvements for the final
1. Smart contract integration for transactions and other important information.
2. Connect with [Auzure Digital Twin platform](https://explorer.digitaltwins.azure.net/3DScenes/demo) to simulate real world use case.