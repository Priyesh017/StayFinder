import { DataTypes } from "sequelize";
import { sequelize } from "../utils/db";

export const Listing = sequelize.define("Listing", {
  title: DataTypes.STRING,
  description: DataTypes.TEXT,
  location: DataTypes.STRING,
  imageUrl: DataTypes.STRING,
  price: DataTypes.FLOAT,
  availableFrom: DataTypes.DATE,
  availableTo: DataTypes.DATE,
  userId: DataTypes.INTEGER,
});
