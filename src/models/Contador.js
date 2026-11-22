import mongoose from "mongoose";

const contadorSchema = new mongoose.Schema(
  {
    _id: String,
    seq: { type: Number, default: 0 },
  },
  { versionKey: false },
);

export const Contador = mongoose.model(
  "Contador",
  contadorSchema,
  "contadores",
);
