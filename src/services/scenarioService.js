import Scenario from '../models/scenario'
import Page from '../models/page'

export async function createScenario(payload) {
    const { name, page, customerid } = payload
    const scenario = await Scenario.create({
        name,
        page,
        customer: customerid
    })
    return scenario
}
