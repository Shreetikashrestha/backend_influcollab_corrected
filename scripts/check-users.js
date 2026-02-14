const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
});

const UserModel = mongoose.model('User', UserSchema);

async function checkUsers() {
    try {
        console.log('Connecting to MongoDB: ' + process.env.MONGODB_URI);
        await mongoose.connect(process.env.MONGODB_URI);
        const users = await UserModel.find({}, { email: 1 });
        console.log('\n--- Registered Users ---');
        users.forEach(u => console.log(u.email));
        console.log('------------------------\n');
        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkUsers();
