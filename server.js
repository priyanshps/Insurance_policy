import dotenv from "dotenv";

dotenv.config();

import app from "./src/app.js";

// To Track CPU usage. pm2 will restart the server if it incressed 70% refer ecosystem.config.cjs for more info. 
import "./src/utils/cpu-monitor.js";

/*Cron job runs every minute to check the database for pending messages. 
If a message is due at the scheduled date and time,
it updates the message status from 'pending' to 'inserted' . */

import "./src/jobs/messageScheduler.js";



const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});