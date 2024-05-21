const User = require('../../mongodb/models/user')

const createUser = async (profile,session) => {
  try {
    const { displayName, emails, photos, id } = profile;

    // Check if the user already exists with the same email
    const existingUser = await User.findOne({ email: emails[0].value }).session(session);

    if (existingUser) {
      // Check the authentication type of the existing user
      if (existingUser.authType === "regular") {
        // If the user exists and has authentication type regular, merge profiles
        existingUser.name = displayName;
        existingUser.googleId = id;
        existingUser.avatar = photos[0].value;
        await existingUser.save({session});
        console.log("Merged profiles");
        return existingUser;
      } else if (existingUser.authType === "google") {
        // If the existing user has authentication type google, simply return the user
        console.log("User exists already with Google authentication");
        return existingUser;
      }
      else {
        // Handle the case where the existing user has a different authentication type
        console.error("Authentication Error: Use another authentication type");
        // Log or return an appropriate response based on your requirements
        throw new Error("Use another authentication type");
      }
    }
    else{
    // If the user doesn't exist, create a new user
    const newUser = await User.create([{
      name: displayName,
      email: emails[0].value,
      avatar: photos[0].value,
      googleId: id,
      allProperties: [],
      authType: "google",
    }],{session})
    console.log("New User created");
    return newUser;
  }
  } catch (error) {
    throw error;
  }

}
module.exports = createUser;