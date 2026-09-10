const cron = require("node-cron");
const { processAbandonedCarts } = require("../services/waCommerceService");

function startAbandonedCartCron() {
  // Runs every 10 minutes; reminds carts abandoned for 30+ minutes.
  cron.schedule("*/10 * * * *", async () => {
    try {
      const results = await processAbandonedCarts(30);
      if (results.length) {
        console.log(`[cron] Sent ${results.length} abandoned cart reminder(s).`);
      }
    } catch (err) {
      console.error("[cron] Abandoned cart job failed:", err.message);
    }
  });

  console.log("Abandoned cart cron job scheduled (every 10 min).");
}

module.exports = { startAbandonedCartCron };