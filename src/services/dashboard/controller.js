const axios = require('axios');

// DummyAPI.io configuration
const API_BASE_URL = 'https://dummyapi.io/data/v1';
const API_KEY = process.env.DUMMYAPI_KEY || '64f2e5c7d2b9f9e9c7d3d3e3';

// Axios instance for dummyapi.io
const dummyApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'app-id': API_KEY
  }
});

// Helper function to generate a random amount between min and max
const randomAmount = (min, max) => {
  return (Math.random() * (max - min) + min).toFixed(2);
};

// Helper function to format time
const formatTime = (date) => {
  const now = new Date();
  const diff = Math.floor((now - new Date(date)) / 60000); // difference in minutes
  
  if (diff < 60) return `${diff} minutes ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)} hours ago`;
  return `${Math.floor(diff / 1440)} days ago`;
};

// Get all dashboard data
exports.getDashboardData = async (req, res) => {
  try {
    console.log('getDashboardData called, fetching data...');
    
    // Get stats, activity, and chart data in parallel
    const [stats, activity, chartData] = await Promise.all([
      this.fetchStats(),
      this.fetchActivity(8), // Limit to 8 recent activities
      this.generateChartData()
    ]);
    
    console.log('Dashboard data fetched:');
    console.log('Stats:', JSON.stringify(stats));
    console.log('Activity count:', activity.length);
    console.log('Chart data available:', !!chartData);
    
    const responseData = {
      stats,
      recentActivity: activity,
      chartData
    };
    
    console.log('Sending response data');
    res.json(responseData);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
};

// Get dashboard statistics
exports.getStats = async (req, res) => {
  try {
    const stats = await this.fetchStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
};

// Get recent activity
exports.getRecentActivity = async (req, res) => {
  try {
    // Get limit from query params or default to 8
    const limit = req.query.limit ? parseInt(req.query.limit) : 8;
    
    const activity = await this.fetchActivity(limit);
    res.json(activity);
  } catch (error) {
    console.error('Error fetching activity:', error);
    res.status(500).json({ error: 'Failed to fetch recent activity' });
  }
};

// Helper method to fetch statistics
exports.fetchStats = async () => {
  try {
    console.log('fetchStats: Attempting to get user count from dummyapi.io');
    // Get user count from dummyapi.io
    const usersResponse = await dummyApi.get('/user?limit=1');
    console.log('fetchStats: DummyAPI response received:', JSON.stringify(usersResponse.data));
    
    const userCount = usersResponse.data.total || 1254;
    console.log('fetchStats: User count determined:', userCount);
    
    // Generate other stats based on user count
    const stats = {
      users: userCount,
      revenue: Math.floor(userCount * 70), // Average revenue per user
      orders: Math.floor(userCount * 0.28), // Average orders per user
      visitors: Math.floor(userCount * 7.8) // Average visitors per user
    };
    
    console.log('fetchStats: Generated stats:', JSON.stringify(stats));
    return stats;
  } catch (error) {
    console.error('Error fetching stats:', error);
    // Fallback to default stats if API fails
    const fallbackStats = {
      users: 1254,
      revenue: 87500,
      orders: 356,
      visitors: 9821
    };
    console.log('fetchStats: Using fallback stats:', JSON.stringify(fallbackStats));
    return fallbackStats;
  }
};

// Helper method to fetch activity
exports.fetchActivity = async (limit) => {
  try {
    // Get users, posts and comments from dummyapi.io
    const [usersResponse, postsResponse, commentsResponse] = await Promise.all([
      dummyApi.get(`/user?limit=${limit}`),
      dummyApi.get(`/post?limit=${limit}`),
      dummyApi.get(`/comment?limit=${limit}`)
    ]);
    
    const users = usersResponse.data.data || [];
    const posts = postsResponse.data.data || [];
    const comments = commentsResponse.data.data || [];
    
    // Create activity items
    const activity = [];
    
    // Add user signups
    users.forEach((user, index) => {
      activity.push({
        id: `signup-${user.id}`,
        type: 'signup',
        user: `${user.firstName} ${user.lastName}`,
        time: formatTime(user.registerDate || new Date())
      });
    });
    
    // Add orders (from posts)
    posts.forEach((post, index) => {
      activity.push({
        id: `order-${post.id}`,
        type: 'order',
        user: `${post.owner.firstName} ${post.owner.lastName}`,
        amount: randomAmount(50, 500),
        time: formatTime(post.publishDate || new Date())
      });
    });
    
    // Add reviews (from comments)
    comments.forEach((comment, index) => {
      activity.push({
        id: `review-${comment.id}`,
        type: 'review',
        user: `${comment.owner.firstName} ${comment.owner.lastName}`,
        rating: Math.floor(Math.random() * 5) + 1, // Random rating 1-5
        time: formatTime(comment.publishDate || new Date())
      });
    });
    
    // Sort by time (most recent first) and limit
    return activity
      .sort((a, b) => {
        // Extract minutes/hours/days and convert to minutes for comparison
        const getMinutes = (timeStr) => {
          const [value, unit] = timeStr.split(' ');
          if (unit.includes('minute')) return parseInt(value);
          if (unit.includes('hour')) return parseInt(value) * 60;
          if (unit.includes('day')) return parseInt(value) * 60 * 24;
          return 0;
        };
        return getMinutes(a.time) - getMinutes(b.time);
      })
      .slice(0, limit);
  } catch (error) {
    console.error('Error fetching activity:', error);
    // Fallback to default activity if API fails
    return [
      { id: 1, type: 'order', user: 'John Doe', amount: 125.99, time: '10 minutes ago' },
      { id: 2, type: 'signup', user: 'Jane Smith', time: '25 minutes ago' },
      { id: 3, type: 'order', user: 'Robert Johnson', amount: 349.50, time: '1 hour ago' },
      { id: 4, type: 'review', user: 'Emily Davis', rating: 5, time: '2 hours ago' },
      { id: 5, type: 'order', user: 'Michael Brown', amount: 78.25, time: '3 hours ago' },
      { id: 6, type: 'signup', user: 'Sarah Wilson', time: '4 hours ago' },
      { id: 7, type: 'order', user: 'David Miller', amount: 199.99, time: '5 hours ago' },
      { id: 8, type: 'review', user: 'Jennifer Taylor', rating: 4, time: '6 hours ago' }
    ].slice(0, limit);
  }
};

// Helper method to generate chart data
exports.generateChartData = async () => {
  try {
    console.log('generateChartData: Starting chart data generation');
    // Get stats for chart data generation
    const stats = await this.fetchStats();
    console.log('generateChartData: Received stats for chart generation:', JSON.stringify(stats));
    
    // Generate revenue data (last 7 days)
    const revenueData = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const day = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      // Generate a value based on the actual revenue with some daily variation
      const baseRevenue = stats.revenue / 30; // Monthly revenue divided by 30 days
      const dailyRevenue = Math.round(baseRevenue * (0.7 + Math.random() * 0.6)); // 70-130% variation
      
      revenueData.push({
        day,
        revenue: dailyRevenue
      });
    }
    console.log('generateChartData: Generated revenue data for 7 days');
    
    // Generate user growth data (last 6 months)
    const userGrowthData = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = today.getMonth();
    
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12; // Handle wrapping around to previous year
      const month = monthNames[monthIndex];
      
      // Generate a value that shows growth over time
      const growthFactor = 1 - (i * 0.1); // Earlier months have fewer users
      const monthlyUsers = Math.round(stats.users * growthFactor * (0.9 + Math.random() * 0.2));
      
      userGrowthData.push({
        month,
        users: monthlyUsers
      });
    }
    console.log('generateChartData: Generated user growth data for 6 months');
    
    // Get activity for activity by type chart
    console.log('generateChartData: Fetching activity data for chart');
    const activity = await this.fetchActivity(20); // Get more activities for better chart data
    console.log('generateChartData: Received activity data, count:', activity.length);
    
    // Generate activity by type data
    const activityCounts = activity.reduce((counts, item) => {
      counts[item.type] = (counts[item.type] || 0) + 1;
      return counts;
    }, {});
    
    const activityByType = Object.entries(activityCounts).map(([type, count]) => ({
      type: type.charAt(0).toUpperCase() + type.slice(1) + 's', // Capitalize and pluralize
      count
    }));
    console.log('generateChartData: Generated activity by type data:', JSON.stringify(activityByType));
    
    const chartData = {
      revenue: revenueData,
      users: userGrowthData,
      activityByType
    };
    
    console.log('generateChartData: Chart data generation complete');
    return chartData;
  } catch (error) {
    console.error('Error generating chart data:', error);
    // Fallback to default chart data if generation fails
    const fallbackChartData = {
      revenue: [
        { day: 'Sun', revenue: 2500 },
        { day: 'Mon', revenue: 3200 },
        { day: 'Tue', revenue: 2800 },
        { day: 'Wed', revenue: 3500 },
        { day: 'Thu', revenue: 3100 },
        { day: 'Fri', revenue: 3800 },
        { day: 'Sat', revenue: 4200 }
      ],
      users: [
        { month: 'Dec', users: 800 },
        { month: 'Jan', users: 900 },
        { month: 'Feb', users: 950 },
        { month: 'Mar', users: 1050 },
        { month: 'Apr', users: 1150 },
        { month: 'May', users: 1250 }
      ],
      activityByType: [
        { type: 'Orders', count: 4 },
        { type: 'Signups', count: 2 },
        { type: 'Reviews', count: 2 }
      ]
    };
    console.log('generateChartData: Using fallback chart data');
    return fallbackChartData;
  }
};
