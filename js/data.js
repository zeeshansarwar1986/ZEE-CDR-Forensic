/* ==========================================================================
   CDR DATA ENGINE, SIMULATED DB, PARSER & FORENSIC UTILITIES
   ========================================================================== */

window.CDRDataStore = {
  // Current Active State
  currentCaseId: 'CR-2026-8841',
  activeTargetNumber: '03005551234',

  // Cases List
  cases: [
    {
      id: 'CR-2026-8841',
      title: 'Demolition & Targeted Murder Case',
      offence: '302/34 PPC & 7 ATA',
      policeStation: 'Secretariat PS, Islamabad',
      investigatingOfficer: 'Inspector Imran Khan',
      status: 'Active',
      createdDate: '2026-10-01',
      updatedDate: '2026-10-09 11:30',
      description: 'High-profile conspiracy case involving suspect co-location movement, international calls, and SIM swap activities.',
      targets: ['03005551234', '03129876543']
    },
    {
      id: 'CR-2026-4412',
      title: 'Armed Bank Robbery & Gang Tracking',
      offence: '395/397 PPC',
      policeStation: 'Saddar PS, Rawalpindi',
      investigatingOfficer: 'SI Malik Usman',
      status: 'Pending',
      createdDate: '2026-09-25',
      updatedDate: '2026-10-05 09:15',
      description: 'Bank heist involving 4 suspect CDRs and cell tower transition analysis near Mall Road.',
      targets: ['03335112233']
    },
    {
      id: 'CR-2026-1090',
      title: 'Inter-Provincial Narcotics Trafficking',
      offence: '9-C CNSA',
      policeStation: 'Industrial Area PS, Islamabad',
      investigatingOfficer: 'DSP Shahzad Malik',
      status: 'Completed',
      createdDate: '2026-08-14',
      updatedDate: '2026-09-10 16:40',
      description: 'Multi-state cartel communication breakdown with cross-border call analysis.',
      targets: ['03455998877']
    }
  ],

  // System Usage & Analytics Logs
  usageStats: {
    totalCases: 24,
    activeCases: 8,
    pendingCases: 5,
    completedCases: 11,
    totalCDRsUploaded: 142,
    totalRecordsParsed: 458200,
    openingFrequency: [12, 18, 25, 30, 22, 38, 45],
    dailyAnalytics: [3200, 4100, 5800, 7200, 6400, 8900, 9500]
  },

  // Ownership / CNIC Intelligence Database
  cnicDatabase: {
    '37405-1234567-1': {
      name: 'Tariq Mehmood S/O Abdul Rehman',
      cnic: '37405-1234567-1',
      address: 'House #45, Sector F-7/2, Islamabad',
      linkedNumbers: ['03005551234', '03215554321', '03455556789'],
      status: 'Verified (NADRA DB Match)'
    },
    '37405-9876543-3': {
      name: 'Shahbaz Ahmed S/O Mushtaq Ahmed',
      cnic: '37405-9876543-3',
      address: 'Street #12, Saddar, Rawalpindi',
      linkedNumbers: ['03129876543', '03339871122'],
      status: 'Verified (NADRA DB Match)'
    },
    '61101-4455667-9': {
      name: 'Bilal Hassan S/O Hassan Ali',
      cnic: '61101-4455667-9',
      address: 'G-9/1, Islamabad',
      linkedNumbers: ['03335112233', '03018889900'],
      status: 'Verified (NADRA DB Match)'
    },
    '35202-8877665-5': {
      name: 'Rashid Khan S/O Zaman Khan',
      cnic: '35202-8877665-5',
      address: 'Gulberg III, Lahore',
      linkedNumbers: ['03455998877'],
      status: 'Flagged (Multiple SIM Registrations)'
    }
  },

  // Service / Helpline / Shortcodes Database
  serviceNumbers: {
    '3737': 'JazzCash Financial Service',
    '786': 'Ehsaas Emergency Cash',
    '8171': 'BISP Government Portal',
    '911': 'National Emergency Helpline',
    '15': 'Police Emergency Command',
    '1122': 'Rescue Emergency Services',
    '1717': 'PM Citizens Portal',
    '8001': 'State Bank Verification',
    '0519201234': 'Ministry of Interior Landline',
    '0519278900': 'IGP Office Islamabad Landline'
  },

  // TAC Device Model Database (First 8 Digits of IMEI)
  tacDatabase: {
    '86420104': { brand: 'Apple', model: 'iPhone 14 Pro Max' },
    '35123409': { brand: 'Samsung', model: 'Galaxy S23 Ultra' },
    '86987605': { brand: 'Xiaomi', model: 'Redmi Note 12 Pro' },
    '35876504': { brand: 'Vivo', model: 'V27 5G' },
    '35234508': { brand: 'Oppo', model: 'F21 Pro' },
    '35998801': { brand: 'Nokia', model: 'Nokia 105 4G' },
    '86345602': { brand: 'Huawei', model: 'P50 Pro' }
  },

  // International Country Code Lookup
  countryCodes: [
    { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
    { code: '+971', country: 'United Arab Emirates', flag: '🇦🇪' },
    { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
    { code: '+973', country: 'Bahrain', flag: '🇧🇭' },
    { code: '+93', country: 'Afghanistan', flag: '🇦🇫' },
    { code: '+1', country: 'United States', flag: '🇺🇸' }
  ],

  // Operator Identification Helper
  getOperator: function(number) {
    if (!number) return 'Other';
    const num = number.toString().replace(/[^0-9]/g, '');
    if (num.startsWith('9230') || num.startsWith('030') || num.startsWith('9232') || num.startsWith('032')) return 'Jazz';
    if (num.startsWith('9231') || num.startsWith('031')) return 'Zong';
    if (num.startsWith('9233') || num.startsWith('033')) return 'Ufone';
    if (num.startsWith('9234') || num.startsWith('034')) return 'Telenor';
    if (num.startsWith('92355') || num.startsWith('0355')) return 'SCO';
    if (num.startsWith('44') || num.startsWith('971') || num.startsWith('966') || num.startsWith('973') || num.startsWith('93') || num.startsWith('1')) return 'International';
    return 'Other';
  },

  // Luhn Check-Digit Calculator & Error Fixer
  fixIMEI: function(rawIMEI) {
    if (!rawIMEI) return { fixedIMEI: '000000000000000', isValid: false };
    let clean = rawIMEI.toString().replace(/[^0-9]/g, '');
    if (clean.length < 14) clean = clean.padEnd(15, '0');
    if (clean.length > 15) clean = clean.substring(0, 15);
    
    // Calculate Luhn check digit for first 14 digits
    let first14 = clean.substring(0, 14);
    let sum = 0;
    for (let i = 0; i < 14; i++) {
      let digit = parseInt(first14.charAt(i), 10);
      if (i % 2 !== 0) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
    }
    let calculatedCheckDigit = (10 - (sum % 10)) % 10;
    let actualCheckDigit = parseInt(clean.charAt(14), 10);
    let isValid = (calculatedCheckDigit === actualCheckDigit);

    let fixedIMEI = first14 + calculatedCheckDigit;
    let tac = fixedIMEI.substring(0, 8);
    let deviceInfo = window.CDRDataStore.tacDatabase[tac] || { brand: 'Generic GSM', model: 'Mobile Handset' };

    return {
      originalIMEI: rawIMEI,
      fixedIMEI: fixedIMEI,
      isValid: isValid,
      tac: tac,
      brand: deviceInfo.brand,
      model: deviceInfo.model
    };
  },

  // Raw CDR Records Generator for Case CR-2026-8841 (1,200+ detailed records)
  cdrRecords: []
};

// Generate realistic dataset on load
(function generateCDRData() {
  const records = [];
  const targetA = '03005551234';
  const targetB = '03129876543';

  // Primary contacts
  const contactsTargetA = [
    { num: '03129876543', label: 'Shahbaz Ahmed (Co-Suspect)', op: 'Zong', cnic: '37405-9876543-3' },
    { num: '03335112233', label: 'Bilal Hassan (Associate)', op: 'Ufone', cnic: '61101-4455667-9' },
    { num: '03455998877', label: 'Rashid Khan (Courier)', op: 'Telenor', cnic: '35202-8877665-5' },
    { num: '+447911123456', label: 'London Handler (Intl)', op: 'International', cnic: 'N/A' },
    { num: '+971501234567', label: 'Dubai Coordinator (Intl)', op: 'International', cnic: 'N/A' },
    { num: '03018889900', label: 'Hamza Lodhi', op: 'Jazz', cnic: '37405-1122334-7' },
    { num: '3737', label: 'JazzCash Wallet', op: 'Service', cnic: 'N/A' },
    { num: '0519201234', label: 'Secretariat Office', op: 'Landline', cnic: 'N/A' }
  ];

  // Islamabad & Rawalpindi Cell Towers
  const cellTowers = [
    { id: 'ISB-F6-01', name: 'Super Market, F-6 Islamabad', lat: 33.7294, lng: 73.0751 },
    { id: 'ISB-F7-04', name: 'Jinnah Super, F-7 Islamabad', lat: 33.7215, lng: 73.0584 },
    { id: 'ISB-G9-02', name: 'Karachi Company, G-9 Islamabad', lat: 33.6931, lng: 73.0289 },
    { id: 'ISB-BA-08', name: 'Blue Area, Islamabad', lat: 33.7121, lng: 73.0645 },
    { id: 'RWP-SDR-03', name: 'Saddar Metro, Rawalpindi', lat: 33.5971, lng: 73.0482 },
    { id: 'RWP-MUR-05', name: 'Murree Road, Chandni Chowk RWP', lat: 33.6312, lng: 73.0725 },
    { id: 'ISB-I8-01', name: 'I-8 Markaz, Islamabad', lat: 33.6685, lng: 73.0772 },
    { id: 'ISB-NUST-02', name: 'H-12 NUST Campus ISB', lat: 33.6450, lng: 72.9910 }
  ];

  const imeisTargetA = ['864201041234567', '864201041234568', '351234098765432']; // Swapped SIM to device 2 on Oct 5!
  const imsisTargetA = ['410010123456789', '410010999888777'];

  const startDate = new Date('2026-10-01T00:00:00');
  const totalDays = 8; // Oct 1 to Oct 8

  let recordId = 1001;

  for (let d = 0; d < totalDays; d++) {
    // Generate ~150 calls per day
    for (let h = 0; h < 24; h++) {
      // Peak hours at 12 PM - 3 PM and 8 PM - 11 PM
      let callCountInHour = (h >= 11 && h <= 15) || (h >= 19 && h <= 23) ? 10 : 4;
      if (d === 4 && (h >= 2 && h <= 6)) callCountInHour = 0; // Phone switch off gap on Oct 5 early morning!

      for (let c = 0; c < callCountInHour; c++) {
        let timestamp = new Date(startDate.getTime() + (d * 86400000) + (h * 3600000) + (c * 300000) + (Math.random() * 120000));
        let formattedTime = timestamp.toISOString().replace('T', ' ').substring(0, 19);

        let contact = contactsTargetA[Math.floor(Math.random() * contactsTargetA.length)];
        let tower = cellTowers[Math.floor(Math.random() * cellTowers.length)];

        // IMEI switching simulation (Moved SIM on Oct 5)
        let imei = (d >= 4) ? imeisTargetA[2] : imeisTargetA[0];
        if (Math.random() < 0.05) imei = '864201041234568'; // Trigger Luhn invalid check digit for testing!

        let callType = Math.random() > 0.4 ? (Math.random() > 0.5 ? 'Incoming' : 'Outgoing') : 'SMS';
        let duration = callType === 'SMS' ? 0 : Math.floor(Math.random() * 450) + 5;

        records.push({
          id: recordId++,
          targetNumber: targetA,
          targetOperator: 'Jazz',
          bPartyNumber: contact.num,
          bPartyLabel: contact.label,
          bPartyOperator: contact.op,
          callType: callType,
          timestamp: formattedTime,
          date: formattedTime.substring(0, 10),
          hour: h,
          duration: duration,
          locationName: tower.name,
          cellId: tower.id,
          lat: tower.lat,
          lng: tower.lng,
          imei: imei,
          imsi: imsisTargetA[0],
          mfc: '051-' + Math.floor(100 + Math.random() * 900)
        });
      }
    }
  }

  window.CDRDataStore.cdrRecords = records;
})();
