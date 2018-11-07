/*
  Description : aws-s3 연결 설정
*/
const multer = require('multer');
const multerS3 = require('multer-s3');
const aws = require('aws-sdk');
aws.config.loadFromPath('../config/aws_config.json');
const s3 = new aws.S3();

module.exports = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'hyunho9304',
        acl: 'public-read',
        key: function(req, file, callback) {
            callback(null, Date.now() + '.' + file.originalname.split('.').pop());
        }
    })
});
