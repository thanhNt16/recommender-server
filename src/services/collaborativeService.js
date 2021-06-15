import Collaborative from '../models/collaborative'

export async function list({ limit, skip, customer }) {
    const total = await Collaborative.countDocuments({ customer })
    const data = await Collaborative.find({ customer }).limit(limit).skip(skip).populate('customer').lean()
    return {
        total,
        data
    }
}
export async function countByItemId({ customer }) {
    const aggregatorOpts = [
        {"$match": { customer }},
        {"$group" : {_id:"$itemId", totalImpression: { '$sum': "$feedBack" }}},
    ]
    const data = await Collaborative.aggregate(aggregatorOpts).exec()
    return data
}

export async function create(data) {
    const CollaborativeRecord = await Collaborative.create(data)
    return await CollaborativeRecord.save()
}

export async function findById(id) {
    return await Collaborative.findById(id)
}

export async function update(id, body) {
    return await Collaborative.findOneAndUpdate(
        { _id: id },
        { ...body },
        { new: true, useFindAndModify: false },
      );
}

export async function deleteOne(id) {
    return await Collaborative.deleteOne({ _id: id })
}