import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./models/index.js";
import { Country } from "./models/Country.js";
import { Column } from "./models/Column.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.json());

connectDB().catch((err) => {
  console.error("Failed to connect to MongoDB:", err);
  process.exit(1);
});
app.get("/api/countries", async (req, res) => {
  try {
    const countries = await Country.find({});
    res.json(countries);
  } catch (error) {
    console.error("Error fetching countries:", error);
    res.status(500).json({ error: "Failed to fetch countries" });
  }
});

app.get("/api/countries/:id", async (req, res) => {
  try {
    let country = await Country.findById(req.params.id);
    if (!country) {
      country = await Country.findOne({ id: req.params.id });
    }
    if (!country) {
      return res.status(404).json({ error: "Country not found" });
    }
    res.json(country);
  } catch (error) {
    console.error("Error fetching country:", error);
    res.status(500).json({ error: "Failed to fetch country" });
  }
});

app.post("/api/countries", async (req, res) => {
  try {
    const countryData = req.body;
    const country = new Country(countryData);
    const savedCountry = await country.save();
    res.status(201).json(savedCountry);
  } catch (error) {
    console.error("Error creating country:", error);
    if (error.code === 11000) {
      res.status(409).json({ error: "Country with this name already exists" });
    } else {
      res.status(500).json({ error: "Failed to create country" });
    }
  }
});

app.put("/api/countries/:id", async (req, res) => {
  try {
    const countryData = req.body;
    const id = req.params.id;
    let country = await Country.findById(id);
    if (!country) {
      country = await Country.findOne({ id: id });
    }
    if (!country) {
      return res.status(404).json({ error: "Country not found" });
    }
    Object.assign(country, countryData);
    country.id = id;
    const updated = await country.save();
    res.json(updated);
  } catch (error) {
    console.error("Error updating country:", error);
    res.status(500).json({ error: "Failed to update country" });
  }
});

app.patch("/api/countries/:id", async (req, res) => {
  try {
    const countryData = req.body;
    const id = req.params.id;
    let country = await Country.findById(id);
    if (!country) {
      country = await Country.findOne({ id: id });
    }
    if (!country) {
      return res.status(404).json({ error: "Country not found" });
    }
    Object.assign(country, countryData);
    country.id = id;
    const updated = await country.save();
    res.json(updated);
  } catch (error) {
    console.error("Error patching country:", error);
    res.status(500).json({ error: "Failed to update country" });
  }
});

app.delete("/api/countries/:id", async (req, res) => {
  try {
    const id = req.params.id;
    let country = await Country.findByIdAndDelete(id);
    if (!country) {
      country = await Country.findOneAndDelete({ id: id });
    }
    if (!country) {
      return res.status(404).json({ error: "Country not found" });
    }
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting country:", error);
    res.status(500).json({ error: "Failed to delete country" });
  }
});

app.get("/api/columns", async (req, res) => {
  try {
    const columns = await Column.find({});
    res.json(columns);
  } catch (error) {
    console.error("Error fetching columns:", error);
    res.status(500).json({ error: "Failed to fetch columns" });
  }
});

app.get("/api/columns/:id", async (req, res) => {
  try {
    const column = await Column.findOne({ id: req.params.id });
    if (!column) {
      return res.status(404).json({ error: "Column not found" });
    }
    res.json(column);
  } catch (error) {
    console.error("Error fetching column:", error);
    res.status(500).json({ error: "Failed to fetch column" });
  }
});

app.post("/api/columns", async (req, res) => {
  try {
    const columnData = req.body;
    const column = new Column(columnData);
    const savedColumn = await column.save();
    res.status(201).json(savedColumn);
  } catch (error) {
    console.error("Error creating column:", error);
    if (error.code === 11000) {
      res
        .status(409)
        .json({ error: "Column with this id or key already exists" });
    } else {
      res.status(500).json({ error: "Failed to create column" });
    }
  }
});

app.put("/api/columns/:id", async (req, res) => {
  try {
    const columnData = req.body;
    const column = await Column.findOneAndUpdate(
      { id: req.params.id },
      columnData,
      { new: true, runValidators: true }
    );
    if (!column) {
      return res.status(404).json({ error: "Column not found" });
    }
    res.json(column);
  } catch (error) {
    console.error("Error updating column:", error);
    res.status(500).json({ error: "Failed to update column" });
  }
});

app.patch("/api/columns/:id", async (req, res) => {
  try {
    const columnData = req.body;
    const column = await Column.findOneAndUpdate(
      { id: req.params.id },
      { $set: columnData },
      { new: true, runValidators: true }
    );
    if (!column) {
      return res.status(404).json({ error: "Column not found" });
    }
    res.json(column);
  } catch (error) {
    console.error("Error patching column:", error);
    res.status(500).json({ error: "Failed to update column" });
  }
});

app.delete("/api/columns/:id", async (req, res) => {
  try {
    const column = await Column.findOneAndDelete({ id: req.params.id });
    if (!column) {
      return res.status(404).json({ error: "Column not found" });
    }
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting column:", error);
    res.status(500).json({ error: "Failed to delete column" });
  }
});

app.use(express.static(path.join(__dirname, "dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
