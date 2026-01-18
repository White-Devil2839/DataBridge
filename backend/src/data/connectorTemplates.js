/**
 * Pre-built Connector Templates
 * These templates provide ready-to-use configurations for popular APIs
 */

export const connectorTemplates = [
    {
        id: 'alpha-vantage-stocks',
        name: 'Alpha Vantage - Stock Quotes',
        description: 'Real-time and historical stock market data',
        provider: 'Alpha Vantage',
        category: 'Financial',
        docsUrl: 'https://www.alphavantage.co/documentation/',
        signupUrl: 'https://www.alphavantage.co/support/#api-key',
        baseUrl: 'https://www.alphavantage.co',
        authType: 'API_KEY',
        authConfig: {
            apiKey: '',
            headerName: 'X-API-Key',
        },
        endpointConfig: [
            {
                path: '/query?function=GLOBAL_QUOTE&symbol=AAPL&apikey={{apiKey}}',
                method: 'GET',
                description: 'Get real-time quote for a stock symbol',
            },
        ],
        fieldMappingConfig: {
            mappings: [
                { source: 'Global Quote.01. symbol', target: 'symbol', type: 'string', isEntityKey: true },
                { source: 'Global Quote.05. price', target: 'price', type: 'number' },
                { source: 'Global Quote.02. open', target: 'open', type: 'number' },
                { source: 'Global Quote.03. high', target: 'high', type: 'number' },
                { source: 'Global Quote.04. low', target: 'low', type: 'number' },
                { source: 'Global Quote.06. volume', target: 'volume', type: 'number' },
                { source: 'Global Quote.07. latest trading day', target: 'date', type: 'date' },
            ],
        },
        rateLimitConfig: {
            requestsPerMinute: 5,
            retryAttempts: 3,
        },
    },
    {
        id: 'coingecko-crypto',
        name: 'CoinGecko - Crypto Prices',
        description: 'Cryptocurrency prices, market data, and metadata',
        provider: 'CoinGecko',
        category: 'Crypto',
        docsUrl: 'https://www.coingecko.com/en/api/documentation',
        signupUrl: 'https://www.coingecko.com/en/api',
        baseUrl: 'https://api.coingecko.com/api/v3',
        authType: 'NONE',
        authConfig: {},
        endpointConfig: [
            {
                path: '/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1',
                method: 'GET',
                description: 'Get top 100 cryptocurrencies by market cap',
            },
        ],
        fieldMappingConfig: {
            mappings: [
                { source: 'id', target: 'coinId', type: 'string', isEntityKey: true },
                { source: 'symbol', target: 'symbol', type: 'string' },
                { source: 'name', target: 'name', type: 'string' },
                { source: 'current_price', target: 'price', type: 'number' },
                { source: 'market_cap', target: 'marketCap', type: 'number' },
                { source: 'total_volume', target: 'volume24h', type: 'number' },
                { source: 'price_change_percentage_24h', target: 'change24h', type: 'number' },
                { source: 'last_updated', target: 'updatedAt', type: 'date' },
            ],
        },
        rateLimitConfig: {
            requestsPerMinute: 10,
            retryAttempts: 3,
        },
    },
    {
        id: 'newsapi-headlines',
        name: 'NewsAPI - Top Headlines',
        description: 'Breaking news headlines from around the world',
        provider: 'NewsAPI',
        category: 'News',
        docsUrl: 'https://newsapi.org/docs',
        signupUrl: 'https://newsapi.org/register',
        baseUrl: 'https://newsapi.org/v2',
        authType: 'API_KEY',
        authConfig: {
            apiKey: '',
            headerName: 'X-Api-Key',
        },
        endpointConfig: [
            {
                path: '/top-headlines?country=us&pageSize=20',
                method: 'GET',
                description: 'Get top US news headlines',
            },
        ],
        fieldMappingConfig: {
            mappings: [
                { source: 'articles.title', target: 'title', type: 'string' },
                { source: 'articles.description', target: 'description', type: 'string' },
                { source: 'articles.url', target: 'url', type: 'string', isEntityKey: true },
                { source: 'articles.source.name', target: 'source', type: 'string' },
                { source: 'articles.publishedAt', target: 'publishedAt', type: 'date' },
                { source: 'articles.author', target: 'author', type: 'string' },
            ],
        },
        rateLimitConfig: {
            requestsPerMinute: 100,
            retryAttempts: 3,
        },
    },
    {
        id: 'exchangerate-currency',
        name: 'ExchangeRate - Currency Rates',
        description: 'Live foreign exchange rates',
        provider: 'ExchangeRate API',
        category: 'Financial',
        docsUrl: 'https://www.exchangerate-api.com/docs/overview',
        signupUrl: 'https://www.exchangerate-api.com/',
        baseUrl: 'https://api.exchangerate.host',
        authType: 'NONE',
        authConfig: {},
        endpointConfig: [
            {
                path: '/latest?base=USD',
                method: 'GET',
                description: 'Get latest exchange rates with USD base',
            },
        ],
        fieldMappingConfig: {
            mappings: [
                { source: 'base', target: 'baseCurrency', type: 'string', isEntityKey: true },
                { source: 'date', target: 'date', type: 'date' },
                { source: 'rates.EUR', target: 'EUR', type: 'number' },
                { source: 'rates.GBP', target: 'GBP', type: 'number' },
                { source: 'rates.JPY', target: 'JPY', type: 'number' },
                { source: 'rates.CAD', target: 'CAD', type: 'number' },
                { source: 'rates.AUD', target: 'AUD', type: 'number' },
                { source: 'rates.INR', target: 'INR', type: 'number' },
            ],
        },
        rateLimitConfig: {
            requestsPerMinute: 100,
            retryAttempts: 3,
        },
    },
    {
        id: 'finnhub-market',
        name: 'Finnhub - Market Data',
        description: 'Real-time RESTful APIs for stocks, forex, crypto',
        provider: 'Finnhub',
        category: 'Financial',
        docsUrl: 'https://finnhub.io/docs/api',
        signupUrl: 'https://finnhub.io/register',
        baseUrl: 'https://finnhub.io/api/v1',
        authType: 'API_KEY',
        authConfig: {
            apiKey: '',
            headerName: 'X-Finnhub-Token',
        },
        endpointConfig: [
            {
                path: '/quote?symbol=AAPL',
                method: 'GET',
                description: 'Get real-time quote for a stock',
            },
        ],
        fieldMappingConfig: {
            mappings: [
                { source: 'c', target: 'currentPrice', type: 'number' },
                { source: 'd', target: 'change', type: 'number' },
                { source: 'dp', target: 'changePercent', type: 'number' },
                { source: 'h', target: 'high', type: 'number' },
                { source: 'l', target: 'low', type: 'number' },
                { source: 'o', target: 'open', type: 'number' },
                { source: 'pc', target: 'previousClose', type: 'number' },
                { source: 't', target: 'timestamp', type: 'number' },
            ],
        },
        rateLimitConfig: {
            requestsPerMinute: 60,
            retryAttempts: 3,
        },
    },
    {
        id: 'openweather-current',
        name: 'OpenWeatherMap - Current Weather',
        description: 'Current weather data for any location',
        provider: 'OpenWeatherMap',
        category: 'Weather',
        docsUrl: 'https://openweathermap.org/current',
        signupUrl: 'https://openweathermap.org/api',
        baseUrl: 'https://api.openweathermap.org/data/2.5',
        authType: 'API_KEY',
        authConfig: {
            apiKey: '',
            headerName: 'appid', // Query param style
        },
        endpointConfig: [
            {
                path: '/weather?q=London&units=metric&appid={{apiKey}}',
                method: 'GET',
                description: 'Get current weather for a city',
            },
        ],
        fieldMappingConfig: {
            mappings: [
                { source: 'name', target: 'city', type: 'string', isEntityKey: true },
                { source: 'main.temp', target: 'temperature', type: 'number' },
                { source: 'main.feels_like', target: 'feelsLike', type: 'number' },
                { source: 'main.humidity', target: 'humidity', type: 'number' },
                { source: 'weather.0.main', target: 'condition', type: 'string' },
                { source: 'weather.0.description', target: 'description', type: 'string' },
                { source: 'wind.speed', target: 'windSpeed', type: 'number' },
                { source: 'dt', target: 'timestamp', type: 'number' },
            ],
        },
        rateLimitConfig: {
            requestsPerMinute: 60,
            retryAttempts: 3,
        },
    },
];

/**
 * Get all templates
 */
export const getTemplates = () => {
    return connectorTemplates.map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        provider: t.provider,
        category: t.category,
        docsUrl: t.docsUrl,
        signupUrl: t.signupUrl,
        authType: t.authType,
    }));
};

/**
 * Get template by ID with full configuration
 */
export const getTemplateById = (id) => {
    return connectorTemplates.find((t) => t.id === id);
};

/**
 * Get templates by category
 */
export const getTemplatesByCategory = (category) => {
    return connectorTemplates.filter((t) => t.category === category);
};

/**
 * Get unique categories
 */
export const getCategories = () => {
    return [...new Set(connectorTemplates.map((t) => t.category))];
};
