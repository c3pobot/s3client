'use strict'
const { S3Client, DeleteObjectCommand, ListObjectsV2Command, GetObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");
const s3 = new S3Client({
    endpoint: process.env.AWS_ENDPOINT, // e.g. https://eu2.contabostorage.com/bucketname
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.S3_REGION || 'US-central',
    forcePathStyle : true
});

module.exports.list = async(bucket, prefix)=>{
  try{
    if(!bucket) return
    let payload = { Bucket: bucket }
    if(prefix) payload.Prefix = prefix+'/'
    let command = new ListObjectsV2Command(payload)
    let obj = await s3.send(command)
    return obj?.Contents
  }catch(e){
    throw(e)
  }
}
module.exports.put = async(bucket, key, data)=>{
  try{
    if(!key || !data || !bucket) return
    let payload = { Key: key, Bucket: bucket, Body: data, CacheControl: "no-store, no-cache, max-age=0" }
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
    throw('Error uploading '+key+' to bucket '+bucket+'...')
  }
}
module.exports.get = async(bucket, key)=>{
  try{
    if(!key || !bucket) return
    let img, str, payload = { Key: key, Bucket: bucket}
    if(key.endsWith('.json')) payload.ResponseContentType = 'application/json'
    if(key.endsWith('.png')) payload.ResponseContentType = 'image/png'
    let command = new GetObjectCommand({ Key: key, Bucket: bucket})
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
    throw('Error getting key '+key+' from bucket '+bucket+'...')
  }
}
module.exports.delete = async(bucket, key)=>{
  try{
    if(!key || !bucket) return
    let payload = { Key: key, Bucket: bucket }
    let command = new DeleteObjectCommand(payload)
    let obj = await s3.send(command)
    console.log(obj)
  }catch(e){
    throw(e)
  }
}
