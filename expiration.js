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
    let expired = []


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
        }
    }
    if (expired.length > 0) {
        msg += "The following loans need to be repayed in " + process.env.NUMBER_OF_DAY_BEFORE_MATURITY_DATE + " day(s) \n" + expired.toString().split(",").join("\n")

    }

    if (msg != '') {
        notifySlack(msg, process.env.SLACK_HOOK_KEY, process.env.SLACK_CHANNEL, process.env.SLACK_BOTNAME, process.env.SLACK_BOT_ICON)
        notifyTelegram(msg, process.env.TELEGRAM_TOKEN, process.env.TELEGRAM_CHAT)
    }
}
main()

