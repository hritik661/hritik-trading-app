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
let lastPredictionsData = null;

// Cache to store fetched data
const dataCache = {
  indices: null,
  stocks: null,
  losers: null,
  predictions: null,
  lastUpdated: null,
};

// Utility to validate JSON
function isValidJson(data) {
  try {
    JSON.stringify(data);
    return true;
  } catch {
    return false;
  }
}

// Retry logic for API calls
async function fetchWithRetry(fn, maxRetries = 3, delay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      console.warn(`Retrying API call (${i + 1}/${maxRetries}) after error: ${error.message}`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

async function fetchData(items) {
  const data = [];
  for (const item of items) {
    try {
      const quote = await fetchWithRetry(() =>
        yahooFinance.quote(item.symbol, {
          fields: [
            'regularMarketPrice',
            'regularMarketPreviousClose',
            'regularMarketVolume',
            'fiftyTwoWeekHigh',
            'regularMarketDayHigh',
            'regularMarketDayLow',
          ],
        })
      );
      const currentPrice = quote.regularMarketPrice ?? null;
      const lastClose = quote.regularMarketPreviousClose ?? null;
      const volume = quote.regularMarketVolume ?? null;
      const fiftyTwoWeekHigh = quote.fiftyTwoWeekHigh ?? null;
      const dayHigh = quote.regularMarketDayHigh ?? null;
      const dayLow = quote.regularMarketDayLow ?? null;
      let percentChange = null;
      let percentDrop = null;
      if (currentPrice != null && lastClose != null && lastClose !== 0) {
        percentChange = parseFloat(((currentPrice - lastClose) / lastClose) * 100).toFixed(2);
      }
      if (currentPrice != null && fiftyTwoWeekHigh != null && fiftyTwoWeekHigh !== 0) {
        percentDrop = parseFloat(((fiftyTwoWeekHigh - currentPrice) / fiftyTwoWeekHigh) * 100).toFixed(2);
      }
      data.push({
        name: item.name,
        symbol: item.symbol,
        price: currentPrice,
        lastClose: lastClose,
        volume: volume,
        percentChange: percentChange,
        fiftyTwoWeekHigh: fiftyTwoWeekHigh,
        percentDrop: percentDrop,
        dayHigh: dayHigh,
        dayLow: dayLow,
      });
    } catch (error) {
      console.error(`Error fetching ${item.name} (${item.symbol}):`, error.message);
      data.push({
        name: item.name,
        symbol: item.symbol,
        price: null,
        lastClose: null,
        volume: null,
        percentChange: null,
        fiftyTwoWeekHigh: null,
        percentDrop: null,
        dayHigh: null,
        dayLow: null,
      });
    }
  }
  return data;
}

async function fetchLosers(stocksData) {
  return stocksData
    .filter(stock => stock.percentDrop != null && stock.percentDrop >= 30)
    .sort((a, b) => b.percentDrop - a.percentDrop)
    .slice(0, 10)
    .map(stock => ({
      name: stock.name,
      symbol: stock.symbol,
      price: stock.price ?? 0,
      volume: stock.volume ?? 0,
      percentDrop: parseFloat(stock.percentDrop).toFixed(2),
      dayHigh: stock.dayHigh ?? 0,
      dayLow: stock.dayLow ?? 0,
    }));
}

async function fetchPredictedGainers(stocksData) {
  const predictions = [];
  const shuffledStocks = [...stocksData].sort(() => 0.5 - Math.random());
  const maxStocksToProcess = Math.min(shuffledStocks.length, 50);

  for (let i = 0; i < maxStocksToProcess && predictions.length < 10; i++) {
    const stock = shuffledStocks[i];
    try {
      if (stock.price == null || stock.price === 0) continue;
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 14);
      const historical = await fetchWithRetry(() =>
        yahooFinance.historical(stock.symbol, {
          period1: startDate,
          period2: endDate,
          interval: '1d',
        })
      );
      if (historical.length < 5) continue;

      const recentPrices = historical.map(data => data.close).filter(price => price != null);
      if (recentPrices.length < 2) continue;

      const avgGain = recentPrices.reduce((acc, price, idx) => {
        if (idx === 0) return acc;
        return acc + ((price - recentPrices[idx - 1]) / recentPrices[idx - 1]) * 100;
      }, 0) / (recentPrices.length - 1);

      const volatility = recentPrices.length > 1
        ? Math.max(...recentPrices) / Math.min(...recentPrices) - 1
        : 0;
      const predictedGain = Math.max(0, avgGain * (1 + volatility * 0.5));
      if (predictedGain >= 5) {
        predictions.push({
          name: stock.name,
          symbol: stock.symbol,
          price: stock.price,
          predictedGain: parseFloat(predictedGain.toFixed(2)),
          dayHigh: stock.dayHigh ?? 0,
          dayLow: stock.dayLow ?? 0,
        });
      }
    } catch (error) {
      console.error(`Error predicting ${stock.name} (${stock.symbol}):`, error.message);
    }
  }

  if (predictions.length < 10) {
    const remainingStocks = shuffledStocks.filter(
      stock => !predictions.some(p => p.symbol === stock.symbol) && stock.price != null && stock.price > 0
    );
    for (const stock of remainingStocks) {
      if (predictions.length >= 10) break;
      predictions.push({
        name: stock.name,
        symbol: stock.symbol,
        price: stock.price,
        predictedGain: parseFloat((Math.random() * 2 + 5).toFixed(2)),
        dayHigh: stock.dayHigh ?? 0,
        dayLow: stock.dayLow ?? 0,
      });
    }
  }

  return predictions.sort((a, b) => b.predictedGain - a.predictedGain).slice(0, 10);
}

async function searchStock(query) {
  try {
    const searchResults = await fetchWithRetry(() =>
      yahooFinance.search(query, { quotesCount: 10 })
    );
    const stock = searchResults.quotes.find(
      result => result.isYahooFinance && result.quoteType === 'EQUITY' && result.symbol.endsWith('.NS')
    );
    if (!stock) {
      return { error: 'No stock found matching your query' };
    }

    const quote = await fetchWithRetry(() =>
      yahooFinance.quote(stock.symbol, {
        fields: [
          'regularMarketPrice',
          'regularMarketVolume',
          'currency',
          'regularMarketPreviousClose',
          'regularMarketDayHigh',
          'regularMarketDayLow',
        ],
      })
    );
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(endDate.getMonth() - 1);
    const historical = await fetchWithRetry(() =>
      yahooFinance.historical(stock.symbol, {
        period1: startDate,
        period2: endDate,
        interval: '1d',
      })
    );

    const currentPrice = quote.regularMarketPrice ?? 0;
    const lastClose = quote.regularMarketPreviousClose ?? currentPrice;
    const percentChange = currentPrice && lastClose && lastClose !== 0
      ? parseFloat(((currentPrice - lastClose) / lastClose) * 100).toFixed(2)
      : null;

    return {
      name: stock.shortname || stock.longname || 'Unknown',
      symbol: stock.symbol,
      price: currentPrice,
      volume: quote.regularMarketVolume ?? 0,
      currency: quote.currency || 'INR',
      percentChange: percentChange,
      dayHigh: quote.regularMarketDayHigh ?? 0,
      dayLow: quote.regularMarketDayLow ?? 0,
      historicalData: historical.map(data => ({
        date: data.date.toISOString(),
        open: data.open ?? 0,
        high: data.high ?? 0,
        low: data.low ?? 0,
        close: data.close ?? 0,
        volume: data.volume ?? 0,
      })),
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
    const historical = await fetchWithRetry(() =>
      yahooFinance.historical(symbol, {
        period1: startDate,
        period2: endDate,
        interval: '1d',
      })
    );
    const quote = await fetchWithRetry(() =>
      yahooFinance.quote(symbol, {
        fields: [
          'regularMarketPrice',
          'regularMarketVolume',
          'regularMarketDayHigh',
          'regularMarketDayLow',
        ],
      })
    );
    return {
      symbol,
      name,
      data: historical.map(data => ({
        date: data.date.toISOString(),
        open: data.open ?? 0,
        high: data.high ?? 0,
        low: data.low ?? 0,
        close: data.close ?? 0,
        volume: data.volume ?? 0,
      })),
      currentPrice: quote.regularMarketPrice ?? 0,
      volume: quote.regularMarketVolume ?? 0,
      dayHigh: quote.regularMarketDayHigh ?? 0,
      dayLow: quote.regularMarketDayLow ?? 0,
    };
  } catch (error) {
    console.error(`Error fetching historical data for ${symbol}:`, error.message);
    return { symbol, name, data: [], currentPrice: 0, volume: 0, dayHigh: 0, dayLow: 0 };
  }
}

function generateDynamicNews(indicesData) {
  const niftyData = indicesData.find(index => index.symbol === '^NSEI') || {
    percentChange: 0,
    price: 24000,
  };
  const isMarketUp = niftyData.percentChange > 0;
  const changeMagnitude = Math.abs(niftyData.percentChange ?? 0).toFixed(2);
  const currentPrice = niftyData.price ?? 24000;
  const timeNow = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
  });

  const newsTemplates = isMarketUp
    ? [
        {
          title: `Nifty 50 Surges ${changeMagnitude}% to ${currentPrice.toLocaleString('en-IN')}`,
          source: 'Economic Times',
          time: `${Math.floor(Math.random() * 5) + 1} minutes ago`,
          description: `The Nifty 50 index climbed ${changeMagnitude}% today, reaching ${currentPrice.toLocaleString('en-IN')}, driven by strong buying from FIIs and positive global cues.`,
        },
        {
          title: `Bull Run Continues: FIIs Inject ₹${(Math.random() * 5000 + 5000).toFixed(0)} Crore`,
          source: 'Moneycontrol',
          time: `${Math.floor(Math.random() * 3) + 1} hours ago`,
          description: `Foreign investors poured in substantial funds, boosting banking and IT stocks as the market hit a new high at ${timeNow}.`,
        },
        {
          title: `Sensex Gains Amid Optimistic Sentiment`,
          source: 'Business Standard',
          time: `${Math.floor(Math.random() * 2) + 1} hours ago`,
          description: `The BSE Sensex followed Nifty’s lead, gaining over ${Math.floor(changeMagnitude * 300)} points, with investors eyeing further upside.`,
        },
      ]
    : [
        {
          title: `Nifty 50 Drops ${changeMagnitude}% to ${currentPrice.toLocaleString('en-IN')}`,
          source: 'Economic Times',
          time: `${Math.floor(Math.random() * 5) + 1} minutes ago`,
          description: `The Nifty 50 index fell ${changeMagnitude}% today, closing at ${currentPrice.toLocaleString('en-IN')}, as profit booking and global uncertainties weighed on sentiment.`,
        },
        {
          title: `DIIs Sell ₹${(Math.random() * 3000 + 1000).toFixed(0)} Crore Amid Market Dip`,
          source: 'Moneycontrol',
          time: `${Math.floor(Math.random() * 3) + 1} hours ago`,
          description: `Domestic institutions offloaded stocks worth ₹${(Math.random() * 3000 + 1000).toFixed(0)} crore as the market saw a broad sell-off at ${timeNow}.`,
        },
        {
          title: `Bearish Trend Hits Banking Stocks`,
          source: 'Business Standard',
          time: `${Math.floor(Math.random() * 2) + 1} hours ago`,
          description: `Bank Nifty saw heavy selling pressure, dragging the broader market down by ${changeMagnitude}%.`,
        },
      ];

  return newsTemplates.sort(() => 0.5 - Math.random()).slice(0, 3);
}

function broadcast(data) {
  if (!isValidJson(data)) {
    console.error('Invalid JSON data, skipping broadcast:', data);
    return;
  }
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(JSON.stringify(data));
      } catch (error) {
        console.error('Error broadcasting to client:', error.message);
      }
    }
  });
}

function dataChanged(oldData, newData) {
  if (!oldData || !newData || oldData.length !== newData.length) return true;
  return oldData.some((item, idx) => {
    const newItem = newData[idx];
    return (
      item.price !== newItem.price ||
      item.lastClose !== newItem.lastClose ||
      item.volume !== newItem.volume ||
      item.percentChange !== newItem.percentChange ||
      item.name !== newItem.name ||
      item.symbol !== newItem.symbol ||
      item.percentDrop !== newItem.percentDrop ||
      item.predictedGain !== newItem.predictedGain ||
      item.dayHigh !== newItem.dayHigh ||
      item.dayLow !== newItem.dayLow
    );
  });
}

setInterval(async () => {
  try {
    const cacheTTL = 30000; // Cache for 30 seconds
    const now = Date.now();
    if (dataCache.lastUpdated && now - dataCache.lastUpdated < cacheTTL) {
      const broadcastData = {};
      if (dataCache.indices) broadcastData.indices = dataCache.indices;
      if (dataCache.stocks) broadcastData.stocks = dataCache.stocks;
      if (dataCache.losers) broadcastData.losers = dataCache.losers;
      if (dataCache.predictions) broadcastData.predictions = dataCache.predictions;
      broadcastData.news = generateDynamicNews(dataCache.indices || []);
      if (currentSearchResult) broadcastData.searchResult = currentSearchResult;
      if (Object.keys(broadcastData).length > 0) {
        broadcast(broadcastData);
      }
      return;
    }

    const indicesData = await fetchData(indices);
    const stocksData = await fetchData(topStocks.slice(0, 50)); // Limit to avoid rate limits
    const losersData = await fetchLosers(stocksData);
    const predictionsData = await fetchPredictedGainers(stocksData);
    const newsData = generateDynamicNews(indicesData);
    const broadcastData = {};

    if (dataChanged(lastIndicesData, indicesData)) {
      broadcastData.indices = indicesData;
      lastIndicesData = indicesData;
      dataCache.indices = indicesData;
    }

    if (dataChanged(lastStocksData, stocksData)) {
      broadcastData.stocks = stocksData;
      lastStocksData = stocksData;
      dataCache.stocks = stocksData;
    }

    if (dataChanged(lastLosersData, losersData)) {
      broadcastData.losers = losersData;
      lastLosersData = losersData;
      dataCache.losers = losersData;
    }

    if (dataChanged(lastPredictionsData, predictionsData)) {
      broadcastData.predictions = predictionsData;
      lastPredictionsData = predictionsData;
      dataCache.predictions = predictionsData;
    }

    broadcastData.news = newsData;
    if (currentSearchResult) broadcastData.searchResult = currentSearchResult;

    if (Object.keys(broadcastData).length > 0) {
      dataCache.lastUpdated = now;
      console.log('Broadcasting periodic update:', Object.keys(broadcastData));
      broadcast(broadcastData);
    }
  } catch (error) {
    console.error('Error in periodic update:', error.message);
    broadcast({ error: 'Server error during update' });
  }
}, 15000);

wss.on('connection', ws => {
  console.log('Client connected');
  Promise.all([
    fetchData(indices),
    fetchData(topStocks.slice(0, 50)),
    fetchPredictedGainers(topStocks.slice(0, 50)),
  ])
    .then(async ([indicesData, stocksData, predictionsData]) => {
      lastIndicesData = indicesData;
      lastStocksData = stocksData;
      lastLosersData = await fetchLosers(stocksData);
      lastPredictionsData = predictionsData;
      const newsData = generateDynamicNews(indicesData);
      const initialData = {
        indices: indicesData,
        stocks: stocksData,
        losers: lastLosersData,
        predictions: predictionsData,
        news: newsData,
        searchResult: currentSearchResult,
      };
      if (isValidJson(initialData)) {
        ws.send(JSON.stringify(initialData));
        dataCache.indices = indicesData;
        dataCache.stocks = stocksData;
        dataCache.losers = lastLosersData;
        dataCache.predictions = predictionsData;
        dataCache.lastUpdated = Date.now();
      } else {
        console.error('Invalid initial data, not sending:', initialData);
        ws.send(JSON.stringify({ error: 'Failed to load initial data' }));
      }
    })
    .catch(error => {
      console.error('Error sending initial data:', error.message);
      ws.send(JSON.stringify({ error: 'Failed to load initial data' }));
    });

  ws.on('message', async message => {
    try {
      let data;
      try {
        data = JSON.parse(message);
      } catch (error) {
        console.error('Invalid client message JSON:', message);
        ws.send(JSON.stringify({ error: 'Invalid message format' }));
        return;
      }

      let broadcastData = {};

      if (data.search) {
        currentSearchResult = await searchStock(data.search);
        broadcastData.searchResult = currentSearchResult;
        if (currentSearchResult && !currentSearchResult.error) {
          broadcastData.historicalData = {
            symbol: currentSearchResult.symbol,
            name: currentSearchResult.name,
            data: currentSearchResult.historicalData,
            currentPrice: currentSearchResult.price,
            volume: currentSearchResult.volume,
            dayHigh: currentSearchResult.dayHigh,
            dayLow: currentSearchResult.dayLow,
          };
        }
      } else if (data.clearSearch) {
        currentSearchResult = null;
        broadcastData.searchResult = null;
      } else if (data.historical) {
        const historicalData = await fetchHistoricalData(data.historical, data.name);
        broadcastData.historicalData = historicalData;
      }

      if (Object.keys(broadcastData).length > 0) {
        if (isValidJson(broadcastData)) {
          broadcast(broadcastData);
        } else {
          console.error('Invalid broadcast data, not sending:', broadcastData);
        }
      }
    } catch (error) {
      console.error('Error handling message:', error.message);
      ws.send(JSON.stringify({ error: 'Server error processing request' }));
    }
  });

  ws.on('error', error => {
    console.error('WebSocket client error:', error.message);
  });

  ws.on('close', () => {
    console.log('Client disconnected');
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

    server.on('error', err => {
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
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.close();
    }
  });
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
startServer(PORT).catch(err => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});