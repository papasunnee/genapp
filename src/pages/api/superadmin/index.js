import cookie from "cookie";
import mongoose from "mongoose";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import Access from "@/models/Access";

export default async function handler(req, res) {
  const { method } = req;
  //   let id = req?.query?.id;
  //   let delete_id = req?.body?.delete_id;
  //   let put_id = req?.body?.put_id;
  const conn = await dbConnect();

  switch (method) {
    // case "GET":
    //   try {
    //     if (id && (id != "undefined" || id != null || id != "null")) {
    //       const singleNews = await LatestNews.findOne({
    //         _id: id,
    //       });
    //       return res.status(400).json({ success: true, data: singleNews });
    //     }

    //     const allRecords = await LatestNews.find().sort({ createdAt: -1 });
    //     return res.status(400).json({ success: true, data: allRecords });
    //   } catch (error) {
    //     return res.status(400).json({ success: true, message: error.message });
    //   }
    //   break;
    case "POST":
      try {
        let password;
        const session = await conn.startSession();
        const user = await session.withTransaction(async () => {
          password = req.body.password;
          delete req.body.password;
          const userData = await User.create({ ...req.body }, { session });

          const access = await Access.create(
            { password, user: userData },
            { session }
          );
          console.log({ access });

          return { userData, access };
        });
        session.endSession();

        return res.status(201).json({ success: true, data: user.userData });
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
          let updateLatestNews = await LatestNews.findOneAndUpdate(
            { _id: put_id },
            { title: req.body.title, paragraphs: req.body.paragraphs },
            {
              new: true,
            }
          );

          return res
            .status(400)
            .json({ success: true, data: updateLatestNews });
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
          const deleteLatestNewsResponse = await LatestNews.deleteOne({
            _id: delete_id,
          });
          if (deleteLatestNewsResponse) {
            return res
              .status(400)
              .json({ success: true, data: deleteLatestNewsResponse });
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
