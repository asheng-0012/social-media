import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
    reporter: { type: String, ref: 'User', required: true },
    reportedUser: { type: String, ref: 'User', required: true },
    reason: { type: String, required: true },
    status: { type: String, default: 'pending' },
}, { timestamps: true });

const Report = mongoose.model('Report', reportSchema);

export default Report;
