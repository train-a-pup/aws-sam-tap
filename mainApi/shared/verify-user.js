const axios = require("axios");

module.exports.verifyUser = async function verifyUser(token) {
  try {
    let googleResponse = await axios.get('https://www.googleapis.com/userinfo/v2/me', {headers: {
      Authorization: `Bearer ${token}`
    }})
    if (googleResponse?.error) {
      throw new Error("Error verifiying user")
    }
    return googleResponse.data
  } catch (error) {
    console.log("error verifiying user")
    return {Status: 400, data: JSON.stringify(error)}
  }
}