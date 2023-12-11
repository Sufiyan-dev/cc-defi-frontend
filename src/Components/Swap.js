import React, { useEffect, useState } from 'react'
import "./Swap.css"
import axios from 'axios';
import { waitForTransactionConfirmation } from '../Utils/waitForTxn';

const Swap = ({connectedAccount}) => {
    const [tokens, setTokens] = useState([]);
    const [tokenIn, setTokenIn] = useState("");
    const [tokenInAmount, setTokenInAmount] = useState(0);
    const [tokenOut, setTokenOut] = useState("");
    const [tokenOutAmount, setTokenOutAmount] = useState(0);
    const [qouted, setQouted] = useState(false);
    const [swap, setSwap] = useState(false);
    const [slippage, setSlippage] = useState(0.3);
    const [userTokenInAmountBalance, setUserTokenInAmountBalance] = useState(0);
    // console.log(connectedAccount)


    useEffect(() => {
        const fetchtokens = async () => {
            const result = await axios.post(`https://defi-openswap-backend.vercel.app/token/tokenInfo`);
            console.log("result ",result)

            if(!result.data){
                return alert("falied to fetch tokens info")
            }

            setTokens(result.data.result.tokenPools)
            setTokenIn(result.data.result.tokenPools[0].id);
            setTokenOut(result.data.result.tokenPools[0].id);
        }
        fetchtokens()
    },[])

    useEffect(() => {
        
        const getQuote = async () => {
          console.log(tokenIn, tokenOut, tokenInAmount)
          if(qouted){
            const result = await axios.post(`https://defi-openswap-backend.vercel.app/transaction/get-quote`,{
                    "tokenIn": tokenIn,
                    "tokenOut": tokenOut,
                    "amount": tokenInAmount
            });
            console.log("result quote ", result)
            let quoteAmountOut = Number(result.data.amountOut).toFixed(2);

            setTokenOutAmount(quoteAmountOut)
          }
        }

        getQuote()
    },[qouted])

    useEffect(() => {
      const userBalance = async () => {
        console.log(tokenIn, connectedAccount)
        if(connectedAccount.length > 0){   
          const result = await axios.get(`https://defi-openswap-backend.vercel.app/wallet/get-balance/${connectedAccount}/${tokenIn}`);
          console.log("result amunt ", result)
          setUserTokenInAmountBalance(Number(result.data.balance))
        }
      }
      userBalance()
    },[tokenIn,connectedAccount])

    useEffect(() => {
      const performSwap = async () => {
        if(swap){
          const approveTxn = await axios.post(`https://defi-openswap-backend.vercel.app/transaction/approve`,{
            "contractAddress": tokenIn,
            "address": connectedAccount,
            "amount": tokenInAmount
          });

          console.log("approve", approveTxn);

          if(approveTxn.data){
            try {
              const result = await window.ethereum.request({ method: 'eth_sendTransaction', params: [approveTxn.data] });
              console.log("result of metamsk ", result);

              
              const waitTxn = await waitForTransactionConfirmation(result);
              console.log(waitTxn);

              // if()
            } catch(err) {
              console.log("metmask err singing approve ", err.message)
              return;
            }

            console.log(connectedAccount, tokenIn, tokenInAmount)

            const addLiquidty = await axios.post(`https://defi-openswap-backend.vercel.app/transaction/swap`,{
              "userAddress": connectedAccount,
              "tokenIn": tokenIn,
              "tokenOut": tokenOut,
              "amountIn": tokenInAmount,
              "amountOutMin": 0
            });

            console.log("add liquodty txn", addLiquidty.data);

            try {
              const result = await window.ethereum.request({ method: 'eth_sendTransaction', params: [addLiquidty.data]});
              console.log("metamask add liquidty result ", result);

              const waitTxn = await waitForTransactionConfirmation(result);
              console.log(waitTxn);


            } catch(err) {
              console.log("metamask err signing swap ");
              return;
            }

          }
          setSwap(false)
        }
      }
      performSwap()
    },[swap])

    const handleOnSubmitForm = (e) => {
        e.preventDefault();
        if(tokenIn === tokenOut){
            return alert("Cannot swap same tokens !")
        }
        if(qouted) {
            // swap logic
            console.log("swapppp")
            setSwap(true);
        } else {
            // qoute 
            handleGetQoute();
        }
        console.log(tokenIn, tokenInAmount);
        console.log(tokenOut, tokenOutAmount);
    }

  const handleGetQoute = () => {
    setQouted(true);
    // setTokenOutAmount(0);
  };

  const handleOnChangeTokenIn = (e) => {
    setTokenIn(e.target.value);
    setQouted(false);
    setTokenOutAmount(0);
  };

  const handleOnChangeTokenInAmount = (e) => {
    setTokenInAmount(e.target.value);
    setQouted(false);
    setTokenOutAmount(0);
  };

  const handleOnChangeTokenOut = (e) => {
    console.log(e.target.value)
    setTokenOut(e.target.value);
    setQouted(false);
    setTokenOutAmount(0);
  };

  const handleOnChangeSlippage = (e) => {
    const slippage = e.target.value;
    if (slippage > 100) {
      return alert("cannot go above 100%");
    }
    setSlippage(e.target.value);
  };

  return (
    <div>
      <div className="swap-title">Swap</div>
      <div className="swap-main">
        <div className="swap-wrapper">
          <form onSubmit={handleOnSubmitForm}>
            `
            <div className="swap-tokein">
              <input
                className="tokein-amount"
                min={0}
                max={userTokenInAmountBalance}
                type="number"
                value={tokenInAmount}
                onChange={handleOnChangeTokenInAmount}
              />
              <select onChange={handleOnChangeTokenIn}>
                {tokens.map((token) => (
                  <option key={token.id} value={token.token}>
                    {token.symbol}
                  </option>
                ))}
              </select>
            </div>
            <div className="swap-tokeout">
              <input
                min={0}
                className="tokeout-amount"
                type="number"
                value={tokenOutAmount}
                disabled={true}
              />
              <select onChange={handleOnChangeTokenOut}>
                {tokens.map((token) => (
                  <option key={token.id} value={token.token}>
                    {token.symbol}
                  </option>
                ))}
              </select>
            </div>
            <div className="swap-slippage-wrapper">
              <h3>Max. slippage</h3>
              <input
                min={0.3}
                className="swap-slippage-input"
                type="number"
                value={slippage}
                onChange={handleOnChangeSlippage}
              />
            </div>
            <div>
              <button type="submit">{qouted ? "Swap" : "Quote"}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )

};  

export default Swap;
