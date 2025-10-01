# Port API Pull Request Chart

A web application that visualizes GitHub Pull Request analytics from Port.io API data. This tool fetches pull request entities from Port and displays them in interactive charts with various metrics and time ranges.

## What this code does?

This application provides:

- **Data Visualization**: Interactive charts (bar and line charts) showing pull request metrics over time
- **Port API Integration**: Connects to Port.io API to fetch GitHub Pull Request entities
- **CORS Proxy Server**: Includes a Node.js server that acts as a CORS proxy to handle cross-origin requests
- **Multiple Metrics**: Displays hours, count, and average hours for pull requests
- **Time Range Filtering**: Filter data by last 7, 30, or 90 days
- **Debug Tools**: Built-in debugging features to troubleshoot API connections and data processing
- **Multi-Region Support**: Supports both Europe (`api.port.io`) and US (`api.us.port.io`) Port regions

### Key Features:
- Real-time data fetching from Port API
- Interactive Chart.js visualizations
- Comprehensive error handling and debugging
- CORS proxy to bypass browser security restrictions
- Blueprint discovery and testing tools
- Sample data fallback for demonstration

## How to use the server and API

### Prerequisites
- Node.js installed on your system
- A valid Port.io API token
- Access to a Port instance with GitHub Pull Request blueprint

### Getting Started

1. **Clone or download the project**
   ```bash
   cd port-pr-chart
   ```

2. **Start the server**
   ```bash
   node server.js
   ```
   The server will start on `http://localhost:8000`

3. **Open the application**
   Navigate to `http://localhost:8000` in your web browser

### Using the Application

#### 1. Configure API Access
- **API Token**: Enter your Port API token (get from Port → Settings → Credentials → Generate API token)
- **Region**: Select your Port region (Europe or US)
- **CORS Proxy**: Toggle between using the local proxy server or external CORS proxy

#### 2. Load Data
- Click **"Load Data"** to fetch pull request entities from Port
- The application will process the data and display it in the chart

#### 3. Customize Visualization
- **Chart Type**: Switch between bar and line charts
- **Time Range**: Filter data by last 7, 30, or 90 days
- **Metric**: Choose between:
  - **Hours**: Total hours spent on pull requests
  - **Count**: Number of pull requests
  - **Average Hours**: Average hours per pull request

#### 4. Debug Tools
- **Test Endpoint**: Verify API connectivity
- **List Blueprints**: Discover available blueprints in your Port instance
- **Test Local Connection**: Check if the local server is working
- **Debug Information**: View raw API responses and processed data

### API Endpoints

The server provides the following endpoints:

#### Main Application
- `GET /` - Serves the main HTML application
- `GET /index.html` - Alternative route to the main application

#### API Proxy
- `GET /api/*` - Proxies requests to Port API
  - Example: `GET /api/v1/blueprints/githubPullRequest/entities`
  - Forwards to: `https://api.port.io/v1/blueprints/githubPullRequest/entities`

#### CORS Headers
All responses include CORS headers to allow cross-origin requests:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type, Authorization`

### Troubleshooting

#### Common Issues:

1. **403 Forbidden Error**
   - Invalid or expired API token
   - Token lacks required permissions
   - Blueprint 'githubPullRequest' doesn't exist
   - Generate a new API token (3-hour expiry)

2. **401 Unauthorized Error**
   - Invalid API token
   - Authentication failed
   - Generate a new token from Port → Settings → Credentials

3. **404 Not Found Error**
   - Blueprint 'githubPullRequest' not found
   - Check if the blueprint exists in your Port instance

4. **CORS Issues**
   - Use the local proxy server (recommended)
   - Or enable the CORS proxy option
   - Check browser console for detailed error messages

#### Debug Steps:
1. Use **"Test Local Connection"** to verify server is running
2. Use **"Test Endpoint"** to check API connectivity
3. Use **"List Blueprints"** to verify available blueprints
4. Check the debug information tab for detailed error logs

### Server Configuration

The server runs on port 8000 by default. To change the port, modify the `PORT` variable in `server.js`:

```javascript
const PORT = 8000; // Change this to your desired port
```

### Data Processing

The application processes Port API data by:
1. Fetching entities from the `githubPullRequest` blueprint
2. Calculating time differences between `createdAt` and `updatedAt`
3. Grouping data by date
4. Aggregating metrics (hours, count, averages)
5. Sorting chronologically for chart display

### Sample Data

If no real data is available, the application displays sample data for demonstration purposes, showing mock pull request metrics over a 7-day period.
