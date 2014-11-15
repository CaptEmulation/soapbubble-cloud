AWS = require 'aws-sdk'

AWS.config.loadFromPath './credentials.json'

s3 = new AWS.S3()

console.log 'Creating bucket'
s3.createBucket 
  Bucket: 'captemulation-node-test',
  (err) =>
    if err
      console.log err
    else
      console.log 'Putting object'
      params =
        Bucket: 'captemulation-node-test'
        Key: 'hello'
        Body: 'Hello Cloud!'

      s3.putObject params,
      (err, data) =>
        if err   
          console.log err
        else
          console.log "Successfully uploaded data to myBucket/myKey"
