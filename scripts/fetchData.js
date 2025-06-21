const { GraphQLClient, gql } = require('graphql-request');
const mongoose = require('mongoose');
const Restaker = require('../models/restakers');
const Validator = require('../models/validators');
const Reward = require('../models/rewards');
const { initWeb3, loadContract, fetchPastEvents } = require('../utils/web3Utils');
require('dotenv').config();
const connectDB = require('../config/db');

// Initialize Web3 and GraphQL client
const web3 = initWeb3();
const subgraphUrl = process.env.SUBGRAPH_URL;
const client = new GraphQLClient(subgraphUrl);

const EIGENLAYER_CONTRACT_ADDRESS ='0x39053D51B77DC0d36036Fc1fCc8Cb819df8Ef37A'; 
const EIGENLAYER_ABI = [
  {
    anonymous: false,
    inputs: [
      [{"inputs":[{"internalType":"address","name":"_logic","type":"address"},{"internalType":"address","name":"admin_","type":"address"},{"internalType":"bytes","name":"_data","type":"bytes"}],"stateMutability":"payable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"previousAdmin","type":"address"},{"indexed":false,"internalType":"address","name":"newAdmin","type":"address"}],"name":"AdminChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"beacon","type":"address"}],"name":"BeaconUpgraded","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"implementation","type":"address"}],"name":"Upgraded","type":"event"},{"stateMutability":"payable","type":"fallback"},{"inputs":[],"name":"admin","outputs":[{"internalType":"address","name":"admin_","type":"address"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newAdmin","type":"address"}],"name":"changeAdmin","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"implementation","outputs":[{"internalType":"address","name":"implementation_","type":"address"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newImplementation","type":"address"}],"name":"upgradeTo","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newImplementation","type":"address"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"upgradeToAndCall","outputs":[],"stateMutability":"payable","type":"function"},{"stateMutability":"payable","type":"receive"}]
    ],
    name: 'Delegation',
    type: 'event',
  },
]; // Replace with full ABI from Etherscan/EigenLayer docs

// GraphQL Queries
const RESTAKERS_QUERY = gql`
  query {
    delegations {
      userAddress
      amountRestakedStETH
      targetAVSOperatorAddress
    }
  }
`;

const VALIDATORS_QUERY = gql`
  query {
    operators {
      operatorAddress
      totalDelegatedStakeStETH
      status
      slashHistory {
        timestamp
        amountStETH
        reason
      }
    }
  }
`;

const REWARDS_QUERY = gql`
  query($walletAddress: String!) {
    rewards(walletAddress: $walletAddress) {
      walletAddress
      totalRewardsReceivedStETH
      rewardsBreakdown {
        operatorAddress
        amountStETH
        timestamps
      }
    }
  }
`;

// Fetch and store restakers
const fetchRestakers = async () => {
  try {
    const data = await client.request(RESTAKERS_QUERY);
    const restakers = data.delegations;

    for (const restaker of restakers) {
      await Restaker.findOneAndUpdate(
        { userAddress: restaker.userAddress },
        {
          userAddress: restaker.userAddress,
          amountRestakedStETH: restaker.amountRestakedStETH,
          targetAVSOperatorAddress: restaker.targetAVSOperatorAddress,
          lastUpdated: new Date(),
        },
        { upsert: true }
      );
    }
    console.log('Restakers updated');
  } catch (err) {
    console.error('Error fetching restakers:', err);
  }
};

// Fetch and store validators
const fetchValidators = async () => {
  try {
    const data = await client.request(VALIDATORS_QUERY);
    const validators = data.operators;

    for (const validator of validators) {
      await Validator.findOneAndUpdate(
        { operatorAddress: validator.operatorAddress },
        {
          operatorAddress: validator.operatorAddress,
          totalDelegatedStakeStETH: validator.totalDelegatedStakeStETH,
          slashHistory: validator.slashHistory,
          status: validator.status,
          lastUpdated: new Date(),
        },
        { upsert: true }
      );
    }
    console.log('Validators updated');
  } catch (err) {
    console.error('Error fetching validators:', err);
  }
};

// Fetch and store rewards
const fetchRewards = async (walletAddress) => {
  try {
    const data = await client.request(REWARDS_QUERY, { walletAddress });
    const reward = data.rewards;

    if (reward) {
      await Reward.findOneAndUpdate(
        { walletAddress: reward.walletAddress },
        {
          walletAddress: reward.walletAddress,
          totalRewardsReceivedStETH: reward.totalRewardsReceivedStETH,
          rewardsBreakdown: reward.rewardsBreakdown,
          lastUpdated: new Date(),
        },
        { upsert: true }
      );
      console.log(`Rewards updated for ${walletAddress}`);
    }
  } catch (err) {
    console.error(`Error fetching rewards for ${walletAddress}:`, err);
  }
};

// Fetch on-chain data (example: Delegation events)
const fetchOnChainData = async () => {
  try {
    const contract = loadContract(web3, EIGENLAYER_ABI, EIGENLAYER_CONTRACT_ADDRESS);
    const events = await fetchPastEvents(contract, 'Delegation', 0, 'latest');

    for (const event of events) {
      const { userAddress, amount, operatorAddress } = event.returnValues;
      await Restaker.findOneAndUpdate(
        { userAddress },
        {
          userAddress,
          amountRestakedStETH: web3.utils.fromWei(amount, 'ether'),
          targetAVSOperatorAddress: operatorAddress,
          lastUpdated: new Date(),
        },
        { upsert: true }
      );
    }
    console.log('On-chain restakers updated');
  } catch (err) {
    console.error('Error fetching on-chain data:', err);
  }
};

const main = async () => {
  await connectDB();
  await fetchRestakers();
  await fetchValidators();
  await fetchRewards('0x2257cb52cd49f1678ec9fd854458e718fad109391115a152a38e9139bec50216');
  await fetchOnChainData();
  mongoose.connection.close();
};

main();