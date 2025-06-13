import { DataTypes } from "sequelize";
import { sequelize } from "../utils/db";

export const Booking = sequelize.define("Booking", {
  userId: DataTypes.INTEGER,
  listingId: DataTypes.INTEGER,
  startDate: DataTypes.DATE,
  endDate: DataTypes.DATE,
});
