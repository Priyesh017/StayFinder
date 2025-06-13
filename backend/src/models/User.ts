import { DataTypes } from "sequelize";
import { sequelize } from "../utils/db";

export const User = sequelize.define("User", {
  name: DataTypes.STRING,
  email: DataTypes.STRING,
  password: DataTypes.STRING,
});
