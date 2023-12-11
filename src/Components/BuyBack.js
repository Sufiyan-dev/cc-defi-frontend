import React, { useState, useEffect } from "react";
import "./BuyBack.css";
import axios from "axios";
import Web3 from "web3";
import { waitForTransactionConfirmation } from "../Utils/waitForTxn";

const BuyBack = ({ connectedAccount }) => {
  const openswap = "0x1bcf8D19a948Fb853fd8fce84a962C3DAd9c1A5C"
  const [selectedToken, setSelectedToken] = useState();
  const [selectedTokenBalance, setSelectedTokenBalance] = useState();
  const [qouted, setQouted] = useState(0);
  const [tokenOutAmount, setTokenOutAmount] = useState(0);

  const [error, setError] = useState("");
  const [tokens, setTokens] = useState([]);
  const [protocoToken, setProtocolToken] = useState(0.0);

  const handleOnChange = (e) => {
    setSelectedToken(e.target.value);
  };

  const getTransactionObject = async () => {
    const result = await axios.post(
      `https://defi-openswap-backend.vercel.app/transaction/approve`,
      {
        address: connectedAccount,
        contractAddress: "0x39A4269650B394159Ac6147e48A88f5345316FB1",
        amount: protocoToken,
      }
    );
    const transactionResult = await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [result.data],
    });
    console.log("transactionResult", transactionResult);
    const waitTxn = await waitForTransactionConfirmation(transactionResult);
    setQouted(2);
  };

  const getQuote = async () => {
    const result = await axios.post(
      `https://defi-openswap-backend.vercel.app/transaction/get-quote`,
      {
        tokenIn: "0x39A4269650B394159Ac6147e48A88f5345316FB1",
        tokenOut: selectedToken,
        amount: protocoToken,
      }
    );
    console.log("result quote ", result);
    let quoteAmountOut = Number(result.data.amountOut).toFixed(2);

    setTokenOutAmount(quoteAmountOut);
  };

  useEffect(() => {
    const userBalance = async () => {
      if (connectedAccount) {
        const result = await axios.get(
          `https://defi-openswap-backend.vercel.app/wallet/get-balance/${openswap}/${selectedToken}`
        );
        setSelectedTokenBalance(result.data.balance);
      }
    };
    if (selectedToken) {
      console.log("selectedToken", selectedToken);
      userBalance();
    }
  }, [selectedToken]);

  useEffect(() => {
    const fetchtokens = async () => {
      const result = await axios.post(
        `https://defi-openswap-backend.vercel.app/token/tokenInfo`
      );
      console.log("result ", result);

      if (!result.data) {
        return alert("falied to fetch tokens info");
      }

      setTokens(result.data.result.tokenPools);
      setSelectedToken(result.data.result.tokenPools[0].id);
    };
    const protocolBalance = async () => {
      const result = await axios.get(
        `https://defi-openswap-backend.vercel.app/wallet/get-balance/${connectedAccount}/0x39A4269650B394159Ac6147e48A88f5345316FB1`
      );
      setProtocolToken(result.data.balance);
    };
    fetchtokens();
    protocolBalance();
  }, []);
  const buyBackNow = async () => {
    const result = await axios.post(
      `https://defi-openswap-backend.vercel.app/transaction/buyback`,
      {
        tokenAddress: selectedToken,
        amountMin: 0,
        userAddress: connectedAccount,
      }
    );
    const transactionResult = await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [result.data],
    });
    console.log("transactionResult", transactionResult);
    const waitTxn = await waitForTransactionConfirmation(transactionResult);
  };
  const handleOnSubmit = async (e) => {
    e.preventDefault();
    console.log(selectedToken);
    if (qouted === 0) {
      await getQuote();
      setQouted(1);
    } else if (qouted === 1) {
      await getTransactionObject();
    } else {
      await buyBackNow();
    }
  };

  return (
    <div className="buyback-main">
      <div className="buyback-wrapper">
        <div className="buyback-title">Buy Back</div>
        <div className="buyback-error">{error.length > 0 ? error : ""}</div>
        <form onSubmit={handleOnSubmit}>
          <div className="buyback-dropdown">
            <select onChange={handleOnChange}>
              {tokens.map((token) => (
                <option key={token.id} value={token.token}>
                  {token.symbol}
                </option>
              ))}
            </select>
            Available Selected Token's Balance{" "}
            {parseInt(selectedTokenBalance).toFixed(5)} <br></br>
            <br></br>
            Available OpenSwap Tokens for exchange{" "}
            {parseInt(protocoToken).toFixed(5)}
            <br></br>
            <br></br>
            You will receive {parseInt(tokenOutAmount).toFixed(5)}
            <button className="buyback-btn" type="submit">
              {qouted === 0 && "Quote"}
              {qouted === 1 && "Approve"}
              {qouted === 2 && "Withdraw"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BuyBack;
