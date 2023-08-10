const minio = require('minio');

var minioClient = new minio.Client({
    endPoint: process.env.MINIO_DOMAIN,
    port: +(process.env.MINIO_API_PORT),
    useSSL: process.env.MINIO_PROTOCOL == 'https',
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY
});

export { minioClient }
