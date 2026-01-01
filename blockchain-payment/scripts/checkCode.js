const { ethers } = require('ethers');
const addr = process.argv[2];
if(!addr){console.error('Usage: node scripts/checkCode.js <address>'); process.exit(1)}
(async()=>{
  try{
    const p = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
    const code = await p.getCode(addr);
    console.log('ADDRESS', addr);
    console.log('CODE_LEN', code.length);
    console.log('CODE_START', code.slice(0,20));
  }catch(e){
    console.error('ERR', e.message);
    process.exit(2);
  }
})();
