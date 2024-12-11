const path = require('path');
const fs = require('fs');
const solc = require('solc');

try {
  // Construct the path to the contract and read the source code
  const contractFilePath = path.resolve(__dirname, '../contracts/TicketSale.sol');
  const contractSourceCode = fs.readFileSync(contractFilePath, 'utf8');

  const input = {
    language: 'Solidity',
    sources: {
      'TicketSale.sol': {
        content: contractSourceCode,
      },
    },
    settings: {
      outputSelection: {
        '*': {
          '*': ['*'],
        },
      },
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  };

  let output;
  try {
    // Attempt to compile the contract
    output = JSON.parse(solc.compile(JSON.stringify(input)));
  } catch (compilationError) {
    throw new Error(`Solidity Compilation Exception: ${compilationError.message}`);
  }

  // Check for errors in the compilation output
  if (output.errors) {
    output.errors.forEach((error) => {
      if (error.severity === 'error') {
        throw new Error(`Compilation Error: ${error.message}`);
      }
      console.warn(`Warning: ${error.message}`);
    });
  }

  // Extract contract details
  const compiledContract = output.contracts['TicketSale.sol']['TicketSale'];

  if (!compiledContract) {
    throw new Error('Contract not found in the compilation output');
  }

  // Prepare the module exports with ABI and bytecode
  module.exports = {
    abi: JSON.stringify(compiledContract.abi),
    bytecode: compiledContract.evm.bytecode.object,
  };

  console.log('Contract compiled and bytecode generated successfully!');
} catch (error) {
  console.error(`An error occurred: ${error.message}`);
  throw error; // Re-throwing the error for additional handling if needed
}
