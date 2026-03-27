const User = require('../modules/user/user.model');

class UserRepository {
    async createUser(userData) {
        return await User.create(userData);
    }

    async findByEmail(email) {
        return await User.findOne({ email, isDeleted: false });
    }

    async findByUsername(username) {
        return await User.findOne({ username, isDeleted: false });
    }

    async findById(id) {
        return await User.findById(id).where({ isDeleted: false });
    }

    async updateById(id, updateData) {
        return await User.findByIdAndUpdate(id, updateData, { new: true });
    }

    async softDelete(id) {
        return await User.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
    }

    async findOne(query) {
        return await User.findOne({ ...query, isDeleted: false });
    }

    async searchUsers(query, excludeUserId) {
        const searchRegex = new RegExp(query, 'i');
        return await User.find({
            $and: [
                { _id: { $ne: excludeUserId } },
                { isDeleted: false },
                {
                    $or: [
                        { firstName: searchRegex },
                        { lastName: searchRegex },
                        { username: searchRegex }
                    ]
                }
            ]
        }).select('username firstName lastName profileImages')
          .limit(20);
    }
}

module.exports = new UserRepository();
