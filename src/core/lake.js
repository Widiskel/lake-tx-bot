import { ethers } from "ethers";
import { Helper } from "../utils/helper.js";
import logger from "../utils/logger.js";
import { Config } from "../config/config.js";

export class Lake {
  RPC_URL = "https://rpc-mokotow.data-lake.co";
  CHAIN_ID = 2676;
  provider = new ethers.JsonRpcProvider(this.RPC_URL, this.CHAIN_ID);

  async connectWallet(acc) {
    try {
      console.log(`-> Connecting Wallet`);
      const data = acc.replace(/^0x/, "");
      logger.info(`Account : ${data}`);
      const type = Helper.determineType(data);
      logger.info(`Account Type : ${type}`);
      if (type == "Secret Phrase") {
        this.wallet = ethers.Wallet.fromPhrase(data, this.provider);
      } else if (type == "Private Key") {
        this.wallet = new ethers.Wallet(data.trim(), this.provider);
      }
      logger.info(`Wallet connected ${JSON.stringify(this.wallet)}`);
      console.log(`-> Wallet Connected ${this.wallet.address}`);
      //   console.log(this.wallet);
    } catch (error) {
      throw error;
    }
  }

  async getBalance() {
    try {
      console.log(`-> Get Wallet Balance`);
      const balance = await this.provider.getBalance(this.wallet.address);
      this.balance = ethers.formatEther(balance);
      //   console.log(this.balance);
    } catch (error) {
      throw error;
    }
  }

  async send() {
    try {
      const destAddress =
        Config.destAddress[Helper.random(0, Config.destAddress.length - 1)] ??
        this.wallet.address;

      const fee = await this.provider.getFeeData();
      const nonce = await this.provider.getTransactionCount(
        this.wallet.address,
        "latest"
      );

      const tx = new ethers.Transaction();
      tx.to = destAddress;
      tx.value = ethers.parseEther(Config.sendAmount.toString());
      tx.chainId = this.CHAIN_ID;
      tx.gasLimit = fee.maxFeePerGas;
      tx.gasPrice = fee.gasPrice;
      tx.nonce = nonce;

      console.log(`-> Sending ${Config.sendAmount} to Address ${destAddress}`);
      logger.info(`-> Sending ${Config.sendAmount} to Address ${destAddress}`);

      await this.executeTx(tx);
    } catch (error) {
      throw error;
    }
  }

  async executeTx(tx) {
    const txRes = await this.wallet.sendTransaction(tx);
    logger.info(`-> Building Tx : ${JSON.stringify(txRes)}`);
    const txRev = await txRes.wait();
    console.log(`-> Tx Hash: ${txRev.hash}`);
    logger.info(`-> Tx Confirmed and Finalizing: ${JSON.stringify(txRev)}`);
    console.log();
  }
}
