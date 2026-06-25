import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db("media_monitoring"); 

    const data = await db
      .collection("evolusi_isu") 
      .find({})
      .sort({ Time: 1 })
      .toArray();

    res.status(200).json({ success: true, data });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, error: e.message });
  }
}