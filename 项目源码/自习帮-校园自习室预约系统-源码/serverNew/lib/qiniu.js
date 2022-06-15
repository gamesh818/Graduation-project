let qiniu = require('qiniu')

module.exports.getQiNiuToken = function () {
    var accessKey = 'TI9byCm4uly-q3wFMi6kldpPKyp60-dN4Zbe8mYI';
    var secretKey = '4pA_-qUvzjsmssrKMii9c6D_kNGs7zjYAQgYnYoO';
    var mac = new qiniu.auth.digest.Mac(accessKey, secretKey);

    var options = {
        scope: "helpschool2",
        // callbackUrl: 'http://p6tfuzc6r.bkt.clouddn.com/${key}',
        // callbackBody: 'key=$(key)&hash=$(etag)&bucket=$(bucket)&fsize=$(fsize)&name=$(x:name)'
    };
    var config = new qiniu.conf.Config();
    // 空间对应的机房
    config.zone = qiniu.zone.Zone_z2;

    var putPolicy = new qiniu.rs.PutPolicy(options);
    var uploadToken = putPolicy.uploadToken(mac);
    return uploadToken;
}



