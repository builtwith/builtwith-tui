const axios = require('axios');

const BASE_URL = 'https://api.builtwith.com';

const ENDPOINTS = {
  whoami: {
    name: 'WhoAmI',
    description: 'Check API key identity and plan details',
    path: '/whoamiv1/api.json',
    params: [],
  },
  usage: {
    name: 'Usage',
    description: 'View API usage statistics',
    path: '/usagev2/api.json',
    params: [],
  },
  domain: {
    name: 'Domain API',
    description: 'Technology + metadata for a domain',
    path: '/v22/api.json',
    params: [
      { name: 'LOOKUP', required: true, description: 'Domain to look up (e.g. example.com)' },
      { name: 'NOPII', required: false, description: 'Exclude PII (1 to enable)' },
      { name: 'NOMETA', required: false, description: 'Exclude metadata (1 to enable)' },
      { name: 'NOATTR', required: false, description: 'Exclude attributes (1 to enable)' },
      { name: 'LIVEONLY', required: false, description: 'Only live technologies (1 to enable)' },
      { name: 'FDRANGE', required: false, description: 'First detected date range filter' },
      { name: 'LDRANGE', required: false, description: 'Last detected date range filter' },
    ],
  },
  lists: {
    name: 'Lists API',
    description: 'Sites using a specific technology',
    path: '/lists12/api.json',
    params: [
      { name: 'TECH', required: true, description: 'Technology name (e.g. Shopify)' },
      { name: 'OFFSET', required: false, description: 'Pagination offset token' },
    ],
  },
  relationships: {
    name: 'Relationships API',
    description: 'Relationships between sites via shared identifiers',
    path: '/rv4/api.json',
    params: [
      { name: 'LOOKUP', required: true, description: 'Domain to look up (e.g. example.com)' },
    ],
  },
  free: {
    name: 'Free API',
    description: 'Summary counts and updates for technology groups',
    path: '/free1/api.json',
    params: [
      { name: 'LOOKUP', required: true, description: 'Domain to look up (e.g. example.com)' },
    ],
  },
  companyToUrl: {
    name: 'Company to URL',
    description: 'Discover domains from company names',
    path: '/ctu3/api.json',
    params: [
      { name: 'COMPANY', required: true, description: 'Company name to search' },
    ],
  },
  tags: {
    name: 'Tags API',
    description: 'Domains related to IPs and site attributes',
    path: '/tag1/api.json',
    params: [
      { name: 'LOOKUP', required: true, description: 'Tag lookup (e.g. IP-1.2.3.4)' },
    ],
  },
  recommendations: {
    name: 'Recommendations',
    description: 'Technology recommendations for a domain',
    path: '/rec1/api.json',
    params: [
      { name: 'LOOKUP', required: true, description: 'Domain to look up (e.g. example.com)' },
    ],
  },
  redirects: {
    name: 'Redirects API',
    description: 'Redirect history for a domain',
    path: '/redirect1/api.json',
    params: [
      { name: 'LOOKUP', required: true, description: 'Domain to look up (e.g. example.com)' },
    ],
  },
  keywords: {
    name: 'Keywords API',
    description: 'Keywords associated with a domain',
    path: '/kw2/api.json',
    params: [
      { name: 'LOOKUP', required: true, description: 'Domain to look up (e.g. example.com)' },
    ],
  },
  trends: {
    name: 'Trends API',
    description: 'Technology adoption trends',
    path: '/trends/v6/api.json',
    params: [
      { name: 'TECH', required: true, description: 'Technology name (e.g. Shopify)' },
    ],
  },
  product: {
    name: 'Product API',
    description: 'Find websites selling specific products',
    path: '/productv1/api.json',
    params: [
      { name: 'QUERY', required: true, description: 'Product search query' },
      { name: 'PAGE', required: false, description: 'Page number (default 0)' },
      { name: 'LIMIT', required: false, description: 'Results per page (default 50)' },
    ],
  },
  trust: {
    name: 'Trust API',
    description: 'Trust and fraud signals for a domain',
    path: '/trustv1/api.json',
    params: [
      { name: 'LOOKUP', required: true, description: 'Domain to look up (e.g. example.com)' },
    ],
  },
};

async function callApi(endpointKey, apiKey, paramValues) {
  const endpoint = ENDPOINTS[endpointKey];
  if (!endpoint) throw new Error(`Unknown endpoint: ${endpointKey}`);

  const queryParams = { KEY: apiKey };
  for (const [key, value] of Object.entries(paramValues)) {
    if (value !== undefined && value !== '') {
      queryParams[key] = value;
    }
  }

  const url = `${BASE_URL}${endpoint.path}`;
  const response = await axios.get(url, {
    params: queryParams,
    timeout: 30000,
  });

  return response.data;
}

module.exports = { ENDPOINTS, callApi, BASE_URL };
