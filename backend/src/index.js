const express = require("express")
const cors = require("cors")

const app = express()

app.use(cors({ origin: "http://localhost:3000" }))
app.use(express.json())

// hook up all the routes
app.use("/api/assignments", require("./routes/assignments"))
app.use("/api/grades", require("./routes/grades"))
app.use("/api/notes", require("./routes/notes"))
app.use("/api/sessions", require("./routes/sessions"))
app.use("/api/stats", require("./routes/stats"))

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" })
})

app.listen(5000, () => {
  console.log("server running on http://localhost:5000")
})
