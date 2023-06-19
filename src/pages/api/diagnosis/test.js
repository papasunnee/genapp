import mongoose, { Types } from "mongoose";
import dbConnect from "@/lib/dbConnect";
import Test from "@/models/Test";
import Patient from "@/models/Patient";

export default async function handler(req, res) {
  const { ObjectId } = Types;
  const { method } = req;
  let testId = req?.query?.testId;
  let id = req?.query?.id;
  let patientId = req?.query?.patientId;

  await dbConnect();

  if (method == "GET") {
    try {
      if (id && (id != "undefined" || id != null || id != "null")) {
        const singleTest = await Test.findOne({
          _id: new ObjectId(id),
        }).populate([
          {
            path: "payment",
            populate: {
              path: "user",
              populate: {
                path: "role",
              },
            },
          },
          {
            path: "patient",
          },
        ]);
        const resultArray = JSON.parse(singleTest.test_data);
        return res
          .status(400)
          .json({ success: true, data: singleTest, resultArray });
      } else if (
        testId &&
        (testId != "undefined" || testId != null || testId != "null") &&
        patientId &&
        (patientId != "undefined" || patientId != null || patientId != "null")
      ) {
        const singleTest = await Patient.findOne({
          _id: new ObjectId(patientId),
        }).populate({
          path: "tests",
          match: { _id: new ObjectId(testId) },
          populate: {
            path: "payment",
          },
        });
        const resultArray = JSON.parse(singleTest.tests[0].test_data);

        return res
          .status(400)
          .json({ success: true, data: singleTest, resultArray });
      }
      throw new Error("Invalid Parameters");
    } catch (error) {
      return res.status(400).json({ success: true, message: error.message });
    }
  } else {
    return res.status(400).json({ success: false });
  }
}
