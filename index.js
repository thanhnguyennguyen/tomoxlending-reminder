const path = require('path')
require('dotenv').config({
    path: path.resolve(__dirname, './.env')
})
const noti_bot = require('noti_bot')
const notifyTelegram = noti_bot.telegram
const notifySlack = noti_bot.slack
const getJSON = require('get-json')
const axios = require('axios')


const main = async () => {
    let msg = ""
    let expired = [],
        liquidated = []


    let tomoxPrice = {}

    let addresses = process.env.TOMO_ADDRESS.split(',')
    for (let address of addresses) {
        let trades
        await getJSON(process.env.TOMOSCAN_API + '/lending/trades?status=OPEN&user=' + address, function(error, response) {
            trades = response.items
        })
        if (trades == undefined || trades.length == 0) {
            continue
        }
        for (let trade of trades) {
            if (trade == undefined || trade.liquidationTime == undefined || trade.hash == undefined || trade.borrower != address) {
                continue
            }
            let now = Date.now()
            if (now + 86400 * parseInt(process.env.NUMBER_OF_DAY_BEFORE_MATURITY_DATE) >= parseInt(trade.liquidationTime)) {
                expired.push("https://scan.tomochain.com/lending/trades/" + trade.hash)
            }
            let currentPrice = tomoxPrice[trade.collateralToken + trade.lendToken]
            if (currentPrice == undefined) {
                // check epoch price
                let params = {
                    jsonrpc: '2.0',
                    method: 'tomox_getLastEpochPrice',
                    params: [trade.collateralToken, trade.lendToken],
                    id: 1
                }
                let res = await axios.post(process.env.TOMO_RPC, params)
                currentPrice = parseInt(res.data.result)
                tomoxPrice[trade.collateralToken + trade.lendToken] = currentPrice
            }
            if (currentPrice <= (1 + parseFloat(process.env.PRICE_THRESHOLD_PERCENTAGE) / 100) * parseInt(trade.liquidationPrice)) {
                liquidated.push("https://scan.tomochain.com/lending/trades/" + trade.hash)
            }
        }
    }
    if (expired.length > 0) {
        msg += "The following loans need to be repayed in " + process.env.NUMBER_OF_DAY_BEFORE_MATURITY_DATE + " day(s) \n" + expired.toString()

    }
    if (liquidated.length > 0) {
        msg += "The following loans may be liquidated in the next epoch. Please topup as soon as possible \n" + liquidated.toString()
    }

    if (msg != '') {
        msg = "The following loans need to be repayed in " + process.env.NUMBER_OF_DAY_BEFORE_MATURITY_DATE + " day(s)" + msg
        notifySlack(msg, process.env.SLACK_HOOK_KEY, process.env.SLACK_CHANNEL, process.env.SLACK_BOTNAME, process.env.SLACK_BOT_ICON)
        notifyTelegram(msg, process.env.TELEGRAM_TOKEN, process.env.TELEGRAM_CHAT)
    }
}
main()