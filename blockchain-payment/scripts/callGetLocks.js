const { ethers } = require('ethers');
const addr = process.argv[2] || '0x5FbDB2315678afecb367f032d93F642f64180aa3';
const user = process.argv[3] || '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266';
const RPC = process.env.RPC || 'http://127.0.0.1:8545';
const ABI = require('../frontend/src/contracts/Lock.json').abi;
(async()=>{
  try{
    const rpc = new ethers.JsonRpcProvider(RPC);
    const contract = new ethers.Contract(addr, ABI, rpc);
    console.log('Calling getLocks for', user);
    const start = Date.now();
    const res = await contract.getLocks(user);
    console.log('OK', res);
    console.log('Elapsed', Date.now()-start,'ms');
  }catch(e){
    console.error('ERR', e);
    if (e.transaction) console.error('TX', e.transaction);
    if (e.data) console.error('DATA', e.data);
    process.exit(1);
  }
})();
