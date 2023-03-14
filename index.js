const express = require('express')
const bodyParser = require('body-parser')
const multer = require('multer')
const { v4: uuidv4 } = require('uuid');
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const {
  getSignedUrl,
} = require("@aws-sdk/s3-request-presigner");

const upload = multer() // for parsing multipart/form-data
const app = express()
const port = 3000
const accessKeyId = '';
const secretAccessKey = '';
const region = "";
const bucket = '';

app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

app.post('/profile', async (req, res, next) => {
  console.log('req.body: ', req.body)
	try {
		const {contentType} = req.body; 
		
		if(!contentType) {
			throw new Error('Missing contentType');
		}
	
		const filetype = contentType.split('/')[1];
		const fileName = `${uuidv4()}.${filetype}`;
		const s3Params = {
			Bucket: bucket,
			Key: fileName,
			ContentType: contentType,
		};
		const s3Client = new S3Client({
			credentials: {
				accessKeyId,
				secretAccessKey,
			},
			region,
			signatureVersion: 'v4'
		});
		const command = new PutObjectCommand(s3Params);

		const s3Url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
		res.json({
			fileName,
			s3Url,
		})
	} catch(ex) {
		console.log(ex);
		throw new Error('Internal Serve Error');
	}
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})