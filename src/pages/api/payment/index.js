import mongoose, { Types } from "mongoose";
import dbConnect from "@/lib/dbConnect";
import Payment from "@/models/Payment";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import Test from "@/models/Test";

export default async function handler(req, res) {
  const { ObjectId } = Types;
  const { method } = req;
  let id = req?.query?.id;
  let test_id = req?.query?.test_id;
  let delete_id = req?.body?.delete_id;
  let put_id = req?.body?.put_id;

  await dbConnect();

  const session = await getServerSession(req, res, authOptions);

  switch (method) {
    case "GET":
      try {
        if (id && (id != "undefined" || id != null || id != "null")) {
          const singlePayment = await Payment.findOne({
            _id: new ObjectId(id),
          }).populate(["user", "test"]);

          return res.status(400).json({ success: true, data: singlePayment });
        } else if (
          test_id &&
          (test_id != "undefined" || test_id != null || test_id != "null")
        ) {
          const singlePaymentByTestId = await Payment.findOne({
            test_id: new ObjectId(test_id),
          }).populate(["user", "test"]);

          return res
            .status(400)
            .json({ success: true, data: singlePaymentByTestId });
        }

        const allRecords = await Payment.find().sort({ createdAt: -1 });
        return res.status(400).json({ success: true, data: allRecords });
      } catch (error) {
        return res.status(400).json({ success: true, message: error.message });
      }
      break;
    case "POST":
      try {
        let newRecord;
        newRecord = await Payment.create({
          ...req.body,
          user: session.user._id,
        });
        const updatedTest = await Test.findOneAndUpdate(
          { _id: new ObjectId(newRecord.test) },
          {
            status: "Awaiting Result",
            payment: new ObjectId(newRecord._id),
          },
          { new: true }
        ).populate([
          {
            path: "payment",
            populate: {
              path: "user",
            },
          },
        ]);

        return res.status(201).json({ success: true, data: updatedTest });
        // return res.status(201).json({ success: true });
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
          let updatePayment = await Payment.findOneAndUpdate(
            { _id: put_id },
            { title: req.body.title, paragraphs: req.body.paragraphs },
            {
              new: true,
            }
          );

          return res.status(400).json({ success: true, data: updatePayment });
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
          const deletePaymentResponse = await Payment.deleteOne({
            _id: delete_id,
          });
          if (deletePaymentResponse) {
            return res
              .status(400)
              .json({ success: true, data: deletePaymentResponse });
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
