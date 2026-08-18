const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/.env' });
const Document = require('./src/models/Document');

const dummyDocuments = [
  // ─── NID Documents ──────────────────────────────────────────────────────
  {
    docType: 'nid',
    docNumber: '1234567890123',
    holderName: 'Rahman Ahmed',
    holderNameBn: 'রহমান আহমেদ',
    fatherName: 'Abdul Karim',
    motherName: 'Fatima Begum',
    dateOfBirth: '15/03/1975',
    address: '123 Mirpur Road, Dhaka',
    district: 'Dhaka',
    upazila: 'Dhanmondi',
    ward: '27',
  },
  {
    docType: 'nid',
    docNumber: '9876543210987',
    holderName: 'Fatima Khatun',
    holderNameBn: 'ফাতেমা খাতুন',
    fatherName: 'Mohammad Ali',
    motherName: 'Rashida Begum',
    dateOfBirth: '22/07/1978',
    address: '456 Uttara, Dhaka',
    district: 'Dhaka',
    upazila: 'Uttara',
    ward: '12',
  },
  {
    docType: 'nid',
    docNumber: '1111222233334',
    holderName: 'Karim Uddin',
    holderNameBn: 'করিম উদ্দিন',
    fatherName: 'Rahman Ahmed',
    motherName: 'Fatima Khatun',
    dateOfBirth: '10/11/2000',
    address: '789 Gulshan, Dhaka',
    district: 'Dhaka',
    upazila: 'Gulshan',
    ward: '05',
  },
  {
    docType: 'nid',
    docNumber: '2222333344445',
    holderName: 'Ayesha Siddiqua',
    holderNameBn: 'আয়েশা সিদ্দিকা',
    fatherName: 'Rahman Ahmed',
    motherName: 'Fatima Khatun',
    dateOfBirth: '05/06/2003',
    address: '789 Gulshan, Dhaka',
    district: 'Dhaka',
    upazila: 'Gulshan',
    ward: '05',
  },
  {
    docType: 'nid',
    docNumber: '3333444455556',
    holderName: 'Abdul Karim',
    holderNameBn: 'আব্দুল করিম',
    fatherName: 'Habib Rahman',
    motherName: 'Kulsum Bibi',
    dateOfBirth: '01/01/1950',
    address: '321 Bogra Road, Bogra',
    district: 'Bogra',
    upazila: 'Bogra Sadar',
    ward: '15',
  },
  {
    docType: 'nid',
    docNumber: '4444555566667',
    holderName: 'Rashida Begum',
    holderNameBn: 'রশিদা বেগম',
    fatherName: 'Abdur Rashid',
    motherName: 'Halima Khatun',
    dateOfBirth: '18/09/1955',
    address: '321 Bogra Road, Bogra',
    district: 'Bogra',
    upazila: 'Bogra Sadar',
    ward: '15',
  },
  {
    docType: 'nid',
    docNumber: '5555666677778',
    holderName: 'Mohammad Hasan',
    holderNameBn: 'মোহাম্মদ হাসান',
    fatherName: 'Rahman Ahmed',
    motherName: 'Fatima Khatun',
    dateOfBirth: '14/02/2006',
    address: '789 Gulshan, Dhaka',
    district: 'Dhaka',
    upazila: 'Gulshan',
    ward: '05',
  },
  {
    docType: 'nid',
    docNumber: '6666777788889',
    holderName: 'Nasrin Akhter',
    holderNameBn: 'নাসরিন আক্তার',
    fatherName: 'Rahman Ahmed',
    motherName: 'Fatima Khatun',
    dateOfBirth: '30/08/2008',
    address: '789 Gulshan, Dhaka',
    district: 'Dhaka',
    upazila: 'Gulshan',
    ward: '05',
  },
  {
    docType: 'nid',
    docNumber: '7777888899990',
    holderName: 'Sultan Mahmud',
    holderNameBn: 'সুলতান মাহমুদ',
    fatherName: 'Abdul Hamid',
    motherName: 'Jamila Khatun',
    dateOfBirth: '25/12/1970',
    address: '555 Chittagong Road, Chittagong',
    district: 'Chittagong',
    upazila: 'Chittagong Sadar',
    ward: '20',
  },
  {
    docType: 'nid',
    docNumber: '8888999900001',
    holderName: 'Jamila Khatun',
    holderNameBn: 'জামিলা খাতুন',
    fatherName: 'Abdur Rouf',
    motherName: 'Amina Bibi',
    dateOfBirth: '08/04/1973',
    address: '555 Chittagong Road, Chittagong',
    district: 'Chittagong',
    upazila: 'Chittagong Sadar',
    ward: '20',
  },

  // ─── Dolil (Deed) Documents ──────────────────────────────────────────────
  {
    docType: 'dolil',
    docNumber: 'DL-2024-001',
    holderName: 'Rahman Ahmed',
    landInfo: {
      mouza: 'Gulshan',
      jlNo: 'JL-05-123',
      landArea: '5.5',
      landType: 'Residential',
      plotNo: 'Plot-42',
    },
    issueDate: '15/01/2024',
    district: 'Dhaka',
    upazila: 'Gulshan',
  },
  {
    docType: 'dolil',
    docNumber: 'DL-2023-445',
    holderName: 'Abdul Karim',
    landInfo: {
      mouza: 'Bogra Sadar',
      jlNo: 'JL-15-089',
      landArea: '12.0',
      landType: 'Agricultural',
      plotNo: 'Plot-18',
    },
    issueDate: '20/06/2023',
    district: 'Bogra',
    upazila: 'Bogra Sadar',
  },
  {
    docType: 'dolil',
    docNumber: 'DL-2022-789',
    holderName: 'Sultan Mahmud',
    landInfo: {
      mouza: 'Chittagong Sadar',
      jlNo: 'JL-20-456',
      landArea: '8.25',
      landType: 'Residential',
      plotNo: 'Plot-77',
    },
    issueDate: '10/09/2022',
    district: 'Chittagong',
    upazila: 'Chittagong Sadar',
  },
  {
    docType: 'dolil',
    docNumber: 'DL-2021-321',
    holderName: 'Rahman Ahmed',
    landInfo: {
      mouza: 'Mirpur',
      jlNo: 'JL-27-200',
      landArea: '3.0',
      landType: 'Residential',
      plotNo: 'Plot-15',
    },
    issueDate: '05/03/2021',
    district: 'Dhaka',
    upazila: 'Dhanmondi',
  },

  // ─── Khatian Documents ──────────────────────────────────────────────────
  {
    docType: 'khatian',
    docNumber: 'KH-44-001',
    holderName: 'Rahman Ahmed',
    landInfo: {
      mouza: 'Gulshan',
      jlNo: 'JL-05-123',
      landArea: '5.5',
      landType: 'Residential',
      plotNo: 'Plot-42',
    },
    district: 'Dhaka',
    upazila: 'Gulshan',
  },
  {
    docType: 'khatian',
    docNumber: 'KH-12-334',
    holderName: 'Abdul Karim',
    landInfo: {
      mouza: 'Bogra Sadar',
      jlNo: 'JL-15-089',
      landArea: '12.0',
      landType: 'Agricultural',
      plotNo: 'Plot-18',
    },
    district: 'Bogra',
    upazila: 'Bogra Sadar',
  },
  {
    docType: 'khatian',
    docNumber: 'KH-20-789',
    holderName: 'Sultan Mahmud',
    landInfo: {
      mouza: 'Chittagong Sadar',
      jlNo: 'JL-20-456',
      landArea: '8.25',
      landType: 'Residential',
      plotNo: 'Plot-77',
    },
    district: 'Chittagong',
    upazila: 'Chittagong Sadar',
  },

  // ─── Khajana (Tax Receipt) Documents ────────────────────────────────────
  {
    docType: 'khajana',
    docNumber: 'KJ-2024-001',
    holderName: 'Rahman Ahmed',
    landInfo: {
      mouza: 'Gulshan',
      jlNo: 'JL-05-123',
      landArea: '5.5',
      landType: 'Residential',
      plotNo: 'Plot-42',
    },
    issueDate: '01/01/2024',
    district: 'Dhaka',
    upazila: 'Gulshan',
  },
  {
    docType: 'khajana',
    docNumber: 'KJ-2023-045',
    holderName: 'Abdul Karim',
    landInfo: {
      mouza: 'Bogra Sadar',
      jlNo: 'JL-15-089',
      landArea: '12.0',
      landType: 'Agricultural',
      plotNo: 'Plot-18',
    },
    issueDate: '01/01/2023',
    district: 'Bogra',
    upazila: 'Bogra Sadar',
  },
  {
    docType: 'khajana',
    docNumber: 'KJ-2022-078',
    holderName: 'Sultan Mahmud',
    landInfo: {
      mouza: 'Chittagong Sadar',
      jlNo: 'JL-20-456',
      landArea: '8.25',
      landType: 'Residential',
      plotNo: 'Plot-77',
    },
    issueDate: '01/01/2022',
    district: 'Chittagong',
    upazila: 'Chittagong Sadar',
  },
];

async function seed() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error('Error: MONGODB_URI not set in .env');
      process.exit(1);
    }

    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    // Clear existing documents
    await Document.deleteMany({});
    console.log('Cleared existing documents');

    // Insert dummy documents
    const result = await Document.insertMany(dummyDocuments);
    console.log(`Seeded ${result.length} dummy documents`);

    // Print summary
    const counts = await Document.aggregate([
      { $group: { _id: '$docType', count: { $sum: 1 } } },
    ]);
    console.log('Document counts:', counts);

    await mongoose.disconnect();
    console.log('Done!');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
