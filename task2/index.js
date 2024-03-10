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
      res.status(200).json({ message: "Aws user successfully added." });
    } else {
      res.status(400).json({ message: "User already existed." });
    }
  } catch (err) {
    res.status(400).json({ message: "Aws user failed to add.", error: err });
  }
});

async function removeObsolateImagesS3() {
  try {
    // create a new AWS S3 client instance with configuration
    const s3 = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY,
      },
    });

    // creating the main URL using bucket name and region
    const AWSURI = `https://${process.env.AWS_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/`;

    // Finding all the AWS-Users and filtering all imageUrl in an array
    const Allusers = await AwsUser.find();
    const usedImageURLs = Allusers.map((user) => user.imageUrl);

    // Get List Of Objects from the bucket from "profile" folder
    const s3Objects = await s3.send(
      new ListObjectsV2Command({
        Bucket: process.env.AWS_BUCKET,
        Prefix: "profile/",
      })
    );

    // building the image URL by object keys and AWSURI value
    const s3ImageURLs = s3Objects.Contents.map(
      (object) => `${AWSURI}${object.Key}`
    );

    /* creating a URL using AWSURI and path name since the ListObjectsV2Command 
    returns the original pathname along with object names for that reason we need 
    to filter it out since if it exist we can delete the folder since the folder 
    name is not in mongodb but its containing objects. */
    const AWS_URI_WITH_PATH = AWSURI + "profile/";

    const obsoleteImages = s3ImageURLs.filter(
      (url) => !usedImageURLs.includes(url) && AWS_URI_WITH_PATH != url
    );

    /* After filtering if there is any object left that is not being used for any profile image */
    if (obsoleteImages.length > 0) {
      /* Then loop through all the unused images and remove its AWSURI to get 
      the key and delete the unused object using that key*/
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
