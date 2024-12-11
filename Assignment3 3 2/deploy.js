equire('dotenv').config();
const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');
const compiledContract = require('../scripts/compile');

// Environment variable checks
if (!process.env.MNEMONIC || !process.env.INFURA_URL) {
  console.error('Error: Missing MNEMONIC or INFURA_URL in .env file');
  process.exit(1);
}

// Provider setup
const provider = new HDWalletProvider({
  mnemonic: process.env.MNEMONIC,
  providerOrUrl: process.env.INFURA_URL,
});

const web3 = new Web3(provider);

const deployContract = async () => {
  try {
    const accounts = await web3.eth.getAccounts();
    console.log(`Deploying contract using account: ${accounts[0]}`);

    const contractInstance = new web3.eth.Contract(JSON.parse(compiledContract.interface));

    const deployment = await contractInstance
      .deploy({
        data: compiledContract.bytecode,
        arguments: [100, web3.utils.toWei('0.01', 'ether')],
      })
      .send({
        from: accounts[0],
        gas: 3000000,
      });

    console.log(`Contract successfully deployed at address: ${deployment.options.address}`);
  } catch (err) {
    console.error(`Deployment failed: ${err.message}`);
  } finally {
    provider.engine.stop();
  }
};

// Deploy the contract
deployContract();
