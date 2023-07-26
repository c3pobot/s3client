'use strict'
const S3_BUCKET = process.env.S3_BUCKET
const { S3Client, ListObjectsV2Command, GetObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");
const s3 = new S3Client({
    endpoint: process.env.AWS_ENDPOINT, // e.g. https://eu2.contabostorage.com/bucketname
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.S3_REGION || 'US-central',
    forcePathStyle : true
});

module.exports.list = async(prefix, bucket)=>{
  try{
    if(!key || !data || (bucket && S3_BUCKET)) return
    let payload = { Bucket: bucket || S3_BUCKET }
    if(prefix) payload.Prefix = prefix+'/'
    let command = new ListObjectsV2Command(payload)
    let obj = await s3.send(command)
    return obj?.Contents
  }catch(e){
    throw(e)
  }
}
module.exports.put = async(key, data, bucket)=>{
  try{
    if(!key || !data || (bucket && S3_BUCKET)) return
    let payload = { Key: key, Bucket: bucket || S3_BUCKET, Body: data }
    if(key.endsWith('.json')){
      payload.Body = JSON.stringify(data)
      payload.ContentType = 'application/json'
    }
    if(key.endsWith('.png')){
      payload.Body = Buffer.from(payload.Body, 'base64')
      payload.ContentType = 'image/png'
    }
    let command = new PutObjectCommand(payload)
    let obj = await s3.send(command)
    if(obj?.ETag) return true
  }catch(e){
    throw('Error uploading '+key+' to bucket '+(bucket || S3_BUCKET)+'...')
  }
}
module.exports.get = async(key, bucket)=>{
  try{
    if(!key || (bucket && S3_BUCKET)) return
    let img, str
    let command = new GetObjectCommand({ Key: key, Bucket: bucket || S3_BUCKET})
    let obj = await s3.send(command)
    if(obj?.Body){
      if(key.endsWith('.json')){
        let str = await obj.Body.transformToString()
        return JSON.parse(str)
      }
      let img = await obj.Body.transformToByteArray()
      return (new Buffer.from(img))
    }
  }catch(e){
    throw('Error getting key '+key+' from bucket '+(bucket || S3_BUCKET)+'...')
  }
}
