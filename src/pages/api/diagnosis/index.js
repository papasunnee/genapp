import mongoose, { Types } from "mongoose";
import dbConnect from "@/lib/dbConnect";
import { getServerSession } from "next-auth";
import Test from "@/models/Test";
import Patient from "@/models/Patient";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  const { ObjectId } = Types;
  const { method } = req;
  let id = req?.query?.id;
  let delete_id = req?.body?.delete_id;
  let put_id = req?.body?.put_id;

  const conn = await dbConnect();

  const session = await getServerSession(req, res, authOptions);

  switch (method) {
    case "GET":
      try {
        if (id && (id != "undefined" || id != null || id != "null")) {
          const singleTest = await Test.findOne({
            _id: new ObjectId(id),
          }).populate([
            {
              path: "payment",
              path: "user",
              populate: {
                path: "user",
                populate: {
                  path: "role",
                },
              },
            },
          ]);
          return res.status(400).json({ success: true, data: singleTest });
        }

        
        const allRecords = await Test.find()
          .populate([
            { path: "patient" },
            { path: "user" },
            {
              path: "payment",
              populate: {
                path: "user",
                populate: {
                  path: "role",
                },
              },
            },
          ])
          .sort({ createdAt: -1 });
        return res.status(400).json({ success: true, data: allRecords });
      } catch (error) {
        return res.status(400).json({ success: true, message: error.message });
      }
      break;
    case "POST":
      try {
        const transactionSession = await conn.startSession();
        const testProcess = await transactionSession.withTransaction(
          async () => {
            const testData = await Test.create({
              ...req.body,
              user: session.user._id,
            });

            const updatePatient = await Patient.findOneAndUpdate(
              { _id: new ObjectId(req.body.patient) },
              { $push: { tests: testData._id } }
            );

            console.log({ updatePatient });

            return { testData, updatePatient };
          }
        );
        transactionSession.endSession();
        console.log({ testProcess });
        return res.status(201).json({ success: true, data: testProcess });
      } catch (error) {
        console.log(error.message);
        return res.status(400).json({ success: false, error: error.message });
      }
    case "PUT":
      try {
        if (
          put_id &&
          (put_id != "undefined" || put_id != null || put_id != "null")
        ) {
          delete req.body._id;
          let updateTest;
          if (req.body.nullTestValuesCount > 1) {
            updateTest = await Test.findOneAndUpdate(
              { _id: put_id },
              { test_data: req.body.test_data },
              {
                new: true,
              }
            ).populate([
              {
                path: "payment",
                populate: {
                  path: "user",
                },
              },
            ]);
          } else {
            updateTest = await Test.findOneAndUpdate(
              { _id: put_id },
              { test_data: req.body.test_data, status: "Test Completed" },
              {
                new: true,
              }
            ).populate([
              {
                path: "payment",
                populate: {
                  path: "user",
                },
              },
            ]);
          }

          return res.status(400).json({ success: true, data: updateTest });
        } else {
          return res
            .status(400)
            .json({ success: false, error: "unprocessed put_id" });
        }
      } catch (error) {
        return res.status(400).json({ success: false, error: error.message });
      }
    case "DELETE":
      try {
        if (
          delete_id &&
          (delete_id != "undefined" || delete_id != null || delete_id != "null")
        ) {
          const deleteTestResponse = await Test.deleteOne({
            _id: delete_id,
          });
          if (deleteTestResponse) {
            return res
              .status(400)
              .json({ success: true, data: deleteTestResponse });
          }

          return res.status(400).json({ success: false });
        } else {
          return res
            .status(400)
            .json({ success: false, error: "Unprocessed delete_id" });
        }
      } catch (error) {
        return res.status(400).json({ success: false, error: error.message });
      }
    default:
      return res.status(400).json({ success: false });
  }
}
