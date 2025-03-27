const express = require('express');
const yahooFinance = require('yahoo-finance2').default;
const WebSocket = require('ws');
const http = require('http');
const path = require('path');

const app = express();
const server = http.createServer(app); // Create an HTTP server for Express
const wss = new WebSocket.Server({ server }); // Attach WebSocket to the same server

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

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
];

let currentSearchResult = null;
let lastIndicesData = null;
let lastStocksData = null;

async function fetchData(items) {
  const data = [];
  for (const item of items) {
    try {
      const quote = await yahooFinance.quote(item.symbol);
      const currentPrice = quote.regularMarketPrice || 'N/A';
      const lastClose = quote.regularMarketPreviousClose || 'N/A';
      let percentChange = 'N/A';
      if (currentPrice !== 'N/A' && lastClose !== 'N/A' && lastClose !== 0) {
        percentChange = ((currentPrice - lastClose) / lastClose) * 100;
      }
      data.push({
        name: item.name,
        symbol: item.symbol,
        price: currentPrice,
        lastClose: lastClose,
        percentChange: percentChange
      });
    } catch (error) {
      console.error(`Error fetching ${item.name} (${item.symbol}):`, error.message);
      data.push({
        name: item.name,
        symbol: item.symbol,
        price: 'N/A',
        lastClose: 'N/A',
        percentChange: 'N/A'
      });
    }
  }
  return data;
}

async function searchStock(query) {
  try {
    const searchResults = await yahooFinance.search(query);
    console.log(`Search results for "${query}":`, searchResults.quotes);
    const stock = searchResults.quotes.find(
      (result) => result.isYahooFinance && result.quoteType === 'EQUITY'
    );
    if (!stock) {
      return { error: 'No stock found matching your query' };
    }

    const quote = await yahooFinance.quote(stock.symbol);
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(endDate.getMonth() - 1); // Last 1 month of data
    const historical = await yahooFinance.historical(stock.symbol, {
      period1: startDate,
      period2: endDate,
      interval: '1d'
    });

    return {
      name: stock.shortname || stock.longname || 'Unknown',
      symbol: stock.symbol,
      price: quote.regularMarketPrice || 'N/A',
      currency: quote.currency || 'Unknown',
      historicalData: historical.map(data => ({
        date: data.date,
        open: data.open,
        high: data.high,
        low: data.low,
        close: data.close
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
    startDate.setMonth(endDate.getMonth() - 1); // Last 1 month of data
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
        close: data.close
      })),
      currentPrice: quote.regularMarketPrice || 'N/A'
    };
  } catch (error) {
    console.error(`Error fetching historical data for ${symbol}:`, error.message);
    return { symbol, name, data: [], currentPrice: 'N/A' };
  }
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
    item.percentChange !== newData[idx].percentChange || 
    item.name !== newData[idx].name || 
    item.symbol !== newData[idx].symbol
  );
}

setInterval(async () => {
  try {
    const indicesData = await fetchData(indices);
    const stocksData = await fetchData(topStocks);
    const broadcastData = {};

    if (dataChanged(lastIndicesData, indicesData)) {
      broadcastData.indices = indicesData;
      lastIndicesData = indicesData;
    }

    if (dataChanged(lastStocksData, stocksData)) {
      broadcastData.stocks = stocksData;
      lastStocksData = stocksData;
    }

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
    .then(([indicesData, stocksData]) => {
      lastIndicesData = indicesData;
      lastStocksData = stocksData;
      ws.send(JSON.stringify({ 
        indices: indicesData, 
        stocks: stocksData, 
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
            currentPrice: currentSearchResult.price
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
  });
});

// Use the Render-assigned port
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});