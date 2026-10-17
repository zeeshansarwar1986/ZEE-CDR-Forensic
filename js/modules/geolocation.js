/* ==========================================================================
   MODULE: GEO-LOCATION & MOVEMENT INTELLIGENCE
   Integrated with Map / Geocoding APIs & High-Definition Dark Map Tiles
   ========================================================================== */

window.GeoLocationModule = {
  apiKey: '', // Removed old API key - ready for new API key
  map: null,
  layers: {
    towers: L.layerGroup(),
    routes: L.layerGroup(),
    geoapifyPin: L.layerGroup(),
    animatedMarker: null
  },
  playbackTimer: null,
  playbackIndex: 0,
  playbackSpeed: 500,

  init: function() {
    this.initMap();
    this.bindEvents();
  },

  initMap: function() {
    const mapEl = document.getElementById('gis-map');
    if (!mapEl || this.map) return;

    // Default view centered on Islamabad / Rawalpindi sector
    this.map = L.map('gis-map').setView([33.6844, 73.0479], 12);

    // If API key is provided, use Geoapify dark tiles; otherwise use CartoDB Dark Matter (free & high contrast)
    if (this.apiKey) {
      const tileUrl = `https://maps.geoapify.com/v1/tile/dark-matter-dark/{z}/{x}/{y}.png?apiKey=${this.apiKey}`;
      L.tileLayer(tileUrl, {
        maxZoom: 20,
        attribution: 'Powered by <a href="https://www.geoapify.com/" target="_blank">Geoapify</a> | © OpenStreetMap contributors'
      }).addTo(this.map);
    } else {
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      }).addTo(this.map);
    }

    this.layers.towers.addTo(this.map);
    this.layers.routes.addTo(this.map);
    this.layers.geoapifyPin.addTo(this.map);

    this.plotData();

    // Reverse Geocoding on Map Click
    this.map.on('click', (e) => {
      this.reverseGeocode(e.latlng.lat, e.latlng.lng);
    });
  },

  plotData: function() {
    this.layers.towers.clearLayers();
    this.layers.routes.clearLayers();

    const records = window.CDRDataStore.cdrRecords;
    if (!records || records.length === 0) return;

    // Group by location/cellId
    const locationMap = {};
    const routePoints = [];

    records.forEach(r => {
      if (!locationMap[r.cellId]) {
        locationMap[r.cellId] = {
          id: r.cellId,
          name: r.locationName,
          lat: r.lat,
          lng: r.lng,
          count: 0,
          firstCall: r.timestamp,
          lastCall: r.timestamp
        };
      }
      locationMap[r.cellId].count++;
      locationMap[r.cellId].lastCall = r.timestamp;

      routePoints.push([r.lat, r.lng]);
    });

    // Add Tower Markers
    Object.values(locationMap).forEach(loc => {
      const marker = L.circleMarker([loc.lat, loc.lng], {
        radius: 8 + Math.min(loc.count / 20, 10),
        fillColor: '#00a8ff',
        color: '#ffffff',
        weight: 2,
        fillOpacity: 0.85
      });

      marker.bindPopup(`
        <div style="color:#0f172a; font-family:sans-serif; min-width:200px;">
          <h4 style="margin:0 0 4px 0; color:#0056b3; font-size:0.95rem;">${loc.name}</h4>
          <div><b>Cell Tower ID:</b> ${loc.id}</div>
          <div><b>Total Calls Recorded:</b> ${loc.count}</div>
          <div><b>First Visit:</b> ${loc.firstCall}</div>
          <div><b>Last Visit:</b> ${loc.lastCall}</div>
          <div style="margin-top:6px; font-size:0.75rem; color:#64748b;">
            <i class="fa-solid fa-earth-americas"></i> Geoapify Verified Location
          </div>
        </div>
      `);

      this.layers.towers.addLayer(marker);
    });

    // Add Route Polyline
    const uniqueRoute = [];
    routePoints.forEach(pt => {
      if (uniqueRoute.length === 0 || uniqueRoute[uniqueRoute.length - 1][0] !== pt[0] || uniqueRoute[uniqueRoute.length - 1][1] !== pt[1]) {
        uniqueRoute.push(pt);
      }
    });

    if (uniqueRoute.length > 1) {
      const polyline = L.polyline(uniqueRoute, {
        color: '#00a8ff',
        weight: 3,
        dashArray: '6, 8',
        opacity: 0.85
      });
      this.layers.routes.addLayer(polyline);
    }
  },

  bindEvents: function() {
    const playBtn = document.getElementById('btn-playback-play');
    if (playBtn) playBtn.onclick = () => this.startPlayback();

    const pauseBtn = document.getElementById('btn-playback-pause');
    if (pauseBtn) pauseBtn.onclick = () => this.pausePlayback();

    const speedSelect = document.getElementById('playback-speed-select');
    if (speedSelect) {
      speedSelect.onchange = (e) => {
        const mult = parseInt(e.target.value, 10);
        this.playbackSpeed = 1000 / mult;
      };
    }

    // Geoapify Search Button & Input Event
    const searchBtn = document.getElementById('btn-geoapify-search');
    const searchInput = document.getElementById('geoapify-search-input');

    if (searchBtn && searchInput) {
      searchBtn.onclick = () => {
        const query = searchInput.value.trim();
        if (query) this.searchGeoapify(query);
      };

      searchInput.onkeypress = (e) => {
        if (e.key === 'Enter') {
          const query = searchInput.value.trim();
          if (query) this.searchGeoapify(query);
        }
      };
    }
  },

  // Geoapify Geocoding API Search Function
  searchGeoapify: function(query) {
    const resultBox = document.getElementById('geoapify-search-result');
    if (!this.apiKey) {
      if (resultBox) {
        resultBox.style.display = 'block';
        resultBox.innerHTML = `<span class="text-amber"><i class="fa-solid fa-key"></i> براہ کرم نقشہ تلاش کے لیے نئی API Key درج کریں (Awaiting New API Key).</span>`;
      }
      if (window.App && window.App.showToast) {
        window.App.showToast('Please provide an API Key for Geocoding Search', 'warning');
      }
      return;
    }

    if (resultBox) {
      resultBox.style.display = 'block';
      resultBox.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Querying Geoapify Geocoding API for "${query}"...`;
    }

    const endpoint = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(query)}&apiKey=${this.apiKey}`;

    fetch(endpoint)
      .then(res => res.json())
      .then(data => {
        if (data && data.features && data.features.length > 0) {
          const first = data.features[0];
          const lat = first.geometry.coordinates[1];
          const lon = first.geometry.coordinates[0];
          const properties = first.properties;
          const formattedAddress = properties.formatted || query;

          // Clear previous pin
          this.layers.geoapifyPin.clearLayers();

          // Create animated Geoapify Pin Marker
          const marker = L.marker([lat, lon], {
            icon: L.divIcon({
              className: 'geoapify-custom-pin',
              html: `<div style="background:#00a8ff; width:20px; height:20px; border-radius:50%; border:3px solid #ffffff; box-shadow:0 0 16px #00a8ff;"></div>`
            })
          });

          marker.bindPopup(`
            <div style="color:#0f172a; font-family:sans-serif; min-width:240px;">
              <div style="font-size:0.7rem; text-transform:uppercase; font-weight:700; color:#0056b3;">
                <i class="fa-solid fa-location-dot"></i> Geocoded Target
              </div>
              <h4 style="margin:4px 0; color:#0f172a; font-size:0.95rem;">${formattedAddress}</h4>
              <div style="font-size:0.8rem; margin-top:4px;"><b>Latitude:</b> ${lat.toFixed(5)}</div>
              <div style="font-size:0.8rem;"><b>Longitude:</b> ${lon.toFixed(5)}</div>
              ${properties.country ? `<div style="font-size:0.8rem;"><b>Country:</b> ${properties.country}</div>` : ''}
              ${properties.postcode ? `<div style="font-size:0.8rem;"><b>Postcode:</b> ${properties.postcode}</div>` : ''}
            </div>
          `).openPopup();

          this.layers.geoapifyPin.addLayer(marker);

          // Smooth fly-to animation
          this.map.flyTo([lat, lon], 16, { duration: 1.5 });

          if (resultBox) {
            resultBox.innerHTML = `<i class="fa-solid fa-circle-check text-green"></i> Found Address: <strong>${formattedAddress}</strong> (${lat.toFixed(4)}, ${lon.toFixed(4)})`;
          }

          if (window.App && window.App.showToast) {
            window.App.showToast(`Found: ${formattedAddress}`, 'success');
          }
        } else {
          if (resultBox) {
            resultBox.innerHTML = `<span class="text-red"><i class="fa-solid fa-triangle-exclamation"></i> No results found for "${query}".</span>`;
          }
        }
      })
      .catch(err => {
        console.error('Geocoding Error:', err);
        if (resultBox) {
          resultBox.innerHTML = `<span class="text-red"><i class="fa-solid fa-triangle-exclamation"></i> Geocoding API Error. Check internet connection.</span>`;
        }
      });
  },

  // Geoapify Reverse Geocoding API
  reverseGeocode: function(lat, lng) {
    if (!this.apiKey) return;
    const endpoint = `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&apiKey=${this.apiKey}`;

    fetch(endpoint)
      .then(res => res.json())
      .then(data => {
        if (data && data.features && data.features.length > 0) {
          const properties = data.features[0].properties;
          const formatted = properties.formatted || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

          L.popup()
            .setLatLng([lat, lng])
            .setContent(`
              <div style="color:#0f172a; font-family:sans-serif;">
                <div style="font-size:0.7rem; text-transform:uppercase; font-weight:700; color:#0056b3;">
                  <i class="fa-solid fa-globe"></i> Location Details
                </div>
                <div style="font-size:0.85rem; font-weight:600; margin-top:2px;">${formatted}</div>
                <div style="font-size:0.75rem; color:#64748b; margin-top:4px;">Coordinates: ${lat.toFixed(5)}, ${lng.toFixed(5)}</div>
              </div>
            `)
            .openOn(this.map);
        }
      })
      .catch(err => console.error('Reverse Geocode Error:', err));
  },

  startPlayback: function() {
    this.pausePlayback();
    const records = window.CDRDataStore.cdrRecords;
    if (!records || records.length === 0) return;

    const statusLabel = document.getElementById('playback-status-label');

    if (!this.layers.animatedMarker) {
      this.layers.animatedMarker = L.marker([records[0].lat, records[0].lng], {
        icon: L.divIcon({
          className: 'playback-marker',
          html: '<div style="background:#ef4444; width:16px; height:16px; border-radius:50%; border:3px solid #fff; box-shadow:0 0 14px #ef4444;"></div>'
        })
      }).addTo(this.map);
    }

    this.playbackTimer = setInterval(() => {
      if (this.playbackIndex >= records.length) {
        this.playbackIndex = 0;
      }
      const r = records[this.playbackIndex];
      this.layers.animatedMarker.setLatLng([r.lat, r.lng]);

      if (statusLabel) {
        statusLabel.innerText = `[${this.playbackIndex + 1}/${records.length}] ${r.timestamp} - ${r.locationName}`;
      }

      this.playbackIndex += 5;
    }, this.playbackSpeed);
  },

  pausePlayback: function() {
    if (this.playbackTimer) {
      clearInterval(this.playbackTimer);
      this.playbackTimer = null;
    }
    const statusLabel = document.getElementById('playback-status-label');
    if (statusLabel) statusLabel.innerText = 'Paused';
  }
};
