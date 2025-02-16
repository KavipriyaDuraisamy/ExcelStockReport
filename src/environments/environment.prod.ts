var URLHOST = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port : '');

export const environment = {
  production: false,

  //Server URL
  SECRETKEY: 'RADIANTWORKFLOW',
  // ViewerURL: URLHOST+"/FreedomNeoApp/#/",
  // WebUploadURL: URLHOST+"/FreedomWebUploaderApp/#/",
  // APIURL: URLHOST+ "/Radiantworkflowapi/api/v1/",

  ViewerURL: URLHOST + "/FreedomNeoApp/#/",
  WebUploadURL: URLHOST +"/FreedomWebUploaderApp/#/",
  APIURL: URLHOST +"/Radiantworkflowapi/api/v1/",

  //Local URL
  // ViewerURL: "http://192.168.1.112:4200/#/",
  // WebUploadURL : "http://192.168.1.105:4200/#/",
  // APIURL: "http://192.168.1.112:7006/",
};
