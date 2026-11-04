import { Scheme, CitizenProfile } from '@/types';

export const DEMO_CITIZEN_RAMESH: CitizenProfile = {
  name: 'Ramesh Kumar',
  age: 38,
  gender: 'male',
  state: 'Maharashtra',
  district: 'Pune',
  occupation: 'Delivery worker',
  annualHouseholdIncome: 200000,
  familyMembers: 4,
  childrenCount: 2,
  childrenAges: [8, 12],
  studentStatus: true,
  farmerStatus: false,
  disabilityStatus: false,
  maritalStatus: 'married',
  socialCategory: 'OBC',
  hasBplCard: true,
  rationCardType: 'Orange',
  documentsAvailable: [
    'Aadhaar Card',
    'Income Certificate',
    'Ration Card',
    'Bank Passbook'
  ]
};

export const DEMO_SCHEMES: Scheme[] = [
  {
    id: 'pm-sym',
    name: 'Pradhan Mantri Shram Yogi Maan-dhan (PM-SYM)',
    nativeNames: {
      hi: 'प्रधानमंत्री श्रम योगी मान-धन योजना',
      mr: 'प्रधानमंत्री श्रम योगी मान-धन योजना'
    },
    category: 'pension',
    type: 'Central',
    state: 'All India',
    description: 'A voluntary and contributory pension scheme for unorganised workers like delivery partners, street vendors, rickshaw pullers, domestic workers, and agricultural labourers.',
    benefit: 'Assured monthly pension of ₹3,000 per month after attaining 60 years of age. Family pension (50%) to spouse in case of death.',
    benefitAmount: '₹3,000 / month',
    eligibilitySummary: 'Unorganised worker aged 18 to 40 years with monthly income <= ₹15,000 (annual income <= ₹1,80,000). Not covered under EPFO, ESIC, or NPS.',
    rules: [
      {
        field: 'age',
        operator: 'gte',
        value: 18,
        label: 'Minimum age must be 18 years',
        weight: 20,
        isStrict: true
      },
      {
        field: 'age',
        operator: 'lte',
        value: 40,
        label: 'Maximum age must be 40 years',
        weight: 20,
        isStrict: true
      },
      {
        field: 'annualHouseholdIncome',
        operator: 'lte',
        value: 200000,
        label: 'Monthly income <= ₹15,000 (~₹1.8-2 Lakhs per year)',
        weight: 30,
        isStrict: true
      },
      {
        field: 'occupation',
        operator: 'exists',
        value: true,
        label: 'Must work in the unorganised/gig/informal sector',
        weight: 30,
        isStrict: false
      }
    ],
    requiredDocuments: [
      { id: 'aadhaar', name: 'Aadhaar Card', description: 'Mandatory identity proof linked with mobile number', isMandatory: true },
      { id: 'bank_passbook', name: 'Savings Bank Account / Jan Dhan Passbook', description: 'Bank account with IFSC code for auto-debit', isMandatory: true }
    ],
    applicationSteps: [
      'Visit nearest Common Service Centre (CSC) or register online at maandhan.in',
      'Provide Aadhaar number and savings bank account / Jan Dhan passbook details',
      'Initial monthly contribution (₹55 - ₹200 based on entry age) will be paid in cash at CSC',
      'Sign the system-generated auto-debit mandate form',
      'Receive your unique Shram Yogi Pension Card immediately'
    ],
    officialSource: 'https://maandhan.in',
    lastVerified: '2026-02-15',
    isDemo: true
  },
  {
    id: 'pm-svanidhi',
    name: 'PM Street Vendor’s AtmaNirbhar Nidhi (PM SVANidhi)',
    nativeNames: {
      hi: 'पीएम स्ट्रीट वेंडर्स आत्मनिर्भर निधि (पीएम स्वनिधि)',
      mr: 'पीएम पथविक्रेता आत्मनिर्भर निधी (पीएम स्वनिधी)'
    },
    category: 'livelihood',
    type: 'Central',
    state: 'All India',
    description: 'A special micro-credit facility providing affordable collateral-free working capital loans to street vendors and micro-service gig workers to resume and scale livelihoods.',
    benefit: 'Collateral-free working capital loan: 1st loan ₹10,000 (repayable in 1 year), 2nd tranche ₹20,000, 3rd tranche up to ₹50,000 with 7% interest subsidy and up to ₹1,200 annual digital cashback.',
    benefitAmount: '₹10,000 to ₹50,000 working capital loan',
    eligibilitySummary: 'Street vendors, hawkers, daily wage micro-sellers or delivery operators in urban, semi-urban, or peri-urban areas.',
    rules: [
      {
        field: 'age',
        operator: 'gte',
        value: 18,
        label: 'Applicant must be at least 18 years old',
        weight: 20,
        isStrict: true
      },
      {
        field: 'annualHouseholdIncome',
        operator: 'lte',
        value: 300000,
        label: 'Low to moderate household income',
        weight: 30,
        isStrict: false
      }
    ],
    requiredDocuments: [
      { id: 'aadhaar', name: 'Aadhaar Card', description: 'Identity and address proof', isMandatory: true },
      { id: 'bank_passbook', name: 'Bank Passbook / Account Details', description: 'Active bank account for loan credit and cashback', isMandatory: true },
      { id: 'vending_proof', name: 'Vending Certificate / Urban Local Body (ULB) Letter', description: 'Certificate of Vending or Letter of Recommendation from local municipality/panchayat', isMandatory: true }
    ],
    applicationSteps: [
      'Verify mobile number linked with Aadhaar',
      'Check Certificate of Vending or obtain Letter of Recommendation from local ULB',
      'Apply online on pmsvanidhi.mohua.gov.in or through a nearby CSC / Bank branch',
      'Choose preferred Lending Institution (Public/Private Bank or NBFC)',
      'Upload documents and submit. Sanction takes typically 7-10 working days'
    ],
    officialSource: 'https://pmsvanidhi.mohua.gov.in',
    lastVerified: '2026-01-20',
    isDemo: true
  },
  {
    id: 'ayushman-bharat',
    name: 'Ayushman Bharat - Pradhan Mantri Jan Arogya Yojana (PM-JAY)',
    nativeNames: {
      hi: 'आयुष्मान भारत - प्रधानमंत्री जन आरोग्य योजना (पीएम-जय)',
      mr: 'आयुष्मान भारत - प्रधानमंत्री जन आरोग्य योजना'
    },
    category: 'health',
    type: 'Central',
    state: 'All India',
    description: 'The world’s largest health assurance scheme providing comprehensive, cashless secondary and tertiary hospitalisation care across India.',
    benefit: 'Cashless healthcare cover up to ₹5,00,000 per family per year for secondary and tertiary hospitalization across 28,000+ empanelled hospitals.',
    benefitAmount: '₹5 Lakhs/year free health cover',
    eligibilitySummary: 'Families identified in SECC deprivation criteria or having verified low income / BPL / Antyodaya status (annual income generally under ₹2.5 Lakhs).',
    rules: [
      {
        field: 'annualHouseholdIncome',
        operator: 'lte',
        value: 250000,
        label: 'Annual household income <= ₹2,50,000 or BPL/EWS status',
        weight: 50,
        isStrict: true
      }
    ],
    requiredDocuments: [
      { id: 'aadhaar', name: 'Aadhaar Card', description: 'Aadhaar card of all family members', isMandatory: true },
      { id: 'ration_card', name: 'Ration Card (BPL/NFSA/Yellow/Orange)', description: 'Proof of family composition and economic status', isMandatory: true },
      { id: 'income_certificate', name: 'Income Certificate', description: 'State government issued income certificate if not listed in SECC', isMandatory: false }
    ],
    applicationSteps: [
      'Check eligibility on beneficiary.nha.gov.in using Aadhaar or Ration Card number',
      'Visit nearest Empanelled Health Care Provider (EHCP) hospital or CSC center',
      'Present Aadhaar and Ration Card for biometric e-KYC verification',
      'Generate and download your digital Ayushman Card (Golden Card)',
      'Avail 100% cashless hospitalization at any empanelled public or private hospital'
    ],
    officialSource: 'https://pmjay.gov.in',
    lastVerified: '2026-03-01',
    isDemo: true
  },
  {
    id: 'pm-kisan',
    name: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
    nativeNames: {
      hi: 'प्रधानमंत्री किसान सम्मान निधि (पीएम-किसान)',
      mr: 'प्रधानमंत्री किसान सन्मान निधी (पीएम-किसान)'
    },
    category: 'farmer',
    type: 'Central',
    state: 'All India',
    description: 'Direct income support scheme for all landholding farmer families across the country to meet financial needs for farm inputs and allied activities.',
    benefit: '₹6,000 per year directly transferred to bank account in 3 equal four-monthly installments of ₹2,000 each.',
    benefitAmount: '₹6,000 / year',
    eligibilitySummary: 'Farmer families with cultivable landholding in their name. Excludes institutional landholders and income tax payees.',
    rules: [
      {
        field: 'farmerStatus',
        operator: 'eq',
        value: true,
        label: 'Must be an active farmer with cultivable land',
        weight: 60,
        isStrict: true
      },
      {
        field: 'annualHouseholdIncome',
        operator: 'lte',
        value: 500000,
        label: 'Family should not be high income tax payees',
        weight: 40,
        isStrict: false
      }
    ],
    requiredDocuments: [
      { id: 'aadhaar', name: 'Aadhaar Card', description: 'Mandatory Aadhaar linked with mobile and bank account', isMandatory: true },
      { id: 'land_record', name: 'Land Record (7/12 Extract, Khasra/Khatauni)', description: 'Official document proving land ownership', isMandatory: true },
      { id: 'bank_passbook', name: 'Bank Account Passbook', description: 'Aadhaar-seeded bank account for direct DBT transfer', isMandatory: true }
    ],
    applicationSteps: [
      'Visit pmkisan.gov.in and click on "New Farmer Registration"',
      'Enter Aadhaar number and choose rural/urban status with state OTP verification',
      'Fill landholding details matching your 7/12 or Khatauni record',
      'Upload land ownership document and bank account details',
      'Local revenue patwari/talathi verifies records, after which payments begin'
    ],
    officialSource: 'https://pmkisan.gov.in',
    lastVerified: '2026-02-10',
    isDemo: true
  },
  {
    id: 'majhi-ladki-bahin',
    name: 'Mukhyamantri Majhi Ladki Bahin Yojana',
    nativeNames: {
      hi: 'मुख्यमंत्री माझी लाड़की बहिन योजना (महाराष्ट्र)',
      mr: 'मुख्यमंत्री माझी लाडकी बहीण योजना (महाराष्ट्र)'
    },
    category: 'women_child',
    type: 'State (Maharashtra)',
    state: 'Maharashtra',
    description: 'Flagship financial independence initiative by the Government of Maharashtra providing direct monthly assistance to economically underprivileged women.',
    benefit: 'Direct monthly cash deposit of ₹1,500 into the beneficiary woman’s Aadhaar-linked bank account (Total ₹18,000 annually).',
    benefitAmount: '₹1,500 / month (₹18,000/yr)',
    eligibilitySummary: 'Resident woman of Maharashtra aged 21 to 65 years with annual household income up to ₹2.5 Lakhs (or holding Yellow/Orange ration card).',
    rules: [
      {
        field: 'state',
        operator: 'eq',
        value: 'Maharashtra',
        label: 'Must be a permanent resident of Maharashtra',
        weight: 35,
        isStrict: true
      },
      {
        field: 'gender',
        operator: 'eq',
        value: 'female',
        label: 'Applicant must be a woman (or married female in the household)',
        weight: 25,
        isStrict: false
      },
      {
        field: 'annualHouseholdIncome',
        operator: 'lte',
        value: 250000,
        label: 'Family annual income must not exceed ₹2,50,000',
        weight: 40,
        isStrict: true
      }
    ],
    requiredDocuments: [
      { id: 'aadhaar', name: 'Aadhaar Card', description: 'Aadhaar card with mobile linked for OTP', isMandatory: true },
      { id: 'domicile_or_ration', name: 'Maharashtra Domicile Certificate or Ration Card (Yellow/Orange)', description: 'Proof of Maharashtra residence for at least 15 years', isMandatory: true },
      { id: 'income_certificate', name: 'Income Certificate', description: 'Issued by Tahsildar (exempt if having Yellow/Orange ration card)', isMandatory: false },
      { id: 'bank_passbook', name: 'Bank Passbook (Aadhaar Seeded)', description: 'Bank account in woman’s own name', isMandatory: true }
    ],
    applicationSteps: [
      'Apply via Nari Shakti Doot App or official portal ladakibahin.maharashtra.gov.in',
      'Enter Aadhaar number and complete mobile OTP authentication',
      'Upload photo of front and back of Aadhaar and Ration Card/Domicile',
      'Select bank branch and verify DBT seeding status',
      'Anganwadi / Gram Sevak reviews within 15 days; money credited monthly'
    ],
    officialSource: 'https://ladakibahin.maharashtra.gov.in',
    lastVerified: '2026-02-28',
    isDemo: true
  },
  {
    id: 'pm-awas-yojana',
    name: 'Pradhan Mantri Awas Yojana (PMAY-G / PMAY-U 2.0)',
    nativeNames: {
      hi: 'प्रधानमंत्री आवास योजना (पीएमएवाई)',
      mr: 'प्रधानमंत्री आवास योजना (पीएमएवाय)'
    },
    category: 'housing',
    type: 'Central',
    state: 'All India',
    description: 'Flagship mission to provide pucca houses with basic amenities like water, sanitation, and electricity to all eligible homeless and families living in kutcha/dilapidated houses.',
    benefit: 'Direct financial assistance of ₹1,20,000 to ₹1,30,000 for rural house construction, or interest subsidy up to ₹2.5 Lakhs on home loans for urban low-income families.',
    benefitAmount: '₹1.2 Lakh to ₹2.5 Lakh subsidy',
    eligibilitySummary: 'Families living in kutcha houses or without a pucca house anywhere in India. Annual household income <= ₹3 Lakhs (EWS) or <= ₹6 Lakhs (LIG).',
    rules: [
      {
        field: 'annualHouseholdIncome',
        operator: 'lte',
        value: 300000,
        label: 'Economically Weaker Section (EWS) income limit <= ₹3,00,000',
        weight: 50,
        isStrict: true
      }
    ],
    requiredDocuments: [
      { id: 'aadhaar', name: 'Aadhaar Card', description: 'Aadhaar of all adult family members', isMandatory: true },
      { id: 'income_certificate', name: 'Income Certificate', description: 'Proof of income from competent authority', isMandatory: true },
      { id: 'house_land_proof', name: 'Land Possession / Non-Pucca House Affidavit', description: 'Proof of land ownership or gram panchayat verification of kutcha dwelling', isMandatory: true },
      { id: 'bank_passbook', name: 'Bank Passbook', description: 'Direct benefit transfer bank account details', isMandatory: true }
    ],
    applicationSteps: [
      'Check SECC list or register online via pmaymis.gov.in or Gram Panchayat',
      'Geo-tagging and photography of existing kutcha house by village officer',
      'Approval of sanction order and issuance of house building permit',
      'Direct DBT installment disbursements in 3 stages linked to physical construction progress',
      'Final completion geo-tagging with completion certificate'
    ],
    officialSource: 'https://pmayg.nic.in',
    lastVerified: '2026-01-15',
    isDemo: true
  },
  {
    id: 'sukanya-samriddhi',
    name: 'Sukanya Samriddhi Yojana (SSY)',
    nativeNames: {
      hi: 'सुकन्या समृद्धि योजना (एसएसवाई)',
      mr: 'सुकन्या समृद्धी योजना (एसएसवाय)'
    },
    category: 'women_child',
    type: 'Central',
    state: 'All India',
    description: 'A government-backed high-yield small deposit savings scheme launched under Beti Bachao Beti Padhao campaign to secure higher education and marriage funds for girl children.',
    benefit: 'Guaranteed government interest rate of 8.2% p.a. compounded yearly, with complete Triple Tax Exemption (EEE) under Section 80C.',
    benefitAmount: '8.2% tax-free compound interest',
    eligibilitySummary: 'Account can be opened for any girl child below 10 years of age by natural or legal guardians. Maximum 2 accounts per family.',
    rules: [
      {
        field: 'childrenCount',
        operator: 'gte',
        value: 1,
        label: 'Family must have at least one child',
        weight: 50,
        isStrict: true
      }
    ],
    requiredDocuments: [
      { id: 'birth_certificate', name: 'Birth Certificate of Girl Child', description: 'Official municipal/panchayat birth certificate', isMandatory: true },
      { id: 'parent_aadhaar', name: 'Aadhaar Card of Parent/Guardian', description: 'Identity and address proof of guardian', isMandatory: true },
      { id: 'photos', name: 'Passport Photographs', description: 'Photos of girl child and guardian', isMandatory: true }
    ],
    applicationSteps: [
      'Visit any Post Office branch or authorized nationalised/private bank',
      'Submit Form-1 (SSY Account Opening Form) with birth certificate of girl child',
      'Deposit initial minimum amount of ₹250 (max ₹1,50,000 per financial year)',
      'Receive the physical SSY Passbook',
      'Deposit money annually online via IPPB or netbanking for 15 years; matures at 21 years'
    ],
    officialSource: 'https://www.india.gov.in/sukanya-samriddhi-yojna',
    lastVerified: '2026-02-18',
    isDemo: true
  },
  {
    id: 'pm-ujjwala',
    name: 'Pradhan Mantri Ujjwala Yojana 2.0 (PMUY)',
    nativeNames: {
      hi: 'प्रधानमंत्री उज्ज्वला योजना 2.0',
      mr: 'प्रधानमंत्री उज्ज्वला योजना २.०'
    },
    category: 'energy',
    type: 'Central',
    state: 'All India',
    description: 'Provides clean LPG cooking fuel connections free of cost to women from underprivileged households to eliminate indoor smoke pollution.',
    benefit: 'Free deposit-free LPG gas connection, 1st gas cylinder refill 100% free, free 2-burner gas stove, plus ₹300 subsidy per cylinder for up to 12 refills/year.',
    benefitAmount: 'Free gas cylinder + stove + ₹300/refill subsidy',
    eligibilitySummary: 'Adult woman (18+) from poor household having no existing LPG connection in the house. Family income <= ₹2.5 Lakhs or BPL/Ration card.',
    rules: [
      {
        field: 'annualHouseholdIncome',
        operator: 'lte',
        value: 250000,
        label: 'Underprivileged household income limit <= ₹2,50,000',
        weight: 50,
        isStrict: true
      }
    ],
    requiredDocuments: [
      { id: 'aadhaar', name: 'Aadhaar Card of Applicant and Adult Family Members', description: 'Identity and residence proof', isMandatory: true },
      { id: 'ration_card', name: 'Ration Card', description: 'Family composition proof issued by state government', isMandatory: true },
      { id: 'bank_passbook', name: 'Bank Passbook', description: 'Bank account details with IFSC code for DBT subsidy', isMandatory: true }
    ],
    applicationSteps: [
      'Visit nearest LPG distributor (Indane, BharatGas, or HP Gas) or apply on pmuy.gov.in',
      'Submit 14-point declaration form confirming no existing LPG connection in household',
      'Provide Aadhaar e-KYC and Ration Card verification',
      'Distributor completes de-duplication check through OMC clearinghouse',
      'Free cylinder, regulator, safety hose, and gas stove delivered to your home'
    ],
    officialSource: 'https://www.pmuy.gov.in',
    lastVerified: '2026-01-30',
    isDemo: true
  },
  {
    id: 'sanjay-gandhi-niradhar',
    name: 'Maharashtra Sanjay Gandhi Niradhar Anudan Yojana',
    nativeNames: {
      hi: 'महाराष्ट्र संजय गांधी निराधार अनुदान योजना',
      mr: 'महाराष्ट्र संजय गांधी निराधार अनुदान योजना'
    },
    category: 'pension',
    type: 'State (Maharashtra)',
    state: 'Maharashtra',
    description: 'Financial safety net scheme by the Government of Maharashtra providing pension support to destitute persons, blind/disabled, widows, and severely diseased citizens.',
    benefit: 'Monthly pension of ₹1,500 per month for single beneficiary (or up to ₹2,500/month for families with multiple disabled dependents).',
    benefitAmount: '₹1,500 / month',
    eligibilitySummary: 'Maharashtra resident for at least 15 years, age under 65 if destitute/disabled (or any age for eligible widows). Annual family income <= ₹21,000 (or ₹50,000 in special categories).',
    rules: [
      {
        field: 'state',
        operator: 'eq',
        value: 'Maharashtra',
        label: 'Permanent resident of Maharashtra for at least 15 years',
        weight: 40,
        isStrict: true
      },
      {
        field: 'annualHouseholdIncome',
        operator: 'lte',
        value: 100000,
        label: 'Annual family income should be within destitute limit (<= ₹50,000 to ₹1 Lakh)',
        weight: 60,
        isStrict: true
      }
    ],
    requiredDocuments: [
      { id: 'domicile', name: 'Maharashtra Domicile Certificate (15 Years)', description: 'Proof of continuous residence in Maharashtra', isMandatory: true },
      { id: 'income_certificate', name: 'Tahsildar Income Certificate', description: 'Income certificate showing income within poverty limit', isMandatory: true },
      { id: 'age_proof', name: 'Age Proof (Aadhaar / Voter ID / School LC)', description: 'Proof of age', isMandatory: true },
      { id: 'bank_passbook', name: 'Bank Passbook', description: 'Savings bank account details for monthly pension deposit', isMandatory: true }
    ],
    applicationSteps: [
      'Obtain application Form A from the Tahsildar office or Aaple Sarkar portal',
      'Attach income certificate, domicile certificate, and age proof',
      'Submit to the Sanjay Gandhi Niradhar Yojana Committee at the Tehsil office',
      'Sanction committee meets monthly under the chairmanship of the Tahsildar',
      'Upon sanction, monthly pension of ₹1,500 is credited automatically to bank account'
    ],
    officialSource: 'https://sanjaygandhiniradhar.maharashtra.gov.in',
    lastVerified: '2026-02-14',
    isDemo: true
  },
  {
    id: 'national-pre-matric-scholarship',
    name: 'National Pre-Matric & Post-Matric Scholarship Scheme',
    nativeNames: {
      hi: 'राष्ट्रीय प्री-मैट्रिक एवं पोस्ट-मैट्रिक छात्रवृत्ति योजना',
      mr: 'राष्ट्रीय पूर्व-मॅट्रिक व मॅट्रिकोत्तर शिष्यवृत्ती योजना'
    },
    category: 'education',
    type: 'Centrally Sponsored',
    state: 'All India',
    description: 'Financial support to meritorious students belonging to minority communities, OBC, SC, ST, and EWS to encourage schooling and prevent dropout rates.',
    benefit: 'Full reimbursement of admission and tuition fees plus monthly maintenance allowance (₹1,000 to ₹12,000 per academic year directly into student’s bank account).',
    benefitAmount: 'Up to ₹12,000 / academic year',
    eligibilitySummary: 'Regular students studying from Class 1 to postgraduate levels with family annual income <= ₹2,50,000 and minimum 50% marks in the previous final exam.',
    rules: [
      {
        field: 'studentStatus',
        operator: 'eq',
        value: true,
        label: 'Applicant or household member must be a student or have children studying',
        weight: 50,
        isStrict: false
      },
      {
        field: 'annualHouseholdIncome',
        operator: 'lte',
        value: 250000,
        label: 'Household annual income <= ₹2,50,000',
        weight: 50,
        isStrict: true
      }
    ],
    requiredDocuments: [
      { id: 'student_aadhaar', name: 'Student Aadhaar Card', description: 'Aadhaar of student or parent', isMandatory: true },
      { id: 'income_certificate', name: 'Income Certificate', description: 'Government issued income certificate', isMandatory: true },
      { id: 'previous_marksheet', name: 'Previous Academic Year Marksheet', description: 'Showing at least 50% marks', isMandatory: true },
      { id: 'fee_receipt', name: 'School/College Fee Receipt', description: 'Current academic year enrollment receipt', isMandatory: true },
      { id: 'bank_passbook', name: 'Student Bank Passbook', description: 'Aadhaar-seeded bank account in student’s name', isMandatory: true }
    ],
    applicationSteps: [
      'Register on National Scholarship Portal (scholarships.gov.in)',
      'Fill student enrollment ID, institute code, and academic details',
      'Upload previous year marksheet, income certificate, and fee receipt',
      'School / College Nodal Officer verifies form online',
      'District Welfare Officer approves and scholarship amount is sent via DBT'
    ],
    officialSource: 'https://scholarships.gov.in',
    lastVerified: '2026-03-01',
    isDemo: true
  },
  {
    id: 'pm-surya-ghar',
    name: 'PM Surya Ghar: Muft Bijli Yojana',
    nativeNames: {
      hi: 'पीएम सूर्य घर: मुफ्त बिजली योजना',
      mr: 'पीएम सूर्य घर: मोफत वीज योजना'
    },
    category: 'energy',
    type: 'Central',
    state: 'All India',
    description: 'Provides substantial capital subsidies for households to install rooftop solar power systems, ensuring free electricity up to 300 units every month.',
    benefit: 'Direct central subsidy of ₹30,000 for 1kW, ₹60,000 for 2kW, and ₹78,000 for 3kW or higher rooftop solar systems, yielding zero electricity bills.',
    benefitAmount: 'Up to ₹78,000 subsidy + free electricity',
    eligibilitySummary: 'Any Indian citizen household with a suitable unshaded roof and valid DISCOM grid electricity connection in their name.',
    rules: [
      {
        field: 'age',
        operator: 'gte',
        value: 18,
        label: 'Applicant must be an adult household owner/tenant',
        weight: 30,
        isStrict: true
      }
    ],
    requiredDocuments: [
      { id: 'electricity_bill', name: 'Recent Electricity Bill', description: 'DISCOM consumer number and sanctioned load', isMandatory: true },
      { id: 'aadhaar', name: 'Aadhaar Card', description: 'Identity proof of electricity consumer', isMandatory: true },
      { id: 'bank_passbook', name: 'Bank Passbook / Cancelled Cheque', description: 'For direct subsidy credit within 30 days', isMandatory: true }
    ],
    applicationSteps: [
      'Register on pmsuryaghar.gov.in with electricity consumer account number',
      'Select registered DISCOM and submit rooftop solar net-metering application',
      'Get system installed by any registered DISCOM empaneled vendor',
      'DISCOM inspects setup and installs bidirectional net-meter',
      'Submit bank details online; ₹30,000 to ₹78,000 subsidy credited directly within 30 days'
    ],
    officialSource: 'https://pmsuryaghar.gov.in',
    lastVerified: '2026-02-25',
    isDemo: true
  },
  {
    id: 'mudra-yojana',
    name: 'Pradhan Mantri Mudra Yojana (PMMY)',
    nativeNames: {
      hi: 'प्रधानमंत्री मुद्रा योजना (पीएमएमवाई)',
      mr: 'प्रधानमंत्री मुद्रा योजना'
    },
    category: 'livelihood',
    type: 'Central',
    state: 'All India',
    description: 'Enables micro and small enterprises to access collateral-free institutional credit up to ₹10-20 Lakhs for business establishment, modernization, and gig equipment.',
    benefit: 'Collateral-free business loans: Shishu (up to ₹50,000), Kishore (₹50,000 to ₹5 Lakhs), and Tarun (up to ₹10-20 Lakhs) at low competitive interest rates.',
    benefitAmount: '₹50,000 to ₹10 Lakhs loan',
    eligibilitySummary: 'Any Indian citizen involved in non-farm income-generating micro activities such as shopkeeping, delivery logistics, artisan work, food services, etc.',
    rules: [
      {
        field: 'age',
        operator: 'gte',
        value: 18,
        label: 'Applicant must be at least 18 years old',
        weight: 30,
        isStrict: true
      }
    ],
    requiredDocuments: [
      { id: 'aadhaar', name: 'Aadhaar Card and PAN Card', description: 'KYC identity and tax ID', isMandatory: true },
      { id: 'business_proof', name: 'Proof of Business / Vending / Trade License', description: 'Registration or trade license or delivery partner proof', isMandatory: false },
      { id: 'bank_statement', name: 'Bank Statement (Last 6 Months)', description: 'Financial transactions record', isMandatory: true }
    ],
    applicationSteps: [
      'Prepare business plan or equipment purchase quotation',
      'Apply online via udyamimitra.in portal or visit any public/private commercial bank',
      'Submit loan application form under Shishu, Kishore, or Tarun category',
      'Bank officer evaluates proposal without requiring collateral',
      'Loan is disbursed and a MUDRA Debit Card is provided for working capital withdrawals'
    ],
    officialSource: 'https://www.mudra.org.in',
    lastVerified: '2026-01-28',
    isDemo: true
  }
];
