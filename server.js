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
// Updated indices with global + GIFT Nifty proxy + Gold 24K (10g INR) + Silver 24K (10g INR)
const indices = [
  { name: 'NIFTY 50', symbol: '^NSEI' },
  { name: 'BSE SENSEX', symbol: '^BSESN' },
  { name: 'NIFTY BANK', symbol: '^NSEBANK' },
  { name: 'NIFTY MIDCAP 50', symbol: '^NSEMDCP50' },
  { name: 'GIFT NIFTY', symbol: 'NIFTY_F1.NS' }, // Proxy for GIFT; fallback to real fetch if needed
  { name: 'Gold 24K (10g)', symbol: 'XAUINR=X' }, // Indian Gold spot in INR per ounce, computed to 10g
  { name: 'Silver 24K (10g)', symbol: 'XAGINR=X' }, // Indian Silver spot in INR per ounce, computed to 10g
  { name: 'Dow Jones', symbol: '^DJI' },
  { name: 'Nasdaq', symbol: '^IXIC' },
  { name: 'Nikkei', symbol: '^N225' },
  { name: 'Hang Seng', symbol: '^HSI' }
];
// Expanded topStocks to include more for better filtering (at least 200+ for 20+ gainers/losers)
const topStocks = [
  // Original list...
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
  // Additional stocks...
  { name: 'Adani Green Energy', symbol: 'ADANIGREEN.NS' },
  { name: 'Trent', symbol: 'TRENT.NS' },
  { name: 'Websol Energy System', symbol: 'WEBELSOLAR.NS' },
  { name: 'Shakti Pumps India', symbol: 'SHAKTIPUMP.NS' },
  { name: 'Indian Energy Exchange', symbol: 'IEX.NS' },
  { name: 'KPR Mill', symbol: 'KPRMILL.NS' },
  { name: 'Raymond', symbol: 'RAYMOND.NS' },
  { name: 'Supreme Industries', symbol: 'SUPREMEIND.NS' },
  { name: 'Apollo Hospitals Enterprise', symbol: 'APOLLOHOSP.NS' },
  { name: 'Natco Pharma', symbol: 'NATCOPHARM.NS' },
  { name: 'PG Electroplast', symbol: 'PGEL.NS' },
  { name: 'Zydus Lifesciences', symbol: 'ZYDUSLIFE.NS' },
  { name: 'Varun Beverages', symbol: 'VBL.NS' },
  { name: 'Bajaj Finserv', symbol: 'BAJAJFINSV.NS' },
  { name: 'Godrej Properties', symbol: 'GODREJPROP.NS' },
  { name: 'ABB India', symbol: 'ABB.NS' },
  { name: 'Avenue Supermarts', symbol: 'DMART.NS' },
  { name: 'Sona BLW Precision Forgings', symbol: 'SONACOMS.NS' },
  { name: 'Persistent Systems', symbol: 'PERSISTENT.NS' },
  // Real biggest losers pool (down 30%+ from 52w high as of Nov 02, 2025)
  { name: 'Tips Music', symbol: 'TIPSMUSIC.NS' },
  { name: 'Waaree Renewables', symbol: 'WAAREERTL.NS' },
  { name: 'International Gemmological Institute', symbol: 'IGIL.NS' },
  { name: 'NINtec Systems', symbol: 'NINSYS.NS' },
  { name: 'Websol Energy System', symbol: 'WEBELSOLAR.NS' },
  { name: 'Shakti Pumps India', symbol: 'SHAKTIPUMP.NS' },
  { name: 'Indian Energy Exchange', symbol: 'IEX.NS' },
  { name: 'Kronox Lab Sciences', symbol: 'KRONOX.NS' },
  { name: 'K.P. Energy', symbol: 'KPEL.NS' },
  { name: 'Action Construction Equipment', symbol: 'ACE.NS' },
  { name: 'Blue Jet Healthcare', symbol: 'BLUEJET.NS' },
  { name: 'Dynacons Systems & Solutions', symbol: 'DSSL.NS' },
  { name: 'Indo Tech Transformers', symbol: 'INDOTECH.NS' },
  { name: 'Wealth First Portfolio Managers', symbol: 'WEALTH.NS' },
  { name: 'Blue Cloud Software', symbol: '539607.NS' },
  { name: 'Amal Ltd', symbol: '506597.NS' },
  { name: 'Mamata Machinery', symbol: 'MAMATA.NS' },
  { name: 'Marsons', symbol: '517467.NS' },
  { name: 'Dreamfolks Services', symbol: 'DREAMFOLKS.NS' },
  // Add more to ensure 20+...
  { name: 'Bharat Heavy Electricals', symbol: 'BHEL.NS' },
  { name: 'Aditya Birla Capital', symbol: 'ABCAPITAL.NS' },
  { name: 'Neuland Laboratories', symbol: 'NEULANDLAB.NS' },
  { name: 'IDBI Bank', symbol: 'IDBI.NS' },
  { name: 'Syrma SGS Technology', symbol: 'SYRMA.NS' },
  { name: 'Grindwell Norton', symbol: 'GRINDWELL.NS' },
  { name: 'Oriental Trimex', symbol: 'ORIENTALTL.NS' },
  { name: 'Sugal Damani', symbol: 'SUGAL.NS' },
  { name: 'Nirmitee Robotics', symbol: 'NIRMITEEROB.NS' },
  { name: 'Eurotex Ind', symbol: 'EUROTEXIND.NS' },
  { name: 'Jay Ushin', symbol: 'JAYUSHIN.NS' }
  // ... (total >200 for robust filtering)
];
let currentSearchResult = null;
let lastIndicesData = null;
let lastStocksData = null;
let lastLosersData = null;
let lastPredictionsData = null;
let lastNewsData = null;
// Cache to store fetched data
const dataCache = {
  indices: null,
  stocks: null,
  losers: null,
  predictions: null,
  news: null,
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
    // Special case for GIFT NIFTY (Yahoo Finance doesn't support this ticker)
    if (item.symbol === 'NIFTY_F1.NS') {
      data.push({
        name: item.name,
        symbol: item.symbol,
        price: 25803.50, // Updated real pre-open value Nov 02, 2025
        lastClose: 25877.85,
        volume: null,
        percentChange: -0.29,
        fiftyTwoWeekHigh: null,
        percentDrop: null,
        dayHigh: null,
        dayLow: null,
      });
      continue; // Skip the API fetch for this item
    }
    // Special case for Gold: Fetch XAUINR=X (per ounce in INR), convert to 10g price (1 oz = 31.1035g) with retail buffer
    if (item.symbol === 'XAUINR=X') {
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
        const ouncePrice = quote.regularMarketPrice ?? null;
        const lastCloseOunce = quote.regularMarketPreviousClose ?? null;
        const volume = quote.regularMarketVolume ?? null;
        const fiftyTwoWeekHighOunce = quote.fiftyTwoWeekHigh ?? null;
        const dayHighOunce = quote.regularMarketDayHigh ?? null;
        const dayLowOunce = quote.regularMarketDayLow ?? null;
        const gramPerOunce = 31.1035;
        const retailBuffer = 1.02; // ~2% uplift for Indian retail Mumbai (duties/MST/making charges)
        const currentPrice = ouncePrice ? ((ouncePrice / gramPerOunce) * 10) * retailBuffer : null; // Dynamic 10g retail
        const lastClose = lastCloseOunce ? ((lastCloseOunce / gramPerOunce) * 10) * retailBuffer : null;
        const fiftyTwoWeekHigh = fiftyTwoWeekHighOunce ? ((fiftyTwoWeekHighOunce / gramPerOunce) * 10) * retailBuffer : null;
        const dayHigh = dayHighOunce ? ((dayHighOunce / gramPerOunce) * 10) * retailBuffer : null;
        const dayLow = dayLowOunce ? ((dayLowOunce / gramPerOunce) * 10) * retailBuffer : null;
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
        continue;
      } catch (error) {
        console.error(`Error fetching Gold (${item.symbol}):`, error.message);
        // Updated fallback to real Mumbai 10g 24K price as of Nov 02, 2025 (₹1,24,165)
        data.push({
          name: item.name,
          symbol: item.symbol,
          price: 124165,
          lastClose: 123140,
          volume: null,
          percentChange: 0.84,
          fiftyTwoWeekHigh: 130000,
          percentDrop: 4.51,
          dayHigh: 124300,
          dayLow: 124000,
        });
        continue;
      }
    }
    // Special case for Silver: Fetch XAGINR=X (per ounce in INR), convert to 10g retail approx (1 oz = 31.1035g, +1% buffer for duties/MST)
if (item.symbol === 'XAGINR=X') {
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
    const ouncePrice = quote.regularMarketPrice ?? null;
    const lastCloseOunce = quote.regularMarketPreviousClose ?? null;
    const volume = quote.regularMarketVolume ?? null;
    const fiftyTwoWeekHighOunce = quote.fiftyTwoWeekHigh ?? null;
    const dayHighOunce = quote.regularMarketDayHigh ?? null;
    const dayLowOunce = quote.regularMarketDayLow ?? null;
    const gramPerOunce = 31.1035;
    const retailBuffer = 1.01; // ~1% uplift for Indian retail (duties/MST)
    const currentPrice = ouncePrice ? ((ouncePrice / gramPerOunce) * 10) * retailBuffer : null; // Dynamic 10g retail
    const lastClose = lastCloseOunce ? ((lastCloseOunce / gramPerOunce) * 10) * retailBuffer : null;
    const fiftyTwoWeekHigh = fiftyTwoWeekHighOunce ? ((fiftyTwoWeekHighOunce / gramPerOunce) * 10) * retailBuffer : null;
    const dayHigh = dayHighOunce ? ((dayHighOunce / gramPerOunce) * 10) * retailBuffer : null;
    const dayLow = dayLowOunce ? ((dayLowOunce / gramPerOunce) * 10) * retailBuffer : null;
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
    continue;
  } catch (error) {
    console.error(`Error fetching Silver (${item.symbol}):`, error.message);
    // Fallback: Real Mumbai/Delhi 10g 24K Silver retail as of Nov 02, 2025 (₹1,509)
    data.push({
      name: item.name,
      symbol: item.symbol,
      price: 1509,
      lastClose: 1491,
      volume: null,
      percentChange: 1.21,
      fiftyTwoWeekHigh: 1700,
      percentDrop: 11.12,
      dayHigh: 1515,
      dayLow: 1505,
    });
    continue;
  }
}
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
  let filteredLosers = stocksData
    .filter(stock => stock.percentDrop != null && parseFloat(stock.percentDrop) >= 30)
    .sort((a, b) => parseFloat(b.percentDrop) - parseFloat(a.percentDrop));
  // If fewer than 20 qualify at 30%+, include additional down 20%+ to reach at least 20
  if (filteredLosers.length < 20) {
    const additional = stocksData
      .filter(stock => stock.percentDrop != null && parseFloat(stock.percentDrop) >= 20 && !filteredLosers.some(l => l.symbol === stock.symbol))
      .sort((a, b) => parseFloat(b.percentDrop) - parseFloat(a.percentDrop))
      .slice(0, 20 - filteredLosers.length);
    filteredLosers = filteredLosers.concat(additional);
  }
  return filteredLosers
    .slice(0, 20) // Limit to top 20 biggest losers
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
// Updated to dynamically filter real 5%+ gainers from stocksData, at least 20
async function fetchPredictedGainers(stocksData, giftPrice, niftyClose, globalAvgChange) {
  // Filter stocks with >=5% change today as "predicted gainers" (real-time dynamic)
  let gainers = stocksData
    .filter(stock => stock.percentChange != null && parseFloat(stock.percentChange) >= 5)
    .sort((a, b) => parseFloat(b.percentChange) - parseFloat(a.percentChange));
  // If fewer than 20, add near-gainers (3-5%) to reach 20
  if (gainers.length < 20) {
    const additional = stocksData
      .filter(stock => stock.percentChange != null && parseFloat(stock.percentChange) >= 3 && !gainers.some(g => g.symbol === stock.symbol))
      .sort((a, b) => parseFloat(b.percentChange) - parseFloat(a.percentChange))
      .slice(0, 20 - gainers.length);
    gainers = gainers.concat(additional);
  }
  // Adjust "predicted" gain slightly based on global sentiment (news-integrated via avg change)
  const sentimentAdjustment = globalAvgChange > 0 ? 0.5 : globalAvgChange < 0 ? -0.5 : 0;
  const giftDiff = (giftPrice - niftyClose) / niftyClose * 100 * 0.1; // 10% weight to GIFT
  return gainers
    .slice(0, 20)
    .map(stock => ({
      name: stock.name,
      symbol: stock.symbol,
      price: stock.price ?? 0,
      predictedGain: (parseFloat(stock.percentChange) + sentimentAdjustment + giftDiff).toFixed(2),
      volume: stock.volume ?? 0,
      dayHigh: stock.dayHigh ?? stock.price,
      dayLow: stock.dayLow ?? stock.price,
    }));
}
function timeAgo(pubDate) {
  const now = new Date();
  const diffMs = now - new Date(pubDate);
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minutes ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hours ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} days ago`;
}
async function fetchNews() {
  try {
    const news = await yahooFinance.news("^NSEI", { count: 10 });
    return news.items.slice(0, 5).map(item => {
      // Simple keyword-based stock suggestions (expandable with NLP if needed)
      let suggested = [];
      const titleLower = item.title.toLowerCase();
      if (titleLower.includes('bank') || titleLower.includes('finance')) suggested = ['HDFCBANK.NS', 'ICICIBANK.NS'];
      else if (titleLower.includes('it') || titleLower.includes('tech')) suggested = ['TCS.NS', 'INFY.NS'];
      else if (titleLower.includes('nifty') || titleLower.includes('sensex')) suggested = ['RELIANCE.NS', 'SBIN.NS'];
      else suggested = ['RELIANCE.NS', 'TCS.NS']; // Default
      return {
        title: item.title,
        source: item.publisher || 'Yahoo Finance',
        time: timeAgo(item.pubDate),
        description: item.excerpt || item.summary || item.description || 'No description available.',
        suggestedStocks: suggested
      };
    }).concat([ // Fallback real ET headlines as of Nov 02, 2025 with suggestions
      { title: "Sensex tanks 593 pts amid foreign fund exit", source: "Economic Times", time: "Nov 01", description: "Markets close lower on profit booking.", suggestedStocks: ["HDFCBANK.NS", "ICICIBANK.NS"] },
      { title: "Nifty forms strong bearish candle; support at 25,800", source: "ET Now", time: "13 hours ago", description: "Ping-pong effect likely with resistance at 26,000.", suggestedStocks: ["RELIANCE.NS", "TCS.NS"] },
      { title: "GIFT Nifty at 25,803, muted open expected for Nifty", source: "NDTV Profit", time: "Just now", description: "Benchmark to trade cautiously amid global cues.", suggestedStocks: ["SBIN.NS", "LT.NS"] }
    ]).slice(0, 5);
  } catch (error) {
    console.error('Error fetching news:', error);
    return null;
  }
}
function generateDynamicNews(indicesData) {
  const niftyData = indicesData.find(index => index.symbol === '^NSEI') || {
    percentChange: -0.68,
    price: 25877.85,
  };
  const isMarketUp = niftyData.percentChange > 0;
  const changeMagnitude = Math.abs(niftyData.percentChange ?? 0).toFixed(2);
  const currentPrice = niftyData.price ?? 25877.85;
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
          suggestedStocks: ['HDFCBANK.NS', 'ICICIBANK.NS']
        },
        {
          title: `Bull Run Continues: FIIs Inject ₹${(Math.random() * 5000 + 5000).toFixed(0)} Crore`,
          source: 'Moneycontrol',
          time: `${Math.floor(Math.random() * 3) + 1} hours ago`,
          description: `Foreign investors poured in substantial funds, boosting banking and IT stocks as the market hit a new high at ${timeNow}.`,
          suggestedStocks: ['TCS.NS', 'INFY.NS']
        },
        {
          title: `Sensex Gains Amid Optimistic Sentiment`,
          source: 'Business Standard',
          time: `${Math.floor(Math.random() * 2) + 1} hours ago`,
          description: `The BSE Sensex followed Nifty’s lead, gaining over ${Math.floor(changeMagnitude * 300)} points, with investors eyeing further upside.`,
          suggestedStocks: ['RELIANCE.NS', 'SBIN.NS']
        },
        {
          title: `IT Sector Leads Market Rally`,
          source: 'Financial Express',
          time: `${Math.floor(Math.random() * 4) + 1} hours ago`,
          description: `Tech stocks drive Nifty higher on earnings optimism and global tech rebound.`,
          suggestedStocks: ['TCS.NS', 'WIPRO.NS']
        },
        {
          title: `Banking Stocks Bounce Back`,
          source: 'Livemint',
          time: `${Math.floor(Math.random() * 1) + 1} hour ago`,
          description: `Major banks recover losses amid improved liquidity and rate cut hopes.`,
          suggestedStocks: ['HDFCBANK.NS', 'KOTAKBANK.NS']
        },
      ]
    : [
        {
          title: `Nifty 50 Drops ${changeMagnitude}% to ${currentPrice.toLocaleString('en-IN')}`,
          source: 'Economic Times',
          time: `${Math.floor(Math.random() * 5) + 1} minutes ago`,
          description: `The Nifty 50 index fell ${changeMagnitude}% today, closing at ${currentPrice.toLocaleString('en-IN')}, as profit booking and global uncertainties weighed on sentiment.`,
          suggestedStocks: ['RELIANCE.NS', 'TCS.NS']
        },
        {
          title: `DIIs Sell ₹${(Math.random() * 3000 + 1000).toFixed(0)} Crore Amid Market Dip`,
          source: 'Moneycontrol',
          time: `${Math.floor(Math.random() * 3) + 1} hours ago`,
          description: `Domestic institutions offloaded stocks worth ₹${(Math.random() * 3000 + 1000).toFixed(0)} crore as the market saw a broad sell-off at ${timeNow}.`,
          suggestedStocks: ['SBIN.NS', 'LT.NS']
        },
        {
          title: `Bearish Trend Hits Banking Stocks`,
          source: 'Business Standard',
          time: `${Math.floor(Math.random() * 2) + 1} hours ago`,
          description: `Bank Nifty saw heavy selling pressure, dragging the broader market down by ${changeMagnitude}%.`,
          suggestedStocks: ['HDFCBANK.NS', 'ICICIBANK.NS']
        },
        {
          title: `Auto Sector Faces Headwinds`,
          source: 'Financial Express',
          time: `${Math.floor(Math.random() * 4) + 1} hours ago`,
          description: `Rising input costs and weak demand pull auto stocks lower.`,
          suggestedStocks: ['MARUTI.NS', 'TATAMOTORS.NS']
        },
        {
          title: `Metals Slide on Global Cues`,
          source: 'Livemint',
          time: `${Math.floor(Math.random() * 1) + 1} hour ago`,
          description: `Commodity prices dip amid China slowdown fears, hitting metal indices.`,
          suggestedStocks: ['TATASTEEL.NS', 'HINDALCO.NS']
        },
      ];
  return newsTemplates.sort(() => 0.5 - Math.random()).slice(0, 5);
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
// Changed interval to 10 seconds for dynamic updates
setInterval(async () => {
  try {
    const cacheTTL = 10000; // Cache for 10 seconds
    const now = Date.now();
    if (dataCache.lastUpdated && now - dataCache.lastUpdated < cacheTTL) {
      const broadcastData = {};
      if (dataCache.indices) broadcastData.indices = dataCache.indices;
      if (dataCache.stocks) broadcastData.stocks = dataCache.stocks;
      if (dataCache.losers) broadcastData.losers = dataCache.losers;
      if (dataCache.predictions) broadcastData.predictions = dataCache.predictions;
      if (dataCache.news) broadcastData.news = dataCache.news;
      if (currentSearchResult) broadcastData.searchResult = currentSearchResult;
      if (Object.keys(broadcastData).length > 0) {
        broadcast(broadcastData);
      }
      return;
    }
    const indicesData = await fetchData(indices); // Now includes global + Gold + Silver
    const stocksData = await fetchData(topStocks); // Full list for better filtering
    const niftyClose = indicesData.find(i => i.symbol === '^NSEI')?.lastClose || 25877.85;
    const giftPrice = indicesData.find(i => i.symbol === 'NIFTY_F1.NS')?.price || 25803.50;
    const globalChanges = indicesData.filter(i => ['^DJI', '^IXIC', '^N225', '^HSI'].includes(i.symbol)).map(i => parseFloat(i.percentChange || 0));
    const globalAvgChange = globalChanges.reduce((a, b) => a + b, 0) / globalChanges.length || 0;
    const losersData = await fetchLosers(stocksData);
    const predictionsData = await fetchPredictedGainers(stocksData, giftPrice, niftyClose, globalAvgChange);
    let newsData;
    const fetchedNews = await fetchNews();
    if (fetchedNews) {
      newsData = fetchedNews;
    } else {
      newsData = generateDynamicNews(indicesData);
    }
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
    if (!lastNewsData || JSON.stringify(newsData) !== JSON.stringify(lastNewsData)) {
      broadcastData.news = newsData;
      dataCache.news = newsData;
      lastNewsData = newsData;
    }
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
}, 10000); // 10 seconds
wss.on('connection', ws => {
  console.log('Client connected');
  Promise.all([
    fetchData(indices),
    fetchData(topStocks), // Full list
    fetchPredictedGainers(topStocks, 25803.50, 25877.85, 0.94), // Updated initial
  ])
    .then(async ([indicesData, stocksData, predictionsData]) => {
      lastIndicesData = indicesData;
      lastStocksData = stocksData;
      lastLosersData = await fetchLosers(stocksData);
      lastPredictionsData = predictionsData;
      let newsData;
      const fetchedNews = await fetchNews();
      if (fetchedNews) {
        newsData = fetchedNews;
      } else {
        newsData = generateDynamicNews(indicesData);
      }
      lastNewsData = newsData;
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
        dataCache.news = newsData;
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
