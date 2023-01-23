import { exec } from 'child_process'

export function run(cmd, options) {
  return new Promise((resolve, reject) => {
    exec(cmd, options, (error, stdout, stderr) => {
      if (error) return reject(error)
      resolve({stdout, stderr})
    })
  })
}