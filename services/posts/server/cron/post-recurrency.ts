import { RecurrencyController } from "../api/controllers";

const cron = require("node-cron");

const recurrencyController = new RecurrencyController();

function startPostRecurrencyJob() {
    // cron running every 5 seconds to test
    // cron.schedule("*/5 * * * * *", () => {
    //     recurrencyController.postRecurencyCreation();
    // });

    cron.schedule("0 0 * * *", () => {
        recurrencyController.postRecurencyCreation();
    });
}

export { startPostRecurrencyJob as startPostRecurrencyJob };
