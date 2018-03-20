import {encode} from 'nilavu/helpers/webtoolkit-base64';
import {b64_hmac_sha1} from 'nilavu/helpers/sha1';
export function generateSignature(obj) {
    const policy_sign = {
        "expiration": calculateExpiryDate(),
        "conditions": [{
                "bucket": obj.bucketName
            }, {
                "acl": obj.acl
            },
            ["eq", "$key", obj.name],
            ["eq", "$Content-Type", obj.contentType],
        ]
    };
    var policy = encode(JSON.stringify(policy_sign));
    var signature = b64_hmac_sha1(obj.secret_access_key, policy);
    return {"policy": policy, "signature": signature};
}

function calculateExpiryDate() {
  var date = new Date();
  date.setHours ( date.getHours() + 2 );
  return date.toISOString();
}
