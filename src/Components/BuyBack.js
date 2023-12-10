import React, { useState } from 'react'
import "./BuyBack.css"

const tokenSample = [
    { token: "0xbkbkjbjkjk", tokenName: "ETH", tokenBalance: 10 ** 18 },
    { token: "0xbkbkjbdfsdjkjk", tokenName: "ETH", tokenBalance: 10 ** 18 },
    { token: "0xbkbkjbjfsdffkjk", tokenName: "ETH", tokenBalance: 10 ** 18 },
]

const BuyBack = () => {
  const [reserves, setReserves] = useState(tokenSample);
  const [selectedToken, setSelectedToken] = useState(tokenSample[0].token);
  const [qouted, setQouted] = useState(false);
  const [error, setError] = useState("");

  const handleOnSubmit = (e) => {
    e.preventDefault();
    console.log(selectedToken)
  }

  return (
    <div>
        <div>Buy Back</div>
        <div className='error-wrapper'>{error.length > 0 ? error : ""}</div>
        <div>
            <form onSubmit={handleOnSubmit}>
                <select onChange={(e) => setSelectedToken(e.target.value)}>
                    {reserves.length > 0 ? reserves.map((reserve) => (
                        <option value={reserve.token} key={reserve.token}>{reserve.tokenName}</option>
                    )) : <div></div>}
                </select>
                <button className="subit-btn" type='submit'>{qouted ? "Buy" : "Qoute"}</button>
            </form>
        </div>
    </div>
  )
}

export default BuyBack