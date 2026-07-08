// models/machine-model.js
import mongoose from "mongoose";

const machineUnitSchema = new mongoose.Schema(
  {
    serialNumber: { type: String, required: true }, // e.g. "SN-001"
    floorName:    { type: String, required: true },  // e.g. "A-3"
    status: {
      type: String,
      enum: ["Running", "Idle", "Repairable", "Damage"],
      required: true,
      default: "Running",
    },
  },
  { _id: false }
);

const machineSchema = new mongoose.Schema(
  {
    factory:     { type: String, default: "" },
    machineName: { type: String, required: true },
    // stockQty is derived from units.length at read time — no longer stored
    units: { type: [machineUnitSchema], default: [] },
  },
  { timestamps: true }
);

// factory + machineName must be unique together
machineSchema.index({ factory: 1, machineName: 1 }, { unique: true });

// serialNumber must be unique within a machine type + factory
machineSchema.index(
  { factory: 1, machineName: 1, "units.serialNumber": 1 },
  { unique: true, sparse: true }
);

export const machineModel =
  mongoose.models.Machine || mongoose.model("Machine", machineSchema);