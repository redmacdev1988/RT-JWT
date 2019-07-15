var b64Coder = require("./base64Coder");
var CryptoJS = require('crypto-js');
var SECRET_KEY = 'HOHOHO';

//crypto-js/hmac-sha256
function rtJWT() {
    this.b64Coder = b64Coder();
}

// PAYLOAD:DATA
const payload = `{"sub":"88665676680","name":"Ricky Tsao","iat":1516239022}`;
// const payload = `{"id":"12345678"}`;

rtJWT.prototype.sign = function(payload, secret) {
  const header = `{"alg":"HS256","typ":"JWT"}`;
  let encodedHeader = this.b64Coder.encode(header);
  let encodedPayload = this.b64Coder.encode(payload);
  let encodedMessage = encodedHeader + '.' + encodedPayload;
  var hash = CryptoJS.HmacSHA256(encodedMessage, secret); // hash is an object
  let token = encodedHeader + '.' + encodedPayload + '.' + hash;
  return token;
}

function removeHiddenAndSpecialChars(str) {
  str = str.replace(/\\n/g, "\\n")  
               .replace(/\\'/g, "\\'")
               .replace(/\\"/g, '\\"')
               .replace(/\\&/g, "\\&")
               .replace(/\\r/g, "\\r")
               .replace(/\\t/g, "\\t")
               .replace(/\\b/g, "\\b")
               .replace(/\\f/g, "\\f");
  // remove non-printable and other non-valid JSON chars
  str = str.replace(/[\u0000-\u0019]+/g,""); 
  return str;
}

rtJWT.prototype.verify = function(token, callback) {
  let base64Array = token.split('.');
  let encodedHeader = base64Array[0];
  let encodedPayload = base64Array[1];
  let signature = base64Array[2];
  let header = this.b64Coder.decode(encodedHeader);
  let obj = JSON.parse(header);
  if (obj.alg === 'HS256' && obj.typ === 'JWT') {
    let serverSignature = CryptoJS.HmacSHA256(encodedHeader + '.' + encodedPayload, SECRET_KEY).toString();
    if (serverSignature === signature) {
      let payload = this.b64Coder.decode(encodedPayload)
      let payloadObj = JSON.parse(removeHiddenAndSpecialChars(payload));
      callback(payloadObj, null);
    } else {
      callback(null, new Error('Sorry, signatures do not match.'));
    }
  }
  callback(null, new Error('Sorry, no support for hash ' + obj.alg + ', and/or ' + obj.typ));
}


let m = new rtJWT();
let token = m.sign(payload, SECRET_KEY);
m.verify(token, function(data, error) {
  if(!error) {
    console.log('payload received:');
    console.log(data);
  }
});