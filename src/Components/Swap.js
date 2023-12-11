import React, { useEffect, useState } from 'react'
import "./Swap.css"
import axios from 'axios';

const tokenSample = [
  { token: "0xbkbkjbjkjk", tokenName: "ETH", tokenBalance: 10 ** 18 },
  { token: "0xbkbkjbdfsdjkjk", tokenName: "WETH", tokenBalance: 10 ** 18 },
  { token: "0xbkbkjbjfsdffkjk", tokenName: "WBTC", tokenBalance: 10 ** 18 },
];

const Swap = () => {
    const [tokens, setTokens] = useState([]);
    const [tokenIn, setTokenIn] = useState("");
    const [tokenInAmount, setTokenInAmount] = useState(0);
    const [tokenOut, setTokenOut] = useState("");
    const [tokenOutAmount, setTokenOutAmount] = useState(0);
    const [qouted, setQouted] = useState(false);
    const [slippage, setSlippage] = useState(0.3);

    useEffect(() => {
        const fetchtokens = async () => {
            const result = await axios.post(`http://localhost:4000/token/tokenInfo`);
            console.log("result ",result)

            if(!result.data){
                return alert("falied to fetch tokens info")
            }

            setTokens(result.data.result.tokenPools)
        }
        fetchtokens()
    },[])

    useEffect(() => {
        
        const getQuote = async () => {
          if(qouted){
            const result = await axios.post(`http://localhost:4000/transaction/get-quote`,{
                    "tokenIn": tokenIn,
                    "tokenOut": tokenOut,
                    "amount": tokenInAmount
            });
            console.log("result quote ", result)
          }
        }

        getQuote()
    },[qouted])

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
