# Port API Pull Request Chart

A web application that visualizes GitHub Pull Request analytics from Port.io API data. This tool fetches pull request entities from Port and displays them in interactive charts with various metrics and time ranges.

## What this code does?

This application provides:

- **Data Visualization**: Interactive charts (bar and line charts) showing pull request metrics over time
- **Port API Integration**: Connects to Port.io API to fetch GitHub Pull Request entities
- **CORS Proxy Server**: Includes a Node.js server that acts as a CORS proxy to handle cross-origin requests
- **Multiple Metrics**: Displays hours, count, and average hours for pull requests
- **JSON Property Explorer**: Dropdown to visualize any property from the Port API response
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
- **Time Range**: Filter data by:
  - **Days**: Last 7, 30, or 90 days
  - **Months**: Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec (current year)
- **Metric**: Choose between:
  - **Hours**: Total hours spent on pull requests
  - **Count**: Number of pull requests
  - **Average Hours**: Average hours per pull request
- **Demo Data Explorer** (⚠️ Demo purposes only):
  - **JSON Property**: Explore any property from the Port API response
  - **Property Value**: Select specific values of the selected property
- **Filter Controls**:
  - **Current Selection**: Editable text box that displays and accepts filter input in format "property = value"
  - **Apply Filter Button**: Apply the selected or manually entered filter to update the chart
  - **Clear Filter Button**: Reset property value filter back to "All Values"

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
2. Extracting all available properties from the API response
3. Populating the JSON Property dropdown with discovered fields
4. Calculating time differences between `createdAt` and `updatedAt` (for default metrics)
5. Grouping data by date (for default metrics)
6. Aggregating metrics (hours, count, averages) (for default metrics)
7. Sorting chronologically for chart display

### JSON Property Explorer & Filtering

The JSON Property system allows you to explore and filter any field from the Port API response:

#### Property Selection
- **Automatic Discovery**: The application automatically scans all entities and extracts available properties
- **Nested Properties**: Supports nested properties like `properties.status` or `relations.assignee`
- **Data Type Handling**: Automatically converts different data types:
  - Numbers: Displayed as-is
  - Strings: Converted to numbers if possible, otherwise 0
  - Booleans: Converted to 1 (true) or 0 (false)
  - Objects/Arrays: Default to 0

#### Value Filtering (Demo Feature)
⚠️ **Note**: The JSON Property and Property Value controls are for demo purposes only to help understand your data structure. They should not be used in production.

- **Dynamic Value Discovery**: When you select a property, the second dropdown automatically populates with all unique values found in that property
- **Manual Filter Application**: Select a property value and click "Apply Filter" to update the chart
- **Editable Filter Input**: Type filters directly in the "Current Selection" text box using format "property = value"
- **Clear Filter Button**: Reset the property value filter back to "All Values" (keeps the selected JSON property)
- **Selection Display**: The text box shows your current selection and accepts manual input
- **Clean Chart Labels**: Chart axis labels remain unchanged - only the data is filtered

#### Example Usage
1. **Using Dropdowns**:
   - Select `properties.status` from the JSON Property dropdown
   - The Property Value dropdown will show options like: "All Values", "open", "closed", "merged"
   - Select "open" from the Property Value dropdown
   - The Current Selection box will show: "properties.status = open"
   - Click "Apply Filter" to update the chart with only open pull requests

2. **Using Manual Input**:
   - Type directly in the Current Selection box: "properties.status = closed"
   - Click "Apply Filter" to update the chart with only closed pull requests

3. **Clear Filter**: Click "Clear Filter" to reset back to "All Values" and apply the change

### Sample Data

If no real data is available, the application displays sample data for demonstration purposes, showing mock pull request metrics over a 7-day period.
