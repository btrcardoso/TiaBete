import { app } from "./server/server";
import "dotenv/config";

const PORT = process.env.PORT || 3000;
app.listen(process.env.PORT, () => {
  console.log(`Your app is listening on port ${PORT}`);
});
