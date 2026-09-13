import mongoose from "mongoose";

const settingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    payTo: {
      jazzcash: { type: String, default: "0300 8484848" },
      easypaisa: { type: String, default: "0300 8484848" },
      bankTitle: { type: String, default: "MEHR Atelier" },
      bankName: { type: String, default: "Habib Bank Limited" },
      iban: { type: String, default: "PK12 HABB 0000 0000 0000 0000" },
    },
  },
  { timestamps: true },
);

export const Setting = mongoose.model("Setting", settingSchema);
