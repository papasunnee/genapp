import dbConnect from "@/lib/dbConnect";
import Access from "@/models/Access";
import User from "@/models/User";

export default async function handler(req, res) {
  const { method } = req;
  let id = req?.query?.id;
  let delete_id = req?.body?.delete_id;
  let put_id = req?.body?.put_id;

  const conn = await dbConnect();

  switch (method) {
    case "GET":
      try {
        if (id && (id != "undefined" || id != null || id != "null")) {
          const singleUser = await User.findOne({
            _id: id,
          });
          return res.status(400).json({ success: true, data: singleUser });
        }

        const allRecords = await User.find()
          .populate([{ path: "role" }])
          .sort({ createdAt: -1 });
        return res.status(400).json({ success: true, data: allRecords });
      } catch (error) {
        return res.status(400).json({ success: true, message: error.message });
      }
      break;
    case "POST":
      try {
        let password,
          userData = [],
          access;
        const session = await conn.startSession();
        const user = await session.withTransaction(async () => {
          userData = await User.create([{ ...req.body }], { session });
          password = "password";
          access = await Access.create([{ password, user: userData[0]._id }], {
            session,
          });

          return userData;
        });
        session.endSession();
        if (user.ok) {
          return res.status(201).json({ success: true, data: userData[0] });
        }
        throw new Error("Error Creating User");
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
          let updateUser = await User.findOneAndUpdate(
            { _id: put_id },
            { title: req.body.title, paragraphs: req.body.paragraphs },
            {
              new: true,
            }
          );

          return res.status(400).json({ success: true, data: updateUser });
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
          const deleteUserResponse = await User.deleteOne({
            _id: delete_id,
          });
          if (deleteUserResponse) {
            return res
              .status(400)
              .json({ success: true, data: deleteUserResponse });
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
