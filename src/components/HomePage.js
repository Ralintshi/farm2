import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, onSnapshot, query, orderBy, setDoc, doc } from "firebase/firestore";
import { db } from "../FirebaseConfig";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import "./HomePage.css";
import logoImg from "./download.png";

const HomePage = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [weather, setWeather] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [forumNotificationsCount, setForumNotificationsCount] = useState(0); // New state for forum notifications count
  const [showNotifications, setShowNotifications] = useState(false);
  const [newNotification, setNewNotification] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [marketInsights, setMarketInsights] = useState({
    mostSupplied: [],
    demandByArea: [],
    mostDemanded: [],
  });
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [selectedUser, setSelectedUser] = useState(localStorage.getItem("selectedUser") || "");
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  const carouselImages = ["/images/t3.jpg", "/images/g2.jpg", "/images/p1.jpg"];

  const iconToEmoji = {
    '01d': '☀️', // Clear sky day
    '01n': '🌙', // Clear sky night
    '02d': '⛅', // Few clouds day
    '02n': '🌙☁️', // Few clouds night
    '03d': '☁️', // Scattered clouds
    '03n': '☁️',
    '04d': '☁️☁️', // Broken clouds
    '04n': '☁️☁️',
    '09d': '🌧️', // Shower rain
    '09n': '🌧️',
    '10d': '🌦️', // Rain
    '10n': '🌧️',
    '11d': '⛈️', // Thunderstorm
    '11n': '⛈️',
    '13d': '❄️', // Snow
    '13n': '❄️',
    '50d': '🌫️', // Mist
    '50n': '🌫️',
  };

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const toggleNotifications = () => setShowNotifications(!showNotifications);

  const handleNavigation = (path) => {
    navigate(path);
    setMenuOpen(false);
    setShowNotifications(false);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersQuery = query(collection(db, "users"));
        const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
          const usersData = snapshot.docs.map(doc => doc.data().username || doc.data().displayName);
          setUsers(usersData.filter(Boolean));
        });
        return unsubscribe;
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (!selectedUser) {
      setNotifications([]);
      setNewNotification(false);
      setForumNotificationsCount(0); // Reset forum notifications count
      return;
    }
    const q = query(
      collection(db, `users/${selectedUser}/notifications`),
      orderBy("timestamp", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notificationsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNotifications(notificationsData);
      // Count unread forum-related notifications (type: "topic" or "comment")
      const forumUnreadCount = notificationsData.filter(
        n => !n.read && (n.type === "topic" || n.type === "comment")
      ).length;
      setForumNotificationsCount(forumUnreadCount);
      if (snapshot.docChanges().some(change => change.type === "added" && !change.doc.data().read)) {
        setNewNotification(true);
        setTimeout(() => setNewNotification(false), 3000);
      }
    }, (error) => {
      console.error("Error fetching notifications:", error);
      setError(`Failed to fetch notifications: ${error.message}`);
    });

    return () => unsubscribe();
  }, [selectedUser]);

  const markNotificationAsRead = async (notificationId) => {
    try {
      await setDoc(doc(db, `users/${selectedUser}/notifications`, notificationId), {
        read: true
      }, { merge: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleString();
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "products"),
      (snapshot) => {
        const fetchedProducts = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((product) => product && typeof product === "object" && product.name);
        setProducts(fetchedProducts);

        const mostSuppliedCounts = fetchedProducts
          .reduce((acc, product) => {
            acc[product.name] = (acc[product.name] || 0) + 1;
            return acc;
          }, {});
        const mostSupplied = Object.entries(mostSuppliedCounts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        const demandByAreaCounts = fetchedProducts
          .reduce((acc, product) => {
            if (product.location) {
              acc[product.location] = (acc[product.location] || 0) + 1;
            }
            return acc;
          }, {});
        const demandByArea = Object.entries(demandByAreaCounts)
          .map(([location, count]) => ({ location, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        const mostDemandedCounts = fetchedProducts
          .reduce((acc, product) => {
            acc[product.name] = (acc[product.name] || 0) + 1;
            return acc;
          }, {});
        const mostDemanded = Object.entries(mostDemandedCounts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        setMarketInsights({
          mostSupplied: mostSupplied.length > 0 ? mostSupplied : [{ name: "No data", count: 0 }],
          demandByArea: demandByArea.length > 0 ? demandByArea : [{ location: "No data", count: 0 }],
          mostDemanded: mostDemanded.length > 0 ? mostDemanded : [{ name: "No data", count: 0 }],
        });
      },
      (error) => {
        console.error("Firestore Error:", error.message);
        setError(`Failed to fetch products: ${error.message}`);
      }
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const API_KEY = "b47e41d230faa192a7747dbed4858ef8";
    const CITY = "Maseru";
    const URL = `https://api.openweathermap.org/data/2.5/forecast?q=${CITY}&units=metric&appid=${API_KEY}`;

    fetch(URL)
      .then((response) => response.json())
      .then((data) => {
        if (data && data.list) {
          const dailyForecast = {};
          data.list.forEach((item) => {
            const date = new Date(item.dt_txt).toLocaleDateString('en-US', { weekday: 'long' });
            if (!dailyForecast[date]) {
              dailyForecast[date] = {
                precip: item.pop * 100 || 0,
                icon: item.weather[0]?.icon || '01d',
                high: item.main.temp_max,
                low: item.main.temp_min,
              };
            } else {
              dailyForecast[date].high = Math.max(dailyForecast[date].high, item.main.temp_max);
              dailyForecast[date].low = Math.min(dailyForecast[date].low, item.main.temp_min);
            }
          });

          const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
          const days = [today, ...Object.keys(dailyForecast)
            .filter(day => day !== today)
            .slice(0, 6)];
          const forecastData = days.map(day => ({
            day: day,
            precip: dailyForecast[day]?.precip || 0,
            icon: dailyForecast[day]?.icon || '01d',
            high: Math.round(dailyForecast[day]?.high || 0),
            low: Math.round(dailyForecast[day]?.low || 0),
          }));
          setWeather({ forecast: forecastData });
        }
      })
      .catch((error) => console.error("Error fetching weather data:", error));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentImageIndex((prevIndex) =>
          prevIndex === carouselImages.length - 1 ? 0 : prevIndex + 1
        );
        setFade(true);
      }, 1000);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const filteredProducts = (products || []).filter((product) => {
    if (!product || typeof product !== "object" || !product.name) {
      return false;
    }
    return product.name.toLowerCase().includes((searchQuery || "").toLowerCase());
  });

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleExploreClick = () => {
    const userToken = localStorage.getItem("userToken");
    if (userToken) {
      navigate("/explore");
    } else {
      alert("Please log in to explore products.");
      navigate("/login");
    }
  };

  const COLORS = ['#4CAF50', '#FF9800', '#2196F3', '#F44336', '#9C27B0'];

  return (
    <div className="homepage-container">
      <nav className="nav-bar">
        <div className="logo">
          <img src={logoImg} alt="FarmHub Logo" />
          <span>FarmHub</span>
        </div>
        <input
          type="text"
          className="search-bar"
          placeholder="Search products..."
          value={searchQuery}
          onChange={handleSearchChange}
        />
        <div className="nav-icons">
          <div className={`notification-icon ${newNotification ? 'highlight' : ''}`} onClick={toggleNotifications}>
            🔔
            {notifications.filter(n => !n.read).length > 0 && (
              <span className="notification-badge">
                {notifications.filter(n => !n.read).length}
              </span>
            )}
          </div>
          <div className="menu-icon" onClick={toggleMenu}>☰</div>
        </div>
      </nav>

      {showNotifications && (
        <motion.div
          className="notification-dropdown"
          initial={{ opacity: 0, transform: "translateY(-10px)" }}
          animate={{ opacity: 1, transform: "translateY(0)" }}
          transition={{ duration: 0.5 }}
        >
          <h4>Notifications</h4>
          {!selectedUser ? (
            <p>
              Please select a user in the <a href="/forum" onClick={() => handleNavigation("/forum")}>Forum</a> to view notifications
            </p>
          ) : notifications.length === 0 ? (
            <p>No notifications</p>
          ) : (
            <ul className="notification-list">
              {notifications.map(notification => (
                <li
                  key={notification.id}
                  className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                  onClick={() => {
                    if (notification.type === "topic") {
                      navigate(`/forum#topic-${notification.topicId}`);
                    }
                    if (!notification.read) {
                      markNotificationAsRead(notification.id);
                    }
                  }}
                >
                  <span>{notification.text}</span>
                  <span className="timestamp">
                    {formatTimestamp(notification.timestamp)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </motion.div>
      )}

      {menuOpen && (
        <div className="menu-dropdown">
          <ul>
            <li onClick={() => handleNavigation("/")}>🏠 Home</li>
            <li onClick={() => handleNavigation("/farmplanner")}>📊 Farm Planner</li>
            <li onClick={() => handleNavigation("/announcements")}>🔔 Notifications</li>
            <li onClick={() => handleNavigation("/settings")}>⚙️ Settings</li>
            <li onClick={() => handleNavigation("/login")}>🚪 Logout</li>
          </ul>
        </div>
      )}

      {searchQuery && (
        <div className="search-results">
          {filteredProducts.length > 0 ? (
            <ul>
              {filteredProducts.map((product) => (
                <li key={product.id} onClick={() => handleNavigation(`/product/${product.id}`)}>
                  {product.name} - M{product.price || "N/A"}
                </li>
              ))}
            </ul>
          ) : (
            <p>No products found</p>
          )}
        </div>
      )}

      <div className="product-carousel">
        <img
          src={carouselImages[currentImageIndex]}
          alt={`Product ${currentImageIndex + 1}`}
          className={`product-image ${fade ? "show" : ""}`}
          onLoad={() => setFade(true)}
        />
      </div>

      <div className="market-insights-container">
        <h2>Market Insights</h2>
        {error ? (
          <p className="error-message">{error}</p>
        ) : (
          <div className="insights-grid">
            <div className="insight-section">
              <h3>Most Supplied Products</h3>
              {marketInsights.mostSupplied[0]?.name !== "No data" ? (
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={marketInsights.mostSupplied}>
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => Math.floor(value)}
                        allowDecimals={false}
                      />
                      <Tooltip formatter={(value) => Math.floor(value)} />
                      <Bar dataKey="count" fill="#4CAF50" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="no-data">No supply data available</p>
              )}
            </div>
            <div className="insight-section">
              <h3>Hot Locations</h3>
              {marketInsights.demandByArea[0]?.location !== "No data" ? (
                <div className="chart-container hot-locations-container">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={marketInsights.demandByArea}
                        dataKey="count"
                        nameKey="location"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ location, count }) => `${location}: ${count}`}
                      >
                        {marketInsights.demandByArea.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => Math.floor(value)} />
                      <Legend
                        formatter={(value) => <span style={{ color: "#333" }}>{value}</span>}
                        align="center"
                        verticalAlign="bottom"
                        layout="horizontal"
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="no-data">No location data available</p>
              )}
            </div>
            <div className="insight-section">
              <h3>Most Demanded</h3>
              {marketInsights.mostDemanded[0]?.name !== "No data" ? (
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={marketInsights.mostDemanded}>
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => Math.floor(value)}
                        allowDecimals={false}
                      />
                      <Tooltip formatter={(value) => Math.floor(value)} />
                      <Bar dataKey="count" fill="#4CAF50" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="no-data">No demand data available</p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="weather-container">
        <h2>Weather Forecast</h2>
        {weather ? (
          <div className="weather-forecast">
            {weather.forecast.map((dayData, index) => (
              <div key={index} className="weather-day">
                <p>{dayData.day === new Date().toLocaleDateString('en-US', { weekday: 'long' }) ? 'Today' : dayData.day}</p>
                <p>{Math.round(dayData.precip)}%</p>
                <div className="weather-icon">
                  {iconToEmoji[dayData.icon] ? (
                    <span>{iconToEmoji[dayData.icon]}</span>
                  ) : (
                    <img
                      src={`http://openweathermap.org/img/wn/${dayData.icon}@2x.png`}
                      alt={dayData.icon}
                      className="weather-icon"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'inline';
                      }}
                    />
                  )}
                  <span style={{ display: 'none' }}>{iconToEmoji[dayData.icon] || '🌤️'}</span>
                </div>
                <p>{dayData.high}° {dayData.low}°</p>
              </div>
            ))}
          </div>
        ) : (
          <p>Loading weather forecast...</p>
        )}
      </div>

      <button className="cta-button" onClick={handleExploreClick}>
        Explore Products
      </button>

      <div className="auth-section">
        <button className="sign-up-btn" onClick={() => handleNavigation("/register")}>
          Sign Up
        </button>
        <button className="login-btn" onClick={() => handleNavigation("/login")}>
          Login
        </button>
      </div>

      <div className="forum-link" onClick={() => handleNavigation("/forum")}>
        <h1>💬</h1>
        {forumNotificationsCount > 0 && (
          <span className="forum-notification-badge">
            {forumNotificationsCount}
          </span>
        )}
      </div>

      <div className="footer">
        <p>© 2025 FarmHub. All Rights Reserved.</p>
        <p>
          <a href="#">Privacy Policy</a> | <a href="#">Terms of Service</a>
        </p>
      </div>
    </div>
  );
};

export default HomePage;