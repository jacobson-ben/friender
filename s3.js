require("dotenv").config();

const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;

var aws = require("aws-sdk");
var multer = require("multer");
var multerS3 = require("multer-s3");

aws.config.update({
  region,
  accessKeyId,
  secretAccessKey,
});

const s3 = new aws.S3();

//can add file, uuid

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: bucketName,
    acl: "public-read",
    key: function (req, file, cb) {
      cb(null, Date.now().toString());
    },
  }),
});

console.log(process.env);

exports.upload = upload;
