import React, { useEffect, useState } from 'react'
import "./Swap.css"
import axios from 'axios';

const tokenSample = [
  { token: "0xbkbkjbjkjk", tokenName: "ETH", tokenBalance: 10 ** 18 },
  { token: "0xbkbkjbdfsdjkjk", tokenName: "WETH", tokenBalance: 10 ** 18 },
  { token: "0xbkbkjbjfsdffkjk", tokenName: "WBTC", tokenBalance: 10 ** 18 },
];

const Swap = ({connectedAccount}) => {
    const [tokens, setTokens] = useState([]);
    const [tokenIn, setTokenIn] = useState("");
    const [tokenInAmount, setTokenInAmount] = useState(0);
    const [tokenOut, setTokenOut] = useState("");
    const [tokenOutAmount, setTokenOutAmount] = useState(0);
    const [qouted, setQouted] = useState(false);
    const [slippage, setSlippage] = useState(0.3);
    console.log(connectedAccount)


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
        if(connectedAccount.length > 0){   
          const result = await axios.get(`http://localhost:4000/wallet/get-balance/${connectedAccount}/${tokenIn}`);
          console.log("result amunt ", result)
        }
      }
      userBalance()
    },[tokenIn])

    useEffect(() => {

    },[])

    const handleOnSubmitForm = (e) => {
        e.preventDefault();
        if(tokenIn === tokenOut){
            return alert("Cannot swap same tokens !")
        }
        if(qouted) {
            // swap logic
            console.log("swapppp")
        } else {
            // qoute 
            handleGetQoute();
        }
        console.log(tokenIn, tokenInAmount);
        console.log(tokenOut, tokenOutAmount);
    }

  const handleGetQoute = () => {
    setQouted(true);
    setTokenOutAmount(10000);
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
