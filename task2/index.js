const express = require("express");
const app = express();
require("dotenv").config();
const PORT = process.env.PORT || 5000;
app.use(express.json());

const dbConnect = require("./lib/db");
const AwsUser = require("./model/aws.user.model");

const {
  S3Client,
  ListObjectsV2Command,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");

app.post("/aws-user/new", async (req, res) => {
  try {
    const { name, email, imageUrl } = req.body;
    const existingUser = await AwsUser.find({ name: name, email: email });
    if (existingUser.length === 0) {
      const newUser = new AwsUser({
        name: name,
        email: email,
        imageUrl: imageUrl,
      });
      await newUser.save();
      res.status(200).json({ messsage: "Aws user successfully added." });
    } else {
      res.status(400).json({ messsage: "User already existed." });
    }
  } catch (err) {
    res.status(400).json({ messsage: "Aws user failed to add.", error: err });
  }
});

async function removeObsolateImagesS3() {
  try {
    const s3 = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY,
      },
    });

    const AWSURI = `https://${process.env.AWS_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/`;

    const Allusers = await AwsUser.find();
    const usedImageURLs = Allusers.map((user) => user.imageUrl);

    const s3Objects = await s3.send(
      new ListObjectsV2Command({
        Bucket: process.env.AWS_BUCKET,
        Prefix: "profile/",
      })
    );
    const s3ImageURLs = s3Objects.Contents.map(
      (object) => `${AWSURI}${object.Key}`
    );

    // console.log("S3images:", s3ImageURLs);
    const AWS_URI_WITH_PATH = AWSURI + "profile/";

    const obsoleteImages = s3ImageURLs.filter(
      (url) => !usedImageURLs.includes(url) && AWS_URI_WITH_PATH != url
    );

    // console.log("obsolate images:", obsoleteImages);

    if (obsoleteImages.length > 0) {
      for (const obsoleteImage of obsoleteImages) {
        const key = obsoleteImage.replace(AWSURI, "");
        await s3.send(
          new DeleteObjectCommand({
            Bucket: process.env.AWS_BUCKET,
            Key: key,
          })
        );
        console.log(`Deleted obsolete image: ${obsoleteImage}`);
      }

      console.log("Task completed successfully!");
    } else {
      console.log("There is no obsolate image in the bucket!");
    }
  } catch (error) {
    console.error(error);
  }
}

removeObsolateImagesS3();

app.listen(PORT, () => {
  dbConnect();
  console.log("Server Online... Port:", PORT);
});
