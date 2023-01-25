if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}
const express = require("express");
const app = express();
const expressLayouts = require("express-ejs-layouts");
const indexRoute = require("./routes/indexRoute");
const authorsRoute = require("./routes/authorsRoute");
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.set("layout", "layouts/layout");
app.use(expressLayouts);
app.use(express.urlencoded({ limit: "10mb", extended: false }));
app.use(express.json());
app.use(express.static(__dirname + "/public"));

app.use("/", indexRoute);
app.use("/authors", authorsRoute);

mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", (error) => console.log(error));
db.once("open", () => console.log("Connected to Database"));

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => console.log(`Listening to port ${PORT}`));
