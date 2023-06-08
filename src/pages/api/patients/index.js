import mongoose, { Types } from "mongoose";
import dbConnect from "@/lib/dbConnect";
import Patient from "@/models/Patient";

export default async function handler(req, res) {
  const { ObjectId } = Types;
  const { method } = req;
  let id = req?.query?.id;
  let delete_id = req?.body?.delete_id;
  let put_id = req?.body?.put_id;

  await dbConnect();

  switch (method) {
    case "GET":
      try {
        if (id && (id != "undefined" || id != null || id != "null")) {
          const singlePatient = await Patient.findOne({
            _id: new ObjectId(id),
          }).populate([
            {
              path: "tests",
              options: { sort: { createdAt: -1 } },
              populate: {
                path: "payment",
                populate: {
                  path: "user",
                },
              },
            },
          ]);
          return res.status(400).json({ success: true, data: singlePatient });
        }

        const allRecords = await Patient.find().sort({ createdAt: -1 });
        return res.status(400).json({ success: true, data: allRecords });
      } catch (error) {
        return res.status(400).json({ success: true, message: error.message });
      }
      break;
    case "POST":
      try {
        let newRecord;
        newRecord = await Patient.create({
          ...req.body,
        });
        return res.status(201).json({ success: true, data: newRecord });
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
          let updatePatient = await Patient.findOneAndUpdate(
            { _id: put_id },
            { title: req.body.title, paragraphs: req.body.paragraphs },
            {
              new: true,
            }
          );

          return res.status(400).json({ success: true, data: updatePatient });
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
          const deletePatientResponse = await Patient.deleteOne({
            _id: delete_id,
          });
          if (deletePatientResponse) {
            return res
              .status(400)
              .json({ success: true, data: deletePatientResponse });
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
