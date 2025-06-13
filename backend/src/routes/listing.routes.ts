import express from "express";
import { Listing } from "../models/Listing";
import auth from "../middleware/auth.middleware";

const router = express.Router();

router.get("/", async (req, res) => {
  const listings = await Listing.findAll();
  res.json(listings);
});

router.get("/:id", async (req, res) => {
  const listing = await Listing.findByPk(req.params.id);
  if (!listing) return res.status(404).json({ message: "Not found" });
  res.json(listing);
});

router.post("/", auth, async (req, res) => {
  const listing = await Listing.create({ ...req.body, userId: req.user.id });
  res.status(201).json(listing);
});

router.put("/:id", auth, async (req, res) => {
  const listing = await Listing.findByPk(req.params.id);
  if (!listing || listing.userId !== req.user.id)
    return res.status(403).json({ message: "Forbidden" });
  await listing.update(req.body);
  res.json(listing);
});

router.delete("/:id", auth, async (req, res) => {
  const listing = await Listing.findByPk(req.params.id);
  if (!listing || listing.userId !== req.user.id)
    return res.status(403).json({ message: "Forbidden" });
  await listing.destroy();
  res.status(204).end();
});

export default router;
