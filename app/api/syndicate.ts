import { getTransactionReceipt } from '@/lib/utils'

const getTxReceipt = async (response: any) => {
    if (response.invalid) return 'invalid'

    if (response.transactionAttempts.length === 0) return 'pending'

    try {
        return response.transactionAttempts[0]?.hash
            ? await getTransactionReceipt(response.transactionAttempts[0]?.hash)
            : 'unkown error'
    } catch (err) {
        console.error(err)
        return response
    }
}

export const getTxReceiptFromSyndicateId = async (txId: string) => {
    // if we have a txId, get the tx status
    const options = { method: 'GET', headers: { Authorization: `Bearer ${process.env.SYNDICATE_API_KEY}` } }
    const txReceipt = await fetch(`https://api.syndicate.io/wallet/project/${process.env.SYNDICATE_PROJECT_ID}/request/${txId}`, options)
        .then(response => response.json())
        .then(response => getTxReceipt(response))
        .catch(err => console.error(err))
    return txReceipt
}