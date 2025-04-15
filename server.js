const express = require('express');
const yahooFinance = require('yahoo-finance2').default;
const WebSocket = require('ws');
const http = require('http');
const path = require('path');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

const indices = [
  { name: 'NIFTY 50', symbol: '^NSEI' },
  { name: 'BSE SENSEX', symbol: '^BSESN' },
  { name: 'NIFTY BANK', symbol: '^NSEBANK' },
  { name: 'NIFTY MIDCAP 50', symbol: '^NSEMDCP50' },
];

const topStocks = [
  { name: 'Reliance Industries', symbol: 'RELIANCE.NS' },
  { name: 'Tata Consultancy Services', symbol: 'TCS.NS' },
  { name: 'HDFC Bank', symbol: 'HDFCBANK.NS' },
  { name: 'Infosys', symbol: 'INFY.NS' },
  { name: 'ICICI Bank', symbol: 'ICICIBANK.NS' },
  { name: 'Hindustan Unilever', symbol: 'HINDUNILVR.NS' },
  { name: 'Bharti Airtel', symbol: 'BHARTIARTL.NS' },
  { name: 'State Bank of India', symbol: 'SBIN.NS' },
  { name: 'Bajaj Finance', symbol: 'BAJFINANCE.NS' },
  { name: 'Kotak Mahindra Bank', symbol: 'KOTAKBANK.NS' },
  { name: 'Asian Paints', symbol: 'ASIANPAINT.NS' },
  { name: 'Axis Bank', symbol: 'AXISBANK.NS' },
  { name: 'Maruti Suzuki', symbol: 'MARUTI.NS' },
  { name: 'Larsen & Toubro', symbol: 'LT.NS' },
  { name: 'ITC Limited', symbol: 'ITC.NS' },
  { name: 'Tata Motors', symbol: 'TATAMOTORS.NS' },
  { name: 'Sun Pharmaceutical', symbol: 'SUNPHARMA.NS' },
  { name: 'Mahindra & Mahindra', symbol: 'M&M.NS' },
  { name: 'HCL Technologies', symbol: 'HCLTECH.NS' },
  { name: 'Nestle India', symbol: 'NESTLEIND.NS' },
  { name: 'Power Grid Corporation', symbol: 'POWERGRID.NS' },
  { name: 'Titan Company', symbol: 'TITAN.NS' },
  { name: 'Adani Enterprises', symbol: 'ADANIENT.NS' },
  { name: 'UltraTech Cement', symbol: 'ULTRACEMCO.NS' },
  { name: 'Wipro', symbol: 'WIPRO.NS' },
  { name: 'Cipla', symbol: 'CIPLA.NS' },
  { name: 'Dr. Reddy’s Laboratories', symbol: 'DRREDDY.NS' },
  { name: 'Eicher Motors', symbol: 'EICHERMOT.NS' },
  { name: 'Grasim Industries', symbol: 'GRASIM.NS' },
  { name: 'Tech Mahindra', symbol: 'TECHM.NS' },
  { name: 'Hindustan Copper', symbol: 'HINDCOPPER.NS' },
  { name: 'National Aluminium', symbol: 'NATIONALUM.NS' },
  { name: 'Vedanta', symbol: 'VEDL.NS' },
  { name: 'Adani Ports', symbol: 'ADANIPORTS.NS' },
  { name: 'NTPC', symbol: 'NTPC.NS' },
  { name: 'Mazagon Dock', symbol: 'MAZDOCK.NS' },
  { name: 'Thermax', symbol: 'THERMAX.NS' },
  { name: 'Hindalco', symbol: 'HINDALCO.NS' },
  { name: 'NMDC', symbol: 'NMDC.NS' },
  { name: 'ONGC', symbol: 'ONGC.NS' },
  { name: 'Sterling and Wilson', symbol: 'SWSOLAR.NS' },
  { name: 'Bajaj Auto', symbol: 'BAJAJ-AUTO.NS' },
  { name: 'Bharat Petroleum', symbol: 'BPCL.NS' },
  { name: 'Coal India', symbol: 'COALINDIA.NS' },
  { name: 'Divi’s Laboratories', symbol: 'DIVISLAB.NS' },
  { name: 'Havells India', symbol: 'HAVELLS.NS' },
  { name: 'Hero MotoCorp', symbol: 'HEROMOTOCO.NS' },
  { name: 'Indian Oil Corporation', symbol: 'IOC.NS' },
  { name: 'JSW Steel', symbol: 'JSWSTEEL.NS' },
  { name: 'Shree Cement', symbol: 'SHREECEM.NS' },
  { name: 'Tata Steel', symbol: 'TATASTEEL.NS' },
  { name: 'UPL Limited', symbol: 'UPL.NS' },
  { name: 'Aurobindo Pharma', symbol: 'AUROPHARMA.NS' },
  { name: 'Bandhan Bank', symbol: 'BANDHANBNK.NS' },
  { name: 'Berger Paints', symbol: 'BERGEPAINT.NS' },
  { name: 'Biocon', symbol: 'BIOCON.NS' },
  { name: 'Bosch', symbol: 'BOSCHLTD.NS' },
  { name: 'Canara Bank', symbol: 'CANBK.NS' },
  { name: 'Colgate-Palmolive', symbol: 'COLPAL.NS' },
  { name: 'DLF', symbol: 'DLF.NS' },
  { name: 'GAIL India', symbol: 'GAIL.NS' },
  { name: 'Godrej Consumer', symbol: 'GODREJCP.NS' },
  { name: 'HDFC Life Insurance', symbol: 'HDFCLIFE.NS' },
  { name: 'IndusInd Bank', symbol: 'INDUSINDBK.NS' },
  { name: 'Jindal Steel', symbol: 'JINDALSTEL.NS' },
  { name: 'LIC Housing Finance', symbol: 'LICHSGFIN.NS' },
  { name: 'Lupin', symbol: 'LUPIN.NS' },
  { name: 'MRF', symbol: 'MRF.NS' },
  { name: 'Motherson Sumi', symbol: 'MOTHERSON.NS' },
  { name: 'Pidilite Industries', symbol: 'PIDILITIND.NS' },
  { name: 'Punjab National Bank', symbol: 'PNB.NS' },
  { name: 'SBI Life Insurance', symbol: 'SBILIFE.NS' },
  { name: 'Siemens', symbol: 'SIEMENS.NS' },
  { name: 'Tata Power', symbol: 'TATAPOWER.NS' },
  { name: 'Torrent Pharma', symbol: 'TORNTPHARM.NS' },
  { name: 'United Spirits', symbol: 'MCDOWELL-N.NS' },
  { name: 'Zee Entertainment', symbol: 'ZEEL.NS' },
  { name: 'ACC', symbol: 'ACC.NS' },
  { name: 'Ambuja Cements', symbol: 'AMBUJACEM.NS' },
  { name: 'Ashok Leyland', symbol: 'ASHOKLEY.NS' },
  { name: 'Bank of Baroda', symbol: 'BANKBARODA.NS' },
  { name: 'Bharat Electronics', symbol: 'BEL.NS' },
  { name: 'Britannia Industries', symbol: 'BRITANNIA.NS' },
  { name: 'Container Corp', symbol: 'CONCOR.NS' },
  { name: 'Dabur India', symbol: 'DABUR.NS' },
  { name: 'Federal Bank', symbol: 'FEDERALBNK.NS' },
  { name: 'GMR Infrastructure', symbol: 'GMRINFRA.NS' },
  { name: 'HINDPETRO', symbol: 'HINDPETRO.NS' },
  { name: 'IDFC First Bank', symbol: 'IDFCFIRSTB.NS' },
  { name: 'Indraprastha Gas', symbol: 'IGL.NS' },
  { name: 'L&T Finance Holdings', symbol: 'L&TFH.NS' },
  { name: 'Manappuram Finance', symbol: 'MANAPPURAM.NS' },
  { name: 'Piramal Enterprises', symbol: 'PEL.NS' },
  { name: 'RBL Bank', symbol: 'RBLBANK.NS' },
  { name: 'Shriram Transport', symbol: 'SRTRANSFIN.NS' },
  { name: 'TVS Motor', symbol: 'TVSMOTOR.NS' },
  { name: 'Voltas', symbol: 'VOLTAS.NS' },
];

let currentSearchResult = null;
let lastIndicesData = null;
let lastStocksData = null;
let lastLosersData = null;

async function fetchData(items) {
  const data = [];
  for (const item of items) {
    try {
      const quote = await yahooFinance.quote(item.symbol);
      const currentPrice = quote.regularMarketPrice || 'N/A';
      const lastClose = quote.regularMarketPreviousClose || 'N/A';
      const volume = quote.regularMarketVolume || 'N/A'; // Add volume
      const fiftyTwoWeekHigh = quote.fiftyTwoWeekHigh || 'N/A';
      let percentChange = 'N/A';
      let percentDrop = 'N/A';
      if (currentPrice !== 'N/A' && lastClose !== 'N/A' && lastClose !== 0) {
        percentChange = ((currentPrice - lastClose) / lastClose) * 100;
      }
      if (currentPrice !== 'N/A' && fiftyTwoWeekHigh !== 'N/A' && fiftyTwoWeekHigh !== 0) {
        percentDrop = ((fiftyTwoWeekHigh - currentPrice) / fiftyTwoWeekHigh) * 100;
      }
      data.push({
        name: item.name,
        symbol: item.symbol,
        price: currentPrice,
        lastClose: lastClose,
        volume: volume, // Include volume
        percentChange: percentChange,
        fiftyTwoWeekHigh: fiftyTwoWeekHigh,
        percentDrop: percentDrop
      });
    } catch (error) {
      console.error(`Error fetching ${item.name} (${item.symbol}):`, error.message);
      data.push({
        name: item.name,
        symbol: item.symbol,
        price: 'N/A',
        lastClose: 'N/A',
        volume: 'N/A', // Default volume
        percentChange: 'N/A',
        fiftyTwoWeekHigh: 'N/A',
        percentDrop: 'N/A'
      });
    }
  }
  return data;
}

async function fetchLosers(stocksData) {
  const losers = stocksData
    .filter(stock => stock.percentDrop !== 'N/A' && stock.percentDrop >= 30)
    .sort((a, b) => b.percentDrop - a.percentDrop)
    .slice(0, 30);
  return losers.map(stock => ({
    name: stock.name,
    symbol: stock.symbol,
    price: stock.price,
    volume: stock.volume, // Include volume
    percentDrop: stock.percentDrop
  }));
}

async function searchStock(query) {
  try {
    const searchResults = await yahooFinance.search(query);
    const stock = searchResults.quotes.find(
      (result) => result.isYahooFinance && result.quoteType === 'EQUITY'
    );
    if (!stock) {
      return { error: 'No stock found matching your query' };
    }

    const quote = await yahooFinance.quote(stock.symbol);
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(endDate.getMonth() - 1);
    const historical = await yahooFinance.historical(stock.symbol, {
      period1: startDate,
      period2: endDate,
      interval: '1d'
    });

    return {
      name: stock.shortname || stock.longname || 'Unknown',
      symbol: stock.symbol,
      price: quote.regularMarketPrice || 'N/A',
      volume: quote.regularMarketVolume || 'N/A', // Add volume
      currency: quote.currency || 'Unknown',
      historicalData: historical.map(data => ({
        date: data.date,
        open: data.open,
        high: data.high,
        low: data.low,
        close: data.close,
        volume: data.volume // Include historical volume
      }))
    };
  } catch (error) {
    console.error(`Error searching for "${query}":`, error.message);
    return { error: `Error fetching stock data: ${error.message}` };
  }
}

async function fetchHistoricalData(symbol, name) {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(endDate.getMonth() - 1);
    const historical = await yahooFinance.historical(symbol, {
      period1: startDate,
      period2: endDate,
      interval: '1d'
    });
    const quote = await yahooFinance.quote(symbol);
    return {
      symbol,
      name,
      data: historical.map(data => ({
        date: data.date,
        open: data.open,
        high: data.high,
        low: data.low,
        close: data.close,
        volume: data.volume // Include historical volume
      })),
      currentPrice: quote.regularMarketPrice || 'N/A',
      volume: quote.regularMarketVolume || 'N/A' // Current volume
    };
  } catch (error) {
    console.error(`Error fetching historical data for ${symbol}:`, error.message);
    return { symbol, name, data: [], currentPrice: 'N/A', volume: 'N/A' };
  }
}

function generateDynamicNews(indicesData) {
  const niftyData = indicesData.find(index => index.symbol === '^NSEI') || { percentChange: 0 };
  const isMarketUp = niftyData.percentChange > 0;
  const changeMagnitude = Math.abs(niftyData.percentChange).toFixed(2);
  const currentPrice = niftyData.price || 24000;
  const timeNow = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const newsTemplates = isMarketUp ? [
    {
      title: `Nifty 50 Surges ${changeMagnitude}% to ${currentPrice.toLocaleString('en-IN')}`,
      source: "Economic Times",
      time: `${Math.floor(Math.random() * 5) + 1} minutes ago`,
      description: `The Nifty 50 index climbed ${changeMagnitude}% today, reaching ${currentPrice.toLocaleString('en-IN')}, driven by strong buying from FIIs and positive global cues.`
    },
    {
      title: `Bull Run Continues: FIIs Inject ₹${(Math.random() * 5000 + 5000).toFixed(0)} Crore`,
      source: "Moneycontrol",
      time: `${Math.floor(Math.random() * 3) + 1} hours ago`,
      description: `Foreign investors poured in substantial funds, boosting banking and IT stocks as the market hit a new high at ${timeNow}.`
    },
    {
      title: `Sensex Gains Amid Optimistic Sentiment`,
      source: "Business Standard",
      time: `${Math.floor(Math.random() * 2) + 1} hours ago`,
      description: `The BSE Sensex followed Nifty’s lead, gaining over ${Math.floor(changeMagnitude * 300)} points, with investors eyeing further upside.`
    }
  ] : [
    {
      title: `Nifty 50 Drops ${changeMagnitude}% to ${currentPrice.toLocaleString('en-IN')}`,
      source: "Economic Times",
      time: `${Math.floor(Math.random() * 5) + 1} minutes ago`,
      description: `The Nifty 50 index fell ${changeMagnitude}% today, closing at ${currentPrice.toLocaleString('en-IN')}, as profit booking and global uncertainties weighed on sentiment.`
    },
    {
      title: `DIIs Sell ₹${(Math.random() * 3000 + 1000).toFixed(0)} Crore Amid Market Dip`,
      source: "Moneycontrol",
      time: `${Math.floor(Math.random() * 3) + 1} hours ago`,
      description: `Domestic institutions offloaded stocks worth ₹${(Math.random() * 3000 + 1000).toFixed(0)} crore as the market saw a broad sell-off at ${timeNow}.`
    },
    {
      title: `Bearish Trend Hits Banking Stocks`,
      source: "Business Standard",
      time: `${Math.floor(Math.random() * 2) + 1} hours ago`,
      description: `Bank Nifty saw heavy selling pressure, dragging the broader market down by ${changeMagnitude}%.`
    }
  ];

  return newsTemplates.sort(() => 0.5 - Math.random()).slice(0, 3);
}

function broadcast(data) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

function dataChanged(oldData, newData) {
  if (!oldData || oldData.length !== newData.length) return true;
  return oldData.some((item, idx) => 
    item.price !== newData[idx].price || 
    item.lastClose !== newData[idx].lastClose || 
    item.volume !== newData[idx].volume || // Check volume change
    item.percentChange !== newData[idx].percentChange || 
    item.name !== newData[idx].name || 
    item.symbol !== newData[idx].symbol ||
    item.percentDrop !== newData[idx].percentDrop
  );
}

setInterval(async () => {
  try {
    const indicesData = await fetchData(indices);
    const stocksData = await fetchData(topStocks);
    const losersData = await fetchLosers(stocksData);
    const newsData = generateDynamicNews(indicesData);
    const broadcastData = {};

    if (dataChanged(lastIndicesData, indicesData)) {
      broadcastData.indices = indicesData;
      lastIndicesData = indicesData;
    }

    if (dataChanged(lastStocksData, stocksData)) {
      broadcastData.stocks = stocksData;
      lastStocksData = stocksData;
    }

    if (dataChanged(lastLosersData, losersData)) {
      broadcastData.losers = losersData;
      lastLosersData = losersData;
    }

    broadcastData.news = newsData;

    if (Object.keys(broadcastData).length > 0) {
      broadcastData.searchResult = currentSearchResult;
      console.log('Broadcasting periodic update:', broadcastData);
      broadcast(broadcastData);
    }
  } catch (error) {
    console.error('Error in periodic update:', error.message);
    broadcast({ error: 'Server error during update' });
  }
}, 10000);

wss.on('connection', (ws) => {
  console.log('Client connected');
  Promise.all([fetchData(indices), fetchData(topStocks)])
    .then(async ([indicesData, stocksData]) => {
      lastIndicesData = indicesData;
      lastStocksData = stocksData;
      lastLosersData = await fetchLosers(stocksData);
      const newsData = generateDynamicNews(indicesData);
      ws.send(JSON.stringify({ 
        indices: indicesData, 
        stocks: stocksData, 
        losers: lastLosersData,
        news: newsData,
        searchResult: currentSearchResult 
      }));
    })
    .catch((error) => {
      console.error('Error sending initial data:', error.message);
      ws.send(JSON.stringify({ error: 'Failed to load initial data' }));
    });

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      let broadcastData = {};

      if (data.search) {
        currentSearchResult = await searchStock(data.search);
        console.log('Broadcasting search result:', currentSearchResult);
        broadcastData.searchResult = currentSearchResult;
        if (currentSearchResult && !currentSearchResult.error) {
          broadcastData.historicalData = {
            symbol: currentSearchResult.symbol,
            name: currentSearchResult.name,
            data: currentSearchResult.historicalData,
            currentPrice: currentSearchResult.price,
            volume: currentSearchResult.volume // Include volume
          };
        }
      } else if (data.clearSearch) {
        console.log('Clearing search result');
        currentSearchResult = null;
        broadcastData.searchResult = null;
      } else if (data.historical) {
        const historicalData = await fetchHistoricalData(data.historical, data.name);
        console.log(`Broadcasting historical data for ${data.historical}`);
        broadcastData.historicalData = historicalData;
      }

      if (Object.keys(broadcastData).length > 0) {
        broadcast(broadcastData);
      }
    } catch (error) {
      console.error('Error handling message:', error.message);
      ws.send(JSON.stringify({ error: 'Server error processing request' }));
    }
  });

  ws.on('error', (error) => {
    console.error('WebSocket server error:', error.message);
    broadcast({ error: `Server error: ${error.message}` });
  });
});

let isServerListening = false;

function startServer(port) {
  return new Promise((resolve, reject) => {
    if (isServerListening) {
      console.log(`Server is already listening on port ${port}, skipping duplicate listen call.`);
      resolve();
      return;
    }

    server.listen(port, () => {
      isServerListening = true;
      console.log(`Server running on port ${port}`);
      resolve();
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use, attempting to close and retry...`);
        server.close(() => startServer(port).then(resolve).catch(reject));
      } else {
        reject(err);
      }
    });
  });
}

function shutdown() {
  console.log('Received shutdown signal, closing server...');
  isServerListening = false;
  server.close(() => {
    console.log('HTTP server closed.');
    wss.close(() => {
      console.log('WebSocket server closed.');
      process.exit(0);
    });
  });
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

const PORT = process.env.PORT || 3000;
startServer(PORT).catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});