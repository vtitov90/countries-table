import mongoose from "mongoose";

const columnSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    key: {
      type: String,
      required: true,
      unique: true,
    },
    label: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["string", "number"],
      required: true,
    },
    visible: {
      type: Boolean,
      default: true,
    },
    sortable: {
      type: Boolean,
      default: true,
    },
    required: {
      type: Boolean,
      default: false,
    },
    decimalScale: {
      type: Number,
      default: undefined,
    },
    optimalValue: {
      type: String,
      enum: ["lowest", "highest"],
      default: undefined,
    },
  },
  {
    timestamps: true,
  }
);

columnSchema.set("toJSON", {
  transform: function (doc, ret) {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Column = mongoose.model("Column", columnSchema);
