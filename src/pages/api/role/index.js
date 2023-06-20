import cookie from "cookie";
import mongoose from "mongoose";
import { getServerSession } from "next-auth/next";
import dbConnect from "@/lib/dbConnect";
import Role from "@/models/Role";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  const { method } = req;
  let id = req?.query?.id;
  let delete_id = req?.body?.delete_id;
  let put_id = req?.body?.put_id;
  await dbConnect();
  const session = await getServerSession(req, res, authOptions);

  switch (method) {
    case "GET":
      try {
        if (id && (id != "undefined" || id != null || id != "null")) {
          const singleRole = await Role.findOne({
            _id: id,
          });
          return res.status(400).json({ success: true, data: singleRole });
        }
        const roleWeight = session?.user?.role?.weight;
        let filter = {
          status: { $ne: "Disabled" },
          weight: { $gte: roleWeight },
        };
        if (roleWeight == 200) {
          filter = {
            status: { $ne: "Disabled" },
            weight: { $gte: 200 },
          };
        } else if (roleWeight == 500) {
          filter = {
            status: { $ne: "Disabled" },
            weight: { $gt: 200 },
          };
        }

        const allRecords = await Role.find(filter).sort({
          createdAt: -1,
        });
        return res.status(400).json({ success: true, data: allRecords });
      } catch (error) {
        return res.status(400).json({ success: true, message: error.message });
      }
      break;
    case "POST":
      try {
        let newRecord;
        newRecord = await Role.create({
          ...req.body,
        });

        return res.status(201).json({ success: true, data: newRecord });
      } catch (error) {
        return res.status(400).json({ success: false, error: error.message });
      }
    case "PUT":
      try {
        if (
          put_id &&
          (put_id != "undefined" || put_id != null || put_id != "null")
        ) {
          delete req.body._id;
          let updateRole = await Role.findOneAndUpdate(
            { _id: put_id },
            { title: req.body.title, paragraphs: req.body.paragraphs },
            {
              new: true,
            }
          );

          return res.status(400).json({ success: true, data: updateRole });
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
          const deleteRoleResponse = await Role.deleteOne({
            _id: delete_id,
          });
          if (deleteRoleResponse) {
            return res
              .status(400)
              .json({ success: true, data: deleteRoleResponse });
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
