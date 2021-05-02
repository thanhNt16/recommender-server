import Scenario from '../models/scenario'
import Page from '../models/page'

export async function createPage(payload) {
    const { name, algorithm, customerid } = payload
    const scenario = await Page.create({
        name,
        algorithm,
        customer: customerid
    })
    return scenario
}
