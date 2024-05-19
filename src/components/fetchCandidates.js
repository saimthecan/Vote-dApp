import contractAbi from "./contractAbi.json";


const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider('https://sepolia.infura.io/v3/3a403683e05a4f589bf766c399c3c42b'));

const contractAddress = '0xa24ac940da10d61d1aa4bdb667a8dbc779ba57b2';
const contract = new web3.eth.Contract(contractAbi, contractAddress);

export async function fetchCandidates() {
  const candidatesArray = await contract.methods.getCandidates().call();
  
  const candidatesJSON = {
    candidates: candidatesArray,
  };

  const fs = require('fs');
  fs.writeFileSync('candidates.json', JSON.stringify(candidatesJSON));
  
}

fetchCandidates();
