const minio = require('minio');
console.log("minio", "1111", process.env.MINIO_DOMAIN);
console.log("minio", "1111", process.env.MINIO_API_PORT);
console.log("minio", "1111", process.env.MINIO_PROTOCOL);
console.log("minio", "1111", process.env.MINIO_ACCESS_KEY);
console.log("minio", "1111", process.env.MINIO_SECRET_KEY);
var minioClient = new minio.Client({
    endPoint: process.env.MINIO_DOMAIN,
    port: +(process.env.MINIO_API_PORT),
    useSSL: process.env.MINIO_PROTOCOL == 'https',
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY
});
console.log("minio", "2222");
export { minioClient }
