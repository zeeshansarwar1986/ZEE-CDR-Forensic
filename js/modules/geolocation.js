/* ==========================================================================
   MODULE: GEO-LOCATION & MOVEMENT INTELLIGENCE
   Integrated with LocationIQ Geocoding API & High-Definition Dark Map Tiles
   API Key: pk.80bbc1c5ad114bb07d75f02cf8820cb0
   ========================================================================== */

window.GeoLocationModule = {
  apiKey: 'pk.80bbc1c5ad114bb07d75f02cf8820cb0',
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
  eventsBound: false,

  init: function() {
    this.initMap();
    this.bindEvents();
    this.invalidateSize();
  },

  invalidateSize: function() {
    if (this.map) {
      setTimeout(() => {
        try {
          this.map.invalidateSize();
        } catch (e) {
          console.warn('Map invalidateSize error:', e);
        }
      }, 150);
    }
  },

  initMap: function() {
    const mapEl = document.getElementById('gis-map');
    if (!mapEl) return;

    if (this.map) {
      this.plotData();
      return;
    }

    // Default view centered on Islamabad / Rawalpindi sector
    this.map = L.map('gis-map').setView([33.6844, 73.0479], 12);

    // LocationIQ Dark Mode Tile Layer
    const tileUrl = `https://tiles.locationiq.com/v3/dark/r/{z}/{x}/{y}.png?key=${this.apiKey}`;
    L.tileLayer(tileUrl, {
      maxZoom: 19,
      attribution: 'Powered by <a href="https://locationiq.com/" target="_blank">LocationIQ</a> | &copy; OpenStreetMap contributors'
    }).addTo(this.map);

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

    const records = window.CDRDataStore.cdrRecords || [];
    if (!records || records.length === 0) return;

    // Group by location/cellId
    const locationMap = {};
    const routePoints = [];

    records.forEach(r => {
      if (!r.lat || !r.lng) return;

      if (!locationMap[r.cellId]) {
        locationMap[r.cellId] = {
          id: r.cellId,
          name: r.locationName || 'Tower',
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
            <i class="fa-solid fa-earth-americas"></i> LocationIQ GIS Verified Location
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
    if (this.eventsBound) return;
    this.eventsBound = true;

    const playBtn = document.getElementById('btn-playback-play');
    if (playBtn) playBtn.onclick = () => this.startPlayback();

    const pauseBtn = document.getElementById('btn-playback-pause');
    if (pauseBtn) pauseBtn.onclick = () => this.pausePlayback();

    const speedSelect = document.getElementById('playback-speed-select');
    if (speedSelect) {
      speedSelect.onchange = (e) => {
        const mult = parseInt(e.target.value, 10) || 2;
        this.playbackSpeed = 1000 / mult;
        if (this.playbackTimer) {
          this.startPlayback(); // restart with new speed
        }
      };
    }

    // Geocoding Search Button & Input Event
    const searchBtn = document.getElementById('btn-geoapify-search');
    const searchInput = document.getElementById('geoapify-search-input');

    if (searchBtn && searchInput) {
      searchBtn.onclick = () => {
        const query = searchInput.value.trim();
        if (query) this.searchLocationIQ(query);
      };

      searchInput.onkeypress = (e) => {
        if (e.key === 'Enter') {
          const query = searchInput.value.trim();
          if (query) this.searchLocationIQ(query);
        }
      };
    }
  },

  searchLocationIQ: function(query) {
    const resultBox = document.getElementById('geoapify-search-result');
    if (!this.apiKey) {
      if (resultBox) {
        resultBox.style.display = 'block';
        resultBox.innerHTML = `<span class="text-amber"><i class="fa-solid fa-key"></i> Please configure a LocationIQ API key.</span>`;
      }
      return;
    }

    if (resultBox) {
      resultBox.style.display = 'block';
      resultBox.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Querying LocationIQ Geocoding API for "${query}"...`;
    }

    const endpoint = `https://us1.locationiq.com/v1/search?key=${this.apiKey}&q=${encodeURIComponent(query)}&format=json`;

    fetch(endpoint)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const first = data[0];
          const lat = parseFloat(first.lat);
          const lon = parseFloat(first.lon);
          const formattedAddress = first.display_name || query;
          const address = first.address || {};

          // Clear previous pin
          this.layers.geoapifyPin.clearLayers();

          // Create animated LocationIQ Pin Marker
          const marker = L.marker([lat, lon], {
            icon: L.divIcon({
              className: 'geoapify-custom-pin',
              html: `<div style="background:#00d2d3; width:22px; height:22px; border-radius:50%; border:3px solid #ffffff; box-shadow:0 0 18px #00d2d3;"></div>`
            })
          });

          marker.bindPopup(`
            <div style="color:#0f172a; font-family:sans-serif; min-width:250px;">
              <div style="font-size:0.7rem; text-transform:uppercase; font-weight:700; color:#0984e3;">
                <i class="fa-solid fa-location-crosshairs"></i> LocationIQ Target Found
              </div>
              <h4 style="margin:5px 0; color:#0f172a; font-size:0.9rem; line-height:1.3;">${formattedAddress}</h4>
              <div style="font-size:0.8rem; margin-top:4px;"><b>Latitude:</b> ${lat.toFixed(5)}</div>
              <div style="font-size:0.8rem;"><b>Longitude:</b> ${lon.toFixed(5)}</div>
              ${address.city || address.town ? `<div style="font-size:0.8rem;"><b>City:</b> ${address.city || address.town}</div>` : ''}
              ${address.country ? `<div style="font-size:0.8rem;"><b>Country:</b> ${address.country}</div>` : ''}
            </div>
          `).openPopup();

          this.layers.geoapifyPin.addLayer(marker);

          // Smooth fly-to animation
          this.map.flyTo([lat, lon], 15, { duration: 1.5 });

          if (resultBox) {
            resultBox.innerHTML = `<i class="fa-solid fa-circle-check text-green"></i> Found: <strong>${formattedAddress}</strong> (${lat.toFixed(4)}, ${lon.toFixed(4)})`;
          }

          if (window.App && window.App.showToast) {
            window.App.showToast(`LocationIQ Found: ${formattedAddress.split(',')[0]}`, 'success');
          }
        } else {
          if (resultBox) {
            resultBox.innerHTML = `<span class="text-red"><i class="fa-solid fa-triangle-exclamation"></i> No results found for "${query}".</span>`;
          }
        }
      })
      .catch(err => {
        console.error('LocationIQ Error:', err);
        if (resultBox) {
          resultBox.innerHTML = `<span class="text-red"><i class="fa-solid fa-triangle-exclamation"></i> LocationIQ API Error: ${err.message || 'Check request'}.</span>`;
        }
      });
  },

  reverseGeocode: function(lat, lng) {
    if (!this.apiKey) return;
    const endpoint = `https://us1.locationiq.com/v1/reverse?key=${this.apiKey}&lat=${lat}&lon=${lng}&format=json`;

    fetch(endpoint)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (data && (data.display_name || data.address)) {
          const formatted = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
          const address = data.address || {};

          L.popup()
            .setLatLng([lat, lng])
            .setContent(`
              <div style="color:#0f172a; font-family:sans-serif; min-width:220px;">
                <div style="font-size:0.7rem; text-transform:uppercase; font-weight:700; color:#0984e3;">
                  <i class="fa-solid fa-location-dot"></i> LocationIQ Reverse Geocode
                </div>
                <div style="font-size:0.85rem; font-weight:600; margin-top:3px; line-height:1.3;">${formatted}</div>
                <div style="font-size:0.75rem; color:#64748b; margin-top:5px;">Coordinates: ${lat.toFixed(5)}, ${lng.toFixed(5)}</div>
                ${address.city || address.country ? `<div style="font-size:0.75rem; color:#0369a1; font-weight:600;">${[address.city, address.country].filter(Boolean).join(', ')}</div>` : ''}
              </div>
            `)
            .openOn(this.map);
        }
      })
      .catch(err => console.error('LocationIQ Reverse Error:', err));
  },

  startPlayback: function() {
    this.pausePlayback();
    const records = (window.CDRDataStore.cdrRecords || []).filter(r => r.lat && r.lng);
    if (!records || records.length === 0) {
      if (window.App && window.App.showToast) {
        window.App.showToast('No geolocation coordinates in current dataset for playback.', 'warning');
      }
      return;
    }

    const statusLabel = document.getElementById('playback-status-label');

    if (!this.layers.animatedMarker) {
      this.layers.animatedMarker = L.marker([records[0].lat, records[0].lng], {
        icon: L.divIcon({
          className: 'playback-marker',
          html: '<div style="background:#ef4444; width:16px; height:16px; border-radius:50%; border:3px solid #fff; box-shadow:0 0 14px #ef4444;"></div>'
        })
      }).addTo(this.map);
    }

    if (this.playbackIndex >= records.length) {
      this.playbackIndex = 0;
    }

    this.playbackTimer = setInterval(() => {
      if (this.playbackIndex >= records.length) {
        this.playbackIndex = 0;
      }
      const r = records[this.playbackIndex];
      if (r && r.lat && r.lng) {
        this.layers.animatedMarker.setLatLng([r.lat, r.lng]);
        if (statusLabel) {
          statusLabel.innerHTML = `<i class="fa-solid fa-person-walking text-cyan-bright"></i> [${this.playbackIndex + 1}/${records.length}] <strong>${r.locationName}</strong> <span class="text-dim">(${r.timestamp})</span>`;
        }
      }

      this.playbackIndex += Math.max(1, Math.floor(records.length / 50));
    }, this.playbackSpeed);
  },

  pausePlayback: function() {
    if (this.playbackTimer) {
      clearInterval(this.playbackTimer);
      this.playbackTimer = null;
    }
    const statusLabel = document.getElementById('playback-status-label');
    if (statusLabel) {
      statusLabel.innerHTML = '<i class="fa-solid fa-pause text-amber"></i> Playback Paused';
    }
  }
};