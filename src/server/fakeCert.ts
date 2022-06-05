// idea from servez
import { join } from 'path'
import { promises as fs } from 'fs'

const option = {
  algorithm: 'sha256',
  days: 30,
  keySize: 2048,
  extensions: [
    // {
    //   name: 'basicConstraints',
    //   cA: true,
    // },
    {
      name: 'keyUsage',
      keyCertSign: true,
      digitalSignature: true,
      nonRepudiation: true,
      keyEncipherment: true,
      dataEncipherment: true,
    },
    {
      name: 'extKeyUsage',
      serverAuth: true,
      clientAuth: true,
      codeSigning: true,
      timeStamping: true,
    },
    {
      name: 'subjectAltName',
      altNames: [
        {
          // type 2 is DNS
          type: 2,
          value: 'localhost',
        },
        {
          type: 2,
          value: 'localhost.localdomain',
        },
        {
          type: 2,
          value: 'lvh.me',
        },
        {
          type: 2,
          value: '*.lvh.me',
        },
        {
          type: 2,
          value: '[::1]',
        },
        {
          // type 7 is IP
          type: 7,
          ip: '127.0.0.1',
        },
        {
          type: 7,
          ip: 'fe80::1',
        },
      ],
    },
  ],
}

const dir = __dirname

async function getCertFile(filePath: string, limit: number) {
  try {
    const state = await fs.stat(filePath)
    const now = new Date().getTime()
    const fileCtime = state.ctime.getTime()
    const limitTime = limit * 1000 * 60 * 60 * 24 * 28
    if (now - fileCtime < limitTime) {
      const file = await fs.readFile(filePath, 'utf-8')
      return Promise.resolve(file)
    } else {
      return Promise.reject('overLimit')
    }
  } catch (err) {
    return Promise.reject('noFile')
  }
}

export async function getFakeCert() {
  const filePath = join(dir, 'fake-cert.pem')
  try {
    const file = await getCertFile(filePath, 28)
    return Promise.resolve(file)
  } catch (err) {
    try {
      const selfsigned = require('selfsigned')
      const pems = selfsigned.generate([{ name: 'commonName', value: 'localhost' }], option)
      const fakeCert = pems.private + pems.cert
      fs.writeFile(filePath, fakeCert)
      return Promise.resolve(fakeCert)
    } catch (err) {
      return Promise.reject(err)
    }
  }
}
