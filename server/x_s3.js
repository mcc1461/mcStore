import aws from "aws-sdk";

const region = "eu-central-1";
const bucketName = "musco.store";
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

aws.config.update({
  region,
  accessKeyId,
  secretAccessKey,
  signatureVersion: "v4",
});

const s3 = new aws.S3();

export default s3;
