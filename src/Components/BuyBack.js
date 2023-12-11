import React, { useState, useEffect } from "react";
import "./BuyBack.css";
import axios from "axios";
const BuyBack = ({ connectedAccount }) => {
  const [selectedToken, setSelectedToken] = useState();
  const [qouted, setQouted] = useState(false);
  const [error, setError] = useState("");
  const [tokens, setTokens] = useState([]);
  const [protocoToken, setProtocolToken] = useState(0.0);
  const handleOnSubmit = (e) => {
    e.preventDefault();
    console.log(selectedToken);
  };

  const handleOnChange = (e) => {
    setSelectedToken(e.target.value);
  };

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
            Available OpenSwap Tokens for exchange {protocoToken}
            <button className="buyback-btn" type="submit">
              {qouted ? "Buy" : "Quote"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BuyBack;
