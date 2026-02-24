require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();


app.use(cors());
app.use(express.json());

// RUTAS
const featuredRouter = require("./src/routes/featured.routes");
const riotTestRouter = require("./src/routes/riotTest.routes");
const championsRouter = require("./src/routes/champions.routes");
const authRouter = require("./src/routes/auth.routes");
const playersRouter = require("./src/routes/players.routes");

app.use("/api/featured", featuredRouter);
app.use("/api/riot-test", riotTestRouter);
app.use("/api/champions", championsRouter);
app.use("/api/auth", authRouter);
app.use("/api/players", playersRouter);

app.get("/", (req, res) => {
  res.send("Backend funcionando");
});

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Servidor en puerto ${PORT}`);
  console.log("http://localhost:" + PORT);
});