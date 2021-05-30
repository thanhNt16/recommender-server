import Sequence from '../models/sequence'

export async function list({ limit, skip, customer }) {
    const total = await Sequence.countDocuments({ customer })
    const data = await Sequence.find({ customer }).limit(limit).skip(skip).populate('customer').lean()
    return {
        total,
        data
    }
}

export async function create(data) {
    const SequenceRecord = await Sequence.create({ ...data, customer: data.customerId})
    return await SequenceRecord.save()
}

export async function findById(id) {
    return await Sequence.findById(id)
}

export async function update(id, body) {
    return await Sequence.findOneAndUpdate(
        { _id: id },
        { ...body },
        { new: true, useFindAndModify: false },
      );
}

export async function deleteOne(id) {
    return await Sequence.deleteOne({ _id: id })
}