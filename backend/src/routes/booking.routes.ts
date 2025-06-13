import express from "express";
import { Booking } from "../models/Booking";
import auth from "../middleware/auth.middleware";

const router = express.Router();

router.post("/", auth, async (req, res) => {
  const { listingId, startDate, endDate } = req.body;
  const booking = await Booking.create({
    userId: req.user.id,
    listingId,
    startDate,
    endDate,
  });
  res.status(201).json(booking);
});

export default router;
