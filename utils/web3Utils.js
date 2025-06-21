const {Web3} = require('web3');
require('dotenv').config();

const initWeb3 = () => {
  const web3 = new Web3(process.env.INFURA_URL);
  return web3;
};

const loadContract = (web3, abi, address) => {
  return new web3.eth.Contract(abi, address);
};

const fetchPastEvents = async (contract, eventName, fromBlock, toBlock) => {
  const maxRetries = 3;
  for (let i = 0; i < maxRetries; i++) {
    try {
      const events = await contract.getPastEvents(eventName, {
        fromBlock,
        toBlock,
      });
      return events;
    } catch (err) {
      if (i === maxRetries - 1) {
        console.error('Error fetching events:', err);
        throw err;
      }
      await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
};

module.exports = { initWeb3, loadContract, fetchPastEvents };