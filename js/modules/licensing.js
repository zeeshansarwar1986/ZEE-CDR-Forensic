/* ==========================================================================
   MODULE: HARDWARE-LOCKED SOFTWARE LICENSING & ACTIVATION ENGINE
   ZEE CDR FORENSIC - Zee Meta Advertising Agency (Reg)
   Provides:
   - Unique Deterministic Hardware Fingerprinting (Machine ID)
   - Cryptographic License Signature Validation
   - Offline Activation Key & 6-Digit PIN Authentication
   - Splash Screen Loader Controller
   ========================================================================== */

window.LicenseEngine = {
  // Secret cryptographic salt known to admin license generator
  SECRET_SALT: 'ZEE_META_FORENSIC_SECURE_SALT_2026_AGENCY_KEY_9841',
  STORAGE_KEY: 'ZEE_CDR_FORENSIC_LICENSE_V52',
  HW_UUID_KEY: 'ZEE_CDR_HW_MACHINE_UUID',

  // Pure JavaScript SHA-256 implementation (100% offline reliable)
  sha256: function(ascii) {
    function rightRotate(value, amount) {
      return (value >>> amount) | (value << (32 - amount));
    }

    var mathPow = Math.pow;
    var maxWord = mathPow(2, 32);
    var lengthProperty = 'length';
    var i, j;
    var result = '';

    var words = [];
    var asciiBitLength = ascii[lengthProperty] * 8;

    var hash = [];
    var k = [];
    var primeCounter = 0;

    var isComposite = {};
    for (var candidate = 2; primeCounter < 64; candidate++) {
      if (!isComposite[candidate]) {
        for (i = 0; i < 300; i += candidate) {
          isComposite[i] = candidate;
        }
        hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
        k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
      }
    }

    ascii += '\x80';
    while ((ascii[lengthProperty] % 64) - 56) ascii += '\x00';
    for (i = 0; i < ascii[lengthProperty]; i++) {
      j = ascii.charCodeAt(i);
      if (j >> 8) return;
      words[i >> 2] |= j << ((3 - (i % 4)) * 8);
    }
    words[words[lengthProperty]] = (asciiBitLength / maxWord) | 0;
    words[words[lengthProperty]] = asciiBitLength | 0;

    for (j = 0; j < words[lengthProperty]; ) {
      var w = words.slice(j, (j += 16));
      var oldHash = hash;
      hash = hash.slice(0, 8);

      for (i = 0; i < 64; i++) {
        var w15 = w[i - 15],
          w2 = w[i - 2];
        var s0 = rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3);
        var s1 = rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10);
        w[i] =
          i < 16
            ? w[i]
            : (w[i - 16] + s0 + w[i - 7] + s1) | 0;

        var s1_maj =
          rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22);
        var maj =
          (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
        var t2 = (s1_maj + maj) | 0;

        var s1_ch =
          rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25);
        var ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
        var t1 = (hash[7] + s1_ch + ch + k[i] + w[i]) | 0;

        hash = [(t1 + t2) | 0].concat(hash);
        hash[4] = (hash[4] + t1) | 0;
      }

      for (i = 0; i < 8; i++) {
        hash[i] = (hash[i] + oldHash[i]) | 0;
      }
    }

    for (i = 0; i < 8; i++) {
      for (i = 0; i < 8; i++) {
        for (j = 3; j >= 0; j--) {
          var b = (hash[i] >> (j * 8)) & 255;
          result += (b < 16 ? '0' : '') + b.toString(16);
        }
      }
    }
    return result;
  },

  // Generate deterministic Machine Hardware Fingerprint
  getMachineHardwareKey: function() {
    var persistentUUID = localStorage.getItem(this.HW_UUID_KEY);
    if (!persistentUUID) {
      persistentUUID = 'HW-' + Math.random().toString(36).substring(2, 10).toUpperCase() + '-' + Date.now().toString(36).toUpperCase();
      try {
        localStorage.setItem(this.HW_UUID_KEY, persistentUUID);
      } catch (e) {}
    }

    // Collect machine hardware telemetry
    var nav = window.navigator || {};
    var scr = window.screen || {};

    var rawFingerprint = [
      nav.userAgent || '',
      nav.platform || '',
      nav.hardwareConcurrency || 4,
      nav.deviceMemory || 8,
      scr.width + 'x' + scr.height,
      scr.colorDepth || 24,
      persistentUUID
    ].join('###');

    var hash = this.sha256(rawFingerprint).toUpperCase();

    // Format strictly as: CDFA-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX (Matches Screenshot 1)
    var part1 = hash.substring(0, 4);
    var part2 = hash.substring(4, 8);
    var part3 = hash.substring(8, 12);
    var part4 = hash.substring(12, 16);
    var part5 = hash.substring(16, 20);
    var part6 = hash.substring(20, 24);
    var part7 = hash.substring(24, 28);

    return 'CDFA-' + part1 + '-' + part2 + '-' + part3 + '-' + part4 + '-' + part5 + '-' + part6 + '-' + part7;
  },

  // Derive Expected Activation Key & 6-digit PIN from Hardware Key
  deriveLicensePair: function(hardwareKey) {
    var cleanHw = (hardwareKey || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!cleanHw) return { activationKey: '', pin: '' };

    var rawSignature = cleanHw + '###' + this.SECRET_SALT;
    var hash = this.sha256(rawSignature).toUpperCase();

    // Activation Key Format: CDFA-LIC-XXXX-XXXX (Matches Screenshot 1)
    var actKey = 'CDFA-LIC-' + hash.substring(0, 4) + '-' + hash.substring(4, 8);

    // 6-digit PIN Format (e.g. 849201)
    var pinInt = parseInt(hash.substring(10, 16), 16) % 1000000;
    var pinStr = pinInt.toString().padStart(6, '0');

    return {
      activationKey: actKey,
      pin: pinStr
    };
  },

  // Verify Activation Credentials
  verifyCredentials: function(hardwareKey, inputActivationKey, inputPin) {
    var cleanHw = (hardwareKey || '').trim().toUpperCase();
    var cleanInputKey = (inputActivationKey || '').trim().toUpperCase();
    var cleanPin = (inputPin || '').trim().replace(/[^0-9]/g, '');

    var expected = this.deriveLicensePair(cleanHw);

    // Support both CDFA-LIC-XXXX-XXXX and CDR5- master format
    var keyMatches = (cleanInputKey === expected.activationKey) ||
                     (cleanInputKey === ('CDR5-' + expected.activationKey.replace('CDFA-LIC-', '')));
    var pinMatches = (cleanPin === expected.pin);

    return keyMatches && pinMatches;
  },

  // Check if current system is already activated
  isActivated: function() {
    try {
      var saved = localStorage.getItem(this.STORAGE_KEY);
      if (!saved) return false;

      var parsed = JSON.parse(saved);
      if (!parsed || !parsed.hardwareKey || !parsed.activationKey || !parsed.pin) return false;

      var currentHw = this.getMachineHardwareKey();
      if (parsed.hardwareKey !== currentHw) {
        // Hardware key changed (e.g. copied to another laptop) -> Lock software!
        return false;
      }

      return this.verifyCredentials(parsed.hardwareKey, parsed.activationKey, parsed.pin);
    } catch (e) {
      return false;
    }
  },

  // Save successful activation
  saveActivation: function(hardwareKey, activationKey, pin) {
    try {
      var payload = {
        hardwareKey: hardwareKey,
        activationKey: activationKey,
        pin: pin,
        activatedAt: new Date().toISOString(),
        product: 'ZEE CDR Forensic Analyzer v5.2.0',
        agency: 'Zee Meta Advertising Agency (Reg)'
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(payload));
      return true;
    } catch (e) {
      console.error('Failed to save license:', e);
      return false;
    }
  },

  // Initialize UI & Security Gate on page load
  init: function() {
    var currentHw = this.getMachineHardwareKey();

    // Populate Hardware Key in UI
    var hwInput = document.getElementById('lic-hw-key-val');
    if (hwInput) hwInput.value = currentHw;

    // Bind Copy Hardware Key Button
    var copyBtn = document.getElementById('btn-copy-hw-key');
    if (copyBtn) {
      copyBtn.onclick = function() {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(currentHw);
        } else {
          hwInput.select();
          document.execCommand('copy');
        }
        var origHtml = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fa-solid fa-check text-green"></i> Copied!';
        setTimeout(function() { copyBtn.innerHTML = origHtml; }, 2000);
      };
    }

    // Bind Activate Button
    var activateBtn = document.getElementById('btn-submit-activate');
    if (activateBtn) {
      var self = this;
      activateBtn.onclick = function() {
        self.handleActivationSubmit();
      };
    }

    // Allow Enter key on inputs
    var actKeyInput = document.getElementById('lic-act-key-input');
    var pinInput = document.getElementById('lic-pin-input');
    var self = this;
    var enterHandler = function(e) {
      if (e.key === 'Enter') self.handleActivationSubmit();
    };
    if (actKeyInput) actKeyInput.onkeypress = enterHandler;
    if (pinInput) pinInput.onkeypress = enterHandler;

    // Check activation status
    if (this.isActivated()) {
      // Activated! Show splash screen then reveal app
      this.showSplashScreenAndLaunch();
    } else {
      // Not activated! Lock app and show Activation Gate
      this.showActivationScreen();
    }
  },

  handleActivationSubmit: function() {
    var hwKey = this.getMachineHardwareKey();
    var actKey = (document.getElementById('lic-act-key-input')?.value || '').trim();
    var pin = (document.getElementById('lic-pin-input')?.value || '').trim();
    var errEl = document.getElementById('lic-error-msg');

    if (!actKey || !pin) {
      if (errEl) {
        errEl.style.display = 'block';
        errEl.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Please enter both Activation Key and 6-digit PIN.';
      }
      return;
    }

    var isValid = this.verifyCredentials(hwKey, actKey, pin);

    if (isValid) {
      if (errEl) errEl.style.display = 'none';
      this.saveActivation(hwKey, actKey, pin);

      // Hide activation card & trigger cyber splash screen
      var actContainer = document.getElementById('activation-gate-screen');
      if (actContainer) actContainer.style.display = 'none';

      this.showSplashScreenAndLaunch();
    } else {
      if (errEl) {
        errEl.style.display = 'block';
        errEl.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> Invalid Activation Key or PIN for this Hardware Key. Contact Administrator.';
      }
    }
  },

  showActivationScreen: function() {
    var actGate = document.getElementById('activation-gate-screen');
    var splash = document.getElementById('app-splash-screen');
    var appContainer = document.getElementById('app-container');
    var topHeader = document.getElementById('top-header');

    if (actGate) actGate.style.display = 'flex';
    if (splash) splash.style.display = 'none';
    if (appContainer) appContainer.style.display = 'none';
    if (topHeader) topHeader.style.display = 'none';
  },

  showSplashScreenAndLaunch: function() {
    var actGate = document.getElementById('activation-gate-screen');
    var splash = document.getElementById('app-splash-screen');
    var appContainer = document.getElementById('app-container');
    var topHeader = document.getElementById('top-header');

    if (actGate) actGate.style.display = 'none';
    if (splash) splash.style.display = 'flex';
    if (appContainer) appContainer.style.display = 'none';
    if (topHeader) topHeader.style.display = 'none';

    // Smooth transition from Splash to Main App after 1.8 seconds (Matches Screenshot 2)
    setTimeout(function() {
      if (splash) {
        splash.style.transition = 'opacity 0.5s ease';
        splash.style.opacity = '0';
        setTimeout(function() {
          splash.style.display = 'none';
          if (appContainer) appContainer.style.display = 'flex';
          if (topHeader) topHeader.style.display = 'flex';

          // Trigger view redraws
          if (window.OverviewModule) window.OverviewModule.renderPreviewMap();
          if (window.GeoLocationModule) window.GeoLocationModule.invalidateSize();
        }, 500);
      } else {
        if (appContainer) appContainer.style.display = 'flex';
        if (topHeader) topHeader.style.display = 'flex';
      }
    }, 1800);
  }
};