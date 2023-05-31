import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import "./App.css";
import abi from "./utils/WavePortal.json";

const getEthereumObject = () => window.ethereum;

/*
 * This function returns the first linked account found.
 * If there is no account linked, it will return null.
 */
const findMetaMaskAccount = async () => {
  try {
    const ethereum = getEthereumObject();

    /*
    * First make sure we have access to the Ethereum object.
    */
    if (!ethereum) {
      console.error("Make sure you have MetaMask!");
      return null;
    }

    console.log("We have the Ethereum object", ethereum);
    const accounts = await ethereum.request({ method: "eth_accounts" });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      return account;
    } else {
      console.error("No authorized account found");
      return null;
    }
  } catch (error) {
    console.error(error);
    return null;
  }
};

const App = () => {

  const [allWaves, setAllWaves] = useState([]);
  const [currentAccount, setCurrentAccount] = useState("");
  const [mining, setMining] = useState(false);
  const [totalWaveCount, setTotalWaveCount] = useState(0); // State variable for total wave count

  const contractAddress = "0x43E150FD724c00fc71c1dAd15435c02d04bf3873";
  const contractABI = abi.abi;


  /*
   * Create a method that gets all waves from your contract
   */
  const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        /*
         * Call the getAllWaves method from your Smart Contract
         */
        const waves = await wavePortalContract.getAllWaves();


        /*
         * We only need address, timestamp, and message in our UI so let's
         * pick those out
         */
        let wavesCleaned = [];
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          });
        });

        /*
         * Store our data in React State
         */
        setAllWaves(wavesCleaned);
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
    }
  }

  const connectWallet = async () => {
    try {
      const ethereum = getEthereumObject();
      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchTotalWaveCount = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          provider
        );

        const count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());

        setTotalWaveCount(count.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const wave = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());

        setMining(true);
        const waveTxn = await wavePortalContract.wave("this is a message")
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());

        setTotalWaveCount(count.toNumber());
        setMining(false);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    findMetaMaskAccount().then((account) => {
      if (account !== null) {
        setCurrentAccount(account);
      }
    });

    fetchTotalWaveCount();
  }, []);

//   return (
//     <div className="mainContainer">
//       <div className="dataContainer">
//         <div className="header">
//           👋 Hey there!
//         </div>

//         <div className="bio">
//           I am Adam and I am a software engineer:)
//           Connect your Ethereum wallet and wave at me!
//         </div>

//         <button className="waveButton" onClick={wave}>
//           {mining ? (
//             <div className="progressBar">Mining in progress...</div>
//           ) : (
//             "Wave at Me"
//           )}
//         </button>

//         {/*
//          * If there is no currentAccount render this button
//          */}
//         {!currentAccount && (
//           <button className="waveButton" onClick={connectWallet}>
//             Connect Wallet
//           </button>
//         )}

//         <div>
//           <input type="text" value={wave.message} placeholder="Enter your wave message" />
//           <button className="waveButton" onClick={wave}>
//             Add Wave
//           </button>
//         </div>

//         {allWaves.map((wave, index) => {
//           return (
//             <div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}>
//               <div>Address: {wave.address}</div>
//               <div>Time: {wave.timestamp.toString()}</div>
//               <div>Message: {wave.message}</div>
//             </div>)
//         })}

//         <div className="waveCount">
//           Total Waves: {totalWaveCount}
//         </div>

//         <div className="addresswave">
//           WavePortal address:  0x4e9AfD8B80cF08Aa4586fC02578ff0dCc74Fd501
//         </div>

//         <div className="etherscan">
//           <a href="https://goerli.etherscan.io/address/0x6D4b0783F8752974f32406D5aDe435Ee32E65b56"> LINK TO ETHERSCAN CONTRACT </a>
//         </div>
//       </div>
//     </div>
//   );
// };

return (
  <div className="mainContainer">
    <div className="dataContainer">
      <div className="header">
        <span role="img" aria-label="Wave Hand Emoji">👋</span> Hey there!
      </div>

      <div className="bio">
        <span className="name">I am Adam</span> and I am a software engineer 😊<br />
        Connect your Ethereum wallet and wave at me!
      </div>

      <button className="waveButton" onClick={wave}>
        {mining ? (
          <div className="progressBar">Mining in progress...</div>
        ) : (
          "Wave at Me"
        )}
      </button>

      {/* {!currentAccount && (
        <button className="waveButton" onClick={connectWallet}>
          Connect Wallet
        </button>
      )} */}

      {!currentAccount && (
        <div className="connectButtonContainer">
          <button className="waveButton connectButton" onClick={connectWallet}>
            <img src="metamask-logo.png" alt="MetaMask Logo" className="metamaskLogo" />
            Connect with MetaMask
          </button>
        </div>
      )}

      <div className="waveInputContainer">
        <input type="text" value={wave.message} placeholder="Enter your wave message" className="waveInput largeInput" />
        <button className="waveButton largeButton" onClick={wave}>
          Add Wave
        </button>
      </div>

      {allWaves.map((wave, index) => {
        return (
          <div key={index} className="waveCard">
            <div className="address">Address: {wave.address}</div>
            <div className="time">Time: {wave.timestamp.toString()}</div>
            <div className="message">Message: {wave.message}</div>
          </div>
        );
      })}

      <div className="waveCount">
        Total Waves: {totalWaveCount}
      </div>

      <div className="addresswave">
        WavePortal address: 0x4e9AfD8B80cF08Aa4586fC02578ff0dCc74Fd501
      </div>

      <div className="etherscan">
        <a href="https://goerli.etherscan.io/address/0x6D4b0783F8752974f32406D5aDe435Ee32E65b56">
          LINK TO ETHERSCAN CONTRACT
        </a>
      </div>
    </div>
  </div>
);


};
export default App;
