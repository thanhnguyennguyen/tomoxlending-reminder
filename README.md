# tomoxlending-reminder
TomoX is a decentralized exchange+lending protocol on core layer of TomoChain blockchain. Due to decentralization, there is no option like email, phone number ... to remind borrower about their loans when they are going to expire / be liquidated. This tool helps to watch TOMO addresses and send an alert (required slack/telegram) if there is any imcoming liquidation on their account
 
**Who should use this tool ?**
- The borrower which borrows asset in TomoX P2P Lending system

 **When you receive notification ?**
 - Your loan expires in 1 day / 7 days (depend on your configuration)
 - Your loan may be liquidated in next epoch(30 minutes)

## Install
```
npm install
```

## Configuration
```
cp .env.sample .env
```
edit .env file


## Usage
 setup cronjob 
```
# check expired loans once per day at 00:00
0 0 * * * node expiration.js

# check loans may be liquidated by price movement every 30 minutes
*/30 * * * * node liquidation.js
```
