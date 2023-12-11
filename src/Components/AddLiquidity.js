import React, { useEffect, useState } from "react";
import "./AddLiquidity.css";
import axios from "axios";
import { waitForTransactionConfirmation } from "../Utils/waitForTxn";

const AddLiquidity = ({connectedAccount}) => {
  const [tokenInfo, setTokenInfo] = useState([]);
  const [userHistory, setUserHistory] = useState([]);
  const [filterData, setFilterData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [tokenSelected, setTokenSelected] = useState("");
  const [supplyAmount, setSupplyAmount] = useState(0);
  const [userSelectedTokenBalance, setUserSelectedTokenBalance] = useState(0);
  const [addliquidity, setAddLiquidty] = useState(false);

  useEffect(() => {
    if (searchTerm.length > 0) {
      const filterSearch = userHistory.filter((row) =>
        row.token.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilterData(filterSearch);
    } else {
      setFilterData(userHistory);
    }
  }, [searchTerm]);

  useEffect(() => {
    const getUsersHistory = async () => {
      if(connectedAccount.length > 0){
        const result = await axios.post(`https://defi-openswap-backend.vercel.app/token/userSupplyHistory`,{
          "userAddress": connectedAccount
        })
        console.log("history ",result);

        setUserHistory(result.data.result);
        setFilterData(result.data.result);
      }
    }
    getUsersHistory();
  },[connectedAccount])

  useEffect(() => {
      const fetchtokens = async () => {
          const result = await axios.post(`https://defi-openswap-backend.vercel.app/token/tokenInfo`);
          console.log("result ",result)

          if(!result.data){
              return alert("falied to fetch tokens info")
          }
          console.log(result)

          setTokenInfo(result.data.result.tokenPools);
          setTokenSelected(result.data.result.tokenPools[0].token)
      }
      fetchtokens()
  },[]);

  useEffect(() => {
    const performAddLiquidty = async () => {
      if(addliquidity){
        const approveTxn = await axios.post(`https://defi-openswap-backend.vercel.app/transaction/approve`,{
            "contractAddress": tokenSelected,
            "address": connectedAccount,
            "amount": supplyAmount
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

            const addLiquidty = await axios.post(`https://defi-openswap-backend.vercel.app/transaction/deposit`,{
              "tokenAddress": tokenSelected,
              "amount": supplyAmount,
              "userAddress": connectedAccount
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

        setAddLiquidty(false);
      }
    }
    performAddLiquidty()
  },[addliquidity])

  useEffect(() => {
    const userBalance = async () => {
      console.log(tokenSelected, connectedAccount)
      if(connectedAccount.length > 0){   
        const result = await axios.get(`https://defi-openswap-backend.vercel.app/wallet/get-balance/${connectedAccount}/${tokenSelected}`);
        console.log("result amunt ", result)
        setUserSelectedTokenBalance(Number(result.data.balance))
      }
    }
    userBalance()
  },[tokenSelected,connectedAccount])

  const handleSearchTermChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleOnSubmit = (event) => {
    console.log("inside");
    event.preventDefault();
    console.log(tokenSelected);
    console.log(supplyAmount);
    if(supplyAmount > 0 && supplyAmount <= userSelectedTokenBalance){
      setAddLiquidty(true);
    }
    return alert("invalid amount specified");
  };

  const handleOnChangeTokenSelection = (event) => {
    setTokenSelected(event.target.value);
  };

  return (
    <div className="addliquidity-main">
      <div className="addliquidty-wrapper">
        <div className="title">Add Liquidity</div>
        <div className="token-dropdown">
          <form onSubmit={handleOnSubmit}>
            <select
              value={tokenSelected}
              onChange={handleOnChangeTokenSelection}
            >
              {tokenInfo.length > 0 ? (
                tokenInfo.map((token) => (
                  <option key={token.id} value={token.id}>
                    {token.symbol}
                  </option>
                ))
              ) : (
                <div>Connect MetaMask</div>
              )}
            </select>
            <input
              className="input-balance"
              type="number"
              value={supplyAmount}
              onChange={(e) => setSupplyAmount(e.target.value)}
            />
            <button className="submit-btn" type="submit">
              Submit
            </button>
          </form>
        </div>
      </div>
      <div className="history-main">
        <div className="histroy-title">Supply History</div>
        <div className="history-search">
          <input
            placeholder="Search Token"
            value={searchTerm}
            onChange={handleSearchTermChange}
          />
        </div>
        <div className="histroy-table">
          <table>
            <thead>
              <tr>
                <td>Token</td>
                <td>Amount</td>
                <td>Timestamp</td>
              </tr>
            </thead>
            <tbody>
              {filterData.length > 0 ? (
                filterData.map((item, i) => (
                  <tr key={i}>
                    <td>{item.symbol}</td>
                    <td>{item.amount}</td>
                    <td>{item.timestamp}</td>
                  </tr>
                ))
              ) : (
                <div></div>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AddLiquidity;
