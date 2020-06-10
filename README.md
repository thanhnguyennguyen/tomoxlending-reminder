# tomoxlending-reminder
TomoX is a decentralized exchange+lending protocol on core layer of TomoChain blockchain. Due to decentralization, there is no option like email, phone number ... to remind borrower about their loans when they are going to expire. This tool helps to watch a TOMO address and send an alert (required slack/telegram) if there is any imcoming liquidation on their account


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
 setup cronjob to run `node index.js` (once  per day/hour)
