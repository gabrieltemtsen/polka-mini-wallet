import logo from './logo.gif';
import './App.css';
import { useState, useEffect } from 'react';

import {
  web3Enable, 
  web3Accounts,
  web3FromAddress
} from '@polkadot/extension-dapp';

import { ApiPromise, WsProvider } from '@polkadot/api'

function App() {
  const [activeExtension, setActiveExtension] = useState([]);
  const [accountConnected, setAccountConnected] = useState([]);
  const [allAccounts, setAllAccounts] = useState([]); 
  const [currentChain, setCurrentChain] = useState('');
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

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h2>
          Encode Hackathon Workshop
        </h2>
      </header>
      {/* <div className="App-body">
        { activeExtension.length > 0 ? (
          <>
            <h4>Selected Extension: {activeExtension[0].name}</h4>
            Account:
            {accountConnected.map(account => 
                <p>{account.meta.name} : {account.address}</p>
            )}
            <div>
              <a href="#init" onClick={() => initTransaction()}>
                <div className='btn'>
                  Burn 1337 Westies
                </div>
              </a>
              <br/>
            </div>
            <div>
              <h4>NFTs in the Account:</h4>
              {allAccounts.map((account)=>(
                <div>
                  <p>Address: {account.address}</p>
                  <p>Balance: {Number(account.balance.free.toString()) / 1000000000000 }</p>
                  <p> NFTs:  </p>
                </div>
              
              ))}
              
            </div>
          </>
        ):(
          <div>
            <a href="#connect" onClick={() => connectExtension()}>
              <div className='btn'>
              Connect Wallet
              </div>
            </a>
            <br/>
          </div>
        )}
      </div> */}



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
                <div className="accountDetailsContainer">
                <div className="accountAddressSection">
                  <div className="accountAddressBox">
                     <span className="accountName">{account.metaName}</span>
                     <span className="accountAddress"> {account.address} </span>
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

         

          <form>
           <div className="form-control">
           <input className='form-input' type="text" placeholder="Enter Address"></input>
           </div>
           <div className="form-control">
           <input className='form-input' type="text" placeholder="Enter Amount"></input>
           </div>
          </form>
         <div className='btn-area'>
          <button className='submit-button'>
            Send
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
