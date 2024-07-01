import { account } from "./account.js";
import { Config } from "./src/config/config.js";
import { Lake } from "./src/core/lake.js";
import { Helper } from "./src/utils/helper.js";
import logger from "./src/utils/logger.js";

async function operation(acc) {
  try {
    console.log();
    const lake = new Lake();
    await lake.connectWallet(acc);
    await lake.getBalance(acc);

    console.log();
    console.log(`Wallet Info`);
    console.log(`Balance      : ${lake.balance} mLAKE`);
    console.log();

    for (let txCount = 0; txCount < Config.txCount; txCount++) {
      await lake.send();
    }
  } catch (error) {
    if (currentError != maxError) {
      currentError += 1;
      console.info(`Retrying using Account ${account.indexOf(acc) + 1}...`);
      logger.info(`Retrying using Account ${account.indexOf(acc) + 1}...`);
      console.error(error);
      logger.error(error);
      console.log();
      await operation(acc);
    } else {
      throw error;
    }
  }
}

const maxError = Config.maxErrorCount;
var currentError = 0;
/** Processing Bot */
async function process() {
  logger.info(`LAKE AUTO TX BOT STARTED`);
  for (const acc of account) {
    currentError = 0;
    try {
      await operation(acc);
    } catch (error) {
      console.error(
        `Error processing Accoung ${
          account.indexOf(acc) + 1
        } & Max Error Reached : `,
        error
      );
      logger.error(
        `Error processing Accoung ${
          account.indexOf(acc) + 1
        } & Max Error Reached : ${JSON.stringify(error)}`
      );
      continue;
    }
    console.log(`Completed, continue using next account`);
    logger.info(`Completed, continue using next account`);
    logger.info(``);
  }
  console.log(`All account processed`);
  logger.info(`LAKE AUTO TX BOT FINISHED`);
  console.log(`Delaying for 1 day`);
  await Helper.delay(1000 * 3600 * 24);
  await process();
}

(async () => {
  console.log("Lake Tx Bot");
  console.log("By : Widiskel");
  console.log("Note : Don't forget to run git pull to keep up-to-date");
  console.log();
  await process();
})();
