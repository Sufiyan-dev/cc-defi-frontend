const waitForTransactionConfirmation = async (transactionHash) => {
    return new Promise((resolve, reject) => {
      const checkConfirmation = async () => {
        try {
          const receipt = await window.ethereum.request({
            method: 'eth_getTransactionReceipt',
            params: [transactionHash],
          });
  
          if (receipt && receipt.blockNumber) {
            // Transaction mined
            resolve();
          } else {
            // Retry after a delay
            setTimeout(checkConfirmation, 1000);
          }
        } catch (error) {
          reject(error);
        }
      };
  
      // Start checking for confirmation
      checkConfirmation();
    });
  };

module.exports = { waitForTransactionConfirmation }  