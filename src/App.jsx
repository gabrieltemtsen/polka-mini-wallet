import logo from './logo.gif';
import './App.css';
import { useState, useEffect } from 'react';

import {
  web3Enable, 
  web3Accounts,
  web3FromAddress
} from '@polkadot/extension-dapp';

import { ApiPromise, WsProvider } from '@polkadot/api'
const { Keyring } = require('@polkadot/keyring');

function App() {
  const [activeExtension, setActiveExtension] = useState([]);
  const [accountConnected, setAccountConnected] = useState([]);
  const [allAccounts, setAllAccounts] = useState([]); 
  const [currentChain, setCurrentChain] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [receipientAddress, setReceipientAddress] = useState('');
  const [amountToSend, setAmountToSend] = useState('');
  const [txLoading, setTxLoading] = useState(false);
  



  const sendToken = async() => {
    console.log(receipientAddress, amountToSend, selectedAccount)
    if(!receipientAddress || !amountToSend || !selectedAccount)  return alert('Please fill all fields');

    setTxLoading(true);

    const wsProvider = new WsProvider('wss://westend-rpc.polkadot.io');
    const api = await ApiPromise.create({ provider: wsProvider });
    // Construct the keyring after the API (crypto has an async init)

   // grab injected object
   const injector = await web3FromAddress(selectedAccount);
   const tx = api.tx.balances.transferAllowDeath(receipientAddress, Number(amountToSend) * 1000000000000)

    // propogate tx
    tx.signAndSend(selectedAccount, { signer: injector.signer }, ({ status }) => {
      if (status.isInBlock) {
          console.log(`Completed at block hash #${status.asInBlock.toString()}`);
          fetchData();
          alert('Txn successfull')
          setTxLoading(false);
      } else {
        setTxLoading(false);
          console.log(`Current status: ${status.type}`);      }
    }).catch((error) => {
        console.log(':( transaction failed', error);
        setTxLoading(false)
    });  

  }
  // connect Polkadot-sdk extensions
  const connectExtension = async () => {
    
    let activeExtension = await web3Enable('encode hackathon dapp')

    setActiveExtension(activeExtension)

    let accounts = []
    activeExtension ? accounts = await web3Accounts() : console.log("No Accounts Found")
    setAccountConnected(accounts)
  }

  const fetchData = async () => {
    if (accountConnected.length === 0) return;

    const wsProvider = new WsProvider('wss://westend-rpc.polkadot.io');
    const api = await ApiPromise.create({ provider: wsProvider });
    const chainInfo = await api.registry.getChainProperties();
    setCurrentChain(chainInfo.tokenSymbol.toString());


    let tempAcc = [];
    for(let i = 0; i < accountConnected.length; i++){
      const { nonce, data: balance } = await api.query.system.account(accountConnected[i].address)
      tempAcc.push({metaName: accountConnected[i].meta.name, address: accountConnected[i].address, balance: balance, nonce: nonce})
    } 
    console.log(tempAcc)
    setAllAccounts(tempAcc);
  };

 

  useEffect(() => {
    fetchData();
  }, [accountConnected]);

  // burn 1337 WND from first connected account  
  const initTransaction = async () => {

    // init API
    const wsProvider = new WsProvider('wss://westend-rpc.polkadot.io');
    // const wsProvider = new WsProvider('wss://127.0.0.1:9944'); // for a local node
    const api = await ApiPromise.create({ provider: wsProvider });

    // grab injected object
    const injector = await web3FromAddress(accountConnected[0].address);
  
    // send to zero address
    const tx = api.tx.balances.transferKeepAlive('5C4hrfjw9DjXZTzV3MwzrrAr9P1MJhSrvWGWqi1eSuyUpnhM', 1337)

    // propogate tx
    tx.signAndSend(accountConnected[0].address, { signer: injector.signer }, ({ status }) => {
      if (status.isInBlock) {
          console.log(`Completed at block hash #${status.asInBlock.toString()}`);
      } else {
          console.log(`Current status: ${status.type}`);
      }
    }).catch((error) => {
        console.log(':( transaction failed', error);
    });  
}

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text)
    .then(() => alert('Address copied to clipboard'))
    .catch((error) => console.error('Could not copy address: ', error));
};

const shortenAddress = (address) => {
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h2>
          Polka Mini Wallet
        </h2>
      </header>
{activeExtension.length > 0 ? (
  <div className='wallet'>
<div className='walletSection'>
        <div className="walletContainer">
        <div className='walletHeader'>
          <h1 className='walletHeaderTitle'>Your Mini Wallet</h1>
          </div>

          <div className='walletTabs'>
            <div className="walletTabsContainer">
               <button className='walletTab-1'>
                <h1 className="walletTab-1Title">Accounts</h1>
              </button>
              <button className="walletTab-2">
                <h1 className="walletTab-2Title">Transaction History</h1>
              </button>
            </div>
          </div>
            {allAccounts.map((account)=>(
                <div key={account.address} className="accountDetailsContainer">
                <div className="accountAddressSection">
                <div className="accountAddressBox">
                <span className="accountName">{account.metaName}</span>
                <span className="accountAddress" onClick={() => copyToClipboard(account.address)}>
                  {shortenAddress(account.address)}
                </span>
              </div>
                </div>
                <span className="accountBalance">
                  { (Number(account.balance.free.toString()) / 1000000000000).toFixed(3) } { currentChain.replace(/\[|\]/g, '') }
                </span>
                
              </div>
             

            ))}
        
          
        
        <div className="transfer-section">
  <span className='transferTitle'>
    Transfer Tokens
  </span>
</div>

<label className='accSelect' htmlFor="">Select Account: </label>
<select className="accountSelect" onChange={(e)=> {setSelectedAccount(e.target.value)}} defaultValue="">
  <option value="" disabled>Select an Account</option>
  {allAccounts.map((account)=> (
    <option key={account.address} value={account.address}>{account.metaName}</option>
  ))}
</select>

         

          <form>
           <div className="form-control">
           <input onChange={(e)=> {setReceipientAddress(e.target.value)}} className='form-input' type="text" placeholder="Enter Address"></input>
           </div>
           <div className="form-control">
           <input onChange={(e)=> {setAmountToSend(e.target.value)}} className='form-input' type="text" placeholder="Enter Amount"></input>
           </div>
          </form>
         <div className='btn-area'>
          <button onClick={sendToken} className='submit-button'>
            {txLoading ? 'Sending....' : 'Send'}
          </button>

         </div>  
        </div>
         
    </div>

</div>
): (
  <div className='connectWallet'>
    <a href="#connect" onClick={() => connectExtension()}>
      <div className='btn'>
     Connect Wallet
      </div>
    </a>
    <br/>
  </div>

)}




  
    </div>
  );
}

export default App;
