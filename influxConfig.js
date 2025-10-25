// influxConfig.js
import { InfluxDB, Point } from '@influxdata/influxdb-client'

export const config = {
  //url: "http://172.16.62.247:8086", //uni
  //url: 'http://localhost:8086',// locale
  //url:"http://
  url:"http://192.168.1.39:8086", //casa
  token: "kDQ3hbRH1WX-7sBwdD5MTRbi3Mr4lrmDeiGT-7GdzuIiNyeHZGQ1rEvG2yKFH972nYwU6zsxT5-Hjt_gO63f8Q==",
  org: "4e10ce55d8d7d9d5",
  bucket: "datisensori"
}

export const client = new InfluxDB({ url: config.url, token: config.token })
export const queryApi = client.getQueryApi(config.org)
export const writeApi = client.getWriteApi(config.org, config.bucket)
