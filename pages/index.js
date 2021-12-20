import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { newKitFromWeb3 } from "@celo/contractkit";
import Web3 from "web3";
import "react-toastify/dist/ReactToastify.css";

import Head from "next/head";
import coffeePortalAbi from "../contracts/CoffeePortal.abi.json";
import erc20Abi from "../contracts/IERC20.abi.json";

export default function Home() {
  /**
   * Create a variable here that holds the contract address after you deploy!
   */
  const contractAddress = "0x1063F3412a35976F4ddE9b6c2a5777BA190C5439";
  const cUSDContractAddress = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1";
  /*
   * Just a state variable we use to store our user's public wallet.
   */
  const [currentAccount, setCurrentAccount] = useState("");

  const [message, setMessage] = useState("");

  const [name, setName] = useState("");

  /*
   * All state property to store the coffee data.
   */
  const [allCoffee, setAllCoffee] = useState([]);


  /*
   * This runs our function when the page loads.
   */
  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);


  const checkIfWalletIsConnected = async () => {
    try {
      /*
       * Check if we're authorized to access the user's wallet
       */
      const { celo } = window;

      const web3 = new Web3(celo);
  
      const kit = newKitFromWeb3(web3);

      const accounts = await kit.web3.eth.getAccounts();

      if (accounts.length !== 0) {
        const account = accounts[0];
        setCurrentAccount(account);
        toast.success("🦄 Wallet is Connected", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        getAllCoffee();
      } else {
        toast.warn("Make sure you have Celo Extension wallet Connected", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    } catch (error) {
      toast.error(`${error.message}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  /**
   * Implement your connectWallet method here
   */
  const connectWallet = async () => {
    try {
      const { celo } = window;

      if (!celo) {
        toast.warn("Make sure you have the Celo Extension Wallet Connected", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        return;
      }
      const web3 = new Web3(celo);

      await celo.enable();

      kit = newKitFromWeb3(web3);

      const accounts = await kit.web3.eth.getAccounts();

      kit.defaultAccount = accounts[0];
      setCurrentAccount(accounts[0]);
      getAllCoffee();
    } catch (error) {
      console.log(error);
    }
  };

   /*
   * Create a method that gets all coffee from your contract
   */
   const getAllCoffee = async () => {
    try {
      const { celo } = window;

      if (celo) {

        const web3 = new Web3(celo);

        const kit = newKitFromWeb3(web3);

        const coffeePortalContract = new kit.web3.eth.Contract(coffeePortalAbi, contractAddress);
  
        /*
         * Call the getAllCoffee method from your Smart Contract
         */
        const coffees = await coffeePortalContract.methods.getAllCoffee().call();
        /*
         * We only need address, timestamp, name, and message in our UI so let's
         * pick those out
         */
        const coffeeCleaned = coffees.map((coffee) => {
          return {
            address: coffee.giver,
            timestamp: new Date(coffee.timestamp * 1000),
            message: coffee.message,
            name: coffee.name,
          };
        });

        /*
         * Store our data in React State
         */
        setAllCoffee(coffeeCleaned);

      }else{
        console.log("Celo object doesn't exist!");
      }
        
    } catch (error) {
      console.log(error);
    }
  };


  async function approve(_donation, kit) {
    
    const cUSDContract = new kit.web3.eth.Contract(erc20Abi, cUSDContractAddress)
    const result = await cUSDContract.methods
      .approve(contractAddress, _donation)
      .send({ from: currentAccount })
    return result
  }

  const buyCoffee = async () => {
    try {

      const { celo } = window;
      
      if (celo) {
        const web3 = new Web3(celo);
        
        const kit = newKitFromWeb3(web3);

        const coffeePortalContract = new kit.web3.eth.Contract(coffeePortalAbi, contractAddress);

        let count = await coffeePortalContract.methods.getTotalCoffee().call();

        let coffeePrice = await coffeePortalContract.methods.getCoffeeAmount().call()

        console.log("Retrieved total coffee count...", count);

        /*
         * Execute the actual coffee gift from your smart contract
         */
        toast.info("Awaiting payment approval...", {
          position: "top-left",
          autoClose: 18050,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });

        try {
          await approve(coffeePrice, kit)
        } catch (error) {
          toast.error(`${error.message}`, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        }

        try {                  
          toast.info("Sending Fund for coffee...", {
            position: "top-left",
            autoClose: 18050,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });

          const coffeeTxn = await coffeePortalContract.methods.buyCoffee(
            message ? message : "Enjoy Your Coffee",
            name ? name : "Anonymous",
          ).send({ from: currentAccount });

          console.log("Mining...", coffeeTxn.hash);

        } catch (error) {
          toast.error(`${error.message}`, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
          
        }

        count = await coffeePortalContract.methods.getTotalCoffee().call();

        console.log("Retrieved total coffee count...", count);

        setMessage("");
        
        setName("");

        toast.success("Coffee Purchased!", {
          position: "top-left",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        }); 

        getAllCoffee();

      }else{
        console.log("Celo object doesn't exist!");
      }
    } catch (error) {
      toast.error(`${error.message}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      console.log(error);
    }
  };

 
  const handleOnMessageChange = (event) => {
    const { value } = event.target;
    setMessage(value);
  };
  const handleOnNameChange = (event) => {
    const { value } = event.target;
    setName(value);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <Head>
        <title>Mini Buy Me a Coffee</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-6xl font-bold text-blue-600 mb-6">
          Buy Me A Coffee
        </h1>

        {/*
         * If there is currentAccount render this form, else render a button to connect wallet
         */}

        {currentAccount ? (
          <div className="w-full max-w-xs sticky top-3 z-50 ">
            <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="name"
                >
                  Name
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="name"
                  type="text"
                  placeholder="Name"
                  onChange={handleOnNameChange}
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="message"
                >
                  Send the Creator a Message
                </label>

                <textarea
                  className="form-textarea mt-1 block w-full shadow appearance-none py-2 px-3 border rounded text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  rows="3"
                  placeholder="Message"
                  id="message"
                  onChange={handleOnMessageChange}
                  required
                ></textarea>
              </div>

              <div className="flex items-left justify-between">
                <button
                  className="bg-blue-500 hover:bg-blue-700 text-center text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  type="button"
                  onClick={buyCoffee}
                >
                  Support $5
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div>
            <p className="text-2xl text-blue-600 mb-6">
              Switch your wallet to Alfajores Testnet to test this
              application.
            </p>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-full mt-3"
              onClick={connectWallet}
            >
              Connect Your Wallet
            </button>
          </div>
        )}

        {allCoffee.map((coffee, index) => {
          return (
            <div className="border-l-2 mt-10" key={index}>
              <div className="transform transition cursor-pointer hover:-translate-y-2 ml-10 relative flex items-center px-6 py-4 bg-blue-800 text-white rounded mb-10 flex-col md:flex-row space-y-4 md:space-y-0">
                {/* <!-- Dot Following the Left Vertical Line --> */}
                <div className="w-5 h-5 bg-blue-600 absolute -left-10 transform -translate-x-2/4 rounded-full z-10 mt-2 md:mt-0"></div>

                {/* <!-- Line that connecting the box with the vertical line --> */}
                <div className="w-10 h-1 bg-green-300 absolute -left-10 z-0"></div>

                {/* <!-- Content that showing in the box --> */}
                <div className="flex-auto">
                  <h1 className="text-md">Supporter: {coffee.name}</h1>
                  <h1 className="text-md">Message: {coffee.message}</h1>
                  <h3>Address: {coffee.address}</h3>
                  <h1 className="text-md font-bold">
                    TimeStamp: {coffee.timestamp.toString()}
                  </h1>
                </div>
              </div>
            </div>
          );
        })}
      </main>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}
