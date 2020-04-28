const fs = require('fs')
const path = require('path')
module.exports = (filePath, str) => {
    fs.appendFile(path.resolve(__dirname, filePath), str+'\n', (err) => {
        if (err) {
            console.log("Append to " + filePath + " Failed")
        } else {
        }
      })
    console.log(str)
}