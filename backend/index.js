const createApp = require("./app.js");
const PORT = process.env.PORT || 5000;

const app = createApp(process.env.MONGO_URI);
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
