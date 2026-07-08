// models/StyleCapacity-model.js
//
// FIX: cycleStartDate added to the unique index.
// Each production cycle (detected by style-wip streak logic) gets its OWN
// capacity document, so updating Total Input in a new cycle never touches
// the previous cycle's document.
//
import mongoose, { Schema } from "mongoose";

const StyleCapacitySchema = new Schema(
  {
    factory: {
      type: String,
      required: true,
      trim: true,
    },
    assigned_building: {
      type: String,
      required: true,
      trim: true,
    },
    line: {
      type: String,
      required: true,
      trim: true,
    },
    buyer: {
      type: String,
      required: true,
      trim: true,
    },
    style: {
      type: String,
      required: true,
      trim: true,
    },
    // ✅ NEW — cycle start date (YYYY-MM-DD) from style-wip streak detection.
    // Each new cycle gets its own doc. Old cycles are never overwritten.
    cycleStartDate: {
      type: String,
      required: true,
      trim: true,
    },
    // latest effective date of this save
    date: {
      type: String,
      trim: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: 0,
    },
    user: {
      id: { type: String, required: true },
      user_name: { type: String },
      role: { type: String },
    },
  },
  { timestamps: true }
);

// ✅ Unique per factory+building+line+buyer+style+cycleStartDate
// → different cycles of the same style are isolated documents.
StyleCapacitySchema.index(
  {
    factory: 1,
    assigned_building: 1,
    line: 1,
    buyer: 1,
    style: 1,
    cycleStartDate: 1,
  },
  { unique: true }
);

export const StyleCapacityModel =
  mongoose.models.StyleCapacity ||
  mongoose.model("StyleCapacity", StyleCapacitySchema);