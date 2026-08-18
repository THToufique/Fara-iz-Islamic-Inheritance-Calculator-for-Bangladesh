'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registrationAPI, calculatorAPI } from '../../lib/api';
import { isLoggedIn, getStoredUser } from '../../lib/auth';

const STEPS = [
  { id: 1, title: 'উত্তরাধিকারী যাচাই', titleEn: 'Verify Heirs (NID)' },
  { id: 2, title: 'জমির দলিল জমা', titleEn: 'Submit Property Documents' },
  { id: 3, title: 'প্রতিভূতি দপ্তর', titleEn: 'Registration Office' },
  { id: 4, title: 'পর্যালোচনা ও জমা', titleEn: 'Review & Submit' },
];

const DISTRICTS = [
  'Bagerhat', 'Bandarban', 'Barisal', 'Bhola', 'Bogra', 'Brahmanbaria', 'Chandpur',
  'Chittagong', 'Chuadanga', 'Comilla', "Cox's Bazar", 'Dhaka', 'Dinajpur', 'Faridganj',
  'Feni', 'Gaibandha', 'Gazipur', 'Gopalganj', 'Habiganj', 'Jamalpur', 'Jessor',
  'Jhalakathi', 'Jhenaidah', 'Joypurhat', 'Khagrachhari', 'Khulna', 'Kishoreganj',
  'Kurigram', 'Kushtia', 'Lakshmipur', 'Lalmonirhat', 'Madaripur', 'Magura',
  'Manikganj', 'Meherpur', 'Moulvibazar', 'Munshiganj', 'Mymensingh', 'Naogaon',
  'Narail', 'Narayanganj', 'Narsingdi', 'Nator', 'Netrakona', 'Nilphamari', 'Noakhali',
  'Pabna', 'Panchagarh', 'Patuakhali', 'Pirojpur', 'Rajbari', 'Rajshahi', 'Rangamati',
  'Rangpur', 'Satkhira', 'Shariatpur', 'Sherpur', 'Sirajganj', 'Sunamganj', 'Sylhet',
  'Tangail', 'Thakurgaon',
];

function StepIndicator({ currentStep }) {
  return (
    <div className="flex items-center justify-center mb-8">
      {STEPS.map((step, i) => (
        <div key={step.id} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                currentStep > step.id
                  ? 'bg-teal text-cream'
                  : currentStep === step.id
                  ? 'bg-gold text-teal-deep ring-2 ring-gold ring-offset-2'
                  : 'bg-gray-200 text-ink-soft'
              }`}
            >
              {currentStep > step.id ? '✓' : step.id}
            </div>
            <span className="text-xs mt-1.5 text-center hidden md:block max-w-[80px] text-ink-soft">
              {step.titleEn}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`w-12 md:w-20 h-0.5 mx-1 mt-0 md:mt-0 ${
              currentStep > step.id ? 'bg-teal' : 'bg-gray-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function RegisterLandPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [input, setInput] = useState(null);

  // Step 1: Heirs with NID
  const [heirs, setHeirs] = useState([]);
  const [nidVerifications, setNidVerifications] = useState({});

  // Step 2: Property documents
  const [propertyDocs, setPropertyDocs] = useState({
    dolilNumber: '',
    khatianNumber: '',
    khajanaNumber: '',
  });
  const [docVerifications, setDocVerifications] = useState({});

  // Step 3: Registration office
  const [office, setOffice] = useState({
    name: '',
    subRegistrar: '',
    district: 'Dhaka',
    upazila: '',
  });

  // Step 4: Final submission
  const [registration, setRegistration] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push('/login?redirect=/register-land');
      return;
    }
    const r = sessionStorage.getItem('faraiz_result');
    const i = sessionStorage.getItem('faraiz_input');
    if (!r || !i) {
      router.push('/calculator');
      return;
    }
    const parsedResult = JSON.parse(r);
    const parsedInput = JSON.parse(i);
    setResult(parsedResult);
    setInput(parsedInput);

    // Build heirs from result
    if (parsedResult.heirs) {
      setHeirs(
        parsedResult.heirs.map((h) => ({
          name: h.name,
          role: h.role,
          nidNumber: '',
          shareFraction: h.fractionDisplay,
          sharePercent: h.percent,
          shareAmount: h.amount,
          landShareArea: 0,
          landShareUnit: parsedInput.landUnit || 'decimal',
        }))
      );
    }
  }, [router]);

  const verifyNid = async (index) => {
    const heir = heirs[index];
    if (!heir.nidNumber.trim()) return;
    try {
      const data = await registrationAPI.verifyDocument({
        docType: 'nid',
        docNumber: heir.nidNumber.trim(),
      });
      setNidVerifications((prev) => ({
        ...prev,
        [index]: { verified: data.verified, document: data.document || null },
      }));
    } catch (err) {
      setNidVerifications((prev) => ({
        ...prev,
        [index]: { verified: false, error: err.message },
      }));
    }
  };

  const verifyDoc = async (docType) => {
    const docNumber = propertyDocs[docType + 'Number'];
    if (!docNumber.trim()) return;
    try {
      const data = await registrationAPI.verifyDocument({
        docType,
        docNumber: docNumber.trim(),
      });
      setDocVerifications((prev) => ({
        ...prev,
        [docType]: { verified: data.verified, document: data.document || null },
      }));
    } catch (err) {
      setDocVerifications((prev) => ({
        ...prev,
        [docType]: { verified: false, error: err.message },
      }));
    }
  };

  const updateHeirNid = (index, value) => {
    const updated = [...heirs];
    updated[index].nidNumber = value;
    setHeirs(updated);
    // Clear verification when NID changes
    setNidVerifications((prev) => {
      const copy = { ...prev };
      delete copy[index];
      return copy;
    });
  };

  const updateHeirLand = (index, value) => {
    const updated = [...heirs];
    updated[index].landShareArea = parseFloat(value) || 0;
    setHeirs(updated);
  };

  const allHeirsNidEntered = heirs.every((h) => h.nidNumber.trim() !== '');
  const allHeirsNidVerified = heirs.every((h) => nidVerifications[h.name]?.verified || Object.values(nidVerifications).find(v => v.verified));
  const allDocsEntered = propertyDocs.dolilNumber && propertyDocs.khatianNumber && propertyDocs.khajanaNumber;
  const allDocsVerified = docVerifications.dolil?.verified && docVerifications.khatian?.verified && docVerifications.khajana?.verified;

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const body = {
        heirs: heirs.map((h) => ({
          name: h.name,
          role: h.role,
          nidNumber: h.nidNumber,
          shareFraction: h.shareFraction,
          sharePercent: h.sharePercent,
          shareAmount: h.shareAmount,
          landShareArea: h.landShareArea,
          landShareUnit: h.landShareUnit,
        })),
        propertyDocuments: propertyDocs,
        property: {
          landArea: input?.landArea || 0,
          landUnit: input?.landUnit || 'decimal',
        },
        estateValue: result?.estateValue || input?.estateValue || 0,
        totalDistributed: result?.totalDistributed || 0,
        registrationOffice: office,
      };

      const data = await registrationAPI.create(body);
      setRegistration(data.registration);
      setCurrentStep(4);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!result) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-20 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-teal border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-3xl font-serif font-bold text-teal-deep mb-2">
            জমি রেজিস্ট্রার — Land Registration
          </h1>
          <p className="text-ink-soft text-sm">
            Complete the step-by-step registration process for your land inheritance.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <StepIndicator currentStep={currentStep} />

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded px-4 py-3 text-sm mb-6">
            {error}
          </div>
        )}

        {/* ─── STEP 1: Heir NID Verification ──────────────────────────────── */}
        {currentStep === 1 && (
          <div>
            <div className="card mb-6">
              <h2 className="text-xl font-serif font-bold text-teal-deep mb-2">
                Step 1: উত্তরাধিকারীদের NID যাচাই
              </h2>
              <p className="text-sm text-ink-soft mb-6">
                Enter the NID (National ID) number for each heir. The system will verify
                against the government database. This is a dummy system for testing purposes only.
              </p>

              <div className="space-y-4">
                {heirs.map((heir, i) => (
                  <div key={i} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex flex-col md:flex-row md:items-center gap-3">
                      <div className="flex-1">
                        <p className="font-semibold text-teal-deep">{heir.name}</p>
                        <p className="text-xs text-ink-soft">{heir.role} — Share: {heir.shareFraction} ({heir.sharePercent}%)</p>
                      </div>
                      <div className="flex-1 flex gap-2">
                        <input
                          type="text"
                          placeholder="NID Number (e.g. 1234567890123)"
                          value={heir.nidNumber}
                          onChange={(e) => updateHeirNid(i, e.target.value)}
                          className="form-input flex-1"
                          maxLength={16}
                        />
                        <button
                          onClick={() => verifyNid(i)}
                          disabled={!heir.nidNumber.trim()}
                          className="btn-primary text-xs py-2 px-3 whitespace-nowrap disabled:opacity-50"
                        >
                          Verify
                        </button>
                      </div>
                    </div>
                    {nidVerifications[i] && (
                      <div className={`mt-2 text-sm px-3 py-2 rounded ${
                        nidVerifications[i].verified
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {nidVerifications[i].verified ? (
                          <span>
                            ✓ Verified — {nidVerifications[i].document?.holderName}
                            {nidVerifications[i].document?.holderNameBn && (
                              <span className="ml-1">({nidVerifications[i].document.holderNameBn})</span>
                            )}
                            {nidVerifications[i].document?.fatherName && (
                              <span className="text-green-600 ml-1">S/O {nidVerifications[i].document.fatherName}</span>
                            )}
                          </span>
                        ) : (
                          <span>✗ {nidVerifications[i].error || 'NID not found in database'}</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {heirs.length > 0 && (
                <div className="mt-4 p-3 bg-sage rounded-lg text-sm text-ink-soft">
                  <p className="font-semibold text-teal-deep mb-1">Dummy NID Numbers for Testing:</p>
                  <p className="font-mono text-xs">
                    1234567890123, 9876543210987, 1111222233334, 2222333344445, 3333444455556, 4444555566667
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-between">
              <Link href="/calculator" className="btn-ghost">← Back to Calculator</Link>
              <button
                onClick={() => setCurrentStep(2)}
                disabled={!allHeirsNidEntered}
                className="btn-primary disabled:opacity-50"
              >
                Next: Property Documents →
              </button>
            </div>
          </div>
        )}

        {/* ─── STEP 2: Property Documents ─────────────────────────────────── */}
        {currentStep === 2 && (
          <div>
            <div className="card mb-6">
              <h2 className="text-xl font-serif font-bold text-teal-deep mb-2">
                Step 2: জমির দলিল ও কাগজপত্র
              </h2>
              <p className="text-sm text-ink-soft mb-6">
                Submit the property documents for verification. These are required for land
                registration at the Sub-Registrar office.
              </p>

              <div className="space-y-6">
                {/* Dolil */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <label className="form-label">দলিল নম্বর (Dolil/Deed Number)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. DL-2024-001"
                      value={propertyDocs.dolilNumber}
                      onChange={(e) => setPropertyDocs({ ...propertyDocs, dolilNumber: e.target.value })}
                      className="form-input flex-1"
                    />
                    <button
                      onClick={() => verifyDoc('dolil')}
                      disabled={!propertyDocs.dolilNumber.trim()}
                      className="btn-primary text-xs py-2 px-3 whitespace-nowrap disabled:opacity-50"
                    >
                      Verify
                    </button>
                  </div>
                  {docVerifications.dolil && (
                    <div className={`mt-2 text-sm px-3 py-2 rounded ${
                      docVerifications.dolil.verified
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {docVerifications.dolil.verified ? (
                        <div>
                          <p>✓ Dolil verified — Owner: {docVerifications.dolil.document?.holderName}</p>
                          {docVerifications.dolil.document?.landInfo && (
                            <p className="text-xs mt-1 text-green-600">
                              Mouza: {docVerifications.dolil.document.landInfo.mouza},
                              Plot: {docVerifications.dolil.document.landInfo.plotNo},
                              Area: {docVerifications.dolil.document.landInfo.landArea} decimals,
                              Type: {docVerifications.dolil.document.landInfo.landType}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span>✗ {docVerifications.dolil.error || 'Dolil not found in database'}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Khatian */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <label className="form-label">খতিয়ান নম্বর (Khatian Number)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. KH-44-001"
                      value={propertyDocs.khatianNumber}
                      onChange={(e) => setPropertyDocs({ ...propertyDocs, khatianNumber: e.target.value })}
                      className="form-input flex-1"
                    />
                    <button
                      onClick={() => verifyDoc('khatian')}
                      disabled={!propertyDocs.khatianNumber.trim()}
                      className="btn-primary text-xs py-2 px-3 whitespace-nowrap disabled:opacity-50"
                    >
                      Verify
                    </button>
                  </div>
                  {docVerifications.khatian && (
                    <div className={`mt-2 text-sm px-3 py-2 rounded ${
                      docVerifications.khatian.verified
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {docVerifications.khatian.verified ? (
                        <div>
                          <p>✓ Khatian verified — Owner: {docVerifications.khatian.document?.holderName}</p>
                          {docVerifications.khatian.document?.landInfo && (
                            <p className="text-xs mt-1 text-green-600">
                              Mouza: {docVerifications.khatian.document.landInfo.mouza},
                              JL No: {docVerifications.khatian.document.landInfo.jlNo}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span>✗ {docVerifications.khatian.error || 'Khatian not found in database'}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Khajana */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <label className="form-label">খাজনা রশিদ নম্বর (Khajana/Tax Receipt Number)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. KJ-2024-001"
                      value={propertyDocs.khajanaNumber}
                      onChange={(e) => setPropertyDocs({ ...propertyDocs, khajanaNumber: e.target.value })}
                      className="form-input flex-1"
                    />
                    <button
                      onClick={() => verifyDoc('khajana')}
                      disabled={!propertyDocs.khajanaNumber.trim()}
                      className="btn-primary text-xs py-2 px-3 whitespace-nowrap disabled:opacity-50"
                    >
                      Verify
                    </button>
                  </div>
                  {docVerifications.khajana && (
                    <div className={`mt-2 text-sm px-3 py-2 rounded ${
                      docVerifications.khajana.verified
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {docVerifications.khajana.verified ? (
                        <div>
                          <p>✓ Khajana receipt verified — Owner: {docVerifications.khajana.document?.holderName}</p>
                          {docVerifications.khajana.document?.issueDate && (
                            <p className="text-xs mt-1 text-green-600">
                              Issue Date: {docVerifications.khajana.document.issueDate}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span>✗ {docVerifications.khajana.error || 'Khajana receipt not found in database'}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 p-3 bg-sage rounded-lg text-sm text-ink-soft">
                <p className="font-semibold text-teal-deep mb-1">Dummy Document Numbers for Testing:</p>
                <div className="font-mono text-xs space-y-1">
                  <p>Dolil: DL-2024-001, DL-2023-445, DL-2022-789, DL-2021-321</p>
                  <p>Khatian: KH-44-001, KH-12-334, KH-20-789</p>
                  <p>Khajana: KJ-2024-001, KJ-2023-045, KJ-2022-078</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button onClick={() => setCurrentStep(1)} className="btn-ghost">← Back</button>
              <button
                onClick={() => setCurrentStep(3)}
                disabled={!allDocsEntered}
                className="btn-primary disabled:opacity-50"
              >
                Next: Registration Office →
              </button>
            </div>
          </div>
        )}

        {/* ─── STEP 3: Registration Office ────────────────────────────────── */}
        {currentStep === 3 && (
          <div>
            <div className="card mb-6">
              <h2 className="text-xl font-serif font-bold text-teal-deep mb-2">
                Step 3: নিবন্ধন দপ্তর — Registration Office
              </h2>
              <p className="text-sm text-ink-soft mb-6">
                Select the Sub-Registrar office where you will complete the land registration.
                In Bangladesh, land registration must be done at the local Sub-Registrar office
                within the jurisdiction of the property.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="form-label">অফিসের নাম (Office Name)</label>
                  <input
                    type="text"
                    placeholder="e.g. Sub-Registrar Office, Gulshan"
                    value={office.name}
                    onChange={(e) => setOffice({ ...office, name: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">সাব-রেজিস্ট্রারের নাম (Sub-Registrar Name)</label>
                  <input
                    type="text"
                    placeholder="Sub-Registrar officer name"
                    value={office.subRegistrar}
                    onChange={(e) => setOffice({ ...office, subRegistrar: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">জেলা (District)</label>
                    <select
                      value={office.district}
                      onChange={(e) => setOffice({ ...office, district: e.target.value })}
                      className="form-input"
                    >
                      {DISTRICTS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">উপজেলা (Upazila)</label>
                    <input
                      type="text"
                      placeholder="Upazila name"
                      value={office.upazila}
                      onChange={(e) => setOffice({ ...office, upazila: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <h3 className="font-semibold text-amber-800 text-sm mb-2">Required Documents for Registration:</h3>
                <ul className="text-sm text-amber-700 space-y-1 list-disc list-inside">
                  <li>Original Dolil (Deed) document</li>
                  <li>Khatian (Land Record) copy</li>
                  <li>Khajana (Land Tax) payment receipt</li>
                  <li>NID cards of all heirs</li>
                  <li>Death certificate of the deceased</li>
                  <li>Family tree certificate (from Union Parishad)</li>
                  <li>Stamp duty payment receipt</li>
                  <li>Two passport-size photos of each heir</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-between">
              <button onClick={() => setCurrentStep(2)} className="btn-ghost">← Back</button>
              <button onClick={handleSubmit} disabled={submitting || !office.name} className="btn-primary disabled:opacity-50">
                {submitting ? 'Submitting...' : 'Next: Review & Submit →'}
              </button>
            </div>
          </div>
        )}

        {/* ─── STEP 4: Review & Success ──────────────────────────────────── */}
        {currentStep === 4 && registration && (
          <div>
            <div className="card mb-6">
              {/* Success Header */}
              <div className="text-center mb-6">
                <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl ${
                  registration.status === 'pending'
                    ? 'bg-green-100 text-green-600'
                    : 'bg-yellow-100 text-yellow-600'
                }`}>
                  {registration.status === 'pending' ? '✓' : '⏳'}
                </div>
                <h2 className="text-2xl font-serif font-bold text-teal-deep mb-2">
                  {registration.status === 'pending'
                    ? 'Registration Submitted Successfully!'
                    : 'Registration Draft Saved'}
                </h2>
                <p className="text-ink-soft text-sm">
                  {registration.status === 'pending'
                    ? 'All documents have been verified and your registration has been submitted for review.'
                    : 'Some documents could not be verified. Please update them to submit for review.'}
                </p>
              </div>

              {/* Registration Details */}
              <div className="bg-sage rounded-lg p-4 mb-4">
                <p className="text-xs font-mono text-ink-soft mb-1">Registration ID</p>
                <p className="font-mono font-bold text-teal-deep">{registration._id}</p>
              </div>

              {/* Verification Summary */}
              <h3 className="font-serif font-bold text-teal-deep mb-3">Verification Summary</h3>

              <div className="space-y-3 mb-6">
                <div className="border border-gray-200 rounded-lg p-3">
                  <h4 className="text-sm font-semibold text-teal-deep mb-2">Heir NID Verification</h4>
                  {registration.heirs.map((h, i) => (
                    <div key={i} className="flex items-center justify-between text-sm py-1">
                      <span>{h.name} — NID: {h.nidNumber}</span>
                      <span className={h.nidVerified ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                        {h.nidVerified ? '✓ Verified' : '✗ Not Verified'}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border border-gray-200 rounded-lg p-3">
                  <h4 className="text-sm font-semibold text-teal-deep mb-2">Property Document Verification</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center justify-between py-1">
                      <span>দলিল (Dolil): {registration.propertyDocuments.dolilNumber}</span>
                      <span className={registration.propertyDocuments.dolilVerified ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                        {registration.propertyDocuments.dolilVerified ? '✓ Verified' : '✗ Not Verified'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span>খতিয়ান (Khatian): {registration.propertyDocuments.khatianNumber}</span>
                      <span className={registration.propertyDocuments.khatianVerified ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                        {registration.propertyDocuments.khatianVerified ? '✓ Verified' : '✗ Not Verified'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span>খাজনা (Khajana): {registration.propertyDocuments.khajanaNumber}</span>
                      <span className={registration.propertyDocuments.khajanaVerified ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                        {registration.propertyDocuments.khajanaVerified ? '✓ Verified' : '✗ Not Verified'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Inheritance Summary */}
              <h3 className="font-serif font-bold text-teal-deep mb-3">Inheritance Distribution</h3>
              <div className="overflow-x-auto mb-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-cream-deep text-xs font-mono uppercase tracking-wide text-ink-soft">
                      <th className="text-left py-2 px-3">Heir</th>
                      <th className="text-left py-2 px-3">Share</th>
                      <th className="text-right py-2 px-3">Amount (BDT)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registration.heirs.map((h, i) => (
                      <tr key={i} className={`border-t border-gray-100 ${i % 2 === 0 ? '' : 'bg-cream'}`}>
                        <td className="py-2 px-3">
                          <p className="font-medium">{h.name}</p>
                          <p className="text-xs text-ink-soft">{h.role}</p>
                        </td>
                        <td className="py-2 px-3 font-mono text-teal-deep">{h.shareFraction}</td>
                        <td className="py-2 px-3 font-mono text-right">
                          ৳{Number(h.shareAmount).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Office Info */}
              {registration.registrationOffice?.name && (
                <div className="border border-gray-200 rounded-lg p-3 mb-6">
                  <h4 className="text-sm font-semibold text-teal-deep mb-2">Registration Office</h4>
                  <p className="text-sm">{registration.registrationOffice.name}</p>
                  <p className="text-xs text-ink-soft">
                    {registration.registrationOffice.district}, {registration.registrationOffice.upazila}
                  </p>
                  {registration.registrationOffice.subRegistrar && (
                    <p className="text-xs text-ink-soft">Sub-Registrar: {registration.registrationOffice.subRegistrar}</p>
                  )}
                </div>
              )}

              {/* Status Note */}
              <div className={`p-4 rounded-lg ${
                registration.status === 'pending'
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-yellow-50 border border-yellow-200'
              }`}>
                <p className={`text-sm font-semibold ${
                  registration.status === 'pending' ? 'text-green-800' : 'text-yellow-800'
                }`}>
                  {registration.status === 'pending' ? (
                    <>
                      ✓ Your registration has been submitted successfully. Your land registration
                      will be completed within 7-10 business days. You will receive a notification
                      once the Sub-Registrar office finalises the process.
                    </>
                  ) : (
                    <>
                      ⏳ Some documents were not verified. Please ensure all NID numbers and
                      document numbers match our database records, then resubmit.
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="/dashboard" className="btn-primary">Go to Dashboard</Link>
              <Link href="/calculator" className="btn-ghost">New Calculation</Link>
              <button
                onClick={() => {
                  setCurrentStep(1);
                  setRegistration(null);
                  setNidVerifications({});
                  setDocVerifications({});
                }}
                className="btn-ghost"
              >
                Edit Registration
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
