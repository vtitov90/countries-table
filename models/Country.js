import mongoose from "mongoose";

const countrySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    strict: false,
    timestamps: true,
  }
);

countrySchema.set("toJSON", {
  transform: function (doc, ret) {
    if (!ret.id) {
      ret.id = ret._id.toString();
    }
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Country = mongoose.model("Country", countrySchema);
