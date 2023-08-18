import contractAbi from "./contractAbi.json";


const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io/v3/3a403683e05a4f589bf766c399c3c42b'));

const contractAddress = '0xc31a47dd10c2d6b5700941d5f145ef0adc27dbd6';
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
